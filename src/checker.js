// De-Slop Interactive Checker - "Is My Post Slop?"
// Uses shared DESLOP_SCORING engine for pattern matching

let PATTERNS = null;
let SUGGESTIONS = null;
let settings = {
  sensitivity: 3,
  blockEmojis: false,
  renderMarkdown: false
};

let analysisTimeout = null;
let currentMatches = [];

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();

  // Resolve language and load patterns
  const langSettings = await chrome.storage.sync.get({ patternLanguage: 'auto' });
  const lang = window.DESLOP_REGISTRY
    ? window.DESLOP_REGISTRY.resolveLanguage(langSettings.patternLanguage)
    : 'en';
  loadPatterns(lang);

  // Initialize i18n
  if (window.DESLOP_I18N) {
    await window.DESLOP_I18N.init(langSettings.patternLanguage);
    window.DESLOP_I18N.applyTranslations();
  }

  setupEventListeners();
  updateMarkdownToggle();
});

// Load patterns from shared source via scoring engine
function loadPatterns(lang) {
  PATTERNS = window.DESLOP_SCORING.loadPatterns(lang);
  SUGGESTIONS = window.DESLOP_SCORING.loadSuggestions(lang);
}

async function loadSettings() {
  const stored = await chrome.storage.sync.get({
    sensitivity: 3,
    blockEmojis: false,
    blockStopWords: true,
    blockEmDashes: true,
    renderMarkdown: false
  });
  settings = stored;
}

function setupEventListeners() {
  const textInput = document.getElementById('textInput');
  const clearBtn = document.getElementById('clearBtn');
  const backBtn = document.getElementById('backBtn');
  const markdownToggle = document.getElementById('markdownToggle');
  const tooltip = document.getElementById('fixTooltip');
  const tooltipClose = tooltip?.querySelector('.tooltip-close');

  if (!textInput) {
    console.error('textInput element not found!');
    return;
  }

  // Live analysis on input (debounced)
  textInput.addEventListener('input', () => {
    clearTimeout(analysisTimeout);
    analysisTimeout = setTimeout(() => {
      analyzeAndHighlight();
    }, 500);
  });

  // Also listen for paste events
  textInput.addEventListener('paste', () => {
    clearTimeout(analysisTimeout);
    analysisTimeout = setTimeout(() => {
      analyzeAndHighlight();
    }, 500);
  });

  clearBtn.addEventListener('click', clearText);
  backBtn.addEventListener('click', () => window.close());

  // Markdown toggle
  markdownToggle.addEventListener('click', async () => {
    settings.renderMarkdown = !settings.renderMarkdown;

    // Save to storage if available
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
        await chrome.storage.sync.set({ renderMarkdown: settings.renderMarkdown });
      }
    } catch (error) {
      console.warn('Could not save markdown setting:', error);
    }

    updateMarkdownToggle();
    analyzeAndHighlight();
  });

  // Tooltip close
  tooltipClose.addEventListener('click', () => {
    tooltip.style.display = 'none';
  });

  // Close tooltip on outside click
  document.addEventListener('click', (e) => {
    if (!tooltip.contains(e.target) && !e.target.classList.contains('slop-highlight')) {
      tooltip.style.display = 'none';
    }
  });
}

function updateMarkdownToggle() {
  const markdownToggle = document.getElementById('markdownToggle');
  const preview = document.getElementById('highlightedPreview');

  if (settings.renderMarkdown) {
    markdownToggle.classList.add('active');
    preview.classList.add('markdown-mode');
  } else {
    markdownToggle.classList.remove('active');
    preview.classList.remove('markdown-mode');
  }
}

function analyzeAndHighlight() {
  const text = document.getElementById('textInput').value;
  const placeholderMsg = (window.DESLOP_I18N && window.DESLOP_I18N.msg('checkerPreviewPlaceholder')) || 'Your content will appear here with slop phrases highlighted...';

  if (!text.trim()) {
    document.getElementById('highlightedPreview').innerHTML = `<div class="placeholder-text">${placeholderMsg}</div>`;
    document.getElementById('results').style.display = 'none';
    return;
  }

  const result = window.DESLOP_SCORING.scoreText(text, PATTERNS, settings);
  currentMatches = window.DESLOP_SCORING.collectAllMatches(text, PATTERNS, settings);
  highlightText(text, currentMatches);
  displayResults(result);
}

