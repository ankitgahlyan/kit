/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Address } from '@ton/core';
import type { TokenAmount } from '@ton/walletkit';
import { Network } from '@ton/walletkit';

import type { AppKit } from '../../core/app-kit';

export interface GetBalanceOptions {
    address: string | Address;
    network?: Network;
}

export type GetBalanceReturnType = TokenAmount;

export const getBalance = async (appKit: AppKit, options: GetBalanceOptions): Promise<GetBalanceReturnType> => {
    const { address, network } = options;
    const addressString = Address.isAddress(address) ? address.toString() : Address.parse(address).toString();

    const client = appKit.networkManager.getClient(network ?? Network.mainnet());
    const balance = await client.getBalance(addressString);

    return balance;
};
