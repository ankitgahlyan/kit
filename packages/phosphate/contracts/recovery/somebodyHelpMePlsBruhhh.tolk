// ============ CONSTANTS ============

const CONTRACT_VERSION: Int = 0; // Increment on each release

// error codes
const INCORRECT_SENDER: int = 700;
const INSUFFICIENT_GAS_SENT: int = 703
const WAIT_MORE: int = 735;
const MAX_CONNECTIONS: int = 127;


// Gas and amounts (in nanoTON)
const MIN_CHECKIN_AMOUNT: Int = ton("0.1");
const STORAGE_RESERVE: Int = ton("0.05");
const GAS_FOR_JETTON_TRANSFER: Int = ton("0.05"); // Gas attached to jetton transfer
const GAS_FOR_CLAIM_JETTON: Int = ton("0.1"); // Gas for ClaimJetton message
const MIN_FORWARD_TON: Int = 1; // 1 nanoton for jetton notification

// V5 Wallet opcodes
const OP_EXTENSION_ACTION: Int = 0x6578746e; // "extn" in ASCII

// Jetton opcodes (TEP-74)
const OP_JETTON_TRANSFER: Int = 0xf8a7ea5;

// Bit sizes for data types
const BITS_OPCODE: Int = 32; // uint32 for opcodes
const BITS_QUERY_ID: Int = 64; // uint64 for query_id
const BITS_EMPTY_BODY: Int = 32; // Empty body marker

// Internal message flags
// int_msg_info$0 ihr_disabled:Bool bounce:Bool bounced:Bool = 0b011000
const MSG_INTERNAL_FLAGS: Int = 0x18;

// Internal message bit sizes (TON standard)
// See: https://docs.ton.org/develop/smart-contracts/messages
const MSG_HEADER_BITS: Int = 6; // int_msg_info$0 ihr_disabled bounce bounced
const MSG_EXTRA_CURRENCIES: Int = 1; // extra currencies dict (empty)
const MSG_IHR_FEE_BITS: Int = 4; // ihr_fee:Grams (usually 0)
const MSG_FWD_FEE_BITS: Int = 4; // fwd_fee:Grams (usually 0)
const MSG_CREATED_LT_BITS: Int = 64; // created_lt:uint64
const MSG_CREATED_AT_BITS: Int = 32; // created_at:uint32
const MSG_INIT_BIT: Int = 1; // init:(Maybe StateInit)

// Total bits for "default" message fields after value (including body bit)
// = 1 (extra_currencies) + 4 (ihr_fee) + 4 (fwd_fee) + 64 (created_lt) + 32 (created_at) + 1 (init) + 1 (body) = 107
const MSG_DEFAULT_BITS: Int = MSG_EXTRA_CURRENCIES + MSG_IHR_FEE_BITS + MSG_FWD_FEE_BITS + MSG_CREATED_LT_BITS + MSG_CREATED_AT_BITS + MSG_INIT_BIT + 1;

// ============ MESSAGES ============

// V5 Wallet extension action: instructs wallet to send a message
// TL-B: action_send_msg#0ec3c86d mode:uint8 out_msg:^Cell = OutAction;
message(0x0ec3c86d) ActionSendMsg {
    mode: Int as uint8;
    outMsg: Cell;
}

message Claim {}

message ClaimJetton {
    jettonWallet: address;
    amount: Int as coins;
}

message Deactivate {}

struct (0x00000000) SetTrusty {
    trust: bool
    user: address
}

struct (0x00000001) Vouch {
    recover: bool
    pKey: uint256?
}

struct (0x00000002) Veto { }

struct (0x00000003) Recover { }

// ============================================================================
// STORAGE
// ============================================================================

struct RecoveryStorage {
    owner: address;
    // beneficiary: address;
    nextPkey: uint256
    trusty: map<address, bool> // friend -> vouched
    trustyCount: uint8
    vouchedCount: uint8 // 128 friends
    recoveryTime: uint64 // todo: 64?
    minWaitInterval: uint22 // todo: mutate fns 2592000 30days default
    // feeCollector: address;
    // checkInInterval: Int as uint32;
    // lastCheckIn: Int as uint32;
}

fun RecoveryStorage.load() {
    return RecoveryStorage.fromCell(contract.getData())
}

fun RecoveryStorage.save(self) {
    contract.setData(self.toCell())
}

// ============ CONTRACT ============

type AllowedMessageToRecovery = SetTrusty | Vouch | Veto | Recover

