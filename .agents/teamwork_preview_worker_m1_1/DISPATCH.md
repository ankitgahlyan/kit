## 2026-08-12T11:17:27Z
You are teamwork_preview_worker_m1_1 (Worker for Milestone 1: Infrastructure & Contracts).
Your working directory is /home/zeta/.gemini/antigravity/worktrees/kit/implement_jetton_wallet_features/.agents/teamwork_preview_worker_m1_1.

Read requirement specifications and explorer findings from:
- /home/zeta/.gemini/antigravity/worktrees/kit/implement_jetton_wallet_features/.agents/ORIGINAL_REQUEST.md
- /home/zeta/.gemini/antigravity/worktrees/kit/implement_jetton_wallet_features/PROJECT.md
- /home/zeta/.gemini/antigravity/worktrees/kit/implement_jetton_wallet_features/.agents/sub_orch_m1/SCOPE.md
- /home/zeta/.gemini/antigravity/worktrees/kit/implement_jetton_wallet_features/.agents/teamwork_preview_explorer_m1_1/handoff.md
- /home/zeta/.gemini/antigravity/worktrees/kit/implement_jetton_wallet_features/.agents/teamwork_preview_explorer_m1_2/handoff.md
- /home/zeta/.gemini/antigravity/worktrees/kit/implement_jetton_wallet_features/.agents/teamwork_preview_explorer_m1_3/handoff.md

Write ownership:
- `apps/demo-wallet/src/contracts/brotherhood/`
- `apps/demo-wallet/src/lib/brotherhood/`
- `apps/demo-wallet/package.json`

DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Tasks for Milestone 1:
1. Create directory `apps/demo-wallet/src/contracts/brotherhood/` if it does not exist.
2. Copy all 9 contract wrapper files from `/home/zeta/jetton/wrappers-ts/` (`PersonalWallet.gen.ts`, `Personal.gen.ts`, `FossFiWallet.gen.ts`, `FossFi.gen.ts`, `Dao.gen.ts`, `DaoVoter.gen.ts`, `Lottery.gen.ts`, `CityMap.gen.ts`, `Location.gen.ts`) into `apps/demo-wallet/src/contracts/brotherhood/`.
3. Create `apps/demo-wallet/src/contracts/brotherhood/index.ts` re-exporting all wrappers.
4. Create directory `apps/demo-wallet/src/lib/brotherhood/` if it does not exist.
5. Copy lib utilities from `/home/zeta/jetton/src/lib/` (`deploy.ts`, `ton.ts`, `queries.ts`, `jettonContent.ts`, `config.ts`, `contract-cache.ts`) into `apps/demo-wallet/src/lib/brotherhood/`.
6. Adapt all imports in `apps/demo-wallet/src/lib/brotherhood/` so that contract wrapper imports point to `@/contracts/brotherhood/<Wrapper>.gen` (or relative path if preferred) and lib imports point to `@/lib/brotherhood/<util>` or relative `./<util>`.
7. Create `apps/demo-wallet/src/lib/brotherhood/index.ts` re-exporting lib utilities.
8. Add dependencies `@ton/ton`: `"^16.3.0"` and `@tanstack/react-query`: `"catalog:"` to `apps/demo-wallet/package.json`.
9. Run `pnpm install` if needed, then run `pnpm typecheck` and `pnpm --filter demo-wallet build` to verify pass with zero errors.
10. Document commands executed, build and typecheck outputs in your `handoff.md`. Send a completion message to parent when done.
