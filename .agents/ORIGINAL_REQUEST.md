# Original User Request

## Initial Request — 2026-08-12T16:32:18Z

Implement all **BrotherHood (FossFi)** contract interaction features in `apps/demo-wallet` of the `kit` monorepo at `/home/zeta/.gemini/antigravity/worktrees/kit/implement_jetton_wallet_features`. The new features must follow the same architecture as the existing send/swap/staking features and be powered by the TypeScript contract wrappers in `/home/zeta/jetton/wrappers-ts/` and lib utilities in `/home/zeta/jetton/src/lib/`.

Working directory: /home/zeta/.gemini/antigravity/worktrees/kit/implement_jetton_wallet_features

Integrity mode: development

---

## Reference Material

**Read all of these before writing a single line of code:**

1. **Domain language** — `/home/zeta/jetton/CONTEXT.md` — canonical names (Member, Account, FI, Invite, Vote, Gold Coin, Allowance, Authority, Weekly Claim, Lottery, Personal Token, Loan, Debt, Closure, Report…)
2. **Project architecture** — `/home/zeta/jetton/PROJECT.md` — embedded wallet architecture, milestones, interface contracts
3. **Contract wrappers** — every `.gen.ts` in `/home/zeta/jetton/wrappers-ts/` — `PersonalWallet.gen.ts`, `Personal.gen.ts`, `FossFiWallet.gen.ts`, `FossFi.gen.ts`, `Dao.gen.ts`, `DaoVoter.gen.ts`, `Lottery.gen.ts`, `CityMap.gen.ts`, `Location.gen.ts`
4. **Message builders** — `/home/zeta/jetton/src/lib/deploy.ts` — `buildTransferBody`, `buildBurnBody`, `buildMintBody`, `buildInviteBody`, `buildVoteBody`, `buildBuyCreditBody`, `buildDestroyBody`, `buildSetAllowanceBody`, `buildSpendAllowanceBody`, `buildPersonalMinterDeploy`, etc.
5. **On-chain query utilities** — `/home/zeta/jetton/src/lib/ton.ts` — `getTonClient`, `getWalletAddress`, `getFiWalletState`, `fetchJettonMaster`, `fetchWalletBalance`, `getCircle`, `getPersonalMinterForIssuer`, `listAllowances`
6. **React Query hooks** — `/home/zeta/jetton/src/lib/queries.ts` — `useJettonMaster`, `useFiWalletState`, `useWalletBalance`, `useCircle`, `usePersonalMinterForIssuer`
7. **Transaction hook** — `/home/zeta/jetton/src/lib/useSendFiTransaction.ts` — the `sendTransaction()` entry point pattern with `{ loading, status, setStatus }`
8. **Existing feature pattern** — `apps/demo-wallet/src/features/send/`, `staking/`, `swap/` — hooks return `{ send, isDisabled }`, components use `NewLayout` + `ScreenHeader`, feature is barrel-exported from `index.ts`
9. **Router** — `apps/demo-wallet/src/core/routing/app-router.tsx` — React Router v6 `<Routes>` with `<ProtectedRoute requiresWallet>` wrapper
10. **E2E fixture** — `apps/demo-wallet/e2e/demo-wallet/DemoWallet.ts` + `demoWalletFixture.ts` + `localSendTransaction.spec.ts` — Playwright fixture pattern with `testWithDemoWalletFixture`, `wallet.open()`, `wallet.close()`, `getByTestId`

---

## Requirements

### R1. Feature Modules for All 9 Contract Wrappers

Add one or more feature modules in `apps/demo-wallet/src/features/` covering every contract in `/home/zeta/jetton/wrappers-ts/`. Each module must follow the structure:

```
features/<name>/
  hooks/use-<operation>.ts   ← business logic, returns { send, isDisabled } or { data, isLoading }
  components/<component>/
    <component>.tsx            ← UI with NewLayout + ScreenHeader
    index.ts                   ← barrel re-export
  index.ts                     ← feature barrel (all public exports)
```

#### `features/brotherhood/` — FossFi Core Account (FossFi.gen.ts + FossFiWallet.gen.ts)

