
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface CreateProgramFromTemplateParams {
  template_id: string;
  athlete_uuid: string;
  coach_uuid: string;
  start_date: string;
}

export const useCreateProgramFromTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateProgramFromTemplateParams) => {
      const { data, error } = await supabase.rpc('fn_create_program_from_template', {
        p_template_id: params.template_id,
        p_athlete: params.athlete_uuid,
        p_coach: params.coach_uuid,
        p_start_date: params.start_date,
      });

      if (error) throw error;
      return data as string; // Returns the program UUID
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program-instances'] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast({
        title: "Program Created",
        description: "Training program has been successfully created from template",
      });
    },
    onError: (error) => {
      console.error('Error creating program from template:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create program from template. Please try again.",
        variant: "destructive",
      });
    },
  });
};
