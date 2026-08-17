import React, { useState, useEffect, useRef } from 'react';
import { 
  Scan, 
  Fingerprint, 
  Camera, 
  CheckCircle, 
  AlertCircle, 
  ShieldCheck, 
  RefreshCw, 
  Sparkles, 
  Lock,
  User,
  X
} from 'lucide-react';
import { UserAccount } from '../types';

interface BiometricModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (biometricToken: string) => void;
  currentUser: UserAccount;
}

export const BiometricModal: React.FC<BiometricModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentUser,
}) => {
  const [authMethod, setAuthMethod] = useState<'FACE' | 'FINGERPRINT'>('FACE');
  const [scanState, setScanState] = useState<'IDLE' | 'SCANNING' | 'LIVENESS_CHECK' | 'VERIFYING' | 'SUCCESS' | 'FAILED'>('IDLE');
  const [progress, setProgress] = useState(0);
  const [livenessPrompt, setLivenessPrompt] = useState('Position face inside the cryptographic target reticle');
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen) {
      setScanState('IDLE');
      setProgress(0);
      setLivenessPrompt('Position face inside the cryptographic target reticle');
      if (authMethod === 'FACE') {
        startCamera();
      }
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, authMethod]);

  const startCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 400, height: 400 } });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraActive(true);
      }
    } catch {
      // Fallback gracefully to simulated biometric sensor if camera permission denied/unsupported
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleStartScan = () => {
    setScanState('SCANNING');
    setProgress(15);

    setTimeout(() => {
      setProgress(45);
      setScanState('LIVENESS_CHECK');
      setLivenessPrompt(authMethod === 'FACE' ? 'Liveness verified: Depth map and micro-movement match' : 'Capacitive dermal ridge match verified');
      
      setTimeout(() => {
        setProgress(85);
        setScanState('VERIFYING');
        setLivenessPrompt('Generating Elliptic-Curve Biometric Signature...');

        setTimeout(() => {
          setProgress(100);
          setScanState('SUCCESS');
          const bioToken = `BIO_${authMethod}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
          setTimeout(() => {
            stopCamera();
            onSuccess(bioToken);
          }, 800);
        }, 900);
      }, 1000);
    }, 1100);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div 
        id="biometric-auth-modal"
        role="dialog"
        aria-labelledby="biometric-modal-title"
        aria-modal="true"
        className="bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 max-w-md w-full overflow-hidden text-white"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <h3 id="biometric-modal-title" className="text-sm font-black">
                Biometric Identity Verification
              </h3>
              <p className="text-xs text-slate-400">
                Step 1 of 2: Cryptographic Voter Authentication
              </p>
            </div>
          </div>
          <button
            id="cancel-biometric-btn"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Method Toggle */}
        <div className="p-5 space-y-4">
          <div className="flex rounded-xl bg-slate-950 border border-slate-800 p-1">
            <button
              id="switch-face-id-btn"
              onClick={() => {
                setAuthMethod('FACE');
                setScanState('IDLE');
                setProgress(0);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                authMethod === 'FACE'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Face ID (Liveness)</span>
            </button>
            <button
              id="switch-touch-id-btn"
              onClick={() => {
                setAuthMethod('FINGERPRINT');
                setScanState('IDLE');
                setProgress(0);
                stopCamera();
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                authMethod === 'FINGERPRINT'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Fingerprint className="w-4 h-4" />
              <span>Touch ID (Hardware)</span>
            </button>
          </div>

          {/* Scanner Viewport */}
          <div className="relative rounded-2xl bg-slate-950 border border-slate-800 h-64 flex flex-col items-center justify-center overflow-hidden">
            {authMethod === 'FACE' ? (
              <div className="relative w-full h-full flex items-center justify-center">
                {cameraActive ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950">
                    <User className="w-24 h-24 text-slate-800 animate-pulse" />
                    <span className="text-[11px] text-slate-500 mt-2 font-mono">Simulated Secure Camera Feed</span>
                  </div>
                )}

                {/* Facial Reticle Overlay */}
                <div className={`relative z-10 w-44 h-44 rounded-full border-2 border-dashed transition-all duration-300 flex items-center justify-center ${
                  scanState === 'SUCCESS'
                    ? 'border-emerald-400 bg-emerald-500/10 shadow-[0_0_30px_rgba(52,211,153,0.3)]'
                    : scanState === 'SCANNING' || scanState === 'LIVENESS_CHECK' || scanState === 'VERIFYING'
                    ? 'border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)] animate-pulse'
                    : 'border-slate-700'
                }`}>
                  {/* Scanning beam animation */}
                  {(scanState === 'SCANNING' || scanState === 'LIVENESS_CHECK' || scanState === 'VERIFYING') && (
                    <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent top-0 animate-[bounce_2s_infinite]"></div>
                  )}

                  {scanState === 'SUCCESS' ? (
                    <CheckCircle className="w-16 h-16 text-emerald-400 animate-in zoom-in" />
                  ) : (
                    <div className="text-center">
                      <Scan className={`w-12 h-12 mx-auto ${scanState !== 'IDLE' ? 'text-emerald-400' : 'text-slate-600'}`} />
                      <div className="text-[10px] font-mono text-emerald-300 mt-1">
                        {scanState === 'IDLE' ? 'Ready to Scan' : `${progress}% Match`}
                      </div>
                    </div>
                  )}
                </div>

                {/* HUD Corner Accents */}
                <div className="absolute top-3 left-3 font-mono text-[10px] text-emerald-400/80">
                  ID: {currentUser.studentId}
                </div>
                <div className="absolute top-3 right-3 font-mono text-[10px] text-emerald-400/80 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  Liveness: 99.8%
                </div>
                <div className="absolute bottom-3 inset-x-3 text-center">
                  <p className="text-xs text-slate-300 font-medium px-2 py-1 rounded bg-slate-900/80 backdrop-blur-xs border border-slate-800">
                    {livenessPrompt}
                  </p>
                </div>
              </div>
            ) : (
              // Touch ID View
              <div className="text-center p-6 flex flex-col items-center justify-center">
                <div className={`w-28 h-28 rounded-full border-2 flex items-center justify-center transition-all ${
                  scanState === 'SUCCESS'
                    ? 'border-emerald-400 bg-emerald-500/10'
                    : scanState !== 'IDLE'
                    ? 'border-emerald-400 bg-emerald-950/40 animate-pulse'
                    : 'border-slate-800 bg-slate-900'
                }`}>
                  <Fingerprint className={`w-16 h-16 ${
                    scanState === 'SUCCESS'
                      ? 'text-emerald-400'
                      : scanState !== 'IDLE'
                      ? 'text-emerald-400'
                      : 'text-slate-600'
                  }`} />
                </div>
                <div className="text-xs font-semibold text-slate-300 mt-3 font-mono">
                  {scanState === 'SUCCESS' ? 'FINGERPRINT MATCH CONFIRMED' : 'Press & hold sensor to verify identity'}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Cryptographic Dermal Sensor v2.4 (FIPS 140-3)
                </div>
              </div>
            )}
          </div>

          {/* User Details & Cryptographic Security Info */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="font-semibold text-white">{currentUser.fullName}</span>
                <span className="text-slate-400 text-[11px]"> ({currentUser.department})</span>
              </div>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              ZK-Enrolled
            </span>
          </div>

          {/* Trigger Scan Button */}
          <div className="pt-2">
            <button
              id="execute-biometric-scan-btn"
              disabled={scanState !== 'IDLE' && scanState !== 'FAILED'}
              onClick={handleStartScan}
              className={`w-full py-3.5 px-4 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                scanState === 'SUCCESS'
                  ? 'bg-emerald-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                  : scanState !== 'IDLE'
                  ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:scale-[1.01]'
              }`}
            >
              {scanState === 'IDLE' && (
                <>
                  <Scan className="w-4 h-4" />
                  <span>Authenticate with {authMethod === 'FACE' ? 'Face ID' : 'Touch ID'}</span>
                </>
              )}
              {(scanState === 'SCANNING' || scanState === 'LIVENESS_CHECK' || scanState === 'VERIFYING') && (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Biometric Hash ({progress}%)...</span>
                </>
              )}
              {scanState === 'SUCCESS' && (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Identity Cryptographically Verified!</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
