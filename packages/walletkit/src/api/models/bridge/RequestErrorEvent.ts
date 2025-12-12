/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { ResultError } from '../core/Primitives';

export interface RequestErrorEvent {
    /**
     * Error details for the request failure
     */
    error: ResultError;

    /**
     * Additional data related to the error event
     */
    data: { [k: string]: unknown };
}
