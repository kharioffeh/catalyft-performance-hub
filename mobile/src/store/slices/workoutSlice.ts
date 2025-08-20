/**
 * Workout state slice for Zustand store
 */

import { StateCreator } from 'zustand';
import { Workout, Exercise, WorkoutExercise, ExerciseSet } from '../../types/models';
import { supabaseService } from '../../services/supabase';
import { safeValidateData, CreateWorkoutSchema } from '../../utils/validators';

export interface WorkoutSlice {
  // State
  workouts: Workout[];
  exercises: Exercise[];
  currentWorkout: Workout | null;
  activeWorkout: Workout | null; // Currently in-progress workout
  workoutTemplates: Workout[];
  isLoading: boolean;
  error: string | null;
  
  // Filters
  workoutFilters: {
    status?: string;
    type?: string;
    startDate?: Date;
    endDate?: Date;
  };
  
  // Actions
  setWorkouts: (workouts: Workout[]) => void;
  setExercises: (exercises: Exercise[]) => void;
  setCurrentWorkout: (workout: Workout | null) => void;
  setActiveWorkout: (workout: Workout | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setWorkoutFilters: (filters: any) => void;
  
  // Workout CRUD
  loadWorkouts: (userId: string, filters?: any) => Promise<void>;
  loadWorkout: (workoutId: string) => Promise<void>;
  createWorkout: (workout: any) => Promise<Workout>;
  updateWorkout: (workoutId: string, updates: any) => Promise<void>;
  deleteWorkout: (workoutId: string) => Promise<void>;
  duplicateWorkout: (workoutId: string) => Promise<Workout>;
  
  // Template operations
  loadTemplates: (userId: string) => Promise<void>;
  saveAsTemplate: (workoutId: string, name: string) => Promise<void>;
  createWorkoutFromTemplate: (templateId: string, scheduledDate?: Date) => Promise<Workout>;
  
  // Exercise operations
  loadExercises: (filters?: any) => Promise<void>;
  searchExercises: (query: string) => Promise<Exercise[]>;
  createCustomExercise: (exercise: any) => Promise<Exercise>;
  
  // Workout session management
  startWorkout: (workoutId: string) => Promise<void>;
  pauseWorkout: () => void;
  resumeWorkout: () => void;
  completeWorkout: () => Promise<void>;
  cancelWorkout: () => Promise<void>;
  
  // Set management during workout
  updateSet: (exerciseId: string, setId: string, updates: Partial<ExerciseSet>) => void;
  completeSet: (exerciseId: string, setId: string, actualData: any) => void;
  addSet: (exerciseId: string, set: ExerciseSet) => void;
  removeSet: (exerciseId: string, setId: string) => void;
  
  // Exercise management during workout
  addExerciseToWorkout: (exercise: WorkoutExercise) => void;
  removeExerciseFromWorkout: (exerciseId: string) => void;
  reorderExercises: (exercises: WorkoutExercise[]) => void;
  updateExerciseNotes: (exerciseId: string, notes: string) => void;
  
  // Analytics
  getWorkoutStats: (userId: string, period: 'week' | 'month' | 'year') => Promise<any>;
  getExerciseHistory: (exerciseId: string, userId: string) => Promise<any>;
  getPersonalRecords: (userId: string) => Promise<any>;
}

export const createWorkoutSlice: StateCreator<WorkoutSlice> = (set, get) => ({
  // Initial state
  workouts: [],
  exercises: [],
  currentWorkout: null,
  activeWorkout: null,
  workoutTemplates: [],
  isLoading: false,
  error: null,
  workoutFilters: {},

  // Basic setters
  setWorkouts: (workouts) => set({ workouts }),
  setExercises: (exercises) => set({ exercises }),
  setCurrentWorkout: (workout) => set({ currentWorkout: workout }),
  setActiveWorkout: (workout) => set({ activeWorkout: workout }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setWorkoutFilters: (filters) => set({ workoutFilters: filters }),

  // Workout CRUD
  loadWorkouts: async (userId, filters) => {
    set({ isLoading: true, error: null });
    try {
      const workouts = await supabaseService.getWorkouts(userId, filters || get().workoutFilters);
      set({ workouts, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to load workouts',
        isLoading: false 
      });
    }
  },

  loadWorkout: async (workoutId) => {
    set({ isLoading: true, error: null });
    try {
      const workout = await supabaseService.getWorkout(workoutId);
      set({ 
        currentWorkout: workout,
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to load workout',
        isLoading: false 
      });
    }
  },

  createWorkout: async (workoutData) => {
    set({ isLoading: true, error: null });
    try {
      // Validate workout data
      const validation = safeValidateData(CreateWorkoutSchema, workoutData);
      if (!validation.success) {
        throw new Error(validation.error.issues[0].message);
      }

      const workout = await supabaseService.createWorkout(workoutData);
      
      set(state => ({
        workouts: [workout, ...state.workouts],
        isLoading: false,
      }));
      
      return workout;
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to create workout',
        isLoading: false 
      });
      throw error;
    }
  },

  updateWorkout: async (workoutId, updates) => {
    set({ isLoading: true, error: null });
    try {
      const updatedWorkout = await supabaseService.updateWorkout(workoutId, updates);
      
      set(state => ({
        workouts: state.workouts.map(w => w.id === workoutId ? updatedWorkout : w),
        currentWorkout: state.currentWorkout?.id === workoutId ? updatedWorkout : state.currentWorkout,
        activeWorkout: state.activeWorkout?.id === workoutId ? updatedWorkout : state.activeWorkout,
        isLoading: false,
      }));
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to update workout',
        isLoading: false 
      });
      throw error;
    }
  },

  deleteWorkout: async (workoutId) => {
    set({ isLoading: true, error: null });
    try {
      await supabaseService.deleteWorkout(workoutId);
      
      set(state => ({
        workouts: state.workouts.filter(w => w.id !== workoutId),
        currentWorkout: state.currentWorkout?.id === workoutId ? null : state.currentWorkout,
        isLoading: false,
      }));
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to delete workout',
        isLoading: false 
      });
      throw error;
    }
  },

  duplicateWorkout: async (workoutId) => {
    const workout = get().workouts.find(w => w.id === workoutId);
    if (!workout) throw new Error('Workout not found');

    const duplicatedWorkout = {
      ...workout,
      id: undefined,
      name: `${workout.name} (Copy)`,
      scheduledDate: undefined,
      completedDate: undefined,
      status: 'scheduled',
      createdAt: undefined,
      updatedAt: undefined,
    };

    return get().createWorkout(duplicatedWorkout);
  },

  // Template operations
  loadTemplates: async (userId) => {
    try {
      const templates = await supabaseService.getWorkouts(userId);
      // Filter templates locally
      const filteredTemplates = templates.filter(w => w.isTemplate);
      set({ workoutTemplates: filteredTemplates });
    } catch (error: any) {
      set({ error: error.message || 'Failed to load templates' });
    }
  },

  saveAsTemplate: async (workoutId, name) => {
    const workout = get().workouts.find(w => w.id === workoutId);
    if (!workout) throw new Error('Workout not found');

    const template = {
      ...workout,
      id: undefined,
      name,
      isTemplate: true,
      templateId: undefined,
      scheduledDate: undefined,
      completedDate: undefined,
      status: 'scheduled',
    };

    await get().createWorkout(template);
    await get().loadTemplates(workout.userId);
  },

  createWorkoutFromTemplate: async (templateId, scheduledDate) => {
    const template = get().workoutTemplates.find(t => t.id === templateId);
    if (!template) throw new Error('Template not found');

    const workout = {
      ...template,
      id: undefined,
      isTemplate: false,
      templateId,
      scheduledDate,
      status: 'scheduled',
      createdAt: undefined,
      updatedAt: undefined,
    };

    return get().createWorkout(workout);
  },

  // Exercise operations
  loadExercises: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const exercises = await supabaseService.getExercises(filters);
      set({ exercises, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to load exercises',
        isLoading: false 
      });
    }
  },

  searchExercises: async (query) => {
    try {
      const exercises = await supabaseService.getExercises({ search: query });
      return exercises;
    } catch (error: any) {
      set({ error: error.message || 'Failed to search exercises' });
      return [];
    }
  },

  createCustomExercise: async (exerciseData) => {
    try {
      const exercise = await supabaseService.createExercise({
        ...exerciseData,
        is_custom: true,
      });
      
      set(state => ({
        exercises: [...state.exercises, exercise],
      }));
      
      return exercise;
    } catch (error: any) {
      set({ error: error.message || 'Failed to create custom exercise' });
      throw error;
    }
  },

  // Workout session management
  startWorkout: async (workoutId) => {
    const workout = get().workouts.find(w => w.id === workoutId);
    if (!workout) throw new Error('Workout not found');

    set({ 
      activeWorkout: { ...workout, status: 'in_progress' },
      error: null,
    });

    // Update status in database
    try {
      await supabaseService.updateWorkout(workoutId, { 
        status: 'in_progress',
      });
    } catch (error: any) {
      set({ error: error.message || 'Failed to start workout' });
    }
  },

  pauseWorkout: () => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;

    set({
      activeWorkout: { ...activeWorkout, /* isPaused: true */ },
    });
  },

  resumeWorkout: () => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;

    set({
      activeWorkout: { ...activeWorkout, /* isPaused: false */ },
    });
  },

  completeWorkout: async () => {
    const { activeWorkout } = get();
    if (!activeWorkout) throw new Error('No active workout');

    const completedWorkout = {
      ...activeWorkout,
      status: 'completed' as const,
      completedDate: new Date(),
    };

    try {
      await supabaseService.updateWorkout(activeWorkout.id, {
        status: 'completed',
        completed_date: new Date().toISOString(),
        exercises: completedWorkout.exercises as any,
      });

      set(state => ({
        workouts: state.workouts.map(w => 
          w.id === activeWorkout.id ? completedWorkout : w
        ),
        activeWorkout: null,
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to complete workout' });
      throw error;
    }
  },

  cancelWorkout: async () => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;

    try {
      await supabaseService.updateWorkout(activeWorkout.id, {
        status: 'scheduled',
      });

      set({ activeWorkout: null });
    } catch (error: any) {
      set({ error: error.message || 'Failed to cancel workout' });
    }
  },

  // Set management during workout
  updateSet: (exerciseId, setId, updates) => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;

    const updatedExercises = activeWorkout.exercises.map(exercise => {
      if (exercise.id === exerciseId) {
        return {
          ...exercise,
          sets: exercise.sets.map(set => 
            set.id === setId ? { ...set, ...updates } : set
          ),
        };
      }
      return exercise;
    });

    set({
      activeWorkout: {
        ...activeWorkout,
        exercises: updatedExercises,
      },
    });
  },

  completeSet: (exerciseId, setId, actualData) => {
    get().updateSet(exerciseId, setId, {
      isCompleted: true,
      ...actualData,
    });
  },

  addSet: (exerciseId, newSet) => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;

    const updatedExercises = activeWorkout.exercises.map(exercise => {
      if (exercise.id === exerciseId) {
        return {
          ...exercise,
          sets: [...exercise.sets, newSet],
        };
      }
      return exercise;
    });

    set({
      activeWorkout: {
        ...activeWorkout,
        exercises: updatedExercises,
      },
    });
  },

  removeSet: (exerciseId, setId) => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;

    const updatedExercises = activeWorkout.exercises.map(exercise => {
      if (exercise.id === exerciseId) {
        return {
          ...exercise,
          sets: exercise.sets.filter(set => set.id !== setId),
        };
      }
      return exercise;
    });

    set({
      activeWorkout: {
        ...activeWorkout,
        exercises: updatedExercises,
      },
    });
  },

  // Exercise management during workout
  addExerciseToWorkout: (newExercise) => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;

    set({
      activeWorkout: {
        ...activeWorkout,
        exercises: [...activeWorkout.exercises, newExercise],
      },
    });
  },

  removeExerciseFromWorkout: (exerciseId) => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;

    set({
      activeWorkout: {
        ...activeWorkout,
        exercises: activeWorkout.exercises.filter(e => e.id !== exerciseId),
      },
    });
  },

  reorderExercises: (exercises) => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;

    set({
      activeWorkout: {
        ...activeWorkout,
        exercises,
      },
    });
  },

  updateExerciseNotes: (exerciseId, notes) => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;

    const updatedExercises = activeWorkout.exercises.map(exercise => 
      exercise.id === exerciseId ? { ...exercise, notes } : exercise
    );

    set({
      activeWorkout: {
        ...activeWorkout,
        exercises: updatedExercises,
      },
    });
  },

  // Analytics
  getWorkoutStats: async (userId, period) => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      
      switch (period) {
        case 'week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      const workouts = await supabaseService.getWorkouts(userId, {
        startDate,
        endDate,
        status: 'completed',
      });

      const stats = {
        totalWorkouts: workouts.length,
        totalDuration: workouts.reduce((sum, w) => sum + w.duration, 0),
        totalCalories: workouts.reduce((sum, w) => sum + (w.totalCaloriesBurned || 0), 0),
        workoutsByType: workouts.reduce((acc, w) => {
          acc[w.type] = (acc[w.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        averageDuration: workouts.length > 0 
          ? workouts.reduce((sum, w) => sum + w.duration, 0) / workouts.length 
          : 0,
      };

      return stats;
    } catch (error: any) {
      set({ error: error.message || 'Failed to get workout stats' });
      return null;
    }
  },

  getExerciseHistory: async (exerciseId, userId) => {
    try {
      const workouts = await supabaseService.getWorkouts(userId, {
        status: 'completed',
      });

      const history = workouts
        .filter(w => w.exercises.some(e => e.exerciseId === exerciseId))
        .map(w => {
          const exercise = w.exercises.find(e => e.exerciseId === exerciseId);
          return {
            date: w.completedDate,
            sets: exercise?.sets || [],
            notes: exercise?.notes,
          };
        })
        .sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime());

      return history;
    } catch (error: any) {
      set({ error: error.message || 'Failed to get exercise history' });
      return [];
    }
  },

  getPersonalRecords: async (userId) => {
    try {
      const stats = await supabaseService.getUserStats(userId);
      return stats?.personal_records || [];
    } catch (error: any) {
      set({ error: error.message || 'Failed to get personal records' });
      return [];
    }
  },
});