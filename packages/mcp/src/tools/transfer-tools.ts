/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { z } from 'zod';

import type { McpWalletService } from '../services/McpWalletService.js';
import { toRawAmount, TON_DECIMALS } from './types.js';
import type { ToolResponse } from './types.js';

export const sendTonSchema = z.object({
    wallet: z.string().min(1).describe('Name of the wallet to send from'),
    toAddress: z.string().min(1).describe('Recipient TON address'),
    amount: z.string().min(1).describe('Amount of TON to send (e.g., "1.5" for 1.5 TON)'),
    comment: z.string().optional().describe('Optional comment/memo for the transaction'),
});

export const sendJettonSchema = z.object({
    wallet: z.string().min(1).describe('Name of the wallet to send from'),
    toAddress: z.string().min(1).describe('Recipient TON address'),
    jettonAddress: z.string().min(1).describe('Jetton master contract address'),
    amount: z.string().min(1).describe('Amount of tokens to send in human-readable format'),
    comment: z.string().optional().describe('Optional comment/memo for the transaction'),
});

export function createMcpTransferTools(service: McpWalletService) {
    return {
        send_ton: {
            description:
                'Send TON from a wallet to an address. Amount is in TON (e.g., "1.5" means 1.5 TON). May require confirmation if enabled.',
            inputSchema: sendTonSchema,
            handler: async (args: z.infer<typeof sendTonSchema>): Promise<ToolResponse> => {
                const rawAmount = toRawAmount(args.amount, TON_DECIMALS);

                const result = await service.sendTon(args.wallet, args.toAddress, rawAmount, args.amount, args.comment);

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
                                    details: {
                                        from: args.wallet,
                                        to: args.toAddress,
                                        amount: `${args.amount} TON`,
                                        comment: args.comment || null,
                                        pendingTransactionId: result.pendingTransactionId || null,
                                    },
                                },
                                null,
                                2,
                            ),
                        },
                    ],
                };
            },
        },

        send_jetton: {
            description:
                'Send Jettons (tokens) from a wallet to an address. Amount is in human-readable format. May require confirmation if enabled.',
            inputSchema: sendJettonSchema,
            handler: async (args: z.infer<typeof sendJettonSchema>): Promise<ToolResponse> => {
                // Fetch jetton info for decimals
                let decimals: number | undefined;
                let symbol: string | undefined;

                try {
                    const jettons = await service.getJettons(args.wallet);
                    const jetton = jettons.find((j) => j.address.toLowerCase() === args.jettonAddress.toLowerCase());
                    if (jetton) {
                        decimals = jetton.decimals;
                        symbol = jetton.symbol;
                    }
                } catch (error) {
                    return {
                        content: [
                            {
                                type: 'text' as const,
                                text: JSON.stringify({
                                    success: false,
                                    error: `Failed to fetch jetton info: ${error instanceof Error ? error.message : 'Unknown error'}`,
                                }),
                            },
                        ],
                        isError: true,
                    };
                }

                if (decimals === undefined) {
                    return {
                        content: [
                            {
                                type: 'text' as const,
                                text: JSON.stringify({
                                    success: false,
                                    error: `Cannot determine decimals for jetton ${args.jettonAddress}. The token may not be in your wallet.`,
                                }),
                            },
                        ],
                        isError: true,
                    };
                }

                const rawAmount = toRawAmount(args.amount, decimals);

                const result = await service.sendJetton(
                    args.wallet,
                    args.toAddress,
                    args.jettonAddress,
                    rawAmount,
                    args.amount,
                    symbol,
                    decimals,
                    args.comment,
                );

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
                                    details: {
                                        from: args.wallet,
                                        to: args.toAddress,
                                        jettonAddress: args.jettonAddress,
                                        amount: `${args.amount} ${symbol || 'tokens'}`,
                                        comment: args.comment || null,
                                        pendingTransactionId: result.pendingTransactionId || null,
                                    },
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
