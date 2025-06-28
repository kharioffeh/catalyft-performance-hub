
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface WeeklySummary {
  id: string;
  owner_uuid: string;
  role: 'coach' | 'solo';
  period_start: string;
  period_end: string;
  summary_md: string;
  created_at: string;
  delivered: boolean;
}

export const useWeeklySummaries = (limit?: number) => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['weekly-summaries', profile?.id, limit],
    queryFn: async () => {
      if (!profile?.id) return [];

      let query = supabase
        .from('weekly_summaries')
        .select('*')
        .eq('owner_uuid', profile.id)
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching weekly summaries:', error);
        throw error;
      }

      return data as WeeklySummary[];
    },
    enabled: !!profile?.id
  });
};

export const useLatestWeeklySummary = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['latest-weekly-summary', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null;

      const { data, error } = await supabase
        .from('weekly_summaries')
        .select('*')
        .eq('owner_uuid', profile.id)
        .eq('delivered', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching latest weekly summary:', error);
        throw error;
      }

      return data as WeeklySummary | null;
    },
    enabled: !!profile?.id
  });
};
