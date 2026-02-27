// De-Slop Settings/Customization Page
// Loads default patterns from shared window.DESLOP_PATTERNS source

let DEFAULT_PATTERNS = null;
let currentPatterns = {
  tier1: [],
  tier2: [],
  tier3: [],
  custom: []
};

// Track input mode per tier: 'regex' or 'plain'
const inputModes = {
  tier1: 'regex',
  tier2: 'regex',
  tier3: 'regex'
};

// Disabled patterns storage structure:
// { tier1: ["patternStr", ...], tier2: [...], tier3: [...] }
let disabledPatterns = {
  tier1: [],
  tier2: [],
  tier3: []
};

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  // Resolve language first
  const langSettings = await chrome.storage.sync.get({ patternLanguage: 'auto' });
  const lang = window.DESLOP_REGISTRY
    ? window.DESLOP_REGISTRY.resolveLanguage(langSettings.patternLanguage)
    : 'en';

  loadDefaultPatterns(lang);
  await loadPatterns();
  await loadDisabledPatterns();

  // Initialize i18n
  if (window.DESLOP_I18N) {
    await window.DESLOP_I18N.init(langSettings.patternLanguage);
    window.DESLOP_I18N.applyTranslations();
  }

  setupTabs();
  setupEventListeners();
  setupModeToggles();
  setupSearch();
  populateStatControls();
  renderAllPatterns();
  updateOverview();
});

// Load default patterns from shared source
function loadDefaultPatterns(lang) {
  const source = (window.DESLOP_PATTERNS && window.DESLOP_PATTERNS[lang]) || null;

  if (source && source.defaultPatterns) {
    DEFAULT_PATTERNS = source.defaultPatterns;
  } else {
    console.warn('[De-Slop Settings] No default patterns loaded from shared source');
    DEFAULT_PATTERNS = { tier1: [], tier2: [], tier3: [] };
  }
}

// Load patterns from storage
async function loadPatterns() {
  const stored = await chrome.storage.sync.get({
    customPatterns_en: null,
    customPatterns: null
  });

  const savedPatterns = stored.customPatterns_en || stored.customPatterns;

  if (savedPatterns) {
    currentPatterns = savedPatterns;
    // Ensure custom array exists for older saves
    if (!currentPatterns.custom) {
      currentPatterns.custom = [];
    }
  } else if (DEFAULT_PATTERNS) {
    currentPatterns.tier1 = [...DEFAULT_PATTERNS.tier1];
    currentPatterns.tier2 = [...DEFAULT_PATTERNS.tier2];
    currentPatterns.tier3 = [...DEFAULT_PATTERNS.tier3];
    currentPatterns.custom = [];
  }
}

// Load disabled patterns from storage
async function loadDisabledPatterns() {
  const stored = await chrome.storage.sync.get({ disabledPatterns_en: null });
  if (stored.disabledPatterns_en) {
    disabledPatterns = stored.disabledPatterns_en;
    // Ensure all tier arrays exist
    disabledPatterns.tier1 = disabledPatterns.tier1 || [];
    disabledPatterns.tier2 = disabledPatterns.tier2 || [];
    disabledPatterns.tier3 = disabledPatterns.tier3 || [];
  }
}

// Save patterns to storage
async function savePatterns() {
  await chrome.storage.sync.set({
    customPatterns_en: currentPatterns,
    customPatterns: currentPatterns
  });
  const i18n = window.DESLOP_I18N;
  showStatus((i18n && i18n.msg('settingsPatternSaved')) || 'Patterns saved successfully!');
}

// Save disabled patterns to storage
async function saveDisabledPatterns() {
  await chrome.storage.sync.set({ disabledPatterns_en: disabledPatterns });
}

// Setup tabs - handles 6 tabs: overview, tier1, tier2, tier3, custom, help
function setupTabs() {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const panelId = tab.getAttribute('data-tab');
      const panel = document.getElementById(panelId);
      if (panel) {
        panel.classList.add('active');
      }
    });
  });
}

