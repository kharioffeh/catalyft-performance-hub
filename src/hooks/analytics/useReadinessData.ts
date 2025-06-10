
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  generateReadinessData, 
  generateHourlyReadinessData,
  formatChartData,
  formatHourlyChartData
} from '@/services/analytics';
import { MetricDataResult } from './types';

export const useReadinessData = (profileId: string | undefined, period: number) => {
  return useQuery({
    queryKey: ['readiness', period, profileId],
    queryFn: async (): Promise<MetricDataResult | null> => {
      if (!profileId) return null;

      const isHourlyView = period === 1;

      try {
        let data;
        
        if (isHourlyView) {
          data = generateHourlyReadinessData(profileId);
        } else {
          const endDate = new Date();
          const startDate = new Date(endDate.getTime() - period * 24 * 60 * 60 * 1000);

          const { data: realData, error } = await supabase
            .from('vw_readiness_rolling')
            .select('*')
            .eq('athlete_uuid', profileId)
            .gte('day', startDate.toISOString().split('T')[0])
            .order('day', { ascending: true });

          data = (realData && realData.length > 0) ? realData : generateReadinessData(profileId, period);
        }

        if (!data || data.length === 0) return null;

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

        return { 
          latestScore, 
          delta7d, 
          series, 
          secondary,
          tableRows,
          isHourlyView
        };
      } catch (error) {
        console.error('Error fetching readiness data:', error);
        
        // Fallback to mock data
        const data = isHourlyView ? 
          generateHourlyReadinessData(profileId) :
          generateReadinessData(profileId, period);
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
    },
    enabled: !!profileId
  });
};
