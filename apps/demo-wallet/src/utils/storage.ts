// LocalStorage utility functions
export const storage = {
    set: <T>(key: string, value: T): void => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    },

    get: <T>(key: string, defaultValue?: T): T | undefined => {
        try {
            const item = localStorage.getItem(key);
            if (item === null) return defaultValue;
            return JSON.parse(item) as T;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return defaultValue;
        }
    },

    remove: (key: string): void => {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Error removing from localStorage:', error);
        }
    },

    clear: (): void => {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Error clearing localStorage:', error);
        }
    },
};

// Storage keys
export const STORAGE_KEYS = {
    ENCRYPTED_MNEMONIC: 'wallet_encrypted_mnemonic',
    PASSWORD_HASH: 'wallet_password_hash',
    WALLET_STATE: 'wallet_state',
    AUTH_STATE: 'auth_state',
    TRANSACTIONS: 'wallet_transactions',
} as const;
