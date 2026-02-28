import "@stdlib/tvm-lowlevel"
import "jetton-utils"
import "storage"
import "../common/consts.tolk"
import "../common/errors"
import "../common/messages"
import "../common/sharding"
import "../lottery/storage"
import "../lottery/messages"

type AllowedMessageToMinter =
    | MintNewJettons
    | NotifyMinter
    | RequestWalletAddress
    | ChangeMinterAdmin
    | ChangeMinterMetadataUri
    | TopUpTons
    | InformMinterInviteInternal
    | RequestUpgradeCode
    | EnterLottery
    | LotteryWin

    | HotUpgrade
    | Upgrade
    | RejectUpgrade
    | ApproveUpgrade

fun onInternalMessage(in: InMessage): void {
    val msg = lazy AllowedMessageToMinter.fromSlice(in.body);
    var store = lazy FiStore.load();
    var others = lazy store.others.load();

    match (msg) {
        InformMinterInviteInternal => {
            // todo: use notifyMinter but forwardPayload?
            checkCorrectSender(in.senderAddress, msg.sender, store);
            store.supply += MBRP_AMOUNT; // todo: broadcast id for explorers or dbs
        }

        NotifyMinter => {
            checkCorrectSender(in.senderAddress, msg.burnInitiator, store);

            // determine whether MINT or BURN
            msg.queryId
                ? store.supply += msg.jettonAmount
                : store.supply -= msg.jettonAmount;

            if (msg.sendExcessesTo == null) {
                return;
            }

            val excessesMsg = createMessage({
                bounce: BounceMode.NoBounce,
                dest: msg.sendExcessesTo,
                value: 0,
                body: ReturnExcessesBack { queryId: msg.queryId },
            });
            excessesMsg.send(SEND_MODE_IGNORE_ERRORS | SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE);
        }

        RequestWalletAddress => {
            var owner: Cell<address>? = msg.includeOwnerAddress
                ? msg.owner.toCell()
                : null;

            var walletAddress: address? = null;
            if (msg.owner.getWorkchain() == MY_WORKCHAIN) {
                walletAddress = calcDeployFiWallet(
                    msg.owner,
                    store.admin,
                    contract.getAddress(),
                    store.baseFiWalletCode
                )
                    .calculateAddress();
            }

            val respondMsg = createMessage({
                bounce: BounceMode.NoBounce,
                dest: in.senderAddress,
                value: 0,
                body: ResponseWalletAddress {
                    queryId: msg.queryId,
                    jettonWalletAddress: walletAddress,
                    owner,
                },
            });
            respondMsg.send(SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE |
            SEND_MODE_BOUNCE_ON_ACTION_FAIL);
        }

        MintNewJettons => {
            assert (false) throw INCORRECT_RECEIVER; // just for fun/standard
        }

        ChangeMinterAdmin => {
            assert (in.senderAddress == store.admin) throw ERROR_NOT_OWNER;
            store.admin = msg.newAdminAddress;
        }

        ChangeMinterMetadataUri => {
            assert (in.senderAddress == store.admin) throw ERROR_NOT_OWNER;
            store.metadata = msg.newMetadataUri;
        }

        Upgrade => {
            assert (in.senderAddress == store.admin) throw INCORRECT_SENDER;
            assert (store.CurrentRequest == null) throw WAIT_MORE;

            store.CurrentRequest = {
                newUpgrade: msg,
                timestamp: blockchain.now()
            };
        },

        RejectUpgrade => {
            assert (in.senderAddress == store.admin) throw INCORRECT_SENDER;
            assert (store.CurrentRequest != null) throw WAIT_MORE;

            store.CurrentRequest = null;
        },

        ApproveUpgrade => {
            assert (in.senderAddress == store.admin) throw INCORRECT_SENDER;
            assert (store.CurrentRequest != null) throw WAIT_MORE;
            assert (store.CurrentRequest.timestamp + 10 < blockchain.now()) throw WAIT_MORE; // todo: wait time

            val code = store.CurrentRequest.newUpgrade.newCode;
            val data = store.CurrentRequest.newUpgrade.newData;

            match (store.CurrentRequest.newUpgrade.walletUpgrade) {
                true => {
                    // for jettonWallet of FOSSFIAT/MINT
                    store.walletVersion += 1;
                    others.b = code!; // shouldn't be null for other than minterUpgrade
                    val upgradeMsg = createMessage({
                        bounce: BounceMode.NoBounce,
                        value: 0,
                        dest: calcDeployFiWallet(
                            in.senderAddress,
                            store.admin,
                            // owner/deployer/treasury
                            contract.getAddress(),
                            store.baseFiWalletCode
                        )
                            .calculateAddress(),
                        body: Upgrade {
                            walletVersion: store.walletVersion,
                            sender: store.admin,
                            newCode: code,
                        },
                    });
                    upgradeMsg.send(SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE |
                    SEND_MODE_IGNORE_ERRORS);
                }

                false => {
                    // for minter
                    if (code != null) {
                        contract.setCodePostponed(code);
                    }

                    if (data != null) {
                        contract.setData(data);
                    }
                }
            }
            
            store.CurrentRequest = null;
        },

        RequestUpgradeCode => {
            checkCorrectSender(in.senderAddress, msg.sender, store);
            if (msg.version < store.walletVersion) {
                // sendUpgradeMinter(in.senderAddress, store);
                val upgradeMsg = createMessage({
                    // bounce for collecting fees back
                    bounce: BounceMode.NoBounce,
                    value: 0,
                    dest: in.senderAddress,
                    body: Upgrade {
                        walletVersion: store.walletVersion,
                        sender: store.admin,
                        newCode: others.b!, // b for latestFiWalletCode
                    },
                });
                upgradeMsg.send(SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE |
                SEND_MODE_IGNORE_ERRORS);
            }
        }

        TopUpTons => {
            // deploy + accept tons + deploy jettonWallet
            if (in.senderAddress == store.admin) {
                store.supply += ton("1"); // needed for semantic txn minted to deployer
                val deployTopUpMsg = createMessage({
                    // bounce for collecting fees back
                    bounce: BounceMode.Only256BitsOfBody,
                    value: 0,
                    dest: calcDeployFiWallet(
                        in.senderAddress,
                        store.admin,
                        contract.getAddress(),
                        store.baseFiWalletCode
                    ),
                    body: TopUpTons { queryId: msg.queryId },
                });
                deployTopUpMsg.send(SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE |
                SEND_MODE_BOUNCE_ON_ACTION_FAIL);
            }
        }

        EnterLottery => {
            checkCorrectSender(in.senderAddress, msg.sender, store);
            createMessage({
                bounce: BounceMode.RichBounce, // todo handle deepBounces
                value: 0,
                dest: calcDeployLottery( // deploy
                    contract.getAddress(),
                    msg.amount,
                    others.a
                ),
                body: msg,
            }).send(SEND_MODE_CARRY_ALL_REMAINING_MESSAGE_VALUE | SEND_MODE_BOUNCE_ON_ACTION_FAIL);
        }

        LotteryWin => {
            assert (in.senderAddress == calcDeployLottery(
                contract.getAddress(),
                msg.entryAmount,
                others.a // a for lotteryCode
            ).calculateAddress()) throw INCORRECT_SENDER;
            
            // todo:
            // send using InternalTransfer/Mint
            
        }

        HotUpgrade => {
            assert (in.senderAddress == store.admin) throw INCORRECT_SENDER;
            
            contract.setCodePostponed(msg.code);

            setTvmRegisterC3(transformSliceToContinuation(msg.code.beginParse()));
            hotUpgradeFiData(msg.additionalData);
        }

        else => {
            // invalid input; a typical reaction is:
            // ignore empty messages, "wrong opcode" if not
            assert (in.body.isEmpty()) throw 0xFFFF;
        }
    }
    store.others = others.toCell();
    store.save();
}

