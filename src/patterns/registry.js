// De-Slop Pattern Registry
// Language detection, resolution, and pattern loading

(function() {
  'use strict';

  const SUPPORTED_LANGUAGES = {
    en: 'English',
    es: 'Español',
    fr: 'Français',
    de: 'Deutsch',
    it: 'Italiano',
    pt: 'Português',
    sv: 'Svenska',
    pl: 'Polski',
    ja: '日本語',
    ko: '한국어',
    zh: '中文'
  };

  /**
   * Detect the page's language from the <html lang=""> attribute.
   * Normalizes to a 2-letter ISO 639-1 code.
   * @returns {string|null} 2-letter language code or null if not detectable
   */
  function detectPageLanguage() {
    const htmlLang = document.documentElement.lang;
    if (!htmlLang) return null;

    // Normalize: "en-US" -> "en", "zh-Hans" -> "zh", "pt-BR" -> "pt"
    const code = htmlLang.toLowerCase().split('-')[0].trim();

    if (code.length === 2 && SUPPORTED_LANGUAGES[code]) {
      return code;
    }

    return null;
  }

  /**
   * Resolve which language to use for pattern matching.
   * Priority: user override > page language > browser language > 'en'
   * @param {string|null} userOverride - User-selected language from settings (null or 'auto' for auto-detect)
   * @returns {string} 2-letter language code
   */
  function resolveLanguage(userOverride) {
    // 1. User override (if set and not 'auto')
    if (userOverride && userOverride !== 'auto' && SUPPORTED_LANGUAGES[userOverride]) {
      return userOverride;
    }

    // 2. Page language detection
    const pageLang = detectPageLanguage();
    if (pageLang) {
      return pageLang;
    }

    // 3. Browser/navigator language
    if (typeof navigator !== 'undefined' && navigator.language) {
      const browserLang = navigator.language.toLowerCase().split('-')[0].trim();
      if (browserLang.length === 2 && SUPPORTED_LANGUAGES[browserLang]) {
        return browserLang;
      }
    }

    // 4. Default to English
    return 'en';
  }

  /**
   * Check if patterns for a given language are loaded.
   * @param {string} langCode - 2-letter language code
   * @returns {boolean}
   */
  function isLanguageLoaded(langCode) {
    return !!(window.DESLOP_PATTERNS && window.DESLOP_PATTERNS[langCode]);
  }

  /**
   * Get patterns for a language, falling back to English.
   * @param {string} langCode - 2-letter language code
   * @returns {object} Pattern object for the language
   */
  function getPatterns(langCode) {
    if (!window.DESLOP_PATTERNS) return null;
    return window.DESLOP_PATTERNS[langCode] || window.DESLOP_PATTERNS.en || null;
  }

  // Export to window
  window.DESLOP_REGISTRY = {
    SUPPORTED_LANGUAGES,
    detectPageLanguage,
    resolveLanguage,
    isLanguageLoaded,
    getPatterns
  };
})();
