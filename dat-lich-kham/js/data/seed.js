/* ============================================================
   DATA — SEED
   Khởi tạo dữ liệu mặc định vào localStorage (chỉ chạy 1 lần)
   ============================================================ */

const SeedData = {
  /* ===== DỮ LIỆU NGƯỜI DÙNG MẶC ĐỊNH ===== */
  defaultUsers: [
    {
      id: 1,
      name: 'Quản trị viên',
      email: 'admin@clinic.vn',
      phone: '0900000000',
      password: 'admin123',
      role: 'admin',
      gender: '',
      birthday: '',
      address: '',
      insurance: '',
      avatar: '',
      status: 'active',
      verified: true,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
      lastLogin: '',
    },
    {
      id: 2,
      name: 'Nguyễn Văn A',
      email: 'user@clinic.vn',
      phone: '0912345678',
      password: 'user123',
      role: 'user',
      gender: 'male',
      birthday: '1990-05-15',
      address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
      insurance: 'DN4012345678901',
      avatar: '',
      status: 'active',
      verified: true,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
      lastLogin: '',
    },
    {
      id: 3,
      name: 'Trần Thị B',
      email: 'tranthib@clinic.vn',
      phone: '0987654321',
      password: 'user123',
      role: 'user',
      gender: 'female',
      birthday: '1995-08-20',
      address: '456 Lê Lợi, Quận 3, TP.HCM',
      insurance: '',
      avatar: '',
      status: 'active',
      verified: true,
      createdAt: '2026-01-02',
      updatedAt: '2026-01-02',
      lastLogin: '',
    },
  ],

  /* ===== DỮ LIỆU BOOKING MẪU ===== */
  defaultBookings: [
    {
      id: 1,
      userId: 2,
      doctorId: 1,
      doctorName: 'BS. Nguyễn Văn An',
      specialty: 'Tim mạch',
      date: '2026-09-20',
      time: '09:00',
      patientName: 'Nguyễn Văn A',
      phone: '0912345678',
      gender: 'male',
      birthday: '1990-05-15',
      address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
      note: 'Đau ngực nhẹ, khó thở khi vận động',
      payment: 'cod',
      price: 300000,
      status: 'confirmed',
      createdAt: '2026-09-15',
      updatedAt: '2026-09-15',
    },
    {
      id: 2,
      userId: 2,
      doctorId: 2,
      doctorName: 'BS. Trần Thị Bình',
      specialty: 'Nhi khoa',
      date: '2026-09-22',
      time: '14:30',
      patientName: 'Bé Nguyễn Minh',
      phone: '0912345678',
      gender: 'male',
      birthday: '2020-03-10',
      address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
      note: 'Sốt nhẹ 2 ngày, ho',
      payment: 'banking',
      price: 250000,
      status: 'pending',
      createdAt: '2026-09-16',
      updatedAt: '2026-09-16',
    },
    {
      id: 3,
      userId: 3,
      doctorId: 3,
      doctorName: 'BS. Lê Văn Cường',
      specialty: 'Da liễu',
      date: '2026-09-18',
      time: '10:00',
      patientName: 'Trần Thị B',
      phone: '0987654321',
      gender: 'female',
      birthday: '1995-08-20',
      address: '456 Lê Lợi, Quận 3, TP.HCM',
      note: 'Da mặt nổi mụn, ngứa',
      payment: 'ewallet',
      price: 200000,
      status: 'completed',
      createdAt: '2026-09-10',
      updatedAt: '2026-09-18',
    },
    {
      id: 4,
      userId: 2,
      doctorId: 6,
      doctorName: 'BS. Vũ Thị Phương',
      specialty: 'Mắt',
      date: '2026-09-25',
      time: '15:00',
      patientName: 'Nguyễn Văn A',
      phone: '0912345678',
      gender: 'male',
      birthday: '1990-05-15',
      address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
      note: 'Mắt mờ, nhức mỏi',
      payment: 'cod',
      price: 350000,
      status: 'pending',
      createdAt: '2026-09-17',
      updatedAt: '2026-09-17',
    },
    {
      id: 5,
      userId: 3,
      doctorId: 4,
      doctorName: 'BS. Phạm Thị Dung',
      specialty: 'Tai Mũi Họng',
      date: '2026-09-19',
      time: '08:30',
      patientName: 'Trần Thị B',
      phone: '0987654321',
      gender: 'female',
      birthday: '1995-08-20',
      address: '456 Lê Lợi, Quận 3, TP.HCM',
      note: 'Đau họng, khó nuốt',
      payment: 'cod',
      price: 280000,
      status: 'cancelled',
      createdAt: '2026-09-12',
      updatedAt: '2026-09-17',
    },
  ],

  /* ===== DỮ LIỆU YÊU THÍCH MẪU ===== */
  defaultFavorites: [
    { userId: 2, doctorId: 1, addedAt: '2026-09-10' },
    { userId: 2, doctorId: 6, addedAt: '2026-09-12' },
  ],

  /* ===== DỮ LIỆU CÀI ĐẶT MẶC ĐỊNH ===== */
  defaultSettings: {
    siteName: 'MediCare',
    siteSlogan: 'Đặt lịch khám bệnh online',
    siteDescription: 'Hệ thống đặt lịch khám bệnh online hàng đầu Việt Nam',
    timezone: 'Asia/Ho_Chi_Minh',
    language: 'vi',
    maintenance: false,

    contactPhone: '1900 1234',
    contactEmail: 'support@medicare.vn',
    contactAddress: '123 Nguyễn Huệ, Quận 1, TP.HCM',
    contactWorkHours: 'Thứ 2 – Thứ 7: 8:00 – 17:30',

    bookingMinAdvance: 2,
    bookingMaxAdvance: 30,
    bookingOpenTime: '08:00',
    bookingCloseTime: '17:30',
    bookingSlotDuration: 30,
    bookingCancelHours: 2,
    bookingAutoConfirm: false,
    bookingSendEmail: true,

    payCod: true,
    payBanking: true,
    payEwallet: true,

    seoTitle: 'MediCare – Đặt lịch khám bệnh online',
    seoDescription: 'Hệ thống đặt lịch khám bệnh online hàng đầu Việt Nam',
    seoKeywords: 'đặt lịch khám, bác sĩ, bệnh viện, chuyên khoa',

    facebook: '',
    youtube: '',
    zalo: '',
    instagram: '',
    tiktok: '',

    cacheTime: 3600,
    itemsPerPage: 20,
    enableDebug: false,
    enableRegister: true,
    enableReview: true,
  },

  /* ============================================================
     KHỞI TẠO
     ============================================================ */

  /**
   * Chạy seed toàn bộ dữ liệu (chỉ chạy 1 lần)
   */
  init(force = false) {
    // Nếu đã seed và không force → bỏ qua
    if (!force && Storage.isSeeded()) {
      if (CONFIG.DEBUG) console.log('[Seed] Đã seed trước đó, bỏ qua.');
      return;
    }

    if (CONFIG.DEBUG) console.log('[Seed] Bắt đầu khởi tạo dữ liệu mặc định...');

    // Users
    if (force || !Storage.has(CONFIG.STORAGE_KEYS.USERS)) {
      Storage.set(CONFIG.STORAGE_KEYS.USERS, this.defaultUsers);
    }

    // Specialties
    if (force || !Storage.has(CONFIG.STORAGE_KEYS.SPECIALTIES)) {
      Storage.set(CONFIG.STORAGE_KEYS.SPECIALTIES, SPECIALTIES_DATA);
    }

    // Doctors
    if (force || !Storage.has(CONFIG.STORAGE_KEYS.DOCTORS)) {
      Storage.set(CONFIG.STORAGE_KEYS.DOCTORS, DOCTORS_DATA);
    }

    // Bookings
    if (force || !Storage.has(CONFIG.STORAGE_KEYS.BOOKINGS)) {
      Storage.set(CONFIG.STORAGE_KEYS.BOOKINGS, this.defaultBookings);
    }

    // Favorites
    if (force || !Storage.has(CONFIG.STORAGE_KEYS.FAVORITES)) {
      Storage.set(CONFIG.STORAGE_KEYS.FAVORITES, this.defaultFavorites);
    }

    // Settings
    if (force || !Storage.has(CONFIG.STORAGE_KEYS.SETTINGS)) {
      Storage.set(CONFIG.STORAGE_KEYS.SETTINGS, this.defaultSettings);
    }

    // Đánh dấu đã seed
    Storage.setSeeded(true);

    if (CONFIG.DEBUG) console.log('[Seed] Khởi tạo dữ liệu thành công!');
  },

  /**
   * Reset toàn bộ dữ liệu về mặc định
   */
  reset() {
    if (CONFIG.DEBUG) console.log('[Seed] Reset toàn bộ dữ liệu...');
    this.init(true);
  },

  /**
   * Xóa sạch dữ liệu Medicare
   */
  clear() {
    Storage.clearApp();
    if (CONFIG.DEBUG) console.log('[Seed] Đã xóa toàn bộ dữ liệu!');
  },
};

/* ===== TỰ ĐỘNG CHẠY SEED KHI LOAD ===== */
if (typeof window !== 'undefined') {
  window.SeedData = SeedData;

  // Chạy seed ngay khi file này được load
  document.addEventListener('DOMContentLoaded', () => {
    SeedData.init();
  });
}