import { PairCard } from './PairCard';
import { PROBLEMS } from '@/data/problems';
import { useConfig } from '@/hooks/useConfig';
import { usePairs } from '@/hooks/usePairs';

export function WeekDashboard() {
  const { activeWeek } = useConfig();
  const {
    pairs,
    updateSubmission,
    uploadDesignImage,
    requestAssessment,
    clearAssessment,
    publishToNotion,
    getSubmissionsForPair,
  } = usePairs(activeWeek);

  const weekProblems = PROBLEMS.filter((p) => p.week === activeWeek);
  const hasPairs = pairs.length > 0;

  const donePairsCount = pairs.filter((pair) => {
    const subs = getSubmissionsForPair(pair.id);
    return subs.length > 0 && subs.every((s) => s.status === 'done');
  }).length;

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
      </div>

      {!hasPairs ? (
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-center">
          <p className="text-sm text-blue-800">
            Pairings for this week haven&apos;t been generated yet. An admin can generate them from the Admin tab.
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
