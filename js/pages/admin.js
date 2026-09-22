/* ============================================================
   PAGE — ADMIN
   Logic tất cả trang admin: dashboard, CRUD, reports
   ============================================================ */

const AdminPage = {
  /* ============================================================
     INIT
     ============================================================ */

  init() {
    // Kiểm tra quyền admin
    const user = AuthService.getCurrentUser();
    if (!user || user.role !== CONFIG.ROLES.ADMIN) {
      if (window.location.pathname.includes('/admin/')) {
        Utils.redirect('../pages/auth/login.html');
      }
      return;
    }

    // Render topbar info
    this.renderTopbar(user);

    // Detect trang hiện tại
    const path = window.location.pathname;
    if (path.includes('/dashboard')) this.initDashboard();
    if (path.includes('/doctors/list')) this.initDoctorList();
    if (path.includes('/doctors/create')) this.initDoctorForm('create');
    if (path.includes('/doctors/edit')) this.initDoctorForm('edit');
    if (path.includes('/specialties/list')) this.initSpecialtyList();
    if (path.includes('/specialties/form')) this.initSpecialtyForm();
    if (path.includes('/users/list')) this.initUserList();
    if (path.includes('/users/detail')) this.initUserDetail();
    if (path.includes('/users/edit')) this.initUserEdit();
    if (path.includes('/bookings/list')) this.initBookingList();
    if (path.includes('/bookings/detail')) this.initBookingDetail();
    if (path.includes('/bookings/calendar')) this.initBookingCalendar();
    if (path.includes('/reports/revenue')) this.initReportRevenue();
    if (path.includes('/reports/bookings')) this.initReportBookings();
    if (path.includes('/reports/doctors')) this.initReportDoctors();
    if (path.includes('/settings/general')) this.initSettingsGeneral();
    if (path.includes('/settings/profile')) this.initSettingsProfile();
  },

  renderTopbar(user) {
    this.setText('topbarAvatar', Utils.getInitials(user.name));
    this.setText('topbarName', user.name);
    this.setText('topbarRole', 'Quản trị viên');
  },

  /* ============================================================
     DASHBOARD
     ============================================================ */

  initDashboard() {
    const stats = {
      totalBookings: BookingService.count(),
      totalUsers: UserService.countByRole('user'),
      totalDoctors: DoctorService.count(),
      totalRevenue: BookingService.getTotalRevenue(),
    };

    this.setText('statTotalBookings', Utils.formatNumber(stats.totalBookings));
    this.setText('statTotalUsers', Utils.formatNumber(stats.totalUsers));
    this.setText('statTotalDoctors', Utils.formatNumber(stats.totalDoctors));
    this.setText('statTotalRevenue', Utils.formatCurrency(stats.totalRevenue, false));

    // Status stats
    this.setText('statPending', BookingService.countByStatus('pending'));
    this.setText('statConfirmed', BookingService.countByStatus('confirmed'));
    this.setText('statCompleted', BookingService.countByStatus('completed'));
    this.setText('statCancelled', BookingService.countByStatus('cancelled'));

    // Chart bars
    this.renderChartBars();

    // Top doctors
    this.renderTopDoctors();

    // Recent bookings
    this.renderRecentBookings();

    // Revenue chart
    this.renderRevenueChart();

    // Current date
    this.setText('currentDate', Utils.getDayName() + ', ' + Utils.formatDate(new Date()));
  },

  renderChartBars() {
    const container = document.getElementById('chartBars');
    if (!container) return;

    const data = BookingService.getStatsByDay(7);
    const max = Math.max(...data.map((d) => d.count), 1);

    container.innerHTML = data
      .map(
        (d) => `
      <div class="chart-bar">
        <div class="chart-bar__value">${d.count}</div>
        <div class="chart-bar__fill" style="height:${(d.count / max) * 100}%"></div>
        <div class="chart-bar__label">${d.label}</div>
      </div>
    `
      )
      .join('');
  },

  renderTopDoctors() {
    const list = document.getElementById('topDoctorsList');
    if (!list) return;

    const top = DoctorService.getTopByBookings(5);

    if (top.length === 0) {
      list.innerHTML = '<li style="padding:16px;color:#6c757d">Chưa có dữ liệu</li>';
      return;
    }

    list.innerHTML = top
      .map(
        (item, i) => `
      <li class="top-list__item">
        <span class="top-list__rank">${i + 1}</span>
        <div class="top-list__avatar">${item.doctor.icon || '👨‍⚕️'}</div>
        <div class="top-list__info">
          <strong>${Utils.escapeHtml(item.doctor.name)}</strong>
          <small>${Utils.escapeHtml(item.doctor.specialty)}</small>
        </div>
        <span class="top-list__value">${item.count}</span>
      </li>
    `
      )
      .join('');
  },

  renderRecentBookings() {
    const tbody = document.getElementById('recentBookingsBody');
    if (!tbody) return;

    const bookings = BookingService.getAll()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    if (bookings.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:24px;color:#6c757d">Chưa có lịch khám nào</td></tr>';
      return;
    }

    tbody.innerHTML = bookings
      .map((b) => {
        const statusLabel = CONFIG.BOOKING_STATUS_LABEL[b.status] || b.status;
        const statusClass = CONFIG.BOOKING_STATUS_CLASS[b.status] || '';

        return `
        <tr>
          <td><strong>#BK${String(b.id).slice(-6)}</strong></td>
          <td>${Utils.escapeHtml(b.patientName)}</td>
          <td>${Utils.escapeHtml(b.doctorName)}</td>
          <td>${Utils.escapeHtml(b.specialty)}</td>
          <td>${Utils.formatDate(b.date)} ${b.time}</td>
          <td>${Utils.formatCurrency(b.price)}</td>
          <td><span class="status ${statusClass}">${statusLabel}</span></td>
          <td>
            <a href="bookings/detail.html?id=${b.id}" class="btn btn--outline btn--sm">Xem</a>
          </td>
        </tr>
      `;
      })
      .join('');
  },

  renderRevenueChart() {
    const container = document.getElementById('chartRevenue');
    if (!container) return;

    const data = BookingService.getStatsByMonth(6);
    const max = Math.max(...data.map((d) => d.revenue), 1);

    container.innerHTML = data
      .map(
        (d) => `
      <div class="chart-bar">
        <div class="chart-bar__value">${Utils.formatCompact(d.revenue)}</div>
        <div class="chart-bar__fill" style="height:${(d.revenue / max) * 100}%"></div>
        <div class="chart-bar__label">${d.label}</div>
      </div>
    `
      )
      .join('');
  },

  /* ============================================================
     DOCTOR LIST
     ============================================================ */

  initDoctorList() {
    this.renderDoctorTable();
    this.bindDoctorListEvents();
  },

  renderDoctorTable(filter = {}) {
    const tbody = document.getElementById('doctorTableBody');
    const emptyState = document.getElementById('emptyState');
    if (!tbody) return;

    const result = DoctorService.search({
      q: filter.q || '',
      specialty: filter.specialty || '',
      status: filter.status || '',
      page: filter.page || 1,
      limit: filter.limit || 20,
    });

    if (result.data.length === 0) {
      tbody.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    tbody.innerHTML = result.data
      .map(
        (d) => `
      <tr>
        <td><input type="checkbox" class="row-check" value="${d.id}"></td>
        <td>${d.id}</td>
        <td>
          <div class="table-user">
            <div class="table-avatar">${d.icon || '👨‍⚕️'}</div>
            <div class="table-user__info">
              <strong>${Utils.escapeHtml(d.name)}</strong>
              <small>${Utils.escapeHtml(d.hospital || '')}</small>
            </div>
          </div>
        </td>
        <td><span class="badge badge--primary">${Utils.escapeHtml(d.specialty)}</span></td>
        <td>${d.degree}</td>
        <td>${d.experience} năm</td>
        <td>${Utils.formatCurrency(d.price)}</td>
        <td>⭐ ${d.rating}</td>
        <td>
          <span class="status ${d.status === 'active' ? 'status-confirmed' : 'status-cancelled'}">
            ${d.status === 'active' ? 'Hoạt động' : 'Tạm nghỉ'}
          </span>
        </td>
        <td>
          <div class="table-actions">
            <a href="edit.html?id=${d.id}" class="btn btn--outline btn--sm">✏️</a>
            <button class="btn btn--danger btn--sm" onclick="askDeleteDoctor(${d.id}, '${Utils.escapeHtml(d.name)}')">🗑️</button>
          </div>
        </td>
      </tr>
    `
      )
      .join('');
  },

  bindDoctorListEvents() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener(
        'input',
        Utils.debounce((e) => this.renderDoctorTable({ q: e.target.value }), 300)
      );
    }

    const filterSpecialty = document.getElementById('filterSpecialty');
    if (filterSpecialty) {
      const specialties = Storage.getSpecialties();
      specialties.forEach((s) => {
        const opt = document.createElement('option');
        opt.value = s.name;
        opt.textContent = s.name;
        filterSpecialty.appendChild(opt);
      });
      filterSpecialty.addEventListener('change', (e) =>
        this.renderDoctorTable({ specialty: e.target.value })
      );
    }

    // Confirm delete
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
      confirmDeleteBtn.addEventListener('click', () => {
        if (this._deleteId) {
          const result = DoctorService.delete(this._deleteId);
          if (result.success) {
            toast.success(result.message);
            closeModal('deleteModal');
            this.renderDoctorTable();
          } else {
            toast.error(result.message);
          }
        }
      });
    }
  },

  askDeleteDoctor(id, name) {
    this._deleteId = id;
    this.setText('deleteDoctorName', name);
    openModal('deleteModal');
  },

  /* ============================================================
     DOCTOR FORM (create + edit)
     ============================================================ */

  initDoctorForm(mode) {
    const form = document.getElementById('doctorForm');
    if (!form) return;

    this.renderSpecialtySelect();

    if (mode === 'edit') {
      const id = Utils.getQueryParam('id');
      const doctor = DoctorService.getById(id);

      if (!doctor) {
        this.showNotFound();
        return;
      }

      this.fillDoctorForm(doctor);
      this.setText('editSubtitle', `Đang sửa: ${doctor.name}`);
    }

    // Avatar preview
    const avatarInput = document.getElementById('docAvatar');
    if (avatarInput) {
      avatarInput.addEventListener('change', (e) => this.previewAvatar(e, 'avatarPreview'));
    }

    // Submit
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.submitDoctorForm(mode);
    });

    // Delete button (edit mode)
    const deleteBtn = document.getElementById('deleteBtn');
    if (deleteBtn && mode === 'edit') {
      deleteBtn.addEventListener('click', () => {
        const id = Utils.getQueryParam('id');
        const doctor = DoctorService.getById(id);
        this.askDeleteDoctor(id, doctor ? doctor.name : '');
      });
    }
  },

  renderSpecialtySelect() {
    const select = document.getElementById('docSpecialty');
    if (!select) return;

    const specialties = Storage.getSpecialties().filter((s) => s.status === 'active');
    select.innerHTML =
      '<option value="">Chọn chuyên khoa</option>' +
      specialties
        .map((s) => `<option value="${s.id}">${Utils.escapeHtml(s.name)}</option>`)
        .join('');
  },

  fillDoctorForm(d) {
    this.setValue('docName', d.name);
    this.setValue('docDegree', d.degree);
    this.setValue('docSpecialty', d.specialtyId);
    this.setValue('docExperience', d.experience);
    this.setValue('docPrice', d.price);
    this.setValue('docRating', d.rating);
    this.setValue('docBio', d.bio);
    this.setValue('docExpertise', (d.expertise || []).join('\n'));
    this.setValue('docQualifications', (d.qualifications || []).join('\n'));
    this.setValue('docWorkStart', d.workStart);
    this.setValue('docWorkEnd', d.workEnd);
    this.setValue('docAddress', d.address);
    this.setValue('docHospital', d.hospital);
    this.setValue('docStatus', d.status);

    // Work days
    (d.workDays || []).forEach((day) => {
      const cb = document.querySelector(`input[name="workDays"][value="${day}"]`);
      if (cb) cb.checked = true;
    });

    if (d.featured) {
      const cb = document.getElementById('docFeatured');
      if (cb) cb.checked = true;
    }

    // System info
    this.setText('docId', d.id);
    this.setText('docCreatedAt', Utils.formatDate(d.createdAt));
    this.setText('docUpdatedAt', Utils.formatDate(d.updatedAt));
  },

  submitDoctorForm(mode) {
    const form = document.getElementById('doctorForm');

    const workDays = Array.from(
      document.querySelectorAll('input[name="workDays"]:checked')
    ).map((cb) => Number(cb.value));

    const data = {
      name: document.getElementById('docName').value.trim(),
      degree: document.getElementById('docDegree').value,
      specialtyId: document.getElementById('docSpecialty').value,
      experience: document.getElementById('docExperience').value,
      price: document.getElementById('docPrice').value,
      rating: document.getElementById('docRating').value,
      bio: document.getElementById('docBio').value.trim(),
      expertise: document.getElementById('docExpertise').value.split('\n').filter(Boolean),
      qualifications: document.getElementById('docQualifications').value.split('\n').filter(Boolean),
      workDays,
      workStart: document.getElementById('docWorkStart').value,
      workEnd: document.getElementById('docWorkEnd').value,
      address: document.getElementById('docAddress').value.trim(),
      hospital: document.getElementById('docHospital').value.trim(),
      status: document.getElementById('docStatus').value,
      featured: document.getElementById('docFeatured').checked,
    };

    if (!data.name || !data.specialtyId || !data.price) {
      toast.error('Vui lòng nhập đầy đủ thông tin bắt buộc.');
      return;
    }

    let result;
    if (mode === 'edit') {
      const id = Utils.getQueryParam('id');
      result = DoctorService.update(id, data);
    } else {
      result = DoctorService.create(data);
    }

    if (result.success) {
      toast.success(result.message);
      setTimeout(() => Utils.redirect('list.html'), 900);
    } else {
      toast.error(result.message);
    }
  },

  /* ============================================================
     SPECIALTY LIST & FORM
     ============================================================ */

  initSpecialtyList() {
    this.renderSpecialtyTable();
    this.bindSpecialtyEvents();
  },

  renderSpecialtyTable(filter = {}) {
    const tbody = document.getElementById('specialtyTableBody');
    const emptyState = document.getElementById('emptyState');
    if (!tbody) return;

    let list = Storage.getSpecialties();

    if (filter.q) {
      const q = filter.q.toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q));
    }

    if (filter.status) {
      list = list.filter((s) => s.status === filter.status);
    }

    if (list.length === 0) {
      tbody.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    tbody.innerHTML = list
      .map(
        (s) => `
      <tr>
        <td><input type="checkbox" class="row-check" value="${s.id}"></td>
        <td>${s.id}</td>
        <td style="font-size:24px">${s.icon || '🏷️'}</td>
        <td><strong>${Utils.escapeHtml(s.name)}</strong></td>
        <td>${Utils.truncate(s.description || '', 60)}</td>
        <td>${s.doctorCount || DoctorService.getBySpecialty(s.id).length}</td>
        <td>
          <span class="status ${s.status === 'active' ? 'status-confirmed' : 'status-cancelled'}">
            ${s.status === 'active' ? 'Hoạt động' : 'Tạm ẩn'}
          </span>
        </td>
        <td>
          <div class="table-actions">
            <a href="form.html?id=${s.id}" class="btn btn--outline btn--sm">✏️</a>
            <button class="btn btn--danger btn--sm" onclick="askDeleteSpecialty(${s.id}, '${Utils.escapeHtml(s.name)}')">🗑️</button>
          </div>
        </td>
      </tr>
    `
      )
      .join('');
  },

  bindSpecialtyEvents() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener(
        'input',
        Utils.debounce((e) => this.renderSpecialtyTable({ q: e.target.value }), 300)
      );
    }

    const filterStatus = document.getElementById('filterStatus');
    if (filterStatus) {
      filterStatus.addEventListener('change', (e) =>
        this.renderSpecialtyTable({ status: e.target.value })
      );
    }

    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
      confirmDeleteBtn.addEventListener('click', () => {
        if (this._deleteId) {
          const specialties = Storage.getSpecialties();
          const index = specialties.findIndex((s) => String(s.id) === String(this._deleteId));
          if (index !== -1) {
            // Kiểm tra có bác sĩ không
            const doctors = DoctorService.getBySpecialty(this._deleteId);
            if (doctors.length > 0) {
              toast.error('Không thể xóa chuyên khoa đang có bác sĩ.');
              return;
            }
            specialties.splice(index, 1);
            Storage.setSpecialties(specialties);
            toast.success('Đã xóa chuyên khoa.');
            closeModal('deleteModal');
            this.renderSpecialtyTable();
          }
        }
      });
    }
  },

  askDeleteSpecialty(id, name) {
    this._deleteId = id;
    this.setText('deleteSpecialtyName', name);
    openModal('deleteModal');
  },

  initSpecialtyForm() {
    const form = document.getElementById('specialtyForm');
    if (!form) return;

    const id = Utils.getQueryParam('id');

    if (id) {
      const specialty = Storage.getSpecialties().find((s) => String(s.id) === String(id));
      if (specialty) {
        this.fillSpecialtyForm(specialty);
        this.setText('formTitle', 'Sửa chuyên khoa');
        this.setText('formSubtitle', `Đang sửa: ${specialty.name}`);
        this.setText('formMode', 'Sửa');
        const delBtn = document.getElementById('deleteBtn');
        if (delBtn) delBtn.style.display = 'inline-flex';
        const sysCard = document.getElementById('systemInfoCard');
        if (sysCard) sysCard.style.display = 'block';
        this.setText('spId', specialty.id);
        this.setText('spDoctorCount', DoctorService.getBySpecialty(specialty.id).length);
        this.setText('spCreatedAt', Utils.formatDate(specialty.createdAt));
        this.setText('spUpdatedAt', Utils.formatDate(specialty.updatedAt));
      }
    }

    // Icon suggestions
    this.renderIconSuggestions();

    // Icon preview
    const iconInput = document.getElementById('spIcon');
    if (iconInput) {
      iconInput.addEventListener('input', (e) => {
        this.setText('iconPreview', e.target.value || '🏷️');
      });
    }

    // Submit
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.submitSpecialtyForm(id);
    });
  },

  renderIconSuggestions() {
    const container = document.getElementById('iconSuggestions');
    if (!container) return;

    const icons = ['❤️', '👶', '✨', '👂', '🦷', '👁️', '🤰', '🧠', '🩺', '💊', '🏥', '🧬', '🩸', '🫀', '🦴', '🧴'];
    container.innerHTML = icons
      .map(
        (icon) => `
      <button type="button" class="icon-suggestion"
              style="padding:8px;font-size:24px;background:#f8f9fa;border-radius:8px;border:none;cursor:pointer;margin:2px"
              onclick="selectIcon('${icon}')">
        ${icon}
      </button>
    `
      )
      .join('');
  },

  fillSpecialtyForm(s) {
    this.setValue('spName', s.name);
    this.setValue('spSlug', s.slug);
    this.setValue('spIcon', s.icon);
    this.setValue('spDescription', s.description);
    this.setValue('spStatus', s.status);
    this.setValue('spOrder', s.order || 0);
    this.setValue('spMetaTitle', s.metaTitle || '');
    this.setValue('spMetaDescription', s.metaDescription || '');

    this.setText('iconPreview', s.icon || '🏷️');

    if (s.featured) {
      const cb = document.getElementById('spFeatured');
      if (cb) cb.checked = true;
    }
    if (s.showMenu) {
      const cb = document.getElementById('spShowMenu');
      if (cb) cb.checked = true;
    }
  },

  submitSpecialtyForm(id) {
    const data = {
      name: document.getElementById('spName').value.trim(),
      slug: document.getElementById('spSlug').value.trim() || Utils.slugify(document.getElementById('spName').value),
      icon: document.getElementById('spIcon').value || '🏷️',
      description: document.getElementById('spDescription').value.trim(),
      status: document.getElementById('spStatus').value,
      order: Number(document.getElementById('spOrder').value) || 0,
      metaTitle: document.getElementById('spMetaTitle').value.trim(),
      metaDescription: document.getElementById('spMetaDescription').value.trim(),
      featured: document.getElementById('spFeatured').checked,
      showMenu: document.getElementById('spShowMenu').checked,
    };

    if (!data.name) {
      toast.error('Vui lòng nhập tên chuyên khoa.');
      return;
    }

    const specialties = Storage.getSpecialties();
    const now = new Date().toISOString();

    if (id) {
      const index = specialties.findIndex((s) => String(s.id) === String(id));
      if (index !== -1) {
        specialties[index] = { ...specialties[index], ...data, updatedAt: now };
        Storage.setSpecialties(specialties);
        toast.success('Cập nhật chuyên khoa thành công!');
      }
    } else {
      specialties.push({
        id: Date.now(),
        ...data,
        doctorCount: 0,
        createdAt: now,
        updatedAt: now,
      });
      Storage.setSpecialties(specialties);
      toast.success('Thêm chuyên khoa thành công!');
    }

    setTimeout(() => Utils.redirect('list.html'), 900);
  },

  /* ============================================================
     USER LIST / DETAIL / EDIT
     ============================================================ */

  initUserList() {
    this.renderUserTable();
    this.bindUserListEvents();
  },

  renderUserTable(filter = {}) {
    const tbody = document.getElementById('userTableBody');
    const emptyState = document.getElementById('emptyState');
    if (!tbody) return;

    const result = UserService.search({
      q: filter.q || '',
      role: filter.role || '',
      status: filter.status || '',
      page: filter.page || 1,
      limit: filter.limit || 20,
    });

    if (result.data.length === 0) {
      tbody.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    tbody.innerHTML = result.data
      .map(
        (u) => `
      <tr>
        <td><input type="checkbox" class="row-check" value="${u.id}"></td>
        <td>${u.id}</td>
        <td><div class="table-avatar">${Utils.getInitials(u.name)}</div></td>
        <td><strong>${Utils.escapeHtml(u.name)}</strong></td>
        <td>${Utils.escapeHtml(u.email)}</td>
        <td>${Utils.escapeHtml(u.phone)}</td>
        <td>
          <span class="badge ${u.role === 'admin' ? 'badge--warning' : 'badge--primary'}">
            ${u.role === 'admin' ? 'Quản trị' : 'Bệnh nhân'}
          </span>
        </td>
        <td>
          <span class="status ${u.status === 'active' ? 'status-confirmed' : 'status-cancelled'}">
            ${u.status === 'active' ? 'Hoạt động' : 'Bị khóa'}
          </span>
        </td>
        <td>${Utils.formatDate(u.createdAt)}</td>
        <td>
          <div class="table-actions">
            <a href="detail.html?id=${u.id}" class="btn btn--outline btn--sm">👁️</a>
            <a href="edit.html?id=${u.id}" class="btn btn--outline btn--sm">✏️</a>
            <button class="btn btn--danger btn--sm" onclick="askDeleteUser(${u.id}, '${Utils.escapeHtml(u.name)}')">🗑️</button>
          </div>
        </td>
      </tr>
    `
      )
      .join('');
  },

  bindUserListEvents() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener(
        'input',
        Utils.debounce((e) => this.renderUserTable({ q: e.target.value }), 300)
      );
    }

    const filterRole = document.getElementById('filterRole');
    if (filterRole) {
      filterRole.addEventListener('change', (e) =>
        this.renderUserTable({ role: e.target.value })
      );
    }

    const filterStatus = document.getElementById('filterStatus');
    if (filterStatus) {
      filterStatus.addEventListener('change', (e) =>
        this.renderUserTable({ status: e.target.value })
      );
    }

    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
      confirmDeleteBtn.addEventListener('click', () => {
        if (this._deleteId) {
          const result = UserService.delete(this._deleteId);
          if (result.success) {
            toast.success(result.message);
            closeModal('deleteModal');
            this.renderUserTable();
          } else {
            toast.error(result.message);
          }
        }
      });
    }
  },

  askDeleteUser(id, name) {
    this._deleteId = id;
    this.setText('deleteUserName', name);
    openModal('deleteModal');
  },

  initUserDetail() {
    const id = Utils.getQueryParam('id');
    const user = UserService.getById(id);
    const loading = document.getElementById('loading');
    const notFound = document.getElementById('notFound');
    const content = document.getElementById('detailContent');

    if (!user) {
      if (loading) loading.style.display = 'none';
      if (notFound) notFound.style.display = 'block';
      return;
    }

    if (loading) loading.style.display = 'none';
    if (content) content.style.display = 'block';

    // Info
    this.setText('detailSubtitle', `Xem thông tin: ${user.name}`);
    this.setText('userAvatar', Utils.getInitials(user.name));
    this.setText('userFullName', user.name);
    this.setText('userEmailDisplay', user.email);
    this.setText('userRoleBadge', user.role === 'admin' ? 'Quản trị viên' : 'Bệnh nhân');
    this.setText('userStatusBadge', user.status === 'active' ? 'Hoạt động' : 'Bị khóa');

    this.setText('infoId', user.id);
    this.setText('infoName', user.name);
    this.setText('infoEmail', user.email);
    this.setText('infoPhone', user.phone);
    this.setText('infoGender', CONFIG.GENDER_LABEL[user.gender] || '—');
    this.setText('infoBirthday', user.birthday ? Utils.formatDate(user.birthday) : '—');
    this.setText('infoAddress', user.address || '—');
    this.setText('infoInsurance', user.insurance || '—');
    this.setText('infoCreatedAt', Utils.formatDate(user.createdAt));
    this.setText('infoUpdatedAt', Utils.formatDate(user.updatedAt));
    this.setText('infoLastLogin', user.lastLogin ? Utils.timeAgo(user.lastLogin) : '—');

    // Stats
    const stats = UserService.getUserStats(user.id);
    this.setText('statBookings', stats.totalBookings);
    this.setText('statCompleted', stats.completed);
    this.setText('statCancelled', stats.cancelled);
    this.setText('statSpent', Utils.formatCurrency(stats.totalSpent));

    // Bookings
    const tbody = document.getElementById('userBookingsBody');
    if (tbody) {
      const bookings = BookingService.getByUser(user.id).slice(0, 5);
      if (bookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:24px;color:#6c757d">Chưa có lịch khám</td></tr>';
      } else {
        tbody.innerHTML = bookings
          .map((b) => {
            const statusLabel = CONFIG.BOOKING_STATUS_LABEL[b.status] || b.status;
            const statusClass = CONFIG.BOOKING_STATUS_CLASS[b.status] || '';
            return `
            <tr>
              <td>${Utils.escapeHtml(b.doctorName)}</td>
              <td>${Utils.escapeHtml(b.specialty)}</td>
              <td>${Utils.formatDate(b.date)} ${b.time}</td>
              <td>${Utils.formatCurrency(b.price)}</td>
              <td><span class="status ${statusClass}">${statusLabel}</span></td>
            </tr>
          `;
          })
          .join('');
      }
    }

    // Bind delete
    const deleteBtn = document.getElementById('deleteBtn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        this.askDeleteUser(user.id, user.name);
      });
    }

    // Edit link
    const editBtn = document.getElementById('editBtn');
    if (editBtn) editBtn.href = `edit.html?id=${user.id}`;
    const editBtnSide = document.getElementById('editBtnSide');
    if (editBtnSide) editBtnSide.href = `edit.html?id=${user.id}`;

    // Block toggle
    const blockBtn = document.getElementById('blockBtn');
    if (blockBtn) {
      blockBtn.textContent = user.status === 'active' ? '🚫 Khóa tài khoản' : '✅ Mở khóa';
      blockBtn.addEventListener('click', () => {
        const result = UserService.toggleBlock(user.id);
        if (result.success) {
          toast.success(result.message);
          setTimeout(() => window.location.reload(), 800);
        } else {
          toast.error(result.message);
        }
      });
    }

    // Reset password
    const confirmResetBtn = document.getElementById('confirmResetBtn');
    if (confirmResetBtn) {
      confirmResetBtn.addEventListener('click', () => {
        const result = AuthService.resetPassword(user.id);
        if (result.success) {
          toast.success(result.message);
          closeModal('resetPasswordModal');
        }
      });
    }
  },

  initUserEdit() {
    const id = Utils.getQueryParam('id');
    const user = UserService.getById(id);
    const loading = document.getElementById('loading');
    const notFound = document.getElementById('notFound');
    const form = document.getElementById('userForm');

    if (!user) {
      if (loading) loading.style.display = 'none';
      if (notFound) notFound.style.display = 'block';
      return;
    }

    if (loading) loading.style.display = 'none';
    if (form) form.style.display = 'block';

    // Fill form
    this.setValue('userName', user.name);
    this.setValue('userEmail', user.email);
    this.setValue('userPhone', user.phone);
    this.setValue('userGender', user.gender || '');
    this.setValue('userBirthday', user.birthday || '');
    this.setValue('userAddress', user.address || '');
    this.setValue('userInsurance', user.insurance || '');
    this.setValue('userRole', user.role);
    this.setValue('userStatus', user.status);

    this.setText('editSubtitle', `Đang sửa: ${user.name}`);
    this.setText('infoId', user.id);
    this.setText('infoCreatedAt', Utils.formatDate(user.createdAt));
    this.setText('infoUpdatedAt', Utils.formatDate(user.updatedAt));

    const stats = UserService.getUserStats(user.id);
    this.setText('infoTotalBookings', stats.totalBookings);

    // Avatar preview
    const avatarPreview = document.getElementById('avatarPreview');
    if (avatarPreview) avatarPreview.textContent = Utils.getInitials(user.name);

    // Submit
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.submitUserEdit(user.id);
      });
    }

    // Delete
    const deleteBtn = document.getElementById('deleteBtn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => this.askDeleteUser(user.id, user.name));
    }

    // View detail
    const viewDetailBtn = document.getElementById('viewDetailBtn');
    if (viewDetailBtn) viewDetailBtn.href = `detail.html?id=${user.id}`;

    // Reset password
    const confirmResetBtn = document.getElementById('confirmResetBtn');
    if (confirmResetBtn) {
      confirmResetBtn.addEventListener('click', () => {
        const result = AuthService.resetPassword(user.id);
        if (result.success) {
          toast.success(result.message);
          closeModal('resetPasswordModal');
        }
      });
    }
  },

  submitUserEdit(id) {
    const data = {
      name: document.getElementById('userName').value.trim(),
      email: document.getElementById('userEmail').value.trim(),
      phone: document.getElementById('userPhone').value.trim(),
      gender: document.getElementById('userGender').value,
      birthday: document.getElementById('userBirthday').value,
      address: document.getElementById('userAddress').value.trim(),
      insurance: document.getElementById('userInsurance').value.trim(),
      role: document.getElementById('userRole').value,
      status: document.getElementById('userStatus').value,
    };

    if (!data.name || !data.email || !data.phone) {
      toast.error('Vui lòng nhập đầy đủ thông tin bắt buộc.');
      return;
    }

    const result = UserService.update(id, data);

    if (result.success) {
      toast.success(result.message);
      setTimeout(() => Utils.redirect('list.html'), 900);
    } else {
      toast.error(result.message);
    }
  },

  /* ============================================================
     BOOKING LIST / DETAIL / CALENDAR
     ============================================================ */

  initBookingList() {
    this.renderBookingTable();
    this.bindBookingListEvents();
  },

  renderBookingTable(filter = {}) {
    const tbody = document.getElementById('bookingTableBody');
    const emptyState = document.getElementById('emptyState');
    if (!tbody) return;

    const result = BookingService.search({
      q: filter.q || '',
      status: filter.status || '',
      specialty: filter.specialty || '',
      date: filter.date || '',
      page: filter.page || 1,
      limit: filter.limit || 20,
    });

    // Stats
    this.setText('statTotalBookings', BookingService.count());
    this.setText('statPending', BookingService.countByStatus('pending'));
    this.setText('statConfirmed', BookingService.countByStatus('confirmed'));
    this.setText('statCancelled', BookingService.countByStatus('cancelled'));

    if (result.data.length === 0) {
      tbody.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    tbody.innerHTML = result.data
      .map((b) => {
        const statusLabel = CONFIG.BOOKING_STATUS_LABEL[b.status] || b.status;
        const statusClass = CONFIG.BOOKING_STATUS_CLASS[b.status] || '';

        return `
        <tr>
          <td><input type="checkbox" class="row-check" value="${b.id}"></td>
          <td><strong>#BK${String(b.id).slice(-6)}</strong></td>
          <td>${Utils.escapeHtml(b.patientName)}</td>
          <td>${Utils.escapeHtml(b.doctorName)}</td>
          <td>${Utils.escapeHtml(b.specialty)}</td>
          <td>${Utils.formatDate(b.date)} ${b.time}</td>
          <td>${Utils.formatCurrency(b.price)}</td>
          <td><span class="status ${statusClass}">${statusLabel}</span></td>
          <td>
            <div class="table-actions">
              <a href="detail.html?id=${b.id}" class="btn btn--outline btn--sm">👁️</a>
              ${b.status === 'pending' ? `<button class="btn btn--success btn--sm" onclick="askConfirm(${b.id})">✅</button>` : ''}
              ${b.status === 'pending' || b.status === 'confirmed' ? `<button class="btn btn--danger btn--sm" onclick="askCancelBooking(${b.id})">❌</button>` : ''}
            </div>
          </td>
        </tr>
      `;
      })
      .join('');
  },

  bindBookingListEvents() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener(
        'input',
        Utils.debounce((e) => this.renderBookingTable({ q: e.target.value }), 300)
      );
    }

    const filterStatus = document.getElementById('filterStatus');
    if (filterStatus) {
      filterStatus.addEventListener('change', (e) =>
        this.renderBookingTable({ status: e.target.value })
      );
    }

    const filterSpecialty = document.getElementById('filterSpecialty');
    if (filterSpecialty) {
      Storage.getSpecialties().forEach((s) => {
        const opt = document.createElement('option');
        opt.value = s.name;
        opt.textContent = s.name;
        filterSpecialty.appendChild(opt);
      });
      filterSpecialty.addEventListener('change', (e) =>
        this.renderBookingTable({ specialty: e.target.value })
      );
    }

    const filterDate = document.getElementById('filterDate');
    if (filterDate) {
      filterDate.addEventListener('change', (e) =>
        this.renderBookingTable({ date: e.target.value })
      );
    }

    // Confirm booking
    const confirmBookingBtn = document.getElementById('confirmBookingBtn');
    if (confirmBookingBtn) {
      confirmBookingBtn.addEventListener('click', () => {
        if (this._confirmId) {
          const result = BookingService.confirm(this._confirmId);
          if (result.success) {
            toast.success(result.message);
            closeModal('confirmModal');
            this.renderBookingTable();
          } else {
            toast.error(result.message);
          }
        }
      });
    }

    // Cancel booking
    const confirmCancelBtn = document.getElementById('confirmCancelBtn');
    if (confirmCancelBtn) {
      confirmCancelBtn.addEventListener('click', () => {
        if (this._cancelId) {
          const reason = document.getElementById('cancelReason')?.value || '';
          const result = BookingService.cancel(this._cancelId, reason);
          if (result.success) {
            toast.success(result.message);
            closeModal('cancelModal');
            this.renderBookingTable();
          } else {
            toast.error(result.message);
          }
        }
      });
    }
  },

  askConfirm(id) {
    this._confirmId = id;
    const b = BookingService.getById(id);
    if (!b) return;
    this.setText('confirmBookingCode', `#BK${String(b.id).slice(-6)}`);
    openModal('confirmModal');
  },

  askCancelBooking(id) {
    this._cancelId = id;
    const b = BookingService.getById(id);
    if (!b) return;
    this.setText('cancelBookingCode', `#BK${String(b.id).slice(-6)}`);
    openModal('cancelModal');
  },

  initBookingDetail() {
    const id = Utils.getQueryParam('id');
    const b = BookingService.getById(id);
    const loading = document.getElementById('loading');
    const notFound = document.getElementById('notFound');
    const content = document.getElementById('detailContent');

    if (!b) {
      if (loading) loading.style.display = 'none';
      if (notFound) notFound.style.display = 'block';
      return;
    }

    if (loading) loading.style.display = 'none';
    if (content) content.style.display = 'block';

    this.setText('detailSubtitle', `Chi tiết lịch khám #BK${String(b.id).slice(-6)}`);
    this.setText('bookingCode', `#BK${String(b.id).slice(-6)}`);
    this.setText('bookingCreatedAt', Utils.formatDate(b.createdAt));
    this.setText('bookingStatusBadge', CONFIG.BOOKING_STATUS_LABEL[b.status] || b.status);

    const user = UserService.getById(b.userId);
    this.setText('patientName', b.patientName);
    this.setText('patientPhone', b.phone);
    this.setText('patientEmail', user ? user.email : '—');
    this.setText('patientGender', CONFIG.GENDER_LABEL[b.gender] || '—');
    this.setText('patientBirthday', b.birthday ? Utils.formatDate(b.birthday) : '—');
    this.setText('patientAddress', b.address || '—');

    const doctor = DoctorService.getById(b.doctorId);
    this.setText('doctorName', b.doctorName);
    this.setText('doctorSpecialty', b.specialty);
    this.setText('doctorDegree', doctor ? doctor.degree : '—');
    this.setText('doctorAddress', doctor ? doctor.address : '—');

    this.setText('bookingDate', Utils.formatDate(b.date));
    this.setText('bookingTime', b.time);
    this.setText('bookingPayment', CONFIG.PAYMENT_METHOD_LABEL[b.payment] || b.payment);
    this.setText('bookingPrice', Utils.formatCurrency(b.price));
    this.setText('bookingNote', b.note || 'Không có ghi chú.');

    // Payment
    this.setText('payPrice', Utils.formatCurrency(b.price));
    this.setText('payDiscount', '0 đ');
    this.setText('payTotal', Utils.formatCurrency(b.price));
    this.setText('payStatus', b.status === 'completed' ? 'Đã thanh toán' : 'Chưa thanh toán');

    // Timeline
    this.renderBookingTimeline(b);
  },

  renderBookingTimeline(b) {
    const timeline = document.getElementById('statusTimeline');
    if (!timeline) return;

    const steps = [
      { key: 'created', label: 'Đặt lịch', time: b.createdAt },
      { key: 'confirmed', label: 'Xác nhận', time: b.status !== 'pending' ? b.updatedAt : null },
      { key: 'completed', label: 'Đã khám', time: b.status === 'completed' ? b.updatedAt : null },
    ];

    if (b.status === 'cancelled') {
      steps.push({ key: 'cancelled', label: 'Đã hủy', time: b.updatedAt });
    }

    timeline.innerHTML = steps
      .map((s, i) => {
        const isDone = s.time !== null;
        const isActive = i === steps.length - 1 && b.status !== 'cancelled';
        return `
        <li class="timeline__item ${isDone ? 'timeline__item--done' : ''} ${isActive ? 'timeline__item--active' : ''}">
          <span class="timeline__dot"></span>
          <div class="timeline__content">
            <strong>${s.label}</strong>
            <small>${s.time ? Utils.formatDateTime(s.time) : 'Chưa thực hiện'}</small>
          </div>
        </li>
      `;
      })
      .join('');
  },

  /* ============================================================
     BOOKING CALENDAR
     ============================================================ */

  initBookingCalendar() {
    this.calendarDate = new Date();
    this.renderCalendar();
    this.bindCalendarEvents();
  },

  renderCalendar() {
    const body = document.getElementById('calendarBody');
    const title = document.getElementById('calendarTitle');
    if (!body) return;

    const year = this.calendarDate.getFullYear();
    const month = this.calendarDate.getMonth();

    title.textContent = `Tháng ${month + 1}, ${year}`;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = (firstDay.getDay() + 6) % 7; // Thứ 2 = 0
    const totalDays = lastDay.getDate();

    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);

    let html = '';

    // Ô trống đầu tháng
    for (let i = 0; i < startDay; i++) {
      html += '<div class="calendar-day calendar-day--other-month"></div>';
    }

    // Các ngày trong tháng
    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isToday = dateStr === todayStr;
      const dayBookings = BookingService.getByDate(dateStr).filter(
        (b) => b.status !== 'cancelled'
      );

      html += `
        <div class="calendar-day ${isToday ? 'calendar-day--today' : ''}"
             onclick="openDayBookings('${dateStr}')">
          <div class="calendar-day__number">${day}</div>
          <div class="calendar-day__events">
            ${dayBookings
              .slice(0, 2)
              .map(
                (b) => `
              <div class="calendar-event calendar-event--${b.status}">
                ${b.time} ${Utils.truncate(b.patientName, 12)}
              </div>
            `
              )
              .join('')}
            ${dayBookings.length > 2 ? `<div class="calendar-event calendar-event--more">+${dayBookings.length - 2} khác</div>` : ''}
          </div>
        </div>
      `;
    }

    // Ô trống cuối tháng
    const remaining = (7 - ((startDay + totalDays) % 7)) % 7;
    for (let i = 0; i < remaining; i++) {
      html += '<div class="calendar-day calendar-day--other-month"></div>';
    }

    body.innerHTML = html;

    // Stats tháng
    const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    const monthBookings = BookingService.getAll().filter((b) => b.date.startsWith(monthPrefix));
    this.setText('monthTotalBookings', monthBookings.length);
    this.setText('monthPending', monthBookings.filter((b) => b.status === 'pending').length);
    this.setText('monthConfirmed', monthBookings.filter((b) => b.status === 'confirmed').length);
    this.setText('monthCancelled', monthBookings.filter((b) => b.status === 'cancelled').length);
  },

  bindCalendarEvents() {
    const prev = document.getElementById('prevMonthBtn');
    const next = document.getElementById('nextMonthBtn');
    const today = document.getElementById('todayBtn');

    if (prev) {
      prev.addEventListener('click', () => {
        this.calendarDate.setMonth(this.calendarDate.getMonth() - 1);
        this.renderCalendar();
      });
    }

    if (next) {
      next.addEventListener('click', () => {
        this.calendarDate.setMonth(this.calendarDate.getMonth() + 1);
        this.renderCalendar();
      });
    }

    if (today) {
      today.addEventListener('click', () => {
        this.calendarDate = new Date();
        this.renderCalendar();
      });
    }
  },

  openDayBookings(dateStr) {
    const bookings = BookingService.getByDate(dateStr);
    const body = document.getElementById('dayBookingsBody');
    const title = document.getElementById('dayBookingsTitle');

    if (!body) return;

    title.textContent = `Lịch khám ngày ${Utils.formatDate(dateStr)}`;

    if (bookings.length === 0) {
      body.innerHTML = '<p style="text-align:center;padding:24px;color:#6c757d">Không có lịch khám nào trong ngày này.</p>';
    } else {
      body.innerHTML = bookings
        .map((b) => {
          const statusLabel = CONFIG.BOOKING_STATUS_LABEL[b.status] || b.status;
          const statusClass = CONFIG.BOOKING_STATUS_CLASS[b.status] || '';
          return `
          <div style="padding:12px;border-bottom:1px solid #dee2e6">
            <div style="display:flex;justify-content:space-between;gap:12px">
              <div>
                <strong>${b.time} – ${Utils.escapeHtml(b.patientName)}</strong><br>
                <small style="color:#6c757d">${Utils.escapeHtml(b.doctorName)} • ${Utils.escapeHtml(b.specialty)}</small>
              </div>
              <span class="status ${statusClass}">${statusLabel}</span>
            </div>
            <div style="margin-top:8px">
              <a href="detail.html?id=${b.id}" class="btn btn--outline btn--sm">Xem chi tiết</a>
            </div>
          </div>
        `;
        })
        .join('');
    }

    openModal('dayBookingsModal');
  },

  /* ============================================================
     REPORTS
     ============================================================ */

  initReportRevenue() {
    this.renderRevenueStats();
    this.renderRevenueChart();
    this.renderRevenueTable();
    this.bindReportFilters();
  },

  renderRevenueStats() {
    const totalRevenue = BookingService.getTotalRevenue();
    const completed = BookingService.countByStatus('completed');
    const avg = completed > 0 ? totalRevenue / completed : 0;

    this.setText('statTotalRevenue', Utils.formatCurrency(totalRevenue, false));
    this.setText('statCompletedBookings', completed);
    this.setText('statAvgRevenue', Utils.formatCurrency(avg, false));
    this.setText('statGrowth', '+15%');
  },

  renderRevenueChart() {
    const container = document.getElementById('chartRevenueByDay');
    if (!container) return;

    const data = BookingService.getStatsByMonth(6);
    const max = Math.max(...data.map((d) => d.revenue), 1);

    container.innerHTML = data
      .map(
        (d) => `
      <div class="chart-bar">
        <div class="chart-bar__value">${Utils.formatCompact(d.revenue)}</div>
        <div class="chart-bar__fill" style="height:${(d.revenue / max) * 100}%"></div>
        <div class="chart-bar__label">${d.label}</div>
      </div>
    `
      )
      .join('');
  },

  renderRevenueTable() {
    const tbody = document.getElementById('revenueTableBody');
    if (!tbody) return;

    const data = BookingService.getStatsByDay(7);
    const total = data.reduce((s, d) => s + d.revenue, 0);

    tbody.innerHTML = data
      .map((d, i) => {
        const avg = d.count > 0 ? d.revenue / d.count : 0;
        const pct = total > 0 ? ((d.revenue / total) * 100).toFixed(1) : 0;
        return `
        <tr>
          <td>${i + 1}</td>
          <td>${Utils.formatDate(d.date)}</td>
          <td>${d.count}</td>
          <td>${Utils.formatCurrency(d.revenue)}</td>
          <td>${Utils.formatCurrency(avg)}</td>
          <td>${pct}%</td>
        </tr>
      `;
      })
      .join('');

    this.setText('totalBookings', data.reduce((s, d) => s + d.count, 0));
    this.setText('totalRevenue', Utils.formatCurrency(total));
  },

  bindReportFilters() {
    const applyBtn = document.getElementById('applyFilterBtn');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        toast.info('Đang áp dụng bộ lọc...');
        this.renderRevenueStats();
        this.renderRevenueChart();
        this.renderRevenueTable();
      });
    }

    const resetBtn = document.getElementById('resetFilterBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        document.getElementById('fromDate').value = '';
        document.getElementById('toDate').value = '';
        document.getElementById('periodSelect').value = 'month';
        this.renderRevenueStats();
        this.renderRevenueChart();
        this.renderRevenueTable();
        toast.info('Đã đặt lại bộ lọc.');
      });
    }
  },

  initReportBookings() {
    this.renderBookingReportStats();
    this.renderBookingReportTable();
    this.bindReportFilters();
  },

  renderBookingReportStats() {
    const stats = BookingService.getStatusStats();
    this.setText('statTotalBookings', stats.total);
    this.setText('statCompleted', stats.completed);
    this.setText('statPending', stats.pending);
    this.setText('statCancelled', stats.cancelled);
  },

  renderBookingReportTable() {
    const tbody = document.getElementById('bookingsTableBody');
    if (!tbody) return;

    const data = BookingService.getStatsByDay(7);
    let totals = { count: 0, completed: 0, pending: 0, cancelled: 0 };

    tbody.innerHTML = data
      .map((d, i) => {
        const dayBookings = BookingService.getByDate(d.date);
        const completed = dayBookings.filter((b) => b.status === 'completed').length;
        const pending = dayBookings.filter((b) => b.status === 'pending').length;
        const cancelled = dayBookings.filter((b) => b.status === 'cancelled').length;
        const rate = d.count > 0 ? ((completed / d.count) * 100).toFixed(0) : 0;

        totals.count += d.count;
        totals.completed += completed;
        totals.pending += pending;
        totals.cancelled += cancelled;

        return `
        <tr>
          <td>${i + 1}</td>
          <td>${Utils.formatDate(d.date)}</td>
          <td>${d.count}</td>
          <td class="text-success">${completed}</td>
          <td class="text-warning">${pending}</td>
          <td class="text-danger">${cancelled}</td>
          <td>${rate}%</td>
        </tr>
      `;
      })
      .join('');

    this.setText('totalBookings', totals.count);
    this.setText('totalCompleted', totals.completed);
    this.setText('totalPending', totals.pending);
    this.setText('totalCancelled', totals.cancelled);
    this.setText(
      'totalRate',
      totals.count > 0 ? ((totals.completed / totals.count) * 100).toFixed(0) + '%' : '0%'
    );
  },

  initReportDoctors() {
    this.renderDoctorReportStats();
    this.renderTopDoctorsReport();
    this.renderDoctorReportTable();
  },

  renderDoctorReportStats() {
    const doctors = DoctorService.getAll();
    const totalBookings = BookingService.count();
    const totalRevenue = BookingService.getTotalRevenue();
    const avgRating = doctors.length
      ? (doctors.reduce((s, d) => s + d.rating, 0) / doctors.length).toFixed(1)
      : 0;

    this.setText('statTotalDoctors', doctors.length);
    this.setText('statTotalBookings', totalBookings);
    this.setText('statTotalRevenue', Utils.formatCurrency(totalRevenue, false));
    this.setText('statAvgRating', avgRating);
  },

  renderTopDoctorsReport() {
    const topBookings = DoctorService.getTopByBookings(5);
    const topRevenue = DoctorService.getTopByRevenue(5);

    const list1 = document.getElementById('topDoctorsByBookings');
    if (list1) {
      list1.innerHTML = topBookings.length
        ? topBookings
            .map(
              (item, i) => `
          <li class="top-list__item">
            <span class="top-list__rank">${i + 1}</span>
            <div class="top-list__avatar">${item.doctor.icon || '👨‍⚕️'}</div>
            <div class="top-list__info">
              <strong>${Utils.escapeHtml(item.doctor.name)}</strong>
              <small>${Utils.escapeHtml(item.doctor.specialty)}</small>
            </div>
            <span class="top-list__value">${item.count}</span>
          </li>
        `
            )
            .join('')
        : '<li style="padding:16px;color:#6c757d">Chưa có dữ liệu</li>';
    }

    const list2 = document.getElementById('topDoctorsByRevenue');
    if (list2) {
      list2.innerHTML = topRevenue.length
        ? topRevenue
            .map(
              (item, i) => `
          <li class="top-list__item">
            <span class="top-list__rank">${i + 1}</span>
            <div class="top-list__avatar">${item.doctor.icon || '👨‍⚕️'}</div>
            <div class="top-list__info">
              <strong>${Utils.escapeHtml(item.doctor.name)}</strong>
              <small>${Utils.escapeHtml(item.doctor.specialty)}</small>
            </div>
            <span class="top-list__value">${Utils.formatCompact(item.revenue)}</span>
          </li>
        `
            )
            .join('')
        : '<li style="padding:16px;color:#6c757d">Chưa có dữ liệu</li>';
    }
  },

  renderDoctorReportTable() {
    const tbody = document.getElementById('doctorReportBody');
    if (!tbody) return;

    const stats = BookingService.getStatsByDoctor();

    tbody.innerHTML = stats
      .map((s, i) => {
        const rate = s.total > 0 ? ((s.completed / s.total) * 100).toFixed(0) : 0;
        return `
        <tr>
          <td>${i + 1}</td>
          <td><strong>${Utils.escapeHtml(s.doctor.name)}</strong></td>
          <td>${Utils.escapeHtml(s.doctor.specialty)}</td>
          <td>${s.doctor.degree}</td>
          <td>${s.total}</td>
          <td class="text-success">${s.completed}</td>
          <td class="text-danger">${s.cancelled}</td>
          <td>${rate}%</td>
          <td>${Utils.formatCurrency(s.revenue)}</td>
          <td>⭐ ${s.doctor.rating}</td>
        </tr>
      `;
      })
      .join('');
  },

  /* ============================================================
     SETTINGS
     ============================================================ */

  initSettingsGeneral() {
    this.renderSettingsTabs();
    this.loadSettings();

    const form = document.getElementById('settingsForm');
    const saveBtn = document.getElementById('saveAllBtn');

    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.saveSettings());
    }

    const resetBtn = document.querySelector('[onclick="resetSettings()"]');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetSettings());
    }

    // Preview logo/favicon
    const logoInput = document.getElementById('siteLogo');
    if (logoInput) {
      logoInput.addEventListener('change', (e) => this.previewAvatar(e, 'logoPreview'));
    }

    const confirmResetBtn = document.getElementById('confirmResetBtn');
    if (confirmResetBtn) {
      confirmResetBtn.addEventListener('click', () => {
        const input = document.getElementById('confirmResetInput')?.value;
        if (input === 'RESET') {
          Storage.clearApp();
          SeedData.init(true);
          toast.success('Đã đặt lại toàn bộ dữ liệu.');
          setTimeout(() => window.location.reload(), 1000);
        } else {
          toast.error('Vui lòng nhập chính xác "RESET".');
        }
      });
    }
  },

  renderSettingsTabs() {
    document.querySelectorAll('.settings-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;

        document.querySelectorAll('.settings-tab').forEach((t) => t.classList.remove('active'));
        document.querySelectorAll('.settings-panel').forEach((p) => p.classList.remove('active'));

        tab.classList.add('active');
        const panel = document.querySelector(`.settings-panel[data-panel="${target}"]`);
        if (panel) panel.classList.add('active');
      });
    });
  },

  loadSettings() {
    const settings = Storage.getSettings();

    Object.entries(settings).forEach(([key, value]) => {
      const el = document.getElementById(key);
      if (!el) return;

      if (el.type === 'checkbox') {
        el.checked = !!value;
      } else {
        el.value = value || '';
      }
    });
  },

  saveSettings() {
    const settings = Storage.getSettings();

    // Lấy tất cả input trong form settings
    document.querySelectorAll('#settingsForm input, #settingsForm select, #settingsForm textarea').forEach((el) => {
      if (!el.id) return;

      if (el.type === 'checkbox') {
        settings[el.id] = el.checked;
      } else {
        settings[el.id] = el.value;
      }
    });

    Storage.setSettings(settings);
    toast.success('Lưu cài đặt thành công!');
  },

  resetSettings() {
    confirmDialog({
      title: 'Đặt lại cài đặt',
      message: 'Bạn có chắc muốn đặt lại cài đặt về mặc định?',
      confirmText: 'Đặt lại',
      type: 'warning',
      onConfirm: () => {
        Storage.setSettings(SeedData.defaultSettings);
        this.loadSettings();
        toast.success('Đã đặt lại cài đặt.');
      },
    });
  },

  initSettingsProfile() {
    const user = AuthService.getCurrentUser();
    if (!user) return;

    // Fill info
    this.setValue('adminName', user.name);
    this.setValue('adminEmail', user.email);
    this.setValue('adminPhone', user.phone);
    this.setValue('adminGender', user.gender || '');
    this.setValue('adminBirthday', user.birthday || '');
    this.setValue('adminAddress', user.address || '');
    this.setValue('adminPosition', user.position || '');

    this.setText('adminId', user.id);
    this.setText('adminRole', 'Quản trị viên');
    this.setText('adminCreatedAt', Utils.formatDate(user.createdAt));
    this.setText('adminLastLogin', user.lastLogin ? Utils.timeAgo(user.lastLogin) : '—');

    const avatarPreview = document.getElementById('avatarPreview');
    if (avatarPreview) avatarPreview.textContent = Utils.getInitials(user.name);

    // Tabs
    document.querySelectorAll('.settings-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;
        document.querySelectorAll('.settings-tab').forEach((t) => t.classList.remove('active'));
        document.querySelectorAll('.settings-panel').forEach((p) => p.classList.remove('active'));
        tab.classList.add('active');
        const panel = document.querySelector(`.settings-panel[data-panel="${target}"]`);
        if (panel) panel.classList.add('active');
      });
    });

    // Info form
    const infoForm = document.getElementById('adminInfoForm');
    if (infoForm) {
      infoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveAdminInfo();
      });
    }

    // Password form
    const passForm = document.getElementById('adminPasswordForm');
    if (passForm) {
      passForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveAdminPassword();
      });
    }

    // Password strength
    const newPassInput = document.getElementById('newPassword');
    if (newPassInput) {
      newPassInput.addEventListener('input', () => {
        const result = Validator.passwordStrength(newPassInput.value);
        const fill = document.getElementById('strengthFill');
        const text = document.getElementById('strengthText');
        if (fill) fill.className = 'password-strength__fill ' + result.level;
        if (text) text.textContent = result.text;
      });
    }
  },

  saveAdminInfo() {
    const data = {
      name: document.getElementById('adminName').value.trim(),
      phone: document.getElementById('adminPhone').value.trim(),
      gender: document.getElementById('adminGender').value,
      birthday: document.getElementById('adminBirthday').value,
      address: document.getElementById('adminAddress').value.trim(),
      position: document.getElementById('adminPosition').value.trim(),
    };

    const result = UserService.updateProfile(data);

    if (result.success) {
      toast.success('Cập nhật hồ sơ thành công!');
      HeaderComponent.render();
      SidebarComponent.renderAdmin();
    } else {
      toast.error(result.message);
    }
  },

  saveAdminPassword() {
    const current = document.getElementById('currentPassword').value;
    const newPass = document.getElementById('newPassword').value;
    const confirm = document.getElementById('confirmPassword').value;

    const result = AuthService.changePassword(current, newPass, confirm);

    if (result.success) {
      toast.success(result.message);
      document.getElementById('adminPasswordForm').reset();
    } else {
      toast.error(result.message);
    }
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

  showNotFound() {
    const loading = document.getElementById('loading');
    const notFound = document.getElementById('notFound');
    if (loading) loading.style.display = 'none';
    if (notFound) notFound.style.display = 'block';
  },

  previewAvatar(e, targetId) {
    const file = e.target.files[0];
    if (!file) return;

    if (!Validator.image(file)) {
      toast.error('File không hợp lệ. Chọn ảnh JPG/PNG dưới 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const el = document.getElementById(targetId);
      if (el) el.innerHTML = `<img src="${ev.target.result}" alt="preview">`;
    };
    reader.readAsDataURL(file);
  },
};

/* ===== GLOBAL HELPERS ===== */
if (typeof window !== 'undefined') {
  window.AdminPage = AdminPage;

  window.askDeleteDoctor = (id, name) => AdminPage.askDeleteDoctor(id, name);
  window.askDeleteSpecialty = (id, name) => AdminPage.askDeleteSpecialty(id, name);
  window.askDeleteUser = (id, name) => AdminPage.askDeleteUser(id, name);
  window.askConfirm = (id) => AdminPage.askConfirm(id);
  window.askCancelBooking = (id) => AdminPage.askCancelBooking(id);
  window.openDayBookings = (date) => AdminPage.openDayBookings(date);
  window.selectIcon = (icon) => {
    const input = document.getElementById('spIcon');
    if (input) input.value = icon;
    AdminPage.setText('iconPreview', icon);
  };
  window.resetSettings = () => AdminPage.resetSettings();
  window.exportDoctors = () => toast.info('Tính năng xuất Excel đang phát triển.');
  window.exportSpecialties = () => toast.info('Tính năng xuất Excel đang phát triển.');
  window.exportUsers = () => toast.info('Tính năng xuất Excel đang phát triển.');
  window.exportBookings = () => toast.info('Tính năng xuất Excel đang phát triển.');
  window.exportReport = () => toast.info('Tính năng xuất Excel đang phát triển.');
  window.testEmail = () => toast.info('Đang gửi email thử...');
  window.clearCache = () => {
    Storage.clearApp();
    toast.success('Đã xóa cache.');
  };
  window.openCreateUserModal = () => {
  AdminPage.openCreateUserModal();
};

window.openEditUserModal = (id) => {
  AdminPage.openEditUserModal(id);
};
  window.toggleUserBlock = () => {
    const btn = document.getElementById('blockBtn');
    if (btn) btn.click();
  };
  window.resetUserPassword = () => openModal('resetPasswordModal');
  window.revokeSession = (btn) => {
    if (btn) btn.closest('.session-item').remove();
    toast.success('Đã đăng xuất thiết bị.');
  };
  window.logoutAllDevices = () => {
    AuthService.logoutAll();
    toast.success('Đã đăng xuất khỏi tất cả thiết bị.');
  };
  window.loadMoreActivity = () => toast.info('Đang tải thêm hoạt động...');

  document.addEventListener('DOMContentLoaded', () => {
    AdminPage.init();
  });
}