## 2026-08-12T11:03:48Z
Task:
Investigate all contract wrappers in `/home/zeta/jetton/wrappers-ts/` (`PersonalWallet.gen.ts`, `Personal.gen.ts`, `FossFiWallet.gen.ts`, `FossFi.gen.ts`, `Dao.gen.ts`, `DaoVoter.gen.ts`, `Lottery.gen.ts`, `CityMap.gen.ts`, `Location.gen.ts`), reference material in `/home/zeta/jetton/CONTEXT.md`, `/home/zeta/jetton/PROJECT.md`, and lib utilities in `/home/zeta/jetton/src/lib/` (`deploy.ts`, `ton.ts`, `queries.ts`, `jettonContent.ts`, `useSendFiTransaction.ts`).

Identify and document:
1. Every contract wrapper class, its getters, and its message/transaction sending methods.
2. Every builder function in `deploy.ts` and utility in `ton.ts`, `queries.ts`.
3. Exactly what parameters each operation requires and what state/data it returns.
4. Any dependencies between wrappers or lib files.

Write a complete report with your findings to /home/zeta/.gemini/antigravity/worktrees/kit/implement_jetton_wallet_features/.agents/survey_explorer_1/handoff.md.
Also maintain progress.md in your working directory with a "Last visited" timestamp header.
When finished, send a message to parent reporting completion.
