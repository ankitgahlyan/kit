/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { Cell } from '@ton/core';

import { makeSnakeCell } from './snake-cell';

const OFF_CHAIN_CONTENT_PREFIX = 0x01;

/**
 * Encode off-chain content for NFT metadata
 * Format: 0x01 prefix + content as snake cell
 */
export function encodeOffChainContent(content: string): Cell {
    let data = Buffer.from(content);
    const offChainPrefix = Buffer.from([OFF_CHAIN_CONTENT_PREFIX]);
    data = Buffer.concat([offChainPrefix, data]);
    return makeSnakeCell(data);
}
