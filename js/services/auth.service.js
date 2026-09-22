/* ============================================================
   AUTH SERVICE
   Xử lý đăng nhập, đăng ký, đăng xuất, phân quyền
   ============================================================ */

const AuthService = {
  /* ============================================================
     SESSION
     ============================================================ */

  /**
   * Lấy user đang đăng nhập
   */
  getCurrentUser() {
    return Storage.getCurrentUser();
  },

  /**
   * Lưu user đang đăng nhập
   */
  setCurrentUser(user) {
    const safeUser = { ...user };
    delete safeUser.password;
    Storage.setCurrentUser(safeUser);
    return safeUser;
  },

  /**
   * Kiểm tra đã đăng nhập chưa
   */
  isLoggedIn() {
    return this.getCurrentUser() !== null;
  },

  /**
   * Kiểm tra là admin
   */
  isAdmin() {
    const user = this.getCurrentUser();
    return user !== null && user.role === CONFIG.ROLES.ADMIN;
  },

  /**
   * Kiểm tra là user thường
   */
  isUser() {
    const user = this.getCurrentUser();
    return user !== null && user.role === CONFIG.ROLES.USER;
  },

  /**
   * Yêu cầu đăng nhập (chặn truy cập)
   */
  requireLogin(redirectTo = null) {
    const user = this.getCurrentUser();
    if (!user) {
      const back = redirectTo || window.location.pathname;
      sessionStorage.setItem('redirect_after_login', back);
      Utils.redirect(this.getLoginUrl());
      return null;
    }
    return user;
  },

  /**
   * Yêu cầu quyền admin
   */
  requireAdmin() {
    const user = this.getCurrentUser();
    if (!user || user.role !== CONFIG.ROLES.ADMIN) {
      Utils.redirect(this.getLoginUrl());
      return null;
    }
    return user;
  },

  /**
   * Lấy URL trang login (tự tính theo cấp thư mục)
   */
  getLoginUrl() {
    const path = window.location.pathname;
    if (path.includes('/admin/')) return '../pages/auth/login.html';
    if (path.includes('/pages/')) return '../auth/login.html';
    return 'pages/auth/login.html';
  },

  /**
   * Lấy URL trang chủ (tự tính theo cấp thư mục)
   */
  getHomeUrl() {
    const path = window.location.pathname;
    if (path.includes('/admin/')) return '../index.html';
    if (path.includes('/pages/')) return '../../index.html';
    return 'index.html';
  },

  /* ============================================================
     ĐĂNG NHẬP
     ============================================================ */

  /**
   * Đăng nhập
   * @param {string} email
   * @param {string} password
   * @returns {object} { success, message, user }
   */
  login(email, password) {
    if (!email || !password) {
      return { success: false, message: 'Vui lòng nhập đầy đủ thông tin.' };
    }

    const users = Storage.getUsers();
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase().trim()
    );

    if (!user) {
      return { success: false, message: 'Email hoặc mật khẩu không đúng.' };
    }

    if (user.password !== password) {
      return { success: false, message: 'Email hoặc mật khẩu không đúng.' };
    }

    if (user.status === CONFIG.USER_STATUS.BLOCKED) {
      return {
        success: false,
        message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ hỗ trợ.',
      };
    }

    // Cập nhật lastLogin
    user.lastLogin = new Date().toISOString();
    Storage.setUsers(users);

    // Lưu session (không lưu password)
    const sessionUser = this.setCurrentUser(user);

    return {
      success: true,
      message: 'Đăng nhập thành công!',
      user: sessionUser,
    };
  },

  /**
   * Đăng nhập + ghi nhớ email
   */
  loginWithRemember(email, password, remember) {
    const result = this.login(email, password);
    if (result.success && remember) {
      Storage.set('medicare_remember_email', email);
    } else if (result.success && !remember) {
      Storage.remove('medicare_remember_email');
    }
    return result;
  },

  /**
   * Lấy email đã ghi nhớ
   */
  getRememberedEmail() {
    return Storage.get('medicare_remember_email', '');
  },

  /* ============================================================
     ĐĂNG KÝ
     ============================================================ */

  /**
   * Đăng ký tài khoản mới
   * @returns {object} { success, message, user }
   */
  register(data) {
    const { name, email, phone, password, confirm } = data;

    // Validate
    if (!name || !email || !phone || !password) {
      return { success: false, message: 'Vui lòng nhập đầy đủ thông tin.' };
    }

    if (!Validator.email(email)) {
      return { success: false, message: 'Email không hợp lệ.' };
    }

    if (!Validator.phone(phone)) {
      return { success: false, message: 'Số điện thoại không hợp lệ (10-11 số).' };
    }

    if (!Validator.password(password)) {
      return {
        success: false,
        message: `Mật khẩu phải từ ${CONFIG.VALIDATION.PASSWORD_MIN} ký tự.`,
      };
    }

    if (confirm !== undefined && password !== confirm) {
      return { success: false, message: 'Mật khẩu xác nhận không khớp.' };
    }

    // Kiểm tra trùng email
    const users = Storage.getUsers();
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase().trim())) {
      return { success: false, message: 'Email này đã được đăng ký.' };
    }

    // Tạo user mới
    const now = new Date().toISOString();
    const newUser = {
      id: Date.now(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password: password,
      role: CONFIG.ROLES.USER,
      gender: '',
      birthday: '',
      address: '',
      insurance: '',
      avatar: '',
      status: CONFIG.USER_STATUS.ACTIVE,
      verified: false,
      createdAt: now,
      updatedAt: now,
      lastLogin: '',
    };

    users.push(newUser);
    Storage.setUsers(users);

    return {
      success: true,
      message: 'Đăng ký thành công! Vui lòng đăng nhập.',
      user: { ...newUser, password: undefined },
    };
  },

  /* ============================================================
     ĐĂNG XUẤT
     ============================================================ */

  /**
   * Đăng xuất
   */
  logout(redirect = true) {
    Storage.removeCurrentUser();
    sessionStorage.removeItem('redirect_after_login');

    if (redirect) {
      Utils.redirect(this.getHomeUrl());
    }
  },

  /**
   * Đăng xuất tất cả thiết bị (demo: chỉ xóa session)
   */
  logoutAll() {
    Storage.removeCurrentUser();
    return { success: true, message: 'Đã đăng xuất khỏi tất cả thiết bị.' };
  },

  /* ============================================================
     QUÊN MẬT KHẨU
     ============================================================ */

  /**
   * Gửi yêu cầu khôi phục mật khẩu (demo: trả về mật khẩu hiện tại)
   */
  forgotPassword(email) {
    if (!email) {
      return { success: false, message: 'Vui lòng nhập email.' };
    }

    if (!Validator.email(email)) {
      return { success: false, message: 'Email không hợp lệ.' };
    }

    const users = Storage.getUsers();
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase().trim()
    );

    if (!user) {
      return {
        success: false,
        message: 'Không tìm thấy tài khoản với email này.',
      };
    }

    return {
      success: true,
      message: 'Yêu cầu khôi phục đã được gửi.',
      password: user.password,
    };
  },

  /**
   * Đổi mật khẩu (khi đã đăng nhập)
   */
  changePassword(currentPassword, newPassword, confirmPassword) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      return { success: false, message: 'Bạn chưa đăng nhập.' };
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      return { success: false, message: 'Vui lòng nhập đầy đủ thông tin.' };
    }

    const users = Storage.getUsers();
    const user = users.find((u) => u.id === currentUser.id);

    if (!user) {
      return { success: false, message: 'Không tìm thấy tài khoản.' };
    }

    if (user.password !== currentPassword) {
      return { success: false, message: 'Mật khẩu hiện tại không đúng.' };
    }

    if (!Validator.password(newPassword)) {
      return {
        success: false,
        message: `Mật khẩu mới phải từ ${CONFIG.VALIDATION.PASSWORD_MIN} ký tự.`,
      };
    }

    if (newPassword !== confirmPassword) {
      return { success: false, message: 'Mật khẩu xác nhận không khớp.' };
    }

    if (newPassword === currentPassword) {
      return {
        success: false,
        message: 'Mật khẩu mới phải khác mật khẩu hiện tại.',
      };
    }

    user.password = newPassword;
    user.updatedAt = new Date().toISOString();
    Storage.setUsers(users);

    return { success: true, message: 'Đổi mật khẩu thành công!' };
  },

  /**
   * Đặt lại mật khẩu về mặc định (admin)
   */
  resetPassword(userId, newPassword = '123456') {
    const users = Storage.getUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) {
      return { success: false, message: 'Không tìm thấy người dùng.' };
    }

    user.password = newPassword;
    user.updatedAt = new Date().toISOString();
    Storage.setUsers(users);

    return {
      success: true,
      message: `Đã đặt lại mật khẩu thành "${newPassword}".`,
    };
  },

  /* ============================================================
     KIỂM TRA QUYỀN
     ============================================================ */

  /**
   * Kiểm tra user có quyền truy cập route không
   */
  canAccess(route) {
    const user = this.getCurrentUser();
    if (!user) return false;

    // Admin routes
    if (route.startsWith('/admin')) {
      return user.role === CONFIG.ROLES.ADMIN;
    }

    return true;
  },
};

/* ===== EXPORT ===== */
if (typeof window !== 'undefined') {
  window.AuthService = AuthService;

  // Alias ngắn gọn
  window.getCurrentUser = () => AuthService.getCurrentUser();
  window.setCurrentUser = (u) => AuthService.setCurrentUser(u);
  window.isLoggedIn = () => AuthService.isLoggedIn();
  window.isAdmin = () => AuthService.isAdmin();
  window.requireLogin = () => AuthService.requireLogin();
  window.requireAdmin = () => AuthService.requireAdmin();
  window.logout = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    AuthService.logout();
  };
}