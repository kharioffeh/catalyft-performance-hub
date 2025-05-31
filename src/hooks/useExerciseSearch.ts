
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Exercise, ExerciseFilters } from '@/types/exercise';

export const useExerciseSearch = (searchQuery: string, filters: ExerciseFilters) => {
  return useQuery({
    queryKey: ['exercise-search', searchQuery, filters],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('search_exercises', {
        q: searchQuery,
        filters: filters
      });

      if (error) throw error;
      return data as Exercise[];
    },
  });
};
