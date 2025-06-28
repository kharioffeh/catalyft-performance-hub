
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Template, TemplateBlock, CreateTemplateData, TemplateExercise } from '@/types/training';

export const useTemplates = () => {
  return useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('template')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Template[];
    },
  });
};

export const useTemplate = (id: string) => {
  return useQuery({
    queryKey: ['template', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('template')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Template;
    },
    enabled: !!id,
  });
};

export const useTemplateBlocks = (templateId: string) => {
  return useQuery({
    queryKey: ['template-blocks', templateId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('template_block')
        .select('*')
        .eq('template_id', templateId)
        .order('week_no', { ascending: true })
        .order('day_no', { ascending: true });

      if (error) throw error;
      
      // Convert Json exercises to TemplateExercise[]
      return data.map(block => ({
        ...block,
        exercises: (block.exercises as unknown as TemplateExercise[]) || []
      })) as TemplateBlock[];
    },
    enabled: !!templateId,
  });
};

export const useCreateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (templateData: CreateTemplateData) => {
      const { data, error } = await supabase
        .from('template')
        .insert({
          ...templateData,
          owner_uuid: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Template;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });
};

export const useUpdateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Template> & { id: string }) => {
      const { data, error } = await supabase
        .from('template')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Template;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      queryClient.invalidateQueries({ queryKey: ['template', data.id] });
    },
  });
};

export const useUpdateTemplateBlock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (block: TemplateBlock) => {
      const { data, error } = await supabase
        .from('template_block')
        .upsert({
          ...block,
          exercises: block.exercises as unknown as any
        })
        .select()
        .single();

      if (error) throw error;
      
      return {
        ...data,
        exercises: (data.exercises as unknown as TemplateExercise[]) || []
      } as TemplateBlock;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['template-blocks', data.template_id] });
      queryClient.invalidateQueries({ queryKey: ['template-grid', data.template_id] });
    },
  });
};

export const useDeleteTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log('Attempting to delete template:', id);
      
      // First, delete associated template blocks
      const { error: blocksError } = await supabase
        .from('template_block')
        .delete()
        .eq('template_id', id);

      if (blocksError) {
        console.error('Error deleting template blocks:', blocksError);
        throw new Error(`Failed to delete template blocks: ${blocksError.message}`);
      }

      // Then delete the template
      const { error: templateError } = await supabase
        .from('template')
        .delete()
        .eq('id', id);

      if (templateError) {
        console.error('Error deleting template:', templateError);
        
        // Provide specific error messages for common RLS issues
        if (templateError.code === '42501') {
          throw new Error('Permission denied: You can only delete templates you own');
        }
        
        if (templateError.message.includes('row-level security')) {
          throw new Error('Access denied: Insufficient permissions to delete this template');
        }
        
        throw new Error(`Failed to delete template: ${templateError.message}`);
      }

      console.log('Template deleted successfully:', id);
    },
    onSuccess: () => {
      console.log('Template deletion successful, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
    onError: (error) => {
      console.error('Template deletion failed:', error);
    },
  });
};
