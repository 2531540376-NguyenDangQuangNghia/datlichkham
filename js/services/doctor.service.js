/* ============================================================
   DOCTOR SERVICE
   CRUD bác sĩ + tìm kiếm, lọc, sắp xếp
   ============================================================ */

const DoctorService = {
  /* ============================================================
     READ
     ============================================================ */

  /**
   * Lấy tất cả bác sĩ
   */
  getAll() {
    return Storage.getDoctors();
  },

  /**
   * Lấy bác sĩ theo ID
   */
  getById(id) {
    if (id === null || id === undefined) return null;
    const doctors = this.getAll();
    return doctors.find((d) => String(d.id) === String(id)) || null;
  },

  /**
   * Lấy bác sĩ theo chuyên khoa
   */
  getBySpecialty(specialtyId) {
    const doctors = this.getAll();
    return doctors.filter(
      (d) => String(d.specialtyId) === String(specialtyId) && d.status === 'active'
    );
  },

  /**
   * Lấy bác sĩ nổi bật
   */
  getFeatured(limit = 6) {
    return this.getAll()
      .filter((d) => d.featured && d.status === 'active')
      .slice(0, limit);
  },

  /**
   * Lấy bác sĩ liên quan (cùng chuyên khoa, khác ID)
   */
  getRelated(doctorId, limit = 3) {
    const doctor = this.getById(doctorId);
    if (!doctor) return [];

    return this.getAll()
      .filter(
        (d) =>
          d.specialtyId === doctor.specialtyId &&
          d.id !== doctor.id &&
          d.status === 'active'
      )
      .slice(0, limit);
  },

  /* ============================================================
     SEARCH & FILTER
     ============================================================ */

  /**
   * Tìm kiếm + lọc + sắp xếp + phân trang
   * @param {object} options
   * @returns {object} { data, total, totalPages, page, limit }
   */
  search(options = {}) {
    const {
      q = '',
      specialtyId = '',
      specialty = '',
      minPrice = null,
      maxPrice = null,
      minRating = null,
      minExperience = null,
      status = 'active',
      sortBy = '',
      page = 1,
      limit = CONFIG.PAGINATION.DEFAULT_LIMIT,
    } = options;

    let list = this.getAll();

    // Lọc theo trạng thái
    if (status) {
      list = list.filter((d) => d.status === status);
    }

    // Tìm kiếm theo từ khóa
    if (q && q.trim()) {
      const keyword = q.toLowerCase().trim();
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(keyword) ||
          d.specialty.toLowerCase().includes(keyword) ||
          (d.bio && d.bio.toLowerCase().includes(keyword))
      );
    }

    // Lọc theo chuyên khoa (ID hoặc tên)
    if (specialtyId) {
      list = list.filter((d) => String(d.specialtyId) === String(specialtyId));
    }
    if (specialty) {
      list = list.filter((d) => d.specialty === specialty);
    }

    // Lọc theo giá
    if (minPrice !== null && minPrice !== '') {
      list = list.filter((d) => d.price >= Number(minPrice));
    }
    if (maxPrice !== null && maxPrice !== '') {
      list = list.filter((d) => d.price <= Number(maxPrice));
    }

    // Lọc theo đánh giá
    if (minRating !== null && minRating !== '') {
      list = list.filter((d) => d.rating >= Number(minRating));
    }

    // Lọc theo kinh nghiệm
    if (minExperience !== null && minExperience !== '') {
      list = list.filter((d) => d.experience >= Number(minExperience));
    }

    // Sắp xếp
    if (sortBy) {
      switch (sortBy) {
        case 'price-asc':
          list = Utils.sortBy(list, 'price', 'asc');
          break;
        case 'price-desc':
          list = Utils.sortBy(list, 'price', 'desc');
          break;
        case 'rating':
          list = Utils.sortBy(list, 'rating', 'desc');
          break;
        case 'experience':
          list = Utils.sortBy(list, 'experience', 'desc');
          break;
        case 'name-asc':
          list = Utils.sortBy(list, 'name', 'asc');
          break;
        case 'name-desc':
          list = Utils.sortBy(list, 'name', 'desc');
          break;
        default:
          break;
      }
    }

    // Phân trang
    return Utils.paginate(list, page, limit);
  },

  /* ============================================================
     CREATE / UPDATE / DELETE
     ============================================================ */

  /**
   * Tạo bác sĩ mới
   */
  create(data) {
    if (!data.name || !data.specialtyId || !data.price) {
      return { success: false, message: 'Vui lòng nhập đầy đủ thông tin bắt buộc.' };
    }

    const doctors = this.getAll();
    const now = new Date().toISOString();

    // Tìm chuyên khoa
    const specialty = Storage.getSpecialties().find(
      (s) => String(s.id) === String(data.specialtyId)
    );

    const newDoctor = {
      id: Date.now(),
      name: data.name.trim(),
      slug: Utils.slugify(data.name),
      specialtyId: Number(data.specialtyId),
      specialty: specialty ? specialty.name : data.specialty || '',
      degree: data.degree || 'BS',
      experience: Number(data.experience) || 0,
      price: Number(data.price) || 0,
      rating: Number(data.rating) || 5.0,
      reviewCount: 0,
      patientCount: 0,
      icon: data.icon || '👨‍⚕️',
      avatar: data.avatar || '',
      bio: data.bio || '',
      expertise: data.expertise || [],
      qualifications: data.qualifications || [],
      workDays: data.workDays || [2, 3, 4, 5, 6],
      workStart: data.workStart || '08:00',
      workEnd: data.workEnd || '17:00',
      address: data.address || '',
      hospital: data.hospital || '',
      status: data.status || 'active',
      featured: data.featured || false,
      createdAt: now,
      updatedAt: now,
    };

    doctors.push(newDoctor);
    Storage.setDoctors(doctors);

    return {
      success: true,
      message: 'Thêm bác sĩ thành công!',
      doctor: newDoctor,
    };
  },

  /**
   * Cập nhật bác sĩ
   */
  update(id, data) {
    const doctors = this.getAll();
    const index = doctors.findIndex((d) => String(d.id) === String(id));

    if (index === -1) {
      return { success: false, message: 'Không tìm thấy bác sĩ.' };
    }

    const specialty = Storage.getSpecialties().find(
      (s) => String(s.id) === String(data.specialtyId)
    );

    const updated = {
      ...doctors[index],
      ...data,
      specialtyId: data.specialtyId ? Number(data.specialtyId) : doctors[index].specialtyId,
      specialty: specialty ? specialty.name : (data.specialty || doctors[index].specialty),
      experience: data.experience !== undefined ? Number(data.experience) : doctors[index].experience,
      price: data.price !== undefined ? Number(data.price) : doctors[index].price,
      rating: data.rating !== undefined ? Number(data.rating) : doctors[index].rating,
      updatedAt: new Date().toISOString(),
    };

    if (data.name) updated.slug = Utils.slugify(data.name);

    doctors[index] = updated;
    Storage.setDoctors(doctors);

    return {
      success: true,
      message: 'Cập nhật bác sĩ thành công!',
      doctor: updated,
    };
  },

  /**
   * Xóa bác sĩ
   */
  delete(id) {
    const doctors = this.getAll();
    const index = doctors.findIndex((d) => String(d.id) === String(id));

    if (index === -1) {
      return { success: false, message: 'Không tìm thấy bác sĩ.' };
    }

    // Kiểm tra có booking chưa hoàn thành không
    const bookings = Storage.getBookings();
    const hasPendingBooking = bookings.some(
      (b) =>
        String(b.doctorId) === String(id) &&
        (b.status === 'pending' || b.status === 'confirmed')
    );

    if (hasPendingBooking) {
      return {
        success: false,
        message: 'Không thể xóa bác sĩ đang có lịch khám chờ xác nhận.',
      };
    }

    doctors.splice(index, 1);
    Storage.setDoctors(doctors);

    return { success: true, message: 'Đã xóa bác sĩ.' };
  },

  /**
   * Xóa nhiều bác sĩ
   */
  deleteMany(ids) {
    const doctors = this.getAll();
    const filtered = doctors.filter((d) => !ids.includes(String(d.id)));
    Storage.setDoctors(filtered);
    return {
      success: true,
      message: `Đã xóa ${doctors.length - filtered.length} bác sĩ.`,
    };
  },

  /* ============================================================
     STATISTICS
     ============================================================ */

  /**
   * Đếm tổng bác sĩ
   */
  count() {
    return this.getAll().length;
  },

  /**
   * Đếm bác sĩ đang hoạt động
   */
  countActive() {
    return this.getAll().filter((d) => d.status === 'active').length;
  },

  /**
   * Top bác sĩ theo số lượt khám
   */
  getTopByBookings(limit = 5) {
    const bookings = Storage.getBookings();
    const counts = {};

    bookings.forEach((b) => {
      if (b.status === 'completed' || b.status === 'confirmed') {
        counts[b.doctorId] = (counts[b.doctorId] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .map(([doctorId, count]) => ({
        doctor: this.getById(doctorId),
        count,
      }))
      .filter((item) => item.doctor)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  },

  /**
   * Top bác sĩ theo doanh thu
   */
  getTopByRevenue(limit = 5) {
    const bookings = Storage.getBookings();
    const revenue = {};

    bookings.forEach((b) => {
      if (b.status === 'completed') {
        revenue[b.doctorId] = (revenue[b.doctorId] || 0) + (b.price || 0);
      }
    });

    return Object.entries(revenue)
      .map(([doctorId, total]) => ({
        doctor: this.getById(doctorId),
        revenue: total,
      }))
      .filter((item) => item.doctor)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);
  },
};

/* ===== EXPORT ===== */
if (typeof window !== 'undefined') {
  window.DoctorService = DoctorService;
}