'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { api, ModelDetail, LeaderboardModel } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import { buttonVariants } from '@/components/ui/button';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, LogIn } from 'lucide-react';

interface CardModel {
  id?: number;
  name: string;
  display_name: string;
  stat: string;
  roi_net: number;
  win_rate: number;
  total_bets: number;
  p_value: number;
  equityData?: { pnl: number }[];
}

export default function ModelsPage() {
  useAuth(); // ensure auth context is available for api calls
  const [models, setModels] = useState<CardModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    async function load() {
      // Try authenticated endpoint first (has IDs for linking + equity)
      try {
        const raw = await api<ModelDetail[]>('/models/', { auth: true });
        const cards: CardModel[] = raw.map((m) => ({
          id: m.id,
          name: m.name,
          display_name: m.display_name,
          stat: m.stat,
          roi_net: m.roi_net,
          win_rate: m.win_rate,
          total_bets: m.total_bets,
          p_value: m.p_value,
        }));

        // Fetch equity sparklines in parallel
        const withEquity = await Promise.all(
          cards.map(async (card) => {
            if (!card.id) return card;
            try {
              const eq = await api<{ bets: { cumulative_pnl: number }[] }>(`/models/${card.id}/equity`, { auth: true });
              const bets = eq.bets;
              if (bets.length < 3) return card;
              const step = Math.max(1, Math.floor(bets.length / 30));
              const sampled = bets.filter((_: unknown, i: number) => i % step === 0 || i === bets.length - 1);
              return { ...card, equityData: sampled.map((b: { cumulative_pnl: number }) => ({ pnl: b.cumulative_pnl })) };
            } catch {
              return card;
            }
          })
        );

        setModels(withEquity);
        setAuthed(true);
      } catch {
        // Fallback: public leaderboard (no IDs, no equity)
        try {
          const lb = await api<LeaderboardModel[]>('/leaderboard/');
          setModels(lb.map((m) => ({
            name: m.name,
            display_name: m.display_name,
            stat: m.stat,
            roi_net: m.roi_net,
            win_rate: m.win_rate,
            total_bets: m.total_bets,
            p_value: m.p_value,
          })));
        } catch { /* empty */ }
      }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-foreground tracking-tight">Models</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">
          {authed
            ? 'Browse prediction models. Click any card for full backtest details.'
            : 'Browse prediction models. Log in to view detailed backtests and equity curves.'}
        </p>
      </div>

      {!authed && !loading && models.length > 0 && (
        <div className="flex items-center gap-3 mb-6 px-4 py-3 rounded-lg border bg-muted/30 text-sm">
          <LogIn className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-muted-foreground">
            <Link href="/login" className={buttonVariants({ variant: 'link', size: 'sm' }) + ' h-auto p-0 text-primary'}>
              Log in
            </Link>
            {' '}to view equity curves and full model details.
          </span>
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : models.length === 0 ? (
        <p className="text-sm text-muted-foreground py-12 text-center">No models available yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {models.map((m) => (
            <ModelCard key={m.name} model={m} hasLink={!!m.id} />
          ))}
        </div>
      )}
    </div>
  );
}

function ModelCard({ model, hasLink }: { model: CardModel; hasLink: boolean }) {
  const roiPct = (model.roi_net * 100).toFixed(1);
  const winPct = (model.win_rate * 100).toFixed(1);
  const isPositive = model.roi_net >= 0;
  const hasChart = model.equityData && model.equityData.length > 2;

  const card = (
    <div className={`group border rounded-lg overflow-hidden bg-card transition-all h-full flex flex-col ${hasLink ? 'hover:border-foreground/15 hover:shadow-sm cursor-pointer' : ''}`}>
      {/* Sparkline */}
      <div className="h-24 relative">
        {hasChart ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={model.equityData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={`g-${model.name}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isPositive ? 'oklch(0.55 0.18 155)' : 'oklch(0.55 0.22 25)'} stopOpacity={0.15} />
                  <stop offset="100%" stopColor={isPositive ? 'oklch(0.55 0.18 155)' : 'oklch(0.55 0.22 25)'} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="pnl"
                stroke={isPositive ? 'oklch(0.55 0.18 155)' : 'oklch(0.55 0.22 25)'}
                strokeWidth={1.5}
                fill={`url(#g-${model.name})`}
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full bg-muted/20 flex items-center justify-center">
            <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">
              {hasLink ? 'No backtest data' : 'Log in for charts'}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <h3 className={`text-[13px] font-semibold leading-tight ${hasLink ? 'text-foreground group-hover:text-primary transition-colors' : 'text-foreground'}`}>
            {model.display_name}
          </h3>
          <span className="text-[10px] font-medium text-muted-foreground bg-muted rounded px-1.5 py-0.5 shrink-0 ml-2">
            {model.stat}
          </span>
        </div>

        <div className="flex items-baseline justify-between mt-auto">
          <div className="flex items-baseline gap-4">
            <div>
              <span className={`text-lg font-semibold font-mono tabular-nums ${isPositive ? 'text-positive' : 'text-negative'}`}>
                {isPositive ? '+' : ''}{roiPct}%
              </span>
              <span className="text-[10px] text-muted-foreground ml-1">ROI</span>
            </div>
            <div>
              <span className="text-[13px] font-mono tabular-nums text-muted-foreground">{winPct}%</span>
              <span className="text-[10px] text-muted-foreground ml-1">win</span>
            </div>
            <div>
              <span className="text-[13px] font-mono tabular-nums text-muted-foreground">{model.total_bets}</span>
              <span className="text-[10px] text-muted-foreground ml-1">bets</span>
            </div>
          </div>
          {hasLink && (
            <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0" />
          )}
        </div>
      </div>
    </div>
  );

  if (hasLink) {
    return <Link href={`/model?id=${model.id}`}>{card}</Link>;
  }
  return card;
}
