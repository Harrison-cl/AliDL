// content_script.js
(function() {
  function addDownloadButton(video) {
    if (video.dataset.alidlProcessed) return;
    video.dataset.alidlProcessed = true;
    
    const btn = document.createElement('button');
    btn.textContent = '⬇️ Download';
    btn.className = 'alidl-download-btn';
    
    // Create a wrapper if the parent doesn't have relative positioning
    let wrapper = video.parentElement;
    if (getComputedStyle(wrapper).position === 'static') {
      wrapper.style.position = 'relative';
    }
    
    wrapper.appendChild(btn);
    
    btn.onclick = (e) => {
      e.stopPropagation();
      e.preventDefault();
      downloadVideo(video.src || video.currentSrc);
    };
  }

  async function downloadVideo(url) {
    if (!url) {
      alert('No video URL found');
      return;
    }
    
    if (url.startsWith('blob:')) {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const newUrl = URL.createObjectURL(blob);
        const filename = `alivideo_${Date.now()}.mp4`;
        chrome.runtime.sendMessage({ action: 'download', url: newUrl, filename });
      } catch (e) {
        console.error('Failed to download blob video:', e);
        alert('Failed to download video. Try right-clicking the video.');
      }
    } else {
      const filename = url.split('/').pop().split('?')[0] || `alivideo_${Date.now()}.mp4`;
      chrome.runtime.sendMessage({ action: 'download', url, filename });
    }
  }

  // Process existing videos
  function processVideos() {
    const videos = document.querySelectorAll('video:not([data-alidl-processed])');
    videos.forEach(addDownloadButton);
  }

  // Initial processing
  processVideos();

  // Watch for new videos being added
  const observer = new MutationObserver((mutations) => {
    let shouldProcess = false;
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1) { // Element node
          if (node.tagName === 'VIDEO' || node.querySelector('video')) {
            shouldProcess = true;
          }
        }
      });
    });
    
    if (shouldProcess) {
      processVideos();
    }
  });

  observer.observe(document.body, { 
    childList: true, 
    subtree: true 
  });
})();