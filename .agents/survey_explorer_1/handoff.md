# Contract Wrappers & Lib Utilities Investigation Report

## 1. Observation

### Summary of Source Files Investigated
- **Contract Wrappers Location**: `/home/zeta/jetton/wrappers-ts/`
  1. `PersonalWallet.gen.ts` (1,152 lines)
  2. `Personal.gen.ts` (1,365 lines)
  3. `FossFiWallet.gen.ts` (4,194 lines)
  4. `FossFi.gen.ts` (2,408 lines)
  5. `Dao.gen.ts` (998 lines)
  6. `DaoVoter.gen.ts` (435 lines)
  7. `Lottery.gen.ts` (646 lines)
  8. `CityMap.gen.ts` (637 lines)
  9. `Location.gen.ts` (807 lines)
- **Library Utilities Location**: `/home/zeta/jetton/src/lib/`
  1. `deploy.ts` (324 lines)
  2. `ton.ts` (284 lines)
  3. `queries.ts` (148 lines)
  4. `jettonContent.ts` (156 lines)
  5. `useSendFiTransaction.ts` (77 lines)
- **Reference Documentation**:
  1. `/home/zeta/jetton/CONTEXT.md` (BrotherHood domain vocabulary and concepts)
  2. `/home/zeta/jetton/PROJECT.md` (Embedded wallet architecture and migration specs)

---

### Detailed Contract Wrapper Inventory

#### 1. `PersonalWallet` (`PersonalWallet.gen.ts`)
- **Class**: `export class PersonalWallet implements Contract`
- **Code Cell**: `PersonalWallet.CodeCell` (base64 TVM cell)
- **Error Codes**:
  - `BalanceError`: 47
  - `NotEnoughGas`: 48
  - `NotOwner`: 73
  - `NotValidWallet`: 74
  - `WrongWorkchain`: 333
  - `IncorrectSender`: 700
- **Factory Methods**:
  - `fromAddress(address: Address)`
  - `fromStorage(emptyStorage: { jettonBalance?: bigint, version?: bigint, owner: Address, deployer: Address, minterAddress: Address }, deployedOptions?: DeployedAddrOptions)`
- **Message Cell Builders**:
  - `createCellOfAskToTransfer(body: AskToTransferParams)`
  - `createCellOfAskToBurn(body: AskToBurnParams)`
  - `createCellOfInternalTransferStep(body: InternalTransferStepParams)`
  - `createCellOfTopUpTons(body: {})`
  - `createCellOfHotUpgrade(body: { additionalData: Cell | null, code: Cell })`
  - `createCellOfUpgrade(body: { walletUpgrade?: boolean, walletVersion: bigint, sender: Address, newData?: Cell | null, newCode?: Cell | null })`
  - `createCellOfRequestUpgradeCode(body: { sender: Address, version: bigint })`
- **Transaction/Message Sending Methods**:
  - `sendDeploy(provider: ContractProvider, via: Sender, msgValue: bigint, extraOptions?: ExtraSendOptions)`
  - `sendAskToTransfer(provider: ContractProvider, via: Sender, msgValue: bigint, body: { queryId: bigint, jettonAmount: bigint, transferRecipient: Address, sendExcessesTo: Address | null, customPayload: Cell | null, forwardTonAmount: bigint, forwardPayload: PayloadInline | PayloadInRef }, extraOptions?: ExtraSendOptions)`
  - `sendAskToBurn(provider: ContractProvider, via: Sender, msgValue: bigint, body: { queryId: bigint, jettonAmount: bigint, sendExcessesTo: Address | null, customPayload: Cell | null }, extraOptions?: ExtraSendOptions)`
  - `sendInternalTransferStep(...)`
  - `sendTopUpTons(provider: ContractProvider, via: Sender, msgValue: bigint, body: {}, extraOptions?: ExtraSendOptions)`
  - `sendHotUpgrade(...)`
  - `sendUpgrade(...)`
  - `sendRequestUpgradeCode(...)`
