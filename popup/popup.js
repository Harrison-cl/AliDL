// URLs and media locations
const MEDIA_DOMAINS = [
  'aliexpress.com',
  'alibaba.com',
  'aliexpress.us',
  'aliexpress.ru',
  'aliexpress.co.uk',
  'aliexpress.ca',
  'alicdn.com'
];

function isSupportedSite(url) {
  try {
    const hostname = new URL(url).hostname;
    return MEDIA_DOMAINS.some(domain => hostname.includes(domain));
  } catch {
    return false;
  }
}

function isValidProductPage(url) {
  // Skip wp.html and other redirect pages
  if (url.includes('wp.html') || url.includes('/wp/')) {
    return false;
  }
  
  // Check for product indicators
  return url.includes('/item/') || 
         url.includes('/product/') || 
         url.includes('/wholesale/') ||
         url.includes('productId=') ||
         url.includes('/store/product/');
}



// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log("Popup initialized");
});