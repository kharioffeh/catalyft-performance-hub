
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface WorkoutBlock {
  id: string;
  athlete_uuid: string;
  coach_uuid: string | null;
  name: string | null;
  duration_weeks: number | null;
  data: any;
  created_at: string;
  updated_at: string;
}

export const useBlock = () => {
  return useQuery({
    queryKey: ['solo-block'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workout_blocks')
        .select('*')
        .eq('athlete_uuid', (await supabase.auth.getUser()).data.user?.id)
        .is('coach_uuid', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as WorkoutBlock | null;
    },
  });
};

export const useDeleteBlock = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (blockId: string) => {
      const { error } = await supabase
        .from('workout_blocks')
        .delete()
        .eq('id', blockId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solo-block'] });
      toast({
        title: "Program Deleted",
        description: "Your training program has been deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useGenerateSoloProgram = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ goal, weeks }: {
      goal: string;
      weeks: number;
    }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('aria-generate-program', {
        body: { 
          athlete_uuid: user.user.id,
          goal, 
          weeks,
          is_solo: true
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solo-block'] });
      toast({
        title: "Program Generated",
        description: "ARIA has successfully generated your training program 💫",
      });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
