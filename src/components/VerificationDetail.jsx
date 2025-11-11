import React from 'react';
import { Copy, ExternalLink, User, Calendar, Tag, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';

const ETHERSCAN_BASE_URL = 'https://sepolia.etherscan.io/address/'; 

const VerificationDetail = ({ contract, showQR = true }) => {
    
    const copyToClipboard = (text, label) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} berhasil disalin`);
    };

    // 🆕 IMPROVED: Format date dengan Intl.DateTimeFormat untuk konsistensi
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        
        try {
            // Coba parse sebagai Date object
            const date = new Date(dateString);
            
            // Validasi apakah date valid
            if (isNaN(date.getTime())) {
                return dateString; // Return as-is jika tidak bisa di-parse
            }
            
            // Format dengan Intl untuk konsistensi di semua device
            return new Intl.DateTimeFormat('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            }).format(date);
        } catch (error) {
            console.error('Error formatting date:', error);
            return dateString || '-';
        }
    };

    // 🆕 IMPROVED: Format datetime yang sudah di-format dari VerifyContract
    const formatDateTime = (timestamp) => {
        if (!timestamp) return '-';
        
        // Jika timestamp sudah berupa string yang di-format (dari VerifyContract)
        // maka return as-is
        if (typeof timestamp === 'string' && timestamp.includes(',')) {
            return timestamp;
        }
        
        try {
            // Jika masih berupa Date object atau timestamp number
            const date = new Date(timestamp);
            
            if (isNaN(date.getTime())) {
                return timestamp.toString();
            }
            
            return new Intl.DateTimeFormat('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            }).format(date);
        } catch (error) {
            console.error('Error formatting datetime:', error);
            return timestamp?.toString() || '-';
        }
    };

    // Komponen DetailRow
    const DetailRow = ({ label, value, copyable = false, mono = false, externalLink = null, icon: Icon = null }) => (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-white/5 gap-2">
            <span className="text-sm text-gray-400 flex items-center">
                {Icon && <Icon className="h-4 w-4 mr-2" />}
                {label}
            </span>
            <div className="flex items-center space-x-2">
                <span className={`text-sm text-white break-all text-right ${mono ? 'font-mono' : ''}`}>
                    {value || '-'} 
                </span>
                
                {/* Tombol Tautan Eksternal */}
                {externalLink && (
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => window.open(externalLink, '_blank')} 
                        className="h-8 w-8 text-indigo-400 hover:text-indigo-200"
                    >
                        <ExternalLink className="h-4 w-4" />
                    </Button>
                )}

                {copyable && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(value, label)}
                        data-testid={`copy-${label.toLowerCase().replace(/\s+/g, '-')}`}
                        className="h-8 w-8 text-gray-400 hover:text-white"
                    >
                        <Copy className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    );

    // Fungsi untuk mendapatkan status tanda tangan
    const getSignatureStatus = (signed) => {
        return signed 
            ? <span className="text-sm font-bold text-green-400">Telah Tanda Tangan ✔️</span>
            : <span className="text-sm font-bold text-red-400">Belum Tanda Tangan ❌</span>;
    };


    return (
        <div className="space-y-6" data-testid="verification-detail">
            
            {/* Informasi Verifikasi */}
            <div>
                <h3 className="text-lg font-semibold text-white mb-4">Informasi Verifikasi Blockchain</h3>
                
                {/* Hash IPFS */}
                <DetailRow 
                    label="Hash Kontrak (IPFS CID)" 
                    value={contract.fileHash} 
                    copyable 
                    mono 
                    icon={Hash} 
                />
            </div>

            {/* Detail Kontrak */}
            <div>
                <h3 className="text-lg font-semibold text-white mb-4">Detail Kontrak</h3>
                
                {/* Jenis Kontrak */}
                <DetailRow label="Jenis Kontrak" value={contract.contractType || 'Umum'} icon={Tag} />
                
                {/* Tanggal Dibuat (Timestamp dari Blockchain) */}
                <DetailRow 
                    label="Waktu Terdaftar" 
                    value={formatDateTime(contract.timestamp)} 
                    icon={Calendar} 
                />

                {/* Tanggal Akhir Kontrak */}
                <DetailRow 
                    label="Tanggal Akhir Kontrak" 
                    value={formatDate(contract.contractDate)} 
                    icon={Calendar} 
                />
            </div>

            {/* Pihak-pihak dan Status Tanda Tangan */}
            <div>
                <h3 className="text-lg font-semibold text-white mb-4">Pihak Kontrak dan Status Tanda Tangan</h3>
                
                {/* Party A */}
                <DetailRow label={`Pihak A (Nama)`} value={contract.partyA || 'Tidak Diketahui'} icon={User} />
                <div className="py-3 border-b border-white/5">
                    <DetailRow 
                        label={`Alamat Pihak A`} 
                        value={contract.partyAAddress} 
                        copyable 
                        mono 
                        externalLink={`${ETHERSCAN_BASE_URL}${contract.partyAAddress}`}
                        icon={ExternalLink}
                    />
                    <div className="text-sm text-right mt-1">
                        {getSignatureStatus(contract.isPartyASigned)}
                    </div>
                </div>

                {/* Party B */}
                <DetailRow label={`Pihak B (Nama)`} value={contract.partyB || 'Tidak Diketahui'} icon={User} />
                <div className="py-3 border-b border-white/5">
                    <DetailRow 
                        label={`Alamat Pihak B`} 
                        value={contract.partyBAddress} 
                        copyable 
                        mono 
                        externalLink={`${ETHERSCAN_BASE_URL}${contract.partyBAddress}`}
                        icon={ExternalLink}
                    />
                    <div className="text-sm text-right mt-1">
                        {getSignatureStatus(contract.isPartyBSigned)}
                    </div>
                </div>
            </div>

            {/* Kode QR */}
            {showQR && (
                <div className="flex flex-col items-center space-y-4 p-6 bg-white/5 rounded-lg">
                    <h3 className="text-lg font-semibold text-white">Kode QR Hash Kontrak</h3>
                    <div className="p-4 bg-white rounded-lg" data-testid="qr-code">
                        <QRCodeSVG value={contract.fileHash} size={200} />
                    </div>
                    <p className="text-xs text-gray-400 text-center max-w-sm">
                        Pindai kode QR ini untuk membagikan atau memverifikasi hash kontrak dengan cepat.
                    </p>
                </div>
            )}
        </div>
    );
};

export default VerificationDetail;