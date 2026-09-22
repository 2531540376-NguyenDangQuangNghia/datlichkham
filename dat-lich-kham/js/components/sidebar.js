/* ============================================================
   MEDICARE — SIDEBAR COMPONENT
   Render:
   - Admin sidebar
   - User/Profile sidebar

   Nguyên tắc:
   - Không emoji
   - Inline SVG currentColor
   - Không inline style / onclick
   - Escape dữ liệu động
   - Responsive mobile
   - Active navigation
   - Admin có menu Đăng xuất rõ ràng
   - Giữ tương thích logout() hiện tại
   ============================================================ */

const SidebarComponent = {
  /* ============================================================
     01. STATE
     ============================================================ */

  adminDocumentHandler: null,
  adminEscapeHandler: null,
  adminResizeHandler: null,


  /* ============================================================
     02. ADMIN SIDEBAR — RENDER
     ============================================================ */

  renderAdmin() {
    const sidebarEl =
      document.getElementById('adminSidebar');

    if (!sidebarEl) return;

    const user =
      this.getCurrentUser();

    if (
      !user ||
      user.role !== this.getAdminRole()
    ) {
      return;
    }

    const prefix =
      this.getAdminPrefix();

    const currentPath =
      this.normalizePath(
        window.location.pathname
      );

    sidebarEl.className =
      'admin-sidebar';

    sidebarEl.setAttribute(
      'aria-label',
      'Điều hướng quản trị'
    );

    sidebarEl.innerHTML = `
      ${this.renderAdminHeader(prefix)}

      ${this.renderAdminMenu(
        prefix,
        currentPath
      )}

      ${this.renderAdminFooter(user)}
    `;

    this.bindAdminEvents();
  },


  /* ============================================================
     03. ADMIN HEADER
     ============================================================ */

  renderAdminHeader(prefix) {
    const appName =
      this.getAppName();

    return `
      <div class="admin-sidebar__header">

        <a
          href="${prefix}dashboard.html"
          class="admin-sidebar__logo"
          aria-label="${this.escape(appName)} - Dashboard"
        >
          <span
            class="admin-sidebar__logo-icon"
            aria-hidden="true"
          >
            ${this.icon('medical')}
          </span>

          <span class="admin-sidebar__logo-text">
            ${this.escape(appName)}
          </span>
        </a>

      </div>
    `;
  },


  /* ============================================================
     04. ADMIN MENU
     ============================================================ */

  renderAdminMenu(
    prefix,
    currentPath
  ) {
    const pendingCount =
      this.getPendingBadge();

    const sections = [
      {
        label: 'Tổng quan',

        items: [
          {
            href:
              `${prefix}dashboard.html`,

            icon:
              'dashboard',

            label:
              'Dashboard',

            matches: [
              '/admin/dashboard.html',
            ],
          },
        ],
      },

      {
        label: 'Quản lý',

        items: [
          {
            href:
              `${prefix}doctors/list.html`,

            icon:
              'doctor',

            label:
              'Bác sĩ',

            matches: [
              '/admin/doctors/',
            ],
          },

          {
            href:
              `${prefix}specialties/list.html`,

            icon:
              'specialty',

            label:
              'Chuyên khoa',

            matches: [
              '/admin/specialties/',
            ],
          },

          {
            href:
              `${prefix}users/list.html`,

            icon:
              'users',

            label:
              'Người dùng',

            matches: [
              '/admin/users/',
            ],
          },

          {
            href:
              `${prefix}bookings/list.html`,

            icon:
              'calendar',

            label:
              'Lịch khám',

            matches: [
              '/admin/bookings/',
            ],

            badge:
              pendingCount,
          },
        ],
      },

      {
        label: 'Báo cáo',

        items: [
          {
            href:
              `${prefix}reports/revenue.html`,

            icon:
              'revenue',

            label:
              'Doanh thu',

            matches: [
              '/admin/reports/revenue.html',
            ],
          },

          {
            href:
              `${prefix}reports/bookings.html`,

            icon:
              'chart',

            label:
              'Lượt khám',

            matches: [
              '/admin/reports/bookings.html',
            ],
          },

          {
            href:
              `${prefix}reports/doctors.html`,

            icon:
              'reportDoctor',

            label:
              'Theo bác sĩ',

            matches: [
              '/admin/reports/doctors.html',
            ],
          },
        ],
      },

      {
        label: 'Hệ thống',

        items: [
          {
            href:
              `${prefix}settings/general.html`,

            icon:
              'settings',

            label:
              'Cài đặt chung',

            matches: [
              '/admin/settings/general.html',
            ],
          },

          {
            href:
              `${prefix}settings/profile.html`,

            icon:
              'user',

            label:
              'Hồ sơ admin',

            matches: [
              '/admin/settings/profile.html',
            ],
          },
        ],
      },

      {
        label: 'Tài khoản',

        items: [
          {
            type:
              'logout',

            icon:
              'logout',

            label:
              'Đăng xuất',
          },
        ],
      },
    ];

    return `
      <nav
        class="admin-sidebar__menu"
        aria-label="Menu quản trị"
      >
        ${sections
          .map((section) => `
            <div class="admin-sidebar__group">

              <div class="admin-sidebar__section">
                ${this.escape(section.label)}
              </div>

              <div class="admin-sidebar__links">
                ${section.items
                  .map((item) =>
                    this.renderAdminMenuItem(
                      item,
                      currentPath
                    )
                  )
                  .join('')}
              </div>

            </div>
          `)
          .join('')}
      </nav>
    `;
  },


  /* ============================================================
     05. ADMIN MENU ITEM
     ============================================================ */

  renderAdminMenuItem(
    item,
    currentPath
  ) {
    /*
     * Logout là button,
     * không dùng href/javascript.
     */
    if (item.type === 'logout') {
      return `
        <button
          type="button"
          class="
            admin-sidebar__link
            admin-sidebar__link--button
            admin-sidebar__link--danger
          "
          id="adminMenuLogout"
        >
          <span
            class="admin-sidebar__link-icon"
            aria-hidden="true"
          >
            ${this.icon('logout')}
          </span>

          <span class="admin-sidebar__link-text">
            ${this.escape(item.label)}
          </span>
        </button>
      `;
    }

    const active =
      this.isActive(
        currentPath,
        item.matches
      );

    const badgeNumber =
      Number(item.badge) || 0;

    const badge =
      badgeNumber > 0
        ? Math.min(
            badgeNumber,
            999
          )
        : '';

    return `
      <a
        href="${this.escapeAttribute(item.href)}"
        class="
          admin-sidebar__link
          ${active ? 'active' : ''}
        "
        ${
          active
            ? 'aria-current="page"'
            : ''
        }
      >
        <span
          class="admin-sidebar__link-icon"
          aria-hidden="true"
        >
          ${this.icon(item.icon)}
        </span>

        <span class="admin-sidebar__link-text">
          ${this.escape(item.label)}
        </span>

        ${
          badge
            ? `
              <span
                class="admin-sidebar__badge"
                aria-label="${badge} lịch khám đang chờ xác nhận"
              >
                ${
                  badgeNumber > 999
                    ? '999+'
                    : badge
                }
              </span>
            `
            : ''
        }
      </a>
    `;
  },


  /* ============================================================
     06. ADMIN FOOTER
     ============================================================ */

  renderAdminFooter(user) {
    const name =
      user?.name ||
      user?.fullName ||
      'Quản trị viên';

    const email =
      user?.email || '';

    return `
      <div class="admin-sidebar__footer">

        <div class="admin-sidebar__user">

          <div
            class="admin-sidebar__avatar"
            aria-hidden="true"
          >
            ${this.escape(
              this.getInitials(name)
            )}
          </div>

          <div class="admin-sidebar__user-info">
            <strong>
              ${this.escape(name)}
            </strong>

            <small>
              ${
                email
                  ? this.escape(email)
                  : 'Quản trị viên'
              }
            </small>
          </div>

          <button
            type="button"
            class="admin-sidebar__logout"
            id="adminSidebarLogout"
            aria-label="Đăng xuất"
            title="Đăng xuất"
          >
            ${this.icon('logout')}
          </button>

        </div>

      </div>
    `;
  },


  /* ============================================================
     07. PENDING BOOKING BADGE
     ============================================================ */

  getPendingBadge() {
    try {
      if (
        typeof BookingService !==
          'undefined' &&
        typeof BookingService.countByStatus ===
          'function'
      ) {
        const count =
          Number(
            BookingService.countByStatus(
              'pending'
            )
          ) || 0;

        return count > 0
          ? count
          : '';
      }
    } catch (error) {
      this.debugWarn(
        'Không thể lấy số booking pending:',
        error
      );
    }

    /*
     * Fallback Storage.
     */
    try {
      if (
        typeof Storage !== 'undefined' &&
        typeof Storage.getBookings ===
          'function'
      ) {
        const bookings =
          Storage.getBookings();

        if (!Array.isArray(bookings)) {
          return '';
        }

        const count =
          bookings.filter(
            (booking) =>
              booking?.status ===
              'pending'
          ).length;

        return count > 0
          ? count
          : '';
      }
    } catch (error) {
      this.debugWarn(
        'Không thể đọc booking từ Storage:',
        error
      );
    }

    /*
     * Fallback cuối cùng:
     * đọc trực tiếp LocalStorage.
     */
    try {
      const key =
        this.getStorageKey(
          'BOOKINGS',
          'medicare_bookings'
        );

      const raw =
        localStorage.getItem(key);

      if (!raw) {
        return '';
      }

      const bookings =
        JSON.parse(raw);

      if (!Array.isArray(bookings)) {
        return '';
      }

      const count =
        bookings.filter(
          (booking) =>
            booking?.status ===
            'pending'
        ).length;

      return count > 0
        ? count
        : '';
    } catch {
      return '';
    }
  },


  /* ============================================================
     08. ACTIVE ADMIN LINK
     ============================================================ */

  isActive(
    currentPath,
    matches
  ) {
    if (!currentPath) {
      return false;
    }

    const list =
      Array.isArray(matches)
        ? matches
        : [matches];

    return list.some((match) => {
      if (!match) {
        return false;
      }

      const normalizedMatch =
        this.normalizePath(match);

      return currentPath.includes(
        normalizedMatch
      );
    });
  },


  /* ============================================================
     09. ADMIN EVENTS
     ============================================================ */

  bindAdminEvents() {
    const sidebar =
      document.getElementById(
        'adminSidebar'
      );

    if (!sidebar) return;

    const toggle =
      document.getElementById(
        'sidebarToggle'
      );

    const footerLogoutBtn =
      document.getElementById(
        'adminSidebarLogout'
      );

    const menuLogoutBtn =
      document.getElementById(
        'adminMenuLogout'
      );


    /* ========================================================
       TOGGLE
       ======================================================== */

    if (
      toggle &&
      toggle.dataset.sidebarBound !==
        'true'
    ) {
      toggle.dataset.sidebarBound =
        'true';

      toggle.setAttribute(
        'aria-controls',
        'adminSidebar'
      );

      toggle.setAttribute(
        'aria-expanded',
        String(
          sidebar.classList.contains(
            'show'
          )
        )
      );

      toggle.addEventListener(
        'click',
        (event) => {
          event.preventDefault();
          event.stopPropagation();

          const isOpen =
            !sidebar.classList.contains(
              'show'
            );

          this.setAdminSidebarState(
            isOpen
          );
        }
      );
    }


    /* ========================================================
       FOOTER LOGOUT
       ======================================================== */

    if (
      footerLogoutBtn &&
      footerLogoutBtn.dataset.bound !==
        'true'
    ) {
      footerLogoutBtn.dataset.bound =
        'true';

      footerLogoutBtn.addEventListener(
        'click',
        (event) => {
          event.preventDefault();

          this.handleLogout(event);
        }
      );
    }


    /* ========================================================
       MENU LOGOUT
       ======================================================== */

    if (
      menuLogoutBtn &&
      menuLogoutBtn.dataset.bound !==
        'true'
    ) {
      menuLogoutBtn.dataset.bound =
        'true';

      menuLogoutBtn.addEventListener(
        'click',
        (event) => {
          event.preventDefault();

          this.handleLogout(event);
        }
      );
    }


    /* ========================================================
       CLOSE AFTER NAVIGATION
       ======================================================== */

    sidebar
      .querySelectorAll(
        '.admin-sidebar__link[href]'
      )
      .forEach((link) => {
        if (
          link.dataset.bound ===
          'true'
        ) {
          return;
        }

        link.dataset.bound =
          'true';

        link.addEventListener(
          'click',
          () => {
            if (
              window.innerWidth <=
              1024
            ) {
              this.setAdminSidebarState(
                false
              );
            }
          }
        );
      });


    /* ========================================================
       CLICK OUTSIDE
       ======================================================== */

    if (this.adminDocumentHandler) {
      document.removeEventListener(
        'click',
        this.adminDocumentHandler
      );
    }

    this.adminDocumentHandler =
      (event) => {
        if (
          window.innerWidth > 1024 ||
          !sidebar.classList.contains(
            'show'
          )
        ) {
          return;
        }

        const currentToggle =
          document.getElementById(
            'sidebarToggle'
          );

        if (
          sidebar.contains(
            event.target
          )
        ) {
          return;
        }

        if (
          currentToggle &&
          currentToggle.contains(
            event.target
          )
        ) {
          return;
        }

        this.setAdminSidebarState(
          false
        );
      };

    document.addEventListener(
      'click',
      this.adminDocumentHandler
    );


    /* ========================================================
       ESC
       ======================================================== */

    if (this.adminEscapeHandler) {
      document.removeEventListener(
        'keydown',
        this.adminEscapeHandler
      );
    }

    this.adminEscapeHandler =
      (event) => {
        if (
          event.key !== 'Escape'
        ) {
          return;
        }

        if (
          !sidebar.classList.contains(
            'show'
          )
        ) {
          return;
        }

        this.setAdminSidebarState(
          false
        );

        const currentToggle =
          document.getElementById(
            'sidebarToggle'
          );

        if (currentToggle) {
          currentToggle.focus();
        }
      };

    document.addEventListener(
      'keydown',
      this.adminEscapeHandler
    );


    /* ========================================================
       RESIZE
       ======================================================== */

    if (this.adminResizeHandler) {
      window.removeEventListener(
        'resize',
        this.adminResizeHandler
      );
    }

    this.adminResizeHandler =
      this.throttle(() => {
        if (
          window.innerWidth > 1024
        ) {
          sidebar.classList.remove(
            'show'
          );

          document.body.classList.remove(
            'admin-sidebar-open'
          );

          const currentToggle =
            document.getElementById(
              'sidebarToggle'
            );

          if (currentToggle) {
            currentToggle.setAttribute(
              'aria-expanded',
              'false'
            );
          }
        }
      }, 120);

    window.addEventListener(
      'resize',
      this.adminResizeHandler,
      {
        passive: true,
      }
    );
  },


  /* ============================================================
     10. SET ADMIN SIDEBAR STATE
     ============================================================ */

  setAdminSidebarState(isOpen) {
    const sidebar =
      document.getElementById(
        'adminSidebar'
      );

    const toggle =
      document.getElementById(
        'sidebarToggle'
      );

    if (!sidebar) return;

    const open =
      Boolean(isOpen);

    sidebar.classList.toggle(
      'show',
      open
    );

    document.body.classList.toggle(
      'admin-sidebar-open',
      open &&
        window.innerWidth <= 1024
    );

    if (toggle) {
      toggle.setAttribute(
        'aria-expanded',
        String(open)
      );

      toggle.setAttribute(
        'aria-label',
        open
          ? 'Đóng menu quản trị'
          : 'Mở menu quản trị'
      );
    }
  },


  /* ============================================================
     11. USER SIDEBAR — RENDER
     ============================================================ */

  renderUser() {
    const sidebarEl =
      document.getElementById(
        'userSidebar'
      );

    if (!sidebarEl) return;

    const user =
      this.getCurrentUser();

    if (!user) return;

    const prefix =
      this.getUserPrefix();

    const currentPath =
      this.normalizePath(
        window.location.pathname
      );

    const name =
      user?.name ||
      user?.fullName ||
      'Người dùng';

    const email =
      user?.email || '';

    const isAdmin =
      user.role ===
      this.getAdminRole();

    sidebarEl.className =
      'sidebar';

    sidebarEl.setAttribute(
      'aria-label',
      'Thông tin và điều hướng tài khoản'
    );

    sidebarEl.innerHTML = `
      <div class="sidebar__user">

        <div
          class="avatar"
          aria-hidden="true"
        >
          ${this.escape(
            this.getInitials(name)
          )}
        </div>

        <h3 class="sidebar__name">
          ${this.escape(name)}
        </h3>

        ${
          email
            ? `
              <p class="sidebar__email">
                ${this.escape(email)}
              </p>
            `
            : ''
        }

        <span
          class="
            badge
            ${
              isAdmin
                ? 'badge--primary'
                : 'badge--success'
            }
          "
        >
          ${
            isAdmin
              ? 'Quản trị viên'
              : 'Bệnh nhân'
          }
        </span>

      </div>

      <nav
        class="sidebar-menu"
        aria-label="Menu tài khoản"
      >
        ${this.renderUserMenu(
          prefix,
          currentPath
        )}
      </nav>
    `;

    this.bindUserEvents();
  },


  /* ============================================================
     12. USER MENU
     ============================================================ */

  renderUserMenu(
    prefix,
    currentPath
  ) {
    const items = [
      {
        href:
          `${prefix}profile.html`,

        icon:
          'user',

        label:
          'Thông tin cá nhân',

        matches: [
          '/pages/user/profile.html',
        ],
      },

      {
        href:
          `${prefix}../booking/history.html`,

        icon:
          'calendar',

        label:
          'Lịch sử đặt lịch',

        matches: [
          '/pages/booking/history.html',
        ],
      },

      {
        href:
          `${prefix}favorites.html`,

        icon:
          'heart',

        label:
          'Bác sĩ yêu thích',

        matches: [
          '/pages/user/favorites.html',
        ],
      },

      {
        href:
          `${prefix}change-password.html`,

        icon:
          'lock',

        label:
          'Đổi mật khẩu',

        matches: [
          '/pages/user/change-password.html',
        ],
      },
    ];

    return `
      ${items
        .map((item) => {
          const active =
            this.isActive(
              currentPath,
              item.matches
            );

          return `
            <a
              href="${this.escapeAttribute(item.href)}"
              class="${
                active
                  ? 'active'
                  : ''
              }"
              ${
                active
                  ? 'aria-current="page"'
                  : ''
              }
            >
              <span
                class="sidebar-menu__icon"
                aria-hidden="true"
              >
                ${this.icon(item.icon)}
              </span>

              <span class="sidebar-menu__text">
                ${this.escape(item.label)}
              </span>
            </a>
          `;
        })
        .join('')}

      <button
        type="button"
        class="
          sidebar-menu__logout
          sidebar-menu__logout--danger
        "
        id="userSidebarLogout"
      >
        <span
          class="sidebar-menu__icon"
          aria-hidden="true"
        >
          ${this.icon('logout')}
        </span>

        <span class="sidebar-menu__text">
          Đăng xuất
        </span>
      </button>
    `;
  },


  /* ============================================================
     13. USER EVENTS
     ============================================================ */

  bindUserEvents() {
    const logoutBtn =
      document.getElementById(
        'userSidebarLogout'
      );

    if (
      !logoutBtn ||
      logoutBtn.dataset.bound ===
        'true'
    ) {
      return;
    }

    logoutBtn.dataset.bound =
      'true';

    logoutBtn.addEventListener(
      'click',
      (event) => {
        event.preventDefault();

        this.handleLogout(event);
      }
    );
  },


  /* ============================================================
     14. LOGOUT
     ============================================================ */

  handleLogout(event) {
    if (event) {
      event.preventDefault();
    }

    /*
     * Ưu tiên hàm logout global
     * nếu project cũ đang sử dụng.
     */
    if (
      typeof window.logout ===
        'function' &&
      window.logout !==
        this.handleLogout
    ) {
      try {
        const result =
          window.logout(event);

        /*
         * Nếu logout() cũ tự xử lý
         * redirect thì dừng ở đây.
         */
        if (result !== false) {
          return;
        }
      } catch (error) {
        this.debugWarn(
          'Global logout() gặp lỗi:',
          error
        );
      }
    }

    /*
     * AuthService.
     */
    try {
      if (
        typeof AuthService !==
          'undefined' &&
        typeof AuthService.logout ===
          'function'
      ) {
        AuthService.logout();
      } else {
        /*
         * Fallback trực tiếp nếu
         * AuthService chưa được load.
         */
        this.clearCurrentUser();
      }
    } catch (error) {
      this.debugWarn(
        'AuthService.logout() gặp lỗi:',
        error
      );

      this.clearCurrentUser();
    }

    /*
     * Redirect về trang chủ.
     */
    window.location.href =
      `${this.getRootPrefix()}index.html`;
  },


  /* ============================================================
     15. CLEAR CURRENT USER FALLBACK
     ============================================================ */

  clearCurrentUser() {
    try {
      if (
        typeof Storage !==
          'undefined' &&
        typeof Storage.removeCurrentUser ===
          'function'
      ) {
        Storage.removeCurrentUser();
        return;
      }
    } catch (error) {
      this.debugWarn(
        'Không thể xóa current user bằng Storage:',
        error
      );
    }

    try {
      const key =
        this.getStorageKey(
          'CURRENT_USER',
          'medicare_current_user'
        );

      localStorage.removeItem(key);
    } catch (error) {
      this.debugWarn(
        'Không thể xóa current user khỏi LocalStorage:',
        error
      );
    }
  },


  /* ============================================================
     16. GET CURRENT USER
     ============================================================ */

  getCurrentUser() {
    try {
      if (
        typeof AuthService !==
          'undefined' &&
        typeof AuthService.getCurrentUser ===
          'function'
      ) {
        const user =
          AuthService.getCurrentUser();

        if (user) {
          return user;
        }
      }
    } catch (error) {
      this.debugWarn(
        'Không thể đọc user từ AuthService:',
        error
      );
    }

    /*
     * Storage fallback.
     */
    try {
      if (
        typeof Storage !==
          'undefined' &&
        typeof Storage.getCurrentUser ===
          'function'
      ) {
        return (
          Storage.getCurrentUser() ||
          null
        );
      }
    } catch (error) {
      this.debugWarn(
        'Không thể đọc user từ Storage:',
        error
      );
    }

    /*
     * LocalStorage fallback.
     */
    try {
      const key =
        this.getStorageKey(
          'CURRENT_USER',
          'medicare_current_user'
        );

      const raw =
        localStorage.getItem(key);

      if (!raw) {
        return null;
      }

      const user =
        JSON.parse(raw);

      return (
        user &&
        typeof user === 'object'
      )
        ? user
        : null;
    } catch {
      return null;
    }
  },


  /* ============================================================
     17. GET STORAGE KEY
     ============================================================ */

  getStorageKey(
    name,
    fallback
  ) {
    try {
      if (
        typeof CONFIG !==
          'undefined' &&
        CONFIG.STORAGE_KEYS &&
        CONFIG.STORAGE_KEYS[name]
      ) {
        return CONFIG
          .STORAGE_KEYS[name];
      }
    } catch {
      // Dùng fallback.
    }

    return fallback;
  },


  /* ============================================================
     18. GET ADMIN PREFIX
     ============================================================ */

  getAdminPrefix() {
    const path =
      this.normalizePath(
        window.location.pathname
      );

    const segments =
      path
        .split('/')
        .filter(Boolean);

    const adminIndex =
      segments.indexOf('admin');

    if (adminIndex === -1) {
      return 'admin/';
    }

    const afterAdmin =
      segments.slice(
        adminIndex + 1
      );

    const folderDepth =
      Math.max(
        0,
        afterAdmin.length - 1
      );

    return '../'.repeat(
      folderDepth
    );
  },


  /* ============================================================
     19. GET USER PREFIX
     ============================================================ */

  getUserPrefix() {
    const path =
      this.normalizePath(
        window.location.pathname
      );

    if (
      path.includes('/pages/user/') ||
      path.startsWith('pages/user/')
    ) {
      return '';
    }

    if (
      path.includes('/pages/') ||
      path.startsWith('pages/')
    ) {
      return '../user/';
    }

    return 'pages/user/';
  },


  /* ============================================================
     20. GET ROOT PREFIX
     ============================================================ */

  getRootPrefix() {
    const path =
      this.normalizePath(
        window.location.pathname
      );

    const segments =
      path
        .split('/')
        .filter(Boolean);

    const adminIndex =
      segments.indexOf('admin');

    const pagesIndex =
      segments.indexOf('pages');

    if (adminIndex !== -1) {
      const depth =
        segments.length -
        adminIndex -
        1;

      return '../'.repeat(
        Math.max(0, depth)
      );
    }

    if (pagesIndex !== -1) {
      const depth =
        segments.length -
        pagesIndex;

      return '../'.repeat(
        Math.max(0, depth)
      );
    }

    return '';
  },


  /* ============================================================
     21. GET APP NAME
     ============================================================ */

  getAppName() {
    if (
      typeof CONFIG !==
        'undefined' &&
      CONFIG.APP_NAME
    ) {
      return String(
        CONFIG.APP_NAME
      );
    }

    return 'MediCare';
  },


  /* ============================================================
     22. GET ADMIN ROLE
     ============================================================ */

  getAdminRole() {
    if (
      typeof CONFIG !==
        'undefined' &&
      CONFIG.ROLES &&
      CONFIG.ROLES.ADMIN
    ) {
      return CONFIG.ROLES.ADMIN;
    }

    return 'admin';
  },


  /* ============================================================
     23. INITIALS
     ============================================================ */

  getInitials(name) {
    if (
      typeof Utils !==
        'undefined' &&
      typeof Utils.getInitials ===
        'function'
    ) {
      return Utils.getInitials(name);
    }

    const words =
      String(name || '')
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (!words.length) {
      return 'MC';
    }

    if (words.length === 1) {
      return words[0]
        .slice(0, 2)
        .toUpperCase();
    }

    return (
      words[0][0] +
      words[words.length - 1][0]
    ).toUpperCase();
  },


  /* ============================================================
     24. NORMALIZE PATH
     ============================================================ */

  normalizePath(path) {
    return String(path || '')
      .replace(/\\/g, '/')
      .replace(/\/+/g, '/')
      .replace(/[?#].*$/, '');
  },


  /* ============================================================
     25. ESCAPE HTML
     ============================================================ */

  escape(value) {
    const text =
      value === null ||
      value === undefined
        ? ''
        : String(value);

    if (
      typeof Utils !==
        'undefined' &&
      typeof Utils.escapeHtml ===
        'function'
    ) {
      return Utils.escapeHtml(text);
    }

    return text.replace(
      /[&<>"']/g,
      (character) => {
        const entities = {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#039;',
        };

        return entities[character];
      }
    );
  },


  /* ============================================================
     26. ESCAPE ATTRIBUTE
     ============================================================ */

  escapeAttribute(value) {
    return this.escape(
      value
    );
  },


  /* ============================================================
     27. THROTTLE
     ============================================================ */

  throttle(
    callback,
    delay = 100
  ) {
    if (
      typeof Utils !==
        'undefined' &&
      typeof Utils.throttle ===
        'function'
    ) {
      return Utils.throttle(
        callback,
        delay
      );
    }

    let waiting = false;

    return (...args) => {
      if (waiting) return;

      waiting = true;

      callback(...args);

      window.setTimeout(() => {
        waiting = false;
      }, delay);
    };
  },


  /* ============================================================
     28. DEBUG WARN
     ============================================================ */

  debugWarn(
    message,
    error
  ) {
    if (
      typeof CONFIG !==
        'undefined' &&
      CONFIG.DEBUG
    ) {
      console.warn(
        `[SidebarComponent] ${message}`,
        error || ''
      );
    }
  },


  /* ============================================================
     29. ICON SYSTEM
     100% SVG — KHÔNG EMOJI
     ============================================================ */

  icon(name) {
    const icons = {
      medical: `
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M12 5v14M5 12h14"
            stroke="currentColor"
            stroke-width="2.4"
            stroke-linecap="round"
          />
        </svg>
      `,

      dashboard: `
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <rect
            x="3.5"
            y="3.5"
            width="7"
            height="7"
            rx="1.5"
            stroke="currentColor"
            stroke-width="1.8"
          />

          <rect
            x="13.5"
            y="3.5"
            width="7"
            height="7"
            rx="1.5"
            stroke="currentColor"
            stroke-width="1.8"
          />

          <rect
            x="3.5"
            y="13.5"
            width="7"
            height="7"
            rx="1.5"
            stroke="currentColor"
            stroke-width="1.8"
          />

          <rect
            x="13.5"
            y="13.5"
            width="7"
            height="7"
            rx="1.5"
            stroke="currentColor"
            stroke-width="1.8"
          />
        </svg>
      `,

      doctor: `
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="10"
            cy="7"
            r="3.5"
            stroke="currentColor"
            stroke-width="1.8"
          />

          <path
            d="M3.8 20c.4-4 2.5-6.2 6.2-6.2 2.1 0 3.7.7 4.8 2"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
          />

          <path
            d="M18 13v7M14.5 16.5h7"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
          />
        </svg>
      `,

      specialty: `
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4 5.5A1.5 1.5 0 0 1 5.5 4H12l8 8-7.5 7.5L4 11V5.5Z"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linejoin="round"
          />

          <circle
            cx="8"
            cy="8"
            r="1.3"
            fill="currentColor"
          />
        </svg>
      `,

      users: `
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="9"
            cy="8"
            r="3"
            stroke="currentColor"
            stroke-width="1.8"
          />

          <path
            d="M3.5 19c.4-3.5 2.2-5.2 5.5-5.2s5.1 1.7 5.5 5.2"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
          />

          <path
            d="M15 6.2a3 3 0 0 1 0 5.6M16.5 14c2.5.5 3.8 2.1 4 5"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
          />
        </svg>
      `,

      calendar: `
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <rect
            x="3.5"
            y="5"
            width="17"
            height="15"
            rx="2.5"
            stroke="currentColor"
            stroke-width="1.8"
          />

          <path
            d="M7.5 3.5V7M16.5 3.5V7M4 9h16"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
          />

          <path
            d="M8 13h2M14 13h2M8 16.5h2"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
          />
        </svg>
      `,

      revenue: `
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="12"
            cy="12"
            r="8.5"
            stroke="currentColor"
            stroke-width="1.8"
          />

          <path
            d="M14.8 8.5h-4a2 2 0 0 0 0 4h2.4a2 2 0 0 1 0 4H9M12 6.5v11"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
          />
        </svg>
      `,

      chart: `
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4 20V10M10 20V4M16 20v-7M22 20H2"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
          />
        </svg>
      `,

      reportDoctor: `
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="9"
            cy="7"
            r="3"
            stroke="currentColor"
            stroke-width="1.8"
          />

          <path
            d="M3.5 19c.4-3.5 2.2-5.3 5.5-5.3 1.6 0 2.9.4 3.8 1.2"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
          />

          <path
            d="m17 13 1.1 2.2 2.4.3-1.8 1.7.5 2.4-2.2-1.2-2.2 1.2.5-2.4-1.8-1.7 2.4-.3L17 13Z"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linejoin="round"
          />
        </svg>
      `,

      settings: `
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="12"
            cy="12"
            r="3"
            stroke="currentColor"
            stroke-width="1.8"
          />

          <path
            d="M19.4 13.5a7.8 7.8 0 0 0 0-3l2-1.5-2-3.4-2.5 1a8 8 0 0 0-2.6-1.5L14 2.5h-4l-.4 2.6A8 8 0 0 0 7 6.6l-2.5-1-2 3.4 2 1.5a7.8 7.8 0 0 0 0 3l-2 1.5 2 3.4 2.5-1a8 8 0 0 0 2.6 1.5l.4 2.6h4l.4-2.6a8 8 0 0 0 2.6-1.5l2.5 1 2-3.4-2.1-1.5Z"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linejoin="round"
          />
        </svg>
      `,

      user: `
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="12"
            cy="8"
            r="4"
            stroke="currentColor"
            stroke-width="1.8"
          />

          <path
            d="M4.5 20c.5-4 3-6 7.5-6s7 2 7.5 6"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
          />
        </svg>
      `,

      heart: `
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M20.3 5.7a5 5 0 0 0-7.1 0L12 6.9l-1.2-1.2a5 5 0 0 0-7.1 7.1L12 21l8.3-8.2a5 5 0 0 0 0-7.1Z"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      `,

      lock: `
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <rect
            x="5"
            y="10"
            width="14"
            height="10"
            rx="2.5"
            stroke="currentColor"
            stroke-width="1.8"
          />

          <path
            d="M8 10V7a4 4 0 0 1 8 0v3"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
          />

          <path
            d="M12 14v2.5"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
          />
        </svg>
      `,

      logout: `
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M10 5H6.5A2.5 2.5 0 0 0 4 7.5v9A2.5 2.5 0 0 0 6.5 19H10"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
          />

          <path
            d="M14 8l4 4-4 4M9 12h9"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      `,
    };

    return icons[name] || '';
  },
};


/* ============================================================
   30. EXPORT GLOBAL
   ============================================================ */

if (typeof window !== 'undefined') {
  window.SidebarComponent =
    SidebarComponent;
}


/* ============================================================
   31. AUTO RENDER
   ============================================================ */

if (typeof document !== 'undefined') {
  const initSidebar = () => {
    SidebarComponent.renderAdmin();
    SidebarComponent.renderUser();
  };

  if (
    document.readyState ===
    'loading'
  ) {
    document.addEventListener(
      'DOMContentLoaded',
      initSidebar,
      {
        once: true,
      }
    );
  } else {
    initSidebar();
  }
}