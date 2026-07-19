(function () {
  "use strict";

  const root = document.querySelector("[data-testimonials]");
  if (!root) return;

  const slides = Array.prototype.slice.call(root.querySelectorAll("[data-testimonial-slide]"));
  const media = root.querySelector("[data-testimonial-media]");
  const prevBtn = root.querySelector("[data-testimonial-prev]");
  const nextBtn = root.querySelector("[data-testimonial-next]");
  const dotsWrap = root.querySelector("[data-testimonial-dots]");
  if (!slides.length || !dotsWrap) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let index = 0;
  let animating = false;

  function canAnimate() {
    return !reduceMotion && typeof anime !== "undefined" && typeof anime.animate === "function";
  }

  function getDotLabel(n) {
    const dict = window.mxmI18n && window.mxmI18n.getDict && window.mxmI18n.getDict();
    const template =
      (dict && window.mxmI18n.getKey(dict, "home.testimonials.dotLabel")) || "Opinia {n}";
    return String(template).replace("{n}", String(n));
  }

  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "testimonial__dot";
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", getDotLabel(i + 1));
    dot.addEventListener("click", () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  const dots = Array.prototype.slice.call(dotsWrap.querySelectorAll(".testimonial__dot"));

  function refreshDotLabels() {
    dots.forEach((dot, i) => {
      dot.setAttribute("aria-label", getDotLabel(i + 1));
    });
  }

  document.addEventListener("mxm:langchange", refreshDotLabels);

  function applySlideState(nextIndex) {
    slides.forEach((slide, i) => {
      const active = i === nextIndex;
      slide.classList.toggle("is-active", active);
      if (active) slide.removeAttribute("hidden");
      else slide.setAttribute("hidden", "");
    });
    dots.forEach((dot, i) => {
      const active = i === nextIndex;
      dot.classList.toggle("is-active", active);
      dot.setAttribute("aria-selected", active ? "true" : "false");
    });
    if (media) {
      const src = slides[nextIndex].getAttribute("data-media");
      if (src) media.src = src;
    }
  }

  function clearInline(els) {
    Array.prototype.forEach.call(els, (el) => {
      el.style.opacity = "";
      el.style.transform = "";
    });
  }

  function goTo(next) {
    if (animating) return;
    const target = (next + slides.length) % slides.length;
    if (target === index) return;

    const from = index;
    index = target;

    if (!canAnimate()) {
      applySlideState(target);
      return;
    }

    animating = true;
    const outgoing = slides[from];
    const outParts = outgoing.querySelectorAll(".testimonial__quote, .testimonial__author");

    anime
      .animate(outParts, {
        opacity: [1, 0],
        translateY: [0, -8],
        duration: 300,
        ease: "outQuad",
      })
      .then(function () {
        if (media) {
          return anime.animate(media, {
            opacity: [1, 0],
            duration: 220,
            ease: "outQuad",
          });
        }
      })
      .then(function () {
        applySlideState(target);
        const incoming = slides[target];
        const inParts = incoming.querySelectorAll(".testimonial__quote, .testimonial__author");
        clearInline(outParts);
        if (media) media.style.opacity = "0";
        Array.prototype.forEach.call(inParts, function (el) {
          el.style.opacity = "0";
        });

        const stagger = typeof anime.stagger === "function" ? anime.stagger(70) : 0;
        const textAnim = anime.animate(inParts, {
          opacity: [0, 1],
          translateY: [14, 0],
          duration: 480,
          delay: stagger,
          ease: "outExpo",
        });

        const mediaAnim = media
          ? anime.animate(media, {
              opacity: [0, 1],
              scale: [1.03, 1],
              duration: 520,
              ease: "outExpo",
            })
          : Promise.resolve();

        return Promise.all([textAnim, mediaAnim]);
      })
      .then(function () {
        const incoming = slides[target];
        clearInline(incoming.querySelectorAll(".testimonial__quote, .testimonial__author"));
        if (media) {
          media.style.opacity = "";
          media.style.transform = "";
        }
        animating = false;
      })
      .catch(function () {
        applySlideState(target);
        animating = false;
      });
  }

  prevBtn && prevBtn.addEventListener("click", function () {
    goTo(index - 1);
  });
  nextBtn && nextBtn.addEventListener("click", function () {
    goTo(index + 1);
  });

  root.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(index - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      goTo(index + 1);
    }
  });

  applySlideState(0);
})();
