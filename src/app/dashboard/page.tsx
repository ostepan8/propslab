'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { api, Pick, PaperTradeStats, ApiError } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import UpgradePrompt from '@/components/UpgradePrompt';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Target,
  BarChart3,
  DollarSign,
  ArrowRight,
  Percent,
  Activity,
  Crown,
} from 'lucide-react';

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

  const tierLabel = user?.tier ?? 'free';
  const isProOrElite = tierLabel === 'pro' || tierLabel === 'elite';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <LayoutDashboard className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground text-sm">
              Welcome back, {user?.full_name || user?.email}
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="capitalize text-sm px-3 py-1 w-fit">
          {isProOrElite && <Crown className="size-3 mr-1" />}
          {tierLabel} tier
        </Badge>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-8">
          {/* Paper Trade Stats */}
          {ptStats && <StatsGrid stats={ptStats} />}

          {/* Today's Picks */}
          <PicksSection
            picks={picks}
            picksError={picksError}
            isPro={isPro}
          />

          {/* Free tier CTA */}
          {!isPro && <UpgradeCta />}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Paper Trade Stats Grid                                            */
/* ------------------------------------------------------------------ */

function StatsGrid({ stats }: { readonly stats: PaperTradeStats }) {
  const pnlPositive = stats.total_pnl >= 0;
  const roiPositive = stats.roi >= 0;

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="size-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold text-foreground">
          Paper Trading Performance
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Trades */}
        <StatCard
          icon={<Activity className="size-4 text-primary" />}
          iconBg="bg-primary/10"
          label="Total Trades"
          value={stats.total_trades.toString()}
        />

        {/* P&L */}
        <StatCard
          icon={
            <DollarSign
              className={`size-4 ${pnlPositive ? 'text-positive' : 'text-negative'}`}
            />
          }
          iconBg={pnlPositive ? 'bg-positive/10' : 'bg-negative/10'}
          label="P&L"
          value={`${pnlPositive ? '+' : ''}$${stats.total_pnl.toFixed(2)}`}
          valueColor={pnlPositive ? 'text-positive' : 'text-negative'}
          trend={pnlPositive ? 'up' : 'down'}
        />

        {/* ROI */}
        <StatCard
          icon={
            <Percent
              className={`size-4 ${roiPositive ? 'text-positive' : 'text-negative'}`}
            />
          }
          iconBg={roiPositive ? 'bg-positive/10' : 'bg-negative/10'}
          label="ROI"
          value={`${(stats.roi * 100).toFixed(1)}%`}
          valueColor={roiPositive ? 'text-positive' : 'text-negative'}
          trend={roiPositive ? 'up' : 'down'}
        />

        {/* Win Rate */}
        <StatCard
          icon={<Target className="size-4 text-primary" />}
          iconBg="bg-primary/10"
          label="Win Rate"
          value={`${(stats.win_rate * 100).toFixed(1)}%`}
        />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Individual Stat Card                                              */
/* ------------------------------------------------------------------ */

interface StatCardProps {
  readonly icon: React.ReactNode;
  readonly iconBg: string;
  readonly label: string;
  readonly value: string;
  readonly valueColor?: string;
  readonly trend?: 'up' | 'down';
}

function StatCard({ icon, iconBg, label, value, valueColor, trend }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className={`flex h-8 w-8 items-center justify-center rounded-full ${iconBg}`}>
            {icon}
          </div>
          {trend === 'up' && <TrendingUp className="size-4 text-positive" />}
          {trend === 'down' && <TrendingDown className="size-4 text-negative" />}
        </div>
        <div className={`text-2xl font-bold font-mono ${valueColor ?? 'text-foreground'}`}>
          {value}
        </div>
        <div className="text-xs text-muted-foreground mt-1">{label}</div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Today's Picks Section                                             */
/* ------------------------------------------------------------------ */

interface PicksSectionProps {
  readonly picks: Pick[];
  readonly picksError: string | null;
  readonly isPro: boolean;
}

function PicksSection({ picks, picksError, isPro }: PicksSectionProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="size-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-foreground">
            Today&apos;s Picks
          </h2>
          {picks.length > 0 && (
            <Badge variant="secondary" className="ml-1">
              {picks.length}
            </Badge>
          )}
        </div>
        {isPro && (
          <Link
            href="/picks"
            className="flex items-center gap-1 text-primary hover:text-primary/80 text-sm font-medium"
          >
            View History
            <ArrowRight className="size-3.5" />
          </Link>
        )}
      </div>

      {picksError === 'upgrade' ? (
        <UpgradePrompt feature="Today's picks" />
      ) : picks.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No picks available today. Check back before game time.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Player</TableHead>
                <TableHead className="hidden sm:table-cell">Game</TableHead>
                <TableHead>Prop</TableHead>
                <TableHead className="text-right">Line</TableHead>
                <TableHead className="text-right">Confidence</TableHead>
                <TableHead className="text-right hidden sm:table-cell">Odds</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {picks.map((pick) => (
                <PickRow key={pick.id} pick={pick} />
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Pick Table Row                                                    */
/* ------------------------------------------------------------------ */

function PickRow({ pick }: { readonly pick: Pick }) {
  const confidencePct = Math.round(pick.confidence * 100);

  return (
    <TableRow>
      <TableCell className="font-medium text-foreground">
        {pick.player_name}
      </TableCell>
      <TableCell className="hidden sm:table-cell text-muted-foreground">
        {pick.game}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Badge variant={pick.direction === 'over' ? 'default' : 'destructive'}>
            {pick.direction === 'over' ? (
              <TrendingUp className="size-3 mr-0.5" />
            ) : (
              <TrendingDown className="size-3 mr-0.5" />
            )}
            {pick.direction.toUpperCase()}
          </Badge>
          <span className="text-muted-foreground">{pick.stat}</span>
        </div>
      </TableCell>
      <TableCell className="text-right font-mono text-foreground">
        {pick.line}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <div className="hidden sm:block w-16 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${confidencePct}%` }}
            />
          </div>
          <span className="font-mono text-muted-foreground text-sm">
            {confidencePct}%
          </span>
        </div>
      </TableCell>
      <TableCell className="text-right font-mono text-muted-foreground hidden sm:table-cell">
        {pick.odds > 0 ? `+${pick.odds}` : pick.odds}
      </TableCell>
    </TableRow>
  );
}

/* ------------------------------------------------------------------ */
/*  Upgrade CTA                                                       */
/* ------------------------------------------------------------------ */

function UpgradeCta() {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 overflow-hidden">
      <CardContent className="p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
            <Crown className="size-6 text-primary" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Unlock Full Access
        </h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Upgrade to Pro for daily picks, full pick history, and advanced paper
          trading tools.
        </p>
        <Link href="/pricing" className={buttonVariants({ size: 'lg' })}>
          View Plans
          <ArrowRight className="size-4 ml-1.5" />
        </Link>
      </CardContent>
    </Card>
  );
}
