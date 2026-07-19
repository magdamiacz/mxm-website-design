(function () {
  const LANG_KEY = "mxm-lang";
  const DEFAULT_LANG = "pl";
  const cache = {};

  function getKey(obj, path) {
    return path.split(".").reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
  }

  function applyDict(dict) {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const value = getKey(dict, el.getAttribute("data-i18n"));
      if (value !== undefined) el.textContent = value;
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const value = getKey(dict, el.getAttribute("data-i18n-placeholder"));
      if (value !== undefined) el.setAttribute("placeholder", value);
    });
    document.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
      const value = getKey(dict, el.getAttribute("data-i18n-aria-label"));
      if (value !== undefined) el.setAttribute("aria-label", value);
    });
  }

  function setActiveButton(lang) {
    document.querySelectorAll("[data-lang-btn]").forEach((btn) => {
      btn.classList.toggle("is-active", btn.getAttribute("data-lang-btn") === lang);
    });
  }

  function loadDict(lang) {
    if (cache[lang]) return Promise.resolve(cache[lang]);
    return fetch("assets/js/i18n/" + lang + ".json")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("i18n fetch failed"))))
      .then((dict) => {
        cache[lang] = dict;
        return dict;
      });
  }

  function setLang(lang) {
    document.documentElement.setAttribute("lang", lang);
    setActiveButton(lang);
    localStorage.setItem(LANG_KEY, lang);

    if (lang === DEFAULT_LANG) {
      // Default markup is authored in Polish; reload it directly instead of
      // depending on a fetch (keeps the toggle instant and works offline).
      loadDict(DEFAULT_LANG).then(applyDict).catch(() => {});
      return;
    }

    loadDict(lang)
      .then(applyDict)
      .catch(() => {
        // Falls back silently to whatever is on the page (Polish default).
      });
  }

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-lang-btn]");
    if (!btn) return;
    setLang(btn.getAttribute("data-lang-btn"));
  });

  const savedLang = localStorage.getItem(LANG_KEY) || DEFAULT_LANG;
  setLang(savedLang);
})();
