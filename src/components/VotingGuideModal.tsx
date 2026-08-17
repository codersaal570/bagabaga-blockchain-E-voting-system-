import React, { useState } from 'react';
import {
  X,
  BookOpen,
  ShieldCheck,
  Lock,
  Blocks,
  Eye,
  KeyRound,
  CheckCircle2,
  Cpu,
  Fingerprint,
  ArrowRight,
  Sparkles,
  Search,
  Server,
  HelpCircle,
  Zap,
  Check,
  Copy,
  Layers,
  FileCheck,
  RefreshCw
} from 'lucide-react';
import { sha256Sync } from '../lib/crypto';

interface VotingGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToExplorer?: () => void;
  onStartVoting?: () => void;
}

export const VotingGuideModal: React.FC<VotingGuideModalProps> = ({
  isOpen,
  onClose,
  onNavigateToExplorer,
  onStartVoting,
}) => {
  const [activeTab, setActiveTab] = useState<'WALKTHROUGH' | 'SIMULATOR' | 'SECURITY_FAQ' | 'GLOSSARY'>('WALKTHROUGH');
  const [currentStep, setCurrentStep] = useState<number>(1);
  
  // Interactive Simulator State
  const [simCandidate, setSimCandidate] = useState<string>('Maya Lin (President)');
  const [simReferendum, setSimReferendum] = useState<string>('Yes on Clean Energy Fee');
  const [simVoterToken, setSimVoterToken] = useState<string>('STUDENT_ZK_TOKEN_94021');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  if (!isOpen) return null;

  // Simulator computed hashes
  const simPlaintextPayload = JSON.stringify({
    vote: simCandidate,
    referendum: simReferendum,
    nonce: 133742
  });
  const simZkNullifier = '0x' + sha256Sync(`ZK_SALT_${simVoterToken}`).substring(0, 32);
  const simEncryptedPayload = `AES_GCM_256_${sha256Sync(simPlaintextPayload).substring(0, 24).toUpperCase()}`;
  const simReceiptHash = '0x' + sha256Sync(`${simEncryptedPayload}_${simZkNullifier}_SEALED`).substring(0, 40);
  const simMerkleLeaf = sha256Sync(`LEAF:${simReceiptHash}`);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const steps = [
    {
      step: 1,
      title: 'Formulate Ballot & Review Choices',
      icon: BookOpen,
      badge: 'Step 1: Client-Side Selection',
      tagline: 'Your selections remain private on your local device until you are ready to seal them.',
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <p>
            When you browse candidates for President, Vice President, Treasurer, and Campus Referendums, your device keeps your choices entirely in local client memory.
          </p>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Full Candidate Credentials & Manifestos</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Inspect candidate GPAs, endorsed platforms, and policy proposals with zero tracking or telemetry attached to your clicks.
            </p>
          </div>
        </div>
      )
    },
    {
      step: 2,
      title: 'Biometric & Multi-Factor Identity Gate',
      icon: Fingerprint,
      badge: 'Step 2: Zero-Knowledge Proof',
      tagline: 'Authenticate that you are an eligible enrolled student without revealing who you vote for.',
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <p>
            Before sealing your ballot, the system requires dual-layer verification (Face ID/Touch ID + FIPS 140-3 2FA TOTP code).
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="font-bold text-emerald-400 block mb-1">Zero-Knowledge Nullifier</span>
              <p className="text-slate-400">
                Generates a single-use cryptographic nullifier token. It prevents double-voting while mathematically separating your student ID from your ballot contents.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="font-bold text-cyan-400 block mb-1">WebAuthn Liveness</span>
              <p className="text-slate-400">
                Liveness detection guarantees real human presence and blocks automated bots, replay attacks, or identity hijacking.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      step: 3,
      title: 'End-to-End Encryption & SHA-256 Hashing',
      icon: Lock,
      badge: 'Step 3: Cryptographic Sealing',
      tagline: 'Transforming your choices into an irreversible, tamper-evident cryptographic payload.',
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <p>
            Your ballot is encrypted client-side with military-grade AES-GCM-256 before being broadcast over the campus peer-to-peer network.
          </p>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 font-mono text-[11px]">
            <div className="flex justify-between items-center text-slate-400">
              <span>Cryptographic Cipher:</span>
              <span className="text-emerald-400 font-bold">AES-256-GCM + SHA-256</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Receipt Hash Formula:</span>
              <span className="text-cyan-400">SHA256(Payload + ZK_Nullifier)</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Receipt-Freeness:</span>
              <span className="text-purple-400">Coercion-Resistant Design</span>
            </div>
          </div>
        </div>
      )
    },
    {
      step: 4,
      title: 'Proof-of-Authority Consensus & Witness Nodes',
      icon: Server,
      badge: 'Step 4: Decentralized Consensus',
      tagline: '4 independent university server nodes validate, reach consensus, and mine your block.',
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <p>
            Rather than trusting a single central database, your transaction is broadcast to 4 independent campus nodes:
          </p>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="font-bold text-white block">🏛️ Student Union Node</span>
              <span className="text-slate-400 text-[10px]">Campus North Hub</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="font-bold text-white block">💻 Gates CS Dept Node</span>
              <span className="text-slate-400 text-[10px]">Science Quad Witness</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="font-bold text-white block">⚖️ Electoral Board Node</span>
              <span className="text-slate-400 text-[10px]">Tressider Union</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="font-bold text-white block">🛡️ Stanford IT Auditor</span>
              <span className="text-slate-400 text-[10px]">Security Mesh Node</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            Nodes assemble ballots into Merkle DAG trees, compute consecutive SHA-256 block hashes, and seal the block with Proof-of-Authority signatures.
          </p>
        </div>
      )
    },
    {
      step: 5,
      title: 'Receipt Verification on the Public Ledger',
      icon: Search,
      badge: 'Step 5: Independent Verification',
      tagline: 'Verify your ballot was permanently sealed on-chain anytime using your unique receipt hash.',
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <p>
            Upon casting, you receive an immutable <strong>Ballot Receipt Hash</strong> (e.g. <code className="font-mono text-emerald-400">0x88c2...</code>).
          </p>
          <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 space-y-1">
            <span className="font-bold block flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Cast-As-Intended & Counted-As-Cast
            </span>
            <p className="text-[11px] text-slate-300">
              Enter your receipt into the <strong>Blockchain Explorer</strong> to inspect the exact block number, Merkle tree root, confirming node signatures, and live tally inclusion.
            </p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div 
        id="voting-guide-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="voting-guide-modal-title"
        className="bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 max-w-4xl w-full max-h-[90vh] overflow-hidden text-white flex flex-col"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="voting-guide-modal-title" className="text-lg sm:text-xl font-black tracking-tight text-white">
                  Student Blockchain Voting & Transparency Guide
                </h3>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  E2E-V VERIFIED
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Understand how cryptography, zero-knowledge proofs, and decentralized consensus protect your vote and guarantee 100% election integrity.
              </p>
            </div>
          </div>

          <button
            id="close-voting-guide-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors"
            aria-label="Close Voting Guide Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Sub-navigation Tabs */}
        <div className="flex items-center px-6 border-b border-slate-800 bg-slate-950/40 overflow-x-auto gap-2 py-2.5 shrink-0 scrollbar-none">
          <button
            id="guide-tab-walkthrough-btn"
            onClick={() => setActiveTab('WALKTHROUGH')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'WALKTHROUGH'
                ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Interactive 5-Step Journey</span>
          </button>

          <button
            id="guide-tab-simulator-btn"
            onClick={() => setActiveTab('SIMULATOR')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'SIMULATOR'
                ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Live Cryptographic Simulator</span>
          </button>

          <button
            id="guide-tab-faq-btn"
            onClick={() => setActiveTab('SECURITY_FAQ')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'SECURITY_FAQ'
                ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Transparency & Privacy Guarantees</span>
          </button>

          <button
            id="guide-tab-glossary-btn"
            onClick={() => setActiveTab('GLOSSARY')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'GLOSSARY'
                ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Blockchain Glossary</span>
          </button>
        </div>

        {/* Modal Scrollable Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: 5-STEP INTERACTIVE WALKTHROUGH */}
          {activeTab === 'WALKTHROUGH' && (
            <div className="space-y-6">
              {/* Step indicator badges */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {steps.map((s) => {
                  const Icon = s.icon;
                  const isSelected = currentStep === s.step;
                  return (
                    <button
                      key={s.step}
                      id={`walkthrough-step-btn-${s.step}`}
                      onClick={() => setCurrentStep(s.step)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold">0{s.step}</span>
                        <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
                      </div>
                      <div className="text-xs font-bold mt-1.5 truncate text-white">
                        {s.title.split(' ')[0]} {s.title.split(' ')[1]}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Step Deep Dive Card */}
              {(() => {
                const current = steps.find(s => s.step === currentStep)!;
                const Icon = current.icon;
                return (
                  <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 shadow-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-850 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[11px] font-mono font-bold text-emerald-400 block">
                            {current.badge}
                          </span>
                          <h4 className="text-base font-bold text-white">
                            {current.title}
                          </h4>
                        </div>
                      </div>
                      <div className="text-xs text-slate-400 font-mono">
                        Phase {current.step} of 5
                      </div>
                    </div>

                    <p className="text-sm font-medium text-slate-200">
                      {current.tagline}
                    </p>

                    {current.content}

                    {/* Step Navigation Controls */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-850">
                      <button
                        id="walkthrough-prev-step-btn"
                        disabled={currentStep === 1}
                        onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                      >
                        ← Previous Step
                      </button>

                      {currentStep < 5 ? (
                        <button
                          id="walkthrough-next-step-btn"
                          onClick={() => setCurrentStep(prev => Math.min(5, prev + 1))}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)] transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>Next Step</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          id="walkthrough-finish-btn"
                          onClick={() => setActiveTab('SIMULATOR')}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)] transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>Launch Live Simulator</span>
                          <Zap className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB 2: LIVE CRYPTOGRAPHIC SIMULATOR */}
          {activeTab === 'SIMULATOR' && (
            <div className="space-y-6">
              <div className="rounded-2xl bg-slate-950 p-5 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-emerald-400" />
                    <h4 className="text-sm font-bold text-white">
                      Interactive Cryptographic Transformation Sandbox
                    </h4>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    Live SHA-256 Engine
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Experiment by tweaking the mock ballot choices below. Watch how the client-side cryptographic hashing pipeline instantaneously calculates the anonymous Zero-Knowledge Nullifier, Encrypted Payload, and Final Receipt Hash.
                </p>

                {/* Input Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Presidential Candidate Choice
                    </label>
                    <select
                      id="sim-candidate-select"
                      value={simCandidate}
                      onChange={(e) => setSimCandidate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                    >
                      <option value="Maya Lin (President)">Maya Lin (President)</option>
                      <option value="Jordan Hayes (President)">Jordan Hayes (President)</option>
                      <option value="Devon Brooks (President)">Devon Brooks (President)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Campus Referendum Vote
                    </label>
                    <select
                      id="sim-referendum-select"
                      value={simReferendum}
                      onChange={(e) => setSimReferendum(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                    >
                      <option value="Yes on Clean Energy Fee">Yes on Clean Energy Fee</option>
                      <option value="No on Clean Energy Fee">No on Clean Energy Fee</option>
                      <option value="Abstain">Abstain</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Zero-Knowledge Voter Salt
                    </label>
                    <input
                      id="sim-voter-salt-input"
                      type="text"
                      value={simVoterToken}
                      onChange={(e) => setSimVoterToken(e.target.value)}
                      placeholder="Enter random salt..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Cryptographic Pipeline Output */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Cryptographic Pipeline Output:
                </h5>

                {/* Stage 1: Zero Knowledge Nullifier */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5" />
                      1. Zero-Knowledge Nullifier Token (Public Anonymity Shield)
                    </span>
                    <button
                      onClick={() => handleCopy(simZkNullifier)}
                      className="text-slate-400 hover:text-emerald-400 cursor-pointer p-1"
                    >
                      {copiedHash === simZkNullifier ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <div className="font-mono text-xs text-slate-300 break-all select-all bg-slate-900 p-2.5 rounded-lg border border-slate-850">
                    {simZkNullifier}
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Mathematically proves voter eligibility once without exposing identity on the public blockchain.
                  </p>
                </div>

                {/* Stage 2: Encrypted AES Payload */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-purple-400 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      2. Encrypted Ballot Ciphertext (AES-GCM-256)
                    </span>
                    <button
                      onClick={() => handleCopy(simEncryptedPayload)}
                      className="text-slate-400 hover:text-emerald-400 cursor-pointer p-1"
                    >
                      {copiedHash === simEncryptedPayload ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <div className="font-mono text-xs text-slate-300 break-all select-all bg-slate-900 p-2.5 rounded-lg border border-slate-850">
                    {simEncryptedPayload}
                  </div>
                </div>

                {/* Stage 3: Ballot Receipt Hash */}
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/40 space-y-1.5 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      3. Final Ballot Receipt Hash (Your On-Chain Proof)
                    </span>
                    <button
                      onClick={() => handleCopy(simReceiptHash)}
                      className="text-emerald-400 hover:text-emerald-300 cursor-pointer p-1"
                    >
                      {copiedHash === simReceiptHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <div className="font-mono text-xs text-emerald-300 font-bold break-all select-all bg-slate-900 p-2.5 rounded-lg border border-emerald-500/30">
                    {simReceiptHash}
                  </div>
                  <p className="text-[11px] text-slate-300">
                    You can copy this hash and verify its inclusion in the public Merkle tree anytime.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SECURITY, PRIVACY & INTEGRITY GUARANTEES */}
          {activeTab === 'SECURITY_FAQ' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Can University Officials See Who I Voted For?
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong>No.</strong> The system utilizes Zero-Knowledge Nullifier Tokens and client-side encryption. The university registrar verifies your eligibility to vote, but the ballot payload is mathematically decoupled from your student profile before reaching the blockchain ledger.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-cyan-400 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    Can Anyone Tamper With or Delete My Vote?
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong>No.</strong> Each block links consecutively to the previous block's SHA-256 hash. If even 1 bit in a single transaction is altered, the entire Merkle root fails validation, immediately alerting the 4 decentralized witness nodes and triggering the Anomaly Threat Radar.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-purple-400 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    What is End-to-End Verifiability (E2E-V)?
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    E2E-V means you can independently confirm that your ballot was <em>cast as intended</em>, <em>recorded as cast</em>, and <em>tallied as recorded</em>—without sacrificing ballot secrecy or allowing vote-selling/coercion.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-amber-400 flex items-center gap-2">
                    <Server className="w-4 h-4" />
                    What Prevents Double Voting or Sybil Attacks?
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Once a Zero-Knowledge Nullifier is committed into a block transaction, validator nodes reject any secondary submissions matching the nullifier hash, mathematically enforcing exactly one vote per matriculated student.
                  </p>
                </div>
              </div>

              {/* Live Explorer Banner CTA */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Blocks className="w-4 h-4 text-emerald-400" />
                    Audit the Live Blockchain Ledger in Real-Time
                  </h4>
                  <p className="text-xs text-slate-400">
                    Inspect active blocks, node latencies, Merkle roots, or simulate malicious block tampering.
                  </p>
                </div>
                {onNavigateToExplorer && (
                  <button
                    id="guide-jump-to-explorer-btn"
                    onClick={() => {
                      onClose();
                      onNavigateToExplorer();
                    }}
                    className="px-4 py-2.5 rounded-xl text-xs font-black text-slate-950 bg-emerald-500 hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)] transition-all cursor-pointer shrink-0"
                  >
                    Open Blockchain Explorer →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: GLOSSARY */}
          {activeTab === 'GLOSSARY' && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-xs font-bold text-emerald-400">Merkle Tree (DAG)</span>
                <p className="text-xs text-slate-300">
                  A hierarchical cryptographic tree structure where each leaf node is a hash of a transaction, and parent nodes are hashes of their children. This allows instantaneous proof of inclusion for thousands of ballots.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-xs font-bold text-cyan-400">Zero-Knowledge Nullifier Token</span>
                <p className="text-xs text-slate-300">
                  A cryptographic proof that enables students to prove they are registered and have not yet voted without disclosing their real identity or voter ID on the public ledger.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-xs font-bold text-purple-400">Proof-of-Authority (PoA) Consensus</span>
                <p className="text-xs text-slate-300">
                  A high-speed, environmentally clean blockchain consensus mechanism where pre-approved institutional validator nodes (CS Department, Electoral Board, Student Union) co-sign and notarize blocks.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-xs font-bold text-amber-400">Ballot Receipt Hash</span>
                <p className="text-xs text-slate-300">
                  A 256-bit unique cryptographic identifier provided to the student upon casting. It acts as an audit tracking number that confirms their vote has been permanently mined into the blockchain ledger.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-5 border-t border-slate-800 bg-slate-950/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Stanford University Associated Students Electoral Protocol</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="guide-dismiss-btn"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Close Guide
            </button>
            {onStartVoting && (
              <button
                id="guide-proceed-to-vote-btn"
                onClick={() => {
                  onClose();
                  onStartVoting();
                }}
                className="px-5 py-2 rounded-xl text-xs font-black text-slate-950 bg-emerald-500 hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)] transition-all cursor-pointer"
              >
                Proceed to Cast Ballot →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
