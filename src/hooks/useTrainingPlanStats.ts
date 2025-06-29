
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TrainingPlanStats {
  templates: number;
  activePrograms: number;
  totalSessions: number;
}

export const useTrainingPlanStats = () => {
  return useQuery({
    queryKey: ['training-plan-stats'],
    queryFn: async (): Promise<TrainingPlanStats> => {
      const { data, error } = await supabase.rpc('training_plan_kpis');

      if (error) {
        console.error('Error fetching training plan stats:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        return {
          templates: 0,
          activePrograms: 0,
          totalSessions: 0,
        };
      }

      const stats = data[0];
      return {
        templates: Number(stats.templates) || 0,
        activePrograms: Number(stats.active_programs) || 0,
        totalSessions: Number(stats.total_sessions) || 0,
      };
    },
    staleTime: 30_000, // Cache for 30 seconds
    refetchOnWindowFocus: false,
  });
};
