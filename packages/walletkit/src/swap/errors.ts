/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

export enum SwapErrorCode {
    PROVIDER_NOT_FOUND = 'PROVIDER_NOT_FOUND',
    NO_DEFAULT_PROVIDER = 'NO_DEFAULT_PROVIDER',
    INVALID_QUOTE = 'INVALID_QUOTE',
    INSUFFICIENT_LIQUIDITY = 'INSUFFICIENT_LIQUIDITY',
    SLIPPAGE_EXCEEDED = 'SLIPPAGE_EXCEEDED',
    QUOTE_EXPIRED = 'QUOTE_EXPIRED',
    NETWORK_ERROR = 'NETWORK_ERROR',
    INVALID_PARAMS = 'INVALID_PARAMS',
}

export class SwapError extends Error {
    public readonly code: SwapErrorCode;
    public readonly details?: unknown;

    constructor(message: string, code: SwapErrorCode, details?: unknown) {
        super(message);
        this.name = 'SwapError';
        this.code = code;
        this.details = details;
    }
}
