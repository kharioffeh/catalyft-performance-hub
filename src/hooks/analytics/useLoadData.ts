
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  generateLoadData, 
  generateHourlyLoadData,
  formatChartData,
  formatLoadSecondaryData,
  formatHourlyChartData,
  formatHourlyLoadSecondaryData
} from '@/services/analytics';
import { MetricDataResult } from './types';

export const useLoadData = (profileId: string | undefined, period: number) => {
  return useQuery({
    queryKey: ['load', period, profileId],
    queryFn: async (): Promise<MetricDataResult | null> => {
      if (!profileId) return null;

      const isHourlyView = period === 1;

      try {
        let data;
        
        if (isHourlyView) {
          data = generateHourlyLoadData(profileId);
        } else {
          const { data: realData, error } = await supabase.rpc('get_load_detail', { 
            pv_period: period 
          });

          data = (realData && realData.length > 0) ? realData : generateLoadData(profileId, period);
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
      } catch (error) {
        console.error('Error fetching load data:', error);
        
        // Fallback to mock data
        const data = isHourlyView ?
          generateHourlyLoadData(profileId) :
          generateLoadData(profileId, period);
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
    },
    enabled: !!profileId
  });
};
