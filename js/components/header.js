/* ============================================================
   COMPONENT — HEADER
   Render header động theo trạng thái đăng nhập
   ============================================================ */

const HeaderComponent = {
  /* ============================================================
     RENDER
     ============================================================ */

  /**
   * Render header vào element #header
   */
  render() {
    const headerEl = document.getElementById('header');
    if (!headerEl) return;

    // Tự tính prefix đường dẫn theo cấp thư mục
    const prefix = this.getPrefix();

    const user = AuthService.getCurrentUser();
    const isAdmin = user && user.role === CONFIG.ROLES.ADMIN;

    headerEl.className = 'header';
    headerEl.innerHTML = `
      <div class="container header-inner">
        <a href="${prefix}index.html" class="logo">
          <span></span>
          <span>${CONFIG.APP_NAME}</span>
        </a>

        <nav class="nav">
          ${this.renderNavLinks(prefix)}
        </nav>

        <div class="header-actions">
          ${user ? this.renderUserMenu(user, prefix, isAdmin) : this.renderAuthButtons(prefix)}
        </div>

        <button class="header-toggle" id="headerToggle" aria-label="Toggle menu">
          ☰
        </button>
      </div>

      <div class="header-mobile" id="headerMobile">
        <nav class="header-mobile__nav">
          ${this.renderNavLinks(prefix, true)}
        </nav>
        <div class="header-mobile__actions">
          ${
            user
              ? this.renderMobileUserActions(user, prefix, isAdmin)
              : this.renderMobileAuthButtons(prefix)
          }
        </div>
      </div>
    `;

    this.bindEvents();
    this.markActiveLink();
    this.bindScroll();
  },

  /* ============================================================
     RENDER HELPERS
     ============================================================ */

  /**
   * Render các link nav chính
   */
  renderNavLinks(prefix, isMobile = false) {
    const links = [
      { href: `${prefix}index.html`, label: 'Trang chủ', icon: '🏠' },
      { href: `${prefix}pages/doctors/list.html`, label: 'Bác sĩ', icon: '👨‍⚕️' },
      { href: `${prefix}pages/doctors/search.html`, label: 'Tìm kiếm', icon: '🔍' },
      { href: `${prefix}pages/booking/history.html`, label: 'Lịch khám', icon: '📋' },
      { href: `${prefix}pages/static/about.html`, label: 'Giới thiệu', icon: 'ℹ️' },
      { href: `${prefix}pages/static/contact.html`, label: 'Liên hệ', icon: '📞' },
    ];

    return links
      .map(
        (link) => `
      <a href="${link.href}" data-href="${link.href}">
        ${isMobile ? `<span>${link.icon}</span> ` : ''}${link.label}
      </a>
    `
      )
      .join('');
  },

  /**
   * Render nút đăng nhập / đăng ký
   */
  renderAuthButtons(prefix) {
    return `
      <a href="${prefix}pages/auth/login.html" class="btn btn--outline btn--sm">
        Đăng nhập
      </a>
      <a href="${prefix}pages/auth/register.html" class="btn btn--primary btn--sm">
        Đăng ký
      </a>
    `;
  },

  /**
   * Render menu user khi đã đăng nhập
   */
  renderUserMenu(user, prefix, isAdmin) {
    const initial = Utils.getInitials(user.name);

    return `
      <div class="header-user">
        <div class="header-user__avatar">${initial}</div>
        <span class="header-user__name">${Utils.escapeHtml(user.name)}</span>

        <div class="header-dropdown">
          ${
            isAdmin
              ? `
            <a href="${prefix}admin/dashboard.html" class="header-dropdown__item">
              <span>⚙️</span> Trang quản trị
            </a>
            <div class="header-dropdown__divider"></div>
          `
              : ''
          }

          <a href="${prefix}pages/user/profile.html" class="header-dropdown__item">
            <span></span> Hồ sơ cá nhân
          </a>

          <a href="${prefix}pages/booking/history.html" class="header-dropdown__item">
            <span></span> Lịch sử đặt lịch
          </a>

          <a href="${prefix}pages/user/favorites.html" class="header-dropdown__item">
            <span></span> Bác sĩ yêu thích
          </a>

          <a href="${prefix}pages/user/change-password.html" class="header-dropdown__item">
            <span></span> Đổi mật khẩu
          </a>

          <div class="header-dropdown__divider"></div>

          <a href="#" class="header-dropdown__item header-dropdown__item--danger"
             onclick="logout(event)">
            <span></span> Đăng xuất
          </a>
        </div>
      </div>
    `;
  },

  /**
   * Render auth buttons cho mobile
   */
  renderMobileAuthButtons(prefix) {
    return `
      <a href="${prefix}pages/auth/login.html" class="btn btn--outline btn--block">
        Đăng nhập
      </a>
      <a href="${prefix}pages/auth/register.html" class="btn btn--primary btn--block">
        Đăng ký
      </a>
    `;
  },

  /**
   * Render user actions cho mobile
   */
  renderMobileUserActions(user, prefix, isAdmin) {
    return `
      <div class="header-mobile__user">
        <div class="header-user__avatar">${Utils.getInitials(user.name)}</div>
        <div>
          <strong>${Utils.escapeHtml(user.name)}</strong>
          <small>${Utils.escapeHtml(user.email)}</small>
        </div>
      </div>

      ${
        isAdmin
          ? `<a href="${prefix}admin/dashboard.html" class="btn btn--outline btn--block">
              ⚙️ Trang quản trị
            </a>`
          : ''
      }

      <a href="${prefix}pages/user/profile.html" class="btn btn--outline btn--block">
        👤 Hồ sơ
      </a>

      <a href="${prefix}pages/user/favorites.html" class="btn btn--outline btn--block">
        ❤️ Yêu thích
      </a>

      <a href="${prefix}pages/user/change-password.html" class="btn btn--outline btn--block">
        🔒 Đổi mật khẩu
      </a>

      <button class="btn btn--danger btn--block" onclick="logout(event)">
        🚪 Đăng xuất
      </button>
    `;
  },

  /* ============================================================
     HELPERS
     ============================================================ */

  /**
   * Tính prefix đường dẫn (../ hoặc ../../)
   */
  getPrefix() {
    const path = window.location.pathname;

    // Đang ở admin/ hoặc pages/xxx/ → cần ../../
    const segments = path.split('/').filter(Boolean);

    // Tìm vị trí thư mục gốc dự án
    const pagesIndex = segments.indexOf('pages');
    const adminIndex = segments.indexOf('admin');

    if (adminIndex !== -1) return '../';
    if (pagesIndex !== -1) {
      // pages/auth/login.html → ../../ 
      return '../../';
    }
    return '';
  },

  /**
   * Bind sự kiện toggle mobile menu
   */
  bindEvents() {
    const toggle = document.getElementById('headerToggle');
    const mobile = document.getElementById('headerMobile');

    if (toggle && mobile) {
      toggle.addEventListener('click', () => {
        const isOpen = mobile.classList.toggle('show');
        toggle.textContent = isOpen ? '✕' : '☰';
      });
    }

    // Đóng mobile menu khi click link
    if (mobile) {
      mobile.querySelectorAll('a').forEach((a) => {
        a.addEventListener('click', () => {
          mobile.classList.remove('show');
          if (toggle) toggle.textContent = '☰';
        });
      });
    }
  },

  /**
   * Đánh dấu link active theo URL hiện tại
   */
  markActiveLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav a, .header-mobile__nav a');

    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (!href) return;

      // So sánh path cuối
      const hrefPath = href.split('/').slice(-2).join('/');
      const currentPathShort = currentPath.split('/').slice(-2).join('/');

      if (hrefPath === currentPathShort) {
        link.classList.add('active');
      }
    });
  },

  /**
   * Thêm class scrolled khi cuộn
   */
  bindScroll() {
    const header = document.getElementById('header');
    if (!header) return;

    const onScroll = () => {
      if (window.scrollY > 10) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    };

    window.addEventListener('scroll', Utils.throttle(onScroll, 100));
    onScroll();
  },
};

/* ===== AUTO RENDER ===== */
if (typeof window !== 'undefined') {
  window.HeaderComponent = HeaderComponent;

  document.addEventListener('DOMContentLoaded', () => {
    HeaderComponent.render();
  });
}