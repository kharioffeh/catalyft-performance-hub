import React, { createContext, useContext, useState, useRef, ReactNode } from 'react';
import { Exercise } from '@/types/exercise';
import { supabase } from '@/integrations/supabase/client';

export interface WorkoutSet {
  id: string;
  exerciseId: string;
  setNumber: number;
  weight?: number;
  reps?: number;
  duration?: number;
  rpe?: number;
  completed: boolean;
  completedAt?: Date;
  restTimer?: number;
}

export interface WorkoutExercise {
  id: string;
  exercise: Exercise;
  targetSets: number;
  targetReps?: number;
  targetWeight?: number;
  sets: WorkoutSet[];
  notes?: string;
  completed: boolean;
}

export interface ActiveWorkout {
  id: string;
  dbSessionId?: string;
  name: string;
  startedAt: Date;
  exercises: WorkoutExercise[];
  currentExerciseIndex: number;
  currentSetIndex: number;
  isActive: boolean;
  totalDuration: number;
}

interface WorkoutContextType {
  activeWorkout: ActiveWorkout | null;
  startWorkout: (exercises: Exercise[], workoutName?: string) => Promise<void>;
  addExerciseToWorkout: (exercise: Exercise, targetSets?: number) => void;
  removeExerciseFromWorkout: (exerciseId: string) => void;
  completeSet: (exerciseId: string, setIndex: number, data: Partial<WorkoutSet>) => void;
  startRestTimer: (exerciseId: string, setIndex: number, duration: number) => void;
  moveToNextSet: () => void;
  moveToPreviousSet: () => void;
  endWorkout: () => Promise<void>;
  pauseWorkout: () => void;
  resumeWorkout: () => void;
  updateWorkoutTimer: () => void;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
};

interface WorkoutProviderProps {
  children: ReactNode;
}

