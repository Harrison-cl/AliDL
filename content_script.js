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
  // Gets all potential media elements
  const mediaElements = [
    ...document.querySelectorAll('img, video, [data-video-url], [image-index], [slate-data-type="image"]')
  ];

  // Process elements
  const results = mediaElements.reduce((acc, el) => {
    const src = el.src || 
                el.getAttribute('src') || 
                el.getAttribute('data-src') || 
                el.getAttribute('data-video-url') ||
                el.getAttribute('data-spm-url'); // AliExpress sometimes uses this
    
    if (!src || !isAllowedMedia(src)) return acc;

    // Categorize media
    if (el.tagName === 'VIDEO' || src.includes('alivideo.com') || 
        isMediaType(src, MEDIA_CONFIG.videoTypes)) {
      acc.videos.push(src);
    } else {
      acc.images.push(src); // Everything else is treated as image
    }
    
    return acc;
  }, { images: [], videos: [] });

  // DEBUG: Force test images if empty (temporary)
  if (results.images.length === 0 && results.videos.length === 0) {
    console.warn("No media found - adding test entries");
    results.images.push(
      "https://ae01.alicdn.com/kf/test_image.jpg",
      window.location.href.includes('aliexpress') ? 
        "https://ae01.alicdn.com/kf/real_image.jpg" : 
        "https://sc04.alicdn.com/real_image.jpg"
    );
  }

  console.log("Final media results:", results);
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