- **Getters (Read Operations)**:
  - `getVersion(provider: ContractProvider): Promise<bigint>`
  - `getPersonalWalletState(provider: ContractProvider): Promise<PriWalletStore>` — Returns `{ jettonBalance: bigint, version: bigint, owner: Address, deployer: Address, minterAddress: Address }`
  - `getWalletData(provider: ContractProvider): Promise<JettonWalletDataReply>` — Returns standard TEP-74 `{ jettonBalance: bigint, ownerAddress: Address, minterAddress: Address, jettonWalletCode: Cell }`

#### 2. `PersonalMinter` (`Personal.gen.ts`)
- **Class**: `export class PersonalMinter implements Contract`
- **Code Cell**: `PersonalMinter.CodeCell`
- **Error Codes**:
  - `NotEnoughGas`: 48
  - `InvalidMessage`: 49
  - `NotValidWallet`: 74
  - `WrongWorkchain`: 333
  - `IncorrectSender`: 700
- **Factory Methods**:
  - `fromAddress(address: Address)`
  - `fromStorage(emptyStorage: { totalSupply?: bigint, version?: bigint, walletVersion?: bigint, fiJettonAddress: Address, adminAddress: Address, jettonWalletCode: Cell, metadataUri?: Cell | null }, deployedOptions?: DeployedAddrOptions)`
- **Message Cell Builders**:
  - `createCellOfMintNewJettons(body)`
  - `createCellOfNotifyMinter(body)`
  - `createCellOfRequestWalletAddress(body)`
  - `createCellOfChangeMinterAdmin(body)`
  - `createCellOfChangeMinterMetadata(body)`
  - `createCellOfUpgrade(body)`
  - `createCellOfHotUpgrade(body)`
  - `createCellOfRequestUpgradeCode(body)`
  - `createCellOfTopUpTons(body)`
- **Transaction/Message Sending Methods**:
  - `sendDeploy(provider, via, msgValue, extraOptions?)`
  - `sendMintNewJettons(provider, via, msgValue, body: { queryId: bigint, mintRecipient: Address, tonAmount: bigint, internalTransferMsg: CellRef<InternalTransferStep> }, extraOptions?)`
  - `sendNotifyMinter(provider, via, msgValue, body: { queryId: bigint, jettonAmount: bigint, burnInitiator: Address, sendExcessesTo: Address | null }, extraOptions?)`
  - `sendRequestWalletAddress(provider, via, msgValue, body: { queryId: bigint, owner: Address, includeOwnerAddress: boolean }, extraOptions?)`
  - `sendChangeMinterAdmin(provider, via, msgValue, body: { queryId: bigint, newAdminAddress: Address }, extraOptions?)`
  - `sendChangeMinterMetadata(provider, via, msgValue, body: { queryId: bigint, newMetadata: Cell }, extraOptions?)`
  - `sendUpgrade(...)`
  - `sendHotUpgrade(...)`
  - `sendRequestUpgradeCode(...)`
  - `sendTopUpTons(...)`
- **Getters (Read Operations)**:
  - `getVersion(provider: ContractProvider): Promise<bigint>`
  - `getWalletVersion(provider: ContractProvider): Promise<bigint>`
  - `getState(provider: ContractProvider): Promise<State>` — Returns `{ supply: bigint, admin: Address, fiJetton: Address }`
  - `getJettonData(provider: ContractProvider): Promise<JettonDataReply>` — Returns `{ totalSupply: bigint, mintable: boolean, adminAddress: Address | null, jettonContent: CellRef<OnchainMetadataReply>, jettonWalletCode: Cell }`
  - `getWalletAddress(provider: ContractProvider, owner: Address): Promise<Address>` — Returns address of owner's `PersonalWallet` for this minter.

#### 3. `FossFiWallet` (`FossFiWallet.gen.ts`)
- **Class**: `export class FossFiWallet implements Contract`
- **Code Cell**: `FossFiWallet.CodeCell`
- **Error Codes**:
  - `NotEnoughGas`: 48
  - `NotOwner`: 73
  - `NotValidWallet`: 74
  - `WrongWorkchain`: 333
  - `IncorrectSender`: 700
