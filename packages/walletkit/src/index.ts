// Main exports for TonWalletKit

export { TonWalletKit } from './core/TonWalletKitMinimal';

// Re-export all types for convenience
export * from './types';
export * from './types/internal';

// Re-export managers for advanced customization
export { WalletManager } from './core/WalletManager';
export { SessionManager } from './core/SessionManager';
export { BridgeManager } from './core/BridgeManager';
export { EventRouter } from './core/EventRouter';
export { RequestProcessor } from './core/RequestProcessor';
export { ResponseHandler } from './core/ResponseHandler';
export { Initializer } from './core/Initializer';

// Re-export handlers for customization
export { ConnectHandler } from './handlers/ConnectHandler';
export { TransactionHandler } from './handlers/TransactionHandler';
export { SignDataHandler } from './handlers/SignDataHandler';
export { DisconnectHandler } from './handlers/DisconnectHandler';
