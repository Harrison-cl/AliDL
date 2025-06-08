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
    return MEDIA_CONFIG.allowedDomains.some(d => 
      d.endsWith('.') ? hostname.startsWith(d) : hostname.includes(d)
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
  // Enhanced selectors for AliExpress/Alibaba
  const mediaElements = [
    ...document.querySelectorAll(`
      img[src*=".jpg"], img[src*=".webp"], img[src*=".png"],
      [image-index] img,
      [slate-data-type="image"],
      [data-image-src],
      .image-thumb__img, .magnifier-image
    `)
  ];

  // Process all found elements
  const results = mediaElements.reduce((acc, el) => {
    const src = el.src || 
                el.dataset.src || 
                el.dataset.imageSrc ||
                el.getAttribute('data-video-url');
    
    if (!src || !isAllowedMedia(src)) return acc;
    acc.images.push(src);
    return acc;
  }, { images: [], videos: [] });

  console.log("Media Detection Results:", {
    elementsFound: mediaElements.length,
    validMedia: results.images.length
  });

  return results;
}

// DEBUG FUNCTION 
function logWorkingUrls() {
  const urls = Array.from(document.querySelectorAll('img'))
    .map(img => img.src || img.dataset.src)
    .filter(src => src && !src.startsWith('data:'))
    .slice(0, 5);
  console.log("Top 5 Working Image URLs:", urls);
}

// run debug
logWorkingUrls();

// Lazy loading observer
const observer = new MutationObserver((mutations) => {
  mutations.forEach(mutation => {
    if (mutation.addedNodes.length) {
      console.log("New nodes detected, rescanning media...");
      logWorkingUrls();
    }
  });
});
observer.observe(document, { subtree: true, childList: true });


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getMedia") {
    sendResponse(getMedia());
  }
  return true;
});

