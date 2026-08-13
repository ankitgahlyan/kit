# Analysis Report: Demo Wallet Dependencies, Workspace Setup & Build Pipeline

**Agent**: `teamwork_preview_explorer_m1_3` (Explorer 3 for Milestone 1: Infrastructure & Contracts)  
**Date**: 2026-08-12  
**Target Path**: `apps/demo-wallet/` in `/home/zeta/.gemini/antigravity/worktrees/kit/implement_jetton_wallet_features`

---

## 1. Executive Summary

This report presents a thorough analysis of package dependencies, workspace configurations, build scripts, and typecheck procedures for `apps/demo-wallet` as part of **Milestone 1 (Infrastructure & Contracts)**.

Key findings:
- `apps/demo-wallet/package.json` currently includes `@ton/core` (`"catalog:"`) and `@ton/crypto` (`"catalog:"`), but is **missing** `@ton/ton` and `@tanstack/react-query`.
- `@tanstack/react-query` is already defined in `pnpm-workspace.yaml` catalog (`^5.101.0`), so it should be added to `apps/demo-wallet/package.json` as `"@tanstack/react-query": "catalog:"`.
- `@ton/ton` is **not** in the `pnpm-workspace.yaml` catalog. It is used in `/home/zeta/jetton/package.json` as `"^16.3.0"`. It should be added to `apps/demo-wallet/package.json` as `"@ton/ton": "^16.3.0"` (or cataloged first in `pnpm-workspace.yaml`).
- All path aliases (`@/*` -> `./src/*`) and TypeScript configurations (`tsconfig.app.json`) are already properly set up in `apps/demo-wallet`.
- Build (`pnpm --filter demo-wallet build`) and typecheck (`pnpm typecheck`) scripts are fully established and targetable.

---

## 2. Dependency Audit of `apps/demo-wallet/package.json`

### 2.1 Existing Relevant Dependencies
Inspecting `apps/demo-wallet/package.json` (lines 24-60):
- `"@ton/core": "catalog:"` — Present
- `"@ton/crypto": "catalog:"` — Present
- `"@ton/walletkit": "workspace:*"` — Present
- `"@demo/wallet-core": "workspace:*"` — Present
- `"@demo/v4ledger-adapter": "workspace:*"` — Present
- `"buffer": "catalog:"` — Present
- `"react": "catalog:"` — Present
- `"react-dom": "catalog:"` — Present
- `"react-router-dom": "^7.17.0"` — Present
- `"lucide-react": "^0.562.0"` — Present
- `"sonner": "^2.0.7"` — Present
- `"tailwind-merge": "^3.6.0"` — Present
- `"tailwindcss": "^4.3.1"` — Present

### 2.2 Missing Dependencies Analysis
1. **`@ton/ton`**:
   - **Status**: Missing from `apps/demo-wallet/package.json`.
   - **Usage**: Required by `src/lib/brotherhood/ton.ts` for `TonClient` and `open()` contract calls.
   - **Source Version**: `/home/zeta/jetton/package.json` specifies `"@ton/ton": "^16.3.0"`.
2. **`@tanstack/react-query`**:
   - **Status**: Missing from `apps/demo-wallet/package.json`.
   - **Usage**: Required by `src/lib/brotherhood/queries.ts` for `useQuery`, `useQueryClient`, and contract state caching.
   - **Workspace Catalog Version**: `pnpm-workspace.yaml` catalog specifies `'@tanstack/react-query': ^5.101.0`.

---

## 3. Package Version Comparison Matrix

| Package | Source Project (`/home/zeta/jetton`) | Monorepo Catalog (`pnpm-workspace.yaml`) | `demo-wallet` Status | Recommendation for `demo-wallet` |
|---|---|---|---|---|
| `@ton/core` | `^0.63.1` | `^0.63.1` | Present (`catalog:`) | Keep `"@ton/core": "catalog:"` |
| `@ton/crypto` | `^3.3.0` | `^3.3.0` | Present (`catalog:`) | Keep `"@ton/crypto": "catalog:"` |
| `@ton/ton` | `^16.3.0` | *Not present* | **Missing** | Add `"@ton/ton": "^16.3.0"` |
| `@tanstack/react-query` | `^5.101.4` | `^5.101.0` | **Missing** | Add `"@tanstack/react-query": "catalog:"` |
| `@tanstack/query-core` | *N/A* | `^5.100.14` | *N/A* | Handled via `@tanstack/react-query` |
| `buffer` | `^6.0.3` | `^6.0.3` | Present (`catalog:`) | Keep `"buffer": "catalog:"` |

---

## 4. Workspace Dependencies & Path Mapping Analysis

### 4.1 Internal Monorepo Workspace Dependencies
`apps/demo-wallet/package.json` links:
- `"@demo/v4ledger-adapter": "workspace:*"`
- `"@demo/wallet-core": "workspace:*"`
- `"@ton/walletkit": "workspace:*"`

No additional `workspace:*` dependencies are required for contract wrappers or Brotherhood lib utilities.

### 4.2 Path Mapping Verification
In `apps/demo-wallet/tsconfig.json` and `tsconfig.app.json`:
```json
"baseUrl": ".",
"paths": {
  "@/*": ["./src/*"]
}
```
This enables imports such as:
- `@/contracts/brotherhood/FossFi.gen`
- `@/lib/brotherhood/ton`
- `@/lib/brotherhood/queries`
- `@/lib/brotherhood/deploy`

---

## 5. Build and Typecheck Script Setup

### 5.1 Build Scripts
In `apps/demo-wallet/package.json`:
```json
"scripts": {
  "build": "pnpm build:extension && pnpm build:website",
  "build:extension": "pnpm build:extension:chrome && pnpm build:extension:firefox",
  "build:extension:chrome": "cross-env VITE_APP_ENV=extension TARGET=chrome vite build --config vite.extension.config.ts",
  "build:extension:firefox": "cross-env VITE_APP_ENV=extension TARGET=firefox vite build --config vite.extension.config.ts",
  "build:website": "tsc -b && vite build"
}
```
**Monorepo command**: `pnpm --filter demo-wallet build` (or `pnpm demo-wallet build`).

### 5.2 Typecheck Scripts
In `apps/demo-wallet/package.json`:
```json
"scripts": {
  "typecheck": "tsc --noEmit -p tsconfig.app.json"
}
```
In root `package.json`:
```json
"scripts": {
  "typecheck": "turbo typecheck"
}
```
In `turbo.json`:
```json
"tasks": {
  "typecheck": {
    "cache": false,
    "dependsOn": ["build"]
  }
}
```
**Monorepo command**: `pnpm typecheck` or `pnpm --filter demo-wallet typecheck`.

---

## 6. Actionable Steps for Implementer (Milestone 1)

1. **Edit `apps/demo-wallet/package.json`**:
   Add the following two entries to `"dependencies"`:
   ```json
   "@tanstack/react-query": "catalog:",
   "@ton/ton": "^16.3.0"
   ```
2. **Run `pnpm install`** at repository root to update `pnpm-lock.yaml` and install the new packages into `apps/demo-wallet/node_modules`.
3. **Verify build & typecheck**:
   - `pnpm typecheck`
   - `pnpm --filter demo-wallet build`
