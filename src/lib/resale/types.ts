import { VerificationStatus } from "../supabase/types";

export type PhoneBrand =
  | "Apple"
  | "Samsung"
  | "OnePlus"
  | "Google"
  | "Xiaomi"
  | "Vivo";

export interface PhoneModel {
  id: string;
  brand: PhoneBrand;
  name: string;
  releaseYear: number;
  storageOptions: string[];
  basePricesByStorage: Record<string, number>;
  isAppleTradeInEligible?: boolean;
}

export type PhoneCondition =
  | "flawless"
  | "good"
  | "fair"
  | "faulty"
  | "major_fault"
  | "hazardous";

export interface PhoneFaultOption {
  id: string;
  label: string;
  description: string;
  deductionAmount: number; // Flat deduction in INR
  deductionPercent?: number; // Optional percentage deduction
  affectsDisplay?: boolean;
  affectsBattery?: boolean;
  isHazard?: boolean;
}

export type PhoneAccessory = "box" | "original_charger" | "valid_bill";

export type ResaleRankingMode =
  | "highest_cash"        // Largest comparable estimated net cash amount
  | "most_convenient"     // Prioritizes verified doorstep or lowest effort
  | "most_certain"        // Prioritizes published prices & verified retailer policies
  | "best_overall";       // Balanced transparent heuristic

export interface PhoneAssessmentInput {
  brand: PhoneBrand;
  modelId: string;
  modelName: string;
  storage: string;
  condition: PhoneCondition;
  selectedFaults: string[];
  accessories: PhoneAccessory[];
  pincode: string;
  rankingMode?: ResaleRankingMode;
}

export type OfferType =
  | "cash_doorstep"
  | "store_exchange"
  | "apple_trade_in"
  | "p2p_market"
  | "certified_recycle";

export type ResaleQuoteStatus =
  | "indicative_estimate"          // Calculated by application using documented assumptions/heuristics
  | "published_price"              // Transcribed from public provider page (e.g. "Up to ₹XX")
  | "provider_quote"               // Direct quote returned through legitimate provider process
  | "confirmed_diagnostic_quote"   // Confirmed after physical diagnosis has been performed
  | "expired_stale_estimate";      // Source older than freshness window

export type PickupBadgeStatus =
  | "pickup_confirmed"             // Verified provider record for this exact service area / pincode
  | "pickup_unconfirmed_listed"    // Listed on provider website; not independently verified for this pincode
  | "in_store_dropoff"             // Physical counter / store drop-off only
  | "self_arranged"                // Peer-to-peer / self-arranged courier or meeting
  | "pickup_unknown"               // Availability unknown / not verified
  | "not_available_pincode";       // Outside provider's documented service area

export type ResaleFinancialType =
  | "cash"
  | "voucher"
  | "trade_in_credit"
  | "p2p_cash"
  | "free_disposal";

export interface ProviderResaleOffer {
  providerId: string | null;
  providerName: string;
  providerSlug: string;
  organisationType: string;
  verificationStatus: VerificationStatus;
  offerType: OfferType;
  financialType: ResaleFinancialType;
  quoteStatus: ResaleQuoteStatus;
  quoteStatusLabel: string;
  quoteBasis: string;
  isUpToPrice?: boolean;
  publishedSourceUrl?: string | null;
  estimatedNetPayout: number;
  priceRange: {
    min: number;
    max: number;
  };
  inspectionDeductionsPolicy: string;
  estimatedDeductionRisk: string;
  pickupAvailable: boolean;
  pickupBadgeStatus: PickupBadgeStatus;
  pickupBadgeLabel: string;
  pickupDetails: string;
  dropoffAvailable: boolean;
  dropoffDetails: string;
  paymentTerms: string;
  paymentMethod: string;
  lastVerifiedDate: string;
  isStale: boolean;
  evidenceUrl?: string | null;
  isPincodeCovered: boolean;
  rankingPosition: number;
  rankingReason: string;
  requiresHazardSafetyNotice?: boolean;
  isEligible: boolean;
  ineligibilityReason?: string;
}

export interface PhoneValuationResult {
  isHazardous: boolean;
  hazardDirective?: {
    headline: string;
    warningText: string;
    handlingSteps: string[];
  };
  bestRealisticOffer: ProviderResaleOffer | null;
  offers: ProviderResaleOffer[];
  rankingMode: ResaleRankingMode;
  rankingExplanation: string;
  assessmentSummary: {
    deviceTitle: string;
    brand: PhoneBrand;
    model: string;
    storage: string;
    conditionLabel: string;
    basePrice: number;
    conditionFactor: number;
    faultDeductionTotal: number;
    accessoryBonusTotal: number;
    estimatedNetBaseline: number;
    pincode: string;
    isDelhiPincode: boolean;
  };
}
