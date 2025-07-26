
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useAthleteSearch = (query: string) => {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ['athlete-search', query],
    queryFn: async () => {
      if (!query || query.length < 2 || profile?.role !== 'coach') {
        return [];
      }

      const { data, error } = await supabase
        .from('athletes')
        .select('id, name, email')
        .ilike('name', `%${query}%`)
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    enabled: false, // Command palette athlete search disabled for solo users
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
