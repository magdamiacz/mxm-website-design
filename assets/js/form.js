(function () {
  const form = document.querySelector("[data-contact-form]");
  if (!form) return;

  const successBox = document.querySelector("[data-form-success]");
  const errorBox = document.querySelector("[data-form-submit-error]");
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  function encodeForm(data) {
    return Object.keys(data)
      .map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
      .join("&");
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (errorBox) errorBox.classList.remove("is-visible");

    const honeypot = form.querySelector('[name="bot-field"]');
    if (honeypot && honeypot.value) {
      // Likely a bot: pretend success without actually submitting.
      form.reset();
      form.hidden = true;
      if (successBox) successBox.classList.add("is-visible");
      return;
    }

    if (!validate()) return;

    const formData = new FormData(form);
    const payload = {};
    formData.forEach((value, key) => {
      payload[key] = value;
    });

    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: encodeForm(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Submit failed with status " + res.status);
        form.reset();
        form.hidden = true;
        if (successBox) successBox.classList.add("is-visible");
      })
      .catch(() => {
        if (errorBox) errorBox.classList.add("is-visible");
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
