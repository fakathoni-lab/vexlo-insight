export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      clients: {
        Row: {
          active: boolean | null
          created_at: string | null
          domain: string | null
          id: string
          name: string | null
          user_id: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          domain?: string | null
          id?: string
          name?: string | null
          user_id: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          domain?: string | null
          id?: string
          name?: string | null
          user_id?: string
        }
        Relationships: []
      }
      domain_availability_cache: {
        Row: {
          available: boolean
          checked_at: string
          currency: string | null
          domain: string
          expires_at: string
          id: string
          premium: boolean | null
          price: number | null
          pricing: Json | null
          source: string | null
        }
        Insert: {
          available: boolean
          checked_at?: string
          currency?: string | null
          domain: string
          expires_at: string
          id?: string
          premium?: boolean | null
          price?: number | null
          pricing?: Json | null
          source?: string | null
        }
        Update: {
          available?: boolean
          checked_at?: string
          currency?: string | null
          domain?: string
          expires_at?: string
          id?: string
          premium?: boolean | null
          price?: number | null
          pricing?: Json | null
          source?: string | null
        }
        Relationships: []
      }
      domain_check_rate_limit: {
        Row: {
          id: string
          request_count: number | null
          user_id: string
          window_start: string
        }
        Insert: {
          id?: string
          request_count?: number | null
          user_id: string
          window_start?: string
        }
        Update: {
          id?: string
          request_count?: number | null
          user_id?: string
          window_start?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          created_at: string
          display_name: string
          id: string
          is_active: boolean
          name: string
          polar_product_id: string | null
          price_monthly: number
          proofs_limit: number
        }
        Insert: {
          created_at?: string
          display_name: string
          id?: string
          is_active?: boolean
          name: string
          polar_product_id?: string | null
          price_monthly?: number
          proofs_limit: number
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          is_active?: boolean
          name?: string
          polar_product_id?: string | null
          price_monthly?: number
          proofs_limit?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          agency_name: string | null
          avatar_url: string | null
          brand_color: string | null
          brand_logo_url: string | null
          created_at: string | null
          current_period_end: string | null
          email: string | null
          full_name: string | null
          id: string
          onboarding_completed: boolean
          period_reset_at: string | null
          plan: string | null
          plan_status: string | null
          polar_customer_id: string | null
          proofs_limit: number | null
          proofs_used: number | null
          stripe_id: string | null
          updated_at: string | null
        }
        Insert: {
          agency_name?: string | null
          avatar_url?: string | null
          brand_color?: string | null
          brand_logo_url?: string | null
          created_at?: string | null
          current_period_end?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          onboarding_completed?: boolean
          period_reset_at?: string | null
          plan?: string | null
          plan_status?: string | null
          polar_customer_id?: string | null
          proofs_limit?: number | null
          proofs_used?: number | null
          stripe_id?: string | null
          updated_at?: string | null
        }
        Update: {
          agency_name?: string | null
          avatar_url?: string | null
          brand_color?: string | null
          brand_logo_url?: string | null
          created_at?: string | null
          current_period_end?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean
          period_reset_at?: string | null
          plan?: string | null
          plan_status?: string | null
          polar_customer_id?: string | null
          proofs_limit?: number | null
          proofs_used?: number | null
          stripe_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      proof_views: {
        Row: {
          created_at: string
          id: string
          proof_id: string
          user_agent: string | null
          viewer_ip_hash: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          proof_id: string
          user_agent?: string | null
          viewer_ip_hash?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          proof_id?: string
          user_agent?: string | null
          viewer_ip_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proof_views_proof_id_fkey"
            columns: ["proof_id"]
            isOneToOne: false
            referencedRelation: "proofs"
            referencedColumns: ["id"]
          },
        ]
      }
      proofs: {
        Row: {
          ai_overview: boolean | null
          api_cost_units: number | null
          created_at: string | null
          current_rank: number | null
          delta_30: number | null
          domain: string
          error_message: string | null
          id: string
          is_public: boolean
          keyword: string
          narrative: string | null
          public_slug: string | null
          rankings: Json | null
          score: number | null
          serp_features: Json | null
          status: string | null
          user_id: string
        }
        Insert: {
          ai_overview?: boolean | null
          api_cost_units?: number | null
          created_at?: string | null
          current_rank?: number | null
          delta_30?: number | null
          domain: string
          error_message?: string | null
          id?: string
          is_public?: boolean
          keyword: string
          narrative?: string | null
          public_slug?: string | null
          rankings?: Json | null
          score?: number | null
          serp_features?: Json | null
          status?: string | null
          user_id: string
        }
        Update: {
          ai_overview?: boolean | null
          api_cost_units?: number | null
          created_at?: string | null
          current_rank?: number | null
          delta_30?: number | null
          domain?: string
          error_message?: string | null
          id?: string
          is_public?: boolean
          keyword?: string
          narrative?: string | null
          public_slug?: string | null
          rankings?: Json | null
          score?: number | null
          serp_features?: Json | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          canceled_at: string | null
          created_at: string
          current_period_end: string
          current_period_start: string
          id: string
          plan: string
          polar_product_id: string
          polar_subscription_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          created_at?: string
          current_period_end: string
          current_period_start: string
          id?: string
          plan: string
          polar_product_id: string
          polar_subscription_id: string
          status: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          plan?: string
          polar_product_id?: string
          polar_subscription_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      system_status: {
        Row: {
          id: number
          service_name: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          service_name: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          service_name?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          created_at: string | null
          email: string
          id: string
          ip_hash: string | null
          referrer: string | null
          source: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          ip_hash?: string | null
          referrer?: string | null
          source?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          ip_hash?: string | null
          referrer?: string | null
          source?: string | null
        }
        Relationships: []
      }
      webhook_events: {
        Row: {
          event_type: string
          id: string
          payload: Json
          processed_at: string
          processing_ms: number | null
          user_id: string | null
          webhook_id: string
        }
        Insert: {
          event_type: string
          id?: string
          payload: Json
          processed_at?: string
          processing_ms?: number | null
          user_id?: string | null
          webhook_id: string
        }
        Update: {
          event_type?: string
          id?: string
          payload?: Json
          processed_at?: string
          processing_ms?: number | null
          user_id?: string | null
          webhook_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      attempt_proof_increment: { Args: { p_user_id: string }; Returns: boolean }
      increment_proofs_used: {
        Args: { user_id_input: string }
        Returns: undefined
      }
      reset_proofs_for_period: {
        Args: {
          p_current_period_end: string
          p_current_period_start: string
          p_polar_subscription_id: string
          p_user_id: string
        }
        Returns: undefined
      }
      rollback_proof_increment: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      sync_subscription: {
        Args: {
          p_cancel_at_period_end?: boolean
          p_canceled_at?: string
          p_current_period_end: string
          p_current_period_start: string
          p_plan: string
          p_polar_customer_id?: string
          p_polar_product_id: string
          p_polar_subscription_id: string
          p_proofs_limit: number
          p_status: string
          p_user_id: string
        }
        Returns: undefined
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
    Enums: {},
  },
} as const
