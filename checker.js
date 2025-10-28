// De-Slop Interactive Checker - "Is My Post Slop?"

// Pattern definitions (same as content.js)
const PATTERNS = {
  tier1: [
    /\bdelve into\b/gi,
    /\bdelving into (the )?(intricacies|complexities)\b/gi,
    /\bnavigat(e|ing) (the|this) (complex )?(landscape|realm|world)\b/gi,
    /\bin (today's|the) (rapidly )?evolving (landscape|world|market|era)\b/gi,
    /\bembark on (a|this|your) journey\b/gi,
    /\btapestry of\b/gi,
    /\brealm of possibilities\b/gi,
    /\bultimately,? (the )?(choice|decision) is yours\b/gi,
    /\bmultifaceted (nature|approach|aspect)\b/gi,
    /\bholistic(ally)? (approach|perspective|view)\b/gi,
    /\bseamlessly integrat(e|ing|ed)\b/gi,
    /\bunlock (the potential|new possibilities|unprecedented)\b/gi,
    /\bgame-?chang(er|ing)\b/gi,
    /\bparadigm shift\b/gi,
    /\bgroundbreaking\b/gi,
    /\bunprecedented\b/gi,
    /\brobust (solution|framework|system|approach)\b/gi,
    /\bcomprehensive (guide|overview|analysis|approach)\b/gi,
    /\btransformative (power|potential|impact|insights)\b/gi,
    /\btreasure trove\b/gi,
    /\buncharted waters\b/gi,
    /\bdeep dive into\b/gi,
    /\bshed(ding)? light on\b/gi,
    /\bat the end of the day\b/gi,
    /\bin conclusion\b/gi,
    /\bin summary\b/gi,
    /\bmoving forward\b/gi,
    /\bkey takeaways?\b/gi,
    /\bSomething shifted\b/gi,
    /\bEverything changed\b/gi,
    /\bBut here's the thing\b/gi,
    /—.{10,100}—/g,
    // AI content mill phrases
    /\bbreakthrough(s)?\b/gi,
    /\bgiant leap\b/gi,
    /\bexciting (possibilities|advances|opportunities|future)\b/gi,
    /\bdazzling (pace|speed|rate)\b/gi,
    /\bthrilling time to be alive\b/gi,
    /\badvanced .{5,30} (technology|system|solution|method)\b/gi,
    /\bstunning (results|advances|breakthroughs|discoveries)\b/gi,
    /\breal[- ]world (impact|advances|applications|use)\b/gi,
    /\bpositioning .{5,30} as game[- ]changer/gi,
    /\bpace is accelerat(ing|ed)\b/gi,
    /\bcould soon become\b/gi,
    /\bopens .{5,30} possibilities\b/gi,
    /\breignites? debates? about\b/gi,
    /\bneed for new (regulations|laws|rules|policies)\b/gi,
    /\brewriting (history|the books)\b/gi,
    /\bprompting new questions about\b/gi,
    /\bit'?s clear that\b/gi,
    /\btruly (is|are) a .{5,30} time\b/gi,
    /\bwhether it'?s .{10,50} or .{10,50}, it\b/gi,
    /\bfrom .{5,30} to .{5,30}, (it|this|these)\b/gi,
    /\bIntroducing .{5,30}, the (first|next|future)\b/gi,
    /\bImagine .{10,50} — that'?s\b/gi,
    /\bFor (decades|years), .{10,50} seemed like\b/gi,
    /\bin 20\d{2}, it'?s\b/gi,
    /\bNot all .{5,30} discoveries are\b/gi,
    /\bscience fiction .{5,30} but in 20\d{2}\b/gi,

    // Marketing engagement stop words - posts starting with these are slop
    /^(I'm|I am) (so |very )?(excited|thrilled|proud|happy|delighted|pleased|honored|grateful|blessed) to (announce|share|reveal|tell you|introduce)/gim,
    /^(Can't|Cannot) wait to (share|tell you|announce|reveal)/gim,
    /^(Big|Exciting|Great|Amazing) news[!:]/gim,
    /^Just launched/gim,
    /^(Today|This week|This month) (I'm|I am|we're|we are) (announcing|launching|releasing|sharing|excited to)/gim,
    /^Excited to (share|announce|reveal|tell you|introduce)/gim,
    /^Thrilled to (share|announce|reveal|tell you|introduce)/gim,
    /^Proud to (share|announce|reveal|tell you|introduce)/gim,
    /^Happy to (share|announce|reveal|tell you|introduce)/gim,
    /^Delighted to (share|announce|reveal|tell you|introduce)/gim,
    /^Honored to (share|announce|reveal|tell you|introduce)/gim,
    /^Grateful to (share|announce|reveal|tell you|introduce)/gim,
    /^Blessed to (share|announce|reveal|tell you|introduce)/gim,
    /^Guess what[!?]/gim,
    /^You('re| are) not going to believe/gim,
    /^(Check out|Take a look at|Don't miss) (this|what)/gim,
    /^(Major|Huge) announcement[!:]/gim,
    /^(Finally|At last)[,!]/gim,
    /^(Hot|Breaking) (take|news)[!:]/gim,

    // Em dash usage - instant slop tell
    /—/g
  ],
  tier2: [
    /\bsynergy\b/gi,
    /\bleverage\b/gi,
    /\bcircle back\b/gi,
    /\blow[- ]hanging fruit\b/gi,
    /\bmove the needle\b/gi,
    /\bthink outside the box\b/gi,
    /\btouch base\b/gi,
    /\btake (it|this) offline\b/gi,
    /\bpivot\b/gi,
    /\bdisrupt(ive)?\b/gi,
    /\bagile\b/gi,
    /\bbandwidth\b/gi,
    /\bstakeholders?\b/gi,
    /\bvalue[- ]add\b/gi,
    /\bthought leader(ship)?\b/gi,
    /\bbest practices?\b/gi,
    /\bblue[- ]sky thinking\b/gi,
    /\bdrink the kool[- ]aid\b/gi,
    /\bhigh[- ]level\b/gi,
    /\b30,?000[- ]foot view\b/gi,
    /\bideate\b/gi,
    /\boperationalize\b/gi,
    /\bsocialize\b/gi,
    /\brock ?star\b/gi,
    /\bninja\b/gi,
    /\bguru\b/gi,
    /\bbig data\b/gi,
    /\bdigital transformation\b/gi,
    /\bAI[- ]powered\b/gi,
    /\bcloud[- ]based\b/gi,
    /\bdata[- ]driven\b/gi,
    /\bROI\b/gi,
    /\bKPI\b/gi,
    /\bdeep dive\b/gi,
    /\bdeliverables?\b/gi,
    /\bempower(ment)?\b/gi,
    /\boptimize\b/gi,
    /\bstreamline\b/gi
  ],
  tier3: [
    /\bfree\b/gi,
    /\bguaranteed\b/gi,
    /\bamazing\b/gi,
    /\bincredible\b/gi,
    /\bunbelievable\b/gi,
    /\bmind[- ]blowing\b/gi,
    /\brevolutionary\b/gi,
    /\bmiracle\b/gi,
    /\bbest[- ]in[- ]class\b/gi,
    /\bclick here\b/gi,
    /\bbuy now\b/gi,
    /\bact (now|immediately)\b/gi,
    /\blimited time offer\b/gi,
    /\bdon't wait\b/gi,
    /\bonce in a lifetime\b/gi,
    /\bno strings attached\b/gi,
    /\brisk[- ]free\b/gi,
    /\bmake money\b/gi,
    /\bearn money\b/gi,
    /\bproven results\b/gi,
    /\bspecial promotion\b/gi,
    /\bsave big\b/gi,
    /\blowest price\b/gi,
    /\bbest (deal|price|offer)\b/gi,
    /\bfree consultation\b/gi,
    /\bmust[- ]have\b/gi,
    /\bnext[- ]level\b/gi,
    /\braise(d)? the bar\b/gi,
    /\bstand out from the crowd\b/gi,
    /\bcontent is king\b/gi,
    /\bhit the ground running\b/gi,
    /\bin a nutshell\b/gi,
    /\bbasically\b/gi,
    /\bessentially\b/gi,
    /\bactually\b/gi
  ],
  emoji: [
    /[\u{1F300}-\u{1F9FF}][\s]*Revolutioniz(e|ing)/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Transform(ing|ative)/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Innovati(ng|on|ve)/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Disrupt(ing|ive)/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Game[- ]changer/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Unlock(ing)? the/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Navigating the/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Building the future/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Proud to (announce|share)/giu,
    /[\u{1F300}-\u{1F9FF}][\s]*Thrilled to/giu,
    /[\u{1F300}-\u{1F9FF}].{0,30}[\u{1F300}-\u{1F9FF}].{0,30}[\u{1F300}-\u{1F9FF}]/giu,
    /^[\u{1F300}-\u{1F9FF}][\s]*/gmu,
    /\.[\s]*[\u{1F300}-\u{1F9FF}][\s]*/gmu
  ]
};

const THRESHOLDS = {
  1: 15,
  2: 12,
  3: 9,
  4: 6,
  5: 4
};

// Suggestion map for common slop phrases
const SUGGESTIONS = {
  'delve into': 'Try: "explore", "examine", or just be specific about what you\'re doing',
  'navigate the landscape': 'Be specific: What actual situation or field are you referring to?',
  'paradigm shift': 'Use concrete terms: What specifically changed?',
  'game-changer': 'Explain why it matters instead of using buzzwords',
  'transformative': 'Describe the actual transformation',
  'leverage': 'Try: "use", "apply", or "take advantage of"',
  'synergy': 'Explain the actual collaboration or benefit',
  'circle back': 'Say: "follow up", "return to", or "revisit"',
  'deep dive': 'Say: "detailed analysis" or "thorough examination"',
  'unlock': 'Be specific about what becomes possible',
  'seamlessly': 'Show how it integrates instead of claiming it does',
  'robust': 'Describe the actual features or strengths',
  'comprehensive': 'List what it covers',
  'holistic': 'Explain how you\'re considering all aspects',
  'disruptive': 'Explain what it changes and how',
  'innovative': 'Describe what\'s new about it',
  'breakthrough': 'Explain what barrier was overcome',
  'revolutionary': 'Describe the actual impact',
  'amazing': 'Use specific, measurable descriptors',
  'incredible': 'Provide concrete details',
  'unprecedented': 'If true, explain what makes it unique',
  'thrilling time to be alive': 'Be specific about the advancement you\'re discussing',
  // Stop-word patterns
  'excited to announce': 'Skip the marketing fluff. Just state what you\'re announcing directly.',
  'thrilled to share': 'Get to the point. Share the actual information without the preamble.',
  'proud to announce': 'Drop the self-congratulation. Let the content speak for itself.',
  'happy to share': 'Remove this empty opener. Start with the actual content.',
  'big news': 'Don\'t hype it. If it\'s actually important, explain why.',
  'exciting news': 'Skip the editorial. Just share the information.',
  'just launched': 'State what you launched and why it matters, without the announcement fanfare.',
  'guess what': 'Don\'t make people guess. State your point directly.',
  'check out': 'Describe what it is and why it matters, don\'t just ask for engagement.',
  'can\'t wait to share': 'Then share it. Don\'t pad with artificial excitement.',
  '—': 'Em dashes are a telltale sign of AI-generated or overly dramatic content. Use simple punctuation instead.'
};

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
  setupEventListeners();
  updateMarkdownToggle();
});

async function loadSettings() {
  const stored = await chrome.storage.sync.get({
    sensitivity: 3,
    blockEmojis: false,
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
  const tooltipClose = tooltip.querySelector('.tooltip-close');

  // Live analysis on input (debounced)
  textInput.addEventListener('input', () => {
    clearTimeout(analysisTimeout);
    analysisTimeout = setTimeout(() => {
      analyzeAndHighlight();
    }, 500); // 500ms debounce
  });

  clearBtn.addEventListener('click', clearText);
  backBtn.addEventListener('click', () => window.close());

  // Markdown toggle
  markdownToggle.addEventListener('click', async () => {
    settings.renderMarkdown = !settings.renderMarkdown;
    await chrome.storage.sync.set({ renderMarkdown: settings.renderMarkdown });
    updateMarkdownToggle();
    analyzeAndHighlight(); // Re-render with new mode
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

  if (!text.trim()) {
    // Show placeholder
    document.getElementById('highlightedPreview').innerHTML = '<div class="placeholder-text">Your content will appear here with slop phrases highlighted...</div>';
    document.getElementById('results').style.display = 'none';
    return;
  }

  // Score the text
  const result = scoreText(text);
  currentMatches = collectAllMatches(text, result.matches);

  // Highlight in preview
  highlightText(text, currentMatches);

  // Update results
  displayResults(result);
}

function scoreText(text) {
  let score = 0;
  const matches = {
    tier1: [],
    tier2: [],
    tier3: [],
    emoji: []
  };

  // Tier 1 - Always active (3 points each)
  for (const pattern of PATTERNS.tier1) {
    const found = text.match(pattern);
    if (found) {
      matches.tier1.push({ pattern: pattern.source, count: found.length, points: found.length * 3 });
      score += found.length * 3;
    }
  }

  // Tier 2 - Active at sensitivity 3+ (2 points each)
  if (settings.sensitivity >= 3) {
    for (const pattern of PATTERNS.tier2) {
      const found = text.match(pattern);
      if (found) {
        matches.tier2.push({ pattern: pattern.source, count: found.length, points: found.length * 2 });
        score += found.length * 2;
      }
    }
  }

  // Tier 3 - Active at sensitivity 4+ (1 point each)
  if (settings.sensitivity >= 4) {
    for (const pattern of PATTERNS.tier3) {
      const found = text.match(pattern);
      if (found) {
        matches.tier3.push({ pattern: pattern.source, count: found.length, points: found.length * 1 });
        score += found.length * 1;
      }
    }
  }

  // Emoji patterns if enabled (5 points each)
  if (settings.blockEmojis) {
    for (const pattern of PATTERNS.emoji) {
      const found = text.match(pattern);
      if (found) {
        matches.emoji.push({ pattern: pattern.source, count: found.length, points: found.length * 5 });
        score += found.length * 5;
      }
    }
  }

  return { score, matches };
}

function collectAllMatches(text, matches) {
  const allMatches = [];

  // Helper to add matches with position
  const addMatches = (tier, patterns) => {
    for (const pattern of patterns) {
      const regex = new RegExp(pattern.source, pattern.flags);
      let match;
      while ((match = regex.exec(text)) !== null) {
        allMatches.push({
          text: match[0],
          start: match.index,
          end: match.index + match[0].length,
          tier: tier
        });
      }
    }
  };

  // Collect all matches with positions
  addMatches('tier1', PATTERNS.tier1);
  if (settings.sensitivity >= 3) {
    addMatches('tier2', PATTERNS.tier2);
  }
  if (settings.sensitivity >= 4) {
    addMatches('tier3', PATTERNS.tier3);
  }
  if (settings.blockEmojis) {
    addMatches('emoji', PATTERNS.emoji);
  }

  // Sort by position and remove overlaps
  allMatches.sort((a, b) => a.start - b.start);

  // Remove overlapping matches (keep first)
  const filtered = [];
  let lastEnd = -1;
  for (const match of allMatches) {
    if (match.start >= lastEnd) {
      filtered.push(match);
      lastEnd = match.end;
    }
  }

  return filtered;
}

function highlightText(text, matches) {
  const preview = document.getElementById('highlightedPreview');

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
    // For markdown mode: replace matches with placeholders, render markdown, then restore highlights
    const placeholders = [];
    let textWithPlaceholders = text;
    let offset = 0;

    // Sort matches by position
    const sortedMatches = [...matches].sort((a, b) => a.start - b.start);

    sortedMatches.forEach((match, idx) => {
      // Use ⟪SLOP0⟫ format with Unicode angle brackets - won't be touched by markdown
      const placeholder = `⟪SLOP${idx}⟫`;
      placeholders.push({
        placeholder,
        match,
        idx
      });

      const adjustedStart = match.start + offset;
      const adjustedEnd = match.end + offset;

      textWithPlaceholders =
        textWithPlaceholders.substring(0, adjustedStart) +
        placeholder +
        textWithPlaceholders.substring(adjustedEnd);

      offset += placeholder.length - (match.end - match.start);
    });

    // Render markdown with placeholders
    html = renderMarkdown(textWithPlaceholders);

    // Replace placeholders with actual highlight spans
    placeholders.forEach(({ placeholder, match, idx }) => {
      const highlightHtml = `<span class="slop-highlight ${match.tier}" data-match-idx="${idx}">${escapeHtml(match.text)}</span>`;
      html = html.replace(new RegExp(escapeRegExp(placeholder), 'g'), highlightHtml);
    });
  } else {
    // Plain text mode: simple concatenation
    html = '';
    let lastIndex = 0;

    matches.forEach((match, idx) => {
      html += escapeHtml(text.substring(lastIndex, match.start));
      html += `<span class="slop-highlight ${match.tier}" data-match-idx="${idx}">${escapeHtml(match.text)}</span>`;
      lastIndex = match.end;
    });

    html += escapeHtml(text.substring(lastIndex));
  }

  preview.innerHTML = html;

  // Add click handlers to highlights
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

  // Escape HTML first
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Headers (must be at start of line)
  html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');
  html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
  html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr>');
  html = html.replace(/^\*\*\*$/gm, '<hr>');

  // Blockquotes
  html = html.replace(/^&gt;\s?(.+)$/gm, '<blockquote>$1</blockquote>');

  // Code blocks (```)
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');

  // Links [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

  // Images ![alt](url)
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');

  // Unordered lists
  html = html.replace(/^\*\s+(.+)$/gm, '<li>$1</li>');
  html = html.replace(/^-\s+(.+)$/gm, '<li>$1</li>');

  // Ordered lists
  html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');

  // Wrap consecutive <li> in <ul> or <ol>
  html = html.replace(/(<li>.+<\/li>\n?)+/g, (match) => {
    return `<ul>${match}</ul>`;
  });

  // Paragraphs (wrap text not in other tags)
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

  // Find suggestion
  const matchLower = match.text.toLowerCase().trim();
  let suggestion = SUGGESTIONS[matchLower] || getSuggestionForTier(match.tier);

  phraseEl.textContent = `"${match.text}"`;
  suggestionEl.innerHTML = `<strong>SUGGESTION:</strong>${suggestion}`;

  // Position tooltip near the element
  const rect = element.getBoundingClientRect();
  tooltip.style.display = 'block';
  tooltip.style.left = `${rect.left}px`;
  tooltip.style.top = `${rect.bottom + 10}px`;

  // Adjust if goes off screen
  const tooltipRect = tooltip.getBoundingClientRect();
  if (tooltipRect.right > window.innerWidth) {
    tooltip.style.left = `${window.innerWidth - tooltipRect.width - 20}px`;
  }
  if (tooltipRect.bottom > window.innerHeight) {
    tooltip.style.top = `${rect.top - tooltipRect.height - 10}px`;
  }
}

function getSuggestionForTier(tier) {
  switch (tier) {
    case 'tier1':
      return 'This is AI-generated slop language. Be specific and authentic instead of using generic phrases.';
    case 'tier2':
      return 'This is corporate buzzword jargon. Use plain language to describe what you actually mean.';
    case 'tier3':
      return 'This is marketing spam language. Remove hype and be factual.';
    case 'emoji':
      return 'Excessive emoji usage combined with buzzwords signals low-quality content. Use emojis sparingly if at all.';
    default:
      return 'Consider rewriting this phrase to be more specific and less generic.';
  }
}

function displayResults(result) {
  const resultsSection = document.getElementById('results');
  const scoreValue = document.getElementById('scoreValue');
  const scoreStatus = document.getElementById('scoreStatus');

  resultsSection.style.display = 'block';
  scoreValue.textContent = result.score;

  // Determine status
  const threshold = THRESHOLDS[settings.sensitivity];
  let status, statusClass;

  if (result.score === 0) {
    status = '✓ CLEAN - No slop detected';
    statusClass = 'safe';
  } else if (result.score < threshold) {
    status = '⚠ BORDERLINE - Close but passes';
    statusClass = 'warning';
  } else {
    status = '✗ SLOP DETECTED - Would be blocked';
    statusClass = 'danger';
  }

  scoreValue.className = `score-value ${statusClass}`;
  scoreStatus.className = `score-status ${statusClass}`;
  scoreStatus.textContent = status;

  // Update thresholds
  updateThresholds(result.score);

  // Show breakdown
  showBreakdown(result.matches);

  // Show matches
  showMatches(result.matches);

  // Show suggestions
  showSuggestions(result.score, result.matches);
}

function updateThresholds(score) {
  for (let i = 1; i <= 5; i++) {
    const threshold = THRESHOLDS[i];
    const elem = document.getElementById(`thresh${i}`);

    if (score >= threshold) {
      elem.textContent = '✗ BLOCKED';
      elem.className = 'status-indicator block';
    } else {
      elem.textContent = '✓ PASS';
      elem.className = 'status-indicator pass';
    }
  }
}

function showBreakdown(matches) {
  const content = document.getElementById('breakdownContent');
  const tier1Score = matches.tier1.reduce((sum, m) => sum + m.points, 0);
  const tier2Score = matches.tier2.reduce((sum, m) => sum + m.points, 0);
  const tier3Score = matches.tier3.reduce((sum, m) => sum + m.points, 0);
  const emojiScore = matches.emoji.reduce((sum, m) => sum + m.points, 0);

  content.innerHTML = `
    <div class="breakdown-item">
      <span class="breakdown-tier">Tier 1 (AI Slop) - 3pts each:</span>
      <span class="breakdown-score">${tier1Score} pts</span>
    </div>
    <div class="breakdown-item">
      <span class="breakdown-tier">Tier 2 (Corporate) - 2pts each:</span>
      <span class="breakdown-score">${tier2Score} pts ${settings.sensitivity < 3 ? '(inactive)' : ''}</span>
    </div>
    <div class="breakdown-item">
      <span class="breakdown-tier">Tier 3 (Marketing) - 1pt each:</span>
      <span class="breakdown-score">${tier3Score} pts ${settings.sensitivity < 4 ? '(inactive)' : ''}</span>
    </div>
    <div class="breakdown-item">
      <span class="breakdown-tier">Emoji Slop - 5pts each:</span>
      <span class="breakdown-score">${emojiScore} pts ${!settings.blockEmojis ? '(disabled)' : ''}</span>
    </div>
  `;
}

function showMatches(matches) {
  const section = document.getElementById('matches');
  const content = document.getElementById('matchesContent');

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
      <div class="match-pattern">${formatPattern(m.pattern)}</div>
      <div class="match-count">${m.count} match${m.count > 1 ? 'es' : ''} × ${m.points / m.count}pts = ${m.points}pts</div>
    </div>
  `).join('');
}

function showSuggestions(score, matches) {
  const content = document.getElementById('suggestionsContent');
  const suggestions = [];

  if (score === 0) {
    suggestions.push('Your content looks clean! No slop patterns detected.');
    suggestions.push('Keep writing authentic, specific content.');
  } else if (score < THRESHOLDS[settings.sensitivity]) {
    suggestions.push('Your content is borderline but would pass the filter.');
    suggestions.push('Consider removing some buzzwords to be safer.');
    suggestions.push('Click on highlighted phrases in the preview for specific suggestions.');
  } else {
    suggestions.push('Your content would be flagged as slop and blocked.');
    suggestions.push('Click on any highlighted phrase above to see how to fix it.');

    // Get top 3 actual phrases from each active tier
    const topPhrases = [];

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
      suggestions.push('Remove or reduce emoji usage, especially with buzzwords');
    }

    // Only add generic suggestions if we didn't get specific ones
    if (suggestions.length <= 2) {
      suggestions.push('Be more specific and less generic.');
      suggestions.push('Use concrete examples instead of abstract concepts.');
    }
  }

  content.innerHTML = suggestions.map(s => `<div class="suggestion-item">${s}</div>`).join('');
}

// Helper to extract actual matched phrases from patterns
function getTopMatchExamples(tierMatches, limit) {
  const examples = [];
  const text = document.getElementById('textInput').value;

  for (const match of tierMatches.slice(0, limit)) {
    const regex = new RegExp(match.pattern, 'gi');
    const found = text.match(regex);
    if (found && found[0]) {
      // Clean up and shorten the match for display
      let example = found[0].trim();
      if (example.length > 40) {
        example = example.substring(0, 37) + '...';
      }
      examples.push(`"${example}"`);
    }
  }

  return examples;
}

function formatPattern(pattern) {
  // Clean up regex pattern for display
  let cleaned = pattern
    // Remove word boundaries
    .replace(/\\b/gi, '')
    // Remove escaped characters but keep the character
    .replace(/\\([^bsdwnu])/g, '$1')
    // Clean up character classes
    .replace(/\[\\s\]\*/g, ' ')
    .replace(/\[\\s\]/g, ' ')
    // Replace unicode ranges with readable text
    .replace(/\[\\u\{[^}]+\}-\\u\{[^}]+\}\]/gi, '[emoji]')
    .replace(/\\u\{[^}]+\}/gi, '[emoji]')
    // Replace common regex syntax
    .replace(/\{(\d+),(\d+)\}/g, '')
    .replace(/\{(\d+),\}/g, '')
    .replace(/\|/g, ' or ')
    .replace(/\.\*/g, '...')
    // Clean up remaining backslashes for common escapes
    .replace(/\\\[/g, '[')
    .replace(/\\\]/g, ']')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\\?/g, '?')
    .replace(/\\\'/g, "'")
    // Remove quantifiers
    .replace(/[\+\*]\?/g, '')
    // Trim and limit length
    .trim();

  if (cleaned.length > 100) {
    cleaned = cleaned.substring(0, 97) + '...';
  }

  return cleaned;
}

function clearText() {
  document.getElementById('textInput').value = '';
  document.getElementById('highlightedPreview').innerHTML = '<div class="placeholder-text">Your content will appear here with slop phrases highlighted...</div>';
  document.getElementById('results').style.display = 'none';
  document.getElementById('fixTooltip').style.display = 'none';
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
