/* ============================================================
   MEDICARE — GLOBAL CONFIG
   Cấu hình toàn cục của hệ thống

   Bao gồm:
   - Thông tin ứng dụng
   - API
   - LocalStorage keys
   - Phân quyền
   - Booking
   - Thanh toán
   - Validation
   - Pagination
   - Date / Time
   - Toast / Modal
   - UI / Theme
   - Debug

   Lưu ý:
   - File này phải được load trước các service/component khác
   - Không chứa dữ liệu người dùng
   - Không chứa secret/API key
   ============================================================ */

const CONFIG = {
  /* ============================================================
     01. APPLICATION
     ============================================================ */

APP_NAME: 'Bệnh viện Hàng không Việt Nam',
  APP_VERSION: '1.0.0',

  APP_DESCRIPTION:
    'Hệ thống đặt lịch khám bệnh trực tuyến',

  APP_LOCALE: 'vi-VN',

  APP_LANGUAGE: 'vi',

  APP_TIMEZONE: 'Asia/Ho_Chi_Minh',


  /* ============================================================
     02. API
     Chuẩn bị cho giai đoạn kết nối backend
     ============================================================ */

  API_URL: 'http://localhost:3000/api',

  API_TIMEOUT: 10000,

  API_VERSION: 'v1',

  API_HEADERS: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },


  /* ============================================================
     03. LOCALSTORAGE KEYS
     ============================================================ */

  STORAGE_KEYS: {
    USERS: 'medicare_users',

    CURRENT_USER:
      'medicare_current_user',

    DOCTORS:
      'medicare_doctors',

    SPECIALTIES:
      'medicare_specialties',

    BOOKINGS:
      'medicare_bookings',

    FAVORITES:
      'medicare_favorites',

    SETTINGS:
      'medicare_settings',

    THEME:
      'medicare_theme',

    SEEDED:
      'medicare_seeded',

    CONTACT_MESSAGES:
      'medicare_contact_messages',

    REMEMBER_EMAIL:
      'medicare_remember_email',
  },


  /* ============================================================
     04. ROLES
     ============================================================ */

  ROLES: {
    USER: 'user',

    ADMIN: 'admin',
  },

  ROLE_LABEL: {
    user: 'Bệnh nhân',

    admin: 'Quản trị viên',
  },


  /* ============================================================
     05. USER STATUS
     ============================================================ */

  USER_STATUS: {
    ACTIVE: 'active',

    BLOCKED: 'blocked',
  },

  USER_STATUS_LABEL: {
    active: 'Đang hoạt động',

    blocked: 'Đã khóa',
  },

  USER_STATUS_CLASS: {
    active: 'status-active',

    blocked: 'status-blocked',
  },


  /* ============================================================
     06. DOCTOR STATUS
     ============================================================ */

  DOCTOR_STATUS: {
    ACTIVE: 'active',

    INACTIVE: 'inactive',
  },

  DOCTOR_STATUS_LABEL: {
    active: 'Đang hoạt động',

    inactive: 'Tạm ngưng',
  },

  DOCTOR_STATUS_CLASS: {
    active: 'status-active',

    inactive: 'status-inactive',
  },


  /* ============================================================
     07. SPECIALTY STATUS
     ============================================================ */

  SPECIALTY_STATUS: {
    ACTIVE: 'active',

    INACTIVE: 'inactive',
  },

  SPECIALTY_STATUS_LABEL: {
    active: 'Đang hiển thị',

    inactive: 'Đã ẩn',
  },


  /* ============================================================
     08. BOOKING STATUS
     ============================================================ */

  BOOKING_STATUS: {
    PENDING: 'pending',

    CONFIRMED: 'confirmed',

    COMPLETED: 'completed',

    CANCELLED: 'cancelled',
  },

  BOOKING_STATUS_LABEL: {
    pending: 'Chờ xác nhận',

    confirmed: 'Đã xác nhận',

    completed: 'Đã khám',

    cancelled: 'Đã hủy',
  },

  BOOKING_STATUS_CLASS: {
    pending: 'status-pending',

    confirmed: 'status-confirmed',

    completed: 'status-completed',

    cancelled: 'status-cancelled',
  },


  /* ============================================================
     09. PAYMENT METHODS
     ============================================================ */

  PAYMENT_METHODS: {
    COD: 'cod',

    BANKING: 'banking',

    EWALLET: 'ewallet',
  },

  PAYMENT_METHOD_LABEL: {
    cod:
      'Thanh toán tại phòng khám',

    banking:
      'Chuyển khoản ngân hàng',

    ewallet:
      'Ví điện tử',
  },


  /* ============================================================
     10. PAYMENT STATUS
     ============================================================ */

  PAYMENT_STATUS: {
    UNPAID: 'unpaid',

    PAID: 'paid',

    REFUNDED: 'refunded',
  },

  PAYMENT_STATUS_LABEL: {
    unpaid: 'Chưa thanh toán',

    paid: 'Đã thanh toán',

    refunded: 'Đã hoàn tiền',
  },


  /* ============================================================
     11. GENDER
     ============================================================ */

  GENDERS: {
    MALE: 'male',

    FEMALE: 'female',

    OTHER: 'other',
  },

  GENDER_LABEL: {
    male: 'Nam',

    female: 'Nữ',

    other: 'Khác',
  },


  /* ============================================================
     12. DOCTOR DEGREES
     ============================================================ */

  DEGREES: [
    'BS',
    'BS.CKI',
    'BS.CKII',
    'ThS',
    'TS',
    'PGS.TS',
    'GS.TS',
  ],


  /* ============================================================
     13. PAGINATION
     ============================================================ */

  PAGINATION: {
    DEFAULT_PAGE: 1,

    DEFAULT_LIMIT: 12,

    LIMIT_OPTIONS: [
      6,
      12,
      24,
      48,
    ],

    MAX_VISIBLE_PAGES: 5,
  },


  /* ============================================================
     14. VALIDATION
     ============================================================ */

  VALIDATION: {
    PASSWORD_MIN: 6,

    PASSWORD_MAX: 50,

    NAME_MIN: 2,

    NAME_MAX: 100,

    PHONE_MIN: 10,

    PHONE_MAX: 11,

    /*
     * Số điện thoại Việt Nam cơ bản.
     * Bắt đầu bằng 0 và gồm 10 số.
     */
    PHONE_REGEX:
      /^0\d{9}$/,

    /*
     * Email validation ở mức client-side.
     */
    EMAIL_REGEX:
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

    /*
     * Slug:
     * tim-mach
     * co-xuong-khop
     */
    SLUG_REGEX:
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,

    /*
     * Mã booking ví dụ:
     * BK123456
     */
    BOOKING_CODE_REGEX:
      /^BK[A-Z0-9]+$/i,

    ADDRESS_MAX: 255,

    NOTE_MAX: 1000,

    BIO_MAX: 2000,
  },


  /* ============================================================
     15. DATE & TIME
     ============================================================ */

  DATE_FORMAT:
    'DD/MM/YYYY',

  TIME_FORMAT:
    'HH:mm',

  DATETIME_FORMAT:
    'DD/MM/YYYY HH:mm',

  LOCALE:
    'vi-VN',

  TIMEZONE:
    'Asia/Ho_Chi_Minh',


  /* ============================================================
     16. BOOKING RULES
     ============================================================ */

  BOOKING: {
    /*
     * Phải đặt trước ít nhất 2 giờ.
     */
    MIN_ADVANCE_HOURS: 2,

    /*
     * Cho phép đặt tối đa
     * 30 ngày trong tương lai.
     */
    MAX_ADVANCE_DAYS: 30,

    /*
     * Chỉ được hủy trước lịch
     * ít nhất 2 giờ.
     */
    CANCEL_BEFORE_HOURS: 2,

    /*
     * Khoảng cách giữa các slot.
     */
    SLOT_INTERVAL_MINUTES: 30,

    /*
     * Khung giờ mặc định.
     */
    TIME_SLOTS: [
      '08:00',
      '08:30',
      '09:00',
      '09:30',
      '10:00',
      '10:30',

      '14:00',
      '14:30',
      '15:00',
      '15:30',
      '16:00',
      '16:30',
    ],
  },


  /* ============================================================
     17. WORKING HOURS
     ============================================================ */

  WORKING_HOURS: {
    MORNING: {
      START: '08:00',

      END: '11:00',
    },

    AFTERNOON: {
      START: '14:00',

      END: '17:00',
    },
  },


  /* ============================================================
     18. FAVORITES
     ============================================================ */

  FAVORITES: {
    MAX_ITEMS: 100,
  },


  /* ============================================================
     19. SEARCH
     ============================================================ */

  SEARCH: {
    MIN_LENGTH: 1,

    DEBOUNCE_DELAY: 300,

    MAX_RECENT_SEARCHES: 10,
  },


  /* ============================================================
     20. FILE / IMAGE
     ============================================================ */

  UPLOAD: {
    MAX_IMAGE_SIZE:
      5 * 1024 * 1024,

    IMAGE_TYPES: [
      'image/jpeg',
      'image/png',
      'image/webp',
    ],

    DEFAULT_AVATAR:
      '',
  },


  /* ============================================================
     21. TOAST
     ============================================================ */

  TOAST_DURATION: 3000,

  TOAST_MAX: 5,

  TOAST: {
    DEFAULT_DURATION: 3000,

    ERROR_DURATION: 4500,

    WARNING_DURATION: 4500,

    MAX: 5,

    REMOVE_ANIMATION_DURATION: 350,
  },


  /* ============================================================
     22. MODAL
     ============================================================ */

  MODAL_ANIMATION_DURATION: 250,

  MODAL: {
    ANIMATION_DURATION: 250,

    CLOSE_ON_OVERLAY: true,

    CLOSE_ON_ESCAPE: true,
  },


  /* ============================================================
     23. UI
     ============================================================ */

  UI: {
    MOBILE_BREAKPOINT: 768,

    TABLET_BREAKPOINT: 1024,

    HEADER_SCROLL_OFFSET: 10,

    SIDEBAR_BREAKPOINT: 1024,

    SCROLL_OFFSET: 90,
  },


  /* ============================================================
     24. THEME
     ============================================================ */

  THEME: {
    LIGHT: 'light',

    DARK: 'dark',

    SYSTEM: 'system',

    DEFAULT: 'light',
  },


  /* ============================================================
     25. ADMIN
     ============================================================ */

  ADMIN: {
    RECENT_BOOKINGS_LIMIT: 5,

    TOP_DOCTORS_LIMIT: 5,

    CHART_DAYS: 7,

    TABLE_LIMIT: 10,
  },


  /* ============================================================
     26. REPORT
     ============================================================ */

  REPORT: {
    DEFAULT_RANGE_DAYS: 30,

    TOP_DOCTORS_LIMIT: 5,
  },


  /* ============================================================
     27. CURRENCY
     ============================================================ */

  CURRENCY: {
    CODE: 'VND',

    LOCALE: 'vi-VN',

    SYMBOL: '₫',
  },


  /* ============================================================
     28. APPLICATION COLORS
     Chỉ dùng khi JS thật sự cần màu.
     CSS vẫn là nguồn styling chính.
     ============================================================ */

  COLORS: {
    PRIMARY: '#0f766e',

    PRIMARY_DARK: '#0b5f59',

    PRIMARY_DEEP: '#064e49',

    ACCENT: '#14b8a6',

    SUCCESS: '#16a34a',

    WARNING: '#d97706',

    DANGER: '#dc2626',

    INFO: '#0284c7',

    TEXT: '#0f172a',

    MUTED: '#64748b',
  },


  /* ============================================================
     29. DEBUG
     ============================================================ */

  DEBUG: true,
};


