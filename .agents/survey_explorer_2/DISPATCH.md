## 2026-08-12T11:03:48Z
You are survey_explorer_2 (teamwork_preview_explorer).
Your working directory is /home/zeta/.gemini/antigravity/worktrees/kit/implement_jetton_wallet_features/.agents/survey_explorer_2.
Read the full requirement details from /home/zeta/.gemini/antigravity/worktrees/kit/implement_jetton_wallet_features/.agents/ORIGINAL_REQUEST.md.

Task:
Investigate the existing codebase architecture in `apps/demo-wallet/`.
Analyze:
1. Existing feature modules in `apps/demo-wallet/src/features/send/`, `staking/`, `swap/`, `dashboard/`.
2. Router structure in `apps/demo-wallet/src/core/routing/app-router.tsx`.
3. Wallet store and network settings (`savedWallets`, active network toggle, network passing).
4. Write operation handling pattern using `walletKit.handleNewTransaction(wallet, tx)`.
5. UI layout components (`NewLayout`, `ScreenHeader`), styling conventions, toast/modal system, and existing component library (`components.json`, shadcn).
6. Monorepo dependencies (`package.json`) and existing `@ton/core`, `@ton/ton` packages.

Write a complete report with your findings to /home/zeta/.gemini/antigravity/worktrees/kit/implement_jetton_wallet_features/.agents/survey_explorer_2/handoff.md.
Also maintain progress.md in your working directory with a "Last visited" timestamp header.
When finished, send a message to parent reporting completion.
