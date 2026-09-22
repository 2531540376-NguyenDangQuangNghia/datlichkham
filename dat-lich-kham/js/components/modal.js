/* ============================================================
   MEDICARE — MODAL COMPONENT
   Quản lý modal toàn hệ thống

   - Static modal
   - Dynamic confirm
   - Dynamic alert
   - Không emoji / Unicode icon
   - Inline SVG
   - ESC / overlay close
   - Focus management
   - Body scroll lock
   - Async callback
   - Chống bind event trùng
   ============================================================ */

const ModalComponent = {
  /* ============================================================
     01. STATE
     ============================================================ */

  activeStack: [],
  lastFocusedElement: null,
  staticBound: false,
  escapeBound: false,


  /* ============================================================
     02. OPEN
     ============================================================ */

  open(id, options = {}) {
    const modal = document.getElementById(id);

    if (!modal) {
      console.warn(
        `[ModalComponent] Không tìm thấy modal "${id}".`
      );
      return false;
    }

    const {
      focus = true,
    } = options;

    /*
     * Lưu element đang focus trước khi mở modal đầu tiên.
     */
    if (!this.hasOpenModal()) {
      this.lastFocusedElement =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
    }

    /*
     * Nếu modal chưa nằm trong stack thì thêm vào.
     */
    if (!this.activeStack.includes(id)) {
      this.activeStack.push(id);
    }

    modal.classList.add('active', 'show');

    modal.setAttribute('aria-hidden', 'false');

    /*
     * Nếu HTML chưa khai báo role thì tự bổ sung.
     */
    if (!modal.hasAttribute('role')) {
      modal.setAttribute('role', 'dialog');
    }

    modal.setAttribute(
      'aria-modal',
      'true'
    );

    document.body.classList.add(
      'modal-open'
    );

    /*
     * Focus sau khi browser render modal.
     */
    if (focus) {
      requestAnimationFrame(() => {
        this.focusModal(modal);
      });
    }

    return true;
  },


  /* ============================================================
     03. CLOSE
     ============================================================ */

  close(id, options = {}) {
    const modal = document.getElementById(id);

    if (!modal) return false;

    const {
      restoreFocus = true,
    } = options;

    modal.classList.remove(
      'active',
      'show'
    );

    modal.setAttribute(
      'aria-hidden',
      'true'
    );

    modal.removeAttribute(
      'aria-modal'
    );

    this.activeStack =
      this.activeStack.filter(
        (modalId) => modalId !== id
      );

    /*
     * Kiểm tra DOM để tránh state lệch
     * nếu modal được mở bằng code khác.
     */
    if (!this.hasOpenModal()) {
      document.body.classList.remove(
        'modal-open'
      );

      if (
        restoreFocus &&
        this.lastFocusedElement &&
        document.contains(
          this.lastFocusedElement
        )
      ) {
        try {
          this.lastFocusedElement.focus({
            preventScroll: true,
          });
        } catch {
          this.lastFocusedElement.focus();
        }
      }

      this.lastFocusedElement = null;
    } else {
      /*
       * Nếu còn modal khác phía dưới,
       * focus modal trên cùng.
       */
      const topModal =
        this.getTopModal();

      if (topModal) {
        requestAnimationFrame(() => {
          this.focusModal(topModal);
        });
      }
    }

    return true;
  },


  /* ============================================================
     04. CLOSE ALL
     ============================================================ */

  closeAll(options = {}) {
    const {
      restoreFocus = true,
    } = options;

    const opened =
      document.querySelectorAll(
        '.modal.active, .modal.show'
      );

    opened.forEach((modal) => {
      modal.classList.remove(
        'active',
        'show'
      );

      modal.setAttribute(
        'aria-hidden',
        'true'
      );

      modal.removeAttribute(
        'aria-modal'
      );
    });

    this.activeStack = [];

    document.body.classList.remove(
      'modal-open'
    );

    if (
      restoreFocus &&
      this.lastFocusedElement &&
      document.contains(
        this.lastFocusedElement
      )
    ) {
      try {
        this.lastFocusedElement.focus({
          preventScroll: true,
        });
      } catch {
        this.lastFocusedElement.focus();
      }
    }

    this.lastFocusedElement = null;
  },


  /* ============================================================
     05. TOGGLE
     ============================================================ */

  toggle(id) {
    const modal =
      document.getElementById(id);

    if (!modal) {
      console.warn(
        `[ModalComponent] Không tìm thấy modal "${id}".`
      );

      return false;
    }

    if (this.isOpen(modal)) {
      return this.close(id);
    }

    return this.open(id);
  },


  /* ============================================================
     06. CONFIRM
     ============================================================ */

  /**
   * Modal xác nhận.
   *
   * options:
   * {
   *   title,
   *   message,
   *   confirmText,
   *   cancelText,
   *   type,
   *   icon,
   *   closeOnOverlay,
   *   closeOnEscape,
   *   onConfirm,
   *   onCancel
   * }
   */
  confirm(options = {}) {
    const {
      title = 'Xác nhận',
      message =
        'Bạn có chắc chắn muốn thực hiện hành động này?',
      confirmText = 'Đồng ý',
      cancelText = 'Hủy',
      type = 'danger',
      icon = null,
      closeOnOverlay = true,
      closeOnEscape = true,
      onConfirm = null,
      onCancel = null,
    } = options;

    const safeType =
      this.normalizeType(type);

    const id =
      this.createDynamicId(
        'dynamicConfirmModal'
      );

    const modal =
      document.createElement('div');

    modal.className =
      'modal modal--dynamic';

    modal.id = id;

    modal.dataset.dynamicModal =
      'true';

    modal.dataset.closeOnEscape =
      String(closeOnEscape);

    modal.setAttribute(
      'role',
      'alertdialog'
    );

    modal.setAttribute(
      'aria-modal',
      'true'
    );

    modal.setAttribute(
      'aria-hidden',
      'true'
    );

    const titleId =
      `${id}_title`;

    const descriptionId =
      `${id}_description`;

    modal.setAttribute(
      'aria-labelledby',
      titleId
    );

    modal.setAttribute(
      'aria-describedby',
      descriptionId
    );

    const modalIcon =
      icon ||
      this.getTypeIcon(safeType);

    modal.innerHTML = `
      <div
        class="modal__overlay"
        data-modal-overlay
      ></div>

      <div
        class="
          modal__content
          modal__content--sm
        "
        role="document"
      >

        <div class="modal__header">

          <div class="modal__heading">

            ${
              modalIcon
                ? `
                  <span
                    class="
                      modal__status-icon
                      modal__status-icon--${safeType}
                    "
                    aria-hidden="true"
                  >
                    ${modalIcon}
                  </span>
                `
                : ''
            }

            <h3
              class="modal__title"
              id="${titleId}"
            >
              ${this.escape(title)}
            </h3>

          </div>

          <button
            type="button"
            class="modal__close"
            data-modal-action="close"
            aria-label="Đóng hộp thoại"
          >
            ${this.icon('close')}
          </button>

        </div>

        <div class="modal__body">

          <p
            class="modal__message"
            id="${descriptionId}"
          >
            ${this.escape(message)}
          </p>

        </div>

        <div class="modal__footer">

          ${
            cancelText
              ? `
                <button
                  type="button"
                  class="btn btn--outline"
                  data-modal-action="cancel"
                >
                  ${this.escape(cancelText)}
                </button>
              `
              : ''
          }

          <button
            type="button"
            class="btn btn--${safeType}"
            data-modal-action="confirm"
          >
            ${this.escape(confirmText)}
          </button>

        </div>

      </div>
    `;

    document.body.appendChild(modal);

    this.bindDynamicModal(modal, {
      closeOnOverlay,
      onConfirm,
      onCancel,
    });

    requestAnimationFrame(() => {
      this.open(id);
    });

    return id;
  },


  /* ============================================================
     07. ALERT
     ============================================================ */

  /**
   * Modal thông báo.
   *
   * Khác confirm:
   * - Chỉ có 1 nút
   * - Không sinh nút Hủy rỗng
   */
  alert(options = {}) {
    const {
      title = 'Thông báo',
      message = '',
      buttonText = 'Đóng',
      type = 'primary',
      icon = null,
      closeOnOverlay = true,
      closeOnEscape = true,
      onClose = null,
    } = options;

    const safeType =
      this.normalizeType(type);

    const id =
      this.createDynamicId(
        'dynamicAlertModal'
      );

    const modal =
      document.createElement('div');

    modal.className =
      'modal modal--dynamic';

    modal.id = id;

    modal.dataset.dynamicModal =
      'true';

    modal.dataset.closeOnEscape =
      String(closeOnEscape);

    modal.setAttribute(
      'role',
      'alertdialog'
    );

    modal.setAttribute(
      'aria-modal',
      'true'
    );

    modal.setAttribute(
      'aria-hidden',
      'true'
    );

    const titleId =
      `${id}_title`;

    const descriptionId =
      `${id}_description`;

    modal.setAttribute(
      'aria-labelledby',
      titleId
    );

    modal.setAttribute(
      'aria-describedby',
      descriptionId
    );

    const modalIcon =
      icon ||
      this.getTypeIcon(safeType);

    modal.innerHTML = `
      <div
        class="modal__overlay"
        data-modal-overlay
      ></div>

      <div
        class="
          modal__content
          modal__content--sm
        "
        role="document"
      >

        <div class="modal__header">

          <div class="modal__heading">

            ${
              modalIcon
                ? `
                  <span
                    class="
                      modal__status-icon
                      modal__status-icon--${safeType}
                    "
                    aria-hidden="true"
                  >
                    ${modalIcon}
                  </span>
                `
                : ''
            }

            <h3
              class="modal__title"
              id="${titleId}"
            >
              ${this.escape(title)}
            </h3>

          </div>

          <button
            type="button"
            class="modal__close"
            data-modal-action="close"
            aria-label="Đóng hộp thoại"
          >
            ${this.icon('close')}
          </button>

        </div>

        <div class="modal__body">

          <p
            class="modal__message"
            id="${descriptionId}"
          >
            ${this.escape(message)}
          </p>

        </div>

        <div class="modal__footer">

          <button
            type="button"
            class="btn btn--${safeType}"
            data-modal-action="confirm"
          >
            ${this.escape(buttonText)}
          </button>

        </div>

      </div>
    `;

    document.body.appendChild(modal);

    this.bindDynamicModal(modal, {
      closeOnOverlay,
      onConfirm: onClose,
      onCancel: onClose,
    });

    requestAnimationFrame(() => {
      this.open(id);
    });

    return id;
  },


  /* ============================================================
     08. BIND DYNAMIC MODAL
     ============================================================ */

  bindDynamicModal(
    modal,
    options = {}
  ) {
    const {
      closeOnOverlay = true,
      onConfirm = null,
      onCancel = null,
    } = options;

    const id = modal.id;

    const closeBtn =
      modal.querySelector(
        '[data-modal-action="close"]'
      );

    const cancelBtn =
      modal.querySelector(
        '[data-modal-action="cancel"]'
      );

    const confirmBtn =
      modal.querySelector(
        '[data-modal-action="confirm"]'
      );

    const overlay =
      modal.querySelector(
        '[data-modal-overlay]'
      );

    let finished = false;


    /* ========================================================
       CANCEL
       ======================================================== */

    const cancel = async () => {
      if (finished) return;

      finished = true;

      try {
        if (
          typeof onCancel ===
          'function'
        ) {
          await onCancel();
        }
      } catch (error) {
        console.error(
          '[ModalComponent] onCancel error:',
          error
        );
      }

      this.destroy(id);
    };


    /* ========================================================
       CONFIRM
       ======================================================== */

    const confirm = async () => {
      if (
        finished ||
        !confirmBtn
      ) {
        return;
      }

      /*
       * Ngăn click liên tục.
       */
      confirmBtn.disabled = true;
      confirmBtn.classList.add(
        'is-loading'
      );

      try {
        let result;

        if (
          typeof onConfirm ===
          'function'
        ) {
          result =
            await onConfirm();
        }

        /*
         * Callback return false:
         * giữ modal mở.
         *
         * Hữu ích khi validation hoặc
         * xử lý nghiệp vụ thất bại.
         */
        if (result === false) {
          confirmBtn.disabled =
            false;

          confirmBtn.classList.remove(
            'is-loading'
          );

          return;
        }

        finished = true;

        this.destroy(id);
      } catch (error) {
        console.error(
          '[ModalComponent] onConfirm error:',
          error
        );

        confirmBtn.disabled = false;

        confirmBtn.classList.remove(
          'is-loading'
        );
      }
    };


    /* ========================================================
       EVENTS
       ======================================================== */

    if (closeBtn) {
      closeBtn.addEventListener(
        'click',
        cancel
      );
    }

    if (cancelBtn) {
      cancelBtn.addEventListener(
        'click',
        cancel
      );
    }

    if (
      overlay &&
      closeOnOverlay
    ) {
      overlay.addEventListener(
        'click',
        cancel
      );
    }

    if (confirmBtn) {
      confirmBtn.addEventListener(
        'click',
        confirm
      );
    }

    /*
     * Lưu cancel handler để ESC có thể
     * gọi đúng callback.
     */
    modal._modalCancelHandler =
      cancel;
  },


  /* ============================================================
     09. DESTROY DYNAMIC MODAL
     ============================================================ */

  destroy(id) {
    const modal =
      document.getElementById(id);

    if (!modal) return;

    this.close(id);

    const remove = () => {
      if (
        modal &&
        modal.parentNode
      ) {
        modal.parentNode.removeChild(
          modal
        );
      }
    };

    /*
     * Chờ animation CSS kết thúc.
     */
    modal.addEventListener(
      'transitionend',
      remove,
      {
        once: true,
      }
    );

    /*
     * Fallback nếu CSS không có transition.
     */
    window.setTimeout(
      remove,
      350
    );
  },


  /* ============================================================
     10. STATIC MODALS
     ============================================================ */

  bindStaticModals() {
    document
      .querySelectorAll('.modal')
      .forEach((modal) => {
        if (
          modal.dataset.modalBound ===
          'true'
        ) {
          return;
        }

        modal.dataset.modalBound =
          'true';

        const id = modal.id;

        if (!id) {
          console.warn(
            '[ModalComponent] Static modal cần có id.',
            modal
          );

          return;
        }

        modal.setAttribute(
          'aria-hidden',
          this.isOpen(modal)
            ? 'false'
            : 'true'
        );

        /*
         * CLOSE BUTTONS
         */
        modal
          .querySelectorAll(
            '.modal__close, [data-modal-close]'
          )
          .forEach((button) => {
            button.addEventListener(
              'click',
              () => {
                this.close(id);
              }
            );
          });

        /*
         * OVERLAY
         */
        const overlay =
          modal.querySelector(
            '.modal__overlay'
          );

        if (
          overlay &&
          modal.dataset
            .closeOnOverlay !== 'false'
        ) {
          overlay.addEventListener(
            'click',
            () => {
              this.close(id);
            }
          );
        }
      });

    this.bindGlobalEscape();
  },


  /* ============================================================
     11. GLOBAL ESCAPE
     ============================================================ */

  bindGlobalEscape() {
    if (this.escapeBound) return;

    this.escapeBound = true;

    document.addEventListener(
      'keydown',
      async (event) => {
        if (
          event.key !== 'Escape'
        ) {
          return;
        }

        const modal =
          this.getTopModal();

        if (!modal) return;

        if (
          modal.dataset
            .closeOnEscape === 'false'
        ) {
          return;
        }

        event.preventDefault();

        /*
         * Dynamic modal:
         * chạy cancel callback.
         */
        if (
          typeof modal
            ._modalCancelHandler ===
          'function'
        ) {
          await modal
            ._modalCancelHandler();

          return;
        }

        this.close(modal.id);
      }
    );
  },


  /* ============================================================
     12. FOCUS MODAL
     ============================================================ */

  focusModal(modal) {
    if (!modal) return;

    const autofocus =
      modal.querySelector(
        '[autofocus]'
      );

    if (autofocus) {
      autofocus.focus();
      return;
    }

    const focusable =
      this.getFocusableElements(
        modal
      );

    if (focusable.length) {
      /*
       * Dynamic confirm ưu tiên nút cancel,
       * tránh người dùng vô tình xác nhận
       * hành động nguy hiểm bằng Enter.
       */
      const cancel =
        modal.querySelector(
          '[data-modal-action="cancel"]'
        );

      if (
        cancel &&
        !cancel.disabled
      ) {
        cancel.focus();
        return;
      }

      focusable[0].focus();
      return;
    }

    const content =
      modal.querySelector(
        '.modal__content'
      );

    if (content) {
      if (
        !content.hasAttribute(
          'tabindex'
        )
      ) {
        content.setAttribute(
          'tabindex',
          '-1'
        );
      }

      content.focus();
    }
  },


  /* ============================================================
     13. GET FOCUSABLE ELEMENTS
     ============================================================ */

  getFocusableElements(container) {
    if (!container) return [];

    const selector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');

    return Array.from(
      container.querySelectorAll(
        selector
      )
    ).filter((element) => {
      return (
        !element.hidden &&
        element.getAttribute(
          'aria-hidden'
        ) !== 'true'
      );
    });
  },


  /* ============================================================
     14. IS OPEN
     ============================================================ */

  isOpen(modal) {
    if (!modal) return false;

    return (
      modal.classList.contains(
        'active'
      ) ||
      modal.classList.contains(
        'show'
      )
    );
  },


  /* ============================================================
     15. HAS OPEN MODAL
     ============================================================ */

  hasOpenModal() {
    return Boolean(
      document.querySelector(
        '.modal.active, .modal.show'
      )
    );
  },


  /* ============================================================
     16. GET TOP MODAL
     ============================================================ */

  getTopModal() {
    /*
     * Ưu tiên stack.
     */
    for (
      let i =
        this.activeStack.length - 1;
      i >= 0;
      i -= 1
    ) {
      const modal =
        document.getElementById(
          this.activeStack[i]
        );

      if (
        modal &&
        this.isOpen(modal)
      ) {
        return modal;
      }
    }

    /*
     * Fallback nếu modal được mở
     * bằng code bên ngoài component.
     */
    const opened =
      document.querySelectorAll(
        '.modal.active, .modal.show'
      );

    return (
      opened[
        opened.length - 1
      ] || null
    );
  },


  /* ============================================================
     17. CREATE DYNAMIC ID
     ============================================================ */

  createDynamicId(prefix) {
    const random =
      Math.random()
        .toString(36)
        .slice(2, 8);

    return `${prefix}_${Date.now()}_${random}`;
  },


  /* ============================================================
     18. TYPE
     ============================================================ */

  normalizeType(type) {
    const allowed = [
      'primary',
      'danger',
      'warning',
      'success',
      'info',
    ];

    return allowed.includes(type)
      ? type
      : 'primary';
  },


  /* ============================================================
     19. TYPE ICON
     ============================================================ */

  getTypeIcon(type) {
    const map = {
      danger: 'danger',
      warning: 'warning',
      success: 'success',
      info: 'info',
      primary: 'info',
    };

    return this.icon(
      map[type] || 'info'
    );
  },


  /* ============================================================
     20. ICON SYSTEM
     100% SVG — không emoji
     ============================================================ */

  icon(name) {
    const icons = {
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

      danger: `
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
            d="M12 7.5v6"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
          />

          <circle
            cx="12"
            cy="17"
            r="1"
            fill="currentColor"
            stroke="none"
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
            stroke="none"
          />
        </svg>
      `,

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
            d="m8 12 2.6 2.6L16.5 9"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
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
            cy="7.2"
            r="1"
            fill="currentColor"
            stroke="none"
          />
        </svg>
      `,
    };

    return icons[name] || '';
  },


  /* ============================================================
     21. ESCAPE HTML
     ============================================================ */

  escape(value) {
    const text =
      value === null ||
      value === undefined
        ? ''
        : String(value);

    if (
      typeof Utils !== 'undefined' &&
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
};


/* ============================================================
   22. EXPORT GLOBAL
   ============================================================ */

if (typeof window !== 'undefined') {
  window.ModalComponent =
    ModalComponent;

  /*
   * Giữ tương thích code cũ.
   */
  window.openModal = (id) =>
    ModalComponent.open(id);

  window.closeModal = (id) =>
    ModalComponent.close(id);

  window.confirmDialog = (
    options
  ) =>
    ModalComponent.confirm(options);

  window.alertDialog = (
    options
  ) =>
    ModalComponent.alert(options);
}


/* ============================================================
   23. AUTO INIT
   ============================================================ */

if (typeof document !== 'undefined') {
  const init = () => {
    ModalComponent.bindStaticModals();
  };

  if (
    document.readyState ===
    'loading'
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