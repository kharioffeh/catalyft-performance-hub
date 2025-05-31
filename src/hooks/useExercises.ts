
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Exercise } from '@/types/exercise';

export const useExercises = () => {
  return useQuery({
    queryKey: ['exercises'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as Exercise[];
    },
  });
};

export const useExercisesByCategory = (category?: string) => {
  return useQuery({
    queryKey: ['exercises', category],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('search_exercises', {
        q: '',
        filters: category ? { modality: [category] } : {}
      });

      if (error) throw error;
      return data as Exercise[];
    },
  });
};
