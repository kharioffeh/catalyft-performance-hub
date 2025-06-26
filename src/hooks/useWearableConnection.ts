
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useWearableConnection = (athleteId?: string) => {
  return useQuery({
    queryKey: ['wearable-connection', athleteId],
    queryFn: async () => {
      if (!athleteId) return null;
      
      const { data: athlete, error: athleteError } = await supabase
        .from('athletes')
        .select('wearable_connected')
        .eq('id', athleteId)
        .single();

      if (athleteError) {
        console.error('Error fetching athlete wearable status:', athleteError);
        return null;
      }

      const { data: tokens, error: tokensError } = await supabase
        .from('wearable_tokens')
        .select('provider, created_at')
        .eq('athlete_uuid', athleteId);

      if (tokensError) {
        console.error('Error fetching wearable tokens:', tokensError);
        return { connected: athlete?.wearable_connected || false, providers: [] };
      }

      return {
        connected: athlete?.wearable_connected || false,
        providers: tokens || []
      };
    },
    enabled: !!athleteId
  });
};
