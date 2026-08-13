# Project: BrotherHood (FossFi) Contract Features for Demo Wallet

## Architecture
- **Location**: `apps/demo-wallet/` in `kit` monorepo
- **Contract Wrappers**: `apps/demo-wallet/src/contracts/brotherhood/`
- **Lib Utilities**: `apps/demo-wallet/src/lib/brotherhood/`
- **Feature Modules**:
  - `apps/demo-wallet/src/features/brotherhood/`
  - `apps/demo-wallet/src/features/personal-jetton/`
  - `apps/demo-wallet/src/features/dao/`
  - `apps/demo-wallet/src/features/lottery/`
  - `apps/demo-wallet/src/features/city-network/`
- **Routing**: `apps/demo-wallet/src/core/routing/app-router.tsx` (`<ProtectedRoute requiresWallet>`)
- **Navigation**: `apps/demo-wallet/src/features/dashboard/components/wallet-dashboard/`
- **Transaction Engine**: `walletKit.handleNewTransaction(wallet, tx)`
- **Read State**: TanStack React Query (`useQuery`) + `TonClient`
- **E2E Testing**: Playwright setup in `apps/demo-wallet/e2e/` with extended `DemoWallet.ts`

## Feature Inventory

| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Contract Wrappers Copy | Copy 9 `.gen.ts` wrappers from `/home/zeta/jetton/wrappers-ts/` to `apps/demo-wallet/src/contracts/brotherhood/` | M1 | R2 |
| 2 | Lib Utilities Copy & Adapt | Copy `deploy.ts`, `ton.ts`, `queries.ts`, `jettonContent.ts` to `apps/demo-wallet/src/lib/brotherhood/` | M1 | R2, R3 |
| 3 | Package Dependencies | Add `@ton/ton` and `@tanstack/react-query` to `apps/demo-wallet/package.json` | M1 | R2 |
| 4 | FI Account Dashboard | FI balance, Gold Coin balance, vote tallies, credit/debt, connections, profile, status | M2 | R1 (brotherhood) |
| 5 | FI Transfer | `buildTransferBody` -> `sendAskToTransfer`, hook `use-fi-transfer.ts` | M2 | R1 (brotherhood) |
| 6 | FI Burn | `buildBurnBody` -> `sendAskToBurn`, hook `use-fi-burn.ts` | M2 | R1 (brotherhood) |
| 7 | Weekly Claim | `sendActClaimWeeklyGrant`, hook `use-weekly-claim.ts`, claim eligibility | M2 | R1 (brotherhood) |
| 8 | Invite Member | `buildInviteBody` -> `sendActInvite`, hook `use-invite-member.ts` | M2 | R1 (brotherhood) |
| 9 | Vote / Unvote | `buildVoteBody`/`buildUnvoteBody` -> `sendActVote`/`sendActUnvote`, hook `use-vote.ts` | M2 | R1 (brotherhood) |
| 10 | Buy Credit | `buildBuyCreditBody` -> `sendBuyCredit`, hook `use-buy-credit.ts` | M2 | R1 (brotherhood) |
| 11 | Repay Debt | `sendRepayDebt`, hook `use-repay-debt.ts` | M2 | R1 (brotherhood) |
| 12 | Grant Allowance | `buildSetAllowanceBody` -> `sendSetAllowance`, hook `use-set-allowance.ts` | M2 | R1 (brotherhood) |
| 13 | Spend Allowance | `buildSpendAllowanceBody` -> `sendSpendAllowance`, hook `use-spend-allowance.ts` | M2 | R1 (brotherhood) |
| 14 | Gold Coins Transfer | `sendAskGoldCoinsTransfer`, hook `use-gold-transfer.ts` | M2 | R1 (brotherhood) |
| 15 | Profile Update | `sendChangeUsername`/`sendChangeCity`, hook `use-profile.ts` | M2 | R1 (brotherhood) |
| 16 | Authority Panel | Guarded panel: `sendSetStatus`, `sendActDispatchAuthorityAction`, `sendAuthorityCloseAccount` | M2 | R1 (brotherhood) |
| 17 | FossFi Master Info | `getJettonData()`, `getTotalAccounts()`, `getDaoAddress()` | M2 | R1 (brotherhood) |
| 18 | Deploy Personal Jetton | Wizard: metadata form -> `buildPersonalMinterDeploy` -> link minter | M3 | R1 (personal-jetton) |
| 19 | Mint Personal Tokens | `sendMintNewJettons`, hook `use-mint-personal.ts` | M3 | R1 (personal-jetton) |
| 20 | Burn Personal Tokens | `sendAskToBurn` on PersonalWallet, hook `use-burn-personal.ts` | M3 | R1 (personal-jetton) |
| 21 | Change Personal Admin | `sendChangeMinterAdmin`, hook `use-change-admin.ts` | M3 | R1 (personal-jetton) |
| 22 | Change Personal Metadata | `sendChangeMinterMetadata`, hook `use-change-metadata.ts` | M3 | R1 (personal-jetton) |
| 23 | Top Up TONs | `sendTopUpTons`, hook `use-top-up.ts` | M3 | R1 (personal-jetton) |
| 24 | Personal Master & Wallet Info | `getJettonData()`, `getState()`, `getWalletData()`, `getPersonalWalletState()` | M3 | R1 (personal-jetton) |
| 25 | DAO Proposal List & Detail | `getDaoData()`, `getProposal(proposalId)`, hooks `use-proposals.ts` | M4 | R1 (dao) |
| 26 | Submit DAO Proposal | `sendActSubmitProposal` via FossFiWallet, hook `use-submit-proposal.ts` | M4 | R1 (dao) |
| 27 | Vote on DAO Proposal | `sendActVoteProposal` via FossFiWallet, hook `use-vote-proposal.ts` | M4 | R1 (dao) |
| 28 | DAO Stats | Total accounts, total proposals, DAO address | M4 | R1 (dao) |
| 29 | Lottery Dashboard | Live prize pool, participant count, phase, deadline | M5 | R1 (lottery) |
| 30 | Enter Lottery | `sendActJoinLottery` via FossFiWallet, hook `use-enter-lottery.ts` | M5 | R1 (lottery) |
| 31 | Lottery Participation Status | `getIsParticipant(addr)` | M5 | R1 (lottery) |
| 32 | Draw Winner | `sendDrawWinner` (shown in reveal phase), hook `use-draw-winner.ts` | M5 | R1 (lottery) |
| 33 | City Browser & City Detail | `Location.getCities()`, `CityMap.getMembers()`, hook `use-cities.ts` | M6 | R1 (city-network) |
| 34 | Register City | Admin `Location.sendLocationRegisterCity`, hook `use-register-city.ts` | M6 | R1 (city-network) |
| 35 | Manage City Members | Admin `CityMap.sendRegisterCityMember`/`sendUnregisterCityMember` | M6 | R1 (city-network) |
| 36 | App Router & Protected Routes | Register routes in `app-router.tsx` with `<ProtectedRoute requiresWallet>` | M7 | R4 |
| 37 | Wallet Dashboard Navigation | Add navigation buttons/tiles to dashboard actions | M7 | R4 |
| 38 | Playwright E2E Fixture Extension | Extend `DemoWallet.ts` with navigation and write operation helpers | M8 | R5 |
| 39 | E2E Spec Files | 5 spec files (`brotherhood`, `personalJetton`, `dao`, `lottery`, `cityNetwork`), >=3 cases each | M8 | R5 |

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Infrastructure & Contracts | Copy wrappers, adapt lib utils, setup package.json deps | None | PLANNED |
| M2 | Brotherhood Core Feature Module | `features/brotherhood/` UI, hooks, getters, authority panel | M1 | PLANNED |
| M3 | Personal Jetton Feature Module | `features/personal-jetton/` UI, wizard, mint, burn, admin hooks | M1 | PLANNED |
| M4 | DAO Governance Feature Module | `features/dao/` UI, proposal list/detail, submit, vote hooks | M1 | PLANNED |
| M5 | Lottery Feature Module | `features/lottery/` UI, dashboard, enter, draw winner hooks | M1 | PLANNED |
| M6 | City Network Feature Module | `features/city-network/` UI, city browser, city detail, admin hooks | M1 | PLANNED |
| M7 | Router & Navigation Integration | AppRouter protected routes & wallet dashboard nav tiles | M2, M3, M4, M5, M6 | PLANNED |
| M8 | E2E Test Suite (Dual Track) | Playwright fixture extension & 5 test spec files | M7 | PLANNED |

