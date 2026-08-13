# Analysis Report: Contract Wrappers Inspection & Integration Strategy

**Agent**: `teamwork_preview_explorer_m1_1` (Explorer 1 for Milestone 1: Infrastructure & Contracts)  
**Date**: 2026-08-12  
**Target Worktree**: `/home/zeta/.gemini/antigravity/worktrees/kit/implement_jetton_wallet_features`

---

## 1. Executive Summary

This report documents the read-only inspection of the 9 TypeScript contract wrapper files located in `/home/zeta/jetton/wrappers-ts/`, verifies their internal dependencies, inspects the target directory `apps/demo-wallet/src/contracts/brotherhood/`, and provides step-by-step recommendations for cleanly integrating these wrappers into `apps/demo-wallet`.

---

## 2. Source Directory Inspection (`/home/zeta/jetton/wrappers-ts/`)

All 9 specified `.gen.ts` wrapper files exist in `/home/zeta/jetton/wrappers-ts/` and are fully intact.

| File Name | File Size (Bytes) | Primary Exported Class | Role / Contract Scope |
| :--- | :--- | :--- | :--- |
| `PersonalWallet.gen.ts` | 35,986 | `PersonalWallet` | Jetton wallet contract for personal token holders |
| `Personal.gen.ts` | 41,840 | `Personal` | Jetton master contract for personal jetton issuers |
| `FossFiWallet.gen.ts` | 134,283 | `FossFiWallet` | Member FI wallet contract (core account interactions) |
| `FossFi.gen.ts` | 76,275 | `FossFi` | FossFi Jetton master / protocol root contract |
| `Dao.gen.ts` | 30,755 | `Dao` | Governance DAO contract (proposals & voting master) |
| `DaoVoter.gen.ts` | 13,308 | `DaoVoter` | Voter account contract for DAO governance |
| `Lottery.gen.ts` | 19,853 | `Lottery` | Game contract for community lottery draws |
| `CityMap.gen.ts` | 19,999 | `CityMap` | City registry and member mapping contract |
| `Location.gen.ts` | 25,709 | `Location` | Global location and city registry contract |

---

## 3. Dependency & Internal Import Audit

Every single one of the 9 wrapper files was audited for external and internal imports.

### Audit Findings:
- **`@ton/core` Dependency**: All 9 files strictly import from `@ton/core` on lines 5 and 6:
  ```ts
  import * as c from '@ton/core';
  import { beginCell, ContractProvider, Sender, SendMode } from '@ton/core';
  ```
- **No Relative / Internal Imports**: None of the 9 `.gen.ts` files import relative modules (e.g. `./` or `../`).
- **No External Crypto / Ton Client Imports**: None of the 9 `.gen.ts` files import `@ton/crypto` or `@ton/ton`.
- **Self-Contained Serializers & Types**: All message cell serializers, stack parsers, struct definitions, and opcode constants are entirely self-contained within each respective `.gen.ts` file.

---

## 4. Target Directory Inspection (`apps/demo-wallet/src/contracts/brotherhood/`)

- **Path**: `/home/zeta/.gemini/antigravity/worktrees/kit/implement_jetton_wallet_features/apps/demo-wallet/src/contracts/brotherhood/`
- **Current Status**: **Does not exist**. Currently, `apps/demo-wallet/src/` contains `core/`, `extension/`, and `features/`, but no `contracts/` folder.
- **`package.json` Status**: `@ton/core` is already declared in `apps/demo-wallet/package.json` (`"@ton/core": "catalog:"`).

---

## 5. Concrete Step-by-Step Migration Recommendations

To copy and expose these wrapper files cleanly within `apps/demo-wallet`, follow these steps:

### Step 1: Create Target Directory Structure
Execute directory creation for the new contract location:
```bash
mkdir -p /home/zeta/.gemini/antigravity/worktrees/kit/implement_jetton_wallet_features/apps/demo-wallet/src/contracts/brotherhood
```

### Step 2: Copy All 9 Wrapper Files (Non-Symlink Copy)
Copy all 9 `.gen.ts` files from `/home/zeta/jetton/wrappers-ts/` into `apps/demo-wallet/src/contracts/brotherhood/`:
```bash
cp /home/zeta/jetton/wrappers-ts/*.gen.ts \
   /home/zeta/.gemini/antigravity/worktrees/kit/implement_jetton_wallet_features/apps/demo-wallet/src/contracts/brotherhood/
```

### Step 3: Create Barrel Export File (`index.ts`)
Create `apps/demo-wallet/src/contracts/brotherhood/index.ts` to provide clean module re-exports for feature modules and lib utilities:
```ts
export * from './PersonalWallet.gen';
export * from './Personal.gen';
export * from './FossFiWallet.gen';
export * from './FossFi.gen';
export * from './Dao.gen';
export * from './DaoVoter.gen';
export * from './Lottery.gen';
export * from './CityMap.gen';
export * from './Location.gen';
```

### Step 4: Validate Package Imports
No code modifications inside the copied `.gen.ts` files are needed because `@ton/core` is already installed in `apps/demo-wallet/package.json`.

---

## 6. Verification Plan

1. **File Presence Verification**:
   Confirm all 9 `.gen.ts` files and `index.ts` exist in `apps/demo-wallet/src/contracts/brotherhood/`.
2. **Type Safety Check**:
   Run `pnpm --filter demo-wallet typecheck` from the monorepo root to confirm clean TypeScript compilation.
