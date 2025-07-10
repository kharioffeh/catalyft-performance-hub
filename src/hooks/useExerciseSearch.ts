
import { useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from '@/hooks/useDebounce';
import { Exercise } from '@/types/exercise';

interface UseExerciseSearchProps {
  searchTerm: string;
  muscles?: string[];
  equipment?: string[];
  difficulty?: string[];
  modality?: string[];
  limit?: number;
}

export const useExerciseSearch = ({
  searchTerm,
  muscles = [],
  equipment = [],
  difficulty = [],
  modality = [],
  limit = 1000
}: UseExerciseSearchProps) => {
  // Debounce search term to avoid too many API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Create stable array references to prevent unnecessary re-renders
  const stableMuscles = useMemo(() => [...muscles].sort(), [muscles.join(',')]);
  const stableEquipment = useMemo(() => [...equipment].sort(), [equipment.join(',')]);
  const stableDifficulty = useMemo(() => [...difficulty].sort(), [difficulty.join(',')]);
  const stableModality = useMemo(() => [...modality].sort(), [modality.join(',')]);

  // Create a stable query key for React Query
  const queryKey = useMemo(() => [
    'exercises-search',
    debouncedSearchTerm,
    stableMuscles.join(','),
    stableEquipment.join(','),
    stableDifficulty.join(','),
    stableModality.join(','),
    limit
  ], [debouncedSearchTerm, stableMuscles, stableEquipment, stableDifficulty, stableModality, limit]);

  // Fetch function for React Query
  const fetchExercises = useCallback(async (): Promise<Exercise[]> => {
    let query = supabase
      .from('exercises')
      .select(`
        id,
        name,
        muscle,
        equipment,
        modality,
        pattern,
        difficulty,
        intensity_zone,
        description,
        thumbnail_url,
        video_url,
        sport,
        origin,
        created_at,
        updated_at,
        plane,
        energy_system
      `)
      .limit(limit);

    // Apply search term filter using full-text search
    if (debouncedSearchTerm) {
      query = query.or(`name.ilike.%${debouncedSearchTerm}%,description.ilike.%${debouncedSearchTerm}%`);
    }

    // Apply muscle filter
    if (stableMuscles.length > 0) {
      query = query.overlaps('muscle', stableMuscles);
    }

    // Apply equipment filter
    if (stableEquipment.length > 0) {
      query = query.overlaps('equipment', stableEquipment);
    }

    // Apply difficulty filter
    if (stableDifficulty.length > 0) {
      query = query.in('difficulty', stableDifficulty);
    }

    // Apply modality filter
    if (stableModality.length > 0) {
      query = query.overlaps('modality', stableModality);
    }

    // Order by name for consistent results
    query = query.order('name');

    const { data, error: fetchError } = await query;

    if (fetchError) {
      throw fetchError;
    }

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
  }, [debouncedSearchTerm, stableMuscles, stableEquipment, stableDifficulty, stableModality, limit]);

  // Use React Query for caching and deduplication
  const {
    data: exercises = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey,
    queryFn: fetchExercises,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
  });

  // Compute additional stats
  const stats = useMemo(() => {
    const totalExercises = exercises.length;
    const muscleGroups = new Set(exercises.flatMap(ex => ex.muscle || [])).size;
    const equipmentTypes = new Set(exercises.flatMap(ex => ex.equipment || [])).size;
    
    return {
      totalExercises,
      muscleGroups,
      equipmentTypes
    };
  }, [exercises]);

  return {
    exercises,
    loading,
    error: error?.message || null,
    stats,
    refetch
  };
};
