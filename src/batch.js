// De-Slop Batch Checker
// Scores multiple text blocks independently using the shared DESLOP_SCORING engine

'use strict';

let PATTERNS = null;
let SETTINGS = { sensitivity: 3, blockEmojis: false, blockStopWords: true, blockEmDashes: true };
let batchResults = [];

// ---------------------------------------------------------------------------
// Initialization
// ---------------------------------------------------------------------------

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
  SETTINGS = stored;
}

function setupEventListeners() {
  document.getElementById('analyzeBtn').addEventListener('click', analyzeBatch);
  document.getElementById('clearBtn').addEventListener('click', clearInput);
  document.getElementById('backBtn').addEventListener('click', () => window.close());
  document.getElementById('exportBtn').addEventListener('click', () => exportCSV(batchResults));
}

// ---------------------------------------------------------------------------
// Input Parsing
// ---------------------------------------------------------------------------

/**
 * Auto-detect separator style and split input into individual text blocks.
 * Priority:
 *   1. Lines containing only "---" (with optional surrounding whitespace)
 *   2. Lines starting with a number followed by a period (1. 2. 3.)
 *   3. Whole input as a single block
 *
 * @param {string} rawText - The full textarea content
 * @returns {string[]} Array of non-empty trimmed text blocks
 */
function parseBatchInput(rawText) {
  if (!rawText || !rawText.trim()) return [];

  // Strategy 1: explicit --- separator
  if (/^---\s*$/m.test(rawText)) {
    const blocks = rawText.split(/^---\s*$/m);
    return blocks.map(b => b.trim()).filter(b => b.length > 0);
  }

  // Strategy 2: numbered list (lines starting with digits and a period at the
  // beginning of a line: "1.", "2.", "10.", etc.)
  const numberedPattern = /^\d+\.\s/m;
  if (numberedPattern.test(rawText)) {
    const lines = rawText.split('\n');
    const blocks = [];
    let current = [];

    for (const line of lines) {
      if (/^\d+\.\s/.test(line)) {
        // Flush any accumulated lines from the previous block
        if (current.length > 0) {
          const blockText = current.join('\n').trim();
          if (blockText) blocks.push(blockText);
          current = [];
        }
        // Start new block, stripping the leading "N. " prefix
        current.push(line.replace(/^\d+\.\s+?/, ''));
      } else {
        current.push(line);
      }
    }

    // Flush the final block
    if (current.length > 0) {
      const blockText = current.join('\n').trim();
      if (blockText) blocks.push(blockText);
    }

    if (blocks.length > 1) return blocks;
  }

  // Strategy 3: treat entire input as one block
  return [rawText.trim()];
}

// ---------------------------------------------------------------------------
// Analysis
// ---------------------------------------------------------------------------

function analyzeBatch() {
  const rawText = document.getElementById('batchInput').value;
  const blocks = parseBatchInput(rawText);

  if (blocks.length === 0) {
    hideSummaryAndResults();
    document.getElementById('emptyState').style.display = 'block';
    return;
  }

  document.getElementById('emptyState').style.display = 'none';

  batchResults = blocks.map((text, index) => {
    const result = window.DESLOP_SCORING.scoreText(text, PATTERNS, SETTINGS);
    const statusInfo = window.DESLOP_SCORING.getScoreStatus(result.score, SETTINGS.sensitivity);
    return {
      index: index + 1,
      text,
      score: result.score,
      matches: result.matches,
      statusClass: statusInfo.statusClass
    };
  });

  displaySummary(batchResults);
  displayResultsTable(batchResults);
}

// ---------------------------------------------------------------------------
// Summary Bar
// ---------------------------------------------------------------------------

function displaySummary(results) {
  const summaryBar = document.getElementById('summaryBar');
  const passedEl = document.getElementById('summaryPassed');
  const totalEl = document.getElementById('summaryTotal');
  const avgEl = document.getElementById('summaryAvg');
  const worstEl = document.getElementById('summaryWorst');
  const threshold = window.DESLOP_SCORING.THRESHOLDS[SETTINGS.sensitivity];

  const passed = results.filter(r => r.score < threshold).length;
  const total = results.length;
  const avg = total > 0 ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / total) : 0;

  let worstResult = null;
  for (const r of results) {
    if (worstResult === null || r.score > worstResult.score) {
      worstResult = r;
    }
  }

  passedEl.textContent = passed;
  totalEl.textContent = total;
  avgEl.textContent = avg;
  worstEl.textContent = worstResult ? `#${worstResult.index} (${worstResult.score}pts)` : '\u2014';

  // Colour the average relative to threshold
  avgEl.className = 'summary-value ' + getStatusClass(avg);

  summaryBar.style.display = 'flex';
}

function getStatusClass(score) {
  const threshold = window.DESLOP_SCORING.THRESHOLDS[SETTINGS.sensitivity];
  if (score === 0) return 'safe';
  if (score < threshold) return 'warning';
  return 'danger';
}

// ---------------------------------------------------------------------------
// Results Table
// ---------------------------------------------------------------------------

