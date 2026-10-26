import { VerificationStatus, QuoteType } from "../supabase/types";
import { ConditionType } from "@/components/landing/PathwayExplorer";

export type ComparisonPriority =
  | "maximise_money"
  | "minimise_effort"
  | "repair_keep"
  | "dispose_responsibly";

export interface ComparisonInput {
  categorySlug: string;
  condition: ConditionType;
  specificFault?: string;
  deviceModel?: string;
  pincode?: string;
  priority: ComparisonPriority;
}

export type PathwayEligibility =
  | "recommended_primary"
  | "viable_alternative"
  | "conditionally_eligible"
  | "excluded";

export type ValueType =
  | "cash_payout"
  | "exchange_voucher"
  | "repair_expense"
  | "salvage_cash"
  | "non_monetary_social"
  | "regulated_recycling";

export interface MatchedProviderInfo {
  id: string;
  name: string;
  slug: string;
  organisationType: string;
  verificationStatus: VerificationStatus;
  quoteType: QuoteType;
  offersPickup: boolean;
  offersDropoff: boolean;
  dropoffAddress: string | null;
  websiteUrl: string | null;
  sourceEvidenceUrl: string | null;
  lastCheckedAt: string | null;
  minimumQuantity: number | null;
  eligibilityRestrictions: string | null;
  pincodeMatched: boolean;
  serviceDescription: string | null;
  isSampleData: boolean;
}

export interface EvaluatedPathway {
  pathwayId: string;
  title: string;
  eligibility: PathwayEligibility;
  eligibilityReason: string;
  valueType: ValueType;
  valueDescription: string;
  effortRequired: "Low" | "Medium" | "High";
  speed: string;
  matchedProviders: MatchedProviderInfo[];
  providerCoverageStatus:
    | "matched_with_pincode"
    | "matched_without_pincode"
    | "no_pincode_coverage"
    | "no_providers_documented"
    | "service_not_applicable";
  unknownsToConfirm: string[];
  nextAction: string;
}

export interface ComparisonEvaluation {
  isHazardous: boolean;
  hazardDirectives?: {
    headline: string;
    stopUseWarning: string;
    handlingSteps: string[];
  };
  primaryPathwayId: string;
  recommendationExplanation: string;
  pathways: EvaluatedPathway[];
  unmatchedPincodeNotice?: string;
}
