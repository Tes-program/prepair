import { useEffect, useId } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { generatePairs } from '@/lib/pairing';
import { PROBLEMS } from '@/data/problems';
import type { Pair, PairSubmission, Participant, Problem } from '@/types';

export function usePairs(activeWeek: number) {
  const qc = useQueryClient();
  const hookId = useId();

  const { data: pairs = [], isLoading: pairsLoading } = useQuery({
    queryKey: ['pairs', activeWeek],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pairs')
        .select('*')
        .eq('week_number', activeWeek)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as Pair[];
    },
  });

  const { data: submissions = [], isLoading: subsLoading } = useQuery({
    queryKey: ['submissions', activeWeek],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pair_submissions')
        .select('*')
        .eq('week_number', activeWeek)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as PairSubmission[];
    },
  });

  useEffect(() => {
    const pairsCh = supabase
      .channel(`pairs-w${activeWeek}-${hookId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'pairs',
        filter: `week_number=eq.${activeWeek}`,
      }, () => qc.invalidateQueries({ queryKey: ['pairs', activeWeek] }))
      .subscribe();

    const subsCh = supabase
      .channel(`subs-w${activeWeek}-${hookId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'pair_submissions',
        filter: `week_number=eq.${activeWeek}`,
      }, () => qc.invalidateQueries({ queryKey: ['submissions', activeWeek] }))
      .subscribe();

    return () => {
      supabase.removeChannel(pairsCh);
      supabase.removeChannel(subsCh);
    };
  }, [activeWeek, qc, hookId]);

  const generateWeekPairs = async (participants: Participant[]) => {
    // Delete existing pairs (cascade deletes submissions)
    await supabase.from('pairs').delete().eq('week_number', activeWeek);

    const weekProblems = PROBLEMS.filter((p) => p.week === activeWeek);
    const newPairs = generatePairs(participants, activeWeek);

    for (const pair of newPairs) {
      const { data: inserted, error } = await supabase
        .from('pairs')
        .insert(pair)
        .select()
        .single();
      if (error) throw error;

      const submissionRows = weekProblems.map((p) => ({
        pair_id: inserted.id,
        week_number: activeWeek,
        problem_id: p.id,
        status: 'pending' as const,
      }));

      const { error: subError } = await supabase
        .from('pair_submissions')
        .insert(submissionRows);
      if (subError) throw subError;
    }

    qc.invalidateQueries({ queryKey: ['pairs', activeWeek] });
    qc.invalidateQueries({ queryKey: ['submissions', activeWeek] });
  };

  const updateSubmission = async (id: string, patch: Partial<PairSubmission>) => {
    const { error } = await supabase
      .from('pair_submissions')
      .update(patch)
      .eq('id', id);
    if (error) throw error;
    qc.invalidateQueries({ queryKey: ['submissions', activeWeek] });
  };

  const uploadDesignImage = async (file: File, submissionId: string): Promise<string> => {
    const ext = file.name.split('.').pop();
    const path = `${submissionId}.${ext}`;
    const { error } = await supabase.storage
      .from('design-images')
      .upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from('design-images').getPublicUrl(path);
    return data.publicUrl;
  };

  const requestAssessment = async (submission: PairSubmission, problem: Problem) => {
    if (submission.assessment) return;

    const body = {
      problemTitle: problem.title,
      problemDescription: problem.description,
      problemType: problem.type,
      code: submission.code,
      explanation: submission.explanation,
      imageUrl: submission.image_url,
      dbSchema: submission.db_schema,
      dbExplanation: submission.db_explanation,
    };

    const res = await fetch('/api/assess', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Assessment failed');
    }

    const { assessment } = await res.json();
    await updateSubmission(submission.id, {
      assessment,
      assessed_at: new Date().toISOString(),
      status: 'done',
    });
  };

  const clearAssessment = async (id: string) => {
    await updateSubmission(id, {
      assessment: undefined,
      assessed_at: undefined,
      status: 'progress',
    });
  };

  const publishToNotion = async (
    submission: PairSubmission,
    pair: Pair,
    problem: Problem,
  ) => {
    if (submission.notion_url) return;
    if (!submission.assessment) throw new Error('Get AI feedback before publishing');
    if (submission.status !== 'done') throw new Error('Mark submission as done first');

    const body = {
      problemTitle: problem.title,
      problemType: problem.type,
      problemDescription: problem.description,
      problemDifficulty: problem.diff,
      problemUrl: problem.url,
      weekNumber: pair.week_number,
      member1: pair.member1,
      member2: pair.member2,
      code: submission.code,
      explanation: submission.explanation,
      imageUrl: submission.image_url,
      dbSchema: submission.db_schema,
      dbExplanation: submission.db_explanation,
      assessment: submission.assessment,
    };

    const res = await fetch('/api/publish-notion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Notion publish failed');
    }

    const { url } = await res.json();
    await updateSubmission(submission.id, { notion_url: url });
  };

  return {
    pairs,
    submissions,
    isLoading: pairsLoading || subsLoading,
    generateWeekPairs,
    updateSubmission,
    uploadDesignImage,
    requestAssessment,
    clearAssessment,
    publishToNotion,
    getSubmissionsForPair: (pairId: string) =>
      submissions.filter((s) => s.pair_id === pairId),
  };
}
