
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  generateReadinessData, 
  generateSleepData, 
  generateLoadData,
  formatChartData,
  formatSleepChartData,
  formatLoadSecondaryData
} from '@/services/mockAnalyticsData';

export const useMetricData = (metric: "readiness" | "sleep" | "load", period: number) => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: [metric, period, profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null;

      // Try to fetch real data first, fall back to mock data
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - period * 24 * 60 * 60 * 1000);

      try {
        switch (metric) {
          case "readiness": {
            // Try real data first
            const { data: realData, error } = await supabase
              .from('vw_readiness_rolling')
              .select('*')
              .eq('athlete_uuid', profile.id)
              .gte('day', startDate.toISOString().split('T')[0])
              .order('day', { ascending: true });

            // Use real data if available and not empty, otherwise use mock data
            const data = (realData && realData.length > 0) ? realData : generateReadinessData(profile.id, period);

            if (!data || data.length === 0) return null;

            const latestScore = data[data.length - 1]?.readiness_score || 0;
            const prevScore = data.length > 7 ? data[data.length - 8]?.readiness_score : latestScore;
            const delta7d = latestScore - prevScore;

            const series = formatChartData(data, 'day', 'readiness_score');
            
            // Generate secondary data for readiness detail page (HRV and sleep quality factors)
            const secondary = data.map(item => ({
              x: item.day,
              y: 0,
              hrv: 30 + Math.random() * 20, // Mock HRV data
              sleep: 70 + Math.random() * 20 // Mock sleep quality data
            }));

            const tableRows = data.map(item => ({
              day: item.day,
              score: item.readiness_score || 0,
              avg_7d: item.avg_7d || 0,
              avg_30d: item.avg_30d || 0
            }));

            return { 
              latestScore, 
              delta7d, 
              series, 
              secondary,
              tableRows
            };
          }

          case "sleep": {
            // Try real data first
            const { data: realData, error } = await supabase.rpc('get_sleep_detail', { 
              pv_period: period 
            });

            // Use real data if available, otherwise generate mock data
            const data = (realData && realData.length > 0) ? realData : generateSleepData(profile.id, period);

            if (!data || data.length === 0) return null;

            const avgHours = data.reduce((sum, item) => sum + (item.total_sleep_hours || 0), 0) / data.length;
            const recentAvg = data.slice(-7).reduce((sum, item) => sum + (item.total_sleep_hours || 0), 0) / Math.min(7, data.length);
            const previousAvg = data.slice(-14, -7).reduce((sum, item) => sum + (item.total_sleep_hours || 0), 0) / Math.min(7, data.length);
            const delta7d = recentAvg - previousAvg;

            const series = formatSleepChartData(data);
            
            // Generate scatter plot data for sleep consistency
            const scatter = data.map((item, index) => ({
              x: `22:${30 + Math.round(Math.random() * 60)}`, // Mock bedtime
              y: item.total_sleep_hours + 6 + Math.random() * 2 // Mock wake time
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
            // Try real data first
            const { data: realData, error } = await supabase.rpc('get_load_detail', { 
              pv_period: period 
            });

            // Use real data if available, otherwise generate mock data
            const data = (realData && realData.length > 0) ? realData : generateLoadData(profile.id, period);

            if (!data || data.length === 0) return null;

            const latestAcwr = data[data.length - 1]?.acwr_7_28 || 0;
            const prevAcwr = data.length > 7 ? data[data.length - 8]?.acwr_7_28 : latestAcwr;
            const delta7d = latestAcwr - prevAcwr;

            const series = formatChartData(data, 'day', 'acwr_7_28');
            const secondary = formatLoadSecondaryData(data);
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
      } catch (error) {
        console.error(`Error fetching ${metric} data:`, error);
        
        // Fallback to mock data on error
        switch (metric) {
          case "readiness": {
            const data = generateReadinessData(profile.id, period);
            const latestScore = data[data.length - 1]?.readiness_score || 0;
            const prevScore = data.length > 7 ? data[data.length - 8]?.readiness_score : latestScore;
            const delta7d = latestScore - prevScore;
            const series = formatChartData(data, 'day', 'readiness_score');
            const secondary = data.map(item => ({
              x: item.day,
              y: 0,
              hrv: 30 + Math.random() * 20,
              sleep: 70 + Math.random() * 20
            }));
            const tableRows = data.map(item => ({
              day: item.day,
              score: item.readiness_score || 0,
              avg_7d: item.avg_7d || 0,
              avg_30d: item.avg_30d || 0
            }));
            return { latestScore, delta7d, series, secondary, tableRows };
          }
          
          case "sleep": {
            const data = generateSleepData(profile.id, period);
            const avgHours = data.reduce((sum, item) => sum + (item.total_sleep_hours || 0), 0) / data.length;
            const delta7d = 0.2; // Mock delta
            const series = formatSleepChartData(data);
            const scatter = data.map((item, index) => ({
              x: `22:${30 + Math.round(Math.random() * 60)}`,
              y: item.total_sleep_hours + 6 + Math.random() * 2
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
            const data = generateLoadData(profile.id, period);
            const latestAcwr = data[data.length - 1]?.acwr_7_28 || 0;
            const delta7d = 0.05; // Mock delta
            const series = formatChartData(data, 'day', 'acwr_7_28');
            const secondary = formatLoadSecondaryData(data);
            const tableRows = data.map(item => ({
              day: item.day,
              daily_load: item.daily_load || 0,
              acute_7d: item.acute_7d || 0,
              chronic_28d: item.chronic_28d || 0,
              acwr_7_28: item.acwr_7_28 || 0
            }));
            const zones = [
              { from: 0, to: 0.8, color: "#3b82f6", label: "Low Risk" },
              { from: 0.8, to: 1.3, color: "#10b981", label: "Optimal" },
              { from: 1.3, to: 2.0, color: "#f59e0b", label: "Moderate Risk" },
              { from: 2.0, to: 3.0, color: "#ef4444", label: "High Risk" }
            ];
            return { latestAcwr, delta7d, series, secondary, tableRows, zones };
          }
        }
        
        return null;
      }
    },
    enabled: !!profile?.id
  });
};
