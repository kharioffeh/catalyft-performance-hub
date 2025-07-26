
// No need for '@supabase/auth-helpers-react'
import { supabase } from '@/integrations/supabase/client';

export const useGenerateProgram = () => {
  return async (body: { goal: string; weeks: number; available_days?: string[]; equipment?: string[]; prompt?: string }) => {
    const { data, error } = await supabase.functions.invoke('aria-generate-program', { body });
    if (error) throw error;
    return data.template_id as string;
  };
};
