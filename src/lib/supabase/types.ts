/**
 * Supabase Database schema definitions for E-Waste Value Recovery.
 * Includes complete models for the Provider Directory foundation with Row Level Security.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type OrganisationType =
  | "authorised_recycler"
  | "commercial_refurbisher"
  | "non_profit_charity"
  | "repair_service"
  | "retailer_oem"
  | "component_salvager";

export type VerificationStatus = "verified" | "partially_verified" | "unverified";

export type ApprovalStatus = "approved" | "pending_review" | "rejected";

export type QuoteType = "confirmed_quote" | "indicative_estimate" | "quote_required";

export type ServiceType =
  | "repair"
  | "cash_buyback"
  | "exchange"
  | "donation_reuse"
  | "component_recovery"
  | "recycling";

export type ServiceAreaType = "pincode" | "city" | "state_region" | "national";

export interface Database {
  public: {
    Tables: {
      providers: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          organisation_type: OrganisationType;
          website_url: string | null;
          source_evidence_url: string | null;
          evidence_notes: string | null;
          verification_status: VerificationStatus;
          approval_status: ApprovalStatus;
          quote_type: QuoteType;
          offers_pickup: boolean;
          offers_dropoff: boolean;
          pickup_details: string | null;
          dropoff_details: string | null;
          minimum_quantity: number | null;
          eligibility_restrictions: string | null;
          last_checked_at: string | null;
          is_sample_data: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          organisation_type: OrganisationType;
          website_url?: string | null;
          source_evidence_url?: string | null;
          evidence_notes?: string | null;
          verification_status?: VerificationStatus;
          approval_status?: ApprovalStatus;
          quote_type?: QuoteType;
          offers_pickup?: boolean;
          offers_dropoff?: boolean;
          pickup_details?: string | null;
          dropoff_details?: string | null;
          minimum_quantity?: number | null;
          eligibility_restrictions?: string | null;
          last_checked_at?: string | null;
          is_sample_data?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          organisation_type?: OrganisationType;
          website_url?: string | null;
          source_evidence_url?: string | null;
          evidence_notes?: string | null;
          verification_status?: VerificationStatus;
          approval_status?: ApprovalStatus;
          quote_type?: QuoteType;
          offers_pickup?: boolean;
          offers_dropoff?: boolean;
          pickup_details?: string | null;
          dropoff_details?: string | null;
          minimum_quantity?: number | null;
          eligibility_restrictions?: string | null;
          last_checked_at?: string | null;
          is_sample_data?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      provider_services: {
        Row: {
          id: string;
          provider_id: string;
          service_type: ServiceType;
          service_description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          provider_id: string;
          service_type: ServiceType;
          service_description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          provider_id?: string;
          service_type?: ServiceType;
          service_description?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      provider_accepted_categories: {
        Row: {
          id: string;
          provider_id: string;
          category_slug: string;
          accepted_conditions: string[];
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          provider_id: string;
          category_slug: string;
          accepted_conditions?: string[];
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          provider_id?: string;
          category_slug?: string;
          accepted_conditions?: string[];
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      provider_service_areas: {
        Row: {
          id: string;
          provider_id: string;
          area_type: ServiceAreaType;
          location_code: string | null;
          location_name: string;
          supports_pickup: boolean;
          supports_dropoff: boolean;
          dropoff_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          provider_id: string;
          area_type: ServiceAreaType;
          location_code?: string | null;
          location_name: string;
          supports_pickup?: boolean;
          supports_dropoff?: boolean;
          dropoff_address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          provider_id?: string;
          area_type?: ServiceAreaType;
          location_code?: string | null;
          location_name?: string;
          supports_pickup?: boolean;
          supports_dropoff?: boolean;
          dropoff_address?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      comparison_outcomes: {
        Row: {
          id: string;
          category_slug: string;
          condition: string;
          priority: string;
          recommended_pathway_id: string;
          selected_action: string;
          pincode_prefix: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          category_slug: string;
          condition: string;
          priority: string;
          recommended_pathway_id: string;
          selected_action: string;
          pincode_prefix?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          category_slug?: string;
          condition?: string;
          priority?: string;
          recommended_pathway_id?: string;
          selected_action?: string;
          pincode_prefix?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      provider_service_categories: {
        Row: {
          id: string;
          provider_service_id: string;
          category_slug: string;
          accepted_conditions: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          provider_service_id: string;
          category_slug: string;
          accepted_conditions?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          provider_service_id?: string;
          category_slug?: string;
          accepted_conditions?: string[];
          created_at?: string;
        };
        Relationships: [];
      };
      saved_assessments: {
        Row: {
          id: string;
          session_id: string;
          user_id: string | null;
          category_slug: string;
          device_model: string | null;
          condition: string;
          specific_fault: string | null;
          pincode: string | null;
          priority: string;
          primary_pathway_id: string;
          is_hazardous: boolean;
          assessment_payload: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          user_id?: string | null;
          category_slug: string;
          device_model?: string | null;
          condition: string;
          specific_fault?: string | null;
          pincode?: string | null;
          priority: string;
          primary_pathway_id: string;
          is_hazardous?: boolean;
          assessment_payload?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          user_id?: string | null;
          category_slug?: string;
          device_model?: string | null;
          condition?: string;
          specific_fault?: string | null;
          pincode?: string | null;
          priority?: string;
          primary_pathway_id?: string;
          is_hazardous?: boolean;
          assessment_payload?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      recovery_cases: {
        Row: {
          id: string;
          session_id: string;
          user_id: string | null;
          saved_assessment_id: string | null;
          pathway_id: string;
          provider_id: string | null;
          current_status: CaseStatus;
          verification_tier: VerificationTier;
          is_provider_verified: boolean;
          outcome_type: OutcomeType | null;
          financial_value_inr: number | null;
          rejection_or_failure_reason: string | null;
          user_notes: string | null;
          evidence_notes: string | null;
          evidence_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          user_id?: string | null;
          saved_assessment_id?: string | null;
          pathway_id: string;
          provider_id?: string | null;
          current_status?: CaseStatus;
          verification_tier?: VerificationTier;
          is_provider_verified?: boolean;
          outcome_type?: OutcomeType | null;
          financial_value_inr?: number | null;
          rejection_or_failure_reason?: string | null;
          user_notes?: string | null;
          evidence_notes?: string | null;
          evidence_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          user_id?: string | null;
          saved_assessment_id?: string | null;
          pathway_id?: string;
          provider_id?: string | null;
          current_status?: CaseStatus;
          verification_tier?: VerificationTier;
          is_provider_verified?: boolean;
          outcome_type?: OutcomeType | null;
          financial_value_inr?: number | null;
          rejection_or_failure_reason?: string | null;
          user_notes?: string | null;
          evidence_notes?: string | null;
          evidence_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      case_status_history: {
        Row: {
          id: string;
          case_id: string;
          from_status: string;
          to_status: string;
          changed_by_role: "user" | "provider" | "admin" | "system";
          is_provider_confirmed: boolean;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          case_id: string;
          from_status: string;
          to_status: string;
          changed_by_role?: "user" | "provider" | "admin" | "system";
          is_provider_confirmed?: boolean;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          case_id?: string;
          from_status?: string;
          to_status?: string;
          changed_by_role?: "user" | "provider" | "admin" | "system";
          is_provider_confirmed?: boolean;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      admin_audit_logs: {
        Row: {
          id: string;
          action_type: string;
          target_entity_type: string;
          target_entity_id: string;
          admin_identifier: string;
          details: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          action_type: string;
          target_entity_type: string;
          target_entity_id: string;
          admin_identifier?: string;
          details?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          action_type?: string;
          target_entity_type?: string;
          target_entity_id?: string;
          admin_identifier?: string;
          details?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
    };
  };
}

export type CaseStatus =
  | "draft"
  | "created"
  | "contacted"
  | "accepted_by_provider"
  | "in_transit_or_scheduled"
  | "dropped_off_or_collected"
  | "completed"
  | "rejected_by_provider"
  | "failed"
  | "cancelled";

export type VerificationTier = "user_reported" | "provider_verified";

export type OutcomeType =
  | "repaired_and_retained"
  | "sold_for_cash"
  | "exchanged_for_voucher"
  | "salvaged_for_parts"
  | "donated_for_reuse"
  | "recycled_certified"
  | "hazardous_containment";

export type SavedAssessmentRow = Database["public"]["Tables"]["saved_assessments"]["Row"];
export type RecoveryCaseRow = Database["public"]["Tables"]["recovery_cases"]["Row"];
export type CaseStatusHistoryRow = Database["public"]["Tables"]["case_status_history"]["Row"];
export type AdminAuditLogRow = Database["public"]["Tables"]["admin_audit_logs"]["Row"];

/**
 * Joined presentation type used in Directory UI components
 */
export type ProviderWithDetails = Database["public"]["Tables"]["providers"]["Row"] & {
  services: (Database["public"]["Tables"]["provider_services"]["Row"] & {
    service_categories?: Database["public"]["Tables"]["provider_service_categories"]["Row"][];
  })[];
  accepted_categories: Database["public"]["Tables"]["provider_accepted_categories"]["Row"][];
  service_areas: Database["public"]["Tables"]["provider_service_areas"]["Row"][];
};
