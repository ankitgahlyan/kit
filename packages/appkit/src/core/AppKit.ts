/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { ITonConnect, Wallet } from '@tonconnect/sdk';
import type { NetworkManager } from '@ton/walletkit';
import { Network, KitNetworkManager } from '@ton/walletkit';

import type { AppKit, AppKitConfig, TonConnectWalletWrapper } from '../types';
import { TonConnectWalletWrapperImpl } from '../adapters/TonConnectWalletWrapper';

/**
 * Bridge between @tonconnect/sdk and TonWalletKit.
 * Wraps TonConnect wallets to provide TonWalletKit-compatible interface.
 */
export class AppKitImpl implements AppKit {
    // private readonly tonConnect: ITonConnect;
    // private readonly client: ApiClient;
    private networkManager!: NetworkManager;

    private constructor() {}

    /**
     * Create a new AppKit instance
     * @param config - Configuration options
     */
    static create(_config: AppKitConfig): AppKit {
        const appKit = new AppKitImpl();

        const networkManager = new KitNetworkManager({
            networks: {
                [Network.mainnet().chainId]: {},
            },
        });
        appKit.networkManager = networkManager;

        return appKit;
    }

    /**
     * Create a TonWalletKit-compatible wrapper for a TonConnect wallet
     */
    wrapTonConnectWallet(wallet: Wallet, tonConnect: ITonConnect): TonConnectWalletWrapper {
        return new TonConnectWalletWrapperImpl({
            tonConnectWallet: wallet,
            tonConnect: tonConnect,
            client: this.networkManager.getClient(Network.custom(wallet.account.chain)),
        });
    }

    /**
     * Handle a new transaction request through TonConnect
     */
    // async handleNewTransaction(
    //     wallet: TonConnectWalletWrapper,
    //     transaction: TransactionRequest,
    // ): Promise<TransactionResult> {
    //     const connectedWallet = this.tonConnect.wallet;

    //     if (!connectedWallet) {
    //         throw new Error('TonConnect wallet is not connected');
    //     }

    //     if (connectedWallet.account.address !== wallet.getAddress()) {
    //         throw new Error('Wallet address mismatch: connected wallet does not match the provided wrapper');
    //     }

    //     const tonConnectTransaction = toTonConnectTransaction(transaction);
    //     return await this.tonConnect.sendTransaction(tonConnectTransaction);
    // }
}

export function CreateAppKit(config: AppKitConfig): AppKit {
    return AppKitImpl.create(config);
}
