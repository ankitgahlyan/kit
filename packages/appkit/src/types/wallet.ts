/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { Wallet } from '@ton/walletkit';

/**
 * Connection information from a TonConnect wallet
 */
export interface WalletConnectionInfo {
    account: {
        address: string;
        chain: string;
        walletStateInit: string;
        publicKey?: string;
    };
    device: {
        appName: string;
        appVersion: string;
        platform: string;
    };
}

/**
 * Wrapper around @tonconnect/sdk Wallet that provides TonWalletKit-compatible interface
 */
export interface TonConnectWalletWrapper extends Wallet {
    /** The underlying TonConnect wallet */
    // readonly tonConnectWallet: TonConnectWallet;

    /** The underlying TonConnect instance */
    // readonly tonConnect: ITonConnect;

    /** Check if the wallet is connected */
    isConnected(): boolean;

    /** Get connection info */
    getConnectionInfo(): WalletConnectionInfo | null;
}
