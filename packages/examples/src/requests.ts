/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {
    UserFriendlyAddress,
    SignDataRequestEvent,
    TransactionRequestEvent,
    DisconnectionEvent,
    ConnectionRequestEvent,
} from '@ton/walletkit';

import 'dotenv/config';
import { walletKitInitializeSample } from './initialize';

/**
 * npx tsx src/requests.ts
 */
async function main() {
    console.log('=== Listen for requests from dApps ===');
    const kit = await walletKitInitializeSample();

    function getSelectedWalletAddress(): UserFriendlyAddress | undefined {
        const wallet = kit.getWallets().pop();
        if (!wallet) {
            return;
        }
        return wallet.getAddress();
    }

    // SAMPLE_START: ON_TON_CONNECT_LINK
    // Example: from a QR scanner, deep link, or URL parameter
    async function onTonConnectLink(url: string) {
        // url format: tc://connect?...
        await kit.handleTonConnectUrl(url);
    }
    // SAMPLE_END: ON_TON_CONNECT_LINK

    // SAMPLE_START: LISTEN_FOR_REQUESTS
    // Connect requests - triggered when a dApp wants to connect
    kit.onConnectRequest(async (event: ConnectionRequestEvent) => {
        try {
            // Use req.preview to display dApp info in your UI
            const name = event.dAppInfo?.name;
            if (confirm(`Connect to ${name}?`)) {
                // Set wallet address on the request before approving
                event.walletAddress = getSelectedWalletAddress(); // Your wallet selection logic
                await kit.approveConnectRequest(event);
            } else {
                await kit.rejectConnectRequest(event, 'User rejected');
            }
        } catch (error) {
            console.error('Connect request failed:', error);
            await kit.rejectConnectRequest(event, 'Error processing request');
        }
    });

    // Transaction requests - triggered when a dApp wants to execute a transaction
    kit.onTransactionRequest(async (event: TransactionRequestEvent) => {
        try {
            // Use tx.preview.moneyFlow.ourTransfers to show net asset changes
            // Each transfer shows positive amounts for incoming, negative for outgoing
            if (confirm('Do you confirm this transaction?')) {
                await kit.approveTransactionRequest(event);
            } else {
                await kit.rejectTransactionRequest(event, 'User rejected');
            }
        } catch (error) {
            console.error('Transaction request failed:', error);
            await kit.rejectTransactionRequest(event, 'Error processing request');
        }
    });

    // Sign data requests - triggered when a dApp wants to sign arbitrary data
    kit.onSignDataRequest(async (event: SignDataRequestEvent) => {
        try {
            // Use event.preview.kind to determine how to display the data
            if (confirm('Sign this data?')) {
                await kit.approveSignDataRequest(event);
            } else {
                await kit.rejectSignDataRequest(event, 'User rejected');
            }
        } catch (error) {
            console.error('Sign data request failed:', error);
            await kit.rejectSignDataRequest(event, 'Error processing request');
        }
    });

    // Disconnect events - triggered when a dApp disconnects
    kit.onDisconnect((event: DisconnectionEvent) => {
        // Clean up any UI state related to this connection
        console.log(`Disconnected from wallet: ${event.walletAddress}`);
    });
    // SAMPLE_END: LISTEN_FOR_REQUESTS
    const connectUrl = ''; // TODO add user promp with message: Enter Dapp connect url
    await onTonConnectLink(connectUrl);
    // TODO add handle for CI
    await kit.close();
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
