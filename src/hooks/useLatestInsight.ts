
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Insight {
  id: string;
  metric: string;
  severity: 'info' | 'amber' | 'red';
  message: string;
  created_at: string;
}

export const useLatestInsight = (metric: string) => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['latestInsight', metric, profile?.id],
    queryFn: async (): Promise<Insight | null> => {
      if (!profile?.id) return null;

      const { data, error } = await supabase
        .from('insight_log')
        .select('id, metric, severity, message, created_at')
        .eq('metric', metric)
        .eq('athlete_uuid', profile.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id
  });
};
