import { toNano, Address, SendMode, beginCell, Cell, Builder, Slice, Contract, contractAddress, ContractProvider, Sender } from '@ton/core';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    abstract class Op {
        static transfer = 0xf8a7ea5;
        static transfer_notification = 0x7362d09c;
        static internal_transfer = 0x178d4519;
        static excesses = 0xd53276db;
        static burn = 0x595f07bc;
        static burn_notification = 0x7bdd97de;

        static provide_wallet_address = 0x2c76b973;
        static take_wallet_address = 0xd1735400;
        static mint = 0x642b7d07;
        static change_admin = 0x6501f354;
        static claim_admin = 0xfb88e119;
        static drop_admin = 0x7431f221;
        static upgrade = 0x2508d66a;
        static call_to = 0x235caf52;
        static top_up = 0xd372158c;
        static change_metadata_url = 0xcb862902;
        static set_status = 0xeed236d3;
    }

    abstract class Errors {
        static invalid_op = 72;
        static wrong_op = 0xffff;
        static not_owner = 73;
        static not_valid_wallet = 74;
        static wrong_workchain = 333;

        static contract_locked = 45;
        static balance_error = 47;
        static not_enough_gas = 48;
        static invalid_mesage = 49;
        static discovery_fee_not_matched = 75;
    }

    type JettonMinterContent = {
        uri: string
    };

    function endParse(slice: Slice) {
        if (slice.remainingBits > 0 || slice.remainingRefs > 0) {
            throw new Error('remaining bits in data');
        }
    }

    function personalMinterConfigToCell(config: PersonalMinterConfig): Cell {
        const content = config.jetton_content == "" ? jettonContentToCell(config.jetton_content) : null;
        return beginCell()
            .storeCoins(config.supply)
            .storeAddress(config.fiJettonAddr)
            .storeAddress(config.admin)
            .storeRef(config.wallet_code)
            .storeMaybeRef(content) // tood: optional
            .endCell()
    }

    function jettonContentToCell(uri: string) {
        return beginCell()
            .storeStringRefTail(uri) //Snake logic under the hood
            .endCell();
    }

    class PersonalMinter implements Contract {
        constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {
        }

        static createFromAddress(address: Address) {
            return new PersonalMinter(address);
        }

        static createFromConfig(config: PersonalMinterConfig, code: Cell, workchain = 0) {
            const data = personalMinterConfigToCell(config);
            const init = { code, data };
            return new PersonalMinter(contractAddress(workchain, init), init);
        }

        async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
            await provider.internal(via, {
                value,
                sendMode: SendMode.PAY_GAS_SEPARATELY,
                body: beginCell().storeUint(Op.top_up, 32).storeUint(0, 64).endCell(),
            });
        }

        static mintMessage(to: Address, jetton_amount: bigint, from?: Address | null, response?: Address | null, customPayload?: Cell | null, forward_ton_amount: bigint = 0n, total_ton_amount: bigint = 0n) {
            const mintMsg = beginCell().storeUint(Op.internal_transfer, 32)
                .storeUint(0, 64)
                .storeCoins(jetton_amount)
                .storeAddress(from)
                .storeAddress(response)
                .storeCoins(forward_ton_amount)
                .storeMaybeRef(customPayload)
                .endCell();
            return beginCell().storeUint(Op.mint, 32).storeUint(0, 64) // op, queryId
                .storeAddress(to)
                .storeCoins(total_ton_amount)
                .storeRef(mintMsg)
                .endCell();
        }

        static parseMintInternalMessage(slice: Slice) {
            const op = slice.loadUint(32);
            if (op !== Op.internal_transfer) throw new Error('Invalid op');
            const queryId = slice.loadUint(64);
            const jettonAmount = slice.loadCoins();
            const fromAddress = slice.loadAddress();
            const responseAddress = slice.loadAddress();
            const forwardTonAmount = slice.loadCoins();
            const customPayload = slice.loadMaybeRef();
            endParse(slice);
            return {
                queryId,
                jettonAmount,
                fromAddress,
                responseAddress,
                forwardTonAmount,
                customPayload
            }
        }

        static parseMintMessage(slice: Slice) {
            const op = slice.loadUint(32);
            if (op !== Op.mint) throw new Error('Invalid op');
            const queryId = slice.loadUint(64);
            const toAddress = slice.loadAddress();
            const tonAmount = slice.loadCoins();
            const mintMsg = slice.loadRef();
            endParse(slice);
            return {
                queryId,
                toAddress,
                tonAmount,
                internalMessage: this.parseMintInternalMessage(mintMsg.beginParse())
            }
        }

        async sendMint(provider: ContractProvider,
            via: Sender,
            to: Address,
            jetton_amount: bigint,
            from?: Address | null,
            response_addr?: Address | null,
            customPayload?: Cell | null,
            forward_ton_amount: bigint = toNano('0.05'), total_ton_amount: bigint = toNano('0.1')) {
            await provider.internal(via, {
                sendMode: SendMode.PAY_GAS_SEPARATELY,
                body: PersonalMinter.mintMessage(to, jetton_amount, from, response_addr, customPayload, forward_ton_amount, total_ton_amount),
                value: total_ton_amount + toNano('0.05'),
            });
        }

        /* provide_wallet_address#2c76b973 query_id:uint64 owner_address:MsgAddress include_address:Bool = InternalMsgBody;
        */
        static discoveryMessage(owner: Address, include_address: boolean) {
            return beginCell().storeUint(Op.provide_wallet_address, 32).storeUint(0, 64) // op, queryId
                .storeAddress(owner).storeBit(include_address)
                .endCell();
        }

        async sendDiscovery(provider: ContractProvider, via: Sender, owner: Address, include_address: boolean, value: bigint = toNano('0.1')) {
            await provider.internal(via, {
                sendMode: SendMode.PAY_GAS_SEPARATELY,
                body: PersonalMinter.discoveryMessage(owner, include_address),
                value: value,
            });
        }

        static topUpMessage() {
            return beginCell().storeUint(Op.top_up, 32).storeUint(0, 64) // op, queryId
                .endCell();
        }

        static parseTopUp(slice: Slice) {
            const op = slice.loadUint(32);
            if (op !== Op.top_up) throw new Error('Invalid op');
            const queryId = slice.loadUint(64);
            endParse(slice);
            return {
                queryId,
            }
        }

        async sendTopUp(provider: ContractProvider, via: Sender, value: bigint = toNano('0.1')) {
            await provider.internal(via, {
                sendMode: SendMode.PAY_GAS_SEPARATELY,
                body: PersonalMinter.topUpMessage(),
                value: value,
            });
        }

        static changeAdminMessage(newOwner: Address) {
            return beginCell().storeUint(Op.change_admin, 32).storeUint(0, 64) // op, queryId
                .storeAddress(newOwner)
                .endCell();
        }

        static parseChangeAdmin(slice: Slice) {
            const op = slice.loadUint(32);
            if (op !== Op.change_admin) throw new Error('Invalid op');
            const queryId = slice.loadUint(64);
            const newAdminAddress = slice.loadAddress();
            endParse(slice);
            return {
                queryId,
                newAdminAddress
            }
        }

        async sendChangeAdmin(provider: ContractProvider, via: Sender, newOwner: Address) {
            await provider.internal(via, {
                sendMode: SendMode.PAY_GAS_SEPARATELY,
                body: PersonalMinter.changeAdminMessage(newOwner),
                value: toNano("0.1"),
            });
        }

        static claimAdminMessage(query_id: bigint = 0n) {
            return beginCell().storeUint(Op.claim_admin, 32).storeUint(query_id, 64).endCell();
        }

        static parseClaimAdmin(slice: Slice) {
            const op = slice.loadUint(32);
            if (op !== Op.claim_admin) throw new Error('Invalid op');
            const queryId = slice.loadUint(64);
            endParse(slice);
            return {
                queryId
            }
        }

        async sendClaimAdmin(provider: ContractProvider, via: Sender, query_id: bigint = 0n) {
            await provider.internal(via, {
                sendMode: SendMode.PAY_GAS_SEPARATELY,
                body: PersonalMinter.claimAdminMessage(query_id),
                value: toNano('0.1')
            })
        }

        static dropAdminMessage(query_id: number | bigint) {
            return beginCell().storeUint(Op.drop_admin, 32).storeUint(query_id, 64).endCell();
        }
        static parseDropAdmin(slice: Slice) {
            const op = slice.loadUint(32);
            if (op !== Op.drop_admin) {
                throw new Error("Invalid op");
            }
            const queryId = slice.loadUint(64);
            endParse(slice);
            return {
                queryId
            }
        }
        async sendDropAdmin(provider: ContractProvider, via: Sender, value: bigint = toNano('0.05'), query_id: number | bigint = 0) {
            await provider.internal(via, {
                sendMode: SendMode.PAY_GAS_SEPARATELY,
                body: PersonalMinter.dropAdminMessage(query_id),
                value
            });
        }


        static changeContentMessage(content: Cell | JettonMinterContent) {
            const contentString = content instanceof Cell ? content.beginParse().loadStringTail() : content.uri;
            return beginCell().storeUint(Op.change_metadata_url, 32).storeUint(0, 64) // op, queryId
                .storeStringTail(contentString)
                .endCell();
        }

        static parseChangeContent(slice: Slice) {
            const op = slice.loadUint(32);
            if (op !== Op.change_metadata_url) throw new Error('Invalid op');
            const queryId = slice.loadUint(64);
            const newMetadataUrl = slice.loadStringTail();
            endParse(slice);
            return {
                queryId,
                newMetadataUrl
            }
        }

        async sendChangeContent(provider: ContractProvider, via: Sender, content: Cell | JettonMinterContent) {
            await provider.internal(via, {
                sendMode: SendMode.PAY_GAS_SEPARATELY,
                body: PersonalMinter.changeContentMessage(content),
                value: toNano("0.1"),
            });
        }

        static parseTransfer(slice: Slice) {
            const op = slice.loadUint(32);
            if (op !== Op.transfer) throw new Error('Invalid op');
            const queryId = slice.loadUint(64);
            const jettonAmount = slice.loadCoins();
            const toAddress = slice.loadAddress();
            const responseAddress = slice.loadAddress();
            const customPayload = slice.loadMaybeRef();
            const forwardTonAmount = slice.loadCoins();
            const inRef = slice.loadBit();
            const forwardPayload = inRef ? slice.loadRef().beginParse() : slice;
            return {
                queryId,
                jettonAmount,
                toAddress,
                responseAddress,
                customPayload,
                forwardTonAmount,
                forwardPayload
            }
        }

        static parseBurn(slice: Slice) {
            const op = slice.loadUint(32);
            if (op !== Op.burn) throw new Error('Invalid op');
            const queryId = slice.loadUint(64);
            const jettonAmount = slice.loadCoins();
            const responseAddress = slice.loadAddress();
            const customPayload = slice.loadMaybeRef();
            endParse(slice);
            return {
                queryId,
                jettonAmount,
                responseAddress,
                customPayload,
            }
        }

        static upgradeMessage(new_code: Cell, new_data: Cell, query_id: bigint | number = 0) {
            return beginCell().storeUint(Op.upgrade, 32).storeUint(query_id, 64)
                .storeRef(new_data)
                .storeRef(new_code)
                .endCell();
        }

        static parseUpgrade(slice: Slice) {
            const op = slice.loadUint(32);
            if (op !== Op.upgrade) throw new Error('Invalid op');
            const queryId = slice.loadUint(64);
            const newData = slice.loadRef();
            const newCode = slice.loadRef();
            endParse(slice);
            return {
                queryId,
                newData,
                newCode
            }
        }

        async sendUpgrade(provider: ContractProvider, via: Sender, new_code: Cell, new_data: Cell, value: bigint = toNano('0.1'), query_id: bigint | number = 0) {
            await provider.internal(via, {
                sendMode: SendMode.PAY_GAS_SEPARATELY,
                body: PersonalMinter.upgradeMessage(new_code, new_data, query_id),
                value
            });
        }

        async getWalletAddress(provider: ContractProvider, owner: Address): Promise<Address> {
            const res = await provider.get('get_wallet_address', [{
                type: 'slice',
                cell: beginCell().storeAddress(owner).endCell()
            }])
            return res.stack.readAddress()
        }

        async getJettonData(provider: ContractProvider) {
            let res = await provider.get('get_jetton_data', []);
            let totalSupply = res.stack.readBigNumber();
            let mintable = res.stack.readBoolean();
            let adminAddress = res.stack.readAddressOpt();
            let content = res.stack.readCell();
            let walletCode = res.stack.readCell();
            return {
                totalSupply,
                mintable,
                adminAddress,
                content,
                walletCode,
            };
        }

        async getTotalSupply(provider: ContractProvider) {
            let res = await this.getJettonData(provider);
            return res.totalSupply;
        }

        async getAdminAddress(provider: ContractProvider) {
            let res = await this.getJettonData(provider);
            return res.adminAddress;
        }

        async getContent(provider: ContractProvider) {
            let res = await this.getJettonData(provider);
            return res.content;
        }

        async getNextAdminAddress(provider: ContractProvider) {
            const res = await provider.get('get_next_admin_address', []);
            return res.stack.readAddressOpt();
        }
    }


    type PersonalMinterConfig = {
        supply: bigint,
        admin: Address,
        fiJettonAddr: Address,
        wallet_code: Cell,
        jetton_content: string | null,
    };

    type MintNewJettons = {
        $$type: 'MintNewJettons';
        queryId: bigint;
        mintRecipient: Address;
        tonAmount: bigint;
        internalTransferMsg: InternalTransferStep;
    }

    function storeMint(src: MintNewJettons) {
        return (builder: Builder) => {
            const b_0 = builder;
            b_0.storeUint(1680571655, 32);
            b_0.storeUint(src.queryId, 64);
            b_0.storeAddress(src.mintRecipient);
            b_0.storeCoins(src.tonAmount);

            const b_1 = new Builder();
            b_1.store(storeInternalTransferStep(src.internalTransferMsg));
            b_0.storeRef(b_1.endCell());
        };
    }

    type InternalTransferStep = {
        $$type: 'InternalTransferStep';
        queryId: bigint;
        jettonAmount: bigint;
        version: bigint;
        transferredAsCredit: boolean;
        transferInitiator: Address;
        sendExcessesTo: Address | null;
        forwardTonAmount: bigint;
        forwardPayload: Slice;
    }

    function storeInternalTransferStep(src: InternalTransferStep) {
        return (builder: Builder) => {
            const b_0 = builder;
            b_0.storeUint(395134233, 32);
            b_0.storeUint(src.queryId, 64);
            b_0.storeCoins(src.jettonAmount);
            b_0.storeUint(src.version, 10);
            b_0.storeBit(src.transferredAsCredit);
            b_0.storeAddress(src.transferInitiator);
            b_0.storeAddress(src.sendExcessesTo);
            b_0.storeCoins(src.forwardTonAmount);
            b_0.storeBuilder(src.forwardPayload.asBuilder());
        };
    }

    const deployer = process.env.DEPLOYER;
    if (deployer === undefined) {
        console.error("deployer address is not provided, please add it to .env file")
        throw new Error("deployer address is not provided")
    }
    const deployerAddress = Address.parse(deployer); // todo: use from tonconnectUI
    const minterCode = Cell.fromHex("te6ccgEBAgEABADoA+g8AAQH9A+ADAgEAAQH9A+ADAgEAAgEAAgEAAgEAAgEAAgEAAgEAAgEAAgEAAgEAAgEAAgEAAgEAAgEAAgEAAA==")

    const walletCode = Cell.fromHex("te6ccgEBAgEABADoA+g8AAQH9A+ADAgEAAQH9A+ADAgEAAgEAAgEAAgEAAgEAAgEAAgEAAgEAAgEAAgEAAgEAAgEAAgEAAgEAAgEAAA==")

    const fossFiConfig: PersonalMinterConfig = {
        supply: 0n,
        fiJettonAddr: Address.parse(""), // todo: user input
        admin: deployerAddress,
        wallet_code: walletCode,
        jetton_content: "", // user input, optional
    };

    const personalMinter = provider.open(PersonalMinter.createFromConfig(fossFiConfig, minterCode));

    const mint: MintNewJettons = {
        $$type: 'MintNewJettons',
        queryId: 0n,
        mintRecipient: deployerAddress,
        tonAmount: 100000000n, // 0.1 TON for storage and fees
        internalTransferMsg: {
            $$type: 'InternalTransferStep',
            queryId: 0n,
            jettonAmount: 1000000000000000n, // 1 million tokens with 9 decimals
            version: 0n,
            transferredAsCredit: false,
            transferInitiator: deployerAddress,
            sendExcessesTo: null,
            forwardTonAmount: 1n,
            forwardPayload: beginCell().asSlice(),
        }
    };

    await provider.sender().send(
        {
            value: toNano("0.2"),
            to: personalMinter.address,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            init: personalMinter.init,
            body: beginCell()
                .store(
                    storeMint(mint),
                )
                .endCell(),
        }
    )

    await provider.waitForDeploy(personalMinter.address, 5, 5000);

    // run methods on `fossFi` to test the contract
}
