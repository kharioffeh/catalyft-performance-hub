
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ProgramAdjustment {
  id: string;
  session_id: string;
  athlete_uuid: string;
  reason: 'low_readiness' | 'high_readiness' | 'over_strain' | 'under_strain';
  old_payload: Record<string, any>;
  new_payload: Record<string, any>;
  adjustment_factor: number;
  created_at: string;
}

export const useProgramAdjustments = (athleteId?: string) => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['program-adjustments', athleteId || profile?.id],
    queryFn: async () => {
      const targetAthleteId = athleteId || profile?.id;
      if (!targetAthleteId) return [];

      const { data, error } = await supabase
        .from('program_adjustments')
        .select('*')
        .eq('athlete_uuid', targetAthleteId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching program adjustments:', error);
        throw error;
      }

      return data as ProgramAdjustment[];
    },
    enabled: !!(athleteId || profile?.id)
  });
};

export const useSessionAdjustments = (sessionId: string) => {
  return useQuery({
    queryKey: ['session-adjustments', sessionId],
    queryFn: async () => {
      if (!sessionId) return [];

      const { data, error } = await supabase
        .from('program_adjustments')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching session adjustments:', error);
        throw error;
      }

      return data as ProgramAdjustment[];
    },
    enabled: !!sessionId
  });
};

export const useAdjustmentStats = (athleteId?: string) => {
  return useQuery({
    queryKey: ['adjustment-stats', athleteId],
    queryFn: async () => {
      const targetAthleteId = athleteId;
      if (!targetAthleteId) return null;

      const { data, error } = await supabase
        .from('program_adjustments')
        .select('reason, adjustment_factor, created_at')
        .eq('athlete_uuid', targetAthleteId)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days

      if (error) {
        console.error('Error fetching adjustment stats:', error);
        throw error;
      }

      const stats = {
        total: data.length,
        byReason: {
          low_readiness: data.filter(d => d.reason === 'low_readiness').length,
          high_readiness: data.filter(d => d.reason === 'high_readiness').length,
          over_strain: data.filter(d => d.reason === 'over_strain').length,
          under_strain: data.filter(d => d.reason === 'under_strain').length,
        },
        avgAdjustment: data.length > 0 
          ? data.reduce((sum, d) => sum + d.adjustment_factor, 0) / data.length 
          : 1.0
      };

      return stats;
    },
    enabled: !!athleteId
  });
};
