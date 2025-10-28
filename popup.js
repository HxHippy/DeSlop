// De-Slop Popup Script

// Keep track of current tab
let currentTab = null;

document.addEventListener('DOMContentLoaded', async () => {
  const slopCountEl = document.getElementById('slopCount');
  const enabledToggle = document.getElementById('enabledToggle');
  const sensitivitySlider = document.getElementById('sensitivitySlider');
  const rescanBtn = document.getElementById('rescanBtn');
  const resetBtn = document.getElementById('resetBtn');
  const settingsBtn = document.getElementById('settingsBtn');
  const blockEmojisToggle = document.getElementById('blockEmojis');
  const blockTier1Toggle = document.getElementById('blockTier1');
  const blockTier2Toggle = document.getElementById('blockTier2');
  const blockTier3Toggle = document.getElementById('blockTier3');
  const blockStopWordsToggle = document.getElementById('blockStopWords');
  const blockEmDashesToggle = document.getElementById('blockEmDashes');

  // LinkedIn Fixer elements
  const linkedinFixerSection = document.getElementById('linkedinFixer');
  const blockVideosToggle = document.getElementById('blockVideos');
  const blockAdsToggle = document.getElementById('blockAds');
  const darkerModeToggle = document.getElementById('darkerMode');

  // Load saved settings
  const settings = await chrome.storage.sync.get({
    enabled: true,
    sensitivity: 3,
    blockEmojis: false,
    blockTier1: true,
    blockTier2: true,
    blockTier3: false,
    blockStopWords: true,
    blockEmDashes: true,
    linkedinBlockVideos: false,
    linkedinBlockAds: false,
    linkedinDarkerMode: false
  });

  enabledToggle.checked = settings.enabled;
  sensitivitySlider.value = settings.sensitivity;
  blockEmojisToggle.checked = settings.blockEmojis;
  blockTier1Toggle.checked = settings.blockTier1;
  blockTier2Toggle.checked = settings.blockTier2;
  blockTier3Toggle.checked = settings.blockTier3;
  blockStopWordsToggle.checked = settings.blockStopWords;
  blockEmDashesToggle.checked = settings.blockEmDashes;
  blockVideosToggle.checked = settings.linkedinBlockVideos;
  blockAdsToggle.checked = settings.linkedinBlockAds;
  darkerModeToggle.checked = settings.linkedinDarkerMode;

  // Get current tab and update count
  // For side panel, query the last focused window to get the actual active tab
  [currentTab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });

  if (currentTab) {
    // Show LinkedIn Fixer if on LinkedIn
    const isLinkedIn = currentTab.url && currentTab.url.includes('linkedin.com');
    if (isLinkedIn) {
      linkedinFixerSection.style.display = 'block';
    }

    // Get badge count for the active tab
    chrome.action.getBadgeText({ tabId: currentTab.id }, (text) => {
      slopCountEl.textContent = text || '0';
    });
  } else {
    slopCountEl.textContent = '0';
  }

  // Toggle enabled/disabled
  enabledToggle.addEventListener('change', async (e) => {
    await chrome.storage.sync.set({ enabled: e.target.checked });

    // Reload the current tab to apply changes
    if (currentTab) chrome.tabs.reload(currentTab.id);
  });

  // Update tier info display
  const updateTierInfo = (sensitivity) => {
    const tierInfo = document.getElementById('tierInfo');
    const descriptions = {
      1: '<strong>Tier 1 Only:</strong> AI-specific phrases only (very conservative)',
      2: '<strong>Tier 1 Only:</strong> AI-specific phrases only (conservative)',
      3: '<strong>Tiers 1 + 2:</strong> AI slop + Corporate buzzwords (balanced)',
      4: '<strong>Tiers 1 + 2 + 3:</strong> AI + Corporate + Marketing spam (aggressive)',
      5: '<strong>All Tiers + Nuclear:</strong> Maximum slop detection (very aggressive)'
    };
    tierInfo.innerHTML = descriptions[sensitivity] || descriptions[3];
  };

  // Update sensitivity
  sensitivitySlider.addEventListener('input', (e) => {
    updateTierInfo(parseInt(e.target.value));
  });

  sensitivitySlider.addEventListener('change', async (e) => {
    await chrome.storage.sync.set({ sensitivity: parseInt(e.target.value) });
  });

  // Initialize tier info display
  updateTierInfo(settings.sensitivity);

  // Rescan page button
  rescanBtn.addEventListener('click', () => {
    if (currentTab) chrome.tabs.reload(currentTab.id);
    window.close();
  });

  // Reset stats button
  resetBtn.addEventListener('click', async () => {
    if (currentTab) {
      chrome.action.setBadgeText({ text: '', tabId: currentTab.id });
      slopCountEl.textContent = '0';
    }
  });

  // Checker button
  const checkerBtn = document.getElementById('checkerBtn');
  checkerBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'checker.html' });
  });

  // Slop Machine button
  const slopMachineBtn = document.getElementById('slopMachineBtn');
  slopMachineBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'slop-machine.html' });
  });

  // Settings button
  settingsBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'settings.html' });
  });

  // Detection type toggles
  blockTier1Toggle.addEventListener('change', async (e) => {
    await chrome.storage.sync.set({ blockTier1: e.target.checked });
    if (currentTab) chrome.tabs.reload(currentTab.id);
  });

  blockTier2Toggle.addEventListener('change', async (e) => {
    await chrome.storage.sync.set({ blockTier2: e.target.checked });
    if (currentTab) chrome.tabs.reload(currentTab.id);
  });

  blockTier3Toggle.addEventListener('change', async (e) => {
    await chrome.storage.sync.set({ blockTier3: e.target.checked });
    if (currentTab) chrome.tabs.reload(currentTab.id);
  });

  blockEmojisToggle.addEventListener('change', async (e) => {
    await chrome.storage.sync.set({ blockEmojis: e.target.checked });
    if (currentTab) chrome.tabs.reload(currentTab.id);
  });

  blockStopWordsToggle.addEventListener('change', async (e) => {
    await chrome.storage.sync.set({ blockStopWords: e.target.checked });
    if (currentTab) chrome.tabs.reload(currentTab.id);
  });

  blockEmDashesToggle.addEventListener('change', async (e) => {
    await chrome.storage.sync.set({ blockEmDashes: e.target.checked });
    if (currentTab) chrome.tabs.reload(currentTab.id);
  });

  // LinkedIn Fixer toggles
  blockVideosToggle.addEventListener('change', async (e) => {
    await chrome.storage.sync.set({ linkedinBlockVideos: e.target.checked });
    if (currentTab) chrome.tabs.reload(currentTab.id);
  });

  blockAdsToggle.addEventListener('change', async (e) => {
    await chrome.storage.sync.set({ linkedinBlockAds: e.target.checked });
    if (currentTab) chrome.tabs.reload(currentTab.id);
  });

  darkerModeToggle.addEventListener('change', async (e) => {
    await chrome.storage.sync.set({ linkedinDarkerMode: e.target.checked });
    if (currentTab) chrome.tabs.reload(currentTab.id);
  });

  // Update count when user switches tabs (for side panel)
  chrome.tabs.onActivated.addListener(async (activeInfo) => {
    currentTab = await chrome.tabs.get(activeInfo.tabId);

    // Update slop count
    chrome.action.getBadgeText({ tabId: currentTab.id }, (text) => {
      slopCountEl.textContent = text || '0';
    });

    // Update LinkedIn fixer visibility
    const isLinkedIn = currentTab.url && currentTab.url.includes('linkedin.com');
    linkedinFixerSection.style.display = isLinkedIn ? 'block' : 'none';
  });

  // Update count when badge changes (for current tab)
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'updateBadge' && currentTab && sender.tab && sender.tab.id === currentTab.id) {
      slopCountEl.textContent = request.count.toString();
    }
  });
});
