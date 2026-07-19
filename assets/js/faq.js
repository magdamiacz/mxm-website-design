(function () {
  const lists = document.querySelectorAll("[data-faq-list]");

  lists.forEach((list) => {
    const items = list.querySelectorAll(".faq-item");

    items.forEach((item) => {
      const question = item.querySelector(".faq-question");
      const answer = item.querySelector(".faq-answer");

      question.addEventListener("click", () => {
        const isOpen = item.classList.contains("is-open");

        items.forEach((other) => {
          other.classList.remove("is-open");
          other.querySelector(".faq-question").setAttribute("aria-expanded", "false");
          other.querySelector(".faq-answer").style.maxHeight = null;
        });

        if (!isOpen) {
          item.classList.add("is-open");
          question.setAttribute("aria-expanded", "true");
          answer.style.maxHeight = answer.scrollHeight + "px";
        }
      });
    });
  });
})();
