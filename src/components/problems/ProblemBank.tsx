import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PROBLEMS } from '@/data/problems';
import type { ProblemType } from '@/types';

const TYPE_STYLES: Record<string, { bg: string; text: string }> = {
  DSA: { bg: 'bg-[#EEEDFE]', text: 'text-[#534AB7]' },
  SD: { bg: 'bg-[#E1F5EE]', text: 'text-[#0F6E56]' },
  DB: { bg: 'bg-[#FAEEDA]', text: 'text-[#BA7517]' },
};

const TYPE_LABEL: Record<string, string> = {
  DSA: 'DSA',
  SD: 'System Design',
  DB: 'Database',
};

const DIFF_COLOR: Record<string, string> = {
  Easy: 'text-[#3B6D11]',
  Medium: 'text-[#854F0B]',
  Hard: 'text-[#A32D2D]',
};

type Filter = 'All' | ProblemType;

const FILTERS: { id: Filter; label: string; count: number }[] = [
  { id: 'All', label: 'All', count: PROBLEMS.length },
  { id: 'DSA', label: 'DSA', count: PROBLEMS.filter((p) => p.type === 'DSA').length },
  { id: 'SD', label: 'System Design', count: PROBLEMS.filter((p) => p.type === 'SD').length },
  { id: 'DB', label: 'Database', count: PROBLEMS.filter((p) => p.type === 'DB').length },
];

function ProblemCard({ problem }: { problem: (typeof PROBLEMS)[number] }) {
  const [expanded, setExpanded] = useState(false);
  const typeStyle = TYPE_STYLES[problem.type];
  const showExpandable = problem.type === 'SD' || problem.type === 'DB';

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Badge className={cn(typeStyle.bg, typeStyle.text, 'border-0')}>
            {TYPE_LABEL[problem.type]}
          </Badge>
          <span className={cn('text-xs font-medium', DIFF_COLOR[problem.diff])}>
            {problem.diff}
          </span>
          <Badge variant="outline" className="ml-auto text-xs">
            Week {problem.week}
          </Badge>
        </div>
        <h3 className="mt-2 text-sm font-semibold leading-tight">
          {problem.title}
        </h3>
      </CardHeader>
      <CardContent className="space-y-2">
        {showExpandable ? (
          <div>
            <p
              className={cn(
                'text-xs text-muted-foreground leading-relaxed',
                !expanded && 'line-clamp-2',
              )}
            >
              {problem.description}
            </p>
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-1 text-xs text-[#534AB7] hover:underline"
            >
              {expanded ? 'Show less' : 'Show more'}
            </button>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground leading-relaxed">
            {problem.description}
          </p>
        )}
        <div className="flex flex-wrap gap-1">
          {problem.tags.map((tag) => (
            <span
              key={tag}
              className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
            >
              {tag}
            </span>
          ))}
        </div>
        {problem.type === 'DSA' && problem.url && (
          <a
            href={problem.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-[#534AB7] hover:underline"
          >
            LeetCode ↗
          </a>
        )}
      </CardContent>
    </Card>
  );
}

export function ProblemBank() {
  const [filter, setFilter] = useState<Filter>('All');

  const filtered =
    filter === 'All'
      ? PROBLEMS
      : PROBLEMS.filter((p) => p.type === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = filter === f.id;
          const chipColor =
            f.id === 'DSA'
              ? 'bg-[#534AB7] text-white'
              : f.id === 'SD'
                ? 'bg-[#0F6E56] text-white'
                : f.id === 'DB'
                  ? 'bg-[#BA7517] text-white'
                  : 'bg-[#534AB7] text-white';

          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                active ? chipColor : 'border border-gray-200 text-gray-600 hover:bg-gray-50',
              )}
            >
              {f.label} ({f.count})
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((problem) => (
          <ProblemCard key={problem.id} problem={problem} />
        ))}
      </div>
    </div>
  );
}
