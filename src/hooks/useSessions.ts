
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Session, SetLog, SessionExercise } from '@/types/training';

export const useSessions = (programId?: string) => {
  return useQuery({
    queryKey: ['sessions', programId],
    queryFn: async () => {
      let query = supabase
        .from('session')
        .select(`
          *,
          program:program_id (
            id,
            athlete_uuid,
            coach_uuid,
            template:template_id (
              title,
              goal
            )
          )
        `)
        .order('planned_at', { ascending: true });

      if (programId) {
        query = query.eq('program_id', programId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Convert Json exercises to SessionExercise[]
      return data.map(session => ({
        ...session,
        exercises: (session.exercises as unknown as SessionExercise[]) || []
      })) as Session[];
    },
  });
};

export const useSession = (id: string) => {
  return useQuery({
    queryKey: ['session', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('session')
        .select(`
          *,
          program:program_id (
            id,
            athlete_uuid,
            coach_uuid,
            template:template_id (
              title,
              goal
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      
      // Convert Json exercises to SessionExercise[]
      return {
        ...data,
        exercises: (data.exercises as unknown as SessionExercise[]) || []
      } as Session;
    },
    enabled: !!id,
  });
};

export const useCreateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionData: Omit<Session, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('session')
        .insert({
          ...sessionData,
          exercises: sessionData.exercises as unknown as any
        })
        .select()
        .single();

      if (error) throw error;
      
      return {
        ...data,
        exercises: (data.exercises as unknown as SessionExercise[]) || []
      } as Session;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
};

export const useUpdateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Session> & { id: string }) => {
      const updateData = updates.exercises 
        ? { ...updates, exercises: updates.exercises as unknown as any }
        : updates;
        
      const { data, error } = await supabase
        .from('session')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      return {
        ...data,
        exercises: (data.exercises as unknown as SessionExercise[]) || []
      } as Session;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['session', data.id] });
    },
  });
};

export const useSetLogs = (sessionId: string) => {
  return useQuery({
    queryKey: ['set-logs', sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('set_log')
        .select(`
          *,
          exercise:exercise_id (
            id,
            name,
            category,
            primary_muscle
          )
        `)
        .eq('session_id', sessionId)
        .order('set_no', { ascending: true });

      if (error) throw error;
      return data as SetLog[];
    },
    enabled: !!sessionId,
  });
};

export const useCreateSetLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (setLogData: Omit<SetLog, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('set_log')
        .insert(setLogData)
        .select()
        .single();

      if (error) throw error;
      return data as SetLog;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['set-logs', data.session_id] });
    },
  });
};
