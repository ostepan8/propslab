'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, ModelDetail } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function ModelsPage() {
  const [models, setModels] = useState<ModelDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try authenticated endpoint first (has IDs for linking), fall back to leaderboard
    api<ModelDetail[]>('/models/', { auth: true })
      .then(setModels)
      .catch(() => {
        // Fallback for non-authenticated users — leaderboard doesn't have IDs
        return api<ModelDetail[]>('/leaderboard/').then(setModels).catch(() => {});
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-2">Models</h1>
      <p className="text-gray-400 text-sm mb-8">
        Browse all prediction models. Click into any model for detailed stats and backtest results.
      </p>

      {loading ? (
        <LoadingSpinner />
      ) : models.length === 0 ? (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 text-center text-gray-400">
          No models available yet.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {models.map((m) => (
            <Link
              key={m.name}
              href={m.id ? `/model?id=${m.id}` : '#'}
              className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors group"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-white font-semibold group-hover:text-green-400 transition-colors">
                  {m.display_name}
                </h3>
                <span className="px-2 py-0.5 text-xs rounded bg-gray-800 text-gray-400">{m.stat}</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className={`text-lg font-bold font-mono ${m.roi_net >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {(m.roi_net * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">ROI</div>
                </div>
                <div>
                  <div className="text-lg font-bold font-mono text-gray-300">
                    {(m.win_rate * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">Win Rate</div>
                </div>
                <div>
                  <div className="text-lg font-bold font-mono text-gray-300">{m.total_bets}</div>
                  <div className="text-xs text-gray-500">Bets</div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-800 text-xs text-gray-500">
                p-value: <span className={m.p_value < 0.05 ? 'text-green-400' : 'text-yellow-400'}>{m.p_value.toFixed(4)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
