
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProgramInstance, CreateProgramInstanceData } from '@/types/training';

export const useProgramInstances = (athleteId?: string) => {
  return useQuery({
    queryKey: ['program-instances', athleteId],
    queryFn: async () => {
      let query = supabase
        .from('program_instance')
        .select(`
          *,
          template:template_id (
            id,
            title,
            goal,
            weeks
          )
        `)
        .order('created_at', { ascending: false });

      if (athleteId) {
        query = query.eq('athlete_uuid', athleteId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as ProgramInstance[];
    },
  });
};

export const useProgramInstance = (id: string) => {
  return useQuery({
    queryKey: ['program-instance', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('program_instance')
        .select(`
          *,
          template:template_id (
            id,
            title,
            goal,
            weeks
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as ProgramInstance;
    },
    enabled: !!id,
  });
};

export const useCreateProgramInstance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (programData: CreateProgramInstanceData) => {
      const { data, error } = await supabase
        .from('program_instance')
        .insert({
          ...programData,
          coach_uuid: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as ProgramInstance;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program-instances'] });
    },
  });
};

export const useUpdateProgramInstance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ProgramInstance> & { id: string }) => {
      const { data, error } = await supabase
        .from('program_instance')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as ProgramInstance;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['program-instances'] });
      queryClient.invalidateQueries({ queryKey: ['program-instance', data.id] });
    },
  });
};

export const useDeleteProgramInstance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('program_instance')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program-instances'] });
    },
  });
};
