// Slop Machine - Slot machine for learning better word choices
// Loads slop database from shared window.DESLOP_PATTERNS source

let SLOP_DATABASE = [];
let spinCount = 0;
let learnedSet = new Set();
let currentFilter = 'all';
let currentPair = null;
let isSpinning = false;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  // Resolve language first
  const langSettings = await chrome.storage.sync.get({ patternLanguage: 'auto' });
  const lang = window.DESLOP_REGISTRY
    ? window.DESLOP_REGISTRY.resolveLanguage(langSettings.patternLanguage)
    : 'en';

  loadSlopDatabase(lang);

  // Initialize i18n
  if (window.DESLOP_I18N) {
    await window.DESLOP_I18N.init(langSettings.patternLanguage);
    window.DESLOP_I18N.applyTranslations();
  }

  setupEventListeners();
  renderIndex();
  loadStats();
});

// Load slop database from shared source
function loadSlopDatabase(lang) {
  const source = (window.DESLOP_PATTERNS && window.DESLOP_PATTERNS[lang]) || null;

  if (source && source.slopDatabase) {
    SLOP_DATABASE = source.slopDatabase;
  } else {
    console.warn('[Slop Machine] No slop database loaded from shared source');
    SLOP_DATABASE = [];
  }
}

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
  if (isSpinning || SLOP_DATABASE.length === 0) return;

  isSpinning = true;
  const spinBtn = document.getElementById('spinBtn');
  const i18n = window.DESLOP_I18N;
  spinBtn.disabled = true;
  spinBtn.textContent = `[ ${(i18n && i18n.msg('slopMachineSpinning')) || 'SPINNING...'} ]`;

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
    spinBtn.textContent = `[ ${(i18n && i18n.msg('slopMachineSpinAgain')) || 'SPIN AGAIN'} ]`;
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
      <div class="index-arrow">\u2193</div>
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
  const i18n = window.DESLOP_I18N;
  switch (tier) {
    case 'tier1': return (i18n && i18n.msg('slopMachineTier1Label')) || 'AI Slop - 3pts';
    case 'tier2': return (i18n && i18n.msg('slopMachineTier2Label')) || 'Corporate - 2pts';
    case 'tier3': return (i18n && i18n.msg('slopMachineTier3Label')) || 'Marketing - 1pt';
    case 'stopwords': return (i18n && i18n.msg('slopMachineStopWordsLabel')) || 'Stop Words - 3pts';
    default: return tier;
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
