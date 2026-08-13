# Handoff Report: Lib Utilities Analysis (Milestone 1)

## 1. Observation

- **Source files inspected in `/home/zeta/jetton/src/lib/`**:
  - `deploy.ts` (324 lines): Imports contract wrappers using `@wrappers/FossFi.gen`, `@wrappers/FossFiWallet.gen`, `@wrappers/Personal.gen`, `@wrappers/PersonalWallet.gen` and sibling utility `./jettonContent`.
  - `jettonContent.ts` (156 lines): Imports `@ton/core`. Uses `Buffer` and `crypto.subtle`.
  - `ton.ts` (284 lines): Imports `@ton/ton`, `@ton/core`, `@tanstack/react-query`, `@/lib/config`, `@wrappers/FossFiWallet.gen`, `@wrappers/Personal.gen`, `@wrappers/PersonalWallet.gen`.
  - `queries.ts` (148 lines): Imports `@tanstack/react-query`, `@ton/core`, `./ton`, and `./contract-cache`.
  - `contract-cache.ts` (206 lines): Implements IndexedDB contract caching, imported by `queries.ts`.
  - `config.ts` (7 lines): Defines `FI_ADDRESS`, `ZERO_ADDRESS`, `Network` type, imported by `ton.ts`.
  - `errors.ts` (24 lines): Error handler functions.

- **Path Alias Configuration**:
  - `apps/demo-wallet/tsconfig.json` & `tsconfig.app.json`:
    ```json
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
    ```
  - `apps/demo-wallet/vite.config.ts`:
    ```ts
    resolve: { alias: { '@': path.resolve(__dirname, './src') } }
    ```

- **Package Dependencies**:
  - `apps/demo-wallet/package.json` currently includes `@ton/core` (`catalog:`) and `buffer` (`catalog:`).
  - `apps/demo-wallet/package.json` **lacks**:
    - `@ton/ton`
    - `@tanstack/react-query`
  - `pnpm-workspace.yaml` catalog includes `'@tanstack/react-query': ^5.101.0`. `/home/zeta/jetton/package.json` uses `"@ton/ton": "^16.3.0"`.

---

## 2. Logic Chain

1. Contract wrappers will be located in `apps/demo-wallet/src/contracts/brotherhood/`.
2. Since `tsconfig.app.json` and `vite.config.ts` alias `@/` to `apps/demo-wallet/src/`, all imports of `@wrappers/<Wrapper>.gen` in `deploy.ts` and `ton.ts` must be updated to `@/contracts/brotherhood/<Wrapper>.gen`.
3. Lib utilities will be located in `apps/demo-wallet/src/lib/brotherhood/`. Sibling imports such as `./jettonContent` in `deploy.ts`, `./ton` and `./contract-cache` in `queries.ts`, and `./config` in `ton.ts` remain relative (`./<filename>`) or `@/lib/brotherhood/<filename>`.
4. `queries.ts` imports `./contract-cache` and `ton.ts` imports `./config`. To ensure `apps/demo-wallet/src/lib/brotherhood/` compiles cleanly without missing module errors, `contract-cache.ts` and `config.ts` must also be copied along with `deploy.ts`, `ton.ts`, `queries.ts`, and `jettonContent.ts`.
5. `ton.ts` uses `TonClient` from `@ton/ton` and `QueryClient` from `@tanstack/react-query`. `queries.ts` uses `useQuery` and `useQueryClient` from `@tanstack/react-query`. Therefore, `@ton/ton` and `@tanstack/react-query` must be added to `apps/demo-wallet/package.json`.

---

## 3. Caveats

- `ton.ts` in the jetton repo hardcodes single `network` import from `config.ts`. For `apps/demo-wallet`, methods in `ton.ts` should allow passing `network: Network` dynamically so feature hooks can query using the wallet's active network (`savedWallets.find(w => w.id === activeWalletId)?.network`).
- Vite ambient env typing (`vite-env.d.ts`) includes `VITE_TON_API_KEY`, whereas `ton.ts` references `TONCENTER_MAINNET_API_KEY` and `TONCENTER_TESTNET_API_KEY`. Both can be supported or typed in `vite-env.d.ts`.

---

## 4. Conclusion

- Target destination for lib utilities: `apps/demo-wallet/src/lib/brotherhood/`.
- 6 files should be copied/created in `apps/demo-wallet/src/lib/brotherhood/`:
  1. `deploy.ts`
  2. `jettonContent.ts`
  3. `ton.ts`
  4. `queries.ts`
  5. `contract-cache.ts`
  6. `config.ts`
- Target import mappings:
  - `@wrappers/*.gen` -> `@/contracts/brotherhood/*.gen`
  - `@/lib/config` -> `./config`
  - Sibling lib imports (`./jettonContent`, `./ton`, `./contract-cache`) remain relative `./<file>`
- Package dependencies to add to `apps/demo-wallet/package.json`:
  - `"@ton/ton": "^16.3.0"`
  - `"@tanstack/react-query": "catalog:"`

---

## 5. Verification Method

1. Inspect analysis report at `/home/zeta/.gemini/antigravity/worktrees/kit/implement_jetton_wallet_features/.agents/teamwork_preview_explorer_m1_2/analysis.md`.
2. Upon implementer copying files and adding dependencies, verify build and type safety via:
   ```bash
   pnpm --filter demo-wallet typecheck
   ```
