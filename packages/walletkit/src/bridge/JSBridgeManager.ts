// JS Bridge Manager - Parallel bridge system for TonConnect JS Bridge

import type { JSBridgeInjectOptions, BridgeRequest } from '../types/jsBridge';
import type { EventRouter } from '../core/EventRouter';
import type { SessionManager } from '../core/SessionManager';
import type { WalletManager } from '../core/WalletManager';
import { JSBridgeMessageHandler } from './JSBridgeMessageHandler';
// import { getInjectCode } from './JSBridgeInjector';
import { globalLogger } from '../core/Logger';

const log = globalLogger.createChild('JSBridgeManager');

/**
 * Configuration options for JS Bridge Manager
 */
export interface JSBridgeManagerOptions {
    /** Whether to enable JS Bridge functionality */
    enabled: boolean;
    /** Default wallet name for injection */
    defaultWalletName?: string;
    /** Default device info */
    deviceInfo?: Partial<JSBridgeInjectOptions['deviceInfo']>;
    /** Default wallet info */
    walletInfo?: JSBridgeInjectOptions['walletInfo'];
}

/**
 * Manages JS Bridge functionality as a parallel system to HTTP Bridge
 * Provides TonConnect JS Bridge support for embedded apps and extensions
 */
export class JSBridgeManager {
    private eventRouter: EventRouter;
    private sessionManager: SessionManager;
    private walletManager: WalletManager;
    private messageHandler: JSBridgeMessageHandler;
    private options: JSBridgeManagerOptions;
    private isEnabled: boolean = false;

    constructor(
        eventRouter: EventRouter,
        sessionManager: SessionManager,
        walletManager: WalletManager,
        options: JSBridgeManagerOptions = { enabled: true },
    ) {
        this.eventRouter = eventRouter;
        this.sessionManager = sessionManager;
        this.walletManager = walletManager;
        this.options = {
            defaultWalletName: 'tonwallet',
            ...options,
        };
        this.messageHandler = new JSBridgeMessageHandler(eventRouter, sessionManager, walletManager);
        this.isEnabled = this.options.enabled;

        if (this.isEnabled) {
            log.info('JS Bridge Manager initialized', {
                defaultWalletName: this.options.defaultWalletName,
            });
        }
    }

    /**
     * Start the JS Bridge Manager
     */
    async start(): Promise<void> {
        if (!this.isEnabled) {
            log.info('JS Bridge Manager is disabled');
            return;
        }

        try {
            // JS Bridge doesn't need persistent connections like HTTP bridge
            // It works on-demand through message passing
            log.info('JS Bridge Manager started successfully');
        } catch (error) {
            log.error('Failed to start JS Bridge Manager', {
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            throw error;
        }
    }

    /**
     * Stop the JS Bridge Manager
     */
    async stop(): Promise<void> {
        if (!this.isEnabled) {
            return;
        }

        try {
            // Clean up any active connections
            // For now, this is a no-op since JS Bridge is stateless
            log.info('JS Bridge Manager stopped');
        } catch (error) {
            log.error('Error stopping JS Bridge Manager', {
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    /**
     * Process a bridge request from injected JS Bridge
     * This method is called by extension content scripts or embedded apps
     * @param request - The bridge request to process
     * @returns Promise resolving to the response data
     */
    async processBridgeRequest(request: BridgeRequest): Promise<unknown> {
        if (!this.isEnabled) {
            throw new Error('JS Bridge Manager is disabled');
        }

        log.debug('Processing bridge request', {
            method: request.method,
            messageId: request.messageId,
        });

        try {
            return await this.messageHandler.handleBridgeRequest(request);
        } catch (error) {
            log.error('Bridge request processing failed', {
                method: request.method,
                messageId: request.messageId,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            throw error;
        }
    }

    /**
     * Send an event to all connected JS bridges
     * @param event - The wallet event to send
     */
    sendEventToAllBridges(event: { event?: string; [key: string]: unknown }): void {
        if (!this.isEnabled) {
            return;
        }

        // In a real implementation, this would track all active bridge connections
        // and send events to each one. For now, we'll log it.
        log.info('Broadcasting event to JS bridges', { event: event.event });
    }

    /**
     * Check if JS Bridge is enabled and available
     */
    isAvailable(): boolean {
        return this.isEnabled;
    }

    /**
     * Get current configuration
     */
    getConfiguration(): JSBridgeManagerOptions {
        return { ...this.options };
    }

    /**
     * Update configuration
     * @param updates - Partial configuration updates
     */
    updateConfiguration(updates: Partial<JSBridgeManagerOptions>): void {
        this.options = { ...this.options, ...updates };
        this.isEnabled = this.options.enabled;

        log.info('JS Bridge Manager configuration updated', {
            enabled: this.isEnabled,
            defaultWalletName: this.options.defaultWalletName,
        });
    }

    /**
     * Get message handler for advanced use cases
     * @returns The message handler instance
     */
    getMessageHandler(): JSBridgeMessageHandler {
        return this.messageHandler;
    }
}
