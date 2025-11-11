import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ExternalLink, User, CheckCircle, PenTool, AlertCircle, Clock, Search, RefreshCw } from 'lucide-react'; 
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ContractDetails from '@/components/ContractDetails'; 
import { useWallet } from '../hooks/useWallet';
import { useDocumentHistory } from '../hooks/useDocumentHistory'; 
import { Input } from '@/components/ui/input';

const ContractHistory = () => {
    const navigate = useNavigate();
    const [selectedContract, setSelectedContract] = useState(null);
    
    const { isConnected, address } = useWallet();
    const { 
        contracts,
        loading, 
        isRefreshing,
        error, 
        signDocument,
        totalDocuments,
        search,
        setSearch,
        currentPage,
        totalPages,
        setCurrentPage,
        manualRefresh,
        dataSource,
        activeCount,
        expiredCount,
        pendingSignatureCount, // NEW: Menunggu TTD
    } = useDocumentHistory();

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getStatusBadge = (contract) => {
        const isFullySigned = contract.isFullySigned;
        const needsUserSignature = contract.needsSigning;
        const isExpired = contract.isExpired;

        if (isExpired) {
             return <Badge className="bg-red-500/20 text-red-300 border-red-500/30 flex items-center gap-1">
                 <Clock className="h-3 w-3" /> Kadaluarsa
             </Badge>;
        }
        
        if (isFullySigned) {
            return <Badge className="bg-green-500/20 text-green-300 border-green-500/30 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> Selesai
            </Badge>;
        }

        if (needsUserSignature) {
            return <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 flex items-center gap-1">
                <PenTool className="h-3 w-3" /> Perlu Tanda Tangan
            </Badge>;
        }

        return <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">Menunggu Pihak Lain</Badge>;
    };

    if (selectedContract) {
        return (
            <div className="max-w-4xl mx-auto space-y-6" data-testid="contract-details-view">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-white">Detail Kontrak</h1>
                    <Button
                        onClick={() => setSelectedContract(null)}
                        data-testid="back-to-history-btn"
                        variant="outline"
                        className="border-white/10 text-gray-300 hover:bg-white/5"
                    >
                        Kembali ke Riwayat
                    </Button>
                </div>
                <Card className="glass-effect border-white/10 p-6 sm:p-8">
                    <ContractDetails contract={selectedContract} showQR /> 
                </Card>
            </div>
        );
    }
    
    return (
        <div className="space-y-6" data-testid="contract-history-page">
            
            {/* Header dan Metrik */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-white">Riwayat Kontrak</h1>
                    <p className="text-gray-400 mt-2">
                        Lihat semua kontrak terdaftar Anda
                        {/* NEW: Tampilkan sumber data */}
                        {dataSource && (
                            <span className="ml-2 text-xs text-gray-500">
                                • Data dari {dataSource === 'subgraph' ? 'Subgraph' : 'Blockchain'}
                            </span>
                        )}
                    </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-right">
                    <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                        <p className="text-xs text-gray-400">Total</p>
                        <p className="text-xl font-bold text-white" data-testid="total-contracts-count">{totalDocuments}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                        <p className="text-xs text-gray-400">Aktif</p>
                        <p className="text-xl font-bold text-green-300" data-testid="active-contracts-count">{activeCount}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                        <p className="text-xs text-gray-400">Menunggu TTD</p>
                        <p className="text-xl font-bold text-amber-300" data-testid="pending-signature-count">{pendingSignatureCount}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                        <p className="text-xs text-gray-400">Kadaluarsa</p>
                        <p className="text-xl font-bold text-red-300" data-testid="expired-contracts-count">{expiredCount}</p>
                    </div>
                </div>
            </div>
            
            {/* NEW: Search Bar + Refresh Button */}
            <div className="flex gap-3">
                <div className="relative flex-1">
                    <Input
                        type="text"
                        placeholder={isConnected ? "Cari nama file, hash IPFS, atau nama pihak..." : "Hubungkan dompet untuk mengaktifkan pencarian"}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        disabled={!isConnected} 
                        className={`
                            bg-white/10 border-white/20 text-white placeholder-gray-400 focus:ring-indigo-500
                            ${!isConnected && 'opacity-50 cursor-not-allowed'}
                        `}
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
                
                {/* Manual Refresh Button */}
                <Button
                    onClick={manualRefresh}
                    disabled={!isConnected || loading || isRefreshing}
                    variant="outline"
                    className="border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10 px-4"
                    title="Refresh data kontrak"
                >
                    <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
            </div>
            
            {/* NEW: Loading Indicator for Refresh */}
            {isRefreshing && (
                <div className="flex items-center justify-center p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                    <RefreshCw className="h-4 w-4 text-indigo-300 mr-2 animate-spin" />
                    <p className="text-sm text-indigo-300">Memperbarui data...</p>
                </div>
            )}
            
            {(!isConnected || !address) ? (
                <div className="flex items-center justify-center min-h-[30vh]">
                    <Card className="glass-effect border-amber-500/30 p-8 max-w-lg text-center">
                        <AlertCircle className="h-10 w-10 text-amber-500 mx-auto mb-4"/>
                        <p className="text-amber-300 text-xl font-semibold mb-4">⚠️ Dompet Belum Terhubung</p>
                        <p className="text-gray-400 mb-6">Harap hubungkan dompet (wallet) Anda untuk memuat dan melihat daftar riwayat kontrak yang terkait dengan alamat Anda.</p>
                        <Button onClick={() => navigate('/')} className="bg-gradient-to-r from-indigo-500 to-purple-600">
                            Kembali ke Dashboard
                        </Button>
                    </Card>
                </div>
            ) : loading ? (
                <Card className="glass-effect border-white/10 p-12 text-center">
                    <p className="text-indigo-400">⏳ Memuat data dari The Graph dan Smart Contract...</p>
                </Card>
            ) : error ? (
                <Card className="glass-effect border-red-500/30 p-12 text-center">
                    <p className="text-red-300">❌ Gagal memuat riwayat: {error}</p>
                </Card>
            ) : contracts.length === 0 ? (
                <Card className="glass-effect border-white/10 p-12 text-center">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="p-4 rounded-full bg-indigo-500/10">
                            <FileText className="h-12 w-12 text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-white mb-2">Belum Ada Kontrak</h3>
                            <p className="text-gray-400 mb-6">Mulai dengan membuat kontrak blockchain pertama Anda</p>
                            <Button
                                onClick={() => navigate('/create')}
                                data-testid="create-first-contract-btn"
                                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                            >
                                Buat Kontrak
                            </Button>
                        </div>
                    </div>
                </Card>
            ) : (
                <div className="space-y-4">
                    {contracts.map((contract) => {
                        const needsSignature = contract.needsSigning;
                        const signRole = contract.isCurrentUserPartyA ? 'A' : 'B';

                        return (
                            <Card
                                key={contract.id}
                                data-testid={`contract-card-${contract.fileHash}`}
                                className="glass-effect border-white/10 p-6 hover:border-indigo-500/30 transition-all contract-card cursor-pointer"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex-1 space-y-3" onClick={() => setSelectedContract(contract)}>
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="p-2 rounded-lg bg-indigo-500/10">
                                                    <FileText className="h-5 w-5 text-indigo-400" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-semibold text-white">{contract.fileName || 'Nama File Tidak Diketahui'}</h3>
                                                    <p className="text-xs text-gray-400 font-mono mt-1">
                                                        {contract.fileHash.slice(0, 16)}...{contract.fileHash.slice(-8)}
                                                    </p>
                                                </div>
                                            </div>
                                            {/* NEW: Tampilkan badge Real-time jika data dari blockchain */}
                                            <div className="flex flex-col items-end gap-1">
                                                {getStatusBadge(contract)}
                                                {dataSource === 'blockchain' && (
                                                    <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-xs font-semibold uppercase">
                                                        Real-time
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                            <div className="flex items-center space-x-2 text-gray-300">
                                                <User className="h-4 w-4 text-gray-400" />
                                                <span className="text-gray-400">Pihak A:</span>
                                                <span className="font-medium">{contract.partyA || contract.partyAAddress.slice(0, 6)} {contract.isPartyASigned ? '✔️' : '❌'}</span>
                                            </div>
                                            <div className="flex items-center space-x-2 text-gray-300">
                                                <User className="h-4 w-4 text-gray-400" />
                                                <span className="text-gray-400">Pihak B:</span>
                                                <span className="font-medium">{contract.partyB || contract.partyBAddress.slice(0, 6)} {contract.isPartyBSigned ? '✔️' : '❌'}</span>
                                            </div>
                                            <div className="flex items-center space-x-2 text-gray-300">
                                                <FileText className="h-4 w-4 text-gray-400" />
                                                <span className="text-gray-400">Jenis Kontrak:</span>
                                                <span className="font-semibold text-white/90 capitalize">
                                                    {contract.contractType || 'Umum'}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-2 text-gray-300">
                                                <Clock className="h-4 w-4 text-gray-400" />
                                                <span className="text-gray-400">Dibuat:</span>
                                                <span>{formatDate(contract.createdAt)}</span>
                                            </div>
                                            
                                            {contract.expirationDate && (
                                                <div className="flex items-center space-x-2 text-gray-300">
                                                    <AlertCircle className="h-4 w-4 text-red-400" />
                                                    <span className="text-gray-400">Kadaluarsa:</span>
                                                    <span className={`font-medium ${contract.isExpired ? 'text-red-300' : 'text-green-300'}`}>
                                                        {formatDate(contract.expirationDate)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 self-start sm:self-center">
                                        {needsSignature && (
                                            <Button
                                                size="sm"
                                                data-testid={`sign-btn-${contract.fileHash}`}
                                                className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    signDocument(contract.fileHash, signRole);
                                                }}
                                            >
                                                <PenTool className="h-4 w-4 mr-2" />
                                                Tandatangani ({signRole})
                                            </Button>
                                        )}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            data-testid={`view-details-btn-${contract.fileHash}`}
                                            className="border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedContract(contract);
                                            }}
                                        >
                                            Lihat Detail
                                            <ExternalLink className="h-4 w-4 ml-2" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                    
                    {/* Pagination */}
                    <div className="mt-6 flex justify-center items-center space-x-4">
                        <Button
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            variant="outline"
                            className="border-white/20 text-white hover:bg-white/10"
                        >
                            &larr; Sebelumnya
                        </Button>
                        <span className="text-gray-300">
                            Halaman {currentPage} dari {totalPages}
                        </span>
                        <Button
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            variant="outline"
                            className="border-white/20 text-white hover:bg-white/10"
                        >
                            Berikutnya &rarr;
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContractHistory;