// Configuration type definitions

import type { WalletInterface } from './wallet';
import type { StorageAdapter } from '../storage';

/**
 * Main configuration options for TonWalletKit
 */
export interface TonWalletKitOptions {
    /** TON Connect bridge URL */
    bridgeUrl: string;

    /** Optional TON API URL for blockchain queries */
    apiUrl?: string;

    /** Optional API key for TON API */
    apiKey?: string;

    /** Initial wallets to add to the kit */
    wallets?: WalletInterface[];

    /** Storage adapter for persistence (defaults to localStorage) */
    storage?: StorageAdapter;

    /** Optional configuration overrides */
    config?: {
        /** Bridge reconnection settings */
        bridge?: {
            heartbeatInterval?: number;
            reconnectInterval?: number;
            maxReconnectAttempts?: number;
        };

        /** Storage settings */
        storage?:
            | {
                  prefix?: string;
                  cacheTimeout?: number;
                  maxCacheSize?: number;
              }
            | StorageAdapter;

        /** Validation settings */
        validation?: {
            strictMode?: boolean;
            allowUnknownWalletVersions?: boolean;
        };
    };
}

/**
 * Runtime configuration that can be updated after initialization
 */
export interface RuntimeConfig {
    /** Enable/disable debug logging */
    debug?: boolean;

    /** Custom error handlers */
    errorHandlers?: {
        onBridgeError?: (error: Error) => void;
        onValidationError?: (error: Error) => void;
        onStorageError?: (error: Error) => void;
    };

    /** Feature flags */
    features?: {
        /** Enable advanced transaction analysis */
        advancedTxAnalysis?: boolean;

        /** Enable automatic session cleanup */
        autoSessionCleanup?: boolean;

        /** Enable response caching */
        responseCaching?: boolean;
    };
}
