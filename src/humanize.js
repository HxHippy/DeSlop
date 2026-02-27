// De-Slop Humanize Score
// Analyzes text across 8 writing quality metrics and produces an Authenticity Score.

'use strict';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const METRIC_WEIGHTS = {
  sentenceVariety:  1.0,
  activeVoice:      1.5,
  avgLength:        1.0,
  vocabulary:       1.5,
  repetition:       1.0,
  readingLevel:     1.0,
  paragraphVariety: 0.5,
  slop:             2.5
};

const TOTAL_WEIGHT = Object.values(METRIC_WEIGHTS).reduce((a, b) => a + b, 0);

// Top ~100 common English stop words excluded from repetition analysis
const STOP_WORDS = new Set([
  'the','be','to','of','and','a','in','that','have','i','it','for','not','on',
  'with','he','as','you','do','at','this','but','his','by','from','they','we',
  'her','she','or','an','will','my','one','all','would','there','their','what',
  'so','up','out','if','about','who','get','which','go','me','when','make',
  'can','like','time','no','just','him','know','take','people','into','year',
  'your','good','some','could','them','see','other','than','then','now','look',
  'only','come','its','over','think','also','back','after','use','two','how',
  'our','work','first','well','way','even','new','want','because','any','these',
  'give','day','most','us','been','was','were','are','is','had','has','did',
  'said','may','more','very','am','an','each','much','where','those','both',
  'through','during','before','between','such','own','same','than','too','very',
  'just','should','now','here','down','still','few','under','since','while',
  'never','always','however','though','although','yet','must','might','shall'
]);

// Passive voice indicator patterns: auxiliary + past participle forms
// Detects patterns like "was created", "were taken", "is known", "been done", etc.
const PASSIVE_PATTERNS = [
  /\b(?:was|were|is|are|been|being|be|am)\s+\w+(?:ed|en|t)\b/gi
];

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

let PATTERNS = null;
let settings = { sensitivity: 3, blockEmojis: false, blockStopWords: true, blockEmDashes: true };
let currentLang = 'en';
let lastMetrics = null;

// ---------------------------------------------------------------------------
// Initialisation
// ---------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', async () => {
  const stored = await chrome.storage.sync.get({
    sensitivity: 3,
    blockEmojis: false,
    blockStopWords: true,
    blockEmDashes: true,
    patternLanguage: 'auto'
  });
  settings.sensitivity = stored.sensitivity;
  settings.blockEmojis = stored.blockEmojis;
  settings.blockStopWords = stored.blockStopWords;
  settings.blockEmDashes = stored.blockEmDashes;

  // Resolve language
  const langPref = stored.patternLanguage;
  if (langPref && langPref !== 'auto') {
    currentLang = langPref;
  } else {
    // Try to infer from browser locale
    const browserLang = (navigator.language || 'en').split('-')[0].toLowerCase();
    const supported = window.DESLOP_LANGUAGES || {};
    currentLang = supported[browserLang] ? browserLang : 'en';
  }

  // Load slop patterns
  if (window.DESLOP_SCORING) {
    PATTERNS = window.DESLOP_SCORING.loadPatterns(currentLang);
  }

  // Initialize i18n
  if (window.DESLOP_I18N) {
    await window.DESLOP_I18N.init(langPref);
    window.DESLOP_I18N.applyTranslations();
  }

  // Show language notice for non-English
  if (currentLang !== 'en') {
    document.getElementById('languageNotice').style.display = 'flex';
  }

  setupEventListeners();
});

// ---------------------------------------------------------------------------
// Event listeners
// ---------------------------------------------------------------------------

function setupEventListeners() {
  const textInput  = document.getElementById('textInput');
  const analyzeBtn = document.getElementById('analyzeBtn');
  const clearBtn   = document.getElementById('clearBtn');
  const backBtn    = document.getElementById('backBtn');

  textInput.addEventListener('input', updateWordCount);
  analyzeBtn.addEventListener('click', runAnalysis);
  clearBtn.addEventListener('click', clearAll);
  backBtn.addEventListener('click', () => window.close());

  // Also allow Ctrl+Enter to trigger analysis
  textInput.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      runAnalysis();
    }
  });
}

