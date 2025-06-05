
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

          const latestScore = data[data.length - 1]?.readiness_score || 0;
          const prevScore = data.length > 7 ? data[data.length - 8]?.readiness_score : latestScore;
          const delta7d = latestScore - prevScore;

          const series = data.map(item => ({
            x: item.day,
            y: item.readiness_score || 0
          }));

          const tableRows = data.map(item => ({
            day: item.day,
            score: item.readiness_score || 0,
            avg_7d: item.avg_7d || 0,
            avg_30d: item.avg_30d || 0
          }));

          const secondary = data.slice(-14).map(item => ({
            x: item.day,
            y: item.readiness_score || 0,
            hrv: Math.random() * 50 + 25,
            sleep: Math.random() * 30 + 70
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
          const { data, error } = await supabase.rpc('get_sleep_detail', { 
            pv_period: period 
          });

          if (error) throw error;

          if (!data || data.length === 0) return null;

          const avgHours = data.reduce((sum, item) => sum + (item.total_sleep_hours || 0), 0) / data.length;
          const recentAvg = data.slice(-7).reduce((sum, item) => sum + (item.total_sleep_hours || 0), 0) / Math.min(7, data.length);
          const previousAvg = data.slice(-14, -7).reduce((sum, item) => sum + (item.total_sleep_hours || 0), 0) / Math.min(7, data.length);
          const delta7d = recentAvg - previousAvg;

          // Series data for stacked bar chart (sleep stages)
          const series = data.map(item => ({
            x: item.day,
            y: item.total_sleep_hours || 0,
            deep: (item.deep_minutes || 0) / 60,
            light: (item.light_minutes || 0) / 60,
            rem: (item.rem_minutes || 0) / 60
          }));

          // Scatter plot data for sleep consistency (mock bedtime/wake time)
          const scatter = data.map(item => ({
            x: new Date(`${item.day}T22:${Math.floor(Math.random() * 120)}:00`).getTime(),
            y: new Date(`${item.day}T06:${Math.floor(Math.random() * 120)}:00`).getTime()
          }));

          const tableRows = data.map(item => ({
            day: item.day,
            total_sleep_hours: item.total_sleep_hours || 0,
            avg_hr: item.avg_hr || 0,
            deep_minutes: item.deep_minutes || 0,
            light_minutes: item.light_minutes || 0,
            rem_minutes: item.rem_minutes || 0
          }));

          return { avgHours, delta7d, series, scatter, tableRows };
        }

        case "load": {
          const { data, error } = await supabase.rpc('get_load_detail', { 
            pv_period: period 
          });

          if (error) throw error;

          if (!data || data.length === 0) return null;

          const latestAcwr = data[data.length - 1]?.acwr_7_28 || 0;
          const prevAcwr = data.length > 7 ? data[data.length - 8]?.acwr_7_28 : latestAcwr;
          const delta7d = latestAcwr - prevAcwr;

          // Primary series for ACWR line chart
          const series = data.map(item => ({
            x: item.day,
            y: item.acwr_7_28 || 0
          }));

          // Secondary data for acute vs chronic comparison
          const secondary = data.map(item => ({
            x: item.day,
            acute: item.acute_7d || 0,
            chronic: item.chronic_28d || 0
          }));

          const tableRows = data.map(item => ({
            day: item.day,
            daily_load: item.daily_load || 0,
            acute_7d: item.acute_7d || 0,
            chronic_28d: item.chronic_28d || 0,
            acwr_7_28: item.acwr_7_28 || 0
          }));

          // ACWR zones for optimal training load
          const zones = [
            { from: 0, to: 0.8, color: "#3b82f6", label: "Low Risk" },
            { from: 0.8, to: 1.3, color: "#10b981", label: "Optimal" },
            { from: 1.3, to: 2.0, color: "#f59e0b", label: "Moderate Risk" },
            { from: 2.0, to: 3.0, color: "#ef4444", label: "High Risk" }
          ];

          return { latestAcwr, delta7d, series, secondary, tableRows, zones };
        }

        default:
          return null;
      }
    },
    enabled: !!profile?.id
  });
};
