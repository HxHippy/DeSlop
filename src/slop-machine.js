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
  { slop: 'em dash (—)', better: 'use periods, commas, or remove the dramatic pause', tier: 'tier1' }
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
