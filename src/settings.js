// De-Slop Settings/Customization Page

// Default patterns (imported from content.js logic)
const DEFAULT_PATTERNS = {
  tier1: [
    '/\\bdelve into\\b/gi',
    '/\\bdelving into (the )?(intricacies|complexities)\\b/gi',
    '/\\bnavigat(e|ing) (the|this) (complex )?(landscape|realm|world)\\b/gi',
    "/\\bin (today's|the) (rapidly )?evolving (landscape|world|market|era)\\b/gi",
    '/\\bembark on (a|this|your) journey\\b/gi',
    '/\\btapestry of\\b/gi',
    '/\\brealm of possibilities\\b/gi',
    '/\\bultimately,? (the )?(choice|decision) is yours\\b/gi',
    '/\\bmultifaceted (nature|approach|aspect)\\b/gi',
    '/\\bholistic(ally)? (approach|perspective|view)\\b/gi',
    '/\\bseamlessly integrat(e|ing|ed)\\b/gi',
    '/\\bunlock (the potential|new possibilities|unprecedented)\\b/gi',
    '/\\bgame-?chang(er|ing)\\b/gi',
    '/\\bparadigm shift\\b/gi',
    '/\\bgroundbreaking\\b/gi',
    '/\\bunprecedented\\b/gi',
    '/\\brobust (solution|framework|system|approach)\\b/gi',
    '/\\bcomprehensive (guide|overview|analysis|approach)\\b/gi',
    '/\\btransformative (power|potential|impact|insights)\\b/gi',
    '/\\btreasure trove\\b/gi',
    '/\\buncharted waters\\b/gi',
    '/\\bdeep dive into\\b/gi',
    '/\\bshed(ding)? light on\\b/gi',
    '/\\bat the end of the day\\b/gi',
    '/\\bin conclusion\\b/gi',
    '/\\bin summary\\b/gi',
    '/\\bmoving forward\\b/gi',
    '/\\bkey takeaways?\\b/gi',
    '/\\b—.{10,100}—/g',
    '/\\bbreakthrough(s)?\\b/gi',
    '/\\bgiant leap\\b/gi',
    '/\\bexciting (possibilities|advances|opportunities|future)\\b/gi',
    '/\\bdazzling (pace|speed|rate)\\b/gi',
    '/\\bthrilling time to be alive\\b/gi',
    '/\\badvanced .{5,30} (technology|system|solution|method)\\b/gi',
    '/\\bstunning (results|advances|breakthroughs|discoveries)\\b/gi',
    '/\\breal[- ]world (impact|advances|applications|use)\\b/gi',
    '/\\bpositioning .{5,30} as game[- ]changer/gi',
    '/\\bpace is accelerat(ing|ed)\\b/gi',
    '/\\bcould soon become\\b/gi',
    '/\\bopens .{5,30} possibilities\\b/gi',
    '/\\breignites? debates? about\\b/gi',
    '/\\bneed for new (regulations|laws|rules|policies)\\b/gi',
    '/\\brewriting (history|the books)\\b/gi',
    '/\\bprompting new questions about\\b/gi',
    "/\\bit'?s clear that\\b/gi",
    '/\\btruly (is|are) a .{5,30} time\\b/gi',
    "/\\bwhether it'?s .{10,50} or .{10,50}, it\\b/gi",
    '/\\bfrom .{5,30} to .{5,30}, (it|this|these)\\b/gi',
    '/\\bIntroducing .{5,30}, the (first|next|future)\\b/gi',
    "/\\bImagine .{10,50} — that'?s\\b/gi",
    '/\\bFor (decades|years), .{10,50} seemed like\\b/gi',
    "/\\bin 20\\d{2}, it'?s\\b/gi",
    '/\\bNot all .{5,30} discoveries are\\b/gi',
    '/\\bscience fiction .{5,30} but in 20\\d{2}\\b/gi',
    // Marketing engagement stop words - posts starting with these are slop
    "/^(I'm|I am) (so |very )?(excited|thrilled|proud|happy|delighted|pleased|honored|grateful|blessed) to (announce|share|reveal|tell you|introduce)/gim",
    "/^(Can't|Cannot) wait to (share|tell you|announce|reveal)/gim",
    '/^(Big|Exciting|Great|Amazing) news[!:]/gim',
    '/^Just launched/gim',
    "/^(Today|This week|This month) (I'm|I am|we're|we are) (announcing|launching|releasing|sharing|excited to)/gim",
    '/^Excited to (share|announce|reveal|tell you|introduce)/gim',
    '/^Thrilled to (share|announce|reveal|tell you|introduce)/gim',
    '/^Proud to (share|announce|reveal|tell you|introduce)/gim',
    '/^Happy to (share|announce|reveal|tell you|introduce)/gim',
    '/^Delighted to (share|announce|reveal|tell you|introduce)/gim',
    '/^Honored to (share|announce|reveal|tell you|introduce)/gim',
    '/^Grateful to (share|announce|reveal|tell you|introduce)/gim',
    '/^Blessed to (share|announce|reveal|tell you|introduce)/gim',
    '/^Guess what[!?]/gim',
    "/^You('re| are) not going to believe/gim",
    "/^(Check out|Take a look at|Don't miss) (this|what)/gim",
    '/^(Major|Huge) announcement[!:]/gim',
    '/^(Finally|At last)[,!]/gim',
    '/^(Hot|Breaking) (take|news)[!:]/gim',
    // Em dash usage - instant slop tell
    '/—/g'
  ],
  tier2: [
    '/\\bsynergy\\b/gi',
    '/\\bleverage\\b/gi',
    '/\\bcircle back\\b/gi',
    '/\\blow[- ]hanging fruit\\b/gi',
    '/\\bmove the needle\\b/gi',
    '/\\bthink outside the box\\b/gi',
    '/\\btouch base\\b/gi',
    '/\\btake (it|this) offline\\b/gi',
    '/\\bpivot\\b/gi',
    '/\\bdisrupt(ive)?\\b/gi',
    '/\\bagile\\b/gi',
    '/\\bbandwidth\\b/gi',
    '/\\bstakeholders?\\b/gi',
    '/\\bvalue[- ]add\\b/gi',
    '/\\bthought leader(ship)?\\b/gi',
    '/\\bbest practices?\\b/gi',
    '/\\bblue[- ]sky thinking\\b/gi',
    '/\\bdrink the kool[- ]aid\\b/gi',
    '/\\bhigh[- ]level\\b/gi',
    '/\\b30,?000[- ]foot view\\b/gi',
    '/\\bideate\\b/gi',
    '/\\boperationalize\\b/gi',
    '/\\bsocialize\\b/gi',
    '/\\brock ?star\\b/gi',
    '/\\bninja\\b/gi',
    '/\\bguru\\b/gi',
    '/\\bbig data\\b/gi',
    '/\\bdigital transformation\\b/gi',
    '/\\bAI[- ]powered\\b/gi',
    '/\\bcloud[- ]based\\b/gi',
    '/\\bdata[- ]driven\\b/gi',
    '/\\bROI\\b/gi',
    '/\\bKPI\\b/gi',
    '/\\bdeep dive\\b/gi',
    '/\\bdeliverables?\\b/gi',
    '/\\bempower(ment)?\\b/gi',
    '/\\boptimize\\b/gi',
    '/\\bstreamline\\b/gi'
  ],
  tier3: [
    '/\\bfree\\b/gi',
    '/\\bguaranteed\\b/gi',
    '/\\bamazing\\b/gi',
    '/\\bincredible\\b/gi',
    '/\\bunbelievable\\b/gi',
    '/\\bmind[- ]blowing\\b/gi',
    '/\\brevolutionary\\b/gi',
    '/\\bmiracle\\b/gi',
    '/\\bbest[- ]in[- ]class\\b/gi',
    '/\\bclick here\\b/gi',
    '/\\bbuy now\\b/gi',
    '/\\bact (now|immediately)\\b/gi',
    '/\\blimited time offer\\b/gi',
    "/\\bdon'?t wait\\b/gi",
    '/\\bonce in a lifetime\\b/gi',
    '/\\bno strings attached\\b/gi',
    '/\\brisk[- ]free\\b/gi',
    '/\\bmake money\\b/gi',
    '/\\bearn money\\b/gi',
    '/\\bproven results\\b/gi',
    '/\\bspecial promotion\\b/gi',
    '/\\bsave big\\b/gi',
    '/\\blowest price\\b/gi',
    '/\\bbest (deal|price|offer)\\b/gi',
    '/\\bfree consultation\\b/gi',
    '/\\bmust[- ]have\\b/gi',
    '/\\bnext[- ]level\\b/gi',
    '/\\braise(d)? the bar\\b/gi',
    '/\\bstand out from the crowd\\b/gi',
    '/\\bcontent is king\\b/gi',
    '/\\bhit the ground running\\b/gi',
    '/\\bin a nutshell\\b/gi',
    '/\\bbasically\\b/gi',
    '/\\bessentially\\b/gi',
    '/\\bactually\\b/gi'
  ]
};

