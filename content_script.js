//config
const MEDIA_CONFIG = {
  // Domains to allow (including all AliExpress regions)
  allowedDomains: [
    'alicdn.com',
    'alivideo.com',
    'alibaba.com',
    'aliexpress-media.com',
    'ailiexpress.ru',
    'aliexpress.' // Catches all .com, .us, .ru, etc.
  ],
  
  // Only include media from these paths
  requiredPaths: [
    '/item/',
    '/product/',
    '/wholesale/'
  ],
  
  // Image quality markers (order matters - high quality first)
  imageQualities: [
    '_2200x2200', // Highest quality
    '_800x800',
    '_500x500',
    '.jpg',        // Fallback
    '.webp'
  ]
};

// util
function isAllowedMedia(url) {
  try {
    const { hostname, pathname } = new URL(url);
    return (
      // Domain check
      MEDIA_CONFIG.allowedDomains.some(d => 
        d.endsWith('.') ? hostname.startsWith(d) : hostname.includes(d)
      ) &&
      // Path check
      MEDIA_CONFIG.requiredPaths.some(p => pathname.includes(p)) &&
      // Exclude thumbnails and icons
      !url.includes('_50x50.') &&
      !url.includes('/@img/') &&
      !url.includes('/@icon/')
    );
  } catch {
    return false;
  }
}

// core 
function getMedia() {
  // Stable selectors (tested on AliExpress US)
  const selectors = [
    '[data-zoom-image]',          // Zoomable images
    '.pdp-image-wrapper img',     // Main image
    '.image-gallery img',         // Thumbnails
    '.product-desc img'           // Descriptions
  ].join(', ');

  const images = Array.from(document.querySelectorAll(selectors))
    .map(el => el.src || el.dataset.src || el.dataset.zoomImage)
    .filter(src => src && src.includes('alicdn.com'));

  return { 
    images: [...new Set(images)], // Remove duplicates
    videos: [] 
  };
}



// debug
function logInitialState() {
  console.log("AliDL Content Script Loaded on:", window.location.href);
  console.log("Sample Elements Found:", {
  firstImage: document.querySelector('img')?.src,
  firstMainImage: document.querySelector('[image-index] img')?.src,
  firstDescImage: document.querySelector('.detail-desc img')?.src
});
}

// lazy load
const observer = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    if (mutation.addedNodes.length) {
      console.log("New content detected - rescanning...");
      // Optional: Auto-rescan here if needed
    }
  });
});
observer.observe(document, { subtree: true, childList: true });

// message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getMedia") {
    sendResponse(getMedia());
  }
  return true;
});

// init debug
logInitialState();