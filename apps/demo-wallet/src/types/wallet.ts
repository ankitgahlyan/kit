export interface WalletState {
    isAuthenticated: boolean;
    hasWallet: boolean;
    address?: string;
    balance?: string;
    mnemonic?: string[];
    publicKey?: string;
}

export interface AuthState {
    isPasswordSet: boolean;
    isUnlocked: boolean;
}

export interface Transaction {
    id: string;
    type: 'send' | 'receive';
    amount: string;
    address: string;
    timestamp: number;
    status: 'pending' | 'confirmed' | 'failed';
}
