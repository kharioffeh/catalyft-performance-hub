
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UseAriaInsightsParams {
  athleteId?: string;
  period?: 'today' | 'week';
}

export const useAriaInsights = ({ athleteId, period = 'today' }: UseAriaInsightsParams = {}) => {
  const { profile } = useAuth();
  const targetAthleteId = athleteId || profile?.id;

  return useQuery({
    queryKey: ['aria-insights', targetAthleteId, period],
    queryFn: async () => {
      if (!targetAthleteId) return null;

      const today = new Date();
      const startDate = period === 'today' 
        ? new Date(today.getFullYear(), today.getMonth(), today.getDate())
        : new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      const { data, error } = await supabase
        .from('ai_insights')
        .select('json')
        .eq('athlete_uuid', targetAthleteId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) {
        console.error('Error fetching ARIA insights:', error);
        return null;
      }

      if (!data || data.length === 0) return null;

      // Extract insights from the JSON structure
      const insights = data.map(item => {
        const insightData = item.json as { message: string; metric: string; severity: string };
        return insightData.message;
      });

      return insights.join(' ');
    },
    enabled: !!targetAthleteId
  });
};
