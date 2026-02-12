/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { z } from 'zod';
import type { SwapQuote } from '@ton/walletkit';

import type { McpWalletService } from '../services/McpWalletService.js';
import type { ToolResponse } from './types.js';

// Store quotes temporarily for execution
const quoteCache = new Map<string, { quote: SwapQuote; expiresAt: number }>();

function generateQuoteId(): string {
    return `quote_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function cleanExpiredQuotes(): void {
    const now = Date.now();
    for (const [id, data] of quoteCache.entries()) {
        if (data.expiresAt < now) {
            quoteCache.delete(id);
        }
    }
}

export const getSwapQuoteSchema = z.object({
    fromToken: z.string().min(1).describe('Token to swap from ("TON" or jetton address)'),
    toToken: z.string().min(1).describe('Token to swap to ("TON" or jetton address)'),
    amount: z.string().min(1).describe('Amount to swap in raw units'),
    slippageBps: z.number().optional().describe('Slippage tolerance in basis points (default 100 = 1%)'),
});

export const executeSwapSchema = z.object({
    quoteId: z.string().min(1).describe('Quote ID returned from get_swap_quote'),
});

export function createMcpSwapTools(service: McpWalletService) {
    return {
        get_swap_quote: {
            description: 'Get a quote for swapping tokens. Returns a quote ID to use with execute_swap.',
            inputSchema: getSwapQuoteSchema,
            handler: async (args: z.infer<typeof getSwapQuoteSchema>): Promise<ToolResponse> => {
                try {
                    cleanExpiredQuotes();

                    const result = await service.getSwapQuote(
                        args.fromToken,
                        args.toToken,
                        args.amount,
                        args.slippageBps,
                    );

                    // Store quote for later execution
                    const quoteId = generateQuoteId();
                    const expiresAt = result.expiresAt ? result.expiresAt * 1000 : Date.now() + 60000;
                    quoteCache.set(quoteId, { quote: result.quote, expiresAt });

                    return {
                        content: [
                            {
                                type: 'text' as const,
                                text: JSON.stringify(
                                    {
                                        success: true,
                                        quoteId,
                                        fromToken: result.fromToken,
                                        toToken: result.toToken,
                                        fromAmount: result.fromAmount,
                                        toAmount: result.toAmount,
                                        minReceived: result.minReceived,
                                        provider: result.provider,
                                        expiresAt: result.expiresAt
                                            ? new Date(result.expiresAt * 1000).toISOString()
                                            : null,
                                        note: 'Use the quoteId with execute_swap to complete the swap.',
                                    },
                                    null,
                                    2,
                                ),
                            },
                        ],
                    };
                } catch (error) {
                    return {
                        content: [
                            {
                                type: 'text' as const,
                                text: JSON.stringify({
                                    success: false,
                                    error: error instanceof Error ? error.message : 'Unknown error',
                                }),
                            },
                        ],
                        isError: true,
                    };
                }
            },
        },

        execute_swap: {
            description: 'Execute a token swap using a quote.',
            inputSchema: executeSwapSchema,
            handler: async (args: z.infer<typeof executeSwapSchema>): Promise<ToolResponse> => {
                cleanExpiredQuotes();

                const cachedQuote = quoteCache.get(args.quoteId);

                if (!cachedQuote) {
                    return {
                        content: [
                            {
                                type: 'text' as const,
                                text: JSON.stringify({
                                    success: false,
                                    error: 'Quote not found or expired. Please get a new quote.',
                                }),
                            },
                        ],
                        isError: true,
                    };
                }

                if (cachedQuote.expiresAt < Date.now()) {
                    quoteCache.delete(args.quoteId);
                    return {
                        content: [
                            {
                                type: 'text' as const,
                                text: JSON.stringify({
                                    success: false,
                                    error: 'Quote has expired. Please get a new quote.',
                                }),
                            },
                        ],
                        isError: true,
                    };
                }

                const result = await service.executeSwap(cachedQuote.quote);

                // Remove used quote
                quoteCache.delete(args.quoteId);

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
                                        fromToken: cachedQuote.quote.fromToken,
                                        toToken: cachedQuote.quote.toToken,
                                        fromAmount: cachedQuote.quote.fromAmount,
                                        toAmount: cachedQuote.quote.toAmount,
                                        provider: cachedQuote.quote.providerId,
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
