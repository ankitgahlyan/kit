# Forensic Analysis Report — Contract Wrapper TypeScript Typecheck Fix Strategy

**Agent**: `teamwork_preview_explorer_m1_r2_1`  
**Target Project**: `apps/demo-wallet`  
**Working Directory**: `/home/zeta/.gemini/antigravity/worktrees/kit/implement_jetton_wallet_features/.agents/teamwork_preview_explorer_m1_r2_1`  
**Date**: 2026-08-12  

---

## Executive Summary

`pnpm --filter demo-wallet typecheck` currently fails with **101 TypeScript errors** across all 9 contract wrappers in `apps/demo-wallet/src/contracts/brotherhood/` due to strict compiler options in `apps/demo-wallet/tsconfig.app.json` (`verbatimModuleSyntax`, `noUnusedLocals`, `noUnusedParameters`). A precise, non-shortcut fix strategy has been formulated that resolves all 101 errors by addressing module imports, exporting top-level preamble helper functions, harmonizing helper call sites, and correctly annotating parameter usage, achieving **0 TypeScript errors** without altering Tact API contracts or runtime functionality.

---

## 1. Breakdown of TypeScript Errors

Running `pnpm --filter demo-wallet typecheck` (`tsc --noEmit -p tsconfig.app.json`) yields 101 errors across 9 `.gen.ts` files:

| File | Error Count | Main Error Categories |
| :--- | :---: | :--- |
| `CityMap.gen.ts` | 4 | Unused preamble helpers (`noUnusedLocals`) |
| `Dao.gen.ts` | 9 | `verbatimModuleSyntax`, unused helpers, helper call mismatch (`_lookupPrefix`), parameter name mismatch (`_b`, `_provider`) |
| `DaoVoter.gen.ts` | 5 | Unused preamble helpers and unused class `StackReader` |
| `FossFi.gen.ts` | 18 | `verbatimModuleSyntax`, unused helpers, call mismatch, parameter name mismatch, unused struct parameters (`self`, `body`) |
| `FossFiWallet.gen.ts` | 33 | `verbatimModuleSyntax`, unused helpers, call mismatch, parameter name mismatch, unused struct parameters (`self`, `body`) |
| `Location.gen.ts` | 4 | Unused preamble helpers (`noUnusedLocals`) |
| `Lottery.gen.ts` | 4 | `verbatimModuleSyntax`, unused preamble helpers (`noUnusedLocals`) |
| `Personal.gen.ts` | 9 | `verbatimModuleSyntax`, unused helpers, call mismatch, parameter name mismatch |
| `PersonalWallet.gen.ts` | 15 | `verbatimModuleSyntax`, unused helpers, call mismatch, parameter name mismatch |
| **Total** | **101** | Across 9 `.gen.ts` contract wrapper files |

---

## 2. Root Cause Analysis by Category

### Category A: `verbatimModuleSyntax` Violation (TS1484)
- **Root Cause**: `tsconfig.app.json` has `"verbatimModuleSyntax": true`. Lines importing types alongside values (e.g. `import { beginCell, ContractProvider, Sender, SendMode } from '@ton/core';`) trigger TS1484 because `ContractProvider` and `Sender` are type-only declarations.
- **Affected Files**: `Dao.gen.ts`, `FossFi.gen.ts`, `FossFiWallet.gen.ts`, `Lottery.gen.ts`, `Personal.gen.ts`, `PersonalWallet.gen.ts`.
- **Fix**: Update line 6 in these files to use inline type imports:
  ```ts
  import { beginCell, type ContractProvider, type Sender, SendMode } from '@ton/core';
  ```

### Category B: Unused Top-Level Preamble Declarations (TS6133 & TS6196 under `noUnusedLocals`)
- **Root Cause**: `tsconfig.app.json` has `"noUnusedLocals": true`. Auto-generated wrappers include standard preamble functions (`__lookupPrefix`, `__throwNonePrefixMatch`, `storeCellRef`, `loadCellRef`) and helper classes (`StackReader`). When a specific contract wrapper does not utilize cell references or union variants, unexported top-level declarations are flagged as unused local variables.
- **Affected Files**: All 9 `.gen.ts` files (`CityMap`, `Dao`, `DaoVoter`, `FossFi`, `FossFiWallet`, `Location`, `Lottery`, `Personal`, `PersonalWallet`).
- **Fix**: Export all preamble functions and classes:
  ```ts
  export function __lookupPrefix(s: c.Slice, expected: number, prefixLen: number): boolean { ... }
  export function __throwNonePrefixMatch(fieldPath: string): never { ... }
  export function storeCellRef<T>(cell: CellRef<T>, b: c.Builder, storeFn_T: StoreCallback<T>): void { ... }
  export function loadCellRef<T>(s: c.Slice, loadFn_T: LoadCallback<T>): CellRef<T> { ... }
  export class StackReader { ... }
  ```
  *Note*: Exported declarations belong to the module's export interface and are exempt from `noUnusedLocals` checks.

