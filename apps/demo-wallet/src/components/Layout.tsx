import React from 'react';

import { useAuthStore } from '../stores';
import { Button } from './Button';

interface LayoutProps {
    children: React.ReactNode;
    title?: string;
    showLogout?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, title = 'TON Wallet', showLogout = false }) => {
    const { lock } = useAuthStore();

    const handleLogout = () => {
        lock();
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-gray-900">{title}</h1>
                    {showLogout && (
                        <Button variant="secondary" size="sm" onClick={handleLogout}>
                            Lock
                        </Button>
                    )}
                </div>
            </header>

            <main className="max-w-md mx-auto px-4 py-6">{children}</main>
        </div>
    );
};
