(() => {
  const storageKey = "tabReliefPreferredLanguage";
  const params = new URLSearchParams(window.location.search);
  const explicitLanguage = params.get("lang");
  const supportedPages = new Set(["index.html", "privacy.html", "terms.html"]);

  function getSavedLanguage() {
    try {
      return window.localStorage.getItem(storageKey);
    } catch {
      return "";
    }
  }

  function saveLanguage(language) {
    try {
      window.localStorage.setItem(storageKey, language);
    } catch {
      // Language switching still works through query parameters if storage is unavailable.
    }
  }

  if (explicitLanguage === "en" || explicitLanguage === "ja") {
    saveLanguage(explicitLanguage);
  }

  document.addEventListener("click", (event) => {
    const link = event.target.closest("[data-language-choice]");
    if (!link) return;
    saveLanguage(link.dataset.languageChoice);
  });

  const pathname = window.location.pathname;
  const isJapanesePage = pathname.includes("/ja/");
  const rawFile = pathname.split("/").pop() || "index.html";
  const currentFile = rawFile === "ja" ? "index.html" : rawFile;
  if (!supportedPages.has(currentFile)) return;

  const savedLanguage = getSavedLanguage();
  const browserWantsJapanese = (navigator.languages || [navigator.language || ""])
    .some((language) => String(language).toLowerCase().startsWith("ja"));
  const wantsJapanese = explicitLanguage === "ja"
    || (!explicitLanguage && (savedLanguage === "ja" || (!savedLanguage && browserWantsJapanese)));
  const wantsEnglish = explicitLanguage === "en" || savedLanguage === "en";

  if (!isJapanesePage && wantsJapanese) {
    window.location.replace(currentFile === "index.html" ? "ja/index.html" : `ja/${currentFile}`);
    return;
  }

  if (isJapanesePage && wantsEnglish) {
    window.location.replace(currentFile === "index.html" ? "../?lang=en" : `../${currentFile}?lang=en`);
  }
})();
