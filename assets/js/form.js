(function () {
  const form = document.querySelector("[data-contact-form]");
  if (!form) return;

  const successBox = document.querySelector("[data-form-success]");
  const errorBox = document.querySelector("[data-form-submit-error]");
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const ENDPOINT = "https://formsubmit.co/ajax/mxmgraphics@gmail.com";

  function setFieldError(field, hasError) {
    const group = field.closest(".form-group");
    if (group) group.classList.toggle("has-error", hasError);
  }

  function validate() {
    let isValid = true;
    let firstInvalid = null;

    form.querySelectorAll("[data-required]").forEach((field) => {
      const value = field.value.trim();
      const fieldValid = value.length > 0 && (field.type !== "email" || emailPattern.test(value));
      setFieldError(field, !fieldValid);
      if (!fieldValid) {
        isValid = false;
        firstInvalid = firstInvalid || field;
      }
    });

    if (firstInvalid) firstInvalid.focus();
    return isValid;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (errorBox) errorBox.classList.remove("is-visible");

    const honeypot = form.querySelector('[name="bot-field"]');
    const honey = form.querySelector('[name="_honey"]');
    if ((honeypot && honeypot.value) || (honey && honey.value)) {
      form.reset();
      form.hidden = true;
      if (successBox) successBox.classList.add("is-visible");
      return;
    }

    if (!validate()) return;

    const submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    const formData = new FormData(form);
    const payload = {};
    formData.forEach((value, key) => {
      if (key === "bot-field" || key === "_honey") return;
      payload[key] = value;
    });

    fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Submit failed with status " + res.status);
        return res.json().catch(() => ({}));
      })
      .then(() => {
        form.reset();
        form.hidden = true;
        if (successBox) successBox.classList.add("is-visible");
      })
      .catch(() => {
        if (errorBox) errorBox.classList.add("is-visible");
      })
      .finally(() => {
        if (submitBtn) submitBtn.disabled = false;
      });
  });

  form.querySelectorAll("[data-required]").forEach((field) => {
    field.addEventListener("blur", () => {
      const value = field.value.trim();
      const fieldValid = value.length > 0 && (field.type !== "email" || emailPattern.test(value));
      setFieldError(field, !fieldValid);
    });
  });
})();
