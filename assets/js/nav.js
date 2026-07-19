(function () {
  const toggle = document.querySelector("[data-nav-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");

  if (!toggle || !mobileNav) return;

  function closeNav() {
    toggle.setAttribute("aria-expanded", "false");
    mobileNav.classList.remove("is-open");
  }

  function openNav() {
    toggle.setAttribute("aria-expanded", "true");
    mobileNav.classList.add("is-open");
  }

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    isOpen ? closeNav() : openNav();
  });

  mobileNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeNav);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeNav();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) closeNav();
  });

  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
})();
