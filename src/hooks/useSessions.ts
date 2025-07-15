import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Session, SetLog, SessionExercise } from '@/types/training';

export const useSessions = (athleteUuid?: string) => {
  return useQuery({
    queryKey: ['sessions', athleteUuid],
    queryFn: async () => {
      let query = supabase
        .from('sessions')
        .select('*')
        .order('start_ts', { ascending: true });

      if (athleteUuid) {
        query = query.eq('athlete_uuid', athleteUuid);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Map database fields to frontend interface
      return data.map(session => ({
        ...session,
        // Add compatibility mappings
        program_id: session.id, // Use session id as program_id for now
        planned_at: session.start_ts,
        title: `${session.type} Session`,
        exercises: Array.isArray(session.payload) ? [] : (session.payload as any)?.exercises || []
      })) as Session[];
    },
  });
};

export const useSession = (id: string) => {
  return useQuery({
    queryKey: ['session', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      // Map database fields to frontend interface
      return {
        ...data,
        program_id: data.id,
        planned_at: data.start_ts,
        title: `${data.type} Session`,
        exercises: Array.isArray(data.payload) ? [] : (data.payload as any)?.exercises || []
      } as Session;
    },
    enabled: !!id,
  });
};

export const useCreateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionData: Omit<Session, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('sessions')
        .insert({
          athlete_uuid: sessionData.athlete_uuid,
          coach_uuid: sessionData.coach_uuid,
          start_ts: sessionData.start_ts,
          end_ts: sessionData.end_ts,
          type: sessionData.type,
          status: sessionData.status || 'planned',
          notes: sessionData.notes,
          rpe: sessionData.rpe,
          load: sessionData.load,
          payload: sessionData.exercises ? JSON.parse(JSON.stringify({ exercises: sessionData.exercises })) : {}
        })
        .select()
        .single();

      if (error) throw error;
      
      return {
        ...data,
        program_id: data.id,
        planned_at: data.start_ts,
        title: `${data.type} Session`,
        exercises: Array.isArray(data.payload) ? [] : (data.payload as any)?.exercises || []
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
      const updateData: any = {};
      
      if (updates.status) updateData.status = updates.status;
      if (updates.notes) updateData.notes = updates.notes;
      if (updates.rpe) updateData.rpe = updates.rpe;
      if (updates.load) updateData.load = updates.load;
      if (updates.start_ts) updateData.start_ts = updates.start_ts;
      if (updates.end_ts) updateData.end_ts = updates.end_ts;
      if (updates.exercises) updateData.payload = JSON.parse(JSON.stringify({ exercises: updates.exercises }));
        
      const { data, error } = await supabase
        .from('sessions')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      return {
        ...data,
        program_id: data.id,
        planned_at: data.start_ts,
        title: `${data.type} Session`,
        exercises: Array.isArray(data.payload) ? [] : (data.payload as any)?.exercises || []
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