- **Factory Methods**:
  - `fromAddress(address: Address)`
  - `fromStorage(emptyStorage, deployedOptions)`
- **Transaction/Message Sending Methods**:
  - `sendDeploy(provider, via, msgValue, extraOptions?)`
  - `sendAskToTransfer(provider, via, msgValue, body: { queryId: bigint, jettonAmount: bigint, transferRecipient: Address, sendExcessesTo: Address | null, customPayload: Cell | null, forwardTonAmount: bigint, forwardPayload: PayloadInline | PayloadInRef }, extraOptions?)`
  - `sendAskToBurn(provider, via, msgValue, body: { queryId: bigint, jettonAmount: bigint, sendExcessesTo: Address | null, customPayload: Cell | null }, extraOptions?)`
  - `sendBuyCredit(provider, via, msgValue, body: { queryId: bigint, jettonAmount: bigint, transferRecipient: Address, sendExcessesTo: Address | null }, extraOptions?)`
  - `sendAuthorityAction(provider, via, msgValue, body: { sender: Address }, extraOptions?)`
  - `sendChangeUsername(provider, via, msgValue, body: { newUsername: string }, extraOptions?)`
  - `sendChangeCity(provider, via, msgValue, body: { queryId?: bigint, newCity: string, oldCityLetter?: bigint, newCityLetter?: bigint }, extraOptions?)`
  - `sendActClaimWeeklyGrant(provider, via, msgValue, body: { queryId: bigint, sendExcessesTo: Address | null }, extraOptions?)`
  - `sendActInvite(provider, via, msgValue, body: { queryId: bigint, transferRecipient: Address, username: string, city: string, cityLetter?: bigint }, extraOptions?)`
  - `sendActVote(provider, via, msgValue, body: { transferRecipient: Address }, extraOptions?)`
  - `sendActUnvote(provider, via, msgValue, body: { transferRecipient: Address }, extraOptions?)`
  - `sendActDeactivate(provider, via, msgValue, body: { transferRecipient: Address }, extraOptions?)`
  - `sendActRequestUpgrade(...)`
  - `sendActDispatchAuthorityAction(provider, via, msgValue, body: { transferRecipient: Address }, extraOptions?)`
  - `sendActJoinLottery(provider, via, msgValue, body: {}, extraOptions?)`
  - `sendActSetPersonalJettonMinter(provider, via, msgValue, body: { transferRecipient: Address }, extraOptions?)`
  - `sendActDestroyAccount(provider, via, msgValue, body: {}, extraOptions?)`
  - `sendActSubmitProposal(provider, via, msgValue, body: { queryId: bigint, daoAddress: Address, targetMsg: Cell }, extraOptions?)`
  - `sendActVoteProposal(provider, via, msgValue, body: { queryId: bigint, daoAddress: Address, proposalId: bigint, vote: boolean }, extraOptions?)`
  - `sendPayback(provider, via, msgValue, body: { queryId: bigint, amount: bigint, sender: Address }, extraOptions?)`
  - `sendSetStatus(provider, via, msgValue, body: { sender: Address, status: bigint }, extraOptions?)`
  - `sendEnterLottery(provider, via, msgValue, body: { sender: Address, amount: bigint }, extraOptions?)`
  - `sendUnFollow(provider, via, msgValue, body: { queryId: bigint, follow: boolean, followee: Address }, extraOptions?)`
  - `sendDestroy(provider, via, msgValue, body: {}, extraOptions?)`
  - `sendSetAllowance(provider, via, msgValue, body: { queryId: bigint, grantee: Address, amount: bigint }, extraOptions?)`
  - `sendSpendAllowance(provider, via, msgValue, body: { queryId: bigint, amount: bigint, receiver: Address, sendExcessesTo: Address | null }, extraOptions?)`
  - `sendAskGoldCoinsTransfer(provider, via, msgValue, body: { queryId: bigint, amount: bigint, receiver: Address, sendExcessesTo: Address | null }, extraOptions?)`
  - `sendTriggerDecay(provider, via, msgValue, body: { sender: Address }, extraOptions?)`
  - `sendSetCreditNeed(provider, via, msgValue, body: { queryId?: bigint, amount: bigint }, extraOptions?)`
  - `sendSetMultiplier(provider, via, msgValue, body: { queryId?: bigint, multiplier: bigint }, extraOptions?)`
  - `sendRepayDebt(provider, via, msgValue, body: { queryId?: bigint, amount: bigint }, extraOptions?)`
  - `sendActCloseAccount(provider, via, msgValue, body: { queryId?: bigint }, extraOptions?)`
  - `sendAuthorityCloseAccount(provider, via, msgValue, body: { queryId?: bigint, target: Address }, extraOptions?)`
