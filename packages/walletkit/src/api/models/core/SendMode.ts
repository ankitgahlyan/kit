/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * Send mode flags for TON message sending.
 * These flags can be combined using bitwise OR to control message behavior.
 */
export declare enum SendMode {
    /**
     * Transfer the entire remaining balance of the sender account
     */
    CARRY_ALL_REMAINING_BALANCE = 128,
    /**
     * Carry all remaining value from the incoming message
     */
    CARRY_ALL_REMAINING_INCOMING_VALUE = 64,
    /**
     * Destroy the sender account if its balance becomes zero after the transaction
     */
    DESTROY_ACCOUNT_IF_ZERO = 32,
    /**
     * Bounce the message back to sender if the action fails
     */
    BOUNCE_IF_FAILURE = 16,
    /**
     * Pay gas fees from a separate balance, not from the message value
     */
    PAY_GAS_SEPARATELY = 1,
    /**
     * Ignore any errors during action phase execution
     */
    IGNORE_ERRORS = 2,
    /**
     * No special flags, default behavior
     */
    NONE = 0,
}
