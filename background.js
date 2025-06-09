// This script runs in the background and listens for messages from content scripts.

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "download") { // Unified action for both blob and direct URLs
        console.log(`[Background] Received download request for: ${request.url}`);
        chrome.downloads.download({
            url: request.url,
            filename: request.filename,
            saveAs: true // Prompts user for location
        }, (downloadId) => {
            if (chrome.runtime.lastError) {
                console.error(`[Background] Download error: ${chrome.runtime.lastError.message}`);
                sendResponse({ success: false, error: chrome.runtime.lastError.message });
            } else {
                console.log(`[Background] Download initiated with ID: ${downloadId}`);
                sendResponse({ success: true, downloadId: downloadId });
            }
        });
        return true; // Indicate that sendResponse will be called asynchronously
    }
});