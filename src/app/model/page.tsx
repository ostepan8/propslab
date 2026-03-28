'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api, ModelDetail } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Badge } from '@/components/ui/badge';
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
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { ArrowLeft } from 'lucide-react';

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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <p className="text-sm text-destructive mb-4">{error || 'Model not found'}</p>
        <Link href="/models" className={buttonVariants({ variant: 'ghost', size: 'sm' }) + ' gap-1.5'}>
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Models
        </Link>
      </div>
    );
  }

  const roiNet = equity?.summary.roi_net ?? equity?.summary.roi ?? 0;
  const isPositive = roiNet >= 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Back */}
      <Link href="/models" className={buttonVariants({ variant: 'ghost', size: 'sm' }) + ' gap-1.5 mb-6'}>
        <ArrowLeft className="w-3.5 h-3.5" /> Models
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">{model.display_name}</h1>
          {model.description && (
            <p className="text-sm text-muted-foreground mt-1 max-w-xl">{model.description}</p>
          )}
        </div>
        <div className="flex gap-1.5">
          <Badge variant="secondary" className="text-[11px]">{model.stat}</Badge>
          <Badge variant="outline" className="text-[11px]">{model.architecture}</Badge>
          <Badge variant="outline" className="text-[11px]">{model.sides}</Badge>
        </div>
      </div>

      {/* Key stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 border rounded-lg divide-x mb-8">
        <StatCell label="Net ROI" value={`${(model.roi_net * 100).toFixed(1)}%`} colored={model.roi_net >= 0} />
        <StatCell label="Win Rate" value={`${(model.win_rate * 100).toFixed(1)}%`} />
        <StatCell label="Total Bets" value={model.total_bets.toString()} />
        <StatCell label="P-Value" value={model.p_value < 0.001 ? '<0.001' : model.p_value.toFixed(4)} colored={model.p_value < 0.05} />
      </div>

      {/* Features */}
      {model.feature_description && (
        <div className="mb-8">
          <h2 className="text-sm font-medium text-muted-foreground mb-2">Features</h2>
          <div className="flex flex-wrap gap-1.5">
            {model.feature_description.split(', ').map((f, i) => (
              <span key={i} className="text-[11px] font-medium text-muted-foreground bg-muted rounded px-2 py-0.5">{f}</span>
            ))}
          </div>
        </div>
      )}

      {/* Equity curve + bet history */}
      {equity && equity.bets.length > 0 && (
        <Tabs defaultValue="chart">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground tracking-tight">Backtest Results</h2>
            <TabsList variant="line" className="h-auto">
              <TabsTrigger value="chart" className="text-[13px] px-2.5 pb-2">Equity Curve</TabsTrigger>
              <TabsTrigger value="summary" className="text-[13px] px-2.5 pb-2">Summary</TabsTrigger>
              <TabsTrigger value="bets" className="text-[13px] px-2.5 pb-2">Bet History</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="chart">
            <div className="border rounded-lg p-4 sm:p-6 bg-card">
              <div className="flex items-baseline gap-4 mb-4">
                <span className={`text-2xl font-bold font-mono tabular-nums ${isPositive ? 'text-positive' : 'text-negative'}`}>
                  ${equity.summary.total_pnl >= 0 ? '+' : ''}{equity.summary.total_pnl.toFixed(2)}
                </span>
                <span className="text-sm text-muted-foreground">
                  cumulative P&L over {equity.summary.total_bets} bets
                </span>
              </div>
              <EquityChart bets={equity.bets} isPositive={isPositive} />
            </div>
          </TabsContent>

          <TabsContent value="summary">
            <div className="border rounded-lg bg-card">
              <div className="grid grid-cols-2 sm:grid-cols-5 divide-x divide-y sm:divide-y-0">
                <SummaryCell label="Bets" value={equity.summary.total_bets.toString()} />
                <SummaryCell label="Record" value={`${equity.summary.wins}W - ${equity.summary.losses}L`} />
                <SummaryCell label="Win Rate" value={`${(equity.summary.win_rate * 100).toFixed(1)}%`} />
                <SummaryCell label="Total P&L" value={`$${equity.summary.total_pnl >= 0 ? '+' : ''}${equity.summary.total_pnl.toFixed(2)}`} positive={equity.summary.total_pnl >= 0} />
                <SummaryCell label="Net ROI" value={`${(roiNet * 100).toFixed(1)}%`} positive={roiNet >= 0} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="bets">
            <div className="border rounded-lg overflow-hidden bg-card">
              <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-card z-10">
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead>Date</TableHead>
                      <TableHead>Player</TableHead>
                      <TableHead className="text-center">Side</TableHead>
                      <TableHead className="text-right">Line</TableHead>
                      <TableHead className="text-right">Actual</TableHead>
                      <TableHead className="text-right">Odds</TableHead>
                      <TableHead className="text-right">P&L</TableHead>
                      <TableHead className="text-right">Cumul.</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...equity.bets].reverse().map((b, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-muted-foreground text-[13px] tabular-nums">{b.date}</TableCell>
                        <TableCell className="text-[13px]">{b.player || '-'}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={b.side === 'UNDER' ? 'destructive' : 'default'} className="text-[10px]">{b.side}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono text-[13px] text-muted-foreground tabular-nums">{b.line ?? '-'}</TableCell>
                        <TableCell className={`text-right font-mono text-[13px] tabular-nums ${b.won ? 'text-positive' : 'text-negative'}`}>{b.actual ?? '-'}</TableCell>
                        <TableCell className="text-right text-muted-foreground font-mono text-[13px] tabular-nums">{b.odds?.toFixed(2)}</TableCell>
                        <TableCell className={`text-right font-mono text-[13px] font-medium tabular-nums ${b.won ? 'text-positive' : 'text-negative'}`}>
                          {b.pnl >= 0 ? '+' : ''}{b.pnl.toFixed(2)}
                        </TableCell>
                        <TableCell className={`text-right font-mono text-[13px] tabular-nums ${b.cumulative_pnl >= 0 ? 'text-positive' : 'text-negative'}`}>
                          ${b.cumulative_pnl.toFixed(0)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

export default function ModelDetailPage() {
  return <Suspense fallback={<LoadingSpinner />}><ModelDetailContent /></Suspense>;
}

function StatCell({ label, value, colored }: { label: string; value: string; colored?: boolean }) {
  return (
    <div className="py-4 px-4 text-center">
      <div className={`text-lg font-semibold font-mono tabular-nums ${colored === true ? 'text-positive' : colored === false ? 'text-negative' : 'text-foreground'}`}>
        {value}
      </div>
      <div className="text-[11px] text-muted-foreground mt-0.5 font-medium uppercase tracking-wider">{label}</div>
    </div>
  );
}

function SummaryCell({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="py-5 px-4 text-center">
      <div className={`text-lg font-semibold font-mono tabular-nums ${positive === true ? 'text-positive' : positive === false ? 'text-negative' : 'text-foreground'}`}>
        {value}
      </div>
      <div className="text-[11px] text-muted-foreground mt-0.5 font-medium">{label}</div>
    </div>
  );
}

function EquityChart({ bets, isPositive }: { bets: { cumulative_pnl: number; date: string }[]; isPositive: boolean }) {
  const chartData = bets.map((b) => ({
    date: b.date,
    pnl: Math.round(b.cumulative_pnl * 100) / 100,
  }));

  const color = isPositive ? 'oklch(0.55 0.18 155)' : 'oklch(0.55 0.22 25)';
  const fillId = isPositive ? 'eq-fill-pos' : 'eq-fill-neg';

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
        <defs>
          <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.12} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.005 260)" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: 'oklch(0.55 0.02 260)' }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
          minTickGap={60}
        />
        <YAxis
          tick={{ fontSize: 10, fill: 'oklch(0.55 0.02 260)' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => `$${v}`}
          width={50}
        />
        <ReferenceLine y={0} stroke="oklch(0.8 0.01 260)" strokeDasharray="4 4" />
        <Tooltip
          contentStyle={{
            fontSize: 12,
            borderRadius: 8,
            border: '1px solid oklch(0.92 0.005 260)',
            boxShadow: '0 4px 12px oklch(0 0 0 / 0.08)',
            background: 'oklch(1 0 0)',
          }}
          formatter={(value: unknown) => {
            const num = Number(value);
            return [`$${num.toFixed(2)}`, 'Cumulative P&L'];
          }}
          labelFormatter={(label: unknown) => String(label)}
        />
        <Area
          type="monotone"
          dataKey="pnl"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#${fillId})`}
          dot={false}
          activeDot={{ r: 3, strokeWidth: 0, fill: color }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
