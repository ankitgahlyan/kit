/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Address } from '@ton/core';
import type { JettonsResponse } from '@ton/walletkit';
import { Network, getJettonsFromClient } from '@ton/walletkit';

import type { AppKit } from '../../core/app-kit';

export interface GetJettonsOptions {
    address: string | Address;
    network?: Network;
    limit?: number;
    offset?: number;
}

export async function getJettons(appKit: AppKit, options: GetJettonsOptions): Promise<JettonsResponse> {
    const { address, network, limit, offset } = options;
    const addressString = Address.isAddress(address) ? address.toString() : Address.parse(address).toString();

    const client = appKit.networkManager.getClient(network ?? Network.mainnet());

    return getJettonsFromClient(client, addressString, {
        pagination: {
            limit,
            offset,
        },
    });
}
