import React, { useState } from 'react';
import { 
  Settings, 
  UserPlus, 
  Play, 
  Pause, 
  CheckCircle, 
  Database, 
  Download, 
  Upload, 
  ShieldCheck, 
  KeyRound, 
  AlertOctagon, 
  Award, 
  FileCheck, 
  Save, 
  RefreshCw,
  Plus
} from 'lucide-react';
import { 
  ElectionPosition, 
  ElectionStatus, 
  Department, 
  ClassStanding, 
  BackupSnapshot, 
  UserAccount,
  Candidate
} from '../types';

interface AdminConsoleProps {
  currentUser: UserAccount;
  positions: ElectionPosition[];
  electionStatus: ElectionStatus;
  backups: BackupSnapshot[];
  onUpdateStatus: (status: ElectionStatus) => void;
  onRegisterCandidate: (candidate: Omit<Candidate, 'id' | 'votesCount'>) => boolean;
  onCreateBackup: () => BackupSnapshot;
  onResetSystem: () => void;
}

export const AdminConsole: React.FC<AdminConsoleProps> = ({
  currentUser,
  positions,
  electionStatus,
  backups,
  onUpdateStatus,
  onRegisterCandidate,
  onCreateBackup,
  onResetSystem,
}) => {
  const [activeTab, setActiveTab] = useState<'CANDIDATES' | 'LIFECYCLE' | 'BACKUPS' | 'RBAC'>('CANDIDATES');

  // Candidate Registration Form State
  const [candName, setCandName] = useState('');
  const [candPositionId, setCandPositionId] = useState(positions[0]?.id || 'pos-pres');
  const [candDept, setCandDept] = useState<Department>('Engineering & Computer Science');
  const [candStanding, setCandStanding] = useState<ClassStanding>('Junior');
  const [candGpa, setCandGpa] = useState('3.85');
  const [candSlogan, setCandSlogan] = useState('');
  const [candBio, setCandBio] = useState('');
  const [candManifesto, setCandManifesto] = useState('');
  const [candAvatar, setCandAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300');
  const [formSuccessMsg, setFormSuccessMsg] = useState<string | null>(null);

  const isOfficial = currentUser.role === 'ELECTION_OFFICIAL';

  const handleCandidateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candName || !candSlogan || !candBio) return;

    const manifestoPoints = candManifesto
      .split('\n')
      .map(p => p.trim())
      .filter(Boolean);

    const success = onRegisterCandidate({
      name: candName,
      positionId: candPositionId,
      department: candDept,
      classStanding: candStanding,
      gpa: parseFloat(candGpa) || 3.8,
      avatarUrl: candAvatar,
      slogan: candSlogan,
      bio: candBio,
      manifestoPoints: manifestoPoints.length ? manifestoPoints : ['Expand student services and promote academic equity.'],
      endorsements: ['Associated Students Nomination Committee'],
    });

    if (success) {
      setFormSuccessMsg(`Candidate ${candName} registered and sealed in blockchain nomination block!`);
      setCandName('');
      setCandSlogan('');
      setCandBio('');
      setCandManifesto('');
      setTimeout(() => setFormSuccessMsg(null), 4000);
    }
  };

  const departments: Department[] = [
    'Engineering & Computer Science',
    'Business & Economics',
    'Arts & Humanities',
    'Natural Sciences',
    'Health & Medicine',
    'Law & Policy',
  ];

  const classStandings: ClassStanding[] = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black tracking-tight text-white">
              Election Official Administration Console
            </h2>
            <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
              Role: ELECTION_OFFICIAL (Level 3 Clearance)
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage candidate nominations, configure election phases, execute database snapshots, and oversee RBAC policies.
          </p>
        </div>

        {!isOfficial && (
          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800 text-xs text-amber-200">
            <strong>Viewing in Voter Demo Mode:</strong> Switch to <span className="underline font-semibold">Dr. Sarah Jenkins</span> in the top-right menu for full administrative write access.
          </div>
        )}
      </div>

      {/* Admin Tab Navigation */}
      <div className="flex space-x-2 border-b border-slate-800 pb-2">
        <button
          id="admin-tab-candidates-btn"
          onClick={() => setActiveTab('CANDIDATES')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'CANDIDATES'
              ? 'bg-emerald-500 text-slate-950 font-black shadow-[0_0_15px_rgba(16,185,129,0.2)]'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>Candidate Nominations</span>
        </button>

        <button
          id="admin-tab-lifecycle-btn"
          onClick={() => setActiveTab('LIFECYCLE')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'LIFECYCLE'
              ? 'bg-emerald-500 text-slate-950 font-black shadow-[0_0_15px_rgba(16,185,129,0.2)]'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Play className="w-4 h-4" />
          <span>Election Phases</span>
        </button>

        <button
          id="admin-tab-backups-btn"
          onClick={() => setActiveTab('BACKUPS')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'BACKUPS'
              ? 'bg-emerald-500 text-slate-950 font-black shadow-[0_0_15px_rgba(16,185,129,0.2)]'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Backups & High Availability</span>
        </button>

        <button
          id="admin-tab-rbac-btn"
          onClick={() => setActiveTab('RBAC')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'RBAC'
              ? 'bg-emerald-500 text-slate-950 font-black shadow-[0_0_15px_rgba(16,185,129,0.2)]'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>RBAC Matrix</span>
        </button>
      </div>

      {/* Tab 1: Candidate Nominations Form */}
      {activeTab === 'CANDIDATES' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-5">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-400" />
                Register New Candidate on Blockchain
              </h3>
              <p className="text-xs text-slate-400">
                Nominations certified by the electoral official will be minted into a verifiable transaction block.
              </p>
            </div>

            {formSuccessMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>{formSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleCandidateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Candidate Full Name *
                  </label>
                  <input
                    id="cand-name-input"
                    type="text"
                    required
                    value={candName}
                    onChange={(e) => setCandName(e.target.value)}
                    placeholder="e.g. Jordan Miller"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Election Position *
                  </label>
                  <select
                    id="cand-position-select"
                    value={candPositionId}
                    onChange={(e) => setCandPositionId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                  >
                    {positions.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Faculty / Department *
                  </label>
                  <select
                    id="cand-dept-select"
                    value={candDept}
                    onChange={(e) => setCandDept(e.target.value as Department)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                  >
                    {departments.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Class Standing *
                  </label>
                  <select
                    id="cand-standing-select"
                    value={candStanding}
                    onChange={(e) => setCandStanding(e.target.value as ClassStanding)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                  >
                    {classStandings.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Cumulative GPA (Academic Standing)
                  </label>
                  <input
                    id="cand-gpa-input"
                    type="number"
                    step="0.01"
                    min="2.0"
                    max="4.0"
                    value={candGpa}
                    onChange={(e) => setCandGpa(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Campaign Slogan / Motto *
                </label>
                <input
                  id="cand-slogan-input"
                  type="text"
                  required
                  value={candSlogan}
                  onChange={(e) => setCandSlogan(e.target.value)}
                  placeholder="e.g. Empowering Student Voices & Sustainable Campus Innovation"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Candidate Bio & Leadership Experience *
                </label>
                <textarea
                  id="cand-bio-textarea"
                  rows={2}
                  required
                  value={candBio}
                  onChange={(e) => setCandBio(e.target.value)}
                  placeholder="Summarize candidate's campus background and student senate credentials..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Manifesto Bullet Points (One commitment per line)
                </label>
                <textarea
                  id="cand-manifesto-textarea"
                  rows={3}
                  value={candManifesto}
                  onChange={(e) => setCandManifesto(e.target.value)}
                  placeholder="Expand dining hall evening hours&#10;Subsidize student transit passes&#10;Establish mental wellness grant fund"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="pt-2">
                <button
                  id="submit-candidate-nomination-btn"
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-black text-slate-950 bg-emerald-500 hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Certify & Mint Candidate onto Blockchain</span>
                </button>
              </div>
            </form>
          </div>

          {/* Current Candidate Slate Count */}
          <div className="space-y-4">
            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
              <h4 className="text-sm font-bold text-white">
                Certified Candidate Slates
              </h4>

              <div className="space-y-3">
                {positions.map(p => (
                  <div key={p.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-200">{p.title}</span>
                      <span className="font-mono text-emerald-400">{p.candidates.length} Certified</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {p.candidates.map(c => (
                        <span key={c.id} className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                          {c.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Election Lifecycle Control */}
      {activeTab === 'LIFECYCLE' && (
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white">
              Election Status & Polling Controls
            </h3>
            <p className="text-xs text-slate-400">
              Control the operational state of the cryptographic smart contract and validator acceptance rules
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className={`p-5 rounded-2xl border transition-all ${
              electionStatus === 'ACTIVE'
                ? 'border-emerald-500/60 bg-emerald-950/20 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                : 'border-slate-800 bg-slate-950'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-emerald-400">Polls Active</span>
                <Play className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-xs text-slate-300 mt-2">
                Students can authenticate via biometrics and cast sealed ballots into the blockchain.
              </p>
              <button
                id="set-status-active-btn"
                disabled={electionStatus === 'ACTIVE'}
                onClick={() => onUpdateStatus('ACTIVE')}
                className="mt-4 w-full py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-all disabled:opacity-30 disabled:hover:bg-emerald-500 cursor-pointer"
              >
                {electionStatus === 'ACTIVE' ? 'Currently Running' : 'Open / Resume Polls'}
              </button>
            </div>

            <div className={`p-5 rounded-2xl border transition-all ${
              electionStatus === 'PAUSED'
                ? 'border-amber-500/60 bg-amber-950/20 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                : 'border-slate-800 bg-slate-950'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-amber-400">Polls Paused</span>
                <Pause className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-xs text-slate-300 mt-2">
                Emergency freeze: Temporarily prevents new ballot submissions while preserving all past blocks.
              </p>
              <button
                id="set-status-paused-btn"
                disabled={electionStatus === 'PAUSED'}
                onClick={() => onUpdateStatus('PAUSED')}
                className="mt-4 w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all disabled:opacity-30 disabled:hover:bg-amber-500 cursor-pointer"
              >
                {electionStatus === 'PAUSED' ? 'Currently Paused' : 'Emergency Pause Polls'}
              </button>
            </div>

            <div className={`p-5 rounded-2xl border transition-all ${
              electionStatus === 'FINALIZED'
                ? 'border-blue-500/60 bg-blue-950/20 shadow-[0_0_20px_rgba(59,130,246,0.15)]'
                : 'border-slate-800 bg-slate-950'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-blue-400">Certified Final</span>
                <CheckCircle className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-xs text-slate-300 mt-2">
                Polls permanently closed. Final Merkle root notarized and certified by Electoral Board.
              </p>
              <button
                id="set-status-finalized-btn"
                disabled={electionStatus === 'FINALIZED'}
                onClick={() => onUpdateStatus('FINALIZED')}
                className="mt-4 w-full py-2.5 px-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 text-xs font-black transition-all disabled:opacity-30 disabled:hover:bg-blue-500 cursor-pointer"
              >
                {electionStatus === 'FINALIZED' ? 'Election Certified' : 'Certify Final Tally'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Backups & Disaster Recovery */}
      {activeTab === 'BACKUPS' && (
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-400" />
                Decentralized Snapshot Backups & High Availability
              </h3>
              <p className="text-xs text-slate-400">
                Automated continuous backups with SHA-256 cryptographic verification checksums
              </p>
            </div>
            <button
              id="trigger-manual-backup-btn"
              onClick={onCreateBackup}
              className="px-4 py-2.5 rounded-xl text-xs font-black text-slate-950 bg-emerald-500 hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)] transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Save className="w-4 h-4" />
              <span>Create Instant Snapshot</span>
            </button>
          </div>

          {/* Backup Snapshot List */}
          <div className="space-y-3">
            {backups.map((snap) => (
              <div
                key={snap.id}
                className="p-4 rounded-xl border border-slate-800 bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white font-mono">{snap.id}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      snap.autoGenerated ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                    }`}>
                      {snap.autoGenerated ? 'Auto-Scheduled (15m)' : 'Manual Snapshot'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-1 flex items-center gap-3">
                    <span>Blocks: {snap.totalBlocks}</span>
                    <span>•</span>
                    <span>Checksum: {snap.checksum}</span>
                    <span>•</span>
                    <span>Size: {snap.sizeKb} KB</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">
                    {new Date(snap.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Verified Clean
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: RBAC Permissions Matrix */}
      {activeTab === 'RBAC' && (
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Role-Based Access Control (RBAC) Security Matrix
            </h3>
            <p className="text-xs text-slate-400">
              Granular permission boundaries enforcing strict separation of duties across voters, officials, and security auditors
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950 text-slate-300">
                  <th className="p-3 font-bold">System Capability</th>
                  <th className="p-3 font-bold text-center">Voter Role</th>
                  <th className="p-3 font-bold text-center">Election Official</th>
                  <th className="p-3 font-bold text-center">Security Auditor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                <tr>
                  <td className="p-3 font-semibold text-white">Cast Encrypted Ballot via Biometric + 2FA</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">✓ Granted</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">✓ Granted</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">✓ Granted</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-white">Verify Ballot Inclusion via Receipt Hash</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">✓ Granted</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">✓ Granted</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">✓ Granted</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-white">Register & Certify Candidates on Chain</td>
                  <td className="p-3 text-center text-rose-400 font-bold">✕ Denied</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">✓ Granted</td>
                  <td className="p-3 text-center text-rose-400 font-bold">✕ Denied</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-white">Modify Polling Lifecycle Status</td>
                  <td className="p-3 text-center text-rose-400 font-bold">✕ Denied</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">✓ Granted</td>
                  <td className="p-3 text-center text-rose-400 font-bold">✕ Denied</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-white">Monitor Threat Radar & Resolve Security Incidents</td>
                  <td className="p-3 text-center text-rose-400 font-bold">✕ Denied</td>
                  <td className="p-3 text-center text-amber-400 font-bold">Read-Only</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">✓ Full Control</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-white">Export & Restore High Availability Snapshots</td>
                  <td className="p-3 text-center text-rose-400 font-bold">✕ Denied</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">✓ Granted</td>
                  <td className="p-3 text-center text-emerald-400 font-bold">✓ Granted</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
