/**
 * Typed Supabase client with real-time subscriptions and offline support
 */

import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { MMKV } from 'react-native-mmkv';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Database, Tables, Insertable, Updatable, RealtimePostgresChangesPayload } from '../types/database';
import { 
  User, Workout, Exercise, NutritionEntry, Goal, Challenge, 
  Friend, Achievement, UserAchievement, Notification 
} from '../types/models';

// Initialize MMKV for auth storage
const authStorage = new MMKV({
  id: 'supabase-auth',
  encryptionKey: 'catalyft-supabase-auth-key', // In production, use a secure key
});

// Supabase configuration
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

// Custom storage adapter for Supabase Auth
const customAuthStorage = {
  getItem: async (key: string) => {
    // Try MMKV first for better performance
    const mmkvValue = authStorage.getString(key);
    if (mmkvValue) return mmkvValue;
    
    // Fallback to AsyncStorage for migration
    const asyncValue = await AsyncStorage.getItem(key);
    if (asyncValue) {
      // Migrate to MMKV
      authStorage.set(key, asyncValue);
      await AsyncStorage.removeItem(key);
    }
    return asyncValue;
  },
  setItem: async (key: string, value: string) => {
    authStorage.set(key, value);
  },
  removeItem: async (key: string) => {
    authStorage.delete(key);
  },
};

// Create typed Supabase client
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: customAuthStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Type-safe database operations
export class SupabaseService {
  public client: SupabaseClient<Database>;
  private realtimeChannels: Map<string, RealtimeChannel> = new Map();

  constructor() {
    this.client = supabase;
  }

  // Authentication methods
  async signUp(email: string, password: string, metadata?: any) {
    const { data, error } = await this.client.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    if (error) throw error;
    return data;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await this.client.auth.signOut();
    if (error) throw error;
  }

  async getCurrentUser() {
    const { data: { user }, error } = await this.client.auth.getUser();
    if (error) throw error;
    return user;
  }

  async updatePassword(newPassword: string) {
    const { error } = await this.client.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
  }

  async resetPassword(email: string) {
    const { error } = await this.client.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }

  // User operations
  async getUser(userId: string): Promise<User | null> {
    const { data, error } = await this.client
      .from('users')
      .select('*, user_stats(*)')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return this.transformUser(data);
  }

  async updateUser(userId: string, updates: Updatable<'users'>): Promise<User> {
    const { data, error } = await this.client
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select('*, user_stats(*)')
      .single();
    
    if (error) throw error;
    return this.transformUser(data);
  }

  async getUserStats(userId: string) {
    const { data, error } = await this.client
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    return data;
  }

