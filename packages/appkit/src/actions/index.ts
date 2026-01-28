/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

// Balances
export { getBalance, type GetBalanceOptions } from './balances/get-balance';
export {
    getBalanceOfSelectedWallet,
    type GetBalanceOfSelectedWalletOptions,
} from './balances/get-balance-of-selected-wallet';

// Wallets
export { connect, type ConnectParameters, type ConnectReturnType } from './wallets/connect';
export { disconnect, type DisconnectReturnType, type DisconnectParameters } from './wallets/disconnect';
export { getConnectedWallets, type GetConnectedWalletsReturnType } from './wallets/get-connected-wallets';
export { getSelectedWallet, type GetSelectedWalletReturnType } from './wallets/get-selected-wallet';
export {
    setSelectedWalletId,
    type SetSelectedWalletIdParameters,
    type SetSelectedWalletIdReturnType,
} from './wallets/set-selected-wallet-id';