// type AllowedBounced = InternalTransferStep | Payback

// ============ BOUNCED HANDLER ============

    // Handle bounced messages (e.g., if V5 wallet rejects extension action)
    // This prevents loss of funds - bounced TON returns to contract balance
fun onBouncedMessage(in: InMessageBounced) {
    // in.bouncedBody.skipBouncedPrefix();

    // Accept bounced messages silently
    // Funds are automatically credited back to contract balance

    // process only bounces; on messages, an exception will be thrown, it's okay
    
    // val msg = lazy AllowedBounced.fromSlice(in.bouncedBody);

    // match (msg) { }
}

fun onInternalMessage(in: InMessage) {
    val msg = AllowedMessageToRecovery.fromSlice(in.body);
    var store: RecoveryStorage = lazy RecoveryStorage.load();
    
    match (msg) {
        // ============ OWNER FUNCTIONS ============
        // todo: Destroy or just remove all
        SetTrusty => {
            // requireOwner();
            assert (in.senderAddress == store.owner) throw INCORRECT_SENDER;
            assert (store.trustyCount < MAX_CONNECTIONS) throw MAX_CONNECTIONS;

            if (msg.trust) {
                store.trustyCount += 1;
            } else {
                store.trustyCount -= 1;
            }

            // Keep minimum balance for storage, send rest as fee
            nativeReserve(STORAGE_RESERVE, ReserveExact);
        }

        Vouch => {
            assert (store.trusty.exists(in.senderAddress)) throw INCORRECT_SENDER;
            requireMinimumAmount();
            // check if already vouched

            // set nextPublicKey + recovery timestamp
            if (!store.recoveryTime) {
                store.nextPkey = msg.pKey!; // make sure to send on recoveryInit 
                store.recoveryTime = blockchain.now() + store.minWaitInterval;
            }
            store.trusty.set(in.senderAddress, msg.recover);
        }

        Veto => {
            assert (in.senderAddress == store.owner) throw INCORRECT_SENDER;

            // reset recovery state
            store.recoveryTime = 0;
            store.nextPkey = 0;
            store.vouchedCount = 0;
            // loop map set to false

        }

        Recover => {
            // requireTimeout();
            assert (blockchain.now() > store.recoveryTime) throw WAIT_MORE;
            assert (store.vouched > store.minVouchThreshold) throw WAIT_MORE;

            // send txn to v5 wallet

        }
        
        else => {
            // Reject unknown blockchain messages
            assert(in.body.isEmpty()) throw 0xFFFF;
        }
    }

    storage.save();
}

// ============ VALIDATION HELPERS ============

@inline
fun requireMinimumAmount() {
    assert (in.valueCoins > ton("10")) throw INSUFFICIENT_GAS_SENT;
}

// ============ V5 EXTENSION BUILDERS ============
//
// These functions build messages in V5 wallet extension format.
// Unfortunately, this requires low-level Cell building because:
// 1. V5 uses a specific TL-B schema not available as Tolk structs .iThink
// 2. The format is defined in: github.com/ton-blockchain/wallet-contract-v5/blob/main/types.tlb
//
// Structure: Extension Message → InnerRequest → OutList → action_send_msg → Internal Message

/// Builds V5 extension action to change it's pubkey
fun buildChangeKeyAction(): Cell {
    // ===== STEP 1: Build the actual TON transfer message =====
    // This is a standard internal message that will be sent FROM the V5 wallet TO beneficiary
    var innerMessage: Cell = beginCell()
    // int_msg_info$0 ihr_disabled:Bool bounce:Bool bounced:Bool = 0b011000
        .storeUint(MSG_INTERNAL_FLAGS, MSG_HEADER_BITS)
        // dest:MsgAddressInt - recipient address
        .storeAddress(self.beneficiary)
        // value:CurrencyCollection - amount of TON (0 = determined by mode)
        .storeCoins(0)
        // Default fields: extra_currencies, ihr_fee, fwd_fee, created_lt, created_at, init, body
        .storeUint(0, MSG_DEFAULT_BITS)
        // Empty body (no operation code needed for simple transfer)
        .storeUint(0, BITS_EMPTY_BODY)
        .endCell();

    // SendRemainingBalance = 128 (send entire wallet balance)
    return self.wrapAsExtensionAction(innerMessage, SendRemainingBalance);
}

