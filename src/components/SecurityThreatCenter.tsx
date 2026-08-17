import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  FileText, 
  Filter, 
  Download, 
  Search, 
  Lock, 
  Zap, 
  Eye, 
  Check, 
  Copy, 
  Radio, 
  Flame,
  ShieldCheck
} from 'lucide-react';
import { ThreatAlert, AuditLogEntry, AuditLogCategory, UserAccount } from '../types';
import { truncateHash } from '../lib/crypto';

interface SecurityThreatCenterProps {
  threatAlerts: ThreatAlert[];
  auditLogs: AuditLogEntry[];
  currentUser: UserAccount;
  onResolveThreat: (threatId: string) => void;
}

export const SecurityThreatCenter: React.FC<SecurityThreatCenterProps> = ({
  threatAlerts,
  auditLogs,
  currentUser,
  onResolveThreat,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [copiedLogHash, setCopiedLogHash] = useState<string | null>(null);

  const activeThreats = threatAlerts.filter(t => t.status === 'ACTIVE' || t.status === 'INVESTIGATING');

  const filteredLogs = auditLogs.filter(log => {
    const matchesCategory = selectedCategory === 'ALL' || log.category === selectedCategory;
    const matchesSearch = !logSearchQuery || 
      log.actor.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(logSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getSeverityBadge = (sev: ThreatAlert['severity']) => {
    switch (sev) {
      case 'CRITICAL':
        return <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded text-[10px] font-bold">CRITICAL</span>;
      case 'HIGH':
        return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-[10px] font-bold">HIGH</span>;
      case 'MEDIUM':
        return <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded text-[10px] font-bold">MEDIUM</span>;
      default:
        return <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded text-[10px] font-bold">LOW</span>;
    }
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedLogHash(hash);
    setTimeout(() => setCopiedLogHash(null), 2000);
  };

  const handleExportAuditLogs = () => {
    let csv = 'Timestamp,Category,Actor,Role,Action,Details,IP,Status,TamperProofHash\n';
    auditLogs.forEach(l => {
      csv += `"${new Date(l.timestamp).toISOString()}","${l.category}","${l.actor}","${l.actorRole}","${l.action}","${l.details.replace(/"/g, '""')}","${l.ipAddress}","${l.status}","${l.tamperProofHash}"\n`;
    });

    const encoded = encodeURI('data:text/csv;charset=utf-8,' + csv);
    const link = document.createElement('a');
    link.href = encoded;
    link.download = `compliance-audit-trail-${Date.now()}.csv`;
    link.click();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Threat Radar Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black tracking-tight text-white">
              Automated Threat Radar & Compliance Audit Trail
            </h2>
            {activeThreats.length > 0 ? (
              <span className="flex items-center gap-1 text-xs font-mono px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 font-bold border border-rose-500/20 animate-pulse">
                <Radio className="w-3.5 h-3.5" />
                {activeThreats.length} Active Anomaly Alerts
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Zero Active Threats
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time anomaly monitoring flagging brute-force logins, geo-velocity deviations, replay attacks, and blockchain mismatches.
          </p>
        </div>

        <button
          id="export-compliance-audit-btn"
          onClick={handleExportAuditLogs}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-200 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 shadow-xl flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Export Compliance Audit Report (CSV)</span>
        </button>
      </div>

      {/* Threat Detection Alerts Feed */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            Automated Threat Detection Engine Alerts ({threatAlerts.length})
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            Scanning 24/7 (Heuristic Engine v3.8)
          </span>
        </div>

        <div className="space-y-3">
          {threatAlerts.map((threat) => (
            <div
              key={threat.id}
              id={`threat-alert-card-${threat.id}`}
              className={`p-4 rounded-xl border transition-all ${
                threat.status === 'RESOLVED'
                  ? 'border-slate-800 bg-slate-950/50 opacity-60'
                  : threat.severity === 'CRITICAL'
                  ? 'border-rose-800/80 bg-rose-950/25 shadow-[0_0_15px_rgba(225,29,72,0.15)]'
                  : 'border-amber-800/80 bg-amber-950/25 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {getSeverityBadge(threat.severity)}
                  <h4 className="text-xs sm:text-sm font-bold text-white">
                    {threat.title}
                  </h4>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-mono text-slate-400">
                    {new Date(threat.timestamp).toLocaleTimeString()}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    threat.status === 'RESOLVED'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse'
                  }`}>
                    {threat.status}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 mt-2">
                {threat.description}
              </p>

              <div className="mt-3 pt-2.5 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="font-mono text-[11px] text-slate-400">
                  <span>Source IP: {threat.sourceIp}</span>
                  {threat.affectedAccount && (
                    <span className="ml-3 font-semibold text-emerald-400">
                      Target: {threat.affectedAccount}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">
                    Mitigation: <span className="font-medium text-slate-200">{threat.mitigation}</span>
                  </span>
                  {threat.status !== 'RESOLVED' && (
                    <button
                      id={`resolve-threat-btn-${threat.id}`}
                      onClick={() => onResolveThreat(threat.id)}
                      className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[11px] font-black transition-all cursor-pointer shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                    >
                      Acknowledge & Resolve
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Audit Logs Stream */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              Cryptographic System Audit Log Trail
            </h3>
            <p className="text-xs text-slate-400">
              Every authentication, ballot cast, admin parameter change, and node sync is hashed and chained
            </p>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="audit-log-search-input"
                type="text"
                value={logSearchQuery}
                onChange={(e) => setLogSearchQuery(e.target.value)}
                placeholder="Search audit logs..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div className="flex space-x-1 overflow-x-auto w-full sm:w-auto">
              {['ALL', 'AUTH', 'BALLOT', 'ADMIN', 'BLOCKCHAIN', 'SECURITY'].map((cat) => (
                <button
                  key={cat}
                  id={`filter-log-cat-${cat}`}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-emerald-500 text-slate-950 font-black shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950 text-slate-400">
                <th className="p-3 font-semibold">Timestamp</th>
                <th className="p-3 font-semibold">Category</th>
                <th className="p-3 font-semibold">Actor / Role</th>
                <th className="p-3 font-semibold">Action & Details</th>
                <th className="p-3 font-semibold">IP Address</th>
                <th className="p-3 font-semibold">Tamper-Proof Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-850 transition-colors">
                  <td className="p-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="p-3">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                      {log.category}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="font-semibold text-white">{log.actor}</div>
                    <div className="text-[10px] text-slate-400">{log.actorRole}</div>
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-slate-200">{log.action}</div>
                    <div className="text-slate-400 text-[11px]">{log.details}</div>
                  </td>
                  <td className="p-3 font-mono text-[11px] text-slate-400">
                    {log.ipAddress}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1 font-mono text-[10px] text-emerald-400">
                      <span>{truncateHash(log.tamperProofHash, 8, 6)}</span>
                      <button onClick={() => handleCopyHash(log.tamperProofHash)} className="hover:text-emerald-300 cursor-pointer">
                        {copiedLogHash === log.tamperProofHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-500" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
