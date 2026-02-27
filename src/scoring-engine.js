// De-Slop Shared Scoring Engine
// Reusable scoring functions extracted from checker.js
// Used by: checker, rewriter, compare, humanize, url-analyzer, batch

(function() {
  'use strict';

  const THRESHOLDS = {
    1: 15,
    2: 12,
    3: 9,
    4: 6,
    5: 4
  };

  const TIER_POINTS = {
    tier1: 3,
    tier2: 2,
    tier3: 1,
    emoji: 5
  };

  /**
   * Load patterns for a given language from DESLOP_PATTERNS.
   * Keeps stopWords and emDash as separate arrays so scoreText can
   * conditionally include them based on user settings (matching
   * content.js behaviour).
   * @param {string} lang - 2-letter language code (default: 'en')
   * @returns {{ tier1: RegExp[], tier2: RegExp[], tier3: RegExp[], emoji: RegExp[], stopWords: RegExp[], emDash: RegExp[] }}
   */
  function loadPatterns(lang) {
    lang = lang || 'en';
    const source = (window.DESLOP_PATTERNS && window.DESLOP_PATTERNS[lang]) || null;

    if (source) {
      return {
        tier1: source.tier1 || [],
        tier2: source.tier2 || [],
        tier3: source.tier3 || [],
        emoji: source.emoji || [],
        stopWords: source.stopWords || [],
        emDash: source.emDash || []
      };
    }

    console.warn('[De-Slop Scoring] No patterns loaded for language:', lang);
    return { tier1: [], tier2: [], tier3: [], emoji: [], stopWords: [], emDash: [] };
  }

  /**
   * Load merged suggestions for a given language.
   * Merges checkerSuggestions over base suggestions.
   * @param {string} lang - 2-letter language code (default: 'en')
   * @returns {Object} Map of lowercase phrase -> suggestion text
   */
  function loadSuggestions(lang) {
    lang = lang || 'en';
    const source = (window.DESLOP_PATTERNS && window.DESLOP_PATTERNS[lang]) || null;

    if (source) {
      return {
        ...(source.suggestions || {}),
        ...(source.checkerSuggestions || {})
      };
    }

    return {};
  }

  /**
   * Score text against loaded patterns with sensitivity settings.
   * Respects blockStopWords (default true) and blockEmDashes (default true)
   * to match content.js behaviour.
   * @param {string} text - Text to score
   * @param {Object} patterns - { tier1, tier2, tier3, emoji, stopWords, emDash }
   * @param {Object} settings - { sensitivity, blockEmojis, blockStopWords, blockEmDashes }
   * @returns {{ score: number, matches: { tier1: Array, tier2: Array, tier3: Array, emoji: Array } }}
   */
  function scoreText(text, patterns, settings) {
    let score = 0;
    const matches = {
      tier1: [],
      tier2: [],
      tier3: [],
      emoji: []
    };

    if (!patterns) return { score, matches };

    settings = settings || {};
    const sensitivity = settings.sensitivity != null ? settings.sensitivity : 3;
    const blockEmojis = !!settings.blockEmojis;
    const blockStopWords = settings.blockStopWords !== false; // default true
    const blockEmDashes = settings.blockEmDashes !== false;   // default true

    // Helper to score a pattern list into a matches bucket
    const scorePatterns = (patternList, bucket, pointsEach) => {
      for (const pattern of patternList) {
        const found = text.match(pattern);
        if (found) {
          bucket.push({ pattern: pattern.source, count: found.length, points: found.length * pointsEach });
          score += found.length * pointsEach;
        }
      }
    };

    // Tier 1 - Always active (3 points each)
    scorePatterns(patterns.tier1, matches.tier1, TIER_POINTS.tier1);

    // Stop words - active when blockStopWords is on (3 points, scored as tier1)
    if (blockStopWords && patterns.stopWords) {
      scorePatterns(patterns.stopWords, matches.tier1, TIER_POINTS.tier1);
    }

    // Em dashes - active when blockEmDashes is on (3 points, scored as tier1)
    if (blockEmDashes && patterns.emDash) {
      scorePatterns(patterns.emDash, matches.tier1, TIER_POINTS.tier1);
    }

    // Tier 2 - Active at sensitivity 3+ (2 points each)
    if (sensitivity >= 3) {
      scorePatterns(patterns.tier2, matches.tier2, TIER_POINTS.tier2);
    }

    // Tier 3 - Active at sensitivity 4+ (1 point each)
    if (sensitivity >= 4) {
      scorePatterns(patterns.tier3, matches.tier3, TIER_POINTS.tier3);
    }

    // Emoji patterns if enabled (5 points each)
    if (blockEmojis) {
      scorePatterns(patterns.emoji, matches.emoji, TIER_POINTS.emoji);
    }

    return { score, matches };
  }

  /**
   * Collect all match positions in text for highlighting/replacement.
   * Returns non-overlapping sorted matches with position data.
   * Respects blockStopWords / blockEmDashes settings (same as scoreText).
   * @param {string} text - Text to scan
   * @param {Object} patterns - { tier1, tier2, tier3, emoji, stopWords, emDash }
   * @param {Object} settings - { sensitivity, blockEmojis, blockStopWords, blockEmDashes }
   * @returns {Array<{ text: string, start: number, end: number, tier: string }>}
   */
  function collectAllMatches(text, patterns, settings) {
    const allMatches = [];

    if (!patterns) return allMatches;

    settings = settings || {};
    const sensitivity = settings.sensitivity != null ? settings.sensitivity : 3;
    const blockEmojis = !!settings.blockEmojis;
    const blockStopWords = settings.blockStopWords !== false;
    const blockEmDashes = settings.blockEmDashes !== false;

    const addMatches = (tier, patternList) => {
      for (const pattern of patternList) {
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

    addMatches('tier1', patterns.tier1);
    if (blockStopWords && patterns.stopWords) {
      addMatches('tier1', patterns.stopWords);
    }
    if (blockEmDashes && patterns.emDash) {
      addMatches('tier1', patterns.emDash);
    }
    if (sensitivity >= 3) {
      addMatches('tier2', patterns.tier2);
    }
    if (sensitivity >= 4) {
      addMatches('tier3', patterns.tier3);
    }
    if (blockEmojis) {
      addMatches('emoji', patterns.emoji);
    }

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

  /**
   * Escape HTML special characters.
   * @param {string} text
   * @returns {string}
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Escape string for use in RegExp constructor.
   * @param {string} string
   * @returns {string}
   */
  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Format a regex pattern source string for human-readable display.
   * @param {string} pattern - RegExp source string
   * @returns {string}
   */
  function formatPattern(pattern) {
    let cleaned = pattern
      .replace(/\\b/gi, '')
      .replace(/\\([^bsdwnu])/g, '$1')
      .replace(/\[\\s\]\*/g, ' ')
      .replace(/\[\\s\]/g, ' ')
      .replace(/\[\\u\{[^}]+\}-\\u\{[^}]+\}\]/gi, '[emoji]')
      .replace(/\\u\{[^}]+\}/gi, '[emoji]')
      .replace(/\{(\d+),(\d+)\}/g, '')
      .replace(/\{(\d+),\}/g, '')
      .replace(/\|/g, ' or ')
      .replace(/\.\*/g, '...')
      .replace(/\\\[/g, '[')
      .replace(/\\\]/g, ']')
      .replace(/\\\(/g, '(')
      .replace(/\\\)/g, ')')
      .replace(/\\\?/g, '?')
      .replace(/\\\'/g, "'")
      .replace(/[\+\*]\?/g, '')
      .trim();

    if (cleaned.length > 100) {
      cleaned = cleaned.substring(0, 97) + '...';
    }

    return cleaned;
  }

  /**
   * Get the status class and label for a score at a given sensitivity.
   * @param {number} score
   * @param {number} sensitivity
   * @returns {{ status: string, statusClass: string }}
   */
  function getScoreStatus(score, sensitivity) {
    const threshold = THRESHOLDS[sensitivity] || THRESHOLDS[3];
    if (score === 0) {
      return { status: 'CLEAN', statusClass: 'safe' };
    } else if (score < threshold) {
      return { status: 'BORDERLINE', statusClass: 'warning' };
    } else {
      return { status: 'SLOP DETECTED', statusClass: 'danger' };
    }
  }

  // Export to window
  window.DESLOP_SCORING = {
    THRESHOLDS,
    TIER_POINTS,
    loadPatterns,
    loadSuggestions,
    scoreText,
    collectAllMatches,
    escapeHtml,
    escapeRegExp,
    formatPattern,
    getScoreStatus
  };
})();
