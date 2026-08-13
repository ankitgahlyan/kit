# Analysis Report: Source Lib Utilities & Import Migration Strategy

## Overview

This report presents a thorough analysis of the source library utilities located in `/home/zeta/jetton/src/lib/` (`deploy.ts`, `ton.ts`, `queries.ts`, `jettonContent.ts`) and defines the exact import modifications, path resolutions, and package dependency requirements needed for migrating these files to `apps/demo-wallet/src/lib/brotherhood/`.

---

## 1. Inspection of Source Lib Utilities

The `/home/zeta/jetton/src/lib/` directory contains 13 TypeScript source files. The key files analyzed for migration are:

### Primary Requested Lib Utilities

1. **`deploy.ts` (324 lines)**
   - **Purpose**: Construction of TVM payload cells and deployment state-inits for all contract transactions.
   - **Exported Functions**:
     - `parseUnits(amount: string, decimals: number): bigint`
     - `buildDeployMessage(params)`
     - `buildMintBody(params)`
     - `buildChangeAdminBody(newAdmin, queryId)`
     - `buildChangeContentBody(metadata, queryId)`
     - `buildPersonalMinterDeploy(params)`
     - `buildPointPersonalMinterBody(params)`
     - `buildBurnBody(amount, responseAddress, queryId)`
     - `buildTransferBody(params)`
     - `buildInviteBody(params)`
     - `buildBuyCreditBody(params)`
     - `buildVoteBody(params)`
     - `buildUnvoteBody(params)`
     - `buildDestroyBody()`
     - `buildTopUpTonsBody()`
     - `buildApproveUpgradeBody()`
     - `buildRejectUpgradeBody()`
     - `buildSetAllowanceBody(params)`
     - `buildSpendAllowanceBody(params)`

2. **`jettonContent.ts` (156 lines)**
   - **Purpose**: On-chain metadata dictionary and TVM snake-cell construction (`buildOnchainMetadata` and `buildTolkOnchainMetadata`).
   - **Exported Interfaces/Functions**:
     - `JettonMetadata` interface (`name`, `symbol`, `decimals`, `description?`, `image?`, `imageData?`)
     - `buildOnchainMetadata(metadata: JettonMetadata): Promise<Cell>`
     - `buildTolkOnchainMetadata(metadata: JettonMetadata): Promise<Cell>`

3. **`ton.ts` (284 lines)**
   - **Purpose**: `TonClient` instance management, address calculation, Toncenter API fetching, and contract getter queries.
   - **Exported Functions/Interfaces**:
     - `queryClient`: TanStack Query Client instance
     - `getTonClient(network: Network): TonClient`
     - `getWalletAddress(ownerAddress: Address): Promise<Address>`
     - `fetchJettonMaster(): Promise<JettonMasterInfo>`
     - `fetchWalletBalance(ownerAddress: Address): Promise<bigint>`
     - `getFiWalletState(owner: Address)`
     - `listAllowances(state): AllowanceEntry[]`
     - `getCircle(invitedList: Address[])`
     - `getPersonalMinterForIssuer(issuerOwner: Address): Promise<Address | null>`
     - `getPersonalWalletAddress(personalMinter: Address, owner: Address): Promise<Address>`
     - `getPersonalWalletBalance(personalMinter: Address, owner: Address): Promise<bigint>`

4. **`queries.ts` (148 lines)**
   - **Purpose**: TanStack React Query hooks providing cached read-state for UI features, backed by an IndexedDB fallback cache layer.
   - **Exported Hooks**:
     - `useJettonMaster(enabled?)`
     - `useFiWalletState(ownerAddress)`
     - `useWalletBalance(ownerAddress)`
     - `useCircle(invitedList)`
     - `usePersonalMinterForIssuer(ownerAddress)`
     - `usePersonalWalletAddress(personalMinter, ownerAddress)`
     - `usePersonalWalletBalance(personalMinter, ownerAddress)`
     - `useRefreshContractQueries()`

### Essential Helper Files to Copy Along

5. **`config.ts` (7 lines)**
   - Defines `FI_ADDRESS` (`kQCPnceJsnacJr4XNVq52TC5Sw4E1MirqWCMdd82KJJNenoOT`), `ZERO_ADDRESS`, and `Network` type (`'mainnet' | 'testnet'`).
   - **Required by**: `ton.ts`.

6. **`contract-cache.ts` (206 lines)**
   - Implements IndexedDB persistence (`brotherhood_contract_db`) with custom replacer/reviver for `Address`, `bigint`, `Map`, and `Dictionary`.
   - **Required by**: `queries.ts` (`import { setContractCache, getContractCache } from './contract-cache';`).

7. **`errors.ts` (24 lines)**
   - Implements `getErrorMessage(error)` and `isCancelledTransactionError(error)`.
   - **Required for**: Error parsing in transaction hooks.

---

## 2. Path Alias & Module Resolution Analysis

### Configurations Inspected
- `apps/demo-wallet/tsconfig.json`
- `apps/demo-wallet/tsconfig.app.json`
- `apps/demo-wallet/vite.config.ts`

### Path Resolution Summary

| Configuration | Setting | Mapped Target |
|---|---|---|
| `tsconfig.app.json` | `"paths": { "@/*": ["./src/*"] }` | Alias `@/` maps to `apps/demo-wallet/src/` |
| `vite.config.ts` | `resolve.alias: { '@': path.resolve(__dirname, './src') }` | Alias `@/` maps to `apps/demo-wallet/src/` |