export const WorkoutProvider: React.FC<WorkoutProviderProps> = ({ children }) => {
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkout | null>(null);
  const workoutRef = useRef<ActiveWorkout | null>(null);

  // Keep ref in sync with state so async callbacks can read current workout
  React.useEffect(() => {
    workoutRef.current = activeWorkout;
  }, [activeWorkout]);

  const generateWorkoutId = () => `workout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const generateSetId = () => `set_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const startWorkout = async (exercises: Exercise[], workoutName = 'Workout') => {
    const workoutExercises: WorkoutExercise[] = exercises.map((exercise, index) => ({
      id: `exercise_${index}_${exercise.id}`,
      exercise,
      targetSets: 3,
      sets: Array.from({ length: 3 }, (_, setIndex) => ({
        id: generateSetId(),
        exerciseId: exercise.id,
        setNumber: setIndex + 1,
        completed: false,
      })),
      completed: false,
    }));

    // Create a DB session for persistence
    let dbSessionId: string | undefined;
    try {
      const { data, error } = await supabase.functions.invoke('createWorkout', {
        body: { notes: workoutName },
      });
      if (!error && data?.id) {
        dbSessionId = data.id;
      } else {
        console.error('Failed to create workout session in DB:', error);
      }
    } catch (err) {
      console.error('Error calling createWorkout:', err);
    }

    const workout: ActiveWorkout = {
      id: dbSessionId || generateWorkoutId(),
      dbSessionId,
      name: workoutName,
      startedAt: new Date(),
      exercises: workoutExercises,
      currentExerciseIndex: 0,
      currentSetIndex: 0,
      isActive: true,
      totalDuration: 0,
    };

    setActiveWorkout(workout);
  };

  const addExerciseToWorkout = (exercise: Exercise, targetSets = 3) => {
    if (!activeWorkout) return;

    const newExercise: WorkoutExercise = {
      id: `exercise_${activeWorkout.exercises.length}_${exercise.id}`,
      exercise,
      targetSets,
      sets: Array.from({ length: targetSets }, (_, setIndex) => ({
        id: generateSetId(),
        exerciseId: exercise.id,
        setNumber: setIndex + 1,
        completed: false,
      })),
      completed: false,
    };

    setActiveWorkout(prev => prev ? {
      ...prev,
      exercises: [...prev.exercises, newExercise]
    } : null);
  };

  const removeExerciseFromWorkout = (exerciseId: string) => {
    if (!activeWorkout) return;

    setActiveWorkout(prev => prev ? {
      ...prev,
      exercises: prev.exercises.filter(ex => ex.exercise.id !== exerciseId)
    } : null);
  };

  const completeSet = (exerciseId: string, setIndex: number, data: Partial<WorkoutSet>) => {
    if (!activeWorkout) return;

    // Find exercise name for DB logging
    const exercise = activeWorkout.exercises.find(ex => ex.exercise.id === exerciseId);
    const exerciseName = exercise?.exercise.name || exerciseId;

    setActiveWorkout(prev => {
      if (!prev) return null;

      const updatedExercises = prev.exercises.map(ex => {
        if (ex.exercise.id === exerciseId) {
          const updatedSets = ex.sets.map((set, index) => {
            if (index === setIndex) {
              return {
                ...set,
                ...data,
                completed: true,
                completedAt: new Date(),
              };
            }
            return set;
          });

          const allSetsCompleted = updatedSets.every(set => set.completed);

          return {
            ...ex,
            sets: updatedSets,
            completed: allSetsCompleted,
          };
        }
        return ex;
      });

      return {
        ...prev,
        exercises: updatedExercises,
      };
    });

    // Persist completed set to DB (fire-and-forget)
    const dbSessionId = activeWorkout.dbSessionId;
    if (dbSessionId && data.weight != null && data.reps != null) {
      supabase.functions.invoke('logSet', {
        body: {
          session_id: dbSessionId,
          exercise: exerciseName,
          weight: data.weight,
          reps: data.reps,
          ...(data.rpe != null && { rpe: data.rpe }),
        },
      }).catch(err => {
        console.error('Failed to persist set to DB:', err);
      });
    }
  };

  const startRestTimer = (exerciseId: string, setIndex: number, duration: number) => {
    if (!activeWorkout) return;

    setActiveWorkout(prev => {
      if (!prev) return null;

      const updatedExercises = prev.exercises.map(exercise => {
        if (exercise.exercise.id === exerciseId) {
          const updatedSets = exercise.sets.map((set, index) => {
            if (index === setIndex) {
              return {
                ...set,
                restTimer: duration,
              };
            }
            return set;
          });

          return {
            ...exercise,
            sets: updatedSets,
          };
        }
        return exercise;
      });

      return {
        ...prev,
        exercises: updatedExercises,
      };
    });
  };

  const moveToNextSet = () => {
    if (!activeWorkout) return;

    setActiveWorkout(prev => {
      if (!prev) return null;

      const currentExercise = prev.exercises[prev.currentExerciseIndex];
      let newSetIndex = prev.currentSetIndex + 1;
      let newExerciseIndex = prev.currentExerciseIndex;

      // If we've completed all sets for current exercise, move to next exercise
      if (newSetIndex >= currentExercise.sets.length) {
        newSetIndex = 0;
        newExerciseIndex += 1;

        // If we've completed all exercises, don't move further
        if (newExerciseIndex >= prev.exercises.length) {
          newExerciseIndex = prev.exercises.length - 1;
          newSetIndex = currentExercise.sets.length - 1;
        }
      }

      return {
        ...prev,
        currentExerciseIndex: newExerciseIndex,
        currentSetIndex: newSetIndex,
      };
    });
  };

  const moveToPreviousSet = () => {
    if (!activeWorkout) return;

    setActiveWorkout(prev => {
      if (!prev) return null;

      let newSetIndex = prev.currentSetIndex - 1;
      let newExerciseIndex = prev.currentExerciseIndex;

      // If we're at the first set of current exercise, move to previous exercise's last set
      if (newSetIndex < 0) {
        newExerciseIndex -= 1;

        if (newExerciseIndex >= 0) {
          newSetIndex = prev.exercises[newExerciseIndex].sets.length - 1;
        } else {
          newExerciseIndex = 0;
          newSetIndex = 0;
        }
      }

      return {
        ...prev,
        currentExerciseIndex: newExerciseIndex,
        currentSetIndex: newSetIndex,
      };
    });
  };

  const endWorkout = async () => {
    const current = workoutRef.current;
    if (current?.dbSessionId) {
      try {
        await supabase.functions.invoke('endWorkout', {
          body: { session_id: current.dbSessionId },
        });
      } catch (err) {
        console.error('Failed to end workout session in DB:', err);
      }
    }
    setActiveWorkout(null);
  };

  const pauseWorkout = () => {
    if (!activeWorkout) return;
    setActiveWorkout(prev => prev ? { ...prev, isActive: false } : null);
  };

  const resumeWorkout = () => {
    if (!activeWorkout) return;
    setActiveWorkout(prev => prev ? { ...prev, isActive: true } : null);
  };

  const updateWorkoutTimer = () => {
    if (!activeWorkout || !activeWorkout.isActive) return;

    setActiveWorkout(prev => {
      if (!prev || !prev.isActive) return prev;

      const now = new Date();
      const duration = Math.floor((now.getTime() - prev.startedAt.getTime()) / 1000);

      return {
        ...prev,
        totalDuration: duration,
      };
    });
  };

  // Update timer every second
  React.useEffect(() => {
    const interval = setInterval(updateWorkoutTimer, 1000);
    return () => clearInterval(interval);
  }, [activeWorkout?.isActive]);

  const value: WorkoutContextType = {
    activeWorkout,
    startWorkout,
    addExerciseToWorkout,
    removeExerciseFromWorkout,
    completeSet,
    startRestTimer,
    moveToNextSet,
    moveToPreviousSet,
    endWorkout,
    pauseWorkout,
    resumeWorkout,
    updateWorkoutTimer,
  };

  return (
    <WorkoutContext.Provider value={value}>
      {children}
    </WorkoutContext.Provider>
  );
};