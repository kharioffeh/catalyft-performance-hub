import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ActiveSession {
  id: string;
  type: string;
  start_ts: string;
  status: 'active';
  athletes?: {
    name: string;
  };
}

export const useActiveSession = () => {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ['activeSession', profile?.id],
    queryFn: async (): Promise<ActiveSession | null> => {
      if (!profile?.id) return null;
      
      const { data, error } = await supabase
        .from('sessions')
        .select(`
          id,
          type,
          start_ts,
          status,
          athletes!inner(name)
        `)
        .eq('status', 'active')
        .eq('athlete_uuid', profile.id)
        .single();
      
      if (error || !data) return null;
      return data as ActiveSession;
    },
    enabled: !!profile?.id,
    refetchInterval: 5000, // Refetch every 5 seconds to stay synced
  });
};