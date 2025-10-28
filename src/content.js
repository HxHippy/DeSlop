// De-Slop Content Script
// Three-tier aggression system for detecting AI-generated slop

class SlopDetector {
  constructor() {
    this.slopCount = 0;
    this.sensitivity = 3; // Default to medium
    this.customPatterns = []; // User-defined patterns with custom weights
    this.stopWordPatterns = []; // Marketing engagement openers
    this.emDashPatterns = []; // Em dash overuse
    this.whitelist = []; // User-defined whitelist
    this.loadSettings();
    this.initPatterns();
  }

  async loadSettings() {
    try {
      const settings = await chrome.storage.sync.get({
        enabled: true,
        sensitivity: 3,
        customPatterns: null,
        blockEmojis: false,
        blockTier1: true,
        blockTier2: true,
        blockTier3: false,
        blockStopWords: true,
        blockEmDashes: true,
        whitelist: []
      });

      this.sensitivity = settings.sensitivity;
      this.enabled = settings.enabled;
      this.blockEmojis = settings.blockEmojis;
      this.blockTier1 = settings.blockTier1;
      this.blockTier2 = settings.blockTier2;
      this.blockTier3 = settings.blockTier3;
      this.blockStopWords = settings.blockStopWords;
      this.blockEmDashes = settings.blockEmDashes;
      this.whitelist = settings.whitelist || [];

      // Load custom patterns if available
      if (settings.customPatterns) {
        this.loadCustomPatterns(settings.customPatterns);
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

  loadCustomPatterns(customPatterns) {
    // Convert string patterns back to RegExp objects
    const convertPatterns = (patterns) => {
      return patterns.map(p => {
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
      this.lowAggroPatterns = convertPatterns(customPatterns.tier1);
    }
    if (customPatterns.tier2) {
      this.mediumAggroPatterns = convertPatterns(customPatterns.tier2);
    }
    if (customPatterns.tier3) {
      this.highAggroPatterns = convertPatterns(customPatterns.tier3);
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

  initPatterns() {
    // LOW AGGRO TIER (Tier 1) - AI-Specific Indicators
    // Weight: 3 points per match
    // Most blatant AI slop - overused LLM phrases, structural tells
    this.lowAggroPatterns = [
      // Signature AI phrases
      /\bdelve into\b/gi,
      /\bdelving into (the )?(intricacies|complexities)\b/gi,
      /\bnavigat(e|ing) (the|this) (complex )?(landscape|realm|world)\b/gi,
      /\bin (today's|the) (rapidly )?evolving (landscape|world|market|era)\b/gi,
      /\bin today's (digital|modern|fast-paced) (world|landscape|era)\b/gi,
      /\bembark on (a|this|your) journey\b/gi,
      /\btapestry of\b/gi,
      /\brealm of possibilities\b/gi,
      /\bthe (beauty|power|importance) lies in\b/gi,
      /\bultimately,? (the )?(choice|decision) is yours\b/gi,
      /\bmultifaceted (nature|approach|aspect)\b/gi,
      /\bholistic(ally)? (approach|perspective|view)\b/gi,
      /\bseamlessly integrat(e|ing|ed)\b/gi,
      /\bunlock (the potential|new possibilities|unprecedented)\b/gi,
      /\bfoster (innovation|growth|collaboration)\b/gi,
      /\bintricate (details|balance|web)\b/gi,
      /\bnuanced (understanding|approach|perspective)\b/gi,
      /\bmeticulous (attention|planning|care)\b/gi,
      /\bever-evolving (landscape|world|field)\b/gi,
      /\bdynamic (environment|landscape|nature)\b/gi,
      /\bpivotal (role|moment|point)\b/gi,
      /\bin the grand scheme of things\b/gi,
      /\bcornerstones? of\b/gi,
      /\bkey takeaways?\b/gi,
      /\bexplore (the|various) facets of\b/gi,
      /\btransformative (power|potential|impact|insights)\b/gi,
      /\bgame-?chang(er|ing)\b/gi,
      /\bparadigm shift\b/gi,
      /\bgroundbreaking\b/gi,
      /\bunprecedented\b/gi,
      /\brobust (solution|framework|system|approach)\b/gi,
      /\bcomprehensive (guide|overview|analysis|approach)\b/gi,
      /\bleverage (the power|cutting-edge)\b/gi,
      /\bit'?s (important|worth|essential) to (note|consider|understand) that\b/gi,
      /\bin this article,? (we will|we'll|I'll|I will)\b/gi,
      /\bthroughout (this|the) (article|guide|post)\b/gi,
      /\bas an AI (language model|assistant)\b/gi,
      /\bI (don't|do not|cannot|can't) have (personal|real-time|access to)\b/gi,
      /\bcannot be overstated\b/gi,
      /\bdeep dive into\b/gi,
      /\bshed(ding)? light on\b/gi,
      /\bunparalleled\b/gi,
      /\btreasure trove\b/gi,
      /\buncharted waters\b/gi,
      /\bstate-of-the-art\b/gi,
      /\bcutting[- ]edge\b/gi,
      /\bnext frontier\b/gi,
      /\bthought[- ]provoking\b/gi,
      /\bat the end of the day\b/gi,
      /\baction(able)? insights?\b/gi,
      /\bin conclusion\b/gi,
      /\bin summary\b/gi,
      /\bto summarize\b/gi,
      /\bmoving forward\b/gi,
      /\bgoing forward\b/gi,

      // Structural patterns
      /^(In conclusion|In summary|To summarize|Ultimately),?\s/mi,
      /\bNot only .{10,50} but (also)?\b/gi,
      /\bIt'?s not (just )?about .{5,30},? it'?s\b/gi,
      /\bDespite (its|their) .{5,30},? .{5,30} faces? challenges?\b/gi,
      /\bFuture Prospects?:?\b/gi,

      // Excessive transition words
      /\b(Furthermore|Moreover|Additionally|Consequently|Nevertheless|Nonetheless),?\s/gi,

      // Generic openers
      /^(As |In |With |Through |During |From ).{20,60}(continues? to|has become|have become|is becoming)\b/mi,
      /^In today's .{10,40} world,?\s/mi,

      // Listicle patterns
      /\b\d+\s+(ways|reasons|tips|tricks|secrets|hacks|benefits|advantages)\s+to\b/gi,
      /\b(Top|Best)\s+\d+\b/gi,
      /\bUltimate guide to\b/gi,
      /\bEverything you need to know about\b/gi,
      /\bBeginner'?s guide to\b/gi,

      // Unearned profundity
      /\bSomething shifted\b/gi,
      /\bEverything changed\b/gi,
      /\bBut here'?s the thing\b/gi,
      /\bHere'?s what (I|you|we) learned\b/gi,

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
      /\bscience fiction .{5,30} but in 20\d{2}\b/gi

      // Marketing engagement stop words and em dashes moved to separate arrays below for independent toggling
    ];

    // Separate out stop words (marketing engagement openers) - can be toggled independently
    this.stopWordPatterns = [
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
      /^(Hot|Breaking) (take|news)[!:]/gim
    ];

    // Separate out em dash patterns - can be toggled independently
    this.emDashPatterns = [
      /—.{10,100}—/g,  // Em dash pairs
      /—/g              // Any em dash
    ];

    // EMOJI PATTERNS - Separate toggle
    // LinkedIn thought leader special - emoji spam
    this.emojiPatterns = [
      // Emoji followed by buzzwords
      /[\u{1F300}-\u{1F9FF}][\s]*Revolutioniz(e|ing)/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Transform(ing|ative)/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Innovati(ng|on|ve)/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Disrupt(ing|ive)/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Game[- ]changer/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Unlock(ing)? the/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Navigating the/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Building the future/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Leading the way/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Breaking barriers/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Exciting (news|announcement)/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Proud to (announce|share)/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Thrilled to/giu,

      // Multiple emojis in short span (LinkedIn slop signature)
      /[\u{1F300}-\u{1F9FF}].{0,30}[\u{1F300}-\u{1F9FF}].{0,30}[\u{1F300}-\u{1F9FF}]/giu,

      // Emoji at start of post/sentence (thought leader tell)
      /^[\u{1F300}-\u{1F9FF}][\s]*/gmu,
      /\.[\s]*[\u{1F300}-\u{1F9FF}][\s]*/gmu,

      // Any emoji (nuclear option)
      /[\u{1F300}-\u{1F9FF}]/giu
    ];

    // MEDIUM AGGRO TIER (Tier 2) - Corporate & Tech Buzzwords
    // Weight: 2 points per match
    // Common business jargon and hype
    this.mediumAggroPatterns = [
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
      /\bscale\b/gi,
      /\bagile\b/gi,
      /\bbandwidth\b/gi,
      /\bcore competenc(y|ies)\b/gi,
      /\bstakeholders?\b/gi,
      /\bvalue[- ]add\b/gi,
      /\bthought leader(ship)?\b/gi,
      /\bbest practices?\b/gi,
      /\bblue[- ]sky thinking\b/gi,
      /\bboil the ocean\b/gi,
      /\bdrink the kool[- ]aid\b/gi,
      /\bducks in a row\b/gi,
      /\blow[- ]level\b/gi,
      /\bhigh[- ]level\b/gi,
      /\b30,?000[- ]foot view\b/gi,
      /\bideate\b/gi,
      /\boperationalize\b/gi,
      /\bsocialize\b/gi,
      /\bright[- ]?siz(e|ing)\b/gi,
      /\bin the weeds\b/gi,
      /\bon (my|your|our) radar\b/gi,
      /\bseat at the table\b/gi,
      /\bskin in the game\b/gi,
      /\brun (it )?up the flagpole\b/gi,
      /\bthrow under the bus\b/gi,
      /\brock ?star\b/gi,
      /\bninja\b/gi,
      /\bguru\b/gi,
      /\bbig data\b/gi,
      /\bdigital transformation\b/gi,
      /\bAI[- ]powered\b/gi,
      /\bcloud[- ]based\b/gi,
      /\bblockchain[- ]enabled\b/gi,
      /\bnext[- ]gen(eration)?\b/gi,
      /\bdata[- ]driven\b/gi,
      /\bcustomer[- ]centric\b/gi,
      /\bvalue proposition\b/gi,
      /\bcompetitive (advantage|landscape)\b/gi,
      /\bmarket (share|penetration|trends?)\b/gi,
      /\bROI\b/gi,
      /\bKPI\b/gi,
      /\bSLA\b/gi,
      /\bMVP\b/gi,
      /\bPOC\b/gi,
      /\bdeep dive\b/gi,
      /\bdouble click\b/gi,
      /\bdeliverables?\b/gi,
      /\baction items?\b/gi,
      /\bwheelhouse\b/gi,
      /\bnimble\b/gi,
      /\bempower(ment)?\b/gi,
      /\bdriv(e|ing) innovation\b/gi,
      /\bfostering\b/gi,
      /\benhance\b/gi,
      /\boptimize\b/gi,
      /\bstreamline\b/gi,
      /\bmaximize\b/gi
    ];

    // HIGH AGGRO TIER (Tier 3) - Marketing Clichés & Fillers
    // Weight: 1 point per match
    // Broad net for promotional spam and vague language
    this.highAggroPatterns = [
      /\bfree\b/gi,
      /\bguaranteed\b/gi,
      /\bamazing\b/gi,
      /\bincredible\b/gi,
      /\bunbelievable\b/gi,
      /\bmind[- ]blowing\b/gi,
      /\brevolutionary\b/gi,
      /\bmiracle\b/gi,
      /\bbest[- ]in[- ]class\b/gi,
      /\btop[- ]of[- ]the[- ]line\b/gi,
      /\bstate[- ]of[- ]the[- ]art\b/gi,
      /\bclick here\b/gi,
      /\bbuy now\b/gi,
      /\bact (now|immediately)\b/gi,
      /\blimited time offer\b/gi,
      /\bdon'?t wait\b/gi,
      /\bonce in a lifetime\b/gi,
      /\bno strings attached\b/gi,
      /\brisk[- ]free\b/gi,
      /\bdouble your income\b/gi,
      /\bmake money\b/gi,
      /\bearn money\b/gi,
      /\bfast cash\b/gi,
      /\bproven results\b/gi,
      /\bspecial promotion\b/gi,
      /\bsave big\b/gi,
      /\blowest price\b/gi,
      /\bbest (deal|price|offer)\b/gi,
      /\bno cost\b/gi,
      /\bfree consultation\b/gi,
      /\bexpertly curated\b/gi,
      /\bmust[- ]have\b/gi,
      /\bnext[- ]level\b/gi,
      /\braise(d)? the bar\b/gi,
      /\bstand out from the crowd\b/gi,
      /\bspread like wildfire\b/gi,
      /\btake .{5,30} (to the next level|by storm)\b/gi,
      /\bthrow .{5,30} against the wall\b/gi,
      /\btip of the iceberg\b/gi,
      /\bunder the radar\b/gi,
      /\bcontent is king\b/gi,
      /\bSEO is dead\b/gi,
      /\bkiller (content|anything)\b/gi,
      /\bhit the ground running\b/gi,
      /\bfrom the (beginning of time|dawn of man)\b/gi,
      /\bthe fact of the matter is\b/gi,
      /\bthe long and short of it\b/gi,
      /\bwhen all is said and done\b/gi,
      /\bin a nutshell\b/gi,
      /\bbasically\b/gi,
      /\bessentially\b/gi,
      /\bactually\b/gi
    ];
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
    const isTwitter = window.location.hostname.includes('twitter.com') || window.location.hostname.includes('x.com');
    const isMedium = window.location.hostname.includes('medium.com');

    let selector = 'article, [class*="post"], .card, section[class*="content"]';

    if (isLinkedIn) {
      // Target individual LinkedIn posts, not the feed container
      selector = '.feed-shared-update-v2, [data-id*="urn:li:activity"], article';
    } else if (isTwitter) {
      selector = '[data-testid="tweet"], article';
    } else if (isMedium) {
      selector = 'article, .postArticle, [data-action="show-recommends-prompt"]';
    }

    const elements = document.querySelectorAll(selector);

    elements.forEach(el => {
      if (this.isSlopElement(el)) {
        this.removeElement(el);
      }
    });
  }

  isSlopElement(element) {
    const text = element.textContent || '';

    // Skip if too short
    if (text.length < 100) return false;

    let slopScore = 0;

    // Check Tier 1 (AI slop) if enabled and sensitivity allows
    if (this.blockTier1 && this.sensitivity >= 1) {
      for (const pattern of this.lowAggroPatterns) {
        const matches = text.match(pattern);
        if (matches) {
          slopScore += matches.length * 3;
        }
      }
    }

    // Check Tier 2 (Corporate buzzwords) if enabled and sensitivity allows
    if (this.blockTier2 && this.sensitivity >= 3) {
      for (const pattern of this.mediumAggroPatterns) {
        const matches = text.match(pattern);
        if (matches) {
          slopScore += matches.length * 2;
        }
      }
    }

    // Check Tier 3 (Marketing spam) if enabled and sensitivity allows
    if (this.blockTier3 && this.sensitivity >= 4) {
      for (const pattern of this.highAggroPatterns) {
        const matches = text.match(pattern);
        if (matches) {
          slopScore += matches.length * 1;
        }
      }
    }

    // Check custom patterns (if any)
    if (this.customPatterns && this.customPatterns.length > 0) {
      for (const item of this.customPatterns) {
        const matches = text.match(item.pattern);
        if (matches) {
          slopScore += matches.length * item.weight;
        }
      }
    }

    // Check emoji patterns if toggle is on
    if (this.blockEmojis) {
      for (const pattern of this.emojiPatterns) {
        const matches = text.match(pattern);
        if (matches) {
          slopScore += matches.length * 5; // Heavy weight for emoji slop
        }
      }
    }

    // Check stop words if toggle is on
    if (this.blockStopWords) {
      for (const pattern of this.stopWordPatterns) {
        const matches = text.match(pattern);
        if (matches) {
          slopScore += matches.length * 3; // High weight for stop words
        }
      }
    }

    // Check em dashes if toggle is on
    if (this.blockEmDashes) {
      for (const pattern of this.emDashPatterns) {
        const matches = text.match(pattern);
        if (matches) {
          slopScore += matches.length * 3; // High weight for em dash overuse
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
    return slopScore >= threshold;
  }

  removeElement(element) {
    let target = element;
    let parent = element.parentElement;
    let depth = 0;
    const maxDepth = 5; // Limit how far up we climb

    // Platform-specific handling
    const isLinkedIn = window.location.hostname.includes('linkedin.com');

    if (isLinkedIn) {
      // For LinkedIn, find the specific post container but don't go too high
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

    // Mark as removed and hide
    if (!target.hasAttribute('data-deslop-removed')) {
      target.setAttribute('data-deslop-removed', 'true');
      target.classList.add('deslop-removed');
      this.slopCount++;
    }
  }

  observeChanges() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Use platform-specific selectors for dynamic content too
            const isLinkedIn = window.location.hostname.includes('linkedin.com');
            const isTwitter = window.location.hostname.includes('twitter.com') || window.location.hostname.includes('x.com');

            let selector = 'article, [class*="post"], .card';

            if (isLinkedIn) {
              selector = '.feed-shared-update-v2, [data-id*="urn:li:activity"], article';
            } else if (isTwitter) {
              selector = '[data-testid="tweet"], article';
            }

            const elements = node.querySelectorAll ?
              node.querySelectorAll(selector) :
              [node];

            elements.forEach(el => {
              if (this.isSlopElement(el)) {
                this.removeElement(el);
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
