import { useEffect, useId } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Participant } from '@/types';

export function useParticipants() {
  const qc = useQueryClient();
  const id = useId();

  const query = useQuery<Participant[]>({
    queryKey: ['participants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel(`participants-changes-${id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'participants' },
        () => qc.invalidateQueries({ queryKey: ['participants'] }),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc, id]);

  const addParticipant = useMutation({
    mutationFn: async (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) throw new Error('Name cannot be empty');
      const { error } = await supabase
        .from('participants')
        .insert({ name: trimmed });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['participants'] }),
  });

  const removeParticipant = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('participants')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['participants'] }),
  });

  return {
    participants: query.data ?? [],
    isLoading: query.isLoading,
    addParticipant,
    removeParticipant,
  };
}
