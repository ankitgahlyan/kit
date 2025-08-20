// Request approval and rejection processing

import type { EventConnectRequest, EventTransactionRequest, EventSignDataRequest } from '../types';
import type { SessionManager } from './SessionManager';
import type { BridgeManager } from './BridgeManager';

/**
 * Handles approval and rejection of various request types
 */
export class RequestProcessor {
    constructor(
        private sessionManager: SessionManager,
        private bridgeManager: BridgeManager,
    ) {}

    /**
     * Process connect request approval
     */
    async approveConnectRequest(event: EventConnectRequest): Promise<void> {
        try {
            // Create session for this connection
            await this.sessionManager.createSession(event.id, event.dAppName, event.wallet);

            // Create bridge session
            await this.bridgeManager.createSession(event.id);

            // Send approval response
            const response = await this.createConnectApprovalResponse(event);
            await this.bridgeManager.sendResponse(event.id, event.id, response);
        } catch (error) {
            console.error('Failed to approve connect request:', error);
            throw error;
        }
    }

    /**
     * Process connect request rejection
     */
    async rejectConnectRequest(event: EventConnectRequest, reason?: string): Promise<void> {
        try {
            const response = {
                error: 'USER_REJECTED',
                reason: reason || 'User rejected connection',
            };

            await this.bridgeManager.sendResponse(event.id, event.id, response);
        } catch (error) {
            console.error('Failed to reject connect request:', error);
            throw error;
        }
    }

    /**
     * Process transaction request approval
     */
    async approveTransactionRequest(event: EventTransactionRequest): Promise<{ signedBoc: string }> {
        try {
            // Sign transaction with wallet
            const signedBoc = await this.signTransaction(event);

            // Send approval response
            const response = {
                result: signedBoc,
            };

            await this.bridgeManager.sendResponse(event.id, event.id, response);

            return { signedBoc };
        } catch (error) {
            console.error('Failed to approve transaction request:', error);
            throw error;
        }
    }

    /**
     * Process transaction request rejection
     */
    async rejectTransactionRequest(event: EventTransactionRequest, reason?: string): Promise<void> {
        try {
            const response = {
                error: 'USER_REJECTED',
                reason: reason || 'User rejected transaction',
            };

            await this.bridgeManager.sendResponse(event.id, event.id, response);
        } catch (error) {
            console.error('Failed to reject transaction request:', error);
            throw error;
        }
    }

    /**
     * Process sign data request approval
     */
    async approveSignDataRequest(event: EventSignDataRequest): Promise<{ signature: Uint8Array }> {
        try {
            // Sign data with wallet
            const signature = await event.wallet.sign(event.data);

            // Send approval response
            const response = {
                result: Array.from(signature), // Convert to array for JSON serialization
            };

            await this.bridgeManager.sendResponse(event.id, event.id, response);

            return { signature };
        } catch (error) {
            console.error('Failed to approve sign data request:', error);
            throw error;
        }
    }

    /**
     * Process sign data request rejection
     */
    async rejectSignDataRequest(event: EventSignDataRequest, reason?: string): Promise<void> {
        try {
            const response = {
                error: 'USER_REJECTED',
                reason: reason || 'User rejected data signing',
            };

            await this.bridgeManager.sendResponse(event.id, event.id, response);
        } catch (error) {
            console.error('Failed to reject sign data request:', error);
            throw error;
        }
    }

    /**
     * Create connect approval response
     */
    private async createConnectApprovalResponse(event: EventConnectRequest) {
        const wallet = event.wallet;

        return {
            result: {
                address: await wallet.getAddress(),
                publicKey: wallet.publicKey,
                version: wallet.version,
                network: 'mainnet', // TODO: Make this configurable
            },
        };
    }

    /**
     * Sign transaction and return BOC
     */
    private async signTransaction(event: EventTransactionRequest): Promise<string> {
        // TODO: Implement proper transaction signing
        // This would involve:
        // 1. Parsing the transaction messages from event.request.messages
        // 2. Creating the transaction cell structure
        // 3. Signing with the wallet's private key
        // 4. Encoding the result to BOC format

        console.log('Signing transaction:', {
            id: event.id,
            messages: event.request.messages.length,
            from: event.request.from,
            validUntil: event.request.validUntil,
        });

        // Mock implementation - replace with actual signing logic
        const mockSignedBoc = 'te6ccgECFAEAAtQAART/APSkE/S88sgLAQIBYgIDAgLNBAUE';

        return mockSignedBoc;
    }
}
