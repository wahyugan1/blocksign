// src/lib/WalletContext.jsx

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { toast } from 'sonner';

// Import konfigurasi Anda, TERMASUK CHAIN ID yang sudah Anda tambahkan di config.js
import { 
    CONTRACT_ADDRESS, 
    CONTRACT_ABI,
    SEPOLIA_CHAIN_ID,        // 11155111
    SEPOLIA_CHAIN_ID_HEX,    // '0xaa36a7'
} from './config'; 

// --- Definisikan Context dan Hook ---
export const WalletContext = createContext(null);
export const useWallet = () => useContext(WalletContext); // Ekspor useWallet di sini

// --- Wallet Provider ---
export const WalletProvider = ({ children }) => {
    // State Ethers.js dan Wallet
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [contract, setContract] = useState(null);
    const [address, setAddress] = useState(localStorage.getItem("walletAddress") || null);
    const [ensName, setEnsName] = useState(null);
    const [chainId, setChainId] = useState(null); // Tambah state chainId
    const [isLoading, setIsLoading] = useState(true);

    // --- Fungsi ENS Resolution ---
    const resolveEnsName = async (providerInstance, address) => {
        if (!providerInstance) return null;
        try {
            // ENS lookup
            const ensName = await providerInstance.lookupAddress(address);
            return ensName;
        } catch (error) {
            // Error ini wajar di Testnet
            return null;
        }
    };

    // --- FUNGSI UTAMA: UPDATE STATE ---
    // Menerima Signer yang sudah divalidasi dan Network
    const updateState = useCallback(async (newSigner, network) => {
        if (!newSigner) {
            // Logika Reset state saat logout
            setProvider(null);
            setSigner(null);
            setContract(null);
            setAddress(null);
            setEnsName(null);
            setChainId(null);
            localStorage.removeItem("walletAddress");
            return;
        }

        try {
            const newAddress = await newSigner.getAddress();
            const newProvider = newSigner.provider;
            const currentChainId = Number(network.chainId);

            let newContract = null;
            if (CONTRACT_ADDRESS && CONTRACT_ABI.length > 0) {
                newContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, newSigner);
                console.log("Kontrak diinisialisasi.");
            } else {
                console.warn("⚠️ CONTRACT_ADDRESS atau CONTRACT_ABI belum dikonfigurasi.");
            }

            // --- PENETAPAN STATE ---
            setProvider(newProvider);
            setSigner(newSigner);
            setContract(newContract);
            setChainId(currentChainId); // Set Chain ID
            
            setAddress(newAddress);
            localStorage.setItem("walletAddress", newAddress);
            
            const resolvedEns = await resolveEnsName(newProvider, newAddress);
            setEnsName(resolvedEns);

            // Log dan Notifikasi Sukses
            const displayAddress = resolvedEns || `${newAddress.slice(0, 6)}...${newAddress.slice(-4)}`;
            toast.success(`Wallet connected: ${displayAddress} (Sepolia)`);
            console.log(`✅ Wallet terhubung: ${newAddress} (ENS: ${resolvedEns}) | Chain ID: ${currentChainId}`);

        } catch (err) {
            console.error("❌ KESALAHAN KRITIS saat memperbarui state di updateState:", err);
            // Reset state jika ada kegagalan internal
            setAddress(null); 
            setSigner(null);
            setContract(null);
            setChainId(null);
        }
    }, []);

    // --- FUNGSI UTAMA: CEK KONEKSI DAN JARINGAN ---
    const checkConnectionAndChain = useCallback(async () => {
        if (typeof window.ethereum === 'undefined') {
            setIsLoading(false);
            return;
        }

        try {
            const browserProvider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await browserProvider.listAccounts(); 
            const network = await browserProvider.getNetwork();
            const currentChainId = Number(network.chainId);

            if (accounts.length === 0) {
                // Tidak ada akun terhubung
                updateState(null, network);
                setIsLoading(false);
                return;
            }

            // --- 🔑 LOGIKA PERIKSA JARINGAN (INTI SOLUSI) ---
            if (currentChainId !== SEPOLIA_CHAIN_ID) {
                setChainId(currentChainId); // Tunjukkan Chain ID yang salah
                
                // Mencegah notifikasi berulang jika sedang beralih
                if (localStorage.getItem('isSwitchingChain') !== 'true') {
                    toast.warning(`Jaringan salah! Harap beralih ke Sepolia Testnet (Current ID: ${currentChainId}).`, { duration: 8000 });
                }
                
                try {
                    localStorage.setItem('isSwitchingChain', 'true'); // Flag switching
                    // Mencoba beralih jaringan
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }],
                    });
                    // Jika switch berhasil, pembaruan akan ditangani oleh listener 'chainChanged'
                } catch (switchError) {
                    localStorage.removeItem('isSwitchingChain'); // Hapus flag jika gagal/batal
                    if (switchError.code === 4902) {
                        toast.error("Sepolia belum ditambahkan ke MetaMask. Harap tambahkan secara manual.");
                    } else if (switchError.code === 4001) {
                         toast.info("Pengalihan jaringan dibatalkan oleh pengguna.");
                    } else {
                        toast.error("Gagal beralih jaringan. Periksa konsol.");
                    }
                }
                setIsLoading(false);
                return;
            }
            // --- 🔑 AKHIR LOGIKA PERIKSA JARINGAN ---
            
            // Jaringan sudah benar, lanjutkan inisialisasi signer dan state
            localStorage.removeItem('isSwitchingChain'); // Pastikan flag bersih
            const newSigner = await browserProvider.getSigner(accounts[0].address);
            await updateState(newSigner, network);

        } catch (err) {
            console.error("❌ Gagal memeriksa koneksi dan jaringan:", err);
            toast.error("Gagal terhubung ke dompet.");
            updateState(null, null);
        } finally {
            setIsLoading(false);
        }
    }, [updateState]); 

    // --- FUNGSI LOGOUT ---
    const logoutWallet = useCallback(() => {
        updateState(null, null);
        toast.info("Wallet disconnected.");
        console.log("🚪 Wallet berhasil di-logout dari aplikasi.");
    }, [updateState]);

    // --- FUNGSI CONNECT WALLET (pemicu manual) ---
    const connectWallet = useCallback(async () => {
        if (!window.ethereum) {
            toast.error("⚠️ Metamask tidak ditemukan di browser Anda.");
            return;
        }
        
        setIsLoading(true);
        try {
            // Meminta koneksi
            await window.ethereum.request({ method: "eth_requestAccounts" });
            
            // Panggil cek koneksi untuk memvalidasi jaringan setelah koneksi berhasil
            await checkConnectionAndChain();

        } catch (err) {
            console.error("❌ Gagal konek wallet:", err);
            if (err.code === 4001) {
                toast.info("Koneksi wallet dibatalkan oleh pengguna.");
            } else {
                toast.error("Gagal menghubungkan wallet. Periksa konsol.");
            }
        } finally {
            setIsLoading(false);
        }
    }, [checkConnectionAndChain]);

    // --- useEffect 1: CHECK KONEKSI SAAT MUAT ---
    useEffect(() => {
        checkConnectionAndChain();
    }, [checkConnectionAndChain]);

    // --- useEffect 2: EVENT LISTENERS METAMASK ---
    useEffect(() => {
        if (!window.ethereum) return;
        
        // Debounce untuk handleAccountsChanged
        let timeoutId;

        const handleAccountsChanged = (accounts) => {
            if (timeoutId) clearTimeout(timeoutId);

            timeoutId = setTimeout(() => {
                console.log("🔄 Akun Metamask berubah. Accounts Length:", accounts.length); 
                checkConnectionAndChain(); // Panggil cek total untuk refresh penuh
            }, 150);
        };

        const handleChainChanged = (chainIdHex) => {
            console.log("🔄 Jaringan Metamask berubah ke Chain ID:", chainIdHex);
            // Panggil checkConnectionAndChain; ini akan memicu refresh state/permintaan switch jika salah.
            checkConnectionAndChain(); 
        };
        
        window.ethereum.on("accountsChanged", handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
            if (window.ethereum && window.ethereum.removeListener) {
                window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
                window.ethereum.removeListener('chainChanged', handleChainChanged);
            }
        };
    }, [checkConnectionAndChain]);

    // --- Objek Context yang diekspos ---
    const contextValue = {
        provider,        // ✅ Ini penting untuk ENS avatar
        signer,
        contract,
        address,
        ensName,
        chainId,
        isConnected: !!address && chainId === SEPOLIA_CHAIN_ID, 
        isLoading,
        connectWallet,
        logoutWallet,
        requiredChainId: SEPOLIA_CHAIN_ID,
        requiredChainName: "Sepolia Testnet",
    };

    return (
        <WalletContext.Provider value={contextValue}>
            {children}
        </WalletContext.Provider>
    );
};