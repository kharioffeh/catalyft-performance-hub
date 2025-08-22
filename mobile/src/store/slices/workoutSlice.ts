import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import workoutService from '../../services/workout';
import {
  Workout,
  WorkoutExercise,
  WorkoutSet,
  Exercise,
  WorkoutTemplate,
  PersonalRecord,
  TimerState,
  WorkoutSettings,
  ExerciseSearchFilters,
  WorkoutStats,
  WorkoutGoal,
  RestTimer
} from '../../types/workout';
import { Alert } from 'react-native';

// Export WorkoutState as WorkoutSlice for compatibility
export interface WorkoutSlice {
  // Current workout
  currentWorkout: Workout | null;
  workoutTimer: TimerState;
  restTimer: RestTimer | null;
  
  // Workout history
  workoutHistory: Workout[];
  workoutHistoryLoading: boolean;
  
  // Exercise library
  exercises: Exercise[];
  exercisesLoading: boolean;
  favoriteExercises: Exercise[];
  recentExercises: Exercise[];
  exerciseSearchFilters: ExerciseSearchFilters;
  
  // Templates
  templates: WorkoutTemplate[];
  templatesLoading: boolean;
  
  // Personal records
  personalRecords: PersonalRecord[];
  newPersonalRecords: PersonalRecord[];
  
  // Stats and goals
  workoutStats: WorkoutStats | null;
  workoutGoals: WorkoutGoal[];
  
  // Settings
  workoutSettings: WorkoutSettings;
  
  // Actions - Workout Management
  startWorkout: (name?: string, templateId?: string) => Promise<void>;
  pauseWorkout: () => void;
  resumeWorkout: () => void;
  finishWorkout: () => Promise<void>;
  cancelWorkout: () => void;
  updateWorkoutNotes: (notes: string) => void;
  
  // Actions - Exercise Management
  addExerciseToWorkout: (exercise: Exercise) => Promise<void>;
  removeExerciseFromWorkout: (exerciseId: string) => Promise<void>;
  reorderExercises: (exerciseIds: string[]) => Promise<void>;
  updateExerciseNotes: (exerciseId: string, notes: string) => Promise<void>;
  
  // Actions - Set Management
  addSet: (exerciseId: string) => Promise<void>;
  updateSet: (exerciseId: string, setId: string, updates: Partial<WorkoutSet>) => Promise<void>;
  deleteSet: (exerciseId: string, setId: string) => Promise<void>;
  completeSet: (exerciseId: string, setId: string) => Promise<void>;
  copyPreviousSet: (exerciseId: string, setId: string) => Promise<void>;
  
  // Actions - Exercise Library
  loadExercises: (filters?: ExerciseSearchFilters) => Promise<void>;
  searchExercises: (query: string) => Promise<void>;
  toggleFavoriteExercise: (exerciseId: string) => Promise<void>;
  createCustomExercise: (exercise: Partial<Exercise>) => Promise<void>;
  setExerciseFilters: (filters: ExerciseSearchFilters) => void;
  
  // Actions - Templates
  loadTemplates: () => Promise<void>;
  createTemplate: (template: Partial<WorkoutTemplate>) => Promise<void>;
  startWorkoutFromTemplate: (templateId: string) => Promise<void>;
  saveWorkoutAsTemplate: (workoutId: string, name: string, description?: string) => Promise<void>;
  
  // Actions - History
  loadWorkoutHistory: (limit?: number) => Promise<void>;
  loadWorkoutDetails: (workoutId: string) => Promise<void>;
  deleteWorkout: (workoutId: string) => Promise<void>;
  copyWorkout: (workoutId: string) => Promise<void>;
  
  // Actions - Timer
  startRestTimer: (duration: number, exerciseName: string, setNumber: number) => void;
  pauseRestTimer: () => void;
  resumeRestTimer: () => void;
  cancelRestTimer: () => void;
  updateWorkoutTimer: () => void;
  
  // Actions - Stats and Goals
  loadWorkoutStats: (period?: 'week' | 'month' | 'year') => Promise<void>;
  loadPersonalRecords: () => Promise<void>;
  loadWorkoutGoals: () => Promise<void>;
  createWorkoutGoal: (goal: Partial<WorkoutGoal>) => Promise<void>;
  updateWorkoutGoal: (goalId: string, updates: Partial<WorkoutGoal>) => Promise<void>;
  deleteWorkoutGoal: (goalId: string) => Promise<void>;
  
