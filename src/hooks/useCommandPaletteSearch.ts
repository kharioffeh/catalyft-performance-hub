
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Athlete search removed for solo-only pivot
export const useAthleteSearch = (query: string) => {
  return useQuery({
    queryKey: ['athlete-search', query],
    queryFn: async () => {
      return []; // No athlete search in solo mode
    },
    enabled: false, // Disabled for solo-only
  });
};

export const useTemplateSearch = (query: string) => {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ['template-search', query],
    queryFn: async () => {
      if (!query || query.length < 2) {
        return [];
      }

      const { data, error } = await supabase
        .from('template')
        .select('id, name, description')
        .ilike('name', `%${query}%`)
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    enabled: Boolean(query && query.length >= 2),
  });
};