let currentPatterns = {
  tier1: [],
  tier2: [],
  tier3: [],
  custom: []
};

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await loadPatterns();
  setupTabs();
  setupEventListeners();
  renderAllPatterns();
});

// Load patterns from storage
async function loadPatterns() {
  const stored = await chrome.storage.sync.get('customPatterns');

  if (stored.customPatterns) {
    currentPatterns = stored.customPatterns;
  } else {
    // Initialize with defaults
    currentPatterns.tier1 = [...DEFAULT_PATTERNS.tier1];
    currentPatterns.tier2 = [...DEFAULT_PATTERNS.tier2];
    currentPatterns.tier3 = [...DEFAULT_PATTERNS.tier3];
    currentPatterns.custom = [];
  }
}

// Save patterns to storage
async function savePatterns() {
  await chrome.storage.sync.set({ customPatterns: currentPatterns });
  showStatus('Patterns saved successfully!');
}

// Setup tabs
function setupTabs() {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active from all tabs and panels
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));

      // Add active to clicked tab and corresponding panel
      tab.classList.add('active');
      const panelId = tab.getAttribute('data-tab');
      document.getElementById(panelId).classList.add('active');
    });
  });
}

// Setup event listeners
function setupEventListeners() {
  // Add pattern buttons
  document.getElementById('tier1Add').addEventListener('click', () => addPattern('tier1'));
  document.getElementById('tier2Add').addEventListener('click', () => addPattern('tier2'));
  document.getElementById('tier3Add').addEventListener('click', () => addPattern('tier3'));
  document.getElementById('customAdd').addEventListener('click', () => addCustomPattern());

  // Event delegation for delete buttons
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('pattern-delete')) {
      const tier = e.target.getAttribute('data-tier');
      const index = parseInt(e.target.getAttribute('data-index'));
      deletePattern(tier, index);
    }
  });

  // Action buttons
  document.getElementById('exportBtn').addEventListener('click', exportPatterns);
  document.getElementById('importBtn').addEventListener('click', () => {
    document.getElementById('importFile').click();
  });
  document.getElementById('importFile').addEventListener('change', importPatterns);
  document.getElementById('resetBtn').addEventListener('click', resetToDefaults);
  document.getElementById('saveBtn').addEventListener('click', () => {
    window.close();
  });

  // Pattern tester
  document.getElementById('testBtn').addEventListener('click', testPattern);
  document.getElementById('testPattern').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') testPattern();
  });
}