function displayResultsTable(results) {
  const tbody = document.getElementById('resultsBody');
  tbody.innerHTML = '';

  results.forEach(result => {
    const summaryRow = buildSummaryRow(result);
    const detailRow = buildDetailRow(result);

    tbody.appendChild(summaryRow);
    tbody.appendChild(detailRow);

    // Toggle expansion on click
    summaryRow.addEventListener('click', () => {
      const isOpen = detailRow.classList.contains('open');
      const indicator = summaryRow.querySelector('.expand-indicator');

      if (isOpen) {
        detailRow.classList.remove('open');
        if (indicator) indicator.textContent = '[+]';
      } else {
        detailRow.classList.add('open');
        if (indicator) indicator.textContent = '[-]';
      }
    });
  });

  document.getElementById('resultsSection').style.display = 'block';
}

function buildSummaryRow(result) {
  const tr = document.createElement('tr');
  tr.className = `result-row status-${result.statusClass}`;

  const preview = result.text.replace(/\s+/g, ' ').trim().substring(0, 60);
  const previewText = preview.length < result.text.replace(/\s+/g, ' ').trim().length
    ? preview + '...'
    : preview;

  const topIssuesHtml = buildTopIssuesHtml(result.matches, 3);
  const badgeLabel = getStatusLabel(result.statusClass);

  tr.innerHTML = `
    <td class="col-num">${result.index}</td>
    <td class="col-preview">
      ${escHtml(previewText)}
      <span class="expand-indicator">[+]</span>
    </td>
    <td class="col-score">${result.score}</td>
    <td class="col-status">
      <span class="status-badge ${result.statusClass}">${badgeLabel}</span>
    </td>
    <td class="col-issues">${topIssuesHtml}</td>
  `;

  return tr;
}

function buildDetailRow(result) {
  const tr = document.createElement('tr');
  tr.className = `detail-row status-${result.statusClass}`;

  const td = document.createElement('td');
  td.colSpan = 5;

  const tier1Score = sumPoints(result.matches.tier1);
  const tier2Score = sumPoints(result.matches.tier2);
  const tier3Score = sumPoints(result.matches.tier3);
  const emojiScore = sumPoints(result.matches.emoji);

  const allMatchTags = buildAllMatchTagsHtml(result.matches);

  const i18n = window.DESLOP_I18N;
  const analysisTitle = (i18n && i18n.msg('batchDetailAnalysis')) || 'SCORE BREAKDOWN';
  const tier1Label = (i18n && i18n.msg('batchDetailTier1')) || 'Tier 1 - AI Slop (3pts)';
  const tier2Label = (i18n && i18n.msg('batchDetailTier2')) || 'Tier 2 - Corporate (2pts)';
  const tier3Label = (i18n && i18n.msg('batchDetailTier3')) || 'Tier 3 - Marketing (1pt)';
  const emojiLabel = (i18n && i18n.msg('batchDetailEmoji')) || 'Emoji Slop (5pts)';
  const matchesTitle = (i18n && i18n.msg('batchDetailMatches')) || 'Matched Phrases';

  td.innerHTML = `
    <div class="detail-inner">
      <div class="detail-text-block">${escHtml(result.text)}</div>
      <div class="detail-analysis">
        <div class="detail-analysis-title">${analysisTitle}</div>
        <div class="detail-breakdown-item">
          <span class="detail-tier-label">${escHtml(tier1Label)}</span>
          <span class="detail-tier-score ${tier1Score > 0 ? 'tier1' : 'zero'}">${tier1Score}pts</span>
        </div>
        <div class="detail-breakdown-item">
          <span class="detail-tier-label">${escHtml(tier2Label)}</span>
          <span class="detail-tier-score ${tier2Score > 0 ? 'tier2' : 'zero'}">${tier2Score}pts</span>
        </div>
        <div class="detail-breakdown-item">
          <span class="detail-tier-label">${escHtml(tier3Label)}</span>
          <span class="detail-tier-score ${tier3Score > 0 ? 'tier3' : 'zero'}">${tier3Score}pts</span>
        </div>
        <div class="detail-breakdown-item">
          <span class="detail-tier-label">${escHtml(emojiLabel)}</span>
          <span class="detail-tier-score ${emojiScore > 0 ? 'emoji' : 'zero'}">${emojiScore}pts</span>
        </div>
        ${allMatchTags ? `<div class="detail-matches-list"><div class="detail-analysis-title" style="margin-top:12px">${escHtml(matchesTitle)}</div>${allMatchTags}</div>` : ''}
      </div>
    </div>
  `;

  tr.appendChild(td);
  return tr;
}

// ---------------------------------------------------------------------------
// HTML Helpers
// ---------------------------------------------------------------------------

function buildTopIssuesHtml(matches, limit) {
  const items = [];

  const addItems = (tier, list) => {
    for (const m of list) {
      if (items.length >= limit) break;
      const label = formatPatternShort(m.pattern);
      items.push(`<span class="issue-tag ${tier}">${escHtml(label)}</span>`);
    }
  };

  addItems('tier1', matches.tier1);
  addItems('tier2', matches.tier2);
  addItems('tier3', matches.tier3);
  addItems('emoji', matches.emoji);

  if (items.length === 0) {
    const i18n = window.DESLOP_I18N;
    const noneLabel = (i18n && i18n.msg('batchNoIssues')) || 'None detected';
    return `<span class="no-issues">${noneLabel}</span>`;
  }

  return items.join('');
}

