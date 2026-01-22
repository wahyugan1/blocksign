import React from 'react';
import { Copy, ExternalLink, FileText, User, Calendar, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';

const IPFS_GATEWAY_URL = 'https://gateway.pinata.cloud/ipfs/';
const ETHERSCAN_BASE_URL = 'https://sepolia.etherscan.io/address/'; 

const ContractDetails = ({ contract, showQR = true }) => {
    const copyToClipboard = (text, label) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} berhasil disalin`);
    };

    // 🆕 Format datetime dengan jam (untuk timestamp)
    const formatDateTime = (dateString) => {
        if (!dateString) return '-';
        
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            
            return new Intl.DateTimeFormat('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            }).format(date);
        } catch (error) {
            return dateString || '-';
        }
    };

    // 🆕 Format date only (TANPA JAM - untuk contractDate)
    const formatDateOnly = (dateString) => {
        if (!dateString) return '-';
        
        try {
            // Parse date string as local date (bukan UTC)
            // Untuk menghindari timezone shift
            const [year, month, day] = dateString.split('-').map(Number);
            const date = new Date(year, month - 1, day);
            
            if (isNaN(date.getTime())) return dateString;
            
            return new Intl.DateTimeFormat('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            }).format(date);
        } catch (error) {
            return dateString || '-';
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
                <span className={`text-sm text-white break-all ${mono ? 'font-mono' : ''}`}>
                    {value || '-'}
                </span>
                
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

    // Fungsi untuk mendapatkan status sederhana
    const getStatusText = (contract) => {
        const isSigned = contract.isPartyASigned && contract.isPartyBSigned;
        const needsUserSignature = contract.needsSigning;

        if (isSigned) return <span className="text-lg font-bold text-green-400">Selesai Ditandatangani</span>;
        if (needsUserSignature) return <span className="text-lg font-bold text-amber-400">Perlu Tanda Tangan Anda</span>;
        return <span className="text-lg font-bold text-blue-400">Menunggu Pihak Lain</span>;
    };

    return (
        <div className="space-y-6" data-testid="contract-details">
            {/* Status di Bagian Atas */}
            <div className="pb-4 border-b border-white/10">
                <h3 className="text-xl font-semibold text-white mb-2">Status Kontrak</h3>
                {getStatusText(contract)}
            </div>

            {/* Informasi File */}
            <div>
                <h3 className="text-lg font-semibold text-white mb-4">Informasi Dokumen</h3>
                <DetailRow label="Nama File" value={contract.fileName} icon={FileText} />
                
                <DetailRow 
                    label="Hash IPFS" 
                    value={contract.fileHash} 
                    copyable 
                    mono 
                    externalLink={`${IPFS_GATEWAY_URL}${contract.fileHash}`}
                    icon={ExternalLink} 
                />
            </div>

            {/* Pihak-pihak */}
            <div>
                <h3 className="text-lg font-semibold text-white mb-4">Pihak Kontrak</h3>
                
                {/* Party A */}
                <DetailRow label={`Pihak A (Nama)`} value={contract.partyA || 'Tidak Diketahui'} icon={User} />
                <DetailRow 
                    label={`Pihak A (Alamat Blockchain - ${contract.isPartyASigned ? 'Telah Tanda Tangan ✔️' : 'Belum Tanda Tangan ❌'})`} 
                    value={contract.partyAAddress} 
                    copyable 
                    mono 
                    externalLink={`${ETHERSCAN_BASE_URL}${contract.partyAAddress}`}
                    icon={ExternalLink}
                />

                {/* Party B */}
                <DetailRow label={`Pihak B (Nama)`} value={contract.partyB || 'Tidak Diketahui'} icon={User} />
                <DetailRow 
                    label={`Pihak B (Alamat Blockchain - ${contract.isPartyBSigned ? 'Telah Tanda Tangan ✔️' : 'Belum Tanda Tangan ❌'})`} 
                    value={contract.partyBAddress} 
                    copyable 
                    mono 
                    externalLink={`${ETHERSCAN_BASE_URL}${contract.partyBAddress}`}
                    icon={ExternalLink}
                />
            </div>

            {/* Detail Blockchain */}
            <div>
                <h3 className="text-lg font-semibold text-white mb-4">Detail Blockchain</h3>
                
                <DetailRow 
                    label="ID Dokumen" 
                    value={contract.id} 
                    copyable 
                    mono 
                    icon={FileText} 
                />
                
                <DetailRow label="Jenis Kontrak" value={contract.contractType || 'Umum'} icon={Tag} />

                {/* 🆕 Pakai formatDateTime untuk timestamp (dengan jam) */}
                <DetailRow 
                    label="Dibuat Pada" 
                    value={formatDateTime(contract.createdAt)} 
                    icon={Calendar} 
                />

                {/* 🆕 Pakai formatDateOnly untuk tanggal akhir (TANPA jam) */}
                <DetailRow 
                    label="Tanggal Akhir Kontrak" 
                    value={formatDateOnly(contract.expirationDate)} 
                    icon={Calendar} 
                />
            </div>

            {/* Deskripsi (Jika Ada) */}
            {contract.description && (
                <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Deskripsi</h3>
                    <p className="text-sm text-gray-300 bg-white/5 p-4 rounded-lg">{contract.description}</p>
                </div>
            )}

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

export default ContractDetails;