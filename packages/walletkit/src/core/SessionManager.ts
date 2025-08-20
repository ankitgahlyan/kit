// Session tracking and lifecycle management

import type { WalletInterface } from '../types';
import type { SessionData, StorageAdapter } from '../types/internal';

export class SessionManager {
    private sessions: Map<string, SessionData> = new Map();
    private storageAdapter: StorageAdapter;
    private storageKey = 'sessions';

    constructor(storageAdapter: StorageAdapter) {
        this.storageAdapter = storageAdapter;
    }

    /**
     * Initialize manager and load persisted sessions
     */
    async initialize(): Promise<void> {
        await this.loadSessions();
    }

    /**
     * Create new session
     */
    async createSession(sessionId: string, dAppName: string, wallet: WalletInterface): Promise<SessionData> {
        const now = new Date();
        const sessionData: SessionData = {
            sessionId,
            dAppName,
            wallet,
            createdAt: now,
            lastActivityAt: now,
        };

        this.sessions.set(sessionId, sessionData);
        await this.persistSessions();

        return sessionData;
    }

    /**
     * Get session by ID
     */
    getSession(sessionId: string): SessionData | null {
        return this.sessions.get(sessionId) || null;
    }

    /**
     * Get all sessions as array
     */
    getSessions(): SessionData[] {
        return Array.from(this.sessions.values());
    }

    /**
     * Get sessions for specific wallet
     */
    getSessionsForWallet(wallet: WalletInterface): SessionData[] {
        return this.getSessions().filter((session) => session.wallet.publicKey === wallet.publicKey);
    }

    /**
     * Update session activity timestamp
     */
    async updateSessionActivity(sessionId: string): Promise<void> {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.lastActivityAt = new Date();
            await this.persistSessions();
        }
    }

    /**
     * Remove session by ID
     */
    async removeSession(sessionId: string): Promise<boolean> {
        const removed = this.sessions.delete(sessionId);
        if (removed) {
            await this.persistSessions();
        }
        return removed;
    }

    /**
     * Remove all sessions for a wallet
     */
    async removeSessionsForWallet(wallet: WalletInterface): Promise<number> {
        const sessionsToRemove = this.getSessionsForWallet(wallet);

        let removedCount = 0;
        for (const session of sessionsToRemove) {
            if (this.sessions.delete(session.sessionId)) {
                removedCount++;
            }
        }

        if (removedCount > 0) {
            await this.persistSessions();
        }

        return removedCount;
    }

    /**
     * Clear all sessions
     */
    async clearSessions(): Promise<void> {
        this.sessions.clear();
        await this.persistSessions();
    }

    /**
     * Get session count
     */
    getSessionCount(): number {
        return this.sessions.size;
    }

    /**
     * Check if session exists
     */
    hasSession(sessionId: string): boolean {
        return this.sessions.has(sessionId);
    }

    /**
     * Clean up expired sessions (optional cleanup based on inactivity)
     */
    async cleanupInactiveSessions(maxInactiveHours: number = 24): Promise<number> {
        const cutoffTime = new Date();
        cutoffTime.setHours(cutoffTime.getHours() - maxInactiveHours);

        const sessionsToRemove: string[] = [];

        for (const [sessionId, session] of this.sessions.entries()) {
            if (session.lastActivityAt < cutoffTime) {
                sessionsToRemove.push(sessionId);
            }
        }

        // Remove expired sessions
        for (const sessionId of sessionsToRemove) {
            this.sessions.delete(sessionId);
        }

        if (sessionsToRemove.length > 0) {
            await this.persistSessions();
        }

        return sessionsToRemove.length;
    }

    /**
     * Get sessions as the format expected by the main API
     */
    getSessionsForAPI(): Array<{ sessionId: string; dAppName: string; wallet: WalletInterface }> {
        return this.getSessions().map((session) => ({
            sessionId: session.sessionId,
            dAppName: session.dAppName,
            wallet: session.wallet,
        }));
    }

    /**
     * Load sessions from storage
     */
    private async loadSessions(): Promise<void> {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const sessionData = await this.storageAdapter.get<any[]>(this.storageKey);

            if (sessionData && Array.isArray(sessionData)) {
                // TODO: Implement session reconstruction from stored data
                // This is challenging because sessions contain wallet references
                // You'd need to coordinate with WalletManager to reconstruct properly
                console.log('Loaded session metadata:', sessionData.length);
            }
        } catch (error) {
            console.warn('Failed to load sessions from storage:', error);
        }
    }

    /**
     * Persist session metadata to storage
     */
    private async persistSessions(): Promise<void> {
        try {
            // Store session metadata (wallet references need special handling)
            const sessionMetadata = this.getSessions().map((session) => ({
                sessionId: session.sessionId,
                dAppName: session.dAppName,
                walletPublicKey: session.wallet.publicKey, // Store wallet reference
                createdAt: session.createdAt.toISOString(),
                lastActivityAt: session.lastActivityAt.toISOString(),
            }));

            await this.storageAdapter.set(this.storageKey, sessionMetadata);
        } catch (error) {
            console.warn('Failed to persist sessions to storage:', error);
        }
    }
}
