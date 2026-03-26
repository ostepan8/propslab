'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, LeaderboardModel } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function LeaderboardPage() {
  const [models, setModels] = useState<LeaderboardModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<LeaderboardModel[]>('/leaderboard/')
      .then(setModels)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-2">Model Leaderboard</h1>
      <p className="text-gray-400 text-sm mb-8">
        All models ranked by backtested ROI. Click a model for details.
      </p>

      {loading ? (
        <LoadingSpinner />
      ) : models.length === 0 ? (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 text-center text-gray-400">
          No models available yet.
        </div>
      ) : (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-x-auto">
          <table className="w-full text-sm" data-testid="leaderboard-table">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400">
                <th className="text-left px-4 py-3 font-medium">#</th>
                <th className="text-left px-4 py-3 font-medium">Model</th>
                <th className="text-left px-4 py-3 font-medium">Stat</th>
                <th className="text-right px-4 py-3 font-medium">ROI</th>
                <th className="text-right px-4 py-3 font-medium">Win Rate</th>
                <th className="text-right px-4 py-3 font-medium">Total Bets</th>
                <th className="text-right px-4 py-3 font-medium">P-Value</th>
              </tr>
            </thead>
            <tbody>
              {models.map((m, i) => (
                <tr key={m.name} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3 text-gray-500 font-mono">{i + 1}</td>
                  <td className="px-4 py-3">
                    <span className="text-white font-medium">
                      {m.display_name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{m.stat}</td>
                  <td className={`px-4 py-3 text-right font-mono font-medium ${m.roi_net >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {(m.roi_net * 100).toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-gray-300">
                    {(m.win_rate * 100).toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 text-right text-gray-400 font-mono">{m.total_bets}</td>
                  <td className={`px-4 py-3 text-right font-mono ${m.p_value < 0.05 ? 'text-green-400' : 'text-yellow-400'}`}>
                    {m.p_value.toFixed(4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