/// Builds V5 extension action to transfer Jetton from wallet to beneficiary
fun buildJettonTransferAction(jettonWallet: address, amount: Int): Cell {
    // ===== STEP 1: Build Jetton transfer payload (TEP-74 standard) =====
    var jettonBody: Cell = beginCell()
    // op:uint32 - Jetton transfer opcode
        .storeUint(OP_JETTON_TRANSFER, BITS_OPCODE)
        // query_id:uint64 - unique identifier for tracking
        .storeUint(now(), BITS_QUERY_ID)
        // amount:Coins - jetton amount to transfer
        .storeCoins(amount)
        // destination:MsgAddress - who receives the jettons
        .storeAddress(self.beneficiary)
        // response_destination:MsgAddress - who receives excess TON
        .storeAddress(self.beneficiary)
        // custom_payload:(Maybe ^Cell) - no custom payload
        .storeBit(false)
        // forward_ton_amount:Coins - TON to forward with notification
        .storeCoins(MIN_FORWARD_TON)
        // forward_payload:(Either Cell ^Cell) - no forward payload
        .storeBit(false)
        .endCell();

    // ===== STEP 2: Build internal message to Jetton Wallet contract =====
    var innerMessage: Cell = beginCell()
    // int_msg_info$0 ihr_disabled:Bool bounce:Bool bounced:Bool = 0b011000
        .storeUint(MSG_INTERNAL_FLAGS, MSG_HEADER_BITS)
        // Destination: the Jetton Wallet contract (not the beneficiary!)
        .storeAddress(jettonWallet)
        // Value: TON for gas fees
        .storeCoins(GAS_FOR_JETTON_TRANSFER)
        // Extra fields (106 bits = MSG_DEFAULT_BITS - MSG_BODY_BIT)
        .storeUint(0, MSG_EXTRA_CURRENCIES + MSG_IHR_FEE_BITS + MSG_FWD_FEE_BITS + MSG_CREATED_LT_BITS + MSG_CREATED_AT_BITS + MSG_INIT_BIT)
        // body:(Either Cell ^Cell) - body stored as reference (1 = ref)
        .storeBit(true)
        // The actual Jetton transfer payload
        .storeRef(jettonBody)
        .endCell();

    // SendPayFwdFeesSeparately = 1 (pay fees from this message's value)
    return self.wrapAsExtensionAction(innerMessage, SendPayFwdFeesSeparately);
}

/// Wraps a message as V5 wallet extension action
/// See: github.com/ton-blockchain/wallet-contract-v5/blob/main/Specification.md
fun wrapAsExtensionAction(message: Cell, mode: Int): Cell {
    // ===== Build action_send_msg using Tact message =====
    // TL-B: action_send_msg#0ec3c86d mode:uint8 out_msg:^Cell = OutAction;
    var sendAction: Cell = ActionSendMsg { mode, outMsg: message }.toCell();

    // ===== Build OutList (list of actions to execute) =====
    // TL-B: out_list$_ {n:#} prev:^(OutList n) action:OutAction = OutList (n+1);
    var outList: Cell = beginCell()
        .storeRef(sendAction)
        .endCell();

    // ===== Build InnerRequest (V5 action request body) =====
    // TL-B: actions$_ out_actions:(Maybe OutList) has_other_actions:Bool ... = InnerRequest;
    var innerRequest: Cell = beginCell()
        .storeBit(true) // has_out_actions
        .storeRef(outList) // out_actions:^OutList
        .storeBit(false) // has_other_actions
        .endCell();

    // ===== Build Extension Message envelope =====
    // TL-B: internal_extension#6578746e query_id:uint64 inner:InnerRequest = InternalMsgBody;
    return beginCell()
        .storeUint(OP_EXTENSION_ACTION, BITS_OPCODE)
        .storeUint(now(), BITS_QUERY_ID)
        .storeSlice(innerRequest.asSlice()) // inline, not as reference
        .endCell();
}

// ============ GETTERS ============

get fun state() {
    return RecoveryStorage.load();
}

// get fun owner() {
//     val store = RecoveryStorage.load();
//     return store.owner;
// }

// get fun next_pkey() {
//     val store = RecoveryStorage.load();
//     return store.nextPkey;
// }

// get fun min_wait_interval() {
//     val store = RecoveryStorage.load();
//     return store.minWaitInterval;
// }

// get fun recovery_time() {
//     val store = RecoveryStorage.load();
//     return store.recoveryTime;
// }

// get fun timeUntilClaim(): Int {
//     var deadline: Int = self.lastCheckIn + self.checkInInterval;
//     if (now() >= deadline) {
//         return 0;
//     }
//     return deadline - now();
// }
