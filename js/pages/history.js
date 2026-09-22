/* ============================================================
   PAGE — HISTORY
   Logic trang lịch sử đặt lịch
   ============================================================ */

const HistoryPage = {
  state: {
    status: 'all',
    q: '',
    page: 1,
    limit: 10,
  },

  /* ============================================================
     INIT
     ============================================================ */

  init() {
    const user = AuthService.requireLogin();
    if (!user) return;

    this.bindEvents();
    this.render();
  },

  /* ============================================================
     BIND EVENTS
     ============================================================ */

  bindEvents() {
    // Tab filter
    document.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.state.status = btn.dataset.status;
        this.state.page = 1;
        this.render();
      });
    });

    // Search
    const searchInput = document.getElementById('historySearch');
    if (searchInput) {
      searchInput.addEventListener(
        'input',
        Utils.debounce((e) => {
          this.state.q = e.target.value;
          this.state.page = 1;
          this.render();
        }, 300)
      );
    }

    // Modal xác nhận hủy
    const confirmCancelBtn = document.getElementById('confirmCancelBtn');
    if (confirmCancelBtn) {
      confirmCancelBtn.addEventListener('click', () => {
        if (this._cancelId) {
          const result = BookingService.cancel(this._cancelId);
          if (result.success) {
            toast.success('Đã hủy lịch khám.');
            closeModal('cancelModal');
            this.render();
          } else {
            toast.error(result.message);
          }
        }
      });
    }
  },

  /* ============================================================
     RENDER
     ============================================================ */

  render() {
    const user = AuthService.getCurrentUser();
    if (!user) return;

    const options = {
      userId: user.id,
      q: this.state.q,
      status: this.state.status === 'all' ? '' : this.state.status,
      sortBy: 'newest',
      page: this.state.page,
      limit: this.state.limit,
    };

    const result = BookingService.search(options);

    this.renderCount(result.total);
    this.renderTable(result.data);
    this.renderPagination(result);
  },

  renderCount(total) {
    const el = document.getElementById('resultCount');
    if (!el) return;
    el.innerHTML = `Bạn có <strong>${total}</strong> lịch khám`;
  },

  renderTable(bookings) {
    const tbody = document.getElementById('historyBody');
    const tableWrap = document.getElementById('historyTableWrap');
    const emptyState = document.getElementById('emptyState');

    if (!tbody) return;

    if (bookings.length === 0) {
      if (tableWrap) tableWrap.style.display = 'none';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (tableWrap) tableWrap.style.display = 'block';
    if (emptyState) emptyState.style.display = 'none';

    tbody.innerHTML = bookings
      .map((b) => {
        const statusLabel = CONFIG.BOOKING_STATUS_LABEL[b.status] || b.status;
        const statusClass = CONFIG.BOOKING_STATUS_CLASS[b.status] || '';

        return `
        <tr>
          <td><strong>#BK${String(b.id).slice(-6)}</strong></td>
          <td>${Utils.escapeHtml(b.doctorName)}</td>
          <td>${Utils.escapeHtml(b.specialty)}</td>
          <td>${Utils.formatDate(b.date)} ${b.time}</td>
          <td>${Utils.escapeHtml(b.patientName)}</td>
          <td>${Utils.formatCurrency(b.price)}</td>
          <td><span class="status ${statusClass}">${statusLabel}</span></td>
          <td>
            <div class="table-actions">
              <button class="btn btn--outline btn--sm" onclick="viewBooking(${b.id})">
                👁️
              </button>
              ${
                b.status === 'pending'
                  ? `<button class="btn btn--danger btn--sm" onclick="askCancel(${b.id})">Hủy</button>`
                  : ''
              }
            </div>
          </td>
        </tr>
      `;
      })
      .join('');
  },

  /* ============================================================
     PAGINATION
     ============================================================ */

  renderPagination({ total, totalPages, page }) {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;

    if (totalPages <= 1) {
      pagination.innerHTML = '';
      return;
    }

    let html = '';

    html += `<button class="pagination__arrow" data-page="${page - 1}" ${page === 1 ? 'disabled' : ''}>‹</button>`;

    for (let i = 1; i <= totalPages; i++) {
      html += `<button class="pagination__item ${i === page ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }

    html += `<button class="pagination__arrow" data-page="${page + 1}" ${page === totalPages ? 'disabled' : ''}>›</button>`;

    pagination.innerHTML = html;

    pagination.querySelectorAll('button[data-page]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.state.page = Number(btn.dataset.page);
        this.render();
        Utils.scrollTo(document.querySelector('.section'), 100);
      });
    });
  },

  /* ============================================================
     ACTIONS
     ============================================================ */

  viewBooking(id) {
    const b = BookingService.getById(id);
    if (!b) return;

    const statusLabel = CONFIG.BOOKING_STATUS_LABEL[b.status] || b.status;
    const paymentLabel = CONFIG.PAYMENT_METHOD_LABEL[b.payment] || b.payment;

    const body = document.getElementById('detailModalBody');
    if (!body) return;

    body.innerHTML = `
      <div class="info-list">
        <div class="info-row">
          <span>Mã đặt lịch:</span>
          <strong>#BK${String(b.id).slice(-6)}</strong>
        </div>
        <div class="info-row">
          <span>Bác sĩ:</span>
          <strong>${Utils.escapeHtml(b.doctorName)}</strong>
        </div>
        <div class="info-row">
          <span>Chuyên khoa:</span>
          <strong>${Utils.escapeHtml(b.specialty)}</strong>
        </div>
        <div class="info-row">
          <span>Ngày khám:</span>
          <strong>${Utils.formatDate(b.date)}</strong>
        </div>
        <div class="info-row">
          <span>Giờ khám:</span>
          <strong>${b.time}</strong>
        </div>
        <div class="info-row">
          <span>Bệnh nhân:</span>
          <strong>${Utils.escapeHtml(b.patientName)}</strong>
        </div>
        <div class="info-row">
          <span>Số điện thoại:</span>
          <strong>${Utils.escapeHtml(b.phone)}</strong>
        </div>
        <div class="info-row">
          <span>Phương thức thanh toán:</span>
          <strong>${paymentLabel}</strong>
        </div>
        <div class="info-row">
          <span>Trạng thái:</span>
          <strong>${statusLabel}</strong>
        </div>
        <div class="info-row info-row--total">
          <span>Tổng tiền:</span>
          <strong>${Utils.formatCurrency(b.price)}</strong>
        </div>
      </div>
      ${
        b.note
          ? `<div style="margin-top:16px">
              <strong>Ghi chú:</strong>
              <p style="margin-top:6px;color:#6c757d">${Utils.escapeHtml(b.note)}</p>
            </div>`
          : ''
      }
    `;

    openModal('detailModal');
  },

  askCancel(id) {
    this._cancelId = id;
    const b = BookingService.getById(id);
    if (!b) return;

    const codeEl = document.getElementById('cancelBookingCode');
    if (codeEl) codeEl.textContent = `#BK${String(b.id).slice(-6)}`;

    openModal('cancelModal');
  },
};

/* ===== GLOBAL HELPERS ===== */
if (typeof window !== 'undefined') {
  window.HistoryPage = HistoryPage;

  window.viewBooking = (id) => HistoryPage.viewBooking(id);
  window.askCancel = (id) => HistoryPage.askCancel(id);

  document.addEventListener('DOMContentLoaded', () => {
    HistoryPage.init();
  });
}