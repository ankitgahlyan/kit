/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useCallback } from 'react';
import type { FC } from 'react';

import { useCreateSendTonTransaction } from '../../hooks/use-create-send-ton-transaction';
import { useCreateSendJettonTransaction } from '../../hooks/use-create-send-jetton-transaction';
import { Transaction } from '../../../transaction';
import type { TransactionProps } from '../../../transaction';

export interface SendButtonProps extends Omit<TransactionProps, 'getTransactionRequest'> {
    tokenType: 'TON' | 'JETTON';
    recipientAddress: string;
    amount: string;
    jettonAddress?: string;
    comment?: string;
}

export const SendButton: FC<SendButtonProps> = ({
    tokenType,
    jettonAddress,
    recipientAddress,
    amount,
    comment,
    ...props
}) => {
    const createTonTransaction = useCreateSendTonTransaction();
    const createJettonTransaction = useCreateSendJettonTransaction();

    const createTransferTransaction = useCallback(async () => {
        if (tokenType === 'TON') {
            return createTonTransaction({
                recipientAddress,
                amount,
                comment,
            });
        }

        return createJettonTransaction({
            jettonAddress,
            recipientAddress,
            amount,
            comment,
        });
    }, [tokenType, createTonTransaction, createJettonTransaction, recipientAddress, amount, comment, jettonAddress]);

    return (
        <Transaction
            getTransactionRequest={createTransferTransaction}
            disabled={!recipientAddress || !amount}
            {...props}
        />
    );
};
