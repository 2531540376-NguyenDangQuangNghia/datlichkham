/* ============================================================
   MEDICARE — TOAST COMPONENT
   Thông báo nổi toàn hệ thống

   - success / error / warning / info
   - Không emoji
   - Inline SVG currentColor
   - Auto dismiss
   - Pause khi hover / focus
   - Escape dữ liệu động
   - Accessibility
   - Giới hạn số lượng toast
   ============================================================ */

const ToastComponent = {
  /* ============================================================
     01. STATE
     ============================================================ */

  container: null,

  timers: new WeakMap(),

  defaultDuration: 3500,

  defaultMax: 5,


  /* ============================================================
     02. INIT
     ============================================================ */

  init() {
    /*
     * Nếu container đã tồn tại trong DOM
     * thì tái sử dụng.
     */
    const existing =
      document.getElementById(
        'toastContainer'
      );

    if (existing) {
      this.container = existing;

      this.setupContainer(
        existing
      );

      return existing;
    }

    const container =
      document.createElement('div');

    container.className =
      'toast-container';

    container.id =
      'toastContainer';

    this.setupContainer(
      container
    );

    document.body.appendChild(
      container
    );

    this.container = container;

    return container;
  },


  /* ============================================================
     03. SETUP CONTAINER
     ============================================================ */

  setupContainer(container) {
    container.setAttribute(
      'aria-live',
      'polite'
    );

    container.setAttribute(
      'aria-relevant',
      'additions'
    );

    container.setAttribute(
      'aria-label',
      'Thông báo'
    );
  },


  /* ============================================================
     04. SHOW
     ============================================================ */

  /**
   * @param {string} message
   * @param {string} type
   * success | error | warning | info
   *
   * @param {object} options
   * {
   *   title,
   *   duration,
   *   icon,
   *   closable,
   *   pauseOnHover
   * }
   */
  show(
    message,
    type = 'info',
    options = {}
  ) {
    const container =
      this.init();

    const safeType =
      this.normalizeType(type);

    const defaultTitle =
      this.getDefaultTitle(
        safeType
      );

    const {
      title = '',
      duration =
        this.getDefaultDuration(),
      icon = null,
      closable = true,
      pauseOnHover = true,
    } = options;

    const finalTitle =
      title === null
        ? ''
        : title || '';

    const finalDuration =
      Number.isFinite(
        Number(duration)
      )
        ? Math.max(
            0,
            Number(duration)
          )
        : this.getDefaultDuration();

    /*
     * Giới hạn số toast trước khi
     * thêm toast mới.
     */
    this.enforceLimit();

    const toast =
      document.createElement(
        'div'
      );

    toast.className =
      `toast toast--${safeType}`;

    toast.dataset.toastType =
      safeType;

    toast.setAttribute(
      'role',
      safeType === 'error'
        ? 'alert'
        : 'status'
    );

    toast.setAttribute(
      'aria-atomic',
      'true'
    );

    /*
     * Custom icon:
     * Chỉ sử dụng khi truyền SVG/HTML
     * có chủ đích.
     *
     * Mặc định luôn dùng SVG nội bộ.
     */
    const iconMarkup =
      icon !== null
        ? String(icon)
        : this.getIcon(
            safeType
          );

    toast.innerHTML = `
      <div
        class="toast__icon"
        aria-hidden="true"
      >
        ${iconMarkup}
      </div>

      <div class="toast__content">

        ${
          finalTitle
            ? `
              <div class="toast__title">
                ${this.escape(
                  finalTitle
                )}
              </div>
            `
            : ''
        }

        <div class="toast__desc">
          ${this.escape(message)}
        </div>

      </div>

      ${
        closable
          ? `
            <button
              type="button"
              class="toast__close"
              aria-label="Đóng thông báo"
              title="Đóng"
            >
              ${this.icon('close')}
            </button>
          `
          : ''
      }

      ${
        finalDuration > 0
          ? `
            <div
              class="toast__progress"
              aria-hidden="true"
            >
              <span
                class="toast__progress-bar"
              ></span>
            </div>
          `
          : ''
      }
    `;

    container.appendChild(
      toast
    );

    /*
     * Kích hoạt animation vào.
     */
    requestAnimationFrame(() => {
      toast.classList.add(
        'is-visible'
      );
    });

    this.bindToastEvents(
      toast,
      {
        duration:
          finalDuration,

        pauseOnHover,
      }
    );

    /*
     * Nếu title không truyền nhưng
     * caller muốn dùng default:
     *
     * ToastComponent.success(...)
     * sẽ tự truyền title mặc định.
     */
    toast.dataset.defaultTitle =
      defaultTitle;

    return toast;
  },


  /* ============================================================
     05. BIND TOAST EVENTS
     ============================================================ */

  bindToastEvents(
    toast,
    options = {}
  ) {
    const {
      duration = 0,
      pauseOnHover = true,
    } = options;

    const closeBtn =
      toast.querySelector(
        '.toast__close'
      );

    if (closeBtn) {
      closeBtn.addEventListener(
        'click',
        () => {
          this.remove(toast);
        }
      );
    }

    if (duration <= 0) {
      return;
    }

    const state = {
      timer: null,
      duration,
      remaining: duration,
      startedAt: 0,
      paused: false,
    };

    this.timers.set(
      toast,
      state
    );

    this.startTimer(
      toast
    );

    if (pauseOnHover) {
      toast.addEventListener(
        'mouseenter',
        () => {
          this.pauseTimer(
            toast
          );
        }
      );

      toast.addEventListener(
        'mouseleave',
        () => {
          this.resumeTimer(
            toast
          );
        }
      );

      toast.addEventListener(
        'focusin',
        () => {
          this.pauseTimer(
            toast
          );
        }
      );

      toast.addEventListener(
        'focusout',
        (event) => {
          /*
           * Chỉ resume nếu focus
           * thực sự rời toast.
           */
          if (
            !toast.contains(
              event.relatedTarget
            )
          ) {
            this.resumeTimer(
              toast
            );
          }
        }
      );
    }
  },


  /* ============================================================
     06. START TIMER
     ============================================================ */

  startTimer(toast) {
    const state =
      this.timers.get(toast);

    if (
      !state ||
      state.remaining <= 0
    ) {
      return;
    }

    this.clearTimerOnly(
      state
    );

    state.startedAt =
      Date.now();

    state.paused = false;

    state.timer =
      window.setTimeout(
        () => {
          this.remove(toast);
        },
        state.remaining
      );

    this.updateProgress(
      toast,
      state.remaining
    );
  },


  /* ============================================================
     07. PAUSE TIMER
     ============================================================ */

  pauseTimer(toast) {
    const state =
      this.timers.get(toast);

    if (
      !state ||
      state.paused ||
      !state.timer
    ) {
      return;
    }

    const elapsed =
      Date.now() -
      state.startedAt;

    state.remaining =
      Math.max(
        0,
        state.remaining -
          elapsed
      );

    window.clearTimeout(
      state.timer
    );

    state.timer = null;
    state.paused = true;

    toast.classList.add(
      'is-paused'
    );

    const progress =
      toast.querySelector(
        '.toast__progress-bar'
      );

    if (progress) {
      const computed =
        window.getComputedStyle(
          progress
        );

      const width =
        computed.width;

      progress.style.transition =
        'none';

      progress.style.width =
        width;
    }
  },


  /* ============================================================
     08. RESUME TIMER
     ============================================================ */

  resumeTimer(toast) {
    const state =
      this.timers.get(toast);

    if (
      !state ||
      !state.paused ||
      state.remaining <= 0
    ) {
      return;
    }

    toast.classList.remove(
      'is-paused'
    );

    this.startTimer(
      toast
    );
  },


  /* ============================================================
     09. UPDATE PROGRESS
     ============================================================ */

  updateProgress(
    toast,
    duration
  ) {
    const progress =
      toast.querySelector(
        '.toast__progress-bar'
      );

    if (!progress) return;

    progress.style.transition =
      'none';

    progress.style.width =
      '100%';

    /*
     * Force browser reflow.
     */
    void progress.offsetWidth;

    progress.style.transition =
      `width ${duration}ms linear`;

    progress.style.width =
      '0%';
  },


  /* ============================================================
     10. REMOVE
     ============================================================ */

  remove(toast) {
    if (
      !toast ||
      !toast.parentNode ||
      toast.dataset.removing ===
        'true'
    ) {
      return;
    }

    toast.dataset.removing =
      'true';

    const state =
      this.timers.get(toast);

    if (state) {
      this.clearTimerOnly(
        state
      );

      this.timers.delete(
        toast
      );
    }

    toast.classList.remove(
      'is-visible'
    );

    toast.classList.add(
      'hide',
      'is-leaving'
    );

    const removeNode = () => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(
          toast
        );
      }
    };

    toast.addEventListener(
      'transitionend',
      removeNode,
      {
        once: true,
      }
    );

    /*
     * Fallback nếu CSS không có
     * transition.
     */
    window.setTimeout(
      removeNode,
      350
    );
  },


  /* ============================================================
     11. CLEAR
     ============================================================ */

  clear() {
    if (!this.container) {
      this.container =
        document.getElementById(
          'toastContainer'
        );
    }

    if (!this.container) {
      return;
    }

    const toasts =
      Array.from(
        this.container.children
      );

    toasts.forEach((toast) => {
      const state =
        this.timers.get(toast);

      if (state) {
        this.clearTimerOnly(
          state
        );

        this.timers.delete(
          toast
        );
      }

      toast.remove();
    });
  },


  /* ============================================================
     12. ENFORCE LIMIT
     ============================================================ */

  enforceLimit() {
    if (!this.container) {
      return;
    }

    const max =
      this.getMaxToasts();

    if (max <= 0) {
      return;
    }

    while (
      this.container.children
        .length >= max
    ) {
      const oldest =
        this.container
          .firstElementChild;

      if (!oldest) break;

      /*
       * Xóa trực tiếp để toast mới
       * không vượt giới hạn trong lúc
       * animation toast cũ đang chạy.
       */
      const state =
        this.timers.get(oldest);

      if (state) {
        this.clearTimerOnly(
          state
        );

        this.timers.delete(
          oldest
        );
      }

      oldest.remove();
    }
  },


  /* ============================================================
     13. SHORTCUT — SUCCESS
     ============================================================ */

  success(
    message,
    title = 'Thành công'
  ) {
    return this.show(
      message,
      'success',
      {
        title,
      }
    );
  },


  /* ============================================================
     14. SHORTCUT — ERROR
     ============================================================ */

  error(
    message,
    title = 'Có lỗi xảy ra'
  ) {
    return this.show(
      message,
      'error',
      {
        title,
        duration: 4500,
      }
    );
  },


  /* ============================================================
     15. SHORTCUT — WARNING
     ============================================================ */

  warning(
    message,
    title = 'Cảnh báo'
  ) {
    return this.show(
      message,
      'warning',
      {
        title,
        duration: 4500,
      }
    );
  },


  /* ============================================================
     16. SHORTCUT — INFO
     ============================================================ */

  info(
    message,
    title = 'Thông báo'
  ) {
    return this.show(
      message,
      'info',
      {
        title,
      }
    );
  },


  /* ============================================================
     17. DEFAULT TITLE
     ============================================================ */

  getDefaultTitle(type) {
    const titles = {
      success: 'Thành công',
      error: 'Có lỗi xảy ra',
      warning: 'Cảnh báo',
      info: 'Thông báo',
    };

    return (
      titles[type] ||
      titles.info
    );
  },


  /* ============================================================
     18. NORMALIZE TYPE
     ============================================================ */

  normalizeType(type) {
    const normalized =
      String(type || '')
        .trim()
        .toLowerCase();

    const allowed = [
      'success',
      'error',
      'warning',
      'info',
    ];

    return allowed.includes(
      normalized
    )
      ? normalized
      : 'info';
  },


  /* ============================================================
     19. DEFAULT DURATION
     ============================================================ */

  getDefaultDuration() {
    if (
      typeof CONFIG !==
        'undefined' &&
      Number.isFinite(
        Number(
          CONFIG.TOAST_DURATION
        )
      )
    ) {
      return Math.max(
        0,
        Number(
          CONFIG.TOAST_DURATION
        )
      );
    }

    return this.defaultDuration;
  },


  /* ============================================================
     20. MAX TOASTS
     ============================================================ */

  getMaxToasts() {
    if (
      typeof CONFIG !==
        'undefined' &&
      Number.isFinite(
        Number(
          CONFIG.TOAST_MAX
        )
      )
    ) {
      return Math.max(
        1,
        Number(
          CONFIG.TOAST_MAX
        )
      );
    }

    return this.defaultMax;
  },


  /* ============================================================
     21. CLEAR TIMER
     ============================================================ */

  clearTimerOnly(state) {
    if (
      state &&
      state.timer
    ) {
      window.clearTimeout(
        state.timer
      );

      state.timer = null;
    }
  },


  /* ============================================================
     22. STATUS ICON
     ============================================================ */

  getIcon(type) {
    const safeType =
      this.normalizeType(type);

    const map = {
      success: 'success',
      error: 'error',
      warning: 'warning',
      info: 'info',
    };

    return this.icon(
      map[safeType]
    );
  },


  /* ============================================================
     23. SVG ICON SYSTEM
     100% SVG — KHÔNG EMOJI
     ============================================================ */

  icon(name) {
    const icons = {
      success: `
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            stroke-width="1.8"
          />

          <path
            d="m8 12.2 2.5 2.5L16.5 9"
            stroke="currentColor"
            stroke-width="1.9"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      `,

      error: `
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            stroke-width="1.8"
          />

          <path
            d="m9 9 6 6M15 9l-6 6"
            stroke="currentColor"
            stroke-width="1.9"
            stroke-linecap="round"
          />
        </svg>
      `,

      warning: `
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M10.4 4.5 2.8 18a2 2 0 0 0 1.8 3h14.8a2 2 0 0 0 1.8-3L13.6 4.5a1.8 1.8 0 0 0-3.2 0Z"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linejoin="round"
          />

          <path
            d="M12 9v4.5"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
          />

          <circle
            cx="12"
            cy="17"
            r="1"
            fill="currentColor"
          />
        </svg>
      `,

      info: `
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            stroke-width="1.8"
          />

          <path
            d="M12 10.5V17"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
          />

          <circle
            cx="12"
            cy="7.3"
            r="1"
            fill="currentColor"
          />
        </svg>
      `,

      close: `
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M6 6l12 12M18 6 6 18"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
      `,
    };

    return icons[name] || '';
  },


  /* ============================================================
     24. ESCAPE HTML
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
      return Utils.escapeHtml(
        text
      );
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

        return entities[
          character
        ];
      }
    );
  },
};


/* ============================================================
   25. EXPORT GLOBAL
   ============================================================ */

if (typeof window !== 'undefined') {
  window.ToastComponent =
    ToastComponent;

  /*
   * Alias cũ vẫn giữ nguyên để
   * toàn project không phải sửa.
   */
  window.toast = {
    success: (
      message,
      title
    ) =>
      ToastComponent.success(
        message,
        title
      ),

    error: (
      message,
      title
    ) =>
      ToastComponent.error(
        message,
        title
      ),

    warning: (
      message,
      title
    ) =>
      ToastComponent.warning(
        message,
        title
      ),

    info: (
      message,
      title
    ) =>
      ToastComponent.info(
        message,
        title
      ),

    show: (
      message,
      type,
      options
    ) =>
      ToastComponent.show(
        message,
        type,
        options
      ),

    clear: () =>
      ToastComponent.clear(),
  };
}


/* ============================================================
   26. AUTO INIT
   ============================================================ */

if (typeof document !== 'undefined') {
  const init = () => {
    ToastComponent.init();
  };

  if (
    document.readyState === 'loading'
  ) {
    document.addEventListener(
      'DOMContentLoaded',
      init,
      {
        once: true,
      }
    );
  } else {
    init();
  }
}