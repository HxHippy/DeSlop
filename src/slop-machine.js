// Slop Machine - Slot machine for learning better word choices

const SLOP_DATABASE = [
  // AI Slop - Tier 1
  { slop: 'delve into', better: 'explore, examine, or analyze', tier: 'tier1' },
  { slop: 'navigate the landscape', better: 'understand the situation, explore the field', tier: 'tier1' },
  { slop: 'paradigm shift', better: 'major change, fundamental shift', tier: 'tier1' },
  { slop: 'game-changer', better: 'significant advancement, important development', tier: 'tier1' },
  { slop: 'transformative', better: 'describe the actual change that occurred', tier: 'tier1' },
  { slop: 'unlock potential', better: 'enable, allow, make possible', tier: 'tier1' },
  { slop: 'seamlessly integrate', better: 'integrate, combine, work together', tier: 'tier1' },
  { slop: 'holistic approach', better: 'comprehensive method, complete strategy', tier: 'tier1' },
  { slop: 'robust solution', better: 'reliable system, strong approach', tier: 'tier1' },
  { slop: 'deep dive', better: 'detailed analysis, thorough examination', tier: 'tier1' },
  { slop: 'tapestry of', better: 'collection of, mixture of', tier: 'tier1' },
  { slop: 'realm of possibilities', better: 'opportunities, options', tier: 'tier1' },
  { slop: 'unprecedented', better: 'rare, unusual, or explain what makes it unique', tier: 'tier1' },
  { slop: 'groundbreaking', better: 'innovative, new, or explain the innovation', tier: 'tier1' },
  { slop: 'treasure trove', better: 'collection, resource, source', tier: 'tier1' },
  { slop: 'uncharted waters', better: 'new territory, unexplored area', tier: 'tier1' },
  { slop: 'shed light on', better: 'explain, clarify, reveal', tier: 'tier1' },
  { slop: 'at the end of the day', better: 'ultimately, finally, in conclusion', tier: 'tier1' },
  { slop: 'moving forward', better: 'in the future, next, from now on', tier: 'tier1' },
  { slop: 'key takeaways', better: 'main points, summary, conclusions', tier: 'tier1' },
  { slop: 'breakthrough', better: 'advancement, discovery, or explain what barrier was overcome', tier: 'tier1' },
  { slop: 'thrilling time to be alive', better: 'be specific about the advancement you\'re discussing', tier: 'tier1' },
  { slop: 'dazzling pace', better: 'rapid speed, fast rate', tier: 'tier1' },
  { slop: 'rewriting history', better: 'changing our understanding, creating new precedent', tier: 'tier1' },
  { slop: 'it\'s clear that', better: 'state your point directly without the preamble', tier: 'tier1' },

  // Stop Words
  { slop: 'I\'m excited to announce', better: 'just announce it directly', tier: 'stopwords' },
  { slop: 'thrilled to share', better: 'share it without the emotional wrapper', tier: 'stopwords' },
  { slop: 'proud to announce', better: 'remove the self-congratulation', tier: 'stopwords' },
  { slop: 'happy to share', better: 'skip the filler, share the content', tier: 'stopwords' },
  { slop: 'big news!', better: 'if it\'s important, explain why', tier: 'stopwords' },
  { slop: 'just launched', better: 'state what you launched and why it matters', tier: 'stopwords' },
  { slop: 'guess what?', better: 'state your point directly', tier: 'stopwords' },
  { slop: 'check out', better: 'describe what it is and why it matters', tier: 'stopwords' },
  { slop: 'can\'t wait to share', better: 'then share it without padding', tier: 'stopwords' },

  // Corporate Buzzwords - Tier 2
  { slop: 'synergy', better: 'collaboration, cooperation, combined effort', tier: 'tier2' },
  { slop: 'leverage', better: 'use, apply, take advantage of', tier: 'tier2' },
  { slop: 'circle back', better: 'follow up, return to, revisit', tier: 'tier2' },
  { slop: 'low-hanging fruit', better: 'easy wins, simple tasks, quick improvements', tier: 'tier2' },
  { slop: 'move the needle', better: 'make progress, create impact, improve results', tier: 'tier2' },
  { slop: 'think outside the box', better: 'be creative, find new approaches, innovate', tier: 'tier2' },
  { slop: 'touch base', better: 'meet, discuss, check in', tier: 'tier2' },
  { slop: 'take it offline', better: 'discuss privately, continue later', tier: 'tier2' },
  { slop: 'pivot', better: 'change direction, adjust strategy, shift approach', tier: 'tier2' },
  { slop: 'disruptive', better: 'explain what it changes and how', tier: 'tier2' },
  { slop: 'bandwidth', better: 'time, capacity, availability', tier: 'tier2' },
  { slop: 'stakeholders', better: 'people involved, team members, participants', tier: 'tier2' },
  { slop: 'value-add', better: 'benefit, advantage, improvement', tier: 'tier2' },
  { slop: 'thought leader', better: 'expert, specialist, authority', tier: 'tier2' },
  { slop: 'best practices', better: 'effective methods, proven approaches', tier: 'tier2' },
  { slop: 'blue-sky thinking', better: 'creative thinking, brainstorming, ideation', tier: 'tier2' },
  { slop: 'ideate', better: 'brainstorm, create ideas, think creatively', tier: 'tier2' },
  { slop: 'operationalize', better: 'implement, execute, put into practice', tier: 'tier2' },
  { slop: 'socialize', better: 'share, discuss, get feedback on', tier: 'tier2' },
  { slop: 'big data', better: 'large datasets, data analysis', tier: 'tier2' },
  { slop: 'digital transformation', better: 'adopting digital tools, modernizing technology', tier: 'tier2' },
  { slop: 'AI-powered', better: 'uses AI, incorporates machine learning', tier: 'tier2' },
  { slop: 'deliverables', better: 'outputs, results, products', tier: 'tier2' },
  { slop: 'empower', better: 'enable, allow, give authority to', tier: 'tier2' },
  { slop: 'optimize', better: 'improve, enhance, make more efficient', tier: 'tier2' },
  { slop: 'streamline', better: 'simplify, make efficient, improve process', tier: 'tier2' },

  // Marketing Spam - Tier 3
  { slop: 'amazing', better: 'use specific, measurable descriptors', tier: 'tier3' },
  { slop: 'incredible', better: 'provide concrete details instead', tier: 'tier3' },
  { slop: 'unbelievable', better: 'describe what makes it remarkable', tier: 'tier3' },
  { slop: 'mind-blowing', better: 'explain the impact or innovation', tier: 'tier3' },
  { slop: 'revolutionary', better: 'describe the actual change', tier: 'tier3' },
  { slop: 'miracle', better: 'unexpected result, surprising outcome', tier: 'tier3' },
  { slop: 'best-in-class', better: 'leading, top-performing, highest-rated', tier: 'tier3' },
  { slop: 'click here', better: 'describe what they\'ll see/get', tier: 'tier3' },
  { slop: 'buy now', better: 'explain the value proposition', tier: 'tier3' },
  { slop: 'limited time offer', better: 'state the specific deadline', tier: 'tier3' },
  { slop: 'guaranteed', better: 'explain the terms clearly', tier: 'tier3' },
  { slop: 'risk-free', better: 'describe the policy explicitly', tier: 'tier3' },
  { slop: 'must-have', better: 'explain why it\'s necessary', tier: 'tier3' },
  { slop: 'next-level', better: 'describe the improvement', tier: 'tier3' },
  { slop: 'raise the bar', better: 'set new standards, improve expectations', tier: 'tier3' },
  { slop: 'basically', better: 'remove it or be more precise', tier: 'tier3' },
  { slop: 'essentially', better: 'remove it or be more specific', tier: 'tier3' },
  { slop: 'actually', better: 'often unnecessary - remove it', tier: 'tier3' },

  // Special
  { slop: 'em dash (—)', better: 'use periods, commas, or remove the dramatic pause', tier: 'tier1' },

  // Additional Tier 1 - AI Slop
  { slop: 'landscape is changing', better: 'be specific about what changed', tier: 'tier1' },
  { slop: 'ever-changing world', better: 'specify the change or time period', tier: 'tier1' },
  { slop: 'fast-paced environment', better: 'describe what makes it fast-paced', tier: 'tier1' },
  { slop: 'crucial to understand', better: 'state your point directly', tier: 'tier1' },
  { slop: 'vital to recognize', better: 'remove the preamble, make your point', tier: 'tier1' },
  { slop: 'important to note that', better: 'just state the fact', tier: 'tier1' },
  { slop: 'worth mentioning', better: 'if it\'s worth mentioning, just mention it', tier: 'tier1' },
  { slop: 'proven track record', better: 'cite specific achievements or metrics', tier: 'tier1' },
  { slop: 'time-tested', better: 'state how long and what outcomes', tier: 'tier1' },
  { slop: 'tried and true', better: 'cite specific results or history', tier: 'tier1' },
  { slop: 'exciting times ahead', better: 'describe what\'s coming specifically', tier: 'tier1' },
  { slop: 'bright future', better: 'explain what makes it bright', tier: 'tier1' },
  { slop: 'promising outlook', better: 'specify the promise', tier: 'tier1' },
  { slop: 'poised to become', better: 'state what it is now and when', tier: 'tier1' },
  { slop: 'set to revolutionize', better: 'describe the actual change', tier: 'tier1' },
  { slop: 'on the brink of', better: 'state the situation clearly', tier: 'tier1' },
  { slop: 'heralds a new era', better: 'describe what\'s different', tier: 'tier1' },
  { slop: 'ushers in change', better: 'describe the change', tier: 'tier1' },
  { slop: 'watershed moment', better: 'explain why it matters', tier: 'tier1' },
  { slop: 'inflection point', better: 'describe the turning point', tier: 'tier1' },
  { slop: 'tipping point', better: 'explain what tipped and why', tier: 'tier1' },
  { slop: 'perfect storm', better: 'list the specific factors', tier: 'tier1' },
  { slop: 'convergence of', better: 'list what is combining', tier: 'tier1' },
  { slop: 'at the forefront', better: 'explain the leadership position', tier: 'tier1' },
  { slop: 'spearheading', better: 'describe the leadership role', tier: 'tier1' },
  { slop: 'pioneering', better: 'explain what is new or first', tier: 'tier1' },
  { slop: 'trailblazing', better: 'describe the new path', tier: 'tier1' },
  { slop: 'industry-leading', better: 'cite metrics or rankings', tier: 'tier1' },
  { slop: 'market-leading', better: 'provide market share data', tier: 'tier1' },
  { slop: 'world-class', better: 'cite comparative metrics', tier: 'tier1' },
  { slop: 'best-of-breed', better: 'specify which features are best', tier: 'tier1' },
  { slop: 'bleeding-edge', better: 'explain what\'s new about it', tier: 'tier1' },
  { slop: 'future-proof', better: 'explain adaptability features', tier: 'tier1' },
  { slop: 'forward-thinking', better: 'describe the strategy', tier: 'tier1' },
  { slop: 'visionary approach', better: 'describe the vision', tier: 'tier1' },
  { slop: 'strategic imperative', better: 'explain why it\'s necessary', tier: 'tier1' },
  { slop: 'key differentiator', better: 'state what makes it different', tier: 'tier1' },
  { slop: 'fundamentally different', better: 'describe the difference', tier: 'tier1' },
  { slop: 'dramatically improved', better: 'provide specific metrics', tier: 'tier1' },
  { slop: 'exponential growth', better: 'cite actual growth numbers', tier: 'tier1' },
  { slop: 'unique opportunity', better: 'explain what makes it unique', tier: 'tier1' },
  { slop: 'compelling case', better: 'present the evidence', tier: 'tier1' },
  { slop: 'undeniably', better: 'present facts, let them speak', tier: 'tier1' },
  { slop: 'beyond doubt', better: 'state your conclusion directly', tier: 'tier1' },
  { slop: 'needless to say', better: 'then don\'t say it, or just say it', tier: 'tier1' },
  { slop: 'it goes without saying', better: 'obviously it doesn\'t - just say it', tier: 'tier1' },
  { slop: 'long story short', better: 'tell the short story then', tier: 'tier1' },
  { slop: 'cutting to the chase', better: 'just do it', tier: 'tier1' },
  { slop: 'bottom line', better: 'state the conclusion', tier: 'tier1' },
  { slop: 'gaining traction', better: 'cite adoption metrics', tier: 'tier1' },
  { slop: 'picking up momentum', better: 'provide growth data', tier: 'tier1' },
  { slop: 'on an upward trajectory', better: 'show the trend with data', tier: 'tier1' },
  { slop: 'skyrocketing', better: 'provide actual numbers', tier: 'tier1' },
  { slop: 'meteoric rise', better: 'cite growth rate and timeline', tier: 'tier1' },
  { slop: 'unprecedented growth', better: 'provide historical comparison', tier: 'tier1' },
  { slop: 'record-breaking', better: 'cite the previous record and new one', tier: 'tier1' },
  { slop: 'bar-setting', better: 'explain what bar was set', tier: 'tier1' },
  { slop: 'industry-defining', better: 'explain how it defined industry', tier: 'tier1' },

  // Additional Tier 2 - Corporate Buzzwords
  { slop: 'alignment', better: 'agreement, coordination', tier: 'tier2' },
  { slop: 'get on the same page', better: 'agree, coordinate, clarify', tier: 'tier2' },
  { slop: 'win-win', better: 'mutually beneficial, both parties benefit', tier: 'tier2' },
  { slop: 'cross-functional', better: 'multiple departments, various teams', tier: 'tier2' },
  { slop: 'end-to-end solution', better: 'complete system, full process', tier: 'tier2' },
  { slop: 'one-stop-shop', better: 'single provider, all services included', tier: 'tier2' },
  { slop: 'turnkey solution', better: 'ready to use, complete system', tier: 'tier2' },
  { slop: 'plug-and-play', better: 'ready to use, no setup needed', tier: 'tier2' },
  { slop: 'out-of-the-box', better: 'included by default, standard feature', tier: 'tier2' },
  { slop: 'full-stack', better: 'complete system, all layers', tier: 'tier2' },
  { slop: 'hands on deck', better: 'everyone working, full team effort', tier: 'tier2' },
  { slop: 'rolling up sleeves', better: 'getting to work, taking action', tier: 'tier2' },
  { slop: 'gold standard', better: 'highest quality, best example', tier: 'tier2' },
  { slop: 'enterprise-grade', better: 'reliable, secure, scalable', tier: 'tier2' },
  { slop: 'production-ready', better: 'stable, tested, deployable', tier: 'tier2' },
  { slop: 'battle-tested', better: 'proven in production, reliable', tier: 'tier2' },
  { slop: 'frictionless', better: 'smooth, easy, simple', tier: 'tier2' },
  { slop: 'effortlessly', better: 'easily, simply, smoothly', tier: 'tier2' },
  { slop: 'transparency', better: 'visibility, clarity, openness', tier: 'tier2' },
  { slop: 'actionable insights', better: 'useful data, clear recommendations', tier: 'tier2' },
  { slop: 'data-backed', better: 'supported by data, evidence-based', tier: 'tier2' },
  { slop: 'first principles', better: 'fundamental approach, basics-first', tier: 'tier2' },
  { slop: 'purpose-built', better: 'designed specifically for, custom-made', tier: 'tier2' },
  { slop: 'bespoke', better: 'custom, tailored, customized', tier: 'tier2' },
  { slop: 'white-glove service', better: 'premium support, personalized service', tier: 'tier2' },
  { slop: '24/7', better: 'always available, continuous', tier: 'tier2' },
  { slop: 'high-availability', better: 'rarely down, reliable uptime', tier: 'tier2' },
  { slop: 'fault-tolerant', better: 'handles failures, stays running', tier: 'tier2' },
  { slop: 'self-healing', better: 'auto-recovery, automatic fixes', tier: 'tier2' },
  { slop: 'auto-scaling', better: 'adjusts capacity automatically', tier: 'tier2' },
  { slop: 'on-demand', better: 'when needed, available immediately', tier: 'tier2' },
  { slop: 'cloud-native', better: 'built for cloud, designed for distributed systems', tier: 'tier2' },
  { slop: 'microservices', better: 'small services, modular architecture', tier: 'tier2' },
  { slop: 'serverless', better: 'no server management, managed infrastructure', tier: 'tier2' },
  { slop: 'real-time', better: 'immediate, instant, no delay', tier: 'tier2' },
  { slop: 'lightning-fast', better: 'very fast (cite actual speed)', tier: 'tier2' },
  { slop: 'low-latency', better: 'fast response (cite milliseconds)', tier: 'tier2' },
  { slop: 'performant', better: 'fast, efficient (provide metrics)', tier: 'tier2' },
  { slop: 'modular', better: 'separable components, independent parts', tier: 'tier2' },
  { slop: 'extensible', better: 'can be expanded, supports additions', tier: 'tier2' },
  { slop: 'adaptable', better: 'adjusts to needs, configurable', tier: 'tier2' },
  { slop: 'no-code', better: 'visual configuration, no programming needed', tier: 'tier2' },
  { slop: 'low-code', better: 'minimal programming, mostly visual', tier: 'tier2' },
  { slop: 'drag-and-drop', better: 'visual interface, mouse-driven', tier: 'tier2' },
  { slop: 'user-friendly', better: 'easy to use, intuitive', tier: 'tier2' },

  // Additional Tier 3 - Marketing Spam
  { slop: 'awesome', better: 'be specific about what makes it good', tier: 'tier3' },
  { slop: 'fantastic', better: 'describe the actual features', tier: 'tier3' },
  { slop: 'spectacular', better: 'cite specific achievements', tier: 'tier3' },
  { slop: 'phenomenal', better: 'provide measurable results', tier: 'tier3' },
  { slop: 'outstanding', better: 'explain what stands out', tier: 'tier3' },
  { slop: 'exceptional', better: 'describe the exception', tier: 'tier3' },
  { slop: 'extraordinary', better: 'compare to ordinary alternatives', tier: 'tier3' },
  { slop: 'stunning', better: 'provide concrete details', tier: 'tier3' },
  { slop: 'insanely good', better: 'use specific, measurable terms', tier: 'tier3' },
  { slop: 'epic', better: 'describe scope or scale specifically', tier: 'tier3' },
  { slop: 'legendary', better: 'cite the history or legacy', tier: 'tier3' },
  { slop: '10x', better: 'provide actual comparison metrics', tier: 'tier3' },
  { slop: 'secrets to success', better: 'specific methods, proven techniques', tier: 'tier3' },
  { slop: 'hidden gems', better: 'underused features, lesser-known options', tier: 'tier3' },
  { slop: 'insider tips', better: 'expert advice, advanced techniques', tier: 'tier3' },
  { slop: 'exclusive access', better: 'early access, limited availability', tier: 'tier3' },
  { slop: 'VIP treatment', better: 'premium features, priority support', tier: 'tier3' },
  { slop: 'elite members', better: 'premium tier, advanced users', tier: 'tier3' },
  { slop: 'early bird', better: 'launch discount, introductory price', tier: 'tier3' },
  { slop: 'don\'t miss out', better: 'available until [date], limited quantity', tier: 'tier3' },
  { slop: 'FOMO', better: 'state the actual deadline or limit', tier: 'tier3' },
  { slop: 'hurry', better: 'ends [specific date/time]', tier: 'tier3' },
  { slop: 'fast-track', better: 'expedited process, priority handling', tier: 'tier3' },
  { slop: 'shortcuts', better: 'efficient methods, time-saving techniques', tier: 'tier3' },
  { slop: 'life hacks', better: 'time-saving tips, efficiency methods', tier: 'tier3' },
  { slop: 'growth hacking', better: 'rapid experimentation, data-driven marketing', tier: 'tier3' },
  { slop: 'master class', better: 'expert training, advanced course', tier: 'tier3' },
  { slop: 'blueprint', better: 'detailed plan, step-by-step guide', tier: 'tier3' },
  { slop: 'foolproof', better: 'reliable method, proven process', tier: 'tier3' },
  { slop: 'no-brainer', better: 'obvious choice, clear benefit', tier: 'tier3' },
  { slop: 'overnight success', better: 'cite actual timeline and effort', tier: 'tier3' },
  { slop: 'instant results', better: 'state actual timeframe', tier: 'tier3' },
  { slop: 'right now', better: 'specify when it\'s available', tier: 'tier3' },
  { slop: 'don\'t delay', better: 'available until [date]', tier: 'tier3' },
  { slop: 'take action now', better: 'sign up by [date], offer ends [date]', tier: 'tier3' },
  { slop: 'try it free', better: 'free trial until [date], no credit card required', tier: 'tier3' },
  { slop: 'cancel anytime', better: 'no long-term contract, month-to-month', tier: 'tier3' },
  { slop: 'money-back guarantee', better: 'refund within [X] days if unsatisfied', tier: 'tier3' },
  { slop: '100% free', better: 'no cost, no payment required', tier: 'tier3' },
  { slop: 'no catch', better: 'transparent pricing, clear terms', tier: 'tier3' },
  { slop: 'trusted by millions', better: 'cite actual user count and source', tier: 'tier3' },
  { slop: 'award-winning', better: 'won [specific award] in [year]', tier: 'tier3' },
  { slop: '#1 rated', better: 'top-rated by [source], ranked #1 on [platform]', tier: 'tier3' },
  { slop: '5-star reviews', better: 'average rating of X from Y reviews', tier: 'tier3' },
  { slop: 'transform your life', better: 'describe specific improvements', tier: 'tier3' },
  { slop: 'change your life', better: 'detail the expected changes', tier: 'tier3' },
  { slop: 'unlock your potential', better: 'develop [specific skills]', tier: 'tier3' },
  { slop: 'discover how', better: 'state directly what they\'ll learn', tier: 'tier3' },
  { slop: 'learn the secret', better: 'teach [specific skill or method]', tier: 'tier3' },
  { slop: 'find out why', better: 'explain the reason directly', tier: 'tier3' },
  { slop: 'learn more', better: 'see full details, view documentation', tier: 'tier3' },
  { slop: 'get started', better: 'create account, sign up now', tier: 'tier3' },
  { slop: 'kickstart your', better: 'begin [specific activity]', tier: 'tier3' },
  { slop: 'boost your', better: 'improve [specific metric] by [amount]', tier: 'tier3' },
  { slop: 'double your', better: '2x increase in [specific metric]', tier: 'tier3' }
];

