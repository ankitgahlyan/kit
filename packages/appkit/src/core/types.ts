/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { NetworkAdapters } from '@ton/walletkit';

import type { WalletInterface } from '../types/wallet';
import type { IEventBus } from '../features/events';
import type { WalletProvider } from '../types/wallet-provider';

/**
 * AppKit main interface - Central hub for wallet management
 */
export interface IAppKit {
    /** Centralized event bus for wallet events */
    readonly eventBus: IEventBus;

    /** Registered wallet providers */
    readonly providers: ReadonlyArray<WalletProvider>;

    /** Register a wallet provider */
    registerProvider(provider: WalletProvider): void;

    /** Get all connected wallets from all providers */
    getConnectedWallets(): Promise<WalletInterface[]>;

    /** Connect wallet using specific provider */
    connectWallet(providerId: string): Promise<void>;

    /** Disconnect wallet using specific provider */
    disconnectWallet(providerId: string): Promise<void>;
}

/**
 * Configuration for AppKit
 */
export interface AppKitConfig {
    /**
     * Network configuration
     * At least one network must be configured.
     *
     * Keys are chain IDs (use `Network.mainnet().chainId` or `Network.testnet().chainId`)
     * Values contain apiClient configuration (url and optional API key)
     */
    networks?: NetworkAdapters;
}
