// src/hooks/useWallet.js

import { useContext } from 'react';
// 🔑 Import Context yang sudah diekspor
import { WalletContext } from '../lib/WalletContext';
/**
 * Custom hook untuk mengakses state dan fungsi koneksi wallet secara global.
 */
export const useWallet = () => {
    const context = useContext(WalletContext);
    
    if (!context) {
        throw new Error('useWallet harus digunakan di dalam WalletProvider.');
    }
    
    return context;
};