function highlightText(text, matches) {
  const preview = document.getElementById('highlightedPreview');
  const escape = window.DESLOP_SCORING.escapeHtml;
  const escRegExp = window.DESLOP_SCORING.escapeRegExp;

  if (matches.length === 0) {
    if (settings.renderMarkdown) {
      preview.innerHTML = renderMarkdown(text);
    } else {
      preview.textContent = text;
    }
    return;
  }

  let html;

  if (settings.renderMarkdown) {
    const placeholders = [];
    let textWithPlaceholders = text;
    let offset = 0;

    const sortedMatches = [...matches].sort((a, b) => a.start - b.start);

    sortedMatches.forEach((match, idx) => {
      const placeholder = `\u27EA SLOP${idx}\u27EB`;
      placeholders.push({ placeholder, match, idx });

      const adjustedStart = match.start + offset;
      const adjustedEnd = match.end + offset;

      textWithPlaceholders =
        textWithPlaceholders.substring(0, adjustedStart) +
        placeholder +
        textWithPlaceholders.substring(adjustedEnd);

      offset += placeholder.length - (match.end - match.start);
    });

    html = renderMarkdown(textWithPlaceholders);

    placeholders.forEach(({ placeholder, match, idx }) => {
      const highlightHtml = `<span class="slop-highlight ${match.tier}" data-match-idx="${idx}">${escape(match.text)}</span>`;
      html = html.replace(new RegExp(escRegExp(placeholder), 'g'), highlightHtml);
    });
  } else {
    html = '';
    let lastIndex = 0;

    matches.forEach((match, idx) => {
      html += escape(text.substring(lastIndex, match.start));
      html += `<span class="slop-highlight ${match.tier}" data-match-idx="${idx}">${escape(match.text)}</span>`;
      lastIndex = match.end;
    });

    html += escape(text.substring(lastIndex));
  }

  preview.innerHTML = html;

  preview.querySelectorAll('.slop-highlight').forEach(el => {
    el.addEventListener('click', (e) => {
      const idx = parseInt(e.target.getAttribute('data-match-idx'));
      showFixTooltip(e.target, matches[idx]);
    });
  });
}

// Simple markdown renderer
function renderMarkdown(text) {
  if (!text) return '';

  let html = text;

  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');
  html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
  html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');

  html = html.replace(/^---$/gm, '<hr>');
  html = html.replace(/^\*\*\*$/gm, '<hr>');

  html = html.replace(/^&gt;\s?(.+)$/gm, '<blockquote>$1</blockquote>');
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');
  html = html.replace(/^\*\s+(.+)$/gm, '<li>$1</li>');
  html = html.replace(/^-\s+(.+)$/gm, '<li>$1</li>');
  html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');

  html = html.replace(/(<li>.+<\/li>\n?)+/g, (match) => {
    return `<ul>${match}</ul>`;
  });

  const lines = html.split('\n');
  const processed = lines.map(line => {
    const trimmed = line.trim();
    if (trimmed === '') return '';
    if (trimmed.startsWith('<') && trimmed.endsWith('>')) return line;
    if (trimmed.match(/^<h[1-6]>/) || trimmed.match(/^<\/h[1-6]>/)) return line;
    if (trimmed.match(/^<(ul|ol|li|blockquote|pre|hr)/)) return line;
    return `<p>${line}</p>`;
  });

  html = processed.join('\n');
  return html;
}

function showFixTooltip(element, match) {
  const tooltip = document.getElementById('fixTooltip');
  const phraseEl = tooltip.querySelector('.tooltip-phrase');
  const suggestionEl = tooltip.querySelector('.tooltip-suggestion');

  const matchLower = match.text.toLowerCase().trim();
  let suggestion = (SUGGESTIONS && SUGGESTIONS[matchLower]) || getSuggestionForTier(match.tier);

  phraseEl.textContent = `"${match.text}"`;

  const suggLabel = (window.DESLOP_I18N && window.DESLOP_I18N.msg('checkerSuggestionLabel')) || 'SUGGESTION:';
  suggestionEl.innerHTML = `<strong>${suggLabel}</strong>${window.DESLOP_SCORING.escapeHtml(suggestion)}`;

  const rect = element.getBoundingClientRect();
  tooltip.style.display = 'block';
  tooltip.style.left = `${rect.left}px`;
  tooltip.style.top = `${rect.bottom + 10}px`;

  const tooltipRect = tooltip.getBoundingClientRect();
  if (tooltipRect.right > window.innerWidth) {
    tooltip.style.left = `${window.innerWidth - tooltipRect.width - 20}px`;
  }
  if (tooltipRect.bottom > window.innerHeight) {
    tooltip.style.top = `${rect.top - tooltipRect.height - 10}px`;
  }
}

