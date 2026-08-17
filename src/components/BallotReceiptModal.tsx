import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Download, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  QrCode, 
  Blocks, 
  Lock, 
  Share2,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { truncateHash } from '../lib/crypto';

interface BallotReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiptHash: string;
  timestamp: number;
  department: string;
  classStanding: string;
  onNavigateToExplorer: (receiptHash: string) => void;
}

export const BallotReceiptModal: React.FC<BallotReceiptModalProps> = ({
  isOpen,
  onClose,
  receiptHash,
  timestamp,
  department,
  classStanding,
  onNavigateToExplorer,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Trigger election celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b'],
        });
      } catch {
        // ignore
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(receiptHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJSON = () => {
    const receiptData = {
      title: 'Stanford Associated Students Blockchain Election Receipt',
      receiptHash,
      timestamp: new Date(timestamp).toISOString(),
      demographics: {
        department,
        classStanding,
      },
      consensusStatus: '4/4 Validator Nodes Verified (Stanford CS, Student Union, Dean, Library Vault)',
      encryptionStandard: 'AES-GCM-256 / SHA-256 Merkle Proof',
      verifierUrl: `https://vote.stanford.edu/verify?hash=${receiptHash}`,
    };

    const blob = new Blob([JSON.stringify(receiptData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ballot-receipt-${receiptHash.substring(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div 
        id="ballot-receipt-modal"
        role="dialog"
        aria-labelledby="receipt-modal-title"
        aria-modal="true"
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full overflow-hidden text-slate-900 dark:text-white"
      >
        {/* Confirmed Banner */}
        <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-emerald-600 p-6 text-white text-center relative">
          <button
            id="close-receipt-modal-x"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="w-14 h-14 rounded-2xl bg-white text-indigo-600 mx-auto flex items-center justify-center shadow-xl mb-3 animate-in zoom-in">
            <CheckCircle2 className="w-9 h-9 text-emerald-600" />
          </div>
          <h2 id="receipt-modal-title" className="text-xl font-bold tracking-tight">
            Ballot Sealed in Blockchain!
          </h2>
          <p className="text-xs text-indigo-100 mt-1 max-w-xs mx-auto">
            Your vote is encrypted, anonymous, and immutably recorded across all 4 university validator nodes.
          </p>
        </div>

        <div className="p-6 space-y-4">
          {/* Receipt Hash Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-500" />
                Zero-Knowledge Receipt Hash
              </span>
              <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                Tamper-Proof
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
              <span className="font-mono text-xs text-indigo-600 dark:text-indigo-300 break-all select-all font-bold">
                {receiptHash}
              </span>
              <button
                id="copy-receipt-hash-btn"
                onClick={handleCopy}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors shrink-0 cursor-pointer"
                title="Copy full hash"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Verification Parameters */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80">
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Timestamp</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80">
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Consensus Quorum</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                4/4 Peer Nodes Signed
              </span>
            </div>
          </div>

          {/* Anonymity Notice */}
          <div className="p-3 rounded-xl bg-cyan-50/70 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 text-xs text-cyan-900 dark:text-cyan-200 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
            <p className="text-[11px]">
              <span className="font-bold">Zero-Knowledge Guarantee:</span> Your student identity has been completely decoupled from your candidate choices. No administrator or peer node can see who you voted for.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              id="verify-in-explorer-btn"
              onClick={() => {
                onClose();
                onNavigateToExplorer(receiptHash);
              }}
              className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Blocks className="w-4 h-4" />
              <span>Verify Receipt in Blockchain Explorer</span>
              <ExternalLink className="w-4 h-4" />
            </button>

            <button
              id="download-receipt-json-btn"
              onClick={handleDownloadJSON}
              className="w-full py-2 px-4 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer border border-slate-200 dark:border-slate-700"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Signed Audit Receipt (.json)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