- **Getters (Read Operations)**:
  - `getWalletData(provider: ContractProvider): Promise<JettonWalletDataReply>`
  - `getWalletDataAll(provider: ContractProvider): Promise<FiWalletStore>` — Returns 21 account fields: `{ jettonBalance, goldCoins, txnCount, status, isAuthorityAccount, creditNeed, multiplier, accumulatedFees, debt, debts, votes, receivedVotes, connections, active, mintable, version, storeVersion, profile, timestamps, addresses, maps }`
  - `getUsername(provider: ContractProvider): Promise<string>`
  - `getCity(provider: ContractProvider): Promise<string>`

#### 4. `FossFi` (`FossFi.gen.ts`)
- **Class**: `export class FossFi implements Contract`
- **Code Cell**: `FossFi.CodeCell`
- **Error Codes**:
  - `NotEnoughGas`: 48
  - `InvalidOp`: 72
  - `NotValidWallet`: 74
  - `WrongWorkchain`: 333
  - `IncorrectSender`: 700
  - `WaitMore`: 735
- **Getters (Read Operations)**:
  - `getTotalAccounts(provider: ContractProvider): Promise<bigint>`
  - `getJettonData(provider: ContractProvider): Promise<JettonDataReply>`
  - `getJettonDataAll(provider: ContractProvider): Promise<FiStore>` — Returns `{ totalSupply, walletVersion, adminAddress, daoAddress, adminHandoff, metadata, others }`
  - `getWalletAddress(provider: ContractProvider, owner: Address): Promise<Address>`
  - `getLocationAddresses(provider: ContractProvider): Promise<Dictionary<bigint, Address>>`
  - `getDaoAddress(provider: ContractProvider): Promise<Address | null>`
- **Transaction/Message Sending Methods**:
  - `sendDeploy`, `sendMintNewJettons`, `sendNotifyMinter`, `sendRequestWalletAddress`, `sendChangeMinterAdmin`, `sendClaimMinterAdmin`, `sendDropMinterAdmin`, `sendChangeMinterMetadata`, `sendSetLocationAddresses`, `sendChangeDaoAddress`, `sendRequestTotalAccounts`, `sendTopUpTons`, `sendInformMinterInviteInternal`, `sendInformMinterChangeCity`, `sendRequestUpgradeCode`, `sendEnterLottery`, `sendLotteryWin`, `sendUpgradeLotteryCode`, `sendHotUpgrade`, `sendUpgrade`, `sendRejectUpgrade`, `sendApproveUpgrade`, `sendDestroy`

#### 5. `Dao` (`Dao.gen.ts`)
- **Class**: `export class Dao implements Contract`
- **Code Cell**: `Dao.CodeCell`
- **Error Codes**:
  - `IncorrectSender`: 700
  - `ProposalNotFound`: 751
  - `ProposalExpired`: 754
  - `InvalidDaoVoter`: 758
- **Getters (Read Operations)**:
  - `getDaoData(provider: ContractProvider): Promise<DaoStore>` — Returns `{ totalAccounts: bigint, fiAddress: Address, proposalCount: bigint, proposals: Dictionary<bigint, Proposal> }`
  - `getProposal(provider: ContractProvider, proposalId: bigint): Promise<Proposal | null>` — Returns proposal details: `{ id, proposerOwner, targetMsg, yesVotes, noVotes, expiresAt }`
  - `getDaoVoterAddress(provider: ContractProvider, voterOwner: Address): Promise<Address>`
