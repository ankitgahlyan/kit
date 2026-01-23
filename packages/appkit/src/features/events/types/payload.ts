/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { WalletInterface } from '../../../types/wallet';

export interface WalletConnectedPayload {
    wallets: WalletInterface[];
    providerId: string;
}

export interface WalletDisconnectedPayload {
    providerId: string;
}

export interface WalletChangedPayload {
    wallets: WalletInterface[];
    providerId: string;
}

export interface PluginRegisteredPayload {
    pluginId: string;
    pluginType: string;
}
