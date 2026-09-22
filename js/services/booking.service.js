/* ============================================================
   BOOKING SERVICE
   CRUD lịch khám + xác nhận, hủy, thống kê
   ============================================================ */

const BookingService = {
  /* ============================================================
     READ
     ============================================================ */

  /**
   * Lấy tất cả bookings
   */
  getAll() {
    return Storage.getBookings();
  },

  /**
   * Lấy booking theo ID
   */
  getById(id) {
    if (id === null || id === undefined) return null;
    return this.getAll().find((b) => String(b.id) === String(id)) || null;
  },

  /**
   * Lấy bookings của user
   */
  getByUser(userId) {
    return this.getAll()
      .filter((b) => String(b.userId) === String(userId))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  /**
   * Lấy bookings của bác sĩ
   */
  getByDoctor(doctorId) {
    return this.getAll()
      .filter((b) => String(b.doctorId) === String(doctorId))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  /**
   * Lấy bookings theo ngày
   */
  getByDate(date) {
    return this.getAll().filter((b) => b.date === date);
  },

  /**
   * Lấy bookings theo trạng thái
   */
  getByStatus(status) {
    return this.getAll().filter((b) => b.status === status);
  },

  /* ============================================================
     SEARCH & FILTER
     ============================================================ */

  /**
   * Tìm kiếm + lọc + phân trang
   */
  search(options = {}) {
    const {
      q = '',
      status = '',
      specialty = '',
      date = '',
      userId = null,
      doctorId = null,
      sortBy = 'newest',
      page = 1,
      limit = CONFIG.PAGINATION.DEFAULT_LIMIT,
    } = options;

    let list = this.getAll();

    // Lọc theo user
    if (userId) {
      list = list.filter((b) => String(b.userId) === String(userId));
    }

    // Lọc theo doctor
    if (doctorId) {
      list = list.filter((b) => String(b.doctorId) === String(doctorId));
    }

    // Tìm kiếm
    if (q && q.trim()) {
      const keyword = q.toLowerCase().trim();
      list = list.filter(
        (b) =>
          b.patientName.toLowerCase().includes(keyword) ||
          b.doctorName.toLowerCase().includes(keyword) ||
          b.specialty.toLowerCase().includes(keyword) ||
          String(b.id).includes(keyword) ||
          b.phone.includes(keyword)
      );
    }

    // Lọc theo trạng thái
    if (status) {
      list = list.filter((b) => b.status === status);
    }

    // Lọc theo chuyên khoa
    if (specialty) {
      list = list.filter((b) => b.specialty === specialty);
    }

    // Lọc theo ngày
    if (date) {
      list = list.filter((b) => b.date === date);
    }

    // Sắp xếp
    switch (sortBy) {
      case 'date-asc':
        list.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case 'date-desc':
        list.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case 'oldest':
        list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'newest':
      default:
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }

    return Utils.paginate(list, page, limit);
  },

  /* ============================================================
     CREATE
     ============================================================ */

  /**
   * Tạo booking mới
   */
  create(data) {
    const user = AuthService.getCurrentUser();
    if (!user) {
      return { success: false, message: 'Bạn cần đăng nhập để đặt lịch.' };
    }

    // Validate
    if (!data.doctorId || !data.date || !data.time || !data.patientName || !data.phone) {
      return { success: false, message: 'Vui lòng nhập đầy đủ thông tin.' };
    }

    if (!Validator.phone(data.phone)) {
      return { success: false, message: 'Số điện thoại không hợp lệ.' };
    }

    // Kiểm tra ngày hợp lệ
    const bookingDate = new Date(data.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (bookingDate < today) {
      return { success: false, message: 'Ngày khám không thể ở quá khứ.' };
    }

    // Lấy doctor
    const doctor = DoctorService.getById(data.doctorId);
    if (!doctor) {
      return { success: false, message: 'Không tìm thấy bác sĩ.' };
    }

    // Kiểm tra trùng giờ
    const existing = this.getAll().find(
      (b) =>
        String(b.doctorId) === String(data.doctorId) &&
        b.date === data.date &&
        b.time === data.time &&
        (b.status === 'pending' || b.status === 'confirmed')
    );

    if (existing) {
      return {
        success: false,
        message: 'Khung giờ này đã có người đặt. Vui lòng chọn giờ khác.',
      };
    }

    const bookings = this.getAll();
    const now = new Date().toISOString();

    const newBooking = {
      id: Date.now(),
      userId: user.id,
      doctorId: Number(data.doctorId),
      doctorName: doctor.name,
      specialty: doctor.specialty,
      date: data.date,
      time: data.time,
      patientName: data.patientName.trim(),
      phone: data.phone.trim(),
      gender: data.gender || '',
      birthday: data.birthday || '',
      address: data.address || '',
      note: data.note || '',
      payment: data.payment || 'cod',
      price: doctor.price,
      status: CONFIG.BOOKING_STATUS.PENDING,
      createdAt: now,
      updatedAt: now,
    };

    bookings.push(newBooking);
    Storage.setBookings(bookings);

    return {
      success: true,
      message: 'Đặt lịch thành công!',
      booking: newBooking,
    };
  },

  /* ============================================================
     UPDATE
     ============================================================ */

  /**
   * Cập nhật booking
   */
  update(id, data) {
    const bookings = this.getAll();
    const index = bookings.findIndex((b) => String(b.id) === String(id));

    if (index === -1) {
      return { success: false, message: 'Không tìm thấy lịch khám.' };
    }

    bookings[index] = {
      ...bookings[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    Storage.setBookings(bookings);

    return {
      success: true,
      message: 'Cập nhật lịch khám thành công!',
      booking: bookings[index],
    };
  },

  /**
   * Xác nhận lịch khám (admin)
   */
  confirm(id) {
    const booking = this.getById(id);
    if (!booking) {
      return { success: false, message: 'Không tìm thấy lịch khám.' };
    }

    if (booking.status !== CONFIG.BOOKING_STATUS.PENDING) {
      return {
        success: false,
        message: 'Chỉ có thể xác nhận lịch đang chờ xác nhận.',
      };
    }

    return this.update(id, { status: CONFIG.BOOKING_STATUS.CONFIRMED });
  },

  /**
   * Đánh dấu đã khám (admin)
   */
  complete(id) {
    const booking = this.getById(id);
    if (!booking) {
      return { success: false, message: 'Không tìm thấy lịch khám.' };
    }

    if (booking.status !== CONFIG.BOOKING_STATUS.CONFIRMED) {
      return {
        success: false,
        message: 'Chỉ có thể đánh dấu đã khám cho lịch đã xác nhận.',
      };
    }

    return this.update(id, { status: CONFIG.BOOKING_STATUS.COMPLETED });
  },

  /**
   * Hủy lịch khám
   */
  cancel(id, reason = '') {
    const booking = this.getById(id);
    if (!booking) {
      return { success: false, message: 'Không tìm thấy lịch khám.' };
    }

    if (booking.status === CONFIG.BOOKING_STATUS.CANCELLED) {
      return { success: false, message: 'Lịch này đã bị hủy trước đó.' };
    }

    if (booking.status === CONFIG.BOOKING_STATUS.COMPLETED) {
      return { success: false, message: 'Không thể hủy lịch đã khám.' };
    }

    return this.update(id, {
      status: CONFIG.BOOKING_STATUS.CANCELLED,
      cancelReason: reason,
    });
  },

  /**
   * Xóa booking
   */
  delete(id) {
    const bookings = this.getAll();
    const index = bookings.findIndex((b) => String(b.id) === String(id));

    if (index === -1) {
      return { success: false, message: 'Không tìm thấy lịch khám.' };
    }

    bookings.splice(index, 1);
    Storage.setBookings(bookings);

    return { success: true, message: 'Đã xóa lịch khám.' };
  },

  /* ============================================================
     SLOT AVAILABILITY
     ============================================================ */

  /**
   * Lấy khung giờ còn trống của bác sĩ theo ngày
   */
  getAvailableSlots(doctorId, date) {
    const allSlots = CONFIG.BOOKING.TIME_SLOTS;
    const booked = this.getAll()
      .filter(
        (b) =>
          String(b.doctorId) === String(doctorId) &&
          b.date === date &&
          (b.status === 'pending' || b.status === 'confirmed')
      )
      .map((b) => b.time);

    return allSlots.map((slot) => ({
      time: slot,
      available: !booked.includes(slot),
    }));
  },

  /* ============================================================
     STATISTICS
     ============================================================ */

  count() {
    return this.getAll().length;
  },

  countByStatus(status) {
    return this.getAll().filter((b) => b.status === status).length;
  },

  countByUser(userId) {
    return this.getAll().filter((b) => String(b.userId) === String(userId)).length;
  },

  countByDate(date) {
    return this.getAll().filter((b) => b.date === date).length;
  },

  /**
   * Tổng doanh thu (chỉ tính lịch đã khám)
   */
  getTotalRevenue() {
    return this.getAll()
      .filter((b) => b.status === 'completed')
      .reduce((sum, b) => sum + (b.price || 0), 0);
  },

  /**
   * Doanh thu theo khoảng thời gian
   */
  getRevenueByRange(fromDate, toDate) {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    return this.getAll()
      .filter((b) => {
        if (b.status !== 'completed') return false;
        const d = new Date(b.date);
        return d >= from && d <= to;
      })
      .reduce((sum, b) => sum + (b.price || 0), 0);
  },

  /**
   * Thống kê theo trạng thái
   */
  getStatusStats() {
    const all = this.getAll();
    return {
      total: all.length,
      pending: all.filter((b) => b.status === 'pending').length,
      confirmed: all.filter((b) => b.status === 'confirmed').length,
      completed: all.filter((b) => b.status === 'completed').length,
      cancelled: all.filter((b) => b.status === 'cancelled').length,
    };
  },

  /**
   * Thống kê theo chuyên khoa
   */
  getStatsBySpecialty() {
    const all = this.getAll();
    const stats = {};

    all.forEach((b) => {
      if (!stats[b.specialty]) {
        stats[b.specialty] = { count: 0, revenue: 0 };
      }
      stats[b.specialty].count++;
      if (b.status === 'completed') {
        stats[b.specialty].revenue += b.price || 0;
      }
    });

    return Object.entries(stats)
      .map(([specialty, data]) => ({ specialty, ...data }))
      .sort((a, b) => b.count - a.count);
  },

  /**
   * Thống kê theo ngày (7 ngày gần đây)
   */
  getStatsByDay(days = 7) {
    const result = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);

      const dayBookings = this.getAll().filter((b) => b.date === dateStr);
      const dayLabel = `${d.getDate()}/${d.getMonth() + 1}`;

      result.push({
        date: dateStr,
        label: dayLabel,
        count: dayBookings.length,
        revenue: dayBookings
          .filter((b) => b.status === 'completed')
          .reduce((sum, b) => sum + (b.price || 0), 0),
      });
    }

    return result;
  },

  /**
   * Thống kê theo tháng (6 tháng gần đây)
   */
  getStatsByMonth(months = 6) {
    const result = [];
    const today = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

      const monthBookings = this.getAll().filter((b) =>
        b.date.startsWith(monthStr)
      );

      result.push({
        month: monthStr,
        label: `T${d.getMonth() + 1}`,
        count: monthBookings.length,
        revenue: monthBookings
          .filter((b) => b.status === 'completed')
          .reduce((sum, b) => sum + (b.price || 0), 0),
      });
    }

    return result;
  },

  /**
   * Thống kê theo khung giờ
   */
  getStatsByHour() {
    const all = this.getAll();
    const stats = {};

    all.forEach((b) => {
      const hour = b.time.split(':')[0] + ':00';
      stats[hour] = (stats[hour] || 0) + 1;
    });

    return Object.entries(stats)
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => a.hour.localeCompare(b.hour));
  },

  /**
   * Thống kê theo bác sĩ
   */
  getStatsByDoctor() {
    const doctors = DoctorService.getAll();
    return doctors
      .map((d) => {
        const doctorBookings = this.getAll().filter(
          (b) => String(b.doctorId) === String(d.id)
        );
        const completed = doctorBookings.filter((b) => b.status === 'completed');
        return {
          doctor: d,
          total: doctorBookings.length,
          completed: completed.length,
          cancelled: doctorBookings.filter((b) => b.status === 'cancelled').length,
          revenue: completed.reduce((sum, b) => sum + (b.price || 0), 0),
        };
      })
      .sort((a, b) => b.total - a.total);
  },
};

/* ===== EXPORT ===== */
if (typeof window !== 'undefined') {
  window.BookingService = BookingService;
}