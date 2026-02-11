/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * TON MCP Server - Model Context Protocol server for TON blockchain wallet operations
 *
 * This module provides:
 * - Factory function for creating multi-user MCP servers with pluggable adapters
 * - Standalone MCP server for single-user CLI use
 * - Adapter interfaces for custom storage and signing implementations
 * - Example adapters for testing and development
 */

// ===========================================
// Factory and Configuration
// ===========================================

export { createTonWalletMCP } from './factory.js';

// ===========================================
// Type Exports (for implementers)
// ===========================================

export type {
    IStorageAdapter,
    ISignerAdapter,
    WalletInfo,
    CreateWalletParams,
    ImportWalletParams,
    IUserContextProvider,
    RequestContext,
    IContactResolver,
    Contact,
    TonMcpConfig,
    LimitsConfig,
} from './types/index.js';

// ===========================================
// Example Adapters
// ===========================================

export {
    InMemoryStorageAdapter,
    LocalSignerAdapter,
    SqliteStorageAdapter,
    SqliteSignerAdapter,
    TelegramUserContextProvider,
    StaticUserContextProvider,
} from './adapters/index.js';

export type {
    TelegramUserContextConfig,
    SqliteDatabase,
    SqliteStorageConfig,
    SqliteSignerConfig,
} from './adapters/index.js';

// ===========================================
// Core Utilities (for advanced use)
// ===========================================

export { UserScopedStorage } from './core/UserScopedStorage.js';
export { UserScopedSigner } from './core/UserScopedSigner.js';
export { LimitsManager } from './core/LimitsManager.js';
export type { LimitCheckResult } from './core/LimitsManager.js';
export { PendingTransactionManager } from './core/PendingTransactionManager.js';
export type {
    PendingTransaction,
    PendingTransactionType,
    PendingTonTransfer,
    PendingJettonTransfer,
    PendingSwap,
} from './core/PendingTransactionManager.js';

// ===========================================
// Services
// ===========================================

export { McpWalletService } from './services/McpWalletService.js';
export type {
    McpWalletInfo,
    McpWalletServiceConfig,
    NetworkConfig,
    CreateWalletResult,
    ImportWalletResult,
    JettonInfoResult,
    TransferResult,
    SwapQuoteResult,
    SwapResult,
} from './services/McpWalletService.js';

// Legacy WalletService for standalone use
export { WalletService } from './services/WalletService.js';
