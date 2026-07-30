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
          first_due_date: string
          id: string
          installment_count: number
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
          first_due_date: string
          id?: string
          installment_count: number
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
          first_due_date?: string
          id?: string
          installment_count?: number
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
      payment_proofs: {
        Row: {
          attached_at: string | null
          created_at: string
          etag: string | null
          expires_at: string
          id: string
          installment_id: string
          mime_type: string
          object_key: string
          original_filename: string
          payment_id: string | null
          size_bytes: number
          status: Database["public"]["Enums"]["payment_proof_status"]
          updated_at: string
          uploaded_at: string | null
          uploaded_by: string
        }
        Insert: {
          attached_at?: string | null
          created_at?: string
          etag?: string | null
          expires_at?: string
          id?: string
          installment_id: string
          mime_type: string
          object_key: string
          original_filename: string
          payment_id?: string | null
          size_bytes: number
          status?: Database["public"]["Enums"]["payment_proof_status"]
          updated_at?: string
          uploaded_at?: string | null
          uploaded_by: string
        }
        Update: {
          attached_at?: string | null
          created_at?: string
          etag?: string | null
          expires_at?: string
          id?: string
          installment_id?: string
          mime_type?: string
          object_key?: string
          original_filename?: string
          payment_id?: string | null
          size_bytes?: number
          status?: Database["public"]["Enums"]["payment_proof_status"]
          updated_at?: string
          uploaded_at?: string | null
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_proofs_installment_id_fkey"
            columns: ["installment_id"]
            isOneToOne: false
            referencedRelation: "installments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_proofs_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: true
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_proofs_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string
          id: string
          is_active: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name: string
          id: string
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_loan_proposal: {
        Args: { p_proposal_id: string }
        Returns: {
          accepted_proposal_id: string
          activated_at: string
          borrower_id: string
          created_at: string
          first_due_date: string
          id: string
          installment_count: number
          interest_rate: number
          lender_id: string
          loan_request_id: string
          paid_at: string | null
          principal_amount: number
          status: Database["public"]["Enums"]["loan_status"]
          total_amount: number
        }
        SetofOptions: {
          from: "*"
          to: "loans"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      accept_loan_request: {
        Args: { p_request_id: string }
        Returns: {
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
        SetofOptions: {
          from: "*"
          to: "loan_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      confirm_installment_payment: {
        Args: { p_payment_id: string }
        Returns: {
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
        SetofOptions: {
          from: "*"
          to: "payments"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_loan_proposal: {
        Args: {
          p_amount: number
          p_first_due_date: string
          p_installment_count: number
          p_interest_rate: number
          p_loan_request_id: string
          p_message: string
          p_parent_proposal_id?: string
        }
        Returns: {
          amount: number
          created_at: string
          first_due_date: string
          id: string
          installment_count: number
          interest_rate: number
          loan_request_id: string
          message: string | null
          parent_proposal_id: string | null
          proposed_by: string
          status: Database["public"]["Enums"]["loan_proposal_status"]
        }
        SetofOptions: {
          from: "*"
          to: "loan_proposals"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_payment_proof_upload: {
        Args: {
          p_installment_id: string
          p_mime_type: string
          p_original_filename: string
          p_size_bytes: number
        }
        Returns: {
          attached_at: string | null
          created_at: string
          etag: string | null
          expires_at: string
          id: string
          installment_id: string
          mime_type: string
          object_key: string
          original_filename: string
          payment_id: string | null
          size_bytes: number
          status: Database["public"]["Enums"]["payment_proof_status"]
          updated_at: string
          uploaded_at: string | null
          uploaded_by: string
        }
        SetofOptions: {
          from: "*"
          to: "payment_proofs"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      mark_payment_proof_uploaded: {
        Args: { p_etag: string; p_proof_id: string }
        Returns: {
          attached_at: string | null
          created_at: string
          etag: string | null
          expires_at: string
          id: string
          installment_id: string
          mime_type: string
          object_key: string
          original_filename: string
          payment_id: string | null
          size_bytes: number
          status: Database["public"]["Enums"]["payment_proof_status"]
          updated_at: string
          uploaded_at: string | null
          uploaded_by: string
        }
        SetofOptions: {
          from: "*"
          to: "payment_proofs"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      record_installment_payment: {
        Args: {
          p_installment_id: string
          p_paid_at: string
          p_proof_id?: string
        }
        Returns: {
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
        SetofOptions: {
          from: "*"
          to: "payments"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      reject_installment_payment: {
        Args: { p_payment_id: string }
        Returns: {
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
        SetofOptions: {
          from: "*"
          to: "payments"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      reject_loan_proposal: {
        Args: { p_proposal_id: string }
        Returns: {
          amount: number
          created_at: string
          first_due_date: string
          id: string
          installment_count: number
          interest_rate: number
          loan_request_id: string
          message: string | null
          parent_proposal_id: string | null
          proposed_by: string
          status: Database["public"]["Enums"]["loan_proposal_status"]
        }
        SetofOptions: {
          from: "*"
          to: "loan_proposals"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      reject_loan_request: {
        Args: { p_request_id: string }
        Returns: {
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
        SetofOptions: {
          from: "*"
          to: "loan_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      report_installment_payment: {
        Args: {
          p_installment_id: string
          p_paid_at: string
          p_proof_id?: string
        }
        Returns: {
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
        SetofOptions: {
          from: "*"
          to: "payments"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      withdraw_loan_proposal: {
        Args: { p_proposal_id: string }
        Returns: {
          amount: number
          created_at: string
          first_due_date: string
          id: string
          installment_count: number
          interest_rate: number
          loan_request_id: string
          message: string | null
          parent_proposal_id: string | null
          proposed_by: string
          status: Database["public"]["Enums"]["loan_proposal_status"]
        }
        SetofOptions: {
          from: "*"
          to: "loan_proposals"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      installment_status: "pending" | "paid" | "overdue" | "cancelled"
      loan_proposal_status:
        | "pending"
        | "accepted"
        | "rejected"
        | "withdrawn"
        | "superseded"
      loan_request_status:
        | "pending"
        | "accepted"
        | "rejected"
        | "cancelled"
      loan_status: "active" | "paid" | "overdue" | "cancelled"
      payment_proof_status: "pending" | "uploaded" | "attached"
      payment_status: "reported" | "confirmed" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
