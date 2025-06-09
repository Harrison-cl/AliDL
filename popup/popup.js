// urls and media locations can update if needed
const MEDIA_DOMAINS = [
  'aliexpress.com',
  'alibaba.com',
  'aliexpress.us',
  'aliexpress.ru',
  'aliexpress.co.uk',
  'aliexpress.ca',
  'alicdn.com',
  'aliexpress.' // SHOULD catch .ru, .co.uk, etc. but doesnt?
];

function isSupportedSite(url) {
  try {
    const hostname = new URL(url).hostname;
    return MEDIA_DOMAINS.some(domain => 
      domain.endsWith('.') ? hostname.startsWith(domain) : hostname.includes(domain)
    );
  } catch {
    return false;
  }
}

//core
async function fetchMedia() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab?.url || !isSupportedSite(tab.url)) {
    throw new Error('Please open an AliExpress/Alibaba product page');
  }

  const messagePromise = chrome.tabs.sendMessage(tab.id, { action: 'getMedia' });

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Media loading timed out. Please try again.')), 2000);
  });

  return Promise.race([messagePromise, timeoutPromise]);
}


// Selection management
function setAllCheckboxes(checked) {
  document.querySelectorAll('#imageSelection input').forEach(checkbox => {
    checkbox.checked = checked;
  });
}

document.getElementById('selectAll').addEventListener('click', () => setAllCheckboxes(true));
document.getElementById('deselectAll').addEventListener('click', () => setAllCheckboxes(false));

// Thumbnail toggle
document.getElementById('showThumbnails').addEventListener('change', (e) => {
  const show = e.target.checked;
  document.querySelectorAll('#imageSelection .media-item').forEach(item => {
    if (item.dataset.isThumbnail === "true") {
      item.style.display = show ? 'flex' : 'none';
    }
  });
});

function renderMedia(media = { images: [] }) {  // Default parameter
  const container = document.getElementById('imageSelection');
  container.innerHTML = '';

  // Safety check
  if (!media || !media.images) {
    console.error('Invalid media data:', media);
    return;
  }

  media.images.forEach(img => {
    const div = document.createElement('div');
    div.className = 'media-item';
    
    // attempted thumbnail fix
    const isThumbnail = img.includes('_50x50.') || img.includes('_thumbnail');
    div.dataset.isThumbnail = isThumbnail;
    div.style.display = isThumbnail ? 'none' : 'flex';

    div.innerHTML = `
      <input type="checkbox" id="${encodeURIComponent(img)}" checked>
      <label for="${encodeURIComponent(img)}">
        <img src="${img}" loading="lazy">
        <span>${img.split('/').pop()?.slice(0, 20)}...</span>
      </label>
    `;
    container.appendChild(div);
  });
}

// event handlers
async function handleLoad() {
  const container = document.getElementById('imageSelection');
  const loading = document.getElementById('loading');
  const downloadBtn = document.getElementById('downloadSelected');

  // Reset UI
  container.innerHTML = '';
  loading.style.display = 'block';
  downloadBtn.disabled = true;

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab?.url) {
      throw new Error('No active tab found');
    }

    // Primary attempt - normal message passing
    let media;
    try {
      media = await chrome.tabs.sendMessage(tab.id, { action: "getMedia" });
      console.log("Primary method results:", media);
    } catch (e) {
      console.warn("Message passing failed, trying direct scraping...");
      // Fallback: Directly scrape images if messaging fails
      media = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          return [...document.querySelectorAll('img')]
            .map(img => img.src)
            .filter(src => src && 
              src.includes('alicdn.com') && 
              (src.includes('_960x960') || 
               src.includes('_750x') ||
               src.includes('detail-desc'))
            );
        }
      });
      media = { images: media[0].result };
    }

    if (!media?.images?.length) {
      throw new Error('No product images found. Try scrolling down.');
    }

    renderMedia(media);

  } catch (error) {
    console.error("Error:", error);
    container.innerHTML = `<p class="error">${error.message}</p>`;
  } finally {
    loading.style.display = 'none';
    downloadBtn.disabled = false;
  }
}

function handleDownload() {
  document.querySelectorAll('#imageSelection input:checked').forEach(checkbox => {
    const url = decodeURIComponent(checkbox.id);
    const ext = url.match(/\.(webp|png|jpg|jpeg)/i)?.[1] || 'jpg';
    
    chrome.downloads.download({
      url: url,
      filename: `product_${Date.now()}.${ext}`,
      conflictAction: 'uniquify',
      saveAs: true
    });
  });
}

//init 
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('downloadSelected').addEventListener('click', handleDownload);
  handleLoad();
});