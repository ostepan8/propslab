'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { api, PaperTrade, PaperTradeStats, Pick } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TrendingUp, DollarSign, Target, Percent, Activity, Plus, Clock } from 'lucide-react';

const STAT_ICONS = [
  { icon: Activity, label: 'Total Trades', bg: 'bg-primary/10', fg: 'text-primary' },
  { icon: DollarSign, label: 'P&L', bg: 'bg-emerald-500/10', fg: 'text-emerald-500' },
  { icon: Percent, label: 'ROI', bg: 'bg-blue-500/10', fg: 'text-blue-500' },
  { icon: Target, label: 'Win Rate', bg: 'bg-amber-500/10', fg: 'text-amber-500' },
] as const;

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
      const newStats = await api<PaperTradeStats>('/paper-trades/stats', { auth: true });
      setStats(newStats);
    } catch {
      // silently handle
    } finally {
      setCreating(false);
    }
  }

  if (authLoading) return <LoadingSpinner />;

  function getStatValues(s: PaperTradeStats) {
    return [
      { value: s.total_trades.toString(), color: 'text-foreground' },
      {
        value: `${s.total_pnl >= 0 ? '+' : ''}$${s.total_pnl.toFixed(2)}`,
        color: s.total_pnl >= 0 ? 'text-positive' : 'text-negative',
      },
      {
        value: `${(s.roi * 100).toFixed(1)}%`,
        color: s.roi >= 0 ? 'text-positive' : 'text-negative',
      },
      { value: `${(s.win_rate * 100).toFixed(1)}%`, color: 'text-foreground' },
    ];
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Paper Trades</h1>
          <p className="text-sm text-muted-foreground">Track your simulated trading performance</p>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-8">
          {/* Stats Grid */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {STAT_ICONS.map((item, idx) => {
                const values = getStatValues(stats);
                const Icon = item.icon;
                return (
                  <Card key={item.label}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full ${item.bg} flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 ${item.fg}`} />
                        </div>
                        <div>
                          <div className={`text-xl font-bold font-mono ${values[idx].color}`}>
                            {values[idx].value}
                          </div>
                          <div className="text-xs text-muted-foreground">{item.label}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Create Trade */}
          {todayPicks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-primary" />
                  Place Paper Trade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={selectedPick}
                    onChange={(e) => setSelectedPick(e.target.value)}
                    className="flex-1 h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select a pick...</option>
                    {todayPicks.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.player_name} - {p.direction.toUpperCase()} {p.line} {p.stat}
                      </option>
                    ))}
                  </select>
                  <div className="relative w-36">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="number"
                      value={stake}
                      onChange={(e) => setStake(e.target.value)}
                      min="1"
                      className="pl-9"
                      placeholder="Stake"
                    />
                  </div>
                  <Button
                    onClick={createTrade}
                    disabled={creating || !selectedPick}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {creating ? 'Placing...' : 'Place Trade'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Trade History */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold text-foreground">Trade History</h2>
            </div>
            {trades.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No paper trades yet. Place your first trade above.
                </CardContent>
              </Card>
            ) : (
              <Card>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Stake</TableHead>
                        <TableHead className="text-right">Odds</TableHead>
                        <TableHead className="text-center">Result</TableHead>
                        <TableHead className="text-right">P&L</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trades.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell className="text-muted-foreground">
                            {new Date(t.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right font-mono">${t.stake.toFixed(2)}</TableCell>
                          <TableCell className="text-right font-mono text-muted-foreground">
                            {t.odds > 0 ? `+${t.odds}` : t.odds}
                          </TableCell>
                          <TableCell className="text-center">
                            {t.result ? (
                              <Badge
                                variant={
                                  t.result === 'win' ? 'default' :
                                  t.result === 'loss' ? 'destructive' :
                                  'secondary'
                                }
                              >
                                {t.result.toUpperCase()}
                              </Badge>
                            ) : (
                              <Badge variant="outline">PENDING</Badge>
                            )}
                          </TableCell>
                          <TableCell className={`text-right font-mono ${
                            t.pnl != null ? (t.pnl >= 0 ? 'text-positive' : 'text-negative') : 'text-muted-foreground'
                          }`}>
                            {t.pnl != null ? `${t.pnl >= 0 ? '+' : ''}$${t.pnl.toFixed(2)}` : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
