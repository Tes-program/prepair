import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Pair, PairSubmission } from '@/types';

export function useAllPairs() {
  const { data: allPairs = [], isLoading: pairsLoading } = useQuery({
    queryKey: ['all-pairs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pairs')
        .select('*')
        .order('week_number', { ascending: true });
      if (error) throw error;
      return data as Pair[];
    },
  });

  const { data: allSubmissions = [], isLoading: subsLoading } = useQuery({
    queryKey: ['all-submissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pair_submissions')
        .select('*');
      if (error) throw error;
      return data as PairSubmission[];
    },
  });

  return {
    allPairs,
    allSubmissions,
    isLoading: pairsLoading || subsLoading,
  };
}