struct JettonDataReply {
    supply: int
    mintable: bool
    admin: address
    jettonContent: cell // Cell<OnchainMetadataReply>
    jettonWalletCode: cell
}

// struct (0x00) OnchainMetadataReply {
//     contentDict: map<uint256, Cell<SnakeDataReply>>
// }
// struct (0x00) SnakeDataReply {
//     string: SnakeString
// }
get fun get_jetton_data(): JettonDataReply {
    val store = lazy FiStore.load();

    // var metadata: OnchainMetadataReply = { contentDict: createEmptyMap() };
    // // if (store.metadata != null) {
    // metadata.contentDict.set(
    //     stringSha256("uri"),
    //     SnakeDataReply { string: store.metadata.load() }.toCell()
    // );
    // metadata.contentDict.set(stringSha256("decimals"), SnakeDataReply { string: "9" }.toCell());
    // // }
    return {
        supply: store.supply,
        mintable: true, // but by peers only & not minter
        admin: store.admin,
        jettonContent: store.metadata, // metadata.toCell(),
        jettonWalletCode: store.baseFiWalletCode,
    };
}

get fun get_jetton_data_all() {
    return FiStore.load(); // todo: return contract code + data also
}

get fun get_wallet_address(owner: address) {
    val store = lazy FiStore.load();
    return calcDeployFiWallet(
        owner,
        store.admin,
        // owner/deployer/treasury
        contract.getAddress(),
        store.baseFiWalletCode
    )
        .calculateAddress();
}

fun checkCorrectSender(sender: address, owner: address, store: FiStore) {
    assert (
        sender ==
        calcDeployFiWallet(
            owner,
            store.admin,
            contract.getAddress(),
            store.baseFiWalletCode
        )
            .calculateAddress()
    ) throw ERROR_NOT_VALID_WALLET;
}

// todo: implement minter deploy(efficient) not jetton(costly stateinit send)
// todo: implement bouncing-lottery also for gamification of network
fun calcDeployLottery(
    owner: address,
    entryAmount: coins,
    lotteryCode: cell, // todo: fixme,,,
): AutoDeployAddress {
    val emptyLotteryStore: LotteryStorage = {
        owner,
        entryAmount,
        participants: createEmptyMap(),
    };

    return { stateInit: { code: lotteryCode, data: emptyLotteryStore.toCell() } };
}

@method_id(2121)
fun hotUpgradeFiData(additionalData: cell?) {  
    // var oldStorage = lazy FiStore.fromCell(contract.getData());

    // assert (additionalData != null) throw 1112;
    
    // var storage = FiStore {
    //     supply: oldStorage.totalSupply,
    //     walletVersion: oldStorage.walletVersion,
    //     admin: oldStorage.adminAddress,
    //     baseFiWalletCode: oldStorage.baseFiWalletCode,
    //     metadata: oldStorage.metadata,
    //     others: oldStorage.others,
    // };

    // contract.setData(storage.toCell());
}
