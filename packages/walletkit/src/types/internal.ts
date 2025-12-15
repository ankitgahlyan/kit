/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

// Internal types for TonWalletKit modules

import {
    ConnectItem,
    SendTransactionRpcRequest,
    SignDataRpcRequest,
    WalletResponseError as _WalletResponseError,
    WalletResponseTemplateError,
} from '@tonconnect/protocol';

import { JSBridgeTransportFunction } from './jsBridge';
import { WalletId } from '../utils/walletId';
import {
    ExtraCurrencies,
    TransactionRequest,
    TransactionRequestMessage,
    BridgeEvent,
    SendModeFromValue,
} from '../api/models';

// import type { WalletInterface } from './wallet';

export interface SessionData {
    sessionId: string;

    walletId: WalletId;
    createdAt: string; // date
    lastActivityAt: string; // date
    privateKey: string;
    publicKey: string;

    dAppName: string;
    dAppDescription: string;
    domain: string;
    dAppIconUrl: string;

    // Bridge type indicator (needed to determine how to send disconnect events)
    isJsBridge?: boolean; // true if session was created via JS Bridge, false/undefined for HTTP Bridge
}

export interface BridgeConfig {
    bridgeUrl?: string; // defaults to WalletInfo.bridgeUrl if exists
    enableJsBridge?: boolean; // default to true if WalletInfo.jsBridgeKey exists
    jsBridgeKey?: string; // defaults to WalletInfo.jsBridgeKey
    disableHttpConnection?: boolean; // default to false

    // Custom transport function for JS Bridge responses
    jsBridgeTransport?: JSBridgeTransportFunction;

    // settings for bridge-sdk
    heartbeatInterval?: number;
    reconnectInterval?: number;
    maxReconnectAttempts?: number;
}

export interface StorageAdapter {
    get(key: string): Promise<string | null>;
    set(key: string, value: string): Promise<void>;
    remove(key: string): Promise<void>;
    clear(): Promise<void>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface EventCallback<T = any> {
    (event: T): void | Promise<void>;
}

export type EventApprovalBase = {
    id: string;
    from: string;
    sessionId: string;
    walletId: string;
    walletAddress?: string;

    messageId?: string;

    traceId?: string;
};

// Bridge event types (raw from bridge)
export interface RawBridgeEventGeneric extends BridgeEvent {
    id: string;
    method: 'none';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params: Record<string, any>;
    timestamp?: number;
}

export interface RawBridgeEventConnect extends BridgeEvent {
    id: string;
    method: 'connect';
    params: {
        manifest?: {
            url?: string;
        };
        manifestUrl?: string;
        items: ConnectItem[];
        returnStrategy?: string;
    };
    timestamp?: number;
}

export interface RawBridgeEventRestoreConnection extends BridgeEvent {
    id: string;
    method: 'restoreConnection';
    params: object; // no params
    timestamp?: number;
}

export interface ConnectExtraCurrency {
    [k: number]: string;
}

export interface ConnectTransactionParamMessage {
    address: string;
    amount: string;
    payload?: string; // boc
    stateInit?: string; // boc
    extraCurrency?: ConnectExtraCurrency;
    mode?: number;
}

export function toExtraCurrencies(extraCurrency: ConnectExtraCurrency | undefined): ExtraCurrencies | undefined {
    if (!extraCurrency) {
        return undefined;
    }
    return extraCurrency as ExtraCurrencies;
}

export interface ConnectTransactionParamContent {
    messages: ConnectTransactionParamMessage[];
    network?: string;
    valid_until?: number; // unixtime
    from?: string;
}

export function toTransactionRequestMessage(msg: ConnectTransactionParamMessage): TransactionRequestMessage {
    return {
        address: msg.address,
        amount: msg.amount,
        payload: msg.payload,
        stateInit: msg.stateInit,
        extraCurrency: toExtraCurrencies(msg.extraCurrency),
        mode: msg.mode ? SendModeFromValue(msg.mode) : undefined,
    };
}

export function toTransactionRequest(params: ConnectTransactionParamContent): TransactionRequest {
    return {
        messages: params.messages.map(toTransactionRequestMessage),
        network: params.network ? { chainId: params.network } : undefined,
        validUntil: params.valid_until,
        fromAddress: params.from,
    };
}

export type RawBridgeEventTransaction = BridgeEvent & SendTransactionRpcRequest;
export type RawBridgeEventSignData = BridgeEvent & SignDataRpcRequest;

export interface RawBridgeEventDisconnect extends BridgeEvent {
    id: string;
    method: 'disconnect';
    params: {
        reason?: string;
    };
    timestamp?: number;
}

export type RawBridgeEvent =
    | RawBridgeEventGeneric
    | RawBridgeEventConnect
    | RawBridgeEventRestoreConnection
    | RawBridgeEventTransaction
    | RawBridgeEventSignData
    | RawBridgeEventDisconnect;

// Internal event routing types
export type EventType = 'connect' | 'sendTransaction' | 'signData' | 'disconnect' | 'restoreConnection';

export interface EventHandler<T extends BridgeEvent = BridgeEvent, V extends RawBridgeEvent = RawBridgeEvent> {
    canHandle(event: RawBridgeEvent): event is V;
    handle(event: V): Promise<T | WalletResponseTemplateError>;
    notify(event: T): Promise<void>;
}
