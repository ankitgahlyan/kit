/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

// SAMPLE_START: APPKIT_INIT
import { CreateAppKit } from '@ton/appkit';
import type { ITonConnect, Wallet } from '@tonconnect/sdk';

// Create AppKit instance - typically done once at app startup
const appKit = CreateAppKit({});

// After user connects via TonConnect, wrap their wallet
function getWrappedWallet(tonConnectWallet: Wallet, tonConnect: ITonConnect) {
    return appKit.wrapTonConnectWallet(tonConnectWallet, tonConnect);
}

export { appKit, getWrappedWallet };
// SAMPLE_END: APPKIT_INIT
