import React, { useState } from 'react';
import { 
  Smartphone, 
  QrCode, 
  ShieldCheck, 
  Wifi, 
  Fingerprint, 
  Lock, 
  X, 
  CheckCircle2, 
  ArrowRight,
  Share2,
  Sparkles
} from 'lucide-react';
import { UserAccount } from '../types';
import { truncateHash } from '../lib/crypto';

interface MobileVotingBadgeProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
}

export const MobileVotingBadge: React.FC<MobileVotingBadgeProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const [synced, setSynced] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div 
        id="mobile-voting-dialog"
        role="dialog"
        aria-labelledby="mobile-modal-title"
        aria-modal="true"
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-sm w-full overflow-hidden text-slate-900 dark:text-white"
      >
        {/* Mobile Device Frame Header */}
        <div className="bg-slate-950 text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-cyan-400" />
            <span id="mobile-modal-title" className="text-xs font-bold tracking-tight">
              Stanford Mobile Vote Companion
            </span>
          </div>
          <button
            id="close-mobile-sim-btn"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-center">
          {/* Simulated QR Code for Student Mobile Authentication */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center space-y-3">
            <div className="w-40 h-40 bg-white p-2 rounded-xl border border-slate-300 shadow-xs flex items-center justify-center">
              {/* High precision SVG QR Code pattern */}
              <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900 fill-current">
                {/* Corner Anchors */}
                <rect x="5" y="5" width="25" height="25" fill="black" rx="4"/>
                <rect x="9" y="9" width="17" height="17" fill="white" rx="2"/>
                <rect x="13" y="13" width="9" height="9" fill="black" rx="1"/>

                <rect x="70" y="5" width="25" height="25" fill="black" rx="4"/>
                <rect x="74" y="9" width="17" height="17" fill="white" rx="2"/>
                <rect x="78" y="13" width="9" height="9" fill="black" rx="1"/>

                <rect x="5" y="70" width="25" height="25" fill="black" rx="4"/>
                <rect x="9" y="74" width="17" height="17" fill="white" rx="2"/>
                <rect x="13" y="78" width="9" height="9" fill="black" rx="1"/>

                {/* Data Matrix Dots */}
                <rect x="35" y="10" width="6" height="6" fill="black"/>
                <rect x="45" y="15" width="6" height="6" fill="black"/>
                <rect x="55" y="10" width="6" height="6" fill="black"/>
                <rect x="35" y="25" width="6" height="6" fill="black"/>
                <rect x="45" y="30" width="6" height="6" fill="black"/>
                <rect x="55" y="25" width="6" height="6" fill="black"/>
                <rect x="10" y="35" width="6" height="6" fill="black"/>
                <rect x="25" y="45" width="6" height="6" fill="black"/>
                <rect x="35" y="40" width="6" height="6" fill="black"/>
                <rect x="45" y="50" width="6" height="6" fill="black"/>
                <rect x="60" y="45" width="6" height="6" fill="black"/>
                <rect x="75" y="35" width="6" height="6" fill="black"/>
                <rect x="85" y="45" width="6" height="6" fill="black"/>
                <rect x="40" y="70" width="6" height="6" fill="black"/>
                <rect x="50" y="80" width="6" height="6" fill="black"/>
                <rect x="65" y="75" width="6" height="6" fill="black"/>
                <rect x="80" y="70" width="6" height="6" fill="black"/>
                <rect x="75" y="85" width="6" height="6" fill="black"/>
              </svg>
            </div>

            <div className="text-xs">
              <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {currentUser.studentId}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                Blind Token: {truncateHash(currentUser.encryptedVoterToken, 10, 6)}
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2 text-left bg-indigo-50/60 dark:bg-indigo-950/40 p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-900">
            <div className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Mobile Security Enclave Protocol</span>
            </div>
            <p className="text-[11px]">
              Scan this dynamic QR token with your iOS or Android device using the Stanford Mobile App to authenticate via on-device Secure Enclave FaceID / TouchID.
            </p>
          </div>

          <button
            id="dismiss-mobile-sim-btn"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-md"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
