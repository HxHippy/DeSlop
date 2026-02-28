// De-Slop Theme Loader
// Runs synchronously before CSS paints to prevent flash of wrong theme.
// Phase 1: Read cached theme from localStorage (sync, instant)
// Phase 2: Async verify from chrome.storage.sync, correct if stale

(function () {
  var VALID = ['dark', 'light', 'midnight'];
  var DEFAULT = 'dark';

  // Phase 1: instant from localStorage
  var cached = null;
  try { cached = localStorage.getItem('deslop-theme'); } catch (e) {}
  var theme = VALID.indexOf(cached) !== -1 ? cached : DEFAULT;
  document.documentElement.setAttribute('data-theme', theme);

  // Phase 2: async verify from chrome.storage.sync
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
    chrome.storage.sync.get({ theme: DEFAULT }, function (result) {
      var synced = VALID.indexOf(result.theme) !== -1 ? result.theme : DEFAULT;
      if (synced !== theme) {
        document.documentElement.setAttribute('data-theme', synced);
        try { localStorage.setItem('deslop-theme', synced); } catch (e) {}
      }
    });
  }
})();
