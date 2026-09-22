/* ============================================================
   PAGE — DOCTORS
   MediCare
   Dùng chung:
   - pages/doctors/list.html
   - pages/doctors/search.html
   ============================================================ */

const DoctorsPage = {
  state: {
    q: '',
    specialty: '',
    specialties: [],
    price: '',
    rating: '',
    experience: '',
    sortBy: '',
    page: 1,
    limit: 12,
  },

  elements: {},

  /* ==========================================================
     INIT
     ========================================================== */

  init() {
    const grid = document.getElementById('doctorGrid');

    // Không phải trang List / Search
    if (!grid) return;

    this.cacheElements();
    this.readQueryParams();
    this.renderSpecialtyFilter();
    this.syncControlsFromState();
    this.bindEvents();
    this.initFilterDrawer();
    this.render();
  },

  /* ==========================================================
     CACHE DOM
     ========================================================== */

  cacheElements() {
    this.elements = {
      grid: document.getElementById('doctorGrid'),
      pagination: document.getElementById('pagination'),
      emptyState: document.getElementById('emptyState'),
      resultCount: document.getElementById('resultCount'),

      // List
      searchInput: document.getElementById('searchInput'),
      filterSpecialty: document.getElementById('filterSpecialty'),
      filterSort: document.getElementById('filterSort'),

      // Search
      advancedSearchForm: document.getElementById('advancedSearchForm'),
      searchQ: document.getElementById('searchQ'),
      searchPrice: document.getElementById('searchPrice'),
      searchRating: document.getElementById('searchRating'),
      searchExperience: document.getElementById('searchExperience'),
      sortResults: document.getElementById('sortResults'),
      specialtyCheckboxes: document.getElementById('specialtyCheckboxes'),
      activeSearchFilters: document.getElementById('activeSearchFilters'),

      // Mobile filter
      filterToggle: document.getElementById('doctorFilterToggle'),
      filterClose: document.getElementById('doctorFilterClose'),
      filterSidebar: document.getElementById('doctorSearchFilters'),
      filterOverlay: document.getElementById('doctorFilterOverlay'),

      // Optional List mobile drawer
      listSidebar:
        document.getElementById('doctorsSidebar') ||
        document.querySelector('.doctors-sidebar'),

      listFilterToggle:
        document.getElementById('doctorsFilterToggle') ||
        document.querySelector('.doctors-toolbar__filter-btn'),

      listFilterClose:
        document.getElementById('doctorsFilterClose') ||
        document.querySelector('.doctors-sidebar__close'),

      listFilterOverlay:
        document.getElementById('doctorsFilterOverlay') ||
        document.querySelector('.doctors-filter-overlay'),
    };
  },

  /* ==========================================================
     PAGE HELPERS
     ========================================================== */

  isSearchPage() {
    return !!this.elements.advancedSearchForm;
  },

  isListPage() {
    return !this.isSearchPage();
  },

  /* ==========================================================
     QUERY PARAMS
     ========================================================== */

  readQueryParams() {
    let params = {};

    if (
      typeof Utils !== 'undefined' &&
      typeof Utils.getQueryParams === 'function'
    ) {
      params = Utils.getQueryParams() || {};
    } else {
      const searchParams = new URLSearchParams(window.location.search);

      searchParams.forEach((value, key) => {
        params[key] = value;
      });
    }

    if (params.q) {
      this.state.q = String(params.q);
    }

    if (params.specialty) {
      const specialties = String(params.specialty)
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

      this.state.specialties = specialties;
      this.state.specialty =
        specialties.length === 1 ? specialties[0] : '';
    }

    if (params.price) {
      this.state.price = String(params.price);
    }

    if (params.rating) {
      this.state.rating = String(params.rating);
    }

    if (params.experience) {
      this.state.experience = String(params.experience);
    }

    if (params.sort) {
      this.state.sortBy = String(params.sort);
    }

    if (params.page) {
      const page = Number(params.page);

      if (Number.isFinite(page) && page > 0) {
        this.state.page = page;
      }
    }
  },

  /* ==========================================================
     SPECIALTIES
     ========================================================== */

  getSpecialties() {
    try {
      const specialties = Storage.getSpecialties();

      if (!Array.isArray(specialties)) {
        return [];
      }

      return specialties.filter(
        (specialty) =>
          !specialty.status ||
          specialty.status === 'active'
      );
    } catch (error) {
      console.error(
        '[DoctorsPage] Không thể tải chuyên khoa:',
        error
      );

      return [];
    }
  },

  renderSpecialtyFilter() {
    const specialties = this.getSpecialties();

    this.renderSpecialtySelect(specialties);
    this.renderSpecialtyCheckboxes(specialties);
  },

  renderSpecialtySelect(specialties) {
    const select = this.elements.filterSpecialty;

    if (!select) return;

    // Giữ option mặc định
    const defaultOption =
      select.querySelector('option[value=""]');

    select.innerHTML = '';

    if (defaultOption) {
      select.appendChild(defaultOption);
    } else {
      const option = document.createElement('option');

      option.value = '';
      option.textContent = 'Tất cả chuyên khoa';

      select.appendChild(option);
    }

    specialties.forEach((specialty) => {
      const option = document.createElement('option');

      option.value = specialty.name;
      option.textContent = specialty.name;

      if (this.state.specialty === specialty.name) {
        option.selected = true;
      }

      select.appendChild(option);
    });
  },

  renderSpecialtyCheckboxes(specialties) {
    const wrap = this.elements.specialtyCheckboxes;

    if (!wrap) return;

    if (!specialties.length) {
      wrap.innerHTML = `
        <p class="filter-list__empty">
          Chưa có chuyên khoa.
        </p>
      `;

      return;
    }

    wrap.innerHTML = specialties
      .map((specialty) => {
        const name = this.escapeHtml(specialty.name);

        const checked =
          this.state.specialties.includes(specialty.name)
            ? 'checked'
            : '';

        return `
          <label class="filter-option">
            <input
              type="checkbox"
              name="specialty"
              value="${name}"
              ${checked}
            >

            <span>${name}</span>
          </label>
        `;
      })
      .join('');
  },

  /* ==========================================================
     SYNC UI
     ========================================================== */

  syncControlsFromState() {
    const {
      searchInput,
      filterSpecialty,
      filterSort,
      searchQ,
      searchPrice,
      searchRating,
      searchExperience,
      sortResults,
    } = this.elements;

    if (searchInput) {
      searchInput.value = this.state.q;
    }

    if (filterSpecialty) {
      filterSpecialty.value =
        this.state.specialty || '';
    }

    if (filterSort) {
      filterSort.value =
        this.state.sortBy || '';
    }

    if (searchQ) {
      searchQ.value = this.state.q;
    }

    if (searchPrice) {
      searchPrice.value =
        this.state.price || '';
    }

    if (searchRating) {
      searchRating.value =
        this.state.rating || '';
    }

    if (searchExperience) {
      searchExperience.value =
        this.state.experience || '';
    }

    if (sortResults) {
      sortResults.value =
        this.state.sortBy || '';
    }
  },

  /* ==========================================================
     EVENTS
     ========================================================== */

  bindEvents() {
    this.bindListEvents();
    this.bindSearchEvents();
  },

  bindListEvents() {
    const {
      searchInput,
      filterSpecialty,
      filterSort,
    } = this.elements;

    if (searchInput) {
      const handler = (event) => {
        this.state.q =
          event.target.value.trim();

        this.state.page = 1;

        this.render();
      };

      if (
        typeof Utils !== 'undefined' &&
        typeof Utils.debounce === 'function'
      ) {
        searchInput.addEventListener(
          'input',
          Utils.debounce(handler, 250)
        );
      } else {
        searchInput.addEventListener(
          'input',
          handler
        );
      }
    }

    if (filterSpecialty) {
      filterSpecialty.addEventListener(
        'change',
        (event) => {
          this.state.specialty =
            event.target.value;

          this.state.specialties =
            event.target.value
              ? [event.target.value]
              : [];

          this.state.page = 1;

          this.render();
        }
      );
    }

    if (filterSort) {
      filterSort.addEventListener(
        'change',
        (event) => {
          this.state.sortBy =
            event.target.value;

          this.state.page = 1;

          this.render();
        }
      );
    }
  },

  bindSearchEvents() {
    const {
      advancedSearchForm,
      sortResults,
      specialtyCheckboxes,
    } = this.elements;

    if (advancedSearchForm) {
      advancedSearchForm.addEventListener(
        'submit',
        (event) => {
          event.preventDefault();

          this.collectAdvancedFilters();

          this.state.page = 1;

          this.render();

          this.closeSearchFilterDrawer();
        }
      );
    }

    if (sortResults) {
      sortResults.addEventListener(
        'change',
        (event) => {
          this.state.sortBy =
            event.target.value;

          this.state.page = 1;

          this.render();
        }
      );
    }

    /*
     * Checkbox không tự search ngay.
     * Người dùng chọn xong → bấm "Áp dụng bộ lọc".
     *
     * Chỉ update visual state.
     */
    if (specialtyCheckboxes) {
      specialtyCheckboxes.addEventListener(
        'change',
        () => {
          this.updateSelectedSpecialtyVisual();
        }
      );
    }
  },

  /* ==========================================================
     COLLECT ADVANCED SEARCH
     ========================================================== */

  collectAdvancedFilters() {
    const q =
      this.elements.searchQ?.value.trim() || '';

    const price =
      this.elements.searchPrice?.value || '';

    const rating =
      this.elements.searchRating?.value || '';

    const experience =
      this.elements.searchExperience?.value || '';

    const checkboxes =
      document.querySelectorAll(
        '#specialtyCheckboxes input[name="specialty"]:checked'
      );

    const specialties =
      Array.from(checkboxes)
        .map((checkbox) => checkbox.value)
        .filter(Boolean);

    this.state.q = q;
    this.state.price = price;
    this.state.rating = rating;
    this.state.experience = experience;

    this.state.specialties =
      specialties;

    this.state.specialty =
      specialties.length === 1
        ? specialties[0]
        : '';
  },

  updateSelectedSpecialtyVisual() {
    const wrap =
      this.elements.specialtyCheckboxes;

    if (!wrap) return;

    wrap
      .querySelectorAll('.filter-option')
      .forEach((label) => {
        const checkbox =
          label.querySelector(
            'input[type="checkbox"]'
          );

        label.classList.toggle(
          'is-selected',
          !!checkbox?.checked
        );
      });
  },

  /* ==========================================================
     GET ALL DOCTORS
     ========================================================== */

  getAllDoctors() {
    /*
     * Ưu tiên lấy từ Storage để hỗ trợ multi-specialty filter.
     * DoctorService.search() của project vẫn được dùng ở
     * trường hợp List / single specialty.
     */

    try {
      if (
        typeof Storage !== 'undefined' &&
        typeof Storage.getDoctors === 'function'
      ) {
        const doctors =
          Storage.getDoctors();

        if (Array.isArray(doctors)) {
          return doctors.filter(
            (doctor) =>
              !doctor.status ||
              doctor.status === 'active'
          );
        }
      }
    } catch (error) {
      console.warn(
        '[DoctorsPage] Storage.getDoctors() lỗi:',
        error
      );
    }

    return [];
  },

  /* ==========================================================
     SEARCH
     ========================================================== */

  searchDoctors() {
    /*
     * Search nâng cao:
     * tự filter để hỗ trợ nhiều chuyên khoa.
     */

    if (
      this.isSearchPage() &&
      this.state.specialties.length > 1
    ) {
      return this.searchAdvancedLocally();
    }

    const options =
      this.buildServiceOptions();

    try {
      const result =
        DoctorService.search(options);

      return this.normalizeSearchResult(
        result
      );
    } catch (error) {
      console.error(
        '[DoctorsPage] DoctorService.search() lỗi:',
        error
      );

      return this.searchAdvancedLocally();
    }
  },

  buildServiceOptions() {
    const options = {
      q: this.state.q,
      specialty:
        this.state.specialty,
      sortBy:
        this.state.sortBy,
      page:
        this.state.page,
      limit:
        this.state.limit,
    };

    this.applyPriceToOptions(options);

    if (this.state.rating) {
      options.minRating =
        Number(this.state.rating);
    }

    if (this.state.experience) {
      options.minExperience =
        Number(this.state.experience);
    }

    return options;
  },

  applyPriceToOptions(options) {
    if (!this.state.price) return;

    const value =
      String(this.state.price).trim();

    /*
     * Hỗ trợ:
     * 0-300000
     * 300000-500000
     * 500000-1000000
     * 1000000+
     */

    if (value.endsWith('+')) {
      const min =
        Number(
          value.replace('+', '')
        );

      if (Number.isFinite(min)) {
        options.minPrice = min;
      }

      return;
    }

    const parts =
      value.split('-');

    const min =
      Number(parts[0]);

    const max =
      Number(parts[1]);

    if (Number.isFinite(min)) {
      options.minPrice = min;
    }

    if (Number.isFinite(max)) {
      options.maxPrice = max;
    }
  },

  normalizeSearchResult(result) {
    if (!result) {
      return {
        data: [],
        total: 0,
        totalPages: 0,
        page: 1,
      };
    }

    const data =
      Array.isArray(result.data)
        ? result.data
        : [];

    const total =
      Number.isFinite(Number(result.total))
        ? Number(result.total)
        : data.length;

    const totalPages =
      Number.isFinite(
        Number(result.totalPages)
      )
        ? Number(result.totalPages)
        : Math.ceil(
            total / this.state.limit
          );

    const page =
      Number.isFinite(Number(result.page))
        ? Number(result.page)
        : this.state.page;

    return {
      data,
      total,
      totalPages,
      page,
    };
  },

  /* ==========================================================
     LOCAL ADVANCED FILTER
     ========================================================== */

  searchAdvancedLocally() {
    let doctors =
      this.getAllDoctors();

    const q =
      this.normalizeText(
        this.state.q
      );

    if (q) {
      doctors = doctors.filter(
        (doctor) => {
          const searchable =
            this.normalizeText(
              [
                doctor.name,
                doctor.degree,
                doctor.specialty,
                doctor.bio,
                doctor.address,
              ]
                .filter(Boolean)
                .join(' ')
            );

          return searchable.includes(q);
        }
      );
    }

    if (
      this.state.specialties.length
    ) {
      doctors = doctors.filter(
        (doctor) =>
          this.state.specialties.includes(
            doctor.specialty
          )
      );
    } else if (
      this.state.specialty
    ) {
      doctors = doctors.filter(
        (doctor) =>
          doctor.specialty ===
          this.state.specialty
      );
    }

    if (this.state.price) {
      doctors = doctors.filter(
        (doctor) =>
          this.matchPrice(
            Number(doctor.price || 0)
          )
      );
    }

    if (this.state.rating) {
      const minimum =
        Number(this.state.rating);

      doctors = doctors.filter(
        (doctor) =>
          Number(doctor.rating || 0) >=
          minimum
      );
    }

    if (this.state.experience) {
      const minimum =
        Number(this.state.experience);

      doctors = doctors.filter(
        (doctor) =>
          Number(
            doctor.experience || 0
          ) >= minimum
      );
    }

    doctors =
      this.sortDoctors(doctors);

    const total =
      doctors.length;

    const totalPages =
      Math.ceil(
        total / this.state.limit
      );

    /*
     * Nếu filter làm page hiện tại vượt quá
     * tổng page → quay về page cuối hợp lệ.
     */
    if (
      totalPages > 0 &&
      this.state.page > totalPages
    ) {
      this.state.page =
        totalPages;
    }

    if (totalPages === 0) {
      this.state.page = 1;
    }

    const start =
      (this.state.page - 1) *
      this.state.limit;

    const data =
      doctors.slice(
        start,
        start + this.state.limit
      );

    return {
      data,
      total,
      totalPages,
      page: this.state.page,
    };
  },

  matchPrice(price) {
    const value =
      String(this.state.price);

    if (!value) return true;

    if (value.endsWith('+')) {
      const min =
        Number(
          value.replace('+', '')
        );

      return price >= min;
    }

    const [minRaw, maxRaw] =
      value.split('-');

    const min =
      Number(minRaw);

    const max =
      Number(maxRaw);

    if (
      Number.isFinite(min) &&
      price < min
    ) {
      return false;
    }

    if (
      Number.isFinite(max) &&
      price > max
    ) {
      return false;
    }

    return true;
  },

  sortDoctors(doctors) {
    const result =
      [...doctors];

    switch (this.state.sortBy) {
      case 'rating':
      case 'rating-desc':
        result.sort(
          (a, b) =>
            Number(b.rating || 0) -
            Number(a.rating || 0)
        );
        break;

      case 'experience':
      case 'experience-desc':
        result.sort(
          (a, b) =>
            Number(b.experience || 0) -
            Number(a.experience || 0)
        );
        break;

      case 'price-asc':
        result.sort(
          (a, b) =>
            Number(a.price || 0) -
            Number(b.price || 0)
        );
        break;

      case 'price-desc':
        result.sort(
          (a, b) =>
            Number(b.price || 0) -
            Number(a.price || 0)
        );
        break;

      case 'name':
      case 'name-asc':
        result.sort(
          (a, b) =>
            String(a.name || '')
              .localeCompare(
                String(b.name || ''),
                'vi'
              )
        );
        break;

      default:
        break;
    }

    return result;
  },

  /* ==========================================================
     MAIN RENDER
     ========================================================== */

  render() {
    const grid =
      this.elements.grid;

    if (!grid) return;

    const result =
      this.searchDoctors();

    this.renderResultCount(
      result.total
    );

    this.renderActiveFilters();

    if (!result.data.length) {
      grid.innerHTML = '';

      if (this.elements.emptyState) {
        this.elements.emptyState.style.display =
          'block';
      }
    } else {
      if (this.elements.emptyState) {
        this.elements.emptyState.style.display =
          'none';
      }

      grid.innerHTML =
        result.data
          .map(
            (doctor) =>
              this.renderDoctorCard(
                doctor
              )
          )
          .join('');
    }

    this.renderPagination(result);

    this.updateURL();
  },

  /* ==========================================================
     RESULT COUNT
     ========================================================== */

  renderResultCount(total) {
    const element =
      this.elements.resultCount;

    if (!element) return;

    element.innerHTML = `
      Tìm thấy
      <strong>${Number(total) || 0}</strong>
      bác sĩ
    `;
  },

  /* ==========================================================
     DOCTOR CARD
     ========================================================== */

  renderDoctorCard(doctor) {
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

    const price =
      this.formatCurrency(
        doctor.price || 0
      );

    const image =
      doctor.image ||
      doctor.avatar ||
      '';

    const icon =
      doctor.icon || '';

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
                  ${this.getDoctorIcon(icon)}
                </span>
              `
              : `
                <span
                  class="doctor-card__image-fallback"
                  aria-hidden="true"
                >
                  ${this.getDoctorIcon(icon)}
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

            ${
              experience
                ? `
                  <span class="doctor-card__meta-item">
                    ${this.experienceIcon()}

                    <span>
                      ${experience} năm
                    </span>
                  </span>
                `
                : ''
            }

          </div>

          <div class="doctor-card__footer">

            <div class="doctor-card__price">
              <span class="doctor-card__price-label">
                Phí khám
              </span>

              <strong class="doctor-card__price-value">
                ${price}
              </strong>
            </div>

            <a
              href="${prefix}pages/doctors/detail.html?id=${id}"
              class="doctor-card__cta"
              aria-label="Xem chi tiết ${name}"
            >
              Xem chi tiết

              ${this.arrowIcon()}
            </a>

          </div>

        </div>

      </article>
    `;
  },

  getDoctorIcon() {
    /*
     * Không dùng emoji.
     * SVG dùng currentColor để đồng bộ CSS.
     */

    return `
      <svg
        width="72"
        height="72"
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

  starIcon() {
    return `
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          d="M12 2.8L14.76 8.39L20.93 9.29L16.47 13.64L17.52 19.78L12 16.88L6.48 19.78L7.53 13.64L3.07 9.29L9.24 8.39L12 2.8Z"
        />
      </svg>
    `;
  },

  experienceIcon() {
    return `
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M8 7V5.5C8 4.12 9.12 3 10.5 3H13.5C14.88 3 16 4.12 16 5.5V7"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
        />

        <rect
          x="3"
          y="7"
          width="18"
          height="13"
          rx="3"
          stroke="currentColor"
          stroke-width="1.6"
        />

        <path
          d="M3 12H21M10 12V14H14V12"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
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

  /* ==========================================================
     ACTIVE FILTERS
     ========================================================== */

  renderActiveFilters() {
    const container =
      this.elements.activeSearchFilters;

    if (!container) return;

    const filters = [];

    if (this.state.q) {
      filters.push({
        type: 'q',
        label: `Từ khóa: ${this.state.q}`,
      });
    }

    this.state.specialties.forEach(
      (specialty) => {
        filters.push({
          type: 'specialty',
          value: specialty,
          label: specialty,
        });
      }
    );

    if (this.state.price) {
      filters.push({
        type: 'price',
        label:
          this.getPriceLabel(
            this.state.price
          ),
      });
    }

    if (this.state.rating) {
      filters.push({
        type: 'rating',
        label:
          `Từ ${this.state.rating} điểm`,
      });
    }

    if (this.state.experience) {
      filters.push({
        type: 'experience',
        label:
          `Từ ${this.state.experience} năm`,
      });
    }

    if (!filters.length) {
      container.innerHTML = '';
      return;
    }

    container.innerHTML =
      filters
        .map(
          (filter, index) => `
            <span class="active-filter-chip">

              <span>
                ${this.escapeHtml(filter.label)}
              </span>

              <button
                type="button"
                data-filter-index="${index}"
                aria-label="Xóa bộ lọc ${this.escapeAttribute(filter.label)}"
              >
                ${this.closeIcon()}
              </button>

            </span>
          `
        )
        .join('');

    container
      .querySelectorAll(
        'button[data-filter-index]'
      )
      .forEach((button) => {
        button.addEventListener(
          'click',
          () => {
            const filter =
              filters[
                Number(
                  button.dataset.filterIndex
                )
              ];

            if (!filter) return;

            this.removeFilter(filter);
          }
        );
      });
  },

  removeFilter(filter) {
    switch (filter.type) {
      case 'q':
        this.state.q = '';

        if (this.elements.searchQ) {
          this.elements.searchQ.value = '';
        }

        break;

      case 'specialty':
        this.state.specialties =
          this.state.specialties.filter(
            (item) =>
              item !== filter.value
          );

        this.state.specialty =
          this.state.specialties.length === 1
            ? this.state.specialties[0]
            : '';

        document
          .querySelectorAll(
            '#specialtyCheckboxes input[name="specialty"]'
          )
          .forEach((checkbox) => {
            checkbox.checked =
              this.state.specialties.includes(
                checkbox.value
              );
          });

        break;

      case 'price':
        this.state.price = '';

        if (this.elements.searchPrice) {
          this.elements.searchPrice.value = '';
        }

        break;

      case 'rating':
        this.state.rating = '';

        if (this.elements.searchRating) {
          this.elements.searchRating.value = '';
        }

        break;

      case 'experience':
        this.state.experience = '';

        if (this.elements.searchExperience) {
          this.elements.searchExperience.value = '';
        }

        break;

      default:
        break;
    }

    this.state.page = 1;

    this.render();
  },

  closeIcon() {
    return `
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M6 6L18 18M18 6L6 18"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
    `;
  },

  getPriceLabel(value) {
    if (!value) return '';

    if (
      String(value).endsWith('+')
    ) {
      const min =
        Number(
          String(value).replace(
            '+',
            ''
          )
        );

      return `Từ ${this.formatCurrency(min)}`;
    }

    const [min, max] =
      String(value)
        .split('-')
        .map(Number);

    if (
      Number.isFinite(min) &&
      Number.isFinite(max)
    ) {
      return `${this.formatCurrency(min)} – ${this.formatCurrency(max)}`;
    }

    return value;
  },

  /* ==========================================================
     PAGINATION
     ========================================================== */

  renderPagination({
    totalPages,
    page,
  }) {
    const pagination =
      this.elements.pagination;

    if (!pagination) return;

    totalPages =
      Number(totalPages) || 0;

    page =
      Number(page) || 1;

    if (totalPages <= 1) {
      pagination.innerHTML = '';
      return;
    }

    const buttons = [];

    buttons.push(`
      <button
        type="button"
        class="pagination__btn pagination__arrow"
        data-page="${page - 1}"
        aria-label="Trang trước"
        ${page === 1 ? 'disabled' : ''}
      >
        ${this.chevronLeftIcon()}
      </button>
    `);

    const maxVisible = 5;

    let start =
      Math.max(
        1,
        page -
          Math.floor(
            maxVisible / 2
          )
      );

    let end =
      Math.min(
        totalPages,
        start + maxVisible - 1
      );

    if (
      end - start <
      maxVisible - 1
    ) {
      start =
        Math.max(
          1,
          end - maxVisible + 1
        );
    }

    if (start > 1) {
      buttons.push(`
        <button
          type="button"
          class="pagination__btn"
          data-page="1"
        >
          1
        </button>
      `);

      if (start > 2) {
        buttons.push(`
          <span class="pagination__ellipsis">
            …
          </span>
        `);
      }
    }

    for (
      let i = start;
      i <= end;
      i++
    ) {
      buttons.push(`
        <button
          type="button"
          class="pagination__btn ${i === page ? 'is-active active' : ''}"
          data-page="${i}"
          ${i === page ? 'aria-current="page"' : ''}
        >
          ${i}
        </button>
      `);
    }

    if (end < totalPages) {
      if (
        end <
        totalPages - 1
      ) {
        buttons.push(`
          <span class="pagination__ellipsis">
            …
          </span>
        `);
      }

      buttons.push(`
        <button
          type="button"
          class="pagination__btn"
          data-page="${totalPages}"
        >
          ${totalPages}
        </button>
      `);
    }

    buttons.push(`
      <button
        type="button"
        class="pagination__btn pagination__arrow"
        data-page="${page + 1}"
        aria-label="Trang sau"
        ${page === totalPages ? 'disabled' : ''}
      >
        ${this.chevronRightIcon()}
      </button>
    `);

    pagination.innerHTML =
      buttons.join('');

    pagination
      .querySelectorAll(
        'button[data-page]:not([disabled])'
      )
      .forEach((button) => {
        button.addEventListener(
          'click',
          () => {
            const targetPage =
              Number(
                button.dataset.page
              );

            if (
              !targetPage ||
              targetPage ===
                this.state.page
            ) {
              return;
            }

            this.state.page =
              targetPage;

            this.render();

            this.scrollToResults();
          }
        );
      });
  },

  chevronLeftIcon() {
    return `
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M15 18L9 12L15 6"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    `;
  },

  chevronRightIcon() {
    return `
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M9 18L15 12L9 6"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    `;
  },

  scrollToResults() {
    const target =
      document.querySelector(
        '.search-results'
      ) ||
      document.querySelector(
        '.doctors-results'
      ) ||
      this.elements.grid;

    if (!target) return;

    const reducedMotion =
      window.matchMedia &&
      window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

    const top =
      target.getBoundingClientRect().top +
      window.scrollY -
      100;

    window.scrollTo({
      top,
      behavior:
        reducedMotion
          ? 'auto'
          : 'smooth',
    });
  },

  /* ==========================================================
     MOBILE FILTER DRAWERS
     ========================================================== */

  initFilterDrawer() {
    this.initSearchFilterDrawer();
    this.initListFilterDrawer();

    document.addEventListener(
      'keydown',
      (event) => {
        if (event.key !== 'Escape') {
          return;
        }

        this.closeSearchFilterDrawer();
        this.closeListFilterDrawer();
      }
    );
  },

  initSearchFilterDrawer() {
    const {
      filterToggle,
      filterClose,
      filterOverlay,
    } = this.elements;

    filterToggle?.addEventListener(
      'click',
      () => {
        this.openSearchFilterDrawer();
      }
    );

    filterClose?.addEventListener(
      'click',
      () => {
        this.closeSearchFilterDrawer();
      }
    );

    filterOverlay?.addEventListener(
      'click',
      () => {
        this.closeSearchFilterDrawer();
      }
    );
  },

  openSearchFilterDrawer() {
    const {
      filterSidebar,
      filterOverlay,
      filterToggle,
    } = this.elements;

    if (!filterSidebar) return;

    filterSidebar.classList.add(
      'is-open'
    );

    filterOverlay?.classList.add(
      'is-visible'
    );

    filterOverlay?.setAttribute(
      'aria-hidden',
      'false'
    );

    filterToggle?.setAttribute(
      'aria-expanded',
      'true'
    );

    document.body.classList.add(
      'doctor-filter-open'
    );
  },

  closeSearchFilterDrawer() {
    const {
      filterSidebar,
      filterOverlay,
      filterToggle,
    } = this.elements;

    filterSidebar?.classList.remove(
      'is-open'
    );

    filterOverlay?.classList.remove(
      'is-visible'
    );

    filterOverlay?.setAttribute(
      'aria-hidden',
      'true'
    );

    filterToggle?.setAttribute(
      'aria-expanded',
      'false'
    );

    document.body.classList.remove(
      'doctor-filter-open'
    );
  },

  initListFilterDrawer() {
    const {
      listFilterToggle,
      listFilterClose,
      listFilterOverlay,
    } = this.elements;

    listFilterToggle?.addEventListener(
      'click',
      () => {
        this.openListFilterDrawer();
      }
    );

    listFilterClose?.addEventListener(
      'click',
      () => {
        this.closeListFilterDrawer();
      }
    );

    listFilterOverlay?.addEventListener(
      'click',
      () => {
        this.closeListFilterDrawer();
      }
    );
  },

  openListFilterDrawer() {
    const {
      listSidebar,
      listFilterOverlay,
    } = this.elements;

    if (!listSidebar) return;

    listSidebar.classList.add(
      'is-open'
    );

    listFilterOverlay?.classList.add(
      'is-visible'
    );

    document.body.classList.add(
      'doctors-filter-open'
    );
  },

  closeListFilterDrawer() {
    const {
      listSidebar,
      listFilterOverlay,
    } = this.elements;

    listSidebar?.classList.remove(
      'is-open'
    );

    listFilterOverlay?.classList.remove(
      'is-visible'
    );

    document.body.classList.remove(
      'doctors-filter-open'
    );
  },

  /* ==========================================================
     RESET
     ========================================================== */

  resetFilters() {
    this.state = {
      q: '',
      specialty: '',
      specialties: [],
      price: '',
      rating: '',
      experience: '',
      sortBy: '',
      page: 1,
      limit: 12,
    };

    /*
     * LIST
     */

    if (this.elements.searchInput) {
      this.elements.searchInput.value =
        '';
    }

    if (this.elements.filterSpecialty) {
      this.elements.filterSpecialty.value =
        '';
    }

    if (this.elements.filterSort) {
      this.elements.filterSort.value =
        '';
    }

    /*
     * ADVANCED SEARCH
     */

    if (
      this.elements.advancedSearchForm
    ) {
      this.elements.advancedSearchForm.reset();
    }

    if (this.elements.searchQ) {
      this.elements.searchQ.value = '';
    }

    if (this.elements.searchPrice) {
      this.elements.searchPrice.value =
        '';
    }

    if (this.elements.searchRating) {
      this.elements.searchRating.value =
        '';
    }

    if (
      this.elements.searchExperience
    ) {
      this.elements.searchExperience.value =
        '';
    }

    if (this.elements.sortResults) {
      this.elements.sortResults.value =
        '';
    }

    document
      .querySelectorAll(
        '#specialtyCheckboxes input[name="specialty"]'
      )
      .forEach((checkbox) => {
        checkbox.checked = false;
      });

    this.updateSelectedSpecialtyVisual();

    this.render();

    this.closeSearchFilterDrawer();
    this.closeListFilterDrawer();
  },

  /* ==========================================================
     URL STATE
     ========================================================== */

  updateURL() {
    if (
      !window.history ||
      typeof window.history.replaceState !==
        'function'
    ) {
      return;
    }

    const params =
      new URLSearchParams();

    if (this.state.q) {
      params.set(
        'q',
        this.state.q
      );
    }

    const specialties =
      this.state.specialties.length
        ? this.state.specialties
        : this.state.specialty
          ? [this.state.specialty]
          : [];

    if (specialties.length) {
      params.set(
        'specialty',
        specialties.join(',')
      );
    }

    if (
      this.isSearchPage() &&
      this.state.price
    ) {
      params.set(
        'price',
        this.state.price
      );
    }

    if (
      this.isSearchPage() &&
      this.state.rating
    ) {
      params.set(
        'rating',
        this.state.rating
      );
    }

    if (
      this.isSearchPage() &&
      this.state.experience
    ) {
      params.set(
        'experience',
        this.state.experience
      );
    }

    if (this.state.sortBy) {
      params.set(
        'sort',
        this.state.sortBy
      );
    }

    if (this.state.page > 1) {
      params.set(
        'page',
        String(this.state.page)
      );
    }

    const query =
      params.toString();

    const nextURL =
      `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash || ''}`;

    window.history.replaceState(
      null,
      '',
      nextURL
    );
  },

  /* ==========================================================
     UTILITIES
     ========================================================== */

  normalizeText(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(
        /[\u0300-\u036f]/g,
        ''
      )
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase()
      .trim();
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

  getPrefix() {
    const path =
      window.location.pathname;

    if (path.includes('/pages/')) {
      return '../../';
    }

    return '';
  },
};


/* ============================================================
   GLOBAL HELPERS
   ============================================================ */

if (typeof window !== 'undefined') {
  window.DoctorsPage =
    DoctorsPage;

  window.resetFilters = () => {
    DoctorsPage.resetFilters();
  };

  window.resetSearchFilters = () => {
    DoctorsPage.resetFilters();
  };

  document.addEventListener(
    'DOMContentLoaded',
    () => {
      DoctorsPage.init();
    }
  );
}