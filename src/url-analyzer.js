// De-Slop URL Analyzer
// Fetches a URL via background service worker and scores the extracted text for slop.

'use strict';

const HISTORY_KEY = 'urlAnalyzerHistory';
const MAX_HISTORY = 5;

let PATTERNS = null;
let SUGGESTIONS = null;
let settings = {
  sensitivity: 3,
  blockEmojis: false,
  blockStopWords: true,
  blockEmDashes: true
};

// ---------------------------------------------------------------------------
// Initialization
// ---------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();

  const langSettings = await chrome.storage.sync.get({ patternLanguage: 'auto' });
  const lang = window.DESLOP_REGISTRY
    ? window.DESLOP_REGISTRY.resolveLanguage(langSettings.patternLanguage)
    : 'en';
  initPatterns(lang);

  if (window.DESLOP_I18N) {
    await window.DESLOP_I18N.init(langSettings.patternLanguage);
    window.DESLOP_I18N.applyTranslations();
  }

  setupEventListeners();
  await loadHistory();
});

function initPatterns(lang) {
  PATTERNS = window.DESLOP_SCORING.loadPatterns(lang);
  SUGGESTIONS = window.DESLOP_SCORING.loadSuggestions(lang);
}

async function loadSettings() {
  const stored = await chrome.storage.sync.get({
    sensitivity: 3,
    blockEmojis: false,
    blockStopWords: true,
    blockEmDashes: true
  });
  settings = stored;
}

// ---------------------------------------------------------------------------
// Event Listeners
// ---------------------------------------------------------------------------

function setupEventListeners() {
  const analyzeBtn = document.getElementById('analyzeBtn');
  const urlInput = document.getElementById('urlInput');
  const analyzeFallbackBtn = document.getElementById('analyzeFallbackBtn');
  const backBtn = document.getElementById('backBtn');

  analyzeBtn.addEventListener('click', analyzeUrl);

  urlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      analyzeUrl();
    }
  });

  analyzeFallbackBtn.addEventListener('click', analyzeFallbackText);

  backBtn.addEventListener('click', () => {
    window.close();
  });
}

// ---------------------------------------------------------------------------
// Core: Analyze URL
// ---------------------------------------------------------------------------

function analyzeUrl() {
  const urlInput = document.getElementById('urlInput');
  const rawUrl = urlInput.value.trim();

  if (!rawUrl) {
    showError(getMessage('urlAnalyzerErrorEmpty', 'Please enter a URL to analyze.'));
    return;
  }

  // Must start with http:// or https://
  if (!/^https?:\/\//i.test(rawUrl)) {
    showError(getMessage('urlAnalyzerErrorProtocol', 'URL must start with http:// or https://'));
    return;
  }

  // Validate as a proper URL
  let validatedUrl;
  try {
    validatedUrl = new URL(rawUrl).href;
  } catch (e) {
    showError(getMessage('urlAnalyzerErrorInvalid', 'The URL you entered is not valid.'));
    return;
  }

  hideError();
  hideResults();
  showLoading(true);
  setAnalyzeDisabled(true);

  chrome.runtime.sendMessage({ action: 'fetchUrl', url: validatedUrl }, (response) => {
    showLoading(false);
    setAnalyzeDisabled(false);

    if (chrome.runtime.lastError) {
      const errMsg = chrome.runtime.lastError.message || 'Unknown extension error.';
      showFetchError(errMsg, validatedUrl);
      return;
    }

    if (!response || !response.success) {
      const errMsg = (response && response.error) ? response.error : 'Failed to fetch the URL.';
      showFetchError(errMsg, validatedUrl);
      return;
    }

    const text = processHtml(response.html);

    if (!text || text.length < 20) {
      showFetchError(
        getMessage('urlAnalyzerErrorNoContent', 'Could not extract readable text from this page. Try pasting the content manually.'),
        validatedUrl
      );
      return;
    }

    analyzeText(text, validatedUrl, 'fetched');
  });
}

// ---------------------------------------------------------------------------
// Core: Process HTML -> plain text
// ---------------------------------------------------------------------------

