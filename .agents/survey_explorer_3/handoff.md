# E2E Test Suite Investigation Report

## 1. Observation

Direct observations from examining the codebase in `apps/demo-wallet/e2e/`, `apps/demo-wallet/src/`, `apps/demo-wallet/e2e.config.ts`, `apps/demo-wallet/package.json`, and root `package.json`:

### 1.1 `DemoWallet.ts` and `demoWalletFixture.ts`
- **Location**: `apps/demo-wallet/e2e/demo-wallet/DemoWallet.ts` (lines 17-145)
  - `DemoWallet` extends `WalletApp` (from `apps/demo-wallet/e2e/qa/WalletApp.ts`).
  - Key methods implemented on `DemoWallet`:
    - `importWallet(mnemonic: string)`: Automates wallet import flow:
      1) Clicks `getByTestId('welcome-add-existing')` (line 32)
      2) Clicks `getByTestId('add-wallet-import')` (line 33)
      3) Fills `password` & `password-confirm` with `this.password` and clicks `password-submit` (lines 36-38)
      4) Clicks `getByTestId('network-select-mainnet')` (line 41)
      5) Writes `mnemonic` to clipboard via `page.evaluate` and clicks `getByTestId('paste-mnemonic')` (lines 42-45)
      6) Clicks `getByTestId('import-wallet-process')` (line 46)
      7) Waits for `getByTestId('wallet-menu')` to be visible (line 49)
      8) Opens `wallet-menu` and clicks `auto-lock` and `hold-to-sign` to disable auto-lock and hold-to-sign during E2E runs (lines 52-56)
    - `connectBy(url: string, shouldSkipConnect: boolean = false, confirm: boolean = true)`: Clicks `connect-dapp-button`, fills `tonconnect-url`, clicks `tonconnect-process`, then calls `connect(confirm)` (lines 60-72).
    - `connect(confirm: boolean = true, skipConnect: boolean = false)`: Waits for `connect-request` modal, clicks `connect-approve` or `connect-reject`, waits for modal detachment (lines 74-88).
    - `signData(confirm: boolean = true)`: Waits for `sign-data-request` modal, clicks `sign-data-approve` or `sign-data-reject`, waits for modal detachment (lines 90-99).
    - `sendTransaction(isPositiveCase: boolean, confirm: boolean, waitBeforeApprove: number = 0)`: Waits and delegates to `accept(confirm)` (lines 101-107).
    - `accept(confirm: boolean = true)`: Waits for `transaction-request` modal, clicks `send-transaction-approve` or `send-transaction-reject`, waits for modal detachment (lines 109-118).
    - `sendTonToSelf(amount: string, confirm: boolean = true)`: Local in-wallet TON transfer test helper:
      1) Clicks `getByTestId('send-button')` (line 128)
      2) Clicks `getByTestId('use-my-address')` (line 131)
      3) Fills `getByTestId('send-amount-input')` (line 134)
      4) Clicks `getByTestId('send-submit')` (line 137)
      5) Waits for `send-transaction-approve` or `send-transaction-reject` (lines 140-142) and clicks it.

- **Location**: `apps/demo-wallet/e2e/demo-wallet/demoWalletFixture.ts` (lines 32-83)
  - `demoWalletFixture(config: ConfigFixture, slowMo = 0)` extends Playwright's `test` fixture with:
    - `context`: Launches persistent Chromium browser context (with web app or chrome extension loaded).
    - `app`: Creates page and navigates to `config.appUrl` (dApp target).
    - `widget`: Instantiates `TonConnectWidget(app)` wrapper for dApp side.
    - `wallet`: Instantiates `DemoWallet(context, source)` and automatically invokes `app.importWallet(mnemonic)` before yielding `wallet` to test cases.
  - Exported helper function `testWithDemoWalletFixture(config, slowMo)` is used by specs to construct the configured `test` runner.

### 1.2 Existing Spec Files
- **Location**: `apps/demo-wallet/e2e/localSendTransaction.spec.ts` (lines 14-57)
  - Tests in-wallet transaction flow via `wallet.sendTonToSelf(amount, confirm)`.
  - Asserts that after approving local transfer, the page returns to dashboard by verifying `getByTestId('wallet-menu')` is visible.
