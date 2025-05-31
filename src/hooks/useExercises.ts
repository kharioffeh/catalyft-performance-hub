
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
      
      // Transform the data to match our Exercise interface
      return (data || []).map(exercise => ({
        id: exercise.id,
        name: exercise.name,
        description: exercise.description,
        video_url: exercise.video_url,
        thumbnail_url: exercise.thumbnail_url,
        pattern: exercise.pattern || [],
        muscle: exercise.muscle || [],
        equipment: exercise.equipment || [],
        modality: exercise.modality || [],
        sport: exercise.sport || [],
        intensity_zone: exercise.intensity_zone,
        plane: exercise.plane,
        energy_system: exercise.energy_system,
        difficulty: exercise.difficulty,
        origin: exercise.origin || 'SYSTEM',
        created_at: exercise.created_at
      })) as Exercise[];
    },
  });
};

export const useExercisesByCategory = (category?: string) => {
  return useQuery({
    queryKey: ['exercises', category],
    queryFn: async () => {
      let query = supabase
        .from('exercises')
        .select('*');

      if (category) {
        query = query.contains('modality', [category]);
      }

      const { data, error } = await query.order('name');

      if (error) throw error;
      
      // Transform the data to match our Exercise interface
      return (data || []).map(exercise => ({
        id: exercise.id,
        name: exercise.name,
        description: exercise.description,
        video_url: exercise.video_url,
        thumbnail_url: exercise.thumbnail_url,
        pattern: exercise.pattern || [],
        muscle: exercise.muscle || [],
        equipment: exercise.equipment || [],
        modality: exercise.modality || [],
        sport: exercise.sport || [],
        intensity_zone: exercise.intensity_zone,
        plane: exercise.plane,
        energy_system: exercise.energy_system,
        difficulty: exercise.difficulty,
        origin: exercise.origin || 'SYSTEM',
        created_at: exercise.created_at
      })) as Exercise[];
    },
  });
};
