(function () {
  "use strict";

  function revealHeroFallback() {
    document.documentElement.classList.remove("js-anim-ready");
  }

  var safetyTimer = setTimeout(revealHeroFallback, 1500);

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    clearTimeout(safetyTimer);
    revealHeroFallback();
    return;
  }

  if (typeof anime === "undefined") {
    clearTimeout(safetyTimer);
    revealHeroFallback();
    return;
  }

  var animate = anime.animate;
  var stagger = typeof anime.stagger === "function" ? anime.stagger : anime.utils && anime.utils.stagger;

  if (typeof animate !== "function" || typeof stagger !== "function") {
    clearTimeout(safetyTimer);
    revealHeroFallback();
    return;
  }

  var HERO_SELECTORS = [".eyebrow", "h1", ".text-lead", ".hero__actions", ".hero-visual"];

  var SCROLL_BLOCK_SELECTORS = [".section-header", ".testimonial", ".mockup-frame", ".cta-banner"];

  var SCROLL_STAGGER_SELECTORS = [
    ".split-section",
    ".grid.grid-3",
    ".grid.grid-4",
    ".package-grid",
    ".tools-grid",
    ".stats-bar",
    ".project-grid",
    ".faq-list",
    ".checklist",
    ".contact-steps",
  ];

  function animateIn(targets, delayFn) {
    return animate(targets, {
      opacity: [0, 1],
      translateY: [16, 0],
      duration: 600,
      ease: "outExpo",
      delay: delayFn || 0,
    });
  }

  function runHeroEntrance() {
    var heroes = document.querySelectorAll(".hero-anim");
    if (!heroes.length) {
      clearTimeout(safetyTimer);
      revealHeroFallback();
      return;
    }

    heroes.forEach(function (hero) {
      var parts = [];
      HERO_SELECTORS.forEach(function (sel) {
        hero.querySelectorAll(sel).forEach(function (el) {
          parts.push(el);
        });
      });

      if (!parts.length) {
        clearTimeout(safetyTimer);
        revealHeroFallback();
        return;
      }

      animateIn(parts, stagger(90)).then(function () {
        clearTimeout(safetyTimer);
        document.documentElement.classList.remove("js-anim-ready");
        parts.forEach(function (el) {
          el.style.opacity = "";
          el.style.transform = "";
        });
      });
    });
  }

  function prepareScrollTargets() {
    var prepared = [];
    var claimed = new Set();

    function claim(el) {
      if (claimed.has(el)) return false;
      claimed.add(el);
      return true;
    }

    function isClaimedOrInsideClaimed(el) {
      if (claimed.has(el)) return true;
      var node = el.parentElement;
      while (node) {
        if (claimed.has(node)) return true;
        node = node.parentElement;
      }
      return false;
    }

    SCROLL_STAGGER_SELECTORS.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (container) {
        if (container.closest(".hero-anim")) return;
        if (isClaimedOrInsideClaimed(container)) return;
        var children = Array.prototype.slice.call(container.children);
        if (!children.length) return;
        if (!claim(container)) return;
        children.forEach(function (child) {
          claim(child);
          child.style.opacity = "0";
          child.style.transform = "translateY(16px)";
        });
        prepared.push({ type: "stagger", el: container, children: children });
      });
    });

    SCROLL_BLOCK_SELECTORS.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        if (el.closest(".hero-anim")) return;
        if (isClaimedOrInsideClaimed(el)) return;
        if (!claim(el)) return;
        el.style.opacity = "0";
        el.style.transform = "translateY(16px)";
        prepared.push({ type: "block", el: el });
      });
    });

    return prepared;
  }

  function runScrollReveal(prepared) {
    if (!prepared.length || typeof IntersectionObserver === "undefined") {
      prepared.forEach(function (item) {
        if (item.type === "block") {
          item.el.style.opacity = "";
          item.el.style.transform = "";
        } else {
          item.children.forEach(function (child) {
            child.style.opacity = "";
            child.style.transform = "";
          });
        }
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var target = entry.target;
          var meta = prepared.find(function (item) {
            return item.el === target;
          });
          if (!meta) return;
          observer.unobserve(target);

          if (meta.type === "block") {
            animateIn(meta.el).then(function () {
              meta.el.style.opacity = "";
              meta.el.style.transform = "";
            });
          } else {
            animateIn(meta.children, stagger(70)).then(function () {
              meta.children.forEach(function (child) {
                child.style.opacity = "";
                child.style.transform = "";
              });
            });
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -32px 0px" }
    );

    prepared.forEach(function (item) {
      observer.observe(item.el);
    });
  }

  try {
    runHeroEntrance();
    runScrollReveal(prepareScrollTargets());
  } catch (err) {
    clearTimeout(safetyTimer);
    revealHeroFallback();
  }
})();
