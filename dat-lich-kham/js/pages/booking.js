/* ============================================================
   PAGE — BOOKING
   MediCare
   ------------------------------------------------------------
   Dùng chung:
   - pages/booking/create.html
   - pages/booking/success.html
   ============================================================ */

const BookingPage = {
  doctor: null,
  currentUser: null,
  isSubmitting: false,

  /* ============================================================
     INIT
     ============================================================ */

  init() {
    this.initCreatePage();
    this.initSuccessPage();
  },

  /* ============================================================
     CREATE PAGE
     ============================================================ */

  initCreatePage() {
    const form = document.getElementById('bookingForm');

    // Không phải trang create
    if (!form) return;

    /* ----------------------------------------------------------
       1. Kiểm tra đăng nhập
       ---------------------------------------------------------- */

    const user = AuthService.requireLogin();

    if (!user) return;

    this.currentUser = user;

    /* ----------------------------------------------------------
       2. Lấy bác sĩ từ URL
       create.html?doctorId=...
       ---------------------------------------------------------- */

    const doctorId = Utils.getQueryParam('doctorId');

    if (!doctorId) {
      this.handleDoctorNotFound();
      return;
    }

    this.doctor = DoctorService.getById(doctorId);

    if (!this.doctor) {
      this.handleDoctorNotFound();
      return;
    }

    /* ----------------------------------------------------------
       3. Khởi tạo giao diện
       ---------------------------------------------------------- */

    this.renderDoctorInfo();
    this.fillUserInfo(user);
    this.setDateRange();
    this.bindCreateEvents();
    this.updateSummary();
    this.updateNoteCounter();
  },

  /* ============================================================
     DOCTOR INFO
     ============================================================ */

  renderDoctorInfo() {
    if (!this.doctor) return;

    const d = this.doctor;

    this.setText(
      'doctorName',
      d.name || 'Bác sĩ MediCare'
    );

    this.setText(
      'doctorSpecialty',
      d.specialty || 'Chưa cập nhật chuyên khoa'
    );

    this.setText(
      'doctorPrice',
      this.formatPrice(d.price)
    );

    /* ----------------------------------------------------------
       Avatar
       ---------------------------------------------------------- */

    const avatar = document.getElementById('doctorAvatar');

    if (avatar) {
      avatar.innerHTML = '';

      const image =
        d.image ||
        d.avatar ||
        d.photo ||
        '';

      if (image) {
        const img = document.createElement('img');

        img.src = image;
        img.alt = d.name || 'Bác sĩ';
        img.loading = 'lazy';

        img.addEventListener('error', () => {
          avatar.innerHTML = this.getDoctorFallbackIcon();
        });

        avatar.appendChild(img);
      } else {
        avatar.innerHTML = this.getDoctorFallbackIcon();
      }
    }

    /* ----------------------------------------------------------
       Summary
       ---------------------------------------------------------- */

    this.setText(
      'summaryDoctor',
      d.name || '—'
    );

    this.setText(
      'summarySpecialty',
      d.specialty || '—'
    );

    this.setText(
      'summaryPrice',
      this.formatPrice(d.price)
    );
  },

  /* ============================================================
     USER INFO
     ============================================================ */

  fillUserInfo(user) {
    if (!user) return;

    this.setValue(
      'bkName',
      user.name || user.fullName || ''
    );

    this.setValue(
      'bkPhone',
      user.phone || ''
    );

    this.setValue(
      'bkAddress',
      user.address || ''
    );

    this.setValue(
      'bkGender',
      user.gender || ''
    );

    this.setValue(
      'bkBirthday',
      user.birthday || user.dateOfBirth || ''
    );

    this.updateSummary();
  },

  /* ============================================================
     DATE RANGE
     ============================================================ */

  setDateRange() {
    const dateInput =
      document.getElementById('bkDate');

    if (!dateInput) return;

    const bookingConfig =
      typeof CONFIG !== 'undefined' &&
      CONFIG.BOOKING
        ? CONFIG.BOOKING
        : {};

    const minAdvanceHours =
      Number(bookingConfig.MIN_ADVANCE_HOURS) || 24;

    const maxAdvanceDays =
      Number(bookingConfig.MAX_ADVANCE_DAYS) || 30;

    const now = new Date();

    /* ----------------------------------------------------------
       Ngày sớm nhất
       ---------------------------------------------------------- */

    const minDate = new Date(
      now.getTime() +
      minAdvanceHours * 60 * 60 * 1000
    );

    /* ----------------------------------------------------------
       Ngày xa nhất
       ---------------------------------------------------------- */

    const maxDate = new Date();

    maxDate.setDate(
      maxDate.getDate() + maxAdvanceDays
    );

    dateInput.min =
      this.toDateInputValue(minDate);

    dateInput.max =
      this.toDateInputValue(maxDate);

    /* ----------------------------------------------------------
       Nếu value hiện tại không hợp lệ → reset
       ---------------------------------------------------------- */

    if (dateInput.value) {
      if (
        dateInput.value < dateInput.min ||
        dateInput.value > dateInput.max
      ) {
        dateInput.value = '';
      }
    }
  },

  /* ============================================================
     EVENTS
     ============================================================ */

  bindCreateEvents() {
    const form =
      document.getElementById('bookingForm');

    if (!form) return;

    /* ----------------------------------------------------------
       Date
       ---------------------------------------------------------- */

    const dateInput =
      document.getElementById('bkDate');

    if (dateInput) {
      dateInput.addEventListener(
        'change',
        () => {
          this.clearFieldError('bkDate');

          this.updateTimeSlots(
            dateInput.value
          );

          this.updateSummary();
        }
      );
    }

    /* ----------------------------------------------------------
       Time slots
       Dùng event delegation vì slots render lại bằng JS
       ---------------------------------------------------------- */

    const timeSlots =
      document.getElementById('timeSlots');

    if (timeSlots) {
      timeSlots.addEventListener(
        'change',
        (event) => {
          if (
            event.target.matches(
              'input[name="time"]'
            )
          ) {
            this.clearFieldError('time');
            this.updateSummary();
          }
        }
      );
    }

    /* ----------------------------------------------------------
       Patient name
       ---------------------------------------------------------- */

    const nameInput =
      document.getElementById('bkName');

    if (nameInput) {
      nameInput.addEventListener(
        'input',
        () => {
          this.clearFieldError('bkName');
          this.updateSummary();
        }
      );
    }

    /* ----------------------------------------------------------
       Phone
       ---------------------------------------------------------- */

    const phoneInput =
      document.getElementById('bkPhone');

    if (phoneInput) {
      phoneInput.addEventListener(
        'input',
        () => {
          /*
           * Giữ số điện thoại ở dạng số.
           * Không cho vượt quá maxlength.
           */
          phoneInput.value =
            phoneInput.value.replace(/\D/g, '');

          this.clearFieldError('bkPhone');
        }
      );
    }

    /* ----------------------------------------------------------
       Note counter
       ---------------------------------------------------------- */

    const note =
      document.getElementById('bkNote');

    if (note) {
      note.addEventListener(
        'input',
        () => {
          this.updateNoteCounter();
        }
      );
    }

    /* ----------------------------------------------------------
       Payment
       ---------------------------------------------------------- */

    const paymentInputs =
      form.querySelectorAll(
        'input[name="payment"]'
      );

    paymentInputs.forEach((input) => {
      input.addEventListener(
        'change',
        () => {
          this.updatePaymentUI();
        }
      );
    });

    this.updatePaymentUI();

    /* ----------------------------------------------------------
       Submit
       ---------------------------------------------------------- */

    form.addEventListener(
      'submit',
      (event) => {
        event.preventDefault();

        this.submitBooking();
      }
    );
  },

  /* ============================================================
     TIME SLOTS
     ============================================================ */

  updateTimeSlots(date) {
    const container =
      document.getElementById('timeSlots');

    if (!container) return;

    if (!date || !this.doctor) {
      container.innerHTML =
        this.getTimeSlotPlaceholder(
          'Vui lòng chọn ngày khám.'
        );

      return;
    }

    /* ----------------------------------------------------------
       Kiểm tra ngày
       ---------------------------------------------------------- */

    const dateInput =
      document.getElementById('bkDate');

    if (
      dateInput &&
      (
        date < dateInput.min ||
        date > dateInput.max
      )
    ) {
      container.innerHTML =
        this.getTimeSlotPlaceholder(
          'Ngày khám không hợp lệ.'
        );

      return;
    }

    /* ----------------------------------------------------------
       Loading
       ---------------------------------------------------------- */

    container.innerHTML = `
      <div class="booking-time-loading">
        <span class="booking-time-loading__spinner"></span>
        <span>Đang kiểm tra lịch trống...</span>
      </div>
    `;

    try {
      const slots =
        BookingService.getAvailableSlots(
          this.doctor.id,
          date
        ) || [];

      if (!Array.isArray(slots) || !slots.length) {
        container.innerHTML =
          this.getTimeSlotPlaceholder(
            'Bác sĩ chưa có lịch khám khả dụng trong ngày này.'
          );

        this.updateSummary();
        return;
      }

      const availableCount =
        slots.filter(
          (slot) => slot.available !== false
        ).length;

      if (!availableCount) {
        container.innerHTML =
          this.getTimeSlotPlaceholder(
            'Các khung giờ trong ngày này đã hết. Vui lòng chọn ngày khác.'
          );

        this.updateSummary();
        return;
      }

      container.innerHTML =
        slots
          .map((slot) => {
            const time =
              Utils.escapeHtml(
                String(slot.time || '')
              );

            const available =
              slot.available !== false;

            return `
              <label
                class="time-slot ${
                  available
                    ? ''
                    : 'disabled'
                }"
              >
                <input
                  type="radio"
                  name="time"
                  value="${time}"
                  ${
                    available
                      ? ''
                      : 'disabled'
                  }
                  required
                >

                <span>
                  ${time}
                </span>
              </label>
            `;
          })
          .join('');

      this.updateSummary();

    } catch (error) {
      console.error(
        '[BookingPage] Không thể tải time slots:',
        error
      );

      container.innerHTML =
        this.getTimeSlotPlaceholder(
          'Không thể tải lịch trống. Vui lòng thử lại.'
        );
    }
  },

  getTimeSlotPlaceholder(message) {
    return `
      <div class="booking-time-empty">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            stroke-width="1.7"
          />

          <path
            d="M12 7V12L15 14"
            stroke="currentColor"
            stroke-width="1.7"
            stroke-linecap="round"
          />
        </svg>

        <span>
          ${Utils.escapeHtml(message)}
        </span>
      </div>
    `;
  },

  /* ============================================================
     SUMMARY
     ============================================================ */

  updateSummary() {
    const date =
      document.getElementById('bkDate')
        ?.value || '';

    const selectedTime =
      document.querySelector(
        'input[name="time"]:checked'
      );

    const patientName =
      document.getElementById('bkName')
        ?.value
        ?.trim() || '';

    this.setText(
      'summaryDate',
      date
        ? this.safeFormatDate(date)
        : '—'
    );

    this.setText(
      'summaryTime',
      selectedTime
        ? selectedTime.value
        : '—'
    );

    this.setText(
      'summaryPatient',
      patientName || '—'
    );

    if (this.doctor) {
      this.setText(
        'summaryPrice',
        this.formatPrice(
          this.doctor.price
        )
      );
    }
  },

  /* ============================================================
     PAYMENT UI
     ============================================================ */

  updatePaymentUI() {
    const methods =
      document.querySelectorAll(
        '.payment-method'
      );

    methods.forEach((method) => {
      const input =
        method.querySelector(
          'input[name="payment"]'
        );

      method.classList.toggle(
        'is-selected',
        Boolean(input?.checked)
      );
    });
  },

  /* ============================================================
     NOTE COUNTER
     ============================================================ */

  updateNoteCounter() {
    const note =
      document.getElementById('bkNote');

    const counter =
      document.getElementById(
        'bkNoteCounter'
      );

    if (!note || !counter) return;

    const max =
      Number(note.maxLength) > 0
        ? Number(note.maxLength)
        : 500;

    counter.textContent =
      `${note.value.length}/${max}`;
  },

  /* ============================================================
     SUBMIT BOOKING
     ============================================================ */

  submitBooking() {
    if (this.isSubmitting) return;

    const form =
      document.getElementById(
        'bookingForm'
      );

    if (!form || !this.doctor) return;

    /* ----------------------------------------------------------
       Reset errors
       ---------------------------------------------------------- */

    this.clearErrors();

    /* ----------------------------------------------------------
       Validator của project
       ---------------------------------------------------------- */

    let validation = {
      valid: true,
      errors: {}
    };

    if (
      typeof Validator !== 'undefined' &&
      typeof Validator.validateForm === 'function'
    ) {
      validation =
        Validator.validateForm(form);
    }

    /* ----------------------------------------------------------
       Validation bổ sung cho booking
       ---------------------------------------------------------- */

    const customValidation =
      this.validateBookingForm();

    if (!customValidation.valid) {
      validation.valid = false;

      validation.errors = {
        ...(validation.errors || {}),
        ...customValidation.errors
      };
    }

    if (!validation.valid) {
      if (
        typeof Validator !== 'undefined' &&
        typeof Validator.showErrors === 'function'
      ) {
        Validator.showErrors(
          form,
          validation.errors
        );
      }

      this.showCustomErrors(
        validation.errors
      );

      this.notify(
        'error',
        'Vui lòng kiểm tra lại thông tin đặt lịch.'
      );

      this.focusFirstError(
        validation.errors
      );

      return;
    }

    /* ----------------------------------------------------------
       Form data
       ---------------------------------------------------------- */

    let data = {};

    if (
      typeof Validator !== 'undefined' &&
      typeof Validator.getFormData === 'function'
    ) {
      data =
        Validator.getFormData(form);
    } else {
      data =
        Object.fromEntries(
          new FormData(form).entries()
        );
    }

    /* ----------------------------------------------------------
       Payload
       ---------------------------------------------------------- */

    const payload = {
      doctorId: this.doctor.id,

      date:
        String(data.date || '').trim(),

      time:
        String(data.time || '').trim(),

      patientName:
        String(
          data.patientName || ''
        ).trim(),

      phone:
        String(
          data.phone || ''
        ).replace(/\s+/g, ''),

      gender:
        String(
          data.gender || ''
        ),

      birthday:
        String(
          data.birthday || ''
        ),

      address:
        String(
          data.address || ''
        ).trim(),

      note:
        String(
          data.note || ''
        ).trim(),

      payment:
        String(
          data.payment || 'cod'
        )
    };

    /* ----------------------------------------------------------
       Loading
       ---------------------------------------------------------- */

    this.setSubmitLoading(true);

    try {
      const result =
        BookingService.create(payload);

      if (!result?.success) {
        this.notify(
          'error',
          result?.message ||
          'Không thể đặt lịch. Vui lòng thử lại.'
        );

        this.setSubmitLoading(false);
        return;
      }

      const booking =
        result.booking;

      if (!booking?.id) {
        this.notify(
          'error',
          'Đặt lịch thành công nhưng không thể xác định mã lịch khám.'
        );

        this.setSubmitLoading(false);
        return;
      }

      /* --------------------------------------------------------
         Lưu booking cuối cùng
         -------------------------------------------------------- */

      sessionStorage.setItem(
        'last_booking_id',
        String(booking.id)
      );

      this.notify(
        'success',
        'Đặt lịch thành công!'
      );

      /* --------------------------------------------------------
         Redirect
         -------------------------------------------------------- */

      window.setTimeout(() => {
        Utils.redirect(
          'success.html'
        );
      }, 650);

    } catch (error) {
      console.error(
        '[BookingPage] Create booking error:',
        error
      );

      this.notify(
        'error',
        'Có lỗi xảy ra khi đặt lịch. Vui lòng thử lại.'
      );

      this.setSubmitLoading(false);
    }
  },

  /* ============================================================
     CUSTOM VALIDATION
     ============================================================ */

  validateBookingForm() {
    const errors = {};

    const date =
      document.getElementById('bkDate')
        ?.value || '';

    const time =
      document.querySelector(
        'input[name="time"]:checked'
      )?.value || '';

    const name =
      document.getElementById('bkName')
        ?.value
        ?.trim() || '';

    const phone =
      document.getElementById('bkPhone')
        ?.value
        ?.trim() || '';

    /* ----------------------------------------------------------
       Date
       ---------------------------------------------------------- */

    if (!date) {
      errors.bkDate =
        'Vui lòng chọn ngày khám.';
    } else {
      const dateInput =
        document.getElementById('bkDate');

      if (
        dateInput?.min &&
        date < dateInput.min
      ) {
        errors.bkDate =
          'Ngày khám sớm hơn thời gian cho phép.';
      }

      if (
        dateInput?.max &&
        date > dateInput.max
      ) {
        errors.bkDate =
          'Ngày khám vượt quá thời gian cho phép.';
      }
    }

    /* ----------------------------------------------------------
       Time
       ---------------------------------------------------------- */

    if (!time) {
      errors.time =
        'Vui lòng chọn khung giờ khám.';
    }

    /* ----------------------------------------------------------
       Name
       ---------------------------------------------------------- */

    if (!name) {
      errors.bkName =
        'Vui lòng nhập họ và tên.';
    } else if (name.length < 2) {
      errors.bkName =
        'Họ và tên chưa hợp lệ.';
    }

    /* ----------------------------------------------------------
       Phone
       ---------------------------------------------------------- */

    const normalizedPhone =
      phone.replace(/\D/g, '');

    if (!normalizedPhone) {
      errors.bkPhone =
        'Vui lòng nhập số điện thoại.';
    } else if (
      !/^0\d{9}$/.test(normalizedPhone)
    ) {
      errors.bkPhone =
        'Số điện thoại phải gồm 10 số và bắt đầu bằng 0.';
    }

    return {
      valid:
        Object.keys(errors).length === 0,

      errors
    };
  },

  /* ============================================================
     VALIDATION UI
     ============================================================ */

  showCustomErrors(errors = {}) {
    Object.entries(errors).forEach(
      ([key, message]) => {
        const errorElement =
          document.querySelector(
            `[data-error-for="${key}"]`
          );

        if (errorElement) {
          errorElement.textContent =
            message || '';
        }

        let input = null;

        if (key === 'time') {
          input =
            document.querySelector(
              'input[name="time"]'
            );
        } else {
          input =
            document.getElementById(key);
        }

        if (input) {
          input.setAttribute(
            'aria-invalid',
            'true'
          );

          input
            .closest('.booking-input')
            ?.classList
            .add('is-invalid');
        }
      }
    );
  },

  clearErrors() {
    document
      .querySelectorAll(
        '.booking-field__error'
      )
      .forEach((element) => {
        element.textContent = '';
      });

    document
      .querySelectorAll(
        '[aria-invalid="true"]'
      )
      .forEach((element) => {
        element.removeAttribute(
          'aria-invalid'
        );
      });

    document
      .querySelectorAll(
        '.booking-input.is-invalid'
      )
      .forEach((element) => {
        element.classList.remove(
          'is-invalid'
        );
      });
  },

  clearFieldError(key) {
    const error =
      document.querySelector(
        `[data-error-for="${key}"]`
      );

    if (error) {
      error.textContent = '';
    }

    const input =
      key === 'time'
        ? document.querySelector(
            'input[name="time"]'
          )
        : document.getElementById(key);

    input?.removeAttribute(
      'aria-invalid'
    );

    input
      ?.closest('.booking-input')
      ?.classList
      .remove('is-invalid');
  },

  focusFirstError(errors = {}) {
    const firstKey =
      Object.keys(errors)[0];

    if (!firstKey) return;

    let element = null;

    if (firstKey === 'time') {
      element =
        document.getElementById(
          'timeSlots'
        );
    } else {
      element =
        document.getElementById(
          firstKey
        );
    }

    if (!element) return;

    element.scrollIntoView({
      behavior:
        this.prefersReducedMotion()
          ? 'auto'
          : 'smooth',

      block: 'center'
    });

    if (
      typeof element.focus ===
      'function'
    ) {
      window.setTimeout(
        () => element.focus(),
        250
      );
    }
  },

  /* ============================================================
     SUBMIT LOADING
     ============================================================ */

  setSubmitLoading(loading) {
    this.isSubmitting = loading;

    const button =
      document.getElementById(
        'bookingSubmit'
      );

    if (!button) return;

    button.disabled = loading;

    button.classList.toggle(
      'is-loading',
      loading
    );

    const text =
      button.querySelector(
        '.booking-submit__text'
      );

    const icon =
      button.querySelector(
        '.booking-submit__icon'
      );

    if (text) {
      text.textContent =
        loading
          ? 'Đang đặt lịch...'
          : 'Xác nhận đặt lịch';
    }

    if (icon) {
      icon.innerHTML =
        loading
          ? `
            <span
              class="booking-submit-spinner"
              aria-hidden="true"
            ></span>
          `
          : `
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M20 6L9 17L4 12"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          `;
    }
  },

  /* ============================================================
     SUCCESS PAGE
     ============================================================ */

  initSuccessPage() {
    /*
     * Hỗ trợ cả HTML success cũ (.success-box)
     * và HTML success mới (.booking-success-page).
     */

    const successPage =
      document.querySelector(
        '.booking-success-page'
      ) ||
      document.querySelector(
        '.success-box'
      ) ||
      document.getElementById(
        'bookingCode'
      );

    if (!successPage) return;

    const bookingId =
      sessionStorage.getItem(
        'last_booking_id'
      );

    if (!bookingId) {
      this.redirectToHistory();
      return;
    }

    let booking = null;

    try {
      booking =
        BookingService.getById(
          bookingId
        );
    } catch (error) {
      console.error(
        '[BookingPage] Get booking error:',
        error
      );
    }

    if (!booking) {
      sessionStorage.removeItem(
        'last_booking_id'
      );

      this.redirectToHistory();
      return;
    }

    this.renderSuccess(booking);
    this.bindSuccessEvents(booking);

    /*
     * Không xóa ngay.
     * Nếu refresh success.html vẫn còn dữ liệu.
     * sessionStorage tự mất khi đóng tab.
     */
  },

  /* ============================================================
     RENDER SUCCESS
     ============================================================ */

  renderSuccess(booking) {
    const b = booking;

    const bookingCode =
      b.code ||
      b.bookingCode ||
      this.createBookingCode(b.id);

    this.setText(
      'bookingCode',
      bookingCode
    );

    this.setText(
      'sdDoctor',
      b.doctorName ||
      this.doctor?.name ||
      '—'
    );

    this.setText(
      'sdSpecialty',
      b.specialty ||
      b.specialtyName ||
      '—'
    );

    this.setText(
      'sdDate',
      b.date
        ? this.safeFormatDate(b.date)
        : '—'
    );

    this.setText(
      'sdTime',
      b.time || '—'
    );

    this.setText(
      'sdPatient',
      b.patientName || '—'
    );

    this.setText(
      'sdPhone',
      b.phone || '—'
    );

    this.setText(
      'sdPayment',
      this.getPaymentLabel(
        b.payment
      )
    );

    this.setText(
      'sdPrice',
      this.formatPrice(b.price)
    );

    /* ----------------------------------------------------------
       Optional status
       ---------------------------------------------------------- */

    const status =
      document.getElementById(
        'bookingStatus'
      );

    if (status) {
      status.textContent =
        this.getStatusLabel(
          b.status
        );
    }
  },

  /* ============================================================
     SUCCESS EVENTS
     ============================================================ */

  bindSuccessEvents(booking) {
    const copyButton =
      document.getElementById(
        'copyBookingCode'
      );

    if (!copyButton) return;

    copyButton.addEventListener(
      'click',
      async () => {
        const code =
          document.getElementById(
            'bookingCode'
          )?.textContent || '';

        if (!code) return;

        const success =
          await this.copyText(code);

        if (!success) {
          this.notify(
            'error',
            'Không thể sao chép mã đặt lịch.'
          );

          return;
        }

        copyButton.classList.add(
          'is-copied'
        );

        copyButton.setAttribute(
          'aria-label',
          'Đã sao chép mã đặt lịch'
        );

        this.notify(
          'success',
          'Đã sao chép mã đặt lịch.'
        );

        window.setTimeout(() => {
          copyButton.classList.remove(
            'is-copied'
          );

          copyButton.setAttribute(
            'aria-label',
            'Sao chép mã đặt lịch'
          );
        }, 1500);
      }
    );
  },

  /* ============================================================
     DOCTOR NOT FOUND
     ============================================================ */

  handleDoctorNotFound() {
    this.notify(
      'error',
      'Không tìm thấy bác sĩ. Vui lòng chọn lại.'
    );

    window.setTimeout(() => {
      Utils.redirect(
        '../doctors/list.html'
      );
    }, 1200);
  },

  /* ============================================================
     REDIRECT
     ============================================================ */

  redirectToHistory() {
    Utils.redirect(
      'history.html'
    );
  },

  /* ============================================================
     PAYMENT LABEL
     ============================================================ */

  getPaymentLabel(payment) {
    const labels = {
      cod:
        'Thanh toán tại phòng khám',

      banking:
        'Chuyển khoản ngân hàng',

      ewallet:
        'Ví điện tử'
    };

    if (
      typeof CONFIG !== 'undefined' &&
      CONFIG.PAYMENT_METHOD_LABEL &&
      CONFIG.PAYMENT_METHOD_LABEL[
        payment
      ]
    ) {
      return (
        CONFIG.PAYMENT_METHOD_LABEL[
          payment
        ]
      );
    }

    return (
      labels[payment] ||
      'Thanh toán tại phòng khám'
    );
  },

  /* ============================================================
     STATUS LABEL
     ============================================================ */

  getStatusLabel(status) {
    const labels = {
      pending:
        'Chờ xác nhận',

      confirmed:
        'Đã xác nhận',

      completed:
        'Đã khám',

      cancelled:
        'Đã hủy'
    };

    return (
      labels[status] ||
      'Chờ xác nhận'
    );
  },

  /* ============================================================
     BOOKING CODE
     ============================================================ */

  createBookingCode(id) {
    if (!id) return '#BK000000';

    const raw =
      String(id)
        .replace(/[^a-zA-Z0-9]/g, '')
        .slice(-6)
        .toUpperCase();

    return (
      '#BK' +
      raw.padStart(6, '0')
    );
  },

  /* ============================================================
     FORMAT
     ============================================================ */

  formatPrice(value) {
    const price =
      Number(value) || 0;

    if (
      typeof Utils !== 'undefined' &&
      typeof Utils.formatCurrency ===
        'function'
    ) {
      return Utils.formatCurrency(
        price
      );
    }

    return new Intl.NumberFormat(
      'vi-VN',
      {
        style: 'currency',
        currency: 'VND'
      }
    ).format(price);
  },

  safeFormatDate(date) {
    if (!date) return '—';

    if (
      typeof Utils !== 'undefined' &&
      typeof Utils.formatDate ===
        'function'
    ) {
      return Utils.formatDate(date);
    }

    const parts =
      String(date).split('-');

    if (parts.length === 3) {
      return (
        `${parts[2]}/${parts[1]}/${parts[0]}`
      );
    }

    return date;
  },

  toDateInputValue(date) {
    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1
      ).padStart(2, '0');

    const day =
      String(
        date.getDate()
      ).padStart(2, '0');

    return `${year}-${month}-${day}`;
  },

  /* ============================================================
     FALLBACK AVATAR
     ============================================================ */

  getDoctorFallbackIcon() {
    return `
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="7"
          r="4"
          stroke="currentColor"
          stroke-width="1.5"
        />

        <path
          d="M4.5 21C4.5 16.8579 7.85786 13.5 12 13.5C16.1421 13.5 19.5 16.8579 19.5 21"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
        />

        <path
          d="M18 9V15M15 12H21"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
        />
      </svg>
    `;
  },

  /* ============================================================
     COPY
     ============================================================ */

  async copyText(text) {
    try {
      if (
        navigator.clipboard &&
        window.isSecureContext
      ) {
        await navigator.clipboard.writeText(
          text
        );

        return true;
      }

      const textarea =
        document.createElement(
          'textarea'
        );

      textarea.value = text;

      textarea.style.position =
        'fixed';

      textarea.style.opacity =
        '0';

      document.body.appendChild(
        textarea
      );

      textarea.select();

      const success =
        document.execCommand('copy');

      textarea.remove();

      return success;

    } catch (error) {
      console.error(
        '[BookingPage] Copy error:',
        error
      );

      return false;
    }
  },

  /* ============================================================
     NOTIFICATION
     ============================================================ */

  notify(type, message) {
    /*
     * Hỗ trợ cả:
     * toast.success(...)
     * Toast.success(...)
     */

    const instance =
      typeof toast !== 'undefined'
        ? toast
        : (
            typeof Toast !== 'undefined'
              ? Toast
              : null
          );

    if (
      instance &&
      typeof instance[type] ===
        'function'
    ) {
      instance[type](message);
      return;
    }

    console[
      type === 'error'
        ? 'error'
        : 'log'
    ](message);
  },

  /* ============================================================
     DOM HELPERS
     ============================================================ */

  setText(id, text) {
    const element =
      document.getElementById(id);

    if (!element) return;

    element.textContent =
      text ?? '—';
  },

  setValue(id, value) {
    const element =
      document.getElementById(id);

    if (!element) return;

    element.value =
      value ?? '';
  },

  prefersReducedMotion() {
    return (
      window.matchMedia &&
      window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches
    );
  }
};


/* ============================================================
   AUTO INIT
   ============================================================ */

if (typeof window !== 'undefined') {
  window.BookingPage =
    BookingPage;

  document.addEventListener(
    'DOMContentLoaded',
    () => {
      BookingPage.init();
    }
  );
}