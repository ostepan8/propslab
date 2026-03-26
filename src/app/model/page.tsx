'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api, ModelDetail } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Bet {
  date: string;
  player?: string;
  stat?: string;
  side: string;
  line?: number;
  actual?: number;
  odds: number;
  won: boolean;
  pnl: number;
  bet: number;
}

interface EquityData {
  model_name: string;
  summary: {
    total_bets: number; wins: number; losses: number;
    win_rate: number; total_pnl: number; total_wagered: number;
    roi_raw: number; roi_net: number; roi?: number;
    starting_bankroll: number; ending_bankroll: number;
  };
  bets: (Bet & { cumulative_pnl: number })[];
}

function ModelDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [model, setModel] = useState<ModelDetail | null>(null);
  const [equity, setEquity] = useState<EquityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) { setError('No model ID provided'); setLoading(false); return; }
    Promise.allSettled([
      api<ModelDetail>(`/models/${id}`, { auth: true }),
      api<EquityData>(`/models/${id}/equity`, { auth: true }),
    ]).then(([modelRes, equityRes]) => {
      if (modelRes.status === 'fulfilled') setModel(modelRes.value);
      else setError('Model not found');
      if (equityRes.status === 'fulfilled') setEquity(equityRes.value);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error || !model) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-950/50 border border-red-800 text-red-400 px-4 py-3 rounded-lg">{error || 'Model not found'}</div>
        <Link href="/models" className="text-green-400 hover:text-green-300 text-sm mt-4 inline-block">&larr; Back to Models</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link href="/models" className="text-green-400 hover:text-green-300 text-sm mb-6 inline-block">&larr; Back to Models</Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">{model.display_name}</h1>
          <p className="text-gray-400 text-sm mt-1">{model.description}</p>
        </div>
        <span className="px-3 py-1 text-sm rounded-full bg-gray-800 text-gray-400 self-start">
          {model.stat} · {model.architecture}
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Net ROI (after fees)" value={`${(model.roi_net * 100).toFixed(1)}%`} color={model.roi_net >= 0 ? 'text-green-400' : 'text-red-400'} />
        <StatCard label="Win Rate" value={`${(model.win_rate * 100).toFixed(1)}%`} />
        <StatCard label="Total Bets" value={model.total_bets.toString()} />
        <StatCard label="P-Value" value={model.p_value.toFixed(4)} color={model.p_value < 0.05 ? 'text-green-400' : 'text-yellow-400'} />
      </div>

      {/* Features */}
      {model.feature_description && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Features Used</h2>
          <div className="flex flex-wrap gap-2">
            {model.feature_description.split(', ').map((f, i) => (
              <span key={i} className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300">{f}</span>
            ))}
          </div>
        </div>
      )}

      {/* Equity Curve (from real lab data) */}
      {equity && equity.bets.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-2">Walk-Forward Backtest Results</h2>
          <p className="text-gray-400 text-sm mb-4">
            Every bet the model made in out-of-sample walk-forward testing. Kelly-criterion sizing.
          </p>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6 text-center">
              <div>
                <div className="text-lg font-bold text-white">{equity.summary.total_bets}</div>
                <div className="text-xs text-gray-500">Total Bets</div>
              </div>
              <div>
                <div className="text-lg font-bold text-white">{equity.summary.wins}-{equity.summary.losses}</div>
                <div className="text-xs text-gray-500">Record</div>
              </div>
              <div>
                <div className="text-lg font-bold text-white">{(equity.summary.win_rate * 100).toFixed(1)}%</div>
                <div className="text-xs text-gray-500">Win Rate</div>
              </div>
              <div>
                <div className={`text-lg font-bold ${equity.summary.total_pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${equity.summary.total_pnl >= 0 ? '+' : ''}{equity.summary.total_pnl.toFixed(2)}
                </div>
                <div className="text-xs text-gray-500">Total P&L</div>
              </div>
              <div>
                <div className={`text-lg font-bold ${(equity.summary.roi_net ?? equity.summary.roi ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {((equity.summary.roi_net ?? equity.summary.roi ?? 0) * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">Net ROI</div>
              </div>
            </div>
            <EquityChart bets={equity.bets} />
          </div>

          {/* Bet History Table */}
          <h3 className="text-md font-semibold text-white mb-3">Bet History ({equity.bets.length} bets)</h3>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-900 z-10">
                <tr className="border-b border-gray-800 text-gray-400">
                  <th className="text-left px-4 py-2 font-medium">Date</th>
                  <th className="text-left px-4 py-2 font-medium">Player</th>
                  <th className="text-center px-4 py-2 font-medium">Side</th>
                  <th className="text-right px-4 py-2 font-medium">Line</th>
                  <th className="text-right px-4 py-2 font-medium">Actual</th>
                  <th className="text-right px-4 py-2 font-medium">Odds</th>
                  <th className="text-right px-4 py-2 font-medium">P&L</th>
                  <th className="text-right px-4 py-2 font-medium">Cumul.</th>
                </tr>
              </thead>
              <tbody>
                {[...equity.bets].reverse().map((b, i) => (
                  <tr key={i} className="border-b border-gray-800/50">
                    <td className="px-4 py-2 text-gray-400 text-xs">{b.date}</td>
                    <td className="px-4 py-2 text-white text-xs">{b.player || '-'}</td>
                    <td className="px-4 py-2 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded ${b.side === 'UNDER' ? 'bg-red-900/50 text-red-400' : 'bg-green-900/50 text-green-400'}`}>
                        {b.side}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right text-gray-300 font-mono">{b.line ?? '-'}</td>
                    <td className={`px-4 py-2 text-right font-mono ${b.won ? 'text-green-400' : 'text-red-400'}`}>{b.actual ?? '-'}</td>
                    <td className="px-4 py-2 text-right text-gray-400 font-mono">{b.odds?.toFixed(2)}</td>
                    <td className={`px-4 py-2 text-right font-mono font-medium ${b.won ? 'text-green-400' : 'text-red-400'}`}>
                      {b.pnl >= 0 ? '+' : ''}{b.pnl.toFixed(2)}
                    </td>
                    <td className={`px-4 py-2 text-right font-mono ${b.cumulative_pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${b.cumulative_pnl.toFixed(0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ModelDetailPage() {
  return (<Suspense fallback={<LoadingSpinner />}><ModelDetailContent /></Suspense>);
}

function StatCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
      <div className={`text-xl font-bold font-mono ${color || 'text-white'}`}>{value}</div>
      <div className="text-xs text-gray-400 mt-1">{label}</div>
    </div>
  );
}

function EquityChart({ bets }: { bets: { cumulative_pnl: number; date: string }[] }) {
  if (bets.length < 2) return null;
  const pnls = bets.map((b) => b.cumulative_pnl);
  const maxP = Math.max(...pnls);
  const minP = Math.min(...pnls);
  const range = maxP - minP || 1;
  const W = 800, H = 250, pad = 30;

  const pts = bets.map((b, i) => {
    const x = pad + (i / (bets.length - 1)) * (W - pad * 2);
    const y = H - pad - ((b.cumulative_pnl - minP) / range) * (H - pad * 2);
    return `${x},${y}`;
  }).join(' ');

  const zeroY = H - pad - ((0 - minP) / range) * (H - pad * 2);
  const endPositive = pnls[pnls.length - 1] >= 0;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-56">
        <line x1={pad} y1={zeroY} x2={W - pad} y2={zeroY} stroke="#374151" strokeDasharray="4,4" />
        <text x={pad - 5} y={zeroY + 4} textAnchor="end" fill="#6b7280" fontSize="10">$0</text>
        <text x={pad - 5} y={pad + 4} textAnchor="end" fill="#22c55e" fontSize="10">+${maxP.toFixed(0)}</text>
        {minP < 0 && <text x={pad - 5} y={H - pad + 4} textAnchor="end" fill="#ef4444" fontSize="10">${minP.toFixed(0)}</text>}
        <polygon points={`${pad},${zeroY} ${pts} ${W - pad},${zeroY}`} fill={endPositive ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)'} />
        <polyline points={pts} fill="none" stroke={endPositive ? '#22c55e' : '#ef4444'} strokeWidth="2" />
      </svg>
      <div className="flex justify-between text-xs text-gray-500 mt-1 px-8">
        <span>{bets[0].date}</span>
        <span>{bets[bets.length - 1].date}</span>
      </div>
    </div>
  );
}
