/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/* eslint-disable no-console */

// Example: AppKit usage with TonConnect

import TonConnect from '@tonconnect/sdk';

import { CreateAppKit } from '../index';
import { FSStorage } from './FSStorage';

async function main() {
    const tonConnect = new TonConnect({
        storage: new FSStorage('./temp/storage.json'),
        manifestUrl: 'https://tonconnect-demo-dapp-with-react-ui.vercel.app/tonconnect-manifest.json',
    });
    const appKit = CreateAppKit({});

    tonConnect.onStatusChange(async (wallet) => {
        console.log('Status changed:', wallet);

        if (wallet) {
            const tonWallet = appKit.wrapTonConnectWallet(wallet, tonConnect);

            await tonWallet.createTransferJettonTransaction({
                transferAmount: '1',
                jettonAddress: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
                recipientAddress: tonWallet.getAddress(),
                comment: 'Hello!',
            });
        }
    });

    await tonConnect.restoreConnection();
    const wallets = await tonConnect.getWallets();
    console.log('Wallets:', wallets[1]);

    const wallet = wallets[1];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (wallet as any).jsBridgeKey = undefined;

    while (true) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log('Waiting...');
    }
}

main();
