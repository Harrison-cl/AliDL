// This script runs on AliExpress and Alibaba product pages to inject a download button.

(async () => {
    // Flag to prevent multiple buttons from being added to the same video
    const PROCESSED_VIDEO_ATTR = 'data-alidl-processed';
    const DOWNLOAD_BUTTON_ID = 'alidl-download-btn';
    const MESSAGE_BOX_ID = 'alidl-message-box'; // ID for the message box element

    // --- Helper function to display messages to the user ---
    function showMessage(message, type = 'info', duration = 3000) {
        let messageBox = document.getElementById(MESSAGE_BOX_ID);
        if (!messageBox) {
            messageBox = document.createElement('div');
            messageBox.id = MESSAGE_BOX_ID;
            document.body.appendChild(messageBox);
        }

        // Clear existing type classes
        messageBox.classList.remove('alidl-message-info', 'alidl-message-success', 'alidl-message-error');

        // Add the new type class
        messageBox.classList.add(`alidl-message-${type}`);

        messageBox.textContent = message;
        messageBox.style.opacity = '1';
        messageBox.style.transform = 'translateY(0)';

        // Hide message after a duration
        setTimeout(() => {
            messageBox.style.opacity = '0';
            messageBox.style.transform = 'translateY(-20px)';
        }, duration);
    }

    // --- Function to find the video element ---
    async function findVideoElement() {
        const videoSelectors = [
            'video', // Direct video tag
            '.J-detail-video-wrapper video', // Common AliExpress video wrapper
            '.video--videoPlay--26R7u video', // Another common video player class from user's context
            '.product-main-media video', // Alibaba main media container
            '.media-detail video', // Generic media detail
            '[data-spm-module="detail_media_video"] video', // Specific data attribute for video modules
            '.rax-view-v2 video', // Common React view
            'div[id*="video"] video', // Divs with 'video' in their ID
            'div[class*="video"] video', // Divs with 'video' in 'class'
            '.vc-player video', // AliExpress's new video player class
            '.video-player-container video' // Generic video player container
        ];

        // Try to find an existing video immediately
        for (const selector of videoSelectors) {
            const video = document.querySelector(selector);
            if (video && video.src && !video.hasAttribute(PROCESSED_VIDEO_ATTR)) {
                console.log(`[AliX DL] Found video with selector: ${selector}`);
                return video;
            }
        }

        // Fallback: Use MutationObserver for dynamically loaded videos
        return new Promise(resolve => {
            const observer = new MutationObserver((mutations, obs) => {
                for (const selector of videoSelectors) {
                    const video = document.querySelector(selector);
                    if (video && video.src && !video.hasAttribute(PROCESSED_VIDEO_ATTR)) {
                        console.log(`[AliX DL] Found video via MutationObserver with selector: ${selector}`);
                        obs.disconnect(); // Stop observing once found
                        resolve(video);
                        return;
                    }
                }
            });

            // Observe changes in the entire document body
            observer.observe(document.body, { childList: true, subtree: true });

            // Set a timeout to stop observing if video is not found within a reasonable time
            setTimeout(() => {
                obs.disconnect();
                console.log("[AliX DL] MutationObserver timed out. Video not found.");
                resolve(null);
            }, 10000); // 10 seconds timeout
        });
    }

    // --- Function to find a suitable parent container for the button ---
    // This is crucial for placing the button reliably *next to* or *above* the video.
    function findButtonContainer() {
        const containerSelectors = [
            '.product-main-media', // Alibaba's main media area
            '.gallery-container', // Common gallery wrapper
            '.detail-gallery-wrap', // AliExpress gallery
            '#J-detail-gallery-wrap', // AliExpress gallery ID
            '.product-info-main', // Area around product info
            '.image-view-item', // Common image/video container
            '.viewer-gallery', // Another common gallery
            'body' // Absolute fallback, less ideal but always exists
        ];

        for (const selector of containerSelectors) {
            const container = document.querySelector(selector);
            if (container) {
                console.log(`[AliX DL] Found button container with selector: ${selector}`);
                return container;
            }
        }
        console.warn("[AliX DL] No specific button container found, defaulting to body.");
        return document.body; // Fallback to body
    }

    // --- Function to initiate download ---
    async function downloadVideo(url) {
        if (!url) {
            showMessage('No video URL found.', 'error');
            return;
        }

        const videoTitle = document.title.split(' - ')[0].trim() || 'aliexpress_video';
        let filename = `${videoTitle}.mp4`;

        try {
            if (url.startsWith('blob:')) {
                console.log(`[AliX DL] Attempting to download blob URL: ${url}`);
                showMessage('Preparing blob video for download...', 'info');

                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Failed to fetch blob: ${response.statusText}`);
                }
                const blob = await response.blob();
                const objectUrl = URL.createObjectURL(blob);

                chrome.runtime.sendMessage({ action: 'download', url: objectUrl, filename: filename }, (response) => {
                    if (response && response.success) {
                        showMessage('Video download started!', 'success');
                        console.log("[AliX DL] Blob download initiated via background script.");
                    } else {
                        showMessage('Failed to start blob download. Check console for details.', 'error');
                        console.error("[AliX DL] Failed to initiate blob download:", response ? response.error : "Unknown error.");
                    }
                    URL.revokeObjectURL(objectUrl); // Clean up the object URL
                });

            } else {
                console.log(`[AliX DL] Attempting to download direct URL: ${url}`);
                showMessage('Video download started!', 'success');
                chrome.runtime.sendMessage({ action: 'download', url: url, filename: filename }, (response) => {
                    if (response && response.success) {
                        console.log("[AliX DL] Direct video download initiated via background script.");
                    } else {
                        showMessage('Failed to start direct download. Check console for details.', 'error');
                        console.error("[AliX DL] Failed to initiate direct download:", response ? response.error : "Unknown error.");
                    }
                });
            }
        } catch (e) {
            console.error('Failed to download video:', e);
            showMessage(`Error downloading video: ${e.message}. Try right-clicking the video.`, 'error');
        }
    }

    // --- Function to add the download button ---
    async function addAndProcessVideoButton() {
        const video = await findVideoElement();

        if (video && !video.hasAttribute(PROCESSED_VIDEO_ATTR)) {
            video.setAttribute(PROCESSED_VIDEO_ATTR, 'true'); // Mark video as processed

            console.log("[AliX DL] Video element found, attempting to inject button.");
            const buttonContainer = findButtonContainer();

            if (buttonContainer) {
                let downloadButton = document.getElementById(DOWNLOAD_BUTTON_ID);
                if (!downloadButton) { // Create only if it doesn't exist
                    downloadButton = document.createElement('button');
                    downloadButton.id = DOWNLOAD_BUTTON_ID;
                    downloadButton.textContent = '⬇️ Download Video';
                    downloadButton.classList.add('alidl-download-btn'); // Add the CSS class

                    // Set position based on the container
                    if (buttonContainer === document.body) {
                        downloadButton.style.position = 'fixed';
                        downloadButton.style.top = '20px';
                        downloadButton.style.left = '20px';
                        console.warn("[AliX DL] Button positioned fixed to body as no suitable container found.");
                    } else {
                        // For other containers, ensure the container itself is positioned for absolute children
                        const containerStyle = getComputedStyle(buttonContainer);
                        if (containerStyle.position === 'static') {
                            buttonContainer.style.position = 'relative'; // Make container relative if static
                            console.log("[AliX DL] Button container set to position: relative.");
                        }
                        downloadButton.style.position = 'absolute';
                        downloadButton.style.top = '10px'; // Offset from container's top-left
                        downloadButton.style.left = '10px'; // Offset from container's top-left
                    }
                }
                
                // Append the button to the identified container
                // This ensures it's placed reliably outside of direct video player overlays.
                buttonContainer.prepend(downloadButton); // Prepend to place it at the top
                console.log("[AliX DL] Download button appended to container.");

                // Add click listener (ensure it's not added multiple times if button already existed)
                // Remove existing listener to prevent duplicates before adding
                const oldClickListener = downloadButton.alidlClickListener;
                if (oldClickListener) {
                    downloadButton.removeEventListener('click', oldClickListener);
                }
                const newClickListener = (e) => {
                    e.stopPropagation(); // Prevent clicks from bubbling up
                    e.preventDefault(); // Prevent default browser behavior
                    const currentVideoSrc = video.src || video.currentSrc;
                    downloadVideo(currentVideoSrc);
                };
                downloadButton.addEventListener('click', newClickListener);
                downloadButton.alidlClickListener = newClickListener; // Store reference for removal

            } else {
                console.error("[AliX DL] Could not find a suitable container to attach the download button.");
                showMessage('Error: Could not find a place for the download button.', 'error');
            }
        } else {
            console.warn("[AliX DL] No new video element found on this page or already processed.");
        }
    }

    // --- Main execution logic ---
    // Initial attempt to add the button
    addAndProcessVideoButton();

    // Watch for new videos being added dynamically (like in SPAs)
    // This observer will trigger addAndProcessVideoButton when new video elements appear.
    const observer = new MutationObserver((mutations) => {
        let videoFound = false;
        for (const mutation of mutations) {
            if (mutation.type === 'childList') {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.tagName === 'VIDEO' || node.querySelector('video')) {
                            videoFound = true;
                            break;
                        }
                    }
                }
            }
            if (videoFound) break;
        }

        if (videoFound) {
            console.log("[AliX DL] MutationObserver detected new video content. Re-processing...");
            addAndProcessVideoButton();
        }
    });

    // Observe changes in the entire document body
    observer.observe(document.body, { childList: true, subtree: true });
})();