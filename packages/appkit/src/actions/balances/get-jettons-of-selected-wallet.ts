/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { JettonsResponse, Network } from '@ton/walletkit';

import type { AppKit } from '../../core/app-kit';
import { getJettons } from './get-jettons';

export interface GetJettonsOfSelectedWalletOptions {
    network?: Network;
    limit?: number;
    offset?: number;
}

export async function getJettonsOfSelectedWallet(
    appKit: AppKit,
    options: GetJettonsOfSelectedWalletOptions = {},
): Promise<JettonsResponse | null> {
    const selectedWallet = appKit.walletsManager.selectedWallet;

    if (!selectedWallet) {
        return null;
    }

    return getJettons(appKit, {
        address: selectedWallet.getAddress(),
        network: options.network,
        limit: options.limit,
        offset: options.offset,
    });
}
