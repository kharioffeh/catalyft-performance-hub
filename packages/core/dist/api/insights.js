/**
 * API functions for insights management
 */
import { supabase } from '../integrations/supabase/client';
/**
 * Save an insight for the current user
 */
export async function saveInsight(insightId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error('User not authenticated');
    }
    const { error } = await supabase
        .from('insight_log')
        .insert({
        athlete_uuid: user.id,
        metric: 'saved_insight',
        severity: 'info',
        message: `Insight ${insightId} saved by user`,
        source: 'DASHBOARD'
    });
    if (error) {
        throw new Error(`Failed to save insight: ${error.message}`);
    }
}
