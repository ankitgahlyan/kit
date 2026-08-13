# Scope: Milestone 1 - Infrastructure & Contracts

## Architecture
- Contract wrappers directory: `apps/demo-wallet/src/contracts/brotherhood/`
- Lib utilities directory: `apps/demo-wallet/src/lib/brotherhood/`
- Demo wallet dependencies: `apps/demo-wallet/package.json`

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Contract Wrappers Copy | Copy 9 `.gen.ts` wrappers from `/home/zeta/jetton/wrappers-ts/` to `apps/demo-wallet/src/contracts/brotherhood/` | M1 | R2 |
| 2 | Lib Utilities Copy & Adapt | Copy `deploy.ts`, `ton.ts`, `queries.ts`, `jettonContent.ts` to `apps/demo-wallet/src/lib/brotherhood/` | M1 | R2, R3 |
| 3 | Package Dependencies | Add `@ton/ton` and `@tanstack/react-query` to `apps/demo-wallet/package.json` | M1 | R2 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Infrastructure & Contracts | Copy wrappers, adapt lib utils, setup package.json deps | None | IN_PROGRESS |

## Interface Contracts
### Contract Import Paths
All features will import contract wrappers from `@/contracts/brotherhood/<wrapper>` or `src/contracts/brotherhood/<wrapper>`.
All features will import shared Brotherhood lib utilities from `@/lib/brotherhood/<util>` or `src/lib/brotherhood/<util>`.

## Code Layout
- `apps/demo-wallet/src/contracts/brotherhood/`
  - `PersonalWallet.gen.ts`
  - `Personal.gen.ts`
  - `FossFiWallet.gen.ts`
  - `FossFi.gen.ts`
  - `Dao.gen.ts`
  - `DaoVoter.gen.ts`
  - `Lottery.gen.ts`
  - `CityMap.gen.ts`
  - `Location.gen.ts`
- `apps/demo-wallet/src/lib/brotherhood/`
  - `deploy.ts`
  - `ton.ts`
  - `queries.ts`
  - `jettonContent.ts`
