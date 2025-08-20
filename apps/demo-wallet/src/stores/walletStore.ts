import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { storage, STORAGE_KEYS, SimpleEncryption } from '../utils';
import { useAuthStore } from './authStore';
import type { Transaction, WalletState } from '../types/wallet';

interface WalletStore extends WalletState {
    // Transaction history
    transactions: Transaction[];

    // Actions
    createWallet: (mnemonic: string[]) => Promise<void>;
    importWallet: (mnemonic: string[]) => Promise<void>;
    loadWallet: () => Promise<void>;
    clearWallet: () => void;
    updateBalance: (balance: string) => void;
    addTransaction: (transaction: Transaction) => void;

    // Getters
    getDecryptedMnemonic: () => Promise<string[] | null>;
}

export const useWalletStore = create<WalletStore>()(
    persist(
        (set, get) => ({
            // Initial state
            isAuthenticated: false,
            hasWallet: false,
            transactions: [],

            // Actions
            createWallet: async (mnemonic: string[]) => {
                const authState = useAuthStore.getState();
                if (!authState.currentPassword) {
                    throw new Error('User not authenticated');
                }

                try {
                    const encryptedMnemonic = await SimpleEncryption.encrypt(
                        JSON.stringify(mnemonic),
                        authState.currentPassword,
                    );

                    storage.set(STORAGE_KEYS.ENCRYPTED_MNEMONIC, encryptedMnemonic);

                    // Generate mock address and public key
                    const mockAddress = 'EQBvI0aFLnw2QbZeUOETQdwQceZl0OOl-0KaJYQs3LiJayNM';
                    const mockPublicKey = mnemonic.join('').slice(0, 64);

                    set({
                        hasWallet: true,
                        isAuthenticated: true,
                        address: mockAddress,
                        publicKey: mockPublicKey,
                        mnemonic: undefined, // Don't store in memory
                    });
                } catch (error) {
                    console.error('Error creating wallet:', error);
                    throw new Error('Failed to create wallet');
                }
            },

            importWallet: async (mnemonic: string[]) => {
                // Same as create wallet - we encrypt and store the mnemonic
                return get().createWallet(mnemonic);
            },

            loadWallet: async () => {
                const authState = useAuthStore.getState();
                if (!authState.currentPassword) {
                    throw new Error('User not authenticated');
                }

                try {
                    const encryptedMnemonic = storage.get<string>(STORAGE_KEYS.ENCRYPTED_MNEMONIC);
                    if (!encryptedMnemonic) {
                        set({ hasWallet: false, isAuthenticated: false });
                        return;
                    }

                    // We don't decrypt here, just confirm we have a wallet
                    set({
                        hasWallet: true,
                        isAuthenticated: true,
                    });
                } catch (error) {
                    console.error('Error loading wallet:', error);
                    set({ hasWallet: false, isAuthenticated: false });
                }
            },

            getDecryptedMnemonic: async (): Promise<string[] | null> => {
                const authState = useAuthStore.getState();
                if (!authState.currentPassword) return null;

                try {
                    const encryptedMnemonic = storage.get<string>(STORAGE_KEYS.ENCRYPTED_MNEMONIC);
                    if (!encryptedMnemonic) return null;

                    const decryptedString = await SimpleEncryption.decrypt(
                        encryptedMnemonic,
                        authState.currentPassword,
                    );

                    return JSON.parse(decryptedString) as string[];
                } catch (error) {
                    console.error('Error decrypting mnemonic:', error);
                    return null;
                }
            },

            clearWallet: () => {
                storage.remove(STORAGE_KEYS.ENCRYPTED_MNEMONIC);
                storage.remove(STORAGE_KEYS.WALLET_STATE);
                storage.remove(STORAGE_KEYS.TRANSACTIONS);

                set({
                    isAuthenticated: false,
                    hasWallet: false,
                    address: undefined,
                    balance: undefined,
                    mnemonic: undefined,
                    publicKey: undefined,
                    transactions: [],
                });
            },

            updateBalance: (balance: string) => {
                set({ balance });
            },

            addTransaction: (transaction: Transaction) => {
                set((state) => ({
                    transactions: [transaction, ...state.transactions],
                }));
            },
        }),
        {
            name: STORAGE_KEYS.WALLET_STATE,
            partialize: (state) => ({
                hasWallet: state.hasWallet,
                address: state.address,
                balance: state.balance,
                publicKey: state.publicKey,
                isAuthenticated: false, // Never persist authentication
                transactions: state.transactions,
            }),
        },
    ),
);