// Navigate to a tier tab programmatically
function navigateToTab(tabId) {
  const targetTab = document.querySelector(`.tab[data-tab="${tabId}"]`);
  if (targetTab) {
    targetTab.click();
  }
}

// Setup mode toggle buttons for each tier
function setupModeToggles() {
  const modeButtons = document.querySelectorAll('.mode-btn');
  modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tier = btn.getAttribute('data-tier');
      const mode = btn.getAttribute('data-mode');

      // Update active state within the same toggle group
      const group = btn.closest('.input-mode-toggle');
      group.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Store mode
      inputModes[tier] = mode;

      // Update placeholder
      const input = document.getElementById(`${tier}Input`);
      if (input) {
        if (mode === 'plain') {
          input.placeholder = 'Enter plain text phrase (e.g., delve into)';
        } else {
          const placeholders = {
            tier1: 'Enter regex pattern (e.g., /\\bdelve into\\b/gi)',
            tier2: 'Enter regex pattern (e.g., /\\bsynergy\\b/gi)',
            tier3: 'Enter regex pattern (e.g., /\\bfree\\b/gi)'
          };
          input.placeholder = placeholders[tier] || 'Enter regex pattern';
        }
      }
    });
  });
}

// Setup search/filter for each tier
function setupSearch() {
  ['tier1', 'tier2', 'tier3'].forEach(tier => {
    const searchInput = document.getElementById(`${tier}Search`);
    if (!searchInput) return;

    searchInput.addEventListener('input', () => {
      filterPatterns(tier, searchInput.value);
    });
  });
}

// Filter pattern items by search string
function filterPatterns(tier, query) {
  const listEl = document.getElementById(`${tier}List`);
  if (!listEl) return;

  const normalized = query.toLowerCase().trim();
  const items = listEl.querySelectorAll('.pattern-item');

  items.forEach(item => {
    const textEl = item.querySelector('.pattern-text');
    const text = textEl ? textEl.textContent.toLowerCase() : '';
    if (!normalized || text.includes(normalized)) {
      item.classList.remove('search-hidden');
    } else {
      item.classList.add('search-hidden');
    }
  });
}

// Populate and wire up the interactive stat controls (language + sensitivity)
async function populateStatControls() {
  const langSelect = document.getElementById('detectionLangSelect');
  const sensSelect = document.getElementById('sensitivitySelect');

  // Populate language options from DESLOP_LANGUAGES
  if (langSelect && window.DESLOP_LANGUAGES) {
    Object.entries(window.DESLOP_LANGUAGES).forEach(([code, name]) => {
      const option = document.createElement('option');
      option.value = code;
      option.textContent = code.toUpperCase();
      option.title = name;
      langSelect.appendChild(option);
    });
  }

  // Load current values from storage
  const stored = await chrome.storage.sync.get({
    sensitivity: 3,
    patternLanguage: 'auto'
  });

  if (langSelect) {
    langSelect.value = stored.patternLanguage || 'auto';
  }
  if (sensSelect) {
    sensSelect.value = stored.sensitivity;
  }

  // Language change handler
  if (langSelect) {
    langSelect.addEventListener('change', async (e) => {
      const lang = e.target.value;
      await chrome.storage.sync.set({ patternLanguage: lang });
      showStatus(`Detection language set to ${lang === 'auto' ? 'AUTO' : lang.toUpperCase()}`);
    });
  }

  // Sensitivity change handler
  if (sensSelect) {
    sensSelect.addEventListener('change', async (e) => {
      const val = parseInt(e.target.value, 10);
      await chrome.storage.sync.set({ sensitivity: val });
      showStatus(`Sensitivity level set to ${val}`);
    });
  }
}