- **Location**: `apps/demo-wallet/e2e/connect.spec.ts` & `signData.spec.ts`
  - Test TonConnect dApp integration via `runConnectTest` and `runSignDataTest` from `runTest.ts`.
- **Location**: `apps/demo-wallet/e2e/ui-tests/importWallet.spec.ts` (lines 13-124)
  - Uses `testWithUIFixture()` from `UITestFixture.ts` (lightweight fixture without full dApp widget).
  - Tests wallet import matrix across networks (`mainnet`/`testnet`), versions (`v4r2`/`v5r1`), and interface types (`mnemonic`/`signer`).
  - Tests validation scenarios (empty mnemonic, word count < 12, clear button).
- **Location**: `apps/demo-wallet/e2e/sendTransaction/` (`sendTransaction1.spec.ts` through `sendTransaction5.spec.ts`)
  - Tests various TonConnect transaction payload parameters and rejection/approval cases.

### 1.3 `data-testid` Naming Conventions in Codebase
Searching across `apps/demo-wallet/src/` reveals existing testid naming patterns:
- Navigation & Action Buttons: `<feature>-button`
  - `send-button`, `swap-button`, `stake-button`, `connect-dapp-button`
- Input Fields: `<feature>-<field>-input` or `<feature>-<field>`
  - `recipient-input`, `send-amount-input`, `password`, `password-confirm`, `tonconnect-url`
- Action / Submit Buttons: `<feature>-submit` or `<feature>-process`
  - `send-submit`, `password-submit`, `import-wallet-process`, `create-wallet-confirm`
- Navigation Containers & Screen Layouts:
  - `wallet-menu`, `mnemonic-grid`, `word-count`
- Transaction Confirmation Modal (Global Modal):
  - Modal container: `transaction-request`
  - Approve button: `send-transaction-approve`
  - Reject button: `send-transaction-reject`

### 1.4 E2E Test Execution Scripts & Configuration
- **`apps/demo-wallet/package.json`**:
  - `"e2e"`: `"playwright test --config e2e.config.ts --retries=3"`
  - `"e2e:deps"`: `"playwright install --with-deps"`
- **`package.json` (monorepo root)**:
  - `"e2e"`: `"turbo e2e"`
- **`apps/demo-wallet/e2e.config.ts`**:
  - `testDir`: `./e2e`
  - `timeout`: Reads `process.env.TIMEOUT` or defaults to `60_000` (60s).
  - `webServer`: If `E2E_WALLET_SOURCE_EXTENSION` is not set, automatically executes `pnpm --filter demo-wallet dev` targeting `http://localhost:5173/` with `reuseExistingServer: true`.
  - `permissions`: `['clipboard-read', 'clipboard-write']`.
  - `reporter`: `['list']`, `['html']`, `['allure-playwright']`.

---

## 2. Logic Chain

### 2.1 Extension Plan for `DemoWallet.ts`
To test all new BrotherHood / FossFi contract features across the 5 required spec files (`brotherhood.spec.ts`, `personalJetton.spec.ts`, `dao.spec.ts`, `lottery.spec.ts`, `cityNetwork.spec.ts`), `DemoWallet.ts` must be extended with generic navigation and form interaction helpers:

1. **Navigation Helpers**:
   - `navigateToBrotherhood()`: `(await this.open()).getByTestId('brotherhood-button').click()`
   - `navigateToPersonalJetton()`: `(await this.open()).getByTestId('personal-jetton-button').click()`
   - `navigateToDao()`: `(await this.open()).getByTestId('dao-button').click()`
   - `navigateToLottery()`: `(await this.open()).getByTestId('lottery-button').click()`
   - `navigateToCityNetwork()`: `(await this.open()).getByTestId('city-network-button').click()`

