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

    if (lang === "en" && window.__MXM_I18N_EN__) {
      cache.en = window.__MXM_I18N_EN__;
      return Promise.resolve(cache.en);
    }
    if (lang === "pl" && window.__MXM_I18N_PL__) {
      cache.pl = window.__MXM_I18N_PL__;
      return Promise.resolve(cache.pl);
    }

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

    const applyAndNotify = (dict) => {
      applyDict(dict);
      document.dispatchEvent(
        new CustomEvent("mxm:langchange", { detail: { lang: lang, dict: dict } })
      );
    };

    if (lang === DEFAULT_LANG) {
      loadDict(DEFAULT_LANG).then(applyAndNotify).catch(() => {});
      return;
    }

    loadDict(lang)
      .then(applyAndNotify)
      .catch(() => {
        if (window.__MXM_I18N_EN__) {
          cache.en = window.__MXM_I18N_EN__;
          applyAndNotify(cache.en);
        }
      });
  }

  window.mxmI18n = {
    getKey: getKey,
    getDict: function () {
      const lang = localStorage.getItem(LANG_KEY) || DEFAULT_LANG;
      return (
        cache[lang] ||
        (lang === "en" ? window.__MXM_I18N_EN__ : null) ||
        (lang === "pl" ? window.__MXM_I18N_PL__ : null)
      );
    },
  };

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-lang-btn]");
    if (!btn) return;
    setLang(btn.getAttribute("data-lang-btn"));
  });

  const savedLang = localStorage.getItem(LANG_KEY) || DEFAULT_LANG;
  setLang(savedLang);
})();
