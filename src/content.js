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
    this.loadSettings();
    this.initPatterns();
    this.initSuggestionMap();
    this.initPoliticalPatterns();
  }

  async loadSettings() {
    try {
      const settings = await chrome.storage.sync.get({
        enabled: true,
        detectionOnly: false,
        sensitivity: 3,
        customPatterns: null,
        blockEmojis: false,
        blockStopWords: true,
        blockEmDashes: true,
        whitelist: [],
        showSuggestions: false,
        blockPolitics: false
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
      /\bscience fiction .{5,30} but in 20\d{2}\b/gi,

      // Additional AI-generated content tells
      /\blandscape is (constantly|rapidly|continuously) (changing|evolving|shifting)\b/gi,
      /\bever[- ]changing (world|landscape|environment)\b/gi,
      /\bfast[- ]paced (world|environment|landscape)\b/gi,
      /\bcrucial (to understand|to note|to recognize|that)\b/gi,
      /\bvital (to understand|to note|to recognize|that)\b/gi,
      /\bimportant to (understand|note|recognize|remember) that\b/gi,
      /\bworth noting that\b/gi,
      /\bit'?s worth mentioning\b/gi,
      /\bone (must|should) (consider|understand|recognize)\b/gi,
      /\bproven track record\b/gi,
      /\blong[- ]standing (tradition|practice|history)\b/gi,
      /\btime[- ]tested\b/gi,
      /\btried and (true|tested)\b/gi,
      /\bstand(s)? the test of time\b/gi,
      /\bexciting times ahead\b/gi,
      /\bbright future ahead\b/gi,
      /\bpromising future\b/gi,
      /\blooking ahead\b/gi,
      /\bas we look (to the future|forward|ahead)\b/gi,
      /\bshape the future of\b/gi,
      /\bfuture of .{5,30} (is|looks|appears)\b/gi,
      /\bpoised to (become|transform|revolutionize)\b/gi,
      /\bset to (become|transform|revolutionize)\b/gi,
      /\bon the (brink|cusp|verge) of\b/gi,
      /\bheralds? a new (era|age|chapter)\b/gi,
      /\buses?her(s|ing)? in a new (era|age|chapter)\b/gi,
      /\bmarks? a (turning|pivotal) point\b/gi,
      /\bwatershed moment\b/gi,
      /\binflection point\b/gi,
      /\btipping point\b/gi,
      /\bperfect storm of\b/gi,
      /\bconvergence of\b/gi,
      /\bintersection of\b/gi,
      /\bat the (crossroads|forefront|vanguard) of\b/gi,
      /\bspearhead(ing)? (the|a)\b/gi,
      /\bchampion(ing)? (the|a)\b/gi,
      /\bpioneer(ing)? (the|a|new)\b/gi,
      /\btrailblaz(er|ing)\b/gi,
      /\bindustry[- ]leading\b/gi,
      /\bmarket[- ]leading\b/gi,
      /\bworld[- ]class\b/gi,
      /\bbest[- ]of[- ]breed\b/gi,
      /\bcutting[- ]edge (technology|solution|approach|innovation)\b/gi,
      /\bbleeding[- ]edge\b/gi,
      /\bstate[- ]of[- ]the[- ]art (technology|solution|system)\b/gi,
      /\bnext[- ]generation (technology|solution|platform)\b/gi,
      /\bfuture[- ]proof(ing)?\b/gi,
      /\bforward[- ]thinking\b/gi,
      /\bvisionary (approach|leadership|thinking)\b/gi,
      /\bmission[- ]critical\b/gi,
      /\bbusiness[- ]critical\b/gi,
      /\bstrategic (imperative|importance|priority)\b/gi,
      /\bkey (driver|enabler|differentiator)\b/gi,
      /\bfundamental(ly)? (different|transform)\b/gi,
      /\bradical(ly)? (different|transform|change)\b/gi,
      /\bdramatic(ally)? (different|improve|increase)\b/gi,
      /\bsignificant(ly)? (improve|enhance|boost)\b/gi,
      /\bmassive(ly)? (improve|scale|grow)\b/gi,
      /\bexponential (growth|increase|improvement)\b/gi,
      /\bunique (opportunity|position|advantage)\b/gi,
      /\bdistinctive (feature|advantage|capability)\b/gi,
      /\bcompelling (reason|case|argument)\b/gi,
      /\bconvincing (evidence|case|argument)\b/gi,
      /\boverwhelmingly (positive|successful|clear)\b/gi,
      /\bundeniab(ly|le)\b/gi,
      /\birrefutabl(y|e)\b/gi,
      /\bincontrovertib(ly|le)\b/gi,
      /\bunequivocal(ly)?\b/gi,
      /\bdefinitively\b/gi,
      /\bcategorically\b/gi,
      /\bundoubtedly\b/gi,
      /\bwithout (a )?doubt\b/gi,
      /\bbeyond (a|any) (shadow of a )?doubt\b/gi,
      /\bneedles to say\b/gi,
      /\bit goes without saying\b/gi,
      /\bsuffice (it )?to say\b/gi,
      /\blong story short\b/gi,
      /\bto make a long story short\b/gi,
      /\bcutting to the chase\b/gi,
      /\bbottom line is\b/gi,
      /\bnet[- ]net\b/gi,
      /\ball things considered\b/gi,
      /\btaking everything into (account|consideration)\b/gi,
      /\bat this (point in time|juncture)\b/gi,
      /\bcurrent(ly)? in the (process|midst) of\b/gi,
      /\bgaining (traction|momentum)\b/gi,
      /\bpicking up (steam|speed|momentum)\b/gi,
      /\bon an upward trajectory\b/gi,
      /\bupward trend\b/gi,
      /\bskyrocket(ing)?\b/gi,
      /\bsurg(e|ing)\b/gi,
      /\bexplosive growth\b/gi,
      /\bmeteoric rise\b/gi,
      /\bunprecedented growth\b/gi,
      /\bunparalleled success\b/gi,
      /\brecord[- ]breaking\b/gi,
      /\ball[- ]time (high|low|record)\b/gi,
      /\bbar[- ]setting\b/gi,
      /\bbenchmark[- ]setting\b/gi,
      /\bindustry[- ]defining\b/gi,
      /\bmarket[- ]defining\b/gi,
      /\bcategory[- ]defining\b/gi

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
      /[\u{1F300}-\u{1F9FF}][\s]*Transform(ing|ative|ation)/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Innovati(ng|on|ve)/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Disrupt(ing|ive|ion)/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Game[- ]changer/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Unlock(ing)? (the|your)/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Navigating the/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Building (the future|tomorrow)/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Leading the (way|charge)/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Breaking (barriers|boundaries)/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Exciting (news|announcement|times)/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Proud to (announce|share|present)/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Thrilled to/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Honored to/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Grateful (for|to)/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Blessed to/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Humbled (by|to)/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*(Big|Huge|Major) (news|announcement)/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Level(ing)? up/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Next level/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Taking (it|things) to/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Raising the bar/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Pushing boundaries/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Breaking (new )?ground/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Making (waves|history|impact)/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Changing the game/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Shaping the future/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Driving (change|innovation|growth)/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Empowering/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Inspiring/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Amplifying/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Elevating/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Scaling/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Optimizing/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Maximizing/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Leveraging/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Harnessing/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Pioneering/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Spearheading/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Championing/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Crushing (it|goals)/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Killing it/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Nailing it/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Winning/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Slaying/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Dominating/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Conquering/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Launching/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Unveiling/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Introducing/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Announcing/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Revealing/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Dropping/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Shipping/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*(New|Fresh) (chapter|journey|adventure)/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Milestone (alert|achieved)/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Achievement unlocked/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Success story/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Plot twist/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Hot take/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Pro tip/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Life hack/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Growth hack/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Quick win/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Game plan/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Strategy/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Framework/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Blueprint/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Roadmap/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Masterclass/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Deep dive/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Behind the scenes/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Sneak peek/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Coming soon/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Stay tuned/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*Watch this space/giu,
      /[\u{1F300}-\u{1F9FF}][\s]*More to come/giu,

      // Emoji as bullet points or separators (slop formatting)
      /\n[\u{1F300}-\u{1F9FF}][\s]*/gmu,
      /^[\u{1F300}-\u{1F9FF}][\s]*[A-Z]/gmu,
      /[\u{1F300}-\u{1F9FF}][\s]*[\u{1F300}-\u{1F9FF}][\s]*[\u{1F300}-\u{1F9FF}]/giu,

      // Multiple same emojis (emphasis spam)
      /([\u{1F300}-\u{1F9FF}])\1{2,}/giu,
      /[\u{1F300}-\u{1F9FF}]{4,}/giu,

      // Multiple emojis in short span (LinkedIn slop signature)
      /[\u{1F300}-\u{1F9FF}].{0,30}[\u{1F300}-\u{1F9FF}].{0,30}[\u{1F300}-\u{1F9FF}]/giu,
      /[\u{1F300}-\u{1F9FF}].{0,50}[\u{1F300}-\u{1F9FF}]/giu,

      // Emoji at start of post/sentence (thought leader tell)
      /^[\u{1F300}-\u{1F9FF}][\s]*/gmu,
      /\.[\s]*[\u{1F300}-\u{1F9FF}][\s]*/gmu,
      /![\s]*[\u{1F300}-\u{1F9FF}][\s]*/gmu,

      // Emoji at end of sentences (punctuation replacement)
      /[\u{1F300}-\u{1F9FF}][\s]*$/gmu,
      /[\u{1F300}-\u{1F9FF}][\s]*\n/gmu,

      // Emoji surrounding text (attention grabbing)
      /[\u{1F300}-\u{1F9FF}][\s]*.{3,30}[\s]*[\u{1F300}-\u{1F9FF}]/giu,

      // Specific cringe emoji patterns
      /👇.{0,30}(link|comment|thread|below)/giu,
      /👆.{0,30}(above|check out)/giu,
      /👉.{0,30}(click|read|check|see)/giu,
      /🔥.{0,30}(hot|fire|lit|amazing)/giu,
      /💡.{0,30}(idea|tip|insight)/giu,
      /🚀.{0,30}(launch|grow|scale|rocket)/giu,
      /💪.{0,30}(strong|power|team)/giu,
      /🎯.{0,30}(target|goal|focus)/giu,
      /⚡.{0,30}(fast|quick|instant)/giu,
      /✨.{0,30}(magic|special|shine)/giu,
      /🌟.{0,30}(star|great|amazing)/giu,
      /💰.{0,30}(money|revenue|profit)/giu,
      /📈.{0,30}(growth|increase|up)/giu,
      /🎉.{0,30}(celebrate|congrat|party)/giu,
      /🎊.{0,30}(celebrate|milestone)/giu,
      /🏆.{0,30}(win|award|champion)/giu,
      /💯.{0,30}(percent|complete|perfect)/giu,
      /🔑.{0,30}(key|secret|unlock)/giu,
      /🎁.{0,30}(gift|bonus|free)/giu,
      /⏰.{0,30}(time|now|urgent|hurry)/giu,
      /🔔.{0,30}(alert|notification|reminder)/giu,
      /📣.{0,30}(announce|news|update)/giu,
      /📢.{0,30}(announce|shout|loud)/giu,
      /💬.{0,30}(comment|discuss|talk)/giu,
      /🤝.{0,30}(partner|collab|together)/giu,
      /❤️.{0,30}(love|passion|care)/giu,
      /🙏.{0,30}(thank|grateful|please)/giu,
      /👏.{0,30}(applaud|congrat|bravo)/giu,
      /🎓.{0,30}(learn|education|graduate)/giu,
      /📚.{0,30}(learn|book|knowledge)/giu,
      /🧠.{0,30}(brain|think|smart|intelligence)/giu,
      /🌍.{0,30}(world|global|international)/giu,
      /🌎.{0,30}(world|global|international)/giu,
      /🌏.{0,30}(world|global|international)/giu,

      // Emoji chains/walls (peak slop)
      /[\u{1F300}-\u{1F9FF}][\s]*[\u{1F300}-\u{1F9FF}][\s]*[\u{1F300}-\u{1F9FF}][\s]*[\u{1F300}-\u{1F9FF}][\s]*[\u{1F300}-\u{1F9FF}]/giu,

      // Emoji at beginning and end (sandwich pattern)
      /^[\u{1F300}-\u{1F9FF}].{20,200}[\u{1F300}-\u{1F9FF}]$/gmu,

      // Call to action with emoji
      /[\u{1F300}-\u{1F9FF}][\s]*(Click|Comment|Share|Like|Follow|Subscribe|Join|Sign up|Learn more|Read more|Get|Download|Try|Start)/giu,
      /(Click|Comment|Share|Like|Follow|Subscribe|Join|Sign up|Learn more|Read more|Get|Download|Try|Start).{0,20}[\u{1F300}-\u{1F9FF}]/giu,

      // Hashtag with emoji
      /#[a-zA-Z0-9]+[\u{1F300}-\u{1F9FF}]/giu,
      /[\u{1F300}-\u{1F9FF}]#[a-zA-Z0-9]+/giu,

      // Questions with emoji
      /[\u{1F300}-\u{1F9FF}][\s]*.{5,50}\?/giu,
      /.{5,50}\?[\s]*[\u{1F300}-\u{1F9FF}]/giu,

      // Emoji in all caps context (double slop)
      /[\u{1F300}-\u{1F9FF}][\s]*[A-Z]{4,}/gmu,
      /[A-Z]{4,}[\s]*[\u{1F300}-\u{1F9FF}]/gmu,

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
      /\bmaximize\b/gi,

      // Additional corporate buzzwords
      /\balignment\b/gi,
      /\balign(ing|ed) (with|to|on)\b/gi,
      /\bget (on|aligned on) the same page\b/gi,
      /\bsing from the same (hymn|song) (sheet|book)\b/gi,
      /\bget everyone on board\b/gi,
      /\bwin[- ]win\b/gi,
      /\bgain[- ]gain\b/gi,
      /\bmutually beneficial\b/gi,
      /\bpartnerships?\b/gi,
      /\bcollaborate\b/gi,
      /\bcross[- ]functional\b/gi,
      /\bcross[- ]pollination\b/gi,
      /\bhorizontal integration\b/gi,
      /\bvertical integration\b/gi,
      /\bend[- ]to[- ]end (solution|platform)\b/gi,
      /\bone[- ]stop[- ]shop\b/gi,
      /\bturnkey (solution|platform)\b/gi,
      /\bplug[- ]and[- ]play\b/gi,
      /\bout[- ]of[- ]the[- ]box\b/gi,
      /\bbaked[- ]in\b/gi,
      /\bnative(ly)? (support|integrate)\b/gi,
      /\bfirst[- ]class (support|citizen)\b/gi,
      /\bfull[- ]stack\b/gi,
      /\bhands[- ]on deck\b/gi,
      /\brolling up (our|my) sleeves\b/gi,
      /\brolls[- ]royce (of|standard)\b/gi,
      /\bgold standard\b/gi,
      /\bbest[- ]in[- ]class\b/gi,
      /\bworld[- ]beating\b/gi,
      /\btop[- ]tier\b/gi,
      /\bpremium (quality|tier|offering)\b/gi,
      /\benterprise[- ]grade\b/gi,
      /\bproduction[- ]ready\b/gi,
      /\bbattle[- ]tested\b/gi,
      /\bfield[- ]tested\b/gi,
      /\bproven (solution|platform|methodology)\b/gi,
      /\bvirtual(ly)? seamless\b/gi,
      /\bfriction(less)?\b/gi,
      /\bpainless\b/gi,
      /\beffortless(ly)?\b/gi,
      /\btransparent(ly)?\b/gi,
      /\bvisibility\b/gi,
      /\bobservability\b/gi,
      /\btelemetry\b/gi,
      /\binstrument(ation|ed)?\b/gi,
      /\bmetrics[- ]driven\b/gi,
      /\bmeasurable (impact|results|outcomes)\b/gi,
      /\bquantifiable (impact|results|benefits)\b/gi,
      /\bactionable (insights?|data|intelligence)\b/gi,
      /\bdata[- ]backed\b/gi,
      /\bevidence[- ]based\b/gi,
      /\bscientific (approach|method)\b/gi,
      /\bfirst principles\b/gi,
      /\bfrom the ground up\b/gi,
      /\bpurpose[- ]built\b/gi,
      /\btailor[- ]made\b/gi,
      /\bcustomized (solution|approach|strategy)\b/gi,
      /\bbespoke\b/gi,
      /\bwhite[- ]glove (service|treatment)\b/gi,
      /\bconcierge (service|level|tier)\b/gi,
      /\bpremium (service|support|experience)\b/gi,
      /\b24\/7\b/gi,
      /\baround[- ]the[- ]clock\b/gi,
      /\balways[- ]on\b/gi,
      /\b99\.9+%? (uptime|availability)\b/gi,
      /\bhigh[- ]availability\b/gi,
      /\bmission[- ]critical\b/gi,
      /\bfault[- ]tolerant\b/gi,
      /\bself[- ]healing\b/gi,
      /\bauto[- ]scaling\b/gi,
      /\belastic(ally)?\b/gi,
      /\bon[- ]demand\b/gi,
      /\bpay[- ]as[- ]you[- ]go\b/gi,
      /\bsubscription[- ]based\b/gi,
      /\bSaaS\b/gi,
      /\bPaaS\b/gi,
      /\bIaaS\b/gi,
      /\bXaaS\b/gi,
      /\bAs[- ]a[- ]Service\b/gi,
      /\bAPI[- ]first\b/gi,
      /\bmobile[- ]first\b/gi,
      /\bcloud[- ]first\b/gi,
      /\bcloud[- ]native\b/gi,
      /\bcontainerized\b/gi,
      /\bmicroservices\b/gi,
      /\bserverless\b/gi,
      /\bevent[- ]driven\b/gi,
      /\basync(hronous)?\b/gi,
      /\breal[- ]time\b/gi,
      /\binstant(ly)?\b/gi,
      /\blightning[- ]fast\b/gi,
      /\bblazing(ly)?[- ]fast\b/gi,
      /\bmillisecond (response|latency)\b/gi,
      /\blow[- ]latency\b/gi,
      /\bhigh[- ]performance\b/gi,
      /\bperformant\b/gi,
      /\bscalable\b/gi,
      /\bmodular\b/gi,
      /\bextensible\b/gi,
      /\bflexible\b/gi,
      /\badaptable\b/gi,
      /\bversatile\b/gi,
      /\bno[- ]code\b/gi,
      /\blow[- ]code\b/gi,
      /\bdrag[- ]and[- ]drop\b/gi,
      /\bpoint[- ]and[- ]click\b/gi,
      /\buser[- ]friendly\b/gi,
      /\bintuitive\b/gi,
      /\bseamless (experience|integration|workflow)\b/gi
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
      /\bactually\b/gi,

      // Additional marketing spam and weak language
      /\bawesome\b/gi,
      /\bfantastic\b/gi,
      /\bspectacular\b/gi,
      /\bphenomenal\b/gi,
      /\boutstanding\b/gi,
      /\bexceptional\b/gi,
      /\bextraordinary\b/gi,
      /\bremarkable\b/gi,
      /\bstunning\b/gi,
      /\bwonderful\b/gi,
      /\bsuperb\b/gi,
      /\bexquisite\b/gi,
      /\bmagnificent\b/gi,
      /\bglorious\b/gi,
      /\bsplendid\b/gi,
      /\bterrific\b/gi,
      /\bmarvelous\b/gi,
      /\bsensational\b/gi,
      /\bimpressive\b/gi,
      /\bawe[- ]inspiring\b/gi,
      /\bbreathtaking\b/gi,
      /\blife[- ]changing\b/gi,
      /\bgame[- ]changing\b/gi,
      /\bworld[- ]changing\b/gi,
      /\binsane(ly)?\b/gi,
      /\bcrazy (good|fast|powerful)\b/gi,
      /\bsick (deals?|features?)\b/gi,
      /\bepic\b/gi,
      /\blegendary\b/gi,
      /\bmythical\b/gi,
      /\bunicorn\b/gi,
      /\b10x\b/gi,
      /\b100x\b/gi,
      /\bmillion dollar\b/gi,
      /\bbillion dollar\b/gi,
      /\bfortune 500\b/gi,
      /\bwall street\b/gi,
      /\bsilicon valley\b/gi,
      /\bsecret(s)? (to|of)\b/gi,
      /\bhidden (secrets?|gems?|treasures?)\b/gi,
      /\binsider (secrets?|tips?|knowledge)\b/gi,
      /\bexclusive (access|offer|deal|content)\b/gi,
      /\bmembers[- ]only\b/gi,
      /\bVIP (access|membership|treatment)\b/gi,
      /\binvite[- ]only\b/gi,
      /\belite (group|club|members)\b/gi,
      /\binner circle\b/gi,
      /\btop 1%\b/gi,
      /\bhigh[- ]earners?\b/gi,
      /\bsuper[- ]users?\b/gi,
      /\bpower[- ]users?\b/gi,
      /\bearly (adopters?|access|bird)\b/gi,
      /\bfirst movers?\b/gi,
      /\bground floor\b/gi,
      /\bget in (now|early|first)\b/gi,
      /\bdon'?t miss out\b/gi,
      /\bFOMO\b/gi,
      /\bfear of missing out\b/gi,
      /\bwhile (supplies|stocks?) last\b/gi,
      /\bonly \d+ (left|remaining|available)\b/gi,
      /\balmost (gone|sold out)\b/gi,
      /\bselling (fast|quickly)\b/gi,
      /\bhurry\b/gi,
      /\bfast[- ]track\b/gi,
      /\bshortcut(s)?\b/gi,
      /\bcheat[- ]sheet\b/gi,
      /\bhack(s)?\b/gi,
      /\btrick(s)?\b/gi,
      /\btip(s)? and trick(s)?\b/gi,
      /\bpro[- ]tip(s)?\b/gi,
      /\blife[- ]hack(s)?\b/gi,
      /\bgrowth hack(s|ing)?\b/gi,
      /\bguru\b/gi,
      /\bexpert(s)? (reveal|share|teach)\b/gi,
      /\blearn (from|like) the (pros|experts|best)\b/gi,
      /\bmaster[- ]class\b/gi,
      /\bblueprint\b/gi,
      /\bframework\b/gi,
      /\bformula (for|to)\b/gi,
      /\bstep[- ]by[- ]step (guide|formula|system)\b/gi,
      /\bproven (system|formula|method|strategy)\b/gi,
      /\bfoolproof\b/gi,
      /\bno[- ]brainer\b/gi,
      /\bsimple (as|trick|hack|way)\b/gi,
      /\beasy (as|peasy|way|trick)\b/gi,
      /\bquick (and easy|fix|win|tip)\b/gi,
      /\bin (just )?\d+ (minutes?|hours?|days?|weeks?)\b/gi,
      /\bovernight (success|results)\b/gi,
      /\binstant (results|success|gratification)\b/gi,
      /\bimmediate (results|impact|effect)\b/gi,
      /\bwithin (minutes|hours|days)\b/gi,
      /\bas soon as (today|tomorrow|tonight)\b/gi,
      /\bright (now|away|here)\b/gi,
      /\bdon'?t (delay|hesitate|think twice)\b/gi,
      /\btake action (now|today|immediately)\b/gi,
      /\bget started (now|today|free)\b/gi,
      /\btry (it|now|today|free)\b/gi,
      /\bno (credit card|payment|commitment) (required|needed)\b/gi,
      /\bcancel anytime\b/gi,
      /\b30[- ]day (trial|guarantee|money[- ]back)\b/gi,
      /\bmoney[- ]back guarantee\b/gi,
      /\b100% (free|guaranteed|satisfaction)\b/gi,
      /\babsolutely free\b/gi,
      /\bcompletely free\b/gi,
      /\btotally free\b/gi,
      /\bno (catch|gimmick|trick)\b/gi,
      /\byou (won'?t|don'?t want to) miss (this|out)\b/gi,
      /\bsign up (now|today|free)\b/gi,
      /\bjoin (now|today|free|thousands|millions)\b/gi,
      /\b(thousands|millions|billions) of (users|customers|people)\b/gi,
      /\btrusted by (thousands|millions|Fortune 500)\b/gi,
      /\bas seen on (TV|CNN|Forbes|TechCrunch)\b/gi,
      /\bfeatured in\b/gi,
      /\baward[- ]winning\b/gi,
      /\bindustry[- ]leading\b/gi,
      /\bmarket[- ]leading\b/gi,
      /\b#1 (rated|ranked|choice)\b/gi,
      /\btop[- ]rated\b/gi,
      /\bhighest[- ]rated\b/gi,
      /\b\d+[- ]star (rating|reviews?)\b/gi,
      /\b\d+\+? ?(million|billion|thousand)?\+? (users?|customers?|downloads?)\b/gi,
      /\btransform your (life|business|career|finances)\b/gi,
      /\bchange your life\b/gi,
      /\bachieve your (dreams|goals)\b/gi,
      /\bunlock your (potential|success)\b/gi,
      /\bdiscover (how|the|your)\b/gi,
      /\blearn (how|the secret|everything)\b/gi,
      /\bfind out (how|why|what)\b/gi,
      /\bsee (how|why|what|the)\b/gi,
      /\bwatch (how|this|now)\b/gi,
      /\blook (at|what|how)\b/gi,
      /\bread (this|on|more)\b/gi,
      /\bmore (here|info|information|details)\b/gi,
      /\blearn more\b/gi,
      /\bget (more|yours|started|access)\b/gi,
      /\bfind your\b/gi,
      /\bstart your\b/gi,
      /\bbegin your\b/gi,
      /\bkickstart your\b/gi,
      /\bjumpstart your\b/gi,
      /\bboost your\b/gi,
      /\bgrow your\b/gi,
      /\bscale your\b/gi,
      /\b(double|triple|10x) your\b/gi,
      /\bincrease your .{5,30} by \d+%\b/gi
    ];
  }

  // Initialize suggestion mapping for better alternatives
  initSuggestionMap() {
    // Map common slop phrases to better alternatives
    this.suggestionMap = {
      // Tier 1 - AI Slop
      'delve into': 'explore, examine, analyze',
      'delve': 'explore, examine',
      'navigate the landscape': 'understand the situation, explore the field',
      'paradigm shift': 'major change, fundamental shift',
      'game-changer': 'significant advancement, important development',
      'game changer': 'significant advancement',
      'transformative': 'describe the actual change',
      'unlock potential': 'enable, allow, make possible',
      'unlock': 'enable, reveal, access',
      'seamlessly integrate': 'integrate, combine, work together',
      'holistic approach': 'comprehensive method, complete strategy',
      'robust solution': 'reliable system, strong approach',
      'deep dive': 'detailed analysis, thorough examination',
      'tapestry of': 'collection of, mixture of',
      'realm of possibilities': 'opportunities, options',
      'unprecedented': 'explain what makes it unique',
      'groundbreaking': 'innovative, or explain the innovation',
      'treasure trove': 'collection, resource, source',
      'uncharted waters': 'new territory, unexplored area',
      'shed light on': 'explain, clarify, reveal',
      'at the end of the day': 'ultimately, finally',
      'moving forward': 'in the future, next, from now on',
      'key takeaways': 'main points, summary, conclusions',
      'breakthrough': 'explain what barrier was overcome',
      'landscape is changing': 'be specific about what changed',
      'it\'s clear that': 'state your point directly',

      // Stop Words
      'I\'m excited to announce': 'announce directly',
      'thrilled to share': 'share without emotional wrapper',
      'proud to announce': 'remove self-congratulation',
      'happy to share': 'skip the filler',

      // Tier 2 - Corporate Buzzwords
      'synergy': 'collaboration, cooperation',
      'leverage': 'use, apply, take advantage of',
      'circle back': 'follow up, return to, revisit',
      'low-hanging fruit': 'easy wins, simple tasks',
      'move the needle': 'make progress, create impact',
      'think outside the box': 'be creative, innovate',
      'touch base': 'meet, discuss, check in',
      'take it offline': 'discuss privately',
      'pivot': 'change direction, adjust strategy',
      'disruptive': 'explain what it changes',
      'bandwidth': 'time, capacity, availability',
      'stakeholders': 'people involved, team members',
      'thought leader': 'expert, specialist, authority',
      'best practices': 'effective methods',
      'deep dive': 'detailed analysis',
      'empower': 'enable, allow',
      'optimize': 'improve, enhance',
      'streamline': 'simplify, improve process',

      // Tier 3 - Marketing Spam
      'amazing': 'use specific descriptors',
      'incredible': 'provide concrete details',
      'unbelievable': 'describe what makes it remarkable',
      'mind-blowing': 'explain the impact',
      'revolutionary': 'describe the actual change',
      'basically': 'remove or be more precise',
      'essentially': 'remove or be more specific',
      'actually': 'often unnecessary - remove',

      // Clickbait patterns (YouTube-specific)
      'you won\'t believe': 'state the fact directly',
      'this is crazy': 'describe what happened',
      'this is insane': 'explain the situation',
      'wait for it': 'remove the artificial suspense',
      'gone wrong': 'describe what actually happened',
      'not clickbait': 'if it\'s not clickbait, don\'t say it is',
      'must see': 'explain why it\'s worth watching',
      'must watch': 'explain the value',
      'will shock': 'describe the surprising element',
      'blow your mind': 'explain what\'s interesting about it',

      // Low-effort content (YouTube-specific)
      'asmr': 'describe the actual content',
      'satisfying': 'explain what\'s shown in the video',
      'compilation': 'describe what\'s compiled',
      'try not to': 'just show the content',
      'reaction': 'explain what you\'re reacting to',
      'unboxing': 'product review or first impressions',
      'haul': 'shopping overview or purchases',
      'prank': 'describe the actual content',
      'challenge': 'explain what the challenge involves',
      'mukbang': 'eating show or food review',
      'storytime': 'personal story or experience',
      'vlog': 'describe the day\'s activities',
      'emoji spam': 'remove emojis from title',
      'word salad': 'use clear, concise title',
      'caps spam': 'use normal capitalization',

      // Absurdist clickbait
      'i hired': 'describe what actually happened',
      'i paid': 'explain the actual process',
      'i asked': 'state the real activity',
      'i let my': 'remove the absurdist framing',

      // False controversy questions
      'are x a scam': 'analyze the actual pros and cons',
      'is x a scam': 'provide factual analysis',
      'are x worth it': 'review the actual value proposition',
      'are x dead': 'discuss the current state',
      'are x overrated': 'balanced assessment of',

      // Emotional manipulation
      'i\'m sorry': 'state the topic directly',
      'we need to talk': 'explain the topic',
      'i need to apologize': 'address the issue directly',
      'this is goodbye': 'state what you\'re announcing',
      'i\'m done': 'explain your decision',
      'please forgive me': 'take responsibility without drama',
      'my heart is broken': 'discuss the situation',
      'i lied': 'explain what happened',

      // Nudge clickbait / artificial curiosity
      'more than you think': 'state the actual information',
      'less than you think': 'provide the real data',
      'you didn\'t know': 'just share the facts',
      'you never knew': 'present the information',
      'they don\'t tell you': 'explain what it is',
      'the truth about': 'factual explanation of',
      'what really happened': 'describe the events',
      'the real reason': 'explain why',
      'here\'s why': 'explain the reason',
      'this is why': 'because...',
      'you need to know': 'here\'s what',
      'nobody tells you': 'share the information',
      'they don\'t want you to know': 'present the facts',
      'will change your life': 'describe the benefit',
      'before it\'s too late': 'remove artificial urgency',
      'stop doing': 'explain what to do instead',
      'you\'re doing it wrong': 'here\'s how to do it',
      'what happens when': 'describe the outcome',
      'the secret to': 'how to achieve',
      'the problem with': 'analysis of'
    };
  }

  // Initialize political content patterns
  initPoliticalPatterns() {
    this.politicalPatterns = [
      // The word "political" itself lol
      /\b(politic(s|al|ally|ian)?|partisan)\b/gi,

      // Political parties and ideologies
      /\b(democrat|republican|liberal|conservative|libertarian|socialist|communist|marxist|fascist)\b/gi,
      /\b(left-?wing|right-?wing|far-left|far-right|alt-right)\b/gi,
      /\b(progressive|woke|anti-woke|maga|resist)\b/gi,

      // Political institutions and processes
      /\b(congress|senate|house of representatives|supreme court|scotus)\b/gi,
      /\b(election|vote|voting|ballot|campaign|primary|caucus)\b/gi,
      /\b(legislation|bill|law|executive order|filibuster)\b/gi,
      /\b(impeach|impeachment)\b/gi,
      /\b(pardon|pardons|pardoned|autopen)\b/gi,

      // Political figures (generic, not specific names to avoid bias)
      /\b(president|senator|congressman|congresswoman|politician|candidate)\b/gi,
      /\b(administration|white house|capitol|government)\b/gi,

      // Economic/fiscal policy (heavily politicized)
      /\b(inflation|recession|depression|stimulus)\b/gi,
      /\b(federal reserve|the fed|interest rates?)\b/gi,
      /\b(bailout|quantitative easing)\b/gi,
      /\b(budget|deficit|debt ceiling|national debt)\b/gi,
      /\b(tariff|sanctions|trade war)\b/gi,
      /\b(unemployment rate|jobs report)\b/gi,

      // Hot-button political issues
      /\b(abortion|pro-life|pro-choice)\b/gi,
      /\b(gun control|second amendment|2a)\b/gi,
      /\b(immigration|border (wall|crisis)|illegal alien|undocumented)\b/gi,
      /\b(climate change|global warming|green new deal)\b/gi,
      /\b(healthcare|obamacare|medicare for all)\b/gi,
      /\b(tax(es)? (cut|increase|reform))\b/gi,
      /\b(defund the police|blm|black lives matter|blue lives matter)\b/gi,

      // Culture war topics
      /\b(cancel culture|woke|wokeness|sjw|social justice warrior)\b/gi,
      /\b(critical race theory|crt|dei|diversity equity inclusion)\b/gi,
      /\b(trans(gender)? (rights|ban|agenda)|lgbtq|pronouns)\b/gi,
      /\b(censorship|free speech|first amendment|1a)\b/gi,
      /\b(patriot|nationalism|globalist|deep state)\b/gi,

      // Political rhetoric and messaging styles
      /\b(wake up (america|sheeple|people))\b/gi,
      /\b(they'?re (coming for|trying to))\b/gi,
      /\b(mainstream media|msm|fake news|propaganda)\b/gi,
      /\b(conspiracy|cover-?up|the truth they)\b/gi,
      /\b(constitutional rights|freedom|liberty|tyranny)\b/gi,
      /\b(socialist agenda|communist takeover|fascist)\b/gi,
      /\b(red (pill|pilled)|blue (pill|pilled)|based)\b/gi,

      // Fear-mongering political language
      /\b(destroying (america|our country|democracy))\b/gi,
      /\b(threat to (democracy|freedom|america))\b/gi,
      /\b(war on (christmas|christianity|religion|police|freedom))\b/gi,
      /\b(defend (our|your) (rights|freedom|country))\b/gi,

      // Partisan media and pundits
      /\b(fox news|cnn|msnbc|oan|newsmax)\b/gi,
      /\b(liberal media|conservative media|right-wing media|left-wing media)\b/gi
    ];
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
          '.feed-shared-inline-show-more-text'
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

    // YouTube-SPECIFIC: Count emojis in title (ALWAYS active, ignore blockEmojis setting)
    const emojiRegex = /[\u{1F300}-\u{1F9FF}]/gu;
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

  isSlopElement(element, isComment = false) {
    // For posts, extract only the main content text, excluding comments
    let text = '';

    if (!isComment) {
      // For LinkedIn posts, get only the post content, not comments
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
    } else {
      // For comments, just use the element's text
      text = element.textContent || '';
    }

    // Skip if too short
    if (text.length < 100) return { isSlop: false, matches: [] };

    let slopScore = 0;
    const matchedPhrases = new Set(); // Track unique matched phrases

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

            const elements = node.querySelectorAll ?
              node.querySelectorAll(selector) :
              [node];

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
