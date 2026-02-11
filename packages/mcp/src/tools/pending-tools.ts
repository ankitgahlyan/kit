/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { z } from 'zod';

import type { McpWalletService } from '../services/McpWalletService.js';
import type { ToolResponse } from './types.js';

export const confirmTransactionSchema = z.object({
    transactionId: z.string().min(1).describe('ID of the pending transaction to confirm'),
});

export const cancelTransactionSchema = z.object({
    transactionId: z.string().min(1).describe('ID of the pending transaction to cancel'),
});

export function createMcpPendingTools(service: McpWalletService) {
    return {
        confirm_transaction: {
            description: 'Confirm and execute a pending transaction.',
            inputSchema: confirmTransactionSchema,
            handler: async (args: z.infer<typeof confirmTransactionSchema>): Promise<ToolResponse> => {
                const result = await service.confirmTransaction(args.transactionId);

                if (!result.success) {
                    return {
                        content: [
                            {
                                type: 'text' as const,
                                text: JSON.stringify({
                                    success: false,
                                    error: result.message,
                                }),
                            },
                        ],
                        isError: true,
                    };
                }

                return {
                    content: [
                        {
                            type: 'text' as const,
                            text: JSON.stringify(
                                {
                                    success: true,
                                    message: result.message,
                                },
                                null,
                                2,
                            ),
                        },
                    ],
                };
            },
        },

        cancel_transaction: {
            description: 'Cancel a pending transaction.',
            inputSchema: cancelTransactionSchema,
            handler: async (args: z.infer<typeof cancelTransactionSchema>): Promise<ToolResponse> => {
                const cancelled = await service.cancelTransaction(args.transactionId);

                if (!cancelled) {
                    return {
                        content: [
                            {
                                type: 'text' as const,
                                text: JSON.stringify({
                                    success: false,
                                    error: 'Transaction not found or already processed',
                                }),
                            },
                        ],
                        isError: true,
                    };
                }

                return {
                    content: [
                        {
                            type: 'text' as const,
                            text: JSON.stringify({
                                success: true,
                                message: 'Transaction cancelled',
                            }),
                        },
                    ],
                };
            },
        },

        list_pending_transactions: {
            description: 'List all pending transactions awaiting confirmation.',
            inputSchema: z.object({}),
            handler: async (): Promise<ToolResponse> => {
                const pending = await service.listPendingTransactions();

                return {
                    content: [
                        {
                            type: 'text' as const,
                            text: JSON.stringify(
                                {
                                    success: true,
                                    transactions: pending.map((tx) => ({
                                        id: tx.id,
                                        type: tx.type,
                                        wallet: tx.walletName,
                                        description: tx.description,
                                        createdAt: tx.createdAt,
                                        expiresAt: tx.expiresAt,
                                    })),
                                    count: pending.length,
                                },
                                null,
                                2,
                            ),
                        },
                    ],
                };
            },
        },
    };
}
