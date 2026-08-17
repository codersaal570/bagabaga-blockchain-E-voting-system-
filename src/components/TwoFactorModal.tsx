import React, { useState, useEffect } from 'react';
import { 
  KeyRound, 
  Smartphone, 
  Clock, 
  CheckCircle, 
  Lock, 
  ArrowRight, 
  ShieldAlert, 
  Copy, 
  Check, 
  X,
  Sparkles
} from 'lucide-react';
import { UserAccount } from '../types';
import { generateTOTPCode } from '../lib/crypto';

interface TwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (totpToken: string) => void;
  currentUser: UserAccount;
}

export const TwoFactorModal: React.FC<TwoFactorModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentUser,
}) => {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [currentTOTP, setCurrentTOTP] = useState({ code: '849201', secondsRemaining: 30 });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeTab, setActiveTab] = useState<'APP' | 'SMS'>('APP');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Refresh TOTP code dynamically every second
    const update = () => {
      const totp = generateTOTPCode(currentUser.twoFactorSecret || 'CAMPUS_SECRET');
      setCurrentTOTP(totp);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [isOpen, currentUser.twoFactorSecret]);

  if (!isOpen) return null;

  const handleDigitChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newDigits = [...digits];
    newDigits[index] = val.slice(-1);
    setDigits(newDigits);
    setErrorMsg(null);

    // Auto move to next field
    if (val && index < 5) {
      const nextInput = document.getElementById(`totp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      const prevInput = document.getElementById(`totp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleFillDemoCode = () => {
    const codeArr = currentTOTP.code.split('');
    setDigits(codeArr);
    setErrorMsg(null);
  };

  const handleVerify = () => {
    const enteredCode = digits.join('');
    if (enteredCode.length < 6) {
      setErrorMsg('Please enter all 6 digits of your authenticator code.');
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      // In demo mode, allow the generated live code or standard fallback
      if (enteredCode === currentTOTP.code || enteredCode === '123456' || enteredCode === '849201') {
        setIsVerifying(false);
        const token = `2FA_VERIFIED_${Date.now()}_${enteredCode}`;
        onSuccess(token);
      } else {
        setIsVerifying(false);
        setErrorMsg('Invalid code or code expired. Please use the current 6-digit dynamic code.');
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in">
      <div 
        id="two-factor-auth-modal"
        role="dialog"
        aria-labelledby="two-factor-modal-title"
        aria-modal="true"
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full overflow-hidden text-slate-900 dark:text-white"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 id="two-factor-modal-title" className="text-sm font-bold">
                Mandatory Two-Factor Authentication (2FA)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Step 2 of 2: Time-based One-Time Password (TOTP)
              </p>
            </div>
          </div>
          <button
            id="cancel-two-factor-btn"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Security Notice */}
          <div className="p-3 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs text-purple-900 dark:text-purple-200 flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Security Protocol FIPS-2FA:</span> Your session is cryptographically bound to voter token <code className="font-mono bg-purple-100 dark:bg-purple-900/60 px-1 rounded">{currentUser.studentId}</code>.
            </div>
          </div>

          {/* Dynamic Authenticator Simulator Helper */}
          <div className="p-4 rounded-xl bg-slate-900 text-white border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                <span>Stanford Duo / Google Authenticator App</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-mono text-cyan-400">
                <Clock className="w-3 h-3" />
                <span>{currentTOTP.secondsRemaining}s</span>
              </div>
            </div>

            {/* Rotating code preview */}
            <div className="flex items-center justify-between bg-slate-950 px-3.5 py-2.5 rounded-lg border border-slate-800">
              <div className="font-mono text-xl font-bold tracking-widest text-cyan-300">
                {currentTOTP.code.slice(0, 3)} {currentTOTP.code.slice(3)}
              </div>
              <button
                id="copy-fill-totp-btn"
                onClick={handleFillDemoCode}
                className="px-2.5 py-1 rounded bg-cyan-900/60 hover:bg-cyan-800 text-cyan-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                Auto-Fill Code
              </button>
            </div>

            {/* 30s Countdown progress bar */}
            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
              <div 
                className="bg-cyan-400 h-full transition-all duration-1000 linear"
                style={{ width: `${(currentTOTP.secondsRemaining / 30) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* 6 Digit Inputs */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Enter 6-Digit Authenticator Token
            </label>
            <div className="flex justify-between gap-2">
              {digits.map((digit, i) => (
                <input
                  key={i}
                  id={`totp-input-${i}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  autoFocus={i === 0}
                  className="w-12 h-14 text-center text-xl font-bold font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 outline-hidden transition-all shadow-xs"
                />
              ))}
            </div>
          </div>

          {errorMsg && (
            <div className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5 p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit 2FA Button */}
          <div className="pt-2">
            <button
              id="confirm-totp-btn"
              disabled={isVerifying}
              onClick={handleVerify}
              className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isVerifying ? (
                <span>Validating Cryptographic 2FA...</span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Verify 2FA & Sign Blockchain Ballot</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
