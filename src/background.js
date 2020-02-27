
//example of using a message handler from the inject scripts
chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
  	chrome.browserAction.setBadgeText({text: 'hi', tabId: sender.tab.id});
    sendResponse();
  });

console.log('background.js!');