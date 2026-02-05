/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { Network } from '../core/Network';
import type { TokenAmount } from '../core/TokenAmount';
import type { SwapToken } from './SwapToken';

/**
 * Base parameters for requesting a swap quote
 */
export interface SwapQuoteParams<TProviderOptions = unknown> {
    amount: TokenAmount;
    fromToken: SwapToken;
    toToken: SwapToken;
    network: Network;

    /**
     * Slippage tolerance in basis points (1 bp = 0.01%)
     * @format int
     */
    slippageBps?: number;

    /**
     * Maximum number of outgoing messages
     * @format int
     */
    maxOutgoingMessages?: number;
    providerOptions?: TProviderOptions;
    isReverseSwap?: boolean;
}
