// Message protocol handler for JS Bridge communication

import type { ConnectItem } from '@tonconnect/protocol';

import type {
    BridgeRequest,
    BridgeResponse,
    ConnectRequest,
    AppRequest,
    ConnectEvent,
    ConnectEventError,
    WalletResponse,
    WalletEvent,
} from '../types/jsBridge';
import type { EventRouter } from '../core/EventRouter';
import type { SessionManager } from '../core/SessionManager';
import type { WalletManager } from '../core/WalletManager';
import type { WalletInterface } from '../types/wallet';
import type { RawBridgeEventConnect } from '../types/internal';
import { globalLogger } from '../core/Logger';

const log = globalLogger.createChild('JSBridgeMessageHandler');

/**
 * Handles message protocol between injected JS Bridge and extension/wallet
 */
export class JSBridgeMessageHandler {
    private eventRouter: EventRouter;
    private sessionManager: SessionManager;
    private walletManager: WalletManager;
    private activeConnections = new Map<string, { wallet?: WalletInterface; sessionId?: string }>();

    constructor(eventRouter: EventRouter, sessionManager: SessionManager, walletManager: WalletManager) {
        this.eventRouter = eventRouter;
        this.sessionManager = sessionManager;
        this.walletManager = walletManager;
    }

    /**
     * Processes a bridge request from injected code
     * @param request - The bridge request
     * @returns Promise resolving to response data
     */
    async handleBridgeRequest(request: BridgeRequest): Promise<ConnectEvent | ConnectEventError | WalletResponse> {
        log.info('Handling bridge request', { method: request.method, messageId: request.messageId });

        try {
            switch (request.method) {
                case 'connect':
                    return await this.handleConnectRequest(request);
                case 'restoreConnection':
                    return await this.handleRestoreConnection(request);
                case 'send':
                    return await this.handleSendRequest(request);
                default:
                    throw new Error(`Unknown method: ${request.method}`);
            }
        } catch (error) {
            log.error('Bridge request failed', {
                method: request.method,
                messageId: request.messageId,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            throw error;
        }
    }

    /**
     * Handles connect requests from dApps
     */
    private async handleConnectRequest(request: BridgeRequest): Promise<ConnectEvent> {
        const { protocolVersion, message } = request.params;

        if (!message || typeof message !== 'object') {
            throw new Error('Invalid connect request message');
        }

        const connectRequest = message as ConnectRequest;

        // Validate protocol version
        if (protocolVersion && protocolVersion > 2) {
            throw new Error(`Unsupported protocol version: ${protocolVersion}`);
        }

        // For now, we'll simulate auto-approval with first available wallet
        const wallets = this.walletManager.getWallets();
        if (wallets.length === 0) {
            throw new Error('No wallets available');
        }

        const selectedWallet = wallets[0];
        const sessionId = this.generateSessionId();
        const domain = this.extractDAppName(connectRequest.manifestUrl);

        // Store connection info
        this.activeConnections.set(request.source, {
            sessionId: sessionId,
            wallet: selectedWallet,
        });

        // Create RawBridgeEvent for EventRouter
        const bridgeEvent: RawBridgeEventConnect = {
            id: request.messageId.toString(),
            method: 'startConnect',
            from: request.source,
            domain: domain,
            wallet: selectedWallet,
            params: {
                manifest: {
                    url: connectRequest.manifestUrl,
                },
                items: connectRequest.items as ConnectItem[],
            },
        };

        try {
            // Route through EventRouter (this will trigger connect handlers)
            await this.eventRouter.routeEvent(bridgeEvent);

            // Return TonConnect ConnectEvent format
            return {
                event: 'connect',
                id: request.messageId,
                payload: {
                    items: await this.buildConnectItemReplies(connectRequest.items as ConnectItem[], selectedWallet),
                    device: {
                        platform: 'web',
                        appName: 'WalletKit',
                        appVersion: '1.0.0',
                        maxProtocolVersion: 2,
                        features: [
                            {
                                name: 'SendTransaction' as const,
                                maxMessages: 4,
                            },
                            {
                                name: 'SignData' as const,
                                types: ['text', 'binary', 'cell'],
                            },
                        ],
                    },
                },
            };
        } catch (error) {
            // Remove failed connection
            this.activeConnections.delete(request.source);
            throw error;
        }
    }

    /**
     * Handles connection restoration requests
     */
    private async handleRestoreConnection(request: BridgeRequest): Promise<ConnectEvent | ConnectEventError> {
        const connectionInfo = this.activeConnections.get(request.source);

        if (!connectionInfo || !connectionInfo.wallet) {
            // Return ConnectEventError for unknown app
            return {
                event: 'connect_error',
                id: request.messageId,
                payload: {
                    code: 100,
                    message: 'Unknown app',
                },
            };
        }

        // Return minimal ConnectEvent with just ton_addr
        return {
            event: 'connect',
            id: request.messageId,
            payload: {
                items: [
                    {
                        name: 'ton_addr',
                        address: connectionInfo.wallet.getAddress(),
                        network: 'mainnet', // TODO: get from wallet or config
                        publicKey: Buffer.from(connectionInfo.wallet.publicKey).toString('hex'),
                        walletStateInit: await connectionInfo.wallet.getStateInit(),
                    },
                ],
                device: {
                    platform: 'web',
                    appName: 'WalletKit',
                    appVersion: '1.0.0',
                    maxProtocolVersion: 2,
                    features: [
                        {
                            name: 'SendTransaction',
                            maxMessages: 4,
                        },
                        {
                            name: 'SignData',
                            types: ['text', 'binary', 'cell'],
                        },
                    ],
                },
            },
        };
    }
    /**
     * Handles send requests (transactions, sign data, etc.)
     */
    private async handleSendRequest(request: BridgeRequest): Promise<WalletResponse> {
        const connectionInfo = this.activeConnections.get(request.source);

        if (!connectionInfo || !connectionInfo.wallet) {
            throw new Error('Wallet not connected');
        }

        const { message } = request.params;
        if (!message || typeof message !== 'object') {
            throw new Error('Invalid send request message');
        }

        const appRequest = message as AppRequest;
        const domain = this.extractDAppName(''); // TODO: get proper domain

        try {
            let result: unknown;

            switch (appRequest.method) {
                case 'sendTransaction':
                    result = await this.handleSendTransaction(
                        appRequest,
                        connectionInfo.wallet,
                        request.source,
                        domain,
                    );
                    break;
                case 'signData':
                    result = await this.handleSignData(appRequest, connectionInfo.wallet, request.source, domain);
                    break;
                default:
                    throw new Error(`Unsupported method: ${appRequest.method}`);
            }

            return {
                result,
                id: appRequest.id,
            };
        } catch (error) {
            return {
                error: {
                    code: 1,
                    message: error instanceof Error ? error.message : 'Unknown error',
                },
                id: appRequest.id,
            };
        }
    }

    /**
     * Handles transaction sending
     */
    private async handleSendTransaction(
        request: AppRequest,
        wallet: WalletInterface,
        source: string,
        domain: string,
    ): Promise<{ boc: string }> {
        // Ensure params is an array with at least one element
        if (!Array.isArray(request.params) || request.params.length === 0) {
            throw new Error('Invalid transaction parameters');
        }

        // Create and route RawBridgeEvent through EventRouter
        await this.eventRouter.routeEvent({
            id: request.id.toString(),
            method: 'sendTransaction',
            from: source,
            domain: domain,
            wallet: wallet,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            params: request.params[0] as unknown as any, // Transaction data from params - TODO: fix type
        });

        // For now, return a placeholder - in real implementation, this would come from the handler result
        // TODO: Implement proper response handling from EventRouter
        return { boc: '' };
    }

    /**
     * Handles data signing
     */
    private async handleSignData(
        request: AppRequest,
        wallet: WalletInterface,
        source: string,
        domain: string,
    ): Promise<{ signature: number[]; timestamp: number }> {
        // Ensure params is an array with at least one element
        if (!Array.isArray(request.params) || request.params.length === 0) {
            throw new Error('Invalid sign data parameters');
        }

        // Create and route RawBridgeEvent through EventRouter
        await this.eventRouter.routeEvent({
            id: request.id.toString(),
            method: 'signData',
            from: source,
            domain: domain,
            wallet: wallet,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            params: request.params[0] as unknown as any, // Data to sign from params - TODO: fix type
        });

        // For now, return a placeholder - in real implementation, this would come from the handler result
        // TODO: Implement proper response handling from EventRouter
        return {
            signature: [], // Convert Uint8Array to array for JSON
            timestamp: Date.now(),
        };
    }

    /**
     * Sends an event to the injected bridge
     */
    sendEventToBridge(source: string, event: WalletEvent): void {
        // Create bridge event for sending to injected code
        // In extension context, this would use postMessage to content script
        // For now, we'll log it
        log.info('Sending event to bridge', { source, event: event.event });
    }

    /**
     * Handles disconnection
     */
    async handleDisconnect(source: string): Promise<void> {
        const connectionInfo = this.activeConnections.get(source);

        if (connectionInfo && connectionInfo.sessionId) {
            try {
                // TODO: Implement session disconnect in SessionManager
                // await this.sessionManager.disconnect(connectionInfo.sessionId);
            } catch (error) {
                log.error('Failed to disconnect session', {
                    sessionId: connectionInfo.sessionId,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        }

        this.activeConnections.delete(source);

        // Send disconnect event
        this.sendEventToBridge(source, {
            event: 'disconnect',
            id: Date.now(),
            payload: {},
        });
    }

    /**
     * Utility methods
     */
    private extractDAppName(manifestUrl: string): string {
        try {
            const url = new URL(manifestUrl);
            return url.hostname;
        } catch {
            return 'Unknown dApp';
        }
    }

    private generateSessionId(): string {
        return `js-bridge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    private async buildConnectItemReplies(
        items: ConnectItem[],
        wallet: WalletInterface,
    ): Promise<
        Array<{
            name: string;
            address?: string;
            network?: string;
            publicKey?: string;
            walletStateInit?: string;
            proof?: {
                timestamp: number;
                domain: { lengthBytes: number; value: string };
                signature: string;
                payload: string;
            };
        }>
    > {
        const replies = [];

        for (const item of items) {
            switch (item.name) {
                case 'ton_addr':
                    replies.push({
                        name: 'ton_addr',
                        address: wallet.getAddress(),
                        network: 'mainnet', // TODO: get from wallet or config
                        publicKey: Buffer.from(wallet.publicKey).toString('hex'),
                        walletStateInit: await wallet.getStateInit(),
                    });
                    break;
                case 'ton_proof':
                    // TODO: Implement ton_proof generation
                    replies.push({
                        name: 'ton_proof',
                        proof: {
                            timestamp: Date.now(),
                            domain: {
                                lengthBytes: 0,
                                value: '',
                            },
                            signature: '',
                            payload: (item as { payload?: string }).payload || '',
                        },
                    });
                    break;
                default:
                    replies.push(item);
            }
        }

        return replies;
    }

    /**
     * Creates a response message for the bridge
     */
    createResponse(request: BridgeRequest, success: boolean, result?: unknown, error?: string): BridgeResponse {
        return {
            type: 'TONCONNECT_BRIDGE_RESPONSE',
            source: request.source,
            messageId: request.messageId,
            success,
            result,
            error,
        };
    }
}
