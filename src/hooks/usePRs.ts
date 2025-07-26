import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PRRecord {
  id: string;
  athlete_uuid: string;
  exercise: string;
  pr_type: '1rm' | '3rm' | 'velocity';
  value: number;
  unit: string;
  achieved_at: string;
  session_id?: string;
  created_at: string;
  updated_at: string;
}

export const usePRs = (exercise: string) => {
  return useQuery({
    queryKey: ['prs', exercise],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pr_records')
        .select('*')
        .eq('exercise', exercise)
        .order('achieved_at', { ascending: false });

      if (error) throw error;

      // Group by PR type and get the latest record for each
      const latestPRs: Record<string, any> = {};
      data?.forEach((record: any) => {
        if (!latestPRs[record.pr_type] || new Date(record.achieved_at) > new Date(latestPRs[record.pr_type].achieved_at)) {
          latestPRs[record.pr_type] = record;
        }
      });

      return latestPRs;
    },
    enabled: !!exercise,
  });
};