
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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

interface MuscleLoad {
  user_id: string;
  muscle_name: string;
  load_score: number;
  date: string;
}

export const useEnhancedMetrics = () => {
  const { profile } = useAuth();

  // Enhanced readiness with rolling averages
  const { data: readinessRolling = [] } = useQuery({
    queryKey: ['readiness-rolling', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data, error } = await supabase
        .from('vw_readiness_rolling')
        .select('*')
        .eq('athlete_uuid', profile.id)
        .gte('day', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('day', { ascending: true });

      if (error) throw error;
      return data as ReadinessRolling[];
    },
    enabled: !!profile?.id
  });

  // Sleep metrics
  const { data: sleepDaily = [] } = useQuery({
    queryKey: ['sleep-daily', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data, error } = await supabase
        .from('vw_sleep_daily')
        .select('*')
        .eq('athlete_uuid', profile.id)
        .gte('day', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('day', { ascending: true });

      if (error) throw error;
      return data as SleepDaily[];
    },
    enabled: !!profile?.id
  });

  // Training load and ACWR
  const { data: loadACWR = [] } = useQuery({
    queryKey: ['load-acwr', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data, error } = await supabase
        .from('vw_load_acwr')
        .select('*')
        .eq('athlete_uuid', profile.id)
        .gte('day', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('day', { ascending: true });

      if (error) throw error;
      return data as LoadACWR[];
    },
    enabled: !!profile?.id
  });

  // Muscle load data for heatmap
  const { data: muscleLoads = [] } = useQuery({
    queryKey: ['muscle-loads', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('muscle_load_daily')
        .select('*')
        .eq('user_id', profile.id)
        .eq('date', today);

      if (error) throw error;
      return data as MuscleLoad[];
    },
    enabled: !!profile?.id
  });

  // Get latest strain data
  const { data: latestStrain } = useQuery({
    queryKey: ['latest-strain', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null;

      const { data, error } = await supabase
        .from('wearable_raw')
        .select('value, ts')
        .eq('athlete_uuid', profile.id)
        .eq('metric', 'strain')
        .order('ts', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!profile?.id
  });

  return {
    readinessRolling,
    sleepDaily,
    loadACWR,
    latestStrain,
    muscleLoads,
    isLoading: false // Since individual queries handle their own loading states
  };
};
