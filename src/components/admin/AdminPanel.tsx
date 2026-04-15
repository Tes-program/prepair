import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PROBLEMS } from '@/data/problems';
import { useParticipants } from '@/hooks/useParticipants';
import { useConfig } from '@/hooks/useConfig';
import { usePairs } from '@/hooks/usePairs';
import { useAllPairs } from '@/hooks/useAllPairs';

const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET as string;
const STORAGE_KEY = 'preppair_admin_unlocked';

function useAdminGate() {
  const [unlocked, setUnlocked] = useState(
    () => sessionStorage.getItem(STORAGE_KEY) === 'true',
  );

  const unlock = (secret: string): boolean => {
    if (secret === ADMIN_SECRET) {
      sessionStorage.setItem(STORAGE_KEY, 'true');
      setUnlocked(true);
      return true;
    }
    return false;
  };

  return { unlocked, unlock };
}

function AdminGate({ onUnlock }: { onUnlock: (secret: string) => boolean }) {
  const [secret, setSecret] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = () => {
    if (!onUnlock(secret.trim())) {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="relative">
      {/* Blurred placeholder behind the gate */}
      <div className="pointer-events-none select-none blur-md" aria-hidden>
        <div className="space-y-6">
          <Card><CardContent className="py-8"><div className="h-32 rounded bg-gray-100" /></CardContent></Card>
          <Card><CardContent className="py-8"><div className="h-24 rounded bg-gray-100" /></CardContent></Card>
          <Card><CardContent className="py-8"><div className="h-20 rounded bg-gray-100" /></CardContent></Card>
        </div>
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Card className="w-full max-w-sm shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#534AB7]/10">
              <svg className="h-6 w-6 text-[#534AB7]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <CardTitle className="text-lg">Admin Access</CardTitle>
            <p className="text-sm text-muted-foreground">
              Enter the admin secret to unlock this section
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              type="password"
              placeholder="Admin secret…"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              autoFocus
            />
            {error && (
              <p className="text-xs text-red-500">Incorrect secret. Try again.</p>
            )}
            <Button
              onClick={handleSubmit}
              disabled={!secret.trim()}
              className="w-full bg-[#534AB7] hover:bg-[#4339A0]"
            >
              Unlock
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const TYPE_DOT: Record<string, string> = {
  DSA: 'bg-[#534AB7]',
  SD: 'bg-[#0F6E56]',
  DB: 'bg-[#BA7517]',
};

const DIFF_COLOR: Record<string, string> = {
  Easy: 'text-[#3B6D11]',
  Medium: 'text-[#854F0B]',
  Hard: 'text-[#A32D2D]',
};

export function AdminPanel() {
  const { unlocked, unlock } = useAdminGate();

  if (!unlocked) {
    return <AdminGate onUnlock={unlock} />;
  }

  return <AdminContent />;
}

function AdminContent() {
  const { participants, addParticipant, removeParticipant } = useParticipants();
  const { activeWeek, setActiveWeek } = useConfig();
  const { generateWeekPairs, clearWeekPairs } = usePairs(activeWeek);
  const { allPairs, allSubmissions } = useAllPairs();

  const [name, setName] = useState('');
  const [expandedPairWeek, setExpandedPairWeek] = useState<number | null>(null);
  const [expandedScheduleWeek, setExpandedScheduleWeek] = useState<number | null>(null);
  const [loadingWeek, setLoadingWeek] = useState<number | null>(null);

  const nameExists = participants.some(
    (p) => p.name.toLowerCase() === name.trim().toLowerCase(),
  );

  const handleAdd = () => {
    const trimmed = name.trim();
    if (!trimmed || nameExists) return;
    addParticipant.mutate(trimmed);
    setName('');
  };

  const handleGenerate = async (weekNumber: number) => {
    setLoadingWeek(weekNumber);
    try {
      await generateWeekPairs(participants, weekNumber);
    } finally {
      setLoadingWeek(null);
    }
  };

  const handleRegenerate = async (weekNumber: number) => {
    setLoadingWeek(weekNumber);
    try {
      await clearWeekPairs(weekNumber);
      await generateWeekPairs(participants, weekNumber);
    } finally {
      setLoadingWeek(null);
    }
  };

  const handleClearWeek = async (weekNumber: number) => {
    setLoadingWeek(weekNumber);
    try {
      await clearWeekPairs(weekNumber);
    } finally {
      setLoadingWeek(null);
    }
  };

  const isOdd = participants.length % 2 !== 0;

  return (
    <div className="space-y-6">
      {/* Participants */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {participants.length} participants
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add participant name…"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <Button onClick={handleAdd} disabled={!name.trim() || nameExists}>
              Add
            </Button>
          </div>
          {nameExists && (
            <p className="text-xs text-red-500">Name already exists</p>
          )}
          <div className="flex flex-wrap gap-2">
            {participants.map((p) => (
              <span
                key={p.id}
                className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm"
              >
                {p.name}
                <button
                  onClick={() => removeParticipant.mutate(p.id)}
                  className="ml-1 text-gray-400 hover:text-red-500"
                >
                  &times;
                </button>
              </span>
            ))}
            {participants.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No participants yet. Add names above to get started.
              </p>
            )}
          </div>
          {isOdd && participants.length > 0 && (
            <div className="rounded-md bg-amber-50 px-4 py-2 text-sm text-amber-700">
              Odd number of participants — last person will need manual pairing.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pair Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pair Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4].map((weekNumber) => {
            const weekPairs = allPairs.filter((p) => p.week_number === weekNumber);
            const pairIds = new Set(weekPairs.map((p) => p.id));
            const weekSubmissions = allSubmissions.filter((s) => pairIds.has(s.pair_id));
            const isExpanded = expandedPairWeek === weekNumber;
            const hasPairs = weekPairs.length > 0;
            const isComplete =
              hasPairs &&
              weekSubmissions.length > 0 &&
              weekSubmissions.every((s) => s.status === 'done');
            const status = !hasPairs ? 'not_generated' : isComplete ? 'complete' : 'in_progress';

            const statusBadge =
              status === 'not_generated'
                ? { label: 'Not generated', className: 'bg-gray-100 text-gray-700' }
                : status === 'complete'
                  ? { label: 'Complete', className: 'bg-green-100 text-green-700' }
                  : { label: 'In progress', className: 'bg-amber-100 text-amber-700' };

            const expectedPairs = Math.ceil(participants.length / 2);
            const weekLoading = loadingWeek === weekNumber;

            return (
              <div key={weekNumber} className="rounded-lg border">
                <button
                  className="flex w-full items-center justify-between px-4 py-3 text-left"
                  onClick={() => setExpandedPairWeek(isExpanded ? null : weekNumber)}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium">Week {weekNumber}</span>
                    <Badge className={cn('border-0 text-xs', statusBadge.className)}>
                      {statusBadge.label}
                    </Badge>
                  </div>
                  <span className="text-muted-foreground">{isExpanded ? '−' : '+'}</span>
                </button>

                {isExpanded && (
                  <div className="space-y-4 border-t px-4 py-3">
                    {!hasPairs ? (
                      <div className="space-y-2">
                        <Button
                          onClick={() => handleGenerate(weekNumber)}
                          disabled={participants.length === 0 || weekLoading}
                          className="bg-[#534AB7] hover:bg-[#4339A0]"
                        >
                          {weekLoading ? 'Generating…' : `Generate Week ${weekNumber} Pairs`}
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          {participants.length} participants · {expectedPairs} pairs will be created
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <AlertDialog>
                          <AlertDialogTrigger
                            render={
                              <Button
                                variant="outline"
                                className="border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800"
                                disabled={participants.length === 0 || weekLoading}
                              >
                                {weekLoading ? 'Regenerating…' : `Regenerate Week ${weekNumber} Pairs`}
                              </Button>
                            }
                          />
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Regenerate Week {weekNumber} Pairings?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will delete all existing pairs, submissions, solutions, and AI assessments for Week {weekNumber}. This cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRegenerate(weekNumber)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Yes, regenerate
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <div className="border-t pt-3">
                          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Danger Zone
                          </p>
                          <AlertDialog>
                            <AlertDialogTrigger
                              render={
                                <button
                                  className="text-sm text-red-600 hover:text-red-700 hover:underline disabled:cursor-not-allowed disabled:text-red-300"
                                  disabled={weekLoading}
                                >
                                  Clear Week {weekNumber} Data
                                </button>
                              }
                            />
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Clear all Week {weekNumber} data?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This permanently deletes all pairs and submissions for Week {weekNumber} including any saved solutions and AI assessments. Use this only to start the week fresh.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleClearWeek(weekNumber)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Clear Week {weekNumber}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    )}

                    {hasPairs && (
                      <div className="rounded-md bg-gray-50 p-3">
                        <p className="mb-2 text-xs font-medium text-muted-foreground">
                          {weekPairs.length} pairs · {weekSubmissions.length} submissions
                        </p>
                        <div className="space-y-1">
                          {weekPairs.map((pair) => (
                            <p
                              key={pair.id}
                              className="flex items-center gap-2 text-sm text-gray-700"
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-[#534AB7]" />
                              {pair.member1} &amp; {pair.member2}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Active Week */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Active week</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((w) => (
              <Button
                key={w}
                variant={activeWeek === w ? 'default' : 'outline'}
                onClick={() => setActiveWeek.mutate(w)}
                className={cn(
                  activeWeek === w && 'bg-[#534AB7] hover:bg-[#4339A0]',
                )}
              >
                W{w}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 4-Week Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">4-Week Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[1, 2, 3, 4].map((w) => {
            const weekProblems = PROBLEMS.filter((p) => p.week === w);
            const isExpanded = expandedScheduleWeek === w;

            return (
              <div key={w} className="rounded-lg border">
                <button
                  className="flex w-full items-center justify-between px-4 py-3 text-left"
                  onClick={() => setExpandedScheduleWeek(isExpanded ? null : w)}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium">Week {w}</span>
                    <span className="text-sm text-muted-foreground">
                      {Math.floor(participants.length / 2)} pairs · {weekProblems.length} problems each
                    </span>
                  </div>
                  <span className="text-muted-foreground">
                    {isExpanded ? '−' : '+'}
                  </span>
                </button>

                {isExpanded && (
                  <div className="space-y-2 border-t px-4 py-3">
                    {weekProblems.map((problem) => (
                      <div
                        key={problem.id}
                        className="flex items-center gap-2.5 text-sm"
                      >
                        <span
                          className={cn(
                            'h-2.5 w-2.5 shrink-0 rounded-full',
                            TYPE_DOT[problem.type],
                          )}
                        />
                        <span className="min-w-[40px] text-xs text-muted-foreground">
                          {problem.type}
                        </span>
                        <span>{problem.title}</span>
                        <span
                          className={cn(
                            'ml-auto text-xs font-medium',
                            DIFF_COLOR[problem.diff],
                          )}
                        >
                          {problem.diff}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
