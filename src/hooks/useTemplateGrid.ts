
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TemplateGridItem {
  template_id: string;
  week_no: number;
  day_no: number;
  exercise_id: string;
  sets: number;
  reps: number;
  load_pct: number;
}

export const useTemplateGrid = (templateId: string) => {
  return useQuery({
    queryKey: ['template-grid', templateId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_template_grid')
        .select('*')
        .eq('template_id', templateId)
        .order('week_no', { ascending: true })
        .order('day_no', { ascending: true });

      if (error) throw error;
      return data as TemplateGridItem[];
    },
    enabled: !!templateId,
  });
};