// Setup event listeners
function setupEventListeners() {
  document.getElementById('tier1Add').addEventListener('click', () => addPattern('tier1'));
  document.getElementById('tier2Add').addEventListener('click', () => addPattern('tier2'));
  document.getElementById('tier3Add').addEventListener('click', () => addPattern('tier3'));
  document.getElementById('customAdd').addEventListener('click', () => addCustomPattern());

  // Allow Enter key to submit in pattern inputs
  ['tier1', 'tier2', 'tier3'].forEach(tier => {
    const input = document.getElementById(`${tier}Input`);
    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') addPattern(tier);
      });
    }
  });

  const customInput = document.getElementById('customInput');
  if (customInput) {
    customInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') addCustomPattern();
    });
  }

  // Delegated delete handler
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('pattern-delete')) {
      const tier = e.target.getAttribute('data-tier');
      const index = parseInt(e.target.getAttribute('data-index'), 10);
      deletePattern(tier, index);
    }
  });

  // Delegated toggle handler
  document.addEventListener('change', (e) => {
    if (e.target.classList.contains('pattern-toggle-input')) {
      const tier = e.target.getAttribute('data-tier');
      const pattern = e.target.getAttribute('data-pattern');
      const enabled = e.target.checked;
      togglePatternEnabled(tier, pattern, enabled);
    }
  });

  // Tier card navigation on the overview tab
  document.querySelectorAll('.tier-card[data-navigate]').forEach(card => {
    card.addEventListener('click', () => {
      const target = card.getAttribute('data-navigate');
      navigateToTab(target);
    });
  });

  document.getElementById('exportBtn').addEventListener('click', exportPatterns);
  document.getElementById('importBtn').addEventListener('click', () => {
    document.getElementById('importFile').click();
  });
  document.getElementById('importFile').addEventListener('change', importPatterns);
  document.getElementById('resetBtn').addEventListener('click', resetToDefaults);
  document.getElementById('saveBtn').addEventListener('click', () => {
    window.close();
  });

  const testPageBtn = document.getElementById('openTestPageBtn');
  if (testPageBtn) {
    testPageBtn.addEventListener('click', () => {
      chrome.tabs.create({ url: chrome.runtime.getURL('test.html') });
    });
  }

  // Copy AI prompt button
  const copyPromptBtn = document.getElementById('copyPromptBtn');
  if (copyPromptBtn) {
    copyPromptBtn.addEventListener('click', () => {
      const promptEl = document.getElementById('aiPrompt');
      if (promptEl) {
        navigator.clipboard.writeText(promptEl.textContent).then(() => {
          copyPromptBtn.textContent = '[ COPIED ]';
          copyPromptBtn.classList.add('copied');
          setTimeout(() => {
            copyPromptBtn.textContent = '[ COPY ]';
            copyPromptBtn.classList.remove('copied');
          }, 2000);
        });
      }
    });
  }
}

// Add pattern to tier (handles both regex and plain text modes)
async function addPattern(tier) {
  const input = document.getElementById(`${tier}Input`);
  const rawValue = input.value.trim();
  const i18n = window.DESLOP_I18N;

  if (!rawValue) {
    showStatus((i18n && i18n.msg('settingsEnterPattern')) || 'Please enter a pattern', true);
    return;
  }

  let pattern;

  if (inputModes[tier] === 'plain') {
    // Escape special regex characters from the phrase, then wrap with word boundaries
    const escaped = rawValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    pattern = `/\\b${escaped}\\b/gi`;
  } else {
    pattern = rawValue;
    if (!pattern.startsWith('/') || !pattern.match(/\/[gimuy]*$/)) {
      showStatus(
        (i18n && i18n.msg('settingsInvalidFormat')) || 'Pattern must be in regex format: /pattern/flags',
        true
      );
      return;
    }
  }

  currentPatterns[tier].push(pattern);
  input.value = '';
  renderPatterns(tier);
  updateBadges();
  updateOverview();
  await savePatterns();
  showStatus(`Pattern added to ${tier.toUpperCase()}`);
}

// Add custom pattern with weight
async function addCustomPattern() {
  const input = document.getElementById('customInput');
  const weight = parseInt(document.getElementById('customWeight').value, 10);
  const pattern = input.value.trim();
  const i18n = window.DESLOP_I18N;

  if (!pattern) {
    showStatus((i18n && i18n.msg('settingsEnterPattern')) || 'Please enter a pattern', true);
    return;
  }

  if (!pattern.startsWith('/') || !pattern.match(/\/[gimuy]*$/)) {
    showStatus(
      (i18n && i18n.msg('settingsInvalidFormat')) || 'Pattern must be in regex format: /pattern/flags',
      true
    );
    return;
  }

  currentPatterns.custom.push({ pattern, weight });
  input.value = '';
  renderPatterns('custom');
  await savePatterns();
  const msg = (i18n && i18n.msg('settingsCustomPatternAdded')) || 'Custom pattern added';
  showStatus(msg);
}

