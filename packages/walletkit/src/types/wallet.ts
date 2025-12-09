/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

// Wallet-related type definitions

import { Address, SendMode } from '@ton/core';

import { ConnectExtraCurrency, ConnectTransactionParamContent } from './internal';
import { JettonTransferParams } from './jettons';
import { NftTransferParamsHuman, NftTransferParamsRaw } from './nfts';
import { TransactionPreview } from './events';
import { LimitRequest, GetJettonsByOwnerRequest } from './toncenter/ApiClient';
import { ResponseUserJettons } from './export/responses/jettons';
import type { NftItem } from './toncenter/NftItem';
import { NftItems } from './toncenter/NftItems';
import { EventTransactionResponse } from './events';
import { WalletAdapter } from '../api/interfaces';

export type TonTransferMessage = {
    toAddress: string;
    amount: string;
    stateInit?: string; // base64 boc
    extraCurrency?: ConnectExtraCurrency;
    mode?: SendMode;
} & (TonTransferParamsBody | TonTransferParamsComment);
export type TonTransferParams = TonTransferMessage;

export type TonTransferManyParams = {
    messages: TonTransferMessage[];
};

export interface TonTransferParamsBody {
    body?: string; // base64 boc
    comment?: never;
}

export interface TonTransferParamsComment {
    body?: never;
    comment?: string;
}

export interface WalletTonInterface {
    createTransferTonTransaction(params: TonTransferParams): Promise<ConnectTransactionParamContent>;
    createTransferMultiTonTransaction(params: TonTransferManyParams): Promise<ConnectTransactionParamContent>;

    getTransactionPreview(data: ConnectTransactionParamContent | Promise<ConnectTransactionParamContent>): Promise<{
        preview: TransactionPreview;
    }>;

    sendTransaction(request: ConnectTransactionParamContent): Promise<EventTransactionResponse>;

    getBalance(): Promise<string>;
}

export interface WalletJettonInterface {
    createTransferJettonTransaction(params: JettonTransferParams): Promise<ConnectTransactionParamContent>;
    getJettonBalance(jettonAddress: string): Promise<string>;
    getJettonWalletAddress(jettonAddress: string): Promise<string>;
    getJettons(params?: Omit<GetJettonsByOwnerRequest, 'ownerAddress'>): Promise<ResponseUserJettons>;
}

export interface WalletNftInterface {
    createTransferNftTransaction(params: NftTransferParamsHuman): Promise<ConnectTransactionParamContent>;
    createTransferNftRawTransaction(params: NftTransferParamsRaw): Promise<ConnectTransactionParamContent>;
    getNfts(params: LimitRequest): Promise<NftItems>;
    getNft(address: Address | string): Promise<NftItem | null>;
}

export type IWallet = WalletAdapter & WalletTonInterface & WalletJettonInterface & WalletNftInterface;
