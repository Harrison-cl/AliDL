chrome.runtime.onInstalled.addListener(() => {
    console.log("AliDL extension installed/updated");
});


chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === 'download_video') {
    chrome.downloads.download({
      url: msg.url,
      filename: `aliexpress_video_${Date.now()}.mp4`
    });
  }
});


chrome.webRequest.onCompleted.addListener(
  (details) => {
    if (details.url.includes('.m3u8') || details.url.includes('.mp4')) {
      chrome.tabs.sendMessage(details.tabId, { type: 'VIDEO_URL', url: details.url });
    }
  },
  { urls: ["*://*.aliexpress.com/*"] }
);