// Add pattern to tier
async function addPattern(tier) {
  const input = document.getElementById(`${tier}Input`);
  const pattern = input.value.trim();

  if (!pattern) {
    showStatus('Please enter a pattern', true);
    return;
  }

  // Validate regex format
  if (!pattern.startsWith('/') || !pattern.match(/\/[gimuy]*$/)) {
    showStatus('Pattern must be in regex format: /pattern/flags', true);
    return;
  }

  currentPatterns[tier].push(pattern);
  input.value = '';
  renderPatterns(tier);
  await savePatterns();
  showStatus(`Pattern added to ${tier.toUpperCase()}`);
}

// Add custom pattern with weight
async function addCustomPattern() {
  const input = document.getElementById('customInput');
  const weight = parseInt(document.getElementById('customWeight').value);
  const pattern = input.value.trim();

  if (!pattern) {
    showStatus('Please enter a pattern', true);
    return;
  }

  if (!pattern.startsWith('/') || !pattern.match(/\/[gimuy]*$/)) {
    showStatus('Pattern must be in regex format: /pattern/flags', true);
    return;
  }

  currentPatterns.custom.push({ pattern, weight });
  input.value = '';
  renderPatterns('custom');
  await savePatterns();
  showStatus('Custom pattern added');
}

// Delete pattern
async function deletePattern(tier, index) {
  currentPatterns[tier].splice(index, 1);
  renderPatterns(tier);
  await savePatterns();
  showStatus('Pattern deleted');
}

// Render all pattern lists
function renderAllPatterns() {
  renderPatterns('tier1');
  renderPatterns('tier2');
  renderPatterns('tier3');
  renderPatterns('custom');
}

