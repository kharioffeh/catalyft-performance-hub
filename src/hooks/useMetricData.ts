
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  generateReadinessData, 
  generateSleepData, 
  generateLoadData,
  generateHourlyReadinessData,
  generateHourlySleepData,
  generateHourlyLoadData,
  formatChartData,
  formatSleepChartData,
  formatLoadSecondaryData,
  formatHourlyChartData,
  formatHourlySleepChartData,
  formatHourlyLoadSecondaryData
} from '@/services/analytics';

export const useMetricData = (metric: "readiness" | "sleep" | "load", period: number) => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: [metric, period, profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null;

      // Handle 24h (1 day) view with hourly data
      const isHourlyView = period === 1;

      try {
        switch (metric) {
          case "readiness": {
            let data;
            
            if (isHourlyView) {
              // Use hourly data for 24h view
              data = generateHourlyReadinessData(profile.id);
            } else {
              // Try real data first, fall back to mock data
              const endDate = new Date();
              const startDate = new Date(endDate.getTime() - period * 24 * 60 * 60 * 1000);

              const { data: realData, error } = await supabase
                .from('vw_readiness_rolling')
                .select('*')
                .eq('athlete_uuid', profile.id)
                .gte('day', startDate.toISOString().split('T')[0])
                .order('day', { ascending: true });

              data = (realData && realData.length > 0) ? realData : generateReadinessData(profile.id, period);
            }

            if (!data || data.length === 0) return null;

            const latestScore = data[data.length - 1]?.readiness_score || 0;
            const prevScore = data.length > (isHourlyView ? 6 : 7) ? 
              data[data.length - (isHourlyView ? 7 : 8)]?.readiness_score : latestScore;
            const delta7d = latestScore - prevScore;

            const series = isHourlyView ? 
              formatHourlyChartData(data, 'day', 'readiness_score') :
              formatChartData(data, 'day', 'readiness_score');
            
            // Generate secondary data for readiness detail page (HRV and sleep quality factors)
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

            return { 
              latestScore, 
              delta7d, 
              series, 
              secondary,
              tableRows,
              isHourlyView
            };
          }

          case "sleep": {
            let data;
            
            if (isHourlyView) {
              data = generateHourlySleepData(profile.id);
            } else {
              // Try real data first
              const { data: realData, error } = await supabase.rpc('get_sleep_detail', { 
                pv_period: period 
              });

              data = (realData && realData.length > 0) ? realData : generateSleepData(profile.id, period);
            }

            if (!data || data.length === 0) return null;

            const avgHours = data.reduce((sum, item) => sum + (item.total_sleep_hours || 0), 0) / data.length;
            const recentAvg = data.slice(-7).reduce((sum, item) => sum + (item.total_sleep_hours || 0), 0) / Math.min(7, data.length);
            const previousAvg = data.slice(-14, -7).reduce((sum, item) => sum + (item.total_sleep_hours || 0), 0) / Math.min(7, data.length);
            const delta7d = recentAvg - previousAvg;

            const series = isHourlyView ?
              formatHourlySleepChartData(data) :
              formatSleepChartData(data);
            
            // Generate scatter plot data for sleep consistency
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

            return { 
              avgHours, 
              delta7d, 
              series, 
              scatter, 
              tableRows,
              isHourlyView
            };
          }

          case "load": {
            let data;
            
            if (isHourlyView) {
              data = generateHourlyLoadData(profile.id);
            } else {
              // Try real data first
              const { data: realData, error } = await supabase.rpc('get_load_detail', { 
                pv_period: period 
              });

              data = (realData && realData.length > 0) ? realData : generateLoadData(profile.id, period);
            }

            if (!data || data.length === 0) return null;

            const latestAcwr = data[data.length - 1]?.acwr_7_28 || 0;
            const prevAcwr = data.length > (isHourlyView ? 6 : 7) ? 
              data[data.length - (isHourlyView ? 7 : 8)]?.acwr_7_28 : latestAcwr;
            const delta7d = latestAcwr - prevAcwr;

            const series = isHourlyView ?
              formatHourlyChartData(data, 'day', 'acwr_7_28') :
              formatChartData(data, 'day', 'acwr_7_28');
            
            const secondary = isHourlyView ?
              formatHourlyLoadSecondaryData(data) :
              formatLoadSecondaryData(data);
            
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

            return { 
              latestAcwr, 
              delta7d, 
              series, 
              secondary, 
              tableRows, 
              zones,
              isHourlyView
            };
          }

          default:
            return null;
        }
      } catch (error) {
        console.error(`Error fetching ${metric} data:`, error);
        
        // Fallback to mock data on error
        switch (metric) {
          case "readiness": {
            const data = isHourlyView ? 
              generateHourlyReadinessData(profile.id) :
              generateReadinessData(profile.id, period);
            const latestScore = data[data.length - 1]?.readiness_score || 0;
            const prevScore = data.length > (isHourlyView ? 6 : 7) ? 
              data[data.length - (isHourlyView ? 7 : 8)]?.readiness_score : latestScore;
            const delta7d = latestScore - prevScore;
            const series = isHourlyView ?
              formatHourlyChartData(data, 'day', 'readiness_score') :
              formatChartData(data, 'day', 'readiness_score');
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
            return { latestScore, delta7d, series, secondary, tableRows, isHourlyView };
          }
          
          case "sleep": {
            const data = isHourlyView ?
              generateHourlySleepData(profile.id) :
              generateSleepData(profile.id, period);
            const avgHours = data.reduce((sum, item) => sum + (item.total_sleep_hours || 0), 0) / data.length;
            const delta7d = 0.2;
            const series = isHourlyView ?
              formatHourlySleepChartData(data) :
              formatSleepChartData(data);
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
            return { avgHours, delta7d, series, scatter, tableRows, isHourlyView };
          }
          
          case "load": {
            const data = isHourlyView ?
              generateHourlyLoadData(profile.id) :
              generateLoadData(profile.id, period);
            const latestAcwr = data[data.length - 1]?.acwr_7_28 || 0;
            const delta7d = 0.05;
            const series = isHourlyView ?
              formatHourlyChartData(data, 'day', 'acwr_7_28') :
              formatChartData(data, 'day', 'acwr_7_28');
            const secondary = isHourlyView ?
              formatHourlyLoadSecondaryData(data) :
              formatLoadSecondaryData(data);
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
            return { latestAcwr, delta7d, series, secondary, tableRows, zones, isHourlyView };
          }
        }
        
        return null;
      }
    },
    enabled: !!profile?.id
  });
};
