
function isSupportedSite(url) {
  return /aliexpress|alibaba|alicdn/.test(url?.hostname || '');
}



document.getElementById('downloadBtn').addEventListener('click', async () => {
  try {
    // 1. Get the active tab
    const tabs = await chrome.tabs.query({ 
      active: true, 
      currentWindow: true,  
    });

    
    if (!tabs.length || !isSupportedSite(new URL(tabs[0].url))) {
      alert('Please open an AliExpress or Alibaba product page first');
      return;
    }
    const tab = tabs[0];
    console.log("Working with tab:", tab.url);

    // 2. Get media
    let response;
    try {
      response = await chrome.tabs.sendMessage(
        tab.id, 
        { action: "getMedia" },
        { frameId: 0 } 
      );
    } catch (messageError) {
      console.error("Message failed:", messageError);
      alert("Content script didn't respond. Try refreshing the page.");
      return;
    }

    // 3. Download with CONFIRMATION
    if (response?.images?.length) {
      await chrome.downloads.download({
        url: response.images[0],
        filename: `ali_${Date.now()}.jpg`, // Unique filename
        saveAs: false
      });
      alert('Download started! Check your downloads folder.');
    } else {
      alert('No supported images found on this page.');
    }
  } catch (error) {
    console.error("Complete error:", error);
    alert(`Failed: ${error.message}`);
  }
});