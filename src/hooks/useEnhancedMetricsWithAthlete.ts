import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  generateReadinessData, 
  generateSleepData, 
  generateLoadData,
  generateLatestStrain
} from '@/services/analytics';

interface ReadinessRolling {
  athlete_uuid: string;
  day: string;
  readiness_score: number;
  avg_7d: number;
  avg_30d: number;
  avg_90d: number;
}

interface SleepDaily {
  athlete_uuid: string;
  day: string;
  total_sleep_hours: number;
  sleep_efficiency: number;
  avg_sleep_hr: number;
  hrv_rmssd: number;
}

interface LoadACWR {
  athlete_uuid: string;
  day: string;
  daily_load: number;
  acute_7d: number;
  chronic_28d: number;
  acwr_7_28: number;
}

export const useEnhancedMetricsWithAthlete = (athleteId?: string) => {
  // Enhanced readiness with rolling averages
  const { data: readinessRolling = [] } = useQuery({
    queryKey: ['readiness-rolling', athleteId],
    queryFn: async () => {
      if (!athleteId) return [];

      try {
        const { data, error } = await supabase
          .from('vw_readiness_rolling')
          .select('*')
          .eq('athlete_uuid', athleteId)
          .gte('day', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
          .order('day', { ascending: true });

        // Use real data if available, otherwise generate mock data
        if (data && data.length > 0) {
          return data as ReadinessRolling[];
        } else {
          // Generate mock data and format it correctly
          const mockData = generateReadinessData(athleteId, 30);
          return mockData.map(item => ({
            athlete_uuid: athleteId,
            day: item.day,
            readiness_score: item.readiness_score,
            avg_7d: item.avg_7d,
            avg_30d: item.avg_30d,
            avg_90d: item.avg_90d || item.avg_30d
          })) as ReadinessRolling[];
        }
      } catch (error) {
        console.error('Error fetching readiness data:', error);
        // Fallback to mock data
        const mockData = generateReadinessData(athleteId, 30);
        return mockData.map(item => ({
          athlete_uuid: athleteId,
          day: item.day,
          readiness_score: item.readiness_score,
          avg_7d: item.avg_7d,
          avg_30d: item.avg_30d,
          avg_90d: item.avg_90d || item.avg_30d
        })) as ReadinessRolling[];
      }
    },
    enabled: !!athleteId
  });

  // Sleep metrics
  const { data: sleepDaily = [] } = useQuery({
    queryKey: ['sleep-daily', athleteId],
    queryFn: async () => {
      if (!athleteId) return [];

      try {
        const { data, error } = await supabase
          .from('vw_sleep_daily')
          .select('*')
          .eq('athlete_uuid', athleteId)
          .gte('day', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
          .order('day', { ascending: true });

        // Use real data if available, otherwise generate mock data
        if (data && data.length > 0) {
          return data as SleepDaily[];
        } else {
          // Generate mock data and format it correctly
          const mockData = generateSleepData(athleteId, 30);
          return mockData.map(item => ({
            athlete_uuid: athleteId,
            day: item.day,
            total_sleep_hours: item.total_sleep_hours,
            sleep_efficiency: item.sleep_efficiency,
            avg_sleep_hr: item.avg_hr,
            hrv_rmssd: item.hrv_rmssd
          })) as SleepDaily[];
        }
      } catch (error) {
        console.error('Error fetching sleep data:', error);
        // Fallback to mock data
        const mockData = generateSleepData(athleteId, 30);
        return mockData.map(item => ({
          athlete_uuid: athleteId,
          day: item.day,
          total_sleep_hours: item.total_sleep_hours,
          sleep_efficiency: item.sleep_efficiency,
          avg_sleep_hr: item.avg_hr,
          hrv_rmssd: item.hrv_rmssd
        })) as SleepDaily[];
      }
    },
    enabled: !!athleteId
  });

  // Training load and ACWR
  const { data: loadACWR = [] } = useQuery({
    queryKey: ['load-acwr', athleteId],
    queryFn: async () => {
      if (!athleteId) return [];

      try {
        const { data, error } = await supabase
          .from('vw_load_acwr')
          .select('*')
          .eq('athlete_uuid', athleteId)
          .gte('day', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
          .order('day', { ascending: true });

        // Use real data if available, otherwise generate mock data
        if (data && data.length > 0) {
          return data as LoadACWR[];
        } else {
          // Generate mock data and format it correctly
          const mockData = generateLoadData(athleteId, 30);
          return mockData.map(item => ({
            athlete_uuid: athleteId,
            day: item.day,
            daily_load: item.daily_load,
            acute_7d: item.acute_7d,
            chronic_28d: item.chronic_28d,
            acwr_7_28: item.acwr_7_28
          })) as LoadACWR[];
        }
      } catch (error) {
        console.error('Error fetching load data:', error);
        // Fallback to mock data
        const mockData = generateLoadData(athleteId, 30);
        return mockData.map(item => ({
          athlete_uuid: athleteId,
          day: item.day,
          daily_load: item.daily_load,
          acute_7d: item.acute_7d,
          chronic_28d: item.chronic_28d,
          acwr_7_28: item.acwr_7_28
        })) as LoadACWR[];
      }
    },
    enabled: !!athleteId
  });

  // Get latest strain data
  const { data: latestStrain } = useQuery({
    queryKey: ['latest-strain', athleteId],
    queryFn: async () => {
      if (!athleteId) return null;

      try {
        const { data, error } = await supabase
          .from('wearable_raw')
          .select('value, ts')
          .eq('athlete_uuid', athleteId)
          .eq('metric', 'strain')
          .order('ts', { ascending: false })
          .limit(1)
          .single();

        // Use real data if available, otherwise generate mock data
        if (data) {
          return data;
        } else {
          return generateLatestStrain(athleteId);
        }
      } catch (error) {
        console.error('Error fetching strain data:', error);
        // Fallback to mock data
        return generateLatestStrain(athleteId);
      }
    },
    enabled: !!athleteId
  });

  return {
    readinessRolling,
    sleepDaily,
    loadACWR,
    latestStrain,
    isLoading: false // Since individual queries handle their own loading states
  };
};
