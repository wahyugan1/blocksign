import React, { useState, useCallback, useEffect } from 'react';
import { FileUp, Upload, Search, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

import { useWallet } from '../hooks/useWallet'; 
import { uploadToIPFS } from '@/services/ipfsService'; 
import ContractDetails from '@/components/VerificationDetail';

const VerifyContract = () => {
  const { 
    contract, 
    isConnected, 
    isLoading: isWalletLoading,
    requiredChainName,
  } = useWallet(); 
  
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [file, setFile] = useState(null);
  const [hashInput, setHashInput] = useState('');

  // 🆕 HELPER FUNCTION: Format date konsisten untuk semua device
  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(Number(timestamp) * 1000);
      
      // Cek apakah date valid
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      // Format manual yang lebih reliable
      const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      };
      
      return new Intl.DateTimeFormat('id-ID', options).format(date);
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'Invalid Date';
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setVerificationResult(null);
      toast.success(`File "${selectedFile.name}" selected`);
    }
  };

  // FUNGSI PANGGILAN CONTRACT KE BLOCKCHAIN
  const fetchDocumentDetail = useCallback(async (hash) => {
    if (!contract) {
        throw new Error("Objek kontrak tidak tersedia. Silakan hubungkan ke jaringan yang benar");
    }
    
    const docDetails = await contract.getDocumentDetail(hash);
    
    if (Number(docDetails.timestamp) === 0) {
        throw new Error("❌ Dokumen tidak ditemukan di blockchain!");
    }

    return {
        fileHash: hash,
        timestamp: formatTimestamp(docDetails.timestamp), // 🆕 Gunakan helper function
        partyA: docDetails.partyA,
        partyAAddress: docDetails.partyAAddress,
        partyB: docDetails.partyB,
        partyBAddress: docDetails.partyBAddress,
        contractType: docDetails.contractType,
        contractDate: docDetails.contractDate,
        isPartyASigned: docDetails.isPartyASigned,
        isPartyBSigned: docDetails.isPartyBSigned,
    };
  }, [contract]);

  // LOGIKA UTAMA VERIFIKASI HASH
  const verifyHash = useCallback(async (hash) => {
    if (!isConnected) {
        toast.warning(`Wallet belum terhubung atau tidak aktif ${requiredChainName}.`);
        throw new Error('Wallet belum siap');
    }

    try {
        const contractDetails = await fetchDocumentDetail(hash);
        
        setVerificationResult({
            valid: true,
            contract: contractDetails, 
        });
        toast.success('Kontrak berhasil diverifikasi di Blockchain!');
        
        const count = parseInt(localStorage.getItem('verificationCount') || '0');
        localStorage.setItem('verificationCount', (count + 1).toString());
        
    } catch (error) {
        console.error("Verifikasi Blockchain Gagal:", error);
        
        let message = 'Verifikasi gagal: Kesalahan tidak diketahui.';
        if (error.message.includes("tidak ditemukan")) {
            message = "Hash dokumen tidak ditemukan di blockchain.";
        } else {
            message = `Verifikasi Gagal: ${error.message}`;
        }

        setVerificationResult({
            valid: false,
            hash,
        });
        toast.error(message);
        throw error;
    }
  }, [isConnected, fetchDocumentDetail, requiredChainName]);

  // FUNGSI VERIFIKASI DARI FILE
  const verifyByFile = async () => {
    if (!file) {
      toast.error('Silahkan pilih file');
      return;
    }
    if (!isConnected) {
        toast.warning(`Silahkan hubungkan wallet Anda ke ${requiredChainName} terlebih dahulu.`);
        return;
    }

    setLoading(true);
    
    try {
      toast.info('Mengunggah file ke IPFS. Harap tunggu...');
      const ipfsHash = await uploadToIPFS(file); 
      
      setHashInput(ipfsHash); 
      await verifyHash(ipfsHash); 
      
    } catch (error) {
      toast.error('Verifikasi Gagal: ' + error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const verifyByHash = async () => {
    if (!hashInput.trim()) {
      toast.error('Silahkan masukkan hash');
      return;
    }
    if (!isConnected) {
        toast.warning(`Silahkan hubungkan wallet Anda ke ${requiredChainName} terlebih dahulu.`);
        return;
    }

    setLoading(true);
    
    try {
      await verifyHash(hashInput.trim());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  // LISTENER EVENT BLOCKCHAIN (DocumentSigned)
  useEffect(() => {
    if (contract && isConnected) {
        const listener = (docHash, signerAddress, partyType, event) => {
            if (verificationResult && verificationResult.contract && verificationResult.contract.fileHash.toLowerCase() === docHash.toLowerCase()) {
                toast.info(`Signature Event detected for ${docHash.substring(0, 8)}... Refreshing details.`);
                verifyHash(docHash); 
            }
        };

        contract.on("DocumentSigned", listener);

        return () => {
            contract.off("DocumentSigned", listener);
        };
    }
  }, [contract, isConnected, verificationResult, verifyHash]);


  const isActionDisabled = loading || isWalletLoading || !isConnected;

  return (
    <div className="max-w-4xl mx-auto space-y-6" data-testid="verify-contract-page">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-white">Verifikasi Kontrak</h1>
        <p className="text-gray-400">Periksa keaslian kontrak dan catatan blockchain</p>
        
        {isWalletLoading && <p className="text-yellow-400">Menghubungkan Dompet...</p>}
        {!isConnected && !isWalletLoading && <p className="text-red-400">❌ Mohon hubungkan dompet Anda ke jaringan {requiredChainName} untuk verifikasi.</p>}

      </div>

      <Card className="glass-effect border-white/10 p-6 sm:p-8">
        <Tabs defaultValue="file" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/5 mb-6">
            <TabsTrigger value="file" data-testid="verify-by-file-tab">Verifikasi Dengan File</TabsTrigger>
            <TabsTrigger value="hash" data-testid="verify-by-hash-tab">Verifikasi Dengan Hash</TabsTrigger>
          </TabsList>

          <TabsContent value="file" className="space-y-6">
            <div className="space-y-4">
              <Label className="text-white">Unggah File Kontrak</Label>
              <div className="relative">
                <input
                  id="verify-file-upload"
                  type="file"
                  onChange={handleFileChange}
                  data-testid="verify-file-input"
                  className="hidden"
                  accept=".pdf,.docx,.doc,.txt"
                />
                <label
                  htmlFor="verify-file-upload"
                  className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-indigo-500/30 rounded-lg cursor-pointer hover:border-indigo-500/50 transition-all glass-effect"
                >
                  {file ? (
                    <div className="flex items-center space-x-2">
                      <FileUp className="h-8 w-8 text-indigo-400" />
                      <div className="text-center">
                        <p className="text-sm text-gray-300 font-medium">{file.name}</p>
                        <p className="text-xs text-gray-500 mt-1">Klik untuk mengubah file</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-2">
                      <Upload className="h-10 w-10 text-gray-400" />
                      <span className="text-sm text-gray-400">Klik untuk mengunggah file kontrak</span>
                      <span className="text-xs text-gray-500">PDF, DOCX, DOC, TXT</span>
                    </div>
                  )}
                </label>
              </div>
              <Button
                onClick={verifyByFile}
                data-testid="verify-file-btn"
                disabled={isActionDisabled || !file}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-6"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Mengunggah & Memverifikasi...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Verifikasi Kontrak
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="hash" className="space-y-6">
            <div className="space-y-4">
              <Label htmlFor="hash-input" className="text-white">Masukkan Hash Kontrak</Label>
              <Input
                id="hash-input"
                value={hashInput}
                onChange={(e) => setHashInput(e.target.value)}
                data-testid="hash-input"
                placeholder="Enter the contract hash (IPFS CID)"
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-indigo-500 font-mono"
              />
              <Button
                onClick={verifyByHash}
                data-testid="verify-hash-btn"
                disabled={isActionDisabled || !hashInput.trim()}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-6"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Memverifikasi...
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5 mr-2" />
                    Verifikasi Hash
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Verification Result */}
      {verificationResult && (
        <Card className={`glass-effect p-6 sm:p-8 border-2 ${
          verificationResult.valid 
            ? 'border-green-500/50 bg-green-500/5' 
            : 'border-red-500/50 bg-red-500/5'
        }`} data-testid="verification-result">
          <div className="flex items-center space-x-3 mb-6">
            {verificationResult.valid ? (
              <>
                <CheckCircle className="h-8 w-8 text-green-400" />
                <div>
                  <h3 className="text-xl font-semibold text-white">Kontrak Terverifikasi ✓</h3>
                  <p className="text-sm text-green-300">Kontrak ini valid dan terdaftar di blockchain</p>
                </div>
              </>
            ) : (
              <>
                <XCircle className="h-8 w-8 text-red-400" />
                <div>
                  <h3 className="text-xl font-semibold text-white">Kontrak Tidak Ditemukan ✗</h3>
                  <p className="text-sm text-red-300">Kontrak ini tidak terdaftar di blockchain atau mungkin telah diubah</p>
                </div>
              </>
            )}
          </div>

          {verificationResult.valid && verificationResult.contract && (
            <ContractDetails contract={verificationResult.contract} />
          )}

          {!verificationResult.valid && (
            <div className="mt-4 p-4 bg-white/5 rounded-lg">
              <p className="text-xs text-gray-400 font-mono break-all">
                Hash: {verificationResult.hash}
              </p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default VerifyContract;