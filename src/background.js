// Open a link to your hold bin when you click the extension icon.

chrome.browserAction.onClicked.addListener(() => {
    chrome.tabs.create({
        url: 'https://www.beatport.com/hold-bin?per-page=150'
    });
});

// Tell the Beatport tab when navigation happens.

chrome.webNavigation.onDOMContentLoaded.addListener(
    details => {
        console.log('background.js: webNavigation.onDOMContentLoaded fired.');
        chrome.tabs.sendMessage(details.tabId, { navigatedTo: details.url });
    },
    { url: [{ hostSuffix: 'beatport.com' }] }
);

// Update our badge when the Beatport tab tells us the key changed.

chrome.extension.onMessage.addListener((request, sender, sendResponse) => {
    chrome.browserAction.setBadgeText({ text: request.key });
    sendResponse();
});
