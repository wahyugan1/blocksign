// src/pages/Dashboard.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, CheckCircle, Clock, Shield, TrendingUp, FileSignature } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import { useWallet } from '../hooks/useWallet';
import { useDocumentHistory } from '../hooks/useDocumentHistory';

const Dashboard = () => {
    const { isConnected, isLoading: isWalletLoading } = useWallet();
    
    // 🌟 AMBIL METRIK BARU DARI HOOK
    const { 
        totalDocuments, 
        activeCount, 
        expiredCount,
        pendingSignatureCount, // NEW: Menunggu TTD
        loading: isDocumentLoading 
    } = useDocumentHistory();

    // Gabungkan data dari hook ke dalam array statCards
    const statCards = [
        {
            title: 'Total Kontrak',
            value: totalDocuments, 
            icon: FileText,
            color: 'indigo',
            testId: 'stat-total-contracts',
        },
        {
            title: 'Kontrak Aktif',
            value: activeCount, 
            icon: Shield,
            color: 'green',
            testId: 'stat-active-contracts',
        },
        {
            title: 'Menunggu Tanda - Tangan',
            value: pendingSignatureCount, // NEW: Ganti dari Verifikasi Hash
            icon: FileSignature, // Icon baru
            color: 'amber',
            testId: 'stat-pending-signature',
        },
        {
            title: 'Kadaluarsa',
            value: expiredCount, 
            icon: Clock,
            color: 'red',
            testId: 'stat-expired',
        },
    ];
    
    const totalLoading = isWalletLoading || isDocumentLoading;
    const isWalletConnected = isConnected; 

    if (totalLoading) {
        return <div className="text-center py-20 text-gray-400">Memuat data dan status koneksi...</div>;
    }

    return (
        <div className="space-y-8" data-testid="dashboard">
            {/* Hero Section */}
            <div className="text-center space-y-4 py-8">
                <div className="inline-flex items-center justify-center p-3 mb-4 rounded-full glass-effect">
                    <Shield className="h-12 w-12 text-indigo-400" />
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
                    Verifikasi Kontrak
                    <br />
                    <span className="gradient-text">Digital Terdistribusi</span>
                </h1>
                <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                    Manajemen kontrak digital yang aman, transparan, dan tahan manipulasi, didukung oleh teknologi blockchain
                </p>
                
                {!isWalletConnected && (
                    <div className="flex justify-center pt-4">
                        <div className="glass-effect border border-amber-500/30 rounded-lg p-4 max-w-md">
                            <p className="text-sm text-amber-300">⚠️ Hubungkan wallet Anda untuk mulai mengatur kontrak</p>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => {
                    const Icon = stat.icon;

                    return (
                        <Card
                            key={stat.title}
                            data-testid={stat.testId}
                            className="glass-effect border-white/10 p-6 transition-all contract-card hover:border-white/20"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-lg bg-${stat.color}-500/10`}>
                                    <Icon className={`h-6 w-6 text-${stat.color}-400`} />
                                </div>
                                <TrendingUp className="h-4 w-4 text-gray-400" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                                <p className="text-sm text-gray-400">{stat.title}</p>
                            </div>
                        </Card>
                    );
                })}
            </div>
            
            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Buat Kontrak Baru Card */}
                <Card className="glass-effect border-white/10 p-8 hover:border-indigo-500/30 transition-all contract-card">
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 rounded-lg bg-indigo-500/10">
                                <FileText className="h-6 w-6 text-indigo-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white">Upload Kontrak Baru</h3>
                        </div>
                        <p className="text-gray-400">
                            Daftarkan kontrak digital baru di blockchain dengan penyimpanan hash yang aman dan verifikasi antar pihak.
                        </p>
                        <Link to="/create">
                            <Button
                                data-testid="create-contract-link"
                                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium"
                                disabled={!isWalletConnected}
                            >
                                Buat Kontrak
                            </Button>
                        </Link>
                    </div>
                </Card>
                {/* Verifikasi Kontrak Card */}
                <Card className="glass-effect border-white/10 p-8 hover:border-purple-500/30 transition-all contract-card">
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 rounded-lg bg-purple-500/10">
                                <CheckCircle className="h-6 w-6 text-purple-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white">Verifikasi Kontrak</h3>
                        </div>
                        <p className="text-gray-400">
                            Unggah file kontrak atau masukkan hash untuk memverifikasi keasliannya dan memeriksa catatan blockchain.
                        </p>
                        <Link to="/verify">
                            <Button
                                data-testid="verify-contract-link"
                                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-medium"
                            >
                                Verifikasi Sekarang
                            </Button>
                        </Link>
                    </div>
                </Card>
            </div>
            
            {/* Features */}
            <Card className="glass-effect border-white/10 p-8">
                <h3 className="text-2xl font-semibold text-white mb-6 text-center">Mengapa BlockSign?</h3>
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="text-center space-y-3">
                        <div className="inline-flex p-4 rounded-full bg-indigo-500/10 mb-2">
                            <Shield className="h-8 w-8 text-indigo-400" />
                        </div>
                        <h4 className="text-lg font-semibold text-white">Aman & Transparan</h4>
                        <p className="text-sm text-gray-400">
                            Kontrak disimpan di blockchain, memastikan mereka tidak dapat diubah atau dimanipulasi.
                        </p>
                    </div>
                    <div className="text-center space-y-3">
                        <div className="inline-flex p-4 rounded-full bg-purple-500/10 mb-2">
                            <CheckCircle className="h-8 w-8 text-purple-400" />
                        </div>
                        <h4 className="text-lg font-semibold text-white">Verifikasi Instan</h4>
                        <p className="text-sm text-gray-400">
                            Verifikasi keaslian kontrak dalam hitungan detik dengan validasi hash kriptografi.
                        </p>
                    </div>
                    <div className="text-center space-y-3">
                        <div className="inline-flex p-4 rounded-full bg-green-500/10 mb-2">
                            <Clock className="h-8 w-8 text-green-400" />
                        </div>
                        <h4 className="text-lg font-semibold text-white">Riwayat Lengkap</h4>
                        <p className="text-sm text-gray-400">
                            Lacak semua kontrak Anda dengan informasi yang lengkap.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default Dashboard;