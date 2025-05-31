
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Exercise, ExerciseFilters } from '@/types/exercise';

export const useExerciseSearch = (searchQuery: string, filters: ExerciseFilters) => {
  return useQuery({
    queryKey: ['exercise-search', searchQuery, filters],
    queryFn: async () => {
      let query = supabase
        .from('exercises')
        .select('*');

      // Apply text search if provided
      if (searchQuery.trim()) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      // Apply filters
      if (filters.pattern && filters.pattern.length > 0) {
        query = query.overlaps('pattern', filters.pattern);
      }
      if (filters.muscle && filters.muscle.length > 0) {
        query = query.overlaps('muscle', filters.muscle);
      }
      if (filters.equipment && filters.equipment.length > 0) {
        query = query.overlaps('equipment', filters.equipment);
      }
      if (filters.modality && filters.modality.length > 0) {
        query = query.overlaps('modality', filters.modality);
      }
      if (filters.sport && filters.sport.length > 0) {
        query = query.overlaps('sport', filters.sport);
      }
      if (filters.difficulty) {
        query = query.eq('difficulty', filters.difficulty);
      }
      if (filters.intensity_zone) {
        query = query.eq('intensity_zone', filters.intensity_zone);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(40);

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