### Category C: Helper Identifier Mismatch (`_lookupPrefix` vs `__lookupPrefix`) (TS2304 / TS2552)
- **Root Cause**: Deserialization functions in struct definitions (e.g. `InternalTransferStep`, `AskToTransfer`, `TransferNotificationForRecipient`) call `_lookupPrefix` and `_throwNonePrefixMatch` (with a single underscore `_`), whereas the top-level preamble helper functions are named `__lookupPrefix` and `__throwNonePrefixMatch` (with double underscores `__`).
- **Affected Files**: `Dao.gen.ts`, `FossFi.gen.ts`, `FossFiWallet.gen.ts`, `Personal.gen.ts`, `PersonalWallet.gen.ts`.
- **Fix**: Align the call sites in struct deserializers to call `__lookupPrefix` and `__throwNonePrefixMatch`:
  ```ts
  forwardPayload: __lookupPrefix(s, 0b0, 1) ? PayloadInline.fromSlice(s) :
                  __lookupPrefix(s, 0b1, 1) ? PayloadInRef.fromSlice(s) :
                  __throwNonePrefixMatch('InternalTransferStep.forwardPayload'),
  ```

### Category D: Broken Body Variable References in Parameter-Renamed Functions (TS2304 / TS2552)
- **Root Cause**: 
  1. In `TopUpTons.store(_self: TopUpTons, _b: c.Builder)`, the parameter was renamed to `_b`, but the method implementation calls `b.storeUint(0x00001007, 32);`. This triggers `TS2304: Cannot find name 'b'`.
  2. In `sendTopUpTons(_provider: ContractProvider, _via: Sender, _msgValue: coins, _body: {...})`, parameters were renamed with `_`, but the method body references `provider.internal(via, { value: msgValue, ... })`. This triggers `TS2552: Cannot find name 'provider' / 'via' / 'msgValue'`.
- **Affected Files**: `Dao.gen.ts`, `FossFi.gen.ts`, `FossFiWallet.gen.ts`, `Personal.gen.ts`, `PersonalWallet.gen.ts`.
- **Fix**:
  1. In `TopUpTons.store`, change `_b: c.Builder` back to `b: c.Builder` (since `b` is used).
  2. In `sendTopUpTons`, change `_provider`, `_via`, `_msgValue` back to `provider`, `via`, `msgValue` (since they are used).

### Category E: Truly Unused Parameters in Empty Struct Methods (TS6133 under `noUnusedParameters`)
- **Root Cause**: `tsconfig.app.json` has `"noUnusedParameters": true`. Empty structs (such as `Destroy`, `ApproveUpgrade`, `RejectUpgrade`, `InternalDeActivate`, `ActRequestUpgrade`, `ActDestroyAccount`, `ActJoinLottery`, `RequestState`) have `store(self: T, b: c.Builder)` or `static createCellOfT(body: {})` or `async sendT(..., body: {})` where `self` or `body` is never read because the struct contains zero fields.
- **Affected Files**: `FossFi.gen.ts`, `FossFiWallet.gen.ts`.
- **Fix**: Prefix the truly unused parameters with `_`:
  - `store(_self: Destroy, b: c.Builder): void`
  - `static createCellOfDestroy(_body: { ... })`
  - `async sendDestroy(provider: ContractProvider, via: Sender, msgValue: coins, _body: { ... })`

---

## 3. Precise File-by-File Fix Strategy

### 1. `CityMap.gen.ts` (4 changes)
- Add `export` keyword to line 32 (`__lookupPrefix`), line 36 (`__throwNonePrefixMatch`), line 40 (`storeCellRef`), and line 46 (`loadCellRef`).

### 2. `Dao.gen.ts` (9 changes)
- Line 6: Add `type` modifier to `ContractProvider` and `Sender`.
- Lines 45, 49, 53, 59: Add `export` keyword to preamble functions.
- Line 339-341: Replace `_lookupPrefix` with `__lookupPrefix` and `_throwNonePrefixMatch` with `__throwNonePrefixMatch`.
- Line 441: In `TopUpTons.store(_self: TopUpTons, _b: c.Builder)`, change `_b: c.Builder` to `b: c.Builder`.
- Line 954: In `sendTopUpTons`, change `_provider, _via, _msgValue` to `provider, via, msgValue`.

