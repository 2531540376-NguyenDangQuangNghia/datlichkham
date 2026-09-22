/* ============================================================
   MEDICARE — PAGE: HOME
   ============================================================ */

const HomePage = {
  initialized: false,
  observer: null,

  /* ============================================================
     INIT
     ============================================================ */

  init() {
    if (this.initialized) return;

    this.initialized = true;

    this.renderSpecialties();
    this.renderFeaturedDoctors();
    this.renderStats();
    this.bindSearch();

    requestAnimationFrame(() => {
      this.animateOnScroll();
    });
  },

  /* ============================================================
     SPECIALTIES
     ============================================================ */

  renderSpecialties() {
    const grid = document.getElementById('specialtyGrid');

    if (!grid) return;

    const specialties = this.getSpecialties()
      .filter(
        (specialty) =>
          specialty &&
          specialty.status === 'active' &&
          specialty.featured === true
      )
      .sort(
        (a, b) =>
          Number(a.order || 0) -
          Number(b.order || 0)
      )
      .slice(0, 8);

    if (!specialties.length) {
      grid.innerHTML = this.renderEmpty(
        'Chưa có chuyên khoa nào',
        'specialty'
      );
      return;
    }

    const prefix = this.getPrefix();

    grid.innerHTML = specialties
      .map((specialty) =>
        this.renderSpecialtyCard(
          specialty,
          prefix
        )
      )
      .join('');
  },

  /* ============================================================
     SPECIALTY CARD
     ============================================================ */

  renderSpecialtyCard(specialty, prefix) {
    const rawName =
      specialty.name || 'Chuyên khoa';

    const name =
      this.escape(rawName);

    const slug =
      String(specialty.slug || '').trim();

    const href =
      `${prefix}pages/doctors/list.html` +
      `?specialty=${encodeURIComponent(rawName)}`;

    const doctorCount =
      this.countDoctorsBySpecialty(
        specialty.id
      );

    return `
      <a
        href="${this.escapeAttribute(href)}"
        class="card specialty-card"
        ${
          slug
            ? `data-specialty="${this.escapeAttribute(slug)}"`
            : ''
        }
        aria-label="Xem bác sĩ chuyên khoa ${name}"
      >
        <div
          class="specialty-card__icon"
          aria-hidden="true"
        >
          ${this.getSpecialtyIcon(specialty)}
        </div>

        <div class="specialty-card__content">
          <h3 class="specialty-card__name">
            ${name}
          </h3>

          ${
            doctorCount > 0
              ? `
                <p class="specialty-card__count">
                  ${this.formatNumber(doctorCount)} bác sĩ
                </p>
              `
              : `
                <p class="specialty-card__count">
                  Đang cập nhật bác sĩ
                </p>
              `
          }
        </div>

        <span
          class="specialty-card__arrow"
          aria-hidden="true"
        >
          ${this.icon('arrowRight')}
        </span>
      </a>
    `;
  },

  /* ============================================================
     FEATURED DOCTORS
     ============================================================ */

  renderFeaturedDoctors() {
    const grid =
      document.getElementById(
        'featuredDoctorGrid'
      );

    if (!grid) return;

    const doctors =
      this.getFeaturedDoctors(6);

    if (!doctors.length) {
      grid.innerHTML = this.renderEmpty(
        'Chưa có bác sĩ nổi bật',
        'doctor'
      );
      return;
    }

    const prefix =
      this.getPrefix();

    grid.innerHTML = doctors
      .map((doctor) =>
        this.renderDoctorCard(
          doctor,
          prefix
        )
      )
      .join('');
  },

  /* ============================================================
     DOCTOR CARD
     ============================================================ */

  renderDoctorCard(doctor, prefix) {
    const id =
      Number(doctor.id) || 0;

    const name =
      String(
        doctor.name ||
          'Bác sĩ '
      ).trim();

    const specialty =
      String(
        doctor.specialty ||
          'Chuyên khoa'
      ).trim();

    const experience =
      Math.max(
        0,
        Number(doctor.experience) || 0
      );

    const patientCount =
      Math.max(
        0,
        Number(doctor.patientCount) || 0
      );

    const reviewCount =
      Math.max(
        0,
        Number(doctor.reviewCount) || 0
      );

    const rating =
      this.normalizeRating(
        doctor.rating
      );

    const price =
      Math.max(
        0,
        Number(doctor.price) || 0
      );

    const fullName =
      this.getDoctorDisplayName(
        doctor
      );

    const detailHref =
      `${prefix}pages/doctors/detail.html` +
      `?id=${encodeURIComponent(id)}`;

    return `
      <article
        class="card doctor-card"
        data-doctor-id="${id}"
      >
        <div class="doctor-card__media">

          ${this.renderDoctorAvatar(
            doctor,
            name
          )}

          ${
            doctor.featured
              ? `
                <span class="doctor-card__featured">
                  <span
                    class="doctor-card__featured-icon"
                    aria-hidden="true"
                  >
                    ${this.icon('award')}
                  </span>

                  Nổi bật
                </span>
              `
              : ''
          }

        </div>

        <div class="card-body doctor-card__body">

          <div class="doctor-card__top">
            <span class="badge badge--primary">
              ${this.escape(specialty)}
            </span>
          </div>

          <h3 class="doctor-card__name">
            <a
              href="${this.escapeAttribute(detailHref)}"
            >
              ${this.escape(fullName)}
            </a>
          </h3>

          ${
            experience > 0
              ? `
                <p class="doctor-card__degree">
                  <span
                    class="doctor-card__info-icon"
                    aria-hidden="true"
                  >
                    ${this.icon('briefcase')}
                  </span>

                  ${this.formatNumber(experience)}
                  năm kinh nghiệm
                </p>
              `
              : ''
          }

          <div class="doctor-card__meta">

            <span
              class="doctor-card__rating"
              aria-label="${rating.toFixed(1)} trên 5 điểm"
            >
              <span
                class="doctor-card__rating-icon"
                aria-hidden="true"
              >
                ${this.icon('star')}
              </span>

              <strong>
                ${rating.toFixed(1)}
              </strong>

              ${
                reviewCount > 0
                  ? `
                    <span class="doctor-card__review-count">
                      (${this.formatNumber(reviewCount)})
                    </span>
                  `
                  : ''
              }
            </span>

            ${
              patientCount > 0
                ? `
                  <span class="doctor-card__patients">
                    <span
                      class="doctor-card__info-icon"
                      aria-hidden="true"
                    >
                      ${this.icon('users')}
                    </span>

                    ${this.formatPatientCount(patientCount)}
                    bệnh nhân
                  </span>
                `
                : ''
            }

          </div>

          <div class="doctor-card__footer">

            <div class="doctor-card__price-wrap">
              <span class="doctor-card__price-label">
                Phí khám
              </span>

              <p class="doctor-card__price">
                ${this.formatCurrency(price)}
              </p>
            </div>

            <a
              href="${this.escapeAttribute(detailHref)}"
              class="btn btn--primary doctor-card__detail-btn"
              aria-label="Xem chi tiết ${this.escape(fullName)}"
            >
              Xem chi tiết

              <span
                class="btn__icon"
                aria-hidden="true"
              >
                ${this.icon('arrowRight')}
              </span>
            </a>

          </div>

        </div>
      </article>
    `;
  },

  /* ============================================================
     DOCTOR AVATAR
     ============================================================ */

  renderDoctorAvatar(doctor, name) {
    const avatar =
      String(
        doctor.avatar || ''
      ).trim();

    const fullName =
      this.getDoctorDisplayName(
        doctor
      );

    if (avatar) {
      return `
        <div class="doctor-card__avatar">
          <img
            src="${this.escapeAttribute(avatar)}"
            alt="${this.escape(fullName)}"
            loading="lazy"
            decoding="async"
          >
        </div>
      `;
    }

    const initials =
      this.getInitials(name);

    return `
      <div
        class="
          doctor-card__avatar
          doctor-card__avatar--placeholder
        "
        aria-label="${this.escape(fullName)}"
      >
        <span
          class="doctor-card__avatar-medical"
          aria-hidden="true"
        >
          ${this.icon('doctor')}
        </span>

        <span
          class="doctor-card__initials"
          aria-hidden="true"
        >
          ${this.escape(initials)}
        </span>
      </div>
    `;
  },

  /* ============================================================
     HOME STATS
     ============================================================ */

  renderStats() {
    const doctors =
      this.getDoctors().filter(
        (doctor) =>
          doctor &&
          doctor.status === 'active'
      );

    const specialties =
      this.getSpecialties().filter(
        (specialty) =>
          specialty &&
          specialty.status === 'active'
      );

    this.setText(
      'heroDoctorCount',
      this.formatNumber(
        doctors.length
      )
    );

    this.setText(
      'homeDoctorCount',
      this.formatNumber(
        doctors.length
      )
    );

    this.setText(
      'homeSpecialtyCount',
      this.formatNumber(
        specialties.length
      )
    );
  },

  /* ============================================================
     SEARCH
     ============================================================ */

  bindSearch() {
    const form =
      document.getElementById(
        'homeSearchForm'
      );

    const input =
      document.getElementById(
        'homeSearchInput'
      );

    if (
      !form ||
      !input ||
      form.dataset.homeSearchBound ===
        'true'
    ) {
      return;
    }

    form.dataset.homeSearchBound =
      'true';

    form.addEventListener(
      'submit',
      (event) => {
        event.preventDefault();

        const query =
          input.value.trim();

        const prefix =
          this.getPrefix();

        if (query) {
          this.redirect(
            `${prefix}pages/doctors/search.html` +
              `?q=${encodeURIComponent(query)}`
          );
          return;
        }

        this.redirect(
          `${prefix}pages/doctors/list.html`
        );
      }
    );
  },

  /* ============================================================
     ANIMATION
     ============================================================ */

  animateOnScroll() {
    const elements =
      document.querySelectorAll(
        [
          '.section .card',
          '.process__step',
          '.feature',
        ].join(',')
      );

    if (!elements.length) return;

    const reduceMotion =
      window.matchMedia &&
      window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

    if (reduceMotion) {
      elements.forEach(
        (element) => {
          element.style.opacity = '';
          element.style.animationDelay = '';
        }
      );
      return;
    }

    if (
      !(
        'IntersectionObserver' in
        window
      )
    ) {
      elements.forEach(
        (element) => {
          element.classList.add(
            'animate-slide-up'
          );
        }
      );
      return;
    }

    if (this.observer) {
      this.observer.disconnect();
    }

    this.observer =
      new IntersectionObserver(
        (entries, observer) => {
          entries.forEach(
            (entry) => {
              if (!entry.isIntersecting) {
                return;
              }

              entry.target.classList.add(
                'animate-slide-up'
              );

              observer.unobserve(
                entry.target
              );
            }
          );
        },
        {
          threshold: 0.1,
          rootMargin:
            '0px 0px -40px 0px',
        }
      );

    elements.forEach(
      (element, index) => {
        element.style.opacity =
          '0';

        element.style.animationDelay =
          `${Math.min(
            index * 0.05,
            0.35
          )}s`;

        this.observer.observe(
          element
        );
      }
    );
  },

  /* ============================================================
     DATA — SPECIALTIES
     ============================================================ */

  getSpecialties() {
    try {
      if (
        typeof Storage !==
          'undefined' &&
        typeof Storage.getSpecialties ===
          'function'
      ) {
        const data =
          Storage.getSpecialties();

        if (Array.isArray(data)) {
          return data;
        }
      }
    } catch (error) {
      this.debugWarn(
        'Không thể đọc specialties',
        error
      );
    }

    if (
      typeof SPECIALTIES_DATA !==
        'undefined' &&
      Array.isArray(
        SPECIALTIES_DATA
      )
    ) {
      return SPECIALTIES_DATA;
    }

    return [];
  },

  /* ============================================================
     DATA — DOCTORS
     ============================================================ */

  getDoctors() {
    try {
      if (
        typeof Storage !==
          'undefined' &&
        typeof Storage.getDoctors ===
          'function'
      ) {
        const data =
          Storage.getDoctors();

        if (Array.isArray(data)) {
          return data;
        }
      }
    } catch (error) {
      this.debugWarn(
        'Không thể đọc doctors',
        error
      );
    }

    if (
      typeof DOCTORS_DATA !==
        'undefined' &&
      Array.isArray(
        DOCTORS_DATA
      )
    ) {
      return DOCTORS_DATA;
    }

    return [];
  },

  /* ============================================================
     FEATURED DOCTORS
     ============================================================ */

  getFeaturedDoctors(limit = 6) {
    try {
      if (
        typeof DoctorService !==
          'undefined' &&
        typeof DoctorService.getFeatured ===
          'function'
      ) {
        const doctors =
          DoctorService.getFeatured(
            limit
          );

        if (Array.isArray(doctors)) {
          return doctors
            .filter(
              (doctor) =>
                doctor &&
                doctor.status !==
                  'inactive'
            )
            .slice(0, limit);
        }
      }
    } catch (error) {
      this.debugWarn(
        'DoctorService.getFeatured() gặp lỗi',
        error
      );
    }

    return this.getDoctors()
      .filter(
        (doctor) =>
          doctor &&
          doctor.status ===
            'active' &&
          doctor.featured === true
      )
      .sort(
        (a, b) =>
          Number(b.rating || 0) -
          Number(a.rating || 0)
      )
      .slice(0, limit);
  },

  /* ============================================================
     COUNT DOCTORS
     ============================================================ */

  countDoctorsBySpecialty(
    specialtyId
  ) {
    const id =
      Number(specialtyId);

    if (!id) return 0;

    return this.getDoctors().filter(
      (doctor) =>
        doctor &&
        doctor.status === 'active' &&
        Number(
          doctor.specialtyId
        ) === id
    ).length;
  },

  /* ============================================================
     DOCTOR NAME
     ============================================================ */

  getDoctorDisplayName(doctor) {
    const name =
      String(
        doctor?.name ||
          'Bác sĩ MediCare'
      ).trim();

    const degree =
      String(
        doctor?.degree || ''
      ).trim();

    const cleanName =
      name.replace(
        /^(BS\.?|Bác sĩ)\s+/i,
        ''
      );

    if (!degree) {
      return cleanName;
    }

    return `${degree} ${cleanName}`;
  },

  /* ============================================================
     SPECIALTY ICON
     ============================================================ */

  getSpecialtyIcon(specialty) {
    const slug =
      String(
        specialty?.slug || ''
      )
        .trim()
        .toLowerCase();

    const name =
      String(
        specialty?.name || ''
      )
        .trim()
        .toLowerCase();

    const rawIcon =
      String(
        specialty?.icon || ''
      )
        .trim()
        .toLowerCase();

    const iconMap = {
      'tim-mach': 'heart',
      'nhi-khoa': 'baby',
      'da-lieu': 'dermatology',
      'tai-mui-hong': 'ear',
      'rang-ham-mat': 'tooth',
      mat: 'eye',
      'san-phu-khoa': 'maternity',
      'than-kinh': 'brain',

      heart: 'heart',
      baby: 'baby',
      dermatology: 'dermatology',
      skin: 'dermatology',
      ear: 'ear',
      tooth: 'tooth',
      dental: 'tooth',
      eye: 'eye',
      maternity: 'maternity',
      pregnancy: 'maternity',
      brain: 'brain',
      neurology: 'brain',
      stethoscope: 'stethoscope',
    };

    let iconName =
      iconMap[slug] ||
      iconMap[rawIcon];

    if (!iconName) {
      if (name.includes('tim')) {
        iconName = 'heart';
      } else if (
        name.includes('nhi')
      ) {
        iconName = 'baby';
      } else if (
        name.includes('da liễu')
      ) {
        iconName =
          'dermatology';
      } else if (
        name.includes('tai') ||
        name.includes('mũi') ||
        name.includes('họng')
      ) {
        iconName = 'ear';
      } else if (
        name.includes('răng')
      ) {
        iconName = 'tooth';
      } else if (
        name === 'mắt' ||
        name.includes('nhãn')
      ) {
        iconName = 'eye';
      } else if (
        name.includes('sản') ||
        name.includes('phụ khoa')
      ) {
        iconName = 'maternity';
      } else if (
        name.includes('thần kinh')
      ) {
        iconName = 'brain';
      } else {
        iconName =
          'stethoscope';
      }
    }

    return this.icon(iconName);
  },

  /* ============================================================
     SVG ICON SYSTEM
     ============================================================ */

  icon(name) {
    const icons = {
      doctor: `
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="12"
            cy="6.5"
            r="3.5"
            stroke="currentColor"
            stroke-width="1.7"
          />

          <path
            d="M5.5 20v-2.1c0-3.3 2.7-5.9 6-5.9h1c3.3 0 6 2.6 6 5.9V20"
            stroke="currentColor"
            stroke-width="1.7"
            stroke-linecap="round"
          />

          <path
            d="M8.5 13.1v2.2a3.5 3.5 0 0 0 7 0v-2.2"
            stroke="currentColor"
            stroke-width="1.7"
            stroke-linecap="round"
          />

          <path
            d="M12 18.8v1.7"
            stroke="currentColor"
            stroke-width="1.7"
            stroke-linecap="round"
          />

          <circle
            cx="12"
            cy="18"
            r="1"
            stroke="currentColor"
            stroke-width="1.5"
          />
        </svg>
      `,

      stethoscope: `
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M6 3v5a4 4 0 0 0 8 0V3"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
          />

          <path
            d="M10 12v2a5 5 0 0 0 10 0v-1.5"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
          />

          <circle
            cx="20"
            cy="10"
            r="2"
            stroke="currentColor"
            stroke-width="1.8"
          />

          <path
            d="M4.5 3H6M14 3h1.5"
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

          <path
            d="M7.5 12h2l1.2-2.3 2.2 5 1.3-2.7h2.3"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      `,

      baby: `
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="12"
            cy="12.5"
            r="7"
            stroke="currentColor"
            stroke-width="1.8"
          />

          <path
            d="M10 4.3c.4-1.2 1.3-1.9 2.5-1.9 1.4 0 2.5 1 2.5 2.4"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
          />

          <circle
            cx="9.5"
            cy="11.5"
            r=".8"
            fill="currentColor"
          />

          <circle
            cx="14.5"
            cy="11.5"
            r=".8"
            fill="currentColor"
          />

          <path
            d="M9.5 15c1.4 1.2 3.6 1.2 5 0"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
          />
        </svg>
      `,

      dermatology: `
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M12 3.5c-3.7 3.4-6 6.2-6 9.4a6 6 0 0 0 12 0c0-3.2-2.3-6-6-9.4Z"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linejoin="round"
          />

          <path
            d="M9 14c1.8 1.1 4.2 1.1 6 0"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
          />

          <circle
            cx="9.5"
            cy="10.8"
            r=".8"
            fill="currentColor"
          />

          <circle
            cx="14.5"
            cy="10.8"
            r=".8"
            fill="currentColor"
          />
        </svg>
      `,

      ear: `
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M18 9a6 6 0 0 0-12 0v3.5c0 2.3 1 3.5 2.5 3.5 1.7 0 2.2-1.3 2.2-2.7V11a2.4 2.4 0 1 1 4.8 0c0 1.7-.9 2.5-2.2 3.3-1.4.8-2.3 1.7-2.3 3.2A3.5 3.5 0 0 0 14.5 21"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      `,

      tooth: `
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M7.5 3.5c1.5 0 2.7.8 4.5.8s3-.8 4.5-.8c2.5 0 4 2 4 4.7 0 2.2-.8 4.1-1.5 6-.9 2.4-1.5 6.3-3.6 6.3-1.8 0-1.5-4.8-3.4-4.8s-1.6 4.8-3.4 4.8c-2.1 0-2.7-3.9-3.6-6.3-.7-1.9-1.5-3.8-1.5-6 0-2.7 1.5-4.7 4-4.7Z"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linejoin="round"
          />
        </svg>
      `,

      eye: `
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M2.8 12s3.2-6 9.2-6 9.2 6 9.2 6-3.2 6-9.2 6-9.2-6-9.2-6Z"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linejoin="round"
          />

          <circle
            cx="12"
            cy="12"
            r="3"
            stroke="currentColor"
            stroke-width="1.8"
          />

          <circle
            cx="12"
            cy="12"
            r="1"
            fill="currentColor"
          />
        </svg>
      `,

      maternity: `
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="9"
            cy="5"
            r="2.4"
            stroke="currentColor"
            stroke-width="1.8"
          />

          <path
            d="M8 9h2.5c3.6 0 6 2.6 6 6v1.5h2"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
          />

          <path
            d="M9 9 8 14.5 7 20M12 10v10"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
          />

          <path
            d="M8 15h7"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
          />
        </svg>
      `,

      brain: `
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M9.5 4.5A3.5 3.5 0 0 0 6 8c0 .4.1.8.2 1.2A3.8 3.8 0 0 0 4.5 12a3.7 3.7 0 0 0 2.2 3.4V16a3.5 3.5 0 0 0 3.5 3.5c.7 0 1.3-.2 1.8-.5V5.2a3.4 3.4 0 0 0-2.5-.7Z"
            stroke="currentColor"
            stroke-width="1.7"
            stroke-linejoin="round"
          />

          <path
            d="M14.5 4.5A3.5 3.5 0 0 1 18 8c0 .4-.1.8-.2 1.2a3.8 3.8 0 0 1 1.7 2.8 3.7 3.7 0 0 1-2.2 3.4V16a3.5 3.5 0 0 1-3.5 3.5c-.7 0-1.3-.2-1.8-.5V5.2a3.4 3.4 0 0 1 2.5-.7Z"
            stroke="currentColor"
            stroke-width="1.7"
            stroke-linejoin="round"
          />
        </svg>
      `,

      star: `
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            d="m12 2.8 2.8 5.7 6.3.9-4.6 4.4 1.1 6.3-5.6-3-5.6 3 1.1-6.3-4.6-4.4 6.3-.9L12 2.8Z"
          />
        </svg>
      `,

      award: `
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="12"
            cy="8.5"
            r="5"
            stroke="currentColor"
            stroke-width="1.8"
          />

          <path
            d="m9 13-1.2 8 4.2-2.5 4.2 2.5-1.2-8"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linejoin="round"
          />
        </svg>
      `,

      briefcase: `
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <rect
            x="3"
            y="7"
            width="18"
            height="13"
            rx="2"
            stroke="currentColor"
            stroke-width="1.8"
          />

          <path
            d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7M3 12h18"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
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

      arrowRight: `
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M5 12h14M14 7l5 5-5 5"
            stroke="currentColor"
            stroke-width="1.9"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      `,

      empty: `
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4 7.5h16v11A2.5 2.5 0 0 1 17.5 21h-11A2.5 2.5 0 0 1 4 18.5v-11Z"
            stroke="currentColor"
            stroke-width="1.8"
          />

          <path
            d="M7 7.5 9 3h6l2 4.5M8 13h8"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
          />
        </svg>
      `,
    };

    return (
      icons[name] ||
      icons.stethoscope
    );
  },

  /* ============================================================
     EMPTY STATE
     ============================================================ */

  renderEmpty(
    message,
    type = 'default'
  ) {
    const iconName =
      type === 'specialty'
        ? 'stethoscope'
        : type === 'doctor'
          ? 'doctor'
          : 'empty';

    return `
      <div
        class="home-empty-state"
        role="status"
      >
        <div
          class="home-empty-state__icon"
          aria-hidden="true"
        >
          ${this.icon(iconName)}
        </div>

        <p class="home-empty-state__text">
          ${this.escape(message)}
        </p>
      </div>
    `;
  },

  /* ============================================================
     RATING
     ============================================================ */

  normalizeRating(value) {
    const rating =
      Number(value);

    if (!Number.isFinite(rating)) {
      return 0;
    }

    return Math.min(
      5,
      Math.max(0, rating)
    );
  },

  /* ============================================================
     PATIENT COUNT
     Không sử dụng dấu cộng
     ============================================================ */

  formatPatientCount(value) {
    const number =
      Math.max(
        0,
        Number(value) || 0
      );

    if (number >= 1000000) {
      const formatted =
        (
          number / 1000000
        ).toFixed(
          number >= 10000000
            ? 0
            : 1
        );

      return `${formatted.replace(
        '.0',
        ''
      )}M`;
    }

    if (number >= 1000) {
      const formatted =
        (
          number / 1000
        ).toFixed(
          number >= 10000
            ? 0
            : 1
        );

      return `${formatted.replace(
        '.0',
        ''
      )}K`;
    }

    return this.formatNumber(
      number
    );
  },

  /* ============================================================
     NUMBER
     ============================================================ */

  formatNumber(value) {
    const number =
      Number(value) || 0;

    try {
      return new Intl.NumberFormat(
        'vi-VN'
      ).format(number);
    } catch {
      return String(number);
    }
  },

  /* ============================================================
     CURRENCY
     ============================================================ */

  formatCurrency(value) {
    if (
      typeof Utils !==
        'undefined' &&
      typeof Utils.formatCurrency ===
        'function'
    ) {
      return Utils.formatCurrency(
        Number(value) || 0
      );
    }

    try {
      return new Intl.NumberFormat(
        'vi-VN',
        {
          style: 'currency',
          currency: 'VND',
        }
      ).format(
        Number(value) || 0
      );
    } catch {
      return `${this.formatNumber(
        value
      )} đ`;
    }
  },

  /* ============================================================
     INITIALS
     ============================================================ */

  getInitials(name) {
    let cleanName =
      String(name || '')
        .replace(
          /^(BS\.?|Bác sĩ)\s+/i,
          ''
        )
        .trim();

    if (
      typeof Utils !==
        'undefined' &&
      typeof Utils.getInitials ===
        'function'
    ) {
      return Utils.getInitials(
        cleanName
      );
    }

    const words =
      cleanName
        .split(/\s+/)
        .filter(Boolean);

    if (!words.length) {
      return 'BS';
    }

    if (words.length === 1) {
      return words[0]
        .slice(0, 2)
        .toUpperCase();
    }

    return (
      words[0][0] +
      words[
        words.length - 1
      ][0]
    ).toUpperCase();
  },

  /* ============================================================
     PREFIX
     ============================================================ */

  getPrefix() {
    const path =
      String(
        window.location.pathname ||
          ''
      )
        .replace(/\\/g, '/')
        .replace(/\/+/g, '/');

    const segments =
      path
        .split('/')
        .filter(Boolean);

    const pagesIndex =
      segments.indexOf('pages');

    if (pagesIndex !== -1) {
      const depth =
        segments.length -
        pagesIndex;

      return '../'.repeat(
        Math.max(0, depth)
      );
    }

    const adminIndex =
      segments.indexOf('admin');

    if (adminIndex !== -1) {
      const depth =
        segments.length -
        adminIndex;

      return '../'.repeat(
        Math.max(0, depth)
      );
    }

    return '';
  },

  /* ============================================================
     REDIRECT
     ============================================================ */

  redirect(url) {
    if (
      typeof Utils !==
        'undefined' &&
      typeof Utils.redirect ===
        'function'
    ) {
      Utils.redirect(url);
      return;
    }

    window.location.href =
      url;
  },

  /* ============================================================
     SET TEXT
     ============================================================ */

  setText(id, value) {
    const element =
      document.getElementById(id);

    if (element) {
      element.textContent =
        value;
    }
  },

  /* ============================================================
     ESCAPE HTML
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

        return (
          entities[character] ||
          character
        );
      }
    );
  },

  escapeAttribute(value) {
    return this.escape(value);
  },

  /* ============================================================
     DEBUG
     ============================================================ */

  debugWarn(message, error) {
    if (
      typeof CONFIG !==
        'undefined' &&
      CONFIG.DEBUG
    ) {
      console.warn(
        `[HomePage] ${message}`,
        error || ''
      );
    }
  },
};

/* ============================================================
   EXPORT
   ============================================================ */

if (
  typeof window !== 'undefined'
) {
  window.HomePage =
    HomePage;
}

/* ============================================================
   AUTO INIT
   ============================================================ */

if (
  typeof document !== 'undefined'
) {
  const initHomePage = () => {
    HomePage.init();
  };

  if (
    document.readyState ===
    'loading'
  ) {
    document.addEventListener(
      'DOMContentLoaded',
      initHomePage,
      {
        once: true,
      }
    );
  } else {
    initHomePage();
  }
}