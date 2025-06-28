
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface CreateProgramFromTemplateParams {
  templateId: string;
  athleteUuid?: string;
}

interface CreateProgramResponse {
  programId: string;
}

export const useCreateProgramFromTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateProgramFromTemplateParams): Promise<string> => {
      const { data, error } = await supabase.functions.invoke('create-program-from-template', {
        body: {
          templateId: params.templateId,
          athleteUuid: params.athleteUuid,
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to create program');
      }

      const response = data as CreateProgramResponse;
      return response.programId;
    },
    onSuccess: () => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['program-instances'] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast({
        title: "Program Created",
        description: "Training program has been successfully created from template",
      });
    },
    onError: (error: Error) => {
      console.error('Error creating program from template:', error);
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create program from template. Please try again.",
        variant: "destructive",
      });
    },
  });
};
