import React, { useState, useEffect } from 'react';
import { AppStateManager } from './lib/storage';
import { Navbar } from './components/Navbar';
import { VoterPortal } from './components/VoterPortal';
import { ResultsDashboard } from './components/ResultsDashboard';
import { BlockchainExplorer } from './components/BlockchainExplorer';
import { AdminConsole } from './components/AdminConsole';
import { SecurityThreatCenter } from './components/SecurityThreatCenter';
import { AccessibilityToolbar } from './components/AccessibilityToolbar';
import { MobileVotingBadge } from './components/MobileVotingBadge';
import { VotingGuideModal } from './components/VotingGuideModal';
import { ShieldCheck, Lock, RotateCcw, Award, Server } from 'lucide-react';
import { UserAccount, ElectionStatus } from './types';

export default function App() {
  const manager = AppStateManager.getInstance();

  const [, setTick] = useState(0);
  const [activeTab, setActiveTab] = useState<string>('voter');
  const [explorerSearchQuery, setExplorerSearchQuery] = useState<string>('');
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);
  const [isMobileSimOpen, setIsMobileSimOpen] = useState(false);
  const [isVotingGuideOpen, setIsVotingGuideOpen] = useState(false);

  useEffect(() => {
    // Subscribe to state manager updates
    const unsubscribe = manager.subscribe(() => {
      setTick(t => t + 1);
    });
    return () => unsubscribe();
  }, [manager]);

  const currentUser = manager.currentUser;
  const usersList = manager.usersList;
  const electionStatus = manager.electionStatus;
  const positions = manager.positions;
  const referendums = manager.referendums;
  const blockchain = manager.blockchain;
  const threatAlerts = manager.threatAlerts;
  const auditLogs = manager.auditLogs;
  const backups = manager.backups;
  const accessibility = manager.accessibility;

  const activeThreatsCount = threatAlerts.filter(t => t.status === 'ACTIVE' || t.status === 'INVESTIGATING').length;

  const handleNavigateToExplorer = (receiptHash?: string) => {
    if (receiptHash) {
      setExplorerSearchQuery(receiptHash);
    }
    setActiveTab('blockchain');
  };

  // Compute CSS classes based on accessibility preferences
  const accessibilityClassNames = [
    accessibility.highContrast ? 'high-contrast' : '',
    accessibility.dyslexiaFont ? 'dyslexia-font' : '',
    accessibility.fontSize === 'large' ? 'font-size-large' : '',
    accessibility.fontSize === 'extra-large' ? 'font-size-extra-large' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-all duration-200 ${accessibilityClassNames}`}>
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        usersList={usersList}
        onSwitchUser={(u) => manager.switchUser(u)}
        electionStatus={electionStatus}
        threatCount={activeThreatsCount}
        onOpenAccessibility={() => setIsAccessibilityOpen(true)}
        onOpenMobileSim={() => setIsMobileSimOpen(true)}
        onOpenVotingGuide={() => setIsVotingGuideOpen(true)}
      />

      {/* Main Tab Content */}
      <main className="flex-1">
        {activeTab === 'voter' && (
          <VoterPortal
            currentUser={currentUser}
            positions={positions}
            referendums={referendums}
            onCastBallot={(ballot) => manager.castBallot(ballot)}
            onNavigateToExplorer={handleNavigateToExplorer}
            onOpenAccessibility={() => setIsAccessibilityOpen(true)}
            onOpenVotingGuide={() => setIsVotingGuideOpen(true)}
          />
        )}

        {activeTab === 'results' && (
          <ResultsDashboard
            positions={positions}
            referendums={referendums}
            electionStatus={electionStatus}
            totalBlocks={blockchain.chain.length}
          />
        )}

        {activeTab === 'blockchain' && (
          <BlockchainExplorer
            blockchain={blockchain}
            onTamperBlock={(idx, fake) => manager.tamperBlockSimulation(idx, fake)}
            onResetChain={() => manager.resetToFreshGenesis()}
            initialSearchQuery={explorerSearchQuery}
          />
        )}

        {activeTab === 'admin' && (
          <AdminConsole
            currentUser={currentUser}
            positions={positions}
            electionStatus={electionStatus}
            backups={backups}
            onUpdateStatus={(status: ElectionStatus) => manager.updateElectionStatus(status, currentUser.fullName)}
            onRegisterCandidate={(cand) => manager.registerCandidate(cand, currentUser.fullName)}
            onCreateBackup={() => manager.createManualBackup()}
            onResetSystem={() => manager.resetToFreshGenesis()}
          />
        )}

        {activeTab === 'threats' && (
          <SecurityThreatCenter
            threatAlerts={threatAlerts}
            auditLogs={auditLogs}
            currentUser={currentUser}
            onResolveThreat={(id) => manager.resolveThreat(id)}
          />
        )}
      </main>

      {/* Footnote & Standards Compliance Bar */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Stanford University Associated Students Electoral System • Decentralized PoA Blockchain</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <button
              id="footer-voting-guide-btn"
              onClick={() => setIsVotingGuideOpen(true)}
              className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
            >
              Interactive Voting & Transparency Guide
            </button>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-cyan-500" />
              FIPS 140-3 2FA Certified
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Server className="w-3 h-3 text-emerald-500" />
              4/4 Node Consensus
            </span>
            <span>•</span>
            <button
              id="reset-demo-sandbox-btn"
              onClick={() => manager.resetToFreshGenesis()}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Demo Sandbox
            </button>
          </div>
        </div>
      </footer>

      {/* Interactive Voting & Transparency Guide Modal */}
      <VotingGuideModal
        isOpen={isVotingGuideOpen}
        onClose={() => setIsVotingGuideOpen(false)}
        onNavigateToExplorer={() => {
          setIsVotingGuideOpen(false);
          setActiveTab('blockchain');
        }}
        onStartVoting={() => {
          setIsVotingGuideOpen(false);
          setActiveTab('voter');
        }}
      />

      {/* Accessibility Toolbar Modal */}
      <AccessibilityToolbar
        isOpen={isAccessibilityOpen}
        onClose={() => setIsAccessibilityOpen(false)}
        settings={accessibility}
        onUpdateSettings={(s) => manager.updateAccessibility(s)}
      />

      {/* Mobile Voting Companion Modal */}
      <MobileVotingBadge
        isOpen={isMobileSimOpen}
        onClose={() => setIsMobileSimOpen(false)}
        currentUser={currentUser}
      />
    </div>
  );
}
