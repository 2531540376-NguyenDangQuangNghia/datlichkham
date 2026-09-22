/* ============================================================
   PAGE — DOCTOR DETAIL
   MediCare
   pages/doctors/detail.html
   ============================================================ */

const DoctorDetailPage = {
  doctor: null,

  /* ==========================================================
     INIT
     ========================================================== */

  init() {
    const detail = document.getElementById('doctorDetail');

    // Không phải detail.html
    if (!detail) return;

    const id = this.getQueryParam('id');

    if (!id) {
      this.showNotFound();
      return;
    }

    try {
      this.doctor = DoctorService.getById(id);
    } catch (error) {
      console.error(
        '[DoctorDetailPage] Không thể tải bác sĩ:',
        error
      );

      this.showNotFound();
      return;
    }

    if (!this.doctor) {
      this.showNotFound();
      return;
    }

    this.render();
    this.renderRelated();
    this.bindEvents();
  },

  /* ==========================================================
     MAIN RENDER
     ========================================================== */

  render() {
    const loading =
      document.getElementById('loading');

    const detail =
      document.getElementById('doctorDetail');

    const notFound =
      document.getElementById('notFound');

    if (loading) {
      loading.style.display = 'none';
    }

    if (notFound) {
      notFound.style.display = 'none';
    }

    if (detail) {
      detail.style.display = 'block';
    }

    const doctor = this.doctor;

    /* Breadcrumb */

    this.setText(
      'breadcrumbName',
      doctor.name || 'Chi tiết bác sĩ'
    );

    /* Document title */

    document.title =
      `${doctor.name || 'Bác sĩ'} – MediCare`;

    /* Avatar */

    this.renderAvatar(doctor);

    /* Basic info */

    this.setText(
      'doctorName',
      doctor.name || 'Bác sĩ'
    );

    this.setText(
      'doctorSpecialty',
      doctor.specialty || 'Chuyên khoa'
    );

    this.setText(
      'doctorDegree',
      this.getDegreeText(doctor)
    );

    /* Meta */

    this.setText(
      'doctorRating',
      this.formatRating(doctor.rating)
    );

    this.setText(
      'doctorExperience',
      `${Number(doctor.experience || 0)} năm`
    );

    this.setText(
      'doctorPatients',
      this.formatPatientCount(
        doctor.patientCount
      )
    );

    /* Price */

    this.setText(
      'doctorPrice',
      this.formatCurrency(doctor.price)
    );

    /* Bio */

    this.setText(
      'doctorBio',
      doctor.bio ||
        'Thông tin giới thiệu của bác sĩ đang được cập nhật.'
    );

    /* Qualifications */

    this.renderList(
      'doctorQualifications',
      doctor.qualifications,
      'Thông tin bằng cấp đang được cập nhật.'
    );

    /* Expertise */

    this.renderList(
      'doctorExpertise',
      doctor.expertise,
      'Thông tin chuyên môn đang được cập nhật.'
    );

    /* Address */

    this.renderAddress(doctor);

    /* Schedule */

    this.renderSchedule(doctor);

    /* Reviews */

    this.renderReviews(doctor);

    /* Booking */

    this.renderBookingLinks(doctor);

    /* Favorite */

    this.updateFavoriteButton();
  },

  /* ==========================================================
     AVATAR
     ========================================================== */

  renderAvatar(doctor) {
    const avatar =
      document.getElementById('doctorAvatar');

    if (!avatar) return;

    const image =
      doctor.image ||
      doctor.avatar ||
      doctor.photo ||
      '';

    if (image) {
      avatar.innerHTML = `
        <img
          src="${this.escapeAttribute(image)}"
          alt="${this.escapeAttribute(doctor.name || 'Bác sĩ')}"
          loading="eager"
        >

        <span
          class="doctor-avatar-fallback"
          aria-hidden="true"
          style="display:none"
        >
          ${this.doctorIcon(78)}
        </span>
      `;

      const img =
        avatar.querySelector('img');

      const fallback =
        avatar.querySelector(
          '.doctor-avatar-fallback'
        );

      img?.addEventListener(
        'error',
        () => {
          img.style.display = 'none';

          if (fallback) {
            fallback.style.display =
              'flex';
          }
        },
        { once: true }
      );

      return;
    }

    avatar.innerHTML = `
      <span
        class="doctor-avatar-fallback"
        aria-hidden="true"
      >
        ${this.doctorIcon(78)}
      </span>
    `;
  },

  /* ==========================================================
     DEGREE
     ========================================================== */

  getDegreeText(doctor) {
    const parts = [];

    if (doctor.degree) {
      parts.push(doctor.degree);
    }

    const experience =
      Number(doctor.experience || 0);

    if (experience > 0) {
      parts.push(
        `${experience} năm kinh nghiệm`
      );
    }

    return parts.length
      ? parts.join(' · ')
      : 'Thông tin chuyên môn đang được cập nhật';
  },

  /* ==========================================================
     QUALIFICATIONS / EXPERTISE
     ========================================================== */

  renderList(
    elementId,
    items,
    emptyMessage
  ) {
    const element =
      document.getElementById(elementId);

    if (!element) return;

    const data =
      Array.isArray(items)
        ? items.filter(Boolean)
        : [];

    if (!data.length) {
      element.innerHTML = `
        <li>${this.escapeHtml(emptyMessage)}</li>
      `;

      return;
    }

    element.innerHTML =
      data
        .map(
          (item) => `
            <li>
              ${this.escapeHtml(item)}
            </li>
          `
        )
        .join('');
  },

  /* ==========================================================
     ADDRESS
     ========================================================== */

  renderAddress(doctor) {
    const element =
      document.getElementById(
        'doctorAddress'
      );

    if (!element) return;

    const hospital =
      doctor.hospital || '';

    const address =
      doctor.address ||
      'Địa chỉ đang được cập nhật.';

    element.innerHTML = `
      ${
        hospital
          ? `
            <strong>
              ${this.escapeHtml(hospital)}
            </strong>
          `
          : ''
      }

      <span>
        ${this.escapeHtml(address)}
      </span>
    `;
  },

  /* ==========================================================
     SCHEDULE
     ========================================================== */

  renderSchedule(doctor) {
    const element =
      document.getElementById(
        'doctorSchedule'
      );

    if (!element) return;

    const days = [
      'Chủ nhật',
      'Thứ 2',
      'Thứ 3',
      'Thứ 4',
      'Thứ 5',
      'Thứ 6',
      'Thứ 7',
    ];

    const workDays =
      Array.isArray(doctor.workDays)
        ? doctor.workDays.map(Number)
        : [];

    const workStart =
      doctor.workStart || '08:00';

    const workEnd =
      doctor.workEnd || '17:00';

    element.innerHTML =
      days
        .map((day, index) => {
          const isWork =
            workDays.includes(index);

          return `
            <div class="doctor-schedule__item">

              <strong class="doctor-schedule__day">
                ${day}
              </strong>

              <span
                class="doctor-schedule__time ${
                  !isWork
                    ? 'doctor-schedule__time--off'
                    : ''
                }"
              >
                ${
                  isWork
                    ? `${this.escapeHtml(workStart)} – ${this.escapeHtml(workEnd)}`
                    : 'Nghỉ'
                }
              </span>

            </div>
          `;
        })
        .join('');
  },

  /* ==========================================================
     REVIEWS
     ========================================================== */

  renderReviews(doctor) {
    const rating =
      Math.max(
        0,
        Math.min(
          5,
          Number(doctor.rating || 0)
        )
      );

    const reviewCount =
      Number(
        doctor.reviewCount || 0
      );

    this.setText(
      'reviewScore',
      rating.toFixed(1)
    );

    const stars =
      document.getElementById(
        'reviewStars'
      );

    if (stars) {
      stars.innerHTML =
        this.renderStars(rating);
    }

    this.setText(
      'reviewCount',
      `${reviewCount} đánh giá`
    );

    const reviewList =
      document.getElementById(
        'reviewList'
      );

    if (!reviewList) return;

    /*
     * Nếu data/doctors.js sau này có reviews thật,
     * JS sẽ ưu tiên sử dụng.
     */

    const reviews =
      Array.isArray(doctor.reviews) &&
      doctor.reviews.length
        ? doctor.reviews
        : this.getDemoReviews();

    reviewList.innerHTML =
      reviews
        .map(
          (review) =>
            this.renderReviewItem(review)
        )
        .join('');
  },

  renderReviewItem(review) {
    const name =
      review.name ||
      review.userName ||
      'Bệnh nhân MediCare';

    const date =
      review.date ||
      'Gần đây';

    const rating =
      Math.max(
        0,
        Math.min(
          5,
          Number(review.rating || 5)
        )
      );

    const content =
      review.content ||
      review.comment ||
      '';

    return `
      <article class="review-item">

        <div
          class="review-item__avatar"
          aria-hidden="true"
        >
          ${this.getInitials(name)}
        </div>

        <div class="review-item__body">

          <div class="review-item__head">

            <h3 class="review-item__name">
              ${this.escapeHtml(name)}
            </h3>

            <time class="review-item__date">
              ${this.escapeHtml(date)}
            </time>

          </div>

          <div
            class="review-item__stars"
            aria-label="${rating} trên 5 sao"
          >
            ${this.renderStars(rating)}
          </div>

          ${
            content
              ? `
                <p class="review-item__text">
                  ${this.escapeHtml(content)}
                </p>
              `
              : ''
          }

        </div>

      </article>
    `;
  },

  getDemoReviews() {
    return [
      {
        name: 'Nguyễn Thị A',
        date: '2 ngày trước',
        rating: 5,
        content:
          'Bác sĩ tư vấn kỹ, giải thích rõ ràng và quá trình thăm khám rất thuận tiện.',
      },
      {
        name: 'Trần Văn B',
        date: '1 tuần trước',
        rating: 5,
        content:
          'Đặt lịch trên MediCare nhanh chóng, thời gian khám đúng lịch và bác sĩ hỗ trợ tận tình.',
      },
      {
        name: 'Lê Thị C',
        date: '2 tuần trước',
        rating: 4,
        content:
          'Trải nghiệm thăm khám tốt, thông tin được tư vấn rõ ràng và dễ hiểu.',
      },
    ];
  },

  renderStars(rating) {
    const rounded =
      Math.round(
        Number(rating || 0)
      );

    return Array.from(
      { length: 5 },
      (_, index) => {
        const active =
          index < rounded;

        return `
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="${active ? 'currentColor' : 'none'}"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            class="${active ? 'is-active' : 'is-empty'}"
          >
            <path
              d="M12 2.8L14.76 8.39L20.93 9.29L16.47 13.64L17.52 19.78L12 16.88L6.48 19.78L7.53 13.64L3.07 9.29L9.24 8.39L12 2.8Z"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linejoin="round"
            />
          </svg>
        `;
      }
    ).join('');
  },

  /* ==========================================================
     BOOKING LINKS
     ========================================================== */

  renderBookingLinks(doctor) {
    const prefix =
      this.getPrefix();

    const url =
      `${prefix}pages/booking/create.html?doctorId=${encodeURIComponent(doctor.id)}`;

    const mainButton =
      document.getElementById(
        'bookBtn'
      );

    const sideButton =
      document.getElementById(
        'sideBookBtn'
      );

    if (mainButton) {
      mainButton.href = url;
    }

    if (sideButton) {
      sideButton.href = url;
    }
  },

  /* ==========================================================
     RELATED DOCTORS
     ========================================================== */

  renderRelated() {
    const section =
      document.getElementById(
        'relatedSection'
      );

    const grid =
      document.getElementById(
        'relatedDoctors'
      );

    if (
      !section ||
      !grid ||
      !this.doctor
    ) {
      return;
    }

    let related = [];

    try {
      related =
        DoctorService.getRelated(
          this.doctor.id,
          3
        ) || [];
    } catch (error) {
      console.warn(
        '[DoctorDetailPage] Không tải được bác sĩ liên quan:',
        error
      );
    }

    if (
      !Array.isArray(related) ||
      !related.length
    ) {
      section.style.display =
        'none';

      grid.innerHTML = '';

      return;
    }

    section.style.display =
      'block';

    grid.innerHTML =
      related
        .map(
          (doctor) =>
            this.renderRelatedCard(
              doctor
            )
        )
        .join('');
  },

  renderRelatedCard(doctor) {
    const prefix =
      this.getPrefix();

    const id =
      encodeURIComponent(
        doctor.id || ''
      );

    const name =
      this.escapeHtml(
        doctor.name || 'Bác sĩ'
      );

    const specialty =
      this.escapeHtml(
        doctor.specialty ||
        'Chuyên khoa'
      );

    const degree =
      this.escapeHtml(
        doctor.degree || 'Bác sĩ'
      );

    const experience =
      Number(
        doctor.experience || 0
      );

    const rating =
      Math.max(
        0,
        Math.min(
          5,
          Number(doctor.rating || 0)
        )
      );

    const image =
      doctor.image ||
      doctor.avatar ||
      '';

    return `
      <article class="doctor-card">

        <a
          href="${prefix}pages/doctors/detail.html?id=${id}"
          class="doctor-card__image"
          aria-label="Xem thông tin ${name}"
        >

          ${
            image
              ? `
                <img
                  src="${this.escapeAttribute(image)}"
                  alt="${name}"
                  loading="lazy"
                  onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                >

                <span
                  class="doctor-card__image-fallback"
                  style="display:none"
                  aria-hidden="true"
                >
                  ${this.doctorIcon(62)}
                </span>
              `
              : `
                <span
                  class="doctor-card__image-fallback"
                  aria-hidden="true"
                >
                  ${this.doctorIcon(62)}
                </span>
              `
          }

        </a>

        <div class="doctor-card__body">

          <span class="doctor-card__specialty">
            ${specialty}
          </span>

          <h3 class="doctor-card__name">
            ${name}
          </h3>

          <p class="doctor-card__degree">
            ${degree}
            ${
              experience
                ? ` · ${experience} năm kinh nghiệm`
                : ''
            }
          </p>

          <div class="doctor-card__meta">

            <span class="doctor-card__meta-item doctor-card__rating">

              ${this.starIcon()}

              <span>
                ${rating.toFixed(1)}
              </span>

            </span>

          </div>

          <div class="doctor-card__footer">

            <div class="doctor-card__price">

              <span class="doctor-card__price-label">
                Phí khám
              </span>

              <strong class="doctor-card__price-value">
                ${this.formatCurrency(doctor.price)}
              </strong>

            </div>

            <a
              href="${prefix}pages/doctors/detail.html?id=${id}"
              class="doctor-card__cta"
            >
              Xem chi tiết
              ${this.arrowIcon()}
            </a>

          </div>

        </div>

      </article>
    `;
  },

  /* ==========================================================
     EVENTS
     ========================================================== */

  bindEvents() {
    const favoriteButton =
      document.getElementById(
        'favoriteBtn'
      ) ||
      document.querySelector(
        '.doctor-favorite-btn'
      ) ||
      document.querySelector(
        '[onclick="toggleFavorite()"]'
      );

    if (!favoriteButton) return;

    /*
     * Xóa inline onclick để tránh chạy toggle 2 lần.
     */

    favoriteButton.removeAttribute(
      'onclick'
    );

    favoriteButton.addEventListener(
      'click',
      (event) => {
        event.preventDefault();

        this.toggleFavorite();
      }
    );
  },

  /* ==========================================================
     FAVORITE
     ========================================================== */

  toggleFavorite() {
    if (!this.doctor) return;

    let user = null;

    try {
      user =
        AuthService.getCurrentUser();
    } catch (error) {
      console.warn(
        '[DoctorDetailPage] AuthService:',
        error
      );
    }

    if (!user) {
      this.showToast(
        'warning',
        'Vui lòng đăng nhập để lưu bác sĩ yêu thích.'
      );

      setTimeout(() => {
        this.redirect(
          this.getPrefix() +
            'pages/auth/login.html'
        );
      }, 1000);

      return;
    }

    try {
      const result =
        UserService.toggleFavorite(
          this.doctor.id
        );

      if (result?.success) {
        this.showToast(
          'success',
          result.message ||
            'Đã cập nhật danh sách yêu thích.'
        );

        this.updateFavoriteButton();

        return;
      }

      this.showToast(
        'error',
        result?.message ||
          'Không thể cập nhật yêu thích.'
      );
    } catch (error) {
      console.error(
        '[DoctorDetailPage] toggleFavorite:',
        error
      );

      this.showToast(
        'error',
        'Đã xảy ra lỗi. Vui lòng thử lại.'
      );
    }
  },

  updateFavoriteButton() {
    if (!this.doctor) return;

    const button =
      document.getElementById(
        'favoriteBtn'
      ) ||
      document.querySelector(
        '.doctor-favorite-btn'
      ) ||
      document.querySelector(
        '.doctor-profile-actions .btn--outline'
      ) ||
      document.querySelector(
        '.doctor-hero__actions .btn--outline'
      );

    if (!button) return;

    let isFavorite = false;

    try {
      isFavorite =
        UserService.isFavorite(
          this.doctor.id
        );
    } catch (error) {
      /*
       * Chưa đăng nhập hoặc UserService chưa có dữ liệu
       * thì hiển thị trạng thái mặc định.
       */
      isFavorite = false;
    }

    button.classList.toggle(
      'is-favorite',
      isFavorite
    );

    button.setAttribute(
      'aria-pressed',
      String(isFavorite)
    );

    button.innerHTML = `
      ${this.heartIcon(isFavorite)}

      <span>
        ${
          isFavorite
            ? 'Đã yêu thích'
            : 'Yêu thích'
        }
      </span>
    `;
  },

  /* ==========================================================
     NOT FOUND
     ========================================================== */

  showNotFound() {
    const loading =
      document.getElementById(
        'loading'
      );

    const detail =
      document.getElementById(
        'doctorDetail'
      );

    const notFound =
      document.getElementById(
        'notFound'
      );

    const related =
      document.getElementById(
        'relatedSection'
      );

    if (loading) {
      loading.style.display = 'none';
    }

    if (detail) {
      detail.style.display = 'none';
    }

    if (related) {
      related.style.display = 'none';
    }

    if (notFound) {
      notFound.style.display = 'block';
    }

    document.title =
      'Không tìm thấy bác sĩ – MediCare';
  },

  /* ==========================================================
     HELPERS
     ========================================================== */

  setText(id, value) {
    const element =
      document.getElementById(id);

    if (!element) return;

    element.textContent =
      value ?? '';
  },

  getQueryParam(name) {
    if (
      typeof Utils !== 'undefined' &&
      typeof Utils.getQueryParam ===
        'function'
    ) {
      return Utils.getQueryParam(name);
    }

    return new URLSearchParams(
      window.location.search
    ).get(name);
  },

  getPrefix() {
    const path =
      window.location.pathname;

    if (path.includes('/pages/')) {
      return '../../';
    }

    return '';
  },

  redirect(url) {
    if (
      typeof Utils !== 'undefined' &&
      typeof Utils.redirect ===
        'function'
    ) {
      Utils.redirect(url);
      return;
    }

    window.location.href = url;
  },

  formatCurrency(value) {
    if (
      typeof Utils !== 'undefined' &&
      typeof Utils.formatCurrency ===
        'function'
    ) {
      return Utils.formatCurrency(
        Number(value) || 0
      );
    }

    return new Intl.NumberFormat(
      'vi-VN',
      {
        style: 'currency',
        currency: 'VND',
      }
    ).format(
      Number(value) || 0
    );
  },

  formatRating(value) {
    const rating =
      Number(value || 0);

    return Number.isFinite(rating)
      ? rating.toFixed(1)
      : '0.0';
  },

  formatPatientCount(value) {
    const count =
      Number(value || 0);

    if (count >= 1000) {
      const short =
        count / 1000;

      return `${
        Number.isInteger(short)
          ? short
          : short.toFixed(1)
      }K+`;
    }

    return `${count}+`;
  },

  escapeHtml(value) {
    if (
      typeof Utils !== 'undefined' &&
      typeof Utils.escapeHtml ===
        'function'
    ) {
      return Utils.escapeHtml(
        String(value ?? '')
      );
    }

    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  escapeAttribute(value) {
    return this.escapeHtml(value);
  },

  getInitials(name) {
    const parts =
      String(name || '')
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (!parts.length) {
      return 'BN';
    }

    if (parts.length === 1) {
      return parts[0]
        .slice(0, 2)
        .toUpperCase();
    }

    return (
      parts[0].charAt(0) +
      parts[
        parts.length - 1
      ].charAt(0)
    ).toUpperCase();
  },

  showToast(type, message) {
    /*
     * Hỗ trợ cả:
     * toast.success()
     * Toast.success()
     */

    const service =
      typeof toast !== 'undefined'
        ? toast
        : typeof Toast !== 'undefined'
          ? Toast
          : null;

    if (
      service &&
      typeof service[type] ===
        'function'
    ) {
      service[type](message);
      return;
    }

    console.log(
      `[${type}] ${message}`
    );
  },

  /* ==========================================================
     SVG ICONS
     ========================================================== */

  doctorIcon(size = 72) {
    return `
      <svg
        width="${size}"
        height="${size}"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
          stroke="currentColor"
          stroke-width="1.5"
        />

        <path
          d="M4 22C4 17.5817 7.58172 14 12 14C16.4183 14 20 17.5817 20 22"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
        />

        <path
          d="M18 11V17M15 14H21"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
        />
      </svg>
    `;
  },

  heartIcon(active = false) {
    return `
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="${active ? 'currentColor' : 'none'}"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M20.84 4.61C20.33 4.1 19.72 3.69 19.05 3.42C18.38 3.14 17.66 3 16.94 3C16.21 3 15.49 3.14 14.82 3.42C14.15 3.69 13.54 4.1 13.03 4.61L12 5.64L10.97 4.61C9.94 3.58 8.55 3 7.1 3C5.64 3 4.25 3.58 3.22 4.61C2.19 5.64 1.61 7.03 1.61 8.49C1.61 9.94 2.19 11.33 3.22 12.36L12 21.14L20.78 12.36C21.29 11.85 21.69 11.24 21.97 10.57C22.25 9.9 22.39 9.18 22.39 8.46C22.39 7.73 22.25 7.01 21.97 6.34C21.69 5.67 21.35 5.12 20.84 4.61Z"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    `;
  },

  starIcon() {
    return `
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M12 2.8L14.76 8.39L20.93 9.29L16.47 13.64L17.52 19.78L12 16.88L6.48 19.78L7.53 13.64L3.07 9.29L9.24 8.39L12 2.8Z"
        />
      </svg>
    `;
  },

  arrowIcon() {
    return `
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M5 12H19M13 6L19 12L13 18"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    `;
  },
};


/* ============================================================
   GLOBAL
   ============================================================ */

if (typeof window !== 'undefined') {
  window.DoctorDetailPage =
    DoctorDetailPage;

  window.toggleFavorite = () => {
    DoctorDetailPage.toggleFavorite();
  };

  document.addEventListener(
    'DOMContentLoaded',
    () => {
      DoctorDetailPage.init();
    }
  );
}