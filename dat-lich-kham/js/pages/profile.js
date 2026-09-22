/* ============================================================
   PAGE — PROFILE
   Logic trang hồ sơ, đổi mật khẩu, yêu thích
   ============================================================ */

const ProfilePage = {
  editing: false,

  /* ============================================================
     INIT
     ============================================================ */

  init() {
    const user = AuthService.requireLogin();
    if (!user) return;

    this.initProfile();
    this.initChangePassword();
    this.initFavorites();
  },

  /* ============================================================
     PROFILE PAGE
     ============================================================ */

  initProfile() {
    const form = document.getElementById('profileForm');
    if (!form) return;

    this.renderProfile();
    this.bindProfileEvents();
  },

  renderProfile() {
    const user = AuthService.getCurrentUser();
    if (!user) return;

    // Sidebar
    this.setText('sidebarAvatar', Utils.getInitials(user.name));
    this.setText('sidebarName', user.name);
    this.setText('sidebarEmail', user.email);
    this.setText(
      'sidebarRole',
      user.role === 'admin' ? 'Quản trị viên' : 'Bệnh nhân'
    );

    // Form fields
    this.setValue('pfName', user.name);
    this.setValue('pfEmail', user.email);
    this.setValue('pfPhone', user.phone);
    this.setValue('pfGender', user.gender || '');
    this.setValue('pfBirthday', user.birthday || '');
    this.setValue('pfAddress', user.address || '');
    this.setValue('pfInsurance', user.insurance || '');

    // Stats
    const stats = UserService.getUserStats(user.id);
    this.setText('statTotalBookings', stats.totalBookings);
    this.setText('statCompleted', stats.completed);
    this.setText('statPending', stats.pending);
    this.setText('statFavorites', UserService.getFavorites().length);

    // Recent bookings
    this.renderRecentBookings(user.id);
  },

  renderRecentBookings(userId) {
    const tbody = document.getElementById('recentBookingsBody');
    if (!tbody) return;

    const bookings = BookingService.getByUser(userId).slice(0, 5);

    if (bookings.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align:center;color:#6c757d;padding:24px">
            Bạn chưa có lịch khám nào.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = bookings
      .map((b) => {
        const statusLabel = CONFIG.BOOKING_STATUS_LABEL[b.status] || b.status;
        const statusClass = CONFIG.BOOKING_STATUS_CLASS[b.status] || '';

        return `
        <tr>
          <td>${Utils.escapeHtml(b.doctorName)}</td>
          <td>${Utils.escapeHtml(b.specialty)}</td>
          <td>${Utils.formatDate(b.date)} ${b.time}</td>
          <td><span class="status ${statusClass}">${statusLabel}</span></td>
        </tr>
      `;
      })
      .join('');
  },

  bindProfileEvents() {
    const editBtn = document.getElementById('editToggleBtn');
    const cancelBtn = document.getElementById('cancelEditBtn');
    const form = document.getElementById('profileForm');
    const actions = document.getElementById('formActions');

    if (editBtn) {
      editBtn.addEventListener('click', () => this.toggleEdit(true));
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.toggleEdit(false);
        this.renderProfile();
      });
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveProfile();
      });
    }
  },

  toggleEdit(enable) {
    this.editing = enable;

    const fields = ['pfName', 'pfPhone', 'pfGender', 'pfBirthday', 'pfAddress', 'pfInsurance'];
    fields.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.disabled = !enable;
    });

    const actions = document.getElementById('formActions');
    if (actions) actions.style.display = enable ? 'flex' : 'none';

    const editBtn = document.getElementById('editToggleBtn');
    if (editBtn) editBtn.style.display = enable ? 'none' : 'inline-flex';
  },

  saveProfile() {
    const data = {
      name: document.getElementById('pfName').value.trim(),
      phone: document.getElementById('pfPhone').value.trim(),
      gender: document.getElementById('pfGender').value,
      birthday: document.getElementById('pfBirthday').value,
      address: document.getElementById('pfAddress').value.trim(),
      insurance: document.getElementById('pfInsurance').value.trim(),
    };

    if (!data.name) {
      toast.error('Vui lòng nhập họ tên.');
      return;
    }

    if (!Validator.phone(data.phone)) {
      toast.error('Số điện thoại không hợp lệ.');
      return;
    }

    const result = UserService.updateProfile(data);

    if (result.success) {
      toast.success('Cập nhật hồ sơ thành công!');
      this.toggleEdit(false);
      this.renderProfile();
      HeaderComponent.render();
    } else {
      toast.error(result.message);
    }
  },

  /* ============================================================
     CHANGE PASSWORD
     ============================================================ */

  initChangePassword() {
    const form = document.getElementById('changePasswordForm');
    if (!form) return;

    // Hiển thị sidebar
    this.renderSidebar();

    // Password strength
    const newPassInput = document.getElementById('newPassword');
    if (newPassInput) {
      newPassInput.addEventListener('input', () => this.updatePasswordStrength());
    }

    // Submit
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.submitChangePassword();
    });
  },

  renderSidebar() {
    const user = AuthService.getCurrentUser();
    if (!user) return;

    this.setText('sidebarAvatar', Utils.getInitials(user.name));
    this.setText('sidebarName', user.name);
    this.setText('sidebarEmail', user.email);
    this.setText(
      'sidebarRole',
      user.role === 'admin' ? 'Quản trị viên' : 'Bệnh nhân'
    );
  },

  updatePasswordStrength() {
    const input = document.getElementById('newPassword');
    const fill = document.getElementById('strengthFill');
    const text = document.getElementById('strengthText');
    if (!input || !fill || !text) return;

    const result = Validator.passwordStrength(input.value);

    fill.className = 'password-strength__fill ' + result.level;
    text.textContent = result.text;
  },

  submitChangePassword() {
    const current = document.getElementById('currentPassword').value;
    const newPass = document.getElementById('newPassword').value;
    const confirm = document.getElementById('confirmPassword').value;

    if (!current || !newPass || !confirm) {
      toast.error('Vui lòng nhập đầy đủ thông tin.');
      return;
    }

    const result = AuthService.changePassword(current, newPass, confirm);

    if (result.success) {
      toast.success(result.message);
      document.getElementById('changePasswordForm').reset();
      this.updatePasswordStrength();
    } else {
      toast.error(result.message);
    }
  },

  /* ============================================================
     FAVORITES
     ============================================================ */

  initFavorites() {
    const grid = document.getElementById('favoritesGrid');
    if (!grid) return;

    this.renderFavorites();
    this.bindFavoriteEvents();
  },

  renderFavorites(filter = '') {
    const grid = document.getElementById('favoritesGrid');
    const emptyState = document.getElementById('emptyState');
    const resultCount = document.getElementById('resultCount');

    if (!grid) return;

    let favorites = UserService.getFavorites();

    // Filter by search
    if (filter) {
      const q = filter.toLowerCase();
      favorites = favorites.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.specialty.toLowerCase().includes(q)
      );
    }

    if (resultCount) {
      resultCount.innerHTML = `Bạn có <strong>${favorites.length}</strong> bác sĩ yêu thích`;
    }

    if (favorites.length === 0) {
      grid.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    const prefix = this.getPrefix();

    grid.innerHTML = favorites
      .map(
        (d) => `
      <div class="card doctor-card">
        <div class="card-img">${d.icon || '👨‍⚕️'}</div>
        <div class="card-body">
          <span class="badge badge--primary">${Utils.escapeHtml(d.specialty)}</span>
          <h3 class="doctor-card__name" style="margin-top:8px">${Utils.escapeHtml(d.name)}</h3>
          <p class="doctor-card__degree">${d.degree} • ${d.experience} năm kinh nghiệm</p>
          <p class="doctor-card__price">${Utils.formatCurrency(d.price)}</p>

          <div class="doctor-card__actions">
            <a href="${prefix}pages/doctors/detail.html?id=${d.id}"
               class="btn btn--primary">Xem</a>
            <button class="btn btn--danger" onclick="removeFav(${d.id})">❤️</button>
          </div>
        </div>
      </div>
    `
      )
      .join('');
  },

  bindFavoriteEvents() {
    const searchInput = document.getElementById('favSearch');
    if (searchInput) {
      searchInput.addEventListener(
        'input',
        Utils.debounce((e) => this.renderFavorites(e.target.value), 300)
      );
    }

    const sortSelect = document.getElementById('favSort');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        const sort = e.target.value;
        if (sort) {
          let favorites = UserService.getFavorites();
          if (sort === 'name') {
            favorites = Utils.sortBy(favorites, 'name', 'asc');
          } else if (sort === 'price-asc') {
            favorites = Utils.sortBy(favorites, 'price', 'asc');
          } else if (sort === 'price-desc') {
            favorites = Utils.sortBy(favorites, 'price', 'desc');
          } else if (sort === 'rating') {
            favorites = Utils.sortBy(favorites, 'rating', 'desc');
          }
          // Re-render với danh sách đã sắp xếp
          this.renderFavoritesList(favorites);
        } else {
          this.renderFavorites();
        }
      });
    }

    // Confirm remove
    const confirmRemoveBtn = document.getElementById('confirmRemoveBtn');
    if (confirmRemoveBtn) {
      confirmRemoveBtn.addEventListener('click', () => {
        if (this._removeId) {
          const result = UserService.removeFavorite(this._removeId);
          if (result.success) {
            toast.success(result.message);
            closeModal('removeFavModal');
            this.renderFavorites();
          }
        }
      });
    }
  },

  renderFavoritesList(favorites) {
    const grid = document.getElementById('favoritesGrid');
    if (!grid) return;

    const prefix = this.getPrefix();

    grid.innerHTML = favorites
      .map(
        (d) => `
      <div class="card doctor-card">
        <div class="card-img">${d.icon || '👨‍⚕️'}</div>
        <div class="card-body">
          <span class="badge badge--primary">${Utils.escapeHtml(d.specialty)}</span>
          <h3 class="doctor-card__name" style="margin-top:8px">${Utils.escapeHtml(d.name)}</h3>
          <p class="doctor-card__degree">${d.degree} • ${d.experience} năm kinh nghiệm</p>
          <p class="doctor-card__price">${Utils.formatCurrency(d.price)}</p>

          <div class="doctor-card__actions">
            <a href="${prefix}pages/doctors/detail.html?id=${d.id}"
               class="btn btn--primary">Xem</a>
            <button class="btn btn--danger" onclick="removeFav(${d.id})">❤️</button>
          </div>
        </div>
      </div>
    `
      )
      .join('');
  },

  askRemoveFav(doctorId) {
    this._removeId = doctorId;
    openModal('removeFavModal');
  },

  /* ============================================================
     HELPERS
     ============================================================ */

  setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  },

  setValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value || '';
  },

  getPrefix() {
    const path = window.location.pathname;
    if (path.includes('/pages/user/')) return '../../';
    if (path.includes('/pages/')) return '../../';
    return '';
  },
};

/* ===== GLOBAL HELPERS ===== */
if (typeof window !== 'undefined') {
  window.ProfilePage = ProfilePage;

  window.removeFav = (id) => ProfilePage.askRemoveFav(id);

  document.addEventListener('DOMContentLoaded', () => {
    ProfilePage.init();
  });
}