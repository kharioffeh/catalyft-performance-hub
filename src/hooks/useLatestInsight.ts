
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
    queryKey: ['latestInsight_v2', metric, profile?.id],
    queryFn: async (): Promise<Insight | null> => {
      if (!profile?.id) return null;

      const { data, error } = await supabase
        .from('aria_insights_v')
        .select('id, json, created_at')
        .eq('athlete_uuid', profile.id)
        .eq('json->>metric', metric)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      return data
        ? {
            id: data.id,
            metric: data.json.metric,
            severity: data.json.severity as 'info' | 'amber' | 'red',
            message: data.json.message,
            created_at: data.created_at,
          }
        : null;
    },
    enabled: !!profile?.id,
  });
};
