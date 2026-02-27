// De-Slop Text Rewriter
// Detects slop phrases and lets users fix them inline with suggestions.
// Uses shared DESLOP_SCORING engine for pattern matching.

'use strict';

let PATTERNS = null;
let SUGGESTIONS = null;
let SLOP_DATABASE = [];

let settings = {
  sensitivity: 3,
  blockEmojis: false,
  blockStopWords: true,
  blockEmDashes: true
};

// Two separate text states:
// originalText - the text as it was when first typed/pasted (or after a clear)
// currentText  - the working copy that gets modified by fix actions
let originalText = '';
let currentText = '';

// Matches computed from the last render of currentText
let currentMatches = [];

let analysisTimeout = null;

// ─── Initialisation ──────────────────────────────────────────────────────────

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
});

function initPatterns(lang) {
  PATTERNS = window.DESLOP_SCORING.loadPatterns(lang);
  SUGGESTIONS = window.DESLOP_SCORING.loadSuggestions(lang);

  // Load slopDatabase for supplementary suggestion lookup
  const source = (window.DESLOP_PATTERNS && window.DESLOP_PATTERNS[lang]) || null;
  if (source && source.slopDatabase) {
    SLOP_DATABASE = source.slopDatabase;
  }
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

// ─── Event Listeners ─────────────────────────────────────────────────────────

function setupEventListeners() {
  const textInput = document.getElementById('textInput');

  // Debounced live analysis; resets both originalText and currentText
  textInput.addEventListener('input', () => {
    clearTimeout(analysisTimeout);
    analysisTimeout = setTimeout(() => {
      const value = textInput.value;
      originalText = value;
      currentText = value;
      renderAll();
    }, 400);
  });

  document.getElementById('clearBtn').addEventListener('click', clearAll);
  document.getElementById('backBtn').addEventListener('click', () => window.close());

  document.getElementById('fixAllBtn').addEventListener('click', applyAllFixes);
  document.getElementById('copyBtn').addEventListener('click', copyFixedText);
  document.getElementById('resetFixesBtn').addEventListener('click', resetFixes);
}

// ─── Core Render ─────────────────────────────────────────────────────────────

function renderAll() {
  if (!currentText.trim()) {
    showEmpty();
    return;
  }

  currentMatches = window.DESLOP_SCORING.collectAllMatches(currentText, PATTERNS, settings);
  renderPreviewWithFixes();
  renderScoreComparison();
  renderActionBar();
  renderMatchCounter();
}

/**
 * Build the fixed-preview HTML.
 * Each detected match gets a highlight span.
 * If a suggestion exists for that match, an inline [fix] button is appended.
 */
function renderPreviewWithFixes() {
  const preview = document.getElementById('fixedPreview');
  const escape = window.DESLOP_SCORING.escapeHtml;

  if (currentMatches.length === 0) {
    preview.textContent = currentText;
    return;
  }

  let html = '';
  let lastIndex = 0;

  currentMatches.forEach((match, idx) => {
    // Text before this match
    html += escape(currentText.substring(lastIndex, match.start));

    const suggestion = resolveSuggestion(match.text);
    const tierClass = match.tier;
    const escapedText = escape(match.text);

    if (suggestion) {
      const firstOption = escape(firstSuggestionOption(suggestion));
      const btnLabel = (window.DESLOP_I18N && window.DESLOP_I18N.msg('rewriterFixBtn')) || 'fix';
      html += `<span class="slop-highlight ${tierClass}" data-match-idx="${idx}">${escapedText}</span>`;
      html += `<button class="fix-btn" data-match-idx="${idx}" title="${firstOption}">[ ${btnLabel} ]</button>`;
    } else {
      // Highlight only – no suggestion available
      html += `<span class="slop-highlight ${tierClass}" data-match-idx="${idx}">${escapedText}</span>`;
    }

    lastIndex = match.end;
  });

  // Remaining text after the last match
  html += escape(currentText.substring(lastIndex));

  preview.innerHTML = html;

  // Attach click handlers to all fix buttons
  preview.querySelectorAll('.fix-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.getAttribute('data-match-idx'), 10);
      applyFix(idx);
    });
  });
}

// ─── Fix Logic ────────────────────────────────────────────────────────────────