- **Account Dashboard** — read-only screen showing: FI balance, Gold Coin balance, vote tallies (votes given / receivedVotes), credit line / debt, connections count, profile (username, city), status (active/suspended/under-review). Source: `getWalletDataAll()` → `FiWalletStore`.
- **FI Transfer** — `buildTransferBody()` → `sendAskToTransfer`. Hook: `use-fi-transfer.ts`.
- **FI Burn** — `buildBurnBody()` → `sendAskToBurn`. Hook: `use-fi-burn.ts`.
- **Weekly Claim** — `sendActClaimWeeklyGrant`. Hook: `use-weekly-claim.ts`. Shows next-claim eligibility.
- **Invite Member** — `buildInviteBody()` → `sendActInvite`. Form: recipient TON address, username, city, city letter. Hook: `use-invite-member.ts`.
- **Vote / Unvote** — `buildVoteBody()` / `buildUnvoteBody()` → `sendActVote` / `sendActUnvote`. Hook: `use-vote.ts`. Single form toggling between vote/unvote.
- **Buy Credit** — `buildBuyCreditBody()` → `sendBuyCredit`. Hook: `use-buy-credit.ts`.
- **Repay Debt** — `sendRepayDebt`. Hook: `use-repay-debt.ts`.
- **Grant Allowance** — `buildSetAllowanceBody()` → `sendSetAllowance`. Hook: `use-set-allowance.ts`.
- **Spend Allowance** — `buildSpendAllowanceBody()` → `sendSpendAllowance`. Hook: `use-spend-allowance.ts`.
- **Gold Coins Transfer** — `sendAskGoldCoinsTransfer`. Hook: `use-gold-transfer.ts`.
- **Profile Update** — `sendChangeUsername` / `sendChangeCity`. Hook: `use-profile.ts`.
- **Authority Panel** *(guarded: only show when `isAuthorityAccount === true`)* — `sendSetStatus`, `sendActDispatchAuthorityAction`, `sendAuthorityCloseAccount`. Hook: `use-authority-actions.ts`.
- **FossFi Master Info** — `FossFi.getJettonData()`, `FossFi.getTotalAccounts()`, `FossFi.getDaoAddress()`. Read-only view.

#### `features/personal-jetton/` — Personal Token Economy (Personal.gen.ts + PersonalWallet.gen.ts)

- **Deploy Jetton Master** — wizard: metadata form → `buildPersonalMinterDeploy()` → deploy transaction + `buildPointPersonalMinterBody()` to link issuer's FI wallet. Hook: `use-deploy-personal-jetton.ts`.
- **Mint Tokens** — `sendMintNewJettons` with `MintNewJettons` body. Hook: `use-mint-personal.ts`.
- **Burn Tokens** — `sendAskToBurn` on `PersonalWallet`. Hook: `use-burn-personal.ts`.
- **Change Admin** — `sendChangeMinterAdmin`. Hook: `use-change-admin.ts`.
- **Change Metadata** — `sendChangeMinterMetadata`. Hook: `use-change-metadata.ts`.
- **Top Up TONs** — `sendTopUpTons`. Hook: `use-top-up.ts`.
- **Jetton Master Info** — `getJettonData()`, `getState()`. Read-only: total supply, admin address, FI jetton address, version.
- **Wallet Info** — `getWalletData()`, `getPersonalWalletState()`. Read-only: personal balance, owner, minter address.

#### `features/dao/` — DAO Governance (Dao.gen.ts + DaoVoter.gen.ts)

- **Proposal List** — `getDaoData()` → list proposals with title, for/against counts, deadline. Hook: `use-proposals.ts`.
- **Proposal Detail** — `getProposal(proposalId)`. Read-only expanded view.
- **Submit Proposal** — `sendActSubmitProposal` via `FossFiWallet`. Hook: `use-submit-proposal.ts`.
- **Vote on Proposal** — `sendActVoteProposal` via `FossFiWallet`. Yes/No selection. Hook: `use-vote-proposal.ts`.
- **DAO Stats** — total accounts, total proposals, DAO address.

#### `features/lottery/` — Lottery Game (Lottery.gen.ts)

- **Lottery Dashboard** — `getPrizePool()`, `getParticipantCount()`, `getCurrentPhase()`, `getDeadline()`. Live read-only view.
- **Enter Lottery** — `sendActJoinLottery` via `FossFiWallet` (or `sendEnterLottery` on `Lottery`). Shows entry amount required. Hook: `use-enter-lottery.ts`.
- **Participation Status** — `getIsParticipant(addr)`. Shows whether connected wallet is already entered.
- **Draw Winner** — `sendDrawWinner`. Shown only when `getCurrentPhase()` indicates reveal phase. Hook: `use-draw-winner.ts`.

#### `features/city-network/` — City & Location Registry (CityMap.gen.ts + Location.gen.ts)

- **City Browser** — `Location.getCities()`. Grouped by letter key. Hook: `use-cities.ts`.
- **City Detail** — `CityMap.getMembers()`, `CityMap.getCityName()`. View members of a city.
- **Register City** *(admin)* — `Location.sendLocationRegisterCity`. Hook: `use-register-city.ts`.
- **Register/Unregister Member** *(admin)* — `CityMap.sendRegisterCityMember` / `sendUnregisterCityMember`. Hook: `use-manage-member.ts`.

---

### R2. Contract Wrappers Integration

Copy (do **not** symlink) the wrapper files from `/home/zeta/jetton/wrappers-ts/` into `apps/demo-wallet/src/contracts/brotherhood/` and import from there. Also copy the relevant lib utilities from `/home/zeta/jetton/src/lib/` (`deploy.ts`, `ton.ts`, `queries.ts`, `jettonContent.ts`) into `apps/demo-wallet/src/lib/brotherhood/`, adapting any imports as needed for the demo-wallet's package structure.