function getSuggestionForTier(tier) {
  const i18n = window.DESLOP_I18N;
  switch (tier) {
    case 'tier1':
      return (i18n && i18n.msg('checkerTier1Suggestion')) || 'This is AI-generated slop language. Be specific and authentic instead of using generic phrases.';
    case 'tier2':
      return (i18n && i18n.msg('checkerTier2Suggestion')) || 'This is corporate buzzword jargon. Use plain language to describe what you actually mean.';
    case 'tier3':
      return (i18n && i18n.msg('checkerTier3Suggestion')) || 'This is marketing spam language. Remove hype and be factual.';
    case 'emoji':
      return (i18n && i18n.msg('checkerEmojiSuggestion')) || 'Excessive emoji usage combined with buzzwords signals low-quality content. Use emojis sparingly if at all.';
    default:
      return (i18n && i18n.msg('checkerDefaultSuggestion')) || 'Consider rewriting this phrase to be more specific and less generic.';
  }
}

function displayResults(result) {
  const resultsSection = document.getElementById('results');
  const scoreValue = document.getElementById('scoreValue');
  const scoreStatus = document.getElementById('scoreStatus');
  const i18n = window.DESLOP_I18N;

  resultsSection.style.display = 'block';
  scoreValue.textContent = result.score;

  const threshold = window.DESLOP_SCORING.THRESHOLDS[settings.sensitivity];
  let status, statusClass;

  if (result.score === 0) {
    status = (i18n && i18n.msg('checkerClean')) || 'CLEAN - No slop detected';
    statusClass = 'safe';
  } else if (result.score < threshold) {
    status = (i18n && i18n.msg('checkerBorderline')) || 'BORDERLINE - Close but passes';
    statusClass = 'warning';
  } else {
    status = (i18n && i18n.msg('checkerSlopBlocked')) || 'SLOP DETECTED - Would be blocked';
    statusClass = 'danger';
  }

  scoreValue.className = `score-value ${statusClass}`;
  scoreStatus.className = `score-status ${statusClass}`;
  scoreStatus.textContent = status;

  updateThresholds(result.score);
  showBreakdown(result.matches);
  showMatches(result.matches);
  showSuggestions(result.score, result.matches);
}

function updateThresholds(score) {
  const i18n = window.DESLOP_I18N;
  const blockedText = (i18n && i18n.msg('checkerBlocked')) || 'BLOCKED';
  const passText = (i18n && i18n.msg('checkerPass')) || 'PASS';

  for (let i = 1; i <= 5; i++) {
    const threshold = window.DESLOP_SCORING.THRESHOLDS[i];
    const elem = document.getElementById(`thresh${i}`);

    if (score >= threshold) {
      elem.textContent = `\u2717 ${blockedText}`;
      elem.className = 'status-indicator block';
    } else {
      elem.textContent = `\u2713 ${passText}`;
      elem.className = 'status-indicator pass';
    }
  }
}

function showBreakdown(matches) {
  const content = document.getElementById('breakdownContent');
  const i18n = window.DESLOP_I18N;
  const tier1Score = matches.tier1.reduce((sum, m) => sum + m.points, 0);
  const tier2Score = matches.tier2.reduce((sum, m) => sum + m.points, 0);
  const tier3Score = matches.tier3.reduce((sum, m) => sum + m.points, 0);
  const emojiScore = matches.emoji.reduce((sum, m) => sum + m.points, 0);

  const tier1Label = (i18n && i18n.msg('checkerTier1Label')) || 'Tier 1 (AI Slop) - 3pts each:';
  const tier2Label = (i18n && i18n.msg('checkerTier2Label')) || 'Tier 2 (Corporate) - 2pts each:';
  const tier3Label = (i18n && i18n.msg('checkerTier3Label')) || 'Tier 3 (Marketing) - 1pt each:';
  const emojiLabel = (i18n && i18n.msg('checkerEmojiLabel')) || 'Emoji Slop - 5pts each:';
  const inactiveText = (i18n && i18n.msg('checkerInactive')) || '(inactive)';
  const disabledText = (i18n && i18n.msg('checkerDisabled')) || '(disabled)';

  content.innerHTML = `
    <div class="breakdown-item">
      <span class="breakdown-tier">${tier1Label}</span>
      <span class="breakdown-score">${tier1Score} pts</span>
    </div>
    <div class="breakdown-item">
      <span class="breakdown-tier">${tier2Label}</span>
      <span class="breakdown-score">${tier2Score} pts ${settings.sensitivity < 3 ? inactiveText : ''}</span>
    </div>
    <div class="breakdown-item">
      <span class="breakdown-tier">${tier3Label}</span>
      <span class="breakdown-score">${tier3Score} pts ${settings.sensitivity < 4 ? inactiveText : ''}</span>
    </div>
    <div class="breakdown-item">
      <span class="breakdown-tier">${emojiLabel}</span>
      <span class="breakdown-score">${emojiScore} pts ${!settings.blockEmojis ? disabledText : ''}</span>
    </div>
  `;
}

