
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
    queryKey: ['latestInsight_unified', metric, profile?.id],
    queryFn: async (): Promise<Insight | null> => {
      if (!profile?.id) return null;

      const { data, error } = await supabase
        .from('ai_insights')
        .select('id, json, created_at')
        .eq('athlete_uuid', profile.id)
        .eq('json->>metric', metric)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (!data) return null;

      const insightJson = data.json as { metric: string; severity: 'info' | 'amber' | 'red'; message: string };
      return {
        id: data.id,
        metric: insightJson.metric,
        severity: insightJson.severity,
        message: insightJson.message,
        created_at: data.created_at,
      };
    },
    enabled: !!profile?.id,
  });
};
