// File: src/hooks/useContract.js(file opsional)

import { useMemo } from 'react';
import { Contract } from 'ethers';
// 💡 KOREKSI JALUR: Import useWallet dari lokasi asalnya
import { useWallet } from '../lib/WalletContext'; 
import { 
    CONTRACT_ADDRESS, // Ganti dengan nama variabel Alamat Kontrak Anda
    CONTRACT_ABI      // Ganti dengan nama variabel ABI Kontrak Anda
} from '../lib/config'; // Sesuaikan jalur ke file config Anda (asumsi di src/lib)

export const useContract = () => {
    const { provider, signer, isConnected } = useWallet();

    const contract = useMemo(() => {
        if (!isConnected || !CONTRACT_ADDRESS || !CONTRACT_ABI) {
            return null;
        }

        // Gunakan signer jika tersedia (untuk transaksi), jika tidak gunakan provider (untuk view/read)
        const contractSigner = signer || provider; 

        try {
            return new Contract(
                CONTRACT_ADDRESS,
                CONTRACT_ABI,
                contractSigner
            );
        } catch (error) {
            console.error("Gagal menginisialisasi kontrak:", error);
            return null;
        }
    }, [provider, signer, isConnected]);

    return contract;
};