/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useSelectedWallet } from '../../wallets/hooks/use-selected-wallet';
import { useBalance } from './use-balance';

/**
 * Hook to get balance of the selected wallet
 */
export function useSelectedWalletBalance(queryOptions?: Record<string, unknown>) {
    const [selectedWallet] = useSelectedWallet();
    const address = selectedWallet?.getAddress();

    return useBalance(
        {
            address: address as string,
        },
        {
            enabled: !!address,
            ...queryOptions,
        },
    );
}
