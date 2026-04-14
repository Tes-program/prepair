import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { SubmissionPanel } from './SubmissionPanel';
import type { Pair, PairSubmission, Problem, Status } from '@/types';

const TYPE_STYLES: Record<string, { bg: string; text: string }> = {
  DSA: { bg: 'bg-[#EEEDFE]', text: 'text-[#534AB7]' },
  SD: { bg: 'bg-[#E1F5EE]', text: 'text-[#0F6E56]' },
  DB: { bg: 'bg-[#FAEEDA]', text: 'text-[#BA7517]' },
};

const STATUS_PILL: Record<Status, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-gray-100 text-gray-600' },
  progress: { label: 'In Progress', className: 'bg-amber-50 text-amber-700' },
  done: { label: 'Done', className: 'bg-green-50 text-green-700' },
};

const SCORE_BADGE: Record<string, string> = {
  Weak: 'bg-red-100 text-red-700',
  Acceptable: 'bg-amber-100 text-amber-700',
  Strong: 'bg-green-100 text-green-700',
};

function extractScore(text: string): string | null {
  const m = text.match(/\*?\*?Score:\s*(Weak|Acceptable|Strong)/i);
  return m ? m[1] : null;
}

function getOverallStatus(submissions: PairSubmission[]): Status {
  if (submissions.length === 0) return 'pending';
  if (submissions.every((s) => s.status === 'done')) return 'done';
  if (submissions.some((s) => s.status === 'progress' || s.status === 'done'))
    return 'progress';
  return 'pending';
}

interface PairCardProps {
  pair: Pair;
  submissions: PairSubmission[];
  problems: Problem[];
  onUpdate: (id: string, patch: Partial<PairSubmission>) => Promise<void>;
  onAssess: (submission: PairSubmission, problem: Problem) => Promise<void>;
  onClear: (id: string) => Promise<void>;
  onUploadImage: (file: File, submissionId: string) => Promise<string>;
  onPublish: (submission: PairSubmission, pair: Pair, problem: Problem) => Promise<void>;
}

export function PairCard({
  pair,
  submissions,
  problems,
  onUpdate,
  onAssess,
  onClear,
  onUploadImage,
  onPublish,
}: PairCardProps) {
  const initialExpanded = submissions.find(
    (s) => s.status === 'progress' || s.status === 'done',
  )?.problem_id ?? null;

  const [expandedProblem, setExpandedProblem] = useState<string | null>(initialExpanded);

  const overallStatus = getOverallStatus(submissions);
  const doneCount = submissions.filter((s) => s.status === 'done').length;
  const pill = STATUS_PILL[overallStatus];

  const toggle = (problemId: string) => {
    setExpandedProblem((prev) => (prev === problemId ? null : problemId));
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold leading-tight">
              {pair.member1}
              <span className="mx-2 text-muted-foreground font-normal">×</span>
              {pair.member2 === 'TBD' ? (
                <span className="text-amber-600">TBD</span>
              ) : (
                pair.member2
              )}
            </h3>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {doneCount}/5 done
            </Badge>
            <Badge className={cn('border-0 text-xs', pill.className)}>
              {pill.label}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-0 pt-0">
        {problems.map((problem) => {
          const sub = submissions.find((s) => s.problem_id === problem.id);
          if (!sub) return null;

          const isExpanded = expandedProblem === problem.id;
          const typeStyle = TYPE_STYLES[problem.type];
          const subPill = STATUS_PILL[sub.status];
          const score = sub.assessment ? extractScore(sub.assessment) : null;

          return (
            <div key={problem.id} className="border-t first:border-t-0">
              <button
                onClick={() => toggle(problem.id)}
                className="flex w-full items-center gap-2 px-1 py-3 text-left text-sm transition-colors hover:bg-gray-50"
              >
                <Badge
                  className={cn(
                    'shrink-0 border-0 text-[11px]',
                    typeStyle.bg,
                    typeStyle.text,
                  )}
                >
                  {problem.type}
                </Badge>
                <span className="flex-1 truncate font-medium">{problem.title}</span>
                {score && (
                  <Badge
                    variant="outline"
                    className={cn('shrink-0 text-[11px]', SCORE_BADGE[score])}
                  >
                    {score}
                  </Badge>
                )}
                <Badge
                  className={cn('shrink-0 border-0 text-[11px]', subPill.className)}
                >
                  {subPill.label}
                </Badge>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {isExpanded ? '−' : '+'}
                </span>
              </button>

              {isExpanded && (
                <div className="px-1 pb-4 pt-1">
                  <p className="mb-3 text-xs text-muted-foreground leading-relaxed">
                    {problem.description}
                  </p>
                  <SubmissionPanel
                    submission={sub}
                    problem={problem}
                    onUpdate={onUpdate}
                    onAssess={onAssess}
                    onClear={onClear}
                    onUploadImage={onUploadImage}
                    onPublish={(s, p) => onPublish(s, pair, p)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
