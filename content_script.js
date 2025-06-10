// Function to add download buttons to videos
function addDownloadButtons() {
  const videos = document.querySelectorAll('video:not(.download-button-added)');
  
  videos.forEach(video => {
    // Skip if already processed
    if (video.classList.contains('download-button-added')) return;
    
    const button = document.createElement('button');
    button.textContent = 'Download';
    button.className = 'video-download-button';
  
    //handle click
     button.addEventListener('click', () => {
      const source = video.src || (video.querySelector('source')?.src);
      if (source) {
        chrome.runtime.sendMessage({action: 'download', url: source});
      }
   });

    // Add wrapper if needed for positioning
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    wrapper.style.display = 'inline-block';
    
    video.parentNode.insertBefore(wrapper, video);
    wrapper.appendChild(video);
    wrapper.appendChild(button);
    
    // Mark as processed
    video.classList.add('download-button-added');
  });
}

//initial run
addDownloadButtons();

//watch for dynamically added videos
const observer = new MutationObserver(addDownloadButtons);
observer.observe(document.body, {
  childList: true,
  subtree: true
});