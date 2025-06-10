const videoMap = new Map();

// Track highest quality versions
chrome.webRequest.onCompleted.addListener(
  (details) => {
    if (isVideoUrl(details.url)) {
      const key = getVideoKey(details.url);
      const existing = videoMap.get(key);
      
      if (!existing || isHigherQuality(details.url, existing.url)) {
        videoMap.set(key, {
          url: details.url,
          timestamp: Date.now(),
          tabId: details.tabId
        });
        
        chrome.tabs.sendMessage(details.tabId, {
          type: "VIDEO_UPDATE",
          videos: Array.from(videoMap.values())
        });
      }
    }
  },
  { urls: ["<all_urls>"] }
);

// Handle blob URLs
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    if (details.url.startsWith('blob:')) {
      chrome.scripting.executeScript({
        target: { tabId: details.tabId },
        func: captureBlobUrl,
        args: [details.url]
      });
    }
  },
  { urls: ["blob:*"] }
);

function captureBlobUrl(url) {
  fetch(url)
    .then(res => res.blob())
    .then(blob => {
      const blobUrl = URL.createObjectURL(blob);
      chrome.runtime.sendMessage({
        type: "BLOB_VIDEO",
        url: blobUrl,
        filename: `video-${Date.now()}.mp4`
      });
    });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "download") {
    chrome.downloads.download({
      url: request.url,
      filename: request.filename || `video-${Date.now()}.${getExtension(request.url)}`,
      conflictAction: 'uniquify'
    });
  }
});

// Helper functions
function isVideoUrl(url) {
  return /\.(mp4|webm|mov|avi|m3u8)(\?|$)/i.test(url) || 
         /\/video\/|\/v\/|videocdn|video\.alibaba/i.test(url);
}

function getVideoKey(url) {
  // Group similar URLs by their base path
  return url.split('?')[0].split('/').slice(0, -1).join('/');
}

function isHigherQuality(newUrl, oldUrl) {
  // Simple quality detection - prefer higher resolution/bitrate
  const newQuality = newUrl.match(/(hd|1080|720|high|quality=(\d+))/i);
  const oldQuality = oldUrl.match(/(hd|1080|720|high|quality=(\d+))/i);
  
  if (!oldQuality) return true;
  if (!newQuality) return false;
  
  return (newQuality[2] || newQuality[1]) > (oldQuality[2] || oldQuality[1]);
}

function getExtension(url) {
  return url.split('.').pop().split(/[?#]/)[0] || 'mp4';
}