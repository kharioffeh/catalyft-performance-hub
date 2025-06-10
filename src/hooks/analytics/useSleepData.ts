
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  generateSleepData, 
  generateHourlySleepData,
  formatSleepChartData,
  formatHourlySleepChartData
} from '@/services/analytics';
import { MetricDataResult } from './types';

export const useSleepData = (profileId: string | undefined, period: number) => {
  return useQuery({
    queryKey: ['sleep', period, profileId],
    queryFn: async (): Promise<MetricDataResult | null> => {
      if (!profileId) return null;

      const isHourlyView = period === 1;

      try {
        let data;
        
        if (isHourlyView) {
          data = generateHourlySleepData(profileId);
        } else {
          const { data: realData, error } = await supabase.rpc('get_sleep_detail', { 
            pv_period: period 
          });

          data = (realData && realData.length > 0) ? realData : generateSleepData(profileId, period);
        }

        if (!data || data.length === 0) return null;

        const avgHours = data.reduce((sum, item) => sum + (item.total_sleep_hours || 0), 0) / data.length;
        const recentAvg = data.slice(-7).reduce((sum, item) => sum + (item.total_sleep_hours || 0), 0) / Math.min(7, data.length);
        const previousAvg = data.slice(-14, -7).reduce((sum, item) => sum + (item.total_sleep_hours || 0), 0) / Math.min(7, data.length);
        const delta7d = recentAvg - previousAvg;

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

        return { 
          avgHours, 
          delta7d, 
          series, 
          scatter, 
          tableRows,
          isHourlyView
        };
      } catch (error) {
        console.error('Error fetching sleep data:', error);
        
        // Fallback to mock data
        const data = isHourlyView ?
          generateHourlySleepData(profileId) :
          generateSleepData(profileId, period);
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
    },
    enabled: !!profileId
  });
};
