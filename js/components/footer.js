/* ============================================================
   MEDICARE — FOOTER COMPONENT
   Render footer động cho toàn bộ website
   - Không emoji
   - Inline SVG
   - Escape dữ liệu động
   - Responsive theo footer.css
   ============================================================ */

const FooterComponent = {
  /* ============================================================
     01. RENDER
     ============================================================ */

  render() {
    const footerEl = document.getElementById('footer');

    if (!footerEl) return;

    const prefix = this.getPrefix();
    const settings = this.getSettings();
    const appName = this.getAppName();

    footerEl.className = 'footer';

    footerEl.innerHTML = `
      <div class="container">

        <div class="footer-grid">

          ${this.renderBrandColumn(settings, appName)}

          ${this.renderServiceColumn(prefix)}

          ${this.renderSupportColumn(prefix)}

          ${this.renderContactColumn(settings)}

        </div>

        ${this.renderBottom(prefix, appName)}

      </div>
    `;

    this.bindEvents();
  },


  /* ============================================================
     02. BRAND COLUMN
     ============================================================ */

  renderBrandColumn(settings, appName) {
    const description =
      settings.siteDescription ||
      'Nền tảng hỗ trợ tìm kiếm bác sĩ và đặt lịch khám trực tuyến thuận tiện.';

    return `
      <div class="footer-col footer-brand">

        <a
          href="${this.getPrefix()}index.html"
          class="footer-logo"
          aria-label="${this.escape(appName)} - Trang chủ"
        >
          <span class="footer-logo__icon" aria-hidden="true">
            ${this.icon('medical')}
          </span>

          <span class="footer-logo__text">
            ${this.escape(appName)}
          </span>
        </a>

        <p class="footer-brand__desc">
          ${this.escape(description)}
        </p>

        ${this.renderSocial(settings)}

        <div class="footer-trust">
          <span class="footer-trust__icon" aria-hidden="true">
            ${this.icon('shield')}
          </span>

          <span>
            Thông tin của bạn được lưu trữ và quản lý cẩn thận.
          </span>
        </div>

      </div>
    `;
  },


  /* ============================================================
     03. SERVICE COLUMN
     ============================================================ */

  renderServiceColumn(prefix) {
    const links = [
      {
        href: `${prefix}index.html`,
        label: 'Trang chủ',
      },
      {
        href: `${prefix}pages/doctors/list.html`,
        label: 'Danh sách bác sĩ',
      },
      {
        href: `${prefix}pages/doctors/search.html`,
        label: 'Tìm kiếm bác sĩ',
      },
      {
        href: `${prefix}pages/booking/create.html`,
        label: 'Đặt lịch khám',
      },
      {
        href: `${prefix}pages/booking/history.html`,
        label: 'Lịch sử đặt lịch',
      },
    ];

    return `
      <div class="footer-col">

        <h4>Dịch vụ</h4>

        <nav
          class="footer-links"
          aria-label="Liên kết dịch vụ"
        >
          ${links
            .map(
              (link) => `
                <a href="${link.href}">
                  ${this.escape(link.label)}
                </a>
              `
            )
            .join('')}
        </nav>

      </div>
    `;
  },


  /* ============================================================
     04. SUPPORT COLUMN
     ============================================================ */

  renderSupportColumn(prefix) {
    const links = [
      {
        href: `${prefix}pages/static/about.html`,
        label: 'Giới thiệu',
      },
      {
        href: `${prefix}pages/static/contact.html`,
        label: 'Liên hệ',
      },
      {
        href: `${prefix}pages/static/faq.html`,
        label: 'Câu hỏi thường gặp',
      },
      {
        href: `${prefix}pages/auth/login.html`,
        label: 'Đăng nhập',
      },
      {
        href: `${prefix}pages/auth/register.html`,
        label: 'Đăng ký',
      },
    ];

    return `
      <div class="footer-col">

        <h4>Hỗ trợ</h4>

        <nav
          class="footer-links"
          aria-label="Liên kết hỗ trợ"
        >
          ${links
            .map(
              (link) => `
                <a href="${link.href}">
                  ${this.escape(link.label)}
                </a>
              `
            )
            .join('')}
        </nav>

      </div>
    `;
  },


  /* ============================================================
     05. CONTACT COLUMN
     ============================================================ */

  renderContactColumn(settings) {
    const phone = settings.contactPhone || '';
    const email = settings.contactEmail || '';
    const address = settings.contactAddress || '';

    const hasContact = phone || email || address;

    return `
      <div class="footer-col">

        <h4>Liên hệ</h4>

        ${
          hasContact
            ? `
              <div class="footer-contact">

                ${this.renderPhone(phone)}

                ${this.renderEmail(email)}

                ${this.renderAddress(address)}

              </div>
            `
            : `
              <p>
                Thông tin liên hệ đang được cập nhật.
              </p>
            `
        }

        ${this.renderNewsletter()}

      </div>
    `;
  },


  /* ============================================================
     06. PHONE
     ============================================================ */

  renderPhone(phone) {
    if (!phone) return '';

    const safePhone = this.escape(phone);
    const telPhone = this.sanitizePhone(phone);

    return `
      <div class="footer-contact__item">

        <span
          class="footer-contact__icon"
          aria-hidden="true"
        >
          ${this.icon('phone')}
        </span>

        <div class="footer-contact__content">

          <strong>Hotline</strong>

          ${
            telPhone
              ? `
                <a href="tel:${telPhone}">
                  ${safePhone}
                </a>
              `
              : safePhone
          }

        </div>

      </div>
    `;
  },


  /* ============================================================
     07. EMAIL
     ============================================================ */

  renderEmail(email) {
    if (!email) return '';

    const safeEmail = this.escape(email);

    return `
      <div class="footer-contact__item">

        <span
          class="footer-contact__icon"
          aria-hidden="true"
        >
          ${this.icon('mail')}
        </span>

        <div class="footer-contact__content">

          <strong>Email</strong>

          <a href="mailto:${this.escapeAttribute(email)}">
            ${safeEmail}
          </a>

        </div>

      </div>
    `;
  },


  /* ============================================================
     08. ADDRESS
     ============================================================ */

  renderAddress(address) {
    if (!address) return '';

    return `
      <div class="footer-contact__item">

        <span
          class="footer-contact__icon"
          aria-hidden="true"
        >
          ${this.icon('location')}
        </span>

        <div class="footer-contact__content">

          <strong>Địa chỉ</strong>

          <span>
            ${this.escape(address)}
          </span>

        </div>

      </div>
    `;
  },


  /* ============================================================
     09. SOCIAL
     ============================================================ */

  renderSocial(settings) {
    const socialLinks = [
      {
        key: 'facebook',
        label: 'Facebook',
        icon: 'facebook',
      },
      {
        key: 'youtube',
        label: 'YouTube',
        icon: 'youtube',
      },
      {
        key: 'zalo',
        label: 'Zalo',
        icon: 'message',
      },
      {
        key: 'instagram',
        label: 'Instagram',
        icon: 'instagram',
      },
      {
        key: 'tiktok',
        label: 'TikTok',
        icon: 'music',
      },
    ];

    const availableLinks = socialLinks.filter(
      (social) =>
        settings[social.key] &&
        this.isSafeExternalUrl(settings[social.key])
    );

    if (!availableLinks.length) return '';

    return `
      <div
        class="footer-social"
        aria-label="Mạng xã hội"
      >

        ${availableLinks
          .map((social) => {
            const url = this.escapeAttribute(
              settings[social.key]
            );

            return `
              <a
                href="${url}"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="${social.label}"
                title="${social.label}"
              >
                ${this.icon(social.icon)}
              </a>
            `;
          })
          .join('')}

      </div>
    `;
  },


  /* ============================================================
     10. NEWSLETTER
     ============================================================ */

  renderNewsletter() {
    return `
      <div class="footer-newsletter">

        <p>
          Nhận thông tin và cập nhật mới từ MediCare.
        </p>

        <form
          class="footer-newsletter__form"
          id="newsletterForm"
          novalidate
        >

          <label
            for="newsletterEmail"
            class="sr-only"
          >
            Địa chỉ email
          </label>

          <input
            type="email"
            id="newsletterEmail"
            class="footer-newsletter__input"
            name="email"
            placeholder="Email của bạn"
            autocomplete="email"
            maxlength="120"
            required
          >

          <button
            type="submit"
            class="footer-newsletter__btn"
            aria-label="Đăng ký nhận tin"
          >
            <span>Đăng ký</span>

            ${this.icon('send')}
          </button>

        </form>

      </div>
    `;
  },


  /* ============================================================
     11. FOOTER BOTTOM
     ============================================================ */

  renderBottom(prefix, appName) {
    const year = new Date().getFullYear();

    return `
      <div class="footer-bottom">

        <p>
          © ${year} ${this.escape(appName)}.
          Đồ án website đặt lịch khám bệnh.
        </p>

        <nav
          class="footer-bottom__links"
          aria-label="Liên kết pháp lý và hỗ trợ"
        >

          <a href="${prefix}pages/static/about.html">
            Giới thiệu
          </a>

          <a href="${prefix}pages/static/contact.html">
            Liên hệ
          </a>

          <a href="${prefix}pages/static/faq.html">
            FAQ
          </a>

        </nav>

      </div>
    `;
  },


  /* ============================================================
     12. ICON SYSTEM
     Toàn bộ icon dùng inline SVG
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

      shield: `
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M12 3.5 19 6v5.2c0 4.4-2.7 7.6-7 9.3-4.3-1.7-7-4.9-7-9.3V6l7-2.5Z"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linejoin="round"
          />
          <path
            d="m9.2 12 1.8 1.8 3.9-4"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      `,

      phone: `
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M7.3 3.8 9.4 7c.3.5.2 1.1-.2 1.5l-1.3 1.3c1.2 2.5 3.1 4.4 5.6 5.6l1.3-1.3c.4-.4 1-.5 1.5-.2l3.2 2.1c.5.3.7.9.5 1.5l-.7 2c-.2.6-.8 1-1.4 1C10.2 20.5 3.5 13.8 3.5 6.1c0-.6.4-1.2 1-1.4l2-.7c.3-.1.6-.1.8-.2Z"
            stroke="currentColor"
            stroke-width="1.7"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      `,

      mail: `
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <rect
            x="3"
            y="5"
            width="18"
            height="14"
            rx="2.5"
            stroke="currentColor"
            stroke-width="1.8"
          />
          <path
            d="m4.5 7 7.5 6 7.5-6"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      `,

      location: `
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M20 10c0 5.2-8 11-8 11s-8-5.8-8-11a8 8 0 1 1 16 0Z"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linejoin="round"
          />
          <circle
            cx="12"
            cy="10"
            r="2.5"
            stroke="currentColor"
            stroke-width="1.8"
          />
        </svg>
      `,

      facebook: `
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M14 8h3V4.5c-.5-.1-1.8-.2-3.4-.2-3.3 0-5.6 2-5.6 5.8V13H5v4h3v7h4v-7h3.3l.7-4H12v-2.5C12 9.3 12.4 8 14 8Z"
            fill="currentColor"
            stroke="none"
          />
        </svg>
      `,

      youtube: `
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M21 8.2c-.2-1.3-1.2-2.3-2.5-2.5C16.7 5.4 14.5 5.3 12 5.3s-4.7.1-6.5.4C4.2 5.9 3.2 6.9 3 8.2c-.2 1.2-.3 2.5-.3 3.8s.1 2.6.3 3.8c.2 1.3 1.2 2.3 2.5 2.5 1.8.3 4 .4 6.5.4s4.7-.1 6.5-.4c1.3-.2 2.3-1.2 2.5-2.5.2-1.2.3-2.5.3-3.8s-.1-2.6-.3-3.8Z"
            stroke="currentColor"
            stroke-width="1.6"
          />
          <path
            d="m10 9 5 3-5 3V9Z"
            fill="currentColor"
            stroke="none"
          />
        </svg>
      `,

      message: `
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.8 8.8 0 0 1-3-.5L4 20l1.4-4A7.1 7.1 0 0 1 4 11.5 7.5 7.5 0 0 1 12 4a7.5 7.5 0 0 1 8 7.5Z"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linejoin="round"
          />
          <path
            d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01"
            stroke="currentColor"
            stroke-width="2.3"
            stroke-linecap="round"
          />
        </svg>
      `,

      instagram: `
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <rect
            x="3.5"
            y="3.5"
            width="17"
            height="17"
            rx="5"
            stroke="currentColor"
            stroke-width="1.8"
          />
          <circle
            cx="12"
            cy="12"
            r="4"
            stroke="currentColor"
            stroke-width="1.8"
          />
          <circle
            cx="17.3"
            cy="6.8"
            r="1"
            fill="currentColor"
            stroke="none"
          />
        </svg>
      `,

      music: `
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M14 4v10.5a3.5 3.5 0 1 1-2-3.2V6.5L19 5v3"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      `,

      send: `
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="m4 5 16 7-16 7 3-7-3-7Z"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linejoin="round"
          />
          <path
            d="M7 12h13"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
          />
        </svg>
      `,
    };

    return icons[name] || '';
  },


  /* ============================================================
     13. SETTINGS
     ============================================================ */

  getSettings() {
    try {
      if (
        typeof Storage !== 'undefined' &&
        typeof Storage.getSettings === 'function'
      ) {
        return Storage.getSettings() || {};
      }
    } catch (error) {
      console.warn(
        '[FooterComponent] Không thể đọc settings:',
        error
      );
    }

    return {};
  },


  /* ============================================================
     14. APP NAME
     ============================================================ */

  getAppName() {
    if (
      typeof CONFIG !== 'undefined' &&
      CONFIG.APP_NAME
    ) {
      return String(CONFIG.APP_NAME);
    }

    return 'MediCare';
  },


  /* ============================================================
     15. PREFIX
     Tính đường dẫn từ trang hiện tại về root project
     ============================================================ */

  getPrefix() {
    const path = window.location.pathname
      .replace(/\\/g, '/');

    const segments = path
      .split('/')
      .filter(Boolean);

    const adminIndex = segments.indexOf('admin');
    const pagesIndex = segments.indexOf('pages');

    /*
     * admin/dashboard.html
     * admin/index.html
     */
    if (
      adminIndex !== -1 &&
      segments.length === adminIndex + 2
    ) {
      return '../';
    }

    /*
     * admin/users/list.html
     * admin/doctors/create.html
     * admin/reports/revenue.html
     */
    if (adminIndex !== -1) {
      const depth =
        segments.length - adminIndex - 1;

      return '../'.repeat(depth);
    }

    /*
     * pages/auth/login.html
     * pages/doctors/list.html
     * pages/profile/index.html
     */
    if (pagesIndex !== -1) {
      const depth =
        segments.length - pagesIndex;

      return '../'.repeat(depth);
    }

    /*
     * Root index.html
     */
    return '';
  },


  /* ============================================================
     16. ESCAPE HTML
     ============================================================ */

  escape(value) {
    const text =
      value === null || value === undefined
        ? ''
        : String(value);

    if (
      typeof Utils !== 'undefined' &&
      typeof Utils.escapeHtml === 'function'
    ) {
      return Utils.escapeHtml(text);
    }

    return text.replace(
      /[&<>"']/g,
      (char) => {
        const entities = {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#039;',
        };

        return entities[char];
      }
    );
  },


  /* ============================================================
     17. ESCAPE ATTRIBUTE
     ============================================================ */

  escapeAttribute(value) {
    return this.escape(value);
  },


  /* ============================================================
     18. SANITIZE PHONE
     ============================================================ */

  sanitizePhone(phone) {
    if (!phone) return '';

    const value = String(phone).trim();

    /*
     * Chỉ giữ số và dấu + ở đầu.
     */
    const hasPlus = value.startsWith('+');

    const numbers = value.replace(/\D/g, '');

    if (!numbers) return '';

    return hasPlus
      ? `+${numbers}`
      : numbers;
  },


  /* ============================================================
     19. SAFE EXTERNAL URL
     Chỉ cho http / https
     ============================================================ */

  isSafeExternalUrl(value) {
    if (!value) return false;

    try {
      const url = new URL(
        String(value),
        window.location.origin
      );

      return (
        url.protocol === 'http:' ||
        url.protocol === 'https:'
      );
    } catch {
      return false;
    }
  },


  /* ============================================================
     20. NEWSLETTER EVENTS
     ============================================================ */

  bindEvents() {
    const form =
      document.getElementById(
        'newsletterForm'
      );

    if (!form) return;

    /*
     * Tránh bind nhiều lần nếu footer render lại.
     */
    if (form.dataset.bound === 'true') {
      return;
    }

    form.dataset.bound = 'true';

    form.addEventListener(
      'submit',
      (event) => {
        event.preventDefault();

        const input =
          form.querySelector(
            'input[type="email"]'
          );

        if (!input) return;

        const email =
          input.value.trim();

        if (!email) {
          this.showToast(
            'Vui lòng nhập địa chỉ email.',
            'warning'
          );

          input.focus();

          return;
        }

        if (!this.isValidEmail(email)) {
          this.showToast(
            'Địa chỉ email chưa đúng định dạng.',
            'warning'
          );

          input.focus();

          return;
        }

        /*
         * Demo frontend:
         * lưu newsletter vào LocalStorage.
         */
        this.saveNewsletterEmail(email);

        this.showToast(
          'Đăng ký nhận tin thành công!',
          'success'
        );

        form.reset();
      }
    );
  },


  /* ============================================================
     21. EMAIL VALIDATION
     ============================================================ */

  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      String(email).trim()
    );
  },


  /* ============================================================
     22. SAVE NEWSLETTER
     ============================================================ */

  saveNewsletterEmail(email) {
    const storageKey =
      'medicare_newsletter';

    try {
      const raw =
        localStorage.getItem(storageKey);

      const current = raw
        ? JSON.parse(raw)
        : [];

      const list = Array.isArray(current)
        ? current
        : [];

      const normalizedEmail =
        String(email)
          .trim()
          .toLowerCase();

      const exists = list.some((item) => {
        if (typeof item === 'string') {
          return (
            item.toLowerCase() ===
            normalizedEmail
          );
        }

        return (
          String(item?.email || '')
            .toLowerCase() ===
          normalizedEmail
        );
      });

      if (exists) {
        this.showToast(
          'Email này đã đăng ký nhận tin.',
          'info'
        );

        return false;
      }

      list.push({
        email: normalizedEmail,
        createdAt:
          new Date().toISOString(),
      });

      localStorage.setItem(
        storageKey,
        JSON.stringify(list)
      );

      return true;
    } catch (error) {
      console.warn(
        '[FooterComponent] Không thể lưu newsletter:',
        error
      );

      return false;
    }
  },


  /* ============================================================
     23. TOAST FALLBACK
     ============================================================ */

  showToast(message, type = 'success') {
    if (
      typeof ToastComponent !== 'undefined'
    ) {
      const toastMethod =
        ToastComponent[type];

      if (
        typeof toastMethod === 'function'
      ) {
        toastMethod.call(
          ToastComponent,
          message
        );

        return;
      }

      if (
        typeof ToastComponent.show ===
        'function'
      ) {
        ToastComponent.show(
          message,
          type
        );

        return;
      }
    }

    /*
     * Không dùng alert để tránh làm UX bị ngắt.
     * Chỉ log nếu toast component chưa được load.
     */
    console.info(
      `[MediCare] ${message}`
    );
  },
};


/* ============================================================
   24. EXPORT GLOBAL
   ============================================================ */

if (typeof window !== 'undefined') {
  window.FooterComponent =
    FooterComponent;
}


/* ============================================================
   25. AUTO RENDER
   ============================================================ */

if (typeof document !== 'undefined') {
  if (
    document.readyState === 'loading'
  ) {
    document.addEventListener(
      'DOMContentLoaded',
      () => {
        FooterComponent.render();
      },
      {
        once: true,
      }
    );
  } else {
    FooterComponent.render();
  }
}