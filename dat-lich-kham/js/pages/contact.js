/* ============================================================
   MEDICARE — CONTACT PAGE
   File: js/pages/contact.js
   ============================================================ */

(function () {
  "use strict";


  /* ==========================================================
     CONFIG
     ========================================================== */

  const STORAGE_KEY = "medicare_contact_messages";

  const MAX_MESSAGE_LENGTH = 1000;

  const PHONE_REGEX = /^(0|\+84)[0-9]{9,10}$/;

  const EMAIL_REGEX =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


  /* ==========================================================
     INIT
     ========================================================== */

  document.addEventListener(
    "DOMContentLoaded",
    initContactPage
  );


  function initContactPage() {

    const form =
      document.getElementById("contactForm");

    if (!form) {
      return;
    }


    const fields = {
      name:
        document.getElementById("ctName"),

      phone:
        document.getElementById("ctPhone"),

      email:
        document.getElementById("ctEmail"),

      subject:
        document.getElementById("ctSubject"),

      message:
        document.getElementById("ctMessage"),

      agree:
        document.getElementById("ctAgree")
    };


    const alertBox =
      document.getElementById("alertBox");

    const submitButton =
      document.getElementById("contactSubmit");

    const messageCounter =
      document.getElementById("messageCounter");


    /* ========================================================
       PREFILL USER
       ======================================================== */

    prefillCurrentUser(fields);


    /* ========================================================
       MESSAGE COUNTER
       ======================================================== */

    updateMessageCounter(
      fields.message,
      messageCounter
    );


    if (fields.message) {

      fields.message.addEventListener(
        "input",
        function () {

          updateMessageCounter(
            fields.message,
            messageCounter
          );

          if (
            fields.message.value.trim()
          ) {
            validateField(
              "message",
              fields.message
            );
          }

        }
      );

    }


    /* ========================================================
       PHONE INPUT
       ======================================================== */

    if (fields.phone) {

      fields.phone.addEventListener(
        "input",
        function () {

          /*
           * Chỉ giữ số nếu người dùng
           * nhập số điện thoại Việt Nam dạng 0...
           */

          if (
            !fields.phone.value
              .startsWith("+")
          ) {

            fields.phone.value =
              fields.phone.value
                .replace(/\D/g, "")
                .slice(0, 11);

          }

        }
      );

    }


    /* ========================================================
       REALTIME VALIDATION
       ======================================================== */

    bindFieldValidation(
      "name",
      fields.name
    );

    bindFieldValidation(
      "phone",
      fields.phone
    );

    bindFieldValidation(
      "email",
      fields.email
    );

    bindFieldValidation(
      "subject",
      fields.subject
    );

    bindFieldValidation(
      "message",
      fields.message
    );


    if (fields.agree) {

      fields.agree.addEventListener(
        "change",
        function () {

          validateAgreement(
            fields.agree
          );

        }
      );

    }


    /* ========================================================
       FORM SUBMIT
       ======================================================== */

    form.addEventListener(
      "submit",
      function (event) {

        event.preventDefault();

        clearAlert(alertBox);


        const isValid =
          validateForm(fields);


        if (!isValid) {

          showAlert(
            alertBox,
            "Vui lòng kiểm tra lại các thông tin được đánh dấu.",
            "error"
          );

          focusFirstInvalid(form);

          return;

        }


        setSubmitting(
          submitButton,
          true
        );


        /*
         * Static project nên xử lý ngay.
         * setTimeout ngắn chỉ để thể hiện trạng thái
         * gửi rõ ràng cho người dùng.
         */

        window.setTimeout(
          function () {

            try {

              const message =
                buildContactMessage(fields);

              saveContactMessage(message);

              resetContactForm(
                form,
                fields,
                messageCounter
              );

              showAlert(
                alertBox,
                "Yêu cầu của bạn đã được ghi nhận. MediCare sẽ phản hồi trong thời gian sớm nhất.",
                "success"
              );


              /*
               * Nếu project có Toast component
               * thì sử dụng thêm.
               */

              showProjectToast(
                "Gửi yêu cầu thành công",
                "success"
              );


              if (alertBox) {

                alertBox.scrollIntoView({
                  behavior:
                    prefersReducedMotion()
                      ? "auto"
                      : "smooth",

                  block: "center"
                });

              }

            } catch (error) {

              console.error(
                "[MediCare Contact]",
                error
              );

              showAlert(
                alertBox,
                "Không thể lưu yêu cầu lúc này. Vui lòng thử lại.",
                "error"
              );

            } finally {

              setSubmitting(
                submitButton,
                false
              );

            }

          },
          450
        );

      }
    );

  }


  /* ==========================================================
     BIND VALIDATION
     ========================================================== */

  function bindFieldValidation(
    fieldName,
    element
  ) {

    if (!element) {
      return;
    }


    element.addEventListener(
      "blur",
      function () {

        validateField(
          fieldName,
          element
        );

      }
    );


    element.addEventListener(
      "input",
      function () {

        const wrapper =
          element.closest(
            ".contact-input"
          );

        if (
          wrapper &&
          wrapper.classList.contains(
            "is-invalid"
          )
        ) {

          validateField(
            fieldName,
            element
          );

        }

      }
    );


    if (
      element.tagName === "SELECT"
    ) {

      element.addEventListener(
        "change",
        function () {

          validateField(
            fieldName,
            element
          );

        }
      );

    }

  }


  /* ==========================================================
     VALIDATE FORM
     ========================================================== */

  function validateForm(fields) {

    const validations = [

      validateField(
        "name",
        fields.name
      ),

      validateField(
        "phone",
        fields.phone
      ),

      validateField(
        "email",
        fields.email
      ),

      validateField(
        "subject",
        fields.subject
      ),

      validateField(
        "message",
        fields.message
      ),

      validateAgreement(
        fields.agree
      )

    ];


    return validations.every(
      Boolean
    );

  }


  /* ==========================================================
     VALIDATE FIELD
     ========================================================== */

  function validateField(
    fieldName,
    element
  ) {

    if (!element) {
      return true;
    }


    const value =
      element.value.trim();

    let errorMessage = "";


    switch (fieldName) {

      case "name":

        if (!value) {

          errorMessage =
            "Vui lòng nhập họ và tên.";

        } else if (
          value.length < 2
        ) {

          errorMessage =
            "Họ và tên quá ngắn.";

        }

        break;


      case "phone":

        if (!value) {

          errorMessage =
            "Vui lòng nhập số điện thoại.";

        } else {

          const normalizedPhone =
            normalizePhone(value);

          if (
            !PHONE_REGEX.test(
              normalizedPhone
            )
          ) {

            errorMessage =
              "Số điện thoại chưa đúng định dạng.";

          }

        }

        break;


      case "email":

        if (!value) {

          errorMessage =
            "Vui lòng nhập email.";

        } else if (
          !EMAIL_REGEX.test(value)
        ) {

          errorMessage =
            "Email chưa đúng định dạng.";

        }

        break;


      case "subject":

        if (!value) {

          errorMessage =
            "Vui lòng chọn chủ đề cần hỗ trợ.";

        }

        break;


      case "message":

        if (!value) {

          errorMessage =
            "Vui lòng nhập nội dung cần hỗ trợ.";

        } else if (
          value.length < 10
        ) {

          errorMessage =
            "Nội dung cần ít nhất 10 ký tự.";

        } else if (
          value.length >
          MAX_MESSAGE_LENGTH
        ) {

          errorMessage =
            "Nội dung không được vượt quá 1000 ký tự.";

        }

        break;

    }


    if (errorMessage) {

      setFieldError(
        element,
        errorMessage
      );

      return false;

    }


    setFieldValid(element);

    return true;

  }


  /* ==========================================================
     AGREEMENT
     ========================================================== */

  function validateAgreement(
    checkbox
  ) {

    if (!checkbox) {
      return true;
    }


    const label =
      checkbox.closest(
        ".contact-check"
      );

    const error =
      getErrorElement(
        checkbox.id
      );


    if (!checkbox.checked) {

      if (label) {

        label.classList.add(
          "is-invalid"
        );

      }


      if (error) {

        error.textContent =
          "Bạn cần đồng ý với chính sách bảo mật.";

      }


      return false;

    }


    if (label) {

      label.classList.remove(
        "is-invalid"
      );

    }


    if (error) {

      error.textContent = "";

    }


    return true;

  }


  /* ==========================================================
     FIELD ERROR
     ========================================================== */

  function setFieldError(
    element,
    message
  ) {

    const wrapper =
      element.closest(
        ".contact-input"
      );

    const error =
      getErrorElement(
        element.id
      );


    if (wrapper) {

      wrapper.classList.remove(
        "is-valid"
      );

      wrapper.classList.add(
        "is-invalid"
      );

    }


    element.setAttribute(
      "aria-invalid",
      "true"
    );


    if (error) {

      error.textContent =
        message;

    }

  }


  /* ==========================================================
     FIELD VALID
     ========================================================== */

  function setFieldValid(element) {

    const wrapper =
      element.closest(
        ".contact-input"
      );

    const error =
      getErrorElement(
        element.id
      );


    if (wrapper) {

      wrapper.classList.remove(
        "is-invalid"
      );


      if (
        element.value.trim()
      ) {

        wrapper.classList.add(
          "is-valid"
        );

      } else {

        wrapper.classList.remove(
          "is-valid"
        );

      }

    }


    element.removeAttribute(
      "aria-invalid"
    );


    if (error) {

      error.textContent = "";

    }

  }


  /* ==========================================================
     ERROR ELEMENT
     ========================================================== */

  function getErrorElement(id) {

    if (!id) {
      return null;
    }


    return document.querySelector(
      '[data-error-for="' +
      id +
      '"]'
    );

  }


  /* ==========================================================
     MESSAGE COUNTER
     ========================================================== */

  function updateMessageCounter(
    textarea,
    counter
  ) {

    if (
      !textarea ||
      !counter
    ) {
      return;
    }


    const length =
      textarea.value.length;


    counter.textContent =
      length +
      "/" +
      MAX_MESSAGE_LENGTH;


    counter.classList.toggle(
      "is-limit",
      length >=
      MAX_MESSAGE_LENGTH * 0.9
    );

  }


  /* ==========================================================
     BUILD MESSAGE
     ========================================================== */

  function buildContactMessage(
    fields
  ) {

    return {

      id:
        createMessageId(),

      name:
        fields.name.value.trim(),

      phone:
        normalizePhone(
          fields.phone.value
        ),

      email:
        fields.email.value
          .trim()
          .toLowerCase(),

      subject:
        fields.subject.value,

      subjectLabel:
        getSelectedText(
          fields.subject
        ),

      message:
        fields.message.value.trim(),

      status:
        "pending",

      source:
        "contact-page",

      createdAt:
        new Date().toISOString(),

      updatedAt:
        new Date().toISOString()

    };

  }


  /* ==========================================================
     SAVE LOCAL STORAGE
     ========================================================== */

  function saveContactMessage(
    message
  ) {

    const messages =
      readContactMessages();


    messages.unshift(
      message
    );


    /*
     * Giới hạn 100 yêu cầu trong demo
     * để LocalStorage không tăng vô hạn.
     */

    const limitedMessages =
      messages.slice(0, 100);


    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        limitedMessages
      )
    );

  }


  /* ==========================================================
     READ LOCAL STORAGE
     ========================================================== */

  function readContactMessages() {

    try {

      const raw =
        localStorage.getItem(
          STORAGE_KEY
        );


      if (!raw) {
        return [];
      }


      const parsed =
        JSON.parse(raw);


      return Array.isArray(parsed)
        ? parsed
        : [];

    } catch (error) {

      console.warn(
        "[MediCare Contact] Invalid storage data.",
        error
      );


      return [];

    }

  }


  /* ==========================================================
     CREATE ID
     ========================================================== */

  function createMessageId() {

    if (
      window.crypto &&
      typeof crypto.randomUUID ===
      "function"
    ) {

      return (
        "contact_" +
        crypto.randomUUID()
      );

    }


    return (
      "contact_" +
      Date.now() +
      "_" +
      Math.random()
        .toString(36)
        .slice(2, 9)
    );

  }


  /* ==========================================================
     RESET FORM
     ========================================================== */

  function resetContactForm(
    form,
    fields,
    counter
  ) {

    form.reset();


    form
      .querySelectorAll(
        ".contact-input"
      )
      .forEach(
        function (wrapper) {

          wrapper.classList.remove(
            "is-valid",
            "is-invalid"
          );

        }
      );


    form
      .querySelectorAll(
        ".form-error"
      )
      .forEach(
        function (error) {

          error.textContent = "";

        }
      );


    const agreementLabel =
      fields.agree
        ? fields.agree.closest(
            ".contact-check"
          )
        : null;


    if (agreementLabel) {

      agreementLabel.classList.remove(
        "is-invalid"
      );

    }


    Object.keys(fields)
      .forEach(
        function (key) {

          const element =
            fields[key];

          if (element) {

            element.removeAttribute(
              "aria-invalid"
            );

          }

        }
      );


    updateMessageCounter(
      fields.message,
      counter
    );


    /*
     * Nếu user đang đăng nhập,
     * điền lại name/email/phone sau reset.
     */

    prefillCurrentUser(fields);

  }


  /* ==========================================================
     ALERT
     ========================================================== */

  function showAlert(
    alertBox,
    message,
    type
  ) {

    if (!alertBox) {
      return;
    }


    alertBox.className =
      "alert contact-alert " +
      (
        type === "success"
          ? "contact-alert--success"
          : "contact-alert--error"
      );


    alertBox.textContent =
      message;

  }


  function clearAlert(alertBox) {

    if (!alertBox) {
      return;
    }


    alertBox.className =
      "alert";

    alertBox.textContent =
      "";

  }


  /* ==========================================================
     SUBMIT STATE
     ========================================================== */

  function setSubmitting(
    button,
    loading
  ) {

    if (!button) {
      return;
    }


    button.disabled =
      loading;


    button.classList.toggle(
      "is-loading",
      loading
    );


    const text =
      button.querySelector("span");


    if (text) {

      text.textContent =
        loading
          ? "Đang gửi..."
          : "Gửi yêu cầu hỗ trợ";

    }


    button.setAttribute(
      "aria-busy",
      loading
        ? "true"
        : "false"
    );

  }


  /* ==========================================================
     FOCUS FIRST INVALID
     ========================================================== */

  function focusFirstInvalid(form) {

    if (!form) {
      return;
    }


    const invalid =
      form.querySelector(
        '[aria-invalid="true"]'
      );


    if (
      invalid &&
      typeof invalid.focus ===
      "function"
    ) {

      invalid.focus();

    }

  }


  /* ==========================================================
     PHONE NORMALIZATION
     ========================================================== */

  function normalizePhone(phone) {

    let value =
      String(phone || "")
        .trim()
        .replace(
          /[\s().-]/g,
          ""
        );


    if (
      value.startsWith("84") &&
      !value.startsWith("+84")
    ) {

      value =
        "+" + value;

    }


    return value;

  }


  /* ==========================================================
     SELECT LABEL
     ========================================================== */

  function getSelectedText(select) {

    if (
      !select ||
      select.selectedIndex < 0
    ) {
      return "";
    }


    return (
      select.options[
        select.selectedIndex
      ].textContent.trim()
    );

  }


  /* ==========================================================
     PREFILL CURRENT USER
     ========================================================== */

  function prefillCurrentUser(
    fields
  ) {

    const user =
      getCurrentUser();


    if (!user) {
      return;
    }


    if (
      fields.name &&
      !fields.name.value
    ) {

      fields.name.value =
        user.name ||
        user.fullName ||
        "";

    }


    if (
      fields.email &&
      !fields.email.value
    ) {

      fields.email.value =
        user.email ||
        "";

    }


    if (
      fields.phone &&
      !fields.phone.value
    ) {

      fields.phone.value =
        user.phone ||
        "";

    }

  }


  /* ==========================================================
     GET CURRENT USER
     ========================================================== */

  function getCurrentUser() {

    /*
     * Ưu tiên AuthService nếu project
     * hiện tại có method getCurrentUser().
     */

    try {

      if (
        window.AuthService &&
        typeof window.AuthService
          .getCurrentUser ===
          "function"
      ) {

        const user =
          window.AuthService
            .getCurrentUser();


        if (user) {
          return user;
        }

      }

    } catch (error) {

      console.warn(
        "[MediCare Contact] AuthService:",
        error
      );

    }


    /*
     * Fallback cho LocalStorage.
     * Không ép project phải có key này.
     */

    const possibleKeys = [
      "medicare_current_user",
      "medicare_user",
      "currentUser"
    ];


    for (
      let index = 0;
      index < possibleKeys.length;
      index++
    ) {

      try {

        const raw =
          localStorage.getItem(
            possibleKeys[index]
          );


        if (!raw) {
          continue;
        }


        const parsed =
          JSON.parse(raw);


        if (
          parsed &&
          typeof parsed ===
          "object"
        ) {

          return parsed;

        }

      } catch (error) {
        /* Ignore invalid item */
      }

    }


    return null;

  }


  /* ==========================================================
     PROJECT TOAST
     ========================================================== */

  function showProjectToast(
    message,
    type
  ) {

    /*
     * Hỗ trợ một số cách khai báo Toast
     * thường dùng nhưng không bắt buộc.
     */

    try {

      if (
        window.Toast &&
        typeof window.Toast.show ===
          "function"
      ) {

        window.Toast.show(
          message,
          type
        );

        return;

      }


      if (
        typeof window.showToast ===
        "function"
      ) {

        window.showToast(
          message,
          type
        );

      }

    } catch (error) {

      console.warn(
        "[MediCare Contact] Toast:",
        error
      );

    }

  }


  /* ==========================================================
     REDUCED MOTION
     ========================================================== */

  function prefersReducedMotion() {

    return Boolean(
      window.matchMedia &&
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches
    );

  }

})();