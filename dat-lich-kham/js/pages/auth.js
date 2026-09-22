/* ============================================================
   PAGE — AUTH
   Logic trang đăng nhập, đăng ký, quên mật khẩu
   ============================================================ */

const AuthPage = {
  /* ============================================================
     INIT
     ============================================================ */

  init() {
    this.initLoginForm();
    this.initRegisterForm();
    this.initForgotForm();
    this.fillRememberedEmail();
    this.redirectIfLoggedIn();
  },

  /* ============================================================
     REDIRECT IF LOGGED IN
     ============================================================ */

  redirectIfLoggedIn() {
    const user = AuthService.getCurrentUser();
    if (!user) return;

    // Nếu đã đăng nhập và đang ở trang login/register → chuyển hướng
    const path = window.location.pathname;
    const isAuthPage = path.includes('/auth/login') || path.includes('/auth/register');

    if (isAuthPage) {
      if (user.role === CONFIG.ROLES.ADMIN) {
        Utils.redirect('../../admin/dashboard.html');
      } else {
        Utils.redirect('../../index.html');
      }
    }
  },

  /* ============================================================
     LOGIN
     ============================================================ */

  initLoginForm() {
    const form = document.getElementById('loginForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;
      const remember = document.getElementById('rememberMe')?.checked || false;

      // Validate
      if (!email || !password) {
        this.showAlert('Vui lòng nhập đầy đủ thông tin.', 'error');
        return;
      }

      if (!Validator.email(email)) {
        this.showAlert('Email không hợp lệ.', 'error');
        return;
      }

      // Gọi service
      const result = AuthService.loginWithRemember(email, password, remember);

      if (!result.success) {
        this.showAlert(result.message, 'error');
        return;
      }

      this.showAlert('Đăng nhập thành công! Đang chuyển hướng...', 'success');

      // Chuyển hướng
      setTimeout(() => {
        const redirect = sessionStorage.getItem('redirect_after_login');
        sessionStorage.removeItem('redirect_after_login');

        if (redirect) {
          Utils.redirect(redirect);
        } else if (result.user.role === CONFIG.ROLES.ADMIN) {
          Utils.redirect('../../admin/dashboard.html');
        } else {
          Utils.redirect('../../index.html');
        }
      }, 900);
    });
  },

  fillRememberedEmail() {
    const input = document.getElementById('loginEmail');
    const rememberCheckbox = document.getElementById('rememberMe');
    if (!input) return;

    const remembered = AuthService.getRememberedEmail();
    if (remembered) {
      input.value = remembered;
      if (rememberCheckbox) rememberCheckbox.checked = true;
    }
  },

  /* ============================================================
     REGISTER
     ============================================================ */

  initRegisterForm() {
    const form = document.getElementById('registerForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const data = {
        name: document.getElementById('regName').value.trim(),
        email: document.getElementById('regEmail').value.trim(),
        phone: document.getElementById('regPhone').value.trim(),
        password: document.getElementById('regPassword').value,
        confirm: document.getElementById('regConfirm').value,
      };

      const agree = document.getElementById('agreeTerms')?.checked;
      if (!agree) {
        this.showAlert('Vui lòng đồng ý với điều khoản sử dụng.', 'error');
        return;
      }

      // Validate
      if (!data.name || !data.email || !data.phone || !data.password) {
        this.showAlert('Vui lòng nhập đầy đủ thông tin.', 'error');
        return;
      }

      if (!Validator.email(data.email)) {
        this.showAlert('Email không hợp lệ.', 'error');
        return;
      }

      if (!Validator.phone(data.phone)) {
        this.showAlert('Số điện thoại không hợp lệ (10-11 số).', 'error');
        return;
      }

      if (!Validator.password(data.password)) {
        this.showAlert(
          `Mật khẩu phải từ ${CONFIG.VALIDATION.PASSWORD_MIN} ký tự.`,
          'error'
        );
        return;
      }

      if (data.password !== data.confirm) {
        this.showAlert('Mật khẩu xác nhận không khớp.', 'error');
        return;
      }

      // Gọi service
      const result = AuthService.register(data);

      if (!result.success) {
        this.showAlert(result.message, 'error');
        return;
      }

      this.showAlert('Đăng ký thành công! Đang chuyển đến trang đăng nhập...', 'success');

      setTimeout(() => {
        Utils.redirect('login.html');
      }, 1200);
    });
  },

  /* ============================================================
     FORGOT PASSWORD
     ============================================================ */

  initForgotForm() {
    const form = document.getElementById('forgotForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const email = document.getElementById('forgotEmail').value.trim();

      if (!email) {
        this.showAlert('Vui lòng nhập email.', 'error');
        return;
      }

      if (!Validator.email(email)) {
        this.showAlert('Email không hợp lệ.', 'error');
        return;
      }

      const result = AuthService.forgotPassword(email);

      if (!result.success) {
        this.showAlert(result.message, 'error');
        return;
      }

      // Demo: hiển thị mật khẩu hiện tại
      this.showAlert(
        `Mật khẩu hiện tại của bạn là: <strong>${result.password}</strong>`,
        'success'
      );
    });
  },

  /* ============================================================
     HELPERS
     ============================================================ */

  showAlert(message, type = 'info') {
    const alertBox = document.getElementById('alertBox');
    if (!alertBox) return;

    alertBox.className = `alert alert-${type} show`;
    alertBox.innerHTML = message;

    // Auto hide sau 5s
    clearTimeout(this._alertTimer);
    this._alertTimer = setTimeout(() => {
      alertBox.classList.remove('show');
    }, 5000);
  },
};

/* ===== AUTO INIT ===== */
if (typeof window !== 'undefined') {
  window.AuthPage = AuthPage;

  document.addEventListener('DOMContentLoaded', () => {
    AuthPage.init();
  });
}