/**
 * Apply a fix for a single match by index.
 * Replaces the matched text in currentText with the first suggestion option,
 * preserving the original casing style when possible.
 */
function applyFix(matchIdx) {
  const match = currentMatches[matchIdx];
  if (!match) return;

  const suggestion = resolveSuggestion(match.text);
  if (!suggestion) return;

  const replacement = firstSuggestionOption(suggestion);
  const finalReplacement = matchCase(match.text, replacement);

  currentText =
    currentText.substring(0, match.start) +
    finalReplacement +
    currentText.substring(match.end);

  renderAll();
}

/**
 * Apply fixes for every match that has a suggestion, working from the end of
 * the string backwards so that character offsets remain valid.
 */
function applyAllFixes() {
  // Collect fixable matches in reverse order to maintain offset integrity
  const fixable = currentMatches
    .map((match, idx) => ({ match, idx }))
    .filter(({ match }) => resolveSuggestion(match.text) !== null)
    .reverse();

  if (fixable.length === 0) return;

  fixable.forEach(({ match }) => {
    const suggestion = resolveSuggestion(match.text);
    if (!suggestion) return;
    const replacement = firstSuggestionOption(suggestion);
    const finalReplacement = matchCase(match.text, replacement);
    currentText =
      currentText.substring(0, match.start) +
      finalReplacement +
      currentText.substring(match.end);
  });

  renderAll();
}

/**
 * Reset currentText back to originalText and re-render.
 */
function resetFixes() {
  currentText = originalText;
  renderAll();
}

/**
 * Copy currentText to the clipboard.
 */
async function copyFixedText() {
  if (!currentText.trim()) return;

  try {
    await navigator.clipboard.writeText(currentText);
    showCopyStatus();
  } catch (err) {
    // Fallback for environments where clipboard API is restricted
    const ta = document.createElement('textarea');
    ta.value = currentText;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showCopyStatus();
  }
}

// ─── Score Comparison ─────────────────────────────────────────────────────────

function renderScoreComparison() {
  const section = document.getElementById('scoreComparison');

  if (!originalText.trim()) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'grid';

  const originalResult = window.DESLOP_SCORING.scoreText(originalText, PATTERNS, settings);
  const currentResult = window.DESLOP_SCORING.scoreText(currentText, PATTERNS, settings);

  const originalScore = originalResult.score;
  const currentScore = currentResult.score;

  // Original score block
  setScoreBlock('originalScoreValue', 'originalScoreStatus', originalScore);

  // Current score block
  setScoreBlock('currentScoreValue', 'currentScoreStatus', currentScore);

  // Improvement label
  const improvementEl = document.getElementById('improvementLabel');

  if (originalScore === currentScore) {
    const noChangeMsg = (window.DESLOP_I18N && window.DESLOP_I18N.msg('rewriterNoChange')) || 'NO CHANGE';
    improvementEl.textContent = noChangeMsg;
    improvementEl.className = 'arrow-label neutral';
  } else if (currentScore < originalScore) {
    const pct = originalScore > 0
      ? Math.round(((originalScore - currentScore) / originalScore) * 100)
      : 0;
    const improvedMsg = (window.DESLOP_I18N && window.DESLOP_I18N.msg('rewriterImproved')) || 'IMPROVED';
    improvementEl.textContent = `-${pct}% ${improvedMsg}`;
    improvementEl.className = 'arrow-label improved';
  } else {
    const worseMsg = (window.DESLOP_I18N && window.DESLOP_I18N.msg('rewriterWorse')) || 'WORSE';
    improvementEl.textContent = `+${currentScore - originalScore} ${worseMsg}`;
    improvementEl.className = 'arrow-label worse';
  }
}

function setScoreBlock(valueId, statusId, score) {
  const valueEl = document.getElementById(valueId);
  const statusEl = document.getElementById(statusId);
  const { statusClass, status } = window.DESLOP_SCORING.getScoreStatus(score, settings.sensitivity);

  valueEl.textContent = score;
  valueEl.className = `score-block-value ${statusClass}`;
  statusEl.textContent = status;
  statusEl.className = `score-block-status ${statusClass}`;
}

// ─── UI Helpers ───────────────────────────────────────────────────────────────

