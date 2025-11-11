// File: hooks/useVerificationHistory.js

import { useState, useEffect, useCallback } from 'react';

// Kunci penyimpanan di localStorage
const STORAGE_KEY = 'verificationCount';

/**
 * Hook untuk mengelola dan melacak hitungan verifikasi hash yang berhasil.
 * Data disimpan secara lokal di localStorage.
 */
export const useVerificationHistory = () => {
    const [count, setCount] = useState(0);

    // 1. Ambil hitungan dari localStorage saat mount
    useEffect(() => {
        try {
            const storedCount = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
            setCount(storedCount);
        } catch (error) {
            console.error("Gagal membaca verificationCount dari localStorage:", error);
            setCount(0);
        }
    }, []);

    // 2. Fungsi untuk menambah hitungan
    const incrementVerificationCount = useCallback(() => {
        setCount(prevCount => {
            const newCount = prevCount + 1;
            
            // Simpan nilai baru ke localStorage
            try {
                localStorage.setItem(STORAGE_KEY, newCount.toString());
            } catch (error) {
                console.error("Gagal menyimpan verificationCount ke localStorage:", error);
            }

            return newCount;
        });
    }, []);

    return {
        verificationCount: count,
        incrementVerificationCount,
        // Fungsi reset, mungkin berguna di halaman Verifikasi
        resetVerificationCount: () => {
            setCount(0);
            localStorage.setItem(STORAGE_KEY, '0');
        }
    };
};