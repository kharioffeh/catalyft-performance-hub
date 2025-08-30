/**
 * API functions for ARIA program generation
 */
import { supabase } from '../integrations/supabase/client';
/**
 * Generates a training program using ARIA AI
 */
export async function generateProgramWithAria(request) {
    try {
        const { data: userData } = await supabase.auth.getUser();
        const user = userData.user;
        if (!user) {
            throw new Error('User not authenticated');
        }
        // Solo-only: user is both athlete and coach
        console.log('Sending to ARIA:', { goal: request.goal, weeks: request.weeks, prompt: request.prompt });
        const { data, error } = await supabase.functions.invoke('aria-generate-program', {
            body: {
                goal: request.goal,
                weeks: request.weeks,
                available_days: request.availableDays,
                equipment: request.equipment,
                prompt: request.prompt
            },
        });
        if (error) {
            console.error('ARIA generate program error:', error);
            throw new Error(`ARIA program generation failed: ${error.message}`);
        }
        console.log('ARIA program generated successfully:', data);
        return data;
    }
    catch (error) {
        console.error('Error in generateProgramWithAria:', error);
        throw error;
    }
}