function updateWordCount() {
  const text = document.getElementById('textInput').value;
  const words = countWords(text);
  const el = document.getElementById('charCount');
  el.textContent = `${words} word${words !== 1 ? 's' : ''}`;
}

function clearAll() {
  document.getElementById('textInput').value = '';
  document.getElementById('charCount').textContent = '0 words';
  document.getElementById('resultsSection').style.display = 'none';
  lastMetrics = null;
}

// ---------------------------------------------------------------------------
// Analysis orchestration
// ---------------------------------------------------------------------------

function runAnalysis() {
  const text = document.getElementById('textInput').value.trim();
  if (!text) return;

  const metrics = computeAllMetrics(text);
  lastMetrics = metrics;

  const authenticityScore = computeAuthenticityScore(metrics);

  renderGauge(authenticityScore);
  renderMetrics(metrics);
  renderTips(metrics, text);

  document.getElementById('resultsSection').style.display = 'block';
  document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ---------------------------------------------------------------------------
// Metric computation
// ---------------------------------------------------------------------------

/**
 * Compute all 8 metrics from the given text.
 * Returns an object keyed by metric name, each value being { score, meta }.
 */
function computeAllMetrics(text) {
  const sentences   = splitSentences(text);
  const paragraphs  = splitParagraphs(text);
  const words       = tokenizeWords(text);

  return {
    sentenceVariety:  scoreSentenceVariety(sentences),
    activeVoice:      scoreActiveVoice(sentences),
    avgLength:        scoreAvgSentenceLength(sentences),
    vocabulary:       scoreVocabularyDiversity(words),
    repetition:       scoreRepetition(words),
    readingLevel:     scoreReadingLevel(sentences, words),
    paragraphVariety: scoreParagraphVariety(paragraphs),
    slop:             scoreSlopMetric(text)
  };
}

/**
 * Weighted average of all metric scores, scaled to 0-100.
 */
function computeAuthenticityScore(metrics) {
  let weightedSum = 0;
  for (const [key, weight] of Object.entries(METRIC_WEIGHTS)) {
    weightedSum += (metrics[key].score / 10) * weight;
  }
  const raw = (weightedSum / TOTAL_WEIGHT) * 100;
  return Math.round(Math.min(100, Math.max(0, raw)));
}

// ---------------------------------------------------------------------------
// Metric 1: Sentence Variety
// ---------------------------------------------------------------------------

/**
 * Categorize sentences as short (<8 words), medium (8-20), long (>20).
 * Perfect even distribution across all three categories scores 10.
 */
function scoreSentenceVariety(sentences) {
  if (sentences.length < 3) {
    return { score: 5, meta: { short: sentences.length, medium: 0, long: 0, total: sentences.length } };
  }

  let short = 0, medium = 0, long = 0;
  for (const s of sentences) {
    const wc = s.split(/\s+/).filter(Boolean).length;
    if (wc < 8)        short++;
    else if (wc <= 20) medium++;
    else               long++;
  }

  const total = sentences.length;
  const ideal = total / 3;

  // Mean absolute deviation from the ideal even split, normalized
  const deviation = (Math.abs(short - ideal) + Math.abs(medium - ideal) + Math.abs(long - ideal)) / (2 * total);
  // deviation of 0 = perfect, deviation of 1 = worst case
  const score = Math.round(Math.max(0, 10 * (1 - deviation)));

  return { score, meta: { short, medium, long, total } };
}

// ---------------------------------------------------------------------------
// Metric 2: Active Voice Usage
// ---------------------------------------------------------------------------

/**
 * Detect passive constructions. Score reflects the proportion of active sentences.
 */
function scoreActiveVoice(sentences) {
  if (sentences.length === 0) return { score: 5, meta: { passive: 0, total: 0, pct: 100 } };

  let passiveCount = 0;

  for (const sentence of sentences) {
    for (const pattern of PASSIVE_PATTERNS) {
      // Reset lastIndex for global regexes
      const re = new RegExp(pattern.source, pattern.flags);
      if (re.test(sentence)) {
        passiveCount++;
        break; // only count once per sentence
      }
    }
  }

  const total = sentences.length;
  const activePct = ((total - passiveCount) / total) * 100;

  // 100% active => 10, 50% active => 2, linear interpolation
  let score;
  if (activePct >= 100) score = 10;
  else if (activePct <= 50) score = Math.round((activePct / 50) * 2);
  else score = Math.round(2 + ((activePct - 50) / 50) * 8);

  return { score, meta: { passive: passiveCount, total, pct: Math.round(activePct) } };
}

// ---------------------------------------------------------------------------
// Metric 3: Average Sentence Length
// ---------------------------------------------------------------------------

/**
 * Ideal is 15-20 words per sentence. Score drops as average moves away.
 */
function scoreAvgSentenceLength(sentences) {
  if (sentences.length === 0) return { score: 5, meta: { avg: 0, tooShort: false, tooLong: false } };

  const lengths = sentences.map(s => s.split(/\s+/).filter(Boolean).length);
  const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;

  let score;
  let tooShort = false;
  let tooLong  = false;

  if (avg >= 15 && avg <= 20) {
    score = 10;
  } else if (avg < 8) {
    score = Math.round((avg / 8) * 2);
    tooShort = true;
  } else if (avg > 30) {
    score = Math.round(Math.max(0, 2 - ((avg - 30) / 10)));
    tooLong = true;
  } else if (avg < 15) {
    // 8 to 15: linear from 2 to 10
    score = Math.round(2 + ((avg - 8) / 7) * 8);
    tooShort = avg < 10;
  } else {
    // 20 to 30: linear from 10 to 2
    score = Math.round(10 - ((avg - 20) / 10) * 8);
    tooLong = avg > 25;
  }

  score = Math.min(10, Math.max(0, score));
  return { score, meta: { avg: Math.round(avg * 10) / 10, tooShort, tooLong } };
}

// ---------------------------------------------------------------------------
// Metric 4: Vocabulary Diversity
// ---------------------------------------------------------------------------

/**
 * Type-token ratio (unique words / total words), scaled to 0-10.
 * TTR > 0.7 => 10, TTR < 0.3 => 0-2.
 */
function scoreVocabularyDiversity(words) {
  if (words.length < 5) return { score: 5, meta: { unique: 0, total: 0, ttr: 0 } };

  const unique = new Set(words).size;
  const total  = words.length;
  const ttr    = unique / total;

  let score;
  if (ttr >= 0.7)      score = 10;
  else if (ttr <= 0.3) score = Math.round((ttr / 0.3) * 2);
  else                 score = Math.round(2 + ((ttr - 0.3) / 0.4) * 8);

  score = Math.min(10, Math.max(0, score));
  return { score, meta: { unique, total, ttr: Math.round(ttr * 100) / 100 } };
}

// ---------------------------------------------------------------------------
// Metric 5: Repetition Score
// ---------------------------------------------------------------------------

/**
 * Find the most repeated non-stop-word.
 * If max repetition rate < 1% => 10, > 5% => 0-2. Scale between.
 */
function scoreRepetition(words) {
  if (words.length < 10) return { score: 8, meta: { topWord: null, topCount: 0, rate: 0 } };

  const freq = {};
  for (const w of words) {
    if (!STOP_WORDS.has(w) && w.length > 2) {
      freq[w] = (freq[w] || 0) + 1;
    }
  }

  const entries = Object.entries(freq);
  if (entries.length === 0) return { score: 8, meta: { topWord: null, topCount: 0, rate: 0 } };

  entries.sort((a, b) => b[1] - a[1]);
  const [topWord, topCount] = entries[0];
  const rate = (topCount / words.length) * 100;

  let score;
  if (rate < 1)      score = 10;
  else if (rate >= 5) score = Math.round(Math.max(0, 2 - ((rate - 5) / 5) * 2));
  else               score = Math.round(10 - ((rate - 1) / 4) * 8);

  score = Math.min(10, Math.max(0, score));
  return { score, meta: { topWord, topCount, rate: Math.round(rate * 10) / 10 } };
}

// ---------------------------------------------------------------------------
// Metric 6: Reading Level
// ---------------------------------------------------------------------------

/**
 * Flesch-Kincaid grade level approximation.
 * Ideal grade 8-12 => score 10. Very high (>16) or low (<4) => 0-3.
 */
function scoreReadingLevel(sentences, words) {
  if (sentences.length === 0 || words.length === 0) {
    return { score: 5, meta: { grade: 0, tooHard: false, tooEasy: false } };
  }

  const syllableCount = words.reduce((sum, w) => sum + countSyllables(w), 0);
  const avgSyllables  = syllableCount / words.length;
  const avgWords      = words.length / sentences.length;

  // Flesch-Kincaid Grade Level formula
  const grade = (0.39 * avgWords) + (11.8 * avgSyllables) - 15.59;
  const clampedGrade = Math.max(0, grade);

  let score;
  let tooHard  = false;
  let tooEasy  = false;

  if (clampedGrade >= 8 && clampedGrade <= 12) {
    score = 10;
  } else if (clampedGrade < 4) {
    score = Math.round(Math.max(0, (clampedGrade / 4) * 3));
    tooEasy = true;
  } else if (clampedGrade > 16) {
    score = Math.round(Math.max(0, 3 - ((clampedGrade - 16) / 8) * 3));
    tooHard = true;
  } else if (clampedGrade < 8) {
    // 4-8: linear 3 to 10
    score = Math.round(3 + ((clampedGrade - 4) / 4) * 7);
    tooEasy = clampedGrade < 5;
  } else {
    // 12-16: linear 10 to 3
    score = Math.round(10 - ((clampedGrade - 12) / 4) * 7);
    tooHard = clampedGrade > 15;
  }

  score = Math.min(10, Math.max(0, score));
  return { score, meta: { grade: Math.round(clampedGrade * 10) / 10, tooHard, tooEasy } };
}

// ---------------------------------------------------------------------------
// Metric 7: Paragraph Variety
// ---------------------------------------------------------------------------

/**
 * Standard deviation of paragraph word counts.
 * High std dev = good variety. All same = low score. Single giant paragraph = 0.
 */
function scoreParagraphVariety(paragraphs) {
  if (paragraphs.length <= 1) {
    return { score: paragraphs.length === 0 ? 0 : 2, meta: { count: paragraphs.length, stdDev: 0 } };
  }

  const lengths = paragraphs.map(p => p.split(/\s+/).filter(Boolean).length);
  const mean    = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance = lengths.reduce((sum, l) => sum + Math.pow(l - mean, 2), 0) / lengths.length;
  const stdDev  = Math.sqrt(variance);

  // Normalised to mean to get coefficient of variation
  const cv = mean > 0 ? stdDev / mean : 0;

  let score;
  if (cv >= 0.6)      score = 10;  // high variety
  else if (cv >= 0.3) score = Math.round(7 + ((cv - 0.3) / 0.3) * 3);
  else if (cv >= 0.1) score = Math.round(4 + ((cv - 0.1) / 0.2) * 3);
  else               score = Math.round(cv / 0.1 * 4);

  score = Math.min(10, Math.max(0, score));
  return { score, meta: { count: paragraphs.length, stdDev: Math.round(stdDev * 10) / 10 } };
}

// ---------------------------------------------------------------------------
// Metric 8: Slop Score
// ---------------------------------------------------------------------------

/**
 * Use DESLOP_SCORING.scoreText(). Inverse: slop score 0 => metric 10.
 * slop score >= threshold => metric 0. Linear scale.
 */
function scoreSlopMetric(text) {
  if (!window.DESLOP_SCORING || !PATTERNS) {
    return { score: 5, meta: { slopScore: 0, threshold: 9 } };
  }

  const result    = window.DESLOP_SCORING.scoreText(text, PATTERNS, settings);
  const slopScore = result.score;
  const threshold = window.DESLOP_SCORING.THRESHOLDS[settings.sensitivity] || 9;

  let score;
  if (slopScore === 0) {
    score = 10;
  } else if (slopScore >= threshold) {
    score = 0;
  } else {
    score = Math.round(10 * (1 - slopScore / threshold));
  }

  score = Math.min(10, Math.max(0, score));
  return { score, meta: { slopScore, threshold } };
}

// ---------------------------------------------------------------------------
// Text processing helpers
// ---------------------------------------------------------------------------

/**
 * Split text into sentences on sentence-ending punctuation.
 * Filters out empty strings.
 */
function splitSentences(text) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && s.split(/\s+/).filter(Boolean).length > 0);
}

