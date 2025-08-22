import { supabase } from './supabase';
import {
  Exercise,
  Workout,
  WorkoutExercise,
  WorkoutSet,
  WorkoutTemplate,
  PersonalRecord,
  ExerciseSearchFilters,
  WorkoutStats,
  WorkoutGoal,
  ExerciseProgress,
  OneRepMaxFormula,
  WorkoutValidation,
  TemplateExercise
} from '../types/workout';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import uuid from 'react-native-uuid';

// One Rep Max Formulas
const oneRepMaxFormulas: Record<string, OneRepMaxFormula> = {
  epley: {
    name: 'Epley',
    calculate: (weight: number, reps: number) => {
      if (reps === 1) return weight;
      return weight * (1 + reps / 30);
    }
  },
  brzycki: {
    name: 'Brzycki',
    calculate: (weight: number, reps: number) => {
      if (reps === 1) return weight;
      return weight * (36 / (37 - reps));
    }
  },
  lombardi: {
    name: 'Lombardi',
    calculate: (weight: number, reps: number) => {
      return weight * Math.pow(reps, 0.1);
    }
  }
};

class WorkoutService {
  private offlineQueue: any[] = [];
  private isOnline: boolean = true;

  constructor() {
    this.initializeNetworkListener();
    this.loadOfflineQueue();
  }

  private async initializeNetworkListener() {
    NetInfo.addEventListener(state => {
      this.isOnline = state.isConnected ?? false;
      if (this.isOnline) {
        this.syncOfflineData();
      }
    });
  }

  private async loadOfflineQueue() {
    try {
      const queue = await AsyncStorage.getItem('workout_offline_queue');
      if (queue) {
        this.offlineQueue = JSON.parse(queue);
      }
    } catch (error) {
      console.error('Error loading offline queue:', error);
    }
  }

  private async saveOfflineQueue() {
    try {
      await AsyncStorage.setItem('workout_offline_queue', JSON.stringify(this.offlineQueue));
    } catch (error) {
      console.error('Error saving offline queue:', error);
    }
  }

  private async addToOfflineQueue(action: string, entity: string, data: any) {
    const queueItem = {
      id: uuid.v4() as string,
      action,
      entity,
      data,
      timestamp: new Date().toISOString(),
      synced: false
    };
    this.offlineQueue.push(queueItem);
    await this.saveOfflineQueue();
  }

  private async syncOfflineData() {
    if (!this.isOnline || this.offlineQueue.length === 0) return;

    const itemsToSync = [...this.offlineQueue];
    this.offlineQueue = [];

    for (const item of itemsToSync) {
      try {
        switch (item.entity) {
          case 'workout':
            if (item.action === 'create') {
              await this.createWorkout(item.data);
            } else if (item.action === 'update') {
              await this.updateWorkout(item.data.id, item.data);
            }
            break;
          case 'set':
            if (item.action === 'create') {
              await this.addSet(item.data.workoutExerciseId, item.data.set);
            } else if (item.action === 'update') {
              await this.updateSet(item.data.setId, item.data.updates);
            }
            break;
          // Add more entity types as needed
        }
      } catch (error) {
        console.error('Error syncing offline item:', error);
        this.offlineQueue.push(item); // Re-add failed items
      }
    }

    await this.saveOfflineQueue();
  }

  // Exercise CRUD Operations
  async getExercises(filters?: ExerciseSearchFilters): Promise<Exercise[]> {
    try {
      let query = supabase.from('exercises').select('*');

      if (filters) {
        if (filters.query) {
          query = query.ilike('name', `%${filters.query}%`);
        }
        if (filters.category) {
          query = query.eq('category', filters.category);
        }
        if (filters.muscleGroup) {
          query = query.eq('muscle_group', filters.muscleGroup);
        }
        if (filters.equipment) {
          query = query.eq('equipment', filters.equipment);
        }
        if (filters.onlyCustom) {
          query = query.eq('is_custom', true);
        }
      }

      const { data, error } = await query.order('name');

      if (error) throw error;
      return this.mapExercises(data || []);
    } catch (error) {
      console.error('Error fetching exercises:', error);
      // Return cached exercises if offline
      const cached = await AsyncStorage.getItem('cached_exercises');
      return cached ? JSON.parse(cached) : [];
    }
  }

