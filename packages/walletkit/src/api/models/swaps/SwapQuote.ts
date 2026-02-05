/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { Network } from '../core/Network';
import type { TokenAmount } from '../core/TokenAmount';
import type { SwapFee } from './SwapFee';
import type { SwapToken } from './SwapToken';

/**
 * Swap quote response with pricing information
 */
export interface SwapQuote {
    fromToken: SwapToken;
    toToken: SwapToken;
    fromAmount: TokenAmount;
    toAmount: TokenAmount;
    minReceived: TokenAmount;
    network: Network;
    priceImpact?: number;
    fee?: SwapFee[];
    provider: string;

    /**
     * Unix timestamp in seconds
     * @format int
     */
    expiresAt?: number;
    metadata?: unknown;
}
