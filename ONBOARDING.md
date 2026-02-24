# TON Wallet Kit - Developer Onboarding Guide

Welcome to the TON Wallet Kit monorepo! This comprehensive guide will help you understand the architecture, data flows, and how to work with this codebase.

## Table of Contents

1. [Repository Structure](#repository-structure)
2. [Architecture Overview](#architecture-overview)
3. [Package Breakdown](#package-breakdown)
4. [Data Flows](#data-flows)
5. [Key Concepts](#key-concepts)
6. [Development Workflow](#development-workflow)
7. [Testing Strategy](#testing-strategy)
8. [Common Patterns](#common-patterns)

---

## Repository Structure

```
/home/zeta/kit
├── packages/                    # Core libraries
│   ├── appkit/                 # Provider-agnostic wallet management
│   ├── appkit-react/           # React components and hooks
│   ├── walletkit/              # Core wallet functionality
│   ├── phosphate/              # DeFi contracts
│   ├── walletkit-ios-bridge/   # iOS bridge
│   ├── walletkit-android-bridge/ # Android bridge
│   └── mcp/                     # Model Context Protocol server
├── apps/                       # Applications
│   ├── demo-wallet/            # Web demo wallet
│   ├── demo-wallet-native/     # Native demo wallet
│   ├── appkit-minter/          # NFT minter app
│   └── mcp-telegram/           # Telegram MCP bot
├── demo/                       # Examples and demos
│   ├── examples/               # Usage examples
│   ├── wallet-core/            # Wallet core demo
│   └── v4ledger-adapter/       # Ledger adapter demo
├── eslint.config.js            # ESLint configuration
├── tsconfig.json               # Root TypeScript config
└── pnpm-workspace.yaml         # pnpm workspace config
```

---

## Architecture Overview

The codebase follows a **layered architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                     Apps & Demos                            │
│  (demo-wallet, appkit-minter, examples)                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   @ton/appkit-react                          │
│  React Components & Hooks                                   │
│  - AppKitProvider, useAppKit hook                           │
│  - UI Components (buttons, modals, etc.)                   │
│  - TanStack Query integration                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     @ton/appkit                              │
│  Integration Layer - Provider-agnostic wallet management  │
│  - AppKit (main orchestrator)                              │
│  - Connectors (TonConnect, Ledger, etc.)                   │
│  - Actions (connect, transfer, sign, etc.)                 │
│  - Queries (TanStack Query wrappers)                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    @ton/walletkit                           │
│  Core Wallet Engine                                         │
│  - TonWalletKit (main orchestrator)                        │
│  - Wallet management (V4R2, V5R1)                         │
│  - Session management (TON Connect)                       │
│  - Event routing & processing                              │
│  - Jettons & Swap APIs                                     │
│  - Network management                                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  External Dependencies                       │
│  @ton/core, @ton/crypto, @tonconnect/sdk, @tanstack/query  │
└─────────────────────────────────────────────────────────────┘
```

---

## Package Breakdown

### @ton/walletkit - Core Wallet Engine

**Purpose**: The foundational library that handles all core wallet operations on the TON blockchain.

**Entry Point**: `packages/walletkit/src/index.ts`

**Main File**: `packages/walletkit/src/core/TonWalletKit.ts` (815 lines)

**Core Responsibilities**:

| Component | Purpose |
|-----------|---------|
| `TonWalletKit` | Main orchestrator class - delegates to specialized components |
| `WalletManager` | CRUD operations for wallets (add, remove, get) |
| `TONConnectSessionManager` | Session lifecycle (connect, disconnect, persist) |
| `EventRouter` | Parse and route incoming events |
| `RequestProcessor` | Handle approval/rejection of requests |
| `BridgeManager` | Communicate with wallet extensions/browsers |
| `JettonsManager` | Jeton (token) operations |
| `SwapManager` | DEX swap operations |
| `NetworkManager` | Multi-network API client management |
| `EventProcessor` | Process and store blockchain events |

**Key Types** (`packages/walletkit/src/types/`):

- `WalletId` - Unique wallet identifier (format: `${network}:${address}`)
- `Wallet` - Wallet interface with address, network, signer
- `Network` - Network configuration (mainnet/testnet)
- `TransactionRequest` - Transaction parameters
- `TonConnectSession` - TON Connect session data

**Wallet Contracts** (`packages/walletkit/src/contracts/`):

- `WalletV4R2` - Legacy v4r2 wallet
- `WalletV5R1` - Latest v5r1 wallet with extensions

**Utilities** (`packages/walletkit/src/utils/`):

- `address.ts` - Address validation and formatting
- `base64.ts` - Base64 encoding/decoding
- `mnemonic.ts` - Mnemonic phrase handling
- `sign.ts` - Transaction signing
- `tonProof.ts` - TON Proof verification
- `units.ts` - NanoTON conversion (TON ↔ nano)
- `messageBuilders.ts` - Create transfer payloads

**Testing**: Uses Jest with `ts-jest` preset. Test files end with `.spec.ts`

---

### @ton/appkit - Integration Layer

**Purpose**: Provider-agnostic wallet management that abstracts walletkit complexity and provides a cleaner API.

**Entry Point**: `packages/appkit/src/index.ts`

**Main File**: `packages/appkit/src/core/app-kit/services/app-kit.ts`

**Core Components**:

| Component | Purpose |
|-----------|---------|
| `AppKit` | Main orchestrator - manages connectors, wallets, providers |
| `Connector` | Interface for wallet connection adapters |
| `Emitter` | Event system for state changes |

**Directory Structure**:

```
packages/appkit/src/
├── core/
│   ├── app-kit/           # Main AppKit class
│   │   ├── services/      # Business logic
│   │   ├── types/         # Type definitions
│   │   └── constants/     # Events, config
│   └── emitter/          # Event emitter implementation
├── connectors/           # Wallet connectors
│   └── tonconnect/       # TonConnect connector implementation
├── actions/              # Action functions (mutations)
│   ├── connectors/       # connect, disconnect, addConnector
│   ├── wallets/          # getWallets, selectWallet
│   ├── transaction/      # transferTon, sendTransaction
│   ├── jettons/          # getJettons, transferJetton
│   ├── nft/              # getNfts, transferNft
│   ├── swap/             # getSwapQuote, buildSwapTransaction
│   ├── signing/          # signText, signCell, signBinary
│   └── network/          # getNetworks, watchNetworks
├── queries/              # TanStack Query wrappers
│   └── [same structure as actions]
├── types/                # Type definitions
│   ├── connector.ts      # Connector interface
│   ├── wallet.ts         # Wallet types
│   ├── jetton.ts         # Jetton types
│   ├── nft.ts            # NFT types
│   └── ...
└── utils/                # Utility functions
    ├── errors/           # getErrorMessage
    ├── arrays/           # keyBy, randomFromArray
    ├── predicate/        # isString, isObjectWithMessage
    └── promise/          # cancelPromise
```

**Two Export Entry Points**:

1. `@ton/appkit` - Core AppKit (tree-shakable)
2. `@ton/appkit/tonconnect` - TonConnect features only

This separation allows bundlers to exclude TonConnect code when not needed.

---

### @ton/appkit-react - React UI

**Purpose**: React components and hooks for building wallet-enabled dApps.

**Entry Point**: `packages/appkit-react/src/index.ts`

**Main Files**:

| File | Purpose |
|------|---------|
| `providers/app-kit-provider.tsx` | React context provider |
| `hooks/use-app-kit.ts` | Main hook to access AppKit |
| `hooks/use-app-kit-theme.ts` | Theme management |

**Components** (`packages/appkit-react/src/components/`):

- `Block` - Container component
- `Button` - Action button
- `CircleIcon` - Circular icon wrapper
- `TonIcon` - TON-specific icons

**Features** (`packages/appkit-react/src/features/`):

- `balances` - Balance display components
- `jettons` - Jetton management UI
- `network` - Network switching UI
- `nft` - NFT display components
- `transaction` - Transaction components
- `wallets` - Wallet selection UI
- `swap` - Swap interface components
- `signing` - Signing request UI

**Testing**: Uses Vitest with React Testing Library

---

## Data Flows

### 1. Wallet Connection Flow

```
┌──────────┐     ┌─────────────┐     ┌──────────┐     ┌────────────┐     ┌─────────────┐
│   User   │────▶│ React Hook  │────▶│ AppKit   │────▶│ Connector  │────▶│ WalletKit  │
│          │     │ useAppKit() │     │ Actions  │     │ TonConnect │     │            │
└──────────┘     └─────────────┘     └──────────┘     └────────────┘     └─────────────┘
                                                                                  │
                                                                                  ▼
                                                                         ┌─────────────┐
                                                                         │   Bridge    │
                                                                         │ Extension   │
                                                                         └─────────────┘
```

**Step-by-step**:

1. User clicks "Connect Wallet" button
2. React component calls `useAppKit().connect()` hook
3. Hook invokes `connect()` action from `@ton/appkit`
4. Action finds the appropriate `Connector` and calls `connector.connectWallet()`
5. Connector initiates TON Connect flow via `WalletKit`
6. Wallet extension bridge handles the connection
7. On success, wallet info flows back through the same chain
8. Event emission triggers React state updates

**Code Example**:

```typescript
// In React component
const { connect, disconnect, wallets, selectedWallet } = useAppKit();

// Connect wallet
await connect({ connectorId: 'tonconnect' });

// Now wallets are connected
console.log(selectedWallet?.address);
```

---

### 2. Transaction Flow

```
┌──────────┐     ┌─────────────┐     ┌──────────┐     ┌────────────┐     ┌─────────────┐
│   User   │────▶│  Query/Mut  │────▶│ AppKit   │────▶│ WalletKit  │────▶│   Network   │
│          │     │ (TanStack)  │     │ Actions  │     │ RequestProc│     │   (RPC)     │
└──────────┘     └─────────────┘     └──────────┘     └────────────┘     └─────────────┘
                                                                                  │
                                                                                  ▼
                                                                         ┌─────────────┐
                                                                         │   Signing  │
                                                                         │  (Wallet)  │
                                                                         └─────────────┘
```

**Step-by-step**:

1. User initiates transfer (e.g., sends TON)
2. TanStack Query mutation is invoked
3. Action creates transaction parameters
4. `WalletKit` creates the transaction object
5. User signs via wallet extension
6. Signed transaction sent to TON network via RPC
7. Transaction hash returned

**Code Example**:

```typescript
// Using React Query mutation
const transferMutation = useMutation({
  mutationFn: (params: TransferTonParams) => 
    transferTon(appKit, params)
});

// Execute
await transferMutation.mutateAsync({
  to: '0:abcdef...',
  amount: '1',
});
```

---

### 3. Event Processing Flow

```
┌─────────────┐     ┌────────────┐     ┌─────────────┐     ┌─────────────┐
│   Network   │────▶│   Bridge   │────▶│ EventRouter │────▶│   Request   │
│  (TonCenter)│     │  Manager   │     │             │     │  Processor  │
└─────────────┘     └────────────┘     └─────────────┘     └─────────────┘
                                                                     │
                                                                     ▼
                                                              ┌─────────────┐
                                                              │    Event    │
                                                              │  Emitter    │
                                                              └─────────────┘
                                                                     │
                                                                     ▼
                                                              ┌─────────────┐
                                                              │ React Hooks │
                                                              │   /State    │
                                                              └─────────────┘
```

**Event Types**:

- `connect` - Wallet connected
- `disconnect` - Wallet disconnected
- `sendTransaction` - Transaction request
- `signData` - Data signing request

---

### 4. Query Data Flow (TanStack Query)

```
┌─────────────┐     ┌────────────┐     ┌─────────────┐     ┌─────────────┐
│  Component  │────▶│   Query    │────▶│  WalletKit  │────▶│  API Client │
│   (React)   │     │ (useQuery) │     │   Jettons   │     │  (TonCenter)│
└─────────────┘     └────────────┘     └─────────────┘     └─────────────┘
       │                                      │
       │◀─────────── Cached Data ◀───────────┘
       │
       ▼
┌─────────────┐
│    React    │
│    State    │
└─────────────┘
```

**Example Queries**:

```typescript
// Get jettons for wallet
const { data: jettons } = useQuery({
  queryKey: ['jettons', walletAddress],
  queryFn: () => getJettons(appKit, { address: walletAddress })
});
```

---

## Key Concepts

### 1. Connector Pattern

Connectors provide an abstraction layer for different wallet connection methods:

```typescript
interface Connector {
  readonly id: string;           // Unique identifier
  readonly type: string;         // 'tonconnect' | 'ledger' | 'mnemonic'
  readonly metadata: ConnectorMetadata;
  
  initialize(emitter, networkManager): Promise<void>;
  destroy(): void;
  connectWallet(): Promise<void>;
  disconnectWallet(): Promise<void>;
  getConnectedWallets(): WalletInterface[];
}
```

**Built-in Connectors**:

- `TonConnectConnector` - TonConnect protocol
- More can be added by implementing the interface

---

### 2. Action vs Query Pattern

**Actions** (`src/actions/`) - Perform mutations:

```typescript
// Action: changes state, returns void or result
export const connect = async (appKit: AppKit, params) => {
  const connector = appKit.connectors.find(c => c.id === params.connectorId);
  await connector.connectWallet();
};
```

**Queries** (`src/queries/`) - Fetch data with caching:

```typescript
// Query: returns TanStack Query options
export const connectMutationOptions = (appKit, options) => ({
  mutationKey: ['connect'],
  mutationFn: (vars) => connect(appKit, vars),
  ...options
});
```

---

### 3. Emitter Pattern

The event system allows decoupled communication:

```typescript
// Listen for events
appKit.emitter.on('walletConnected', (payload) => {
  console.log('Wallet connected:', payload.address);
});

// Emit events
appKit.emitter.emit('walletConnected', { address: '...' });
```

---

### 4. Wallet Adapter Pattern

Wallets are accessed through adapters:

```typescript
interface WalletAdapter {
  getNetwork(): Network;
  getAddress(): string;
  getPublicKey(): string;
  sign(data: Uint8Array): Promise<Uint8Array>;
  sendMessage(cell: Cell): Promise<string>;
}
```

---

### 5. Network Manager

Multi-network support through `NetworkManager`:

```typescript
// Configure networks
const appKit = new AppKit({
  networks: {
    [Network.mainnet().chainId]: {
      // Mainnet config
    },
    [Network.testnet().chainId]: {
      // Testnet config
    }
  }
});
```

---

## Development Workflow

### Setup

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Start development
pnpm dev
```

### Running Tests

```bash
# All tests
pnpm quality

# Single package tests
pnpm --filter @ton/appkit test

# Specific test file
pnpm --filter @ton/appkit test --run src/utils/promise/cancel-promise.spec.ts

# Watch mode
pnpm --filter @ton/appkit test
```

### Code Quality

```bash
# Type checking
pnpm typecheck

# Linting
pnpm lint
pnpm lint:fix  # Auto-fix
```

---

## Testing Strategy

### Unit Tests

Located alongside source files with `.test.ts` or `.spec.ts` suffix:

```
src/
├── utils/
│   ├── promise/
│   │   ├── cancel-promise.ts
│   │   └── cancel-promise.test.ts   # Tests
│   └── errors/
│       ├── get-error-message.ts
│       └── get-error-message.test.ts
```

**Testing Patterns**:

```typescript
import { describe, it, expect } from 'vitest';

describe('cancelPromise', () => {
  it('should resolve if promise completes first', async () => {
    const promise = Promise.resolve('success');
    const result = await cancelPromise(promise, 1000);
    expect(result).toBe('success');
  });
});
```

### Integration Tests

Located in `__tests__/` directories:

```
packages/appkit/src/__tests__/
├── setup.ts           # Test setup
├── ui-state-wiring.test.ts
└── wallet-initialization.test.ts
```

### E2E Tests

Located in `apps/demo-wallet/e2e/`:

```
apps/demo-wallet/e2e/
├── connect.spec.ts
├── sendTransaction/
│   ├── sendTransaction1.spec.ts
│   └── ...
└── ui-tests/
    ├── newWallet.spec.ts
    └── importWallet.spec.ts
```

---

## Common Patterns

### Creating a New Action

1. Create `src/actions/<feature>/action-name.ts`:

```typescript
import type { AppKit } from '../../core/app-kit';

export type ActionParams = { /* parameters */ };
export type ActionReturn = /* return type */;

export const actionName = async (
  appKit: AppKit,
  params: ActionParams
): Promise<ActionReturn> => {
  // Implementation
};
```

2. Create corresponding query in `src/queries/<feature>/action-name.ts`:

```typescript
import { actionName } from '../../actions/<feature>/action-name';
import type { ActionParams, ActionReturn } from '../../actions/<feature>/action-name';

export const actionNameMutationOptions = (appKit: AppKit, options = {}) => ({
  mutationKey: ['actionName'],
  mutationFn: (vars: ActionParams) => actionName(appKit, vars),
  ...options
});
```

3. Export from index files

---

### Adding a New Wallet Type

1. Create contract wrapper in `packages/walletkit/src/contracts/<version>/`:

```typescript
// Define wallet code
export const WalletV5R1CodeCell = /* Cell */;

// Create adapter
export class WalletV5R1Adapter implements WalletAdapter {
  // Implement interface
}
```

2. Export from `packages/walletkit/src/index.ts`

---

### Error Handling

Use the `getErrorMessage` utility for consistent errors:

```typescript
import { getErrorMessage } from '@ton/appkit/utils';

try {
  await someOperation();
} catch (error) {
  const message = getErrorMessage(error, 'Default message');
  console.error(message);
}
```

---

## File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Source files | kebab-case | `cancel-promise.ts` |
| Components | PascalCase | `AppKitProvider.tsx` |
| Hooks | kebab-case with prefix | `use-app-kit.ts` |
| Types | PascalCase | `WalletInterface.ts` |
| Tests | Original name + `.test` | `cancel-promise.test.ts` |
| Constants | UPPER_SNAKE_CASE | `DEFAULT_TIMEOUT` |

---

## Import Organization

Follow this order:

1. External libraries (React, @ton/*, @tanstack/*)
2. Internal modules (`../`, `./`)
3. Type imports (use `import type`)

```typescript
// External
import { useState, useEffect } from 'react';
import type { MutationOptions } from '@tanstack/query-core';
import type { AppKit } from '@ton/appkit';

// Internal
import { connect } from '../../actions/connectors/connect';
import type { ConnectParameters } from '../../actions/connectors/connect';

// Types
import type { Compute } from '../../types/utils';
```

---

## License Headers

All files must include the MIT license header:

```typescript
/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
```

---

## Additional Resources

- [TON Documentation](https://docs.ton.dev/)
- [TonConnect Protocol](https://github.com/ton-connect/sdk)
- [Vitest Testing](https://vitest.dev/)
- [TanStack Query](https://tanstack.com/query/)