// Delete pattern
async function deletePattern(tier, index) {
  const i18n = window.DESLOP_I18N;
  const removed = currentPatterns[tier].splice(index, 1);

  // Also remove from disabled list if present
  if (tier !== 'custom' && removed.length > 0) {
    const patternStr = typeof removed[0] === 'string' ? removed[0] : removed[0].pattern;
    const disIdx = disabledPatterns[tier] ? disabledPatterns[tier].indexOf(patternStr) : -1;
    if (disIdx !== -1) {
      disabledPatterns[tier].splice(disIdx, 1);
      await saveDisabledPatterns();
    }
  }

  renderPatterns(tier);
  updateBadges();
  updateOverview();
  await savePatterns();
  showStatus((i18n && i18n.msg('settingsPatternDeleted')) || 'Pattern deleted');
}

// Toggle a pattern's enabled state
async function togglePatternEnabled(tier, patternStr, enabled) {
  if (!disabledPatterns[tier]) {
    disabledPatterns[tier] = [];
  }

  if (enabled) {
    // Remove from disabled list
    const idx = disabledPatterns[tier].indexOf(patternStr);
    if (idx !== -1) {
      disabledPatterns[tier].splice(idx, 1);
    }
  } else {
    // Add to disabled list if not already present
    if (!disabledPatterns[tier].includes(patternStr)) {
      disabledPatterns[tier].push(patternStr);
    }
  }

  // Update visual state without full re-render
  const listEl = document.getElementById(`${tier}List`);
  if (listEl) {
    const items = listEl.querySelectorAll('.pattern-item');
    items.forEach(item => {
      const toggleInput = item.querySelector('.pattern-toggle-input');
      if (toggleInput && toggleInput.getAttribute('data-pattern') === patternStr) {
        if (enabled) {
          item.classList.remove('disabled');
        } else {
          item.classList.add('disabled');
        }
      }
    });
  }

  await saveDisabledPatterns();
}

// Render all pattern lists
function renderAllPatterns() {
  renderPatterns('tier1');
  renderPatterns('tier2');
  renderPatterns('tier3');
  renderPatterns('custom');
  updateBadges();
}

// Render patterns for a specific tier
function renderPatterns(tier) {
  const container = document.getElementById(`${tier}List`);
  if (!container) return;
  container.innerHTML = '';

  const patterns = currentPatterns[tier];
  const i18n = window.DESLOP_I18N;

  if (!patterns || patterns.length === 0) {
    const noPatterns = (i18n && i18n.msg('settingsNoPatterns')) || 'No patterns in this tier';
    container.innerHTML = `<div style="color: #666; text-align: center; padding: 24px;">${noPatterns}</div>`;
    return;
  }

  const deleteText = (i18n && i18n.msg('settingsDelete')) || 'DELETE';
  const tierDisabled = (tier !== 'custom') ? (disabledPatterns[tier] || []) : [];

  patterns.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'pattern-item';

    const pattern = tier === 'custom' ? item.pattern : item;
    const weight = tier === 'custom' ? item.weight : getTierWeight(tier);
    const isDisabled = tierDisabled.includes(pattern);

    if (isDisabled) {
      div.classList.add('disabled');
    }

    const patternText = document.createElement('span');
    patternText.className = 'pattern-text';
    patternText.textContent = pattern;

    const patternWeight = document.createElement('span');
    patternWeight.className = 'pattern-weight';
    patternWeight.textContent = `${weight}pts`;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'pattern-delete';
    deleteBtn.textContent = `[ ${deleteText} ]`;
    deleteBtn.setAttribute('data-tier', tier);
    deleteBtn.setAttribute('data-index', index);

    div.appendChild(patternText);
    div.appendChild(patternWeight);

    // Add toggle switch for tier patterns (not custom)
    if (tier !== 'custom') {
      const toggleLabel = document.createElement('label');
      toggleLabel.className = 'pattern-toggle';
      toggleLabel.title = isDisabled ? 'Enable pattern' : 'Disable pattern';

      const toggleInput = document.createElement('input');
      toggleInput.type = 'checkbox';
      toggleInput.className = 'pattern-toggle-input';
      toggleInput.checked = !isDisabled;
      toggleInput.setAttribute('data-tier', tier);
      toggleInput.setAttribute('data-pattern', pattern);

      const toggleTrack = document.createElement('span');
      toggleTrack.className = 'toggle-track';

      toggleLabel.appendChild(toggleInput);
      toggleLabel.appendChild(toggleTrack);
      div.appendChild(toggleLabel);
    }

    div.appendChild(deleteBtn);
    container.appendChild(div);
  });

  // Re-apply any active search filter for this tier
  const searchInput = document.getElementById(`${tier}Search`);
  if (searchInput && searchInput.value) {
    filterPatterns(tier, searchInput.value);
  }
}

