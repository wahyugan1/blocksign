import React from 'react';
import { CheckCircle, Copy, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

const SuccessModal = ({ contract, onClose }) => {
  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  const EXPLORER_URL = "https://sepolia.etherscan.io/tx/";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" data-testid="success-modal">
      <Card className="glass-effect border-green-500/30 p-8 max-w-2xl w-full relative animate-in fade-in zoom-in duration-300">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          data-testid="close-modal-btn"
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </Button>

        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-green-500/20">
              <CheckCircle className="h-16 w-16 text-green-400" />
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Kontrak Terdaftar!</h2>
            <p className="text-gray-300">Kontrak Anda telah berhasil didaftarkan pada blockchain</p>
          </div>

          <div className="space-y-3 text-left bg-white/5 p-6 rounded-lg">
            {/* Contract Hash */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Hash Kontrak (IPFS)</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(contract.fileHash, 'Contract hash')}
                  data-testid="copy-contract-hash"
                  className="h-8 text-gray-400 hover:text-white"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs font-mono text-white break-all bg-white/5 p-3 rounded" data-testid="contract-hash">
                {contract.fileHash}
              </p>
            </div>

            {/* TX Upload Link */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Transaksi Upload</span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(contract.uploadTxHash, 'Upload TX hash')}
                    className="h-8 text-gray-400 hover:text-white"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(`${EXPLORER_URL}${contract.uploadTxHash}`, '_blank')}
                    className="h-8 text-gray-400 hover:text-white"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-xs font-mono text-white break-all bg-white/5 p-3 rounded">
                {contract.uploadTxHash}
              </p>
            </div>

            {/* TX Sign Link */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Transaksi Sign</span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(contract.signTxHash, 'Sign TX hash')}
                    className="h-8 text-gray-400 hover:text-white"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(`${EXPLORER_URL}${contract.signTxHash}`, '_blank')}
                    className="h-8 text-gray-400 hover:text-white"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-xs font-mono text-white break-all bg-white/5 p-3 rounded">
                {contract.signTxHash}
              </p>
            </div>

            <div className="pt-3 border-t border-white/10">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Timestamp</span>
                <span className="text-white" data-testid="timestamp">
                  {new Date(contract.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={onClose}
              data-testid="view-history-btn"
              className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            >
              Lihat di riwayat
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SuccessModal;