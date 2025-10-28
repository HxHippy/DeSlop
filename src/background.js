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

// Initialize ad blocker state on install
chrome.runtime.onInstalled.addListener(async () => {
  const settings = await chrome.storage.sync.get({ linkedinBlockAds: false });

  if (settings.linkedinBlockAds) {
    await chrome.declarativeNetRequest.updateEnabledRulesets({
      enableRulesetIds: ['linkedin_ad_blocker']
    });
  }
});