  // Actions - Settings
  updateWorkoutSettings: (settings: Partial<WorkoutSettings>) => void;
  
  // Actions - Sync
  syncWorkoutData: () => Promise<void>;
  clearWorkoutData: () => void;
  
  // Additional workout-specific state (for main store compatibility)
  workouts?: Workout[];
  activeWorkout?: Workout | null;
  workoutTemplates?: WorkoutTemplate[];
  workoutFilters?: any;
  setWorkouts?: (workouts: Workout[]) => void;
  addWorkout?: (workout: Workout) => void;
  updateWorkout?: (id: string, workout: Workout) => void;
  setActiveWorkout?: (workout: Workout | null) => void;
  
  // Helper methods
  checkPersonalRecords?: () => Promise<void>;
  getPreviousWorkoutData?: (exerciseId: string) => Promise<WorkoutExercise | null>;
  calculateWorkoutVolume?: () => number;
  calculateWorkoutDuration?: () => number;
}

// Keep the original WorkoutState as an alias
interface WorkoutState extends WorkoutSlice {}

// Export a createWorkoutSlice function for the main store
export const createWorkoutSlice = () => ({
  // Current workout
  currentWorkout: null,
  workoutTimer: { 
    isRunning: false, 
    startTime: undefined, 
    pausedTime: undefined, 
    totalPausedDuration: 0,
    currentDuration: 0,
    restTimerActive: false
  },
  restTimer: null,
  
  // Workout history
  workoutHistory: [],
  workoutHistoryLoading: false,
  
  // Exercise library
  exercises: [],
  exercisesLoading: false,
  favoriteExercises: [],
  recentExercises: [],
  exerciseSearchFilters: {},
  
  // Templates
  templates: [],
  templatesLoading: false,
  
  // Personal records
  personalRecords: [],
  newPersonalRecords: [],
  
  // Stats and goals
  workoutStats: null,
  workoutGoals: [],
  
  // Settings
  workoutSettings: {
    weightUnit: 'kg' as const,
    distanceUnit: 'km' as const,
    defaultRestTime: 90,
    autoStartTimer: true,
    soundEnabled: true,
    vibrateEnabled: true,
    showPreviousWorkout: true,
    plateCalculator: [20, 10, 5, 2.5, 1.25],
  },
  
  // Placeholder actions (actual implementation is in useWorkoutStore)
  startWorkout: async () => {},
  pauseWorkout: () => {},
  resumeWorkout: () => {},
  finishWorkout: async () => {},
  cancelWorkout: () => {},
  updateWorkoutNotes: () => {},
  addExerciseToWorkout: async () => {},
  removeExerciseFromWorkout: async () => {},
  reorderExercises: async () => {},
  updateExerciseNotes: async () => {},
  addSet: async () => {},
  updateSet: async () => {},
  deleteSet: async () => {},
  completeSet: async () => {},
  copyPreviousSet: async () => {},
  loadExercises: async () => {},
  searchExercises: async () => {},
  toggleFavoriteExercise: async () => {},
  createCustomExercise: async () => {},
  setExerciseFilters: () => {},
  loadTemplates: async () => {},
  createTemplate: async () => {},
  startWorkoutFromTemplate: async () => {},
  saveWorkoutAsTemplate: async () => {},
  loadWorkoutHistory: async () => {},
  loadWorkoutDetails: async () => {},
  deleteWorkout: async () => {},
  copyWorkout: async () => {},
  startRestTimer: () => {},
  pauseRestTimer: () => {},
  resumeRestTimer: () => {},
  cancelRestTimer: () => {},
  updateWorkoutTimer: () => {},
  loadWorkoutStats: async () => {},
  loadPersonalRecords: async () => {},
  loadWorkoutGoals: async () => {},
  createWorkoutGoal: async () => {},
  updateWorkoutGoal: async () => {},
  deleteWorkoutGoal: async () => {},
  updateWorkoutSettings: () => {},
  syncWorkoutData: async () => {},
  clearWorkoutData: () => {},
  
  // Additional state for main store
  workouts: [],
  activeWorkout: null,
  workoutTemplates: [],
  workoutFilters: {},
  setWorkouts: () => {},
  addWorkout: () => {},
  updateWorkout: () => {},
  setActiveWorkout: () => {},
  
  // Helper methods
  checkPersonalRecords: async () => {},
  getPreviousWorkoutData: async () => null,
  calculateWorkoutVolume: () => 0,
  calculateWorkoutDuration: () => 0,
});

