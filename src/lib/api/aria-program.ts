/**
 * API functions for ARIA program generation
 */

import { supabase } from '@/integrations/supabase/client';

export interface AriaGenerateProgramRequest {
  goal: string;
  weeks: number;
  availableDays: string[];
  equipment: string[];
}

export interface AriaGenerateProgramResponse {
  template_id: string;
}

/**
 * Generates a training program using ARIA AI
 */
export async function generateProgramWithAria(request: AriaGenerateProgramRequest): Promise<AriaGenerateProgramResponse> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // For now, we'll use the coach as both coach and athlete
    // In a full implementation, you might want to select an athlete
    const { data, error } = await supabase.functions.invoke('aria-generate-program', {
      body: {
        athlete_uuid: user.id,
        coach_uuid: user.id,
        goal: request.goal,
        weeks: request.weeks,
        available_days: request.availableDays,
        equipment: request.equipment
      },
    });

    if (error) {
      console.error('ARIA generate program error:', error);
      throw new Error(`ARIA program generation failed: ${error.message}`);
    }

    console.log('ARIA program generated successfully');
    return data as AriaGenerateProgramResponse;
  } catch (error) {
    console.error('Error in generateProgramWithAria:', error);
    throw error;
  }
}