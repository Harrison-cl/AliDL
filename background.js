chrome.runtime.onInstalled.addListener(() => {
    console.log("AliDL extension installed/updated");
});


chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === 'download_video') {
    chrome.downloads.download({
      url: msg.url,
      filename: `aliexpress_video_${Date.now()}.${extension || 'mp4'}` // Fallback to mp4
    });
  }
});


// Change 2: Broaden network sniffing beyond .mp4/.m3u8
chrome.webRequest.onCompleted.addListener(
  (details) => {
    const isVideo = /\.(mp4|webm|mov|ts|m3u8)(\?|$)/i.test(details.url);
    if (isVideo) {
      chrome.tabs.sendMessage(details.tabId, { type: 'VIDEO_URL', url: details.url });
    }
  },
  { urls: ["*://*.aliexpress.com/*"] }
);