Ensure `@ton/core` and `@ton/ton` are already in the demo-wallet's `package.json` (add them if missing).

### R3. Transaction Signing Architecture

- **Read-only operations**: Use `TonClient` from `src/lib/brotherhood/ton.ts` (adapted from `/home/zeta/jetton/src/lib/ton.ts`). Wrap with TanStack React Query hooks (`useQuery`) for caching and loading state.
- **Write operations**: Adapt the `useSendFiTransaction` pattern from `/home/zeta/jetton/src/lib/useSendFiTransaction.ts`. In the demo-wallet, map `wallet.sendTransaction()` to the existing `walletKit.handleNewTransaction(wallet, tx)` call pattern (as used in `features/send/hooks/use-send-token.ts`). Return `{ send, isSending, error }` matching the existing hooks.
- **Network**: Read the active network from the demo-wallet's existing wallet store (`savedWallets.find(w => w.id === activeWalletId)?.network`) and pass it to `getTonClient(network)`.

### R4. UI Integration

- Add routes to `apps/demo-wallet/src/core/routing/app-router.tsx` for each major feature group, all wrapped in `<ProtectedRoute requiresWallet>`.
- Add navigation buttons to the wallet dashboard (`features/dashboard/components/wallet-dashboard/`) for the new feature areas.
- Use the existing `NewLayout` + `ScreenHeader` component pattern for all screens.
- Use the existing Tailwind + shadcn/ui component library. No new UI dependencies.
- Every write-operation feature must have: **form → confirmation step (via the existing transaction modal) → success/error toast**.
- Every read-only feature must show: **loading skeleton, error state, and empty state**.
- All interactive elements must have `data-testid` attributes following the naming convention: `<feature>-<element>` (e.g., `lottery-enter-button`, `dao-submit-proposal`, `brotherhood-fi-transfer-submit`).

### R5. End-to-End Tests

Write Playwright E2E tests in `apps/demo-wallet/e2e/`, using the exact test fixture pattern from `e2e/demo-wallet/DemoWallet.ts` and `testWithDemoWalletFixture`.

Extend `DemoWallet.ts` with helper methods for each new feature flow (e.g., `wallet.enterLottery()`, `wallet.submitProposal()`, `wallet.inviteMember()`, `wallet.fiTransfer()`).

Create these spec files:
- `e2e/brotherhood.spec.ts` — FI transfer, burn, weekly claim, invite, vote
- `e2e/personalJetton.spec.ts` — deploy minter, mint, burn, change admin
- `e2e/dao.spec.ts` — view proposals, submit proposal, vote on proposal
- `e2e/lottery.spec.ts` — view lottery, enter lottery, participation status
- `e2e/cityNetwork.spec.ts` — browse cities, view city detail

Each feature must have **at minimum 3 test cases**:
1. The feature UI renders correctly after wallet import (navigation button visible, screen loads).
2. Form validation works (invalid/empty inputs show errors, submit is disabled).
3. The full interaction flow (fill form → submit → transaction modal appears → approve → success state).

---

## Acceptance Criteria

### Build & Type Safety
- [ ] `pnpm typecheck` passes with zero TypeScript errors across the monorepo
- [ ] `pnpm build` succeeds for `apps/demo-wallet`
- [ ] No ESLint errors in any new file

### Feature Completeness
- [ ] All 9 contract wrapper types have at least one feature module in `apps/demo-wallet/src/features/`
- [ ] Every user-actionable `send*` method from the wrappers has a working UI flow
- [ ] Every `get*` getter returning user-relevant data has a read-only display
- [ ] Authority Panel features are hidden unless `isAuthorityAccount === true`
- [ ] New features respect the testnet/mainnet network toggle

### E2E Tests
- [ ] All 5 new E2E spec files pass when run with the existing test runner (check `apps/demo-wallet/package.json` for the exact `test:e2e` or equivalent script)
- [ ] Each new feature has at minimum 3 passing E2E test cases
- [ ] No existing E2E tests (`localSendTransaction.spec.ts`, `connect.spec.ts`, `signData.spec.ts`, `ui-tests/`) are broken

### UX Quality
- [ ] All new features are reachable from the wallet dashboard navigation
- [ ] Each feature shows loading skeletons, error states, and success feedback
- [ ] All interactive elements have `data-testid` attributes
- [ ] No console errors or unhandled React warnings in normal feature usage

## Follow-up — 2026-08-12T11:50:57Z

IMPORTANT CONSTRAINT FROM USER: The user is low on RAM. Please limit the total number of concurrently running subagents to **4 at any time** (including sub-orchestrators, explorers, and worker agents). Do not spawn new agents until existing ones have finished. Pass this constraint down to all active sub-orchestrators immediately.

## Follow-up — 2026-08-12T12:23:28Z

UPDATED CONSTRAINT FROM USER: The user has increased the parallel agent limit. You may now run up to **7 agents concurrently**. Feel free to parallelize milestones M2–M6 (feature modules) once M1 passes its gate. Please propagate this to all active sub-orchestrators.
