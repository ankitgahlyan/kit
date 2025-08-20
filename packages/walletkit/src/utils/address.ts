import { Address } from '@ton/core';

export function formatWalletAddress(address: string | Address, isTestnet: boolean = false) {
    if (typeof address === 'string') {
        return Address.parse(address).toString({ bounceable: false, testOnly: isTestnet });
    }
    return address.toString({ bounceable: false, testOnly: isTestnet });
}
