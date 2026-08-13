# Handoff Report: Forensic Typecheck Fix Strategy for Milestone 1 Iteration 2

**Agent**: `teamwork_preview_explorer_m1_r2_1`  
**Working Directory**: `/home/zeta/.gemini/antigravity/worktrees/kit/implement_jetton_wallet_features/.agents/teamwork_preview_explorer_m1_r2_1`  
**Target Project**: `apps/demo-wallet`  

---

## 1. Observation

1. Executing `pnpm --filter demo-wallet typecheck` (`tsc --noEmit -p tsconfig.app.json`) fails with **Exit Code 2** and **101 TypeScript errors** across 9 files in `apps/demo-wallet/src/contracts/brotherhood/`:
   - `CityMap.gen.ts`: 4 errors
   - `Dao.gen.ts`: 9 errors
   - `DaoVoter.gen.ts`: 5 errors
   - `FossFi.gen.ts`: 18 errors
   - `FossFiWallet.gen.ts`: 33 errors
   - `Location.gen.ts`: 4 errors
   - `Lottery.gen.ts`: 4 errors
   - `Personal.gen.ts`: 9 errors
   - `PersonalWallet.gen.ts`: 15 errors

2. Direct examination of `apps/demo-wallet/tsconfig.app.json` revealed the active strict compiler options:
   - `"verbatimModuleSyntax": true`
   - `"erasableSyntaxOnly": true`
   - `"noUnusedLocals": true`
   - `"noUnusedParameters": true`

3. Analysis of the 101 compiler errors identified 5 distinct root cause categories:
   - **TS1484 (`verbatimModuleSyntax`)**: Lines like `import { beginCell, ContractProvider, Sender, SendMode } from '@ton/core';` missing `type` annotations for `ContractProvider` and `Sender`.
   - **TS6133 / TS6196 (`noUnusedLocals`)**: Top-level preamble functions (`__lookupPrefix`, `__throwNonePrefixMatch`, `storeCellRef`, `loadCellRef`) and helper class `StackReader` declared unexported and unused in specific wrapper files.
   - **TS2304 / TS2552 (Identifier Mismatch)**: Struct deserializers calling `_lookupPrefix` / `_throwNonePrefixMatch` (single `_`) while preamble functions were declared as `__lookupPrefix` / `__throwNonePrefixMatch` (double `__`).
   - **TS2304 / TS2552 (Broken Parameter References)**: `TopUpTons.store` using parameter `_b` while body calls `b.storeUint(...)`, and `sendTopUpTons` using `_provider`, `_via`, `_msgValue` while body calls `provider.internal(via, { value: msgValue })`.
   - **TS6133 (`noUnusedParameters`)**: Empty struct methods (`store`, `createCellOf*`, `send*`) where `self` or `body` parameters are never read.

4. `apps/demo-wallet/src/contracts/brotherhood/__stress_test__.ts` was inspected and verified to contain valid imports (`import { Location as LocationDirect } from '@/contracts/brotherhood/Location.gen'`), generating 0 errors during typecheck.

---

## 2. Logic Chain

1. **Strict Compiler Option Adherence**: The project requirements mandate zero TypeScript errors with `tsconfig.app.json` settings unchanged (no shortcuts like disabling `noUnusedLocals` or `verbatimModuleSyntax`).
2. **Category A Fix Logic**: Adding `type` keyword to type-only imports (`type ContractProvider`, `type Sender`) satisfies `verbatimModuleSyntax` without changing imported entities.
3. **Category B Fix Logic**: Adding `export` keyword to preamble functions (`export function __lookupPrefix...`, `export function storeCellRef...`) and `StackReader` class converts them into module exports, rendering them exempt from `noUnusedLocals` checks while retaining wrapper utility completeness.
4. **Category C Fix Logic**: Replacing `_lookupPrefix` and `_throwNonePrefixMatch` call sites with `__lookupPrefix` and `__throwNonePrefixMatch` links struct deserialization to the defined preamble functions.
5. **Category D Fix Logic**: Renaming parameter `_b` -> `b` in `TopUpTons.store` and `_provider, _via, _msgValue` -> `provider, via, msgValue` in `sendTopUpTons` provides the exact identifiers referenced inside method bodies.
6. **Category E Fix Logic**: Prefixing truly unused parameters in empty-struct methods (`store(_self: Destroy, b: c.Builder)`, `sendDestroy(..., _body: {})`) with `_` satisfies `noUnusedParameters` without changing method call signatures.
7. **Synthesis**: Applying these systematic transformations across all 9 `.gen.ts` contract wrappers will resolve all 101 TypeScript errors, achieving zero errors under `pnpm --filter demo-wallet typecheck`.

---

## 3. Caveats

- **Scope Limit**: Investigation is read-only analysis. No changes were made directly to `.gen.ts` source files during this phase.
- **Assumptions**: The auto-generated contract wrappers in `apps/demo-wallet/src/contracts/brotherhood/` are intended to be maintained within the project monorepo under `apps/demo-wallet/tsconfig.app.json` strict settings.

---

## 4. Conclusion

All 101 TypeScript typecheck errors in `apps/demo-wallet/src/contracts/brotherhood/*.gen.ts` have been cataloged and mapped to precise, non-shortcut fix patterns. Applying the documented 5-point fix strategy across the 9 wrapper files will bring `apps/demo-wallet` into 100% compliance with `tsconfig.app.json` strict options, resolving the forensic audit failure and enabling `pnpm --filter demo-wallet typecheck` to pass cleanly with 0 errors.

Full detailed analysis report written to:
`/home/zeta/.gemini/antigravity/worktrees/kit/implement_jetton_wallet_features/.agents/teamwork_preview_explorer_m1_r2_1/analysis.md`

---

## 5. Verification Method

To verify the strategy once implemented:
1. Apply the 5-point fix strategy to `apps/demo-wallet/src/contracts/brotherhood/*.gen.ts`.
2. Run typecheck on demo-wallet:
   ```bash
   pnpm --filter demo-wallet typecheck
   ```
3. Confirm output: Exit code 0, 0 TypeScript errors.
4. Run demo-wallet build:
   ```bash
   pnpm --filter demo-wallet build
   ```
5. Confirm output: Exit code 0, successful bundle build.
