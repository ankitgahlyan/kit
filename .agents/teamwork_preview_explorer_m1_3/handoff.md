# Handoff Report: Demo Wallet Dependencies, Workspace & Build Pipeline Audit

**Agent**: `teamwork_preview_explorer_m1_3`  
**Working Directory**: `/home/zeta/.gemini/antigravity/worktrees/kit/implement_jetton_wallet_features/.agents/teamwork_preview_explorer_m1_3`  
**Target Milestone**: Milestone 1 (Infrastructure & Contracts)

---

## 1. Observation

1. **`apps/demo-wallet/package.json`**:
   - Lines 36-37: `"@ton/core": "catalog:"` and `"@ton/crypto": "catalog:"` are present under `dependencies`.
   - Lines 25-26, 38: `"@demo/v4ledger-adapter"`, `"@demo/wallet-core"`, `"@ton/walletkit"` are present under `dependencies` as `"workspace:*"`.
   - Line 22: `"typecheck": "tsc --noEmit -p tsconfig.app.json"`.
   - Line 14: `"build": "pnpm build:extension && pnpm build:website"`.
   - **Absence**: `@ton/ton` and `@tanstack/react-query` are missing from `dependencies`.

2. **`/home/zeta/jetton/package.json`**:
   - Line 44: `"@tanstack/react-query": "^5.101.4"`.
   - Line 52: `"@ton/core": "^0.63.1"`.
   - Line 53: `"@ton/crypto": "^3.3.0"`.
   - Line 54: `"@ton/ton": "^16.3.0"`.

3. **Monorepo Root `pnpm-workspace.yaml` Catalog**:
   - Line 15: `'@tanstack/react-query': ^5.101.0`.
   - Line 16: `'@ton/core': ^0.63.1`.
   - Line 17: `'@ton/crypto': ^3.3.0`.
   - **Absence**: `@ton/ton` is NOT listed in the `catalog:` block.

4. **Root `package.json` & `turbo.json`**:
   - `package.json` line 12: `"demo-wallet": "pnpm --filter demo-wallet"`.
   - `package.json` line 16: `"build": "turbo build"`.
   - `package.json` line 24: `"typecheck": "turbo typecheck"`.

---

## 2. Logic Chain

1. `src/lib/brotherhood/ton.ts` requires `import { TonClient } from '@ton/ton'` to communicate with TON RPC endpoints.
2. `src/lib/brotherhood/queries.ts` requires `import { useQuery, useQueryClient } from '@tanstack/react-query'` to manage state and caching.
3. Therefore, both `@ton/ton` and `@tanstack/react-query` must be listed in `apps/demo-wallet/package.json` under `dependencies`.
4. Because `@tanstack/react-query` is in `pnpm-workspace.yaml` catalog (`^5.101.0`), referencing `"@tanstack/react-query": "catalog:"` maintains monorepo catalog consistency.
5. Because `@ton/ton` is missing from `pnpm-workspace.yaml` catalog, adding `"@ton/ton": "^16.3.0"` directly to `apps/demo-wallet/package.json` satisfies the requirement cleanly without modifying root catalog configuration.
6. The existing path aliases (`@/*` -> `./src/*`) in `apps/demo-wallet/tsconfig.app.json` allow standard imports for `@/contracts/brotherhood/...` and `@/lib/brotherhood/...`.

---

## 3. Caveats

- This investigation is strictly read-only. No modifications have been made to `apps/demo-wallet/package.json` or `pnpm-lock.yaml`.
- When the implementer adds these packages to `apps/demo-wallet/package.json`, running `pnpm install` at the root directory will be necessary to update `pnpm-lock.yaml`.

---

## 4. Conclusion

- `apps/demo-wallet/package.json` needs two specific package additions under `"dependencies"`:
  ```json
  "@tanstack/react-query": "catalog:",
  "@ton/ton": "^16.3.0"
  ```
- No other packages or workspace dependencies are missing.
- Build scripts (`pnpm --filter demo-wallet build`) and typecheck scripts (`pnpm typecheck` / `pnpm --filter demo-wallet typecheck`) are properly configured.

---

## 5. Verification Method

To verify after implementation:
1. Check `apps/demo-wallet/package.json` for `"@tanstack/react-query": "catalog:"` and `"@ton/ton": "^16.3.0"`.
2. Run `pnpm install` at workspace root `/home/zeta/.gemini/antigravity/worktrees/kit/implement_jetton_wallet_features`.
3. Run `pnpm typecheck` from repository root.
4. Run `pnpm --filter demo-wallet build` from repository root.
