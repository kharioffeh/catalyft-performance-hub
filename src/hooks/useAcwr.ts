
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useAcwr = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['acwr', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null;

      const { data, error } = await supabase
        .from('vw_load_acwr')
        .select('acwr_7_28')
        .eq('athlete_uuid', profile.id)
        .order('day', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching ACWR:', error);
        return null;
      }

      return data?.acwr_7_28 || null;
    },
    enabled: !!profile?.id
  });
};
