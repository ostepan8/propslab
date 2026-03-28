'use client';

import { useEffect, useState } from 'react';
import { api, LeaderboardModel } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Trophy,
  Medal,
  TrendingUp,
  BarChart3,
  Target,
  Hash,
  FlaskConical,
} from 'lucide-react';

function RankCell({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="inline-flex items-center gap-1 text-amber-500 font-bold">
        <Trophy className="size-4" />
        1
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className="inline-flex items-center gap-1 text-zinc-400 font-bold">
        <Medal className="size-4" />
        2
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span className="inline-flex items-center gap-1 text-amber-700 font-bold">
        <Medal className="size-4" />
        3
      </span>
    );
  }
  return <span className="text-muted-foreground font-mono">{rank}</span>;
}

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
      <div className="flex items-center gap-3 mb-2">
        <Trophy className="size-7 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Model Leaderboard</h1>
      </div>
      <p className="text-muted-foreground text-sm mb-8">
        All models ranked by backtested ROI. Click a model for details.
      </p>

      {loading ? (
        <LoadingSpinner />
      ) : models.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No models available yet.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <Table data-testid="leaderboard-table">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">
                    <span className="inline-flex items-center gap-1">
                      <Hash className="size-3" /> Rank
                    </span>
                  </TableHead>
                  <TableHead>
                    <span className="inline-flex items-center gap-1">
                      <FlaskConical className="size-3" /> Model
                    </span>
                  </TableHead>
                  <TableHead>
                    <span className="inline-flex items-center gap-1">
                      <Target className="size-3" /> Stat
                    </span>
                  </TableHead>
                  <TableHead className="text-right">
                    <span className="inline-flex items-center gap-1 justify-end">
                      <TrendingUp className="size-3" /> ROI
                    </span>
                  </TableHead>
                  <TableHead className="text-right">Win Rate</TableHead>
                  <TableHead className="text-right">
                    <span className="inline-flex items-center gap-1 justify-end">
                      <BarChart3 className="size-3" /> Total Bets
                    </span>
                  </TableHead>
                  <TableHead className="text-right">P-Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {models.map((m, i) => {
                  const rank = i + 1;
                  const roiPct = (m.roi_net * 100).toFixed(1);
                  const winPct = (m.win_rate * 100).toFixed(1);
                  const pVal = m.p_value.toFixed(4);

                  return (
                    <TableRow key={m.name}>
                      <TableCell>
                        <RankCell rank={rank} />
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
                          <FlaskConical className="size-3.5 text-primary/60" />
                          {m.display_name}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{m.stat}</Badge>
                      </TableCell>
                      <TableCell
                        className={`text-right font-mono font-semibold ${
                          m.roi_net >= 0 ? 'text-positive' : 'text-negative'
                        }`}
                      >
                        {m.roi_net >= 0 ? '+' : ''}
                        {roiPct}%
                      </TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">
                        {winPct}%
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground font-mono">
                        {m.total_bets}
                      </TableCell>
                      <TableCell
                        className={`text-right font-mono ${
                          m.p_value < 0.05 ? 'text-positive' : 'text-warning'
                        }`}
                      >
                        {pVal}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
}
