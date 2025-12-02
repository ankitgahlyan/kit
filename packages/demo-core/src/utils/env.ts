/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * Environment variables with fallback defaults
 * These can be overridden by the consuming application
 */

export const ENV_BRIDGE_URL =
    (typeof process !== 'undefined' && process.env?.VITE_BRIDGE_URL) || 'https://bridge.tonapi.io/bridge';

export const ENV_TON_API_KEY_MAINNET = (typeof process !== 'undefined' && process.env?.VITE_TON_API_KEY_MAINNET) || '';

export const ENV_TON_API_KEY_TESTNET = (typeof process !== 'undefined' && process.env?.VITE_TON_API_KEY_TESTNET) || '';

export const DISABLE_HTTP_BRIDGE =
    (typeof process !== 'undefined' && process.env?.VITE_DISABLE_HTTP_BRIDGE === 'true') || false;

export const DISABLE_NETWORK_SEND =
    (typeof process !== 'undefined' && process.env?.VITE_DISABLE_NETWORK_SEND === 'true') || false;
