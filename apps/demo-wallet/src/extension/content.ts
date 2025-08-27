// Content script for TON Wallet Demo extension
/* eslint-disable no-console, no-undef */
console.log('TON Wallet Demo content script loaded on:', window.location.href);

// Inject TON Wallet provider into the page
function injectTonWalletProvider() {
    const script = document.createElement('script');
    script.textContent = `
    (function() {
      // TON Wallet provider implementation
      class TonWalletProvider {
        constructor() {
          this.isConnected = false;
          this.account = null;
          this.network = 'mainnet';
        }

        async connect() {
          return new Promise((resolve, reject) => {
            // Send message to background script
            window.postMessage({
              type: 'TON_WALLET_CONNECT',
              source: 'ton-wallet-content'
            }, '*');

            // Listen for response
            const listener = (event) => {
              if (event.data.type === 'TON_WALLET_CONNECT_RESPONSE') {
                window.removeEventListener('message', listener);
                if (event.data.success) {
                  this.isConnected = true;
                  this.account = event.data.account;
                  resolve(event.data.account);
                } else {
                  reject(new Error(event.data.error || 'Connection failed'));
                }
              }
            };
            window.addEventListener('message', listener);
          });
        }

        async disconnect() {
          this.isConnected = false;
          this.account = null;
          window.postMessage({
            type: 'TON_WALLET_DISCONNECT',
            source: 'ton-wallet-content'
          }, '*');
        }

        async sendTransaction(transaction) {
          if (!this.isConnected) {
            throw new Error('Wallet not connected');
          }

          return new Promise((resolve, reject) => {
            window.postMessage({
              type: 'TON_WALLET_SEND_TRANSACTION',
              source: 'ton-wallet-content',
              transaction
            }, '*');

            const listener = (event) => {
              if (event.data.type === 'TON_WALLET_SEND_TRANSACTION_RESPONSE') {
                window.removeEventListener('message', listener);
                if (event.data.success) {
                  resolve(event.data.result);
                } else {
                  reject(new Error(event.data.error || 'Transaction failed'));
                }
              }
            };
            window.addEventListener('message', listener);
          });
        }

        async signData(data) {
          if (!this.isConnected) {
            throw new Error('Wallet not connected');
          }

          return new Promise((resolve, reject) => {
            window.postMessage({
              type: 'TON_WALLET_SIGN_DATA',
              source: 'ton-wallet-content',
              data
            }, '*');

            const listener = (event) => {
              if (event.data.type === 'TON_WALLET_SIGN_DATA_RESPONSE') {
                window.removeEventListener('message', listener);
                if (event.data.success) {
                  resolve(event.data.result);
                } else {
                  reject(new Error(event.data.error || 'Signing failed'));
                }
              }
            };
            window.addEventListener('message', listener);
          });
        }
      }

      // Make TON Wallet available globally
      window.tonWallet = new TonWalletProvider();
      
      // Dispatch ready event
      window.dispatchEvent(new CustomEvent('tonWalletReady', {
        detail: { wallet: window.tonWallet }
      }));
    })();
  `;

    (document.head || document.documentElement).appendChild(script);
    script.remove();
}

// Listen for messages from the injected script
window.addEventListener('message', async (event) => {
    if (event.source !== window || event.data.source !== 'ton-wallet-content') {
        return;
    }

    try {
        switch (event.data.type) {
            case 'TON_WALLET_CONNECT':
                await handleConnect();
                break;
            case 'TON_WALLET_DISCONNECT':
                await handleDisconnect();
                break;
            case 'TON_WALLET_SEND_TRANSACTION':
                await handleSendTransaction(event.data.transaction);
                break;
            case 'TON_WALLET_SIGN_DATA':
                await handleSignData(event.data.data);
                break;
        }
    } catch (error) {
        console.error('Content script error:', error);
    }
});

async function handleConnect() {
    try {
        const response = await chrome.runtime.sendMessage({
            type: 'WALLET_REQUEST',
            payload: {
                method: 'connect',
                origin: window.location.origin,
            },
        });

        window.postMessage(
            {
                type: 'TON_WALLET_CONNECT_RESPONSE',
                success: response.success,
                account: response.account,
                error: response.error,
            },
            '*',
        );
    } catch (error) {
        window.postMessage(
            {
                type: 'TON_WALLET_CONNECT_RESPONSE',
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            '*',
        );
    }
}

async function handleDisconnect() {
    try {
        await chrome.runtime.sendMessage({
            type: 'WALLET_REQUEST',
            payload: {
                method: 'disconnect',
                origin: window.location.origin,
            },
        });

        window.postMessage(
            {
                type: 'TON_WALLET_DISCONNECT_RESPONSE',
                success: true,
            },
            '*',
        );
    } catch (error) {
        console.error('Disconnect error:', error);
    }
}

async function handleSendTransaction(transaction: unknown) {
    try {
        const response = await chrome.runtime.sendMessage({
            type: 'WALLET_REQUEST',
            payload: {
                method: 'sendTransaction',
                transaction,
                origin: window.location.origin,
            },
        });

        window.postMessage(
            {
                type: 'TON_WALLET_SEND_TRANSACTION_RESPONSE',
                success: response.success,
                result: response.result,
                error: response.error,
            },
            '*',
        );
    } catch (error) {
        window.postMessage(
            {
                type: 'TON_WALLET_SEND_TRANSACTION_RESPONSE',
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            '*',
        );
    }
}

async function handleSignData(data: unknown) {
    try {
        const response = await chrome.runtime.sendMessage({
            type: 'WALLET_REQUEST',
            payload: {
                method: 'signData',
                data,
                origin: window.location.origin,
            },
        });

        window.postMessage(
            {
                type: 'TON_WALLET_SIGN_DATA_RESPONSE',
                success: response.success,
                result: response.result,
                error: response.error,
            },
            '*',
        );
    } catch (error) {
        window.postMessage(
            {
                type: 'TON_WALLET_SIGN_DATA_RESPONSE',
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            '*',
        );
    }
}

// Inject the provider when the page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectTonWalletProvider);
} else {
    injectTonWalletProvider();
}

// Export for module compatibility
export {};
