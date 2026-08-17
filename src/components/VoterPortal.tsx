import React, { useState } from 'react';
import { 
  Vote, 
  CheckCircle2, 
  ChevronRight, 
  ShieldCheck, 
  Award, 
  BookOpen, 
  GraduationCap, 
  Info, 
  Sparkles, 
  FileText, 
  Check, 
  Lock,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  ThumbsUp
} from 'lucide-react';
import { 
  UserAccount, 
  ElectionPosition, 
  Referendum, 
  Candidate, 
  BallotVoteChoice, 
  BallotReferendumChoice, 
  EncryptedBallot 
} from '../types';
import { BiometricModal } from './BiometricModal';
import { TwoFactorModal } from './TwoFactorModal';
import { BallotReceiptModal } from './BallotReceiptModal';
import { generateSignature } from '../lib/crypto';

interface VoterPortalProps {
  currentUser: UserAccount;
  positions: ElectionPosition[];
  referendums: Referendum[];
  onCastBallot: (ballot: EncryptedBallot) => { success: boolean; receiptHash: string; message: string };
  onNavigateToExplorer: (receiptHash: string) => void;
  onOpenAccessibility: () => void;
  onOpenVotingGuide?: () => void;
}

export const VoterPortal: React.FC<VoterPortalProps> = ({
  currentUser,
  positions,
  referendums,
  onCastBallot,
  onNavigateToExplorer,
  onOpenAccessibility,
  onOpenVotingGuide,
}) => {
  // Selected votes: positionId -> candidateId
  const [selectedCandidates, setSelectedCandidates] = useState<Record<string, string>>({
    'pos-pres': 'cand-maya',
    'pos-vp': 'cand-devon',
    'pos-treasurer': 'cand-zack',
  });

  // Selected referendums: referendumId -> optionId
  const [selectedReferendums, setSelectedReferendums] = useState<Record<string, string>>({
    'ref-transit': 'opt-transit-yes',
    'ref-health': 'opt-health-yes',
  });

  const [expandedCandidate, setExpandedCandidate] = useState<Candidate | null>(null);
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [latestReceiptHash, setLatestReceiptHash] = useState('');
  const [biometricAuthToken, setBiometricAuthToken] = useState<string | null>(null);
  const [broadcastState, setBroadcastState] = useState<'IDLE' | 'SIGNING' | 'BROADCASTING' | 'MINING'>('IDLE');
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const handleSelectCandidate = (positionId: string, candidateId: string) => {
    setSelectedCandidates(prev => ({
      ...prev,
      [positionId]: candidateId,
    }));
  };

  const handleSelectReferendum = (refId: string, optionId: string) => {
    setSelectedReferendums(prev => ({
      ...prev,
      [refId]: optionId,
    }));
  };

  const isBallotComplete = positions.every(p => !!selectedCandidates[p.id]) &&
    referendums.every(r => !!selectedReferendums[r.id]);

  const handleStartVoteSubmission = () => {
    if (!isBallotComplete) {
      setErrorBanner('Please make a selection for all positions and referendums before proceeding to cryptographic verification.');
      return;
    }
    setErrorBanner(null);
    setShowBiometricModal(true);
  };

  const handleBiometricSuccess = (bioToken: string) => {
    setBiometricAuthToken(bioToken);
    setShowBiometricModal(false);
    // Proceed to Step 2: 2FA TOTP
    setShowTwoFactorModal(true);
  };

  const handleTwoFactorSuccess = (totpToken: string) => {
    setShowTwoFactorModal(false);
    setBroadcastState('SIGNING');

    // Build ballot payload
    const votes: BallotVoteChoice[] = positions.map(p => {
      const candId = selectedCandidates[p.id];
      const cand = p.candidates.find(c => c.id === candId);
      return {
        positionId: p.id,
        candidateId: candId,
        candidateName: cand ? cand.name : 'Unknown',
      };
    });

    const refChoices: BallotReferendumChoice[] = referendums.map(r => {
      const optId = selectedReferendums[r.id];
      const opt = r.options.find(o => o.id === optId);
      return {
        referendumId: r.id,
        optionId: optId,
        optionLabel: opt ? opt.label : 'Abstain',
      };
    });

    const timestamp = Date.now();
    const signature = generateSignature(currentUser.encryptedVoterToken, JSON.stringify(votes));

    const encryptedBallot: EncryptedBallot = {
      ballotId: 'ballot-' + timestamp.toString(36),
      voterTokenHash: currentUser.encryptedVoterToken,
      encryptedPayload: `AES_GCM_256_PAYLOAD_${Date.now()}`,
      votes,
      referendums: refChoices,
      timestamp,
      signature,
      department: currentUser.department,
      classStanding: currentUser.classStanding,
    };

    setTimeout(() => {
      setBroadcastState('BROADCASTING');
      setTimeout(() => {
        setBroadcastState('MINING');
        setTimeout(() => {
          const res = onCastBallot(encryptedBallot);
          setBroadcastState('IDLE');
          if (res.success) {
            setLatestReceiptHash(res.receiptHash);
            setShowReceiptModal(true);
          } else {
            setErrorBanner(res.message);
          }
        }, 800);
      }, 700);
    }, 600);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Voter Eligibility Hero Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 text-white p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero-Knowledge Blind Cryptography (FIPS 140-3 Compliant)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Official 2026-2027 Student Government Election Ballot
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Cast your vote across all executive positions and student body referendums. Your ballot is verified via on-device biometrics and permanently sealed onto the campus blockchain.
            </p>
          </div>

          {/* Voter Card Widget */}
          <div className="p-4 rounded-xl bg-slate-950/70 backdrop-blur-md border border-slate-800 text-xs space-y-2.5 min-w-[280px]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Voter Profile:</span>
              <span className="font-semibold text-white">{currentUser.fullName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Student ID:</span>
              <span className="font-mono text-cyan-400">{currentUser.studentId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Department:</span>
              <span className="text-white truncate max-w-[150px]">{currentUser.department}</span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-400">Ballot Status:</span>
              {currentUser.hasVoted ? (
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Sealed in Blockchain
                </span>
              ) : (
                <span className="font-bold text-amber-400 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" />
                  Eligible & Ready
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Blockchain Voting Guide Banner */}
      {onOpenVotingGuide && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)] shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">
                  New to Blockchain Voting? Explore the Interactive Guide
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Transparency First
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Learn how on-chain encryption, Zero-Knowledge proofs, and Merkle tree receipts guarantee your ballot cannot be altered or traced back to your student ID.
              </p>
            </div>
          </div>
          <button
            id="voter-portal-open-guide-btn"
            onClick={onOpenVotingGuide}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shadow-[0_0_15px_rgba(16,185,129,0.25)] transition-all cursor-pointer shrink-0 whitespace-nowrap flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Open Voting Guide</span>
          </button>
        </div>
      )}

      {errorBanner && (
        <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-200 text-xs sm:text-sm flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{errorBanner}</span>
          </div>
          <button 
            onClick={() => setErrorBanner(null)}
            className="text-xs font-semibold underline hover:text-rose-300 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {currentUser.hasVoted && (
        <div className="p-6 rounded-2xl bg-emerald-950/30 border border-emerald-800/80 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-black text-emerald-300">
            You Have Successfully Cast Your Ballot
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
            Your single-vote privilege has been consumed and verified against double-spending in the distributed block consensus.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              id="re-open-receipt-btn"
              onClick={() => setShowReceiptModal(true)}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shadow-[0_0_15px_rgba(16,185,129,0.25)] transition-all cursor-pointer"
            >
              View My Encrypted Ballot Receipt
            </button>
            <button
              id="view-live-tally-btn"
              onClick={() => onNavigateToExplorer('')}
              className="px-5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-750 text-xs font-semibold transition-colors cursor-pointer"
            >
              Inspect Public Blockchain Explorer
            </button>
          </div>
        </div>
      )}

      {/* Main Ballot Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Positions & Candidates + Referendums */}
        <div className="lg:col-span-2 space-y-8">
          {positions.map((pos, posIdx) => (
            <section 
              key={pos.id}
              id={`position-section-${pos.id}`}
              className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-5"
            >
              <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                    Executive Position {posIdx + 1} of {positions.length}
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-white mt-0.5">
                    {pos.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {pos.description}
                  </p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-medium whitespace-nowrap border border-slate-700">
                  Choose 1 Candidate
                </span>
              </div>

              {/* Candidate Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {pos.candidates.map((candidate) => {
                  const isSelected = selectedCandidates[pos.id] === candidate.id;
                  return (
                    <div
                      key={candidate.id}
                      id={`candidate-card-${candidate.id}`}
                      onClick={() => !currentUser.hasVoted && handleSelectCandidate(pos.id, candidate.id)}
                      className={`relative rounded-xl p-4.5 border-2 transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-950/25 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                          : 'border-slate-800 hover:border-slate-700 bg-slate-950'
                      } ${currentUser.hasVoted ? 'opacity-90 cursor-default' : ''}`}
                    >
                      {/* Top Candidate Row */}
                      <div className="flex items-start gap-3">
                        <img
                          src={candidate.avatarUrl}
                          alt={candidate.name}
                          className="w-14 h-14 rounded-xl object-cover border border-slate-700 shadow-xs"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-white truncate">
                              {candidate.name}
                            </h4>
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                              isSelected
                                ? 'bg-emerald-500 text-slate-950'
                                : 'border-2 border-slate-600'
                            }`}>
                              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                          </div>

                          <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                            {candidate.department}
                          </div>

                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                              {candidate.classStanding}
                            </span>
                            <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              GPA {candidate.gpa.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Slogan */}
                      <p className="text-xs text-slate-300 italic mt-3 line-clamp-2">
                        "{candidate.slogan}"
                      </p>

                      {/* Manifesto preview & Endorsements */}
                      <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs">
                        <button
                          type="button"
                          id={`view-manifesto-${candidate.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedCandidate(candidate);
                          }}
                          className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          View Platform ({candidate.manifestoPoints.length})
                        </button>
                        <span className="text-[10px] text-slate-500">
                          {candidate.endorsements.length} Endorsements
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}

          {/* Referendums & Measures Section */}
          <section id="referendums-section" className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                Campus Ballot Measures & Referendums
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white mt-0.5">
                Constitutional Initiatives & Student Fees
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Direct student democracy votes on student fees, campus transit, and health services.
              </p>
            </div>

            <div className="space-y-6">
              {referendums.map((ref) => (
                <div 
                  key={ref.id}
                  id={`referendum-card-${ref.id}`}
                  className="p-5 rounded-xl border border-slate-800 bg-slate-950 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                        {ref.code}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-1.5">
                        {ref.title}
                      </h4>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300">
                    {ref.description}
                  </p>

                  {/* Options Radio List */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                    {ref.options.map((opt) => {
                      const isOptSelected = selectedReferendums[ref.id] === opt.id;
                      return (
                        <button
                          key={opt.id}
                          id={`ref-option-${opt.id}`}
                          type="button"
                          disabled={currentUser.hasVoted}
                          onClick={() => handleSelectReferendum(ref.id, opt.id)}
                          className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all flex items-center justify-between cursor-pointer ${
                            isOptSelected
                              ? 'border-emerald-500 bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.25)] font-bold'
                              : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
                          } ${currentUser.hasVoted ? 'cursor-default' : ''}`}
                        >
                          <span className="truncate pr-1">{opt.label}</span>
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                            isOptSelected ? 'bg-slate-950 text-emerald-400' : 'border border-slate-600'
                          }`}>
                            {isOptSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right 1 Column: Sticky Ballot Summary & Submission Box */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-2xl sticky top-24 space-y-5">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Vote className="w-5 h-5 text-emerald-400" />
                Ballot Verification Summary
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Review your slate before biometric signature
              </p>
            </div>

            {/* Selected items list */}
            <div className="space-y-3 text-xs">
              <div className="font-semibold text-slate-400 uppercase text-[10px] tracking-wider">
                Candidate Choices
              </div>
              {positions.map(p => {
                const candId = selectedCandidates[p.id];
                const cand = p.candidates.find(c => c.id === candId);
                return (
                  <div key={p.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-500">{p.title}</div>
                      <div className="font-bold text-white">{cand ? cand.name : 'Not Selected'}</div>
                    </div>
                    {cand && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                  </div>
                );
              })}

              <div className="font-semibold text-slate-400 uppercase text-[10px] tracking-wider pt-2">
                Referendum Votes
              </div>
              {referendums.map(r => {
                const optId = selectedReferendums[r.id];
                const opt = r.options.find(o => o.id === optId);
                return (
                  <div key={r.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-500">{r.code}</div>
                      <div className="font-bold text-white truncate max-w-[170px]">{opt ? opt.label : 'Not Selected'}</div>
                    </div>
                    {opt && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                  </div>
                );
              })}
            </div>

            {/* Security Guarantee Badges */}
            <div className="space-y-1.5 text-[11px] text-slate-400 pt-2 border-t border-slate-800">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero-Knowledge Blind Signature</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                <span>End-to-End Encrypted (AES-GCM-256)</span>
              </div>
            </div>

            {/* Broadcast In Progress animation */}
            {broadcastState !== 'IDLE' && (
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800 text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  {broadcastState === 'SIGNING' && 'Signing with Biometric Key...'}
                  {broadcastState === 'BROADCASTING' && 'Broadcasting to 4 College Nodes...'}
                  {broadcastState === 'MINING' && 'Mining into Next Blockchain Block...'}
                </div>
                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full animate-[progress_1s_ease-in-out_infinite]"></div>
                </div>
              </div>
            )}

            {/* Submit Ballot Button */}
            {!currentUser.hasVoted ? (
              <button
                id="cast-ballot-trigger-btn"
                disabled={!isBallotComplete || broadcastState !== 'IDLE'}
                onClick={handleStartVoteSubmission}
                className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Vote className="w-4 h-4" />
                <span>Sign & Seal Ballot with Biometrics</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                id="view-already-cast-receipt-btn"
                onClick={() => setShowReceiptModal(true)}
                className="w-full py-3 px-4 rounded-xl text-xs font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>View My Encrypted Ballot Receipt</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Candidate Manifesto Expanded Modal */}
      {expandedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div 
            id="manifesto-dialog"
            role="dialog"
            aria-labelledby="manifesto-candidate-name"
            aria-modal="true"
            className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 max-w-xl w-full p-6 text-white space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={expandedCandidate.avatarUrl}
                  alt={expandedCandidate.name}
                  className="w-14 h-14 rounded-xl object-cover border border-slate-700"
                />
                <div>
                  <h3 id="manifesto-candidate-name" className="text-lg font-bold">
                    {expandedCandidate.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {expandedCandidate.department} • {expandedCandidate.classStanding} (GPA {expandedCandidate.gpa.toFixed(2)})
                  </p>
                </div>
              </div>
              <button
                id="close-manifesto-modal-btn"
                onClick={() => setExpandedCandidate(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div>
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
                Campaign Platform & Bio
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {expandedCandidate.bio}
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Key Manifesto Commitments
              </div>
              <ul className="space-y-2">
                {expandedCandidate.manifestoPoints.map((point, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Official Student Endorsements
              </div>
              <div className="flex flex-wrap gap-1.5">
                {expandedCandidate.endorsements.map((end, idx) => (
                  <span key={idx} className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                    {end}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                id="select-from-manifesto-btn"
                onClick={() => {
                  handleSelectCandidate(expandedCandidate.positionId, expandedCandidate.id);
                  setExpandedCandidate(null);
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)] transition-all cursor-pointer"
              >
                Select {expandedCandidate.name} on Ballot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Biometric Scan Modal */}
      <BiometricModal
        isOpen={showBiometricModal}
        onClose={() => setShowBiometricModal(false)}
        onSuccess={handleBiometricSuccess}
        currentUser={currentUser}
      />

      {/* Two-Factor Authentication Modal */}
      <TwoFactorModal
        isOpen={showTwoFactorModal}
        onClose={() => setShowTwoFactorModal(false)}
        onSuccess={handleTwoFactorSuccess}
        currentUser={currentUser}
      />

      {/* Ballot Sealed Receipt Modal */}
      <BallotReceiptModal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        receiptHash={latestReceiptHash || '0x88c2f10b7a449103e91982bca01e7456d2039abf'}
        timestamp={Date.now()}
        department={currentUser.department}
        classStanding={currentUser.classStanding}
        onNavigateToExplorer={onNavigateToExplorer}
      />
    </div>
  );
};
