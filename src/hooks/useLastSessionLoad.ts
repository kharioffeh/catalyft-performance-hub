
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useLastSessionLoad = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['last-session-load', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null;

      const { data, error } = await supabase
        .from('sessions')
        .select('load, start_ts')
        .eq('athlete_uuid', profile.id)
        .order('start_ts', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching last session load:', error);
        return null;
      }

      return data?.load || null;
    },
    enabled: !!profile?.id
  });
};
