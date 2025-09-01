/**
 * Supabase Database Types
 * Auto-generated types for Supabase tables
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string
          full_name: string
          profile_picture: string | null
          date_of_birth: string | null
          gender: 'male' | 'female' | 'other' | null
          height: number | null
          weight: number | null
          activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null
          fitness_goals: string[] | null
          preferences: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          username: string
          full_name: string
          profile_picture?: string | null
          date_of_birth?: string | null
          gender?: 'male' | 'female' | 'other' | null
          height?: number | null
          weight?: number | null
          activity_level?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null
          fitness_goals?: string[] | null
          preferences?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string
          full_name?: string
          profile_picture?: string | null
          date_of_birth?: string | null
          gender?: 'male' | 'female' | 'other' | null
          height?: number | null
          weight?: number | null
          activity_level?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null
          fitness_goals?: string[] | null
          preferences?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      user_stats: {
        Row: {
          id: string
          user_id: string
          total_workouts: number
          total_workout_time: number
          calories_burned: number
          current_streak: number
          longest_streak: number
          personal_records: Json | null
          body_measurements: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          total_workouts?: number
          total_workout_time?: number
          calories_burned?: number
          current_streak?: number
          longest_streak?: number
          personal_records?: Json | null
          body_measurements?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          total_workouts?: number
          total_workout_time?: number
          calories_burned?: number
          current_streak?: number
          longest_streak?: number
          personal_records?: Json | null
          body_measurements?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      workouts: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          type: string
          duration: number
          scheduled_date: string | null
          completed_date: string | null
          status: 'scheduled' | 'in_progress' | 'completed' | 'skipped'
          exercises: Json
          total_calories_burned: number | null
          notes: string | null
          tags: string[] | null
          is_template: boolean
          template_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          type: string
          duration: number
          scheduled_date?: string | null
          completed_date?: string | null
          status?: 'scheduled' | 'in_progress' | 'completed' | 'skipped'
          exercises: Json
          total_calories_burned?: number | null
          notes?: string | null
          tags?: string[] | null
          is_template?: boolean
          template_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          type?: string
          duration?: number
          scheduled_date?: string | null
          completed_date?: string | null
          status?: 'scheduled' | 'in_progress' | 'completed' | 'skipped'
          exercises?: Json
          total_calories_burned?: number | null
          notes?: string | null
          tags?: string[] | null
          is_template?: boolean
          template_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      exercises: {
        Row: {
          id: string
          name: string
          category: string
          muscle_groups: string[]
          equipment: string[]
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          instructions: string[]
          tips: string[] | null
          video_url: string | null
          image_urls: string[] | null
          calories_per_minute: number | null
          is_custom: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          category: string
          muscle_groups: string[]
          equipment: string[]
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          instructions: string[]
          tips?: string[] | null
          video_url?: string | null
          image_urls?: string[] | null
          calories_per_minute?: number | null
          is_custom?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string
          muscle_groups?: string[]
          equipment?: string[]
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
          instructions?: string[]
          tips?: string[] | null
          video_url?: string | null
          image_urls?: string[] | null
          calories_per_minute?: number | null
          is_custom?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      nutrition_entries: {
        Row: {
          id: string
          user_id: string
          date: string
          meals: Json
          water_intake: number
          total_calories: number
          macros: Json
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          meals: Json
          water_intake?: number
          total_calories?: number
          macros: Json
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          meals?: Json
          water_intake?: number
          total_calories?: number
          macros?: Json
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      foods: {
        Row: {
          id: string
          name: string
          brand: string | null
          barcode: string | null
          category: string
          serving_size: number
          serving_unit: string
          calories_per_serving: number
          macros_per_serving: Json
          micronutrients: Json | null
          is_custom: boolean
          created_by: string | null
          verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          brand?: string | null
          barcode?: string | null
          category: string
          serving_size: number
          serving_unit: string
          calories_per_serving: number
          macros_per_serving: Json
          micronutrients?: Json | null
          is_custom?: boolean
          created_by?: string | null
          verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          brand?: string | null
          barcode?: string | null
          category?: string
          serving_size?: number
          serving_unit?: string
          calories_per_serving?: number
          macros_per_serving?: Json
          micronutrients?: Json | null
          is_custom?: boolean
          created_by?: string | null
          verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      goals: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          description: string | null
          target_value: number
          current_value: number
          unit: string
          deadline: string | null
          status: 'active' | 'completed' | 'paused' | 'failed'
          priority: 'low' | 'medium' | 'high'
          milestones: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          description?: string | null
          target_value: number
          current_value?: number
          unit: string
          deadline?: string | null
          status?: 'active' | 'completed' | 'paused' | 'failed'
          priority?: 'low' | 'medium' | 'high'
          milestones?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          description?: string | null
          target_value?: number
          current_value?: number
          unit?: string
          deadline?: string | null
          status?: 'active' | 'completed' | 'paused' | 'failed'
          priority?: 'low' | 'medium' | 'high'
          milestones?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      friends: {
        Row: {
          id: string
          user_id: string
          friend_id: string
          status: 'pending' | 'accepted' | 'blocked'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          friend_id: string
          status?: 'pending' | 'accepted' | 'blocked'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          friend_id?: string
          status?: 'pending' | 'accepted' | 'blocked'
          created_at?: string
        }
      }
      challenges: {
        Row: {
          id: string
          creator_id: string
          name: string
          description: string
          type: string
          start_date: string
          end_date: string
          rules: string[]
          rewards: string[] | null
          status: 'upcoming' | 'active' | 'completed' | 'cancelled'
          is_public: boolean
          max_participants: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          creator_id: string
          name: string
          description: string
          type: string
          start_date: string
          end_date: string
          rules: string[]
          rewards?: string[] | null
          status?: 'upcoming' | 'active' | 'completed' | 'cancelled'
          is_public?: boolean
          max_participants?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          creator_id?: string
          name?: string
          description?: string
          type?: string
          start_date?: string
          end_date?: string
          rules?: string[]
          rewards?: string[] | null
          status?: 'upcoming' | 'active' | 'completed' | 'cancelled'
          is_public?: boolean
          max_participants?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      challenge_participants: {
        Row: {
          id: string
          user_id: string
          challenge_id: string
          joined_at: string
          progress: number
          rank: number | null
          is_completed: boolean
        }
        Insert: {
          id?: string
          user_id: string
          challenge_id: string
          joined_at?: string
          progress?: number
          rank?: number | null
          is_completed?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          challenge_id?: string
          joined_at?: string
          progress?: number
          rank?: number | null
          is_completed?: boolean
        }
      }
      achievements: {
        Row: {
          id: string
          name: string
          description: string
          category: string
          icon: string
          required_value: number
          unit: string
          points: number
          rarity: 'common' | 'rare' | 'epic' | 'legendary'
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          category: string
          icon: string
          required_value: number
          unit: string
          points: number
          rarity: 'common' | 'rare' | 'epic' | 'legendary'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          category?: string
          icon?: string
          required_value?: number
          unit?: string
          points?: number
          rarity?: 'common' | 'rare' | 'epic' | 'legendary'
          created_at?: string
        }
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          unlocked_at: string
          progress: number
          is_unlocked: boolean
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          unlocked_at?: string
          progress?: number
          is_unlocked?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          unlocked_at?: string
          progress?: number
          is_unlocked?: boolean
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          data: Json | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          data?: Json | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          data?: Json | null
          is_read?: boolean
          created_at?: string
        }
      }
      onboarding_progress: {
        Row: {
          id: string
          user_id: string
          current_step: string
          completed_steps: string[]
          goals: string[] | null
          assessment_data: Json | null
          time_spent_seconds: number | null
          started_at: string
          updated_at: string
          completed: boolean
          completed_at: string | null
          selected_plan: string | null
        }
        Insert: {
          id?: string
          user_id: string
          current_step: string
          completed_steps?: string[]
          goals?: string[] | null
          assessment_data?: Json | null
          time_spent_seconds?: number | null
          started_at?: string
          updated_at?: string
          completed?: boolean
          completed_at?: string | null
          selected_plan?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          current_step?: string
          completed_steps?: string[]
          goals?: string[] | null
          assessment_data?: Json | null
          time_spent_seconds?: number | null
          started_at?: string
          updated_at?: string
          completed?: boolean
          completed_at?: string | null
          selected_plan?: string | null
        }
      }
      analytics_events: {
        Row: {
          id: string
          user_id: string | null
          event_name: string
          event_properties: Json | null
          session_id: string | null
          platform: string
          app_version: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          event_name: string
          event_properties?: Json | null
          session_id?: string | null
          platform: string
          app_version: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          event_name?: string
          event_properties?: Json | null
          session_id?: string | null
          platform?: string
          app_version?: string
          created_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          email: string | null
          fitness_level: string | null
          goals: string[] | null
          workout_frequency: number | null
          equipment: string[] | null
          experience_years: number | null
          height_cm: number | null
          weight_kg: number | null
          age: number | null
          gender: string | null
          timezone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email?: string | null
          fitness_level?: string | null
          goals?: string[] | null
          workout_frequency?: number | null
          equipment?: string[] | null
          experience_years?: number | null
          height_cm?: number | null
          weight_kg?: number | null
          age?: number | null
          gender?: string | null
          timezone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string | null
          fitness_level?: string | null
          goals?: string[] | null
          workout_frequency?: number | null
          equipment?: string[] | null
          experience_years?: number | null
          height_cm?: number | null
          weight_kg?: number | null
          age?: number | null
          gender?: string | null
          timezone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      ab_test_assignments: {
        Row: {
          id: string
          user_id: string
          test_id: string
          variant: string
          assigned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          test_id: string
          variant: string
          assigned_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          test_id?: string
          variant?: string
          assigned_at?: string
        }
      }
      workout_templates: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          exercises: Json | null
          is_public: boolean
          category: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          exercises?: Json | null
          is_public?: boolean
          category?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          exercises?: Json | null
          is_public?: boolean
          category?: string | null
          created_at?: string
        }
      }
      workout_exercises: {
        Row: {
          id: string
          workout_id: string
          exercise_id: string
          order_index: number
          notes: string | null
          is_superset: boolean
          superset_group: number | null
        }
        Insert: {
          id?: string
          workout_id: string
          exercise_id: string
          order_index?: number
          notes?: string | null
          is_superset?: boolean
          superset_group?: number | null
        }
        Update: {
          id?: string
          workout_id?: string
          exercise_id?: string
          order_index?: number
          notes?: string | null
          is_superset?: boolean
          superset_group?: number | null
        }
      }
      sets: {
        Row: {
          id: string
          workout_exercise_id: string
          set_number: number
          weight: number | null
          reps: number | null
          distance_meters: number | null
          duration_seconds: number | null
          rest_seconds: number | null
          rpe: number | null
          completed: boolean
        }
        Insert: {
          id?: string
          workout_exercise_id: string
          set_number?: number
          weight?: number | null
          reps?: number | null
          distance_meters?: number | null
          duration_seconds?: number | null
          rest_seconds?: number | null
          rpe?: number | null
          completed?: boolean
        }
        Update: {
          id?: string
          workout_exercise_id?: string
          set_number?: number
          weight?: number | null
          reps?: number | null
          distance_meters?: number | null
          duration_seconds?: number | null
          rest_seconds?: number | null
          rpe?: number | null
          completed?: boolean
        }
      }
      personal_records: {
        Row: {
          id: string
          user_id: string
          exercise_id: string
          weight: number
          reps: number
          one_rep_max: number
          volume: number
          achieved_at: string
          workout_id: string
        }
        Insert: {
          id?: string
          user_id: string
          exercise_id: string
          weight: number
          reps: number
          one_rep_max: number
          volume: number
          achieved_at?: string
          workout_id: string
        }
        Update: {
          id?: string
          user_id?: string
          exercise_id?: string
          weight?: number
          reps?: number
          one_rep_max?: number
          volume?: number
          achieved_at?: string
          workout_id?: string
        }
      }
      user_exercise_favorites: {
        Row: {
          id: string
          user_id: string
          exercise_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          exercise_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          exercise_id?: string
          created_at?: string
        }
      }
      workout_goals: {
        Row: {
          id: string
          user_id: string
          exercise_id: string | null
          goal_type: string
          target_value: number
          current_value: number
          deadline: Date | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          exercise_id?: string | null
          goal_type: string
          target_value: number
          current_value: number
          deadline?: Date | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          exercise_id?: string | null
          goal_type?: string
          target_value?: number
          current_value?: number
          deadline?: Date | null
          notes?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for better TypeScript support
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Insertable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updatable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Realtime subscription types
export interface RealtimeChannel {
  on(
    event: string,
    callback: (payload: any) => void
  ): RealtimeChannel
  subscribe(callback?: (status: string) => void): RealtimeChannel
  unsubscribe(): void
}

export interface RealtimePostgresChangesPayload<T> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new: T
  old: T
  errors: string[] | null
  schema: string
  table: string
  commit_timestamp: string
}