  // Workout operations
  async getWorkouts(userId: string, filters?: {
    status?: string;
    type?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<Workout[]> {
    let query = this.client
      .from('workouts')
      .select('*')
      .eq('user_id', userId)
      .order('scheduled_date', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.type) {
      query = query.eq('type', filters.type);
    }
    if (filters?.startDate) {
      query = query.gte('scheduled_date', filters.startDate.toISOString());
    }
    if (filters?.endDate) {
      query = query.lte('scheduled_date', filters.endDate.toISOString());
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data.map(this.transformWorkout);
  }

  async getWorkout(workoutId: string): Promise<Workout | null> {
    const { data, error } = await this.client
      .from('workouts')
      .select('*')
      .eq('id', workoutId)
      .single();
    
    if (error) throw error;
    return this.transformWorkout(data);
  }

  async createWorkout(workout: Insertable<'workouts'>): Promise<Workout> {
    const { data, error } = await this.client
      .from('workouts')
      .insert(workout)
      .select()
      .single();
    
    if (error) throw error;
    return this.transformWorkout(data);
  }

  async updateWorkout(workoutId: string, updates: Updatable<'workouts'>): Promise<Workout> {
    const { data, error } = await this.client
      .from('workouts')
      .update(updates)
      .eq('id', workoutId)
      .select()
      .single();
    
    if (error) throw error;
    return this.transformWorkout(data);
  }

  async deleteWorkout(workoutId: string): Promise<void> {
    const { error } = await this.client
      .from('workouts')
      .delete()
      .eq('id', workoutId);
    
    if (error) throw error;
  }

  // Exercise operations
  async getExercises(filters?: {
    category?: string;
    muscleGroups?: string[];
    equipment?: string[];
    difficulty?: string;
    search?: string;
  }): Promise<Exercise[]> {
    let query = this.client
      .from('exercises')
      .select('*')
      .order('name');

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.muscleGroups && filters.muscleGroups.length > 0) {
      query = query.contains('muscle_groups', filters.muscleGroups);
    }
    if (filters?.equipment && filters.equipment.length > 0) {
      query = query.contains('equipment', filters.equipment);
    }
    if (filters?.difficulty) {
      query = query.eq('difficulty', filters.difficulty);
    }
    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data.map(this.transformExercise);
  }

  async getExercise(exerciseId: string): Promise<Exercise | null> {
    const { data, error } = await this.client
      .from('exercises')
      .select('*')
      .eq('id', exerciseId)
      .single();
    
    if (error) throw error;
    return this.transformExercise(data);
  }

  async createExercise(exercise: Insertable<'exercises'>): Promise<Exercise> {
    const { data, error } = await this.client
      .from('exercises')
      .insert(exercise)
      .select()
      .single();
    
    if (error) throw error;
    return this.transformExercise(data);
  }

  // Nutrition operations
  async getNutritionEntries(userId: string, startDate: Date, endDate: Date): Promise<NutritionEntry[]> {
    const { data, error } = await this.client
      .from('nutrition_entries')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate.toISOString())
      .lte('date', endDate.toISOString())
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data.map(this.transformNutritionEntry);
  }

  async getNutritionEntry(entryId: string): Promise<NutritionEntry | null> {
    const { data, error } = await this.client
      .from('nutrition_entries')
      .select('*')
      .eq('id', entryId)
      .single();
    
    if (error) throw error;
    return this.transformNutritionEntry(data);
  }

  async createNutritionEntry(entry: Insertable<'nutrition_entries'>): Promise<NutritionEntry> {
    const { data, error } = await this.client
      .from('nutrition_entries')
      .insert(entry)
      .select()
      .single();
    
    if (error) throw error;
    return this.transformNutritionEntry(data);
  }

  async updateNutritionEntry(entryId: string, updates: Updatable<'nutrition_entries'>): Promise<NutritionEntry> {
    const { data, error } = await this.client
      .from('nutrition_entries')
      .update(updates)
      .eq('id', entryId)
      .select()
      .single();
    
    if (error) throw error;
    return this.transformNutritionEntry(data);
  }

  // Goal operations
  async getGoals(userId: string, status?: string): Promise<Goal[]> {
    let query = this.client
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('priority', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data.map(this.transformGoal);
  }

  async createGoal(goal: Insertable<'goals'>): Promise<Goal> {
    const { data, error } = await this.client
      .from('goals')
      .insert(goal)
      .select()
      .single();
    
    if (error) throw error;
    return this.transformGoal(data);
  }

  async updateGoal(goalId: string, updates: Updatable<'goals'>): Promise<Goal> {
    const { data, error } = await this.client
      .from('goals')
      .update(updates)
      .eq('id', goalId)
      .select()
      .single();
    
    if (error) throw error;
    return this.transformGoal(data);
  }

  // Challenge operations
  async getChallenges(filters?: {
    status?: string;
    isPublic?: boolean;
    userId?: string;
  }): Promise<Challenge[]> {
    let query = this.client
      .from('challenges')
      .select('*, challenge_participants(*)');

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.isPublic !== undefined) {
      query = query.eq('is_public', filters.isPublic);
    }
    if (filters?.userId) {
      query = query.eq('creator_id', filters.userId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data.map(this.transformChallenge);
  }

  async joinChallenge(challengeId: string, userId: string): Promise<void> {
    const { error } = await this.client
      .from('challenge_participants')
      .insert({
        challenge_id: challengeId,
        user_id: userId,
      });
    
    if (error) throw error;
  }

  // Friend operations
  async getFriends(userId: string): Promise<Friend[]> {
    const { data, error } = await this.client
      .from('friends')
      .select('*, friend:friend_id(*)') 
      .eq('user_id', userId)
      .eq('status', 'accepted');
    
    if (error) throw error;
    return data.map(this.transformFriend);
  }

  async sendFriendRequest(userId: string, friendId: string): Promise<void> {
    const { error } = await this.client
      .from('friends')
      .insert({
        user_id: userId,
        friend_id: friendId,
        status: 'pending',
      });
    
    if (error) throw error;
  }

  async acceptFriendRequest(requestId: string): Promise<void> {
    const { error } = await this.client
      .from('friends')
      .update({ status: 'accepted' })
      .eq('id', requestId);
    
    if (error) throw error;
  }

  // Achievement operations
  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    const { data, error } = await this.client
      .from('user_achievements')
      .select('*, achievement:achievement_id(*)')
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false });
    
    if (error) throw error;
    return data.map(this.transformUserAchievement);
  }

  // Notification operations
  async getNotifications(userId: string, unreadOnly: boolean = false): Promise<Notification[]> {
    let query = this.client
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data.map(this.transformNotification);
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    const { error } = await this.client
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
    
    if (error) throw error;
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    const { error } = await this.client
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    
    if (error) throw error;
  }

