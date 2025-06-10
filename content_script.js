// Find all videos on the page
function findVideos() {
  const videos = [];
  
  // Check direct video elements
  document.querySelectorAll('video').forEach(video => {
    const src = video.src || (video.querySelector('source')?.src);
    if (src) {
      videos.push({
        url: src.startsWith('//') ? `https:${src}` : src,
        element: video
      });
    }
  });
  
  return videos;
}

// Send videos to popup when requested
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getVideos") {
    sendResponse({videos: findVideos()});
  }
});

// Optional: Add a small indicator in the page
const indicator = document.createElement('div');
indicator.textContent = 'Video Downloader Ready';
indicator.style.position = 'fixed';
indicator.style.bottom = '10px';
indicator.style.right = '10px';
indicator.style.background = '#FF6A00';
indicator.style.color = 'white';
indicator.style.padding = '4px 8px';
indicator.style.borderRadius = '4px';
indicator.style.fontSize = '12px';
indicator.style.zIndex = '9999';
document.body.appendChild(indicator);