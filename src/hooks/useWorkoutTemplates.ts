import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { WorkoutTemplate, WorkoutTemplateExercise } from '@/types/workout';
import { toast } from '@/hooks/use-toast';

export const useWorkoutTemplates = () => {
  return useQuery({
    queryKey: ['workout-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workout_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as WorkoutTemplate[];
    },
  });
};

export const useWorkoutTemplate = (templateId: string) => {
  return useQuery({
    queryKey: ['workout-template', templateId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workout_templates')
        .select(`
          *,
          workout_template_exercises (
            *,
            exercises (*)
          )
        `)
        .eq('id', templateId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!templateId,
  });
};

export const useCreateWorkoutTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (template: Omit<WorkoutTemplate, 'id' | 'created_at' | 'updated_at'>) => {
      // Ensure required fields are present for database insertion
      const templateData = {
        ...template,
        category: template.category || 'general', // Provide default category if not specified
        is_public: template.is_public ?? false, // Provide default for is_public
      };

      const { data, error } = await supabase
        .from('workout_templates')
        .insert(templateData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-templates'] });
      toast({
        title: "Template Created",
        description: "Workout template has been created successfully",
      });
    },
  });
};

export const useAddExerciseToTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (exercise: Omit<WorkoutTemplateExercise, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('workout_template_exercises')
        .insert(exercise)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workout-template', variables.template_id] });
      toast({
        title: "Exercise Added",
        description: "Exercise has been added to the template",
      });
    },
  });
};
