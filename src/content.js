// De-Slop Content Script
// Three-tier aggression system for detecting AI-generated slop

class SlopDetector {
  constructor() {
    this.slopCount = 0;
    this.totalElements = 0; // Track total elements scanned
    this.sensitivity = 3; // Default to medium
    this.customPatterns = []; // User-defined patterns with custom weights
    this.stopWordPatterns = []; // Marketing engagement openers
    this.emDashPatterns = []; // Em dash overuse
    this.whitelist = []; // User-defined whitelist
    this.showSuggestions = false; // Show improvement suggestions
    this.blockPolitics = false; // Block political content
    this.langCode = 'en'; // Detection language
    this.loadPatterns();
    this.loadSettings();
  }

  async loadSettings() {
    try {
      const settings = await chrome.storage.sync.get({
        enabled: true,
        detectionOnly: false,
        sensitivity: 3,
        customPatterns: null,
        customPatterns_en: null,
        blockEmojis: false,
        blockStopWords: true,
        blockEmDashes: true,
        whitelist: [],
        showSuggestions: false,
        blockPolitics: false,
        patternLanguage: 'auto'
      });

      this.sensitivity = settings.sensitivity;
      this.enabled = settings.enabled;
      this.detectionOnly = settings.detectionOnly;
      this.blockEmojis = settings.blockEmojis;
      this.blockStopWords = settings.blockStopWords;
      this.blockEmDashes = settings.blockEmDashes;
      this.whitelist = settings.whitelist || [];
      this.showSuggestions = settings.showSuggestions;
      this.blockPolitics = settings.blockPolitics;

      // Resolve language and reload patterns if needed
      if (window.DESLOP_REGISTRY) {
        const resolvedLang = window.DESLOP_REGISTRY.resolveLanguage(settings.patternLanguage);
        if (resolvedLang !== this.langCode) {
          this.langCode = resolvedLang;
          this.loadPatterns(resolvedLang);

          // Request background to inject non-English pattern file if needed
          if (resolvedLang !== 'en' && !window.DESLOP_REGISTRY.isLanguageLoaded(resolvedLang)) {
            try {
              await chrome.runtime.sendMessage({
                action: 'loadLanguagePatterns',
                language: resolvedLang
              });
              // Re-load patterns after injection
              this.loadPatterns(resolvedLang);
            } catch (err) {
              console.log(`[De-Slop] Could not load ${resolvedLang} patterns, falling back to en`);
              this.langCode = 'en';
              this.loadPatterns('en');
            }
          }
        }
      }

      // Load custom patterns if available (language-scoped, with legacy fallback)
      let customPatterns = settings.customPatterns_en || settings.customPatterns;
      if (this.langCode !== 'en') {
        // Fetch language-scoped custom patterns separately
        const langStore = await chrome.storage.sync.get({ [`customPatterns_${this.langCode}`]: null });
        const langCustom = langStore[`customPatterns_${this.langCode}`];
        if (langCustom) customPatterns = langCustom;
      }
      if (customPatterns) {
        await this.loadCustomPatterns(customPatterns);
      }

      if (this.enabled) {
        this.init();
      }
    } catch (error) {
      console.log('[De-Slop] Could not load settings, using defaults:', error.message);
      // Use defaults and continue
      this.sensitivity = 3;
      this.enabled = true;
      this.blockEmojis = false;
      this.init();
    }
  }

  async loadCustomPatterns(customPatterns) {
    // Load disabled patterns from storage
    const disabledKey = `disabledPatterns_${this.langCode || 'en'}`;
    const disabledStore = await chrome.storage.sync.get({ [disabledKey]: {} });
    const disabledPatterns = disabledStore[disabledKey] || {};

    // Convert string patterns back to RegExp objects, filtering out disabled ones
    const convertPatterns = (patterns, tier) => {
      const disabled = disabledPatterns[tier] || [];
      return patterns
        .filter(p => !disabled.includes(p))
        .map(p => {
          try {
            const match = p.match(/^\/(.+)\/([gimuy]*)$/);
            if (match) {
              return new RegExp(match[1], match[2]);
            }
          } catch (e) {
            console.warn('[De-Slop] Invalid pattern:', p, e);
          }
          return null;
        }).filter(p => p !== null);
    };

    // Replace tier patterns with custom ones
    if (customPatterns.tier1) {
      this.lowAggroPatterns = convertPatterns(customPatterns.tier1, 'tier1');
    }
    if (customPatterns.tier2) {
      this.mediumAggroPatterns = convertPatterns(customPatterns.tier2, 'tier2');
    }
    if (customPatterns.tier3) {
      this.highAggroPatterns = convertPatterns(customPatterns.tier3, 'tier3');
    }

    // Add custom patterns with their weights
    if (customPatterns.custom && customPatterns.custom.length > 0) {
      this.customPatterns = customPatterns.custom.map(item => ({
        pattern: convertPatterns([item.pattern])[0],
        weight: item.weight
      })).filter(item => item.pattern !== null);
    } else {
      this.customPatterns = [];
    }
  }

  loadPatterns(langCode) {
    langCode = langCode || this.langCode || 'en';
    const source = (window.DESLOP_PATTERNS && window.DESLOP_PATTERNS[langCode])
      || (window.DESLOP_PATTERNS && window.DESLOP_PATTERNS.en)
      || null;

    if (!source) {
      console.warn('[De-Slop] No patterns loaded for language:', langCode);
      this.lowAggroPatterns = [];
      this.mediumAggroPatterns = [];
      this.highAggroPatterns = [];
      this.stopWordPatterns = [];
      this.emDashPatterns = [];
      this.emojiPatterns = [];
      this.suggestionMap = {};
      this.politicalPatterns = [];
      return;
    }

    this.lowAggroPatterns = source.tier1 || [];
    this.mediumAggroPatterns = source.tier2 || [];
    this.highAggroPatterns = source.tier3 || [];
    this.stopWordPatterns = source.stopWords || [];
    this.emDashPatterns = source.emDash || [];
    this.emojiPatterns = source.emoji || [];
    this.suggestionMap = source.suggestions || {};
    this.politicalPatterns = source.political || [];
  }

  // Patterns loaded from src/patterns/en.js (and per-language files) via loadPatterns()
  // ~1030 lines of hardcoded initPatterns(), initSuggestionMap(), initPoliticalPatterns() removed

