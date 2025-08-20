import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Layout, Button, Card } from '../components';
import { useTonWallet } from '../hooks';

type SetupMode = 'select' | 'create' | 'import';

export const SetupWallet: React.FC = () => {
    const [mode, setMode] = useState<SetupMode>('select');
    const [mnemonic, setMnemonic] = useState<string[]>([]);
    const [inputMnemonic, setInputMnemonic] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showMnemonic, setShowMnemonic] = useState(false);

    const navigate = useNavigate();
    const { createNewWallet, importWallet } = useTonWallet();

    const handleCreateWallet = async () => {
        setError('');
        setIsLoading(true);

        try {
            const newMnemonic = await createNewWallet();
            setMnemonic(newMnemonic);
            setMode('create');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create wallet');
        } finally {
            setIsLoading(false);
        }
    };

    const handleImportWallet = async () => {
        setError('');
        setIsLoading(true);

        try {
            const mnemonicArray = inputMnemonic.trim().split(/\s+/);

            if (mnemonicArray.length !== 12 && mnemonicArray.length !== 24) {
                throw new Error('Mnemonic must be 12 or 24 words');
            }

            await importWallet(mnemonicArray);
            navigate('/wallet');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to import wallet');
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmMnemonic = async () => {
        try {
            // Wallet is already created, just navigate
            navigate('/wallet');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to confirm wallet');
        }
    };

    if (mode === 'select') {
        return (
            <Layout title="Setup Wallet">
                <div className="space-y-6">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900">Setup Your Wallet</h2>
                        <p className="mt-2 text-sm text-gray-600">Create a new wallet or import an existing one.</p>
                    </div>

                    <div className="space-y-4">
                        <Card>
                            <div className="space-y-4">
                                <Button onClick={handleCreateWallet} isLoading={isLoading} className="w-full">
                                    Create New Wallet
                                </Button>
                                <p className="text-xs text-gray-500 text-center">
                                    Generate a new 12-word recovery phrase
                                </p>
                            </div>
                        </Card>

                        <Card>
                            <div className="space-y-4">
                                <Button variant="secondary" onClick={() => setMode('import')} className="w-full">
                                    Import Existing Wallet
                                </Button>
                                <p className="text-xs text-gray-500 text-center">
                                    Restore wallet using recovery phrase
                                </p>
                            </div>
                        </Card>
                    </div>

                    {error && <div className="text-red-600 text-sm text-center">{error}</div>}
                </div>
            </Layout>
        );
    }

    if (mode === 'create') {
        return (
            <Layout title="Your Recovery Phrase">
                <div className="space-y-6">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900">Save Your Recovery Phrase</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Write down these 12 words in the exact order shown.
                        </p>
                    </div>

                    <Card>
                        <div className="space-y-4">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg
                                            className="h-5 w-5 text-yellow-400"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-yellow-800">
                                            Keep this phrase safe and secret. Anyone with access to it can control your
                                            wallet.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="relative">
                                <div className={`grid grid-cols-3 gap-3 ${!showMnemonic ? 'blur-sm' : ''}`}>
                                    {mnemonic.map((word, index) => (
                                        <div
                                            key={index}
                                            className="bg-gray-50 border border-gray-200 rounded-md p-2 text-center text-sm font-mono"
                                        >
                                            <span className="text-gray-500 text-xs">{index + 1}.</span>
                                            <div className="font-medium">{word}</div>
                                        </div>
                                    ))}
                                </div>

                                {!showMnemonic && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Button onClick={() => setShowMnemonic(true)} size="sm">
                                            Click to reveal
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {showMnemonic && (
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="saved"
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="saved" className="text-sm text-gray-700">
                                            I have safely saved my recovery phrase
                                        </label>
                                    </div>

                                    <Button onClick={handleConfirmMnemonic} className="w-full">
                                        Continue
                                    </Button>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Import Wallet">
            <div className="space-y-6">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900">Import Wallet</h2>
                    <p className="mt-2 text-sm text-gray-600">Enter your 12 or 24-word recovery phrase.</p>
                </div>

                <Card>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Recovery Phrase</label>
                            <textarea
                                value={inputMnemonic}
                                onChange={(e) => setInputMnemonic(e.target.value)}
                                placeholder="Enter your recovery phrase separated by spaces..."
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {error && <div className="text-red-600 text-sm text-center">{error}</div>}

                        <div className="flex space-x-3">
                            <Button variant="secondary" onClick={() => setMode('select')} className="flex-1">
                                Back
                            </Button>
                            <Button
                                onClick={handleImportWallet}
                                isLoading={isLoading}
                                disabled={!inputMnemonic.trim()}
                                className="flex-1"
                            >
                                Import Wallet
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </Layout>
    );
};
