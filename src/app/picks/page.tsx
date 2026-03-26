'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { api, Pick, ApiError } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import UpgradePrompt from '@/components/UpgradePrompt';

export default function PicksPage() {
  const { loading: authLoading, isAuthenticated, isPro } = useAuth();
  const router = useRouter();
  const [picks, setPicks] = useState<Pick[]>([]);
  const [loading, setLoading] = useState(true);
  const [needsUpgrade, setNeedsUpgrade] = useState(false);
  const [stat, setStat] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchPicks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (stat) params.set('stat', stat);
      if (dateFrom) params.set('date_from', dateFrom);
      if (dateTo) params.set('date_to', dateTo);
      const query = params.toString() ? `?${params.toString()}` : '';
      const data = await api<Pick[]>(`/picks/${query}`, { auth: true });
      setPicks(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setNeedsUpgrade(true);
      }
    } finally {
      setLoading(false);
    }
  }, [stat, dateFrom, dateTo]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!authLoading && isAuthenticated) {
      fetchPicks();
    }
  }, [authLoading, isAuthenticated, router, fetchPicks]);

  if (authLoading) return <LoadingSpinner />;

  if (needsUpgrade) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <UpgradePrompt feature="Pick history" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Picks History</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Filter by stat (e.g. points)"
          value={stat}
          onChange={(e) => setStat(e.target.value)}
          className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 text-sm"
        />
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500 text-sm"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500 text-sm"
        />
        <button
          onClick={fetchPicks}
          className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          Apply
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : picks.length === 0 ? (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 text-center text-gray-400">
          No picks match your filters.
        </div>
      ) : (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400">
                <th className="text-left px-4 py-3 font-medium">Player</th>
                <th className="text-left px-4 py-3 font-medium">Game</th>
                <th className="text-left px-4 py-3 font-medium">Prop</th>
                <th className="text-right px-4 py-3 font-medium">Line</th>
                <th className="text-right px-4 py-3 font-medium">Actual</th>
                <th className="text-center px-4 py-3 font-medium">Result</th>
                <th className="text-left px-4 py-3 font-medium">Model</th>
              </tr>
            </thead>
            <tbody>
              {picks.map((pick) => (
                <tr key={pick.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="px-4 py-3 text-white font-medium">{pick.player_name}</td>
                  <td className="px-4 py-3 text-gray-400">{pick.game}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-xs rounded ${pick.direction === 'over' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                      {pick.direction.toUpperCase()}
                    </span>
                    <span className="ml-2 text-gray-300">{pick.stat}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-white font-mono">{pick.line}</td>
                  <td className="px-4 py-3 text-right text-gray-300 font-mono">
                    {pick.actual_value != null ? pick.actual_value : '-'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {pick.result ? (
                      <span className={`px-2 py-0.5 text-xs rounded font-medium ${
                        pick.result === 'win' ? 'bg-green-900/50 text-green-400' :
                        pick.result === 'loss' ? 'bg-red-900/50 text-red-400' :
                        'bg-gray-700 text-gray-400'
                      }`}>
                        {pick.result.toUpperCase()}
                      </span>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-400">{pick.model_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
