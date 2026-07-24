export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string
          entity_type: string
          id: number
          metadata: Json
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id: string
          entity_type: string
          id?: never
          metadata?: Json
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: never
          metadata?: Json
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      installments: {
        Row: {
          created_at: string
          due_date: string
          id: string
          installment_number: number
          interest_amount: number
          loan_id: string
          paid_at: string | null
          principal_amount: number
          status: Database["public"]["Enums"]["installment_status"]
          total_amount: number
        }
        Insert: {
          created_at?: string
          due_date: string
          id?: string
          installment_number: number
          interest_amount: number
          loan_id: string
          paid_at?: string | null
          principal_amount: number
          status?: Database["public"]["Enums"]["installment_status"]
          total_amount: number
        }
        Update: {
          created_at?: string
          due_date?: string
          id?: string
          installment_number?: number
          interest_amount?: number
          loan_id?: string
          paid_at?: string | null
          principal_amount?: number
          status?: Database["public"]["Enums"]["installment_status"]
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "installments_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loans"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_proposals: {
        Row: {
          amount: number
          created_at: string
          expires_at: string | null
          first_due_date: string
          id: string
          installment_count: number
          interest_calculation: Database["public"]["Enums"]["interest_calculation"]
          interest_rate: number
          loan_request_id: string
          message: string | null
          parent_proposal_id: string | null
          proposed_by: string
          status: Database["public"]["Enums"]["loan_proposal_status"]
        }
        Insert: {
          amount: number
          created_at?: string
          expires_at?: string | null
          first_due_date: string
          id?: string
          installment_count: number
          interest_calculation?: Database["public"]["Enums"]["interest_calculation"]
          interest_rate: number
          loan_request_id: string
          message?: string | null
          parent_proposal_id?: string | null
          proposed_by: string
          status?: Database["public"]["Enums"]["loan_proposal_status"]
        }
        Update: {
          amount?: number
          created_at?: string
          expires_at?: string | null
          first_due_date?: string
          id?: string
          installment_count?: number
          interest_calculation?: Database["public"]["Enums"]["interest_calculation"]
          interest_rate?: number
          loan_request_id?: string
          message?: string | null
          parent_proposal_id?: string | null
          proposed_by?: string
          status?: Database["public"]["Enums"]["loan_proposal_status"]
        }
        Relationships: [
          {
            foreignKeyName: "loan_proposals_loan_request_id_fkey"
            columns: ["loan_request_id"]
            isOneToOne: false
            referencedRelation: "loan_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loan_proposals_parent_proposal_id_fkey"
            columns: ["parent_proposal_id"]
            isOneToOne: false
            referencedRelation: "loan_proposals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loan_proposals_proposed_by_fkey"
            columns: ["proposed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_requests: {
        Row: {
          borrower_id: string
          cancelled_at: string | null
          created_at: string
          id: string
          lender_id: string
          message: string | null
          requested_amount: number
          status: Database["public"]["Enums"]["loan_request_status"]
          updated_at: string
        }
        Insert: {
          borrower_id: string
          cancelled_at?: string | null
          created_at?: string
          id?: string
          lender_id: string
          message?: string | null
          requested_amount: number
          status?: Database["public"]["Enums"]["loan_request_status"]
          updated_at?: string
        }
        Update: {
          borrower_id?: string
          cancelled_at?: string | null
          created_at?: string
          id?: string
          lender_id?: string
          message?: string | null
          requested_amount?: number
          status?: Database["public"]["Enums"]["loan_request_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "loan_requests_borrower_id_fkey"
            columns: ["borrower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loan_requests_lender_id_fkey"
            columns: ["lender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      loans: {
        Row: {
          accepted_proposal_id: string
          activated_at: string
          borrower_id: string
          created_at: string
          first_due_date: string
          id: string
          installment_count: number
          interest_calculation: Database["public"]["Enums"]["interest_calculation"]
          interest_rate: number
          lender_id: string
          loan_request_id: string
          paid_at: string | null
          principal_amount: number
          status: Database["public"]["Enums"]["loan_status"]
          total_amount: number
        }
        Insert: {
          accepted_proposal_id: string
          activated_at?: string
          borrower_id: string
          created_at?: string
          first_due_date: string
          id?: string
          installment_count: number
          interest_calculation: Database["public"]["Enums"]["interest_calculation"]
          interest_rate: number
          lender_id: string
          loan_request_id: string
          paid_at?: string | null
          principal_amount: number
          status?: Database["public"]["Enums"]["loan_status"]
          total_amount: number
        }
        Update: {
          accepted_proposal_id?: string
          activated_at?: string
          borrower_id?: string
          created_at?: string
          first_due_date?: string
          id?: string
          installment_count?: number
          interest_calculation?: Database["public"]["Enums"]["interest_calculation"]
          interest_rate?: number
          lender_id?: string
          loan_request_id?: string
          paid_at?: string | null
          principal_amount?: number
          status?: Database["public"]["Enums"]["loan_status"]
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "loans_accepted_proposal_id_fkey"
            columns: ["accepted_proposal_id"]
            isOneToOne: true
            referencedRelation: "loan_proposals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loans_borrower_id_fkey"
            columns: ["borrower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loans_lender_id_fkey"
            columns: ["lender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loans_loan_request_id_fkey"
            columns: ["loan_request_id"]
            isOneToOne: true
            referencedRelation: "loan_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read_at: string | null
          recipient_id: string
          resource_id: string | null
          resource_type: string | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read_at?: string | null
          recipient_id: string
          resource_id?: string | null
          resource_type?: string | null
          title: string
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read_at?: string | null
          recipient_id?: string
          resource_id?: string | null
          resource_type?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string
          id: string
          installment_id: string
          notes: string | null
          paid_at: string
          reported_by: string
          status: Database["public"]["Enums"]["payment_status"]
        }
        Insert: {
          amount: number
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          id?: string
          installment_id: string
          notes?: string | null
          paid_at: string
          reported_by: string
          status?: Database["public"]["Enums"]["payment_status"]
        }
        Update: {
          amount?: number
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          id?: string
          installment_id?: string
          notes?: string | null
          paid_at?: string
          reported_by?: string
          status?: Database["public"]["Enums"]["payment_status"]
        }
        Relationships: [
          {
            foreignKeyName: "payments_confirmed_by_fkey"
            columns: ["confirmed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_installment_id_fkey"
            columns: ["installment_id"]
            isOneToOne: false
            referencedRelation: "installments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string
          id: string
          is_active: boolean
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name: string
          id: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string
          id?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_role: "user" | "admin"
      installment_status: "pending" | "paid" | "overdue" | "cancelled"
      interest_calculation: "simple" | "compound"
      loan_proposal_status:
        | "pending"
        | "accepted"
        | "rejected"
        | "withdrawn"
        | "superseded"
        | "expired"
      loan_request_status:
        | "pending"
        | "negotiating"
        | "accepted"
        | "rejected"
        | "cancelled"
      loan_status: "active" | "paid" | "overdue" | "cancelled"
      payment_status: "reported" | "confirmed" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
