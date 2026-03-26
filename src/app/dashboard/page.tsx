'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { api, Pick, PaperTradeStats, ApiError } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import UpgradePrompt from '@/components/UpgradePrompt';

export default function DashboardPage() {
  const { user, loading: authLoading, isAuthenticated, isPro } = useAuth();
  const router = useRouter();
  const [picks, setPicks] = useState<Pick[]>([]);
  const [ptStats, setPtStats] = useState<PaperTradeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [picksError, setPicksError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!authLoading && isAuthenticated) {
      const promises: Promise<void>[] = [];

      promises.push(
        api<Pick[]>('/picks/today', { auth: true })
          .then((data) => setPicks(data))
          .catch((err) => {
            if (err instanceof ApiError && err.status === 403) {
              setPicksError('upgrade');
            }
          })
      );

      promises.push(
        api<PaperTradeStats>('/paper-trades/stats', { auth: true })
          .then((data) => setPtStats(data))
          .catch(() => {})
      );

      Promise.allSettled(promises).then(() => setLoading(false));
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || (!isAuthenticated && !authLoading)) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Welcome back, {user?.full_name || user?.email}</p>
        </div>
        <span className="px-3 py-1 text-sm rounded-full bg-green-900/50 text-green-400 border border-green-800 capitalize">
          {user?.tier} tier
        </span>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-8">
          {/* Paper Trade Stats */}
          {ptStats && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">Paper Trading P&L</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <QuickStat label="Total Trades" value={ptStats.total_trades.toString()} />
                <QuickStat
                  label="P&L"
                  value={`${ptStats.total_pnl >= 0 ? '+' : ''}$${ptStats.total_pnl.toFixed(2)}`}
                  color={ptStats.total_pnl >= 0 ? 'text-green-400' : 'text-red-400'}
                />
                <QuickStat
                  label="ROI"
                  value={`${(ptStats.roi * 100).toFixed(1)}%`}
                  color={ptStats.roi >= 0 ? 'text-green-400' : 'text-red-400'}
                />
                <QuickStat
                  label="Win Rate"
                  value={`${(ptStats.win_rate * 100).toFixed(1)}%`}
                />
              </div>
            </div>
          )}

          {/* Today's Picks */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Today&apos;s Picks</h2>
              {isPro && (
                <Link href="/picks" className="text-green-400 hover:text-green-300 text-sm">
                  View History &rarr;
                </Link>
              )}
            </div>

            {picksError === 'upgrade' ? (
              <UpgradePrompt feature="Today's picks" />
            ) : picks.length === 0 ? (
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 text-center text-gray-400">
                No picks available today. Check back before game time.
              </div>
            ) : (
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-400">
                      <th className="text-left px-4 py-3 font-medium">Player</th>
                      <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Game</th>
                      <th className="text-left px-4 py-3 font-medium">Prop</th>
                      <th className="text-right px-4 py-3 font-medium">Line</th>
                      <th className="text-right px-4 py-3 font-medium">Conf</th>
                      <th className="text-right px-4 py-3 font-medium hidden sm:table-cell">Odds</th>
                    </tr>
                  </thead>
                  <tbody>
                    {picks.map((pick) => (
                      <tr key={pick.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="px-4 py-3 text-white font-medium">{pick.player_name}</td>
                        <td className="px-4 py-3 text-gray-400 hidden sm:table-cell">{pick.game}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 text-xs rounded ${pick.direction === 'over' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                            {pick.direction.toUpperCase()}
                          </span>
                          <span className="ml-2 text-gray-300">{pick.stat}</span>
                        </td>
                        <td className="px-4 py-3 text-right text-white font-mono">{pick.line}</td>
                        <td className="px-4 py-3 text-right text-gray-300 font-mono">{(pick.confidence * 100).toFixed(0)}%</td>
                        <td className="px-4 py-3 text-right text-gray-400 font-mono hidden sm:table-cell">
                          {pick.odds > 0 ? `+${pick.odds}` : pick.odds}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Free tier CTA */}
          {!isPro && (
            <div className="border border-green-800 bg-green-950/20 rounded-xl p-8 text-center">
              <h3 className="text-xl font-semibold text-white mb-2">Unlock Full Access</h3>
              <p className="text-gray-400 mb-6">
                Upgrade to Pro for daily picks, full pick history, and advanced paper trading tools.
              </p>
              <Link
                href="/pricing"
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                View Plans
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function QuickStat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
      <div className={`text-xl font-bold ${color || 'text-white'}`}>{value}</div>
      <div className="text-xs text-gray-400 mt-1">{label}</div>
    </div>
  );
}
