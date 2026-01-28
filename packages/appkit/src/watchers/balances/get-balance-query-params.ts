/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Network } from '@ton/walletkit';

import type { AppKit } from '../../core/app-kit';
import { getBalance } from '../../actions/balances/get-balance';
import type { GetBalanceOptions } from '../../actions/balances/get-balance';

export const getBalanceQueryParams = (appKit: AppKit, params: GetBalanceOptions) => {
    const { address, network: paramsNetwork } = params;
    const network = paramsNetwork || Network.mainnet();

    return {
        queryKey: ['balance', address, network.chainId],
        queryFn: async () => getBalance(appKit, params),
    };
};