2. **Form Interaction & Transaction Confirmation Helpers**:
   Every write operation in demo-wallet follows a 3-step pattern:
   Form entry → Click submit → `TransactionRequestModal` appears → Approve/Reject → Toast/State assertion.

   Helper methods to add to `DemoWallet.ts`:
   - **Brotherhood helpers**:
     - `fiTransfer(recipient: string, amount: string, confirm = true)`
     - `fiBurn(amount: string, confirm = true)`
     - `claimWeeklyGrant(confirm = true)`
     - `inviteMember(recipient: string, username: string, city: string, cityLetter: string, confirm = true)`
     - `voteMember(address: string, isVote: boolean, confirm = true)`
   - **Personal Jetton helpers**:
     - `deployPersonalJetton(metadata: { name: string; symbol: string; description: string }, confirm = true)`
     - `mintPersonalTokens(recipient: string, amount: string, confirm = true)`
     - `burnPersonalTokens(amount: string, confirm = true)`
     - `changePersonalAdmin(newAdmin: string, confirm = true)`
   - **DAO helpers**:
     - `submitDaoProposal(title: string, description: string, confirm = true)`
     - `voteDaoProposal(proposalId: string, choice: 'yes' | 'no', confirm = true)`
   - **Lottery helpers**:
     - `enterLottery(confirm = true)`
   - **City Network helpers**:
     - `browseCities()`
     - `selectCity(cityId: string)`

3. **Transaction Modal Helper (`approveTransactionModal`)**:
   In `DemoWallet.ts`, all write actions trigger `TransactionRequestModal`. The existing `accept(confirm)` method can be reused or extended:
   ```ts
   async handleTransactionModal(confirm: boolean = true): Promise<void> {
       const app = await this.open();
       const chose = app.getByTestId(confirm ? 'send-transaction-approve' : 'send-transaction-reject');
       await chose.waitFor({ state: 'visible' });
       await chose.click();
       await chose.waitFor({ state: 'detached' });
   }
   ```

### 2.2 Standardized `data-testid` Naming Scheme for New Features
Following R4 requirements and matching existing codebase conventions:

| Feature Area | Component / Element | `data-testid` |
|---|---|---|
| Dashboard Navigation | Brotherhood Button | `brotherhood-button` |
| Dashboard Navigation | Personal Token Button | `personal-jetton-button` |
| Dashboard Navigation | DAO Governance Button | `dao-button` |
| Dashboard Navigation | Lottery Button | `lottery-button` |
| Dashboard Navigation | City Network Button | `city-network-button` |
| **Brotherhood** | Dashboard Screen | `brotherhood-dashboard` |
| Brotherhood | Transfer Form Inputs & Submit | `brotherhood-fi-transfer-recipient`, `brotherhood-fi-transfer-amount`, `brotherhood-fi-transfer-submit` |
| Brotherhood | Burn Form Inputs & Submit | `brotherhood-fi-burn-amount`, `brotherhood-fi-burn-submit` |
| Brotherhood | Weekly Claim Button | `brotherhood-weekly-claim-submit` |
| Brotherhood | Invite Form Inputs & Submit | `brotherhood-invite-recipient`, `brotherhood-invite-username`, `brotherhood-invite-city`, `brotherhood-invite-letter`, `brotherhood-invite-submit` |
| Brotherhood | Vote Form Inputs & Submit | `brotherhood-vote-recipient`, `brotherhood-vote-submit`, `brotherhood-unvote-submit` |
| **Personal Jetton** | Deploy Form Inputs & Submit | `personal-deploy-name`, `personal-deploy-symbol`, `personal-deploy-desc`, `personal-deploy-submit` |
| Personal Jetton | Mint Form Inputs & Submit | `personal-mint-recipient`, `personal-mint-amount`, `personal-mint-submit` |
| Personal Jetton | Burn Form Inputs & Submit | `personal-burn-amount`, `personal-burn-submit` |
| Personal Jetton | Change Admin Input & Submit | `personal-change-admin-address`, `personal-change-admin-submit` |
| **DAO** | Proposal List & Items | `dao-proposals-list`, `dao-proposal-item-<id>` |
| DAO | Submit Proposal Inputs & Submit | `dao-proposal-title-input`, `dao-proposal-desc-input`, `dao-submit-proposal-submit` |
| DAO | Vote Buttons | `dao-vote-yes-button`, `dao-vote-no-button` |
| **Lottery** | Dashboard & Entry | `lottery-dashboard`, `lottery-enter-button`, `lottery-draw-button` |
| **City Network** | City Browser & Details | `city-network-dashboard`, `city-list`, `city-item-<letter>`, `city-detail-<name>` |

