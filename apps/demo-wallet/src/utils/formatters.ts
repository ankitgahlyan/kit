/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * Formats a Unix timestamp (in seconds) to a localized date/time string
 * @param timestampSeconds - Unix timestamp in seconds
 * @returns Formatted date/time string
 */
export const formatTimestamp = (timestampSeconds: number): string => {
    return new Date(timestampSeconds * 1000).toLocaleString();
};

/**
 * Formats a blockchain address to a shortened form (first 6 and last 6 characters)
 * @param addr - Full blockchain address
 * @returns Shortened address (e.g., "EQAbc...xyz123")
 */
export const formatAddress = (addr: string): string => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-6)}`;
};

/**
 * Formats nanoTON to TON with proper decimal handling
 * @param value - Amount in nanoTON (bigint or string)
 * @returns Formatted TON amount as string
 */
export const formatNanoTon = (value: bigint | string): string => {
    const n = typeof value === 'bigint' ? value : BigInt(value || '0');
    const str = n.toString();
    const pad = str.padStart(10, '0');
    const intPart = pad.slice(0, pad.length - 9).replace(/^0+(?=\d)/, '');
    const fracPart = pad.slice(-9).replace(/0+$/, '');
    return `${intPart === '' ? '0' : intPart}${fracPart ? '.' + fracPart : ''}`;
};
