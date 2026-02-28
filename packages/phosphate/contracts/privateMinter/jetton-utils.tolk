import "storage"
import "../common/sharding"

fun calcDeployPriWallet(
    owner: address,
    deployer: address,
    minterAddress: address,
    jettonWalletCode: cell,
): AutoDeployAddress {
    val emptyPriWalletStore: PriWalletStore = {
        owner,
        deployer,
        minterAddress,
    };

    return {
        workchain: MY_WORKCHAIN,
        stateInit: { code: jettonWalletCode, data: emptyPriWalletStore.toCell() },
        toShard: { fixedPrefixLength: SHARD_DEPTH, closeTo: owner },
    };
}

@inline
fun calcDeployPriMinter(fiJettonAddress: address, adminAddress: address, jettonWalletCode: cell, jettonMinterCode: cell): AutoDeployAddress {
    val emptyPriMinterStore: PriStore = {
        fiJettonAddress,
        adminAddress,
        jettonWalletCode,
    };

    return {
        workchain: BASECHAIN,
        stateInit: { code: jettonMinterCode, data: emptyPriMinterStore.toCell() }, // todo fixme need jettonMinterCode
        toShard: { fixedPrefixLength: SHARD_DEPTH, closeTo: adminAddress }, // noNeed to be in same shard for minter
    };
}


fun autoAddrPriWallet(owner: address) {
    // wallet calls this when deploy and checking on incoming
    val st = lazy PriWalletStore.load();
    return calcDeployPriWallet(owner, st.deployer, st.minterAddress, contract.getCode());
}

fun addrPriWallet(owner: address) {
    return autoAddrPriWallet(owner).calculateAddress();
}

fun calcAddrPriWallet(
    owner: address,
    deployer: address,
    minterAddress: address,
    jettonWalletCode: cell,
) {
    return calcDeployPriWallet(owner, deployer, minterAddress, jettonWalletCode)
        .calculateAddress();
}
