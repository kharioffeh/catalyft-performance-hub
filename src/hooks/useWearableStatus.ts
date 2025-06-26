
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useWearableStatus = (athleteId?: string) => {
  return useQuery({
    queryKey: ['wearable-status', athleteId],
    queryFn: async () => {
      if (!athleteId) return null;
      
      const { data, error } = await supabase
        .from('athletes')
        .select('wearable_connected')
        .eq('id', athleteId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!athleteId,
  });
};
