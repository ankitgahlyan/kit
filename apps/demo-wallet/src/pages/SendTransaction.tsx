import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Layout, Button, Input, Card } from '../components';
import { useWalletStore } from '../stores';
import { useTonWallet } from '../hooks';

export const SendTransaction: React.FC = () => {
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const { balance } = useWalletStore();
    const { sendTransaction } = useTonWallet();

    const formatTonAmount = (amount: string): string => {
        const tonAmount = parseFloat(amount || '0') / 1000000000;
        return tonAmount.toFixed(4);
    };

    const validateAddress = (address: string): boolean => {
        // Basic TON address validation
        // In a real app, use proper TON address validation
        return address.length > 10 && (address.startsWith('EQ') || address.startsWith('UQ'));
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Validate inputs
            if (!validateAddress(recipient)) {
                throw new Error('Invalid recipient address');
            }

            const tonAmount = parseFloat(amount);
            if (tonAmount <= 0) {
                throw new Error('Amount must be greater than 0');
            }

            const currentBalance = parseFloat(formatTonAmount(balance || '0'));
            if (tonAmount > currentBalance) {
                throw new Error('Insufficient balance');
            }

            // Convert TON to nanoTON for sending
            const nanoTonAmount = Math.floor(tonAmount * 1000000000).toString();

            await sendTransaction(recipient, nanoTonAmount);

            // Navigate back to wallet with success message
            navigate('/wallet', {
                state: { message: 'Transaction sent successfully!' },
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send transaction');
        } finally {
            setIsLoading(false);
        }
    };

    const handleMaxAmount = () => {
        const maxAmount = parseFloat(formatTonAmount(balance || '0')) - 0.01; // Leave some for fees
        if (maxAmount > 0) {
            setAmount(maxAmount.toString());
        }
    };

    return (
        <Layout title="Send TON">
            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <Button variant="secondary" size="sm" onClick={() => navigate('/wallet')}>
                        ← Back
                    </Button>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Send Transaction</h2>
                    </div>
                </div>

                {/* Balance Display */}
                <Card>
                    <div className="text-center">
                        <p className="text-sm text-gray-500">Available Balance</p>
                        <p className="text-2xl font-bold text-gray-900">{formatTonAmount(balance || '0')} TON</p>
                    </div>
                </Card>

                {/* Send Form */}
                <Card>
                    <form onSubmit={handleSend} className="space-y-4">
                        <Input
                            label="Recipient Address"
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                            placeholder="EQxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                            required
                            helperText="Enter the recipient's TON address"
                        />

                        <div>
                            <Input
                                type="number"
                                step="0.0001"
                                min="0"
                                label="Amount (TON)"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.0000"
                                required
                                helperText="Minimum transaction: 0.0001 TON"
                            />
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={handleMaxAmount}
                                className="mt-2"
                            >
                                Use Max
                            </Button>
                        </div>

                        {/* Transaction Preview */}
                        {recipient && amount && (
                            <div className="bg-gray-50 rounded-md p-4 space-y-2">
                                <h4 className="font-medium text-gray-900">Transaction Summary</h4>
                                <div className="text-sm space-y-1">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">To:</span>
                                        <span className="font-mono">
                                            {recipient.slice(0, 6)}...{recipient.slice(-6)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Amount:</span>
                                        <span>{amount} TON</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Est. Fee:</span>
                                        <span>~0.01 TON</span>
                                    </div>
                                    <hr className="my-2" />
                                    <div className="flex justify-between font-medium">
                                        <span>Total:</span>
                                        <span>{(parseFloat(amount) + 0.01).toFixed(4)} TON</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {error && <div className="text-red-600 text-sm text-center">{error}</div>}

                        <Button
                            type="submit"
                            isLoading={isLoading}
                            disabled={!recipient || !amount || parseFloat(amount) <= 0}
                            className="w-full"
                        >
                            Send Transaction
                        </Button>
                    </form>
                </Card>

                {/* Warning */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                <path
                                    fillRule="evenodd"
                                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-yellow-800">
                                Double-check the recipient address. TON transactions are irreversible.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};
