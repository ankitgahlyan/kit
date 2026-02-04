/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useCallback, useMemo } from 'react';
import type { Jetton } from '@ton/walletkit';
import { getFormattedJettonInfo, getErrorMessage, parseUnits } from '@ton/appkit';
import { useSelectedWallet, Transaction } from '@ton/appkit-ui-react';

import { Button } from '@/core/components';

interface TokenTransferButtonProps {
    tokenType: 'TON' | 'JETTON';
    jetton?: Jetton;
    recipientAddress: string;
    amount: string;
    comment?: string;
    onError: (error: string) => void;
    onSuccess: () => void;
}

export const TokenTransferButton: React.FC<TokenTransferButtonProps> = ({
    tokenType,
    jetton,
    recipientAddress,
    amount,
    comment,
    onError,
    onSuccess,
}) => {
    const [wallet] = useSelectedWallet();

    const tokenInfo = useMemo(() => {
        if (tokenType === 'TON') {
            return {
                name: 'Toncoin',
                symbol: 'TON',
                decimals: 9,
                image: './ton.png',
                address: null,
            };
        }

        if (!jetton) {
            throw new Error('Jetton not found');
        }

        const jettonInfo = getFormattedJettonInfo(jetton);

        return {
            name: jettonInfo.name,
            symbol: jettonInfo.symbol,
            decimals: jettonInfo.decimals,
            image: jettonInfo.image,
            address: jettonInfo.address,
        };
    }, [tokenType, jetton]);

    const createTransferTransaction = useCallback(async () => {
        if (!wallet) return null;

        const amountNum = parseFloat(amount);

        if (isNaN(amountNum) || amountNum <= 0) {
            throw new Error('Invalid amount');
        }

        if (!tokenInfo.decimals) {
            throw new Error('Invalid token decimals');
        }

        const transferAmount = parseUnits(amount, tokenInfo.decimals).toString();

        if (tokenType === 'TON') {
            const transaction = await wallet.createTransferTonTransaction({
                recipientAddress,
                transferAmount,
                comment,
            });

            return transaction;
        } else {
            if (!tokenInfo.address) {
                throw new Error('Jetton address not found');
            }

            const transaction = await wallet.createTransferJettonTransaction({
                jettonAddress: tokenInfo.address,
                recipientAddress,
                transferAmount,
                comment,
            });

            return transaction;
        }
    }, [wallet, tokenType, tokenInfo, recipientAddress, amount, comment]);

    return (
        <Transaction
            getTransactionRequest={createTransferTransaction}
            onSuccess={onSuccess}
            onError={(error) => onError(getErrorMessage(error))}
            disabled={!recipientAddress || !amount}
        >
            {({ isLoading, onSubmit, disabled, text }) => (
                <Button isLoading={isLoading} onClick={onSubmit} disabled={disabled} className="flex-1">
                    {text}
                </Button>
            )}
        </Transaction>
    );
};
