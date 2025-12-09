/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { TonProofParsedMessage } from '../../utils/tonProof';
import { asHex } from '../../types/primitive';
import type { ProofMessage } from '../models/core/ProofMessage';
import { Mapper } from './Mapper';

/**
 * Maps API ProofMessage to internal TonProofParsedMessage.
 */
export class ProofMessageMapper extends Mapper<ProofMessage, TonProofParsedMessage> {
    map(input: ProofMessage): TonProofParsedMessage {
        return {
            workchain: input.workchain,
            address: asHex(input.addressHash),
            timstamp: input.timestamp,
            domain: {
                lengthBytes: input.domain.lengthBytes,
                value: input.domain.value,
            },
            payload: input.payload,
            stateInit: input.stateInit,
            signature: input.signature ? asHex(input.signature) : undefined,
        };
    }
}
