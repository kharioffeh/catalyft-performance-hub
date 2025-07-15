
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Athlete } from '@/types/athlete';

interface UseAthletesQueryProps {
  coachId?: string;
}

export const useAthletesQuery = ({ coachId }: UseAthletesQueryProps) => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['athletes', coachId],
    queryFn: async () => {
      if (!coachId) {
        console.log('No coach ID available for athletes query');
        return [];
      }
      
      console.log('Fetching athletes for coach:', coachId);
      
      const { data, error } = await supabase
        .from('vw_coach_athletes')
        .select('*')
        .eq('coach_uuid', coachId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Athletes fetch error:', error);
        throw error;
      }
      
      console.log('Athletes fetched:', data?.length || 0);
      return data as Athlete[];
    },
    enabled: !!coachId && profile?.role === 'coach'
  });
};
