console.log("TON Wallet Demo extension background script loaded");
chrome.runtime.onInstalled.addListener(() => {
  console.log("TON Wallet Demo extension installed");
});
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log("Background received message:", message);
  switch (message.type) {
    case "WALLET_REQUEST":
      handleWalletRequest(message.payload);
      break;
    case "GET_WALLET_STATE":
      handleGetWalletState(sendResponse);
      return true;
    // Keep message channel open for async response
    default:
      console.log("Unknown message type:", message.type);
  }
});
async function handleWalletRequest(payload) {
  try {
    await chrome.storage.local.set({
      pendingRequest: {
        ...payload,
        timestamp: Date.now()
      }
    });
    console.log("Wallet request stored:", payload);
  } catch (error) {
    console.error("Error handling wallet request:", error);
  }
}
async function handleGetWalletState(sendResponse) {
  try {
    const result = await chrome.storage.local.get(["walletState"]);
    sendResponse({ success: true, data: result.walletState });
  } catch (error) {
    console.error("Error getting wallet state:", error);
    sendResponse({ success: false, error: error instanceof Error ? error.message : "Unknown error" });
  }
}
