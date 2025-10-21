import { AccountStatus, ExtraCurrency } from '@ton/core';

import { Hex } from '../primitive';
import { RawStackItem } from '../../utils/tvmStack';

export interface TransactionId {
    lt: string;
    hash: Hex;
}

export interface FullAccountState {
    status: AccountStatus;
    balance: string;
    extraCurrencies: ExtraCurrency;
    code: string | null; // base64 encoded
    data: string | null; // base64 encoded
    lastTransaction: TransactionId | null;
    frozenHash?: Hex;
}

export interface GetResult {
    gasUsed: number;
    stack: RawStackItem[];
    exitCode: number;
}
