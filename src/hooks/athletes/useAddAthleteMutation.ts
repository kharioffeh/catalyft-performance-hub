
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { AthleteFormData } from '@/types/athlete';

export const useAddAthleteMutation = (coachId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AthleteFormData) => {
      if (!coachId) throw new Error('No coach ID found');

      const { data: result, error } = await supabase
        .from('athletes')
        .insert({
          name: data.name,
          sex: data.sex || null,
          dob: data.dob || null,
          coach_uuid: coachId
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athletes'] });
      toast({
        title: "Success",
        description: "Athlete added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add athlete: ${error.message}`,
        variant: "destructive",
      });
    }
  });
};
