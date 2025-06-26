
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useAthleteType = (profileId?: string, userRole?: string) => {
  return useQuery({
    queryKey: ['athlete-type', profileId],
    queryFn: async () => {
      if (!profileId) {
        return { type: userRole === 'coach' ? 'coach' : 'solo', hasCoach: false };
      }

      if (userRole === 'coach') {
        return { type: 'coach', hasCoach: false };
      }

      if (userRole === 'solo') {
        return { type: 'solo', hasCoach: false };
      }

      if (userRole !== 'athlete') {
        return { type: 'solo', hasCoach: false };
      }

      // Check if this athlete has a coach assigned
      const { data, error } = await supabase
        .from('athletes')
        .select('coach_uuid')
        .eq('id', profileId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking athlete type:', error);
        return { type: 'solo', hasCoach: false };
      }

      const hasCoach = data?.coach_uuid !== null;
      return { 
        type: hasCoach ? 'coached' : 'solo',
        hasCoach 
      };
    },
    enabled: !!profileId
  });
};
