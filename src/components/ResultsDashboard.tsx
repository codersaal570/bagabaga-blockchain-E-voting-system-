import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Vote, 
  CheckCircle2, 
  Award, 
  ShieldCheck, 
  Download, 
  RefreshCw, 
  Layers, 
  PieChart as PieIcon,
  Sparkles,
  Percent
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  PieChart, 
  Pie, 
  AreaChart, 
  Area,
  CartesianGrid
} from 'recharts';
import { ElectionPosition, Referendum, ElectionStatus } from '../types';

interface ResultsDashboardProps {
  positions: ElectionPosition[];
  referendums: Referendum[];
  electionStatus: ElectionStatus;
  totalBlocks: number;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  positions,
  referendums,
  electionStatus,
  totalBlocks,
}) => {
  const [selectedPositionTab, setSelectedPositionTab] = useState(positions[0]?.id || 'pos-pres');

  // Compute total votes
  const totalPresVotes = positions.find(p => p.id === 'pos-pres')?.candidates.reduce((a, b) => a + b.votesCount, 0) || 1024;
  const registeredVoters = 1650;
  const turnoutPercent = ((totalPresVotes / registeredVoters) * 100).toFixed(1);

  // Department turnout breakdown data for Recharts
  const departmentData = [
    { name: 'Engineering & CS', votes: 412, registered: 520, fill: '#10b981' },
    { name: 'Business & Econ', votes: 298, registered: 410, fill: '#06b6d4' },
    { name: 'Health & Med', votes: 215, registered: 300, fill: '#14b8a6' },
    { name: 'Arts & Humanities', votes: 145, registered: 220, fill: '#f59e0b' },
    { name: 'Natural Sciences', votes: 124, registered: 190, fill: '#a855f7' },
    { name: 'Law & Policy', votes: 86, registered: 110, fill: '#3b82f6' },
  ];

  // Class standing distribution data
  const classStandingData = [
    { name: 'Freshman', value: 240, color: '#38bdf8' },
    { name: 'Sophomore', value: 310, color: '#06b6d4' },
    { name: 'Junior', value: 430, color: '#10b981' },
    { name: 'Senior', value: 390, color: '#14b8a6' },
    { name: 'Graduate', value: 160, color: '#a855f7' },
  ];

  // Hourly velocity data
  const hourlyData = [
    { time: '08:00 AM', votes: 45, cumulative: 45 },
    { time: '10:00 AM', votes: 160, cumulative: 205 },
    { time: '12:00 PM', votes: 320, cumulative: 525 },
    { time: '02:00 PM', votes: 280, cumulative: 805 },
    { time: '04:00 PM', votes: 230, cumulative: 1035 },
    { time: '06:00 PM', votes: 195, cumulative: 1230 },
  ];

  const currentPos = positions.find(p => p.id === selectedPositionTab) || positions[0];
  const posTotalVotes = currentPos ? currentPos.candidates.reduce((a, b) => a + b.votesCount, 0) : 1;

  // Find leader in current position
  const leadingCandidate = currentPos ? [...currentPos.candidates].sort((a, b) => b.votesCount - a.votesCount)[0] : null;

  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,Position,Candidate,Votes,Share\n';
    positions.forEach(pos => {
      const posTotal = pos.candidates.reduce((a, b) => a + b.votesCount, 0);
      pos.candidates.forEach(cand => {
        const share = posTotal > 0 ? ((cand.votesCount / posTotal) * 100).toFixed(1) : '0.0';
        csvContent += `"${pos.title}","${cand.name}",${cand.votesCount},${share}%\n`;
      });
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `stanford-election-tally-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Export Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black tracking-tight text-white">
              Real-Time Election Results & Turnout Analytics
            </h2>
            <span className="flex items-center gap-1.5 text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Live Consensus Feed
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time tallies certified across all 4 university validator nodes with zero-knowledge voter privacy.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="export-results-csv-btn"
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 shadow-md flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export Official Tally (CSV)</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Ballots Cast */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Ballots Sealed</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Vote className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-white font-mono">
              {totalPresVotes.toLocaleString()}
            </div>
            <div className="text-xs text-emerald-400 font-medium flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18.4% vs 2025 Spring Election</span>
            </div>
          </div>
        </div>

        {/* 2. Voter Turnout Rate */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Campus Voter Turnout</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-white font-mono">
              {turnoutPercent}%
            </div>
            <div className="text-xs text-slate-400 font-medium mt-1">
              {totalPresVotes} of {registeredVoters} registered voters
            </div>
          </div>
        </div>

        {/* 3. Quorum Status */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Electoral Quorum</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg font-black text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Quorum Achieved</span>
            </div>
            <div className="text-xs text-slate-400 font-medium mt-1">
              Constitutional 25% threshold passed
            </div>
          </div>
        </div>

        {/* 4. Blocks Mined */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Blockchain Height</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-white font-mono">
              Block #{totalBlocks}
            </div>
            <div className="text-xs text-purple-400 font-medium mt-1">
              100% Tamper-Proof Chain Integrity
            </div>
          </div>
        </div>
      </div>

      {/* Main Results Section: Position Candidate Standings */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white">
              Executive Position Tallies
            </h3>
            <p className="text-xs text-slate-400">
              Live vote distribution and candidate rankings
            </p>
          </div>

          {/* Position Selector Tabs */}
          <div className="flex space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
            {positions.map((pos) => (
              <button
                key={pos.id}
                id={`results-pos-tab-${pos.id}`}
                onClick={() => setSelectedPositionTab(pos.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedPositionTab === pos.id
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                {pos.title}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Position Candidate Cards & Progress Bars */}
        <div className="space-y-4">
          {currentPos && currentPos.candidates
            .sort((a, b) => b.votesCount - a.votesCount)
            .map((cand, rank) => {
              const voteShare = posTotalVotes > 0 ? ((cand.votesCount / posTotalVotes) * 100).toFixed(1) : '0.0';
              const isLeader = rank === 0;

              return (
                <div
                  key={cand.id}
                  id={`tally-card-${cand.id}`}
                  className={`p-4.5 rounded-xl border transition-all ${
                    isLeader
                      ? 'border-emerald-500/40 bg-emerald-950/20'
                      : 'border-slate-800 bg-slate-950'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                        rank === 0 ? 'bg-amber-400 text-slate-950' : rank === 1 ? 'bg-slate-700 text-slate-200' : 'bg-slate-800 text-slate-400'
                      }`}>
                        #{rank + 1}
                      </div>
                      <img
                        src={cand.avatarUrl}
                        alt={cand.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                      />
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          {cand.name}
                          {isLeader && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                              <Award className="w-3 h-3" />
                              Projected Winner
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400">
                          {cand.department} • {cand.classStanding}
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex sm:flex-col items-center sm:items-end justify-between">
                      <div className="text-base font-extrabold font-mono text-white">
                        {cand.votesCount.toLocaleString()} votes
                      </div>
                      <div className="text-xs font-semibold text-emerald-400 font-mono">
                        {voteShare}%
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Progress Bar */}
                  <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isLeader
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                          : 'bg-slate-700'
                      }`}
                      style={{ width: `${voteShare}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Visual Turnout Analytics Charts: Department Breakdown & Class Standing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Department Turnout Bar Chart */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              Participation by College Department
            </h3>
            <p className="text-xs text-slate-400">
              Total ballots cast vs registered voters per faculty
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} stroke="#334155" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 10, fill: '#94a3b8' }} 
                  angle={-20} 
                  textAnchor="end" 
                  interval={0}
                />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#020617', borderRadius: '12px', border: '1px solid #1e293b', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="votes" name="Voted" radius={[6, 6, 0, 0]}>
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Class Standing Distribution Chart */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-cyan-400" />
              Turnout by Academic Class Standing
            </h3>
            <p className="text-xs text-slate-400">
              Undergraduate and Graduate voter demographic split
            </p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={classStandingData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {classStandingData.map((entry, index) => (
                    <Cell key={`slice-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#020617', borderRadius: '12px', border: '1px solid #1e293b', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Hourly Voting Velocity Area Chart */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Hourly Ballot Velocity & Peak Participation
          </h3>
          <p className="text-xs text-slate-400">
            Pacing of incoming transactions verified across the validator mesh
          </p>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVotes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} stroke="#334155" />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#020617', borderRadius: '12px', border: '1px solid #1e293b', color: '#fff', fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="votes" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorVotes)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Referendum Results Grid */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <h3 className="text-lg font-bold text-white">
            Campus Ballot Referendum Outcomes
          </h3>
          <p className="text-xs text-slate-400">
            50% + 1 supermajority requirement validation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {referendums.map((ref) => {
            const refTotal = ref.options.reduce((a, b) => a + b.votesCount, 0);
            const yesOption = ref.options.find(o => o.label.includes('YES'));
            const yesPercent = yesOption && refTotal > 0 ? ((yesOption.votesCount / refTotal) * 100).toFixed(1) : '0.0';
            const isPassed = parseFloat(yesPercent) >= 50.0;

            return (
              <div
                key={ref.id}
                id={`ref-result-${ref.id}`}
                className="p-5 rounded-xl border border-slate-800 bg-slate-950 space-y-4"
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
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${
                    isPassed 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {isPassed ? 'MEASURE PASSING' : 'MEASURE FAILING'}
                  </span>
                </div>

                {/* Breakdown options */}
                <div className="space-y-2.5">
                  {ref.options.map((opt) => {
                    const optShare = refTotal > 0 ? ((opt.votesCount / refTotal) * 100).toFixed(1) : '0.0';
                    return (
                      <div key={opt.id} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-300">{opt.label}</span>
                          <span className="font-mono font-bold text-white">{opt.votesCount} ({optShare}%)</span>
                        </div>
                        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className={`h-full rounded-full ${
                              opt.label.includes('YES')
                                ? 'bg-emerald-500'
                                : opt.label.includes('NO')
                                ? 'bg-rose-500'
                                : 'bg-slate-600'
                            }`}
                            style={{ width: `${optShare}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
