/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useSelectedWallet } from '../../wallets/hooks/use-selected-wallet';
import type { UseBalanceParameters } from './use-balance';
import { useBalance } from './use-balance';

export type UseSelectedWalletBalanceParameters = Omit<UseBalanceParameters, 'address' | 'network'>;

/**
 * Hook to get balance of the selected wallet
 */
export function useSelectedWalletBalance(queryOptions?: UseBalanceParameters['query']) {
    const [selectedWallet] = useSelectedWallet();
    const address = selectedWallet?.getAddress();

    return useBalance({
        address: address as string,
        network: selectedWallet?.getNetwork(),
        query: {
            ...queryOptions,
            enabled: !!address,
        },
    });
}
