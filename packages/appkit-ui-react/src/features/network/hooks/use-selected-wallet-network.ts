/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useMemo } from 'react';
import type { Network } from '@ton/appkit';

import { useSelectedWallet } from '../../wallets/hooks/use-selected-wallet';

export type UseSelectedWalletNetworkReturnType = Network | undefined;

/**
 * Hook to get the network of the currently selected wallet
 */
export const useSelectedWalletNetwork = (): UseSelectedWalletNetworkReturnType => {
    const [wallet] = useSelectedWallet();

    return useMemo(() => wallet?.getNetwork(), [wallet]);
};
