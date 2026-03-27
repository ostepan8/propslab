'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, GlobalStats, LeaderboardModel } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import Waves from '@/components/Waves';

export default function LandingPage() {
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [leaders, setLeaders] = useState<LeaderboardModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api<GlobalStats>('/stats/global'),
      api<LeaderboardModel[]>('/leaderboard/'),
    ]).then(([statsRes, leadersRes]) => {
      if (statsRes.status === 'fulfilled') setStats(statsRes.value);
      if (leadersRes.status === 'fulfilled') setLeaders(leadersRes.value.slice(0, 5));
      setLoading(false);
    });
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <Waves
          lineColor="rgba(99, 102, 241, 0.15)"
          backgroundColor="transparent"
          waveSpeedX={0.02}
          waveSpeedY={0.01}
          waveAmpX={40}
          waveAmpY={20}
          friction={0.9}
          tension={0.01}
          maxCursorMove={120}
          xGap={12}
          yGap={36}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-green-950/20 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 py-20 sm:py-32 text-center relative z-10">
          <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6">
            NBA Player Props,{' '}
            <span className="text-green-400">Backed by Data</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            AI-powered models with full backtest transparency. See the edge before you bet.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium text-lg transition-colors"
            >
              Get Started Free
            </Link>
            <Link
              href="/leaderboard"
              className="border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white px-8 py-3 rounded-lg font-medium text-lg transition-colors"
            >
              View Leaderboard
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      {loading ? (
        <LoadingSpinner />
      ) : stats ? (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6" data-testid="global-stats">
            <StatCard label="Total Picks" value={stats.total_picks.toLocaleString()} />
            <StatCard label="Models" value={stats.active_models.toString()} />
            <StatCard label="Avg ROI" value={`${(stats.avg_model_roi_net * 100).toFixed(1)}%`} highlight />
            <StatCard label="Win Rate" value={`${(stats.win_rate * 100).toFixed(1)}%`} />
          </div>
        </section>
      ) : null}

      {/* Leaderboard Preview */}
      {leaders.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Top Models</h2>
            <Link href="/leaderboard" className="text-green-400 hover:text-green-300 text-sm">
              View All &rarr;
            </Link>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm" data-testid="leaderboard-preview">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400">
                  <th className="text-left px-4 py-3 font-medium">#</th>
                  <th className="text-left px-4 py-3 font-medium">Model</th>
                  <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Stat</th>
                  <th className="text-right px-4 py-3 font-medium">ROI</th>
                  <th className="text-right px-4 py-3 font-medium">Win Rate</th>
                  <th className="text-right px-4 py-3 font-medium hidden sm:table-cell">Bets</th>
                </tr>
              </thead>
              <tbody>
                {leaders.map((m, i) => (
                  <tr key={m.name} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                    <td className="px-4 py-3 text-white font-medium">{m.display_name}</td>
                    <td className="px-4 py-3 text-gray-400 hidden sm:table-cell">{m.stat}</td>
                    <td className={`px-4 py-3 text-right font-mono ${m.roi_net >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {(m.roi_net * 100).toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-gray-300">
                      {(m.win_rate * 100).toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 text-right text-gray-400 hidden sm:table-cell">{m.total_bets}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-white text-center mb-12">Why PropsLab?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            title="Backtested Models"
            description="Every model is backtested with full transparency. See historical ROI, win rates, and p-values."
          />
          <FeatureCard
            title="Paper Trading"
            description="Track picks without risking real money. Build confidence in the models before committing."
          />
          <FeatureCard
            title="Real-Time Picks"
            description="Get today's highest-confidence picks delivered before game time, every day."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to find your edge?</h2>
        <p className="text-gray-400 mb-8">Join PropsLab and start paper trading today. No credit card required.</p>
        <Link
          href="/register"
          className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium text-lg transition-colors"
        >
          Create Free Account
        </Link>
      </section>
    </div>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-center">
      <div className={`text-2xl sm:text-3xl font-bold mb-1 ${highlight ? 'text-green-400' : 'text-white'}`}>
        {value}
      </div>
      <div className="text-sm text-gray-400">{label}</div>
    </div>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
}