function renderActionBar() {
  const bar = document.getElementById('actionBar');
  const fixAllBtn = document.getElementById('fixAllBtn');
  const copyBtn = document.getElementById('copyBtn');

  if (!currentText.trim()) {
    bar.style.display = 'none';
    return;
  }

  bar.style.display = 'flex';

  const fixableCount = currentMatches.filter(m => resolveSuggestion(m.text) !== null).length;
  fixAllBtn.disabled = fixableCount === 0;
  copyBtn.disabled = !currentText.trim();
}

function renderMatchCounter() {
  const counter = document.getElementById('matchCounter');
  const count = currentMatches.length;

  if (!currentText.trim()) {
    counter.textContent = '';
    counter.className = 'match-counter';
    return;
  }

  if (count === 0) {
    const cleanMsg = (window.DESLOP_I18N && window.DESLOP_I18N.msg('rewriterClean')) || 'CLEAN';
    counter.textContent = cleanMsg;
    counter.className = 'match-counter clean';
  } else {
    const matchWord = count === 1
      ? ((window.DESLOP_I18N && window.DESLOP_I18N.msg('rewriterMatch')) || 'match')
      : ((window.DESLOP_I18N && window.DESLOP_I18N.msg('rewriterMatches')) || 'matches');
    counter.textContent = `${count} ${matchWord}`;
    counter.className = 'match-counter has-matches';
  }
}

function showEmpty() {
  const placeholderMsg =
    (window.DESLOP_I18N && window.DESLOP_I18N.msg('rewriterPreviewPlaceholder')) ||
    'Your text will appear here with slop phrases highlighted and fix buttons...';

  document.getElementById('fixedPreview').innerHTML = `<div class="placeholder-text">${window.DESLOP_SCORING.escapeHtml(placeholderMsg)}</div>`;
  document.getElementById('actionBar').style.display = 'none';
  document.getElementById('scoreComparison').style.display = 'none';
  document.getElementById('matchCounter').textContent = '';
  document.getElementById('matchCounter').className = 'match-counter';
}

function clearAll() {
  document.getElementById('textInput').value = '';
  originalText = '';
  currentText = '';
  currentMatches = [];
  showEmpty();
}

function showCopyStatus() {
  const status = document.getElementById('copyStatus');
  const copiedMsg = (window.DESLOP_I18N && window.DESLOP_I18N.msg('rewriterCopied')) || 'COPIED';
  status.textContent = copiedMsg;
  status.classList.add('visible');
  setTimeout(() => {
    status.classList.remove('visible');
  }, 2000);
}

// ─── Suggestion Lookup ────────────────────────────────────────────────────────

/**
 * Find a suggestion string for a matched phrase.
 * Returns null if no suggestion is available.
 *
 * Priority:
 *   1. SUGGESTIONS map (from loadSuggestions – merged checkerSuggestions + suggestions)
 *   2. slopDatabase array (exact match on .slop field, case-insensitive)
 */
function resolveSuggestion(matchedText) {
  const lower = matchedText.toLowerCase().trim();

  if (SUGGESTIONS && SUGGESTIONS[lower]) {
    return SUGGESTIONS[lower];
  }

  // Fall back to slopDatabase
  const dbEntry = SLOP_DATABASE.find(entry => entry.slop.toLowerCase() === lower);
  if (dbEntry && dbEntry.better) {
    return dbEntry.better;
  }

  return null;
}

/**
 * Take the first option from a comma-separated suggestion string.
 * E.g. "explore, examine, analyze" -> "explore"
 */
function firstSuggestionOption(suggestion) {
  if (!suggestion) return suggestion;
  return suggestion.split(',')[0].trim();
}

/**
 * Attempt to preserve the casing style of the original word when applying a
 * replacement. Handles ALL CAPS, Title Case, and lowercase.
 */
function matchCase(original, replacement) {
  if (!original || !replacement) return replacement;

  const firstChar = original[0];

  // ALL CAPS
  if (original === original.toUpperCase() && original.length > 1) {
    return replacement.toUpperCase();
  }

  // Title Case (first letter capitalised)
  if (firstChar === firstChar.toUpperCase() && firstChar !== firstChar.toLowerCase()) {
    return replacement.charAt(0).toUpperCase() + replacement.slice(1);
  }

  return replacement;
}