function buildAllMatchTagsHtml(matches) {
  const tags = [];

  const addTags = (tier, list) => {
    for (const m of list) {
      const label = formatPatternShort(m.pattern);
      tags.push(`<span class="detail-match-tag">${escHtml(label)} (${m.points}pts)</span>`);
    }
  };

  addTags('tier1', matches.tier1);
  addTags('tier2', matches.tier2);
  addTags('tier3', matches.tier3);
  addTags('emoji', matches.emoji);

  return tags.join('');
}

function getStatusLabel(statusClass) {
  const i18n = window.DESLOP_I18N;
  switch (statusClass) {
    case 'safe':
      return (i18n && i18n.msg('batchStatusPass')) || 'PASS';
    case 'warning':
      return (i18n && i18n.msg('batchStatusBorderline')) || 'BORDERLINE';
    case 'danger':
      return (i18n && i18n.msg('batchStatusFail')) || 'FAIL';
    default:
      return statusClass.toUpperCase();
  }
}

/**
 * Produce a short human-readable label from a regex pattern source string.
 * Uses the engine's formatPattern and truncates to a compact length.
 *
 * @param {string} patternSource
 * @returns {string}
 */
function formatPatternShort(patternSource) {
  const full = window.DESLOP_SCORING.formatPattern(patternSource);
  if (full.length > 30) return full.substring(0, 28) + '...';
  return full;
}

function sumPoints(matchArray) {
  return matchArray.reduce((acc, m) => acc + m.points, 0);
}

function escHtml(text) {
  return window.DESLOP_SCORING.escapeHtml(String(text));
}

// ---------------------------------------------------------------------------
// CSV Export
// ---------------------------------------------------------------------------

/**
 * Export batch results as a CSV file and trigger a download.
 * Columns: Block #, Preview, Score, Status, Tier1 pts, Tier2 pts, Tier3 pts, Emoji pts, Top Matches
 *
 * @param {Array} results
 */
function exportCSV(results) {
  if (!results || results.length === 0) return;

  const i18n = window.DESLOP_I18N;
  const headers = [
    (i18n && i18n.msg('batchCSVBlock')) || 'Block #',
    (i18n && i18n.msg('batchCSVPreview')) || 'Preview',
    (i18n && i18n.msg('batchCSVScore')) || 'Score',
    (i18n && i18n.msg('batchCSVStatus')) || 'Status',
    (i18n && i18n.msg('batchCSVTier1')) || 'Tier1 pts',
    (i18n && i18n.msg('batchCSVTier2')) || 'Tier2 pts',
    (i18n && i18n.msg('batchCSVTier3')) || 'Tier3 pts',
    (i18n && i18n.msg('batchCSVEmoji')) || 'Emoji pts',
    (i18n && i18n.msg('batchCSVMatches')) || 'Top Matches'
  ];

  const rows = results.map(r => {
    const preview = r.text.replace(/\s+/g, ' ').trim().substring(0, 80);
    const status = getStatusLabel(r.statusClass);
    const tier1pts = sumPoints(r.matches.tier1);
    const tier2pts = sumPoints(r.matches.tier2);
    const tier3pts = sumPoints(r.matches.tier3);
    const emojiPts = sumPoints(r.matches.emoji);

    const allMatches = [
      ...r.matches.tier1,
      ...r.matches.tier2,
      ...r.matches.tier3,
      ...r.matches.emoji
    ];
    const topMatches = allMatches
      .slice(0, 5)
      .map(m => formatPatternShort(m.pattern))
      .join('; ');

    return [
      r.index,
      preview,
      r.score,
      status,
      tier1pts,
      tier2pts,
      tier3pts,
      emojiPts,
      topMatches
    ].map(csvField).join(',');
  });

  const csvContent = [headers.map(csvField).join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `deslop-batch-${datestamp()}.csv`;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();

  // Clean up immediately after click is dispatched
  setTimeout(() => {
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Wrap a value for safe inclusion in a CSV cell.
 * Strings containing commas, quotes, or newlines are double-quoted with
 * internal double-quotes escaped.
 *
 * @param {*} value
 * @returns {string}
 */
function csvField(value) {
  const str = String(value == null ? '' : value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

/**
 * Produce a simple YYYY-MM-DD datestamp for filenames.
 * @returns {string}
 */
function datestamp() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// ---------------------------------------------------------------------------
// UI Helpers
// ---------------------------------------------------------------------------

function clearInput() {
  document.getElementById('batchInput').value = '';
  hideSummaryAndResults();
  document.getElementById('emptyState').style.display = 'none';
  batchResults = [];
}

function hideSummaryAndResults() {
  document.getElementById('summaryBar').style.display = 'none';
  document.getElementById('resultsSection').style.display = 'none';
}