  // Normalize Unicode fancy text (bold, italic, script, etc.) to regular ASCII
  // This prevents LinkedIn engagement bait using 𝐛𝐨𝐥𝐝 𝐭𝐞𝐱𝐭 from evading detection
  normalizeUnicode(text) {
    if (!text) return text;

    // Map Unicode Mathematical Alphanumeric Symbols to regular ASCII
    // Bold (U+1D400-U+1D433): 𝐀-𝐙, 𝐚-𝐳
    // Italic (U+1D434-U+1D467): 𝐴-𝑍, 𝑎-𝑧
    // Bold Italic (U+1D468-U+1D49B): 𝑨-𝒁, 𝒂-𝒛
    // Script (U+1D49C-U+1D4CF): 𝒜-𝒵, 𝒶-𝓏
    // Bold Script (U+1D4D0-U+1D503): 𝓐-𝓩, 𝓪-𝔃
    // Fraktur (U+1D504-U+1D537): 𝔄-𝔝, 𝔞-𝔷
    // Bold Fraktur (U+1D56C-U+1D59F): 𝕬-𝖅, 𝖆-𝖟
    // Sans-serif (U+1D5A0-U+1D5D3): 𝖠-𝖹, 𝖺-𝗓
    // Bold Sans-serif (U+1D5D4-U+1D607): 𝗔-𝗭, 𝗮-𝘇
    // Italic Sans-serif (U+1D608-U+1D63B): 𝘈-𝘡, 𝘢-𝘻
    // Bold Italic Sans-serif (U+1D63C-U+1D66F): 𝘼-𝙕, 𝙖-𝙯
    // Monospace (U+1D670-U+1D6A3): 𝙰-𝚉, 𝚊-𝚣
    // Double-struck (U+1D538-U+1D56B): 𝔸-ℤ, 𝕒-𝕫
    // Bold digits (U+1D7CE-U+1D7D7): 𝟎-𝟗
    // Double-struck digits (U+1D7D8-U+1D7E1): 𝟘-𝟡
    // Sans-serif digits (U+1D7E2-U+1D7EB): 𝟢-𝟫
    // Bold sans-serif digits (U+1D7EC-U+1D7F5): 𝟬-𝟵
    // Monospace digits (U+1D7F6-U+1D7FF): 𝟶-𝟿

    const unicodeMap = {};

    // Helper function to create mappings for a range
    const createMapping = (unicodeStart, asciiStart, count) => {
      for (let i = 0; i < count; i++) {
        unicodeMap[String.fromCodePoint(unicodeStart + i)] = String.fromCodePoint(asciiStart + i);
      }
    };

    // Bold uppercase A-Z
    createMapping(0x1D400, 0x41, 26);
    // Bold lowercase a-z
    createMapping(0x1D41A, 0x61, 26);

    // Italic uppercase A-Z
    createMapping(0x1D434, 0x41, 26);
    // Italic lowercase a-z (with h at different position)
    createMapping(0x1D44E, 0x61, 26);

    // Bold Italic uppercase A-Z
    createMapping(0x1D468, 0x41, 26);
    // Bold Italic lowercase a-z
    createMapping(0x1D482, 0x61, 26);

    // Script uppercase A-Z (with gaps)
    createMapping(0x1D49C, 0x41, 26);
    // Script lowercase a-z
    createMapping(0x1D4B6, 0x61, 26);

    // Bold Script uppercase A-Z
    createMapping(0x1D4D0, 0x41, 26);
    // Bold Script lowercase a-z
    createMapping(0x1D4EA, 0x61, 26);

    // Fraktur uppercase A-Z
    createMapping(0x1D504, 0x41, 26);
    // Fraktur lowercase a-z
    createMapping(0x1D51E, 0x61, 26);

    // Double-struck uppercase A-Z
    createMapping(0x1D538, 0x41, 26);
    // Double-struck lowercase a-z
    createMapping(0x1D552, 0x61, 26);

    // Bold Fraktur uppercase A-Z
    createMapping(0x1D56C, 0x41, 26);
    // Bold Fraktur lowercase a-z
    createMapping(0x1D586, 0x61, 26);

    // Sans-serif uppercase A-Z
    createMapping(0x1D5A0, 0x41, 26);
    // Sans-serif lowercase a-z
    createMapping(0x1D5BA, 0x61, 26);

    // Bold Sans-serif uppercase A-Z
    createMapping(0x1D5D4, 0x41, 26);
    // Bold Sans-serif lowercase a-z
    createMapping(0x1D5EE, 0x61, 26);

    // Italic Sans-serif uppercase A-Z
    createMapping(0x1D608, 0x41, 26);
    // Italic Sans-serif lowercase a-z
    createMapping(0x1D622, 0x61, 26);

    // Bold Italic Sans-serif uppercase A-Z
    createMapping(0x1D63C, 0x41, 26);
    // Bold Italic Sans-serif lowercase a-z
    createMapping(0x1D656, 0x61, 26);

    // Monospace uppercase A-Z
    createMapping(0x1D670, 0x41, 26);
    // Monospace lowercase a-z
    createMapping(0x1D68A, 0x61, 26);

    // Bold digits 0-9
    createMapping(0x1D7CE, 0x30, 10);
    // Double-struck digits 0-9
    createMapping(0x1D7D8, 0x30, 10);
    // Sans-serif digits 0-9
    createMapping(0x1D7E2, 0x30, 10);
    // Bold sans-serif digits 0-9
    createMapping(0x1D7EC, 0x30, 10);
    // Monospace digits 0-9
    createMapping(0x1D7F6, 0x30, 10);

    // Also handle fullwidth characters (U+FF01-U+FF5E)
    // Fullwidth ! to ~
    createMapping(0xFF01, 0x21, 94);

    // Replace all Unicode variants with regular ASCII
    return text.replace(/./gu, (char) => unicodeMap[char] || char);
  }

