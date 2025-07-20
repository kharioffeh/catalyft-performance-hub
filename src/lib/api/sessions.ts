
import { supabase } from '@/integrations/supabase/client';

export const updateSessionStatus = async (sessionId: string, status: string, endTs?: string) => {
  const updateData: any = { status };
  if (endTs) {
    updateData.end_ts = endTs;
  }

  const { data, error } = await supabase
    .from('sessions')
    .update(updateData)
    .eq('id', sessionId)
    .select()
    .single();

  if (error) throw error;
  return data;
};