- **Transaction/Message Sending Methods**:
  - `sendDeploy(provider, via, msgValue, extraOptions?)`
  - `sendSubmitProposal(provider, via, msgValue, body: { queryId: bigint, proposerOwner: Address, targetMsg: Cell }, extraOptions?)`
  - `sendResponseTotalAccounts(provider, via, msgValue, body: { queryId: bigint, totalAccounts: bigint }, extraOptions?)`
  - `sendVoteProposal(provider, via, msgValue, body: { queryId: bigint, proposalId: bigint, voterOwner: Address, oldVote: boolean | null, newVote: boolean }, extraOptions?)`
  - `sendCleanupProposalVotes(provider, via, msgValue, body: { queryId: bigint, proposalId: bigint }, extraOptions?)`
  - `sendTopUpTons(provider, via, msgValue, body: {}, extraOptions?)`

#### 6. `DaoVoter` (`DaoVoter.gen.ts`)
- **Class**: `export class DaoVoter implements Contract`
- **Code Cell**: `DaoVoter.CodeCell`
- **Error Codes**:
  - `IncorrectSender`: 700
  - `DuplicateVote`: 757
- **Getters (Read Operations)**: None directly exposed on `DaoVoter` wrapper instance.
- **Transaction/Message Sending Methods**:
  - `sendDeploy(provider, via, msgValue, extraOptions?)`
  - `sendVoteProposalChild(provider, via, msgValue, body: { queryId: bigint, proposalId: bigint, voterOwner: Address, vote: boolean }, extraOptions?)`
  - `sendCleanupProposalVotes(provider, via, msgValue, body: { queryId: bigint, proposalId: bigint }, extraOptions?)`

#### 7. `Lottery` (`Lottery.gen.ts`)
- **Class**: `export class Lottery implements Contract`
- **Code Cell**: `Lottery.CodeCell`
- **Error Codes**:
  - `InvalidMessage`: 49
  - `IncorrectSender`: 700
  - `WaitMore`: 735
- **Getters (Read Operations)**:
  - `getVersion(provider: ContractProvider): Promise<bigint>`
  - `getParticipantCount(provider: ContractProvider): Promise<bigint>`
  - `getIsParticipant(provider: ContractProvider, addr: Address): Promise<boolean>`
  - `getDeadline(provider: ContractProvider): Promise<bigint>`
  - `getCurrentPhase(provider: ContractProvider): Promise<bigint>`
  - `getPrizePool(provider: ContractProvider): Promise<bigint>`
- **Transaction/Message Sending Methods**:
  - `sendDeploy(provider, via, msgValue, extraOptions?)`
  - `sendEnterLottery(provider, via, msgValue, body: { sender: Address, amount: bigint }, extraOptions?)`
  - `sendDrawWinner(provider, via, msgValue, body: { queryId: bigint }, extraOptions?)`
  - `sendHotUpgrade(provider, via, msgValue, body: { additionalData: Cell | null, code: Cell }, extraOptions?)`
  - `sendUpgrade(provider, via, msgValue, body: { walletUpgrade?: boolean, walletVersion: bigint, sender: Address, newData?: Cell | null, newCode?: Cell | null }, extraOptions?)`

#### 8. `CityMap` (`CityMap.gen.ts`)
- **Class**: `export class CityMap implements Contract`
- **Code Cell**: `CityMap.CodeCell`
- **Error Codes**:
  - `NotOwner`: 73
- **Getters (Read Operations)**:
  - `getVersion(provider: ContractProvider): Promise<bigint>`
  - `getCityName(provider: ContractProvider): Promise<string>`
  - `getLocationAddress(provider: ContractProvider): Promise<Address>`
  - `getMembers(provider: ContractProvider): Promise<Dictionary<Address, boolean>>`
