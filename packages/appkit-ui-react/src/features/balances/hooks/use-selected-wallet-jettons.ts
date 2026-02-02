/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { QueryParameter } from '@ton/appkit';
import type { GetJettonsOptions } from '@ton/appkit/queries';
import { getJettonsQueryOptions } from '@ton/appkit/queries';
import { useQuery } from '@tanstack/react-query';

import { useAppKit } from '../../../hooks/use-app-kit';

/**
 * Hook to get jettons
 */
export function useSelectedWalletJettons(params: GetJettonsOptions, queryOptions?: QueryParameter) {
    const appKit = useAppKit();

    return useQuery({
        ...getJettonsQueryOptions(appKit, params),
        ...queryOptions,
    });
}
