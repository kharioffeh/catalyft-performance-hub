
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AthleteData {
  id: string;
  name: string;
}

export const useAthleteData = (athleteId: string | null, isOpen: boolean) => {
  return useQuery({
    queryKey: ['athlete', athleteId],
    queryFn: async () => {
      if (!athleteId) return null;
      
      const { data, error } = await supabase
        .from('athletes')
        .select('id, name')
        .eq('id', athleteId)
        .single();

      if (error) throw error;
      return data as AthleteData;
    },
    enabled: !!athleteId && isOpen,
  });
};
