/* ============================================================
   MEDICARE — ABOUT PAGE
   File: js/pages/about.js
   ============================================================ */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", initAboutPage);


  /* ==========================================================
     INIT
     ========================================================== */

  function initAboutPage() {
    initRevealAnimation();
    initStatsCounter();
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


  /* ==========================================================
     REVEAL ANIMATION
     ========================================================== */

  function initRevealAnimation() {
    const elements = getRevealElements();

    if (!elements.length) {
      return;
    }

    /*
     * Nếu người dùng không muốn animation
     * hoặc trình duyệt không hỗ trợ Observer,
     * hiển thị luôn toàn bộ nội dung.
     */

    if (
      prefersReducedMotion() ||
      !("IntersectionObserver" in window)
    ) {
      elements.forEach(function (element) {
        element.classList.add("is-visible");
      });

      return;
    }


    const observer = new IntersectionObserver(
      function (entries, currentObserver) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");

          currentObserver.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -35px 0px"
      }
    );


    elements.forEach(function (element) {
      observer.observe(element);
    });
  }


  /* ==========================================================
     GET REVEAL ELEMENTS
     ========================================================== */

  function getRevealElements() {
    const groups = [
      {
        selector: ".about-intro__content",
        delay: 0
      },
      {
        selector: ".about-intro__visual",
        delay: 1
      },
      {
        selector: ".about-section-head",
        delay: 0
      },
      {
        selector: ".about-stat",
        stagger: true
      },
      {
        selector: ".mvv-card",
        stagger: true
      },
      {
        selector: ".about-why__intro",
        delay: 0
      },
      {
        selector: ".about-why .feature",
        stagger: true
      },
      {
        selector: ".team-card",
        stagger: true
      }
    ];


    const elements = [];


    groups.forEach(function (group) {
      const nodes = Array.from(
        document.querySelectorAll(group.selector)
      );


      nodes.forEach(function (element, index) {
        element.classList.add("about-reveal");


        if (group.stagger) {
          const delay = index % 4;

          if (delay > 0) {
            element.classList.add(
              "about-reveal-delay-" +
              Math.min(delay, 3)
            );
          }
        } else if (group.delay) {
          element.classList.add(
            "about-reveal-delay-" +
            group.delay
          );
        }


        elements.push(element);
      });
    });


    return elements;
  }


  /* ==========================================================
     STATS COUNTER
     ========================================================== */

  function initStatsCounter() {
    const statNumbers = Array.from(
      document.querySelectorAll(
        ".about-stat__number"
      )
    );


    if (!statNumbers.length) {
      return;
    }


    /*
     * Lưu text ban đầu để không phụ thuộc
     * vào dữ liệu viết cứng trong JS.
     */

    statNumbers.forEach(function (element) {
      element.dataset.finalValue =
        element.textContent.trim();
    });


    if (
      prefersReducedMotion() ||
      !("IntersectionObserver" in window)
    ) {
      showFinalStats(statNumbers);

      return;
    }


    /*
     * Chỉ chạy counter khi khu vực thống kê
     * thực sự xuất hiện trên màn hình.
     */

    const statsSection =
      document.querySelector(
        ".about-stats-section"
      );


    if (!statsSection) {
      showFinalStats(statNumbers);

      return;
    }


    let hasAnimated = false;


    const observer =
      new IntersectionObserver(
        function (entries, currentObserver) {
          entries.forEach(function (entry) {
            if (
              !entry.isIntersecting ||
              hasAnimated
            ) {
              return;
            }


            hasAnimated = true;


            statNumbers.forEach(
              function (element, index) {
                window.setTimeout(
                  function () {
                    animateStat(element);
                  },
                  index * 90
                );
              }
            );


            currentObserver.unobserve(
              statsSection
            );
          });
        },
        {
          threshold: 0.2
        }
      );


    observer.observe(statsSection);
  }


  /* ==========================================================
     ANIMATE STAT
     ========================================================== */

  function animateStat(element) {
    if (!element) {
      return;
    }


    const original =
      element.dataset.finalValue ||
      element.textContent.trim();


    const config =
      parseStatValue(original);


    if (!config) {
      element.textContent = original;

      return;
    }


    const duration =
      config.decimals > 0
        ? 1100
        : 1350;


    const startTime =
      performance.now();


    element.textContent =
      formatStatValue(
        0,
        config
      );


    function update(currentTime) {
      const elapsed =
        currentTime - startTime;


      const progress =
        Math.min(
          elapsed / duration,
          1
        );


      /*
       * Ease-out cubic.
       */

      const easedProgress =
        1 -
        Math.pow(
          1 - progress,
          3
        );


      const currentValue =
        config.value *
        easedProgress;


      element.textContent =
        formatStatValue(
          currentValue,
          config
        );


      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent =
          original;
      }
    }


    requestAnimationFrame(update);
  }


  /* ==========================================================
     PARSE STAT
     ========================================================== */

  function parseStatValue(value) {
    if (!value) {
      return null;
    }


    const cleaned =
      String(value)
        .trim()
        .replace(/\s/g, "");


    /*
     * Rating:
     * 4.9/5
     */

    if (cleaned.includes("/")) {
      const parts =
        cleaned.split("/");


      const number =
        Number(
          parts[0].replace(",", ".")
        );


      if (!Number.isFinite(number)) {
        return null;
      }


      return {
        value: number,
        decimals: getDecimalPlaces(parts[0]),
        suffix: "/" + parts.slice(1).join("/"),
        useThousands: false
      };
    }


    /*
     * Giá trị dạng:
     * 500+
     * 50.000+
     * 100+
     */

    const hasPlus =
      cleaned.endsWith("+");


    const withoutSuffix =
      hasPlus
        ? cleaned.slice(0, -1)
        : cleaned;


    /*
     * Dấu chấm trong 50.000 là phân cách hàng nghìn.
     * Với 4.9/5 đã xử lý phía trên.
     */

    const numericText =
      withoutSuffix.replace(/\./g, "");


    const number =
      Number(numericText);


    if (!Number.isFinite(number)) {
      return null;
    }


    return {
      value: number,
      decimals: 0,
      suffix: hasPlus ? "+" : "",
      useThousands:
        number >= 1000
    };
  }


  /* ==========================================================
     FORMAT STAT
     ========================================================== */

  function formatStatValue(
    value,
    config
  ) {
    if (!config) {
      return String(value);
    }


    let formatted;


    if (config.decimals > 0) {
      formatted =
        Number(value).toFixed(
          config.decimals
        );
    } else {
      const rounded =
        Math.round(value);


      formatted =
        config.useThousands
          ? formatVietnameseNumber(
              rounded
            )
          : String(rounded);
    }


    return (
      formatted +
      config.suffix
    );
  }


  /* ==========================================================
     VIETNAMESE NUMBER
     ========================================================== */

  function formatVietnameseNumber(number) {
    try {
      return new Intl.NumberFormat(
        "vi-VN"
      ).format(number);
    } catch (error) {
      return String(number).replace(
        /\B(?=(\d{3})+(?!\d))/g,
        "."
      );
    }
  }


  /* ==========================================================
     DECIMAL PLACES
     ========================================================== */

  function getDecimalPlaces(value) {
    const normalized =
      String(value).replace(",", ".");


    const parts =
      normalized.split(".");


    return parts.length > 1
      ? parts[1].length
      : 0;
  }


  /* ==========================================================
     SHOW FINAL STATS
     ========================================================== */

  function showFinalStats(elements) {
    elements.forEach(function (element) {
      if (
        element.dataset.finalValue
      ) {
        element.textContent =
          element.dataset.finalValue;
      }
    });
  }

})();