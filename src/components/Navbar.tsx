import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Vote, 
  BarChart3, 
  Blocks, 
  Settings, 
  AlertTriangle, 
  UserCheck, 
  Cpu, 
  Smartphone, 
  Eye, 
  ChevronDown, 
  CheckCircle2, 
  Lock,
  Wifi,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { UserAccount, UserRole, ElectionStatus } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: UserAccount;
  usersList: UserAccount[];
  onSwitchUser: (user: UserAccount) => void;
  electionStatus: ElectionStatus;
  threatCount: number;
  onOpenAccessibility: () => void;
  onOpenMobileSim: () => void;
  onOpenVotingGuide: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  usersList,
  onSwitchUser,
  electionStatus,
  threatCount,
  onOpenAccessibility,
  onOpenMobileSim,
  onOpenVotingGuide,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'ELECTION_OFFICIAL':
        return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase">Official</span>;
      case 'AUDITOR':
        return <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase">Auditor</span>;
      default:
        return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase">Voter</span>;
    }
  };

  const getStatusBadge = () => {
    switch (electionStatus) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Polls Active
          </span>
        );
      case 'PAUSED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/25">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            Polls Paused
          </span>
        );
      case 'FINALIZED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/25">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
            Certified Final
          </span>
        );
      default:
        return null;
    }
  };

  const navItems = [
    { id: 'voter', label: 'Cast Ballot', icon: Vote, badge: currentUser.hasVoted ? 'Voted' : 'Eligible' },
    { id: 'results', label: 'Live Results', icon: BarChart3 },
    { id: 'blockchain', label: 'Blockchain Ledger', icon: Blocks },
    { id: 'admin', label: 'Admin Console', icon: Settings, officialOnly: true },
    { id: 'threats', label: 'Threat Radar & Logs', icon: AlertTriangle, count: threatCount },
  ];

  return (
    <header className="bg-slate-950/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 shadow-xl">
      {/* Top Protocol Status Bar */}
      <div className="bg-slate-950 border-b border-slate-850 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <Wifi className="w-3.5 h-3.5" />
            <span className="font-mono text-[11px] font-semibold tracking-wide">Decentralized Mesh: 4/4 Validator Nodes Synced</span>
          </div>
          <span className="text-slate-700 hidden sm:inline">|</span>
          <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
            <Lock className="w-3 h-3 text-cyan-400" />
            <span className="font-mono text-[11px]">AES-GCM-256 / SHA-256 E2E Encrypted</span>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px]">
          <button
            id="voting-guide-top-btn"
            onClick={onOpenVotingGuide}
            className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer font-bold"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="underline underline-offset-2">Interactive Voting Guide</span>
          </button>
          <span className="text-slate-700">|</span>
          <button
            id="mobile-voting-top-btn"
            onClick={onOpenMobileSim}
            className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="underline underline-offset-2">Mobile Voting App</span>
          </button>
          <span className="text-slate-700">|</span>
          <button
            id="accessibility-top-btn"
            onClick={onOpenAccessibility}
            className="flex items-center gap-1 text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
            aria-label="Accessibility settings"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Accessibility (WCAG 2.1 AA)</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & College Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20 font-bold">
              <ShieldCheck className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Stanford University
                </h1>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  ZK-CHAIN v4.2
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Associated Students Electoral Blockchain & Biometric System
              </p>
            </div>
          </div>

          {/* Election Status & User Switcher */}
          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              {getStatusBadge()}
            </div>

            {/* Quick RBAC Role Switcher */}
            <div className="relative">
              <button
                id="user-profile-dropdown-btn"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-850 hover:border-slate-700 transition-all text-left cursor-pointer shadow-md"
                aria-expanded={showUserDropdown}
              >
                <img
                  src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                  alt={currentUser.fullName}
                  className="w-8 h-8 rounded-lg object-cover border border-slate-700"
                />
                <div className="hidden sm:block">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    {currentUser.fullName}
                    {getRoleBadge(currentUser.role)}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {currentUser.studentId}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-slate-800">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Switch Demo Account / RBAC Role</p>
                    <p className="text-xs font-semibold text-emerald-400 mt-0.5">
                      Multi-Factor & Biometric Enrolled
                    </p>
                  </div>
                  <div className="py-1">
                    {usersList.map((usr) => (
                      <button
                        key={usr.id}
                        onClick={() => {
                          onSwitchUser(usr);
                          setShowUserDropdown(false);
                        }}
                        className={`w-full px-4 py-2.5 text-left text-xs flex items-center justify-between hover:bg-slate-800/80 cursor-pointer transition-colors ${
                          usr.id === currentUser.id ? 'bg-emerald-500/10 text-emerald-300 font-semibold' : 'text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={usr.avatarUrl}
                            alt=""
                            className="w-7 h-7 rounded-lg object-cover border border-slate-700"
                          />
                          <div>
                            <div className="font-medium flex items-center gap-1">
                              {usr.fullName}
                              {usr.id === currentUser.id && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {usr.department}
                            </div>
                          </div>
                        </div>
                        <div>
                          {getRoleBadge(usr.role)}
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="p-3 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <Lock className="w-3 h-3 text-emerald-400" />
                      2FA & Biometric Active
                    </span>
                    <span className="font-mono text-[10px] text-slate-300">
                      {currentUser.hasVoted ? 'Ballot Cast' : 'Not Yet Voted'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <nav className="flex space-x-1.5 sm:space-x-2 overflow-x-auto pb-2 scrollbar-none pt-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    item.badge === 'Voted'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {item.count !== undefined && item.count > 0 && (
                  <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] px-1.5 py-0.2 rounded-full font-bold animate-pulse">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
