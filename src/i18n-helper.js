// De-Slop i18n Helper
// Localization utilities for extension pages (popup, checker, settings, slop-machine)
// Uses Chrome's i18n API with custom override support for user-chosen UI language

(function() {
  'use strict';

  let customMessages = null;
  let uiLanguage = null;

  /**
   * Initialize the i18n helper.
   * If user has chosen a specific UI language (not browser default), load that messages.json.
   * @param {string|null} langOverride - User-chosen UI language code, or null for browser default
   */
  async function init(langOverride) {
    uiLanguage = langOverride;

    if (langOverride && langOverride !== 'auto') {
      try {
        const url = chrome.runtime.getURL(`_locales/${langOverride}/messages.json`);
        const response = await fetch(url);
        if (response.ok) {
          customMessages = await response.json();
        }
      } catch (e) {
        // Fall back to Chrome's built-in i18n (browser locale)
        customMessages = null;
      }
    }
  }

  /**
   * Get a localized message.
   * Priority: custom loaded messages > Chrome i18n > key itself as fallback
   * @param {string} key - Message key from messages.json
   * @param {Array<string>} [substitutions] - Placeholder substitutions
   * @returns {string} Localized message
   */
  function msg(key, substitutions) {
    // Try custom messages first (user-chosen language)
    if (customMessages && customMessages[key]) {
      let message = customMessages[key].message;
      if (substitutions && substitutions.length > 0) {
        substitutions.forEach((sub, i) => {
          message = message.replace(`$${i + 1}`, sub);
        });
      }
      return message;
    }

    // Fall back to Chrome's i18n (uses browser locale)
    const chromeMsg = chrome.i18n.getMessage(key, substitutions);
    if (chromeMsg) return chromeMsg;

    // Final fallback: return the key itself
    return key;
  }

  /**
   * Apply translations to all elements with data-i18n attributes in the document.
   * Processes:
   *   data-i18n="key" -> textContent
   *   data-i18n-placeholder="key" -> placeholder attribute
   *   data-i18n-title="key" -> title attribute
   *   data-i18n-html="key" -> innerHTML (use sparingly, only for trusted content)
   */
  function applyTranslations() {
    // Text content
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key) {
        const translated = msg(key);
        if (translated && translated !== key) {
          el.textContent = translated;
        }
      }
    });

    // Placeholder attributes
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (key) {
        const translated = msg(key);
        if (translated && translated !== key) {
          el.placeholder = translated;
        }
      }
    });

    // Title attributes
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (key) {
        const translated = msg(key);
        if (translated && translated !== key) {
          el.title = translated;
        }
      }
    });

    // innerHTML (trusted content only)
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      if (key) {
        const translated = msg(key);
        if (translated && translated !== key) {
          el.innerHTML = translated;
        }
      }
    });
  }

  // Export to window
  window.DESLOP_I18N = {
    init,
    msg,
    applyTranslations
  };
})();
