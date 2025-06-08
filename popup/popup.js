// urls and media locations can update if needed
const MEDIA_DOMAINS = [
  'aliexpress.com',
  'alibaba.com',
  'alicdn.com',
  'aliexpress.' // Catches .co.uk, .ru, etc
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

function renderMedia(media) {
  const container = document.getElementById('imageSelection');
  container.innerHTML = '';

  media.images.forEach(img => {
    const div = document.createElement('div');
    div.className = 'media-item';
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

  // reset UI
  container.innerHTML = '';
  loading.style.display = 'block';
  downloadBtn.disabled = true;

  try {
    const media = await fetchMedia();
    if (media.images.length === 0) {
      throw new Error('No media found. Scroll down and try again.');
    }
    renderMedia(media);
  } catch (error) {
    container.innerHTML = `<p class="error">${error.message}</p>`;
  } finally {
    loading.style.display = 'none';
    container.style.display = 'block';
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