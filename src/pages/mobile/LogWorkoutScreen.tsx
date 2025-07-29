import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Save, Square, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Fab } from '@/components/ui/Fab';
import { GlassCard } from '@/components/ui/glass-card';
import { useToast } from '@/hooks/use-toast';
import { useExercises } from '@/hooks/useExercises';
import { useSyncPendingSets } from '@/hooks/useSyncPendingSets';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { SetRow } from './components/SetRow';
import { track } from '@/utils/amplitude';

interface WorkoutSet {
  id: string;
  exercise: string;
  weight: number;
  reps: number;
  rpe?: number;
  tempo?: string;
  velocity?: number;
}

export const LogWorkoutScreen: React.FC = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionNotes, setSessionNotes] = useState('');
  const [sets, setSets] = useState<WorkoutSet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { data: exercises = [] } = useExercises();
  const { isOnline, isSyncing, pendingCount, addPendingSet } = useSyncPendingSets();

  // Create workout session on mount
  useEffect(() => {
    createWorkoutSession();
    return () => {
      // Auto-end workout on unmount if session exists
      if (sessionId) {
        endWorkout();
      }
    };
  }, []);

  const createWorkoutSession = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('createWorkout', {
        body: { notes: sessionNotes }
      });

      if (error) throw error;

      setSessionId(data.id);
      toast({
        title: "Workout Started",
        description: "Your workout session has been created"
      });
    } catch (error) {
      console.error('Error creating workout:', error);
      toast({
        title: "Error",
        description: "Failed to start workout session",
        variant: "destructive"
      });
    }
  };

  const addSet = () => {
    const newSet: WorkoutSet = {
      id: Math.random().toString(36).substr(2, 9),
      exercise: '',
      weight: 0,
      reps: 0,
      rpe: undefined,
      tempo: '',
      velocity: undefined
    };
    setSets([...sets, newSet]);
  };

  const updateSet = (id: string, field: keyof WorkoutSet, value: any) => {
    setSets(sets.map(set => 
      set.id === id ? { ...set, [field]: value } : set
    ));
  };

  const removeSet = (id: string) => {
    setSets(sets.filter(set => set.id !== id));
  };

  const saveAndContinue = async () => {
    if (!sessionId) return;

    setIsLoading(true);
    try {
      // Save all new/updated sets
      for (const set of sets) {
        if (set.exercise && set.weight && set.reps) {
          if (isOnline) {
            // Try to save directly to server if online
            try {
              const { error } = await supabase.functions.invoke('logSet', {
                body: {
                  session_id: sessionId,
                  exercise: set.exercise,
                  weight: set.weight,
                  reps: set.reps,
                  rpe: set.rpe,
                  tempo: set.tempo,
                  velocity: set.velocity
                }
              });

              if (error) throw error;
            } catch (error) {
              // If server call fails, save locally
              console.warn('Server save failed, saving locally:', error);
              await addPendingSet({
                session_id: sessionId,
                exercise: set.exercise,
                weight: set.weight,
                reps: set.reps,
                rpe: set.rpe,
                tempo: set.tempo,
                velocity: set.velocity
              });
            }
          } else {
            // Save locally when offline
            await addPendingSet({
              session_id: sessionId,
              exercise: set.exercise,
              weight: set.weight,
              reps: set.reps,
              rpe: set.rpe,
              tempo: set.tempo,
              velocity: set.velocity
            });
          }
        }
      }

      toast({
        title: isOnline ? "Sets Saved" : "Sets Saved Offline",
        description: isOnline ? "Your workout sets have been saved" : "Sets saved locally and will sync when online"
      });
    } catch (error) {
      console.error('Error saving sets:', error);
      toast({
        title: "Error",
        description: "Failed to save sets",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  const endWorkout = async () => {
    if (!sessionId) {
      navigate(-1);
      return;
    }

    setIsLoading(true);
    try {
      // Save any pending sets first
      await saveAndContinue();

      // End the workout session
      const { error } = await supabase.functions.invoke('endWorkout', {
        body: { session_id: sessionId }
      });

      if (error) throw error;

      // Track workout completion
      track('Workout Completed', { sessionId });

      toast({
        title: "Workout Ended",
        description: "Your workout has been completed"
      });

      navigate('/');
    } catch (error) {
      console.error('Error ending workout:', error);
      toast({
        title: "Error",
        description: "Failed to end workout",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-brand-charcoal">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-brand-charcoal/80 backdrop-blur-md border-b border-white/10">
        {/* Offline Banner */}
        {!isOnline && (
          <div className="bg-amber-600/90 text-amber-100 px-4 py-2 text-sm flex items-center justify-center gap-2">
            <WifiOff className="w-4 h-4" />
            Offline mode: logging locally
            {pendingCount > 0 && (
              <span className="bg-amber-500 text-amber-900 px-2 py-1 rounded text-xs ml-2">
                {pendingCount} pending
              </span>
            )}
          </div>
        )}
        
        {/* Syncing Banner */}
        {isSyncing && (
          <div className="bg-blue-600/90 text-blue-100 px-4 py-2 text-sm flex items-center justify-center gap-2">
            <Wifi className="w-4 h-4 animate-pulse" />
            Syncing workout data...
          </div>
        )}
        
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-xl font-display font-semibold text-white">
            New Workout
          </h1>
          <div className="w-16" /> {/* Spacer for centering */}
        </div>
      </div>

      <div className="p-4 space-y-6 pb-32">
        {/* Session Notes */}
        <GlassCard className="p-4">
          <label className="block text-sm font-medium text-white/80 mb-2">
            Session Notes
          </label>
          <Textarea
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            placeholder="Add any notes about your workout..."
            className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-brand-electric focus:ring-brand-electric"
            rows={3}
          />
        </GlassCard>

        {/* Sets List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Exercise Sets</h2>
          
          {sets.length === 0 ? (
            <GlassCard className="p-8 text-center">
              <p className="text-white/60 mb-4">No sets added yet</p>
              <Button onClick={addSet} variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <Plus className="w-4 h-4 mr-2" />
                Add First Set
              </Button>
            </GlassCard>
          ) : (
            sets.map((set) => (
              <SetRow
                key={set.id}
                set={set}
                exercises={exercises}
                onUpdate={(field, value) => updateSet(set.id, field as keyof WorkoutSet, value)}
                onRemove={() => removeSet(set.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-brand-charcoal/80 backdrop-blur-md border-t border-white/10 p-4">
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={endWorkout}
            disabled={isLoading}
            className="flex-1 border-white/20 text-white hover:bg-white/10"
          >
            <Square className="w-4 h-4 mr-2" />
            End Workout
          </Button>
          <Button
            onClick={saveAndContinue}
            disabled={isLoading}
            className="flex-1 bg-brand-electric hover:bg-brand-electric/80 text-brand-charcoal"
          >
            <Save className="w-4 h-4 mr-2" />
            Save & Continue
          </Button>
        </div>
      </div>

      {/* FAB for adding sets */}
      {sets.length > 0 && (
        <Fab
          onPress={addSet}
          icon={<Plus className="w-6 h-6" />}
          aria-label="Add new set"
          className="fixed bottom-24 right-4"
        />
      )}
    </div>
  );
};

export default LogWorkoutScreen;