const defaultSettings: WorkoutSettings = {
  weightUnit: 'kg',
  distanceUnit: 'km',
  defaultRestTime: 90,
  autoStartTimer: true,
  soundEnabled: true,
  vibrateEnabled: true,
  showPreviousWorkout: true,
  plateCalculator: [20, 10, 5, 2.5, 1.25]
};

const defaultTimerState: TimerState = {
  isRunning: false,
  currentDuration: 0,
  totalPausedDuration: 0,
  restTimerActive: false
};

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentWorkout: null,
      workoutTimer: defaultTimerState,
      restTimer: null,
      workoutHistory: [],
      workoutHistoryLoading: false,
      exercises: [],
      exercisesLoading: false,
      favoriteExercises: [],
      recentExercises: [],
      exerciseSearchFilters: {},
      templates: [],
      templatesLoading: false,
      personalRecords: [],
      newPersonalRecords: [],
      workoutStats: null,
      workoutGoals: [],
      workoutSettings: defaultSettings,

      // Workout Management
      startWorkout: async (name?: string, templateId?: string) => {
        try {
          const workout = await workoutService.createWorkout({
            name: name || `Workout ${new Date().toLocaleDateString()}`,
            startedAt: new Date()
          });

          if (!workout) throw new Error('Failed to create workout');

          if (templateId) {
            const fullWorkout = await workoutService.createWorkoutFromTemplate(templateId);
            if (fullWorkout) {
              set({ 
                currentWorkout: fullWorkout,
                workoutTimer: {
                  ...defaultTimerState,
                  isRunning: true,
                  startTime: Date.now()
                }
              });
              return;
            }
          }

          set({ 
            currentWorkout: workout,
            workoutTimer: {
              ...defaultTimerState,
              isRunning: true,
              startTime: Date.now()
            }
          });
        } catch (error) {
          console.error('Error starting workout:', error);
          Alert.alert('Error', 'Failed to start workout');
        }
      },

      pauseWorkout: () => {
        const { workoutTimer } = get();
        if (workoutTimer.isRunning && workoutTimer.startTime) {
          const pausedDuration = Date.now() - workoutTimer.startTime;
          set({
            workoutTimer: {
              ...workoutTimer,
              isRunning: false,
              pausedTime: Date.now(),
              currentDuration: workoutTimer.currentDuration + pausedDuration
            }
          });
        }
      },

      resumeWorkout: () => {
        const { workoutTimer } = get();
        if (!workoutTimer.isRunning) {
          const pauseDuration = workoutTimer.pausedTime 
            ? Date.now() - workoutTimer.pausedTime 
            : 0;
          set({
            workoutTimer: {
              ...workoutTimer,
              isRunning: true,
              startTime: Date.now(),
              totalPausedDuration: workoutTimer.totalPausedDuration + pauseDuration,
              pausedTime: undefined
            }
          });
        }
      },

      finishWorkout: async () => {
        try {
          const { currentWorkout, workoutTimer, checkPersonalRecords } = get();
          if (!currentWorkout) return;

          // Calculate final duration
          let finalDuration = workoutTimer.currentDuration;
          if (workoutTimer.isRunning && workoutTimer.startTime) {
            finalDuration += Date.now() - workoutTimer.startTime;
          }

          const completedWorkout = await workoutService.completeWorkout(currentWorkout.id);
          
          if (completedWorkout) {
            // Check for personal records
            const { checkPersonalRecords } = get();
            if (checkPersonalRecords) {
              await checkPersonalRecords();
            }
            
            // Update history
            const history = get().workoutHistory;
            set({
              currentWorkout: null,
              workoutTimer: defaultTimerState,
              workoutHistory: [completedWorkout, ...history],
              restTimer: null
            });

            Alert.alert(
              'Workout Complete! 💪',
              `Great job! You completed ${completedWorkout.exercises.length} exercises in ${Math.floor(finalDuration / 60000)} minutes.`,
              [{ text: 'OK' }]
            );
          }
        } catch (error) {
          console.error('Error finishing workout:', error);
          Alert.alert('Error', 'Failed to complete workout');
        }
      },

      cancelWorkout: () => {
        Alert.alert(
          'Cancel Workout',
          'Are you sure you want to cancel this workout? All progress will be lost.',
          [
            { text: 'No', style: 'cancel' },
            {
              text: 'Yes',
              style: 'destructive',
              onPress: async () => {
                const { currentWorkout } = get();
                if (currentWorkout) {
                  await workoutService.deleteWorkout(currentWorkout.id);
                }
                set({
                  currentWorkout: null,
                  workoutTimer: defaultTimerState,
                  restTimer: null
                });
              }
            }
          ]
        );
      },

      updateWorkoutNotes: (notes: string) => {
        const { currentWorkout } = get();
        if (currentWorkout) {
          set({
            currentWorkout: {
              ...currentWorkout,
              notes
            }
          });
          workoutService.updateWorkout(currentWorkout.id, { notes });
        }
      },

      // Exercise Management
      addExerciseToWorkout: async (exercise: Exercise) => {
        try {
          const { currentWorkout } = get();
          if (!currentWorkout) return;

          const workoutExercise = await workoutService.addExerciseToWorkout(
            currentWorkout.id,
            { exercise }
          );

          if (workoutExercise) {
            // Add default sets
            const sets: WorkoutSet[] = [];
            for (let i = 0; i < 3; i++) {
              const newSet = await workoutService.addSet(workoutExercise.id, {
                setNumber: i + 1,
                completed: false
              });
              if (newSet) sets.push(newSet);
            }

            workoutExercise.sets = sets;

            // Get previous workout data for reference
            const { getPreviousWorkoutData } = get();
            if (getPreviousWorkoutData) {
              const previousData = await getPreviousWorkoutData(exercise.id);
              if (previousData) {
                workoutExercise.previousSets = previousData.sets;
              }
            }

            set({
              currentWorkout: {
                ...currentWorkout,
                exercises: [...currentWorkout.exercises, workoutExercise]
              }
            });

            // Add to recent exercises
            const recentExercises = get().recentExercises.filter(e => e.id !== exercise.id);
            set({
              recentExercises: [exercise, ...recentExercises].slice(0, 10)
            });
          }
        } catch (error) {
          console.error('Error adding exercise:', error);
          Alert.alert('Error', 'Failed to add exercise');
        }
      },

      removeExerciseFromWorkout: async (exerciseId: string) => {
        try {
          const { currentWorkout } = get();
          if (!currentWorkout) return;

          const exercise = currentWorkout.exercises.find(e => e.id === exerciseId);
          if (!exercise) return;

          const success = await workoutService.removeExerciseFromWorkout(exerciseId);
          if (success) {
            set({
              currentWorkout: {
                ...currentWorkout,
                exercises: currentWorkout.exercises.filter(e => e.id !== exerciseId)
              }
            });
          }
        } catch (error) {
          console.error('Error removing exercise:', error);
          Alert.alert('Error', 'Failed to remove exercise');
        }
      },

      reorderExercises: async (exerciseIds: string[]) => {
        try {
          const { currentWorkout } = get();
          if (!currentWorkout) return;

          const success = await workoutService.reorderExercises(currentWorkout.id, exerciseIds);
          if (success) {
            const reorderedExercises = exerciseIds
              .map(id => currentWorkout.exercises.find(e => e.id === id))
              .filter(Boolean) as WorkoutExercise[];

            set({
              currentWorkout: {
                ...currentWorkout,
                exercises: reorderedExercises
              }
            });
          }
        } catch (error) {
          console.error('Error reordering exercises:', error);
        }
      },

      updateExerciseNotes: async (exerciseId: string, notes: string) => {
        const { currentWorkout } = get();
        if (!currentWorkout) return;

        const exerciseIndex = currentWorkout.exercises.findIndex(e => e.id === exerciseId);
        if (exerciseIndex === -1) return;

        const updatedExercises = [...currentWorkout.exercises];
        updatedExercises[exerciseIndex] = {
          ...updatedExercises[exerciseIndex],
          notes
        };

        set({
          currentWorkout: {
            ...currentWorkout,
            exercises: updatedExercises
          }
        });
      },

      // Set Management
      addSet: async (exerciseId: string) => {
        try {
          const { currentWorkout } = get();
          if (!currentWorkout) return;

          const exerciseIndex = currentWorkout.exercises.findIndex(e => e.id === exerciseId);
          if (exerciseIndex === -1) return;

          const exercise = currentWorkout.exercises[exerciseIndex];
          const newSet = await workoutService.addSet(exerciseId, {
            setNumber: exercise.sets.length + 1,
            completed: false
          });

          if (newSet) {
            const updatedExercises = [...currentWorkout.exercises];
            updatedExercises[exerciseIndex] = {
              ...exercise,
              sets: [...exercise.sets, newSet]
            };

            set({
              currentWorkout: {
                ...currentWorkout,
                exercises: updatedExercises
              }
            });
          }
        } catch (error) {
          console.error('Error adding set:', error);
          Alert.alert('Error', 'Failed to add set');
        }
      },

      updateSet: async (exerciseId: string, setId: string, updates: Partial<WorkoutSet>) => {
        try {
          const { currentWorkout } = get();
          if (!currentWorkout) return;

          const exerciseIndex = currentWorkout.exercises.findIndex(e => e.id === exerciseId);
          if (exerciseIndex === -1) return;

          const updatedSet = await workoutService.updateSet(setId, updates);
          if (updatedSet) {
            const exercise = currentWorkout.exercises[exerciseIndex];
            const setIndex = exercise.sets.findIndex(s => s.id === setId);
            
            if (setIndex !== -1) {
              const updatedSets = [...exercise.sets];
              updatedSets[setIndex] = updatedSet;

              const updatedExercises = [...currentWorkout.exercises];
              updatedExercises[exerciseIndex] = {
                ...exercise,
                sets: updatedSets
              };

              set({
                currentWorkout: {
                  ...currentWorkout,
                  exercises: updatedExercises
                }
              });
            }
          }
        } catch (error) {
          console.error('Error updating set:', error);
        }
      },

      deleteSet: async (exerciseId: string, setId: string) => {
        try {
          const { currentWorkout } = get();
          if (!currentWorkout) return;

          const exerciseIndex = currentWorkout.exercises.findIndex(e => e.id === exerciseId);
          if (exerciseIndex === -1) return;

          const success = await workoutService.deleteSet(setId);
          if (success) {
            const exercise = currentWorkout.exercises[exerciseIndex];
            const updatedSets = exercise.sets.filter(s => s.id !== setId);

            const updatedExercises = [...currentWorkout.exercises];
            updatedExercises[exerciseIndex] = {
              ...exercise,
              sets: updatedSets
            };

            set({
              currentWorkout: {
                ...currentWorkout,
                exercises: updatedExercises
              }
            });
          }
        } catch (error) {
          console.error('Error deleting set:', error);
          Alert.alert('Error', 'Failed to delete set');
        }
      },

      completeSet: async (exerciseId: string, setId: string) => {
        const { updateSet, workoutSettings, startRestTimer } = get();
        await updateSet(exerciseId, setId, { completed: true });

        // Auto-start rest timer if enabled
        if (workoutSettings.autoStartTimer) {
          const { currentWorkout } = get();
          if (currentWorkout) {
            const exercise = currentWorkout.exercises.find(e => e.id === exerciseId);
            const set = exercise?.sets.find(s => s.id === setId);
            if (exercise && set) {
              startRestTimer(
                set.restSeconds || workoutSettings.defaultRestTime,
                exercise.exercise.name,
                set.setNumber
              );
            }
          }
        }
      },

      copyPreviousSet: async (exerciseId: string, setId: string) => {
        const { currentWorkout, updateSet } = get();
        if (!currentWorkout) return;

        const exercise = currentWorkout.exercises.find(e => e.id === exerciseId);
        if (!exercise) return;

        const currentSetIndex = exercise.sets.findIndex(s => s.id === setId);
        if (currentSetIndex <= 0) return;

        const previousSet = exercise.sets[currentSetIndex - 1];
        await updateSet(exerciseId, setId, {
          weight: previousSet.weight,
          reps: previousSet.reps,
          restSeconds: previousSet.restSeconds
        });
      },

      // Exercise Library
      loadExercises: async (filters?: ExerciseSearchFilters) => {
        set({ exercisesLoading: true });
        try {
          const exercises = await workoutService.getExercises(filters);
          const favorites = await workoutService.getFavoriteExercises();
          
          set({ 
            exercises,
            favoriteExercises: favorites,
            exercisesLoading: false 
          });
        } catch (error) {
          console.error('Error loading exercises:', error);
          set({ exercisesLoading: false });
        }
      },

      searchExercises: async (query: string) => {
        const filters = { ...get().exerciseSearchFilters, query };
        await get().loadExercises(filters);
      },

      toggleFavoriteExercise: async (exerciseId: string) => {
        try {
          const isFavorite = await workoutService.toggleFavoriteExercise(exerciseId);
          const { favoriteExercises, exercises } = get();
          
          if (isFavorite) {
            const exercise = exercises.find(e => e.id === exerciseId);
            if (exercise) {
              set({ favoriteExercises: [...favoriteExercises, exercise] });
            }
          } else {
            set({ 
              favoriteExercises: favoriteExercises.filter(e => e.id !== exerciseId) 
            });
          }
        } catch (error) {
          console.error('Error toggling favorite:', error);
        }
      },

      createCustomExercise: async (exercise: Partial<Exercise>) => {
        try {
          const newExercise = await workoutService.createCustomExercise(exercise);
          if (newExercise) {
            const { exercises } = get();
            set({ exercises: [newExercise, ...exercises] });
            Alert.alert('Success', 'Custom exercise created successfully');
          }
        } catch (error) {
          console.error('Error creating custom exercise:', error);
          Alert.alert('Error', 'Failed to create custom exercise');
        }
      },

      setExerciseFilters: (filters: ExerciseSearchFilters) => {
        set({ exerciseSearchFilters: filters });
        get().loadExercises(filters);
      },

      // Templates
      loadTemplates: async () => {
        set({ templatesLoading: true });
        try {
          const user = await workoutService['getCurrentUser']();
          if (!user) return;
          
          const templates = await workoutService.getTemplates(user.id);
          set({ templates, templatesLoading: false });
        } catch (error) {
          console.error('Error loading templates:', error);
          set({ templatesLoading: false });
        }
      },

      createTemplate: async (template: Partial<WorkoutTemplate>) => {
        try {
          const newTemplate = await workoutService.createTemplate(template);
          if (newTemplate) {
            const { templates } = get();
            set({ templates: [newTemplate, ...templates] });
            Alert.alert('Success', 'Template created successfully');
          }
        } catch (error) {
          console.error('Error creating template:', error);
          Alert.alert('Error', 'Failed to create template');
        }
      },

      startWorkoutFromTemplate: async (templateId: string) => {
        try {
          const workout = await workoutService.createWorkoutFromTemplate(templateId);
          if (workout) {
            set({ 
              currentWorkout: workout,
              workoutTimer: {
                ...defaultTimerState,
                isRunning: true,
                startTime: Date.now()
              }
            });
          }
        } catch (error) {
          console.error('Error starting workout from template:', error);
          Alert.alert('Error', 'Failed to start workout from template');
        }
      },

      saveWorkoutAsTemplate: async (workoutId: string, name: string, description?: string) => {
        try {
          const workout = await workoutService.getWorkoutById(workoutId);
          if (!workout) return;

          const templateExercises = workout.exercises.map(e => ({
            exerciseId: e.exercise.id,
            sets: e.sets.length,
            reps: e.sets[0]?.reps || 10,
            weight: e.sets[0]?.weight,
            restSeconds: e.sets[0]?.restSeconds,
            notes: e.notes
          }));

          const template = await workoutService.createTemplate({
            name,
            description,
            exercises: templateExercises
          });

          if (template) {
            const { templates } = get();
            set({ templates: [template, ...templates] });
            Alert.alert('Success', 'Workout saved as template');
          }
        } catch (error) {
          console.error('Error saving workout as template:', error);
          Alert.alert('Error', 'Failed to save workout as template');
        }
      },

      // History
      loadWorkoutHistory: async (limit: number = 50) => {
        set({ workoutHistoryLoading: true });
        try {
          const user = await workoutService['getCurrentUser']();
          if (!user) return;
          
          const workouts = await workoutService.getUserWorkouts(user.id, limit);
          set({ workoutHistory: workouts, workoutHistoryLoading: false });
        } catch (error) {
          console.error('Error loading workout history:', error);
          set({ workoutHistoryLoading: false });
        }
      },

      loadWorkoutDetails: async (workoutId: string) => {
        try {
          const workout = await workoutService.getWorkoutById(workoutId);
          if (workout) {
            // Store the workout in state instead of returning it
            set((state: WorkoutState) => ({
              workoutHistory: state.workoutHistory.map(w => 
                w.id === workout.id ? workout : w
              )
            }));
          }
        } catch (error) {
          console.error('Error loading workout details:', error);
        }
      },

      deleteWorkout: async (workoutId: string) => {
        try {
          const success = await workoutService.deleteWorkout(workoutId);
          if (success) {
            const { workoutHistory } = get();
            set({
              workoutHistory: workoutHistory.filter(w => w.id !== workoutId)
            });
            Alert.alert('Success', 'Workout deleted');
          }
        } catch (error) {
          console.error('Error deleting workout:', error);
          Alert.alert('Error', 'Failed to delete workout');
        }
      },

      copyWorkout: async (workoutId: string) => {
        try {
          const workout = await workoutService.getWorkoutById(workoutId);
          if (!workout) return;

          const newWorkout = await workoutService.createWorkout({
            name: `${workout.name} (Copy)`,
            startedAt: new Date()
          });

          if (!newWorkout) return;

          // Copy exercises and sets
          for (const exercise of workout.exercises) {
            const newExercise = await workoutService.addExerciseToWorkout(
              newWorkout.id,
              {
                exercise: exercise.exercise,
                notes: exercise.notes
              }
            );

            if (newExercise) {
              for (const set of exercise.sets) {
                await workoutService.addSet(newExercise.id, {
                  weight: set.weight,
                  reps: set.reps,
                  restSeconds: set.restSeconds,
                  completed: false
                });
              }
            }
          }

          const copiedWorkout = await workoutService.getWorkoutById(newWorkout.id);
          if (copiedWorkout) {
            set({
              currentWorkout: copiedWorkout,
              workoutTimer: {
                ...defaultTimerState,
                isRunning: true,
                startTime: Date.now()
              }
            });
            Alert.alert('Success', 'Workout copied and started');
          }
        } catch (error) {
          console.error('Error copying workout:', error);
          Alert.alert('Error', 'Failed to copy workout');
        }
      },

      // Timer
      startRestTimer: (duration: number, exerciseName: string, setNumber: number) => {
        const { workoutSettings } = get();
        
        set({
          restTimer: {
            duration,
            exerciseId: '',
            exerciseName,
            setNumber,
            onComplete: () => {
              if (workoutSettings.soundEnabled) {
                // Play sound
              }
              if (workoutSettings.vibrateEnabled) {
                // Vibrate
              }
              Alert.alert('Rest Complete', `Time to start your next set of ${exerciseName}!`);
              set({ restTimer: null });
            }
          },
          workoutTimer: {
            ...get().workoutTimer,
            restTimerActive: true,
            restTimeRemaining: duration
          }
        });
      },

      pauseRestTimer: () => {
        // Implementation for pausing rest timer
      },

      resumeRestTimer: () => {
        // Implementation for resuming rest timer
      },

      cancelRestTimer: () => {
        set({ 
          restTimer: null,
          workoutTimer: {
            ...get().workoutTimer,
            restTimerActive: false,
            restTimeRemaining: undefined
          }
        });
      },

      updateWorkoutTimer: () => {
        const { workoutTimer } = get();
        if (workoutTimer.isRunning && workoutTimer.startTime) {
          const elapsed = Date.now() - workoutTimer.startTime;
          set({
            workoutTimer: {
              ...workoutTimer,
              currentDuration: workoutTimer.currentDuration + elapsed
            }
          });
        }
      },

      // Stats and Goals
      loadWorkoutStats: async () => {
        try {
          const user = await workoutService['getCurrentUser']();
          if (!user) return;
          
          const stats = await workoutService.getWorkoutStats(user.id);
          set({ workoutStats: stats });
        } catch (error) {
          console.error('Error loading workout stats:', error);
        }
      },

      loadWorkoutGoals: async () => {
        try {
          const user = await workoutService['getCurrentUser']();
          if (!user) return;
          
          const goals = await workoutService.getGoals(user.id);
          set({ workoutGoals: goals });
        } catch (error) {
          console.error('Error loading workout goals:', error);
        }
      },

      createWorkoutGoal: async (goal: Partial<WorkoutGoal>) => {
        try {
          const newGoal = await workoutService.createGoal(goal);
          if (newGoal) {
            const { workoutGoals } = get();
            set({ workoutGoals: [newGoal, ...workoutGoals] });
            Alert.alert('Success', 'Goal created successfully');
          }
        } catch (error) {
          console.error('Error creating goal:', error);
          Alert.alert('Error', 'Failed to create goal');
        }
      },

      updateWorkoutGoal: async (goalId: string, updates: Partial<WorkoutGoal>) => {
        // Implementation for updating goal
      },

      // Settings
      updateWorkoutSettings: async (settings: Partial<WorkoutSettings>) => {
        const newSettings = { ...get().workoutSettings, ...settings };
        set({ workoutSettings: newSettings });
        await AsyncStorage.setItem('workout_settings', JSON.stringify(newSettings));
      },

      // Add missing methods
      loadPersonalRecords: async () => {
        try {
          const userId = get().currentWorkout?.userId || '';
          const records = await workoutService.getPersonalRecords(userId);
          set({ personalRecords: records });
        } catch (error) {
          console.error('Error loading personal records:', error);
        }
      },

      deleteWorkoutGoal: async (goalId: string) => {
        try {
          // TODO: Implement deleteWorkoutGoal in workoutService
          // await workoutService.deleteWorkoutGoal(goalId);
          set({ workoutGoals: get().workoutGoals.filter(g => g.id !== goalId) });
        } catch (error) {
          console.error('Error deleting workout goal:', error);
        }
      },

      syncWorkoutData: async () => {
        // TODO: Implement workout data sync
        console.log('Syncing workout data...');
      },

      clearWorkoutData: () => {
        set({
          workoutHistory: [],
          exercises: [],
          templates: [],
          personalRecords: [],
          workoutGoals: [],
        });
      },

      checkPersonalRecords: async () => {
        const { currentWorkout } = get();
        if (!currentWorkout) return;

        const newRecords: PersonalRecord[] = [];
        
        for (const exercise of currentWorkout.exercises) {
          for (const set of exercise.sets) {
            if (set.completed && set.weight) {
              // Check if this is a personal record
              const existingRecord = get().personalRecords.find(
                r => r.exerciseId === exercise.exercise.id
              );
              
              if (!existingRecord || set.weight > existingRecord.weight) {
                const oneRepMax = set.weight * (1 + (set.reps || 0) / 30);
                newRecords.push({
                  id: `pr-${Date.now()}-${exercise.exercise.id}`,
                  userId: currentWorkout.userId || '',
                  exerciseId: exercise.exercise.id,
                  exerciseName: exercise.exercise.name,
                  weight: set.weight,
                  reps: set.reps || 0,
                  oneRepMax,
                  volume: set.weight * (set.reps || 0),
                  achievedAt: new Date(),
                  workoutId: currentWorkout.id,
                });
              }
            }
          }
        }

        if (newRecords.length > 0) {
          set({ newPersonalRecords: newRecords });
        }
      },

      dismissNewPersonalRecords: () => {
        set({ newPersonalRecords: [] });
      },

      // Helpers
      getPreviousWorkoutData: async (exerciseId: string) => {
        try {
          const { workoutHistory } = get();
          
          for (const workout of workoutHistory) {
            const exercise = workout.exercises.find(e => e.exercise.id === exerciseId);
            if (exercise && exercise.sets.length > 0) {
              return exercise;
            }
          }
          
          return null;
        } catch (error) {
          console.error('Error getting previous workout data:', error);
          return null;
        }
      },

      calculateWorkoutVolume: () => {
        const { currentWorkout } = get();
        if (!currentWorkout) return 0;

        return currentWorkout.exercises.reduce((total, exercise) => {
          const exerciseVolume = exercise.sets.reduce((setTotal, set) => {
            if (set.completed && set.weight && set.reps) {
              return setTotal + (set.weight * set.reps);
            }
            return setTotal;
          }, 0);
          return total + exerciseVolume;
        }, 0);
      },

      calculateWorkoutDuration: () => {
        const { workoutTimer } = get();
        let duration = workoutTimer.currentDuration;
        
        if (workoutTimer.isRunning && workoutTimer.startTime) {
          duration += Date.now() - workoutTimer.startTime;
        }
        
        return Math.floor(duration / 1000); // Return in seconds
      }
    }),
    {
      name: 'workout-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        recentExercises: state.recentExercises,
        workoutSettings: state.workoutSettings,
        favoriteExercises: state.favoriteExercises
      })
    }
  )
);