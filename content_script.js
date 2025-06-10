// Create a floating download button
function createDownloadButton(url) {
  const btn = document.createElement('button');
  btn.textContent = '↓ Download Video';
  btn.style.position = 'fixed';
  btn.style.bottom = '20px';
  btn.style.right = '20px';
  btn.style.zIndex = '999999';
  btn.style.background = '#FF6A00';
  btn.style.color = 'white';
  btn.style.padding = '10px 15px';
  btn.style.border = 'none';
  btn.style.borderRadius = '4px';
  btn.style.cursor = 'pointer';
  
  btn.onclick = () => {
    chrome.runtime.sendMessage({ action: "download", url });
  };
  
  document.body.appendChild(btn);
  
  // Auto-remove after 30 seconds
  setTimeout(() => btn.remove(), 30000);
}

// Listen for new videos from background
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "NEW_VIDEO_FOUND") {
    createDownloadButton(message.url);
  }
});

// Optional: Also detect videos in page source
function scanForVideoElements() {
  document.querySelectorAll('video').forEach(video => {
    const src = video.src || video.querySelector('source')?.src;
    if (src && src.match(/\.(mp4|webm|mov|avi|m3u8)(\?|$)/i)) {
      createDownloadButton(src);
    }
  });
}

// Run initial scan and periodically rescan
scanForVideoElements();
setInterval(scanForVideoElements, 5000);