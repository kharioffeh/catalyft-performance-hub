
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AssignedWorkout } from '@/types/workout';
import { toast } from '@/hooks/use-toast';

export const useAssignedWorkouts = (userUuid?: string) => {
  return useQuery({
    queryKey: ['assigned-workouts', userUuid],
    queryFn: async () => {
      let query = supabase
        .from('assigned_workouts')
        .select(`
          *,
          workout_templates (*),
          users (name)
        `)
        .order('assigned_date', { ascending: false });

      if (userUuid) {
        query = query.eq('user_uuid', userUuid);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as AssignedWorkout[];
    },
  });
};

export const useAssignWorkout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assignment: Omit<AssignedWorkout, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('assigned_workouts')
        .insert(assignment)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assigned-workouts'] });
      toast({
        title: "Workout Assigned",
        description: "Workout has been assigned successfully",
      });
    },
  });
};

export const useUpdateWorkoutStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from('assigned_workouts')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assigned-workouts'] });
      toast({
        title: "Status Updated",
        description: "Workout status has been updated",
      });
    },
  });
};