function processHtml(html) {
  if (!html) return '';

  let doc;
  try {
    const parser = new DOMParser();
    doc = parser.parseFromString(html, 'text/html');
  } catch (e) {
    return '';
  }

  // Remove noise elements before text extraction
  const noiseSelectors = ['script', 'style', 'nav', 'footer', 'aside', 'header', 'noscript', 'iframe', 'svg'];
  noiseSelectors.forEach(selector => {
    doc.querySelectorAll(selector).forEach(el => el.remove());
  });

  // Prefer semantic content containers
  let contentEl = doc.querySelector('main') || doc.querySelector('article');

  // Fall back to body
  if (!contentEl) {
    contentEl = doc.body;
  }

  if (!contentEl) return '';

  const raw = contentEl.textContent || '';

  // Collapse whitespace: replace multiple spaces/tabs with single space,
  // collapse multiple newlines, and trim.
  return raw
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ---------------------------------------------------------------------------
// Core: Score text and display results
// ---------------------------------------------------------------------------

function analyzeText(text, url, source) {
  const result = window.DESLOP_SCORING.scoreText(text, PATTERNS, settings);
  const timestamp = new Date().toISOString();

  displayResults(text, result, url, source, timestamp);
  saveToHistory(url, result.score, timestamp);
}

function displayResults(text, result, url, source, timestamp) {
  // Meta
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const formattedTime = new Date(timestamp).toLocaleString();
  const sourceLabel = source === 'fetched'
    ? getMessage('urlAnalyzerSourceFetched', 'Fetched')
    : getMessage('urlAnalyzerSourcePasted', 'Pasted text');

  document.getElementById('metaUrl').textContent = url;
  document.getElementById('metaUrl').classList.add('url-value');
  document.getElementById('metaWordCount').textContent = wordCount.toLocaleString();
  document.getElementById('metaTimestamp').textContent = formattedTime;
  document.getElementById('metaSource').textContent = sourceLabel;

  // Score
  const scoreValue = document.getElementById('scoreValue');
  const scoreStatus = document.getElementById('scoreStatus');
  scoreValue.textContent = result.score;

  const threshold = window.DESLOP_SCORING.THRESHOLDS[settings.sensitivity];
  let statusText, statusClass;

  if (result.score === 0) {
    statusText = getMessage('urlAnalyzerStatusClean', 'CLEAN - No slop detected');
    statusClass = 'safe';
  } else if (result.score < threshold) {
    statusText = getMessage('urlAnalyzerStatusBorderline', 'BORDERLINE - Below threshold');
    statusClass = 'warning';
  } else {
    statusText = getMessage('urlAnalyzerStatusSlop', 'SLOP DETECTED - Above threshold');
    statusClass = 'danger';
  }

  scoreValue.className = 'score-value ' + statusClass;
  scoreStatus.className = 'score-status ' + statusClass;
  scoreStatus.textContent = statusText;

  // Breakdown
  renderBreakdown(result.matches);

  // Top matches
  renderTopMatches(result.matches);

  // Show results section
  document.getElementById('resultsSection').style.display = 'block';
}

function renderBreakdown(matches) {
  const content = document.getElementById('breakdownContent');

  const tier1Score = matches.tier1.reduce((sum, m) => sum + m.points, 0);
  const tier2Score = matches.tier2.reduce((sum, m) => sum + m.points, 0);
  const tier3Score = matches.tier3.reduce((sum, m) => sum + m.points, 0);
  const emojiScore = matches.emoji.reduce((sum, m) => sum + m.points, 0);

  const inactiveText = getMessage('urlAnalyzerInactive', '(inactive)');
  const disabledText = getMessage('urlAnalyzerDisabled', '(disabled)');

  const tier1Label = getMessage('urlAnalyzerTier1Label', 'Tier 1 - AI Slop (3pts each)');
  const tier2Label = getMessage('urlAnalyzerTier2Label', 'Tier 2 - Corporate (2pts each)');
  const tier3Label = getMessage('urlAnalyzerTier3Label', 'Tier 3 - Marketing (1pt each)');
  const emojiLabel = getMessage('urlAnalyzerEmojiLabel', 'Emoji Slop (5pts each)');

  const makeRow = (label, score, suppressed) => `
    <div class="breakdown-item">
      <span class="breakdown-tier">${label}</span>
      <span class="breakdown-score">
        ${score} pts
        ${suppressed ? `<span class="muted">${suppressed}</span>` : ''}
      </span>
    </div>
  `;

  content.innerHTML = [
    makeRow(tier1Label, tier1Score, null),
    makeRow(tier2Label, tier2Score, settings.sensitivity < 3 ? inactiveText : null),
    makeRow(tier3Label, tier3Score, settings.sensitivity < 4 ? inactiveText : null),
    makeRow(emojiLabel, emojiScore, !settings.blockEmojis ? disabledText : null)
  ].join('');
}

function renderTopMatches(matches) {
  const section = document.getElementById('topMatches');
  const content = document.getElementById('topMatchesContent');
  const format = window.DESLOP_SCORING.formatPattern;

  const allMatches = [
    ...matches.tier1.map(m => ({ ...m, tier: 'tier1' })),
    ...matches.tier2.map(m => ({ ...m, tier: 'tier2' })),
    ...matches.tier3.map(m => ({ ...m, tier: 'tier3' })),
    ...matches.emoji.map(m => ({ ...m, tier: 'emoji' }))
  ];

  if (allMatches.length === 0) {
    section.style.display = 'none';
    return;
  }

  // Sort by points descending, take top 20
  const topMatches = allMatches
    .sort((a, b) => b.points - a.points)
    .slice(0, 20);

  const tierLabels = {
    tier1: 'TIER 1',
    tier2: 'TIER 2',
    tier3: 'TIER 3',
    emoji: 'EMOJI'
  };

  const matchLabel = getMessage('urlAnalyzerMatchLabel', 'match');
  const matchesLabel = getMessage('urlAnalyzerMatchesLabel', 'matches');

  content.innerHTML = topMatches.map(m => {
    const countLabel = m.count === 1 ? matchLabel : matchesLabel;
    const ptsPerMatch = m.count > 0 ? Math.round(m.points / m.count) : 0;
    return `
      <div class="match-item">
        <div class="match-pattern">${format(m.pattern)}</div>
        <div class="match-meta">
          <span class="match-tier-badge ${m.tier}">${tierLabels[m.tier] || m.tier}</span>
          <span>${m.count} ${countLabel} &times; ${ptsPerMatch}pts = ${m.points}pts</span>
        </div>
      </div>
    `;
  }).join('');

  section.style.display = 'block';
}

// ---------------------------------------------------------------------------
// Fallback: Analyze pasted text
// ---------------------------------------------------------------------------

function analyzeFallbackText() {
  const textarea = document.getElementById('fallbackTextarea');
  const text = textarea.value.trim();

  if (!text) {
    showError(getMessage('urlAnalyzerFallbackEmpty', 'Please paste some text to analyze.'));
    return;
  }

  hideError();
  hideResults();

  const urlInput = document.getElementById('urlInput');
  const url = urlInput.value.trim() || getMessage('urlAnalyzerPastedSource', '[Pasted text]');

  analyzeText(text, url, 'pasted');
}

// ---------------------------------------------------------------------------
// History
// ---------------------------------------------------------------------------

async function saveToHistory(url, score, timestamp) {
  const stored = await chrome.storage.local.get({ [HISTORY_KEY]: [] });
  let history = stored[HISTORY_KEY];

  // Remove any existing entry for this URL so it moves to top
  history = history.filter(item => item.url !== url);

  history.unshift({ url, score, timestamp });

  // Keep only the last MAX_HISTORY entries
  history = history.slice(0, MAX_HISTORY);

  await chrome.storage.local.set({ [HISTORY_KEY]: history });

  renderHistory(history);
}

async function loadHistory() {
  const stored = await chrome.storage.local.get({ [HISTORY_KEY]: [] });
  renderHistory(stored[HISTORY_KEY]);
}

function renderHistory(history) {
  const section = document.getElementById('historySection');
  const list = document.getElementById('historyList');

  if (!history || history.length === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';

  list.innerHTML = history.map((item, idx) => {
    const scoreClass = getScoreClass(item.score);
    const dateStr = formatHistoryDate(item.timestamp);
    const truncatedUrl = truncateUrl(item.url, 60);
    const replayLabel = getMessage('urlAnalyzerReplay', 'RE-SCAN');

    return `
      <div class="history-item" data-idx="${idx}" title="${escapeAttr(item.url)}">
        <span class="history-url">${escapeHtml(truncatedUrl)}</span>
        <div class="history-right">
          <span class="history-score ${scoreClass}">${item.score}</span>
          <span class="history-date">${dateStr}</span>
          <span class="history-replay">${replayLabel}</span>
        </div>
      </div>
    `;
  }).join('');

  list.querySelectorAll('.history-item').forEach(el => {
    el.addEventListener('click', () => {
      const idx = parseInt(el.getAttribute('data-idx'), 10);
      const item = history[idx];
      if (item) {
        document.getElementById('urlInput').value = item.url;
        analyzeUrl();
      }
    });
  });
}

// ---------------------------------------------------------------------------
// UI Helpers
// ---------------------------------------------------------------------------

function showLoading(visible) {
  document.getElementById('loadingSection').style.display = visible ? 'flex' : 'none';
}

function showError(message) {
  document.getElementById('errorMessage').textContent = message;
  document.getElementById('errorSection').style.display = 'block';
  // Hide the error hint for inline validation errors (no fetch involved)
  document.querySelector('.error-hint').style.display = 'none';
}

function showFetchError(message, url) {
  document.getElementById('errorMessage').textContent = message;
  document.querySelector('.error-hint').style.display = 'block';
  document.getElementById('errorSection').style.display = 'block';

  // Show fallback textarea and pre-fill URL hint
  const fallbackSection = document.getElementById('fallbackSection');
  fallbackSection.style.display = 'block';
  fallbackSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideError() {
  document.getElementById('errorSection').style.display = 'none';
}

function hideResults() {
  document.getElementById('resultsSection').style.display = 'none';
}

function setAnalyzeDisabled(disabled) {
  document.getElementById('analyzeBtn').disabled = disabled;
}

function getScoreClass(score) {
  const threshold = window.DESLOP_SCORING.THRESHOLDS[settings.sensitivity];
  if (score === 0) return 'safe';
  if (score < threshold) return 'warning';
  return 'danger';
}

function formatHistoryDate(isoString) {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return getMessage('urlAnalyzerJustNow', 'just now');
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  } catch (e) {
    return '';
  }
}

function truncateUrl(url, maxLen) {
  if (!url || url.length <= maxLen) return url;
  return url.substring(0, maxLen - 3) + '...';
}

function escapeHtml(str) {
  if (typeof window.DESLOP_SCORING !== 'undefined' && window.DESLOP_SCORING.escapeHtml) {
    return window.DESLOP_SCORING.escapeHtml(str);
  }
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function getMessage(key, fallback) {
  if (window.DESLOP_I18N) {
    const result = window.DESLOP_I18N.msg(key);
    if (result && result !== key) return result;
  }
  return fallback || key;
}
