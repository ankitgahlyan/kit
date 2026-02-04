/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useSelectedWallet } from '../../wallets/hooks/use-selected-wallet';
import type { UseNFTsParameters, UseNFTsReturnType } from './use-nfts';
import { useNFTs } from './use-nfts';

export type UseSelectedWalletNFTsParameters = UseNFTsParameters['query'];

export type UseSelectedWalletNFTsReturnType = UseNFTsReturnType;

/**
 * Hook to get NFTs for selected wallet
 */
export const useSelectedWalletNFTs = (
    queryOptions?: UseSelectedWalletNFTsParameters,
): UseSelectedWalletNFTsReturnType => {
    const [selectedWallet] = useSelectedWallet();
    const address = selectedWallet?.getAddress();

    return useNFTs({
        address: address as string,
        network: selectedWallet?.getNetwork(),
        query: {
            ...queryOptions,
            enabled: !!address,
        },
    });
};
