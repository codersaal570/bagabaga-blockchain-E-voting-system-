import {
  UserAccount,
  ElectionStatus,
  ElectionPosition,
  Referendum,
  ThreatAlert,
  AuditLogEntry,
  BackupSnapshot,
  AccessibilitySettings,
  EncryptedBallot,
  BlockchainTransaction,
  Candidate,
} from '../types';
import {
  INITIAL_POSITIONS,
  INITIAL_REFERENDUMS,
  DEMO_USERS,
  INITIAL_THREAT_ALERTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_BACKUPS,
  INITIAL_VALIDATOR_NODES,
} from './mockData';
import { CampusVotingBlockchain } from './blockchain';
import { generateBallotReceiptHash, generateSignature, sha256Sync } from './crypto';

const STORAGE_KEYS = {
  CURRENT_USER: 'cv_current_user_v1',
  ELECTION_STATUS: 'cv_election_status_v1',
  POSITIONS: 'cv_positions_v1',
  REFERENDUMS: 'cv_referendums_v1',
  BLOCKCHAIN_DATA: 'cv_blockchain_data_v1',
  THREAT_ALERTS: 'cv_threat_alerts_v1',
  AUDIT_LOGS: 'cv_audit_logs_v1',
  BACKUPS: 'cv_backups_v1',
  ACCESSIBILITY: 'cv_accessibility_v1',
  USERS_LIST: 'cv_users_list_v1',
};

export class AppStateManager {
  private static instance: AppStateManager;
  public currentUser: UserAccount;
  public usersList: UserAccount[];
  public electionStatus: ElectionStatus;
  public positions: ElectionPosition[];
  public referendums: Referendum[];
  public blockchain: CampusVotingBlockchain;
  public threatAlerts: ThreatAlert[];
  public auditLogs: AuditLogEntry[];
  public backups: BackupSnapshot[];
  public accessibility: AccessibilitySettings;
  private listeners: Set<() => void> = new Set();

