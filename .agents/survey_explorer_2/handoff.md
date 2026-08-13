# Architectural Investigation Handoff Report: `apps/demo-wallet`

## 1. Observation

Direct observations from examining the codebase at `/home/zeta/.gemini/antigravity/worktrees/kit/implement_jetton_wallet_features/apps/demo-wallet/`:

### 1.1 Existing Feature Modules (`apps/demo-wallet/src/features/`)
- **`features/send/`**:
  - Main screen: `components/send-transaction/send-transaction.tsx` lines 32–240.
  - Write hook: `hooks/use-send-token.ts` lines 49–112. Returns `{ send, isDisabled, gasless }`.
  - Subcomponents: `TokenSelectButton`, `TokenSelectModal`, `AmountField`, `RecipientField`, `GaslessOptions`.
  - Barrel export: `index.ts` re-exports all components, hooks, and types.
- **`features/staking/`**:
  - Main screen: `components/staking-screen/staking-screen.tsx` lines 19–36.
  - Subcomponents: `StakingInterface`, `StakingInfo`, `StakingSettings`.
  - Data loading hook: `hooks/use-staking-providers.ts`.
  - Barrel export: `index.ts` re-exports components and hooks.
- **`features/swap/`**:
  - Main screen: `components/swap-screen/swap-screen.tsx` lines 20–36.
  - Subcomponents: `SwapInterface`, `SwapSettings`, `SwapField`, `SwapInfo`, `QuoteTimer`.
  - Constants: `constants/swap.ts`.
  - Barrel export: `index.ts` re-exports components, hooks, and constants.
- **`features/dashboard/`**:
  - Main screen: `components/wallet-dashboard/wallet-dashboard.tsx` lines 34–98.
  - Navigation actions: `components/dashboard-actions/dashboard-actions.tsx` lines 16–41. Renders `DashboardActionButton` for Send (`/send`), Swap (`/swap`), Stake (`/staking`).
  - Modal integrations: `ConnectRequestModal`, `TransactionRequestModal`, `SignDataRequestModal`, `SignMessageRequestModal`.

### 1.2 Router Structure (`apps/demo-wallet/src/core/routing/app-router.tsx`)
- AppRouter uses `react-router-dom` (`BrowserRouter`, `Routes`, `Route`, `Navigate`).
- Initial route resolution logic (`getInitialRoute()`, lines 41–46):
  ```tsx
  if (!isPasswordSet) return '/welcome';
  if (!isUnlocked) return '/unlock';
  if (!hasWallet) return '/welcome';
  return '/wallet';
  ```
- Public routes: `/welcome`, `/setup-password`, `/unlock`.
- Protected routes (authenticated): `/create-wallet`, `/import-wallet`, `/ledger` wrapped in `<ProtectedRoute>`.
- Protected routes requiring wallet (lines 118–181): `/wallet`, `/wallet/assets`, `/wallet/nft`, `/wallet/history`, `/send`, `/swap`, `/staking`, `/ton-connect` wrapped in `<ProtectedRoute requiresWallet>`.

### 1.3 Wallet Store and Network Settings (`demo/wallet-core/src/hooks/useWalletStore.ts`)
- Store implementation: Powered by Zustand context (`useWalletStore`, `useWallet`, `useWalletKit`, `useAuth`).
- Active wallet & address access:
  ```ts
  const { currentWallet, address, savedWallets, activeWalletId, getActiveWallet } = useWallet();
  ```
- Active network resolution:
  ```ts
  const network = savedWallets.find((w) => w.id === activeWalletId)?.network ?? 'testnet';
  // or getActiveWallet()?.network
  ```
- Network types: `'mainnet' | 'testnet' | 'tetra'`. Network selection persists per wallet entry in `savedWallets`.

### 1.4 Write Operation Handling Pattern (`walletKit.handleNewTransaction(wallet, tx)`)
- Execution mechanism in `features/send/hooks/use-send-token.ts` lines 81–99 and `demo/wallet-core/src/store/slices/stakingSlice.ts` line 155:
  ```ts
  const walletKit = useWalletKit();
  const { currentWallet } = useWallet();

  const tx: TransactionRequest = {
      messages: [
          {
              address: targetContractAddress,
              amount: value.toString(), // TokenAmount in nanos as string
              payload: bodyCell ? bodyCell.toBoc().toString('base64') : undefined,
              stateInit: stateInitCell ? stateInitCell.toBoc().toString('base64') : undefined,
          },
      ],
  };

  await walletKit.handleNewTransaction(currentWallet, tx);
  ```
