// content_script.js
if (typeof window.AliDL_LOADED === 'undefined') {
  window.AliDL_LOADED = true;
}

//config
const VIDEO_DOMAINS = {
  // Domains to allow (including all AliExpress regions)
  allowedDomains: [
    'alicdn.com',
    'alivideo.com',
    'alibaba.com',
    'aliexpress-media.com',
    'ailiexpress.ru',
    'aliexpress.us',
    'aliexpress.' // Catches all .com, .us, .ru, etc.
    // add more domains if needed
  ],
}


// video dection function main

function detectVideos() {
     // Video detection logic will go here
    console.log("AliDL video detector active");
  }

  // Run detection on load and when new content appears
  document.addEventListener('DOMContentLoaded', detectVideos);
  new MutationObserver(detectVideos).observe(document.body, {
    childList: true,
    subtree: true
  });
