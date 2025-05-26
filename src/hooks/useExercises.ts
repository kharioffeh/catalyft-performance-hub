
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Exercise } from '@/types/workout';

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
      let query = supabase.from('exercises').select('*').order('name');
      
      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Exercise[];
    },
  });
};
