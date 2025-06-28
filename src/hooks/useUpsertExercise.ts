
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface UpsertExerciseParams {
  name: string;
  category: string;
  primary_muscle: string;
  secondary_muscle?: string[];
  video_url?: string;
  coach_uuid?: string;
}

export const useUpsertExercise = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UpsertExerciseParams) => {
      const { data, error } = await supabase.rpc('fn_upsert_exercise', {
        p_name: params.name,
        p_category: params.category,
        p_primary_muscle: params.primary_muscle,
        p_secondary_muscle: params.secondary_muscle || [],
        p_video_url: params.video_url || null,
        p_coach_uuid: params.coach_uuid || null,
      });

      if (error) throw error;
      return data as string; // Returns the exercise UUID
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercise-library'] });
      toast({
        title: "Exercise Saved",
        description: "Exercise has been successfully saved to the library",
      });
    },
    onError: (error) => {
      console.error('Error upserting exercise:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save exercise. Please try again.",
        variant: "destructive",
      });
    },
  });
};
