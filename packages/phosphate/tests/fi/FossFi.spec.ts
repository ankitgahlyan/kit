// import { Blockchain, SandboxContract, TreasuryContract } from 'ton-sandbox-dev';
import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { beginCell, Cell, toNano } from '@ton/core';
import { FossFi, FossFiConfig } from '../../wrappers/fi/FossFi';
import { FossFiWallet, FossFiWalletConfig, JettonTransfer } from '../../wrappers/fi/FossFiWallet';
import '@ton/test-utils';
import { compile, sleep } from '@ton/blueprint';
import { envContent } from '../../utils/jetton-helpers';
import { findTransaction, flattenTransaction } from '@ton/test-utils';
import fs from 'fs';
import path from 'path';

const setup = async () => {
    const newCode = beginCell().storeStringTail('new code').endCell();
    const newData = beginCell().storeStringTail('new data').endCell();
    const fiCodeFile = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../build/', 'FossFi.compiled.json'), 'utf8'));
    const fiWalletCodeFile = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../build/', 'FossFiWallet.compiled.json'), 'utf8'));
    const lotteryCodeFile = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../build/', 'Lottery.compiled.json'), 'utf8'));

    // compiled code cells
    const fiCode = Cell.fromHex(fiCodeFile.hex);
    const fiWalletCode = Cell.fromHex(fiWalletCodeFile.hex);
    const lotteryCode = Cell.fromHex(lotteryCodeFile.hex);

    const blockchain = await Blockchain.create();
    // const blockchain = await Blockchain.create({webUI: true});
    // blockchain.verbosity.vmLogs = "vm_logs";
    const deployer = await blockchain.treasury('deployer');
    const user = await blockchain.treasury('user');
    const fi = blockchain.openContract(
        FossFi.createFromConfig({
            supply: 0n,
            walletVersion: 0n,
            admin: deployer.address,
            currentRequest: null,
            base_fi_wallet_code: fiWalletCode,
            metadata: envContent,
            others: beginCell()
                    .storeRef(lotteryCode)
                    .storeRef(fiWalletCode)
                    .storeRef(beginCell().endCell())
                    .storeRef(beginCell().endCell())
                    .endCell(),
        }, fiCode)
    );

    const deployResult = await fi.sendDeploy(deployer.getSender(), toNano('1'));

    expect(deployResult.transactions).toHaveTransaction({
        from: deployer.address,
        to: fi.address,
        deploy: true,
        success: true,
    });

    const deployerJetton = blockchain.openContract(FossFiWallet.createFromAddress(await fi.getWalletAddress(deployer.address)));
    const userJetton = blockchain.openContract(FossFiWallet.createFromAddress(await fi.getWalletAddress(user.address)));

    expect(deployResult.transactions).toHaveTransaction({
        from: fi.address,
        to: deployerJetton.address,
        deploy: true,
        success: true,
    });

    const txToInspect = findTransaction(
        deployResult.transactions,
        {
            from: deployer.address,
            to: fi.address,
            deploy: true,
            success: true,
        },
    );
    if (txToInspect === undefined) {
        throw new Error('Requested tx was not found.');
    }
    // User-friendly output
    console.log(flattenTransaction(txToInspect));

    // for (const tx of result.transactions) {
    //     console.log(flattenTransaction(tx));
    // }

    return { blockchain, deployer, user, fiCode, fiWalletCode, fi, deployResult, deployerJetton, userJetton };
};

it('should deploy correctly', async () => {
    const { fi, deployResult } = await setup();

    const txToInspect = findTransaction(
        deployResult.transactions,
        {
            to: fi.address,
            deploy: true,
        },
    );
    if (txToInspect === undefined) {
        throw new Error('Requested tx was not found.');
    }
    // User-friendly output
    console.log(flattenTransaction(txToInspect));
    // Verbose output
    console.log(txToInspect);
});

describe('FossFi', () => {








    beforeEach(async () => {



    });

    it('upgrade', async () => {
        const { blockchain, fi, deployResult } = await setup();

        // const upgradeResult = await fi.sendUpgrade(deployer.getSender(), true, deployer.address, newCode, null, toNano(1)); // true for wallet, false for minter

        const fiState = (await blockchain.getContract(fi.address)).accountState;
        if (fiState?.type !== 'active') {
            throw new Error('Fi contract is not active');
        }

        // const deployerJettonState = (await blockchain.getContract(deployerJetton.address)).accountState;
        // if (deployerJettonState?.type !== 'active') {
        //     throw new Error('FiWallet contract is not active');
        // }

        // const jettonDataAll2 = await fi.getjettonDataAll();
        // expect(jettonDataAll2.latestFiWalletCode).toEqualCell(newCode);
        // expect(jettonDataAll2.walletVersion).toBe(1n);

        // Fi upgrades
        // const updatedCode = fiState?.state.code!;
        // expect(updatedCode).toEqualCell(newCode);

        // const deployerJettonDataAll = await deployerJetton.getGetWalletDataFull();
        // expect(deployerJettonDataAll.version).toBe(1n);
        // console.log(fiJettonDataAll);

        // const userJettonDataAll = await userJetton.getGetWalletDataAll();
        // send upgradeRequest msg from jettonWallet
        // const inviteResult = await deployerJetton.send(
        //     deployer.getSender(),
        //     {
        //         value: toNano(1)
        //     },
        //     {
        //         $$type: 'JettonTransfer',
        //         queryId: 0n,
        //         amount: toNano("0.1"),
        //         destination: user.address,
        //         responseDestination: null,
        //         customPayload: null,
        //         forwardTonAmount: toNano(0.01),
        //         forwardPayload: beginCell().asSlice(),
        //     } as JettonTransfer
        // )

        // console.log('\n=== upgradeRequest TX RESULT ===');
        // for (const tx of inviteResult.transactions) {
        //     console.log('Exit code:', tx.description);
        // }

        // 5. Check what message minter forwards to wallet
        // const outMsg = upgradeResult.transactions[1]?.outMessages?.get(0);
        // if (outMsg) {
        //     console.log('\n=== FORWARDED MESSAGE ===');
        //     // console.log('Body:', outMsg.body.toBoc().toString('hex'));

        //     // Parse the forwarded body
        //     const fwdSlice = outMsg.body.beginParse();
        //     console.log('Forwarded opcode:', '0x' + fwdSlice.loadUint(32).toString(16));
        // }

        // console.log(upgradeRequestResult);
        // expect(upgradeRequestResult.transactions).toHaveTransaction({
        //     from: fi.address,
        //     on: fiJetton.address,
        //     // deploy: true,
        //     success: true,
        // });

        // await sleep(5000);

        // const fiJettonState2 = (await blockchain.getContract(deployerJetton.address)).accountState;
        // if (fiJettonState2?.type !== 'active') {
        //     throw new Error('DeployerJetton contract is not active');
        // }
        // const updatedWalletCode = fiJettonState2?.state.code!;
        // expect(updatedWalletCode).toEqualCell(newCode);

        // const userJettonState = (await blockchain.getContract(userJetton.address)).accountState;
        // if (userJettonState?.type !== 'active') {
        //     throw new Error('UserJetton contract is not active');
        // }

    });
});
