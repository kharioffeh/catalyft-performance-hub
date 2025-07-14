/**
 * API functions for program management
 */

import { supabase } from '@/integrations/supabase/client';

export interface AssignProgramRequest {
  programId: string;
  athleteIds: string[];
}

export interface AssignProgramResponse {
  success: boolean;
  assignedCount: number;
}

/**
 * Assigns a program to multiple athletes
 */
export async function assignProgram(request: AssignProgramRequest): Promise<AssignProgramResponse> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    const coachId = userData.user?.id;
    
    if (!coachId) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('program_instance')
      .insert(
        request.athleteIds.map(athleteId => ({
          template_id: request.programId,
          athlete_uuid: athleteId,
          coach_uuid: coachId,
          source: 'template',
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + 12 * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 12 weeks from now
          status: 'active'
        }))
      );

    if (error) {
      console.error('Error assigning program:', error);
      throw new Error(error.message || 'Failed to assign program');
    }

    return {
      success: true,
      assignedCount: request.athleteIds.length
    };
  } catch (error) {
    console.error('Error in assignProgram:', error);
    throw error;
  }
}