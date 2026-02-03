/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useCallback } from 'react';
import { toNano, Address, beginCell, storeStateInit } from '@ton/core';
import { useSelectedWallet } from '@ton/appkit-ui-react';
import type { Base64String, TransactionRequest } from '@ton/walletkit';

import { useMinterStore } from '@/store';
import { buildSingleNftStateInit } from '@/contracts';

/**
 * Hook to create NFT mint transaction request
 */
export function useMintTransaction() {
    const { currentCard } = useMinterStore();
    const [wallet] = useSelectedWallet();

    const createMintTransaction = useCallback(async (): Promise<TransactionRequest | null> => {
        if (!currentCard || !wallet) {
            return null;
        }

        const walletAddress = Address.parse(wallet.getAddress());

        // Build NFT metadata as data URI (in production, use IPFS)
        const metadata = {
            name: currentCard.name,
            description: currentCard.description,
            image: currentCard.imageUrl,
            attributes: [{ trait_type: 'Rarity', value: currentCard.rarity }],
        };
        const metadataJson = JSON.stringify(metadata);
        const contentUrl = `data:application/json;base64,${Buffer.from(metadataJson).toString('base64')}`;

        // Build NFT StateInit
        const { stateInit, address: nftAddress } = buildSingleNftStateInit({
            ownerAddress: walletAddress,
            editorAddress: walletAddress,
            content: contentUrl,
            royaltyParams: {
                royaltyFactor: 0,
                royaltyBase: 1000,
                royaltyAddress: walletAddress,
            },
        });

        // Create deployment message
        const stateInitCell = beginCell().store(storeStateInit(stateInit)).endCell();

        return {
            validUntil: Math.floor(Date.now() / 1000) + 600, // 10 minutes
            messages: [
                {
                    address: nftAddress.toString(),
                    amount: toNano('0.05').toString(), // 0.05 TON for deployment
                    stateInit: stateInitCell.toBoc().toString('base64') as Base64String,
                },
            ],
        };
    }, [currentCard, wallet]);

    return {
        createMintTransaction,
        canMint: !!currentCard && !!wallet,
    };
}
