
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useMetricData = (metric: "readiness" | "sleep" | "load", period: number) => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: [metric, period, profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null;

      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - period * 24 * 60 * 60 * 1000);

      switch (metric) {
        case "readiness": {
          // Fetch detailed readiness data
          const { data, error } = await supabase
            .from('vw_readiness_rolling')
            .select('*')
            .eq('athlete_uuid', profile.id)
            .gte('day', startDate.toISOString().split('T')[0])
            .order('day', { ascending: true });

          if (error) throw error;

          if (!data || data.length === 0) return null;

          // Calculate latest score and delta
          const latestScore = data[data.length - 1]?.readiness_score || 0;
          const prevScore = data.length > 7 ? data[data.length - 8]?.readiness_score : latestScore;
          const delta7d = latestScore - prevScore;

          // Prepare series data for charts
          const series = data.map(item => ({
            x: item.day,
            y: item.readiness_score || 0
          }));

          // Prepare table rows with detailed data
          const tableRows = data.map(item => ({
            day: item.day,
            score: item.readiness_score || 0,
            avg_7d: item.avg_7d || 0,
            avg_30d: item.avg_30d || 0
          }));

          // Mock secondary data (HRV and sleep) - in a real app, this would come from wearable data
          const secondary = data.slice(-14).map(item => ({
            x: item.day,
            y: item.readiness_score || 0,
            hrv: Math.random() * 50 + 25, // Mock HRV data
            sleep: Math.random() * 30 + 70 // Mock sleep quality data
          }));

          return { 
            latestScore, 
            delta7d, 
            series, 
            tableRows,
            secondary
          };
        }

        case "sleep": {
          const { data, error } = await supabase
            .from('vw_sleep_daily')
            .select('*')
            .eq('athlete_uuid', profile.id)
            .gte('day', startDate.toISOString().split('T')[0])
            .order('day', { ascending: true });

          if (error) throw error;

          if (!data || data.length === 0) return null;

          const avgHours = data.reduce((sum, item) => sum + (item.total_sleep_hours || 0), 0) / data.length;
          const recentAvg = data.slice(-7).reduce((sum, item) => sum + (item.total_sleep_hours || 0), 0) / Math.min(7, data.length);
          const previousAvg = data.slice(-14, -7).reduce((sum, item) => sum + (item.total_sleep_hours || 0), 0) / Math.min(7, data.length);
          const delta7d = recentAvg - previousAvg;

          const series = data.map(item => ({
            x: item.day,
            y: item.total_sleep_hours || 0
          }));

          return { avgHours, delta7d, series };
        }

        case "load": {
          const { data, error } = await supabase
            .from('vw_load_acwr')
            .select('*')
            .eq('athlete_uuid', profile.id)
            .gte('day', startDate.toISOString().split('T')[0])
            .order('day', { ascending: true });

          if (error) throw error;

          if (!data || data.length === 0) return null;

          const latestAcwr = data[data.length - 1]?.acwr_7_28 || 0;
          const prevAcwr = data.length > 7 ? data[data.length - 8]?.acwr_7_28 : latestAcwr;
          const delta7d = latestAcwr - prevAcwr;

          const series = data.map(item => ({
            x: item.day,
            y: item.acwr_7_28 || 0
          }));

          return { latestAcwr, delta7d, series };
        }

        default:
          return null;
      }
    },
    enabled: !!profile?.id
  });
};