- **Transaction/Message Sending Methods**:
  - `sendDeploy(provider, via, msgValue, extraOptions?)`
  - `sendRegisterCityMember(provider, via, msgValue, body: { queryId: bigint, ownerAddress: Address, cityName: string, sendExcessesTo: Address | null, version?: bigint }, extraOptions?)`
  - `sendUnregisterCityMember(provider, via, msgValue, body: { queryId: bigint, ownerAddress: Address, cityName: string, sendExcessesTo: Address | null, version?: bigint }, extraOptions?)`
  - `sendHotUpgrade(...)`
  - `sendUpgrade(...)`

#### 9. `Location` (`Location.gen.ts`)
- **Class**: `export class Location implements Contract`
- **Code Cell**: `Location.CodeCell`
- **Error Codes**:
  - `NotOwner`: 73
- **Getters (Read Operations)**:
  - `getVersion(provider: ContractProvider): Promise<bigint>`
  - `getCityMapVersion(provider: ContractProvider): Promise<bigint>`
  - `getLetterKey(provider: ContractProvider): Promise<bigint>`
  - `getMinterAddress(provider: ContractProvider): Promise<Address>`
  - `getCityExists(provider: ContractProvider, cityName: string): Promise<boolean>`
  - `getCities(provider: ContractProvider): Promise<Dictionary<bigint, string>>`
  - `getCityMapAddress(provider: ContractProvider, cityName: string): Promise<Address>`
- **Transaction/Message Sending Methods**:
  - `sendDeploy(provider, via, msgValue, extraOptions?)`
  - `sendLocationRegisterCity(provider, via, msgValue, body: { queryId: bigint, ownerAddress: Address, cityName: string, sendExcessesTo: Address | null }, extraOptions?)`
  - `sendLocationUnregisterCity(provider, via, msgValue, body: { queryId: bigint, ownerAddress: Address, cityName: string, sendExcessesTo: Address | null }, extraOptions?)`
  - `sendHotUpgrade(...)`
  - `sendUpgrade(...)`
  - `sendRequestUpgradeCode(...)`

---

### Detailed Lib Utilities Inventory

#### `deploy.ts` (`src/lib/deploy.ts`)
Builder functions constructing payload cells for transaction submission:
1. `parseUnits(amount: string, decimals: number): bigint` — Formats decimal string into nanotons/units bigint.
2. `buildDeployMessage(params: { metadata: JettonMetadata; ownerAddress: Address; mintAmount: bigint })` — Builds stateInit and initial mint payload for deploying `FossFi` jetton master.
3. `buildMintBody(params: { toAddress: Address; jettonAmount: bigint; forwardTonAmount: bigint; totalTonAmount: bigint; queryId?: bigint }): Cell` — Builds `MintNewJettons` cell.
4. `buildChangeAdminBody(newAdmin: Address, queryId = 0n): Cell` — Builds `ChangeMinterAdmin` cell.
5. `buildChangeContentBody(metadata: JettonMetadata, queryId = 0n): Promise<Cell>` — Builds `ChangeMinterMetadata` cell.
6. `buildPersonalMinterDeploy(params: { issuerWallet: Address; adminAddress: Address; metadata: JettonMetadata }): Promise<{ contractAddress: Address, stateInit: StateInit }>` — Calculates address and stateInit cell for `PersonalMinter`.
7. `buildPointPersonalMinterBody(params: { personalMinter: Address }): Cell` — Builds `ActSetPersonalJettonMinter` cell to register minter on issuer's `FossFiWallet`.
8. `buildBurnBody(amount: bigint, responseAddress: Address, queryId = 0n): Cell` — Builds `AskToBurn` cell for FI burn.
9. `buildTransferBody(params: { toAddress: Address; amount: bigint; responseAddress: Address; forwardTonAmount?: bigint; forwardPayload?: Cell | null; queryId?: bigint }): Cell` — Builds `AskToTransfer` cell for FI transfer.
10. `buildInviteBody(params: { transferRecipient: Address; username?: string; city?: string; cityLetter?: number | bigint; queryId?: bigint }): Cell` — Builds `ActInvite` cell.
11. `buildBuyCreditBody(params: { transferRecipient: Address; amount: bigint; responseAddress: Address; queryId?: bigint }): Cell` — Builds `BuyCredit` cell.
12. `buildVoteBody(params: { transferRecipient: Address }): Cell` — Builds `ActVote` cell.
13. `buildUnvoteBody(params: { transferRecipient: Address }): Cell` — Builds `ActUnvote` cell.
14. `buildDestroyBody(): Cell` — Builds `Destroy` cell.
15. `buildTopUpTonsBody(): Cell` — Builds `TopUpTons` cell.
16. `buildApproveUpgradeBody(): Cell` — Builds `ApproveUpgrade` cell.
17. `buildRejectUpgradeBody(): Cell` — Builds `RejectUpgrade` cell.
18. `buildSetAllowanceBody(params: { grantee: Address; amount: bigint; queryId?: bigint }): Cell` — Builds `SetAllowance` cell.
19. `buildSpendAllowanceBody(params: { amount: bigint; receiver: Address; sendExcessesTo: Address; queryId?: bigint }): Cell` — Builds `SpendAllowance` cell.

