import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useGlassToast } from '@/hooks/useGlassToast';
import { Session } from '@/types/training';
import { useActiveSession } from '@/hooks/useActiveSession';

interface SessionUpdate {
  status?: 'planned' | 'active' | 'completed';
  start_ts?: string;
  end_ts?: string;
  strain?: number;
  rpe?: number;
  notes?: string;
}

export const useSessionTracking = () => {
  const queryClient = useQueryClient();
  const toast = useGlassToast();
  const { data: activeSession } = useActiveSession();

  // Start a session
  const startSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const { data, error } = await supabase
        .from('sessions')
        .update({
          status: 'active',
          start_ts: new Date().toISOString(),
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['activeSession'] });
      toast.success('Session Started', 'Your training session is now active.');
    },
    onError: (error) => {
      console.error('Error starting session:', error);
      toast.error('Start Failed', 'Could not start the session. Please try again.');
    },
  });

  // Update session (for pause, resume, etc.)
  const updateSessionMutation = useMutation({
    mutationFn: async ({ sessionId, updates }: { sessionId: string; updates: SessionUpdate }) => {
      const { data, error } = await supabase
        .from('sessions')
        .update(updates)
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['activeSession'] });
    },
    onError: (error) => {
      console.error('Error updating session:', error);
      toast.error('Update Failed', 'Could not update session. Please try again.');
    },
  });

  // Complete a session
  const completeSessionMutation = useMutation({
    mutationFn: async ({ 
      sessionId, 
      strain, 
      rpe, 
      notes 
    }: { 
      sessionId: string; 
      strain?: number; 
      rpe?: number; 
      notes?: string; 
    }) => {
      const updates: SessionUpdate = {
        status: 'completed',
        end_ts: new Date().toISOString(),
      };

      if (strain !== undefined) updates.strain = strain;
      if (rpe !== undefined) updates.rpe = rpe;
      if (notes !== undefined) updates.notes = notes;

      const { data, error } = await supabase
        .from('sessions')
        .update(updates)
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['activeSession'] });
      queryClient.invalidateQueries({ queryKey: ['program-instances'] });
      
      toast.success('Session Complete', 'Great work! Your session has been saved.');
      
      // Check if this completes a program instance
      checkProgramCompletion(data);
    },
    onError: (error) => {
      console.error('Error completing session:', error);
      toast.error('Complete Failed', 'Could not complete session. Please try again.');
    },
  });

  // Check if completing this session completes a program instance
  const checkProgramCompletion = async (session: Session) => {
    if (!session.program_id) return;

    try {
      // Get all sessions for this program
      const { data: programSessions, error } = await supabase
        .from('sessions')
        .select('id, status')
        .eq('program_id', session.program_id);

      if (error) throw error;

      // Check if all sessions are completed
      const allCompleted = programSessions?.every(s => s.status === 'completed');
      
      if (allCompleted) {
        // Mark program instance as completed
        await supabase
          .from('program_instance')
          .update({ 
            status: 'completed',
            end_date: new Date().toISOString().split('T')[0] // Set end date to today
          })
          .eq('id', session.program_id);

        toast.success('Program Complete! 🎉', 'Congratulations! You\'ve completed your training program.');
        queryClient.invalidateQueries({ queryKey: ['program-instances'] });
      }
    } catch (error) {
      console.error('Error checking program completion:', error);
    }
  };

  // Save set data during session
  const saveSetMutation = useMutation({
    mutationFn: async ({
      sessionId,
      exerciseId,
      setNumber,
      reps,
      load,
      rpe
    }: {
      sessionId: string;
      exerciseId: string;
      setNumber: number;
      reps: number;
      load?: number;
      rpe?: number;
    }) => {
      const { data, error } = await supabase
        .from('set_logs')
        .upsert({
          session_id: sessionId,
          exercise_id: exerciseId,
          set_no: setNumber,
          reps,
          load,
          rpe,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onError: (error) => {
      console.error('Error saving set:', error);
      toast.error('Save Failed', 'Could not save set data.');
    },
  });

  const startSession = (sessionId: string) => {
    startSessionMutation.mutate(sessionId);
  };

  const updateSession = (sessionId: string, updates: SessionUpdate) => {
    updateSessionMutation.mutate({ sessionId, updates });
  };

  const completeSession = (sessionId: string, strain?: number, rpe?: number, notes?: string) => {
    completeSessionMutation.mutate({ sessionId, strain, rpe, notes });
  };

  const saveSet = (
    sessionId: string,
    exerciseId: string,
    setNumber: number,
    reps: number,
    load?: number,
    rpe?: number
  ) => {
    saveSetMutation.mutate({ sessionId, exerciseId, setNumber, reps, load, rpe });
  };

  return {
    // State
    activeSession,
    isStarting: startSessionMutation.isPending,
    isUpdating: updateSessionMutation.isPending,
    isCompleting: completeSessionMutation.isPending,
    isSavingSet: saveSetMutation.isPending,

    // Actions
    startSession,
    updateSession,
    completeSession,
    saveSet,
  };
};