
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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

      const { data, error } = await supabase
        .from('vw_readiness_rolling')
        .select('*')
        .eq('athlete_uuid', athleteId)
        .gte('day', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('day', { ascending: true });

      if (error) throw error;
      return data as ReadinessRolling[];
    },
    enabled: !!athleteId
  });

  // Sleep metrics
  const { data: sleepDaily = [] } = useQuery({
    queryKey: ['sleep-daily', athleteId],
    queryFn: async () => {
      if (!athleteId) return [];

      const { data, error } = await supabase
        .from('vw_sleep_daily')
        .select('*')
        .eq('athlete_uuid', athleteId)
        .gte('day', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('day', { ascending: true });

      if (error) throw error;
      return data as SleepDaily[];
    },
    enabled: !!athleteId
  });

  // Training load and ACWR
  const { data: loadACWR = [] } = useQuery({
    queryKey: ['load-acwr', athleteId],
    queryFn: async () => {
      if (!athleteId) return [];

      const { data, error } = await supabase
        .from('vw_load_acwr')
        .select('*')
        .eq('athlete_uuid', athleteId)
        .gte('day', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('day', { ascending: true });

      if (error) throw error;
      return data as LoadACWR[];
    },
    enabled: !!athleteId
  });

  // Get latest strain data
  const { data: latestStrain } = useQuery({
    queryKey: ['latest-strain', athleteId],
    queryFn: async () => {
      if (!athleteId) return null;

      const { data, error } = await supabase
        .from('wearable_raw')
        .select('value, ts')
        .eq('athlete_uuid', athleteId)
        .eq('metric', 'strain')
        .order('ts', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
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
