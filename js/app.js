/* ============================================================
   APP — ENTRY POINT
   Khởi tạo toàn bộ ứng dụng, global config, error handling
   ============================================================ */

const App = {
  version: '1.0.0',
  initialized: false,

  /* ============================================================
     INIT
     ============================================================ */

  init() {
    if (this.initialized) return;
    this.initialized = true;

    try {
      this.logBanner();
      this.checkEnvironment();
      this.initSeed();
      this.initTheme();
      this.initGlobalHandlers();
      this.initLinkProtection();
      this.initSessionCheck();
      this.initCleanup();
      this.logReady();
    } catch (error) {
      this.handleFatalError(error);
    }
  },

  /* ============================================================
     LOG BANNER
     ============================================================ */

  logBanner() {
    if (!CONFIG.DEBUG) return;

    const style = 'color:#0d6efd;font-weight:bold;font-size:16px';
    const subStyle = 'color:#6c757d;font-size:11px';

    console.log(`%c ${CONFIG.APP_NAME} v${CONFIG.APP_VERSION}`, style);
    console.log(`%c${CONFIG.APP_DESCRIPTION}`, subStyle);
    console.log('%c──────────────────────────────────────', subStyle);
  },

  logReady() {
    if (!CONFIG.DEBUG) return;

    const user = AuthService.getCurrentUser();
    const role = user ? (user.role === 'admin' ? ' Admin' : ' User') : ' Guest';

    console.log(
      `%c✔ App ready | ${role} | ${window.location.pathname}`,
      'color:#198754;font-weight:bold'
    );
  },

  /* ============================================================
     ENVIRONMENT CHECK
     ============================================================ */

  checkEnvironment() {
    // Kiểm tra localStorage
    if (!Storage.isSupported()) {
      this.showGlobalWarning(
        'Trình duyệt của bạn không hỗ trợ localStorage. Một số chức năng có thể không hoạt động.'
      );
      return;
    }

    // Kiểm tra dependencies
    const required = ['CONFIG', 'Storage', 'Utils', 'Validator'];
    const missing = required.filter((name) => typeof window[name] === 'undefined');

    if (missing.length > 0) {
      console.error('[App] Thiếu dependencies:', missing.join(', '));
      return;
    }

    // Kiểm tra services
    const services = ['AuthService', 'DoctorService', 'BookingService', 'UserService'];
    const missingServices = services.filter((name) => typeof window[name] === 'undefined');

    if (missingServices.length > 0) {
      console.warn('[App] Thiếu services:', missingServices.join(', '));
    }
  },

  /* ============================================================
     SEED INIT
     ============================================================ */

  initSeed() {
    if (typeof SeedData === 'undefined') return;

    try {
      if (!Storage.isSeeded()) {
        SeedData.init();
        if (CONFIG.DEBUG) console.log('[App] Đã khởi tạo dữ liệu mặc định.');
      }
    } catch (error) {
      console.error('[App] Lỗi seed dữ liệu:', error);
    }
  },

  /* ============================================================
     THEME
     ============================================================ */

  initTheme() {
    const theme = Storage.getTheme() || 'light';
    this.applyTheme(theme);

    // Theo dõi system preference
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!Storage.get('medicare_theme_user_set')) {
          this.applyTheme(e.matches ? 'dark' : 'light');
        }
      });
    }
  },

  applyTheme(theme) {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  },

  setTheme(theme) {
    Storage.setTheme(theme);
    Storage.set('medicare_theme_user_set', true);
    this.applyTheme(theme);
    toast.info(`Đã chuyển sang chế độ ${theme === 'dark' ? 'tối' : 'sáng'}.`);
  },

  toggleTheme() {
    const current = Storage.getTheme() || 'light';
    this.setTheme(current === 'dark' ? 'light' : 'dark');
  },

  /* ============================================================
     GLOBAL HANDLERS
     ============================================================ */

  initGlobalHandlers() {
    // Xử lý lỗi toàn cục
    window.addEventListener('error', (e) => {
      if (CONFIG.DEBUG) {
        console.error('[Global Error]', e.message, e.filename, e.lineno);
      }
    });

    window.addEventListener('unhandledrejection', (e) => {
      if (CONFIG.DEBUG) {
        console.error('[Unhandled Promise]', e.reason);
      }
    });

    // ESC đóng modal — đã có trong modal.js, nhưng backup
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (typeof ModalComponent !== 'undefined') {
          ModalComponent.closeAll();
        }
      }
    });

    // Click outside dropdown
    document.addEventListener('click', (e) => {
      const dropdowns = document.querySelectorAll('.header-dropdown.show');
      dropdowns.forEach((dd) => {
        if (!dd.parentElement.contains(e.target)) {
          dd.classList.remove('show');
        }
      });
    });

    // Prevent double submit
    document.querySelectorAll('form').forEach((form) => {
      form.addEventListener('submit', () => {
        const btn = form.querySelector('button[type="submit"]');
        if (btn && !btn.disabled) {
          btn.disabled = true;
          setTimeout(() => (btn.disabled = false), 2000);
        }
      });
    });
  },

  /* ============================================================
     LINK PROTECTION
     ============================================================ */

  initLinkProtection() {
    // Chặn các link href="#"
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href="#"]');
      if (link) {
        e.preventDefault();
      }
    });

    // Chặn link chưa có href
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a:not([href])');
      if (link) {
        e.preventDefault();
      }
    });
  },

  /* ============================================================
     SESSION CHECK
     ============================================================ */

  initSessionCheck() {
    // Kiểm tra session mỗi 5 phút
    setInterval(() => {
      const user = AuthService.getCurrentUser();

      // Nếu đang ở trang admin mà không phải admin → redirect
      if (window.location.pathname.includes('/admin/')) {
        if (!user || user.role !== CONFIG.ROLES.ADMIN) {
          Utils.redirect('../pages/auth/login.html');
        }
      }
    }, 5 * 60 * 1000);

    // Cập nhật lastActive
    const user = AuthService.getCurrentUser();
    if (user) {
      Storage.set('medicare_last_active', new Date().toISOString());
    }
  },

  /* ============================================================
     CLEANUP
     ============================================================ */

  initCleanup() {
    // Xóa cache cũ khi có version mới
    const cachedVersion = Storage.get('medicare_app_version', '');
    if (cachedVersion !== CONFIG.APP_VERSION) {
      if (CONFIG.DEBUG) {
        console.log('[App] Version thay đổi, cập nhật cache...');
      }
      Storage.set('medicare_app_version', CONFIG.APP_VERSION);
    }

    // Xóa sessionStorage khi đóng tab (chỉ giữ redirect_after_login)
    window.addEventListener('beforeunload', () => {
      // Chỉ xóa các key tạm, không xóa redirect_after_login
      const keep = sessionStorage.getItem('redirect_after_login');
      sessionStorage.clear();
      if (keep) sessionStorage.setItem('redirect_after_login', keep);
    });
  },

  /* ============================================================
     GLOBAL WARNING
     ============================================================ */

  showGlobalWarning(message) {
    const banner = document.createElement('div');
    banner.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #fff3cd;
      color: #664d03;
      padding: 12px 20px;
      text-align: center;
      font-size: 14px;
      z-index: 9999;
      border-bottom: 1px solid #ffe69c;
    `;
    banner.textContent = message;
    document.body.appendChild(banner);

    // Đẩy body xuống
    document.body.style.paddingTop = '44px';
  },

  /* ============================================================
     FATAL ERROR
     ============================================================ */

  handleFatalError(error) {
    console.error('[App] Lỗi nghiêm trọng:', error);

    const container = document.createElement('div');
    container.style.cssText = `
      position: fixed;
      inset: 0;
      background: #f8f9fa;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      z-index: 99999;
      font-family: 'Inter', 'Segoe UI', sans-serif;
    `;

    container.innerHTML = `
      <div style="text-align:center;max-width:480px">
        <div style="font-size:64px;margin-bottom:16px">⚠️</div>
        <h1 style="color:#dc3545;font-size:22px;margin-bottom:12px">
          Có lỗi xảy ra
        </h1>
        <p style="color:#6c757d;margin-bottom:24px;line-height:1.6">
          Ứng dụng gặp sự cố không mong muốn. Vui lòng tải lại trang hoặc liên hệ hỗ trợ.
        </p>
        ${
          CONFIG.DEBUG
            ? `<pre style="text-align:left;background:#fff;padding:12px;border-radius:8px;font-size:11px;color:#dc3545;overflow:auto;max-height:200px">${error.message}\n\n${error.stack || ''}</pre>`
            : ''
        }
        <button onclick="window.location.reload()"
                style="padding:12px 32px;background:#0d6efd;color:#fff;border:none;border-radius:999px;font-size:14px;font-weight:600;cursor:pointer">
          🔄 Tải lại trang
        </button>
      </div>
    `;

    document.body.appendChild(container);
  },

  /* ============================================================
     SHORTCUTS
     ============================================================ */

  /**
   * Điều hướng có kiểm tra quyền
   */
  navigate(url, requireRole = null) {
    if (requireRole) {
      const user = AuthService.getCurrentUser();
      if (!user || user.role !== requireRole) {
        toast.error('Bạn không có quyền truy cập trang này.');
        return;
      }
    }
    Utils.redirect(url);
  },

  /**
   * Reset toàn bộ app (dùng cho debug)
   */
  reset() {
    if (!confirm('Reset toàn bộ dữ liệu ứng dụng?')) return;
    Storage.clearApp();
    location.reload();
  },
};

/* ============================================================
   BOOT
   ============================================================ */

if (typeof window !== 'undefined') {
  window.App = App;

  // Expose helpers
  window.toggleTheme = () => App.toggleTheme();
  window.setTheme = (t) => App.setTheme(t);
  window.appReset = () => App.reset();

  // Khởi động khi DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
  } else {
    // DOM đã sẵn sàng (script load async)
    App.init();
  }
}

/* ============================================================
   PRINT CONSOLE COMMANDS (dev only)
   ============================================================ */

if (CONFIG.DEBUG) {
  console.log(
    '%c📘 Console Commands:',
    'color:#0dcaf0;font-weight:bold'
  );
  console.log('%c  App.reset()           – Reset dữ liệu', 'color:#6c757d');
  console.log('%c  App.toggleTheme()     – Đổi theme', 'color:#6c757d');
  console.log('%c  SeedData.reset()      – Seed lại dữ liệu', 'color:#6c757d');
  console.log('%c  Storage.clearApp()    – Xóa localStorage', 'color:#6c757d');
  console.log('%c  AuthService.getCurrentUser()', 'color:#6c757d');
  console.log(
    '%c  BookingService.getStatsByMonth()',
    'color:#6c757d'
  );
}