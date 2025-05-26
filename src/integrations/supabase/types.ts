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
            foreignKeyName: "sessions_coach_uuid_fkey"
            columns: ["coach_uuid"]
            isOneToOne: false
            referencedRelation: "coaches"
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
        ]
      }
    }
    Views: {
      [_ in never]: never
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
      get_current_coach_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_current_user_coach: {
        Args: Record<PropertyKey, never>
        Returns: boolean
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
