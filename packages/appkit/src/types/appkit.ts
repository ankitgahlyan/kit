/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { ITonConnect, Wallet as TonConnectWallet } from '@tonconnect/sdk';
import type { Wallet } from '@ton/walletkit';

// import type { TonConnectWalletWrapper } from './wallet';

/**
 * Transaction result from sending a transaction
 */
export interface TransactionResult {
    boc: string;
}

/**
 * AppKit main interface - Bridge between @tonconnect/sdk and TonWalletKit
 */
export interface AppKit {
    /** Wrap a TonConnect wallet with TonWalletKit-compatible interface */
    wrapTonConnectWallet(wallet: TonConnectWallet, tonConnect: ITonConnect): Wallet;
}
