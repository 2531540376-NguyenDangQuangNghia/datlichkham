/* ============================================================
   MEDICARE — FAQ PAGE
   File: js/pages/faq.js
   ============================================================ */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", initFAQ);

  function initFAQ() {
    const searchInput = document.getElementById("faqSearch");
    const clearButton = document.getElementById("faqSearchClear");
    const emptyState = document.getElementById("faqEmpty");

    const layout = document.querySelector(".faq-layout");

    const categories = Array.from(
      document.querySelectorAll(".faq-category")
    );

    const menuItems = Array.from(
      document.querySelectorAll(".faq-menu__item")
    );

    const searchChips = Array.from(
      document.querySelectorAll(".faq-search__chip")
    );

    if (!searchInput || !categories.length) {
      return;
    }


    /* ========================================================
       NORMALIZE TEXT
       ======================================================== */

    function normalizeText(value) {
      return String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .toLowerCase()
        .trim();
    }


    /* ========================================================
       SEARCH
       ======================================================== */

    function searchFAQ(query) {
      const keyword = normalizeText(query);

      let totalMatches = 0;

      if (layout) {
        layout.classList.toggle(
          "is-searching",
          keyword.length > 0
        );
      }

      categories.forEach(function (category) {
        const items = Array.from(
          category.querySelectorAll(".faq-item")
        );

        let categoryMatches = 0;

        items.forEach(function (item) {
          const question = item.querySelector(".faq-item__q");
          const answer = item.querySelector(".faq-item__a");

          const questionText = question
            ? question.textContent
            : "";

          const answerText = answer
            ? answer.textContent
            : "";

          const searchableText = normalizeText(
            questionText + " " + answerText
          );

          const matched =
            !keyword ||
            searchableText.includes(keyword);

          item.hidden = !matched;

          if (matched) {
            categoryMatches++;
            totalMatches++;

            if (keyword) {
              item.open = true;
            }
          } else {
            item.open = false;
          }
        });

        const showCategory =
          !keyword ||
          categoryMatches > 0;

        category.hidden = !showCategory;

        category.classList.toggle(
          "is-search-match",
          keyword.length > 0 &&
          categoryMatches > 0
        );
      });


      /* Empty state */

      if (emptyState) {
        emptyState.hidden =
          !keyword ||
          totalMatches > 0;
      }


      /* Clear button */

      if (clearButton) {
        clearButton.hidden =
          searchInput.value.trim().length === 0;
      }


      /* Khi search không giữ sidebar active giả */

      if (keyword) {
        menuItems.forEach(function (item) {
          item.classList.remove("is-active");
        });
      } else {
        updateActiveMenu();
      }
    }


    /* ========================================================
       INPUT SEARCH
       ======================================================== */

    searchInput.addEventListener(
      "input",
      function () {
        searchFAQ(searchInput.value);
      }
    );


    /* ========================================================
       CLEAR SEARCH
       ======================================================== */

    if (clearButton) {
      clearButton.addEventListener(
        "click",
        function () {
          searchInput.value = "";

          searchFAQ("");

          searchInput.focus();
        }
      );
    }


    /* ========================================================
       SEARCH CHIPS
       ======================================================== */

    searchChips.forEach(function (chip) {
      chip.addEventListener(
        "click",
        function () {
          const query =
            chip.dataset.q || chip.textContent;

          searchInput.value = query.trim();

          searchFAQ(searchInput.value);

          searchInput.focus();
        }
      );
    });


    /* ========================================================
       SIDEBAR NAVIGATION
       ======================================================== */

    menuItems.forEach(function (menuItem) {
      menuItem.addEventListener(
        "click",
        function (event) {
          const href =
            menuItem.getAttribute("href");

          if (
            !href ||
            !href.startsWith("#")
          ) {
            return;
          }

          const target =
            document.querySelector(href);

          if (!target) {
            return;
          }

          event.preventDefault();


          /* Clear search before navigation */

          if (searchInput.value.trim()) {
            searchInput.value = "";
            searchFAQ("");
          }


          /* Active state */

          setActiveMenu(menuItem);


          /* Smooth scroll */

          target.scrollIntoView({
            behavior: prefersReducedMotion()
              ? "auto"
              : "smooth",

            block: "start"
          });


          /* Update URL */

          if (
            window.history &&
            window.history.replaceState
          ) {
            window.history.replaceState(
              null,
              "",
              href
            );
          }
        }
      );
    });


    /* ========================================================
       ACTIVE SIDEBAR ON SCROLL
       ======================================================== */

    let scrollTimer = null;

    window.addEventListener(
      "scroll",
      function () {
        if (searchInput.value.trim()) {
          return;
        }

        if (scrollTimer) {
          cancelAnimationFrame(scrollTimer);
        }

        scrollTimer =
          requestAnimationFrame(
            updateActiveMenu
          );
      },
      {
        passive: true
      }
    );


    function updateActiveMenu() {
      if (!categories.length) {
        return;
      }

      const offset = 150;

      let currentCategory =
        categories[0];

      categories.forEach(function (category) {
        if (category.hidden) {
          return;
        }

        const rect =
          category.getBoundingClientRect();

        if (rect.top <= offset) {
          currentCategory =
            category;
        }
      });

      if (!currentCategory) {
        return;
      }

      const id =
        currentCategory.id;

      const activeMenu =
        menuItems.find(function (item) {
          return (
            item.getAttribute("href") ===
            "#" + id
          );
        });

      if (activeMenu) {
        setActiveMenu(activeMenu);
      }
    }


    function setActiveMenu(activeItem) {
      menuItems.forEach(function (item) {
        const isActive =
          item === activeItem;

        item.classList.toggle(
          "is-active",
          isActive
        );

        if (isActive) {
          item.setAttribute(
            "aria-current",
            "true"
          );
        } else {
          item.removeAttribute(
            "aria-current"
          );
        }
      });
    }


    /* ========================================================
       ACCORDION
       Chỉ mở 1 câu trong cùng category
       ======================================================== */

    categories.forEach(function (category) {
      const details = Array.from(
        category.querySelectorAll(".faq-item")
      );

      details.forEach(function (item) {
        item.addEventListener(
          "toggle",
          function () {
            if (!item.open) {
              return;
            }

            /*
             * Khi đang search cho phép nhiều
             * kết quả cùng mở.
             */

            if (searchInput.value.trim()) {
              return;
            }

            details.forEach(
              function (otherItem) {
                if (
                  otherItem !== item &&
                  otherItem.open
                ) {
                  otherItem.open = false;
                }
              }
            );
          }
        );
      });
    });


    /* ========================================================
       HASH ON FIRST LOAD
       ======================================================== */

    function handleInitialHash() {
      const hash =
        window.location.hash;

      if (!hash) {
        updateActiveMenu();
        return;
      }

      const target =
        document.querySelector(hash);

      if (
        !target ||
        !target.classList.contains(
          "faq-category"
        )
      ) {
        updateActiveMenu();
        return;
      }

      const menu =
        menuItems.find(function (item) {
          return (
            item.getAttribute("href") ===
            hash
          );
        });

      if (menu) {
        setActiveMenu(menu);
      }

      setTimeout(function () {
        target.scrollIntoView({
          behavior: "auto",
          block: "start"
        });
      }, 50);
    }


    /* ========================================================
       ESC TO CLEAR SEARCH
       ======================================================== */

    searchInput.addEventListener(
      "keydown",
      function (event) {
        if (
          event.key === "Escape" &&
          searchInput.value
        ) {
          searchInput.value = "";

          searchFAQ("");

          searchInput.blur();
        }
      }
    );


    /* ========================================================
       REDUCED MOTION
       ======================================================== */

    function prefersReducedMotion() {
      return (
        window.matchMedia &&
        window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches
      );
    }


    /* ========================================================
       INITIAL STATE
       ======================================================== */

    searchFAQ("");

    handleInitialHash();
  }
})();