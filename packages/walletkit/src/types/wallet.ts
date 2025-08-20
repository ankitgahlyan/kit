// Wallet-related type definitions

/**
 * TON network types
 */
export type TonNetwork = 'mainnet' | 'testnet';

/**
 * Core wallet interface that all wallets must implement
 */
export interface WalletInterface {
    /** Unique identifier for this wallet (typically public key) */
    publicKey: string;

    /** Wallet contract version (e.g., 'v4r2', 'v5r1') */
    version: string;

    /** Sign raw bytes with wallet's private key */
    sign(bytes: Uint8Array): Promise<Uint8Array>;

    /** Get wallet's TON address */
    getAddress(): Promise<string>;

    /** Get wallet's current balance in nanotons */
    getBalance(): Promise<string>;

    /** Optional: Get state init for wallet deployment */
    getStateInit?(): Promise<string>;
}

/**
 * Wallet metadata for storage/serialization
 */
export interface WalletMetadata {
    publicKey: string;
    version: string;
    address?: string;
    lastUsed?: Date;
}

/**
 * Wallet status information
 */
export interface WalletStatus {
    isDeployed: boolean;
    balance: string;
    lastActivity?: Date;
}
