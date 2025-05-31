
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Athlete } from '@/types/athlete';

interface UseAthletesQueryProps {
  coachId?: string;
}

export const useAthletesQueryFixed = ({ coachId }: UseAthletesQueryProps) => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['athletes-fixed', coachId],
    queryFn: async () => {
      if (!coachId) {
        console.log('No coach ID available for athletes query');
        return [];
      }
      
      console.log('Fetching athletes for coach:', coachId);
      
      // Try direct query first (bypassing potential RLS issues)
      const { data, error } = await supabase
        .from('athletes')
        .select('*')
        .eq('coach_uuid', coachId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Athletes fetch error:', error);
        
        // If RLS blocks this, try using the view
        console.log('Trying vw_coach_athletes view...');
        const { data: viewData, error: viewError } = await supabase
          .from('vw_coach_athletes')
          .select('*')
          .eq('coach_uuid', coachId)
          .order('created_at', { ascending: false });

        if (viewError) {
          console.error('View query also failed:', viewError);
          throw error; // Throw original error
        }

        console.log('View query succeeded:', viewData?.length || 0);
        return viewData as Athlete[];
      }
      
      console.log('Direct athletes query succeeded:', data?.length || 0);
      return data as Athlete[];
    },
    enabled: !!coachId && profile?.role === 'coach'
  });
};
