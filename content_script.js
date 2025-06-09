// Prevent multiple declarations
if (typeof window.AliDL_LOADED === 'undefined') {
  window.AliDL_LOADED = true;
}

//config
const MEDIA_CONFIG = {
  // Domains to allow (including all AliExpress regions)
  allowedDomains: [
    'alicdn.com',
    'alivideo.com',
    'alibaba.com',
    'aliexpress-media.com',
    'ailiexpress.ru',
    'aliexpress.' // Catches all .com, .us, .ru, etc.
  ],
  
  // Only include media from these paths
  requiredPaths: [
    '/item/',
    '/product/',
    '/wholesale/',
    '/store/product/'
  ]
}