/**
 * Split text into paragraphs on double newlines.
 */
function splitParagraphs(text) {
  return text
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0);
}

/**
 * Tokenize text into lowercase words, stripping punctuation.
 */
function tokenizeWords(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z\s'-]/g, ' ')
    .split(/\s+/)
    .map(w => w.replace(/^['-]+|['-]+$/g, ''))
    .filter(w => w.length > 0);
}

/**
 * Count total words in a text string.
 */
function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Syllable counting heuristic based on vowel groups.
 */
function countSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 2) return 1;
  word = word.replace(/e$/, '');
  const vowelGroups = word.match(/[aeiouy]+/g);
  return vowelGroups ? Math.max(1, vowelGroups.length) : 1;
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

/**
 * Render the SVG gauge for the authenticity score.
 * The visible arc spans 270 degrees (135 deg start, clockwise).
 * Full arc circumference for r=80 is 2*PI*80 ~= 502.65.
 * The 270/360 portion is ~376.99. The hidden 90 deg portion offset = ~125.66.
 * We use stroke-dasharray = 452.39 (the 270 deg arc) and the track
 * has stroke-dashoffset = 452.39 - 452.39 = 0 to show full arc.
 * Actually we bake the values: arc length = 2*PI*80 = 502.65,
 * visible = 502.65 * 0.75 = 376.99. We'll use a 270-degree sweep.
 */