## Interface Contracts

### Custom Hooks Interface Contract
All write operation hooks must return:
```ts
export function use<Action>(): {
  send: (params: <ParamsType>) => Promise<void>;
  isSending: boolean;
  error: Error | null;
  isDisabled?: boolean;
}
```

### Component UI Pattern Contract
All feature screens must wrap UI in `NewLayout` and `ScreenHeader`:
```tsx
<NewLayout>
  <ScreenHeader title="<Title>" onBack={() => navigate('/wallet')} />
  {/* Screen body */}
</NewLayout>
```

### `data-testid` Attributes Convention
- Action Buttons: `brotherhood-button`, `personal-jetton-button`, `dao-button`, `lottery-button`, `city-network-button`
- Submit Buttons: `<feature>-<operation>-submit` (e.g. `brotherhood-fi-transfer-submit`, `lottery-enter-button`, `dao-submit-proposal-submit`)
- Input Fields: `<feature>-<operation>-<field>` (e.g. `brotherhood-fi-transfer-recipient`, `personal-deploy-name`)

## Code Layout

```
apps/demo-wallet/src/
├── contracts/
│   └── brotherhood/          ← 9 contract wrappers (.gen.ts)
├── lib/
│   └── brotherhood/          ← deploy.ts, ton.ts, queries.ts, jettonContent.ts
├── features/
│   ├── brotherhood/          ← FossFi Core feature
│   │   ├── hooks/
│   │   ├── components/
│   │   └── index.ts
│   ├── personal-jetton/      ← Personal Token feature
│   │   ├── hooks/
│   │   ├── components/
│   │   └── index.ts
│   ├── dao/                  ← DAO Governance feature
│   │   ├── hooks/
│   │   ├── components/
│   │   └── index.ts
│   ├── lottery/              ← Lottery feature
│   │   ├── hooks/
│   │   ├── components/
│   │   └── index.ts
│   └── city-network/         ← City & Location Registry feature
│       ├── hooks/
│       ├── components/
│       └── index.ts
├── core/
│   └── routing/
│       └── app-router.tsx    ← Protected routes for all features
```
