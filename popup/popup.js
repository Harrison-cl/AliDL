document.addEventListener('DOMContentLoaded', () => {
  const videoList = document.getElementById('video-list');
  
  // Get videos from content script
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {action: "getVideos"}, (response) => {
      if (response && response.videos.length > 0) {
        response.videos.forEach((video, index) => {
          const item = document.createElement('div');
          item.className = 'video-item';
          
          const btn = document.createElement('button');
          btn.className = 'download-btn';
          btn.textContent = `Download Video ${index + 1}`;
          btn.onclick = () => {
            chrome.downloads.download({
              url: video.url,
              filename: `alibaba-video-${Date.now()}.mp4`
            });
          };
          
          item.appendChild(btn);
          videoList.appendChild(item);
        });
      } else {
        videoList.innerHTML = '<div class="no-videos">No videos found on this page</div>';
      }
    });
  });
});