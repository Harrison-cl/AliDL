const videoUrls = new Set();

chrome.webRequest.onCompleted.addListener(
  (details) => {
    if (details.url.match(/\.(mp4|webm|mov|avi|m3u8)(\?|$)/i)) {
      videoUrls.add(details.url);
      chrome.tabs.sendMessage(details.tabId, {
        type: "NEW_VIDEO_FOUND",
        url: details.url
      });
    }
  },
  { urls: ["<all_urls>"] },
  ["responseHeaders"]
);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "download") {
    chrome.downloads.download({
      url: request.url,
      filename: `alibaba-video-${Date.now()}.${request.url.split('.').pop().split('?')[0]}`
    });
  }
});