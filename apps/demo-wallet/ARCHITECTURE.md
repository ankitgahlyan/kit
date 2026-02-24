# Demo-Wallet App Architecture Guide

This document provides a comprehensive overview of the demo-wallet application architecture, data flow, and request flow. It's designed for developers new to React development.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Core Technologies](#core-technologies)
4. [State Management (Zustand)](#state-management-zustand)
5. [Application Flow](#application-flow)
6. [Data Flow](#data-flow)
7. [Request Flow](#request-flow)
8. [Key Components](#key-components)
9. [Key Hooks](#key-hooks)
10. [Pages Overview](#pages-overview)
11. [Extension Support](#extension-support)
12. [How to Modify the App](#how-to-modify-the-app)

---

## Architecture Overview

The demo-wallet is a **TON blockchain wallet** application built with React. It uses a **monorepo architecture** with pnpm workspaces and Turbo for build orchestration. The app serves as a demonstration of the `@ton/appkit` wallet functionality.

### Key Characteristics:
- **React-based SPA** (Single Page Application)
- **TypeScript** for type safety
- **Zustand** for state management
- **React Router** for navigation
- **Tailwind CSS** for styling
- Supports both **Web** and **Browser Extension** modes
- Integrates with **TON Connect** for dApp connections

---

## Project Structure

```
apps/demo-wallet/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── AppRouter.tsx    # Main routing configuration
│   │   ├── Layout.tsx       # Common page layout wrapper
│   │   ├── ProtectedRoute.tsx  # Auth guard component
│   │   ├── Button.tsx, Input.tsx, Card.tsx  # UI primitives
│   │   ├── modals/          # Modal components for requests
│   │   │   ├── ConnectRequestModal.tsx
│   │   │   ├── TransactionRequestModal.tsx
│   │   │   └── SignDataRequestModal.tsx
│   │   ├── swap/           # Swap-specific components
│   │   └── transactions/   # Transaction display components
│   │
│   ├── pages/               # Route pages
│   │   ├── SetupPassword.tsx    # First-time password setup
│   │   ├── UnlockWallet.tsx    # Password unlock screen
│   │   ├── SetupWallet.tsx      # Wallet creation/import
│   │   ├── WalletDashboard.tsx # Main wallet view
│   │   ├── SendTransaction.tsx # Send TON/Jettons
│   │   ├── Swap.tsx             # Token swap interface
│   │   ├── TransactionDetail.tsx
│   │   └── TracePage.tsx
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── useTonWallet.ts         # Wallet operations
│   │   ├── useWalletDataUpdater.ts # Auto-refresh data
│   │   ├── useFormattedJetton.ts   # Token formatting
│   │   └── usePasteHandler.ts      # Clipboard handling
│   │
│   ├── lib/                 # Platform-specific code
│   │   ├── env.ts          # Environment configuration
│   │   ├── extension.ts    # Extension messaging
│   │   └── constants.ts
│   │
│   ├── extension/           # Chrome extension code
│   │   ├── background.ts   # Service worker
│   │   ├── content.ts      # Content script
│   │   └── inject.ts       # Page injection
│   │
│   ├── utils/              # Utility functions
│   │   ├── logger.ts       # Logging utility
│   │   ├── formatters.ts   # Number/address formatters
│   │   └── ...
│   │
│   ├── App.tsx             # Root component
│   ├── main.tsx            # Entry point
│   └── storePatch.ts       # Store debugging
│
└── demo/wallet-core/       # Core wallet library (separate package)
    └── src/
        ├── providers/      # React context providers
        ├── hooks/         # Core hooks
        ├── store/         # Zustand store slices
        │   └── slices/
        │       ├── authSlice.ts
        │       ├── walletCoreSlice.ts
        │       ├── walletManagementSlice.ts
        │       ├── tonConnectSlice.ts
        │       ├── jettonsSlice.ts
        │       ├── nftsSlice.ts
        │       └── swapSlice.ts
        ├── types/         # TypeScript definitions
        └── adapters/     # Storage adapters
```

---

## Core Technologies

### React Patterns Used

1. **Context API** - For providing wallet store to all components
2. **Custom Hooks** - For encapsulating business logic
3. **Functional Components** - All components are functional with hooks
4. **StrictMode** - For development error checking

### State Management: Zustand

The app uses **Zustand** (not Redux!) for state management. It's simpler and more lightweight than Redux.

Key features:
- **Slice Pattern** - State is divided into logical slices
- **Immer Integration** - Allows mutable-style updates
- **Persistence** - State is saved to localStorage/extension storage
- **DevTools** - Integrated with Redux DevTools

### Routing: React Router

The app uses `react-router-dom` v6+ with:
- **BrowserRouter** - HTML5 history API
- **Routes/Route** - Declarative routing
- **Navigate** - Programmatic navigation
- **useNavigate** - Hook for navigation

---

## State Management (Zustand)

### The Store Architecture

The wallet state is managed by `@demo/wallet-core` using Zustand. The store is composed of **7 slices**:

```
AppState (combined from all slices)
├── AuthSlice           # Password, unlock state
├── WalletCoreSlice     # WalletKit initialization
├── WalletManagementSlice  # Wallet CRUD, balance
├── TonConnectSlice     # dApp connections, requests
├── JettonsSlice       # Jetton tokens
├── NftsSlice          # NFT collection
└── SwapSlice          # DEX swapping
```

### How It Works

1. **Store Creation** (`createWalletStore.ts`):
   - Creates Zustand store with all slices
   - Applies middleware: `persist`, `devtools`, `subscribeWithSelector`, `immer`
   - Handles migrations between versions

2. **Provider** (`WalletProvider.tsx`):
   - Wraps the app with React Context
   - All child components access store via `useWalletStore` hook

3. **Hooks** (`useWalletStore.ts`):
   - `useWalletStore(selector)` - Direct store access
   - `useAuth()`, `useWallet()`, `useTonConnect()`, etc. - Pre-configured selectors
   - Uses `useShallow` for optimal re-render performance

### State Persistence

The store persists to:
- **Web**: localStorage (key: `demo-wallet-store`)
- **Extension**: Chrome Storage API via adapter

Persisted data includes:
- Auth: password hash, settings
- WalletManagement: saved wallets, active wallet
- TonConnect: request queue, pending requests

---

## Application Flow

### First Launch Flow

```
1. User opens app
   ↓
2. App.tsx initializes WalletProvider
   ↓
3. AppRouter checks auth state
   ↓
4. No password set → /setup-password
   ↓
5. SetupPassword page
   - User creates password
   - Password hash stored in state
   - Navigate to /setup-wallet
   ↓
6. SetupWallet page
   - Create new / Import / Ledger options
   - Generate/import mnemonic
   - Wallet created and stored
   ↓
7. Navigate to /wallet (Dashboard)
```

### Returning User Flow

```
1. User opens app
   ↓
2. App loads persisted state from localStorage
   ↓
3. AppRouter checks: password set but locked
   ↓
4. Show /unlock page
   ↓
5. User enters password
   ↓
6. Password verified → isUnlocked = true
   ↓
7. Navigate to /wallet
   ↓
8. WalletDataUpdater loads jettons, NFTs, balance
```

### Wallet Dashboard Flow

```
1. Dashboard displays:
   - Wallet switcher (multiple wallets)
   - TON balance
   - Jettons list
   - NFTs list
   - Recent transactions
   - Connect to dApp section
   ↓
2. User can:
   - Send TON/Jettons
   - Swap tokens
   - View transaction details
   - Connect to dApps via TON Connect
   ↓
3. Data auto-refreshes every 30 seconds
```

---

## Data Flow

### Data Loading Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     useWalletDataUpdater                     │
│  (hook in apps/demo-wallet/src/hooks/useWalletDataUpdater) │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Address Changes                           │
│  - When wallet address changes (switch wallet)             │
│  - Triggers data reload                                    │
└──────────────────────────┬──────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
   ┌────────────┐   ┌────────────┐   ┌────────────┐
   │  update    │   │ loadUser   │   │ loadUser   │
   │  Balance   │   │  Jettons   │   │    NFTs    │
   └─────┬──────┘   └─────┬──────┘   └─────┬──────┘
         │                │                │
         ▼                ▼                ▼
   ┌────────────┐   ┌────────────┐   ┌────────────┐
   │   TON      │   │    TON    │   │    TON     │
   │  API       │   │   API     │   │   API      │
   └────────────┘   └────────────┘   └────────────┘
```

### Data Update Triggers

1. **Initial Load**: When address becomes available
2. **Wallet Switch**: When user switches between wallets
3. **Periodic Refresh**: Every 30 seconds
4. **Manual Refresh**: User clicks refresh button

### Key Data Types

- **SavedWallet**: Stored wallet metadata (address, name, type)
- **Jetton**: Token balance and metadata
- **NFT**: Collectible metadata
- **Event**: Transaction/history from TON API

---

## Request Flow

### TON Connect Request Flow

When a dApp wants to connect or send a transaction:

```
┌─────────────────────────────────────────────────────────────┐
│                    dApp Initiates Request                   │
│  (tonconnect:// URL or QR code)                             │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              WalletKit Event Listener                       │
│  (onConnectRequest / onTransactionRequest / onSignDataRequest)│
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              enqueueRequest (TonConnectSlice)              │
│  - Request added to queue                                   │
│  - Queue processes one request at a time                   │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              show[Type]Request (TonConnectSlice)           │
│  - Sets pending request state                               │
│  - Opens modal                                             │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Request Modal Displays                         │
│  - ConnectRequestModal                                      │
│  - TransactionRequestModal                                  │
│  - SignDataRequestModal                                     │
└──────────────────────────┬──────────────────────────────────┘
                           │
            ┌──────────────┴──────────────┐
            ▼                             ▼
   ┌─────────────────┐         ┌─────────────────┐
   │   User Approves │         │  User Rejects   │
   └────────┬────────┘         └────────┬────────┘
            │                           │
            ▼                           ▼
   ┌─────────────────┐         ┌─────────────────┐
   │ approveRequest  │         │ rejectRequest   │
   └────────┬────────┘         └────────┬────────┘
            │                           │
            ▼                           ▼
   ┌─────────────────┐         ┌─────────────────┐
   │ WalletKit signs │         │ WalletKit       │
   │ & sends txn    │         │ rejects         │
   └────────┬────────┘         └────────┬────────┘
            │                           │
            └─────────────┬─────────────┘
                          ▼
            ┌─────────────────────────────┐
            │ clearCurrentRequestFromQueue│
            │ processNextRequest()       │
            └─────────────────────────────┘
```

### Transaction Flow

```
┌─────────────────────────────────────────────────────────────┐
│              User Fills Send Form                          │
│  - Recipient address                                        │
│  - Amount (TON or Jetton)                                   │
│  - Token selection                                          │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              handleSend (SendTransaction.tsx)              │
│  - Validates address                                        │
│  - Validates balance                                        │
│  - Creates transfer transaction                              │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              walletKit.handleNewTransaction                │
│  - Shows transaction preview modal                          │
│  - User confirms                                            │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Transaction Sent to Network                    │
│  - Via TON API                                              │
│  - Returns confirmation                                      │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Navigate to Dashboard                          │
│  - Show success message                                     │
│  - Balance refreshes automatically                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Components

### AppRouter (`components/AppRouter.tsx`)

The main router that handles:
- Authentication state checking
- Route guards (protected vs public)
- Initial route determination
- Error handling (initialization errors)

**Key Logic:**
```typescript
const getInitialRoute = () => {
    if (!isPasswordSet) return '/setup-password';
    if (!isUnlocked) return '/unlock';
    if (!hasWallet) return '/setup-wallet';
    return '/wallet';
};
```

### ProtectedRoute (`components/ProtectedRoute.tsx`)

A wrapper component that:
- Checks if user is authenticated
- Checks if wallet exists (optional)
- Redirects to appropriate page if not
- Renders children if authorized

### Layout (`components/Layout.tsx`)

Common page wrapper with:
- Header with title
- Settings/logout button
- Main content area
- Responsive width constraints

### Modal Components

**ConnectRequestModal** (`components/ConnectRequestModal.tsx`)
- Shows dApp info requesting connection
- Lists available wallets
- Approve/Reject buttons

**TransactionRequestModal** (`components/TransactionRequestModal.tsx`)
- Shows transaction preview
- Displays recipient, amount, fees
- Approve/Reject buttons

**SignDataRequestModal** (`components/SignDataRequestModal.tsx`)
- Shows data to sign
- Approve/Reject buttons

---

## Key Hooks

### useTonWallet (`hooks/useTonWallet.ts`)

Main wallet operations hook:
- `createNewWallet()` - Generate new mnemonic
- `importWallet()` - Import existing mnemonic
- `createLedgerWallet()` - Connect Ledger device

### useWalletDataUpdater (`hooks/useWalletDataUpdater.ts`)

Automatically refreshes:
- Balance
- Jettons
- NFTs

Triggers on:
- Address change
- Every 30 seconds

### useWallet (`@demo/wallet-core`)

Wallet state and actions:
- `balance`, `address`, `publicKey`
- `createWallet()`, `importWallet()`
- `switchWallet()`, `removeWallet()`
- `updateBalance()`, `loadEvents()`

### useAuth (`@demo/wallet-core`)

Authentication state:
- `isPasswordSet`, `isUnlocked`
- `setPassword()`, `unlock()`, `lock()`
- `reset()`

### useTonConnect (`@demo/wallet-core`)

TON Connect operations:
- `handleTonConnectUrl()` - Process connection URL
- `approveConnectRequest()`, `rejectConnectRequest()`
- `pendingConnectRequest` - Current pending request

### useJettons (`@demo/wallet-core`)

Jetton token operations:
- `userJettons` - User's token balances
- `loadUserJettons()`, `refreshJettons()`
- `formatJettonAmount()`

---

## Pages Overview

### SetupPassword (`pages/SetupPassword.tsx`)

- **Purpose**: First-time password creation
- **Flow**: Validate → Hash password → Store → Navigate to setup
- **Key Fields**: password, confirmPassword

### UnlockWallet (`pages/UnlockWallet.tsx`)

- **Purpose**: Authenticate returning user
- **Flow**: Enter password → Verify → Unlock wallet → Navigate to dashboard
- **Key Fields**: password
- **Also Shows**: Reset wallet option

### SetupWallet (`pages/SetupWallet.tsx`)

- **Purpose**: Create or import wallet
- **Tabs**:
  - **New**: Generate new mnemonic
  - **Import**: Enter existing 12/24 word phrase
  - **Ledger**: Connect hardware wallet
- **Network Selection**: mainnet / testnet

### WalletDashboard (`pages/WalletDashboard.tsx`)

- **Main hub** after login
- **Shows**:
  - Wallet switcher (multiple wallets)
  - TON balance with refresh
  - Jettons card (token list)
  - NFTs card
  - Recent transactions
  - Connect to dApp section
- **Actions**: Send, Swap, settings

### SendTransaction (`pages/SendTransaction.tsx`)

- **Purpose**: Send TON or Jettons
- **Features**:
  - Token selector (TON + Jettons)
  - Address input (manual or QR)
  - Amount input with "Use Max"
  - Transaction preview
  - QR code scanner
- **Validation**: Address format, balance check

### Swap (`pages/Swap.tsx`)

- **Purpose**: DEX token swapping
- **Features**:
  - Token selectors (from/to)
  - Amount input
  - Quote fetching (price)
  - Slip impactpage settings
  - Execute swap

---

## Extension Support

The app supports running as a **Chrome Extension**:

### How It Works

1. **Detection**: `isExtension()` checks `chrome.runtime?.id`
2. **Storage**: Uses `ExtensionStorageAdapter` instead of localStorage
3. **Communication**: Uses `webext-bridge` for popup ↔ background messaging

### Key Files

- `lib/extension.ts` - Message sending utilities
- `lib/extensionPopup.ts` - Popup-specific code
- `lib/extensionBackground.ts` - Background script utilities
- `extension/background.ts` - Service worker
- `extension/content.ts` - Content script

### Extension Modes

1. **Popup**: Small window for quick actions
2. **Full Page**: Full wallet interface in tab

---

## How to Modify the App

### Adding a New Page

1. **Create the page component** in `src/pages/`:
   ```typescript
   // src/pages/MyNewPage.tsx
   import { Layout } from '../components';
   
   export const MyNewPage: React.FC = () => {
       return (
           <Layout title="My New Page">
               <div>Content here</div>
           </Layout>
       );
   };
   ```

2. **Export from pages index** (`src/pages/index.ts`):
   ```typescript
   export { MyNewPage } from './MyNewPage';
   ```

3. **Add route** in `AppRouter.tsx`:
   ```typescript
   <Route 
       path="/my-new-page" 
       element={
           <ProtectedRoute requiresWallet>
               <MyNewPage />
           </ProtectedRoute>
       } 
   />
   ```

### Adding State (New Slice)

If you need to add new global state:

1. **Create slice** in `demo/wallet-core/src/store/slices/`:
   ```typescript
   // mySlice.ts
   export const createMySlice = (set, get) => ({
       myState: { value: '' },
       setValue: (value) => set(state => { state.myState.value = value; }),
   });
   ```

2. **Add to store** in `createWalletStore.ts`:
   ```typescript
   import { createMySlice } from './slices/mySlice';
   
   // In the store creation:
   ...createMySlice(...a),
   ```

3. **Export type** in `types/store.ts`:
   ```typescript
   export interface MySlice {
       myState: { value: string };
       setValue: (value: string) => void;
   }
   ```

4. **Create hook** in `hooks/useWalletStore.ts`:
   ```typescript
   export const useMyState = () => {
       return useWalletStore(useShallow(state => ({
           value: state.myState.value,
           setValue: state.setValue,
       })));
   };
   ```

### Modifying Wallet Operations

**To change wallet creation**:
- See `walletManagementSlice.ts` → `createWallet()` function
- Modify mnemonic generation or encryption

**To change transaction flow**:
- See `SendTransaction.tsx` → `handleSend()` function
- Modify validation or transaction creation

### Adding New Token Support

1. Jettons are fetched automatically from TON API
2. To add custom tokens, modify `jettonsSlice.ts` → `loadUserJettons()`

### Modifying TON Connect

**To change request handling**:
- See `tonConnectSlice.ts`
- Functions: `approveConnectRequest()`, `approveTransactionRequest()`, etc.

**To add new request types**:
- Add event listener in `setupTonConnectListeners()`
- Add queue handling in `processNextRequest()`

---

## Summary

The demo-wallet follows these key patterns:

1. **Provider Pattern**: `WalletProvider` wraps the app
2. **Slice Pattern**: Zustand store divided by feature
3. **Hook Pattern**: Custom hooks encapsulate logic
4. **Component Pattern**: Presentational + Container components
5. **Route Guards**: Protected routes check auth state

**Data flows**: User Action → Hook → Slice → Zustand Store → Persistence

**Request flow**: dApp → WalletKit Event → Queue → Modal → User Decision → WalletKit Action

For any modifications, start by finding the relevant slice in `demo/wallet-core/src/store/slices/` or the relevant page in `apps/demo-wallet/src/pages/`.
