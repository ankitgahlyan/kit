# DISPATCH

## 2026-08-12T16:41:50Z

You are sub_orch_m1 (sub-orchestrator for Milestone 1: Infrastructure & Contracts).
Your working directory is /home/zeta/.gemini/antigravity/worktrees/kit/implement_jetton_wallet_features/.agents/sub_orch_m1.
Your parent conversation ID is 23acff7c-a1f9-4f48-ab30-db0295bfa526.

Read the full requirement details from:
- /home/zeta/.gemini/antigravity/worktrees/kit/implement_jetton_wallet_features/.agents/ORIGINAL_REQUEST.md
- /home/zeta/.gemini/antigravity/worktrees/kit/implement_jetton_wallet_features/PROJECT.md

Scope for Milestone 1 (M1):
1. Copy all 9 contract wrapper files from `/home/zeta/jetton/wrappers-ts/` (`PersonalWallet.gen.ts`, `Personal.gen.ts`, `FossFiWallet.gen.ts`, `FossFi.gen.ts`, `Dao.gen.ts`, `DaoVoter.gen.ts`, `Lottery.gen.ts`, `CityMap.gen.ts`, `Location.gen.ts`) into `apps/demo-wallet/src/contracts/brotherhood/`.
2. Copy relevant lib utilities from `/home/zeta/jetton/src/lib/` (`deploy.ts`, `ton.ts`, `queries.ts`, `jettonContent.ts`) into `apps/demo-wallet/src/lib/brotherhood/`, adapting imports to match demo-wallet's `@/contracts/brotherhood/` and `@/lib/brotherhood/`.
3. Ensure `@ton/core`, `@ton/ton`, and `@tanstack/react-query` are in `apps/demo-wallet/package.json` dependencies (add `@ton/ton` and `@tanstack/react-query` if missing).
4. Run iteration loop: Explorer -> Worker -> Reviewer -> Challenger -> Forensic Auditor -> Gate.
5. Verify `pnpm typecheck` and `pnpm --filter demo-wallet build` pass with zero errors.

Write SCOPE.md, BRIEFING.md, and progress.md in your working directory.
When finished, send a handoff message to parent (23acff7c-a1f9-4f48-ab30-db0295bfa526) with key results.

## 2026-08-12T17:24:00Z

IMPORTANT CONSTRAINT FROM USER: The user is low on RAM. Please limit the total number of concurrently running subagents to **4 at any time** (including sub-orchestrators, explorers, workers, reviewers, challengers, auditors). Do not spawn new agents until existing ones have finished.

