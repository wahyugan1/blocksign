// src/pages/CreateContract.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileUp, Upload, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { useWallet } from '@/lib/WalletContext'; 
import { uploadToIPFS } from '@/services/ipfsService'; 
import { isAddress } from 'ethers'; 
import SuccessModal from '@/components/SuccessModal'; 

const CreateContract = () => {
    const navigate = useNavigate();
    
    const { 
        contract, 
        signer, 
        isConnected, 
        isLoading: isWalletLoading,
        requiredChainName 
    } = useWallet(); 

    const [currentChainId, setCurrentChainId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [contractData, setContractData] = useState(null); 
    
    const [formData, setFormData] = useState({
        partyAAddress: '',
        partyBAddress: '',
        partyAName: '',
        partyBName: '',
        contractDate: '', 
        contractType: '',
        customContractType: '', // NEW: untuk custom input
    });
    const [file, setFile] = useState(null);
    const [showCustomType, setShowCustomType] = useState(false); // NEW: toggle custom input

    const [walletAddress, setWalletAddress] = useState(null);
    useEffect(() => {
        const getAddressAndChainId = async () => {
            if (signer) {
                const address = await signer.getAddress();
                setWalletAddress(address);
                try {
                    const network = await signer.provider.getNetwork();
                    setCurrentChainId(Number(network.chainId));
                } catch (e) {
                    console.error("Gagal mendapatkan Chain ID:", e);
                    setCurrentChainId(null);
                }
            } else {
                setWalletAddress(null);
                setCurrentChainId(null);
            }
        };
        getAddressAndChainId();
    }, [signer]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            // 🆕 VALIDASI: Cek apakah file kosong (0 bytes)
            if (selectedFile.size === 0) {
                toast.error('File tidak boleh kosong! Silakan pilih file yang valid.');
                e.target.value = ''; // Reset input
                setFile(null);
                return;
            }
            
            // 🆕 VALIDASI: Cek ukuran file maksimal (misalnya 10MB)
            const maxSize = 10 * 1024 * 1024; // 10MB dalam bytes
            if (selectedFile.size > maxSize) {
                toast.error('Ukuran file terlalu besar! Maksimal 10MB.');
                e.target.value = ''; // Reset input
                setFile(null);
                return;
            }
            
            setFile(selectedFile);
            toast.success(`File "${selectedFile.name}" terpilih (${(selectedFile.size / 1024).toFixed(2)} KB)`);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!isConnected || !contract || !signer || !currentChainId) {
            toast.error("Mohon hubungkan dompet Anda sebelum melanjutkan.");
            return;
        }
        
        if (!file) {
            toast.error('Mohon unggah file kontrak');
            return;
        }

        // 🆕 VALIDASI: Double-check file tidak kosong sebelum submit
        if (file.size === 0) {
            toast.error('File tidak boleh kosong! Silakan pilih file yang valid.');
            setFile(null);
            return;
        }

        // VALIDASI ALAMAT
        if (!isAddress(formData.partyAAddress) || !isAddress(formData.partyBAddress)) {
             toast.error('Satu atau kedua alamat dompet tidak valid.');
             return;
        }

        // VALIDASI PIHAK A DENGAN DOMPET TERHUBUNG
        if (formData.partyAAddress.toLowerCase() !== walletAddress.toLowerCase()) {
            toast.error(`Alamat Pihak A harus sesuai dengan alamat dompet yang terhubung: ${walletAddress}`);
            return;
        }

        setLoading(true);

        let ipfsHash = '';
        let uploadTxHash = '';
        let signATxHash = '';

        // 🆕 ID TOAST UNTUK PROGRESSIVE UPDATE
        const progressToastId = 'contract-upload-progress';

        try {
            // === STEP 1: UPLOAD KE IPFS ===
            toast.loading('📤 [1/5] Mengunggah dokumen ke IPFS...', { 
                id: progressToastId,
                duration: Infinity, // Jangan auto-close
            });
            
            ipfsHash = await uploadToIPFS(file);
            console.log("✅ IPFS Hash:", ipfsHash);

            // === STEP 2: VERIFIKASI DOKUMEN DI BLOCKCHAIN ===
            toast.loading('🔍 [2/5] Memverifikasi status dokumen di blockchain...', { 
                id: progressToastId,
                duration: Infinity,
            });
            
            const [isRegistered] = await contract.verifyDocument(ipfsHash); 
            if (isRegistered) {
                toast.error("⚠️ Dokumen sudah pernah diunggah!", { 
                    id: progressToastId,
                    duration: 4000, // Auto-close setelah 4 detik
                });
                setLoading(false);
                return;
            }

            // === STEP 3: TANDA TANGAN DIGITAL PIHAK A ===
            toast.loading('✍️ [3/5] Meminta tanda tangan digital dari Pihak A...', { 
                id: progressToastId,
                duration: Infinity,
            });
            
            const signatureA = await signer.signMessage(ipfsHash);
            console.log("✏️ Signature Pihak A:", signatureA);

            // === STEP 4: TRANSAKSI uploadDocument ===
            toast.loading('📝 [4/5] Mengirim transaksi uploadDocument ke blockchain...\n⏳ Mohon konfirmasi di MetaMask Anda', { 
                id: progressToastId,
                duration: Infinity,
            });
            
            const txUpload = await contract.uploadDocument(
                ipfsHash, 
                file.name, 
                formData.partyAName, 
                formData.partyAAddress, 
                formData.partyBName, 
                formData.partyBAddress, 
                formData.contractType, 
                formData.contractDate 
            );

            // Update: Menunggu konfirmasi
            toast.loading(`⛓️ [4/5] Menunggu konfirmasi blockchain...\nTX Hash: ${txUpload.hash.substring(0, 10)}...`, { 
                id: progressToastId,
                duration: Infinity,
            });
            
            const receiptUpload = await txUpload.wait();
            uploadTxHash = txUpload.hash;
            
            console.log(`✅ TX Upload confirmed: ${uploadTxHash}`);

            // === STEP 5: TRANSAKSI signAsPartyA ===
            toast.loading('🖊️ [5/5] Mengirim transaksi tanda tangan Pihak A...\n⏳ Mohon konfirmasi di MetaMask Anda', { 
                id: progressToastId,
                duration: Infinity,
            });
            
            const txSignA = await contract.signAsPartyA(ipfsHash, signatureA);

            // Update: Menunggu konfirmasi
            toast.loading(`⛓️ [5/5] Menunggu konfirmasi tanda tangan...\nTX Hash: ${txSignA.hash.substring(0, 10)}...`, { 
                id: progressToastId,
                duration: Infinity,
            });
            
            const receiptSignA = await txSignA.wait();
            signATxHash = txSignA.hash;
            
            console.log(`✅ TX Sign confirmed: ${signATxHash}`);

            // === SUKSES! ===
            toast.success('🎉 Kontrak berhasil didaftarkan di blockchain!', { 
                id: progressToastId,
                duration: 3000,
            });

            // SET HASIL SUKSES
            setContractData({
                id: ipfsHash, 
                fileName: file.name,
                fileHash: ipfsHash,
                txHash: uploadTxHash,
                uploadTxHash: uploadTxHash, 
                signTxHash: signATxHash, 
                partyA: formData.partyAName,
                partyAAddress: formData.partyAAddress,
                partyB: formData.partyBName,
                partyBAddress: formData.partyBAddress,
                contractType: formData.contractType,
                contractDate: formData.contractDate,
                createdAt: new Date().toISOString(),
                creatorAddress: walletAddress,
                chainId: currentChainId,
            });

            setShowSuccess(true);
            
            // Reset form
            setFormData({
                partyAAddress: '',
                partyBAddress: '',
                partyAName: '',
                partyBName: '',
                contractDate: '',
                contractType: '',
                customContractType: '',
            });
            setFile(null);
            setShowCustomType(false);
            
        } catch (error) {
            console.error("❌ Blockchain Transaction Failed:", error);
            
            let message = "Gagal. Silakan cek konsol untuk detail.";
            
            // Handle user rejection
            if (error.code === 4001 || error.code === 'ACTION_REJECTED') {
                message = "Transaksi dibatalkan oleh pengguna di MetaMask.";
                toast.error(`❌ ${message}`, { 
                    id: progressToastId,
                    duration: 4000,
                });
            } 
            // Handle document already exists
            else if (error.message && error.message.includes("document already exists")) {
                message = "Hash dokumen sudah terdaftar di blockchain.";
                toast.error(`⚠️ ${message}`, { 
                    id: progressToastId,
                    duration: 4000,
                });
            }
            // Handle insufficient funds
            else if (error.message && error.message.includes("insufficient funds")) {
                message = "Saldo tidak cukup untuk membayar gas fee.";
                toast.error(`💸 ${message}`, { 
                    id: progressToastId,
                    duration: 4000,
                });
            }
            // Generic error
            else {
                toast.error(`❌ Gagal mendaftarkan kontrak: ${message}`, { 
                    id: progressToastId,
                    duration: 4000,
                });
            }
            
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Handle contract type dropdown
        if (name === 'contractType') {
            if (value === 'custom') {
                setShowCustomType(true);
                setFormData(prev => ({
                    ...prev,
                    contractType: '',
                    customContractType: ''
                }));
            } else {
                setShowCustomType(false);
                setFormData(prev => ({
                    ...prev,
                    contractType: value,
                    customContractType: ''
                }));
            }
        } else if (name === 'customContractType') {
            setFormData(prev => ({
                ...prev,
                contractType: value,
                customContractType: value
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    return (
        <div data-testid="create-contract-page">
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-bold text-white">Buat Kontrak Baru</h1>
                    <p className="text-gray-400">Daftarkan kontrak digital Anda di blockchain</p>
                </div>

                <Card className="glass-effect border-white/10 p-6 sm:p-8">
                    {!isConnected && (
                        <div className="flex items-center justify-center p-4 mb-6 rounded-lg bg-amber-500/10 border border-amber-500/30">
                            <AlertTriangle className="h-5 w-5 text-amber-300 mr-3 flex-shrink-0" />
                            <p className="text-sm text-amber-300">
                                Mohon hubungkan dompet Anda ke jaringan {requiredChainName} untuk mengaktifkan tombol *submit*.
                            </p>
                        </div>
                    )}
                    
                    {isWalletLoading && (
                        <div className="flex items-center justify-center p-4 mb-6 rounded-lg bg-indigo-500/10 border border-indigo-500/30">
                            <Loader2 className="h-4 w-4 text-indigo-300 mr-2 animate-spin" />
                            <p className="text-sm text-indigo-300">
                                Sedang memuat status dompet.
                            </p>
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Unggah File */}
                        <div className="space-y-2">
                            <Label htmlFor="file-upload" className="text-white">File Kontrak *</Label>
                            <div className="relative">
                                <input
                                    id="file-upload"
                                    type="file"
                                    onChange={handleFileChange}
                                    data-testid="file-upload-input"
                                    className="hidden"
                                    accept=".pdf,.docx,.doc,.txt"
                                />
                                <label
                                    htmlFor="file-upload"
                                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-indigo-500/30 rounded-lg cursor-pointer hover:border-indigo-500/50 transition-all glass-effect"
                                >
                                    {file ? (
                                        <div className="flex items-center space-x-2">
                                            <FileUp className="h-6 w-6 text-indigo-400" />
                                            <span className="text-sm text-gray-300">{file.name}</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center space-y-2">
                                            <Upload className="h-8 w-8 text-gray-400" />
                                            <span className="text-sm text-gray-400">Klik untuk mengunggah file kontrak</span>
                                            <span className="text-xs text-gray-500">PDF, DOCX, DOC, TXT</span>
                                        </div>
                                    )}
                                </label>
                            </div>
                        </div>

                        {/* Pihak A */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="partyAName" className="text-white">Nama Pihak A *</Label>
                                <Input
                                    id="partyAName"
                                    name="partyAName"
                                    value={formData.partyAName}
                                    onChange={handleChange}
                                    data-testid="party-a-name-input"
                                    required
                                    placeholder="Masukkan nama"
                                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-indigo-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="partyAAddress" className="text-white">Alamat Dompet Pihak A * <span className='text-xs text-amber-400'>(Harus dompet yang sedang terhubung)</span></Label>
                                <Input
                                    id="partyAAddress"
                                    name="partyAAddress"
                                    value={formData.partyAAddress}
                                    onChange={handleChange}
                                    data-testid="party-a-address-input"
                                    required
                                    placeholder={walletAddress || "0x..."}
                                    className={`bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-indigo-500 font-mono text-sm ${isConnected && formData.partyAAddress.toLowerCase() === walletAddress?.toLowerCase() ? 'border-green-500/50' : ''}`}
                                />
                            </div>
                        </div>

                        {/* Pihak B */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="partyBName" className="text-white">Nama Pihak B *</Label>
                                <Input
                                    id="partyBName"
                                    name="partyBName"
                                    value={formData.partyBName}
                                    onChange={handleChange}
                                    data-testid="party-b-name-input"
                                    required
                                    placeholder="Masukkan nama"
                                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-indigo-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="partyBAddress" className="text-white">Alamat Dompet Pihak B *</Label>
                                <Input
                                    id="partyBAddress"
                                    name="partyBAddress"
                                    value={formData.partyBAddress}
                                    onChange={handleChange}
                                    data-testid="party-b-address-input"
                                    required
                                    placeholder="0x..."
                                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-indigo-500 font-mono text-sm"
                                />
                            </div>
                        </div>

                        {/* Jenis Kontrak */}
                        <div className="space-y-2">
                            <Label htmlFor="contractType" className="text-white">Jenis Kontrak *</Label>
                            
                            {!showCustomType ? (
                                <select
                                    id="contractType"
                                    name="contractType"
                                    value={formData.contractType}
                                    onChange={handleChange}
                                    data-testid="contract-type-select"
                                    required
                                    className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                                >
                                    <option value="" disabled className="bg-gray-900">Pilih jenis kontrak</option>
                                    <option value="Kesepakatan Bisnis" className="bg-gray-900">Kesepakatan Bisnis</option>
                                    <option value="Kontrak Kerja" className="bg-gray-900">Kontrak Kerja</option>
                                    <option value="MOU" className="bg-gray-900">MOU (Memorandum of Understanding)</option>
                                    <option value="Perjanjian Kerjasama" className="bg-gray-900">Perjanjian Kerjasama</option>
                                    <option value="Kontrak Jual Beli" className="bg-gray-900">Kontrak Jual Beli</option>
                                    <option value="Surat Perjanjian" className="bg-gray-900">Surat Perjanjian</option>
                                    <option value="custom" className="bg-gray-900 text-amber-300">✏️ Lainnya (Ketik Manual)</option>
                                </select>
                            ) : (
                                <div className="space-y-2">
                                    <Input
                                        id="customContractType"
                                        name="customContractType"
                                        value={formData.customContractType}
                                        onChange={handleChange}
                                        data-testid="custom-contract-type-input"
                                        required
                                        placeholder="Ketik jenis kontrak Anda..."
                                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-indigo-500"
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowCustomType(false);
                                            setFormData(prev => ({
                                                ...prev,
                                                contractType: '',
                                                customContractType: ''
                                            }));
                                        }}
                                        className="text-xs text-indigo-400 hover:text-indigo-300 underline"
                                    >
                                        ← Kembali ke pilihan dropdown
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Tanggal Kontrak */}
                        <div className="space-y-2">
                            <Label htmlFor="contractDate" className="text-white">Tanggal Kontrak (Akhir Masa Kontrak/Tanggal Penting) *</Label>
                            <Input
                                id="contractDate"
                                name="contractDate"
                                type="date"
                                value={formData.contractDate}
                                onChange={handleChange}
                                data-testid="contract-date-input"
                                required
                                min={new Date().toISOString().split('T')[0]}
                                className="bg-white/5 border-white/10 text-white focus:border-indigo-500"
                            />
                        </div>
                        
                        {/* Tombol Submit */}
                        <Button
                            type="submit"
                            data-testid="submit-contract-btn"
                            disabled={loading || !isConnected} 
                            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-6 text-lg"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                    Mendaftarkan ke Blockchain...
                                </>
                            ) : (
                                'Daftarkan Kontrak di Blockchain'
                            )}
                        </Button>
                        {!isConnected && (
                            <p className="text-center text-sm text-red-400 mt-2">
                                Tombol dinonaktifkan. Hubungkan dompet Anda untuk mendaftarkan kontrak.
                            </p>
                        )}
                    </form>
                </Card>
            </div>

            {showSuccess && contractData && (
                <SuccessModal
                    contract={contractData}
                    onClose={() => {
                        setShowSuccess(false);
                        navigate('/history');
                    }}
                />
            )}
        </div>
    );
};

export default CreateContract;