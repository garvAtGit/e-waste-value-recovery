import {
  CaseStatus,
  VerificationTier,
  OutcomeType,
  SavedAssessmentRow,
  RecoveryCaseRow,
  CaseStatusHistoryRow,
  ProviderWithDetails,
} from "../supabase/types";
import { ComparisonInput } from "../comparison/types";

export type { CaseStatus, VerificationTier, OutcomeType };

export interface CaseTransitionRequest {
  targetStatus: CaseStatus;
  changedByRole: "user" | "provider" | "admin" | "system";
  reasonOrNotes?: string;
  isProviderConfirmed?: boolean;
  outcomeType?: OutcomeType;
  financialValueInr?: number;
  evidenceNotes?: string;
  evidenceUrl?: string;
  newProviderId?: string; // If user switches to an alternative provider
}

export interface TransitionValidationResult {
  isValid: boolean;
  error?: string;
}

export interface RecoveryCaseWithDetails extends RecoveryCaseRow {
  assessment?: SavedAssessmentRow | null;
  provider?: ProviderWithDetails | null;
  status_history: CaseStatusHistoryRow[];
}

export interface CreateCaseInput {
  sessionId: string;
  userId?: string | null;
  savedAssessmentId?: string;
  pathwayId: string;
  providerId?: string | null;
  assessmentInput?: ComparisonInput;
  userNotes?: string;
  evidenceNotes?: string;
  financialValueInr?: number | null;
}

export const VALID_STATUS_TRANSITIONS: Record<CaseStatus, CaseStatus[]> = {
  draft: ["created", "cancelled"],
  created: ["contacted", "rejected_by_provider", "cancelled"],
  contacted: [
    "contacted", // repeated contact attempt
    "accepted_by_provider",
    "rejected_by_provider",
    "cancelled",
  ],
  accepted_by_provider: [
    "in_transit_or_scheduled",
    "dropped_off_or_collected",
    "rejected_by_provider",
    "cancelled",
  ],
  in_transit_or_scheduled: [
    "dropped_off_or_collected",
    "failed",
    "cancelled",
  ],
  dropped_off_or_collected: ["completed", "failed"],
  rejected_by_provider: [
    "contacted", // Pivot: re-contact alternative provider
    "cancelled",
  ],
  failed: [
    "contacted", // Pivot: try another pathway or provider
    "cancelled",
  ],
  completed: [], // Terminal for user (admin can override)
  cancelled: [], // Terminal for user (admin can override)
};

export const HUMAN_STATUS_LABELS: Record<CaseStatus, { title: string; step: string; badge: string }> = {
  draft: { title: "Draft Case", step: "Preparing assessment", badge: "bg-slate-100 text-slate-700" },
  created: { title: "Case Created", step: "Step 1: Ready to Contact", badge: "bg-blue-50 text-blue-800 border-blue-200" },
  contacted: { title: "Provider Contacted", step: "Step 2: Awaiting Response", badge: "bg-amber-50 text-amber-800 border-amber-200" },
  accepted_by_provider: { title: "Accepted by Provider", step: "Step 3: Ready for Logistics", badge: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  in_transit_or_scheduled: { title: "Logistics Scheduled / In-Transit", step: "Step 4: Transferring Device", badge: "bg-indigo-50 text-indigo-800 border-indigo-200" },
  dropped_off_or_collected: { title: "Delivered to Facility", step: "Step 5: Processing / Inspection", badge: "bg-purple-50 text-purple-800 border-purple-200" },
  completed: { title: "Recovery Completed", step: "Completed & Verified", badge: "bg-emerald-100 text-emerald-900 border-emerald-300" },
  rejected_by_provider: { title: "Provider Rejected / Ineligible", step: "Alternative Option Needed", badge: "bg-rose-50 text-rose-800 border-rose-200" },
  failed: { title: "Recovery Failed", step: "Failed during transit/test", badge: "bg-rose-100 text-rose-900 border-rose-300" },
  cancelled: { title: "Case Cancelled", step: "User withdrew case", badge: "bg-slate-100 text-slate-600 border-slate-200" },
};
