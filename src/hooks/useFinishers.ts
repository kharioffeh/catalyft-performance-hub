import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Protocol } from './useProtocols';

interface SessionFinisher {
  id: string;
  session_id: string;
  protocol_id: string;
  auto_assigned: boolean;
  created_at: string;
  mobility_protocols?: Protocol;
}

export const useGenerateFinishers = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { data, error } = await supabase.functions.invoke('generateFinishers', {
        body: { session_id: sessionId }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data, sessionId) => {
      // Invalidate session finishers query to refetch
      queryClient.invalidateQueries({ queryKey: ['session-finishers', sessionId] });
    }
  });
};

export const useSessionFinisher = (sessionId: string | null) => {
  return useQuery({
    queryKey: ['session-finishers', sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      
      const { data, error } = await supabase
        .from('session_finishers')
        .select(`
          *,
          mobility_protocols(*)
        `)
        .eq('session_id', sessionId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
      return data;
    },
    enabled: !!sessionId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAssignFinisher = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ sessionId, protocolId }: { sessionId: string; protocolId: string }) => {
      const { data, error } = await supabase
        .from('session_finishers')
        .upsert({
          session_id: sessionId,
          protocol_id: protocolId,
          auto_assigned: false,
          created_at: new Date().toISOString()
        }, {
          onConflict: 'session_id'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidate session finishers query to refetch
      queryClient.invalidateQueries({ queryKey: ['session-finishers', variables.sessionId] });
    }
  });
};

export type { SessionFinisher };