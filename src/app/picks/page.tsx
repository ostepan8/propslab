'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { api, Pick, ApiError } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import UpgradePrompt from '@/components/UpgradePrompt';
import { Card, CardContent } from '@/components/ui/card';
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
import { Target, Filter, Search, Calendar, ArrowRight, FlaskConical } from 'lucide-react';

export default function PicksPage() {
  const { loading: authLoading, isAuthenticated } = useAuth();
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
      const data = await api<Pick[]>(`/picks/history${query}`, { auth: true });
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
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Target className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Picks History</h1>
          <p className="text-sm text-muted-foreground">Browse and filter your historical picks</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative sm:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Filter by stat (e.g. points)"
                value={stat}
                onChange={(e) => setStat(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="relative sm:w-44">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center text-muted-foreground">
              <ArrowRight className="w-4 h-4 hidden sm:block" />
            </div>
            <div className="relative sm:w-44">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button onClick={fetchPicks} size="default">
              <Filter className="w-4 h-4 mr-2" />
              Apply
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <LoadingSpinner />
      ) : picks.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No picks match your filters.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Player</TableHead>
                  <TableHead>Game</TableHead>
                  <TableHead>Prop</TableHead>
                  <TableHead className="text-right">Line</TableHead>
                  <TableHead className="text-right">Actual</TableHead>
                  <TableHead className="text-center">Result</TableHead>
                  <TableHead>Model</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {picks.map((pick) => (
                  <TableRow key={pick.id}>
                    <TableCell className="font-medium text-foreground">{pick.player_name}</TableCell>
                    <TableCell className="text-muted-foreground">{pick.game}</TableCell>
                    <TableCell>
                      <Badge variant={pick.direction === 'over' ? 'default' : 'destructive'} className="mr-2">
                        {pick.direction.toUpperCase()}
                      </Badge>
                      <span className="text-muted-foreground">{pick.stat}</span>
                    </TableCell>
                    <TableCell className="text-right font-mono">{pick.line}</TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">
                      {pick.actual_value != null ? pick.actual_value : '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      {pick.result ? (
                        <Badge
                          variant={
                            pick.result === 'win' ? 'default' :
                            pick.result === 'loss' ? 'destructive' :
                            'secondary'
                          }
                        >
                          {pick.result.toUpperCase()}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <FlaskConical className="w-3.5 h-3.5" />
                        {pick.model_name}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
}
