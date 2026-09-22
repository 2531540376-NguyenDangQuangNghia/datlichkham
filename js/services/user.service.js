/* ============================================================
   USER SERVICE
   CRUD người dùng + thống kê + yêu thích
   ============================================================ */

const UserService = {
  /* ============================================================
     READ
     ============================================================ */

  /**
   * Lấy tất cả users (không lộ password)
   */
  getAll() {
    return Storage.getUsers().map((u) => {
      const safe = { ...u };
      delete safe.password;
      return safe;
    });
  },

  /**
   * Lấy tất cả users kèm password (dùng nội bộ)
   */
  getAllRaw() {
    return Storage.getUsers();
  },

  /**
   * Lấy user theo ID
   */
  getById(id) {
    if (id === null || id === undefined) return null;
    const user = Storage.getUsers().find((u) => String(u.id) === String(id));
    if (!user) return null;
    const safe = { ...user };
    delete safe.password;
    return safe;
  },

  /**
   * Lấy user theo email
   */
  getByEmail(email) {
    if (!email) return null;
    const user = Storage.getUsers().find(
      (u) => u.email.toLowerCase() === email.toLowerCase().trim()
    );
    if (!user) return null;
    const safe = { ...user };
    delete safe.password;
    return safe;
  },

  /**
   * Lấy users theo vai trò
   */
  getByRole(role) {
    return this.getAll().filter((u) => u.role === role);
  },

  /* ============================================================
     SEARCH & FILTER
     ============================================================ */

  /**
   * Tìm kiếm + lọc + phân trang
   */
  search(options = {}) {
    const {
      q = '',
      role = '',
      status = '',
      sortBy = 'newest',
      page = 1,
      limit = CONFIG.PAGINATION.DEFAULT_LIMIT,
    } = options;

    let list = this.getAll();

    // Tìm kiếm
    if (q && q.trim()) {
      const keyword = q.toLowerCase().trim();
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(keyword) ||
          u.email.toLowerCase().includes(keyword) ||
          u.phone.includes(keyword)
      );
    }

    // Lọc theo vai trò
    if (role) {
      list = list.filter((u) => u.role === role);
    }

    // Lọc theo trạng thái
    if (status) {
      list = list.filter((u) => u.status === status);
    }

    // Sắp xếp
    switch (sortBy) {
      case 'name-asc':
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        list.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'oldest':
        list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'newest':
      default:
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }

    return Utils.paginate(list, page, limit);
  },

  /* ============================================================
     UPDATE
     ============================================================ */

  /**
   * Cập nhật user
   */
  update(id, data) {
    const users = Storage.getUsers();
    const index = users.findIndex((u) => String(u.id) === String(id));

    if (index === -1) {
      return { success: false, message: 'Không tìm thấy người dùng.' };
    }

    // Không cho đổi email trùng
    if (data.email) {
      const dup = users.find(
        (u) =>
          u.email.toLowerCase() === data.email.toLowerCase().trim() &&
          String(u.id) !== String(id)
      );
      if (dup) {
        return { success: false, message: 'Email này đã được sử dụng.' };
      }
    }

    const updated = {
      ...users[index],
      ...data,
      id: users[index].id,
      email: data.email ? data.email.toLowerCase().trim() : users[index].email,
      updatedAt: new Date().toISOString(),
    };

    users[index] = updated;
    Storage.setUsers(users);

    // Nếu đang cập nhật chính mình → cập nhật session
    const current = Storage.getCurrentUser();
    if (current && String(current.id) === String(id)) {
      const sessionUser = { ...updated };
      delete sessionUser.password;
      Storage.setCurrentUser(sessionUser);
    }

    const safe = { ...updated };
    delete safe.password;

    return {
      success: true,
      message: 'Cập nhật người dùng thành công!',
      user: safe,
    };
  },

  /**
   * Cập nhật profile của user đang đăng nhập
   */
  updateProfile(data) {
    const current = AuthService.getCurrentUser();
    if (!current) {
      return { success: false, message: 'Bạn chưa đăng nhập.' };
    }
    return this.update(current.id, data);
  },

  /**
   * Khóa / mở khóa tài khoản
   */
  toggleBlock(id) {
    const user = Storage.getUsers().find((u) => String(u.id) === String(id));
    if (!user) {
      return { success: false, message: 'Không tìm thấy người dùng.' };
    }

    // Không cho khóa chính mình
    const current = Storage.getCurrentUser();
    if (current && String(current.id) === String(id)) {
      return { success: false, message: 'Không thể khóa tài khoản của chính bạn.' };
    }

    const newStatus =
      user.status === CONFIG.USER_STATUS.BLOCKED
        ? CONFIG.USER_STATUS.ACTIVE
        : CONFIG.USER_STATUS.BLOCKED;

    return this.update(id, { status: newStatus });
  },

  /**
   * Đổi vai trò
   */
  changeRole(id, role) {
    if (![CONFIG.ROLES.USER, CONFIG.ROLES.ADMIN].includes(role)) {
      return { success: false, message: 'Vai trò không hợp lệ.' };
    }

    const current = Storage.getCurrentUser();
    if (current && String(current.id) === String(id) && role !== CONFIG.ROLES.ADMIN) {
      return {
        success: false,
        message: 'Không thể tự hạ quyền của chính mình.',
      };
    }

    return this.update(id, { role });
  },

  /* ============================================================
     CREATE / DELETE
     ============================================================ */

  /**
   * Tạo user (admin)
   */
  create(data) {
    const { name, email, phone, password, role = 'user', status = 'active' } = data;

    if (!name || !email || !phone || !password) {
      return { success: false, message: 'Vui lòng nhập đầy đủ thông tin.' };
    }

    if (!Validator.email(email)) {
      return { success: false, message: 'Email không hợp lệ.' };
    }

    if (!Validator.phone(phone)) {
      return { success: false, message: 'Số điện thoại không hợp lệ.' };
    }

    if (!Validator.password(password)) {
      return {
        success: false,
        message: `Mật khẩu phải từ ${CONFIG.VALIDATION.PASSWORD_MIN} ký tự.`,
      };
    }

    const users = Storage.getUsers();
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase().trim())) {
      return { success: false, message: 'Email này đã được sử dụng.' };
    }

    const now = new Date().toISOString();
    const newUser = {
      id: Date.now(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password,
      role,
      gender: '',
      birthday: '',
      address: '',
      insurance: '',
      avatar: '',
      status,
      verified: false,
      createdAt: now,
      updatedAt: now,
      lastLogin: '',
    };

    users.push(newUser);
    Storage.setUsers(users);

    const safe = { ...newUser };
    delete safe.password;

    return {
      success: true,
      message: 'Thêm người dùng thành công!',
      user: safe,
    };
  },

  /**
   * Xóa user
   */
  delete(id) {
    const current = Storage.getCurrentUser();
    if (current && String(current.id) === String(id)) {
      return { success: false, message: 'Không thể xóa tài khoản của chính bạn.' };
    }

    const users = Storage.getUsers();
    const index = users.findIndex((u) => String(u.id) === String(id));

    if (index === -1) {
      return { success: false, message: 'Không tìm thấy người dùng.' };
    }

    users.splice(index, 1);
    Storage.setUsers(users);

    return { success: true, message: 'Đã xóa người dùng.' };
  },

  /**
   * Xóa nhiều user
   */
  deleteMany(ids) {
    const current = Storage.getCurrentUser();
    const filteredIds = ids.filter((id) => !current || String(current.id) !== String(id));

    const users = Storage.getUsers();
    const filtered = users.filter((u) => !filteredIds.includes(String(u.id)));
    Storage.setUsers(filtered);

    return {
      success: true,
      message: `Đã xóa ${users.length - filtered.length} người dùng.`,
    };
  },

  /* ============================================================
     FAVORITES
     ============================================================ */

  /**
   * Lấy danh sách yêu thích của user hiện tại
   */
  getFavorites() {
    const current = AuthService.getCurrentUser();
    if (!current) return [];

    const favorites = Storage.getFavorites().filter(
      (f) => String(f.userId) === String(current.id)
    );

    return favorites
      .map((f) => {
        const doctor = DoctorService.getById(f.doctorId);
        return doctor ? { ...doctor, addedAt: f.addedAt } : null;
      })
      .filter(Boolean);
  },

  /**
   * Thêm bác sĩ vào yêu thích
   */
  addFavorite(doctorId) {
    const current = AuthService.getCurrentUser();
    if (!current) {
      return { success: false, message: 'Bạn cần đăng nhập.' };
    }

    const doctor = DoctorService.getById(doctorId);
    if (!doctor) {
      return { success: false, message: 'Không tìm thấy bác sĩ.' };
    }

    const favorites = Storage.getFavorites();
    const exists = favorites.some(
      (f) =>
        String(f.userId) === String(current.id) &&
        String(f.doctorId) === String(doctorId)
    );

    if (exists) {
      return { success: false, message: 'Bác sĩ đã có trong danh sách yêu thích.' };
    }

    favorites.push({
      userId: current.id,
      doctorId: Number(doctorId),
      addedAt: new Date().toISOString(),
    });

    Storage.setFavorites(favorites);

    return { success: true, message: 'Đã thêm vào yêu thích!' };
  },

  /**
   * Xóa khỏi yêu thích
   */
  removeFavorite(doctorId) {
    const current = AuthService.getCurrentUser();
    if (!current) return { success: false, message: 'Bạn cần đăng nhập.' };

    const favorites = Storage.getFavorites().filter(
      (f) =>
        !(
          String(f.userId) === String(current.id) &&
          String(f.doctorId) === String(doctorId)
        )
    );

    Storage.setFavorites(favorites);

    return { success: true, message: 'Đã xóa khỏi yêu thích.' };
  },

  /**
   * Kiểm tra bác sĩ có trong yêu thích không
   */
  isFavorite(doctorId) {
    const current = AuthService.getCurrentUser();
    if (!current) return false;

    return Storage.getFavorites().some(
      (f) =>
        String(f.userId) === String(current.id) &&
        String(f.doctorId) === String(doctorId)
    );
  },

  /**
   * Toggle yêu thích
   */
  toggleFavorite(doctorId) {
    if (this.isFavorite(doctorId)) {
      return this.removeFavorite(doctorId);
    }
    return this.addFavorite(doctorId);
  },

  /* ============================================================
     STATISTICS
     ============================================================ */

  count() {
    return this.getAll().length;
  },

  countByRole(role) {
    return this.getAll().filter((u) => u.role === role).length;
  },

  countBlocked() {
    return this.getAll().filter((u) => u.status === CONFIG.USER_STATUS.BLOCKED).length;
  },

  /**
   * Thống kê user
   */
  getStats() {
    const all = this.getAll();
    return {
      total: all.length,
      admins: all.filter((u) => u.role === 'admin').length,
      users: all.filter((u) => u.role === 'user').length,
      blocked: all.filter((u) => u.status === 'blocked').length,
      active: all.filter((u) => u.status === 'active').length,
    };
  },

  /**
   * Thống kê chi tiêu của user
   */
  getUserStats(userId) {
    const bookings = BookingService.getByUser(userId);
    return {
      totalBookings: bookings.length,
      completed: bookings.filter((b) => b.status === 'completed').length,
      cancelled: bookings.filter((b) => b.status === 'cancelled').length,
      pending: bookings.filter((b) => b.status === 'pending').length,
      totalSpent: bookings
        .filter((b) => b.status === 'completed')
        .reduce((sum, b) => sum + (b.price || 0), 0),
    };
  },
};

/* ===== EXPORT ===== */
if (typeof window !== 'undefined') {
  window.UserService = UserService;
}