  // Get platform-specific comment selectors
  getPlatformCommentSelectors() {
    const hostname = window.location.hostname;

    if (hostname.includes('linkedin.com')) {
      return {
        comments: [
          '.comments-comment-item',
          '.comments-comment-item-content-body',
          '[data-view-name="comments-comment-item"]',
          '.comment',
          '.comment-item'
        ],
        posts: [
          '.feed-shared-update-v2__description',
          '.feed-shared-text',
          '.feed-shared-inline-show-more-text',
          // Full text elements (may be hidden)
          '.feed-shared-inline-show-more-text__text-view',
          '.break-words',
          '[dir="ltr"]'
        ]
      };
    } else if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
      return {
        comments: ['[data-testid="tweet"]'], // X treats replies as tweets
        posts: ['[data-testid="tweet"]']
      };
    } else if (hostname.includes('reddit.com')) {
      return {
        comments: ['.comment', '.Comment', '[data-testid="comment"]'],
        posts: ['.Post', '[data-test-id="post-content"]']
      };
    } else if (hostname.includes('medium.com')) {
      return {
        comments: ['.postArticle-content', 'article'],
        posts: ['article', '.postArticle']
      };
    } else if (hostname.includes('facebook.com')) {
      return {
        comments: ['[role="article"]', '.comment'],
        posts: ['[data-ad-preview="message"]', '[role="article"]']
      };
    } else if (hostname.includes('youtube.com')) {
      return {
        comments: [
          'ytd-comment-renderer',
          '#content-text',
          'ytd-comment-thread-renderer'
        ],
        posts: [
          'ytd-rich-item-renderer',      // Home feed videos
          'ytd-video-renderer',           // Search results, sidebar
          'ytd-grid-video-renderer',      // Grid view
          'ytd-compact-video-renderer',   // Compact view
          'ytd-reel-video-renderer',      // Shorts
          'ytd-playlist-video-renderer'   // Playlist videos
        ],
        videos: [
          'ytd-rich-item-renderer',
          'ytd-video-renderer',
          'ytd-grid-video-renderer',
          'ytd-compact-video-renderer'
        ],
        shorts: [
          'ytd-reel-video-renderer',
          'ytd-reel-item-renderer'
        ],
        watchPage: {
          title: '#title h1 yt-formatted-string',
          description: '#description-inline-expander #description-text',
          channel: '#channel-name'
        }
      };
    }

