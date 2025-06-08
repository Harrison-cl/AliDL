// Find images/videos on aliexpress / alibaba
console.log("AliDL Content Script Loaded");

// observer for lazy loading images
const observer = new MutationObserver(() => {
    console.log("DOM changed - images may have loaded");
});
observer.observe(document, { subtree: true, childList: true });

const allowedDomains = [
  'aliexpress.com',
  'aliexpress.us',
  'alibaba.com',
  'alicdn.com'
  // can add more here if needed
];

function isAllowedUrl(url) {
  try {
    const domain = new URL(url).hostname;
    return allowedDomains.some(d => domain.includes(d));
  } catch {
    return false;
  }
}



function getMedia() {
    const images = Array.from(document.querySelectorAll('img'))
        .map(img => img.src)
        .filter(src => isAllowedUrl(src));

    console.log("Found images:", images);

    const videos = Array.from(document.querySelectorAll('video source'))
        .map(video => video.src);

    return {images, videos};
}


//send URLs to popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getMedia") {
        sendResponse(getMedia());
    }
    return true; // Keep the message channel open for sendResponse
});