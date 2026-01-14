/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { ITonConnect } from '@tonconnect/sdk';
import type { ApiClient } from '@ton/walletkit';

/**
 * Configuration for AppKit
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AppKitConfig {}

/**
 * Dependencies required by AppKit (extracted from config for internal use)
 */
export interface AppKitDependencies {
    tonConnect: ITonConnect;
    client: ApiClient;
}