### Derived Path Conventions
1. **Contract Wrappers**: Placed in `apps/demo-wallet/src/contracts/brotherhood/`
   - Import path: `@/contracts/brotherhood/<wrapper>` (e.g. `@/contracts/brotherhood/FossFiWallet.gen`)
2. **Lib Utilities**: Placed in `apps/demo-wallet/src/lib/brotherhood/`
   - Sibling import path: `./<util>` or `@/lib/brotherhood/<util>` (e.g. `@/lib/brotherhood/jettonContent`)

---

## 3. Package Dependencies Verification

### Inspected `apps/demo-wallet/package.json`

| Dependency | Status in `demo-wallet` | Resolution Required |
|---|---|---|
| `@ton/core` | ✅ Present (`catalog:`) | None (`@ton/core` is already installed) |
| `@ton/crypto` | ✅ Present (`catalog:`) | None (`@ton/crypto` is already installed) |
| `buffer` | ✅ Present (`catalog:`) | None (`buffer` is already installed) |
| `@ton/ton` | ❌ **Missing** | Must add `"@ton/ton": "^16.3.0"` to `dependencies` |
| `@tanstack/react-query` | ❌ **Missing** | Must add `"@tanstack/react-query": "catalog:"` to `dependencies` |

> Note: `@tanstack/react-query` is already defined in `pnpm-workspace.yaml` catalog (`^5.101.0`), so using `"catalog:"` in `apps/demo-wallet/package.json` is standard and valid.

---

## 4. Exact Import Modification Mapping

When copying files to `apps/demo-wallet/src/lib/brotherhood/`, update imports as follows:

### A. `deploy.ts` (`apps/demo-wallet/src/lib/brotherhood/deploy.ts`)

```typescript
// Original
import { FossFi, ... } from '@wrappers/FossFi.gen';
import { AskToBurn, ... } from '@wrappers/FossFiWallet.gen';
import { PersonalMinter } from '@wrappers/Personal.gen';
import { PersonalWallet } from '@wrappers/PersonalWallet.gen';
import { buildOnchainMetadata, buildTolkOnchainMetadata, type JettonMetadata } from './jettonContent';

// Modified Target
import { FossFi, ... } from '@/contracts/brotherhood/FossFi.gen';
import { AskToBurn, ... } from '@/contracts/brotherhood/FossFiWallet.gen';
import { PersonalMinter } from '@/contracts/brotherhood/Personal.gen';
import { PersonalWallet } from '@/contracts/brotherhood/PersonalWallet.gen';
import { buildOnchainMetadata, buildTolkOnchainMetadata, type JettonMetadata } from './jettonContent';
```

### B. `jettonContent.ts` (`apps/demo-wallet/src/lib/brotherhood/jettonContent.ts`)

```typescript
// Original & Modified (Unchanged)
import { beginCell, Cell, Dictionary, type Builder, type Slice } from '@ton/core';
```

### C. `ton.ts` (`apps/demo-wallet/src/lib/brotherhood/ton.ts`)

```typescript
// Original
import { TonClient } from '@ton/ton';
import { Address, beginCell } from '@ton/core';
import { QueryClient } from '@tanstack/react-query';
import { FI_ADDRESS, network, type Network } from '@/lib/config';
import { FossFiWallet } from '@wrappers/FossFiWallet.gen';
import { PersonalMinter } from '@wrappers/Personal.gen';
import { PersonalWallet } from '@wrappers/PersonalWallet.gen';

// Modified Target
import { TonClient } from '@ton/ton';
import { Address, beginCell } from '@ton/core';
import { QueryClient } from '@tanstack/react-query';
import { FI_ADDRESS, defaultNetwork as network, type Network } from './config';
import { FossFiWallet } from '@/contracts/brotherhood/FossFiWallet.gen';
import { PersonalMinter } from '@/contracts/brotherhood/Personal.gen';
import { PersonalWallet } from '@/contracts/brotherhood/PersonalWallet.gen';
```

*Note on Network support*: In addition to import path changes, function signatures in `ton.ts` should accept an optional `network: Network = 'testnet'` argument (or read active wallet network from `@demo/wallet-core`) to satisfy Requirement R3.

### D. `queries.ts` (`apps/demo-wallet/src/lib/brotherhood/queries.ts`)

```typescript
// Original
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { type Address } from '@ton/core';
import { fetchJettonMaster, ... } from './ton';
import { setContractCache, getContractCache } from './contract-cache';

// Modified Target (Imports unchanged, but requires config.ts and contract-cache.ts to exist as siblings)
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { type Address } from '@ton/core';
import { fetchJettonMaster, ... } from './ton';
import { setContractCache, getContractCache } from './contract-cache';
```

---

## 5. Verification Checklist

1. [x] Inspected source lib utilities in `/home/zeta/jetton/src/lib/`
2. [x] Checked all imports across contract wrappers, lib utilities, and external packages
3. [x] Verified `apps/demo-wallet/tsconfig.json`, `tsconfig.app.json`, and `vite.config.ts` path alias `@/`
4. [x] Mapped exact import path updates for `apps/demo-wallet/src/lib/brotherhood/`
5. [x] Identified missing dependencies (`@ton/ton` and `@tanstack/react-query`) and required helper files (`config.ts`, `contract-cache.ts`, `errors.ts`)
