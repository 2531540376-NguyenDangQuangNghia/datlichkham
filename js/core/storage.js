/* ============================================================
   MEDICARE — STORAGE
   Wrapper an toàn cho localStorage

   Chức năng:
   - get / set / remove
   - clear / clearApp
   - has / keys / size
   - JSON serialize / parse
   - Domain helpers
   - Kiểm tra LocalStorage một lần
   - Fallback an toàn khi CONFIG chưa sẵn sàng
   - Giữ tương thích DB.get / DB.set / DB.remove
   ============================================================ */

const Storage = {
  /* ============================================================
     01. INTERNAL STATE
     ============================================================ */

  _supportChecked: false,

  _supported: false,


  /* ============================================================
     02. CHECK SUPPORT
     ============================================================ */

  isSupported(forceCheck = false) {
    if (
      this._supportChecked &&
      !forceCheck
    ) {
      return this._supported;
    }

    try {
      if (
        typeof window === 'undefined' ||
        !window.localStorage
      ) {
        this._supported = false;
        this._supportChecked = true;

        return false;
      }

      const testKey =
        '__medicare_storage_test__';

      window.localStorage.setItem(
        testKey,
        '1'
      );

      window.localStorage.removeItem(
        testKey
      );

      this._supported = true;
    } catch (error) {
      this._supported = false;

      this.debug(
        'warn',
        'LocalStorage không khả dụng.',
        error
      );
    }

    this._supportChecked = true;

    return this._supported;
  },


  /* ============================================================
     03. GET STORAGE INSTANCE
     ============================================================ */

  getStorage() {
    if (!this.isSupported()) {
      return null;
    }

    return window.localStorage;
  },


  /* ============================================================
     04. GET
     ============================================================ */

  get(key, defaultValue = null) {
    if (!this.isValidKey(key)) {
      return defaultValue;
    }

    const storage =
      this.getStorage();

    if (!storage) {
      return defaultValue;
    }

    try {
      const raw =
        storage.getItem(key);

      if (raw === null) {
        return defaultValue;
      }

      return JSON.parse(raw);
    } catch (error) {
      this.debug(
        'warn',
        `Không thể đọc key "${key}".`,
        error
      );

      return defaultValue;
    }
  },


  /* ============================================================
     05. SET
     ============================================================ */

  set(key, value) {
    if (!this.isValidKey(key)) {
      return false;
    }

    const storage =
      this.getStorage();

    if (!storage) {
      return false;
    }

    /*
     * JSON.stringify(undefined)
     * trả về undefined chứ không phải
     * JSON hợp lệ.
     *
     * Trong trường hợp này xóa key
     * sẽ an toàn hơn lưu "undefined".
     */
    if (value === undefined) {
      return this.remove(key);
    }

    try {
      const serialized =
        JSON.stringify(value);

      if (
        serialized === undefined
      ) {
        return false;
      }

      storage.setItem(
        key,
        serialized
      );

      return true;
    } catch (error) {
      if (
        this.isQuotaError(error)
      ) {
        this.debug(
          'error',
          `LocalStorage đã đầy. Không thể lưu key "${key}".`,
          error
        );
      } else {
        this.debug(
          'error',
          `Không thể lưu key "${key}".`,
          error
        );
      }

      return false;
    }
  },


  /* ============================================================
     06. REMOVE
     ============================================================ */

  remove(key) {
    if (!this.isValidKey(key)) {
      return false;
    }

    const storage =
      this.getStorage();

    if (!storage) {
      return false;
    }

    try {
      storage.removeItem(key);

      return true;
    } catch (error) {
      this.debug(
        'warn',
        `Không thể xóa key "${key}".`,
        error
      );

      return false;
    }
  },


  /* ============================================================
     07. CLEAR ALL LOCALSTORAGE
     Cẩn thận: xóa cả dữ liệu không thuộc MediCare.
     ============================================================ */

  clear() {
    const storage =
      this.getStorage();

    if (!storage) {
      return false;
    }

    try {
      storage.clear();

      return true;
    } catch (error) {
      this.debug(
        'error',
        'Không thể xóa LocalStorage.',
        error
      );

      return false;
    }
  },


  /* ============================================================
     08. CLEAR MEDICARE DATA
     Chỉ xóa các key của ứng dụng.
     ============================================================ */

  clearApp() {
    const storage =
      this.getStorage();

    if (!storage) {
      return false;
    }

    try {
      this.getAppKeys().forEach(
        (key) => {
          storage.removeItem(key);
        }
      );

      return true;
    } catch (error) {
      this.debug(
        'error',
        'Không thể xóa dữ liệu MediCare.',
        error
      );

      return false;
    }
  },


  /* ============================================================
     09. HAS
     ============================================================ */

  has(key) {
    if (!this.isValidKey(key)) {
      return false;
    }

    const storage =
      this.getStorage();

    if (!storage) {
      return false;
    }

    try {
      return (
        storage.getItem(key) !==
        null
      );
    } catch {
      return false;
    }
  },


  /* ============================================================
     10. GET ALL KEYS
     ============================================================ */

  keys() {
    const storage =
      this.getStorage();

    if (!storage) {
      return [];
    }

    try {
      const result = [];

      for (
        let index = 0;
        index < storage.length;
        index += 1
      ) {
        const key =
          storage.key(index);

        if (key !== null) {
          result.push(key);
        }
      }

      return result;
    } catch {
      return [];
    }
  },


  /* ============================================================
     11. GET MEDICARE KEYS
     ============================================================ */

  getAppKeys() {
    /*
     * Ưu tiên CONFIG.STORAGE_KEYS.
     */
    if (
      typeof CONFIG !==
        'undefined' &&
      CONFIG.STORAGE_KEYS
    ) {
      return [
        ...new Set(
          Object.values(
            CONFIG.STORAGE_KEYS
          ).filter(Boolean)
        ),
      ];
    }

    /*
     * Fallback nếu Storage được load
     * trước CONFIG.
     */
    return this.keys().filter(
      (key) =>
        key.startsWith(
          'medicare_'
        )
    );
  },


  /* ============================================================
     12. GET EXISTING MEDICARE KEYS
     ============================================================ */

  appKeys() {
    const storage =
      this.getStorage();

    if (!storage) {
      return [];
    }

    return this.getAppKeys().filter(
      (key) =>
        storage.getItem(key) !==
        null
    );
  },


  /* ============================================================
     13. SIZE
     Trả về kích thước ước tính theo byte.
     ============================================================ */

  size() {
    const storage =
      this.getStorage();

    if (!storage) {
      return 0;
    }

    try {
      let total = 0;

      for (
        let index = 0;
        index < storage.length;
        index += 1
      ) {
        const key =
          storage.key(index);

        if (key === null) {
          continue;
        }

        const value =
          storage.getItem(key) || '';

        total +=
          this.byteLength(key) +
          this.byteLength(value);
      }

      return total;
    } catch {
      return 0;
    }
  },


  /* ============================================================
     14. APP SIZE
     Chỉ tính dữ liệu MediCare.
     ============================================================ */

  appSize() {
    const storage =
      this.getStorage();

    if (!storage) {
      return 0;
    }

    try {
      return this.appKeys().reduce(
        (total, key) => {
          const value =
            storage.getItem(key) ||
            '';

          return (
            total +
            this.byteLength(key) +
            this.byteLength(value)
          );
        },
        0
      );
    } catch {
      return 0;
    }
  },


  /* ============================================================
     15. FORMAT SIZE
     ============================================================ */

  formatSize(bytes) {
    const value =
      Number(bytes) || 0;

    if (value < 1024) {
      return `${value} B`;
    }

    if (
      value <
      1024 * 1024
    ) {
      return `${(
        value / 1024
      ).toFixed(2)} KB`;
    }

    return `${(
      value /
      (1024 * 1024)
    ).toFixed(2)} MB`;
  },


  /* ============================================================
     16. USERS
     ============================================================ */

  getUsers() {
    return this.getArray(
      this.getKey(
        'USERS',
        'medicare_users'
      )
    );
  },

  setUsers(users) {
    if (!Array.isArray(users)) {
      this.debug(
        'warn',
        'setUsers() yêu cầu một Array.'
      );

      return false;
    }

    return this.set(
      this.getKey(
        'USERS',
        'medicare_users'
      ),
      users
    );
  },


  /* ============================================================
     17. CURRENT USER
     ============================================================ */

  getCurrentUser() {
    const user =
      this.get(
        this.getKey(
          'CURRENT_USER',
          'medicare_current_user'
        ),
        null
      );

    return this.isObject(user)
      ? user
      : null;
  },

  setCurrentUser(user) {
    if (
      user === null ||
      user === undefined
    ) {
      return this.removeCurrentUser();
    }

    if (!this.isObject(user)) {
      this.debug(
        'warn',
        'setCurrentUser() yêu cầu một Object.'
      );

      return false;
    }

    return this.set(
      this.getKey(
        'CURRENT_USER',
        'medicare_current_user'
      ),
      user
    );
  },

  removeCurrentUser() {
    return this.remove(
      this.getKey(
        'CURRENT_USER',
        'medicare_current_user'
      )
    );
  },


  /* ============================================================
     18. DOCTORS
     ============================================================ */

  getDoctors() {
    return this.getArray(
      this.getKey(
        'DOCTORS',
        'medicare_doctors'
      )
    );
  },

  setDoctors(doctors) {
    if (
      !Array.isArray(doctors)
    ) {
      this.debug(
        'warn',
        'setDoctors() yêu cầu một Array.'
      );

      return false;
    }

    return this.set(
      this.getKey(
        'DOCTORS',
        'medicare_doctors'
      ),
      doctors
    );
  },


  /* ============================================================
     19. SPECIALTIES
     ============================================================ */

  getSpecialties() {
    return this.getArray(
      this.getKey(
        'SPECIALTIES',
        'medicare_specialties'
      )
    );
  },

  setSpecialties(
    specialties
  ) {
    if (
      !Array.isArray(
        specialties
      )
    ) {
      this.debug(
        'warn',
        'setSpecialties() yêu cầu một Array.'
      );

      return false;
    }

    return this.set(
      this.getKey(
        'SPECIALTIES',
        'medicare_specialties'
      ),
      specialties
    );
  },


  /* ============================================================
     20. BOOKINGS
     ============================================================ */

  getBookings() {
    return this.getArray(
      this.getKey(
        'BOOKINGS',
        'medicare_bookings'
      )
    );
  },

  setBookings(bookings) {
    if (
      !Array.isArray(bookings)
    ) {
      this.debug(
        'warn',
        'setBookings() yêu cầu một Array.'
      );

      return false;
    }

    return this.set(
      this.getKey(
        'BOOKINGS',
        'medicare_bookings'
      ),
      bookings
    );
  },


  /* ============================================================
     21. FAVORITES
     ============================================================ */

  getFavorites() {
    return this.getArray(
      this.getKey(
        'FAVORITES',
        'medicare_favorites'
      )
    );
  },

  setFavorites(favorites) {
    if (
      !Array.isArray(favorites)
    ) {
      this.debug(
        'warn',
        'setFavorites() yêu cầu một Array.'
      );

      return false;
    }

    return this.set(
      this.getKey(
        'FAVORITES',
        'medicare_favorites'
      ),
      favorites
    );
  },


  /* ============================================================
     22. SETTINGS
     ============================================================ */

  getSettings() {
    const settings =
      this.get(
        this.getKey(
          'SETTINGS',
          'medicare_settings'
        ),
        {}
      );

    return this.isObject(
      settings
    )
      ? settings
      : {};
  },

  setSettings(settings) {
    if (
      !this.isObject(settings)
    ) {
      this.debug(
        'warn',
        'setSettings() yêu cầu một Object.'
      );

      return false;
    }

    return this.set(
      this.getKey(
        'SETTINGS',
        'medicare_settings'
      ),
      settings
    );
  },


  /* ============================================================
     23. THEME
     ============================================================ */

  getTheme() {
    const fallback =
      this.getDefaultTheme();

    const theme =
      this.get(
        this.getKey(
          'THEME',
          'medicare_theme'
        ),
        fallback
      );

    const allowed = [
      'light',
      'dark',
      'system',
    ];

    return allowed.includes(
      theme
    )
      ? theme
      : fallback;
  },

  setTheme(theme) {
    const allowed = [
      'light',
      'dark',
      'system',
    ];

    if (
      !allowed.includes(theme)
    ) {
      this.debug(
        'warn',
        `Theme "${theme}" không hợp lệ.`
      );

      return false;
    }

    return this.set(
      this.getKey(
        'THEME',
        'medicare_theme'
      ),
      theme
    );
  },


  /* ============================================================
     24. SEEDED FLAG
     ============================================================ */

  isSeeded() {
    return Boolean(
      this.get(
        this.getKey(
          'SEEDED',
          'medicare_seeded'
        ),
        false
      )
    );
  },

  setSeeded(value = true) {
    return this.set(
      this.getKey(
        'SEEDED',
        'medicare_seeded'
      ),
      Boolean(value)
    );
  },


  /* ============================================================
     25. CONTACT MESSAGES
     ============================================================ */

  getContactMessages() {
    return this.getArray(
      this.getKey(
        'CONTACT_MESSAGES',
        'medicare_contact_messages'
      )
    );
  },

  setContactMessages(
    messages
  ) {
    if (
      !Array.isArray(messages)
    ) {
      return false;
    }

    return this.set(
      this.getKey(
        'CONTACT_MESSAGES',
        'medicare_contact_messages'
      ),
      messages
    );
  },


  /* ============================================================
     26. REMEMBER EMAIL
     ============================================================ */

  getRememberEmail() {
    const value =
      this.get(
        this.getKey(
          'REMEMBER_EMAIL',
          'medicare_remember_email'
        ),
        ''
      );

    return typeof value ===
      'string'
      ? value
      : '';
  },

  setRememberEmail(email) {
    return this.set(
      this.getKey(
        'REMEMBER_EMAIL',
        'medicare_remember_email'
      ),
      String(email || '')
    );
  },

  removeRememberEmail() {
    return this.remove(
      this.getKey(
        'REMEMBER_EMAIL',
        'medicare_remember_email'
      )
    );
  },


  /* ============================================================
     27. GET ARRAY
     ============================================================ */

  getArray(key) {
    const value =
      this.get(key, []);

    return Array.isArray(value)
      ? value
      : [];
  },


  /* ============================================================
     28. GET CONFIG KEY
     ============================================================ */

  getKey(
    name,
    fallback
  ) {
    if (
      typeof CONFIG !==
        'undefined' &&
      CONFIG.STORAGE_KEYS &&
      CONFIG.STORAGE_KEYS[
        name
      ]
    ) {
      return CONFIG
        .STORAGE_KEYS[name];
    }

    return fallback;
  },


  /* ============================================================
     29. DEFAULT THEME
     ============================================================ */

  getDefaultTheme() {
    if (
      typeof CONFIG !==
        'undefined' &&
      CONFIG.THEME &&
      CONFIG.THEME.DEFAULT
    ) {
      return CONFIG
        .THEME.DEFAULT;
    }

    return 'light';
  },


  /* ============================================================
     30. VALIDATE KEY
     ============================================================ */

  isValidKey(key) {
    return (
      typeof key === 'string' &&
      key.trim().length > 0
    );
  },


  /* ============================================================
     31. OBJECT CHECK
     ============================================================ */

  isObject(value) {
    return (
      value !== null &&
      typeof value ===
        'object' &&
      !Array.isArray(value)
    );
  },


  /* ============================================================
     32. BYTE LENGTH
     ============================================================ */

  byteLength(value) {
    const text =
      String(value || '');

    /*
     * TextEncoder cho kết quả byte
     * chính xác hơn string.length,
     * đặc biệt với tiếng Việt.
     */
    if (
      typeof TextEncoder !==
      'undefined'
    ) {
      return new TextEncoder()
        .encode(text)
        .length;
    }

    /*
     * Fallback browser cũ.
     */
    try {
      return unescape(
        encodeURIComponent(text)
      ).length;
    } catch {
      return text.length * 2;
    }
  },


  /* ============================================================
     33. QUOTA ERROR
     ============================================================ */

  isQuotaError(error) {
    if (!error) {
      return false;
    }

    return (
      error.name ===
        'QuotaExceededError' ||
      error.name ===
        'NS_ERROR_DOM_QUOTA_REACHED' ||
      error.code === 22 ||
      error.code === 1014
    );
  },


  /* ============================================================
     34. DEBUG LOGGER
     ============================================================ */

  debug(
    method,
    message,
    error = null
  ) {
    const debugEnabled =
      typeof CONFIG !==
        'undefined' &&
      CONFIG.DEBUG === true;

    if (
      !debugEnabled ||
      typeof console ===
        'undefined'
    ) {
      return;
    }

    const fn =
      typeof console[method] ===
        'function'
        ? console[method]
        : console.log;

    if (error) {
      fn.call(
        console,
        `[Storage] ${message}`,
        error
      );
    } else {
      fn.call(
        console,
        `[Storage] ${message}`
      );
    }
  },
};


/* ============================================================
   EXPORT GLOBAL
   ============================================================ */

if (typeof window !== 'undefined') {
  window.Storage = Storage;

  /*
   * Alias cho code cũ.
   * Không xóa để tránh làm hỏng
   * các page/service đang dùng DB.
   */
  window.DB = {
    get: (
      key,
      defaultValue
    ) =>
      Storage.get(
        key,
        defaultValue
      ),

    set: (
      key,
      value
    ) =>
      Storage.set(
        key,
        value
      ),

    remove: (key) =>
      Storage.remove(key),

    has: (key) =>
      Storage.has(key),
  };
}