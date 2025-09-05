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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      benefits: {
        Row: {
          category: string | null
          id: number
          source_url: string | null
          summary: string | null
          title: string | null
        }
        Insert: {
          category?: string | null
          id?: number
          source_url?: string | null
          summary?: string | null
          title?: string | null
        }
        Update: {
          category?: string | null
          id?: number
          source_url?: string | null
          summary?: string | null
          title?: string | null
        }
        Relationships: []
      }
      bookmarks: {
        Row: {
          created_at: string | null
          id: number
          kind: string | null
          ref_id: number
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          kind?: string | null
          ref_id: number
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          kind?: string | null
          ref_id?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      buildings: {
        Row: {
          category: string | null
          code: string | null
          hours: Json | null
          id: number
          lat: number | null
          lng: number | null
          name: string
          search_tsv: unknown | null
        }
        Insert: {
          category?: string | null
          code?: string | null
          hours?: Json | null
          id?: number
          lat?: number | null
          lng?: number | null
          name: string
          search_tsv?: unknown | null
        }
        Update: {
          category?: string | null
          code?: string | null
          hours?: Json | null
          id?: number
          lat?: number | null
          lng?: number | null
          name?: string
          search_tsv?: unknown | null
        }
        Relationships: []
      }
      conversation_history: {
        Row: {
          content: string
          created_at: string
          id: number
          message_index: number
          metadata: Json | null
          role: string
          session_id: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: number
          message_index: number
          metadata?: Json | null
          role: string
          session_id: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: number
          message_index?: number
          metadata?: Json | null
          role?: string
          session_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      courses: {
        Row: {
          catalog_url: string | null
          code: string | null
          credits: number | null
          description: string | null
          id: number
          prereqs: string | null
          search_tsv: unknown | null
          title: string | null
        }
        Insert: {
          catalog_url?: string | null
          code?: string | null
          credits?: number | null
          description?: string | null
          id?: number
          prereqs?: string | null
          search_tsv?: unknown | null
          title?: string | null
        }
        Update: {
          catalog_url?: string | null
          code?: string | null
          credits?: number | null
          description?: string | null
          id?: number
          prereqs?: string | null
          search_tsv?: unknown | null
          title?: string | null
        }
        Relationships: []
      }
      deadlines: {
        Row: {
          end_time: string | null
          id: number
          name: string
          source_url: string | null
          start_time: string | null
          type: string | null
        }
        Insert: {
          end_time?: string | null
          id?: number
          name: string
          source_url?: string | null
          start_time?: string | null
          type?: string | null
        }
        Update: {
          end_time?: string | null
          id?: number
          name?: string
          source_url?: string | null
          start_time?: string | null
          type?: string | null
        }
        Relationships: []
      }
      dining_locations: {
        Row: {
          campus_area: string | null
          hours: Json | null
          id: number
          is_open: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          campus_area?: string | null
          hours?: Json | null
          id?: number
          is_open?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          campus_area?: string | null
          hours?: Json | null
          id?: number
          is_open?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string | null
          description: string | null
          end_time: string | null
          id: number
          location: string | null
          search_tsv: unknown | null
          source_url: string | null
          start_time: string
          tags: string[] | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          id?: number
          location?: string | null
          search_tsv?: unknown | null
          source_url?: string | null
          start_time: string
          tags?: string[] | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          id?: number
          location?: string | null
          search_tsv?: unknown | null
          source_url?: string | null
          start_time?: string
          tags?: string[] | null
          title?: string
        }
        Relationships: []
      }
      faculty: {
        Row: {
          dept: string | null
          email: string | null
          id: number
          name: string
          office: string | null
          office_hours: string | null
          phone: string | null
          profile_url: string | null
          research_areas: string[] | null
          search_tsv: unknown | null
          updated_at: string | null
        }
        Insert: {
          dept?: string | null
          email?: string | null
          id?: number
          name: string
          office?: string | null
          office_hours?: string | null
          phone?: string | null
          profile_url?: string | null
          research_areas?: string[] | null
          search_tsv?: unknown | null
          updated_at?: string | null
        }
        Update: {
          dept?: string | null
          email?: string | null
          id?: number
          name?: string
          office?: string | null
          office_hours?: string | null
          phone?: string | null
          profile_url?: string | null
          research_areas?: string[] | null
          search_tsv?: unknown | null
          updated_at?: string | null
        }
        Relationships: []
      }
      faq_templates: {
        Row: {
          answer: string
          category: string | null
          created_at: string
          id: number
          keywords: string[]
          priority: number | null
          question: string
        }
        Insert: {
          answer: string
          category?: string | null
          created_at?: string
          id?: number
          keywords: string[]
          priority?: number | null
          question: string
        }
        Update: {
          answer?: string
          category?: string | null
          created_at?: string
          id?: number
          keywords?: string[]
          priority?: number | null
          question?: string
        }
        Relationships: []
      }
      health_info: {
        Row: {
          category: string | null
          id: number
          source_url: string | null
          summary: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          id?: number
          source_url?: string | null
          summary?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          id?: number
          source_url?: string | null
          summary?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      housing_places: {
        Row: {
          address: string | null
          id: number
          last_seen: string | null
          lat: number | null
          lng: number | null
          name: string | null
          phone: string | null
          source: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          id?: number
          last_seen?: string | null
          lat?: number | null
          lng?: number | null
          name?: string | null
          phone?: string | null
          source?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          id?: number
          last_seen?: string | null
          lat?: number | null
          lng?: number | null
          name?: string | null
          phone?: string | null
          source?: string | null
          website?: string | null
        }
        Relationships: []
      }
      jobs: {
        Row: {
          apply_url: string | null
          dept: string | null
          id: number
          location: string | null
          posted_at: string | null
          source: string | null
          title: string | null
          type: string | null
        }
        Insert: {
          apply_url?: string | null
          dept?: string | null
          id?: number
          location?: string | null
          posted_at?: string | null
          source?: string | null
          title?: string | null
          type?: string | null
        }
        Update: {
          apply_url?: string | null
          dept?: string | null
          id?: number
          location?: string | null
          posted_at?: string | null
          source?: string | null
          title?: string | null
          type?: string | null
        }
        Relationships: []
      }
      menus: {
        Row: {
          created_at: string | null
          id: number
          items: Json
          location_id: number | null
          menu_date: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          items: Json
          location_id?: number | null
          menu_date: string
        }
        Update: {
          created_at?: string | null
          id?: number
          items?: Json
          location_id?: number | null
          menu_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "menus_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "dining_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      news: {
        Row: {
          category: string | null
          id: number
          published_at: string | null
          source_url: string | null
          summary: string | null
          title: string | null
        }
        Insert: {
          category?: string | null
          id?: number
          published_at?: string | null
          source_url?: string | null
          summary?: string | null
          title?: string | null
        }
        Update: {
          category?: string | null
          id?: number
          published_at?: string | null
          source_url?: string | null
          summary?: string | null
          title?: string | null
        }
        Relationships: []
      }
      organizations: {
        Row: {
          category: string | null
          contact_url: string | null
          description: string | null
          id: number
          name: string | null
        }
        Insert: {
          category?: string | null
          contact_url?: string | null
          description?: string | null
          id?: number
          name?: string | null
        }
        Update: {
          category?: string | null
          contact_url?: string | null
          description?: string | null
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      policies: {
        Row: {
          category: string | null
          id: number
          source_url: string | null
          summary: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          id?: number
          source_url?: string | null
          summary?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          id?: number
          source_url?: string | null
          summary?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          display_name: string | null
          id: string
          prefs: Json | null
          role: string | null
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          id: string
          prefs?: Json | null
          role?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          id?: string
          prefs?: Json | null
          role?: string | null
        }
        Relationships: []
      }
      programs: {
        Row: {
          catalog_url: string | null
          dept: string | null
          id: number
          level: string | null
          name: string
          overview: string | null
          search_tsv: unknown | null
        }
        Insert: {
          catalog_url?: string | null
          dept?: string | null
          id?: number
          level?: string | null
          name: string
          overview?: string | null
          search_tsv?: unknown | null
        }
        Update: {
          catalog_url?: string | null
          dept?: string | null
          id?: number
          level?: string | null
          name?: string
          overview?: string | null
          search_tsv?: unknown | null
        }
        Relationships: []
      }
      rec_schedules: {
        Row: {
          classes: Json | null
          facility: string | null
          hours: Json | null
          id: number
          source_url: string | null
        }
        Insert: {
          classes?: Json | null
          facility?: string | null
          hours?: Json | null
          id?: number
          source_url?: string | null
        }
        Update: {
          classes?: Json | null
          facility?: string | null
          hours?: Json | null
          id?: number
          source_url?: string | null
        }
        Relationships: []
      }
      response_cache: {
        Row: {
          category: string | null
          created_at: string
          expires_at: string
          hit_count: number | null
          id: number
          query_key: string
          response_data: Json
        }
        Insert: {
          category?: string | null
          created_at?: string
          expires_at: string
          hit_count?: number | null
          id?: number
          query_key: string
          response_data: Json
        }
        Update: {
          category?: string | null
          created_at?: string
          expires_at?: string
          hit_count?: number | null
          id?: number
          query_key?: string
          response_data?: Json
        }
        Relationships: []
      }
      rooms: {
        Row: {
          building_id: number | null
          capacity: number | null
          features: string[] | null
          id: number
          room_number: string | null
        }
        Insert: {
          building_id?: number | null
          capacity?: number | null
          features?: string[] | null
          id?: number
          room_number?: string | null
        }
        Update: {
          building_id?: number | null
          capacity?: number | null
          features?: string[] | null
          id?: number
          room_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rooms_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
        ]
      }
      tuition: {
        Row: {
          effective_term: string | null
          fees: Json | null
          flat_rate: number | null
          id: number
          per_credit: number | null
          program: string | null
          residency: string | null
          source_url: string | null
        }
        Insert: {
          effective_term?: string | null
          fees?: Json | null
          flat_rate?: number | null
          id?: number
          per_credit?: number | null
          program?: string | null
          residency?: string | null
          source_url?: string | null
        }
        Update: {
          effective_term?: string | null
          fees?: Json | null
          flat_rate?: number | null
          id?: number
          per_credit?: number | null
          program?: string | null
          residency?: string | null
          source_url?: string | null
        }
        Relationships: []
      }
      user_plans: {
        Row: {
          created_at: string | null
          day: string
          id: number
          items: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          day: string
          id?: number
          items?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          day?: string
          id?: number
          items?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_plans_user_id_fkey"
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
      clean_expired_cache: {
        Args: Record<PropertyKey, never>
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
