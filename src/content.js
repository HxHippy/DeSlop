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
    this.loadSettings();
    this.initPatterns();
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
        whitelist: []
      });

      this.sensitivity = settings.sensitivity;
      this.enabled = settings.enabled;
      this.detectionOnly = settings.detectionOnly;
      this.blockEmojis = settings.blockEmojis;
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
    this.totalElements = elements.length;

    elements.forEach(el => {
      const result = this.isSlopElement(el);
      if (result.isSlop) {
        this.removeElement(el, result.matches);
      }
    });
  }

  isSlopElement(element) {
    const text = element.textContent || '';

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

  removeElement(element, matches = []) {
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
      tooltip.innerHTML = `
        <div class="deslop-tooltip-header">Detected Slop Patterns:</div>
        <div class="deslop-tooltip-list">
          ${matches.slice(0, 8).map(m => `<div class="deslop-tooltip-item">${this.escapeHtml(m)}</div>`).join('')}
          ${matches.length > 8 ? `<div class="deslop-tooltip-more">...and ${matches.length - 8} more</div>` : ''}
        </div>
      `;

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
