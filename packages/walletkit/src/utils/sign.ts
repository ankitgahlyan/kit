import { sign } from '@ton/crypto';

export function DefaultSignature(data: Uint8Array, privateKey: Uint8Array): Uint8Array {
    return new Uint8Array(sign(Buffer.from(data), Buffer.from(privateKey)));
}
