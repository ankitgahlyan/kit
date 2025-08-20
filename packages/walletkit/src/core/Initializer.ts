// Initialization and setup logic

import type { TonWalletKitOptions, WalletInterface } from '../types';
import type { StorageAdapter } from '../storage';
import { createStorageAdapter } from '../storage';
import { validateWallet } from '../validation';
import { WalletManager } from './WalletManager';
import { SessionManager } from './SessionManager';
import { BridgeManager } from './BridgeManager';
import { EventRouter } from './EventRouter';
import { RequestProcessor } from './RequestProcessor';
import { ResponseHandler } from './ResponseHandler';

/**
 * Initialization configuration
 */
export interface InitializationConfig {
    retryAttempts?: number;
    retryDelay?: number;
    timeoutMs?: number;
}

/**
 * Initialization result
 */
export interface InitializationResult {
    walletManager: WalletManager;
    sessionManager: SessionManager;
    bridgeManager: BridgeManager;
    eventRouter: EventRouter;
    requestProcessor: RequestProcessor;
    responseHandler: ResponseHandler;
    storageAdapter: StorageAdapter;
}

/**
 * Handles initialization of all TonWalletKit components
 */
export class Initializer {
    private config: InitializationConfig;

    constructor(config: InitializationConfig = {}) {
        this.config = {
            retryAttempts: 3,
            retryDelay: 1000,
            timeoutMs: 10000,
            ...config,
        };
    }

    /**
     * Initialize all components
     */
    async initialize(options: TonWalletKitOptions): Promise<InitializationResult> {
        try {
            console.log('Initializing TonWalletKit...');

            // 1. Initialize storage adapter
            const storageAdapter = this.initializeStorage(options);

            // 2. Initialize core managers
            const { walletManager, sessionManager, bridgeManager, eventRouter } = await this.initializeManagers(
                options,
                storageAdapter,
            );

            // 3. Initialize processors
            const { requestProcessor, responseHandler } = this.initializeProcessors(sessionManager, bridgeManager);

            // 4. Configure event routing
            this.configureEventRouting(bridgeManager, eventRouter);

            // 5. Initialize with provided wallets
            if (options.wallets && options.wallets.length > 0) {
                await this.initializeWallets(walletManager, options.wallets);
            }

            console.log('TonWalletKit initialized successfully');

            return {
                walletManager,
                sessionManager,
                bridgeManager,
                eventRouter,
                requestProcessor,
                responseHandler,
                storageAdapter,
            };
        } catch (error) {
            console.error('Failed to initialize TonWalletKit:', error);
            throw error;
        }
    }

    /**
     * Initialize storage adapter
     */
    private initializeStorage(options: TonWalletKitOptions): StorageAdapter {
        if (options.storage) {
            return this.adaptLegacyStorage(options.storage);
        }

        return createStorageAdapter({
            prefix: 'tonwalletkit:',
        });
    }

    /**
     * Initialize core managers
     */
    private async initializeManagers(
        options: TonWalletKitOptions,
        storageAdapter: StorageAdapter,
    ): Promise<{
        walletManager: WalletManager;
        sessionManager: SessionManager;
        bridgeManager: BridgeManager;
        eventRouter: EventRouter;
    }> {
        // Initialize managers
        const walletManager = new WalletManager(storageAdapter);
        const sessionManager = new SessionManager(storageAdapter);
        const bridgeManager = new BridgeManager({
            bridgeUrl: options.bridgeUrl,
        });
        const eventRouter = new EventRouter();

        // Initialize all managers in parallel
        await Promise.all([walletManager.initialize(), sessionManager.initialize(), bridgeManager.initialize()]);

        return {
            walletManager,
            sessionManager,
            bridgeManager,
            eventRouter,
        };
    }

    /**
     * Initialize processors
     */
    private initializeProcessors(
        sessionManager: SessionManager,
        bridgeManager: BridgeManager,
    ): {
        requestProcessor: RequestProcessor;
        responseHandler: ResponseHandler;
    } {
        const requestProcessor = new RequestProcessor(sessionManager, bridgeManager);
        const responseHandler = new ResponseHandler(bridgeManager, sessionManager);

        return {
            requestProcessor,
            responseHandler,
        };
    }

    /**
     * Configure event routing from bridge to router
     */
    private configureEventRouting(bridgeManager: BridgeManager, eventRouter: EventRouter): void {
        bridgeManager.setEventCallback(async (event) => {
            // The event routing will be handled by the main TonWalletKit class
            // This is just setting up the bridge callback
            console.log('Bridge event received:', event.method);
        });
    }

    /**
     * Initialize with provided wallets
     */
    private async initializeWallets(walletManager: WalletManager, wallets: WalletInterface[]): Promise<void> {
        const results = await Promise.allSettled(
            wallets.map(async (wallet) => {
                const validation = validateWallet(wallet);
                if (!validation.isValid) {
                    console.warn(`Invalid wallet ${wallet.publicKey}:`, validation.errors);
                    return;
                }

                await walletManager.addWallet(wallet);
            }),
        );

        const successful = results.filter((r) => r.status === 'fulfilled').length;
        const failed = results.filter((r) => r.status === 'rejected').length;

        console.log(`Initialized ${successful} wallets, ${failed} failed`);
    }

    /**
     * Cleanup resources during shutdown
     */
    async cleanup(components: Partial<InitializationResult>): Promise<void> {
        try {
            console.log('Cleaning up TonWalletKit components...');

            if (components.bridgeManager) {
                await components.bridgeManager.close();
            }

            if (components.eventRouter) {
                components.eventRouter.clearCallbacks();
            }

            console.log('TonWalletKit cleanup completed');
        } catch (error) {
            console.error('Error during cleanup:', error);
        }
    }
}
