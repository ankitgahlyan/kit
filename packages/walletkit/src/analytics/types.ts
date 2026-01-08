/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

export type BaseEvent = {
    event_id?: string;
    trace_id?: string;
    subsystem?: 'dapp' | 'dapp-sdk' | 'bridge' | 'wallet' | 'wallet-sdk';
    client_environment?: string;
    client_timestamp?: number;
    version?: string;
    versions?: {
        [key: string]: string;
    };
    network_id?: string;
};

export type WalletInfo = {
    wallet_address: string;
    wallet_state_init: string;
    wallet_app_name: string;
    wallet_app_version: string;
};

export type SessionInfo = {
    client_id: string;
    wallet_id: string;
};

export type WalletKitBaseEvent = BaseEvent & {
    origin_url?: string;
    tg_id?: number;
    tma_is_premium?: boolean;
    locale?: string;
    browser?: string;
    manifest_json_url?: string;
    platform?: string;
};

export type WalletConnectedEvent = WalletKitBaseEvent &
    WalletInfo &
    SessionInfo & {
        event_name: 'wallet-connected';
        connection_duration?: number;
    };

export type WalletDisconnectedEvent = WalletKitBaseEvent &
    WalletInfo &
    SessionInfo & {
        event_name: 'wallet-disconnected';
    };

export type TransactionInitiatedEvent = WalletKitBaseEvent &
    WalletInfo &
    SessionInfo & {
        event_name: 'transaction-initiated';
        transaction_type?: string;
    };

export type TransactionCompletedEvent = WalletKitBaseEvent &
    WalletInfo &
    SessionInfo & {
        event_name: 'transaction-completed';
        transaction_hash?: string;
        transaction_type?: string;
    };

export type TransactionFailedEvent = WalletKitBaseEvent &
    WalletInfo &
    SessionInfo & {
        event_name: 'transaction-failed';
        error_code: number;
        error_message: string;
        transaction_type?: string;
    };

export type BalanceCheckedEvent = WalletKitBaseEvent &
    WalletInfo &
    SessionInfo & {
        event_name: 'balance-checked';
        balance?: string;
    };

export type WalletKitEvent =
    | WalletConnectedEvent
    | WalletDisconnectedEvent
    | TransactionInitiatedEvent
    | TransactionCompletedEvent
    | TransactionFailedEvent
    | BalanceCheckedEvent;

export type AnalyticsEvent = WalletKitEvent;