  async getExerciseById(id: string): Promise<Exercise | null> {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data ? this.mapExercise(data) : null;
    } catch (error) {
      console.error('Error fetching exercise:', error);
      return null;
    }
  }

  async createCustomExercise(exercise: Partial<Exercise>): Promise<Exercise | null> {
    try {
      const user = await this.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('exercises')
        .insert({
          name: exercise.name,
          category: exercise.category,
          muscle_group: exercise.muscleGroup,
          equipment: exercise.equipment,
          instructions: exercise.instructions,
          is_custom: true,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return this.mapExercise(data);
    } catch (error) {
      console.error('Error creating custom exercise:', error);
      if (!this.isOnline) {
        await this.addToOfflineQueue('create', 'exercise', exercise);
      }
      return null;
    }
  }

  async updateExercise(id: string, updates: Partial<Exercise>): Promise<Exercise | null> {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .update({
          name: updates.name,
          category: updates.category,
          muscle_group: updates.muscleGroup,
          equipment: updates.equipment,
          instructions: updates.instructions
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return this.mapExercise(data);
    } catch (error) {
      console.error('Error updating exercise:', error);
      return null;
    }
  }

  async deleteExercise(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting exercise:', error);
      return false;
    }
  }

  // Workout CRUD Operations
  async createWorkout(workout: Partial<Workout>): Promise<Workout | null> {
    try {
      const user = await this.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const { data: workoutData, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          user_id: user.id,
          name: workout.name || `Workout ${new Date().toLocaleDateString()}`,
          started_at: workout.startedAt || new Date().toISOString(),
          notes: workout.notes
        })
        .select()
        .single();

      if (workoutError) throw workoutError;

      // Add exercises if provided
      if (workout.exercises && workout.exercises.length > 0) {
        for (const exercise of workout.exercises) {
          await this.addExerciseToWorkout(workoutData.id, exercise);
        }
      }

      return this.getWorkoutById(workoutData.id);
    } catch (error) {
      console.error('Error creating workout:', error);
      if (!this.isOnline) {
        await this.addToOfflineQueue('create', 'workout', workout);
      }
      return null;
    }
  }

  async getWorkoutById(id: string): Promise<Workout | null> {
    try {
      const { data: workoutData, error: workoutError } = await supabase
        .from('workouts')
        .select('*')
        .eq('id', id)
        .single();

      if (workoutError) throw workoutError;

      // Get workout exercises with sets
      const { data: exercisesData, error: exercisesError } = await supabase
        .from('workout_exercises')
        .select(`
          *,
          exercises (*),
          sets (*)
        `)
        .eq('workout_id', id)
        .order('order_index');

      if (exercisesError) throw exercisesError;

      return this.mapWorkout(workoutData, exercisesData || []);
    } catch (error) {
      console.error('Error fetching workout:', error);
      return null;
    }
  }

  async getUserWorkouts(userId: string, limit: number = 50): Promise<Workout[]> {
    try {
      const { data, error } = await supabase
        .from('workouts')
        .select(`
          *,
          workout_exercises (
            *,
            exercises (*),
            sets (*)
          )
        `)
        .eq('user_id', userId)
        .order('started_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map(workout => 
        this.mapWorkout(workout, workout.workout_exercises || [])
      );
    } catch (error) {
      console.error('Error fetching user workouts:', error);
      // Return cached workouts if offline
      const cached = await AsyncStorage.getItem('cached_workouts');
      return cached ? JSON.parse(cached) : [];
    }
  }

  async updateWorkout(id: string, updates: Partial<Workout>): Promise<Workout | null> {
    try {
      const updateData: any = {
        name: updates.name,
        notes: updates.notes,
        completed_at: updates.completedAt,
        total_volume: updates.totalVolume,
        total_sets: updates.totalSets,
        duration_seconds: updates.durationSeconds
      };

      const { error } = await supabase
        .from('workouts')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      return this.getWorkoutById(id);
    } catch (error) {
      console.error('Error updating workout:', error);
      if (!this.isOnline) {
        await this.addToOfflineQueue('update', 'workout', { id, ...updates });
      }
      return null;
    }
  }

  async completeWorkout(id: string): Promise<Workout | null> {
    try {
      const workout = await this.getWorkoutById(id);
      if (!workout) throw new Error('Workout not found');

      // Calculate total volume and sets
      let totalVolume = 0;
      let totalSets = 0;

      for (const exercise of workout.exercises) {
        for (const set of exercise.sets) {
          if (set.completed && set.weight && set.reps) {
            totalVolume += set.weight * set.reps;
            totalSets++;
          }
        }
      }

      // Calculate duration
      const duration = workout.startedAt 
        ? Math.floor((Date.now() - new Date(workout.startedAt).getTime()) / 1000)
        : 0;

      // Update workout
      const updated = await this.updateWorkout(id, {
        completedAt: new Date(),
        totalVolume,
        totalSets,
        durationSeconds: duration,
        status: 'completed' as any
      });

      // Check for personal records
      if (updated) {
        await this.checkAndUpdatePersonalRecords(updated);
      }

      return updated;
    } catch (error) {
      console.error('Error completing workout:', error);
      return null;
    }
  }

  async deleteWorkout(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting workout:', error);
      return false;
    }
  }

  // Exercise within workout operations
  async addExerciseToWorkout(
    workoutId: string, 
    exercise: Partial<WorkoutExercise>
  ): Promise<WorkoutExercise | null> {
    try {
      // Get current max order index
      const { data: existingExercises } = await supabase
        .from('workout_exercises')
        .select('order_index')
        .eq('workout_id', workoutId)
        .order('order_index', { ascending: false })
        .limit(1);

      const nextIndex = existingExercises && existingExercises.length > 0 
        ? (existingExercises[0].order_index || 0) + 1 
        : 0;

      const { data, error } = await supabase
        .from('workout_exercises')
        .insert({
          workout_id: workoutId,
          exercise_id: exercise.exercise?.id,
          order_index: exercise.orderIndex ?? nextIndex,
          notes: exercise.notes,
          is_superset: exercise.isSuperset,
          superset_group: exercise.supersetGroup
        })
        .select()
        .single();

      if (error) throw error;

      // Add default sets if specified
      if (exercise.sets && exercise.sets.length > 0) {
        for (const set of exercise.sets) {
          await this.addSet(data.id, set);
        }
      }

      return this.getWorkoutExercise(data.id);
    } catch (error) {
      console.error('Error adding exercise to workout:', error);
      return null;
    }
  }

  async removeExerciseFromWorkout(workoutExerciseId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('workout_exercises')
        .delete()
        .eq('id', workoutExerciseId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error removing exercise from workout:', error);
      return false;
    }
  }

  async reorderExercises(workoutId: string, exerciseIds: string[]): Promise<boolean> {
    try {
      const updates = exerciseIds.map((id, index) => ({
        id,
        order_index: index
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('workout_exercises')
          .update({ order_index: update.order_index })
          .eq('id', update.id)
          .eq('workout_id', workoutId);

        if (error) throw error;
      }

      return true;
    } catch (error) {
      console.error('Error reordering exercises:', error);
      return false;
    }
  }

  // Set operations
  async addSet(workoutExerciseId: string, set: Partial<WorkoutSet>): Promise<WorkoutSet | null> {
    try {
      // Get current max set number
      const { data: existingSets } = await supabase
        .from('sets')
        .select('set_number')
        .eq('workout_exercise_id', workoutExerciseId)
        .order('set_number', { ascending: false })
        .limit(1);

      const nextSetNumber = existingSets && existingSets.length > 0 
        ? (existingSets[0].set_number || 0) + 1 
        : 1;

      const { data, error } = await supabase
        .from('sets')
        .insert({
          workout_exercise_id: workoutExerciseId,
          set_number: set.setNumber ?? nextSetNumber,
          weight: set.weight,
          reps: set.reps,
          distance_meters: set.distanceMeters,
          duration_seconds: set.durationSeconds,
          rest_seconds: set.restSeconds,
          rpe: set.rpe,
          completed: set.completed ?? false
        })
        .select()
        .single();

      if (error) throw error;
      return this.mapSet(data);
    } catch (error) {
      console.error('Error adding set:', error);
      if (!this.isOnline) {
        await this.addToOfflineQueue('create', 'set', { workoutExerciseId, set });
      }
      return null;
    }
  }

  async updateSet(setId: string, updates: Partial<WorkoutSet>): Promise<WorkoutSet | null> {
    try {
      const { data, error } = await supabase
        .from('sets')
        .update({
          weight: updates.weight,
          reps: updates.reps,
          distance_meters: updates.distanceMeters,
          duration_seconds: updates.durationSeconds,
          rest_seconds: updates.restSeconds,
          rpe: updates.rpe,
          completed: updates.completed
        })
        .eq('id', setId)
        .select()
        .single();

      if (error) throw error;
      return this.mapSet(data);
    } catch (error) {
      console.error('Error updating set:', error);
      if (!this.isOnline) {
        await this.addToOfflineQueue('update', 'set', { setId, updates });
      }
      return null;
    }
  }

  async deleteSet(setId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('sets')
        .delete()
        .eq('id', setId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting set:', error);
      return false;
    }
  }

  // Template operations
  async getTemplates(userId?: string, isPublic?: boolean): Promise<WorkoutTemplate[]> {
    try {
      let query = supabase.from('workout_templates').select('*');

      if (userId) {
        query = query.eq('user_id', userId);
      }
      if (isPublic !== undefined) {
        query = query.eq('is_public', isPublic);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(this.mapTemplate);
    } catch (error) {
      console.error('Error fetching templates:', error);
      return [];
    }
  }

  async createTemplate(template: Partial<WorkoutTemplate>): Promise<WorkoutTemplate | null> {
    try {
      const user = await this.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('workout_templates')
        .insert({
          user_id: user.id,
          name: template.name,
          description: template.description,
          exercises: template.exercises,
          is_public: template.isPublic ?? false,
          category: template.category
        })
        .select()
        .single();

      if (error) throw error;
      return this.mapTemplate(data);
    } catch (error) {
      console.error('Error creating template:', error);
      return null;
    }
  }

  async createWorkoutFromTemplate(templateId: string): Promise<Workout | null> {
    try {
      const { data: template, error } = await supabase
        .from('workout_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (error || !template) throw error || new Error('Template not found');

      const templateData = this.mapTemplate(template);
      
      // Create workout
      const workout = await this.createWorkout({
        name: templateData.name,
        startedAt: new Date()
      });

      if (!workout) throw new Error('Failed to create workout');

      // Add exercises from template
      for (const templateExercise of templateData.exercises) {
        const exercise = await this.getExerciseById(templateExercise.exerciseId);
        if (!exercise) continue;

        const workoutExercise = await this.addExerciseToWorkout(workout.id, {
          exercise,
          notes: templateExercise.notes,
          isSuperset: templateExercise.isSuperset,
          supersetGroup: templateExercise.supersetGroup
        });

        if (!workoutExercise) continue;

        // Add sets based on template
        const setCount = templateExercise.sets;
        for (let i = 0; i < setCount; i++) {
          await this.addSet(workoutExercise.id, {
            setNumber: i + 1,
            weight: templateExercise.weight,
            reps: typeof templateExercise.reps === 'number' 
              ? templateExercise.reps 
              : parseInt(templateExercise.reps.split('-')[0]),
            restSeconds: templateExercise.restSeconds,
            completed: false
          });
        }
      }

      return this.getWorkoutById(workout.id);
    } catch (error) {
      console.error('Error creating workout from template:', error);
      return null;
    }
  }

  // Personal Records
  async getPersonalRecords(userId: string): Promise<PersonalRecord[]> {
    try {
      const { data, error } = await supabase
        .from('personal_records')
        .select(`
          *,
          exercises (name)
        `)
        .eq('user_id', userId)
        .order('achieved_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(pr => ({
        ...this.mapPersonalRecord(pr),
        exerciseName: pr.exercises?.name
      }));
    } catch (error) {
      console.error('Error fetching personal records:', error);
      return [];
    }
  }

  async checkAndUpdatePersonalRecords(workout: Workout): Promise<PersonalRecord[]> {
    try {
      const user = await this.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const newRecords: PersonalRecord[] = [];

      for (const exercise of workout.exercises) {
        let maxWeight = 0;
        let maxReps = 0;
        let maxOneRepMax = 0;

        for (const set of exercise.sets) {
          if (set.completed && set.weight && set.reps) {
            const oneRepMax = this.calculateOneRepMax(set.weight, set.reps);
            
            if (oneRepMax > maxOneRepMax) {
              maxOneRepMax = oneRepMax;
              maxWeight = set.weight;
              maxReps = set.reps;
            }
          }
        }

        if (maxOneRepMax > 0) {
          // Check existing PR
          const { data: existingPR } = await supabase
            .from('personal_records')
            .select('*')
            .eq('user_id', user.id)
            .eq('exercise_id', exercise.exercise.id)
            .single();

          if (!existingPR || maxOneRepMax > existingPR.one_rep_max) {
            // New PR!
            const { data: newPR, error } = await supabase
              .from('personal_records')
              .upsert({
                user_id: user.id,
                exercise_id: exercise.exercise.id,
                weight: maxWeight,
                reps: maxReps,
                one_rep_max: maxOneRepMax,
                volume: maxWeight * maxReps,
                achieved_at: new Date().toISOString(),
                workout_id: workout.id
              })
              .select()
              .single();

            if (!error && newPR) {
              newRecords.push({
                ...this.mapPersonalRecord(newPR),
                exerciseName: exercise.exercise.name,
                previousRecord: existingPR ? {
                  weight: existingPR.weight,
                  reps: existingPR.reps,
                  oneRepMax: existingPR.one_rep_max,
                  achievedAt: new Date(existingPR.achieved_at)
                } : undefined
              });
            }
          }
        }
      }

      return newRecords;
    } catch (error) {
      console.error('Error checking personal records:', error);
      return [];
    }
  }

  // Analytics and Statistics
  async getWorkoutStats(userId: string): Promise<WorkoutStats> {
    try {
      const workouts = await this.getUserWorkouts(userId, 100);
      const personalRecords = await this.getPersonalRecords(userId);

      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      let totalVolume = 0;
      let totalSets = 0;
      let totalReps = 0;
      let totalDuration = 0;
      const exerciseCount: Record<string, number> = {};
      const muscleGroupCount: Record<string, number> = {};

      for (const workout of workouts) {
        if (workout.totalVolume) totalVolume += workout.totalVolume;
        if (workout.totalSets) totalSets += workout.totalSets;
        if (workout.durationSeconds) totalDuration += workout.durationSeconds;

        for (const exercise of workout.exercises) {
          exerciseCount[exercise.exercise.id] = (exerciseCount[exercise.exercise.id] || 0) + 1;
          muscleGroupCount[exercise.exercise.muscleGroup] = 
            (muscleGroupCount[exercise.exercise.muscleGroup] || 0) + 1;

          for (const set of exercise.sets) {
            if (set.completed && set.reps) {
              totalReps += set.reps;
            }
          }
        }
      }

      const workoutsThisWeek = workouts.filter(w => 
        new Date(w.startedAt) >= weekAgo
      ).length;

      const workoutsThisMonth = workouts.filter(w => 
        new Date(w.startedAt) >= monthAgo
      ).length;

      // Calculate streaks
      const { currentStreak, longestStreak } = this.calculateStreaks(workouts);

      // Get favorite exercises
      const favoriteExerciseIds = Object.entries(exerciseCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([id]) => id);

      const favoriteExercises = await Promise.all(
        favoriteExerciseIds.map(async id => {
          const exercise = await this.getExerciseById(id);
          return {
            exercise: exercise!,
            count: exerciseCount[id]
          };
        })
      );

      return {
        totalWorkouts: workouts.length,
        totalVolume,
        totalSets,
        totalReps,
        totalDuration,
        averageWorkoutDuration: workouts.length > 0 ? totalDuration / workouts.length : 0,
        workoutsThisWeek,
        workoutsThisMonth,
        currentStreak,
        longestStreak,
        favoriteExercises: favoriteExercises.filter(f => f.exercise),
        muscleGroupDistribution: muscleGroupCount as any,
        personalRecords
      };
    } catch (error) {
      console.error('Error calculating workout stats:', error);
      return {
        totalWorkouts: 0,
        totalVolume: 0,
        totalSets: 0,
        totalReps: 0,
        totalDuration: 0,
        averageWorkoutDuration: 0,
        workoutsThisWeek: 0,
        workoutsThisMonth: 0,
        currentStreak: 0,
        longestStreak: 0,
        favoriteExercises: [],
        muscleGroupDistribution: {} as any,
        personalRecords: []
      };
    }
  }

  async getExerciseProgress(
    userId: string, 
    exerciseId: string, 
    days: number = 90
  ): Promise<ExerciseProgress | null> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: workouts, error } = await supabase
        .from('workouts')
        .select(`
          started_at,
          workout_exercises!inner (
            exercise_id,
            sets (
              weight,
              reps,
              completed
            )
          )
        `)
        .eq('user_id', userId)
        .eq('workout_exercises.exercise_id', exerciseId)
        .gte('started_at', startDate.toISOString())
        .order('started_at');

      if (error) throw error;

      const exercise = await this.getExerciseById(exerciseId);
      if (!exercise) throw new Error('Exercise not found');

      const progressData = (workouts || []).map(workout => {
        let maxOneRepMax = 0;
        let bestSet = { weight: 0, reps: 0 };
        let totalVolume = 0;

        for (const we of workout.workout_exercises) {
          for (const set of we.sets) {
            if (set.completed && set.weight && set.reps) {
              const oneRepMax = this.calculateOneRepMax(set.weight, set.reps);
              if (oneRepMax > maxOneRepMax) {
                maxOneRepMax = oneRepMax;
                bestSet = { weight: set.weight, reps: set.reps };
              }
              totalVolume += set.weight * set.reps;
            }
          }
        }

        return {
          date: new Date(workout.started_at),
          weight: bestSet.weight,
          reps: bestSet.reps,
          oneRepMax: maxOneRepMax,
          volume: totalVolume
        };
      }).filter(d => d.oneRepMax > 0);

      return {
        exerciseId,
        exerciseName: exercise.name,
        data: progressData
      };
    } catch (error) {
      console.error('Error fetching exercise progress:', error);
      return null;
    }
  }

  // Helper methods
  calculateOneRepMax(weight: number, reps: number, formula: string = 'epley'): number {
    const calc = oneRepMaxFormulas[formula] || oneRepMaxFormulas.epley;
    return Math.round(calc.calculate(weight, reps));
  }

  calculateVolume(sets: WorkoutSet[]): number {
    return sets.reduce((total, set) => {
      if (set.completed && set.weight && set.reps) {
        return total + (set.weight * set.reps);
      }
      return total;
    }, 0);
  }

  validateWorkout(workout: Workout): WorkoutValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!workout.name || workout.name.trim().length === 0) {
      errors.push('Workout must have a name');
    }

    if (workout.exercises.length === 0) {
      errors.push('Workout must have at least one exercise');
    }

    let hasCompletedSets = false;
    for (const exercise of workout.exercises) {
      if (exercise.sets.length === 0) {
        warnings.push(`${exercise.exercise.name} has no sets`);
      }
      
      for (const set of exercise.sets) {
        if (set.completed) {
          hasCompletedSets = true;
          if (!set.weight && !set.reps && !set.durationSeconds && !set.distanceMeters) {
            warnings.push(`Completed set in ${exercise.exercise.name} has no data`);
          }
        }
      }
    }

    if (!hasCompletedSets) {
      errors.push('Workout must have at least one completed set');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private calculateStreaks(workouts: Workout[]): { currentStreak: number; longestStreak: number } {
    if (workouts.length === 0) return { currentStreak: 0, longestStreak: 0 };

    const sortedWorkouts = [...workouts].sort((a, b) => 
      new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;
    let lastDate = new Date(sortedWorkouts[0].startedAt);
    lastDate.setHours(0, 0, 0, 0);

    // Check if workout was today or yesterday for current streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (lastDate.getTime() === today.getTime() || lastDate.getTime() === yesterday.getTime()) {
      currentStreak = 1;
    }

    for (let i = 1; i < sortedWorkouts.length; i++) {
      const currentDate = new Date(sortedWorkouts[i].startedAt);
      currentDate.setHours(0, 0, 0, 0);

      const dayDiff = Math.floor((lastDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));

      if (dayDiff === 1) {
        tempStreak++;
        if (currentStreak > 0 && i < 10) { // Only count recent workouts for current streak
          currentStreak = tempStreak;
        }
      } else if (dayDiff > 1) {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
        if (i < 10) {
          currentStreak = 0; // Break in recent workouts ends current streak
        }
      }

      lastDate = currentDate;
    }

    longestStreak = Math.max(longestStreak, tempStreak);
    return { currentStreak, longestStreak };
  }

  // Mapping functions
  private mapExercise(data: any): Exercise {
    return {
      id: data.id,
      name: data.name,
      category: data.category,
      muscleGroup: data.muscle_group,
      equipment: data.equipment,
      instructions: data.instructions,
      imageUrl: data.image_url,
      videoUrl: data.video_url,
      isCustom: data.is_custom,
      createdBy: data.created_by,
      createdAt: data.created_at ? new Date(data.created_at) : undefined,
      updatedAt: data.updated_at ? new Date(data.updated_at) : undefined
    };
  }

  private mapExercises(data: any[]): Exercise[] {
    return data.map(this.mapExercise);
  }

  private mapSet(data: any): WorkoutSet {
    return {
      id: data.id,
      setNumber: data.set_number,
      weight: data.weight,
      reps: data.reps,
      distanceMeters: data.distance_meters,
      durationSeconds: data.duration_seconds,
      restSeconds: data.rest_seconds,
      rpe: data.rpe,
      completed: data.completed,
      createdAt: data.created_at ? new Date(data.created_at) : undefined
    };
  }

  private async getWorkoutExercise(id: string): Promise<WorkoutExercise | null> {
    try {
      const { data, error } = await supabase
        .from('workout_exercises')
        .select(`
          *,
          exercises (*),
          sets (*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      
      return {
        id: data.id,
        workoutId: data.workout_id,
        exercise: this.mapExercise(data.exercises),
        sets: (data.sets || []).map(this.mapSet),
        orderIndex: data.order_index,
        notes: data.notes,
        isSuperset: data.is_superset,
        supersetGroup: data.superset_group
      };
    } catch (error) {
      console.error('Error fetching workout exercise:', error);
      return null;
    }
  }

  private mapWorkout(workoutData: any, exercisesData: any[]): Workout {
    const exercises: WorkoutExercise[] = exercisesData.map(we => ({
      id: we.id,
      workoutId: we.workout_id,
      exercise: this.mapExercise(we.exercises),
      sets: (we.sets || []).map(this.mapSet).sort((a: any, b: any) => a.setNumber - b.setNumber),
      orderIndex: we.order_index,
      notes: we.notes,
      isSuperset: we.is_superset,
      supersetGroup: we.superset_group
    }));

    return {
      id: workoutData.id,
      userId: workoutData.user_id,
      name: workoutData.name,
      status: workoutData.completed_at ? 'completed' : 'in_progress',
      startedAt: new Date(workoutData.started_at),
      completedAt: workoutData.completed_at ? new Date(workoutData.completed_at) : undefined,
      exercises: exercises.sort((a, b) => a.orderIndex - b.orderIndex),
      totalVolume: workoutData.total_volume,
      totalSets: workoutData.total_sets,
      durationSeconds: workoutData.duration_seconds,
      notes: workoutData.notes,
      createdAt: workoutData.created_at ? new Date(workoutData.created_at) : undefined,
      updatedAt: workoutData.updated_at ? new Date(workoutData.updated_at) : undefined
    };
  }

  private mapTemplate(data: any): WorkoutTemplate {
    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      description: data.description,
      exercises: data.exercises || [],
      isPublic: data.is_public,
      category: data.category,
      createdAt: data.created_at ? new Date(data.created_at) : undefined,
      updatedAt: data.updated_at ? new Date(data.updated_at) : undefined
    };
  }

  private mapPersonalRecord(data: any): PersonalRecord {
    return {
      id: data.id,
      userId: data.user_id,
      exerciseId: data.exercise_id,
      weight: data.weight,
      reps: data.reps,
      oneRepMax: data.one_rep_max,
      volume: data.volume,
      achievedAt: new Date(data.achieved_at),
      workoutId: data.workout_id
    };
  }

  private async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  // Favorites
  async toggleFavoriteExercise(exerciseId: string): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      // Check if already favorited
      const { data: existing } = await supabase
        .from('user_exercise_favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('exercise_id', exerciseId)
        .single();

      if (existing) {
        // Remove favorite
        const { error } = await supabase
          .from('user_exercise_favorites')
          .delete()
          .eq('id', existing.id);
        
        if (error) throw error;
        return false;
      } else {
        // Add favorite
        const { error } = await supabase
          .from('user_exercise_favorites')
          .insert({
            user_id: user.id,
            exercise_id: exerciseId
          });
        
        if (error) throw error;
        return true;
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return false;
    }
  }

  async getFavoriteExercises(): Promise<Exercise[]> {
    try {
      const user = await this.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_exercise_favorites')
        .select(`
          exercise_id,
          exercises (*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      return (data || []).map(f => this.mapExercise(f.exercises));
    } catch (error) {
      console.error('Error fetching favorite exercises:', error);
      return [];
    }
  }

  // Goals
  async createGoal(goal: Partial<WorkoutGoal>): Promise<WorkoutGoal | null> {
    try {
      const user = await this.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('workout_goals')
        .insert({
          user_id: user.id,
          exercise_id: goal.exerciseId,
          goal_type: goal.goalType,
          target_value: goal.targetValue,
          current_value: goal.currentValue || 0,
          deadline: goal.deadline,
          notes: goal.notes
        })
        .select()
        .single();

      if (error) throw error;
      return this.mapGoal(data);
    } catch (error) {
      console.error('Error creating goal:', error);
      return null;
    }
  }

  async getGoals(userId: string): Promise<WorkoutGoal[]> {
    try {
      const { data, error } = await supabase
        .from('workout_goals')
        .select(`
          *,
          exercises (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(g => ({
        ...this.mapGoal(g),
        exercise: g.exercises ? this.mapExercise(g.exercises) : undefined
      }));
    } catch (error) {
      console.error('Error fetching goals:', error);
      return [];
    }
  }

  private mapGoal(data: any): WorkoutGoal {
    return {
      id: data.id,
      userId: data.user_id,
      exerciseId: data.exercise_id,
      goalType: data.goal_type,
      targetValue: data.target_value,
      currentValue: data.current_value,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
      achieved: data.achieved,
      achievedAt: data.achieved_at ? new Date(data.achieved_at) : undefined,
      notes: data.notes,
      createdAt: data.created_at ? new Date(data.created_at) : undefined,
      updatedAt: data.updated_at ? new Date(data.updated_at) : undefined
    };
  }
}

export default new WorkoutService();