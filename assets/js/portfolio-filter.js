(function () {
  const filterBar = document.querySelector("[data-filter-bar]");
  const cards = document.querySelectorAll("[data-project-card]");
  if (!filterBar) return;

  filterBar.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-filter]");
    if (!btn) return;

    filterBar.querySelectorAll("[data-filter]").forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");

    const filter = btn.getAttribute("data-filter");
    cards.forEach((card) => {
      const matches = filter === "all" || card.getAttribute("data-category") === filter;
      card.style.display = matches ? "" : "none";
    });
  });
})();
