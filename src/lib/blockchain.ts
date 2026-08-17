import { BlockchainBlock, BlockchainTransaction, ValidatorNode } from '../types';
import { computeMerkleRoot, sha256Sync } from './crypto';

export class CampusVotingBlockchain {
  public chain: BlockchainBlock[];
  public pendingTransactions: BlockchainTransaction[];
  public spentVoterTokenHashes: Set<string>;
  public nodes: ValidatorNode[];

  constructor(initialNodes: ValidatorNode[]) {
    this.nodes = initialNodes;
    this.pendingTransactions = [];
    this.spentVoterTokenHashes = new Set<string>();
    this.chain = [this.createGenesisBlock()];
    this.seedInitialHistoricalBlocks();
  }

  private createGenesisBlock(): BlockchainBlock {
    const genesisTx: BlockchainTransaction = {
      id: 'tx-genesis-000',
      type: 'SYSTEM_CONFIG',
      ballotReceiptHash: '0x000000000000000000000000000000000000000000000000',
      voterTokenHash: 'GENESIS_AUTHORITY_SEED',
      encryptedData: 'INITIALIZE_STANFORD_DECENTRALIZED_CAMPUS_BALLOT_LEDGER_2026',
      metadata: {
        department: 'Engineering & Computer Science',
        classStanding: 'Senior',
        selectionsSummary: ['Election Genesis Initialized by Electoral Commission'],
      },
      timestamp: 1771238400000,
      validatorSignature: 'SIG_ED25519_CAMPUS_GENESIS_ROOT',
    };

    const merkleRoot = computeMerkleRoot([genesisTx.id]);
    const previousHash = '0000000000000000000000000000000000000000000000000000000000000000';
    const timestamp = 1771238400000;
    const nonce = 4281;
    const hash = this.calculateBlockHash(0, previousHash, timestamp, merkleRoot, nonce);

    return {
      index: 0,
      timestamp,
      transactions: [genesisTx],
      previousHash,
      hash,
      nonce,
      merkleRoot,
      validatorNode: 'CS Dept Validator Node #1',
      isValid: true,
    };
  }