### 2.3 Required E2E Spec Files Structure
The requirement (R5) specifies 5 new Playwright spec files:
1. `e2e/brotherhood.spec.ts`:
   - Case 1: UI Renders after wallet import (navigation button visible, dashboard loads).
   - Case 2: Form validation works (empty recipient/amount shows error, submit disabled).
   - Case 3: Full FI transfer flow (fill inputs → click submit → modal appears → approve transaction → success state).
2. `e2e/personalJetton.spec.ts`:
   - Case 1: Jetton feature UI renders correctly.
   - Case 2: Deploy wizard validation (invalid symbol / empty metadata).
   - Case 3: Full deploy / mint token flow.
3. `e2e/dao.spec.ts`:
   - Case 1: DAO proposals list renders.
   - Case 2: Submit proposal validation (empty title/description).
   - Case 3: Submit proposal & vote on proposal flow.
4. `e2e/lottery.spec.ts`:
   - Case 1: Lottery dashboard renders prize pool & participant count.
   - Case 2: Entry button status (disabled if insufficient funds or already entered).
   - Case 3: Enter lottery interaction flow.
5. `e2e/cityNetwork.spec.ts`:
   - Case 1: City browser list renders grouped by letter key.
   - Case 2: Filter/search or empty city handling.
   - Case 3: Click city to view city detail and member list.

---

## 3. Caveats

1. **Local Dev Server Execution**: Running E2E tests locally relies on `webServer` in `e2e.config.ts` launching Vite dev server on port 5173. If port 5173 is occupied, Playwright may reuse an existing server or fail if the server state is stale.
2. **Network Dependency / Mocking**: On-chain read queries (e.g. `TonClient` calls in `queries.ts`) will attempt to contact TON RPC endpoints unless testnet fallback or mock clients are used in test environment.
3. **Wallet Mnemonic Requirement**: `WALLET_MNEMONIC` environment variable must contain a valid 24-word seed phrase when running E2E tests, or tests requiring wallet state will skip or fail during import.

---

## 4. Conclusion

- The Playwright E2E testing framework in `apps/demo-wallet/e2e/` is clean, robust, and well-structured.
- Extending `DemoWallet.ts` with dedicated helper methods for Brotherhood, Personal Jetton, DAO, Lottery, and City Network allows E2E test specs to be concise, readable, and consistent with existing specs like `localSendTransaction.spec.ts`.
- Adopting the standardized `<feature>-<element>` `data-testid` naming convention across components will ensure reliable locator strategy for all 5 new E2E test suites.

---

## 5. Verification Method

To verify the E2E setup and spec executions:

1. **Verify E2E Test Suite Command**:
   ```bash
   pnpm --filter demo-wallet e2e
   ```
2. **Verify Specific Spec Execution**:
   ```bash
   pnpm --filter demo-wallet e2e e2e/brotherhood.spec.ts
   pnpm --filter demo-wallet e2e e2e/personalJetton.spec.ts
   pnpm --filter demo-wallet e2e e2e/dao.spec.ts
   pnpm --filter demo-wallet e2e e2e/lottery.spec.ts
   pnpm --filter demo-wallet e2e e2e/cityNetwork.spec.ts
   ```
3. **Inspect Files**:
   - `apps/demo-wallet/e2e/demo-wallet/DemoWallet.ts`
   - `apps/demo-wallet/e2e.config.ts`
   - `apps/demo-wallet/e2e/brotherhood.spec.ts`
   - `apps/demo-wallet/e2e/personalJetton.spec.ts`
   - `apps/demo-wallet/e2e/dao.spec.ts`
   - `apps/demo-wallet/e2e/lottery.spec.ts`
   - `apps/demo-wallet/e2e/cityNetwork.spec.ts`
4. **Invalidation Conditions**:
   - Mismatched `data-testid` between UI components and Playwright locators.
   - Missing `WALLET_MNEMONIC` causing wallet import step in `demoWalletFixture` to throw.
   - Dev server startup failures or port conflicts on port 5173.
