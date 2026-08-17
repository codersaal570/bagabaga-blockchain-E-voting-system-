import React, { useState } from 'react';
import { 
  Blocks, 
  Search, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Cpu, 
  Layers, 
  Key, 
  Copy, 
  Check, 
  Lock, 
  Activity, 
  Fingerprint, 
  RefreshCw, 
  ArrowRight,
  Sparkles,
  Server,
  Zap
} from 'lucide-react';
import { BlockchainBlock, BlockchainTransaction, ValidatorNode } from '../types';
import { truncateHash } from '../lib/crypto';
import { CampusVotingBlockchain } from '../lib/blockchain';

interface BlockchainExplorerProps {
  blockchain: CampusVotingBlockchain;
  onTamperBlock: (blockIndex: number, fakeSummary: string) => boolean;
  onResetChain: () => void;
  initialSearchQuery?: string;
}

export const BlockchainExplorer: React.FC<BlockchainExplorerProps> = ({
  blockchain,
  onTamperBlock,
  onResetChain,
  initialSearchQuery = '',
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [searchResult, setSearchResult] = useState<any>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [expandedBlockIndex, setExpandedBlockIndex] = useState<number | null>(blockchain.chain.length - 1);
  const [selectedTx, setSelectedTx] = useState<BlockchainTransaction | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [isSimulatingTamper, setIsSimulatingTamper] = useState(false);
  const [tamperSuccessMsg, setTamperSuccessMsg] = useState<string | null>(null);

  // Validate chain integrity
  const chainValidation = blockchain.validateChain();

  const handleSearchReceipt = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setHasSearched(true);
    const result = blockchain.findReceiptProof(searchQuery.trim());
    setSearchResult(result);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleTriggerTamper = (blockIndex: number) => {
    setIsSimulatingTamper(true);
    setTimeout(() => {
      onTamperBlock(blockIndex, 'TAMPERED_VOTE: Candidate Injected by Rogue Node');
      setIsSimulatingTamper(false);
      setTamperSuccessMsg(`Block #${blockIndex} has been intentionally modified to simulate a malicious database injection.`);
    }, 500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Ledger Overview Banner */}
      <div className="rounded-2xl bg-slate-900 text-white p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono border border-emerald-500/20">
              <Blocks className="w-3.5 h-3.5 text-emerald-400" />
              <span>Public Merkle DAG & Proof-of-Authority Consensus</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Decentralized Campus Blockchain Ledger
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Every single ballot cast by eligible students is cryptographically signed, hashed with SHA-256, grouped into Merkle trees, and sealed across university witness nodes.
            </p>
          </div>

          {/* Chain Integrity Live Badge */}
          <div className={`p-4 rounded-xl border text-xs min-w-[260px] ${
            chainValidation.isValid
              ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
              : 'bg-rose-950/70 border-rose-700 text-rose-200 animate-pulse'
          }`}>
            <div className="flex items-center gap-2 font-bold text-sm">
              {chainValidation.isValid ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="text-emerald-400 font-black">Chain Integrity: 100% VALID</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                  <span className="text-rose-400 font-black">TAMPER DETECTED: INVALID CHAIN</span>
                </>
              )}
            </div>
            <p className="text-[11px] mt-1 text-slate-300">
              {chainValidation.isValid
                ? 'All SHA-256 blocks chained consecutively with 0 mismatches.'
                : chainValidation.errorDetails}
            </p>
            {!chainValidation.isValid && (
              <button
                onClick={onResetChain}
                className="mt-2.5 w-full py-1.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Restore Clean Chain from Node Consensus
              </button>
            )}
          </div>
        </div>

        {/* Live Search & Receipt Verification Tool */}
        <div className="pt-4 border-t border-slate-800">
          <form onSubmit={handleSearchReceipt} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="receipt-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter your Ballot Receipt Hash (e.g. 0x88c2... or tx-vote-1001) to verify on-chain inclusion"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500 font-mono"
              />
            </div>
            <button
              id="submit-receipt-search-btn"
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shadow-[0_0_15px_rgba(16,185,129,0.25)] transition-all cursor-pointer shrink-0 flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verify Receipt Hash</span>
            </button>
          </form>

          {/* Search Result Box */}
          {hasSearched && (
            <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-3 animate-in fade-in">
              {searchResult && searchResult.found ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Receipt Verified in Block #{searchResult.block.index} ({searchResult.confirmations} Confirmations)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-500 block">Transaction ID:</span>
                      <span className="font-mono text-cyan-400">{searchResult.transaction.id}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-500 block">Validated By Node:</span>
                      <span className="text-slate-200">{searchResult.block.validatorNode}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-500 block">Merkle Root:</span>
                      <span className="font-mono text-slate-400">{truncateHash(searchResult.block.merkleRoot, 12, 10)}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-500 block">Demographic Metadata:</span>
                      <span className="text-slate-300">{searchResult.transaction.metadata.department} ({searchResult.transaction.metadata.classStanding})</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-400 font-medium">
                  <AlertTriangle className="w-4 h-4" />
                  <span>No on-chain transaction matching query "{searchQuery}". Ensure you have entered the exact 0x hash.</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Decentralized Validator Node Network Status */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-emerald-400" />
              Decentralized Campus Validator Mesh (4 Nodes)
            </h3>
            <p className="text-xs text-slate-400">
              Distributed Byzantine-Fault Tolerant witness network
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full font-semibold border border-emerald-500/20">
            Quorum 100% Synced
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {blockchain.nodes.map((node) => (
            <div
              key={node.id}
              className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                <span className="text-[10px] font-mono text-slate-400">{node.latencyMs}ms ping</span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">
                  {node.name}
                </h4>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                  {node.host}
                </p>
              </div>
              <div className="text-[11px] text-slate-300 pt-1 border-t border-slate-800 flex justify-between">
                <span>Blocks Signed:</span>
                <span className="font-mono font-bold text-emerald-400">{node.blocksValidated}</span>
              </div>
              <div className="text-[10px] text-slate-500 truncate">
                Loc: {node.location}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visual Blockchain Timeline Blocks */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Blocks className="w-5 h-5 text-emerald-400" />
              Cryptographic Block Chain Explorer ({blockchain.chain.length} Blocks)
            </h3>
            <p className="text-xs text-slate-400">
              Click on any block to inspect its header, Merkle root, and embedded encrypted transactions
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="tamper-demo-button"
              disabled={isSimulatingTamper}
              onClick={() => handleTriggerTamper(Math.min(1, blockchain.chain.length - 1))}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-300 bg-rose-950/40 border border-rose-800/80 hover:bg-rose-900/40 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-rose-400" />
              <span>Simulate Malicious Block Injection</span>
            </button>
          </div>
        </div>

        {tamperSuccessMsg && (
          <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800 text-amber-200 text-xs flex items-center justify-between">
            <span>{tamperSuccessMsg} Notice the red warning badge above verifying tamper detection!</span>
            <button onClick={() => setTamperSuccessMsg(null)} className="text-xs font-bold underline ml-2 cursor-pointer">Dismiss</button>
          </div>
        )}

        {/* Chain blocks vertical stream */}
        <div className="space-y-4">
          {blockchain.chain.map((block) => {
            const isExpanded = expandedBlockIndex === block.index;
            const isGenesis = block.index === 0;

            return (
              <div
                key={block.index}
                id={`blockchain-block-${block.index}`}
                className={`rounded-2xl border transition-all ${
                  !block.isValid
                    ? 'border-rose-600 bg-rose-950/25 shadow-[0_0_20px_rgba(225,29,72,0.2)]'
                    : isExpanded
                    ? 'border-emerald-500/50 bg-slate-900 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                    : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                }`}
              >
                {/* Block Header Summary Row */}
                <div
                  onClick={() => setExpandedBlockIndex(isExpanded ? null : block.index)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-sm ${
                      !block.isValid
                        ? 'bg-rose-600 text-white'
                        : isGenesis
                        ? 'bg-purple-600 text-white'
                        : 'bg-emerald-500 text-slate-950 font-black'
                    }`}>
                      #{block.index}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">
                          {isGenesis ? 'Genesis Block (Root Certificate)' : `Block #${block.index}`}
                        </h4>
                        {!block.isValid && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-600 text-white animate-pulse">
                            CORRUPTED / TAMPERED
                          </span>
                        )}
                        <span className="text-xs text-slate-400">
                          • {block.transactions.length} Transactions
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>Hash: {truncateHash(block.hash, 10, 8)}</span>
                        <span>•</span>
                        <span>Validator: {block.validatorNode}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                    <span>{new Date(block.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                    <span className="text-emerald-400 font-semibold">
                      {isExpanded ? 'Collapse' : 'Inspect Block'}
                    </span>
                  </div>
                </div>

                {/* Expanded Details Drawer */}
                {isExpanded && (
                  <div className="p-5 border-t border-slate-800 bg-slate-950/60 space-y-4">
                    {/* Cryptographic Parameters Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                        <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Previous Block Hash</span>
                        <div className="font-mono text-[11px] text-slate-200 break-all select-all flex items-center justify-between">
                          <span>{block.previousHash}</span>
                          <button onClick={() => handleCopy(block.previousHash)} className="p-1 hover:text-emerald-400 cursor-pointer">
                            {copiedHash === block.previousHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-500" />}
                          </button>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                        <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Merkle Root DAG</span>
                        <div className="font-mono text-[11px] text-cyan-400 break-all select-all flex items-center justify-between">
                          <span>{block.merkleRoot}</span>
                          <button onClick={() => handleCopy(block.merkleRoot)} className="p-1 hover:text-emerald-400 cursor-pointer">
                            {copiedHash === block.merkleRoot ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-500" />}
                          </button>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                        <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">PoA Nonce / Mining Proof</span>
                        <div className="font-mono text-[11px] text-purple-400">
                          Nonce: {block.nonce} • Diff: 0x0000FFFF
                        </div>
                      </div>
                    </div>

                    {/* Embedded Transactions Table */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                        Transactions Sealed in Block #{block.index}
                      </div>

                      <div className="space-y-2">
                        {block.transactions.map((tx) => (
                          <div
                            key={tx.id}
                            id={`tx-row-${tx.id}`}
                            className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  tx.type === 'VOTE_CAST'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                                }`}>
                                  {tx.type}
                                </span>
                                <span className="font-mono text-slate-300 font-semibold">{tx.id}</span>
                              </div>
                              <span className="font-mono text-[11px] text-slate-400">
                                Receipt: {truncateHash(tx.ballotReceiptHash, 10, 8)}
                              </span>
                            </div>

                            <div className="text-[11px] text-slate-300 space-y-1">
                              <div><span className="font-semibold text-slate-500">Encrypted Payload:</span> <code className="font-mono bg-slate-950 border border-slate-800 text-slate-300 px-1.5 py-0.5 rounded">{tx.encryptedData}</code></div>
                              <div><span className="font-semibold text-slate-500">Zero-Knowledge Voter Token:</span> <code className="font-mono bg-slate-950 border border-slate-800 text-emerald-400 px-1.5 py-0.5 rounded">{tx.voterTokenHash}</code></div>
                              <div><span className="font-semibold text-slate-500">Demographics:</span> {tx.metadata.department} ({tx.metadata.classStanding})</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
