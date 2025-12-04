/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * Network identifier for TON blockchain
 */
export type Network = { type: 'mainnet' } | { type: 'testnet' } | { type: 'other'; value: string };

/**
 * Well-known network chain IDs
 */
export const NetworkChainId = {
    mainnet: '-239',
    testnet: '-3',
} as const;