// Get tier weight
function getTierWeight(tier) {
  const weights = { tier1: 3, tier2: 2, tier3: 1 };
  return weights[tier] || 1;
}

// Update tab badge counts
function updateBadges() {
  const tiers = ['tier1', 'tier2', 'tier3'];
  tiers.forEach(tier => {
    const badge = document.getElementById(`${tier}Badge`);
    if (badge) {
      const count = currentPatterns[tier] ? currentPatterns[tier].length : 0;
      badge.textContent = count;
    }
  });
}

// Update the overview tab stats and progress bars
async function updateOverview() {
  const t1 = currentPatterns.tier1 ? currentPatterns.tier1.length : 0;
  const t2 = currentPatterns.tier2 ? currentPatterns.tier2.length : 0;
  const t3 = currentPatterns.tier3 ? currentPatterns.tier3.length : 0;
  const total = t1 + t2 + t3;

  // Stat cards
  const totalEl = document.getElementById('totalPatternCount');
  if (totalEl) totalEl.textContent = total;

  const t1CountEl = document.getElementById('tier1CardCount');
  if (t1CountEl) t1CountEl.textContent = t1;

  const t2CountEl = document.getElementById('tier2CardCount');
  if (t2CountEl) t2CountEl.textContent = t2;

  const t3CountEl = document.getElementById('tier3CardCount');
  if (t3CountEl) t3CountEl.textContent = t3;

  // Progress bars
  const setBar = (id, count, total) => {
    const el = document.getElementById(id);
    if (el) {
      el.style.width = total > 0 ? `${Math.round((count / total) * 100)}%` : '0%';
    }
  };
  setBar('tier1Bar', t1, total);
  setBar('tier2Bar', t2, total);
  setBar('tier3Bar', t3, total);

  // Sync the interactive select controls with storage values
  try {
    const stored = await chrome.storage.sync.get({
      sensitivity: 3,
      patternLanguage: 'auto'
    });

    const sensSelect = document.getElementById('sensitivitySelect');
    if (sensSelect) sensSelect.value = stored.sensitivity;

    const langSelect = document.getElementById('detectionLangSelect');
    if (langSelect) langSelect.value = stored.patternLanguage || 'auto';
  } catch (e) {
    // Storage access failed silently - defaults already set in HTML
  }
}

