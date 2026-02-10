/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useCallback, useMemo } from 'react';
import type { FC } from 'react';
import { formatUnits, parseUnits } from '@ton/appkit';
import {
    Transaction,
    useSwapQuote,
    useAppKit,
    useSelectedWalletNetwork,
    useSelectedWalletAddress,
} from '@ton/appkit-ui-react';

export const USDT_ADDRESS = 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs';

export const SwapButton: FC = () => {
    const appKit = useAppKit();
    const network = useSelectedWalletNetwork();
    const address = useSelectedWalletAddress();

    const {
        data: quote,
        isError,
        isLoading,
    } = useSwapQuote({
        amountFrom: parseUnits('1', 9).toString(),
        fromToken: 'TON',
        toToken: USDT_ADDRESS,
        network,
    });

    const getTransactionRequest = useCallback(async () => {
        if (!quote) {
            return null;
        }

        if (!address) {
            throw new Error('Wallet not connected');
        }

        return appKit.swapManager.buildSwapTransaction({
            quote,
            userAddress: address,
        });
    }, [quote, address, appKit]);

    const buttonText = useMemo(() => {
        if (isLoading) {
            return 'Fetching quote...';
        }

        if (isError || !quote) {
            return 'Swap Unavailable';
        }

        return `Swap ${formatUnits(quote.fromAmount, 9)} TON -> ${formatUnits(quote.toAmount, 6)} USDT`;
    }, [isLoading, isError, quote]);

    return (
        <Transaction
            getTransactionRequest={getTransactionRequest}
            disabled={!quote || isLoading || isError}
            text={buttonText}
        />
    );
};