function showMatches(matches) {
  const section = document.getElementById('matches');
  const content = document.getElementById('matchesContent');
  const format = window.DESLOP_SCORING.formatPattern;

  const allMatches = [
    ...matches.tier1,
    ...matches.tier2,
    ...matches.tier3,
    ...matches.emoji
  ];

  if (allMatches.length === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';
  content.innerHTML = allMatches.map(m => `
    <div class="match-item">
      <div class="match-pattern">${format(m.pattern)}</div>
      <div class="match-count">${m.count} match${m.count > 1 ? 'es' : ''} \u00D7 ${m.points / m.count}pts = ${m.points}pts</div>
    </div>
  `).join('');
}

function showSuggestions(score, matches) {
  const content = document.getElementById('suggestionsContent');
  const i18n = window.DESLOP_I18N;
  const suggestions = [];

  if (score === 0) {
    suggestions.push((i18n && i18n.msg('checkerCleanSuggestion1')) || 'Your content looks clean! No slop patterns detected.');
    suggestions.push((i18n && i18n.msg('checkerCleanSuggestion2')) || 'Keep writing authentic, specific content.');
  } else if (score < window.DESLOP_SCORING.THRESHOLDS[settings.sensitivity]) {
    suggestions.push((i18n && i18n.msg('checkerBorderlineSuggestion1')) || 'Your content is borderline but would pass the filter.');
    suggestions.push((i18n && i18n.msg('checkerBorderlineSuggestion2')) || 'Consider removing some buzzwords to be safer.');
    suggestions.push((i18n && i18n.msg('checkerBorderlineSuggestion3')) || 'Click on highlighted phrases in the preview for specific suggestions.');
  } else {
    suggestions.push((i18n && i18n.msg('checkerSlopSuggestion1')) || 'Your content would be flagged as slop and blocked.');
    suggestions.push((i18n && i18n.msg('checkerSlopSuggestion2')) || 'Click on any highlighted phrase above to see how to fix it.');

    if (matches.tier1.length > 0) {
      const tier1Examples = getTopMatchExamples(matches.tier1, 3);
      if (tier1Examples.length > 0) {
        suggestions.push(`Remove AI-specific phrases: ${tier1Examples.join(', ')}`);
      }
    }

    if (matches.tier2.length > 0 && settings.sensitivity >= 3) {
      const tier2Examples = getTopMatchExamples(matches.tier2, 3);
      if (tier2Examples.length > 0) {
        suggestions.push(`Cut corporate buzzwords: ${tier2Examples.join(', ')}`);
      }
    }

    if (matches.tier3.length > 0 && settings.sensitivity >= 4) {
      const tier3Examples = getTopMatchExamples(matches.tier3, 3);
      if (tier3Examples.length > 0) {
        suggestions.push(`Remove marketing spam: ${tier3Examples.join(', ')}`);
      }
    }

    if (matches.emoji.length > 0 && settings.blockEmojis) {
      suggestions.push((i18n && i18n.msg('checkerRemoveEmoji')) || 'Remove or reduce emoji usage, especially with buzzwords');
    }

    if (suggestions.length <= 2) {
      suggestions.push('Be more specific and less generic.');
      suggestions.push('Use concrete examples instead of abstract concepts.');
    }
  }

  content.innerHTML = suggestions.map(s => `<div class="suggestion-item">${s}</div>`).join('');
}

function getTopMatchExamples(tierMatches, limit) {
  const examples = [];
  const text = document.getElementById('textInput').value;

  for (const match of tierMatches.slice(0, limit)) {
    const regex = new RegExp(match.pattern, 'gi');
    const found = text.match(regex);
    if (found && found[0]) {
      let example = found[0].trim();
      if (example.length > 40) {
        example = example.substring(0, 37) + '...';
      }
      examples.push(`"${example}"`);
    }
  }

  return examples;
}

function clearText() {
  const placeholderMsg = (window.DESLOP_I18N && window.DESLOP_I18N.msg('checkerPreviewPlaceholder')) || 'Your content will appear here with slop phrases highlighted...';
  document.getElementById('textInput').value = '';
  document.getElementById('highlightedPreview').innerHTML = `<div class="placeholder-text">${placeholderMsg}</div>`;
  document.getElementById('results').style.display = 'none';
  document.getElementById('fixTooltip').style.display = 'none';
}