let spinCount = 0;
let learnedSet = new Set();
let currentFilter = 'all';
let currentPair = null;
let isSpinning = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  renderIndex();
  loadStats();
});

function setupEventListeners() {
  document.getElementById('spinBtn').addEventListener('click', spin);
  document.getElementById('backBtn').addEventListener('click', () => window.close());
  document.getElementById('searchInput').addEventListener('input', filterIndex);

  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
      currentFilter = e.target.getAttribute('data-filter');
      filterIndex();
    });
  });
}

async function loadStats() {
  const stored = await chrome.storage.local.get({
    slopMachineSpins: 0,
    slopMachineLearned: []
  });

  spinCount = stored.slopMachineSpins || 0;
  learnedSet = new Set(stored.slopMachineLearned || []);

  updateStats();
}

async function saveStats() {
  await chrome.storage.local.set({
    slopMachineSpins: spinCount,
    slopMachineLearned: Array.from(learnedSet)
  });
}

function updateStats() {
  document.getElementById('spinCount').textContent = spinCount;
  document.getElementById('learnedCount').textContent = learnedSet.size;
}

function spin() {
  if (isSpinning) return;

  isSpinning = true;
  const spinBtn = document.getElementById('spinBtn');
  spinBtn.disabled = true;
  spinBtn.textContent = '[ SPINNING... ]';

  // Pick random slop/better pair
  currentPair = SLOP_DATABASE[Math.floor(Math.random() * SLOP_DATABASE.length)];

  // Animate reels
  const reel1 = document.getElementById('reel1');
  const reel3 = document.getElementById('reel3');

  reel1.classList.add('spinning');
  reel3.classList.add('spinning');

  setTimeout(() => {
    reel1.classList.remove('spinning');
    reel3.classList.remove('spinning');

    // Show result
    reel1.textContent = currentPair.slop;
    reel3.textContent = currentPair.better;

    // Show result display
    document.getElementById('resultSlop').textContent = currentPair.slop;
    document.getElementById('resultBetter').textContent = currentPair.better;
    document.getElementById('resultDisplay').style.display = 'grid';

    // Update stats
    spinCount++;
    learnedSet.add(currentPair.slop);
    updateStats();
    saveStats();

    // Re-enable button
    isSpinning = false;
    spinBtn.disabled = false;
    spinBtn.textContent = '[ SPIN AGAIN ]';
  }, 800);
}

