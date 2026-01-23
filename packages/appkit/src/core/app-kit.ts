/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { NetworkManager } from '@ton/walletkit';
import { Network, KitNetworkManager } from '@ton/walletkit';

import type { IAppKit, AppKitConfig } from './types';
import type { WalletProvider } from '../types/wallet-provider';
import type { IEventBus } from '../features/events';
import { EventBus } from '../features/events';
import type { WalletInterface } from '../types/wallet';

/**
 * Central hub for wallet management.
 * Stores eventBus, providers, and manages wallet connections.
 */
export class AppKit implements IAppKit {
    private networkManager!: NetworkManager;
    private _eventBus: IEventBus;
    private _providers: WalletProvider[] = [];

    constructor(config: AppKitConfig) {
        this._eventBus = new EventBus();

        // Use provided networks config or default to mainnet
        const networks = config.networks ?? {
            [Network.mainnet().chainId]: {},
        };

        const networkManager = new KitNetworkManager({ networks });
        this.networkManager = networkManager;
    }

    /**
     * Centralized event bus for wallet events
     */
    get eventBus(): IEventBus {
        return this._eventBus;
    }

    /**
     * Registered wallet providers
     */
    get providers(): ReadonlyArray<WalletProvider> {
        return this._providers;
    }

    /**
     * Register a wallet provider
     */
    registerProvider(provider: WalletProvider): void {
        this._providers.push(provider);
        // Initialize provider with eventBus and networkManager
        provider.initialize(this._eventBus, this.networkManager);
    }

    /**
     * Get all connected wallets from all providers
     */
    async getConnectedWallets(): Promise<WalletInterface[]> {
        const allWallets: WalletInterface[] = [];
        for (const provider of this._providers) {
            const wallets = await provider.getConnectedWallets();
            allWallets.push(...wallets);
        }
        return allWallets;
    }

    /**
     * Connect wallet using specific provider
     */
    async connectWallet(providerId: string): Promise<void> {
        const provider = this._providers.find((p) => p.id === providerId);
        if (!provider) {
            throw new Error(`Provider with id "${providerId}" not found`);
        }
        await provider.connectWallet();
    }

    /**
     * Disconnect wallet using specific provider
     */
    async disconnectWallet(providerId: string): Promise<void> {
        const provider = this._providers.find((p) => p.id === providerId);
        if (!provider) {
            throw new Error(`Provider with id "${providerId}" not found`);
        }
        await provider.disconnectWallet();
    }
}
