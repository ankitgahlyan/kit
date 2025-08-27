// Background script for TON Wallet Demo extension
/* eslint-disable no-console, no-undef */
console.log('TON Wallet Demo extension background script loaded');

// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
    console.log('TON Wallet Demo extension installed');
});

// Handle messages from content scripts or popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    console.log('Background received message:', message);

    // Handle different message types
    switch (message.type) {
        case 'WALLET_REQUEST':
            // Forward wallet requests to popup or handle them
            handleWalletRequest(message.payload);
            break;
        case 'GET_WALLET_STATE':
            // Get current wallet state
            handleGetWalletState(sendResponse);
            return true; // Keep message channel open for async response
        default:
            console.log('Unknown message type:', message.type);
    }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'loading' && tab.url) {
        await injectContentScript(tabId);
    }
});

async function handleWalletRequest(payload: unknown) {
    try {
        // Store the request for the popup to handle
        await chrome.storage.local.set({
            pendingRequest: {
                ...(payload as Record<string, unknown>),
                timestamp: Date.now(),
            },
        });

        // Open popup or notify user
        console.log('Wallet request stored:', payload);
    } catch (error) {
        console.error('Error handling wallet request:', error);
    }
}

async function handleGetWalletState(sendResponse: (response: unknown) => void) {
    try {
        const result = await chrome.storage.local.get(['walletState']);
        sendResponse({ success: true, data: result.walletState });
    } catch (error) {
        console.error('Error getting wallet state:', error);
        sendResponse({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
}

// Function to inject content script
async function injectContentScript(tabId: number) {
    try {
        await chrome.scripting.executeScript({
            target: { tabId },
            files: ['src/extension/content.js'],
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            world: 'MAIN' as any, // needed to access window
        });
    } catch (error) {
        console.error('Error injecting script:', error);
    }
}

// Export for module compatibility
export {};