function renderIndex() {
  const indexList = document.getElementById('indexList');
  indexList.innerHTML = '';

  SLOP_DATABASE.forEach(item => {
    const div = document.createElement('div');
    div.className = 'index-item';
    div.setAttribute('data-tier', item.tier);
    div.setAttribute('data-slop', item.slop.toLowerCase());

    div.innerHTML = `
      <div class="index-slop">${escapeHtml(item.slop)}</div>
      <div class="index-arrow">↓</div>
      <div class="index-better">${escapeHtml(item.better)}</div>
      <div class="index-tier">${getTierLabel(item.tier)}</div>
    `;

    indexList.appendChild(div);
  });
}

function filterIndex() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const items = document.querySelectorAll('.index-item');

  items.forEach(item => {
    const tier = item.getAttribute('data-tier');
    const slop = item.getAttribute('data-slop');

    const matchesFilter = currentFilter === 'all' || tier === currentFilter;
    const matchesSearch = searchTerm === '' || slop.includes(searchTerm);

    if (matchesFilter && matchesSearch) {
      item.classList.remove('hidden');
    } else {
      item.classList.add('hidden');
    }
  });
}

function getTierLabel(tier) {
  switch (tier) {
    case 'tier1': return 'AI Slop - 3pts';
    case 'tier2': return 'Corporate - 2pts';
    case 'tier3': return 'Marketing - 1pt';
    case 'stopwords': return 'Stop Words - 3pts';
    default: return tier;
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
