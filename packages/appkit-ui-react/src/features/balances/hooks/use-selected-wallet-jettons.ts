/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useSelectedWallet } from '../../wallets/hooks/use-selected-wallet';
import type { UseJettonsParameters } from './use-jettons';
import { useJettons } from './use-jettons';

export type UseSelectedWalletJettonsParameters = UseJettonsParameters['query'];

/**
 * Hook to get jettons
 */
export function useSelectedWalletJettons(queryOptions?: UseSelectedWalletJettonsParameters) {
    const [selectedWallet] = useSelectedWallet();
    const address = selectedWallet?.getAddress();

    return useJettons({
        address: address as string,
        network: selectedWallet?.getNetwork(),
        query: {
            ...queryOptions,
            enabled: !!address,
        },
    });
}
