console.log("AliDL Content Script Loaded");

// Configuration for media filtering
const MEDIA_CONFIG = {
  allowedDomains: ['alicdn.com', 'alivideo.com', 'alibaba.com', 'aliexpress-media.com'
    , 'aliexpress.com', 'alibaba.com', 'aliexpress.ru', 'aliexpress.co', 'aliexpress.'
  ],
  requiredPaths: ['/item/', '/product/', '/wholesale/'],
  imageTypes: ['_jpg', '.webp', '.png', '.jpg', '.jpeg', '.gif'], 
  videoTypes: ['.mp4', '.webm', '.avi', '.mov', '.mkv', '.wmv', '.flv']
};

// url checker
function isAllowedMedia(url) {
  try {
    const { hostname } = new URL(url);
    return (
      MEDIA_CONFIG.allowedDomains.some(d => 
        d.endsWith('.') ? hostname.startsWith(d) : hostname.includes(d)
      ) &&
      MEDIA_CONFIG.requiredPaths.some(p => url.includes(p))
    );
  } catch {
    return false;
  }
}

// media checker
function isMediaType(url, types) {
  return types.some(type => url.includes(type));
}

function getMedia() {
  // Gets all media first
  const mediaElements = [
    ...document.querySelectorAll('img, video, [data-video-url], [image-index]')
  ];

  // Processes media
  const results = mediaElements.reduce((acc, el) => {
    const src = el.src || el.getAttribute('src') || 
               el.getAttribute('data-src') || el.getAttribute('data-video-url');
    
    if (!src || !isAllowedMedia(src)) return acc;

    // video and image categorization
    if (el.tagName === 'VIDEO' || src.includes('alivideo.com') || 
        isMediaType(src, MEDIA_CONFIG.videoTypes)) {
      acc.videos.push(src);
    } else if (isMediaType(src, MEDIA_CONFIG.imageTypes)) {
      acc.images.push(src);
    }
    
    return acc;
  }, { images: [], videos: [] });

  console.log("Filtered media:", results);
  return results;
}

// Lazy loading observer
const observer = new MutationObserver(() => {
  console.log("DOM changed - checking for new media");
});
observer.observe(document, { subtree: true, childList: true });


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getMedia") sendResponse(getMedia());
  return true;
});