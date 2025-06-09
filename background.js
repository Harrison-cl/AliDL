chrome.runtime.onInstalled.addListener(() => {
    console.log("AliDL extension installed/updated");
});


chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === 'download_video') {
    chrome.downloads.download({
      url: msg.url,
      filename: `aliexpress_video_${Date.now()}.mp4`
    });
  }
});