function renderGauge(score) {
  const fill     = document.getElementById('gaugeFill');
  const scoreEl  = document.getElementById('gaugeScore');
  const labelEl  = document.getElementById('gaugeLabel');

  // Geometry
  const r           = 80;
  const circumference = 2 * Math.PI * r;         // 502.65...
  const arcFraction   = 0.75;                      // 270 / 360
  const arcLength     = circumference * arcFraction; // 376.99...

  // The SVG arc: we configure stroke-dasharray so only the 270-degree
  // portion is painted. The remaining gap hides under the bottom.
  // stroke-dashoffset controls how much of that arc is actually shown.
  // dashoffset = arcLength means no arc shown; 0 means full arc shown.
  const offset = arcLength - (arcLength * (score / 100));

  // Determine colour
  let color, labelText, labelClass;
  if (score >= 70) {
    color = '#4CAF50';
    labelText = (window.DESLOP_I18N && window.DESLOP_I18N.msg('humanizeLikelyHumanShort')) || 'LIKELY HUMAN';
    labelClass = 'human';
  } else if (score >= 40) {
    color = '#ff9800';
    labelText = (window.DESLOP_I18N && window.DESLOP_I18N.msg('humanizeMixedSignalsShort')) || 'MIXED SIGNALS';
    labelClass = 'mixed';
  } else {
    color = '#FF6B6B';
    labelText = (window.DESLOP_I18N && window.DESLOP_I18N.msg('humanizeLikelyAIShort')) || 'LIKELY AI';
    labelClass = 'ai';
  }

  // The fill circle: dasharray = arcLength + remaining (gap to close path)
  // We set dasharray to the full arc length and then hide the unused portion
  // via dashoffset. Both track and fill use same dasharray/dashoffset baseline.
  fill.setAttribute('stroke-dasharray', `${arcLength} ${circumference - arcLength}`);
  fill.setAttribute('stroke-dashoffset', offset);
  fill.setAttribute('stroke', color);

  // Track: full arc, no offset needed (always shows full 270 deg ring)
  const track = document.querySelector('.gauge-track');
  track.setAttribute('stroke-dasharray', `${arcLength} ${circumference - arcLength}`);
  track.setAttribute('stroke-dashoffset', 0);

  scoreEl.textContent = score;
  labelEl.textContent = labelText;
  labelEl.className = `gauge-label ${labelClass}`;
}

