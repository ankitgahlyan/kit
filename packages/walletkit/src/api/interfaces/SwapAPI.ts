/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { SwapParams, SwapQuote, SwapQuoteParams, TransactionRequest } from '../models';
import type { DefiManagerAPI } from './DefiManagerAPI';

/**
 * Swap API interface exposed by SwapManager
 */
export interface SwapAPI extends DefiManagerAPI<SwapProviderInterface> {
    getQuote(params: SwapQuoteParams, provider?: string): Promise<SwapQuote>;
    buildSwapTransaction(params: SwapParams, provider?: string): Promise<TransactionRequest>;
}

/**
 * Interface that all swap providers must implement
 */
export interface SwapProviderInterface<TQuoteOptions = unknown, TSwapOptions = unknown> {
    getQuote(params: SwapQuoteParams<TQuoteOptions>): Promise<SwapQuote>;
    buildSwapTransaction(params: SwapParams<TSwapOptions>): Promise<TransactionRequest>;
}
