## 2026-08-12T17:46:33Z
You are teamwork_preview_worker_m1_r2_1 (Worker for Milestone 1, Iteration 2).
Your working directory is /home/zeta/.gemini/antigravity/worktrees/kit/implement_jetton_wallet_features/.agents/teamwork_preview_worker_m1_r2_1.

Read requirement specifications, audit failure evidence, and explorer handoffs:
- /home/zeta/.gemini/antigravity/worktrees/kit/implement_jetton_wallet_features/.agents/ORIGINAL_REQUEST.md
- /home/zeta/.gemini/antigravity/worktrees/kit/implement_jetton_wallet_features/PROJECT.md
- /home/zeta/.gemini/antigravity/worktrees/kit/implement_jetton_wallet_features/.agents/sub_orch_m1/SCOPE.md
- /home/zeta/.gemini/antigravity/worktrees/kit/implement_jetton_wallet_features/.agents/sub_orch_m1/GATE_STATUS.md
- /home/zeta/.gemini/antigravity/worktrees/kit/implement_jetton_wallet_features/.agents/teamwork_preview_auditor_m1_1/audit.md
- /home/zeta/.gemini/antigravity/worktrees/kit/implement_jetton_wallet_features/.agents/teamwork_preview_explorer_m1_r2_1/handoff.md
- /home/zeta/.gemini/antigravity/worktrees/kit/implement_jetton_wallet_features/.agents/teamwork_preview_explorer_m1_r2_2/handoff.md

Write ownership:
- `apps/demo-wallet/src/contracts/brotherhood/`
- `apps/demo-wallet/src/lib/brotherhood/`
- `apps/demo-wallet/tsconfig.app.json`
- `apps/demo-wallet/package.json`

DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Remediation Tasks for Milestone 1 (Iteration 2):
1. Re-copy all 9 contract wrappers from `/home/zeta/jetton/wrappers-ts/` (`PersonalWallet.gen.ts`, `Personal.gen.ts`, `FossFiWallet.gen.ts`, `FossFi.gen.ts`, `Dao.gen.ts`, `DaoVoter.gen.ts`, `Lottery.gen.ts`, `CityMap.gen.ts`, `Location.gen.ts`) into `apps/demo-wallet/src/contracts/brotherhood/` to ensure 100% byte-for-byte fidelity with source wrappers.
2. Remove any invalid test file such as `apps/demo-wallet/src/contracts/brotherhood/__stress_test__.ts`.
3. Ensure clean barrel exports in `apps/demo-wallet/src/contracts/brotherhood/index.ts` without TS2308 star-export collisions.
4. Ensure clean barrel exports in `apps/demo-wallet/src/lib/brotherhood/index.ts`.
5. Adjust compiler options in `apps/demo-wallet/tsconfig.app.json` (`verbatimModuleSyntax`, `erasableSyntaxOnly`, `noUnusedLocals`, `noUnusedParameters` set to false) so that auto-generated contract wrappers pass TypeScript typecheck cleanly without needing manual edits.
6. Verify `pnpm typecheck` (or `pnpm --filter demo-wallet typecheck`) passes with 0 TypeScript errors across the workspace.
7. Verify `pnpm --filter demo-wallet build` succeeds with exit code 0.
8. Document exact command outputs in your `handoff.md` and send a completion message to parent when done.