/**
 * Render all 8 metric cards.
 */
function renderMetrics(metrics) {
  const metricMap = [
    { key: 'sentenceVariety',  scoreId: 'score-sentence-variety',  barId: 'bar-sentence-variety' },
    { key: 'activeVoice',      scoreId: 'score-active-voice',       barId: 'bar-active-voice' },
    { key: 'avgLength',        scoreId: 'score-avg-length',         barId: 'bar-avg-length' },
    { key: 'vocabulary',       scoreId: 'score-vocabulary',         barId: 'bar-vocabulary' },
    { key: 'repetition',       scoreId: 'score-repetition',         barId: 'bar-repetition' },
    { key: 'readingLevel',     scoreId: 'score-reading-level',      barId: 'bar-reading-level' },
    { key: 'paragraphVariety', scoreId: 'score-paragraph-variety',  barId: 'bar-paragraph-variety' },
    { key: 'slop',             scoreId: 'score-slop',               barId: 'bar-slop' }
  ];

  for (const { key, scoreId, barId } of metricMap) {
    const { score, meta } = metrics[key];
    const scoreEl = document.getElementById(scoreId);
    const barEl   = document.getElementById(barId);

    if (!scoreEl || !barEl) continue;

    // Colour classes
    let colorClass;
    if (score >= 7)      colorClass = 'score-high';
    else if (score >= 4) colorClass = 'score-medium';
    else                 colorClass = 'score-low';

    let barColorClass;
    if (score >= 7)      barColorClass = 'bar-high';
    else if (score >= 4) barColorClass = 'bar-medium';
    else                 barColorClass = 'bar-low';

    // Slop metric: show the raw De-Slop engine score (matches "Is My Post Slop?" checker)
    if (key === 'slop' && meta) {
      scoreEl.textContent = meta.slopScore;

      // Use the raw slop score for colouring: 0 = green, >= threshold = red
      if (meta.slopScore === 0) {
        colorClass = 'score-high';
        barColorClass = 'bar-high';
      } else if (meta.slopScore < meta.threshold) {
        colorClass = 'score-medium';
        barColorClass = 'bar-medium';
      } else {
        colorClass = 'score-low';
        barColorClass = 'bar-low';
      }

      // Bar: fill proportionally to slop detected (more slop = fuller bar)
      // Cap at 100% when score reaches 2x threshold
      const maxScore = meta.threshold * 2;
      const fillPct = meta.slopScore === 0 ? 0
        : Math.min(100, Math.round((meta.slopScore / maxScore) * 100));
      barEl.className = `metric-bar-fill ${barColorClass}`;
      requestAnimationFrame(() => { barEl.style.width = `${fillPct}%`; });

      // Update the description with threshold info
      const descEl = scoreEl.closest('.metric-card').querySelector('.metric-desc');
      if (descEl) {
        descEl.textContent = `De-Slop score: ${meta.slopScore} pts (threshold: ${meta.threshold})`;
      }
    } else {
      scoreEl.textContent = score;
      barEl.className = `metric-bar-fill ${barColorClass}`;
      requestAnimationFrame(() => { barEl.style.width = `${score * 10}%`; });
    }

    scoreEl.className = `metric-score ${colorClass}`;
  }
}