#### `ton.ts` (`src/lib/ton.ts`)
RPC broadcaster client and state fetchers:
1. `getTonClient(network: Network): TonClient` — Instantiates or returns cached `TonClient` for mainnet/testnet.
2. `getWalletAddress(ownerAddress: Address): Promise<Address>` — Resolves on-chain `FossFiWallet` address via `get_wallet_address` TVM call on `FI_ADDRESS` (cached in localStorage).
3. `fetchJettonMaster(): Promise<JettonMasterInfo>` — Queries Toncenter v3 API (`/jetton/masters`) for total supply, mintable, admin, and metadata.
4. `fetchWalletBalance(ownerAddress: Address): Promise<bigint>` — Queries Toncenter v3 API (`/jetton/wallets`) for FI balance of owner's wallet.
5. `getFiWalletState(owner: Address): Promise<FiWalletStore>` — Opens `FossFiWallet` contract via `TonClient` and calls `getWalletDataAll()`.
6. `listAllowances(state: { maps: { ref: { allowances: Dictionary<Address, bigint> } } }): AllowanceEntry[]` — Extracts sorted list of `{ grantee, amount }` from `FiWalletStore`.
7. `getCircle(invitedList: Address[]): Promise<FiWalletStore[]>` — Batch fetches wallet states for an array of invited member addresses.
8. `getPersonalMinterForIssuer(issuerOwner: Address): Promise<Address | null>` — Reads `personalJettonMinter` address from issuer's `FiWalletStore`.
9. `getPersonalWalletAddress(personalMinter: Address, owner: Address): Promise<Address>` — Calls `get_wallet_address` on `PersonalMinter`.
10. `getPersonalWalletBalance(personalMinter: Address, owner: Address): Promise<bigint>` — Fetches balance of `PersonalWallet`.

#### `queries.ts` (`src/lib/queries.ts`)
React Query wrapper hooks with IndexedDB fallback caching via `contract-cache`:
1. `useJettonMaster(enabled = true)` — Queries master jetton info (`['jetton-master']`).
2. `useFiWalletState(ownerAddress: Address | null)` — Queries `FiWalletStore` for connected wallet (`['fi-wallet-state', key]`).
3. `useWalletBalance(ownerAddress: Address | null)` — Queries FI wallet balance (`['wallet-balance', key]`).
4. `useCircle(invitedList: Address[] | null)` — Queries state for invited members (`['circle', key]`).
5. `usePersonalMinterForIssuer(ownerAddress: Address | null)` — Queries Personal Token minter address (`['personal-minter', key]`).
6. `usePersonalWalletAddress(personalMinter, ownerAddress)` — Queries buyer's Personal Token wallet address (`['personal-wallet-address', key]`).
7. `usePersonalWalletBalance(personalMinter, ownerAddress)` — Queries buyer's Personal Token balance (`['personal-wallet-balance', key]`).
8. `useRefreshContractQueries()` — Returns function to invalidate and refetch active React Query queries.

