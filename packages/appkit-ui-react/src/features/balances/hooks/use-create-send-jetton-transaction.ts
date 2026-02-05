/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useCallback } from 'react';

import { useSelectedWallet } from '../../wallets';

export interface CreateSendJettonTransactionParams {
    jettonAddress?: string;
    recipientAddress: string;
    amount: string;
    comment?: string;
}

export const useCreateSendJettonTransaction = () => {
    const [wallet] = useSelectedWallet();

    const createTransaction = useCallback(
        async ({ jettonAddress, recipientAddress, amount, comment }: CreateSendJettonTransactionParams) => {
            if (!wallet) return null;

            const amountNum = parseFloat(amount);

            if (isNaN(amountNum) || amountNum <= 0) {
                throw new Error('Invalid amount');
            }

            if (!jettonAddress) {
                throw new Error('Jetton address not found');
            }

            const transaction = await wallet.createTransferJettonTransaction({
                jettonAddress,
                recipientAddress,
                transferAmount: amount,
                comment,
            });

            return transaction;
        },
        [wallet],
    );

    return createTransaction;
};
