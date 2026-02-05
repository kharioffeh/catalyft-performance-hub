
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface ProgramTemplate {
  id: string;
  coach_uuid: string;
  name: string;
  block_json: any;
  origin: string;
  created_at: string;
  updated_at: string;
}

export const useProgramTemplates = () => {
  return useQuery({
    queryKey: ['program-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('program_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ProgramTemplate[];
    },
  });
};

export const useCreateProgramTemplate = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({ name, block_json, origin }: {
      name: string;
      block_json: any;
      origin: string;
    }) => {
      if (!profile?.id) throw new Error('User not authenticated');

      // Get coach record
      const { data: coach, error: coachError } = await supabase
        .from('coaches')
        .select('id')
        .eq('email', profile.email)
        .single();

      if (coachError || !coach) {
        throw new Error('Coach not found');
      }

      const { data, error } = await supabase
        .from('program_templates')
        .insert({
          name,
          block_json,
          origin,
          coach_uuid: coach.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program-templates'] });
    },
  });
};

export const useDeleteTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      
      const { error } = await supabase
        .from('program_templates')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting program template:', error);
        
        if (error.code === '42501') {
          throw new Error('Permission denied: You can only delete programs you own');
        }
        
        if (error.message.includes('row-level security')) {
          throw new Error('Access denied: Insufficient permissions to delete this program');
        }
        
        throw new Error(`Failed to delete program: ${error.message}`);
      }

    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program-templates'] });
    },
    onError: (error) => {
      console.error('Program deletion failed:', error);
    },
  });
};

export const useGenerateProgram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ athlete_uuid, weeks, focus }: {
      athlete_uuid: string;
      weeks: number;
      focus?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('kai_generate_program', {
        body: { athlete_uuid, weeks, focus }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program-templates'] });
      toast({
        title: "Program Generated",
        description: "ARIA has successfully generated your training program",
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

export const useAssignTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ template_id, athlete_id }: {
      template_id: string;
      athlete_id: string;
    }) => {
      // Get the template
      const { data: template, error: templateError } = await supabase
        .from('program_templates')
        .select('block_json')
        .eq('id', template_id)
        .single();

      if (templateError) throw templateError;

      // Insert into workout_blocks
      const { data, error } = await supabase
        .from('workout_blocks')
        .insert({
          athlete_uuid: athlete_id,
          data: template.block_json
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-blocks'] });
      toast({
        title: "Program Assigned",
        description: "Training program has been assigned to athlete",
      });
    },
  });
};
