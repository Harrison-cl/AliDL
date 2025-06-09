// content_script.js
(function() {
  // 1. Find all videos on page
  const videos = document.querySelectorAll('video');
  
  // 2. Add download button to each
  videos.forEach(video => {
    if (video.dataset.alidlProcessed) return; // Skip if already processed
    video.dataset.alidlProcessed = true;
    
    const btn = document.createElement('button');
    btn.textContent = '⬇️ Download';
    btn.style.cssText = `
      position: absolute;
      bottom: 10px;
      right: 10px;
      z-index: 9999;
      background: rgba(0,0,0,0.7);
      color: white;
      border: none;
      padding: 5px 10px;
      border-radius: 4px;
      cursor: pointer;
    `;
    
    btn.onclick = (e) => {
      e.stopPropagation();
      downloadVideo(video.src);
    };
    
    video.parentElement.style.position = 'relative';
    video.parentElement.appendChild(btn);
  });

  // 3. Simple download function

async function downloadVideo(url) {
  if (url.startsWith('blob:')) {
    try {
      const blob = await fetch(url).then(r => r.blob());
      url = URL.createObjectURL(blob);
    } catch (e) {
      alert('Failed to download blob video. Try right-clicking the video.');
      return;
    }
  }
  const filename = url.split('/').pop().split('?')[0] || `video_${Date.now()}.mp4`;
    chrome.runtime.sendMessage({ action: 'download', url, filename });
}}
)();

new MutationObserver(() => {
  document.querySelectorAll('video:not([data-alidl-processed])').forEach(video => {
    // Re-run the button adder
  });
}).observe(document.body, { childList: true, subtree: true });