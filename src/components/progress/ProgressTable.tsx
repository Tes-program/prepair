import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useParticipants } from '@/hooks/useParticipants';
import { useAllPairs } from '@/hooks/useAllPairs';
import type { Pair, PairSubmission, Status } from '@/types';

type CellStatus = Status | 'none';

const STATUS_ICON: Record<CellStatus, { symbol: string; className: string }> = {
  none: { symbol: '—', className: 'text-gray-300' },
  pending: { symbol: '○', className: 'text-gray-400' },
  progress: { symbol: '◐', className: 'text-amber-500' },
  done: { symbol: '✓', className: 'text-green-600 font-bold' },
};

function getParticipantWeekStatus(
  name: string,
  week: number,
  allPairs: Pair[],
  allSubmissions: PairSubmission[],
): CellStatus {
  const pair = allPairs.find(
    (p) =>
      p.week_number === week &&
      (p.member1 === name || p.member2 === name),
  );
  if (!pair) return 'none';

  const subs = allSubmissions.filter(
    (s) => s.pair_id === pair.id && s.week_number === week,
  );
  if (subs.length === 0) return 'pending';
  if (subs.every((s) => s.status === 'done')) return 'done';
  if (subs.some((s) => s.status === 'progress' || s.status === 'done'))
    return 'progress';
  return 'pending';
}

export function ProgressTable() {
  const { participants } = useParticipants();
  const { allPairs, allSubmissions } = useAllPairs();

  if (participants.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">
          No participants yet. Add them in the Admin tab.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-white">
          <TableRow>
            <TableHead className="w-[200px]">Name</TableHead>
            <TableHead className="text-center">W1</TableHead>
            <TableHead className="text-center">W2</TableHead>
            <TableHead className="text-center">W3</TableHead>
            <TableHead className="text-center">W4</TableHead>
            <TableHead className="text-center">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {participants.map((p, idx) => {
            const statuses = [1, 2, 3, 4].map((w) =>
              getParticipantWeekStatus(p.name, w, allPairs, allSubmissions),
            );
            const doneCount = statuses.filter((s) => s === 'done').length;

            return (
              <TableRow
                key={p.id}
                className={idx % 2 === 1 ? 'bg-gray-50/50' : ''}
              >
                <TableCell className="font-medium">{p.name}</TableCell>
                {statuses.map((s, i) => {
                  const icon = STATUS_ICON[s];
                  return (
                    <TableCell key={i} className="text-center">
                      <span className={cn('text-lg', icon.className)}>
                        {icon.symbol}
                      </span>
                    </TableCell>
                  );
                })}
                <TableCell className="text-center">
                  <span
                    className={cn(
                      'inline-flex h-7 min-w-[3rem] items-center justify-center rounded-full px-2 text-xs font-medium',
                      doneCount === 4
                        ? 'bg-green-50 text-green-700'
                        : doneCount >= 2
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-gray-100 text-gray-600',
                    )}
                  >
                    {doneCount}/4
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
