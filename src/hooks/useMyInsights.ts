import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface MyInsightsData {
  insights: string[];
  lastGenerated?: Date;
  count: number;
}

export const useMyInsights = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['my-insights', profile?.id],
    queryFn: async (): Promise<MyInsightsData> => {
      if (!profile?.id) return { insights: [], count: 0 };

      const today = new Date();
      const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

      const { data, error } = await supabase
        .from('ai_insights')
        .select('json, created_at')
        .eq('athlete_uuid', profile.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching my insights:', error);
        return { insights: [], count: 0 };
      }

      if (!data || data.length === 0) {
        return { insights: [], count: 0 };
      }

      // Extract insights from the JSON structure - solo user focused
      const insights = data.map(item => {
        const insightData = item.json as { message: string; metric: string; severity: string };
        return insightData.message;
      });

      return {
        insights,
        count: insights.length,
        lastGenerated: data.length > 0 ? new Date(data[0].created_at) : undefined
      };
    },
    enabled: !!profile?.id,
    refetchInterval: 300000, // Refetch every 5 minutes
  });
};