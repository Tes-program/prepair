import { useEffect, useId } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useConfig() {
  const qc = useQueryClient();
  const id = useId();

  const query = useQuery<number>({
    queryKey: ['config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_config')
        .select('value')
        .eq('key', 'active_week')
        .single();
      if (error) throw error;
      return Number(data.value);
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel(`config-changes-${id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'app_config' },
        () => qc.invalidateQueries({ queryKey: ['config'] }),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc, id]);

  const setActiveWeek = useMutation({
    mutationFn: async (week: number) => {
      const { error } = await supabase
        .from('app_config')
        .upsert({ key: 'active_week', value: week });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['config'] }),
  });

  return {
    activeWeek: query.data ?? 1,
    isLoading: query.isLoading,
    setActiveWeek,
  };
}
