
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfDay, endOfDay, addDays } from 'date-fns';

export const useDashboardData = (profileId?: string) => {
  // Current readiness
  const { data: currentReadiness } = useQuery({
    queryKey: ['current-readiness', profileId],
    queryFn: async () => {
      if (!profileId) return null;

      const { data, error } = await supabase
        .from('readiness_scores')
        .select('score, ts')
        .eq('athlete_uuid', profileId)
        .order('ts', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!profileId
  });

  // Today's scheduled sessions
  const { data: todaySessions = [] } = useQuery({
    queryKey: ['today-sessions', profileId],
    queryFn: async () => {
      if (!profileId) return [];

      const today = new Date();
      const { data, error } = await supabase
        .from('sessions')
        .select('id, start_ts, end_ts, type, notes')
        .eq('athlete_uuid', profileId)
        .gte('start_ts', startOfDay(today).toISOString())
        .lte('start_ts', endOfDay(today).toISOString())
        .order('start_ts', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!profileId
  });

  // Weekly session count
  const { data: weeklyStats } = useQuery({
    queryKey: ['weekly-stats', profileId],
    queryFn: async () => {
      if (!profileId) return { completed: 0, planned: 0 };

      const weekStart = startOfDay(new Date());
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekEnd = addDays(weekStart, 6);

      const { data, error } = await supabase
        .from('sessions')
        .select('id, start_ts, end_ts')
        .eq('athlete_uuid', profileId)
        .gte('start_ts', weekStart.toISOString())
        .lte('start_ts', weekEnd.toISOString());

      if (error) throw error;
      
      const now = new Date();
      const completed = data?.filter(s => new Date(s.end_ts) < now).length || 0;
      const planned = data?.length || 0;

      return { completed, planned };
    },
    enabled: !!profileId
  });

  // Latest injury risk
  const { data: injuryRisk } = useQuery({
    queryKey: ['latest-injury-risk', profileId],
    queryFn: async () => {
      if (!profileId) return null;

      const { data, error } = await supabase
        .from('injury_risk_forecast')
        .select('probabilities, forecast_date')
        .eq('athlete_uuid', profileId)
        .order('forecast_date', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!profileId
  });

  return {
    currentReadiness,
    todaySessions,
    weeklyStats,
    injuryRisk
  };
};
