// src/components/WalletConnect.jsx

import React from 'react';
import { Wallet, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWallet } from '../hooks/useWallet';
import WalletAvatar from './WalletAvatar'; // ✅ Import WalletAvatar

const WalletConnect = () => {
    const { 
        address, 
        ensName, 
        isConnected, 
        isLoading, 
        connectWallet: contextConnect,
        logoutWallet: contextLogout
    } = useWallet();

    const handleConnect = async () => {
        await contextConnect();
    };

    const handleDisconnect = () => {
        contextLogout();
    };

    const formatAddress = (addr) => {
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };
    
    // Tampilkan status loading
    if (isLoading) {
        return (
            <Button disabled variant="ghost" className="text-gray-500">
                <Wallet className="h-4 w-4 mr-2 animate-spin" />
                Memuat...
            </Button>
        );
    }

    // --- Tampilan setelah Terhubung ---
    if (isConnected) {
        const displayAddress = ensName ? ensName : formatAddress(address);
        
        return (
            <div className="flex items-center space-x-2">
                {/* ✅ Tambahkan WalletAvatar di sini */}
                <WalletAvatar size={37} className="hidden sm:block" />
                
                <div className="hidden sm:flex items-center px-3 py-2 rounded-lg glass-effect border border-indigo-500/30">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                    <span className="text-sm font-mono text-gray-200" data-testid="wallet-address">
                        {displayAddress}
                    </span>
                </div>
                
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDisconnect}
                    data-testid="disconnect-wallet-btn"
                    className="text-gray-300 hover:text-red-400 hover:bg-red-500/10"
                    title="Disconnect Wallet"
                >
                    <LogOut className="h-5 w-5" />
                </Button>
            </div>
        );
    }

    // --- Tampilan Belum Terhubung ---
    return (
        <Button
            onClick={handleConnect}
            data-testid="connect-wallet-btn"
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium px-4 py-2 rounded-lg transition-all shadow-lg shadow-indigo-500/25"
        >
            <Wallet className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Connect Wallet</span>
            <span className="sm:hidden">Connect</span>
        </Button>
    );
};

export default WalletConnect;