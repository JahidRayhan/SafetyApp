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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action_type: string
          created_at: string
          description: string
          id: string
          ip_address: unknown
          metadata: Json | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          description: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          description?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      admin_approvals: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          id: string
          rejection_reason: string | null
          requested_by_email: string
          requested_role: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          rejection_reason?: string | null
          requested_by_email: string
          requested_role: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          rejection_reason?: string | null
          requested_by_email?: string
          requested_role?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_requests: {
        Row: {
          admin_id: string
          created_at: string
          description: string | null
          id: string
          request_data: Json | null
          request_type: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          target_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          admin_id: string
          created_at?: string
          description?: string | null
          id?: string
          request_data?: Json | null
          request_type: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          target_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          admin_id?: string
          created_at?: string
          description?: string | null
          id?: string
          request_data?: Json | null
          request_type?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          target_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          conversation_id: string | null
          created_at: string
          id: string
          message: string
          response: string | null
          user_id: string
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string
          id?: string
          message: string
          response?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string | null
          created_at?: string
          id?: string
          message?: string
          response?: string | null
          user_id?: string
        }
        Relationships: []
      }
      danger_reports: {
        Row: {
          danger_type: string
          description: string | null
          id: string
          location_lat: number
          location_lng: number
          reported_at: string | null
          severity_level: number | null
          status: string | null
          user_id: string
          verified: boolean | null
          verified_by: string | null
        }
        Insert: {
          danger_type: string
          description?: string | null
          id?: string
          location_lat: number
          location_lng: number
          reported_at?: string | null
          severity_level?: number | null
          status?: string | null
          user_id: string
          verified?: boolean | null
          verified_by?: string | null
        }
        Update: {
          danger_type?: string
          description?: string | null
          id?: string
          location_lat?: number
          location_lng?: number
          reported_at?: string | null
          severity_level?: number | null
          status?: string | null
          user_id?: string
          verified?: boolean | null
          verified_by?: string | null
        }
        Relationships: []
      }
      emergency_contacts: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string
          priority: number | null
          relationship: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone: string
          priority?: number | null
          relationship?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string
          priority?: number | null
          relationship?: string | null
          user_id?: string
        }
        Relationships: []
      }
      emergency_incidents: {
        Row: {
          id: string
          location_accuracy: number | null
          location_lat: number | null
          location_lng: number | null
          notes: string | null
          resolved_at: string | null
          status: string
          triggered_at: string
          user_id: string
        }
        Insert: {
          id?: string
          location_accuracy?: number | null
          location_lat?: number | null
          location_lng?: number | null
          notes?: string | null
          resolved_at?: string | null
          status?: string
          triggered_at?: string
          user_id: string
        }
        Update: {
          id?: string
          location_accuracy?: number | null
          location_lat?: number | null
          location_lng?: number | null
          notes?: string | null
          resolved_at?: string | null
          status?: string
          triggered_at?: string
          user_id?: string
        }
        Relationships: []
      }
      fake_call_schedules: {
        Row: {
          contact_name: string
          contact_number: string
          created_at: string | null
          id: string
          is_active: boolean | null
          is_instant: boolean | null
          scheduled_time: string | null
          user_id: string
        }
        Insert: {
          contact_name: string
          contact_number: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_instant?: boolean | null
          scheduled_time?: string | null
          user_id: string
        }
        Update: {
          contact_name?: string
          contact_number?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_instant?: boolean | null
          scheduled_time?: string | null
          user_id?: string
        }
        Relationships: []
      }
      government_requests: {
        Row: {
          created_at: string
          description: string | null
          government_admin_id: string
          handled_at: string | null
          handled_by: string | null
          id: string
          request_data: Json | null
          request_type: string
          response_data: Json | null
          status: string
          target_user_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          government_admin_id: string
          handled_at?: string | null
          handled_by?: string | null
          id?: string
          request_data?: Json | null
          request_type: string
          response_data?: Json | null
          status?: string
          target_user_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          government_admin_id?: string
          handled_at?: string | null
          handled_by?: string | null
          id?: string
          request_data?: Json | null
          request_type?: string
          response_data?: Json | null
          status?: string
          target_user_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      incident_reports: {
        Row: {
          description: string | null
          id: string
          incident_type: string
          is_anonymous: boolean | null
          location_description: string | null
          location_lat: number | null
          location_lng: number | null
          media_files: Json | null
          reported_at: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          severity_level: number | null
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          incident_type: string
          is_anonymous?: boolean | null
          location_description?: string | null
          location_lat?: number | null
          location_lng?: number | null
          media_files?: Json | null
          reported_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          severity_level?: number | null
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          incident_type?: string
          is_anonymous?: boolean | null
          location_description?: string | null
          location_lat?: number | null
          location_lng?: number | null
          media_files?: Json | null
          reported_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          severity_level?: number | null
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_private: boolean | null
          mood_rating: number | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_private?: boolean | null
          mood_rating?: number | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_private?: boolean | null
          mood_rating?: number | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      live_location_sessions: {
        Row: {
          contacts_notified: number
          created_at: string
          ended_at: string | null
          expires_at: string
          id: string
          incident_id: string | null
          last_accuracy: number | null
          last_lat: number | null
          last_lng: number | null
          last_updated_at: string | null
          started_at: string
          status: string
          updated_at: string
          updates_sent: number
          user_id: string
        }
        Insert: {
          contacts_notified?: number
          created_at?: string
          ended_at?: string | null
          expires_at: string
          id?: string
          incident_id?: string | null
          last_accuracy?: number | null
          last_lat?: number | null
          last_lng?: number | null
          last_updated_at?: string | null
          started_at?: string
          status?: string
          updated_at?: string
          updates_sent?: number
          user_id: string
        }
        Update: {
          contacts_notified?: number
          created_at?: string
          ended_at?: string | null
          expires_at?: string
          id?: string
          incident_id?: string | null
          last_accuracy?: number | null
          last_lat?: number | null
          last_lng?: number | null
          last_updated_at?: string | null
          started_at?: string
          status?: string
          updated_at?: string
          updates_sent?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_location_sessions_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "emergency_incidents"
            referencedColumns: ["id"]
          },
        ]
      }
      location_history: {
        Row: {
          accuracy: number | null
          id: string
          lat: number
          lng: number
          recorded_at: string
          user_id: string
        }
        Insert: {
          accuracy?: number | null
          id?: string
          lat: number
          lng: number
          recorded_at?: string
          user_id: string
        }
        Update: {
          accuracy?: number | null
          id?: string
          lat?: number
          lng?: number
          recorded_at?: string
          user_id?: string
        }
        Relationships: []
      }
      meditation_sessions: {
        Row: {
          audio_url: string | null
          category: string
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty_level: string | null
          duration_minutes: number
          id: string
          is_featured: boolean | null
          title: string
        }
        Insert: {
          audio_url?: string | null
          category: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: string | null
          duration_minutes: number
          id?: string
          is_featured?: boolean | null
          title: string
        }
        Update: {
          audio_url?: string | null
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: string | null
          duration_minutes?: number
          id?: string
          is_featured?: boolean | null
          title?: string
        }
        Relationships: []
      }
      personal_stories: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          author_name: string | null
          content: string
          created_at: string | null
          id: string
          is_anonymous: boolean | null
          likes_count: number | null
          status: string | null
          story_type: string
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          author_name?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          likes_count?: number | null
          status?: string | null
          story_type: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          author_name?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          likes_count?: number | null
          status?: string | null
          story_type?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          emergency_plan: string | null
          full_name: string | null
          id: string
          location_permissions_granted: boolean | null
          phone_number: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          sos_gesture_enabled: boolean | null
          updated_at: string
          voice_monitoring_enabled: boolean | null
        }
        Insert: {
          created_at?: string
          emergency_plan?: string | null
          full_name?: string | null
          id: string
          location_permissions_granted?: boolean | null
          phone_number?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          sos_gesture_enabled?: boolean | null
          updated_at?: string
          voice_monitoring_enabled?: boolean | null
        }
        Update: {
          created_at?: string
          emergency_plan?: string | null
          full_name?: string | null
          id?: string
          location_permissions_granted?: boolean | null
          phone_number?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          sos_gesture_enabled?: boolean | null
          updated_at?: string
          voice_monitoring_enabled?: boolean | null
        }
        Relationships: []
      }
      recordings: {
        Row: {
          duration_seconds: number | null
          file_path: string
          file_size: number | null
          file_type: string
          id: string
          incident_id: string
          recorded_at: string
          user_id: string
        }
        Insert: {
          duration_seconds?: number | null
          file_path: string
          file_size?: number | null
          file_type: string
          id?: string
          incident_id: string
          recorded_at?: string
          user_id: string
        }
        Update: {
          duration_seconds?: number | null
          file_path?: string
          file_size?: number | null
          file_type?: string
          id?: string
          incident_id?: string
          recorded_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recordings_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "emergency_incidents"
            referencedColumns: ["id"]
          },
        ]
      }
      safe_zones: {
        Row: {
          center_lat: number
          center_lng: number
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          radius_meters: number
          updated_at: string | null
          zone_type: string | null
        }
        Insert: {
          center_lat: number
          center_lng: number
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          radius_meters: number
          updated_at?: string | null
          zone_type?: string | null
        }
        Update: {
          center_lat?: number
          center_lng?: number
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          radius_meters?: number
          updated_at?: string | null
          zone_type?: string | null
        }
        Relationships: []
      }
      safety_resources: {
        Row: {
          address: string | null
          category: string
          created_at: string | null
          email: string | null
          id: string
          is_24_7: boolean | null
          location_lat: number | null
          location_lng: number | null
          name: string
          phone_number: string | null
        }
        Insert: {
          address?: string | null
          category: string
          created_at?: string | null
          email?: string | null
          id?: string
          is_24_7?: boolean | null
          location_lat?: number | null
          location_lng?: number | null
          name: string
          phone_number?: string | null
        }
        Update: {
          address?: string | null
          category?: string
          created_at?: string | null
          email?: string | null
          id?: string
          is_24_7?: boolean | null
          location_lat?: number | null
          location_lng?: number | null
          name?: string
          phone_number?: string | null
        }
        Relationships: []
      }
      sos_alert_deliveries: {
        Row: {
          attempt_number: number
          attempted_at: string
          channel: string
          contact_id: string | null
          created_at: string
          delivery_status: string
          error_message: string | null
          id: string
          incident_id: string
          provider_message_id: string | null
          recipient_email: string | null
          recipient_phone: string | null
          resent_from_delivery_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          attempt_number?: number
          attempted_at?: string
          channel?: string
          contact_id?: string | null
          created_at?: string
          delivery_status?: string
          error_message?: string | null
          id?: string
          incident_id: string
          provider_message_id?: string | null
          recipient_email?: string | null
          recipient_phone?: string | null
          resent_from_delivery_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          attempt_number?: number
          attempted_at?: string
          channel?: string
          contact_id?: string | null
          created_at?: string
          delivery_status?: string
          error_message?: string | null
          id?: string
          incident_id?: string
          provider_message_id?: string | null
          recipient_email?: string | null
          recipient_phone?: string | null
          resent_from_delivery_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      story_likes: {
        Row: {
          created_at: string | null
          id: string
          story_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          story_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          story_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_likes_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "personal_stories"
            referencedColumns: ["id"]
          },
        ]
      }
      support_articles: {
        Row: {
          author: string | null
          category: string
          content: string
          created_at: string | null
          created_by: string | null
          excerpt: string | null
          id: string
          is_featured: boolean | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author?: string | null
          category: string
          content: string
          created_at?: string | null
          created_by?: string | null
          excerpt?: string | null
          id?: string
          is_featured?: boolean | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author?: string | null
          category?: string
          content?: string
          created_at?: string | null
          created_by?: string | null
          excerpt?: string | null
          id?: string
          is_featured?: boolean | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      support_content: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          category: string
          content_type: string
          created_at: string
          description: string | null
          file_url: string | null
          id: string
          is_official: boolean | null
          status: string
          tags: string[] | null
          title: string
          updated_at: string
          uploaded_by: string
          visibility: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          category: string
          content_type: string
          created_at?: string
          description?: string | null
          file_url?: string | null
          id?: string
          is_official?: boolean | null
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          uploaded_by: string
          visibility?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          category?: string
          content_type?: string
          created_at?: string
          description?: string | null
          file_url?: string | null
          id?: string
          is_official?: boolean | null
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          uploaded_by?: string
          visibility?: string
        }
        Relationships: []
      }
    }
    Views: {
      incident_reports_public: {
        Row: {
          description: string | null
          id: string | null
          incident_type: string | null
          is_anonymous: boolean | null
          location_description: string | null
          location_lat: number | null
          location_lng: number | null
          media_files: Json | null
          reported_at: string | null
          reviewed_at: string | null
          severity_level: number | null
          status: string | null
          tags: string[] | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          description?: string | null
          id?: string | null
          incident_type?: string | null
          is_anonymous?: boolean | null
          location_description?: string | null
          location_lat?: number | null
          location_lng?: number | null
          media_files?: Json | null
          reported_at?: string | null
          reviewed_at?: string | null
          severity_level?: number | null
          status?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          description?: string | null
          id?: string | null
          incident_type?: string | null
          is_anonymous?: boolean | null
          location_description?: string | null
          location_lat?: number | null
          location_lng?: number | null
          media_files?: Json | null
          reported_at?: string | null
          reviewed_at?: string | null
          severity_level?: number | null
          status?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      can_view_all_profiles: { Args: { _user_id: string }; Returns: boolean }
      create_admin_approval_request: {
        Args: {
          requested_by_email_input: string
          requested_role_input: string
          user_id: string
        }
        Returns: undefined
      }
      decrement_story_likes: { Args: { story_id: string }; Returns: undefined }
      get_admin_approvals_list: {
        Args: never
        Returns: {
          approved_at: string
          approved_by: string
          created_at: string
          id: string
          rejection_reason: string
          requested_by_email: string
          requested_role: string
          status: string
          user_id: string
        }[]
      }
      get_public_stories: {
        Args: never
        Returns: {
          approved_at: string
          approved_by: string
          author_name: string
          content: string
          created_at: string
          id: string
          is_anonymous: boolean
          likes_count: number
          status: string
          story_type: string
          tags: string[]
          title: string
          updated_at: string
          user_id: string
        }[]
      }
      handle_admin_approval: {
        Args: {
          action: string
          approval_id: string
          approved_by_id: string
          rejection_reason?: string
        }
        Returns: undefined
      }
      increment_story_likes: { Args: { story_id: string }; Returns: undefined }
    }
    Enums: {
      user_role: "user" | "admin" | "govt_admin"
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
      user_role: ["user", "admin", "govt_admin"],
    },
  },
} as const
