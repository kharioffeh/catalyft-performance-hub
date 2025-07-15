
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { AthleteFormData } from '@/types/athlete';

export const useUpdateAthleteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: AthleteFormData }) => {
      const { data: result, error } = await supabase
        .from('athletes')
        .update({
          name: data.name,
          sex: data.sex || null,
          dob: data.dob || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athletes'] });
      toast({
        title: "Success",
        description: "Athlete updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update athlete: ${error.message}`,
        variant: "destructive",
      });
    }
  });
};
