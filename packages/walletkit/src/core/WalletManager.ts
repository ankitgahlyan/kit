// Wallet management with validation and persistence

import type { WalletInterface } from '../types';
import type { StorageAdapter } from '../types/internal';
import { validateWallet } from '../validation';

export class WalletManager {
    private wallets: Map<string, WalletInterface> = new Map();
    private storageAdapter: StorageAdapter;
    private storageKey = 'wallets';

    constructor(storageAdapter: StorageAdapter) {
        this.storageAdapter = storageAdapter;
    }

    /**
     * Initialize manager and load persisted wallets
     */
    async initialize(): Promise<void> {
        await this.loadWallets();
    }

    /**
     * Get all wallets as array
     */
    getWallets(): WalletInterface[] {
        return Array.from(this.wallets.values());
    }

    /**
     * Get wallet by public key
     */
    getWallet(publicKey: string): WalletInterface | null {
        return this.wallets.get(publicKey) || null;
    }

    /**
     * Add a wallet with validation
     */
    async addWallet(wallet: WalletInterface): Promise<void> {
        const validation = validateWallet(wallet);
        if (!validation.isValid) {
            throw new Error(`Invalid wallet: ${validation.errors.join(', ')}`);
        }

        this.wallets.set(wallet.publicKey, wallet);
        await this.persistWallets();
    }

    /**
     * Remove wallet by public key
     */
    async removeWallet(publicKeyOrWallet: string | WalletInterface): Promise<boolean> {
        const publicKey = typeof publicKeyOrWallet === 'string' ? publicKeyOrWallet : publicKeyOrWallet.publicKey;

        const removed = this.wallets.delete(publicKey);
        if (removed) {
            await this.persistWallets();
        }

        return removed;
    }

    /**
     * Update existing wallet
     */
    async updateWallet(wallet: WalletInterface): Promise<void> {
        if (!this.wallets.has(wallet.publicKey)) {
            throw new Error(`Wallet with public key ${wallet.publicKey} not found`);
        }

        const validation = validateWallet(wallet);
        if (!validation.isValid) {
            throw new Error(`Invalid wallet: ${validation.errors.join(', ')}`);
        }

        this.wallets.set(wallet.publicKey, wallet);
        await this.persistWallets();
    }

    /**
     * Clear all wallets
     */
    async clearWallets(): Promise<void> {
        this.wallets.clear();
        await this.persistWallets();
    }

    /**
     * Find wallet by address (async since getAddress is async)
     */
    async findWalletByAddress(address: string): Promise<WalletInterface | null> {
        for (const wallet of this.wallets.values()) {
            try {
                const walletAddress = await wallet.getAddress();
                if (walletAddress === address) {
                    return wallet;
                }
            } catch (error) {
                console.warn(`Failed to get address for wallet ${wallet.publicKey}:`, error);
            }
        }
        return null;
    }

    /**
     * Get wallet count
     */
    getWalletCount(): number {
        return this.wallets.size;
    }

    /**
     * Check if wallet exists
     */
    hasWallet(publicKey: string): boolean {
        return this.wallets.has(publicKey);
    }

    /**
     * Load wallets from storage
     */
    private async loadWallets(): Promise<void> {
        try {
            // Note: We can't persist actual WalletInterface instances since they contain functions
            // This is a placeholder for wallet metadata storage
            // In practice, you'd store wallet identifiers and reconstruct WalletInterface instances
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const walletData = await this.storageAdapter.get<any[]>(this.storageKey);

            if (walletData && Array.isArray(walletData)) {
                // TODO: Implement wallet reconstruction from stored metadata
                console.log('Loaded wallet metadata:', walletData.length);
            }
        } catch (error) {
            console.warn('Failed to load wallets from storage:', error);
        }
    }

    /**
     * Persist wallet metadata to storage
     */
    private async persistWallets(): Promise<void> {
        try {
            // Store wallet metadata (not the actual functions)
            const walletMetadata = this.getWallets().map((wallet) => ({
                publicKey: wallet.publicKey,
                version: wallet.version,
                // Add other serializable properties as needed
            }));

            await this.storageAdapter.set(this.storageKey, walletMetadata);
        } catch (error) {
            console.warn('Failed to persist wallets to storage:', error);
        }
    }
}
