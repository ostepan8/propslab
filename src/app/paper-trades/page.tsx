'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { api, PaperTrade, PaperTradeStats, Pick } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function PaperTradesPage() {
  const { loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [trades, setTrades] = useState<PaperTrade[]>([]);
  const [stats, setStats] = useState<PaperTradeStats | null>(null);
  const [todayPicks, setTodayPicks] = useState<Pick[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedPick, setSelectedPick] = useState('');
  const [stake, setStake] = useState('10');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!authLoading && isAuthenticated) {
      Promise.allSettled([
        api<PaperTrade[]>('/paper-trades/', { auth: true }).then(setTrades),
        api<PaperTradeStats>('/paper-trades/stats', { auth: true }).then(setStats),
        api<Pick[]>('/picks/today', { auth: true }).then(setTodayPicks).catch(() => {}),
      ]).then(() => setLoading(false));
    }
  }, [authLoading, isAuthenticated, router]);

  async function createTrade() {
    if (!selectedPick || !stake) return;
    setCreating(true);
    try {
      const trade = await api<PaperTrade>('/paper-trades/', {
        method: 'POST',
        auth: true,
        body: { pick_id: selectedPick, stake: parseFloat(stake) },
      });
      setTrades([trade, ...trades]);
      setSelectedPick('');
      // Refresh stats
      const newStats = await api<PaperTradeStats>('/paper-trades/stats', { auth: true });
      setStats(newStats);
    } catch {
      // silently handle
    } finally {
      setCreating(false);
    }
  }

  if (authLoading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Paper Trades</h1>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-8">
          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatBox label="Total Trades" value={stats.total_trades.toString()} />
              <StatBox
                label="P&L"
                value={`${stats.total_pnl >= 0 ? '+' : ''}$${stats.total_pnl.toFixed(2)}`}
                color={stats.total_pnl >= 0 ? 'text-green-400' : 'text-red-400'}
              />
              <StatBox
                label="ROI"
                value={`${(stats.roi * 100).toFixed(1)}%`}
                color={stats.roi >= 0 ? 'text-green-400' : 'text-red-400'}
              />
              <StatBox label="Win Rate" value={`${(stats.win_rate * 100).toFixed(1)}%`} />
            </div>
          )}

          {/* Create Trade */}
          {todayPicks.length > 0 && (
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Place Paper Trade</h2>
              <div className="flex flex-col sm:flex-row gap-4">
                <select
                  value={selectedPick}
                  onChange={(e) => setSelectedPick(e.target.value)}
                  className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-green-500 text-sm"
                >
                  <option value="">Select a pick...</option>
                  {todayPicks.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.player_name} - {p.direction.toUpperCase()} {p.line} {p.stat}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={stake}
                  onChange={(e) => setStake(e.target.value)}
                  min="1"
                  className="w-32 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-green-500 text-sm"
                  placeholder="Stake $"
                />
                <button
                  onClick={createTrade}
                  disabled={creating || !selectedPick}
                  className="bg-green-600 hover:bg-green-500 disabled:bg-green-800 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                  {creating ? 'Placing...' : 'Place Trade'}
                </button>
              </div>
            </div>
          )}

          {/* Trade History */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Trade History</h2>
            {trades.length === 0 ? (
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 text-center text-gray-400">
                No paper trades yet. Place your first trade above.
              </div>
            ) : (
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-400">
                      <th className="text-left px-4 py-3 font-medium">Date</th>
                      <th className="text-right px-4 py-3 font-medium">Stake</th>
                      <th className="text-right px-4 py-3 font-medium">Odds</th>
                      <th className="text-center px-4 py-3 font-medium">Result</th>
                      <th className="text-right px-4 py-3 font-medium">P&L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trades.map((t) => (
                      <tr key={t.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="px-4 py-3 text-gray-400">
                          {new Date(t.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right text-white font-mono">${t.stake.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right text-gray-300 font-mono">
                          {t.odds > 0 ? `+${t.odds}` : t.odds}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {t.result ? (
                            <span className={`px-2 py-0.5 text-xs rounded font-medium ${
                              t.result === 'win' ? 'bg-green-900/50 text-green-400' :
                              t.result === 'loss' ? 'bg-red-900/50 text-red-400' :
                              'bg-gray-700 text-gray-400'
                            }`}>
                              {t.result.toUpperCase()}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-xs rounded bg-yellow-900/50 text-yellow-400">PENDING</span>
                          )}
                        </td>
                        <td className={`px-4 py-3 text-right font-mono ${
                          t.pnl != null ? (t.pnl >= 0 ? 'text-green-400' : 'text-red-400') : 'text-gray-500'
                        }`}>
                          {t.pnl != null ? `${t.pnl >= 0 ? '+' : ''}$${t.pnl.toFixed(2)}` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
      <div className={`text-xl font-bold font-mono ${color || 'text-white'}`}>{value}</div>
      <div className="text-xs text-gray-400 mt-1">{label}</div>
    </div>
  );
}
