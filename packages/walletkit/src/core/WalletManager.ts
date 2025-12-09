/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

// Wallet management with validation and persistence

import type { IWallet } from '../types';
import { Storage } from '../storage';
import { validateWallet } from '../validation';
import { globalLogger } from './Logger';
import { createWalletId, WalletId } from '../utils/walletId';
import { Network } from '../api/models';
import { WalletAdapter } from '../api/interfaces';

const _log = globalLogger.createChild('WalletManager');

export class WalletManager {
    private wallets: Map<WalletId, IWallet> = new Map();
    private storage: Storage;
    // private storageKey = 'wallets';

    constructor(storage: Storage) {
        this.storage = storage;
    }

    /**
     * Initialize manager and load persisted wallets
     */
    async initialize(): Promise<void> {
        // await this.loadWallets();
    }

    /**
     * Get all wallets as array
     */
    getWallets(): IWallet[] {
        return Array.from(this.wallets.values());
    }

    /**
     * Get wallet by wallet ID (network:address format)
     */
    getWallet(walletId: WalletId): IWallet | undefined {
        return this.wallets.get(walletId) || undefined;
    }

    /**
     * Get wallet by address and network (convenience method)
     */
    getWalletByAddressAndNetwork(address: string, network: Network): IWallet | undefined {
        const walletId = createWalletId(network, address);
        return this.getWallet(walletId);
    }

    /**
     * Add a wallet with validation
     */
    async addWallet(wallet: IWallet): Promise<WalletId> {
        const validation = validateWallet(wallet);
        if (!validation.isValid) {
            throw new Error(`Invalid wallet: ${validation.errors.join(', ')}`);
        }

        const walletId = createWalletId(wallet.getNetwork(), wallet.getAddress());
        if (this.wallets.has(walletId)) {
            return walletId;
        }

        this.wallets.set(walletId, wallet);
        return walletId;
    }

    /**
     * Remove wallet by wallet ID or wallet adapter
     */
    async removeWallet(walletIdOrAdapter: WalletId | WalletAdapter): Promise<boolean> {
        let walletId: WalletId;
        if (typeof walletIdOrAdapter === 'string') {
            walletId = walletIdOrAdapter;
        } else {
            walletId = createWalletId(walletIdOrAdapter.getNetwork(), walletIdOrAdapter.getAddress());
        }

        const removed = this.wallets.delete(walletId);
        return removed;
    }

    /**
     * Update existing wallet
     */
    async updateWallet(wallet: IWallet): Promise<void> {
        const walletId = createWalletId(wallet.getNetwork(), wallet.getAddress());
        if (!this.wallets.has(walletId)) {
            throw new Error(`Wallet with ID ${walletId} not found`);
        }

        const validation = validateWallet(wallet);
        if (!validation.isValid) {
            throw new Error(`Invalid wallet: ${validation.errors.join(', ')}`);
        }

        this.wallets.set(walletId, wallet);
    }

    /**
     * Clear all wallets
     */
    async clearWallets(): Promise<void> {
        this.wallets.clear();
    }

    /**
     * Get wallet count
     */
    getWalletCount(): number {
        return this.wallets.size;
    }

    /**
     * Check if wallet exists by wallet ID
     */
    hasWallet(walletId: WalletId): boolean {
        return this.wallets.has(walletId);
    }

    /**
     * Get wallet ID for a wallet adapter
     */
    getWalletId(wallet: WalletAdapter): WalletId {
        return createWalletId(wallet.getNetwork(), wallet.getAddress());
    }
}
