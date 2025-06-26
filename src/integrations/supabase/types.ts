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
      ai_insights: {
        Row: {
          athlete_uuid: string
          coach_uuid: string
          created_at: string | null
          id: string
          json: Json
          source_type: string | null
        }
        Insert: {
          athlete_uuid: string
          coach_uuid: string
          created_at?: string | null
          id?: string
          json: Json
          source_type?: string | null
        }
        Update: {
          athlete_uuid?: string
          coach_uuid?: string
          created_at?: string | null
          id?: string
          json?: Json
          source_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_insights_athlete_uuid_fkey"
            columns: ["athlete_uuid"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_insights_athlete_uuid_fkey"
            columns: ["athlete_uuid"]
            isOneToOne: false
            referencedRelation: "vw_coach_athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_insights_athlete_uuid_fkey"
            columns: ["athlete_uuid"]
            isOneToOne: false
            referencedRelation: "vw_risk_board"
            referencedColumns: ["athlete_id"]
          },
          {
            foreignKeyName: "ai_insights_coach_uuid_fkey"
            columns: ["coach_uuid"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
      }
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
            referencedRelation: "vw_coach_athletes"
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
          coach_uuid: string
          created_at: string | null
          email: string
          id: string
          status: string | null
        }
        Insert: {
          accepted_at?: string | null
          coach_uuid: string
          created_at?: string | null
          email: string
          id?: string
          status?: string | null
        }
        Update: {
          accepted_at?: string | null
          coach_uuid?: string
          created_at?: string | null
          email?: string
          id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "athlete_invites_coach_uuid_fkey"
            columns: ["coach_uuid"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
      }
      athlete_testing: {
        Row: {
          athlete_uuid: string | null
          cmj_cm: number | null
          created_at: string | null
          id: string
          lift: string | null
          notes: string | null
          one_rm_kg: number | null
          sprint_10m_s: number | null
          test_date: string
        }
        Insert: {
          athlete_uuid?: string | null
          cmj_cm?: number | null
          created_at?: string | null
          id?: string
          lift?: string | null
          notes?: string | null
          one_rm_kg?: number | null
          sprint_10m_s?: number | null
          test_date?: string
        }
        Update: {
          athlete_uuid?: string | null
          cmj_cm?: number | null
          created_at?: string | null
          id?: string
          lift?: string | null
          notes?: string | null
          one_rm_kg?: number | null
          sprint_10m_s?: number | null
          test_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "athlete_testing_athlete_uuid_fkey"
            columns: ["athlete_uuid"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "athlete_testing_athlete_uuid_fkey"
            columns: ["athlete_uuid"]
            isOneToOne: false
            referencedRelation: "vw_coach_athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "athlete_testing_athlete_uuid_fkey"
            columns: ["athlete_uuid"]
            isOneToOne: false
            referencedRelation: "vw_risk_board"
            referencedColumns: ["athlete_id"]
          },
        ]
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
          wearable_connected: boolean | null
        }
        Insert: {
          coach_uuid?: string | null
          created_at?: string
          dob?: string | null
          id?: string
          name: string
          sex?: string | null
          updated_at?: string
          wearable_connected?: boolean | null
        }
        Update: {
          coach_uuid?: string | null
          created_at?: string
          dob?: string | null
          id?: string
          name?: string
          sex?: string | null
          updated_at?: string
          wearable_connected?: boolean | null
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
      biomech_alerts: {
        Row: {
          alert_type: string
          athlete_uuid: string
          coach_uuid: string
          created_at: string
          id: string
          timestamp: string
          value: number
        }
        Insert: {
          alert_type: string
          athlete_uuid: string
          coach_uuid: string
          created_at?: string
          id?: string
          timestamp?: string
          value: number
        }
        Update: {
          alert_type?: string
          athlete_uuid?: string
          coach_uuid?: string
          created_at?: string
          id?: string
          timestamp?: string
          value?: number
        }
        Relationships: []
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
          created_at: string
          description: string | null
          difficulty: string | null
          energy_system: string | null
          equipment: string[] | null
          id: string
          intensity_zone: string | null
          modality: string[] | null
          muscle: string[] | null
          name: string
          origin: string | null
          pattern: string[] | null
          plane: string | null
          sport: string[] | null
          thumbnail_url: string | null
          updated_at: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          difficulty?: string | null
          energy_system?: string | null
          equipment?: string[] | null
          id?: string
          intensity_zone?: string | null
          modality?: string[] | null
          muscle?: string[] | null
          name: string
          origin?: string | null
          pattern?: string[] | null
          plane?: string | null
          sport?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          difficulty?: string | null
          energy_system?: string | null
          equipment?: string[] | null
          id?: string
          intensity_zone?: string | null
          modality?: string[] | null
          muscle?: string[] | null
          name?: string
          origin?: string | null
          pattern?: string[] | null
          plane?: string | null
          sport?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      injury_risk_forecast: {
        Row: {
          athlete_uuid: string
          coach_uuid: string
          created_at: string
          forecast_date: string
          id: string
          pdf_url: string | null
          probabilities: Json
          top_features: Json | null
          updated_at: string
        }
        Insert: {
          athlete_uuid: string
          coach_uuid: string
          created_at?: string
          forecast_date?: string
          id?: string
          pdf_url?: string | null
          probabilities: Json
          top_features?: Json | null
          updated_at?: string
        }
        Update: {
          athlete_uuid?: string
          coach_uuid?: string
          created_at?: string
          forecast_date?: string
          id?: string
          pdf_url?: string | null
          probabilities?: Json
          top_features?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      insight_log: {
        Row: {
          athlete_uuid: string | null
          created_at: string | null
          id: string
          message: string
          metric: string
          severity: string
          source: string | null
        }
        Insert: {
          athlete_uuid?: string | null
          created_at?: string | null
          id?: string
          message: string
          metric: string
          severity: string
          source?: string | null
        }
        Update: {
          athlete_uuid?: string | null
          created_at?: string | null
          id?: string
          message?: string
          metric?: string
          severity?: string
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "insight_log_athlete_uuid_fkey"
            columns: ["athlete_uuid"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insight_log_athlete_uuid_fkey"
            columns: ["athlete_uuid"]
            isOneToOne: false
            referencedRelation: "vw_coach_athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insight_log_athlete_uuid_fkey"
            columns: ["athlete_uuid"]
            isOneToOne: false
            referencedRelation: "vw_risk_board"
            referencedColumns: ["athlete_id"]
          },
        ]
      }
      kai_live_prompts: {
        Row: {
          adjustment_value: number | null
          athlete_uuid: string
          coach_uuid: string
          created_at: string
          id: string
          metric: string
          prompt_text: string
          session_uuid: string
        }
        Insert: {
          adjustment_value?: number | null
          athlete_uuid: string
          coach_uuid: string
          created_at?: string
          id?: string
          metric: string
          prompt_text: string
          session_uuid: string
        }
        Update: {
          adjustment_value?: number | null
          athlete_uuid?: string
          coach_uuid?: string
          created_at?: string
          id?: string
          metric?: string
          prompt_text?: string
          session_uuid?: string
        }
        Relationships: []
      }
      lookup_exercise_muscle: {
        Row: {
          exercise_name: string
          id: number
          muscles: string[]
        }
        Insert: {
          exercise_name: string
          id?: number
          muscles: string[]
        }
        Update: {
          exercise_name?: string
          id?: number
          muscles?: string[]
        }
        Relationships: []
      }
      muscle_load_daily: {
        Row: {
          acute_load: number | null
          acwr: number | null
          athlete_id: string | null
          chronic_load: number | null
          created_at: string | null
          day: string
          id: string
          muscle: string
        }
        Insert: {
          acute_load?: number | null
          acwr?: number | null
          athlete_id?: string | null
          chronic_load?: number | null
          created_at?: string | null
          day: string
          id?: string
          muscle: string
        }
        Update: {
          acute_load?: number | null
          acwr?: number | null
          athlete_id?: string | null
          chronic_load?: number | null
          created_at?: string | null
          day?: string
          id?: string
          muscle?: string
        }
        Relationships: [
          {
            foreignKeyName: "muscle_load_daily_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "muscle_load_daily_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "vw_coach_athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "muscle_load_daily_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "vw_risk_board"
            referencedColumns: ["athlete_id"]
          },
        ]
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
      program_templates: {
        Row: {
          block_json: Json
          coach_uuid: string
          created_at: string
          id: string
          name: string
          origin: string
          updated_at: string
        }
        Insert: {
          block_json: Json
          coach_uuid: string
          created_at?: string
          id?: string
          name: string
          origin?: string
          updated_at?: string
        }
        Update: {
          block_json?: Json
          coach_uuid?: string
          created_at?: string
          id?: string
          name?: string
          origin?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_templates_coach_uuid_fkey"
            columns: ["coach_uuid"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "vw_coach_athletes"
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
          load: number | null
          notes: string | null
          rpe: number | null
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
          load?: number | null
          notes?: string | null
          rpe?: number | null
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
          load?: number | null
          notes?: string | null
          rpe?: number | null
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
            referencedRelation: "vw_coach_athletes"
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
            referencedRelation: "vw_coach_athletes"
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
      wearable_tokens: {
        Row: {
          access_token: string
          athlete_uuid: string
          created_at: string | null
          expires_at: string | null
          provider: string
          refresh_token: string | null
          scope: string | null
          token_type: string | null
          updated_at: string | null
        }
        Insert: {
          access_token: string
          athlete_uuid: string
          created_at?: string | null
          expires_at?: string | null
          provider: string
          refresh_token?: string | null
          scope?: string | null
          token_type?: string | null
          updated_at?: string | null
        }
        Update: {
          access_token?: string
          athlete_uuid?: string
          created_at?: string | null
          expires_at?: string | null
          provider?: string
          refresh_token?: string | null
          scope?: string | null
          token_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wearable_tokens_athlete_uuid_fkey"
            columns: ["athlete_uuid"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wearable_tokens_athlete_uuid_fkey"
            columns: ["athlete_uuid"]
            isOneToOne: false
            referencedRelation: "vw_coach_athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wearable_tokens_athlete_uuid_fkey"
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
            referencedRelation: "vw_coach_athletes"
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
          coach_uuid: string | null
          created_at: string
          data: Json
          duration_weeks: number | null
          id: string
          name: string | null
          updated_at: string
        }
        Insert: {
          athlete_uuid: string
          coach_uuid?: string | null
          created_at?: string
          data: Json
          duration_weeks?: number | null
          id?: string
          name?: string | null
          updated_at?: string
        }
        Update: {
          athlete_uuid?: string
          coach_uuid?: string | null
          created_at?: string
          data?: Json
          duration_weeks?: number | null
          id?: string
          name?: string | null
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
            referencedRelation: "vw_coach_athletes"
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
          {
            foreignKeyName: "workout_performances_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises_search"
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
            foreignKeyName: "workout_template_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises_search"
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
      exercises_search: {
        Row: {
          document: unknown | null
          id: string | null
        }
        Relationships: []
      }
      vw_coach_athletes: {
        Row: {
          coach_uuid: string | null
          created_at: string | null
          dob: string | null
          id: string | null
          name: string | null
          readiness: number | null
          sex: string | null
          updated_at: string | null
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
      vw_load_acwr: {
        Row: {
          acute_7d: number | null
          acwr_7_28: number | null
          athlete_uuid: string | null
          chronic_28d: number | null
          daily_load: number | null
          day: string | null
        }
        Relationships: []
      }
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
            referencedRelation: "vw_coach_athletes"
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
      vw_readiness_rolling: {
        Row: {
          athlete_uuid: string | null
          avg_30d: number | null
          avg_7d: number | null
          avg_90d: number | null
          day: string | null
          readiness_score: number | null
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
            referencedRelation: "vw_coach_athletes"
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
      vw_sleep_daily: {
        Row: {
          athlete_uuid: string | null
          avg_sleep_hr: number | null
          day: string | null
          hrv_rmssd: number | null
          sleep_efficiency: number | null
          total_sleep_hours: number | null
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
            referencedRelation: "vw_coach_athletes"
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
      get_load_detail: {
        Args: { pv_period: number }
        Returns: {
          day: string
          daily_load: number
          acute_7d: number
          chronic_28d: number
          acwr_7_28: number
        }[]
      }
      get_muscle_heatmap: {
        Args: { athlete_id_in: string; window_days?: number }
        Returns: Json
      }
      get_sleep_detail: {
        Args: { pv_period: number }
        Returns: {
          day: string
          total_sleep_hours: number
          avg_hr: number
          deep_minutes: number
          light_minutes: number
          rem_minutes: number
        }[]
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
      solo_create_block: {
        Args: { p_name: string; p_duration_weeks: number; p_block: Json }
        Returns: string
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
