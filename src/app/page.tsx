'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api, GlobalStats, LeaderboardModel } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import Waves from '@/components/Waves';
import { buttonVariants } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

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
      if (leadersRes.status === 'fulfilled') setLeaders(leadersRes.value);
      setLoading(false);
    });
  }, []);

  const statTypes = useMemo(() => {
    const unique = Array.from(new Set(leaders.map((m) => m.stat)));
    return unique.sort();
  }, [leaders]);

  const filteredLeaders = (stat: string) =>
    stat === 'all'
      ? leaders.slice(0, 8)
      : leaders.filter((m) => m.stat === stat).slice(0, 8);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <Waves
          lineColor="rgba(59, 130, 246, 0.05)"
          backgroundColor="transparent"
          waveSpeedX={0.012}
          waveSpeedY={0.006}
          waveAmpX={25}
          waveAmpY={12}
          friction={0.93}
          tension={0.006}
          maxCursorMove={80}
          xGap={16}
          yGap={44}
        />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-14 sm:pt-24 sm:pb-20 relative z-10">
          <div className="flex items-center gap-2.5 mb-8">
            <Image src="/logo-icon.png" alt="PropsLab" width={32} height={32} className="rounded-lg" />
            <span className="text-[13px] font-semibold text-muted-foreground tracking-widest uppercase">PropsLab</span>
          </div>

          <h1 className="text-[2.5rem] sm:text-5xl md:text-[3.25rem] font-bold tracking-[-0.02em] text-foreground leading-[1.1] mb-4">
            NBA Player Props,{' '}
            <span className="text-primary">Backed by Data</span>
          </h1>

          <p className="text-[17px] text-muted-foreground max-w-lg mb-8">
            AI-powered prediction models with full backtest transparency. See the edge before you bet.
          </p>

          <div className="flex items-center gap-3">
            <Link href="/register" className={buttonVariants() + ' h-10 px-5 gap-2'}>
              Get Started Free
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link href="/leaderboard" className={buttonVariants({ variant: 'outline' }) + ' h-10 px-5'}>
              View Leaderboard
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      {loading ? (
        <LoadingSpinner />
      ) : stats ? (
        <section className="border-b" data-testid="global-stats">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x">
              <Stat value={stats.total_picks.toLocaleString()} label="Picks Tracked" />
              <Stat value={stats.active_models.toString()} label="Active Models" />
              <Stat value={`${(stats.avg_model_roi_net * 100).toFixed(1)}%`} label="Avg ROI" accent={stats.avg_model_roi_net >= 0} />
              <Stat value={`${(stats.win_rate * 100).toFixed(1)}%`} label="Win Rate" />
            </div>
          </div>
        </section>
      ) : null}

      {/* Leaderboard with Tabs */}
      {leaders.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-16">
          <Tabs defaultValue="all">
            <div className="flex items-end justify-between mb-5 gap-4 flex-wrap">
              <div>
                <h2 className="text-xl font-semibold text-foreground tracking-tight">Model Leaderboard</h2>
                <p className="text-[13px] text-muted-foreground mt-0.5">Ranked by backtested net ROI</p>
              </div>
              <TabsList variant="line" className="h-auto">
                <TabsTrigger value="all" className="text-[13px] px-2.5 pb-2">All</TabsTrigger>
                {statTypes.slice(0, 6).map((stat) => (
                  <TabsTrigger key={stat} value={stat} className="text-[13px] px-2.5 pb-2">{stat}</TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value="all">
              <LeaderboardTable models={filteredLeaders('all')} />
            </TabsContent>
            {statTypes.slice(0, 6).map((stat) => (
              <TabsContent key={stat} value={stat}>
                <LeaderboardTable models={filteredLeaders(stat)} />
              </TabsContent>
            ))}
          </Tabs>

          <div className="mt-4 text-right">
            <Link
              href="/leaderboard"
              className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
            >
              View full leaderboard
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="border-y bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-16">
          <h2 className="text-xl font-semibold text-foreground tracking-tight mb-8">How it works</h2>
          <div className="grid sm:grid-cols-3 gap-6 sm:gap-10">
            {[
              {
                step: '01',
                title: 'Backtested Models',
                desc: 'Every model is walk-forward backtested. Full history — ROI, win rate, p-value — before you follow a single pick.',
              },
              {
                step: '02',
                title: 'Paper Trading',
                desc: 'Track model picks without risking money. Build conviction with simulated P&L before committing real capital.',
              },
              {
                step: '03',
                title: 'Daily Picks',
                desc: 'Highest-confidence picks before game time. Every pick shows the model, stat line, and confidence score.',
              },
            ].map((item) => (
              <div key={item.step}>
                <span className="text-xs font-mono font-medium text-primary/60">{item.step}</span>
                <h3 className="font-medium text-foreground mt-1 mb-1.5">{item.title}</h3>
                <p className="text-[13px] text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground tracking-tight">Ready to find your edge?</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Free to start. No credit card required.</p>
          </div>
          <Link href="/register" className={buttonVariants() + ' h-10 px-5 gap-2 shrink-0'}>
            Create Free Account
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function LeaderboardTable({ models }: { models: readonly LeaderboardModel[] }) {
  if (models.length === 0) {
    return <p className="text-sm text-muted-foreground py-8 text-center">No models in this category yet.</p>;
  }
  return (
    <div className="border rounded-lg overflow-hidden" data-testid="leaderboard-preview">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="w-10 text-center">#</TableHead>
            <TableHead>Model</TableHead>
            <TableHead className="hidden sm:table-cell">Stat</TableHead>
            <TableHead className="text-right">ROI</TableHead>
            <TableHead className="text-right hidden sm:table-cell">Win Rate</TableHead>
            <TableHead className="text-right hidden sm:table-cell">Bets</TableHead>
            <TableHead className="text-right">P-Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {models.map((m, i) => (
            <TableRow key={m.name}>
              <TableCell className="text-center text-muted-foreground tabular-nums text-[13px]">{i + 1}</TableCell>
              <TableCell className="font-medium text-[13px]">{m.display_name}</TableCell>
              <TableCell className="hidden sm:table-cell">
                <span className="text-[11px] font-medium text-muted-foreground bg-muted rounded px-1.5 py-0.5">{m.stat}</span>
              </TableCell>
              <TableCell className={`text-right font-mono text-[13px] font-semibold tabular-nums ${m.roi_net >= 0 ? 'text-positive' : 'text-negative'}`}>
                {m.roi_net >= 0 ? '+' : ''}{(m.roi_net * 100).toFixed(1)}%
              </TableCell>
              <TableCell className="text-right font-mono text-[13px] text-muted-foreground hidden sm:table-cell tabular-nums">
                {(m.win_rate * 100).toFixed(1)}%
              </TableCell>
              <TableCell className="text-right text-[13px] text-muted-foreground hidden sm:table-cell tabular-nums">
                {m.total_bets}
              </TableCell>
              <TableCell className={`text-right font-mono text-[13px] tabular-nums ${m.p_value < 0.05 ? 'text-positive' : 'text-muted-foreground'}`}>
                {m.p_value < 0.001 ? '<0.001' : m.p_value.toFixed(3)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function Stat({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <div className="py-4 px-4 sm:px-6 text-center">
      <div className={`text-lg sm:text-xl font-semibold tracking-tight tabular-nums ${accent ? 'text-positive' : 'text-foreground'}`}>
        {value}
      </div>
      <div className="text-[11px] text-muted-foreground mt-0.5 font-medium uppercase tracking-wider">{label}</div>
    </div>
  );
}