#### `jettonContent.ts` (`src/lib/jettonContent.ts`)
Constructs TEP-64 onchain metadata cells:
1. `buildOnchainMetadata(metadata: JettonMetadata): Promise<Cell>` — Standard TEP-64 key-value dictionary with SHA256 hashed keys and snake cells.
2. `buildTolkOnchainMetadata(metadata: JettonMetadata): Promise<Cell>` — Tolk-exact `OnchainMetadataReply` dictionary layout for `PersonalMinter`.

#### `useSendFiTransaction.ts` (`src/lib/useSendFiTransaction.ts`)
In-app transaction engine entry point:
- Takes array of `SendFiMessage` (`{ address: string, amount: bigint, payload?: Cell, stateInit?: Cell }`).
- Leverages `useAppWallet()` from `WalletContext` to sign and submit messages directly via embedded `WalletV5R1`.
- Manages `{ sendTransaction, loading, status, setStatus }` state.

---

## 2. Logic Chain

1. **Requirement Mapping**: Requirement R1 requires implementing features covering all 9 contract wrappers into five distinct feature modules (`brotherhood`, `personal-jetton`, `dao`, `lottery`, `city-network`).
2. **Wrapper Data Flow**:
   - Write actions initiate from user interaction -> built into payload cells by `deploy.ts` (or direct wrapper `createCellOf*` static methods) -> sent via `useSendFiTransaction` through `WalletV5R1.sendTransaction()`.
   - Read actions flow from TVM get-methods or Toncenter v3 RPC calls wrapped in `ton.ts` -> cached via IndexedDB fallback in `queries.ts` -> consumed by UI components via React Query hooks.
3. **Cross-Contract Interactions**:
   - `FossFiWallet` acts as the central member hub on-chain. When a member submits a DAO proposal (`sendActSubmitProposal`) or votes on a proposal (`sendActVoteProposal`), `FossFiWallet` constructs and routes the message cell to `Dao`.
   - When a member enters the lottery (`sendActJoinLottery`), `FossFiWallet` forwards the request to `Lottery`.
   - `PersonalMinter` deployment links to `FossFiWallet` via `ActSetPersonalJettonMinter` so the member's account references their Personal Token minter.
   - `CityMap` member registration links `Location` registry with individual member addresses.

---

## 3. Caveats

1. **Get-Method Stack Widths**: Wrapper getters depend on fixed stack widths (e.g. `StackReader.fromGetMethod(21, ...)` for `getWalletDataAll`). If TVM state layout or contract versions mismatch on testnet/mainnet, TVM returns may throw stack width mismatch errors.
2. **Read-Only vs Write Methods**: `DaoVoter` wrapper contains no get-methods directly; reading proposal votes per voter requires checking `Dao.getProposal(id)` or `DaoStore.proposals` dictionary directly.
3. **Environment API Keys**: Toncenter v3 calls in `ton.ts` optionally look for `TONCENTER_MAINNET_API_KEY` and `TONCENTER_TESTNET_API_KEY` in environment variables; without keys, rate-limiting (429) fallback handling is invoked.

---

## 4. Conclusion

All 9 contract wrapper classes (`PersonalWallet`, `PersonalMinter`, `FossFiWallet`, `FossFi`, `Dao`, `DaoVoter`, `Lottery`, `CityMap`, `Location`) and all core lib utilities (`deploy.ts`, `ton.ts`, `queries.ts`, `jettonContent.ts`, `useSendFiTransaction.ts`) have been fully audited, categorized, and documented.

The data structures, parameters, getters, transaction methods, and dependencies provide complete coverage for implementing the feature modules in `apps/demo-wallet`.

---

## 5. Verification Method

To independently verify these findings:
1. Inspect wrapper files in `/home/zeta/jetton/wrappers-ts/` to confirm method signatures and stack reader widths.
2. Inspect lib files in `/home/zeta/jetton/src/lib/` to confirm payload builders and TVM/API call routes.
3. Validate type correctness by executing:
   ```bash
   pnpm --filter demo-wallet typecheck
   ```
