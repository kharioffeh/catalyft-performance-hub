export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
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
            referencedRelation: "aria_digest_metrics_v"
            referencedColumns: ["athlete_id"]
          },
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
      aria_docs: {
        Row: {
          content_md: string
          created_at: string | null
          embedding: string | null
          id: string
          source: string
          title: string
          updated_at: string | null
        }
        Insert: {
          content_md: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          source: string
          title: string
          updated_at?: string | null
        }
        Update: {
          content_md?: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          source?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      aria_messages: {
        Row: {
          content: string
          created_at: string | null
          id: number
          role: Database["public"]["Enums"]["aria_role"]
          thread_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: never
          role: Database["public"]["Enums"]["aria_role"]
          thread_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: never
          role?: Database["public"]["Enums"]["aria_role"]
          thread_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "aria_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "aria_threads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aria_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "v_aria_thread_last"
            referencedColumns: ["id"]
          },
        ]
      }
      aria_threads: {
        Row: {
          created_at: string | null
          id: string
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
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
            referencedRelation: "aria_digest_metrics_v"
            referencedColumns: ["athlete_id"]
          },
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
      athlete_purchases: {
        Row: {
          athlete_pack_size: number
          billing_customer_id: string | null
          created_at: string
          currency_code: string
          id: string
          is_active: boolean
          monthly_cost_added: number
          purchase_date: string
          stripe_subscription_item_id: string | null
          user_id: string | null
        }
        Insert: {
          athlete_pack_size?: number
          billing_customer_id?: string | null
          created_at?: string
          currency_code: string
          id?: string
          is_active?: boolean
          monthly_cost_added: number
          purchase_date?: string
          stripe_subscription_item_id?: string | null
          user_id?: string | null
        }
        Update: {
          athlete_pack_size?: number
          billing_customer_id?: string | null
          created_at?: string
          currency_code?: string
          id?: string
          is_active?: boolean
          monthly_cost_added?: number
          purchase_date?: string
          stripe_subscription_item_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "athlete_purchases_billing_customer_id_fkey"
            columns: ["billing_customer_id"]
            isOneToOne: false
            referencedRelation: "billing_customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "athlete_purchases_currency_code_fkey"
            columns: ["currency_code"]
            isOneToOne: false
            referencedRelation: "currencies"
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
            referencedRelation: "aria_digest_metrics_v"
            referencedColumns: ["athlete_id"]
          },
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
      billing_customers: {
        Row: {
          additional_athletes_purchased: number
          created_at: string
          current_athlete_count: number
          id: string
          monthly_addon_cost: number
          plan_id: string | null
          plan_status: string
          preferred_currency: string | null
          role: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_end: string
        }
        Insert: {
          additional_athletes_purchased?: number
          created_at?: string
          current_athlete_count?: number
          id: string
          monthly_addon_cost?: number
          plan_id?: string | null
          plan_status?: string
          preferred_currency?: string | null
          role: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end: string
        }
        Update: {
          additional_athletes_purchased?: number
          created_at?: string
          current_athlete_count?: number
          id?: string
          monthly_addon_cost?: number
          plan_id?: string | null
          plan_status?: string
          preferred_currency?: string | null
          role?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_customers_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_customers_preferred_currency_fkey"
            columns: ["preferred_currency"]
            isOneToOne: false
            referencedRelation: "currencies"
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
      currencies: {
        Row: {
          created_at: string
          exchange_rate_to_gbp: number
          id: string
          is_active: boolean
          name: string
          symbol: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          exchange_rate_to_gbp?: number
          id: string
          is_active?: boolean
          name: string
          symbol: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          exchange_rate_to_gbp?: number
          id?: string
          is_active?: boolean
          name?: string
          symbol?: string
          updated_at?: string
        }
        Relationships: []
      }
      exercise_library: {
        Row: {
          category: string
          coach_uuid: string | null
          created_at: string | null
          id: string
          name: string
          primary_muscle: string
          secondary_muscle: string[] | null
          video_url: string | null
        }
        Insert: {
          category: string
          coach_uuid?: string | null
          created_at?: string | null
          id?: string
          name: string
          primary_muscle: string
          secondary_muscle?: string[] | null
          video_url?: string | null
        }
        Update: {
          category?: string
          coach_uuid?: string | null
          created_at?: string | null
          id?: string
          name?: string
          primary_muscle?: string
          secondary_muscle?: string[] | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_coach"
            columns: ["coach_uuid"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "aria_digest_metrics_v"
            referencedColumns: ["athlete_id"]
          },
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
            referencedRelation: "aria_digest_metrics_v"
            referencedColumns: ["athlete_id"]
          },
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
      notification_thresholds: {
        Row: {
          created_at: string | null
          id: string
          readiness_threshold: number | null
          strain_threshold: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          readiness_threshold?: number | null
          strain_threshold?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          readiness_threshold?: number | null
          strain_threshold?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string | null
          id: string
          meta: Json | null
          read: boolean | null
          title: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          body: string
          created_at?: string | null
          id?: string
          meta?: Json | null
          read?: boolean | null
          title: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          body?: string
          created_at?: string | null
          id?: string
          meta?: Json | null
          read?: boolean | null
          title?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      plans: {
        Row: {
          adaptive_adjustments: boolean | null
          created_at: string | null
          export_api: boolean | null
          has_adaptive_replan: boolean | null
          has_aria_full: boolean | null
          id: string
          label: string
          long_term_analytics: boolean | null
          max_athletes: number | null
          price_id: string
          priority_support: boolean | null
          type: string
        }
        Insert: {
          adaptive_adjustments?: boolean | null
          created_at?: string | null
          export_api?: boolean | null
          has_adaptive_replan?: boolean | null
          has_aria_full?: boolean | null
          id: string
          label: string
          long_term_analytics?: boolean | null
          max_athletes?: number | null
          price_id: string
          priority_support?: boolean | null
          type: string
        }
        Update: {
          adaptive_adjustments?: boolean | null
          created_at?: string | null
          export_api?: boolean | null
          has_adaptive_replan?: boolean | null
          has_aria_full?: boolean | null
          id?: string
          label?: string
          long_term_analytics?: boolean | null
          max_athletes?: number | null
          price_id?: string
          priority_support?: boolean | null
          type?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          daily_summary: boolean | null
          email: string
          full_name: string | null
          id: string
          last_metrics_update: string | null
          last_readiness: number | null
          last_strain: number | null
          missed_nudge: boolean | null
          notification_prefs: Json | null
          readiness_alerts: boolean | null
          role: string
          timezone: string | null
          updated_at: string
          weekly_summary_opt_in: boolean | null
        }
        Insert: {
          created_at?: string
          daily_summary?: boolean | null
          email: string
          full_name?: string | null
          id: string
          last_metrics_update?: string | null
          last_readiness?: number | null
          last_strain?: number | null
          missed_nudge?: boolean | null
          notification_prefs?: Json | null
          readiness_alerts?: boolean | null
          role: string
          timezone?: string | null
          updated_at?: string
          weekly_summary_opt_in?: boolean | null
        }
        Update: {
          created_at?: string
          daily_summary?: boolean | null
          email?: string
          full_name?: string | null
          id?: string
          last_metrics_update?: string | null
          last_readiness?: number | null
          last_strain?: number | null
          missed_nudge?: boolean | null
          notification_prefs?: Json | null
          readiness_alerts?: boolean | null
          role?: string
          timezone?: string | null
          updated_at?: string
          weekly_summary_opt_in?: boolean | null
        }
        Relationships: []
      }
      program_adjustments: {
        Row: {
          adjustment_factor: number
          athlete_uuid: string
          created_at: string | null
          id: string
          new_payload: Json
          old_payload: Json
          reason: Database["public"]["Enums"]["adjustment_reason"]
          session_id: string | null
        }
        Insert: {
          adjustment_factor?: number
          athlete_uuid: string
          created_at?: string | null
          id?: string
          new_payload: Json
          old_payload: Json
          reason: Database["public"]["Enums"]["adjustment_reason"]
          session_id?: string | null
        }
        Update: {
          adjustment_factor?: number
          athlete_uuid?: string
          created_at?: string | null
          id?: string
          new_payload?: Json
          old_payload?: Json
          reason?: Database["public"]["Enums"]["adjustment_reason"]
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "program_adjustments_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      program_instance: {
        Row: {
          athlete_uuid: string
          coach_uuid: string
          created_at: string | null
          end_date: string
          id: string
          source: string
          start_date: string
          status: string
          template_id: string | null
        }
        Insert: {
          athlete_uuid: string
          coach_uuid: string
          created_at?: string | null
          end_date: string
          id?: string
          source: string
          start_date: string
          status?: string
          template_id?: string | null
        }
        Update: {
          athlete_uuid?: string
          coach_uuid?: string
          created_at?: string | null
          end_date?: string
          id?: string
          source?: string
          start_date?: string
          status?: string
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "program_instance_athlete_uuid_fkey"
            columns: ["athlete_uuid"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_instance_coach_uuid_fkey"
            columns: ["coach_uuid"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_instance_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "template"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_instance_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "v_template_grid"
            referencedColumns: ["template_id"]
          },
        ]
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
            referencedRelation: "aria_digest_metrics_v"
            referencedColumns: ["athlete_id"]
          },
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
      session: {
        Row: {
          acwr_snapshot: number | null
          completed_at: string | null
          created_at: string | null
          exercises: Json
          id: string
          planned_at: string
          program_id: string
          rpe: number | null
          strain: number | null
        }
        Insert: {
          acwr_snapshot?: number | null
          completed_at?: string | null
          created_at?: string | null
          exercises?: Json
          id?: string
          planned_at: string
          program_id: string
          rpe?: number | null
          strain?: number | null
        }
        Update: {
          acwr_snapshot?: number | null
          completed_at?: string | null
          created_at?: string | null
          exercises?: Json
          id?: string
          planned_at?: string
          program_id?: string
          rpe?: number | null
          strain?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "session_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "program_instance"
            referencedColumns: ["id"]
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
          payload: Json | null
          planned_start: string | null
          rpe: number | null
          start_ts: string
          status: string | null
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
          payload?: Json | null
          planned_start?: string | null
          rpe?: number | null
          start_ts: string
          status?: string | null
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
          payload?: Json | null
          planned_start?: string | null
          rpe?: number | null
          start_ts?: string
          status?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_athlete_uuid_fkey"
            columns: ["athlete_uuid"]
            isOneToOne: false
            referencedRelation: "aria_digest_metrics_v"
            referencedColumns: ["athlete_id"]
          },
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
      set_log: {
        Row: {
          created_at: string | null
          exercise_id: string
          id: string
          load: number | null
          reps: number | null
          rpe: number | null
          session_id: string
          set_no: number
        }
        Insert: {
          created_at?: string | null
          exercise_id: string
          id?: string
          load?: number | null
          reps?: number | null
          rpe?: number | null
          session_id: string
          set_no: number
        }
        Update: {
          created_at?: string | null
          exercise_id?: string
          id?: string
          load?: number | null
          reps?: number | null
          rpe?: number | null
          session_id?: string
          set_no?: number
        }
        Relationships: [
          {
            foreignKeyName: "set_log_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercise_library"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "set_log_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "session"
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
      template: {
        Row: {
          created_at: string | null
          goal: string
          id: string
          owner_uuid: string
          title: string
          visibility: string
          weeks: number
        }
        Insert: {
          created_at?: string | null
          goal: string
          id?: string
          owner_uuid: string
          title: string
          visibility?: string
          weeks: number
        }
        Update: {
          created_at?: string | null
          goal?: string
          id?: string
          owner_uuid?: string
          title?: string
          visibility?: string
          weeks?: number
        }
        Relationships: [
          {
            foreignKeyName: "template_owner_uuid_fkey"
            columns: ["owner_uuid"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      template_block: {
        Row: {
          day_no: number
          exercises: Json
          session_title: string | null
          template_id: string
          week_no: number
        }
        Insert: {
          day_no: number
          exercises?: Json
          session_title?: string | null
          template_id: string
          week_no: number
        }
        Update: {
          day_no?: number
          exercises?: Json
          session_title?: string | null
          template_id?: string
          week_no?: number
        }
        Relationships: [
          {
            foreignKeyName: "template_block_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "template"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_block_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "v_template_grid"
            referencedColumns: ["template_id"]
          },
        ]
      }
      user_currency_preferences: {
        Row: {
          created_at: string
          currency_code: string
          id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          currency_code?: string
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          currency_code?: string
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_currency_preferences_currency_code_fkey"
            columns: ["currency_code"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "aria_digest_metrics_v"
            referencedColumns: ["athlete_id"]
          },
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
            referencedRelation: "aria_digest_metrics_v"
            referencedColumns: ["athlete_id"]
          },
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
      weekly_summaries: {
        Row: {
          created_at: string | null
          delivered: boolean | null
          id: string
          owner_uuid: string
          period_end: string
          period_start: string
          role: string
          summary_md: string
        }
        Insert: {
          created_at?: string | null
          delivered?: boolean | null
          id?: string
          owner_uuid: string
          period_end: string
          period_start: string
          role: string
          summary_md: string
        }
        Update: {
          created_at?: string | null
          delivered?: boolean | null
          id?: string
          owner_uuid?: string
          period_end?: string
          period_start?: string
          role?: string
          summary_md?: string
        }
        Relationships: []
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
            referencedRelation: "aria_digest_metrics_v"
            referencedColumns: ["athlete_id"]
          },
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
            referencedRelation: "aria_digest_metrics_v"
            referencedColumns: ["athlete_id"]
          },
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
      aria_digest_metrics_v: {
        Row: {
          athlete_id: string | null
          athlete_name: string | null
          coach_uuid: string | null
          metrics: Json | null
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
      exercises_search: {
        Row: {
          document: unknown | null
          id: string | null
        }
        Relationships: []
      }
      v_aria_thread_last: {
        Row: {
          created_at: string | null
          id: string | null
          last_message: string | null
          message_count: number | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          last_message?: never
          message_count?: never
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          last_message?: never
          message_count?: never
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      v_template_grid: {
        Row: {
          day_no: number | null
          exercise_id: string | null
          load_pct: number | null
          reps: number | null
          sets: number | null
          template_id: string | null
          week_no: number | null
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
            referencedRelation: "aria_digest_metrics_v"
            referencedColumns: ["athlete_id"]
          },
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
            referencedRelation: "aria_digest_metrics_v"
            referencedColumns: ["athlete_id"]
          },
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
            referencedRelation: "aria_digest_metrics_v"
            referencedColumns: ["athlete_id"]
          },
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
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
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
      can_add_athlete_enhanced: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      convert_price: {
        Args: {
          base_price: number
          from_currency?: string
          to_currency?: string
        }
        Returns: number
      }
      expire_old_invites: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      fn_can_call_aria: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      fn_create_program_from_template: {
        Args: {
          p_template_id: string
          p_athlete: string
          p_coach: string
          p_start_date: string
        }
        Returns: string
      }
      fn_upsert_exercise: {
        Args: {
          p_name: string
          p_category: string
          p_primary_muscle: string
          p_secondary_muscle?: string[]
          p_video_url?: string
          p_coach_uuid?: string
        }
        Returns: string
      }
      get_active_athletes_for_coach: {
        Args: { p_coach_uuid: string }
        Returns: {
          athlete_uuid: string
          athlete_name: string
        }[]
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
      get_user_timezone: {
        Args: { user_uuid: string }
        Returns: string
      }
      get_weekly_metrics: {
        Args: {
          p_athlete_uuid: string
          p_start_date: string
          p_end_date: string
        }
        Returns: Json
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      is_current_user_coach: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: unknown
      }
      refresh_load_metrics: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      search_similar_docs: {
        Args: {
          query_embedding: string
          match_threshold?: number
          match_count?: number
        }
        Returns: {
          id: string
          title: string
          source: string
          content_md: string
          similarity: number
        }[]
      }
      should_send_notification: {
        Args: { user_uuid: string; notification_kind: string }
        Returns: boolean
      }
      should_send_weekly_summary: {
        Args: { p_user_uuid: string }
        Returns: boolean
      }
      solo_create_block: {
        Args: { p_name: string; p_duration_weeks: number; p_block: Json }
        Returns: string
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      training_plan_kpis: {
        Args: Record<PropertyKey, never>
        Returns: {
          templates: number
          active_programs: number
          total_sessions: number
        }[]
      }
      update_athlete_metrics_cache: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      user_owns_athlete: {
        Args: { athlete_id: string }
        Returns: boolean
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      adjustment_reason:
        | "low_readiness"
        | "high_readiness"
        | "over_strain"
        | "under_strain"
      aria_role: "user" | "assistant" | "system"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      adjustment_reason: [
        "low_readiness",
        "high_readiness",
        "over_strain",
        "under_strain",
      ],
      aria_role: ["user", "assistant", "system"],
    },
  },
} as const