// Export patterns
function exportPatterns() {
  const i18n = window.DESLOP_I18N;
  const data = JSON.stringify(currentPatterns, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'deslop-patterns.json';
  a.click();

  URL.revokeObjectURL(url);
  showStatus((i18n && i18n.msg('settingsExported')) || 'Patterns exported');
}

// Import patterns
async function importPatterns(event) {
  const file = event.target.files[0];
  if (!file) return;
  const i18n = window.DESLOP_I18N;

  try {
    const text = await file.text();
    const imported = JSON.parse(text);

    if (!imported.tier1 || !imported.tier2 || !imported.tier3) {
      throw new Error('Invalid pattern file format');
    }

    const confirmMsg =
      (i18n && i18n.msg('settingsImportConfirm')) ||
      'This will replace all current patterns. Continue?';
    if (confirm(confirmMsg)) {
      currentPatterns = imported;
      if (!currentPatterns.custom) currentPatterns.custom = [];
      renderAllPatterns();
      updateOverview();
      showStatus((i18n && i18n.msg('settingsImported')) || 'Patterns imported successfully');
    }
  } catch (error) {
    showStatus(`Error importing patterns: ${error.message}`, true);
  }

  event.target.value = '';
}

// Reset to defaults
async function resetToDefaults() {
  const i18n = window.DESLOP_I18N;
  const confirmMsg =
    (i18n && i18n.msg('settingsResetConfirm')) ||
    'This will reset all patterns to defaults. Continue?';

  if (!confirm(confirmMsg)) {
    return;
  }

  if (DEFAULT_PATTERNS) {
    currentPatterns.tier1 = [...DEFAULT_PATTERNS.tier1];
    currentPatterns.tier2 = [...DEFAULT_PATTERNS.tier2];
    currentPatterns.tier3 = [...DEFAULT_PATTERNS.tier3];
  }
  currentPatterns.custom = [];

  // Also clear disabled patterns
  disabledPatterns = { tier1: [], tier2: [], tier3: [] };
  await saveDisabledPatterns();

  renderAllPatterns();
  updateOverview();
  await savePatterns();
  showStatus((i18n && i18n.msg('settingsResetDone')) || 'Reset to defaults');
}

// Show status message
function showStatus(message, isError = false) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = isError ? 'status error' : 'status';

  setTimeout(() => {
    status.textContent = '';
    status.className = 'status';
  }, 3000);
}

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Pattern tester
function testPattern() {
  const patternInput = document.getElementById('testPattern').value.trim();
  const testText = document.getElementById('testText').value;
  const resultsDiv = document.getElementById('testResults');
  const matchCountEl = document.getElementById('matchCount');
  const matchListEl = document.getElementById('matchList');
  const highlightedTextEl = document.getElementById('highlightedText');

  if (!patternInput) {
    showStatus('Please enter a pattern to test', true);
    return;
  }

  if (!testText) {
    showStatus('Please enter some text to test against', true);
    return;
  }

  // Parse the pattern
  const match = patternInput.match(/^\/(.+)\/([gimuy]*)$/);
  if (!match) {
    showStatus('Pattern must be in regex format: /pattern/flags', true);
    return;
  }

  let regex;
  try {
    regex = new RegExp(match[1], match[2]);
  } catch (e) {
    showStatus('Invalid regex pattern: ' + e.message, true);
    return;
  }

  // Test the pattern
  const matches = testText.match(regex);
  const matchCount = matches ? matches.length : 0;

  // Show results
  resultsDiv.style.display = 'block';
  matchCountEl.textContent = `Found ${matchCount} match${matchCount === 1 ? '' : 'es'}`;

  // Show unique matches
  if (matches) {
    const uniqueMatches = [...new Set(matches)];
    matchListEl.innerHTML = uniqueMatches
      .map(m => `<div class="match-item">"${escapeHtml(m)}"</div>`)
      .join('');

    // Highlight matches in text
    let highlightedHtml = escapeHtml(testText);
    // Sort matches by length (longest first) to avoid partial replacements
    uniqueMatches.sort((a, b) => b.length - a.length);
    uniqueMatches.forEach(m => {
      const escaped = escapeHtml(m);
      const pattern = new RegExp(escaped.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      highlightedHtml = highlightedHtml.replace(pattern, `<mark>${escaped}</mark>`);
    });
    highlightedTextEl.innerHTML = highlightedHtml;
  } else {
    matchListEl.innerHTML = '<div class="no-matches">No matches found</div>';
    highlightedTextEl.innerHTML = escapeHtml(testText);
  }

  showStatus(`Test complete: ${matchCount} match${matchCount === 1 ? '' : 'es'} found`);
}