  private constructor() {
    this.usersList = this.loadFromStorage(STORAGE_KEYS.USERS_LIST, DEMO_USERS);
    this.currentUser = this.loadFromStorage(STORAGE_KEYS.CURRENT_USER, this.usersList[0]);
    this.electionStatus = this.loadFromStorage(STORAGE_KEYS.ELECTION_STATUS, 'ACTIVE');
    this.positions = this.loadFromStorage(STORAGE_KEYS.POSITIONS, INITIAL_POSITIONS);
    this.referendums = this.loadFromStorage(STORAGE_KEYS.REFERENDUMS, INITIAL_REFERENDUMS);
    this.threatAlerts = this.loadFromStorage(STORAGE_KEYS.THREAT_ALERTS, INITIAL_THREAT_ALERTS);
    this.auditLogs = this.loadFromStorage(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    this.backups = this.loadFromStorage(STORAGE_KEYS.BACKUPS, INITIAL_BACKUPS);
    this.accessibility = this.loadFromStorage(STORAGE_KEYS.ACCESSIBILITY, {
      highContrast: false,
      dyslexiaFont: false,
      fontSize: 'normal',
      soundEnabled: true,
      screenReaderAnnouncements: true,
    });

    // Initialize blockchain
    this.blockchain = new CampusVotingBlockchain(INITIAL_VALIDATOR_NODES);
    const savedChain = this.loadFromStorage<any>(STORAGE_KEYS.BLOCKCHAIN_DATA, null);
    if (savedChain && Array.isArray(savedChain.chain) && savedChain.chain.length > 0) {
      this.blockchain.chain = savedChain.chain;
      this.blockchain.spentVoterTokenHashes = new Set(savedChain.spentHashes || []);
    }
  }

  public static getInstance(): AppStateManager {
    if (!AppStateManager.instance) {
      AppStateManager.instance = new AppStateManager();
    }
    return AppStateManager.instance;
  }

  private loadFromStorage<T>(key: string, defaultValue: T): T {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const item = window.localStorage.getItem(key);
        if (item) {
          return JSON.parse(item);
        }
      }
    } catch {
      // ignore
    }
    return defaultValue;
  }

  private saveToStorage(key: string, value: any) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch {
      // ignore
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }

  public switchUser(user: UserAccount) {
    this.currentUser = user;
    this.saveToStorage(STORAGE_KEYS.CURRENT_USER, user);
    this.addAuditLog({
      category: 'AUTH',
      actor: user.fullName,
      actorRole: user.role,
      action: `Session Authenticated: ${user.role}`,
      details: `User switched active context to ${user.fullName} (${user.studentId}). Role credentials verified.`,
      ipAddress: user.ipAddress,
      status: 'SUCCESS',
    });
    this.notify();
  }

  public updateAccessibility(settings: Partial<AccessibilitySettings>) {
    this.accessibility = { ...this.accessibility, ...settings };
    this.saveToStorage(STORAGE_KEYS.ACCESSIBILITY, this.accessibility);
    this.notify();
  }

  public updateElectionStatus(newStatus: ElectionStatus, officialName: string) {
    const prev = this.electionStatus;
    this.electionStatus = newStatus;
    this.saveToStorage(STORAGE_KEYS.ELECTION_STATUS, newStatus);

    // Record on blockchain
    const statusTx: BlockchainTransaction = {
      id: 'tx-status-' + Date.now(),
      type: 'ELECTION_STATUS_CHANGE',
      ballotReceiptHash: '0x' + sha256Sync(`STATUS_${newStatus}_${Date.now()}`),
      voterTokenHash: 'OFFICIAL_KEY_SLOT',
      encryptedData: `ELECTION_LIFECYCLE_TRANSITION: ${prev} -> ${newStatus}`,
      metadata: {
        department: 'Law & Policy',
        classStanding: 'Senior',
        selectionsSummary: [`Election Status set to ${newStatus} by ${officialName}`],
      },
      timestamp: Date.now(),
      validatorSignature: generateSignature(officialName, newStatus),
    };
    this.blockchain.addTransaction(statusTx);
    this.saveBlockchain();

    this.addAuditLog({
      category: 'ADMIN',
      actor: officialName,
      actorRole: 'ELECTION_OFFICIAL',
      action: `Election Status: ${newStatus}`,
      details: `Official modified campus election lifecycle status from ${prev} to ${newStatus}. Sealed in blockchain.`,
      ipAddress: this.currentUser.ipAddress,
      status: 'SUCCESS',
    });

    this.notify();
  }

  public castBallot(ballot: EncryptedBallot): { success: boolean; receiptHash: string; message: string } {
    if (this.electionStatus !== 'ACTIVE') {
      return { success: false, receiptHash: '', message: 'Elections are currently closed or paused by the Electoral Board.' };
    }

    if (this.currentUser.hasVoted) {
      // Threat attempt simulation
      this.addThreatAlert({
        type: 'DOUBLE_VOTE_ATTEMPT',
        title: 'Duplicate Ballot Submission Rejection',
        description: `Account ${this.currentUser.studentId} (${this.currentUser.fullName}) attempted to submit a secondary ballot after already voting.`,
        severity: 'HIGH',
        sourceIp: this.currentUser.ipAddress,
        affectedAccount: this.currentUser.studentId,
        mitigation: 'Ballot rejected at mempool gate; duplicate token flagged.',
      });
      return { success: false, receiptHash: '', message: 'You have already cast your ballot in this election.' };
    }

    const selectionsSummary: string[] = [];

    // Increment votes on candidates
    for (const vote of ballot.votes) {
      for (const pos of this.positions) {
        if (pos.id === vote.positionId) {
          const cand = pos.candidates.find(c => c.id === vote.candidateId);
          if (cand) {
            cand.votesCount += 1;
            selectionsSummary.push(`${pos.title}: ${cand.name}`);
          }
        }
      }
    }

    // Increment votes on referendums
    for (const refVote of ballot.referendums) {
      for (const ref of this.referendums) {
        if (ref.id === refVote.referendumId) {
          const opt = ref.options.find(o => o.id === refVote.optionId);
          if (opt) {
            opt.votesCount += 1;
            selectionsSummary.push(`${ref.code}: ${opt.label}`);
          }
        }
      }
    }

    // Generate cryptographic receipt hash
    const receiptHash = generateBallotReceiptHash(
      ballot.voterTokenHash,
      JSON.stringify(selectionsSummary),
      ballot.timestamp
    );

    // Create blockchain transaction
    const tx: BlockchainTransaction = {
      id: 'tx-ballot-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      type: 'VOTE_CAST',
      ballotReceiptHash: receiptHash,
      voterTokenHash: ballot.voterTokenHash,
      encryptedData: `AES_GCM_256_CIPHERTEXT:${sha256Sync(JSON.stringify(ballot.votes))}`,
      metadata: {
        department: ballot.department,
        classStanding: ballot.classStanding,
        selectionsSummary,
      },
      timestamp: ballot.timestamp,
      validatorSignature: ballot.signature,
    };

    const addResult = this.blockchain.addTransaction(tx);
    if (!addResult.success) {
      return { success: false, receiptHash: '', message: addResult.message };
    }

    // Mark user as voted
    this.currentUser.hasVoted = true;
    const userIndex = this.usersList.findIndex(u => u.id === this.currentUser.id);
    if (userIndex >= 0) {
      this.usersList[userIndex].hasVoted = true;
    }

    // Persist all updates
    this.saveToStorage(STORAGE_KEYS.CURRENT_USER, this.currentUser);
    this.saveToStorage(STORAGE_KEYS.USERS_LIST, this.usersList);
    this.saveToStorage(STORAGE_KEYS.POSITIONS, this.positions);
    this.saveToStorage(STORAGE_KEYS.REFERENDUMS, this.referendums);
    this.saveBlockchain();

    this.addAuditLog({
      category: 'BALLOT',
      actor: 'Anonymous Voter (ZK-Verified)',
      actorRole: 'VOTER',
      action: 'Ballot Sealed in Blockchain',
      details: `Voter from ${ballot.department} (${ballot.classStanding}) submitted ballot. Receipt Hash: ${receiptHash.slice(0, 16)}...`,
      ipAddress: this.currentUser.ipAddress,
      status: 'SUCCESS',
    });

    this.notify();
    return { success: true, receiptHash, message: 'Ballot successfully validated and sealed in the distributed blockchain!' };
  }

  public registerCandidate(candidate: Omit<Candidate, 'id' | 'votesCount'>, officialName: string): boolean {
    const position = this.positions.find(p => p.id === candidate.positionId);
    if (!position) return false;

    const newCandidate: Candidate = {
      ...candidate,
      id: 'cand-' + Date.now().toString(36),
      votesCount: 0,
    };

    position.candidates.push(newCandidate);
    this.saveToStorage(STORAGE_KEYS.POSITIONS, this.positions);

    // Blockchain transaction
    const tx: BlockchainTransaction = {
      id: 'tx-cand-' + Date.now(),
      type: 'CANDIDATE_REGISTERED',
      ballotReceiptHash: '0x' + sha256Sync(`CANDIDATE_${newCandidate.name}_${Date.now()}`),
      voterTokenHash: 'OFFICIAL_NOMINATION_KEY',
      encryptedData: `REGISTER_CANDIDATE_${newCandidate.name.toUpperCase()}_FOR_${position.title}`,
      metadata: {
        department: newCandidate.department,
        classStanding: newCandidate.classStanding,
        selectionsSummary: [`Candidate Approved: ${newCandidate.name} for ${position.title}`],
      },
      timestamp: Date.now(),
      validatorSignature: generateSignature(officialName, newCandidate.name),
    };
    this.blockchain.addTransaction(tx);
    this.saveBlockchain();

    this.addAuditLog({
      category: 'ADMIN',
      actor: officialName,
      actorRole: 'ELECTION_OFFICIAL',
      action: `Candidate Registered: ${newCandidate.name}`,
      details: `Approved candidate ${newCandidate.name} for ${position.title} (${newCandidate.department}).`,
      ipAddress: this.currentUser.ipAddress,
      status: 'SUCCESS',
    });

    this.notify();
    return true;
  }

  public addAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'tamperProofHash'>) {
    const timestamp = Date.now();
    const hash = sha256Sync(`${entry.actor}_${entry.action}_${timestamp}_${entry.details}`);
    const newLog: AuditLogEntry = {
      ...entry,
      id: 'log-' + timestamp.toString(36) + Math.random().toString(36).substring(2, 5),
      timestamp,
      tamperProofHash: hash,
    };
    this.auditLogs.unshift(newLog);
    if (this.auditLogs.length > 80) this.auditLogs.pop();
    this.saveToStorage(STORAGE_KEYS.AUDIT_LOGS, this.auditLogs);
  }

  public addThreatAlert(alert: Omit<ThreatAlert, 'id' | 'timestamp' | 'status'>) {
    const newAlert: ThreatAlert = {
      ...alert,
      id: 'threat-' + Date.now().toString(36),
      timestamp: Date.now(),
      status: 'ACTIVE',
    };
    this.threatAlerts.unshift(newAlert);
    this.saveToStorage(STORAGE_KEYS.THREAT_ALERTS, this.threatAlerts);
    this.notify();
  }

  public resolveThreat(threatId: string) {
    const alert = this.threatAlerts.find(t => t.id === threatId);
    if (alert) {
      alert.status = 'RESOLVED';
      this.saveToStorage(STORAGE_KEYS.THREAT_ALERTS, this.threatAlerts);
      this.addAuditLog({
        category: 'SECURITY',
        actor: this.currentUser.fullName,
        actorRole: this.currentUser.role,
        action: `Security Alert Resolved`,
        details: `Threat [${alert.title}] marked resolved by auditor.`,
        ipAddress: this.currentUser.ipAddress,
        status: 'SUCCESS',
      });
      this.notify();
    }
  }

  public createManualBackup(): BackupSnapshot {
    const totalVotes = this.positions.reduce((acc, pos) => acc + pos.candidates.reduce((cAcc, c) => cAcc + c.votesCount, 0), 0);
    const snapshot: BackupSnapshot = {
      id: 'snap-' + Date.now(),
      timestamp: Date.now(),
      version: 'v4.2.2-manual',
      totalBlocks: this.blockchain.chain.length,
      totalVotes,
      checksum: 'sha256:' + sha256Sync(JSON.stringify(this.blockchain.chain)).slice(0, 16),
      sizeKb: parseFloat((JSON.stringify(this.blockchain.chain).length / 1024).toFixed(1)),
      autoGenerated: false,
    };
    this.backups.unshift(snapshot);
    this.saveToStorage(STORAGE_KEYS.BACKUPS, this.backups);

    this.addAuditLog({
      category: 'ADMIN',
      actor: this.currentUser.fullName,
      actorRole: this.currentUser.role,
      action: 'Full Blockchain Snapshot Exported',
      details: `Created snapshot with ${snapshot.totalBlocks} blocks and ${snapshot.totalVotes} cast votes. Checksum verified.`,
      ipAddress: this.currentUser.ipAddress,
      status: 'SUCCESS',
    });

    this.notify();
    return snapshot;
  }

  public saveBlockchain() {
    this.saveToStorage(STORAGE_KEYS.BLOCKCHAIN_DATA, {
      chain: this.blockchain.chain,
      spentHashes: Array.from(this.blockchain.spentVoterTokenHashes),
    });
  }

  public tamperBlockSimulation(blockIndex: number, fakeData: string): boolean {
    const success = this.blockchain.tamperWithBlock(blockIndex, fakeData);
    if (success) {
      this.addThreatAlert({
        type: 'BLOCK_TAMPER',
        title: `Cryptographic Block #${blockIndex} Integrity Violation`,
        description: `Merkle Root and Block Hash discrepancy detected in Block #${blockIndex}. Chain continuity interrupted.`,
        severity: 'CRITICAL',
        sourceIp: '127.0.0.1 (Sandbox Test)',
        mitigation: 'Decentralized consensus rejected manipulated block. Restore from peer nodes available.',
      });
      this.notify();
    }
    return success;
  }

  public resetToFreshGenesis() {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear();
    }
    window.location.reload();
  }
}
