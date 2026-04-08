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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      checklists: {
        Row: {
          checklist_type: string
          checks: Json
          created_at: string
          driver_name: string
          id: string
          km: string
          observations: string | null
          photo_urls: string[] | null
          problem_count: number
          reservation_id: string | null
          signature_url: string | null
          user_id: string | null
          vehicle_model: string
          vehicle_plate: string
        }
        Insert: {
          checklist_type?: string
          checks: Json
          created_at?: string
          driver_name: string
          id?: string
          km: string
          observations?: string | null
          photo_urls?: string[] | null
          problem_count?: number
          reservation_id?: string | null
          signature_url?: string | null
          user_id?: string | null
          vehicle_model: string
          vehicle_plate: string
        }
        Update: {
          checklist_type?: string
          checks?: Json
          created_at?: string
          driver_name?: string
          id?: string
          km?: string
          observations?: string | null
          photo_urls?: string[] | null
          problem_count?: number
          reservation_id?: string | null
          signature_url?: string | null
          user_id?: string | null
          vehicle_model?: string
          vehicle_plate?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklists_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      collaborator_manager: {
        Row: {
          collaborator_user_id: string
          created_at: string
          id: string
          manager_id: string
        }
        Insert: {
          collaborator_user_id: string
          created_at?: string
          id?: string
          manager_id: string
        }
        Update: {
          collaborator_user_id?: string
          created_at?: string
          id?: string
          manager_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collaborator_manager_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "managers"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          cnh: string
          cnh_category: string
          cnh_expiry: string
          created_at: string
          id: string
          name: string
          phone: string
          status: string
          user_id: string
        }
        Insert: {
          cnh: string
          cnh_category?: string
          cnh_expiry: string
          created_at?: string
          id?: string
          name: string
          phone?: string
          status?: string
          user_id: string
        }
        Update: {
          cnh?: string
          cnh_category?: string
          cnh_expiry?: string
          created_at?: string
          id?: string
          name?: string
          phone?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      maintenances: {
        Row: {
          cost: number
          created_at: string
          date: string
          description: string
          id: string
          status: string
          type: string
          user_id: string
          vehicle_id: string
          vehicle_plate: string
        }
        Insert: {
          cost?: number
          created_at?: string
          date: string
          description?: string
          id?: string
          status?: string
          type: string
          user_id: string
          vehicle_id: string
          vehicle_plate: string
        }
        Update: {
          cost?: number
          created_at?: string
          date?: string
          description?: string
          id?: string
          status?: string
          type?: string
          user_id?: string
          vehicle_id?: string
          vehicle_plate?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenances_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      managers: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          checklist_id: string | null
          created_at: string
          id: string
          is_read: boolean
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          checklist_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          checklist_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "checklists"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      reservations: {
        Row: {
          admin_notes: string | null
          created_at: string
          end_date: string
          id: string
          reason: string
          start_date: string
          status: string
          updated_at: string
          user_id: string
          vehicle_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          end_date: string
          id?: string
          reason?: string
          start_date: string
          status?: string
          updated_at?: string
          user_id: string
          vehicle_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          end_date?: string
          id?: string
          reason?: string
          start_date?: string
          status?: string
          updated_at?: string
          user_id?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          created_at: string
          id: string
          km: number
          last_oil_change: string | null
          model: string
          next_oil_change: number | null
          plate: string
          status: string
          user_id: string
          year: number
        }
        Insert: {
          created_at?: string
          id?: string
          km?: number
          last_oil_change?: string | null
          model: string
          next_oil_change?: number | null
          plate: string
          status?: string
          user_id: string
          year: number
        }
        Update: {
          created_at?: string
          id?: string
          km?: number
          last_oil_change?: string | null
          model?: string
          next_oil_change?: number | null
          plate?: string
          status?: string
          user_id?: string
          year?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "operador"
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
      app_role: ["admin", "operador"],
    },
  },
} as const
