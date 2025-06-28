
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Template, TemplateBlock, CreateTemplateData } from '@/types/training';

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
      return data as TemplateBlock[];
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
        .upsert(block)
        .select()
        .single();

      if (error) throw error;
      return data as TemplateBlock;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['template-blocks', data.template_id] });
    },
  });
};

export const useDeleteTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('template')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });
};
