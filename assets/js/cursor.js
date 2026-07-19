(function () {
  "use strict";

  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!finePointer || reduceMotion) return;

  document.documentElement.classList.add("has-custom-cursor");

  const dot = document.createElement("div");
  dot.className = "mxm-cursor mxm-cursor__dot";
  const ring = document.createElement("div");
  ring.className = "mxm-cursor mxm-cursor__ring";
  document.body.appendChild(dot);
  document.body.appendChild(ring);

  let mouseX = -100;
  let mouseY = -100;
  let ringX = -100;
  let ringY = -100;
  let visible = false;

  function onMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!visible) {
      visible = true;
      document.documentElement.classList.add("cursor-visible");
    }
  }

  function onLeave() {
    visible = false;
    document.documentElement.classList.remove("cursor-visible");
  }

  document.addEventListener("mousemove", onMove, { passive: true });
  document.addEventListener("mouseleave", onLeave);

  const hoverSelector = "a, button, .btn, [role='button'], .filter-btn, .faq-question, input, select, textarea, label";
  document.addEventListener("mouseover", (e) => {
    if (e.target.closest(hoverSelector)) {
      document.documentElement.classList.add("cursor-hover");
    }
  });
  document.addEventListener("mouseout", (e) => {
    if (e.target.closest(hoverSelector) && !e.relatedTarget?.closest?.(hoverSelector)) {
      document.documentElement.classList.remove("cursor-hover");
    }
  });

  function tick() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    dot.style.transform = "translate3d(" + mouseX + "px," + mouseY + "px,0)";
    ring.style.transform = "translate3d(" + ringX + "px," + ringY + "px,0)";
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
