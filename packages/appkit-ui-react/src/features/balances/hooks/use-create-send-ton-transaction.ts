/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useCallback } from 'react';

import { useSelectedWallet } from '../../wallets';

export interface CreateSendTonTransactionParams {
    recipientAddress: string;
    amount: string;
    comment?: string;
}

export const useCreateSendTonTransaction = () => {
    const [wallet] = useSelectedWallet();

    const createTransaction = useCallback(
        async ({ recipientAddress, amount, comment }: CreateSendTonTransactionParams) => {
            if (!wallet) return null;

            const amountNum = parseFloat(amount);

            if (isNaN(amountNum) || amountNum <= 0) {
                throw new Error('Invalid amount');
            }

            const transaction = await wallet.createTransferTonTransaction({
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
