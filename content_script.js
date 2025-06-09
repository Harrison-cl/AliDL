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

// check if url is Blob
function isBlobUrl(url) {
  return url.startsWith('blob:');
}

// handle blob URL videos 
async function handleBlobVideo(video) {
  try {
    const blob = await fetch(video.src).then(r => r.blob());
    const extension = blob.type.split('/')[1] || 'mp4'; // Extract format from MIME type
    const objectUrl = URL.createObjectURL(blob);
    addDownloadButton(objectUrl, `video.${extension}`);
  } catch (error) {
    console.error("Blob download failed:", error);
  }
}

// watch for mouseover events on video elements
document.addEventListener('mouseover', (event) => {
    const video = event.target.closest('video');
    if(video && isAliExpressVideo(video.src)) {
        if(isBlobUrl(video.src)) {
            // if video is a Blob URL, we can't download it directly
            console.log("Blob video detected - fetching data...");
            handleBlobVideo(video);
        }else {
            // normal video URL
          addDownloadButton(video);
    }
    }
}, true); // use capture phase to catch dynamically loaded videos

// check if video is from aliexpress / alibaba domains
function isAliExpressVideo(src) {
        return VIDEO_DOMAINS.allowedDomains.some(domain => src.includes(domain));
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