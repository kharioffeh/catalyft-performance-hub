export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      assigned_workouts: {
        Row: {
          assigned_date: string
          athlete_uuid: string
          coach_uuid: string
          created_at: string
          due_date: string | null
          id: string
          notes: string | null
          status: string | null
          template_id: string
          updated_at: string
        }
        Insert: {
          assigned_date: string
          athlete_uuid: string
          coach_uuid: string
          created_at?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          status?: string | null
          template_id: string
          updated_at?: string
        }
        Update: {
          assigned_date?: string
          athlete_uuid?: string
          coach_uuid?: string
          created_at?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          status?: string | null
          template_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assigned_workouts_athlete_uuid_fkey"
            columns: ["athlete_uuid"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assigned_workouts_athlete_uuid_fkey"
            columns: ["athlete_uuid"]
            isOneToOne: false
            referencedRelation: "vw_risk_board"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "assigned_workouts_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "workout_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      athlete_invites: {
        Row: {
          accepted_at: string | null
          athlete_name: string | null
          coach_uuid: string
          created_at: string
          email: string
          expires_at: string
          id: string
          notes: string | null
          status: string
        }
        Insert: {
          accepted_at?: string | null
          athlete_name?: string | null
          coach_uuid: string
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          notes?: string | null
          status?: string
        }
        Update: {
          accepted_at?: string | null
          athlete_name?: string | null
          coach_uuid?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          notes?: string | null
          status?: string
        }
        Relationships: []
      }
      athletes: {
        Row: {
          coach_uuid: string | null
          created_at: string
          dob: string | null
          id: string
          name: string
          sex: string | null
          updated_at: string
        }
        Insert: {
          coach_uuid?: string | null
          created_at?: string
          dob?: string | null
          id?: string
          name: string
          sex?: string | null
          updated_at?: string
        }
        Update: {
          coach_uuid?: string | null
          created_at?: string
          dob?: string | null
          id?: string
          name?: string
          sex?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "athletes_coach_uuid_fkey"
            columns: ["coach_uuid"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_usage: {
        Row: {
          athlete_count: number
          coach_uuid: string
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          athlete_count?: number
          coach_uuid: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          athlete_count?: number
          coach_uuid?: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      coaches: {
        Row: {
          created_at: string
          email: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      exercises: {
        Row: {
          category: string
          created_at: string
          equipment: string[] | null
          id: string
          instructions: string | null
          muscle_groups: string[] | null
          name: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          category: string
          created_at?: string
          equipment?: string[] | null
          id?: string
          instructions?: string | null
          muscle_groups?: string[] | null
          name: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          equipment?: string[] | null
          id?: string
          instructions?: string | null
          muscle_groups?: string[] | null
          name?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          role: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      readiness_scores: {
        Row: {
          athlete_uuid: string
          created_at: string
          id: string
          score: number
          ts: string
        }
        Insert: {
          athlete_uuid: string
          created_at?: string
          id?: string
          score: number
          ts: string
        }
        Update: {
          athlete_uuid?: string
          created_at?: string
          id?: string
          score?: number
          ts?: string
        }
        Relationships: [
          {
            foreignKeyName: "readiness_scores_athlete_uuid_fkey"
            columns: ["athlete_uuid"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "readiness_scores_athlete_uuid_fkey"
            columns: ["athlete_uuid"]
            isOneToOne: false
            referencedRelation: "vw_risk_board"
            referencedColumns: ["athlete_id"]
          },
        ]
      }
      sessions: {
        Row: {
          athlete_uuid: string
          coach_uuid: string
          created_at: string
          end_ts: string
          id: string
          notes: string | null
          start_ts: string
          type: string
          updated_at: string
        }
        Insert: {
          athlete_uuid: string
          coach_uuid: string
          created_at?: string
          end_ts: string
          id?: string
          notes?: string | null
          start_ts: string
          type: string
          updated_at?: string
        }
        Update: {
          athlete_uuid?: string
          coach_uuid?: string
          created_at?: string
          end_ts?: string
          id?: string
          notes?: string | null
          start_ts?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_athlete_uuid_fkey"
            columns: ["athlete_uuid"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_athlete_uuid_fkey"
            columns: ["athlete_uuid"]
            isOneToOne: false
            referencedRelation: "vw_risk_board"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "sessions_coach_uuid_fkey"
            columns: ["coach_uuid"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          athlete_limit: number | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          price_monthly: number
          stripe_price_id: string
          updated_at: string | null
        }
        Insert: {
          athlete_limit?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          price_monthly: number
          stripe_price_id: string
          updated_at?: string | null
        }
        Update: {
          athlete_limit?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          price_monthly?: number
          stripe_price_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          athlete_count: number | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_id: string | null
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          athlete_count?: number | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          athlete_count?: number | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      wearable_raw: {
        Row: {
          athlete_uuid: string
          created_at: string
          id: string
          metric: string
          ts: string
          value: number
        }
        Insert: {
          athlete_uuid: string
          created_at?: string
          id?: string
          metric: string
          ts: string
          value: number
        }
        Update: {
          athlete_uuid?: string
          created_at?: string
          id?: string
          metric?: string
          ts?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "wearable_raw_athlete_uuid_fkey"
            columns: ["athlete_uuid"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wearable_raw_athlete_uuid_fkey"
            columns: ["athlete_uuid"]
            isOneToOne: false
            referencedRelation: "vw_risk_board"
            referencedColumns: ["athlete_id"]
          },
        ]
      }
      whoop_tokens: {
        Row: {
          access_token: string
          athlete_uuid: string
          created_at: string
          expires_at: string | null
          id: string
          refresh_token: string | null
          scope: string | null
          token_type: string | null
          updated_at: string
        }
        Insert: {
          access_token: string
          athlete_uuid: string
          created_at?: string
          expires_at?: string | null
          id?: string
          refresh_token?: string | null
          scope?: string | null
          token_type?: string | null
          updated_at?: string
        }
        Update: {
          access_token?: string
          athlete_uuid?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          refresh_token?: string | null
          scope?: string | null
          token_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "whoop_tokens_athlete_uuid_fkey"
            columns: ["athlete_uuid"]
            isOneToOne: true
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whoop_tokens_athlete_uuid_fkey"
            columns: ["athlete_uuid"]
            isOneToOne: true
            referencedRelation: "vw_risk_board"
            referencedColumns: ["athlete_id"]
          },
        ]
      }
      workout_blocks: {
        Row: {
          athlete_uuid: string
          created_at: string
          data: Json
          id: string
          updated_at: string
        }
        Insert: {
          athlete_uuid: string
          created_at?: string
          data: Json
          id?: string
          updated_at?: string
        }
        Update: {
          athlete_uuid?: string
          created_at?: string
          data?: Json
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_blocks_athlete_uuid_fkey"
            columns: ["athlete_uuid"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_blocks_athlete_uuid_fkey"
            columns: ["athlete_uuid"]
            isOneToOne: false
            referencedRelation: "vw_risk_board"
            referencedColumns: ["athlete_id"]
          },
        ]
      }
      workout_performances: {
        Row: {
          assigned_workout_id: string
          completed_at: string
          distance_meters: number | null
          duration_seconds: number | null
          exercise_id: string
          id: string
          notes: string | null
          perceived_exertion: number | null
          reps_completed: number | null
          set_number: number
          weight_used_kg: number | null
        }
        Insert: {
          assigned_workout_id: string
          completed_at?: string
          distance_meters?: number | null
          duration_seconds?: number | null
          exercise_id: string
          id?: string
          notes?: string | null
          perceived_exertion?: number | null
          reps_completed?: number | null
          set_number: number
          weight_used_kg?: number | null
        }
        Update: {
          assigned_workout_id?: string
          completed_at?: string
          distance_meters?: number | null
          duration_seconds?: number | null
          exercise_id?: string
          id?: string
          notes?: string | null
          perceived_exertion?: number | null
          reps_completed?: number | null
          set_number?: number
          weight_used_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_performances_assigned_workout_id_fkey"
            columns: ["assigned_workout_id"]
            isOneToOne: false
            referencedRelation: "assigned_workouts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_performances_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_template_exercises: {
        Row: {
          created_at: string
          distance_meters: number | null
          duration_seconds: number | null
          exercise_id: string
          id: string
          notes: string | null
          order_index: number
          reps: number | null
          rest_seconds: number | null
          sets: number | null
          template_id: string
          weight_kg: number | null
        }
        Insert: {
          created_at?: string
          distance_meters?: number | null
          duration_seconds?: number | null
          exercise_id: string
          id?: string
          notes?: string | null
          order_index: number
          reps?: number | null
          rest_seconds?: number | null
          sets?: number | null
          template_id: string
          weight_kg?: number | null
        }
        Update: {
          created_at?: string
          distance_meters?: number | null
          duration_seconds?: number | null
          exercise_id?: string
          id?: string
          notes?: string | null
          order_index?: number
          reps?: number | null
          rest_seconds?: number | null
          sets?: number | null
          template_id?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_template_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_template_exercises_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "workout_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_templates: {
        Row: {
          category: string
          coach_uuid: string
          created_at: string
          description: string | null
          difficulty_level: number | null
          estimated_duration: number | null
          id: string
          is_public: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          category: string
          coach_uuid: string
          created_at?: string
          description?: string | null
          difficulty_level?: number | null
          estimated_duration?: number | null
          id?: string
          is_public?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          category?: string
          coach_uuid?: string
          created_at?: string
          description?: string | null
          difficulty_level?: number | null
          estimated_duration?: number | null
          id?: string
          is_public?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      vw_load_metrics: {
        Row: {
          acute_load: number | null
          acwr: number | null
          athlete_uuid: string | null
          chronic_load: number | null
          latest_day: string | null
          yesterday_hsr: number | null
        }
        Relationships: [
          {
            foreignKeyName: "wearable_raw_athlete_uuid_fkey"
            columns: ["athlete_uuid"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wearable_raw_athlete_uuid_fkey"
            columns: ["athlete_uuid"]
            isOneToOne: false
            referencedRelation: "vw_risk_board"
            referencedColumns: ["athlete_id"]
          },
        ]
      }
      vw_risk_board: {
        Row: {
          acwr: number | null
          athlete_id: string | null
          coach_uuid: string | null
          flag: string | null
          name: string | null
          readiness: number | null
          yesterday_hsr: number | null
        }
        Relationships: [
          {
            foreignKeyName: "athletes_coach_uuid_fkey"
            columns: ["coach_uuid"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      calculate_all_readiness: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      calculate_readiness: {
        Args: { target_athlete_uuid: string }
        Returns: undefined
      }
      can_add_athlete: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      expire_old_invites: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_current_coach_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_athlete_count: {
        Args: { user_uuid: string }
        Returns: number
      }
      is_current_user_coach: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      refresh_load_metrics: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      user_owns_athlete: {
        Args: { athlete_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
