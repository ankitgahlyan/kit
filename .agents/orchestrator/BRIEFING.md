# BRIEFING — 2026-08-12T17:24:00Z

## Mission
Implement all BrotherHood (FossFi) contract interaction features in apps/demo-wallet.

## 🔒 My Identity
- Archetype: teamwork_orchestrator
- Roles: orchestrator, user_liaison, human_reporter, successor
- Working directory: /home/zeta/.gemini/antigravity/worktrees/kit/implement_jetton_wallet_features/.agents/orchestrator
- Original parent: parent
- Original parent conversation ID: 7a0ce0af-e3fa-4130-ab2a-0d5c11f2dd6b

## 🔒 My Workflow
- **Pattern**: Project Pattern
- **Scope document**: /home/zeta/.gemini/antigravity/worktrees/kit/implement_jetton_wallet_features/PROJECT.md
1. **Decompose**: Survey codebase via Explorers, build feature inventory & milestone decomposition in PROJECT.md.
2. **Dispatch & Execute**:
   - Top-level orchestrator: Run Survey -> Decompose & Delegate milestones to sub-orchestrators / parallel tracks.
   - Dual Track: Implementation Track + E2E Testing Track.
3. **On failure**: Retry -> Replace -> Skip -> Redistribute -> Redesign -> Escalate.
4. **Succession**: Spawn successor when spawn count >= 20 and subagents complete.

## 🔒 Key Constraints
- NEVER write, modify, or create source code files directly.
- NEVER run build/test commands yourself — require workers to do so.
- NEVER investigate or explore the problem at the code level — dispatch Explorers for technical investigation.
- You MAY use file-editing tools ONLY for metadata/state files (.md) in your .agents/ folder.
- **RAM LIMIT**: Max 4 concurrently running subagents at any time (including sub-orchestrators, explorers, workers, reviewers, challengers, auditors).

## Current Parent
- Conversation ID: 7a0ce0af-e3fa-4130-ab2a-0d5c11f2dd6b
- Updated: not yet

## Key Decisions Made
- Survey phase completed. Synthesized findings into PROJECT.md.
- Milestone 1 (Infrastructure & Contracts) dispatched to sub_orch_m1 (04bc92df-a4e2-4aee-8d3c-d997609562f5).
- Relayed RAM concurrency constraint (max 4 subagents) to sub_orch_m1.

## Team Roster
| Agent | Type | Work Item | Status | Conv ID |
|-------|------|-----------|--------|---------|
| survey_explorer_1 | teamwork_preview_explorer | Contract Wrappers & Lib Survey | completed | 0ce4f969-4721-46db-8aa1-394dd6f2845e |
| survey_explorer_2 | teamwork_preview_explorer | Demo Wallet Architecture Survey | completed | 4515f224-6838-41eb-8fd3-7eb49c527e42 |
| survey_explorer_3 | teamwork_preview_explorer | E2E Test Suite Explorer | completed | dc46b58c-6a7e-4fe5-8ee0-b1027a6a4633 |
| sub_orch_m1 | self | Sub-orchestrator M1 Infrastructure | in-progress | 04bc92df-a4e2-4aee-8d3c-d997609562f5 |

## Succession Status
- Succession required: no
- Spawn count: 4 / 20
- Pending subagents: 04bc92df-a4e2-4aee-8d3c-d997609562f5
- Predecessor: none
- Successor: not yet spawned

## Active Timers
- Heartbeat cron: 23acff7c-a1f9-4f48-ab30-db0295bfa526/task-13
- Safety timer: none

## Artifact Index
- ORIGINAL_REQUEST.md — /home/zeta/.gemini/antigravity/worktrees/kit/implement_jetton_wallet_features/.agents/ORIGINAL_REQUEST.md
- DISPATCH.md — /home/zeta/.gemini/antigravity/worktrees/kit/implement_jetton_wallet_features/.agents/orchestrator/DISPATCH.md
- progress.md — /home/zeta/.gemini/antigravity/worktrees/kit/implement_jetton_wallet_features/.agents/orchestrator/progress.md
- PROJECT.md — /home/zeta/.gemini/antigravity/worktrees/kit/implement_jetton_wallet_features/PROJECT.md