- Flow: `walletKit.handleNewTransaction` feeds `tx` into WalletKit's transaction queue (`onTransactionRequest` event).
- UI modal trigger: `WalletDashboard` (and root state) listens to `pendingTransactionRequest` and displays `TransactionRequestModal` (`data-testid="transaction-request"`). User approval (`data-testid="send-transaction-approve"`) signs and broadcasts the transaction.

### 1.5 UI Layout, Styling Conventions, Toast/Modal System, Component Library
- **Layout**: `NewLayout` (`src/core/components/shared/new-layout/new-layout.tsx`) wrapping content in a mobile-centered container (`max-w-md mx-auto min-h-screen bg-white select-none px-4 pb-6`).
- **Header**: `ScreenHeader` (`src/core/components/shared/screen-header/screen-header.tsx`) with title and optional back handler (`onBack={() => navigate('/wallet')}`).
- **Toast notification**: `sonner` library (`import { toast } from 'sonner'`). Used for inline success toasts (`toast.success(...)`) and error feedback (`toast.error(...)`).
- **Modal System**: Radix UI dialog (`@radix-ui/react-dialog`), Vaul drawer (`vaul`), custom `Dialog`, `Drawer`, and `Modal` (`src/core/components/ui/modal/modal.tsx`).
- **Component Library**: Tailwind CSS v4 + shadcn UI configuration (`components.json` with `new-york` style).
- **Core UI Components** (`src/core/components/ui/`):
  - `Button`: Supports `variant` (`primary`, `secondary`, `gray`, `danger`, `ghost`), `size` (`lg`, `md`, `sm`, `icon`), `fullWidth`, `loading`, `disabled`, and `icon`.
  - `Input`: Composable pattern (`Input.Container`, `Input.Header`, `Input.Title`, `Input.Field`, `Input.Slot`, `Input.Input`, `Input.Caption`).
  - `Card`: Container with `title`, `compact`, and custom `className`.
  - `Select`, `Segmented`, `Modal`, `Dialog`, `Drawer`, `Popover`, `LoaderCircle`, `Icons`.
- **Testability**: Interactive inputs and buttons specify `data-testid` attributes (e.g. `send-submit`, `use-my-address`, `send-transaction-approve`, `wallet-menu`).

### 1.6 Monorepo Dependencies (`package.json`) & Contracts Integration
- **`pnpm-workspace.yaml`**: Includes catalog entries for `@ton/core` (`^0.63.1`), `@ton/crypto` (`^3.3.0`), and `@tanstack/react-query` (`^5.101.0`).
- **`apps/demo-wallet/package.json`**:
  - Currently includes `@ton/core`: `"catalog:"`, `@ton/crypto`: `"catalog:"`.
  - Needs `@ton/ton`: `"^16.3.0"` and `@tanstack/react-query`: `"catalog:"` added under `dependencies`.
- **`apps/demo-wallet/tsconfig.app.json`**:
  - `"baseUrl": "."` and `"paths": { "@/*": ["./src/*"] }`.
- **Target Copy Directories for BrotherHood Integration**:
  - Wrappers: Copy 9 `.gen.ts` files from `/home/zeta/jetton/wrappers-ts/` to `apps/demo-wallet/src/contracts/brotherhood/`.
  - Lib Utilities: Copy `deploy.ts`, `ton.ts`, `queries.ts`, `jettonContent.ts` from `/home/zeta/jetton/src/lib/` to `apps/demo-wallet/src/lib/brotherhood/`.

---

## 2. Logic Chain

1. **Feature Module Architecture**:
   - Observation: All feature areas (`send`, `staking`, `swap`) isolate hooks under `hooks/`, screens under `components/`, and export public APIs via `index.ts`.
   - Deduction: New BrotherHood feature modules (`features/brotherhood/`, `features/personal-jetton/`, `features/dao/`, `features/lottery/`, `features/city-network/`) should mirror this exact directory structure, keeping custom hooks in `hooks/` and UI screens in `components/` with barrel exports.

2. **Routing Integration**:
   - Observation: Routes in `AppRouter` are organized with `<ProtectedRoute requiresWallet>` wrappers. `WalletDashboard` contains `DashboardActions` navigating to `/send`, `/swap`, `/staking`.
   - Deduction: All new feature routes must be declared in `AppRouter` under `<ProtectedRoute requiresWallet>` and linked from the wallet dashboard (or dedicated navigation tiles in `DashboardActions`).