    // Generic fallback
    return {
      comments: ['[class*="comment"]', '[class*="reply"]', '[id*="comment"]'],
      posts: ['article', '[class*="post"]', '.card']
    };
  }

  // Check if current URL is whitelisted
  isWhitelisted() {
    const currentUrl = window.location.href.toLowerCase();
    const currentHost = window.location.hostname.toLowerCase().replace(/^www\./, '');
    const currentPath = window.location.pathname + window.location.search;
    
    return this.whitelist.some(item => {
      const whitelistItem = item.toLowerCase();
      
      // Full URL match
      if (currentUrl.includes(whitelistItem)) {
        return true;
      }
      
      // Domain/subdomain match
      if (currentHost === whitelistItem || currentHost.endsWith('.' + whitelistItem)) {
        return true;
      }
      
      // Path match (domain + path)
      if (whitelistItem.includes('/')) {
        const [domain, path] = whitelistItem.split('/', 2);
        if ((currentHost === domain || currentHost.endsWith('.' + domain)) && currentPath.startsWith('/' + path)) {
          return true;
        }
      }
      
      return false;
    });
  }

  init() {
    // Check if current site is whitelisted
    if (this.isWhitelisted()) {
      console.log('[De-Slop] Site is whitelisted, skipping detection');
      return;
    }

    this.scanPage();
    this.observeChanges();
    this.updateBadge();
  }

  scanPage() {
    // Platform-specific selectors for better targeting
    const isLinkedIn = window.location.hostname.includes('linkedin.com');
    const isX = window.location.hostname.includes('twitter.com') || window.location.hostname.includes('x.com');
    const isMedium = window.location.hostname.includes('medium.com');
    const isYouTube = window.location.hostname.includes('youtube.com');
    const isReddit = window.location.hostname.includes('reddit.com');

    let selector = 'article, [class*="post"], .card, section[class*="content"]';

    if (isLinkedIn) {
      // Target individual LinkedIn posts, not the feed container
      selector = '.feed-shared-update-v2, [data-id*="urn:li:activity"], article';
    } else if (isX) {
      selector = '[data-testid="tweet"], article';
    } else if (isMedium) {
      selector = 'article, .postArticle, [data-action="show-recommends-prompt"]';
    } else if (isReddit) {
      // Reddit posts - target individual posts
      selector = '[data-testid="post-container"], .Post, shreddit-post, [id^="t3_"]';
    } else if (isYouTube) {
      // YouTube needs special handling - scan videos separately
      this.scanYouTubeVideos();
      this.scanComments();
      return;
    }

    const elements = document.querySelectorAll(selector);
    this.totalElements = elements.length;

    elements.forEach(el => {
      const result = this.isSlopElement(el);
      if (result.isSlop) {
        this.removeElement(el, result.matches);
      }
    });

    // SEPARATELY scan comments to avoid flagging entire posts
    // when only a comment is sloppy
    this.scanComments();
  }

  // YouTube-specific video scanning
  scanYouTubeVideos() {
    const selectors = this.getPlatformCommentSelectors();
    if (!selectors || !selectors.videos) return;

    const videoSelector = selectors.videos.join(', ');

    try {
      const videos = document.querySelectorAll(videoSelector);

      videos.forEach(video => {
        // Skip if already processed
        if (video.hasAttribute('data-deslop-checked')) return;
        video.setAttribute('data-deslop-checked', 'true');

        const result = this.isYouTubeVideoSlop(video);
        if (result.isSlop) {
          this.removeElement(video, result.matches, false, true); // Pass true for isYouTube
        }
      });

      // Also scan YouTube Shorts separately
      if (selectors.shorts) {
        const shortsSelector = selectors.shorts.join(', ');
        const shorts = document.querySelectorAll(shortsSelector);

        shorts.forEach(short => {
          if (short.hasAttribute('data-deslop-checked')) return;
          short.setAttribute('data-deslop-checked', 'true');

          const result = this.isYouTubeVideoSlop(short);
          if (result.isSlop) {
            this.removeElement(short, result.matches, false, true);
          }
        });
      }
    } catch (e) {
      console.log('[De-Slop] YouTube video scanning error:', e.message);
    }
  }

  // Check if YouTube video contains slop
  isYouTubeVideoSlop(videoElement) {
    // Extract video title
    const titleElement = videoElement.querySelector('#video-title, h3 a, .ytd-video-meta-block #video-title');
    const title = titleElement ? titleElement.textContent : '';

    // Extract channel name
    const channelElement = videoElement.querySelector('#channel-name, .ytd-channel-name a');
    const channel = channelElement ? channelElement.textContent : '';

    // Combine title and channel for analysis
    const text = `${title} ${channel}`.trim();

    // Skip if too short
    if (text.length < 10) return { isSlop: false, matches: [] };

    let slopScore = 0;
    const matchedPhrases = new Set();

    // YouTube-SPECIFIC: Count emojis in title (respects blockEmojis setting)
    if (this.blockEmojis) {
      // Comprehensive emoji regex covering all Unicode emoji ranges
      const emojiRegex = /[\u{1F300}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E0}-\u{1F1FF}\u{1F191}-\u{1F251}\u{1F004}\u{1F0CF}\u{1F170}-\u{1F171}\u{1F17E}-\u{1F17F}\u{1F18E}\u{3030}\u{2B50}\u{2B55}\u{2934}-\u{2935}\u{2B05}-\u{2B07}\u{2B1B}-\u{2B1C}\u{3297}\u{3299}\u{303D}\u{00A9}\u{00AE}\u{2122}\u{23F0}-\u{23F3}\u{23E9}-\u{23EF}\u{25AA}-\u{25AB}\u{25B6}\u{25C0}\u{25FB}-\u{25FE}\u{2600}-\u{2604}\u{260E}\u{2611}\u{2614}-\u{2615}\u{2618}\u{261D}\u{2620}\u{2622}-\u{2623}\u{2626}\u{262A}\u{262E}-\u{262F}\u{2638}-\u{263A}\u{2640}\u{2642}\u{2648}-\u{2653}\u{265F}-\u{2660}\u{2663}\u{2665}-\u{2666}\u{2668}\u{267B}\u{267E}-\u{267F}\u{2692}-\u{2697}\u{2699}\u{269B}-\u{269C}\u{26A0}-\u{26A1}\u{26A7}\u{26AA}-\u{26AB}\u{26B0}-\u{26B1}\u{26BD}-\u{26BE}\u{26C4}-\u{26C5}\u{26C8}\u{26CE}-\u{26CF}\u{26D1}\u{26D3}-\u{26D4}\u{26E9}-\u{26EA}\u{26F0}-\u{26F5}\u{26F7}-\u{26FA}\u{26FD}\u{2702}\u{2705}\u{2708}-\u{270D}\u{270F}\u{2712}\u{2714}\u{2716}\u{271D}\u{2721}\u{2728}\u{2733}-\u{2734}\u{2744}\u{2747}\u{274C}\u{274E}\u{2753}-\u{2755}\u{2757}\u{2763}-\u{2764}\u{2795}-\u{2797}\u{27A1}\u{27B0}\u{27BF}\u{2934}-\u{2935}\u{2B05}-\u{2B07}\u{2B1B}-\u{2B1C}\u{2B50}\u{2B55}\u{3030}\u{303D}\u{3297}\u{3299}]/gu;
      const emojiMatches = title.match(emojiRegex);
      if (emojiMatches) {
        const emojiCount = emojiMatches.length;
        if (emojiCount >= 2) {
          // 2+ emojis = instant slop on YouTube
          slopScore += emojiCount * 3; // 3 points per emoji
          matchedPhrases.add(`[Emoji Spam] ${emojiCount} emojis in title`);
        } else if (emojiCount === 1) {
          // Even 1 emoji is suspicious on YouTube
          slopScore += 2;
          matchedPhrases.add('[Emoji] Emoji in title');
        }
      }
    }

    // YouTube-SPECIFIC: Low-effort content patterns (ALWAYS active)
    const lowEffortPatterns = [
      /\bASMR\b/gi,
      /\b(satisfying|oddly satisfying)\b/gi,
      /\b(compilation|compilations)\b/gi,
      /\b(try not to|don't|dont)\s+(laugh|cry|cringe)/gi,
      /\b(react|reacts|reacting|reaction)(\s+to)?\b/gi,
      /\b(unboxing|haul)\b/gi,
      /\b(prank|pranks|pranking)\b/gi,
      /\b(challenge|challenges)\b/gi,
      /\b(mukbang|eating)\s+(show|asmr)/gi,
      /\b(storytime|story time)\b/gi,
      /\b(vlog|daily vlog|vlogging)\b/gi,
      /\b(review|reviews|reviewing)\s+(every|all)\b/gi, // "reviewing every X"
      /\b(ranked|ranking|tier list)\b/gi, // Tier list slop
      /\bI\s+(tried|tested|spent)\b/gi // "I tried X for 30 days"
    ];

    for (const pattern of lowEffortPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        slopScore += matches.length * 3; // Heavy penalty for low-effort
        matches.forEach(m => matchedPhrases.add(`[Low Effort] ${m.trim()}`));
      }
    }

    // YouTube-SPECIFIC: Excessive separators (word salad)
    const separatorCount = (title.match(/\|/g) || []).length;
    if (separatorCount >= 2) {
      // 1 pipe = OK, 2+ pipes = spam
      slopScore += separatorCount * 2; // 2 points per separator
      matchedPhrases.add(`[Word Salad] ${separatorCount} pipe separators`);
    }

    // YouTube-SPECIFIC: ALL CAPS WORDS (screaming titles)
    const capsWords = title.match(/\b[A-Z]{3,}\b/g);

    // Flag specific screaming emphasis words (even just one)
    const screamingWords = /\b(REALLY|ACTUALLY|MUST|NEVER|ALWAYS|SHOCKING|INSANE|CRAZY|AMAZING)\b/g;
    const screamMatches = title.match(screamingWords);
    if (screamMatches) {
      slopScore += screamMatches.length * 3; // 3 points for screaming emphasis
      matchedPhrases.add(`[Screaming Caps] ${screamMatches.join(', ')}`);
    }

    // Also flag 2+ generic CAPS words
    if (capsWords && capsWords.length >= 2) {
      slopScore += capsWords.length * 2;
      matchedPhrases.add(`[Caps Spam] ${capsWords.length} ALL CAPS words`);
    }

    // Check all pattern tiers (same as regular detection)
    if (this.sensitivity >= 1) {
      for (const pattern of this.lowAggroPatterns) {
        const matches = text.match(pattern);
        if (matches) {
          slopScore += matches.length * 3;
          matches.forEach(m => matchedPhrases.add(`[Tier 1] ${m.trim()}`));
        }
      }
    }

    if (this.sensitivity >= 3) {
      for (const pattern of this.mediumAggroPatterns) {
        const matches = text.match(pattern);
        if (matches) {
          slopScore += matches.length * 2;
          matches.forEach(m => matchedPhrases.add(`[Tier 2] ${m.trim()}`));
        }
      }
    }

    if (this.sensitivity >= 4) {
      for (const pattern of this.highAggroPatterns) {
        const matches = text.match(pattern);
        if (matches) {
          slopScore += matches.length * 1;
          matches.forEach(m => matchedPhrases.add(`[Tier 3] ${m.trim()}`));
        }
      }
    }

    // Check custom patterns
    if (this.customPatterns && this.customPatterns.length > 0) {
      for (const item of this.customPatterns) {
        const matches = text.match(item.pattern);
        if (matches) {
          slopScore += matches.length * item.weight;
          matches.forEach(m => matchedPhrases.add(`[Custom] ${m.trim()}`));
        }
      }
    }

    // Check emoji patterns if enabled
    if (this.blockEmojis) {
      for (const pattern of this.emojiPatterns) {
        const matches = text.match(pattern);
        if (matches) {
          slopScore += matches.length * 5;
          matches.forEach(m => matchedPhrases.add(`[Emoji] ${m.trim()}`));
        }
      }
    }

    // YouTube-specific: Check for clickbait patterns
    const clickbaitPatterns = [
      /you won'?t believe/gi,
      /this is (crazy|insane|unbelievable)/gi,
      /wait for it/gi,
      /gone wrong/gi,
      /gone (right|sexual)/gi,
      /\(not clickbait\)/gi,
      /must (see|watch)/gi,
      /will (shock|blow your mind)/gi,

      // Absurdist "I {verb} {object} to do {task}" clickbait
      /\bI\s+(hired|paid|asked|told|got|made|forced|convinced|taught|trained)\s+.{3,30}\s+to\s+(do|make|create|write|build|plan|solve)/gi,
      /\bI\s+(let|made)\s+(my|a|an)\s+.{3,30}\s+(do|make|decide|choose|pick|run)/gi,

      // "Are X a Y?" false controversy/leading questions
      /^Are\s+.{3,40}\s+a\s+(scam|waste|lie|hoax|fraud)/gi,
      /^Are\s+.{3,40}\s+(worth it|dead|dying|overrated|underrated|the future|better)/gi,
      /^Is\s+.{3,40}\s+a\s+(scam|waste|lie|hoax|fraud)/gi,
      /^Is\s+.{3,40}\s+(worth it|dead|dying|overrated|underrated|the future|better)/gi,

      // Emotional manipulation/bait
      /^I'?m sorry/gi,
      /^I need to (apologize|come clean|tell you|be honest)/gi,
      /^We need to talk/gi,
      /^I have to (apologize|come clean|tell you|be honest|confess)/gi,
      /^(This is goodbye|I'?m (done|quitting|leaving))/gi,
      /^I can'?t do this anymore/gi,
      /\b(my heart is broken|this broke me|I'?m (crying|devastated|heartbroken))/gi,
      /^(Please forgive me|I (messed up|was wrong|lied))/gi,
      /^The truth about (me|my|us|our)/gi,

      // Artificial curiosity / "nudge" clickbait
      /more .{3,30} than you think/gi,
      /less .{3,30} than you think/gi,
      /\b(things|stuff|facts) you didn'?t know/gi,
      /\b(things|facts) you never knew/gi,
      /what they don'?t (tell|want) you/gi,
      /the truth about/gi,
      /what'?s? (really|actually) (inside|in|happening)/gi,
      /what'?s? inside (my|your|the|a)/gi,
      /what (really|actually) happened/gi,
      /the real (reason|story|truth)/gi,
      /here'?s why/gi,
      /this is why/gi,
      /that'?s why/gi,
      /why you (should|shouldn'?t|need to|must)/gi,
      /you need to (know|see|watch|understand)/gi,
      /you should know/gi,
      /nobody tells you/gi,
      /they don'?t want you to know/gi,
      /will change your life/gi,
      /before it'?s too late/gi,
      /stop doing/gi,
      /never do (this|these)/gi,
      /don'?t (ever )?do (this|these)/gi,
      /what happens (when|if)/gi,
      /you'?re doing (it|this) wrong/gi,
      /doing .{3,20} wrong/gi,
      /the (problem|issue) with/gi,
      /why (everyone|nobody) is/gi,
      /everyone (is|needs to)/gi,
      /nobody (knows|talks about)/gi,
      /the secret to/gi,
      /secrets? (they|you) don'?t/gi
    ];

    for (const pattern of clickbaitPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        slopScore += matches.length * 4; // High weight for clickbait
        matches.forEach(m => matchedPhrases.add(`[Clickbait] ${m.trim()}`));
      }
    }

    // Check political patterns if toggle is enabled
    if (this.blockPolitics) {
      for (const pattern of this.politicalPatterns) {
        const matches = text.match(pattern);
        if (matches) {
          slopScore += matches.length * 5; // High weight for political content
          matches.forEach(m => matchedPhrases.add(`[Political] ${m.trim()}`));
        }
      }
    }

    const thresholds = {
      1: 15,
      2: 12,
      3: 9,
      4: 6,
      5: 4
    };

    const threshold = thresholds[this.sensitivity] || 9;
    const isSlop = slopScore >= threshold;


    return {
      isSlop,
      matches: Array.from(matchedPhrases).slice(0, 10),
      score: slopScore
    };
  }

  scanComments() {
    const selectors = this.getPlatformCommentSelectors();
    if (!selectors || !selectors.comments) return;

    // Build combined comment selector
    const commentSelector = selectors.comments.join(', ');

    try {
      const comments = document.querySelectorAll(commentSelector);

      comments.forEach(comment => {
        // Skip if already processed
        if (comment.hasAttribute('data-deslop-comment-checked')) return;
        comment.setAttribute('data-deslop-comment-checked', 'true');

        // Check if this is actually a comment (not a post)
        // On LinkedIn, comments are inside .comments-comment-item
        const isComment = comment.classList.contains('comments-comment-item') ||
                         comment.classList.contains('comment') ||
                         comment.closest('.comments-comment-item') ||
                         comment.closest('[class*="comment"]');

        if (isComment) {
          const result = this.isSlopElement(comment, true); // Pass true to indicate it's a comment
          if (result.isSlop) {
            this.removeElement(comment, result.matches, true); // Pass true for comment handling
          }
        }
      });
    } catch (e) {
      console.log('[De-Slop] Comment scanning error:', e.message);
    }
  }

  // Extract full text from LinkedIn post, including hidden content
  extractLinkedInFullText(element) {
    // LinkedIn stores the full text in the DOM but hides it with CSS
    // Look for the full content without clicking "see more" to avoid UI disruption

    let fullText = '';

    // Strategy 1: Look for the full text span that might be hidden
    // LinkedIn often has multiple spans - one truncated, one full
    const textContainer = element.querySelector('.feed-shared-inline-show-more-text, .feed-shared-text, .feed-shared-update-v2__description');

    if (textContainer) {
      // Get all text from all spans, including hidden ones
      const allSpans = textContainer.querySelectorAll('span[dir="ltr"]');

      if (allSpans.length > 0) {
        // Find the longest text content (likely the full version)
        let longestText = '';
        allSpans.forEach(span => {
          const spanText = span.textContent || '';
          if (spanText.length > longestText.length) {
            longestText = spanText;
          }
        });

        fullText = longestText;
      }

      // If no spans found, get text from container itself
      if (fullText.length === 0) {
        // Clone to avoid modifying original
        const clone = textContainer.cloneNode(true);
        // Remove "see more" button text
        const seeMoreButton = clone.querySelector('.feed-shared-inline-show-more-text__see-more-less-toggle');
        if (seeMoreButton) {
          seeMoreButton.remove();
        }
        fullText = clone.textContent || '';
      }
    }

    // Strategy 2: If still empty, look for any text content in the update
    if (fullText.length === 0) {
      const descriptionElement = element.querySelector('.feed-shared-update-v2__description');
      if (descriptionElement) {
        const clone = descriptionElement.cloneNode(true);
        // Remove comment sections
        const comments = clone.querySelectorAll('.comments-comment-item, [class*="comment"]');
        comments.forEach(c => c.remove());
        // Remove buttons
        const buttons = clone.querySelectorAll('button');
        buttons.forEach(b => b.remove());
        fullText = clone.textContent || '';
      }
    }

    return fullText.trim();
  }

  isSlopElement(element, isComment = false) {
    // For posts, extract only the main content text, excluding comments
    let text = '';
    const isLinkedIn = window.location.hostname.includes('linkedin.com');

    if (!isComment) {
      // Special handling for LinkedIn to get full post text
      if (isLinkedIn) {
        text = this.extractLinkedInFullText(element);
      } else {
        // For other platforms, use the existing logic
        const selectors = this.getPlatformCommentSelectors();
        if (selectors && selectors.posts && selectors.posts.length > 0) {
          // Try to find the post content specifically
          const contentElements = [];
          selectors.posts.forEach(sel => {
            const found = element.querySelectorAll(sel);
            found.forEach(el => contentElements.push(el));
          });

          if (contentElements.length > 0) {
            // Use only the post content text
            text = contentElements.map(el => {
              // Clone the element to avoid modifying original
              const clone = el.cloneNode(true);
              // Remove any comment sections from the clone
              const commentSections = clone.querySelectorAll('.comments-comment-item, [class*="comment"]');
              commentSections.forEach(c => c.remove());
              return clone.textContent || '';
            }).join(' ');
          } else {
            // Fallback: use element text but try to exclude comments
            const clone = element.cloneNode(true);
            const commentSections = clone.querySelectorAll('.comments-comment-item, [class*="comment"], .comment, [id*="comment"]');
            commentSections.forEach(c => c.remove());
            text = clone.textContent || '';
          }
        } else {
          // Generic approach: try to exclude comment sections
          const clone = element.cloneNode(true);
          const commentSections = clone.querySelectorAll('[class*="comment"], [id*="comment"], .comment');
          commentSections.forEach(c => c.remove());
          text = clone.textContent || '';
        }
      }
    } else {
      // For comments, just use the element's text
      text = element.textContent || '';
    }

    // Skip only if completely empty or whitespace-only
    if (text.length < 5) {
      return { isSlop: false, matches: [] };
    }

    // Normalize Unicode fancy text (bold, italic, script, etc.) to regular ASCII
    // This prevents LinkedIn engagement bait using 𝐛𝐨𝐥𝐝 𝐭𝐞𝐱𝐭 from evading detection
    text = this.normalizeUnicode(text);

    let slopScore = 0;
    const matchedPhrases = new Set(); // Track unique matched phrases

    // LinkedIn-SPECIFIC: Count emojis in posts (respects blockEmojis setting)
    // isLinkedIn already declared at top of function
    if (isLinkedIn && !isComment && this.blockEmojis) {
      // Comprehensive emoji regex covering all Unicode emoji ranges
      const emojiRegex = /[\u{1F300}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E0}-\u{1F1FF}\u{1F191}-\u{1F251}\u{1F004}\u{1F0CF}\u{1F170}-\u{1F171}\u{1F17E}-\u{1F17F}\u{1F18E}\u{3030}\u{2B50}\u{2B55}\u{2934}-\u{2935}\u{2B05}-\u{2B07}\u{2B1B}-\u{2B1C}\u{3297}\u{3299}\u{303D}\u{00A9}\u{00AE}\u{2122}\u{23F0}-\u{23F3}\u{23E9}-\u{23EF}\u{25AA}-\u{25AB}\u{25B6}\u{25C0}\u{25FB}-\u{25FE}\u{2600}-\u{2604}\u{260E}\u{2611}\u{2614}-\u{2615}\u{2618}\u{261D}\u{2620}\u{2622}-\u{2623}\u{2626}\u{262A}\u{262E}-\u{262F}\u{2638}-\u{263A}\u{2640}\u{2642}\u{2648}-\u{2653}\u{265F}-\u{2660}\u{2663}\u{2665}-\u{2666}\u{2668}\u{267B}\u{267E}-\u{267F}\u{2692}-\u{2697}\u{2699}\u{269B}-\u{269C}\u{26A0}-\u{26A1}\u{26A7}\u{26AA}-\u{26AB}\u{26B0}-\u{26B1}\u{26BD}-\u{26BE}\u{26C4}-\u{26C5}\u{26C8}\u{26CE}-\u{26CF}\u{26D1}\u{26D3}-\u{26D4}\u{26E9}-\u{26EA}\u{26F0}-\u{26F5}\u{26F7}-\u{26FA}\u{26FD}\u{2702}\u{2705}\u{2708}-\u{270D}\u{270F}\u{2712}\u{2714}\u{2716}\u{271D}\u{2721}\u{2728}\u{2733}-\u{2734}\u{2744}\u{2747}\u{274C}\u{274E}\u{2753}-\u{2755}\u{2757}\u{2763}-\u{2764}\u{2795}-\u{2797}\u{27A1}\u{27B0}\u{27BF}\u{2934}-\u{2935}\u{2B05}-\u{2B07}\u{2B1B}-\u{2B1C}\u{2B50}\u{2B55}\u{3030}\u{303D}\u{3297}\u{3299}]/gu;
      const emojiMatches = text.match(emojiRegex);
      if (emojiMatches) {
        const emojiCount = emojiMatches.length;
        if (emojiCount >= 2) {
          // 2+ emojis = instant slop on LinkedIn
          slopScore += emojiCount * 3; // 3 points per emoji
          matchedPhrases.add(`[Emoji Spam] ${emojiCount} emojis in post`);
        } else if (emojiCount === 1) {
          // Even 1 emoji is suspicious on LinkedIn
          slopScore += 2;
          matchedPhrases.add('[Emoji] Emoji in post');
        }
      }
    }

    // Check Tier 1 (AI slop) - Always active at sensitivity 1+
    if (this.sensitivity >= 1) {
      for (const pattern of this.lowAggroPatterns) {
        const matches = text.match(pattern);
        if (matches) {
          slopScore += matches.length * 3;
          matches.forEach(m => matchedPhrases.add(`[Tier 1] ${m.trim()}`));
        }
      }
    }

    // Check Tier 2 (Corporate buzzwords) - Active at sensitivity 3+
    if (this.sensitivity >= 3) {
      for (const pattern of this.mediumAggroPatterns) {
        const matches = text.match(pattern);
        if (matches) {
          slopScore += matches.length * 2;
          matches.forEach(m => matchedPhrases.add(`[Tier 2] ${m.trim()}`));
        }
      }
    }

    // Check Tier 3 (Marketing spam) - Active at sensitivity 4+
    if (this.sensitivity >= 4) {
      for (const pattern of this.highAggroPatterns) {
        const matches = text.match(pattern);
        if (matches) {
          slopScore += matches.length * 1;
          matches.forEach(m => matchedPhrases.add(`[Tier 3] ${m.trim()}`));
        }
      }
    }

    // Check custom patterns (if any)
    if (this.customPatterns && this.customPatterns.length > 0) {
      for (const item of this.customPatterns) {
        const matches = text.match(item.pattern);
        if (matches) {
          slopScore += matches.length * item.weight;
          matches.forEach(m => matchedPhrases.add(`[Custom] ${m.trim()}`));
        }
      }
    }

    // Check emoji patterns if toggle is on
    if (this.blockEmojis) {
      for (const pattern of this.emojiPatterns) {
        const matches = text.match(pattern);
        if (matches) {
          slopScore += matches.length * 5; // Heavy weight for emoji slop
          matches.forEach(m => matchedPhrases.add(`[Emoji] ${m.trim()}`));
        }
      }
    }

    // Check stop words if toggle is on
    if (this.blockStopWords) {
      for (const pattern of this.stopWordPatterns) {
        const matches = text.match(pattern);
        if (matches) {
          slopScore += matches.length * 3; // High weight for stop words
          matches.forEach(m => matchedPhrases.add(`[Stop Word] ${m.trim()}`));
        }
      }
    }

    // Check em dashes if toggle is on
    if (this.blockEmDashes) {
      for (const pattern of this.emDashPatterns) {
        const matches = text.match(pattern);
        if (matches) {
          slopScore += matches.length * 3; // High weight for em dash overuse
          matchedPhrases.add('[Em Dash Overuse]');
        }
      }
    }

    // Check political patterns if toggle is enabled
    if (this.blockPolitics) {
      for (const pattern of this.politicalPatterns) {
        const matches = text.match(pattern);
        if (matches) {
          slopScore += matches.length * 5; // High weight for political content
          matches.forEach(m => matchedPhrases.add(`[Political] ${m.trim()}`));
        }
      }
    }

    // Dynamic threshold based on sensitivity
    const thresholds = {
      1: 15, // Very conservative - need lots of Low Aggro matches
      2: 12, // Conservative
      3: 9,  // Balanced - good for most use
      4: 6,  // Aggressive
      5: 4   // Very aggressive - nuclear option
    };

    const threshold = thresholds[this.sensitivity] || 9;
    const isSlop = slopScore >= threshold;

    return {
      isSlop,
      matches: Array.from(matchedPhrases).slice(0, 10), // Limit to 10 most relevant
      score: slopScore
    };
  }

  removeElement(element, matches = [], isComment = false, isYouTube = false) {
    let target = element;
    let parent = element.parentElement;
    let depth = 0;
    const maxDepth = 5; // Limit how far up we climb

    // Platform-specific handling
    const isLinkedIn = window.location.hostname.includes('linkedin.com');

    // For YouTube videos, target the video renderer element directly
    if (isYouTube) {
      // YouTube video elements are already at the right level
      // Just ensure we have the right container
      const tagName = element.tagName.toLowerCase();
      if (tagName.includes('ytd-') || tagName.includes('yt-')) {
        target = element;
      }
    } else if (isComment) {
      // For comments, don't climb the DOM - just target the comment itself
      // On LinkedIn, find the comment item container
      if (isLinkedIn) {
        while (parent && parent !== document.body && depth < 3) {
          const className = parent.className || '';
          if (className.includes('comments-comment-item')) {
            target = parent;
            break;
          }
          parent = parent.parentElement;
          depth++;
        }
      }
      // For other platforms, target the comment element directly
      // We don't climb up for comments to avoid removing parent elements
    } else if (isLinkedIn) {
      // For LinkedIn posts, find the specific post container but don't go too high
      while (parent && parent !== document.body && depth < maxDepth) {
        const className = parent.className || '';
        if (className.includes('feed-shared-update-v2') ||
            className.includes('feed-shared-update') ||
            parent.hasAttribute('data-id')) {
          target = parent;
          break;
        }
        // Stop if we hit the main feed container
        if (className.includes('scaffold-finite-scroll') ||
            className.includes('feed-shared-update-v2__container') ||
            parent.id === 'main') {
          break;
        }
        parent = parent.parentElement;
        depth++;
      }
    } else {
      // For other sites, find a reasonable container
      while (parent && parent !== document.body && depth < maxDepth) {
        const className = parent.className || '';

        // Stop if we hit a major container we shouldn't remove
        if (className.includes('feed-container') ||
            className.includes('main-content') ||
            className.includes('site-content') ||
            parent.id === 'main' ||
            parent.id === 'content') {
          break;
        }

        if (parent.tagName === 'ARTICLE' ||
            (parent.className && (
              className.includes('post') ||
              className.includes('card') ||
              className.includes('entry')
            ))) {
          target = parent;
          break;
        }
        parent = parent.parentElement;
        depth++;
      }
    }

    // Mark as detected
    if (!target.hasAttribute('data-deslop-detected')) {
      target.setAttribute('data-deslop-detected', 'true');

      // Store matched patterns for tooltip
      if (matches && matches.length > 0) {
        target.setAttribute('data-deslop-matches', JSON.stringify(matches));
      }

      // In detection only mode, highlight instead of hide
      if (this.detectionOnly) {
        target.classList.add('deslop-detected');
        target.classList.remove('deslop-removed');

        // Add tooltip functionality for detection only mode
        this.addTooltip(target, matches);
      } else {
        target.classList.add('deslop-removed');
        target.classList.remove('deslop-detected');
      }

      this.slopCount++;
    }
  }

  addTooltip(element, matches) {
    let tooltip = null;

    const showTooltip = (e) => {
      // Only show tooltip if hovering near the top of the element (where the label is)
      const rect = element.getBoundingClientRect();
      if (e.clientY - rect.top > 40) return; // Only show if within 40px of top

      // Remove any existing tooltip
      if (tooltip) tooltip.remove();

      // Create tooltip
      tooltip = document.createElement('div');
      tooltip.className = 'deslop-tooltip';

      // Build tooltip content with optional suggestions
      let tooltipContent = `<div class="deslop-tooltip-header">Detected Slop Patterns:</div>`;

      if (this.showSuggestions) {
        // Show matches with suggestions
        tooltipContent += '<div class="deslop-tooltip-list">';
        matches.slice(0, 8).forEach(m => {
          const cleanMatch = m.replace(/^\[(Tier \d+|Stop Word|Emoji|Em Dash[^\]]*|Custom)\]\s*/i, '').trim().toLowerCase();
          const suggestion = this.getSuggestionFor(cleanMatch);

          if (suggestion) {
            tooltipContent += `
              <div class="deslop-tooltip-item">
                <div class="deslop-match">${this.escapeHtml(m)}</div>
                <div class="deslop-suggestion">Try: ${this.escapeHtml(suggestion)}</div>
              </div>
            `;
          } else {
            tooltipContent += `<div class="deslop-tooltip-item">${this.escapeHtml(m)}</div>`;
          }
        });
        tooltipContent += '</div>';
      } else {
        // Show matches only (original behavior)
        tooltipContent += `
          <div class="deslop-tooltip-list">
            ${matches.slice(0, 8).map(m => `<div class="deslop-tooltip-item">${this.escapeHtml(m)}</div>`).join('')}
          </div>
        `;
      }

      if (matches.length > 8) {
        tooltipContent += `<div class="deslop-tooltip-more">...and ${matches.length - 8} more</div>`;
      }

      tooltip.innerHTML = tooltipContent;
      document.body.appendChild(tooltip);

      // Position tooltip
      const tooltipRect = tooltip.getBoundingClientRect();
      const left = Math.min(e.clientX + 10, window.innerWidth - tooltipRect.width - 10);
      const top = Math.min(e.clientY + 10, window.innerHeight - tooltipRect.height - 10);

      tooltip.style.left = left + 'px';
      tooltip.style.top = top + 'px';
    };

    const hideTooltip = () => {
      if (tooltip) {
        tooltip.remove();
        tooltip = null;
      }
    };

    element.addEventListener('mouseenter', showTooltip);
    element.addEventListener('mousemove', showTooltip);
    element.addEventListener('mouseleave', hideTooltip);
  }

  // Get suggestion for a matched slop phrase
  getSuggestionFor(phrase) {
    phrase = phrase.toLowerCase().trim();

    // Check exact match first
    if (this.suggestionMap[phrase]) {
      return this.suggestionMap[phrase];
    }

    // Try partial matches (for phrases that might have variations)
    for (const [key, value] of Object.entries(this.suggestionMap)) {
      if (phrase.includes(key) || key.includes(phrase)) {
        return value;
      }
    }

    return null;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  observeChanges() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Use platform-specific selectors for dynamic content too
            const isLinkedIn = window.location.hostname.includes('linkedin.com');
            const isX = window.location.hostname.includes('twitter.com') || window.location.hostname.includes('x.com');
            const isYouTube = window.location.hostname.includes('youtube.com');

            let selector = 'article, [class*="post"], .card';

            if (isLinkedIn) {
              selector = '.feed-shared-update-v2, [data-id*="urn:li:activity"], article';
            } else if (isX) {
              selector = '[data-testid="tweet"], article';
            } else if (isYouTube) {
              // Handle YouTube video elements
              const videoSelectors = [
                'ytd-rich-item-renderer',
                'ytd-video-renderer',
                'ytd-grid-video-renderer',
                'ytd-compact-video-renderer',
                'ytd-reel-video-renderer'
              ];

              videoSelectors.forEach(sel => {
                // Convert NodeList to Array so we can use push()
                const videos = node.querySelectorAll ? Array.from(node.querySelectorAll(sel)) : [];

                // Also check if the node itself is a video element
                if (node.matches && node.matches(sel)) {
                  videos.push(node);
                }

                videos.forEach(video => {
                  if (video.hasAttribute('data-deslop-checked')) return;
                  video.setAttribute('data-deslop-checked', 'true');

                  const result = this.isYouTubeVideoSlop(video);
                  if (result.isSlop) {
                    this.removeElement(video, result.matches, false, true);
                    this.updateBadge();
                  }
                });
              });

              // Also check for comments
              const commentSelectors = ['ytd-comment-renderer', 'ytd-comment-thread-renderer'];
              commentSelectors.forEach(sel => {
                // Convert NodeList to Array so we can use push()
                const comments = node.querySelectorAll ? Array.from(node.querySelectorAll(sel)) : [];

                if (node.matches && node.matches(sel)) {
                  comments.push(node);
                }

                comments.forEach(comment => {
                  if (comment.hasAttribute('data-deslop-comment-checked')) return;
                  comment.setAttribute('data-deslop-comment-checked', 'true');

                  const result = this.isSlopElement(comment, true);
                  if (result.isSlop) {
                    this.removeElement(comment, result.matches, true);
                    this.updateBadge();
                  }
                });
              });

              return;
            }

            // Check both children AND if the node itself matches the selector
            const elements = node.querySelectorAll ? Array.from(node.querySelectorAll(selector)) : [];

            // Also check if the node itself is a post element (critical for LinkedIn!)
            if (node.matches && node.matches(selector)) {
              elements.push(node);
            }

            elements.forEach(el => {
              const result = this.isSlopElement(el);
              if (result.isSlop) {
                this.removeElement(el, result.matches);
                this.updateBadge();
              }
            });
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  updateBadge() {
    // Check if extension context is still valid
    if (!chrome.runtime?.id) {
      console.log('[De-Slop] Extension context invalidated - page reload required');
      return;
    }

    try {
      chrome.runtime.sendMessage({
        action: 'updateBadge',
        count: this.slopCount
      });
    } catch (error) {
      // Extension was reloaded, context is gone
      console.log('[De-Slop] Could not update badge:', error.message);
    }
  }
}

// Initialize when page loads
// Check if extension context is valid before initializing
if (chrome.runtime?.id) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      new SlopDetector();
    });
  } else {
    new SlopDetector();
  }
} else {
  console.log('[De-Slop] Extension context not available - reload page after extension update');
}
