/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

export type EventPayload = Record<string, unknown>;

export interface AppKitEvent<T extends EventPayload = EventPayload> {
    type: string;
    payload: T;
    source: string;
    timestamp: number;
}

export type EventListener<T extends EventPayload = EventPayload> = (event: AppKitEvent<T>) => void;

export interface IEventBus {
    emit<T extends EventPayload>(type: string, payload: T, source: string): void;
    on<T extends EventPayload>(type: string, listener: EventListener<T>): () => void;
    off(type: string, listener: EventListener): void;
    once<T extends EventPayload>(type: string, listener: EventListener<T>): () => void;
}