### 3. `DaoVoter.gen.ts` (5 changes)
- Lines 32, 36, 40, 46: Add `export` keyword to preamble functions.
- Line 64: Add `export` keyword to `export class StackReader`.

### 4. `FossFi.gen.ts` (18 changes)
- Line 6: Add `type` modifier to `ContractProvider` and `Sender`.
- Preamble functions: Add `export` keyword.
- Lines 410-412: Replace `_lookupPrefix` / `_throwNonePrefixMatch` with double-underscore versions.
- Line 924: Fix `TopUpTons.store` parameter `_b: c.Builder` -> `b: c.Builder`.
- Lines 995, 1025, 1331: Prefix unused `self` in empty struct `store` methods with `_` (`_self`).
- Lines 2081, 2086, 2091: Prefix unused `body` in empty struct `createCellOf*` methods with `_` (`_body`).
- Line 2216: Fix `sendTopUpTons` parameter names (`provider, via, msgValue`).
- Lines 2324, 2333, 2342: Prefix unused `body` in empty struct `send*` methods with `_` (`_body`).

### 5. `FossFiWallet.gen.ts` (33 changes)
- Line 6: Add `type` modifier to `ContractProvider` and `Sender`.
- Preamble functions: Add `export` keyword.
- Lines 364-366, 430-432, 508-510: Replace `_lookupPrefix` / `_throwNonePrefixMatch` with double-underscore versions.
- Line 818: Fix `TopUpTons.store` parameter `_b: c.Builder` -> `b: c.Builder`.
- Lines 1128, 1158, 1188, 1218, 2464, 2494: Prefix unused `self` in empty struct `store` methods with `_` (`_self`).
- Lines 3399, 3439, 3450, 3461, 3491, 3565: Prefix unused `body` in empty struct `createCellOf*` methods with `_` (`_body`).
- Line 3943: Fix `sendTopUpTons` parameter names (`provider, via, msgValue`).
- Lines 3762, 3826, 3845, 3864, 3910, 4024: Prefix unused `body` in empty struct `send*` methods with `_` (`_body`).

### 6. `Location.gen.ts` (4 changes)
- Preamble functions: Add `export` keyword.

### 7. `Lottery.gen.ts` (4 changes)
- Line 6: Add `type` modifier to `ContractProvider` and `Sender`.
- Preamble functions: Add `export` keyword.

### 8. `Personal.gen.ts` (9 changes)
- Line 6: Add `type` modifier to `ContractProvider` and `Sender`.
- Preamble functions: Add `export` keyword.
- Lines 435-437: Replace `_lookupPrefix` / `_throwNonePrefixMatch` with double-underscore versions.
- Line 838: Fix `TopUpTons.store` parameter `_b: c.Builder` -> `b: c.Builder`.
- Line 1317: Fix `sendTopUpTons` parameter names (`provider, via, msgValue`).

### 9. `PersonalWallet.gen.ts` (15 changes)
- Line 6: Add `type` modifier to `ContractProvider` and `Sender`.
- Preamble functions: Add `export` keyword.
- Lines 337-339, 403-405, 481-483: Replace `_lookupPrefix` / `_throwNonePrefixMatch` with double-underscore versions.
- Line 739: Fix `TopUpTons.store` parameter `_b: c.Builder` -> `b: c.Builder`.
- Line 1083: Fix `sendTopUpTons` parameter names (`provider, via, msgValue`).

---

## 4. Non-Shortcut Compliance & Safety Verification

1. **Strict Compiler Options**: `tsconfig.app.json` compiler options (`verbatimModuleSyntax`, `erasableSyntaxOnly`, `noUnusedLocals`, `noUnusedParameters`) are preserved in full without disabling or relaxing any options.
2. **API Contract Compatibility**: 
   - Exporting top-level preamble helper functions adds exported symbols to contract wrapper modules; it does not remove or rename any existing public class, method, type, or contract interface.
   - Parameter renaming (`_self`, `_body`) only affects internal function parameter names and preserves exact type signatures (`body: {}`, `self: Destroy`).
3. **Runtime Functionality**:
   - Fixing `b` in `TopUpTons.store` and `provider`, `via`, `msgValue` in `sendTopUpTons` restores functionality that was previously broken by missing variable references.
   - Aligning `_lookupPrefix` to `__lookupPrefix` ensures struct deserialization correctly evaluates payload branch prefixes.

---

## 5. Next Steps for Implementer

1. Apply the precise file modifications detailed in Section 3 to all 9 `.gen.ts` files in `apps/demo-wallet/src/contracts/brotherhood/`.
2. Run `pnpm --filter demo-wallet typecheck` to verify **0 TypeScript errors**.
3. Run `pnpm --filter demo-wallet build` to verify successful bundle creation.
