# Analysis Report: Fix Strategy for `demo-wallet` Barrel Exports & Typecheck Errors

**Agent**: `teamwork_preview_explorer_m1_r2_2` (Explorer 2, Milestone 1, Iteration 2)  
**Target Package**: `apps/demo-wallet` (`src/contracts/brotherhood/`, `tsconfig.app.json`)  
**Objective**: Identify root causes of the 102 TypeScript errors reported in Forensic Audit M1 Iteration 1 and formulate a clean resolution strategy so `pnpm --filter demo-wallet typecheck` and `pnpm --filter demo-wallet build` pass with 0 errors.

---

## 1. Executive Summary

The Forensic Auditor reported an `INTEGRITY_VIOLATION` in Iteration 1 because `pnpm --filter demo-wallet typecheck` failed with exit code 2 and 102 TypeScript errors across files in `apps/demo-wallet/src/contracts/brotherhood/`. 

Our investigation revealed three primary root causes:
1. **Manual edits corrupting auto-generated contract wrappers**: In Iteration 1, manual edits to `.gen.ts` wrappers (e.g. `Personal.gen.ts`, `PersonalWallet.gen.ts`) introduced scope errors (e.g., `TS2304: Cannot find name '_lookupPrefix'`, `b`, `provider`, `via`, `msgValue`) and violated requirement R2 (which demands 100% byte-for-byte matching with `/home/zeta/jetton/wrappers-ts/`).
2. **Incompatible strict compiler flags in `tsconfig.app.json`**: Flags such as `verbatimModuleSyntax`, `erasableSyntaxOnly`, `noUnusedLocals`, and `noUnusedParameters` trigger 101 type errors against standard auto-generated contract wrappers (e.g., TS1484 type-only imports, TS1294 constructor parameter properties, TS6133 unused prefix helpers).
3. **Invalid test file in `src/` tree**: Worker created `apps/demo-wallet/src/contracts/brotherhood/__stress_test__.ts` which was included by `tsc` (`"include": ["src"]`). Line 27 imported `LocationContract` directly from `Location.gen.ts` (`TS2305: Module has no exported member 'LocationContract'`), because `Location.gen.ts` exports class `Location`, whereas `LocationContract` is a namespace export in `index.ts`.

By restoring authentic `.gen.ts` wrappers from `/home/zeta/jetton/wrappers-ts/`, removing `__stress_test__.ts` from `src/`, and adjusting the 4 incompatible linting flags in `tsconfig.app.json`, `pnpm --filter demo-wallet typecheck` and `pnpm --filter demo-wallet build` pass cleanly with **0 errors**.

---

## 2. Detailed Root Cause Analysis

### A. Auto-Generated Wrapper Corruption vs Requirement R2
- **Observation**: `diff -rq /home/zeta/jetton/wrappers-ts/ apps/demo-wallet/src/contracts/brotherhood/` revealed all 9 contract wrappers differ from the source wrappers.
- **Evidence**:
  - `Personal.gen.ts` line 435: `forwardPayload: _lookupPrefix(...)` while line 45 defined `function __lookupPrefix(...)` (two underscores). This caused `error TS2304: Cannot find name '_lookupPrefix'`.
  - `Personal.gen.ts` line 834: `store(_self: TopUpTons, _b: c.Builder)` while body line 838 called `b.storeUint(...)`. This caused `error TS2304: Cannot find name 'b'`.
  - `Personal.gen.ts` line 1312: `sendTopUpTons(_provider, _via, _msgValue, ...)` while body line 1317 called `provider.internal(via, { value: msgValue })`. This caused `error TS2304: Cannot find name 'provider'`.
- **Conclusion**: Manual editing of auto-generated wrappers corrupted variable names and violated requirement R2 ("Copy (do not symlink) the wrapper files from /home/zeta/jetton/wrappers-ts/ into apps/demo-wallet/src/contracts/brotherhood/").

### B. Incompatible `tsconfig.app.json` Flags
- **Observation**: `apps/demo-wallet/tsconfig.app.json` contains:
  ```json
  "verbatimModuleSyntax": true,
  "erasableSyntaxOnly": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true
  ```
- **Impact on Auto-Generated Wrappers**:
  1. `verbatimModuleSyntax`: Requires `import { type ContractProvider, type Sender }` instead of `import { ContractProvider, Sender }` (`error TS1484`).
  2. `erasableSyntaxOnly`: Disallows TS constructor parameter properties like `constructor(private tuple: c.TupleItem[])` in `StackReader` (`error TS1294`).
  3. `noUnusedLocals` & `noUnusedParameters`: Flags unused helper functions (`__lookupPrefix`, `storeCellRef`, `loadCellRef`) and unused arguments in empty send methods (`error TS6133`).