  private seedInitialHistoricalBlocks() {
    // Block #1: Candidate slate registration
    const txBlock1: BlockchainTransaction[] = [
      {
        id: 'tx-cand-reg-01',
        type: 'CANDIDATE_REGISTERED',
        ballotReceiptHash: '0x9a8f7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a',
        voterTokenHash: 'COMMISSION_REG_OFFICIAL',
        encryptedData: 'ENCRYPTED_CANDIDATE_CERTIFICATION_PRESIDENT_MAYA_CHEN',
        metadata: {
          department: 'Engineering & Computer Science',
          classStanding: 'Junior',
          selectionsSummary: ['Candidate Certified: Maya Chen for Student Body President'],
        },
        timestamp: Date.now() - 1000 * 60 * 180,
        validatorSignature: 'SIG_ED25519_CS_DEPT_MINER_01',
      },
      {
        id: 'tx-cand-reg-02',
        type: 'CANDIDATE_REGISTERED',
        ballotReceiptHash: '0x3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d',
        voterTokenHash: 'COMMISSION_REG_OFFICIAL',
        encryptedData: 'ENCRYPTED_CANDIDATE_CERTIFICATION_PRESIDENT_MARCUS_VANCE',
        metadata: {
          department: 'Business & Economics',
          classStanding: 'Senior',
          selectionsSummary: ['Candidate Certified: Marcus Vance for Student Body President'],
        },
        timestamp: Date.now() - 1000 * 60 * 175,
        validatorSignature: 'SIG_ED25519_STUDENT_UNION_02',
      },
    ];

    const block1Merkle = computeMerkleRoot(txBlock1.map(t => t.id));
    const block1PrevHash = this.chain[0].hash;
    const block1Time = Date.now() - 1000 * 60 * 170;
    const block1Nonce = 9812;
    const block1Hash = this.calculateBlockHash(1, block1PrevHash, block1Time, block1Merkle, block1Nonce);

    this.chain.push({
      index: 1,
      timestamp: block1Time,
      transactions: txBlock1,
      previousHash: block1PrevHash,
      hash: block1Hash,
      nonce: block1Nonce,
      merkleRoot: block1Merkle,
      validatorNode: 'Student Union Governance Node #2',
      isValid: true,
    });

    // Block #2: Early voter ballots batch
    const sampleToken1 = 'zk-tok_7f9a12c4b8e04139a6729014589d3112';
    const sampleToken2 = 'zk-tok_88b193ea77c4015f6291a03958bc1209';
    this.spentVoterTokenHashes.add(sampleToken1);
    this.spentVoterTokenHashes.add(sampleToken2);

    const txBlock2: BlockchainTransaction[] = [
      {
        id: 'tx-vote-1001',
        type: 'VOTE_CAST',
        ballotReceiptHash: '0x88c2f10b7a449103e91982bca01e7456d2039abf',
        voterTokenHash: sampleToken1,
        encryptedData: 'AES_GCM_256_PAYLOAD:f93a8...e420b9 (Verified Blind Token)',
        metadata: {
          department: 'Engineering & Computer Science',
          classStanding: 'Senior',
          selectionsSummary: ['President: Maya Chen', 'VP: Devon Patel', 'Treasurer: Zachary Thornton', 'Prop A: YES', 'Prop B: YES'],
        },
        timestamp: Date.now() - 1000 * 60 * 95,
        validatorSignature: 'SIG_ED25519_DEAN_INTEGRITY_03',
      },
      {
        id: 'tx-vote-1002',
        type: 'VOTE_CAST',
        ballotReceiptHash: '0x44f910a29b3c7e81048201aefbc819230491823a',
        voterTokenHash: sampleToken2,
        encryptedData: 'AES_GCM_256_PAYLOAD:a194c...1028fa (Verified Blind Token)',
        metadata: {
          department: 'Business & Economics',
          classStanding: 'Junior',
          selectionsSummary: ['President: Marcus Vance', 'VP: Sophia Kim', 'Treasurer: Zachary Thornton', 'Prop A: YES', 'Prop B: YES'],
        },
        timestamp: Date.now() - 1000 * 60 * 90,
        validatorSignature: 'SIG_ED25519_LIB_VAULT_04',
      },
    ];

    const block2Merkle = computeMerkleRoot(txBlock2.map(t => t.id));
    const block2PrevHash = this.chain[1].hash;
    const block2Time = Date.now() - 1000 * 60 * 85;
    const block2Nonce = 15304;
    const block2Hash = this.calculateBlockHash(2, block2PrevHash, block2Time, block2Merkle, block2Nonce);

    this.chain.push({
      index: 2,
      timestamp: block2Time,
      transactions: txBlock2,
      previousHash: block2PrevHash,
      hash: block2Hash,
      nonce: block2Nonce,
      merkleRoot: block2Merkle,
      validatorNode: 'Dean of Student Affairs Integrity Node #3',
      isValid: true,
    });
  }

  public calculateBlockHash(
    index: number,
    previousHash: string,
    timestamp: number,
    merkleRoot: string,
    nonce: number
  ): string {
    const raw = `${index}|${previousHash}|${timestamp}|${merkleRoot}|${nonce}`;
    return sha256Sync(raw);
  }

  public getLatestBlock(): BlockchainBlock {
    return this.chain[this.chain.length - 1];
  }

  /**
   * Adds a new ballot vote to the mempool and optionally mines a block when threshold reached or requested.
   */
  public addTransaction(transaction: BlockchainTransaction): { success: boolean; message: string } {
    // Check for double spending via zero-knowledge token hash
    if (transaction.type === 'VOTE_CAST' && this.spentVoterTokenHashes.has(transaction.voterTokenHash)) {
      return {
        success: false,
        message: 'DOUBLE_SPEND_REJECTED: This blind voter token has already cast a ballot in the blockchain ledger.',
      };
    }

    this.pendingTransactions.push(transaction);

    if (transaction.type === 'VOTE_CAST') {
      this.spentVoterTokenHashes.add(transaction.voterTokenHash);
    }

    // Auto-mine every 2 transactions for snappy real-time responsiveness
    if (this.pendingTransactions.length >= 1) {
      this.minePendingTransactions();
    }

    return { success: true, message: 'Transaction queued and mined into decentralized block.' };
  }

