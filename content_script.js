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

// watch for mouseover events on video elements
document.addEventListener('mouseover', (event) => {
    const video = event.target.closest('video');
    if(video && isAliExpressVideo(video.src)) {
        addDownloadButton(video);
    }
}, true); // use capture phase to catch dynamically loaded videos

// check if video is from aliexpress / alibaba domains
function isAliExpressVideo(src) {
        return VIDEO_DOMAINS.some(domain => src.includes(domain));
}

// add download button to video element
function addDownloadButton(video) {
    // check if button already exists
    if(video._alidlButtonAdded) return;
    video._alidlButtonAdded = true; // mark as added

    const btn = document.createElement('button');
    btn.className = 'alidl-download-btn';
    btn.innerHTML = '⬇️'; // use a simple download icon

    btn.onclick = (event) => {
        event.stopPropagation(); // prevent video controls from showing
        chrome.runtime.sendMessage({
            action: 'downloadVideo',
            url: video.src
        }, (response) => {
            if(response.success) {
                alert('Video download started!');
            } else {
                alert('Failed to start download: ' + response.error);
            }
        });
    };

    video.parentElement.style.position = 'relative'; // ensure parent has position
    video.parentElement.appendChild(btn);
}