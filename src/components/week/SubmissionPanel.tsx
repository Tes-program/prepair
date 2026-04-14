import { useState, useRef, useCallback, type DragEvent, type ChangeEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { PairSubmission, Problem } from '@/types';

interface SubmissionPanelProps {
  submission: PairSubmission;
  problem: Problem;
  onUpdate: (id: string, patch: Partial<PairSubmission>) => Promise<void>;
  onAssess: (submission: PairSubmission, problem: Problem) => Promise<void>;
  onClear: (id: string) => Promise<void>;
  onUploadImage: (file: File, submissionId: string) => Promise<string>;
  onPublish: (submission: PairSubmission, problem: Problem) => Promise<void>;
}

function extractScore(assessment: string): 'Weak' | 'Acceptable' | 'Strong' | null {
  const match = assessment.match(/\*?\*?Score:\s*(Weak|Acceptable|Strong)/i);
  return match ? (match[1] as 'Weak' | 'Acceptable' | 'Strong') : null;
}

const SCORE_STYLE: Record<string, string> = {
  Weak: 'bg-red-100 text-red-700 border-red-200',
  Acceptable: 'bg-amber-100 text-amber-700 border-amber-200',
  Strong: 'bg-green-100 text-green-700 border-green-200',
};

export function SubmissionPanel({
  submission,
  problem,
  onUpdate,
  onAssess,
  onClear,
  onUploadImage,
  onPublish,
}: SubmissionPanelProps) {
  return (
    <div className="space-y-4">
      {problem.type === 'DSA' && (
        <DSAPanel submission={submission} problem={problem} onUpdate={onUpdate} />
      )}
      {problem.type === 'SD' && (
        <SDPanel
          submission={submission}
          problem={problem}
          onUpdate={onUpdate}
          onUploadImage={onUploadImage}
        />
      )}
      {problem.type === 'DB' && (
        <DBPanel submission={submission} problem={problem} onUpdate={onUpdate} />
      )}

      <AssessmentSection
        submission={submission}
        problem={problem}
        onAssess={onAssess}
        onClear={onClear}
        onPublish={onPublish}
      />
    </div>
  );
}

/* ─────────────── DSA ─────────────── */

function DSAPanel({
  submission,
  problem,
  onUpdate,
}: {
  submission: PairSubmission;
  problem: Problem;
  onUpdate: (id: string, patch: Partial<PairSubmission>) => Promise<void>;
}) {
  const [code, setCode] = useState(submission.code ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate(submission.id, {
        code,
        status: code.trim() ? 'progress' : 'pending',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Java Solution</label>
      <textarea
        className="w-full rounded-md border bg-gray-50 p-3 font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#534AB7]/30"
        rows={14}
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder={
          '// Paste your Java solution here\n// Both pair members should review before submitting'
        }
      />
      {problem.url && (
        <a
          href={problem.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-[#534AB7] hover:underline"
        >
          LeetCode ↗
        </a>
      )}
      <div className="flex gap-2">
        <Button variant="outline" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save Solution'}
        </Button>
      </div>
    </div>
  );
}

/* ─────────────── System Design ─────────────── */

function SDPanel({
  submission,
  problem,
  onUpdate,
  onUploadImage,
}: {
  submission: PairSubmission;
  problem: Problem;
  onUpdate: (id: string, patch: Partial<PairSubmission>) => Promise<void>;
  onUploadImage: (file: File, submissionId: string) => Promise<string>;
}) {
  const [explanation, setExplanation] = useState(submission.explanation ?? '');
  const [imageUrl, setImageUrl] = useState(submission.image_url ?? '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload PNG, JPG, or PDF files only.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File must be under 5 MB.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((p) => Math.min(p + 15, 90));
    }, 200);

    try {
      const url = await onUploadImage(file, submission.id);
      setImageUrl(url);
      setUploadProgress(100);
    } catch {
      alert('Upload failed. Please try again.');
    } finally {
      clearInterval(interval);
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  }, [onUploadImage, submission.id]);

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate(submission.id, {
        explanation,
        image_url: imageUrl || undefined,
        status: explanation.trim() ? 'progress' : 'pending',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-[2fr_3fr]">
        {/* Left: Image upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Architecture Diagram</label>
          <p className="text-xs text-muted-foreground">
            Upload PNG, JPG, or PDF — AI will acknowledge the diagram in feedback
          </p>

          {imageUrl && !uploading ? (
            <div className="relative rounded-lg border p-2">
              {imageUrl.match(/\.(png|jpe?g|gif|webp)(\?.*)?$/i) ? (
                <img
                  src={imageUrl}
                  alt="Architecture diagram"
                  className="max-h-48 w-full rounded object-contain"
                />
              ) : (
                <div className="flex items-center gap-2 p-3 text-sm text-muted-foreground">
                  <span>📄</span>
                  <span className="truncate">Uploaded file</span>
                </div>
              )}
              <button
                onClick={() => setImageUrl('')}
                className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gray-900/60 text-xs text-white hover:bg-gray-900/80"
              >
                ×
              </button>
            </div>
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 transition-colors',
                dragOver ? 'border-[#534AB7] bg-[#534AB7]/5' : 'border-gray-300 hover:border-gray-400',
              )}
            >
              {uploading ? (
                <div className="w-full space-y-2">
                  <p className="text-center text-sm text-muted-foreground">Uploading…</p>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-[#534AB7] transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  <p className="text-sm text-muted-foreground">
                    Drop your diagram here or click to upload
                  </p>
                </>
              )}
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Right: Written Explanation */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Written Explanation</label>
          <p className="text-xs text-muted-foreground">
            Describe your design: components, data flow, trade-offs, and scaling decisions
          </p>
          <textarea
            className="w-full rounded-md border bg-gray-50 p-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#534AB7]/30"
            rows={12}
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder={
              'Describe your architecture...\n\nInclude:\n- Core components and their responsibilities\n- Data flow between components\n- Database design decisions\n- How you handle scale\n- Trade-offs you considered'
            }
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save Design'}
        </Button>
      </div>
    </div>
  );
}

/* ─────────────── Database ─────────────── */

function DBPanel({
  submission,
  problem,
  onUpdate,
}: {
  submission: PairSubmission;
  problem: Problem;
  onUpdate: (id: string, patch: Partial<PairSubmission>) => Promise<void>;
}) {
  const [dbSchema, setDbSchema] = useState(submission.db_schema ?? '');
  const [dbExplanation, setDbExplanation] = useState(submission.db_explanation ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate(submission.id, {
        db_schema: dbSchema,
        db_explanation: dbExplanation,
        status: dbSchema.trim() ? 'progress' : 'pending',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">MySQL Schema</label>
        <p className="text-xs text-muted-foreground">
          Your CREATE TABLE statements, indexes, and constraints
        </p>
        <textarea
          className="w-full rounded-md border bg-gray-50 p-3 font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#534AB7]/30"
          rows={12}
          value={dbSchema}
          onChange={(e) => setDbSchema(e.target.value)}
          placeholder={
            '-- Paste your MySQL schema here\n-- Include CREATE TABLE statements, indexes, foreign keys, and constraints'
          }
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Design Explanation</label>
        <p className="text-xs text-muted-foreground">
          Explain your normalisation decisions, indexing strategy, and any trade-offs
        </p>
        <textarea
          className="w-full rounded-md border bg-gray-50 p-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#534AB7]/30"
          rows={8}
          value={dbExplanation}
          onChange={(e) => setDbExplanation(e.target.value)}
          placeholder={
            'Explain your database design decisions...\n\nInclude:\n- Normalisation approach\n- Why you chose these indexes\n- How you handle multi-tenancy or isolation\n- Any trade-offs or alternatives considered'
          }
        />
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save Schema & Explanation'}
        </Button>
      </div>
    </div>
  );
}

/* ─────────────── Assessment Section (shared) ─────────────── */

function AssessmentSection({
  submission,
  problem,
  onAssess,
  onClear,
  onPublish,
}: {
  submission: PairSubmission;
  problem: Problem;
  onAssess: (submission: PairSubmission, problem: Problem) => Promise<void>;
  onClear: (id: string) => Promise<void>;
  onPublish: (submission: PairSubmission, problem: Problem) => Promise<void>;
}) {
  const [assessing, setAssessing] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');

  const hasContent =
    problem.type === 'DSA'
      ? !!submission.code?.trim()
      : problem.type === 'SD'
        ? !!submission.explanation?.trim()
        : !!submission.db_schema?.trim();

  const handleAssess = async () => {
    setAssessing(true);
    setError('');
    try {
      await onAssess(submission, problem);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Assessment failed');
    } finally {
      setAssessing(false);
    }
  };

  const handleClear = async () => {
    setError('');
    await onClear(submission.id);
  };

  const handlePublish = async () => {
    setPublishing(true);
    setError('');
    try {
      await onPublish(submission, problem);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Notion publish failed');
    } finally {
      setPublishing(false);
    }
  };

  if (submission.assessment) {
    const score = extractScore(submission.assessment);
    return (
      <div className="space-y-3 rounded-lg border bg-gray-50/50 p-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">AI Assessment</span>
          {score && (
            <Badge variant="outline" className={cn('text-xs', SCORE_STYLE[score])}>
              {score}
            </Badge>
          )}
          {submission.assessed_at && (
            <span className="ml-auto text-xs text-muted-foreground">
              Assessed {new Date(submission.assessed_at).toLocaleDateString()}
            </span>
          )}
        </div>
        <div className="prose prose-sm max-w-none text-sm">
          <ReactMarkdown>{submission.assessment}</ReactMarkdown>
        </div>

        {/* Notion publish */}
        {error && (
          <div className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        {submission.notion_url ? (
          <div className="space-y-0.5">
            <a
              href={submission.notion_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0F6E56] hover:underline"
            >
              📓 View in Notion ↗
            </a>
            <p className="text-xs text-muted-foreground">
              Published to shared study database
            </p>
          </div>
        ) : (
          <Button
            variant="outline"
            onClick={handlePublish}
            disabled={publishing}
            className="border-[#0F6E56] text-[#0F6E56] hover:bg-[#0F6E56]/10"
          >
            {publishing ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Publishing to Notion…
              </span>
            ) : (
              'Publish to Notion'
            )}
          </Button>
        )}

        <button
          onClick={handleClear}
          className="text-xs text-[#534AB7] hover:underline"
        >
          Clear &amp; Resubmit
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {error && (
        <div className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </div>
      )}
      <Button
        onClick={handleAssess}
        disabled={!hasContent || assessing || !!submission.assessment}
        className="bg-[#534AB7] hover:bg-[#4339A0]"
      >
        {assessing ? (
          <span className="flex items-center gap-2">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Getting AI Feedback…
          </span>
        ) : (
          'Get AI Feedback'
        )}
      </Button>
    </div>
  );
}
