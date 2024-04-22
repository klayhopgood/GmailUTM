function sendUTMParams(utmParams) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { utmParams });
  });
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'saveUTMParams') {
    chrome.storage.local.set({ utm: message.utmParams }, () => {
      sendUTMParams(message.utmParams);
    });
  }
});
