/* ============================================================
   MEDICARE — UTILS
   Bộ tiện ích dùng chung toàn hệ thống

   Bao gồm:
   - Number / Currency
   - Date / Time
   - String
   - Array / Object
   - DOM
   - URL / Query
   - Async / Misc

   Nguyên tắc:
   - Giữ tương thích API cũ
   - Không emoji
   - Không phụ thuộc Bootstrap
   - Xử lý ngày theo local time
   - Escape dữ liệu an toàn
   ============================================================ */

const Utils = {
  /* ============================================================
     01. NUMBER & CURRENCY
     ============================================================ */

  formatCurrency(amount, withUnit = true) {
    if (!this.isFiniteNumber(amount)) {
      return '—';
    }

    const locale =
      this.getLocale();

    const formatted =
      Number(amount).toLocaleString(
        locale
      );

    return withUnit
      ? `${formatted} ₫`
      : formatted;
  },

  formatNumber(num) {
    if (!this.isFiniteNumber(num)) {
      return '0';
    }

    return Number(num).toLocaleString(
      this.getLocale()
    );
  },

  formatCompact(num) {
    if (!this.isFiniteNumber(num)) {
      return '0';
    }

    const value = Number(num);
    const abs = Math.abs(value);

    const format = (
      divisor,
      suffix
    ) => {
      return (
        (value / divisor)
          .toFixed(1)
          .replace(/\.0$/, '') +
        suffix
      );
    };

    if (abs >= 1e9) {
      return format(1e9, 'B');
    }

    if (abs >= 1e6) {
      return format(1e6, 'M');
    }

    if (abs >= 1e3) {
      return format(1e3, 'K');
    }

    return String(value);
  },

  parseNumber(value) {
    if (typeof value === 'number') {
      return Number.isFinite(value)
        ? value
        : 0;
    }

    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return 0;
    }

    const normalized =
      String(value)
        .trim()
        .replace(/[^\d.-]/g, '');

    const number =
      Number(normalized);

    return Number.isFinite(number)
      ? number
      : 0;
  },

  clamp(
    value,
    min,
    max
  ) {
    const number =
      Number(value);

    if (!Number.isFinite(number)) {
      return min;
    }

    return Math.min(
      Math.max(number, min),
      max
    );
  },

  percentage(
    value,
    total,
    decimals = 0
  ) {
    const current =
      Number(value);

    const max =
      Number(total);

    if (
      !Number.isFinite(current) ||
      !Number.isFinite(max) ||
      max === 0
    ) {
      return 0;
    }

    return Number(
      (
        (current / max) *
        100
      ).toFixed(decimals)
    );
  },


  /* ============================================================
     02. DATE & TIME
     ============================================================ */

  formatDate(
    date,
    format = null
  ) {
    const parsed =
      this.toDate(date);

    if (!parsed) {
      return '—';
    }

    const pattern =
      format ||
      this.getConfig(
        'DATE_FORMAT',
        'DD/MM/YYYY'
      );

    const tokens = {
      DD: String(
        parsed.getDate()
      ).padStart(2, '0'),

      MM: String(
        parsed.getMonth() + 1
      ).padStart(2, '0'),

      YYYY: String(
        parsed.getFullYear()
      ),

      HH: String(
        parsed.getHours()
      ).padStart(2, '0'),

      mm: String(
        parsed.getMinutes()
      ).padStart(2, '0'),

      ss: String(
        parsed.getSeconds()
      ).padStart(2, '0'),
    };

    return pattern.replace(
      /YYYY|DD|MM|HH|mm|ss/g,
      (token) => tokens[token]
    );
  },

  formatDateTime(date) {
    return this.formatDate(
      date,
      this.getConfig(
        'DATETIME_FORMAT',
        'DD/MM/YYYY HH:mm'
      )
    );
  },

  formatTime(date) {
    return this.formatDate(
      date,
      this.getConfig(
        'TIME_FORMAT',
        'HH:mm'
      )
    );
  },

  formatDateLong(date) {
    const parsed =
      this.toDate(date);

    if (!parsed) {
      return '—';
    }

    try {
      return new Intl.DateTimeFormat(
        this.getLocale(),
        {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }
      ).format(parsed);
    } catch {
      return `${parsed.getDate()} tháng ${
        parsed.getMonth() + 1
      }, ${parsed.getFullYear()}`;
    }
  },

  toDate(value) {
    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return null;
    }

    if (value instanceof Date) {
      const copy =
        new Date(
          value.getTime()
        );

      return Number.isNaN(
        copy.getTime()
      )
        ? null
        : copy;
    }

    /*
     * YYYY-MM-DD được parse thủ công
     * để tránh browser hiểu thành UTC.
     */
    if (
      typeof value === 'string'
    ) {
      const trimmed =
        value.trim();

      const dateOnly =
        trimmed.match(
          /^(\d{4})-(\d{2})-(\d{2})$/
        );

      if (dateOnly) {
        const year =
          Number(dateOnly[1]);

        const month =
          Number(dateOnly[2]);

        const day =
          Number(dateOnly[3]);

        const date =
          new Date(
            year,
            month - 1,
            day
          );

        if (
          date.getFullYear() !==
            year ||
          date.getMonth() !==
            month - 1 ||
          date.getDate() !== day
        ) {
          return null;
        }

        return date;
      }
    }

    const parsed =
      new Date(value);

    return Number.isNaN(
      parsed.getTime()
    )
      ? null
      : parsed;
  },

  /**
   * Local date, không dùng toISOString()
   * vì toISOString() chuyển sang UTC.
   */
  today() {
    return this.toDateInputValue(
      new Date()
    );
  },

  tomorrow() {
    return this.toDateInputValue(
      this.addDays(
        new Date(),
        1
      )
    );
  },

  toDateInputValue(date) {
    const parsed =
      this.toDate(date);

    if (!parsed) {
      return '';
    }

    const year =
      parsed.getFullYear();

    const month =
      String(
        parsed.getMonth() + 1
      ).padStart(2, '0');

    const day =
      String(
        parsed.getDate()
      ).padStart(2, '0');

    return `${year}-${month}-${day}`;
  },

  addDays(
    date,
    days
  ) {
    const parsed =
      this.toDate(date);

    if (!parsed) {
      return null;
    }

    const result =
      new Date(
        parsed.getTime()
      );

    result.setDate(
      result.getDate() +
        Number(days || 0)
    );

    return result;
  },

  addHours(
    date,
    hours
  ) {
    const parsed =
      this.toDate(date);

    if (!parsed) {
      return null;
    }

    const result =
      new Date(
        parsed.getTime()
      );

    result.setHours(
      result.getHours() +
        Number(hours || 0)
    );

    return result;
  },

  startOfDay(date) {
    const parsed =
      this.toDate(date);

    if (!parsed) {
      return null;
    }

    parsed.setHours(
      0,
      0,
      0,
      0
    );

    return parsed;
  },

  endOfDay(date) {
    const parsed =
      this.toDate(date);

    if (!parsed) {
      return null;
    }

    parsed.setHours(
      23,
      59,
      59,
      999
    );

    return parsed;
  },

  diffInHours(
    from,
    to
  ) {
    const start =
      this.toDate(from);

    const end =
      this.toDate(to);

    if (!start || !end) {
      return 0;
    }

    return (
      (end.getTime() -
        start.getTime()) /
      3600000
    );
  },

  diffInDays(
    from,
    to
  ) {
    const start =
      this.startOfDay(from);

    const end =
      this.startOfDay(to);

    if (!start || !end) {
      return 0;
    }

    return Math.round(
      (
        end.getTime() -
        start.getTime()
      ) / 86400000
    );
  },

  timeAgo(date) {
    const parsed =
      this.toDate(date);

    if (!parsed) {
      return '—';
    }

    const difference =
      Date.now() -
      parsed.getTime();

    /*
     * Nếu thời gian nằm tương lai.
     */
    if (difference < 0) {
      const seconds =
        Math.abs(
          Math.floor(
            difference / 1000
          )
        );

      if (seconds < 60) {
        return 'Sắp tới';
      }

      const minutes =
        Math.floor(
          seconds / 60
        );

      if (minutes < 60) {
        return `${minutes} phút nữa`;
      }

      const hours =
        Math.floor(
          minutes / 60
        );

      if (hours < 24) {
        return `${hours} giờ nữa`;
      }

      const days =
        Math.floor(
          hours / 24
        );

      return `${days} ngày nữa`;
    }

    const seconds =
      Math.floor(
        difference / 1000
      );

    if (seconds < 60) {
      return 'Vừa xong';
    }

    const minutes =
      Math.floor(
        seconds / 60
      );

    if (minutes < 60) {
      return `${minutes} phút trước`;
    }

    const hours =
      Math.floor(
        minutes / 60
      );

    if (hours < 24) {
      return `${hours} giờ trước`;
    }

    const days =
      Math.floor(
        hours / 24
      );

    if (days < 30) {
      return `${days} ngày trước`;
    }

    const months =
      Math.floor(
        days / 30
      );

    if (months < 12) {
      return `${months} tháng trước`;
    }

    const years =
      Math.floor(
        days / 365
      );

    return `${years} năm trước`;
  },

  getDayName(date) {
    const parsed =
      this.toDate(date);

    if (!parsed) {
      return '';
    }

    const days = [
      'Chủ nhật',
      'Thứ 2',
      'Thứ 3',
      'Thứ 4',
      'Thứ 5',
      'Thứ 6',
      'Thứ 7',
    ];

    return days[
      parsed.getDay()
    ];
  },

  isValidDate(date) {
    return (
      this.toDate(date) !==
      null
    );
  },

  isToday(date) {
    const parsed =
      this.toDate(date);

    if (!parsed) {
      return false;
    }

    return (
      this.toDateInputValue(
        parsed
      ) === this.today()
    );
  },


  /* ============================================================
     03. STRING
     ============================================================ */

  capitalize(value) {
    const text =
      String(value || '')
        .trim();

    if (!text) {
      return '';
    }

    return (
      text.charAt(0)
        .toUpperCase() +
      text.slice(1)
        .toLowerCase()
    );
  },

  slugify(value) {
    if (!value) {
      return '';
    }

    return String(value)
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(
        /[\u0300-\u036f]/g,
        ''
      )
      .replace(/đ/g, 'd')
      .replace(
        /[^a-z0-9\s-]/g,
        ''
      )
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  },

  getInitials(name) {
    const text =
      String(name || '')
        .trim();

    if (!text) {
      return '?';
    }

    const parts =
      text
        .split(/\s+/)
        .filter(Boolean);

    if (parts.length === 1) {
      return parts[0]
        .slice(0, 2)
        .toUpperCase();
    }

    return (
      parts[0].charAt(0) +
      parts[
        parts.length - 1
      ].charAt(0)
    ).toUpperCase();
  },

  truncate(
    value,
    length = 50,
    suffix = '...'
  ) {
    const text =
      String(value || '');

    const maxLength =
      Math.max(
        0,
        Number(length) || 0
      );

    if (
      text.length <= maxLength
    ) {
      return text;
    }

    return (
      text
        .slice(
          0,
          maxLength
        )
        .trimEnd() +
      suffix
    );
  },

  escapeHtml(value) {
    if (
      value === null ||
      value === undefined
    ) {
      return '';
    }

    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };

    return String(value)
      .replace(
        /[&<>"']/g,
        (character) =>
          map[character]
      );
  },

  escapeRegExp(value) {
    return String(value || '')
      .replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&'
      );
  },

  /**
   * Highlight an toàn:
   * - Escape text trước
   * - Escape RegExp keyword
   */
  highlight(
    text,
    keyword
  ) {
    const safeText =
      this.escapeHtml(text);

    const search =
      String(keyword || '')
        .trim();

    if (!search) {
      return safeText;
    }

    const safeKeyword =
      this.escapeHtml(search);

    const regex =
      new RegExp(
        `(${this.escapeRegExp(
          safeKeyword
        )})`,
        'gi'
      );

    return safeText.replace(
      regex,
      '<mark>$1</mark>'
    );
  },

  normalizeText(value) {
    return String(value || '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(
        /[\u0300-\u036f]/g,
        ''
      )
      .replace(/đ/g, 'd');
  },

  generateId(prefix = '') {
    /*
     * Dùng crypto nếu browser hỗ trợ.
     */
    if (
      typeof crypto !==
        'undefined' &&
      typeof crypto.randomUUID ===
        'function'
    ) {
      return `${prefix}${crypto.randomUUID()}`;
    }

    return (
      `${prefix}` +
      Date.now().toString(36) +
      Math.random()
        .toString(36)
        .slice(2, 10)
    );
  },


  /* ============================================================
     04. ARRAY & OBJECT
     ============================================================ */

  sortBy(
    arr,
    key,
    order = 'asc'
  ) {
    if (!Array.isArray(arr)) {
      return [];
    }

    const direction =
      order === 'desc'
        ? -1
        : 1;

    return [...arr].sort(
      (a, b) => {
        const av =
          typeof key ===
            'function'
            ? key(a)
            : this.get(
                a,
                key
              );

        const bv =
          typeof key ===
            'function'
            ? key(b)
            : this.get(
                b,
                key
              );

        if (av === bv) {
          return 0;
        }

        if (
          av === null ||
          av === undefined
        ) {
          return 1;
        }

        if (
          bv === null ||
          bv === undefined
        ) {
          return -1;
        }

        if (
          typeof av ===
            'string' &&
          typeof bv ===
            'string'
        ) {
          return (
            av.localeCompare(
              bv,
              this.getLocale(),
              {
                numeric: true,
                sensitivity: 'base',
              }
            ) * direction
          );
        }

        return (
          (av > bv ? 1 : -1) *
          direction
        );
      }
    );
  },

  groupBy(
    arr,
    key
  ) {
    if (!Array.isArray(arr)) {
      return {};
    }

    return arr.reduce(
      (result, item) => {
        const groupKey =
          typeof key ===
            'function'
            ? key(item)
            : this.get(
                item,
                key
              );

        const normalizedKey =
          String(
            groupKey ??
              'undefined'
          );

        if (
          !result[
            normalizedKey
          ]
        ) {
          result[
            normalizedKey
          ] = [];
        }

        result[
          normalizedKey
        ].push(item);

        return result;
      },
      {}
    );
  },

  unique(arr) {
    if (!Array.isArray(arr)) {
      return [];
    }

    return [
      ...new Set(arr),
    ];
  },

  uniqueBy(
    arr,
    key
  ) {
    if (!Array.isArray(arr)) {
      return [];
    }

    const seen =
      new Set();

    return arr.filter(
      (item) => {
        const value =
          typeof key ===
            'function'
            ? key(item)
            : this.get(
                item,
                key
              );

        if (
          seen.has(value)
        ) {
          return false;
        }

        seen.add(value);

        return true;
      }
    );
  },

  paginate(
    arr,
    page = 1,
    limit = 10
  ) {
    if (!Array.isArray(arr)) {
      return {
        data: [],
        total: 0,
        totalPages: 0,
        page: 1,
        limit: 10,
      };
    }

    const safeLimit =
      Math.max(
        1,
        Math.floor(
          Number(limit) || 10
        )
      );

    const total =
      arr.length;

    const totalPages =
      total === 0
        ? 0
        : Math.ceil(
            total /
              safeLimit
          );

    let safePage =
      Math.max(
        1,
        Math.floor(
          Number(page) || 1
        )
      );

    if (
      totalPages > 0
    ) {
      safePage =
        Math.min(
          safePage,
          totalPages
        );
    }

    const start =
      (safePage - 1) *
      safeLimit;

    return {
      data:
        arr.slice(
          start,
          start +
            safeLimit
        ),

      total,

      totalPages,

      page: safePage,

      limit: safeLimit,
    };
  },

  shuffle(arr) {
    if (!Array.isArray(arr)) {
      return [];
    }

    const result =
      [...arr];

    for (
      let index =
        result.length - 1;
      index > 0;
      index -= 1
    ) {
      const randomIndex =
        Math.floor(
          Math.random() *
            (index + 1)
        );

      [
        result[index],
        result[randomIndex],
      ] = [
        result[randomIndex],
        result[index],
      ];
    }

    return result;
  },

  sample(
    arr,
    n = 1
  ) {
    if (!Array.isArray(arr)) {
      return [];
    }

    const amount =
      Math.max(
        0,
        Math.floor(
          Number(n) || 0
        )
      );

    return this.shuffle(arr)
      .slice(0, amount);
  },

  clone(value) {
    if (
      value === null ||
      typeof value !== 'object'
    ) {
      return value;
    }

    if (
      typeof structuredClone ===
      'function'
    ) {
      try {
        return structuredClone(
          value
        );
      } catch {
        /*
         * Tiếp tục fallback JSON.
         */
      }
    }

    try {
      return JSON.parse(
        JSON.stringify(value)
      );
    } catch {
      return value;
    }
  },

  debounce(
    fn,
    delay = 300
  ) {
    let timer = null;

    function debounced(
      ...args
    ) {
      const context = this;

      window.clearTimeout(
        timer
      );

      timer =
        window.setTimeout(
          () => {
            fn.apply(
              context,
              args
            );
          },
          delay
        );
    }

    debounced.cancel = () => {
      window.clearTimeout(
        timer
      );

      timer = null;
    };

    return debounced;
  },

  throttle(
    fn,
    limit = 300
  ) {
    let waiting = false;
    let lastArgs = null;
    let lastContext = null;

    const invoke = () => {
      if (!lastArgs) {
        waiting = false;
        return;
      }

      fn.apply(
        lastContext,
        lastArgs
      );

      lastArgs = null;
      lastContext = null;

      window.setTimeout(
        invoke,
        limit
      );
    };

    return function throttled(
      ...args
    ) {
      if (!waiting) {
        fn.apply(
          this,
          args
        );

        waiting = true;

        window.setTimeout(
          invoke,
          limit
        );

        return;
      }

      lastArgs = args;
      lastContext = this;
    };
  },


  /* ============================================================
     05. DOM
     ============================================================ */

  $(
    selector,
    parent = document
  ) {
    if (
      !selector ||
      !parent ||
      typeof parent
        .querySelector !==
        'function'
    ) {
      return null;
    }

    return parent.querySelector(
      selector
    );
  },

  $$(
    selector,
    parent = document
  ) {
    if (
      !selector ||
      !parent ||
      typeof parent
        .querySelectorAll !==
        'function'
    ) {
      return [];
    }

    return Array.from(
      parent.querySelectorAll(
        selector
      )
    );
  },

  createElement(
    tag,
    attrs = {},
    children = []
  ) {
    const element =
      document.createElement(
        tag
      );

    Object.entries(
      attrs || {}
    ).forEach(
      ([key, value]) => {
        if (
          value === null ||
          value === undefined
        ) {
          return;
        }

        if (
          key === 'className'
        ) {
          element.className =
            String(value);

          return;
        }

        if (
          key === 'textContent'
        ) {
          element.textContent =
            String(value);

          return;
        }

        if (
          key === 'innerHTML'
        ) {
          /*
           * Chỉ dùng với HTML đã được
           * kiểm soát/escape.
           */
          element.innerHTML =
            String(value);

          return;
        }

        if (
          key === 'dataset' &&
          this.isPlainObject(
            value
          )
        ) {
          Object.entries(
            value
          ).forEach(
            ([
              datasetKey,
              datasetValue,
            ]) => {
              element.dataset[
                datasetKey
              ] =
                String(
                  datasetValue
                );
            }
          );

          return;
        }

        if (
          key === 'style' &&
          this.isPlainObject(
            value
          )
        ) {
          Object.assign(
            element.style,
            value
          );

          return;
        }

        if (
          key.startsWith('on') &&
          typeof value ===
            'function'
        ) {
          element.addEventListener(
            key
              .slice(2)
              .toLowerCase(),
            value
          );

          return;
        }

        if (
          typeof value ===
            'boolean'
        ) {
          if (value) {
            element.setAttribute(
              key,
              ''
            );
          }

          return;
        }

        element.setAttribute(
          key,
          String(value)
        );
      }
    );

    const childList =
      Array.isArray(children)
        ? children
        : [children];

    childList.forEach(
      (child) => {
        if (
          child === null ||
          child === undefined ||
          child === false
        ) {
          return;
        }

        if (
          typeof child ===
            'string' ||
          typeof child ===
            'number'
        ) {
          element.appendChild(
            document.createTextNode(
              String(child)
            )
          );

          return;
        }

        if (
          child instanceof Node
        ) {
          element.appendChild(
            child
          );
        }
      }
    );

    return element;
  },

  addClass(
    element,
    ...classes
  ) {
    if (
      !element ||
      !element.classList
    ) {
      return;
    }

    const valid =
      classes.filter(Boolean);

    if (valid.length) {
      element.classList.add(
        ...valid
      );
    }
  },

  removeClass(
    element,
    ...classes
  ) {
    if (
      !element ||
      !element.classList
    ) {
      return;
    }

    const valid =
      classes.filter(Boolean);

    if (valid.length) {
      element.classList.remove(
        ...valid
      );
    }
  },

  toggleClass(
    element,
    className,
    force
  ) {
    if (
      !element ||
      !element.classList ||
      !className
    ) {
      return false;
    }

    if (
      typeof force ===
      'boolean'
    ) {
      return element
        .classList
        .toggle(
          className,
          force
        );
    }

    return element
      .classList
      .toggle(className);
  },

  show(
    element,
    display = ''
  ) {
    if (!element) {
      return;
    }

    element.hidden = false;

    element.style.display =
      display;
  },

  hide(element) {
    if (!element) {
      return;
    }

    element.style.display =
      'none';
  },

  setText(
    element,
    text
  ) {
    if (!element) {
      return;
    }

    element.textContent =
      text ?? '';
  },

  /**
   * Lưu ý:
   * setHtml() không sanitize HTML.
   * Chỉ dùng với markup tin cậy.
   */
  setHtml(
    element,
    html
  ) {
    if (!element) {
      return;
    }

    element.innerHTML =
      html ?? '';
  },

  scrollTo(
    element,
    offset = null
  ) {
    if (
      !element ||
      typeof element
        .getBoundingClientRect !==
        'function'
    ) {
      return;
    }

    const finalOffset =
      offset ??
      this.getConfig(
        'UI.SCROLL_OFFSET',
        80
      );

    const top =
      element
        .getBoundingClientRect()
        .top +
      window.scrollY -
      finalOffset;

    const reduceMotion =
      typeof window
        .matchMedia ===
        'function' &&
      window
        .matchMedia(
          '(prefers-reduced-motion: reduce)'
        )
        .matches;

    window.scrollTo({
      top:
        Math.max(0, top),

      behavior:
        reduceMotion
          ? 'auto'
          : 'smooth',
    });
  },

  focus(
    element,
    options = {}
  ) {
    if (
      !element ||
      typeof element.focus !==
        'function'
    ) {
      return;
    }

    element.focus({
      preventScroll:
        options.preventScroll ??
        false,
    });
  },


  /* ============================================================
     06. URL & QUERY
     ============================================================ */

  getQueryParam(key) {
    if (
      typeof window ===
        'undefined'
    ) {
      return null;
    }

    return new URLSearchParams(
      window.location.search
    ).get(key);
  },

  getQueryParams() {
    if (
      typeof window ===
        'undefined'
    ) {
      return {};
    }

    return Object.fromEntries(
      new URLSearchParams(
        window.location.search
      ).entries()
    );
  },

  buildUrl(
    base,
    params = {}
  ) {
    if (!base) {
      return '';
    }

    const origin =
      typeof window !==
        'undefined'
        ? window.location.origin
        : 'http://localhost';

    const url =
      new URL(
        base,
        origin
      );

    Object.entries(
      params || {}
    ).forEach(
      ([key, value]) => {
        if (
          value === null ||
          value === undefined ||
          value === ''
        ) {
          url.searchParams.delete(
            key
          );

          return;
        }

        if (
          Array.isArray(value)
        ) {
          url.searchParams.delete(
            key
          );

          value.forEach(
            (item) => {
              url.searchParams.append(
                key,
                String(item)
              );
            }
          );

          return;
        }

        url.searchParams.set(
          key,
          String(value)
        );
      }
    );

    /*
     * Nếu base là URL tuyệt đối,
     * giữ URL tuyệt đối.
     */
    if (
      /^[a-z][a-z\d+\-.]*:\/\//i
        .test(base)
    ) {
      return url.toString();
    }

    return (
      url.pathname +
      url.search +
      url.hash
    );
  },

  redirect(url) {
    if (
      !url ||
      typeof window ===
        'undefined'
    ) {
      return;
    }

    window.location.href =
      url;
  },

  redirectAfter(
    url,
    delay = 1000
  ) {
    return window.setTimeout(
      () => {
        this.redirect(url);
      },
      Math.max(
        0,
        Number(delay) || 0
      )
    );
  },


  /* ============================================================
     07. MISC
     ============================================================ */

  sleep(ms) {
    return new Promise(
      (resolve) => {
        window.setTimeout(
          resolve,
          Math.max(
            0,
            Number(ms) || 0
          )
        );
      }
    );
  },

  randomInt(
    min,
    max
  ) {
    let minimum =
      Math.ceil(
        Number(min)
      );

    let maximum =
      Math.floor(
        Number(max)
      );

    if (
      !Number.isFinite(
        minimum
      ) ||
      !Number.isFinite(
        maximum
      )
    ) {
      return 0;
    }

    if (
      minimum > maximum
    ) {
      [
        minimum,
        maximum,
      ] = [
        maximum,
        minimum,
      ];
    }

    return (
      Math.floor(
        Math.random() *
          (
            maximum -
            minimum +
            1
          )
      ) +
      minimum
    );
  },

  /**
   * Palette đồng bộ MediCare.
   * Không còn Bootstrap blue.
   */
  randomColor() {
    const colors = [
      '#0f766e',
      '#14b8a6',
      '#0d9488',
      '#16a34a',
      '#0284c7',
      '#d97706',
      '#dc2626',
      '#64748b',
      '#334155',
    ];

    return colors[
      this.randomInt(
        0,
        colors.length - 1
      )
    ];
  },

  isEmpty(value) {
    if (
      value === null ||
      value === undefined
    ) {
      return true;
    }

    if (
      typeof value ===
        'string'
    ) {
      return (
        value.trim() === ''
      );
    }

    if (
      Array.isArray(value)
    ) {
      return (
        value.length === 0
      );
    }

    if (
      this.isPlainObject(
        value
      )
    ) {
      return (
        Object.keys(value)
          .length === 0
      );
    }

    return false;
  },

  isPlainObject(value) {
    if (
      value === null ||
      typeof value !==
        'object'
    ) {
      return false;
    }

    const prototype =
      Object.getPrototypeOf(
        value
      );

    return (
      prototype ===
        Object.prototype ||
      prototype === null
    );
  },

  isFiniteNumber(value) {
    if (
      value === null ||
      value === '' ||
      typeof value ===
        'boolean'
    ) {
      return false;
    }

    return Number.isFinite(
      Number(value)
    );
  },

  get(
    object,
    path,
    defaultValue = undefined
  ) {
    if (
      object === null ||
      object === undefined
    ) {
      return defaultValue;
    }

    if (
      path === null ||
      path === undefined ||
      path === ''
    ) {
      return object;
    }

    const keys =
      Array.isArray(path)
        ? path
        : String(path)
            .replace(
              /\[(\w+)\]/g,
              '.$1'
            )
            .replace(
              /^\./,
              ''
            )
            .split('.');

    let result =
      object;

    for (
      const key of keys
    ) {
      if (
        result === null ||
        result === undefined
      ) {
        return defaultValue;
      }

      result =
        result[key];
    }

    return result ===
      undefined
      ? defaultValue
      : result;
  },

  getConfig(
    path,
    defaultValue = undefined
  ) {
    if (
      typeof CONFIG ===
        'undefined'
    ) {
      return defaultValue;
    }

    return this.get(
      CONFIG,
      path,
      defaultValue
    );
  },

  getLocale() {
    return this.getConfig(
      'LOCALE',
      'vi-VN'
    );
  },

  copyToClipboard(
    text
  ) {
    const value =
      String(text ?? '');

    if (
      navigator.clipboard &&
      typeof navigator.clipboard
        .writeText ===
        'function'
    ) {
      return navigator.clipboard
        .writeText(value);
    }

    return new Promise(
      (resolve, reject) => {
        try {
          const textarea =
            document.createElement(
              'textarea'
            );

          textarea.value =
            value;

          textarea.setAttribute(
            'readonly',
            ''
          );

          textarea.style.position =
            'fixed';

          textarea.style.opacity =
            '0';

          document.body
            .appendChild(
              textarea
            );

          textarea.select();

          const success =
            document.execCommand(
              'copy'
            );

          textarea.remove();

          if (success) {
            resolve();
          } else {
            reject(
              new Error(
                'Không thể sao chép.'
              )
            );
          }
        } catch (error) {
          reject(error);
        }
      }
    );
  },
};


/* ============================================================
   EXPORT GLOBAL
   ============================================================ */

if (
  typeof window !==
  'undefined'
) {
  window.Utils = Utils;
}