/* ============================================================
   DEEP FREEZE
   Khóa toàn bộ object con và array.
   ============================================================ */

function deepFreeze(object) {
  if (
    !object ||
    typeof object !== 'object' ||
    Object.isFrozen(object)
  ) {
    return object;
  }

  Object.getOwnPropertyNames(
    object
  ).forEach((property) => {
    const value =
      object[property];

    if (
      value &&
      (
        typeof value === 'object' ||
        typeof value === 'function'
      )
    ) {
      deepFreeze(value);
    }
  });

  return Object.freeze(object);
}

deepFreeze(CONFIG);


/* ============================================================
   DEBUG LOG
   ============================================================ */

if (
  CONFIG.DEBUG &&
  typeof console !== 'undefined'
) {
  console.log(
    `%c${CONFIG.APP_NAME} v${CONFIG.APP_VERSION}`,
    [
      'color: #0f766e',
      'font-weight: 700',
      'font-size: 14px',
      'letter-spacing: .2px',
    ].join(';')
  );

  console.log(
    `%c${CONFIG.APP_DESCRIPTION}`,
    [
      'color: #64748b',
      'font-size: 12px',
    ].join(';')
  );
}


/* ============================================================
   EXPORT GLOBAL
   ============================================================ */

if (typeof window !== 'undefined') {
  window.CONFIG = CONFIG;
}