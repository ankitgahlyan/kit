# Empirical Challenge Report: Milestone 1 Infrastructure & Contracts

## Challenge Summary

**Overall risk assessment**: LOW  
**Verdict**: APPROVE  

All 9 contract wrappers and 6 lib utilities in `apps/demo-wallet` have been empirically stress-tested and verified. Import resolution across barrel files (`@/contracts/brotherhood`, `@/lib/brotherhood`) and direct paths compiles cleanly with zero TypeScript errors or missing module issues. `pnpm typecheck` and `pnpm --filter demo-wallet build` execute successfully across chrome extension, firefox extension, and website targets.

---

## Stress Test Results

### 1. Contract Wrapper Import Resolution
- **Target wrappers (9/9)**:
  - `CityMap.gen.ts` (`CityMap`)
  - `Dao.gen.ts` (`Dao`)
  - `DaoVoter.gen.ts` (`DaoVoter`)
  - `FossFi.gen.ts` (`FossFi`, `MintNewJettons`, etc.)
  - `FossFiWallet.gen.ts` (`FossFiWallet`, `AskToBurn`, `AskToTransfer`, etc.)
  - `Location.gen.ts` (`LocationContract`)
  - `Lottery.gen.ts` (`Lottery`)
  - `Personal.gen.ts` (`PersonalMinter`)
  - `PersonalWallet.gen.ts` (`PersonalWallet`)
- **Test execution**: Custom stress test harness (`__stress_test__.ts`) imported all 9 wrappers directly and via `@/contracts/brotherhood` barrel export.
- **Result**: PASS — 100% resolution, no missing exports, types match.

### 2. Lib Utility Import Resolution & Adaptation
- **Target utilities (6/6)**:
  - `deploy.ts` — `buildDeployMessage`, `buildMintBody`, `buildBurnBody`, `buildTransferBody`, `buildInviteBody`, `buildBuyCreditBody`, `buildVoteBody`, `buildUnvoteBody`, `buildDestroyBody`, `buildPersonalMinterDeploy`, `buildPointPersonalMinterBody`, etc.
  - `ton.ts` — `getTonClient`, `getWalletAddress`, `fetchJettonMaster`, `fetchWalletBalance`, `getFiWalletState`, `listAllowances`, `getCircle`, `getPersonalMinterForIssuer`, etc.
  - `queries.ts` — `useJettonMaster`, `useFiWalletState`, `useWalletBalance`, `useCircle`, `usePersonalMinterForIssuer`, `usePersonalWalletAddress`, `usePersonalWalletBalance`, `useRefreshContractQueries`
  - `jettonContent.ts` — `buildOnchainMetadata`, `buildTolkOnchainMetadata`
  - `config.ts` — `network`, `FI_ADDRESS`, `ZERO_ADDRESS`
  - `contract-cache.ts` — `setContractCache`, `getContractCache`, `clearContractCache`, `getContractCacheStats`
- **Test execution**: Exercised message builders, config constants, and type interfaces in empirical test harness.
- **Result**: PASS — No broken internal or external references. `@ton/ton` and `@tanstack/react-query` imports resolve properly.

### 3. Build & Typecheck Commands
- **Command 1**: `pnpm typecheck`  
  - Expected: Exit code 0, 0 TypeScript errors across monorepo  
  - Actual: Exit code 0, 21/21 workspace tasks succeeded  
  - Result: PASS
- **Command 2**: `pnpm --filter demo-wallet build`  
  - Expected: Clean extension (chrome, firefox) and website builds  
  - Actual: Exit code 0, tsup build succeeded, vite extension builds succeeded, vite website build succeeded  
  - Result: PASS

---

## Challenges

### [Low] Challenge 1: Unused Variable Strictness in TS Config
- **Assumption challenged**: Whether custom feature implementations or test files can contain unused imports.
- **Attack scenario**: Adding temporary or unused imports triggers `TS6133: '...' is declared but its value is never read` under `demo-wallet`'s strict `tsconfig.json`.
- **Blast radius**: Low. Build fails if developer leaves unused imports in implementation files.
- **Mitigation**: All feature code must strictly consume or avoid declaring unused variables and imports.

---

## Unchallenged Areas

- **Runtime network interaction with live testnet contracts**: Out of scope for M1 infrastructure verification; covered in feature milestones (M2-M6).