  public minePendingTransactions(validatorNodeName?: string): BlockchainBlock | null {
    if (this.pendingTransactions.length === 0) {
      return null;
    }

    const previousBlock = this.getLatestBlock();
    const newIndex = previousBlock.index + 1;
    const timestamp = Date.now();
    const txList = [...this.pendingTransactions];
    const merkleRoot = computeMerkleRoot(txList.map(t => t.id));

    // Choose validator node cyclically
    const chosenNode = validatorNodeName || this.nodes[newIndex % this.nodes.length].name;

    // Proof-of-Authority Nonce generation
    let nonce = 1000;
    let hash = this.calculateBlockHash(newIndex, previousBlock.hash, timestamp, merkleRoot, nonce);

    const newBlock: BlockchainBlock = {
      index: newIndex,
      timestamp,
      transactions: txList,
      previousHash: previousBlock.hash,
      hash,
      nonce,
      merkleRoot,
      validatorNode: chosenNode,
      isValid: true,
    };

    this.chain.push(newBlock);
    this.pendingTransactions = [];

    // Increment node block counter
    const nodeObj = this.nodes.find(n => n.name === chosenNode);
    if (nodeObj) {
      nodeObj.blocksValidated += 1;
    }

    return newBlock;
  }

  /**
   * Validates the cryptographic integrity of the entire chain.
   * Returns validation status, invalid block index (if any), and reason.
   */
  public validateChain(): { isValid: boolean; invalidIndex: number | null; errorDetails: string | null } {
    for (let i = 0; i < this.chain.length; i++) {
      const current = this.chain[i];

      // Verify Genesis block integrity
      if (i === 0) {
        const recalculatedGenesisHash = this.calculateBlockHash(
          current.index,
          current.previousHash,
          current.timestamp,
          current.merkleRoot,
          current.nonce
        );
        if (current.hash !== recalculatedGenesisHash) {
          current.isValid = false;
          return {
            isValid: false,
            invalidIndex: 0,
            errorDetails: 'Genesis Block hash is corrupted or modified.',
          };
        }
        current.isValid = true;
        continue;
      }

      const previous = this.chain[i - 1];

      // 1. Verify previous hash chaining
      if (current.previousHash !== previous.hash) {
        current.isValid = false;
        return {
          isValid: false,
          invalidIndex: i,
          errorDetails: `Block #${current.index} previousHash (${current.previousHash.slice(0, 10)}...) does not match Block #${previous.index} actual hash (${previous.hash.slice(0, 10)}...). Cryptographic chain is broken!`,
        };
      }

      // 2. Verify Merkle Root integrity
      const recalculatedMerkle = computeMerkleRoot(current.transactions.map(t => t.id));
      if (current.merkleRoot !== recalculatedMerkle) {
        current.isValid = false;
        return {
          isValid: false,
          invalidIndex: i,
          errorDetails: `Block #${current.index} Merkle Root is invalid. One or more transactions inside the block were altered or tampered with!`,
        };
      }

      // 3. Verify block self-hash
      const recalculatedHash = this.calculateBlockHash(
        current.index,
        current.previousHash,
        current.timestamp,
        current.merkleRoot,
        current.nonce
      );

      if (current.hash !== recalculatedHash) {
        current.isValid = false;
        return {
          isValid: false,
          invalidIndex: i,
          errorDetails: `Block #${current.index} self-hash mismatch. Recalculated hash does not match stored block header.`,
        };
      }

      current.isValid = true;
    }

    return { isValid: true, invalidIndex: null, errorDetails: null };
  }

  /**
   * Tamper with a block for security audit / demonstration sandbox
   */
  public tamperWithBlock(blockIndex: number, alteredVoteSummary: string): boolean {
    if (blockIndex < 0 || blockIndex >= this.chain.length) return false;
    const block = this.chain[blockIndex];
    if (block.transactions.length > 0) {
      block.transactions[0].metadata.selectionsSummary = [alteredVoteSummary];
      block.transactions[0].encryptedData = 'MALICIOUS_TAMPERED_DATA_INJECTED';
      // Mark as tampered
      this.validateChain();
      return true;
    }
    return false;
  }

  /**
   * Search for a transaction and proof by ballot receipt hash
   */
  public findReceiptProof(receiptHash: string): {
    found: boolean;
    block?: BlockchainBlock;
    transaction?: BlockchainTransaction;
    merkleProof?: string[];
    confirmations?: number;
  } {
    const cleanHash = receiptHash.trim().toLowerCase();
    for (const block of this.chain) {
      for (const tx of block.transactions) {
        if (tx.ballotReceiptHash.toLowerCase() === cleanHash || tx.id.toLowerCase() === cleanHash) {
          const confirmations = this.chain.length - block.index;
          return {
            found: true,
            block,
            transaction: tx,
            merkleProof: [block.merkleRoot, block.previousHash, block.hash],
            confirmations,
          };
        }
      }
    }
    return { found: false };
  }
}