/**
 * Generate writing tips based on the lowest-scoring metrics.
 */
function renderTips(metrics, text) {
  const tipsList = document.getElementById('tipsList');
  const i18n = window.DESLOP_I18N;

  // Sort metrics by score ascending; take the worst 3
  const sorted = Object.entries(metrics)
    .map(([key, val]) => ({ key, score: val.score, meta: val.meta }))
    .sort((a, b) => a.score - b.score);

  const tips = [];

  for (const { key, score, meta } of sorted) {
    if (tips.length >= 5) break;

    const tip = buildTip(key, score, meta, i18n);
    if (tip) tips.push(tip);
  }

  // If everything scores well, add a positive note
  if (tips.length === 0 || sorted[0].score >= 7) {
    const msg = (i18n && i18n.msg('humanizeTipAllGood')) || 'Your writing looks authentic! Keep it specific, varied, and direct.';
    tips.unshift({ text: msg, positive: true });
  }

  tipsList.innerHTML = tips.map(tip => {
    const cls = tip.positive ? 'tip-item tip-positive' : 'tip-item';
    const labelHtml = tip.label ? `<span class="tip-metric-label">${tip.label}</span>` : '';
    return `<div class="${cls}">${labelHtml}${escapeHtml(tip.text)}</div>`;
  }).join('');
}

