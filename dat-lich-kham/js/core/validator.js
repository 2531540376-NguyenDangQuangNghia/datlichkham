/* ============================================================
   MEDICARE — VALIDATOR
   Validation dùng chung toàn hệ thống

   Hỗ trợ:
   - Required
   - Email
   - Phone
   - Password
   - Number / Range
   - Date
   - URL
   - File / Image
   - Match field
   - Checkbox / Radio
   - Form validation
   - Hiển thị lỗi accessible
   - Lấy dữ liệu form

   Không phụ thuộc thư viện ngoài.
   ============================================================ */

const Validator = {
  /* ============================================================
     01. BASIC VALIDATION
     ============================================================ */

  required(value) {
    if (
      value === null ||
      value === undefined
    ) {
      return false;
    }

    if (
      typeof value === 'string'
    ) {
      return value.trim().length > 0;
    }

    if (Array.isArray(value)) {
      return value.length > 0;
    }

    return true;
  },

  minLength(value, min) {
    if (
      value === null ||
      value === undefined
    ) {
      return false;
    }

    const minimum =
      Number(min);

    if (
      !Number.isFinite(minimum)
    ) {
      return false;
    }

    return (
      String(value)
        .trim()
        .length >= minimum
    );
  },

  maxLength(value, max) {
    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return true;
    }

    const maximum =
      Number(max);

    if (
      !Number.isFinite(maximum)
    ) {
      return false;
    }

    return (
      String(value)
        .trim()
        .length <= maximum
    );
  },

  lengthBetween(
    value,
    min,
    max
  ) {
    return (
      this.minLength(
        value,
        min
      ) &&
      this.maxLength(
        value,
        max
      )
    );
  },


  /* ============================================================
     02. EMAIL
     ============================================================ */

  email(value) {
    if (!value) {
      return false;
    }

    const email =
      String(value)
        .trim();

    const regex =
      this.getConfig(
        'VALIDATION.EMAIL_REGEX',
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      );

    /*
     * Reset lastIndex phòng trường hợp
     * regex được cấu hình với flag g/y.
     */
    regex.lastIndex = 0;

    return regex.test(email);
  },


  /* ============================================================
     03. PHONE
     ============================================================ */

  phone(value) {
    if (!value) {
      return false;
    }

    /*
     * Cho phép người dùng nhập:
     * 090 123 4567
     * 090-123-4567
     * 090.123.4567
     *
     * Sau đó chuẩn hóa trước khi test.
     */
    const phone =
      String(value)
        .trim()
        .replace(
          /[\s().-]/g,
          ''
        );

    const regex =
      this.getConfig(
        'VALIDATION.PHONE_REGEX',
        /^0\d{9}$/
      );

    regex.lastIndex = 0;

    return regex.test(phone);
  },


  /* ============================================================
     04. NUMBER
     ============================================================ */

  number(value) {
    if (
      value === null ||
      value === undefined ||
      value === '' ||
      typeof value ===
        'boolean'
    ) {
      return false;
    }

    const number =
      Number(value);

    return Number.isFinite(
      number
    );
  },

  integer(value) {
    if (!this.number(value)) {
      return false;
    }

    return Number.isInteger(
      Number(value)
    );
  },

  positiveInteger(value) {
    if (!this.integer(value)) {
      return false;
    }

    return Number(value) > 0;
  },

  nonNegative(value) {
    if (!this.number(value)) {
      return false;
    }

    return Number(value) >= 0;
  },

  range(
    value,
    min,
    max
  ) {
    if (!this.number(value)) {
      return false;
    }

    const number =
      Number(value);

    const minimum =
      Number(min);

    const maximum =
      Number(max);

    if (
      !Number.isFinite(minimum) ||
      !Number.isFinite(maximum)
    ) {
      return false;
    }

    return (
      number >= minimum &&
      number <= maximum
    );
  },


  /* ============================================================
     05. URL
     ============================================================ */

  url(value) {
    if (!value) {
      return false;
    }

    try {
      const parsed =
        new URL(
          String(value).trim()
        );

      return [
        'http:',
        'https:',
      ].includes(
        parsed.protocol
      );
    } catch {
      return false;
    }
  },


  /* ============================================================
     06. DATE
     ============================================================ */

  date(value) {
    return (
      this.parseDate(value) !==
      null
    );
  },

  futureDate(value) {
    const date =
      this.parseDate(value);

    if (!date) {
      return false;
    }

    return (
      date.getTime() >
      Date.now()
    );
  },

  pastDate(value) {
    const date =
      this.parseDate(value);

    if (!date) {
      return false;
    }

    return (
      date.getTime() <
      Date.now()
    );
  },

  todayOrFuture(value) {
    const date =
      this.parseDate(value);

    if (!date) {
      return false;
    }

    const target =
      this.startOfDay(date);

    const today =
      this.startOfDay(
        new Date()
      );

    return (
      target.getTime() >=
      today.getTime()
    );
  },

  todayOrPast(value) {
    const date =
      this.parseDate(value);

    if (!date) {
      return false;
    }

    const target =
      this.startOfDay(date);

    const today =
      this.startOfDay(
        new Date()
      );

    return (
      target.getTime() <=
      today.getTime()
    );
  },

  dateBetween(
    value,
    min,
    max
  ) {
    const date =
      this.parseDate(value);

    const minimum =
      this.parseDate(min);

    const maximum =
      this.parseDate(max);

    if (
      !date ||
      !minimum ||
      !maximum
    ) {
      return false;
    }

    return (
      date.getTime() >=
        minimum.getTime() &&
      date.getTime() <=
        maximum.getTime()
    );
  },


  /* ============================================================
     07. PASSWORD
     ============================================================ */

  password(value) {
    if (!value) {
      return false;
    }

    const min =
      this.getConfig(
        'VALIDATION.PASSWORD_MIN',
        6
      );

    const max =
      this.getConfig(
        'VALIDATION.PASSWORD_MAX',
        50
      );

    return this.lengthBetween(
      value,
      min,
      max
    );
  },

  strongPassword(value) {
    if (!this.password(value)) {
      return false;
    }

    const password =
      String(value);

    return (
      /[A-Za-z]/.test(
        password
      ) &&
      /\d/.test(password)
    );
  },

  passwordStrength(value) {
    const password =
      String(value || '');

    if (!password) {
      return {
        score: 0,
        level: 'weak',
        text: 'Chưa nhập',
        percent: 0,
      };
    }

    let score = 0;

    const min =
      this.getConfig(
        'VALIDATION.PASSWORD_MIN',
        6
      );

    if (
      password.length >= min
    ) {
      score += 1;
    }

    if (
      password.length >= 10
    ) {
      score += 1;
    }

    if (
      /[a-z]/.test(password) &&
      /[A-Z]/.test(password)
    ) {
      score += 1;
    }

    if (/\d/.test(password)) {
      score += 1;
    }

    if (
      /[^A-Za-z0-9]/.test(
        password
      )
    ) {
      score += 1;
    }

    const percent =
      Math.min(
        100,
        score * 20
      );

    if (score <= 2) {
      return {
        score,
        level: 'weak',
        text: 'Yếu',
        percent,
      };
    }

    if (score <= 3) {
      return {
        score,
        level: 'medium',
        text: 'Trung bình',
        percent,
      };
    }

    return {
      score,
      level: 'strong',
      text: 'Mạnh',
      percent,
    };
  },

  confirmPassword(
    password,
    confirm
  ) {
    return (
      String(password ?? '') ===
      String(confirm ?? '')
    );
  },


  /* ============================================================
     08. FILE VALIDATION
     ============================================================ */

  fileSize(
    file,
    maxSizeMB
  ) {
    if (
      !file ||
      typeof file.size !==
        'number'
    ) {
      return false;
    }

    const max =
      Number(maxSizeMB);

    if (
      !Number.isFinite(max) ||
      max <= 0
    ) {
      return false;
    }

    return (
      file.size <=
      max * 1024 * 1024
    );
  },

  fileType(
    file,
    allowedTypes = []
  ) {
    if (
      !file ||
      !Array.isArray(
        allowedTypes
      ) ||
      !allowedTypes.length
    ) {
      return false;
    }

    return allowedTypes.includes(
      file.type
    );
  },

  image(
    file,
    maxSizeMB = null
  ) {
    if (!file) {
      return false;
    }

    const configuredTypes =
      this.getConfig(
        'UPLOAD.IMAGE_TYPES',
        [
          'image/jpeg',
          'image/png',
          'image/webp',
        ]
      );

    if (
      !configuredTypes.includes(
        file.type
      )
    ) {
      return false;
    }

    let maximumMB =
      maxSizeMB;

    /*
     * CONFIG.UPLOAD.MAX_IMAGE_SIZE
     * đang lưu theo bytes.
     */
    if (
      maximumMB === null ||
      maximumMB === undefined
    ) {
      const configuredBytes =
        this.getConfig(
          'UPLOAD.MAX_IMAGE_SIZE',
          5 * 1024 * 1024
        );

      maximumMB =
        configuredBytes /
        (1024 * 1024);
    }

    return this.fileSize(
      file,
      maximumMB
    );
  },


  /* ============================================================
     09. VALIDATE FORM
     ============================================================ */

  validateForm(formEl) {
    if (!formEl) {
      return {
        valid: true,
        errors: {},
      };
    }

    const errors = {};

    const fields =
      Array.from(
        formEl.querySelectorAll(
          '[data-validate], [required]'
        )
      );

    /*
     * Tránh validate cùng một radio
     * group nhiều lần.
     */
    const processedRadioGroups =
      new Set();

    fields.forEach(
      (field) => {
        if (
          field.disabled ||
          field.type ===
            'hidden'
        ) {
          return;
        }

        const name =
          field.name ||
          field.id;

        if (!name) {
          return;
        }

        /*
         * Radio group.
         */
        if (
          field.type ===
          'radio'
        ) {
          const groupKey =
            field.name ||
            field.id;

          if (
            processedRadioGroups.has(
              groupKey
            )
          ) {
            return;
          }

          processedRadioGroups.add(
            groupKey
          );
        }

        const rules =
          this.getFieldRules(
            field
          );

        const value =
          this.getFieldValue(
            field,
            formEl
          );

        for (
          const rawRule of rules
        ) {
          const {
            name: ruleName,
            params,
          } =
            this.parseRule(
              rawRule
            );

          const result =
            this.validateRule(
              {
                ruleName,
                params,
                value,
                field,
                formEl,
              }
            );

          if (!result.valid) {
            errors[name] =
              result.message;

            break;
          }
        }
      }
    );

    return {
      valid:
        Object.keys(errors)
          .length === 0,

      errors,
    };
  },


  /* ============================================================
     10. GET FIELD RULES
     ============================================================ */

  getFieldRules(field) {
    const rules = [];

    if (
      field.hasAttribute(
        'required'
      )
    ) {
      rules.push(
        'required'
      );
    }

    if (
      field.dataset.validate
    ) {
      field.dataset.validate
        .split('|')
        .map((rule) =>
          rule.trim()
        )
        .filter(Boolean)
        .forEach((rule) => {
          if (
            !rules.includes(rule)
          ) {
            rules.push(rule);
          }
        });
    }

    return rules;
  },


  /* ============================================================
     11. PARSE RULE
     ============================================================ */

  parseRule(rule) {
    const separatorIndex =
      rule.indexOf(':');

    if (
      separatorIndex === -1
    ) {
      return {
        name: rule.trim(),
        params: [],
      };
    }

    const name =
      rule
        .slice(
          0,
          separatorIndex
        )
        .trim();

    const rawParams =
      rule
        .slice(
          separatorIndex + 1
        )
        .trim();

    return {
      name,

      params:
        rawParams
          .split(',')
          .map((param) =>
            param.trim()
          ),
    };
  },


  /* ============================================================
     12. GET FIELD VALUE
     ============================================================ */

  getFieldValue(
    field,
    formEl
  ) {
    if (
      field.type ===
      'checkbox'
    ) {
      return field.checked;
    }

    if (
      field.type === 'radio'
    ) {
      if (!field.name) {
        return field.checked
          ? field.value
          : '';
      }

      const radios =
        Array.from(
          formEl.elements[
            field.name
          ] || []
        );

      /*
       * Nếu chỉ có một radio,
       * form.elements[name] có thể
       * trả thẳng element.
       */
      if (
        !Array.isArray(radios) ||
        radios.length === 0
      ) {
        const checked =
          formEl.querySelector(
            `input[type="radio"][name="${this.escapeSelector(
              field.name
            )}"]:checked`
          );

        return checked
          ? checked.value
          : '';
      }

      const checked =
        radios.find(
          (radio) =>
            radio.checked
        );

      return checked
        ? checked.value
        : '';
    }

    if (
      field.tagName ===
        'SELECT' &&
      field.multiple
    ) {
      return Array.from(
        field.selectedOptions
      ).map(
        (option) =>
          option.value
      );
    }

    if (
      field.type === 'file'
    ) {
      return field.files;
    }

    return field.value;
  },


  /* ============================================================
     13. VALIDATE SINGLE RULE
     ============================================================ */

  validateRule({
    ruleName,
    params,
    value,
    field,
    formEl,
  }) {
    let valid = true;
    let message = '';

    const empty =
      this.isEmptyFieldValue(
        value
      );

    switch (ruleName) {
      case 'required':
        if (
          field.type ===
          'checkbox'
        ) {
          valid =
            field.checked;
        } else {
          valid =
            this.required(
              value
            );
        }

        message =
          'Trường này là bắt buộc';
        break;


      case 'email':
        valid =
          empty ||
          this.email(value);

        message =
          'Email không hợp lệ';
        break;


      case 'phone':
        valid =
          empty ||
          this.phone(value);

        message =
          'Số điện thoại không hợp lệ';
        break;


      case 'password': {
        valid =
          empty ||
          this.password(value);

        const min =
          this.getConfig(
            'VALIDATION.PASSWORD_MIN',
            6
          );

        const max =
          this.getConfig(
            'VALIDATION.PASSWORD_MAX',
            50
          );

        message =
          `Mật khẩu phải từ ${min} đến ${max} ký tự`;
        break;
      }


      case 'strongPassword':
        valid =
          empty ||
          this.strongPassword(
            value
          );

        message =
          'Mật khẩu phải có ít nhất chữ và số';
        break;


      case 'minLength': {
        const min =
          Number(params[0]);

        valid =
          empty ||
          this.minLength(
            value,
            min
          );

        message =
          `Tối thiểu ${min} ký tự`;
        break;
      }


      case 'maxLength': {
        const max =
          Number(params[0]);

        valid =
          empty ||
          this.maxLength(
            value,
            max
          );

        message =
          `Tối đa ${max} ký tự`;
        break;
      }


      case 'number':
        valid =
          empty ||
          this.number(value);

        message =
          'Giá trị phải là số';
        break;


      case 'integer':
        valid =
          empty ||
          this.integer(value);

        message =
          'Giá trị phải là số nguyên';
        break;


      case 'positiveInteger':
        valid =
          empty ||
          this.positiveInteger(
            value
          );

        message =
          'Giá trị phải là số nguyên dương';
        break;


      case 'nonNegative':
        valid =
          empty ||
          this.nonNegative(
            value
          );

        message =
          'Giá trị không được âm';
        break;


      case 'range': {
        const min =
          Number(params[0]);

        const max =
          Number(params[1]);

        valid =
          empty ||
          this.range(
            value,
            min,
            max
          );

        message =
          `Giá trị phải từ ${min} đến ${max}`;
        break;
      }


      case 'date':
        valid =
          empty ||
          this.date(value);

        message =
          'Ngày không hợp lệ';
        break;


      case 'futureDate':
        valid =
          empty ||
          this.futureDate(
            value
          );

        message =
          'Ngày phải ở trong tương lai';
        break;


      case 'pastDate':
        valid =
          empty ||
          this.pastDate(
            value
          );

        message =
          'Ngày phải ở trong quá khứ';
        break;


      case 'todayOrFuture':
        valid =
          empty ||
          this.todayOrFuture(
            value
          );

        message =
          'Ngày không được trước hôm nay';
        break;


      case 'todayOrPast':
        valid =
          empty ||
          this.todayOrPast(
            value
          );

        message =
          'Ngày không được sau hôm nay';
        break;


      case 'url':
        valid =
          empty ||
          this.url(value);

        message =
          'URL không hợp lệ';
        break;


      case 'match': {
        const targetName =
          params[0] || '';

        const target =
          this.findField(
            formEl,
            targetName
          );

        valid =
          !target ||
          String(
            value ?? ''
          ) ===
            String(
              this.getFieldValue(
                target,
                formEl
              ) ?? ''
            );

        message =
          'Giá trị không khớp';
        break;
      }


      default:
        valid = true;
        message = '';
    }

    return {
      valid,
      message,
    };
  },


  /* ============================================================
     14. SHOW ERRORS
     ============================================================ */

  showErrors(
    formEl,
    errors
  ) {
    if (!formEl) {
      return;
    }

    this.clearErrors(
      formEl
    );

    Object.entries(
      errors || {}
    ).forEach(
      ([name, message]) => {
        const field =
          this.findField(
            formEl,
            name
          );

        if (!field) {
          return;
        }

        this.showFieldError(
          field,
          message
        );
      }
    );

    const firstInvalid =
      formEl.querySelector(
        '.is-invalid'
      );

    if (firstInvalid) {
      /*
       * Tránh scroll đột ngột,
       * sau đó cuộn mượt nếu có Utils.
       */
      try {
        firstInvalid.focus({
          preventScroll: true,
        });
      } catch {
        firstInvalid.focus();
      }

      if (
        typeof Utils !==
          'undefined' &&
        typeof Utils.scrollTo ===
          'function'
      ) {
        Utils.scrollTo(
          firstInvalid,
          120
        );
      } else {
        firstInvalid
          .scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
      }
    }
  },


  /* ============================================================
     15. SHOW FIELD ERROR
     ============================================================ */

  showFieldError(
    field,
    message
  ) {
    if (!field) {
      return;
    }

    field.classList.add(
      'is-invalid'
    );

    field.setAttribute(
      'aria-invalid',
      'true'
    );

    const errorId =
      `${field.id ||
        field.name ||
        'field'}-error`;

    /*
     * Nếu error đã tồn tại,
     * chỉ cập nhật text.
     */
    let errorEl =
      document.getElementById(
        errorId
      );

    if (!errorEl) {
      errorEl =
        document.createElement(
          'small'
        );

      errorEl.id =
        errorId;

      errorEl.className =
        'form-error';

      errorEl.setAttribute(
        'role',
        'alert'
      );

      const container =
        this.getErrorContainer(
          field
        );

      container.appendChild(
        errorEl
      );
    }

    errorEl.textContent =
      message;

    const describedBy =
      (
        field.getAttribute(
          'aria-describedby'
        ) || ''
      )
        .split(/\s+/)
        .filter(Boolean);

    if (
      !describedBy.includes(
        errorId
      )
    ) {
      describedBy.push(
        errorId
      );
    }

    field.setAttribute(
      'aria-describedby',
      describedBy.join(' ')
    );
  },


  /* ============================================================
     16. CLEAR FIELD ERROR
     ============================================================ */

  clearFieldError(field) {
    if (!field) {
      return;
    }

    field.classList.remove(
      'is-invalid'
    );

    field.removeAttribute(
      'aria-invalid'
    );

    const errorId =
      `${field.id ||
        field.name ||
        'field'}-error`;

    const errorEl =
      document.getElementById(
        errorId
      );

    if (errorEl) {
      errorEl.remove();
    }

    const describedBy =
      (
        field.getAttribute(
          'aria-describedby'
        ) || ''
      )
        .split(/\s+/)
        .filter(
          (id) =>
            id !== errorId
        );

    if (
      describedBy.length
    ) {
      field.setAttribute(
        'aria-describedby',
        describedBy.join(' ')
      );
    } else {
      field.removeAttribute(
        'aria-describedby'
      );
    }
  },


  /* ============================================================
     17. CLEAR ALL ERRORS
     ============================================================ */

  clearErrors(formEl) {
    if (!formEl) {
      return;
    }

    formEl
      .querySelectorAll(
        '.is-invalid'
      )
      .forEach(
        (field) => {
          field.classList.remove(
            'is-invalid'
          );

          field.removeAttribute(
            'aria-invalid'
          );
        }
      );

    formEl
      .querySelectorAll(
        '.form-error'
      )
      .forEach(
        (error) =>
          error.remove()
      );

    formEl
      .querySelectorAll(
        '[aria-describedby]'
      )
      .forEach(
        (field) => {
          const ids =
            field
              .getAttribute(
                'aria-describedby'
              )
              .split(/\s+/)
              .filter(Boolean)
              .filter(
                (id) =>
                  !id.endsWith(
                    '-error'
                  )
              );

          if (ids.length) {
            field.setAttribute(
              'aria-describedby',
              ids.join(' ')
            );
          } else {
            field.removeAttribute(
              'aria-describedby'
            );
          }
        }
      );
  },


  /* ============================================================
     18. ERROR CONTAINER
     ============================================================ */

  getErrorContainer(field) {
    /*
     * Ưu tiên các wrapper đang phổ biến
     * trong form.css của MediCare.
     */
    return (
      field.closest(
        '.form-group, .form-field, .input-group, .form-control-group'
      ) ||
      field.parentElement ||
      field
    );
  },


  /* ============================================================
     19. FIND FIELD SAFELY
     ============================================================ */

  findField(
    formEl,
    name
  ) {
    if (
      !formEl ||
      !name
    ) {
      return null;
    }

    /*
     * HTMLFormElement.elements giúp
     * tránh build CSS selector từ
     * dữ liệu động.
     */
    const byName =
      formEl.elements[
        name
      ];

    if (byName) {
      /*
       * RadioNodeList.
       */
      if (
        typeof RadioNodeList !==
          'undefined' &&
        byName instanceof
          RadioNodeList
      ) {
        return (
          byName[0] ||
          null
        );
      }

      return byName;
    }

    /*
     * ID fallback.
     */
    const element =
      document.getElementById(
        name
      );

    if (
      element &&
      formEl.contains(element)
    ) {
      return element;
    }

    return null;
  },


  /* ============================================================
     20. GET FORM DATA
     ============================================================ */

  getFormData(formEl) {
    if (!formEl) {
      return {};
    }

    const data = {};

    const formData =
      new FormData(formEl);

    for (
      const [
        originalKey,
        value,
      ] of formData.entries()
    ) {
      const arrayNotation =
        originalKey.endsWith(
          '[]'
        );

      const key =
        arrayNotation
          ? originalKey.slice(
              0,
              -2
            )
          : originalKey;

      if (arrayNotation) {
        if (
          !Array.isArray(
            data[key]
          )
        ) {
          data[key] = [];
        }

        data[key].push(
          value
        );

        continue;
      }

      if (
        data[key] !==
        undefined
      ) {
        if (
          !Array.isArray(
            data[key]
          )
        ) {
          data[key] = [
            data[key],
          ];
        }

        data[key].push(
          value
        );

        continue;
      }

      data[key] = value;
    }

    /*
     * Checkbox không được gửi bởi
     * FormData khi unchecked.
     */
    formEl
      .querySelectorAll(
        'input[type="checkbox"][name]'
      )
      .forEach(
        (checkbox) => {
          const key =
            checkbox.name.endsWith(
              '[]'
            )
              ? checkbox.name.slice(
                  0,
                  -2
                )
              : checkbox.name;

          const sameName =
            formEl.querySelectorAll(
              `input[type="checkbox"][name="${this.escapeSelector(
                checkbox.name
              )}"]`
            );

          /*
           * Một checkbox đơn:
           * trả boolean.
           */
          if (
            sameName.length === 1 &&
            !checkbox.name.endsWith(
              '[]'
            )
          ) {
            data[key] =
              checkbox.checked;

            return;
          }

          /*
           * Checkbox group:
           * luôn trả Array.
           */
          if (
            data[key] ===
            undefined
          ) {
            data[key] = [];
          }
        }
      );

    return data;
  },


  /* ============================================================
     21. RESET FORM
     ============================================================ */

  resetForm(formEl) {
    if (!formEl) {
      return;
    }

    formEl.reset();

    this.clearErrors(
      formEl
    );
  },


  /* ============================================================
     22. FIELD VALUE EMPTY
     ============================================================ */

  isEmptyFieldValue(value) {
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
      typeof FileList !==
        'undefined' &&
      value instanceof
        FileList
    ) {
      return (
        value.length === 0
      );
    }

    /*
     * false của checkbox được coi
     * là empty để required xử lý.
     */
    if (value === false) {
      return true;
    }

    return false;
  },


  /* ============================================================
     23. PARSE DATE
     ============================================================ */

  parseDate(value) {
    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return null;
    }

    /*
     * Ưu tiên Utils.toDate nếu
     * Utils đã được load.
     */
    if (
      typeof Utils !==
        'undefined' &&
      typeof Utils.toDate ===
        'function'
    ) {
      return Utils.toDate(
        value
      );
    }

    if (
      value instanceof Date
    ) {
      const date =
        new Date(
          value.getTime()
        );

      return Number.isNaN(
        date.getTime()
      )
        ? null
        : date;
    }

    /*
     * Parse YYYY-MM-DD theo local time
     * thay vì UTC.
     */
    if (
      typeof value ===
        'string'
    ) {
      const match =
        value
          .trim()
          .match(
            /^(\d{4})-(\d{2})-(\d{2})$/
          );

      if (match) {
        const year =
          Number(match[1]);

        const month =
          Number(match[2]);

        const day =
          Number(match[3]);

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
          date.getDate() !==
            day
        ) {
          return null;
        }

        return date;
      }
    }

    const date =
      new Date(value);

    return Number.isNaN(
      date.getTime()
    )
      ? null
      : date;
  },


  /* ============================================================
     24. START OF DAY
     ============================================================ */

  startOfDay(value) {
    const date =
      value instanceof Date
        ? new Date(
            value.getTime()
          )
        : this.parseDate(
            value
          );

    if (!date) {
      return null;
    }

    date.setHours(
      0,
      0,
      0,
      0
    );

    return date;
  },


  /* ============================================================
     25. ESCAPE CSS SELECTOR
     ============================================================ */

  escapeSelector(value) {
    const string =
      String(value || '');

    if (
      typeof CSS !==
        'undefined' &&
      typeof CSS.escape ===
        'function'
    ) {
      return CSS.escape(
        string
      );
    }

    return string.replace(
      /(["\\])/g,
      '\\$1'
    );
  },


  /* ============================================================
     26. CONFIG HELPER
     ============================================================ */

  getConfig(
    path,
    fallback
  ) {
    if (
      typeof CONFIG ===
        'undefined'
    ) {
      return fallback;
    }

    const keys =
      String(path)
        .split('.');

    let value =
      CONFIG;

    for (
      const key of keys
    ) {
      if (
        value === null ||
        value === undefined ||
        !Object.prototype
          .hasOwnProperty.call(
            value,
            key
          )
      ) {
        return fallback;
      }

      value =
        value[key];
    }

    return value ===
      undefined
      ? fallback
      : value;
  },
};


/* ============================================================
   EXPORT GLOBAL
   ============================================================ */

if (
  typeof window !==
  'undefined'
) {
  window.Validator =
    Validator;
}