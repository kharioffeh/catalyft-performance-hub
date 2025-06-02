
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface UpdateTemplateParams {
  id: string;
  block_json: any;
}

export const useUpdateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, block_json }: UpdateTemplateParams) => {
      const { data, error } = await supabase
        .from('program_templates')
        .update({ 
          block_json,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['program-template', data.id] });
      queryClient.invalidateQueries({ queryKey: ['program-templates'] });
      toast({
        title: "Template Updated",
        description: "Your changes have been saved successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
