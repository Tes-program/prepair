import { Button } from '@/components/ui/button';
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
import { PairCard } from './PairCard';
import { PROBLEMS } from '@/data/problems';
import { useConfig } from '@/hooks/useConfig';
import { useParticipants } from '@/hooks/useParticipants';
import { usePairs } from '@/hooks/usePairs';
import { useState } from 'react';

export function WeekDashboard() {
  const { activeWeek } = useConfig();
  const { participants } = useParticipants();
  const {
    pairs,
    submissions,
    generateWeekPairs,
    updateSubmission,
    uploadDesignImage,
    requestAssessment,
    clearAssessment,
    publishToNotion,
    getSubmissionsForPair,
  } = usePairs(activeWeek);

  const [generating, setGenerating] = useState(false);

  const weekProblems = PROBLEMS.filter((p) => p.week === activeWeek);
  const hasPairs = pairs.length > 0;

  const donePairsCount = pairs.filter((pair) => {
    const subs = getSubmissionsForPair(pair.id);
    return subs.length > 0 && subs.every((s) => s.status === 'done');
  }).length;

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await generateWeekPairs(participants);
    } finally {
      setGenerating(false);
    }
  };

  if (participants.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-lg font-medium text-gray-900">No participants yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Add participants in the Admin tab to generate pairs.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            Week {activeWeek}
            {hasPairs && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                · {pairs.length} pairs · {weekProblems.length} problems each
              </span>
            )}
          </h2>
          {hasPairs && (
            <p className="text-sm text-muted-foreground">
              {donePairsCount}/{pairs.length} pairs fully done
            </p>
          )}
        </div>

        {hasPairs ? (
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button variant="outline" disabled={generating}>
                  {generating ? 'Generating…' : 'Regenerate Pairs'}
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Regenerate pairs?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will delete all pairs and submissions for Week {activeWeek} and create new random pairings.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleGenerate}
                  className="bg-[#534AB7] hover:bg-[#4339A0]"
                >
                  Regenerate
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <Button
            onClick={handleGenerate}
            disabled={generating}
            className="bg-[#534AB7] hover:bg-[#4339A0]"
          >
            {generating ? 'Generating…' : 'Generate Pairs'}
          </Button>
        )}
      </div>

      {!hasPairs ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">
            No pairs generated for Week {activeWeek} yet. Click the button above to generate.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {pairs.map((pair) => (
            <PairCard
              key={pair.id}
              pair={pair}
              submissions={getSubmissionsForPair(pair.id)}
              problems={weekProblems}
              onUpdate={updateSubmission}
              onAssess={requestAssessment}
              onClear={clearAssessment}
              onUploadImage={uploadDesignImage}
              onPublish={publishToNotion}
            />
          ))}
        </div>
      )}
    </div>
  );
}
