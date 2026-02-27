// De-Slop Text Comparator
// Compare two text drafts side-by-side with score deltas and match diffs.
// Uses shared DESLOP_SCORING engine.

'use strict';

let PATTERNS = null;
let settings = {
  sensitivity: 3,
  blockEmojis: false,
  blockStopWords: true,
  blockEmDashes: true
};

// Track whether results are currently visible (for swap re-analysis)
let resultsVisible = false;

// -----------------------------------------------------------------------
// Initialization
// -----------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();

  const langSettings = await chrome.storage.sync.get({ patternLanguage: 'auto' });
  const lang = window.DESLOP_REGISTRY
    ? window.DESLOP_REGISTRY.resolveLanguage(langSettings.patternLanguage)
    : 'en';
  loadPatterns(lang);

  if (window.DESLOP_I18N) {
    await window.DESLOP_I18N.init(langSettings.patternLanguage);
    window.DESLOP_I18N.applyTranslations();
  }

  setupEventListeners();
});

// -----------------------------------------------------------------------
// Setup
// -----------------------------------------------------------------------

function loadPatterns(lang) {
  PATTERNS = window.DESLOP_SCORING.loadPatterns(lang);
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

function setupEventListeners() {
  document.getElementById('compareBtn').addEventListener('click', analyzeComparison);
  document.getElementById('swapBtn').addEventListener('click', swapTexts);
  document.getElementById('backBtn').addEventListener('click', () => window.close());
}

// -----------------------------------------------------------------------
// Core: Analyze both texts and render all result sections
// -----------------------------------------------------------------------

function analyzeComparison() {
  const text1 = document.getElementById('originalText').value;
  const text2 = document.getElementById('revisedText').value;

  if (!text1.trim() && !text2.trim()) {
    return;
  }

  const result1 = window.DESLOP_SCORING.scoreText(text1, PATTERNS, settings);
  const result2 = window.DESLOP_SCORING.scoreText(text2, PATTERNS, settings);

  const matches1 = window.DESLOP_SCORING.collectAllMatches(text1, PATTERNS, settings);
  const matches2 = window.DESLOP_SCORING.collectAllMatches(text2, PATTERNS, settings);

  displayScoreComparison(result1, result2);
  displayTierBreakdown(result1.matches, result2.matches);
  displayMatchDiff(matches1, matches2);

  updateScoreBadges(result1, result2);

  document.getElementById('results').style.display = 'flex';
  resultsVisible = true;
}

// -----------------------------------------------------------------------
// Score Comparison Cards
// -----------------------------------------------------------------------

function displayScoreComparison(result1, result2) {
  const i18n = window.DESLOP_I18N;
  const scoring = window.DESLOP_SCORING;

  // Original card
  renderScoreCard(
    document.getElementById('originalScoreValue'),
    document.getElementById('originalScoreStatus'),
    result1.score
  );

  // Revised card
  renderScoreCard(
    document.getElementById('revisedScoreValue'),
    document.getElementById('revisedScoreStatus'),
    result2.score
  );

  // Delta: negative delta = improvement (score went down)
  const delta = result2.score - result1.score;
  const deltaArrowEl = document.getElementById('deltaArrow');
  const deltaLabelEl = document.getElementById('deltaLabel');

  deltaArrowEl.className = 'delta-arrow';
  deltaLabelEl.className = 'delta-label';

  if (delta < 0) {
    // Improved: score decreased
    const absVal = Math.abs(delta);
    deltaArrowEl.textContent = '\u2193';
    deltaArrowEl.classList.add('improved');
    const improvedMsg = (i18n && i18n.msg('compareImproved')) || 'Improved';
    deltaLabelEl.textContent = `-${absVal} ${improvedMsg}`;
    deltaLabelEl.classList.add('improved');
  } else if (delta > 0) {
    // Worsened: score increased
    deltaArrowEl.textContent = '\u2191';
    deltaArrowEl.classList.add('worsened');
    const worsenedMsg = (i18n && i18n.msg('compareWorsened')) || 'Worsened';
    deltaLabelEl.textContent = `+${delta} ${worsenedMsg}`;
    deltaLabelEl.classList.add('worsened');
  } else {
    // No change
    deltaArrowEl.textContent = '\u2014';
    const noChangeMsg = (i18n && i18n.msg('compareNoDelta')) || 'No change';
    deltaLabelEl.textContent = noChangeMsg;
  }
}

function renderScoreCard(valueEl, statusEl, score) {
  const { statusClass, status } = window.DESLOP_SCORING.getScoreStatus(score, settings.sensitivity);
  valueEl.textContent = score;
  valueEl.className = `score-card-value ${statusClass}`;
  statusEl.textContent = status;
  statusEl.className = `score-card-status ${statusClass}`;
}

// -----------------------------------------------------------------------
// Tier Breakdown Table
// -----------------------------------------------------------------------

function displayTierBreakdown(matches1, matches2) {
  const i18n = window.DESLOP_I18N;
  const tbody = document.getElementById('breakdownBody');

  const tiers = [
    {
      key: 'tier1',
      label: (i18n && i18n.msg('compareTier1Label')) || 'Tier 1 - AI Slop (3pts)'
    },
    {
      key: 'tier2',
      label: (i18n && i18n.msg('compareTier2Label')) || 'Tier 2 - Corporate (2pts)'
    },
    {
      key: 'tier3',
      label: (i18n && i18n.msg('compareTier3Label')) || 'Tier 3 - Marketing (1pt)'
    },
    {
      key: 'emoji',
      label: (i18n && i18n.msg('compareEmojiLabel')) || 'Emoji Slop (5pts)'
    }
  ];

  const ptsLabel = (i18n && i18n.msg('comparePtsLabel')) || 'pts';
  const naLabel = (i18n && i18n.msg('compareNaLabel')) || 'n/a';

  tbody.innerHTML = tiers.map(tier => {
    const pts1 = sumTierPoints(matches1[tier.key]);
    const pts2 = sumTierPoints(matches2[tier.key]);
    const isActive = isTierActive(tier.key);

    const origCell = isActive ? `${pts1} ${ptsLabel}` : naLabel;
    const revisedCell = isActive ? `${pts2} ${ptsLabel}` : naLabel;

    let changeCell = '\u2014';
    let changeClass = 'col-change neutral';

    if (isActive) {
      const diff = pts2 - pts1;
      if (diff < 0) {
        changeCell = `-${Math.abs(diff)} ${ptsLabel}`;
        changeClass = 'col-change improved';
      } else if (diff > 0) {
        changeCell = `+${diff} ${ptsLabel}`;
        changeClass = 'col-change worsened';
      } else {
        changeCell = '\u2014';
        changeClass = 'col-change neutral';
      }
    }

    return `
      <tr>
        <td class="col-tier">${escapeHtml(tier.label)}</td>
        <td class="col-original">${origCell}</td>
        <td class="col-revised">${revisedCell}</td>
        <td class="${changeClass}">${changeCell}</td>
      </tr>
    `;
  }).join('');
}

function sumTierPoints(tierMatches) {
  if (!tierMatches || !tierMatches.length) return 0;
  return tierMatches.reduce((sum, m) => sum + m.points, 0);
}

function isTierActive(tierKey) {
  if (tierKey === 'tier1') return true;
  if (tierKey === 'tier2') return settings.sensitivity >= 3;
  if (tierKey === 'tier3') return settings.sensitivity >= 4;
  if (tierKey === 'emoji') return !!settings.blockEmojis;
  return false;
}

// -----------------------------------------------------------------------
// Match Diff
// -----------------------------------------------------------------------

function displayMatchDiff(matches1, matches2) {
  // Normalize match texts to lowercase for comparison
  const set1 = buildMatchSet(matches1);
  const set2 = buildMatchSet(matches2);

  // Fixed: in original but NOT in revised
  const fixed = [];
  // Remaining: in both
  const remaining = [];
  // New: NOT in original but in revised
  const newMatches = [];

  for (const [key, entry] of set1.entries()) {
    if (set2.has(key)) {
      remaining.push(entry);
    } else {
      fixed.push(entry);
    }
  }

  for (const [key, entry] of set2.entries()) {
    if (!set1.has(key)) {
      newMatches.push(entry);
    }
  }

  renderDiffList('fixedList', fixed, 'match-fixed', 'compareNoneFixed', 'None');
  renderDiffList('remainingList', remaining, 'match-remaining', 'compareNoneRemaining', 'None');
  renderDiffList('newList', newMatches, 'match-new', 'compareNoneNew', 'None');
}

/**
 * Build a Map keyed by lowercased match text.
 * Each entry preserves the original display text and tier.
 * If the same text appears multiple times, keep the first occurrence.
 * @param {Array<{ text: string, tier: string }>} matches
 * @returns {Map<string, { displayText: string, tier: string }>}
 */
function buildMatchSet(matches) {
  const map = new Map();
  for (const match of matches) {
    const key = match.text.toLowerCase();
    if (!map.has(key)) {
      map.set(key, { displayText: match.text, tier: match.tier });
    }
  }
  return map;
}

function renderDiffList(containerId, entries, pillClass, emptyI18nKey, emptyFallback) {
  const container = document.getElementById(containerId);
  const i18n = window.DESLOP_I18N;

  if (entries.length === 0) {
    const emptyText = (i18n && i18n.msg(emptyI18nKey)) || emptyFallback;
    container.innerHTML = `<span class="diff-empty">${escapeHtml(emptyText)}</span>`;
    return;
  }

  container.innerHTML = entries.map(entry => {
    const tierLabel = getTierLabel(entry.tier);
    return `
      <span class="match-pill ${pillClass}">
        ${escapeHtml(entry.displayText)}
        <span class="match-tier-label">${escapeHtml(tierLabel)}</span>
      </span>
    `;
  }).join('');
}

function getTierLabel(tier) {
  const i18n = window.DESLOP_I18N;
  switch (tier) {
    case 'tier1':
      return (i18n && i18n.msg('compareTierT1Short')) || 'AI Slop';
    case 'tier2':
      return (i18n && i18n.msg('compareTierT2Short')) || 'Corporate';
    case 'tier3':
      return (i18n && i18n.msg('compareTierT3Short')) || 'Marketing';
    case 'emoji':
      return (i18n && i18n.msg('compareTierEmojiShort')) || 'Emoji';
    default:
      return tier;
  }
}

// -----------------------------------------------------------------------
// Score Badges (shown inline next to textarea labels)
// -----------------------------------------------------------------------

function updateScoreBadges(result1, result2) {
  updateBadge('originalBadge', result1.score);
  updateBadge('revisedBadge', result2.score);
}

function updateBadge(badgeId, score) {
  const badge = document.getElementById(badgeId);
  if (!badge) return;

  const { statusClass } = window.DESLOP_SCORING.getScoreStatus(score, settings.sensitivity);
  badge.textContent = score + ' pts';
  badge.className = `score-badge visible ${statusClass}`;
}

// -----------------------------------------------------------------------
// Swap Texts
// -----------------------------------------------------------------------

function swapTexts() {
  const originalEl = document.getElementById('originalText');
  const revisedEl = document.getElementById('revisedText');

  const temp = originalEl.value;
  originalEl.value = revisedEl.value;
  revisedEl.value = temp;

  // Re-run comparison if results were already displayed
  if (resultsVisible) {
    analyzeComparison();
  }
}

// -----------------------------------------------------------------------
// Utility
// -----------------------------------------------------------------------

function escapeHtml(text) {
  if (window.DESLOP_SCORING && window.DESLOP_SCORING.escapeHtml) {
    return window.DESLOP_SCORING.escapeHtml(text);
  }
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