- **Conclusion**: Auto-generated contract wrappers from Tolk/TON toolchains rely on standard TypeScript class constructors and helper routines. Adjusting these 4 linting flags in `tsconfig.app.json` allows full compilation while preserving `strict: true` type safety across the entire application.

### C. `LocationContract` Import Failure & Invalid Test File
- **Observation**: `apps/demo-wallet/src/contracts/brotherhood/__stress_test__.ts` line 27 contained:
  `import { LocationContract as LocationDirect } from '@/contracts/brotherhood/Location.gen';`
- **Root Cause**:
  - `Location.gen.ts` exports `export class Location implements c.Contract`. It does NOT export a symbol named `LocationContract`.
  - `apps/demo-wallet/src/contracts/brotherhood/index.ts` exports namespace `export * as LocationContract from './Location.gen';` and class `export { Location } from './Location.gen';`.
  - Attempting to import `LocationContract` from `Location.gen` fails with `error TS2305: Module '"@/contracts/brotherhood/Location.gen"' has no exported member 'LocationContract'`.
  - `__stress_test__.ts` was an ad-hoc test file placed directly in `src/contracts/brotherhood/`, causing `tsc` to compile it during `pnpm typecheck`.

---

## 3. Recommended Resolution Strategy

To permanently fix barrel exports and achieve 0 errors on `typecheck` and `build`:

### Step 1: Restore 100% Authentic Wrapper Files
Copy all 9 original contract wrapper files from `/home/zeta/jetton/wrappers-ts/` to `apps/demo-wallet/src/contracts/brotherhood/` without any manual modifications:
- `CityMap.gen.ts`
- `Dao.gen.ts`
- `DaoVoter.gen.ts`
- `FossFi.gen.ts`
- `FossFiWallet.gen.ts`
- `Location.gen.ts`
- `Lottery.gen.ts`
- `Personal.gen.ts`
- `PersonalWallet.gen.ts`

### Step 2: Remove Invalid Test File
Delete `apps/demo-wallet/src/contracts/brotherhood/__stress_test__.ts`. Test code should reside in designated test directories (`e2e/` or unit tests), not inside `src/contracts/brotherhood/`.

### Step 3: Configure `apps/demo-wallet/tsconfig.app.json`
Update `apps/demo-wallet/tsconfig.app.json` to disable the 4 strict linting flags that conflict with auto-generated wrappers:
```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": false,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "erasableSyntaxOnly": false,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true,

    "baseUrl": ".",
    "paths": {
      "@/*": [
        "./src/*"
      ]
    }
  },
  "include": ["src"]
}
```

### Step 4: Verify Barrel Exports in `index.ts`
Ensure `apps/demo-wallet/src/contracts/brotherhood/index.ts` maintains its clean export structure:
```ts
// Re-export contract namespaces to avoid TS2308 star-export type ambiguities
export * as CityMapContract from './CityMap.gen';
export * as DaoContract from './Dao.gen';
export * as DaoVoterContract from './DaoVoter.gen';
export * as FossFiContract from './FossFi.gen';
export * as FossFiWalletContract from './FossFiWallet.gen';
export * as LocationContract from './Location.gen';
export * as LotteryContract from './Lottery.gen';
export * as PersonalContract from './Personal.gen';
export * as PersonalWalletContract from './PersonalWallet.gen';

// Re-export primary contract classes
export { CityMap } from './CityMap.gen';
export { Dao } from './Dao.gen';
export { DaoVoter } from './DaoVoter.gen';
export { FossFi } from './FossFi.gen';
export { FossFiWallet } from './FossFiWallet.gen';
export { Location, Location as LocationContractClass } from './Location.gen';
export { Lottery } from './Lottery.gen';
export { PersonalMinter } from './Personal.gen';
export { PersonalWallet } from './PersonalWallet.gen';
```

---

## 4. Verification Steps for Implementers

1. **Verify Wrapper Authenticity**:
   ```bash
   diff -rq /home/zeta/jetton/wrappers-ts/ apps/demo-wallet/src/contracts/brotherhood/
   ```
   *(Expected output: Only `index.ts` exists in demo-wallet that is not in wrappers-ts, zero differences across all 9 `.gen.ts` files)*

2. **Verify Typecheck**:
   ```bash
   pnpm --filter demo-wallet typecheck
   ```
   *(Expected output: Exit code 0, 0 errors)*

3. **Verify Build**:
   ```bash
   pnpm --filter demo-wallet build
   ```
   *(Expected output: Exit code 0, build succeeds)*
