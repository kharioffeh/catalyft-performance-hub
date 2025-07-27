import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Protocol {
  id: string;
  name: string;
  description: string;
  duration_min: number;
  muscle_targets?: string[];
}

interface ProtocolsResponse {
  protocols: Protocol[];
}

interface UseProtocolsOptions {
  muscleTarget?: string;
  maxDuration?: number;
  minDuration?: number;
}

export const useProtocols = (options: UseProtocolsOptions = {}) => {
  return useQuery({
    queryKey: ['protocols', options],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (options.muscleTarget) {
        params.append('muscle_target', options.muscleTarget);
      }
      if (options.maxDuration) {
        params.append('max_duration', options.maxDuration.toString());
      }
      if (options.minDuration) {
        params.append('min_duration', options.minDuration.toString());
      }

      const { data, error } = await supabase.functions.invoke<ProtocolsResponse>('getProtocols', {
        method: 'GET',
      });

      if (error) throw error;
      return data.protocols;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export type { Protocol };