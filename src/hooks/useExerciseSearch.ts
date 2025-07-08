
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from '@/hooks/useDebounce';

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
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce search term to avoid too many API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Memoize search parameters to prevent unnecessary re-renders
  const searchParams = useMemo(() => ({
    search: debouncedSearchTerm,
    muscles,
    equipment,
    difficulty,
    modality
  }), [debouncedSearchTerm, muscles, equipment, difficulty, modality]);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setLoading(true);
        setError(null);

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
            origin
          `)
          .limit(limit);

        // Apply search term filter using full-text search
        if (searchParams.search) {
          query = query.or(`
            name.ilike.%${searchParams.search}%,
            description.ilike.%${searchParams.search}%
          `);
        }

        // Apply muscle filter
        if (searchParams.muscles.length > 0) {
          query = query.overlaps('muscle', searchParams.muscles);
        }

        // Apply equipment filter
        if (searchParams.equipment.length > 0) {
          query = query.overlaps('equipment', searchParams.equipment);
        }

        // Apply difficulty filter
        if (searchParams.difficulty.length > 0) {
          query = query.in('difficulty', searchParams.difficulty);
        }

        // Apply modality filter
        if (searchParams.modality.length > 0) {
          query = query.overlaps('modality', searchParams.modality);
        }

        // Order by name for consistent results
        query = query.order('name');

        const { data, error: fetchError } = await query;

        if (fetchError) {
          throw fetchError;
        }

        setExercises(data || []);
      } catch (err) {
        console.error('Error fetching exercises:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch exercises');
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, [searchParams, limit]);

  // Compute additional stats
  const stats = useMemo(() => {
    const totalExercises = exercises.length;
    const muscleGroups = new Set(exercises.flatMap(ex => ex.muscle)).size;
    const equipmentTypes = new Set(exercises.flatMap(ex => ex.equipment)).size;
    
    return {
      totalExercises,
      muscleGroups,
      equipmentTypes
    };
  }, [exercises]);

  return {
    exercises,
    loading,
    error,
    stats,
    refetch: () => {
      setLoading(true);
      // Trigger re-fetch by updating a dependency
    }
  };
};