3. **Wallet & Network Context**:
   - Observation: Active wallet and network state are managed centrally via `@demo/wallet-core` Zustand store (`useWallet`). `savedWallets.find(w => w.id === activeWalletId)?.network` provides the active network (`mainnet`, `testnet`, or `tetra`).
   - Deduction: `src/lib/brotherhood/ton.ts` read utilities should query `TonClient` configured for the active network obtained via `useWallet`.

4. **Write Operations via WalletKit**:
   - Observation: `useSendToken` builds custom transactions as `TransactionRequest` messages (address, amount in nanos, Base64 payload, optional Base64 stateInit) and invokes `await walletKit.handleNewTransaction(currentWallet, tx)`.
   - Deduction: Every `send*` method from BrotherHood wrappers (`sendAskToTransfer`, `sendActClaimWeeklyGrant`, `sendActInvite`, `sendMintNewJettons`, `sendActSubmitProposal`, `sendActJoinLottery`, etc.) can be converted to a `TransactionRequest` payload and passed directly to `walletKit.handleNewTransaction(wallet, tx)`. This invokes the built-in `TransactionRequestModal` confirmation flow.

5. **UI & Styling Consistency**:
   - Observation: Screens use `NewLayout` with `ScreenHeader` for navigation, `Button` and `Input` from `@/core/components/ui/`, `sonner` for toasts, and `data-testid` attributes for E2E selector stability.
   - Deduction: All new BrotherHood components must adopt `NewLayout` + `ScreenHeader`, consume UI controls from `@/core/components/ui/`, notify users with `sonner` toasts, and attach explicit `data-testid="<feature>-<element>"` properties for Playwright tests.

6. **Dependency & Module Imports**:
   - Observation: Contract wrappers rely on `@ton/core`, while on-chain client queries in `src/lib/brotherhood/ton.ts` require `@ton/ton` and `@tanstack/react-query`. Path alias `@/*` maps to `./src/*`.
   - Deduction: Adding `@ton/ton` and `@tanstack/react-query` to `apps/demo-wallet/package.json` ensures full compatibility when copying wrappers to `@/contracts/brotherhood/` and utilities to `@/lib/brotherhood/`.

---

## 3. Caveats

- **No Code Modifications Performed**: This investigation was strictly read-only per agent instructions. No files in `apps/demo-wallet/src/` or `package.json` were created or modified during this survey step.
- **Gasless Transfer Scope**: The existing `features/send` has a gasless jetton transfer pathway (`useGaslessJettonSend`). BrotherHood contract transactions require standard TON fee payments via `walletKit.handleNewTransaction(wallet, tx)`.
- **Testnet API Keys**: Client queries using `TonClient` rely on public TON RPC endpoints or API keys; testnet network environment variables must be handled gracefully if API keys are undefined.

---

## 4. Conclusion

The `apps/demo-wallet` codebase architecture is well-structured, modular, and fully prepared to host the BrotherHood contract features. The implementation plan for subsequent implementation agents is straightforward:
1. Copy contract wrappers into `apps/demo-wallet/src/contracts/brotherhood/` and adapt lib utilities in `apps/demo-wallet/src/lib/brotherhood/`.
2. Add `@ton/ton` and `@tanstack/react-query` to `apps/demo-wallet/package.json`.
3. Create feature modules in `apps/demo-wallet/src/features/` (`brotherhood/`, `personal-jetton/`, `dao/`, `lottery/`, `city-network/`).
4. Implement hooks using `walletKit.handleNewTransaction(wallet, tx)` for writes and TanStack React Query (`useQuery`) for reads.
5. Add routes to `AppRouter` wrapped in `<ProtectedRoute requiresWallet>` and navigation entries to `WalletDashboard`.
6. Implement E2E tests in `apps/demo-wallet/e2e/` extending `DemoWallet.ts`.

---

## 5. Verification Method

To verify the findings and overall codebase health after reading this report:
1. **Directory Inspection**:
   - Verify existing feature layout: `ls apps/demo-wallet/src/features/{send,staking,swap,dashboard}`
   - Inspect router file: `view_file apps/demo-wallet/src/core/routing/app-router.tsx`
2. **Type Checking**:
   - Run type check command across monorepo: `pnpm typecheck`
3. **Build Check**:
   - Run build command for demo-wallet: `pnpm --filter demo-wallet build`
4. **Invalidation Conditions**:
   - If `@ton/ton` or `@tanstack/react-query` imports fail, verify `apps/demo-wallet/package.json` dependencies.
   - If contract transactions do not trigger the preview modal, verify that `walletKit.handleNewTransaction(wallet, tx)` is called with valid Base64 payload and target address.
