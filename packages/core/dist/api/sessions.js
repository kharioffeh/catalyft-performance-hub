import { supabase } from '../integrations/supabase/client';
export const updateSessionStatus = async (sessionId, status, endTs) => {
    const updateData = { status };
    if (endTs) {
        updateData.end_ts = endTs;
    }
    const { data, error } = await supabase
        .from('sessions')
        .update(updateData)
        .eq('id', sessionId)
        .select()
        .single();
    if (error)
        throw error;
    return data;
};
export const createSession = async (sessionData) => {
    const { data, error } = await supabase
        .from('sessions')
        .insert(sessionData)
        .select()
        .single();
    if (error)
        throw error;
    return data;
};
export const rescheduleSession = async (sessionId, newStartTime) => {
    const { data, error } = await supabase
        .from('sessions')
        .update({ start_ts: newStartTime })
        .eq('id', sessionId)
        .select()
        .single();
    if (error)
        throw error;
    return data;
};
