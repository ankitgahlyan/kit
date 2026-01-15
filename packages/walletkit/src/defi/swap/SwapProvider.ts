/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { TransactionRequest } from '../../api/models';
import type { SwapQuoteParams, SwapQuote, SwapParams, SwapProviderInterface } from './types';

/**
 * Abstract base class for swap providers
 *
 * Provides common utilities and enforces implementation of core swap methods.
 * Users can extend this class to create custom swap providers.
 *
 * @example
 * ```typescript
 * class MySwapProvider extends SwapProvider {
 *   async getQuote(params: SwapQuoteParams): Promise<SwapQuote> {
 *     // Custom implementation
 *   }
 *
 *   async buildSwapTransaction(params: SwapParams): Promise<TransactionRequest> {
 *     // Custom implementation
 *   }
 * }
 * ```
 */
export abstract class SwapProvider implements SwapProviderInterface {
    /**
     * Get a quote for swapping tokens
     * @param params - Quote parameters including tokens, amount, and network
     * @returns Promise resolving to swap quote with pricing information
     */
    abstract getQuote(params: SwapQuoteParams): Promise<SwapQuote>;

    /**
     * Build a transaction for executing the swap
     * @param params - Swap parameters including quote and user address
     * @returns Promise resolving to transaction request ready to be signed
     */
    abstract buildSwapTransaction(params: SwapParams): Promise<TransactionRequest>;
}
