// De-Slop Background Service Worker

// Open side panel when extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId });
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateBadge') {
    updateBadge(sender.tab.id, request.count);
  }

  // Fetch URL content for the URL analyzer tool (runs in background to avoid CORS)
  if (request.action === 'fetchUrl') {
    const urlStr = request.url;
    // Validate URL - only allow http/https
    try {
      const parsed = new URL(urlStr);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        sendResponse({ success: false, error: 'Only HTTP/HTTPS URLs are allowed' });
        return;
      }
    } catch (e) {
      sendResponse({ success: false, error: 'Invalid URL format' });
      return;
    }
    fetch(urlStr, { redirect: 'follow' })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`);
        return r.text();
      })
      .then(html => sendResponse({ success: true, html }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true; // Keep message channel open for async response
  }

  // Dynamic pattern injection for non-English languages
  if (request.action === 'loadLanguagePatterns') {
    const lang = request.language;
    if (lang && lang !== 'en' && sender.tab) {
      chrome.scripting.executeScript({
        target: { tabId: sender.tab.id },
        files: [`patterns/${lang}.js`]
      }).then(() => {
        sendResponse({ success: true });
      }).catch((err) => {
        console.log(`[De-Slop] Could not load patterns for ${lang}:`, err.message);
        sendResponse({ success: false, error: err.message });
      });
      return true; // Keep message channel open for async response
    }
    sendResponse({ success: false, error: 'Invalid language or no tab' });
  }
});

function updateBadge(tabId, count) {
  if (count > 0) {
    chrome.action.setBadgeText({
      text: count.toString(),
      tabId: tabId
    });
    chrome.action.setBadgeBackgroundColor({
      color: '#FF6B6B',
      tabId: tabId
    });
  } else {
    chrome.action.setBadgeText({
      text: '',
      tabId: tabId
    });
  }
}

// Clear badge when tab is updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'loading') {
    chrome.action.setBadgeText({
      text: '',
      tabId: tabId
    });
  }
});

// Handle LinkedIn ad blocker toggle
chrome.storage.onChanged.addListener(async (changes, namespace) => {
  if (namespace === 'sync' && changes.linkedinBlockAds) {
    const enabled = changes.linkedinBlockAds.newValue;

    if (enabled) {
      await chrome.declarativeNetRequest.updateEnabledRulesets({
        enableRulesetIds: ['linkedin_ad_blocker']
      });
    } else {
      await chrome.declarativeNetRequest.updateEnabledRulesets({
        disableRulesetIds: ['linkedin_ad_blocker']
      });
    }
  }
});

// Initialize on install/update
chrome.runtime.onInstalled.addListener(async (details) => {
  const settings = await chrome.storage.sync.get({
    linkedinBlockAds: false,
    customPatterns: null,
    customPatterns_en: null
  });

  // Enable LinkedIn ad blocker if previously enabled
  if (settings.linkedinBlockAds) {
    await chrome.declarativeNetRequest.updateEnabledRulesets({
      enableRulesetIds: ['linkedin_ad_blocker']
    });
  }

  // Storage migration: move customPatterns to customPatterns_en for existing users
  if (details.reason === 'update' && settings.customPatterns && !settings.customPatterns_en) {
    await chrome.storage.sync.set({
      customPatterns_en: settings.customPatterns
    });
    console.log('[De-Slop] Migrated customPatterns to customPatterns_en');
  }
});
