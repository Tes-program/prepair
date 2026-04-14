import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PROBLEMS } from '@/data/problems';
import { useParticipants } from '@/hooks/useParticipants';
import { useConfig } from '@/hooks/useConfig';
import { usePairs } from '@/hooks/usePairs';

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
  const { participants, addParticipant, removeParticipant } = useParticipants();
  const { activeWeek, setActiveWeek } = useConfig();
  const { pairs, generateWeekPairs } = usePairs(activeWeek);

  const [name, setName] = useState('');
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);
  const [generating, setGenerating] = useState(false);

  const nameExists = participants.some(
    (p) => p.name.toLowerCase() === name.trim().toLowerCase(),
  );

  const handleAdd = () => {
    const trimmed = name.trim();
    if (!trimmed || nameExists) return;
    addParticipant.mutate(trimmed);
    setName('');
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await generateWeekPairs(participants);
    } finally {
      setGenerating(false);
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

      {/* Generate Pairs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Generate Pairs — Week {activeWeek}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleGenerate}
            disabled={generating || participants.length < 2}
            className="bg-[#534AB7] hover:bg-[#4339A0]"
          >
            {generating
              ? 'Generating…'
              : pairs.length > 0
                ? 'Regenerate Pairs'
                : 'Generate Pairs'}
          </Button>

          {pairs.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                {pairs.length} pairs generated
              </p>
              <div className="flex flex-wrap gap-2">
                {pairs.map((pair) => (
                  <span
                    key={pair.id}
                    className="inline-flex items-center rounded-full bg-[#EEEDFE] px-3 py-1.5 text-sm text-[#534AB7]"
                  >
                    {pair.member1}
                    <span className="mx-1.5 text-[#534AB7]/50">×</span>
                    {pair.member2 === 'TBD' ? (
                      <span className="text-amber-600">TBD</span>
                    ) : (
                      pair.member2
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}
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
            const isExpanded = expandedWeek === w;

            return (
              <div key={w} className="rounded-lg border">
                <button
                  className="flex w-full items-center justify-between px-4 py-3 text-left"
                  onClick={() => setExpandedWeek(isExpanded ? null : w)}
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
