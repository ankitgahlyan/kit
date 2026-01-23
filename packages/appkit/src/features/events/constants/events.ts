/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * Wallet events
 */
export const WALLET_EVENTS = {
    CONNECTED: 'wallet:connected',
    DISCONNECTED: 'wallet:disconnected',
    CHANGED: 'wallet:changed',
} as const;

/**
 * Plugin events
 */
export const PLUGIN_EVENTS = {
    REGISTERED: 'plugin:registered',
} as const;