// Render patterns for a specific tier
function renderPatterns(tier) {
  const container = document.getElementById(`${tier}List`);
  container.innerHTML = '';

  const patterns = currentPatterns[tier];

  if (patterns.length === 0) {
    container.innerHTML = '<div style="color: #666; text-align: center; padding: 24px;">No patterns in this tier</div>';
    return;
  }

  patterns.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'pattern-item';

    const pattern = tier === 'custom' ? item.pattern : item;
    const weight = tier === 'custom' ? item.weight : getTierWeight(tier);

    const patternText = document.createElement('span');
    patternText.className = 'pattern-text';
    patternText.textContent = pattern;

    const patternWeight = document.createElement('span');
    patternWeight.className = 'pattern-weight';
    patternWeight.textContent = `${weight}pts`;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'pattern-delete';
    deleteBtn.textContent = '[ DELETE ]';
    deleteBtn.setAttribute('data-tier', tier);
    deleteBtn.setAttribute('data-index', index);

    div.appendChild(patternText);
    div.appendChild(patternWeight);
    div.appendChild(deleteBtn);

    container.appendChild(div);
  });
}

// Get tier weight
function getTierWeight(tier) {
  const weights = { tier1: 3, tier2: 2, tier3: 1 };
  return weights[tier] || 1;
}

// Export patterns
function exportPatterns() {
  const data = JSON.stringify(currentPatterns, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'deslop-patterns.json';
  a.click();

  URL.revokeObjectURL(url);
  showStatus('Patterns exported');
}

// Import patterns
async function importPatterns(event) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    const imported = JSON.parse(text);

    // Validate structure
    if (!imported.tier1 || !imported.tier2 || !imported.tier3) {
      throw new Error('Invalid pattern file format');
    }

    if (confirm('This will replace all current patterns. Continue?')) {
      currentPatterns = imported;
      renderAllPatterns();
      showStatus('Patterns imported successfully');
    }
  } catch (error) {
    showStatus('Error importing patterns: ' + error.message, true);
  }

  event.target.value = ''; // Reset file input
}

// Reset to defaults
async function resetToDefaults() {
  if (!confirm('This will reset all patterns to defaults. Continue?')) {
    return;
  }

  currentPatterns.tier1 = [...DEFAULT_PATTERNS.tier1];
  currentPatterns.tier2 = [...DEFAULT_PATTERNS.tier2];
  currentPatterns.tier3 = [...DEFAULT_PATTERNS.tier3];
  currentPatterns.custom = [];

  renderAllPatterns();
  await savePatterns();
  showStatus('Reset to defaults');
}

// Show status message
function showStatus(message, isError = false) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = isError ? 'status error' : 'status';

  setTimeout(() => {
    status.textContent = '';
    status.className = 'status';
  }, 3000);
}

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Pattern tester
function testPattern() {
  const patternInput = document.getElementById('testPattern').value.trim();
  const testText = document.getElementById('testText').value;
  const resultsDiv = document.getElementById('testResults');
  const matchCountEl = document.getElementById('matchCount');
  const matchListEl = document.getElementById('matchList');
  const highlightedTextEl = document.getElementById('highlightedText');

  if (!patternInput) {
    showStatus('Please enter a pattern to test', true);
    return;
  }

  if (!testText) {
    showStatus('Please enter some text to test against', true);
    return;
  }

  // Parse the pattern
  const match = patternInput.match(/^\/(.+)\/([gimuy]*)$/);
  if (!match) {
    showStatus('Pattern must be in regex format: /pattern/flags', true);
    return;
  }

  let regex;
  try {
    regex = new RegExp(match[1], match[2]);
  } catch (e) {
    showStatus('Invalid regex pattern: ' + e.message, true);
    return;
  }

  // Test the pattern
  const matches = testText.match(regex);
  const matchCount = matches ? matches.length : 0;

  // Show results
  resultsDiv.style.display = 'block';
  matchCountEl.textContent = `Found ${matchCount} match${matchCount === 1 ? '' : 'es'}`;

  // Show unique matches
  if (matches) {
    const uniqueMatches = [...new Set(matches)];
    matchListEl.innerHTML = uniqueMatches
      .map(m => `<div class="match-item">"${escapeHtml(m)}"</div>`)
      .join('');

    // Highlight matches in text
    let highlightedHtml = escapeHtml(testText);
    // Sort matches by length (longest first) to avoid partial replacements
    uniqueMatches.sort((a, b) => b.length - a.length);
    uniqueMatches.forEach(m => {
      const escaped = escapeHtml(m);
      const pattern = new RegExp(escaped.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      highlightedHtml = highlightedHtml.replace(pattern, `<mark>${escaped}</mark>`);
    });
    highlightedTextEl.innerHTML = highlightedHtml;
  } else {
    matchListEl.innerHTML = '<div class="no-matches">No matches found</div>';
    highlightedTextEl.innerHTML = escapeHtml(testText);
  }

  showStatus(`Test complete: ${matchCount} match${matchCount === 1 ? '' : 'es'} found`);
}