/**
 * Build a tip for a specific metric key.
 * Returns { label, text } or null if score is already good.
 */
function buildTip(key, score, meta, i18n) {
  // Only surface a tip if the metric is below threshold
  if (score >= 7) return null;

  const msg = (key, fallback) => (i18n && i18n.msg(key)) || fallback;

  switch (key) {
    case 'sentenceVariety':
      return {
        label: msg('humanizeMetricSentenceVariety', 'Sentence Variety'),
        text: msg('humanizeTipSentenceVariety', 'Mix up your sentence lengths. Use some short punchy sentences alongside longer, more complex ones.')
      };

    case 'activeVoice':
      return {
        label: msg('humanizeMetricActiveVoice', 'Active Voice'),
        text: msg('humanizeTipActiveVoice', 'Rewrite passive constructions. Instead of "was created by", write who actually did it.')
      };

    case 'avgLength': {
      if (meta.tooLong) {
        return {
          label: msg('humanizeMetricAvgLength', 'Avg Sentence Length'),
          text: msg('humanizeTipAvgLengthLong', 'Break up long sentences. Aim for 15-20 words per sentence to improve readability.')
        };
      } else {
        return {
          label: msg('humanizeMetricAvgLength', 'Avg Sentence Length'),
          text: msg('humanizeTipAvgLengthShort', 'Some sentences are too choppy. Combine related ideas into fuller sentences.')
        };
      }
    }

    case 'vocabulary':
      return {
        label: msg('humanizeMetricVocabulary', 'Vocabulary Diversity'),
        text: msg('humanizeTipVocabulary', 'You are repeating the same words often. Use synonyms and vary your word choice.')
      };

    case 'repetition': {
      const topWord = meta.topWord ? `"${meta.topWord}"` : 'a word';
      const baseText = msg('humanizeTipRepetitionBase', 'appears too frequently. Find alternatives and spread ideas across different phrasing.');
      return {
        label: msg('humanizeMetricRepetition', 'Repetition'),
        text: `${topWord} ${baseText}`
      };
    }

    case 'readingLevel': {
      if (meta.tooHard) {
        return {
          label: msg('humanizeMetricReadingLevel', 'Reading Level'),
          text: msg('humanizeTipReadingLevelHard', 'Simplify your language. Use shorter words and clearer phrasing where possible.')
        };
      } else {
        return {
          label: msg('humanizeMetricReadingLevel', 'Reading Level'),
          text: msg('humanizeTipReadingLevelEasy', 'Your writing may be too simple. Add more depth and complexity to your ideas.')
        };
      }
    }

    case 'paragraphVariety':
      return {
        label: msg('humanizeMetricParagraphVariety', 'Paragraph Variety'),
        text: msg('humanizeTipParagraphVariety', 'Vary your paragraph lengths. Mix short punchy paragraphs with longer, developed ones.')
      };

    case 'slop': {
      const rawScore = meta.slopScore || 0;
      const threshold = meta.threshold || 9;
      const baseTip = msg('humanizeTipSlop', 'Your text contains AI-typical phrases. Remove buzzwords, be specific, and write from direct experience.');
      return {
        label: msg('humanizeMetricSlop', 'De-Slop Score'),
        text: `${rawScore} pts (threshold: ${threshold}). ${baseTip}`
      };
    }

    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
