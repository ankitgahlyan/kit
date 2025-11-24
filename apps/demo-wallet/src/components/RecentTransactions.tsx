/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { memo, useEffect, useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Base64NormalizeUrl, HexToBase64, type Hex } from '@ton/walletkit';

import { useStore, useWalletKit } from '../stores';
import type { PreviewTransaction } from '../types/wallet';
import { TraceRow } from './TraceRow';
import { TransactionErrorState, TransactionLoadingState, TransactionEmptyState, TonTransferCard } from './transactions';

interface EventLike {
    eventId: string;
    timestamp: number;
    actions?: unknown[];
}

interface TonTransferActionLike {
    id: string;
    type: 'TonTransfer';
    TonTransfer: {
        sender: { address: string };
        recipient: { address: string };
        amount: string | bigint;
        comment?: string;
    };
}

/**
 * Recent Transactions component
 * Displays a list of recent blockchain transactions for the current wallet
 */
export const RecentTransactions: React.FC = memo(() => {
    const { events, loadEvents, address } = useStore(
        useShallow((state) => ({
            events: state.wallet.events,
            loadEvents: state.loadEvents,
            address: state.wallet.address,
        })),
    );
    const walletKit = useWalletKit();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pendingTransactions, setPendingTransactions] = useState<PreviewTransaction[]>([]);

    // Check for pending transactions
    const checkPendingTransactions = async () => {
        if (!address || !walletKit) return;

        try {
            const apiClient = walletKit.getApiClient();
            const pendingResponse = await apiClient.getPendingTransactions({
                accounts: [address],
            });

            if (pendingResponse.transactions && pendingResponse.transactions.length > 0) {
                const pendingTxs: PreviewTransaction[] = pendingResponse.transactions.map((tx) => {
                    // Determine transaction type and amount
                    let type: 'send' | 'receive' = 'receive';
                    let amount = '0';
                    let targetAddress = '';

                    // Check incoming message
                    if (tx.in_msg && tx.in_msg.value) {
                        amount = tx.in_msg.value;
                        targetAddress = tx.in_msg.source || '';
                        type = 'receive';
                    }

                    // Check outgoing messages - if there are any, it's likely a send transaction
                    if (tx.out_msgs && tx.out_msgs.length > 0) {
                        const mainOutMsg = tx.out_msgs[0];
                        if (mainOutMsg.value) {
                            amount = mainOutMsg.value;
                            targetAddress = mainOutMsg.destination;
                            type = 'send';
                        }
                    }

                    return {
                        id: tx.hash,
                        messageHash: tx.in_msg?.hash || '',
                        type,
                        amount,
                        address: targetAddress,
                        timestamp: tx.now * 1000, // Convert to milliseconds
                        status: 'pending' as const,
                    };
                });

                setPendingTransactions(pendingTxs);
            } else {
                setPendingTransactions([]);
            }
        } catch (_err) {
            // Silently handle errors to avoid spamming the user
            setPendingTransactions([]);
        }
    };

    // Load events when component mounts or address changes
    useEffect(() => {
        const fetchEvents = async () => {
            if (!address) return;

            setIsLoading(true);
            setError(null);
            try {
                await loadEvents(10);
            } catch (_err) {
                setError('Failed to load events');
            } finally {
                setIsLoading(false);
            }
        };

        fetchEvents();
    }, [address, loadEvents]);

    // Set up polling for pending transactions
    useEffect(() => {
        if (!address) return;

        // Start polling immediately
        checkPendingTransactions();

        // Set up interval for polling every 5000ms
        const interval = setInterval(checkPendingTransactions, 5000);

        // Cleanup interval on unmount or address change
        return () => {
            clearInterval(interval);
        };
    }, [address]);

    const handleRefresh = async () => {
        if (!address) return;

        setIsLoading(true);
        setError(null);
        try {
            await loadEvents(10);
        } catch (_err) {
            setError('Failed to refresh events');
        } finally {
            setIsLoading(false);
        }
    };

    const eventItems = useMemo(() => (events || []) as unknown as EventLike[], [events]);

    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
                    {pendingTransactions.length > 0 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            {pendingTransactions.length} pending
                        </span>
                    )}
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    title="Refresh"
                >
                    <svg
                        className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                    </svg>
                </button>
            </div>

            {/* Content */}
            <div className="p-6">
                {error ? (
                    <TransactionErrorState error={error} onRetry={handleRefresh} />
                ) : isLoading ? (
                    <TransactionLoadingState />
                ) : (eventItems?.length ?? 0) === 0 ? (
                    <TransactionEmptyState />
                ) : (
                    <div className="space-y-3">
                        {/* Pending transactions */}
                        {pendingTransactions.map((p) => (
                            <TraceRow key={`pending-${p.id}`} traceId={p.id} externalHash={p.messageHash} isPending />
                        ))}

                        {/* Confirmed transactions */}
                        {(eventItems || []).slice(0, 10).map((ev) => {
                            const tonTransfers = ((ev.actions || []) as unknown as TonTransferActionLike[]).filter(
                                (a: TonTransferActionLike | { type?: string }) => a.type === 'TonTransfer',
                            );

                            if (tonTransfers.length === 0) {
                                // Fallback to TraceRow when no TonTransfer actions are present
                                const traceId = Base64NormalizeUrl(HexToBase64(ev.eventId as unknown as Hex));
                                return <TraceRow key={ev.eventId} traceId={traceId} />;
                            }

                            // Choose primary transfer: involving our address if present, otherwise the first one
                            const primary =
                                tonTransfers.find(
                                    (a) =>
                                        a.TonTransfer.sender.address === (address || '') ||
                                        a.TonTransfer.recipient.address === (address || ''),
                                ) || tonTransfers[0];

                            const traceId = Base64NormalizeUrl(HexToBase64(ev.eventId as unknown as Hex));

                            return (
                                <TonTransferCard
                                    key={ev.eventId}
                                    action={primary}
                                    myAddress={address || ''}
                                    eventId={ev.eventId}
                                    timestamp={ev.timestamp}
                                    traceLink={`/wallet/trace/${traceId}`}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
});

RecentTransactions.displayName = 'RecentTransactions';
