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

export const createWalletSchema = z.object({
    name: z.string().min(1).describe('Unique name for the wallet'),
    version: z
        .enum(['v5r1', 'v4r2'])
        .optional()
        .describe('Wallet version (v5r1 recommended, v4r2 for legacy compatibility). Defaults to v5r1.'),
    network: z
        .enum(['mainnet', 'testnet'])
        .optional()
        .describe('Network to create the wallet on. Defaults to the server configured network.'),
});

export const importWalletSchema = z.object({
    name: z.string().min(1).describe('Unique name for the wallet'),
    mnemonic: z.string().describe('24-word mnemonic phrase separated by spaces'),
    version: z
        .enum(['v5r1', 'v4r2'])
        .optional()
        .describe('Wallet version (v5r1 recommended, v4r2 for legacy compatibility). Defaults to v5r1.'),
    network: z
        .enum(['mainnet', 'testnet'])
        .optional()
        .describe('Network to import the wallet on. Defaults to the server configured network.'),
});

export const removeWalletSchema = z.object({
    name: z.string().min(1).describe('Name of the wallet to remove'),
});

export function createMcpWalletTools(service: McpWalletService) {
    return {
        create_wallet: {
            description:
                'Create a new TON wallet. The wallet is created securely and you will receive the address. No seed phrase is exposed.',
            inputSchema: createWalletSchema,
            handler: async (args: z.infer<typeof createWalletSchema>): Promise<ToolResponse> => {
                try {
                    const result = await service.createWallet(args.name, args.version, args.network);

                    return {
                        content: [
                            {
                                type: 'text' as const,
                                text: JSON.stringify(
                                    {
                                        success: true,
                                        wallet: {
                                            name: result.name,
                                            address: result.address,
                                            network: result.network,
                                        },
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

        import_wallet: {
            description:
                'Import an existing TON wallet using a 24-word mnemonic phrase. The mnemonic is stored securely and never exposed.',
            inputSchema: importWalletSchema,
            handler: async (args: z.infer<typeof importWalletSchema>): Promise<ToolResponse> => {
                const mnemonicWords = args.mnemonic.trim().split(/\s+/);
                if (mnemonicWords.length !== 24) {
                    return {
                        content: [
                            {
                                type: 'text' as const,
                                text: JSON.stringify({
                                    success: false,
                                    error: `Invalid mnemonic: expected 24 words, got ${mnemonicWords.length}`,
                                }),
                            },
                        ],
                        isError: true,
                    };
                }

                try {
                    const result = await service.importWallet(args.name, mnemonicWords, args.version, args.network);

                    return {
                        content: [
                            {
                                type: 'text' as const,
                                text: JSON.stringify(
                                    {
                                        success: true,
                                        wallet: {
                                            name: result.name,
                                            address: result.address,
                                            network: result.network,
                                        },
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

        list_wallets: {
            description: 'List all your stored TON wallets with their addresses and metadata.',
            inputSchema: z.object({}),
            handler: async (): Promise<ToolResponse> => {
                const wallets = await service.listWallets();
                return {
                    content: [
                        {
                            type: 'text' as const,
                            text: JSON.stringify(
                                {
                                    success: true,
                                    wallets: wallets.map((w) => ({
                                        name: w.name,
                                        address: w.address,
                                        network: w.network,
                                        version: w.version,
                                        createdAt: w.createdAt,
                                    })),
                                    count: wallets.length,
                                },
                                null,
                                2,
                            ),
                        },
                    ],
                };
            },
        },

        remove_wallet: {
            description: 'Remove a wallet from storage. This action cannot be undone!',
            inputSchema: removeWalletSchema,
            handler: async (args: z.infer<typeof removeWalletSchema>): Promise<ToolResponse> => {
                const removed = await service.removeWallet(args.name);
                if (!removed) {
                    return {
                        content: [
                            {
                                type: 'text' as const,
                                text: JSON.stringify({
                                    success: false,
                                    error: 'Wallet not found',
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
                                message: `Wallet "${args.name}" has been removed`,
                            }),
                        },
                    ],
                };
            },
        },
    };
}