  // Real-time subscriptions
  subscribeToWorkouts(
    userId: string,
    callback: (payload: RealtimePostgresChangesPayload<Tables<'workouts'>>) => void
  ): RealtimeChannel {
    const channel = this.client
      .channel(`workouts:${userId}`)
      .on(
        ('postgres_changes' as any),
        {
          event: '*',
          schema: 'public',
          table: 'workouts',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();

    this.realtimeChannels.set(`workouts:${userId}`, channel);
    return channel;
  }

  subscribeToNutrition(
    userId: string,
    callback: (payload: RealtimePostgresChangesPayload<Tables<'nutrition_entries'>>) => void
  ): RealtimeChannel {
    const channel = this.client
      .channel(`nutrition:${userId}`)
      .on(
        ('postgres_changes' as any),
        {
          event: '*',
          schema: 'public',
          table: 'nutrition_entries',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();

    this.realtimeChannels.set(`nutrition:${userId}`, channel);
    return channel;
  }

  subscribeToNotifications(
    userId: string,
    callback: (payload: RealtimePostgresChangesPayload<Tables<'notifications'>>) => void
  ): RealtimeChannel {
    const channel = this.client
      .channel(`notifications:${userId}`)
      .on(
        ('postgres_changes' as any),
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();

    this.realtimeChannels.set(`notifications:${userId}`, channel);
    return channel;
  }

  subscribeToChallenge(
    challengeId: string,
    callback: (payload: RealtimePostgresChangesPayload<Tables<'challenge_participants'>>) => void
  ): RealtimeChannel {
    const channel = this.client
      .channel(`challenge:${challengeId}`)
      .on(
        ('postgres_changes' as any),
        {
          event: '*',
          schema: 'public',
          table: 'challenge_participants',
          filter: `challenge_id=eq.${challengeId}`,
        },
        callback
      )
      .subscribe();

    this.realtimeChannels.set(`challenge:${challengeId}`, channel);
    return channel;
  }

  unsubscribe(channelName: string) {
    const channel = this.realtimeChannels.get(channelName);
    if (channel) {
      channel.unsubscribe();
      this.realtimeChannels.delete(channelName);
    }
  }

  unsubscribeAll() {
    this.realtimeChannels.forEach(channel => channel.unsubscribe());
    this.realtimeChannels.clear();
  }

  // Data transformation methods
  private transformUser(data: any): User {
    return {
      id: data.id,
      email: data.email,
      username: data.username,
      fullName: data.full_name,
      profilePicture: data.profile_picture,
      dateOfBirth: data.date_of_birth ? new Date(data.date_of_birth) : undefined,
      gender: data.gender,
      height: data.height,
      weight: data.weight,
      activityLevel: data.activity_level,
      fitnessGoals: data.fitness_goals,
      preferences: data.preferences,
      stats: data.user_stats?.[0],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private transformWorkout(data: any): Workout {
    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      description: data.description,
      type: data.type,
      duration: data.duration,
      scheduledDate: data.scheduled_date ? new Date(data.scheduled_date) : undefined,
      completedDate: data.completed_date ? new Date(data.completed_date) : undefined,
      status: data.status,
      exercises: data.exercises,
      totalCaloriesBurned: data.total_calories_burned,
      notes: data.notes,
      tags: data.tags,
      isTemplate: data.is_template,
      templateId: data.template_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private transformExercise(data: any): Exercise {
    return {
      id: data.id,
      name: data.name,
      category: data.category,
      muscleGroups: data.muscle_groups,
      equipment: data.equipment,
      difficulty: data.difficulty,
      instructions: data.instructions,
      tips: data.tips,
      videoUrl: data.video_url,
      imageUrls: data.image_urls,
      caloriesPerMinute: data.calories_per_minute,
      isCustom: data.is_custom,
      createdBy: data.created_by,
    };
  }

  private transformNutritionEntry(data: any): NutritionEntry {
    return {
      id: data.id,
      userId: data.user_id,
      date: new Date(data.date),
      meals: data.meals,
      waterIntake: data.water_intake,
      totalCalories: data.total_calories,
      macros: data.macros,
      notes: data.notes,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private transformGoal(data: any): Goal {
    return {
      id: data.id,
      userId: data.user_id,
      type: data.type,
      title: data.title,
      description: data.description,
      targetValue: data.target_value,
      currentValue: data.current_value,
      unit: data.unit,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
      status: data.status,
      priority: data.priority,
      milestones: data.milestones,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private transformChallenge(data: any): Challenge {
    return {
      id: data.id,
      creatorId: data.creator_id,
      name: data.name,
      description: data.description,
      type: data.type,
      startDate: new Date(data.start_date),
      endDate: new Date(data.end_date),
      participants: data.challenge_participants || [],
      rules: data.rules,
      rewards: data.rewards,
      status: data.status,
      isPublic: data.is_public,
      maxParticipants: data.max_participants,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private transformFriend(data: any): Friend {
    return {
      id: data.id,
      userId: data.user_id,
      friendId: data.friend_id,
      friend: data.friend,
      status: data.status,
      createdAt: new Date(data.created_at),
    };
  }

  private transformUserAchievement(data: any): UserAchievement {
    return {
      id: data.id,
      userId: data.user_id,
      achievementId: data.achievement_id,
      achievement: data.achievement,
      unlockedAt: new Date(data.unlocked_at),
      progress: data.progress,
      isUnlocked: data.is_unlocked,
    };
  }

  private transformNotification(data: any): Notification {
    return {
      id: data.id,
      userId: data.user_id,
      type: data.type,
      title: data.title,
      message: data.message,
      data: data.data,
      isRead: data.is_read,
      createdAt: new Date(data.created_at),
    };
  }
}

// Export singleton instance
export const supabaseService = new SupabaseService();