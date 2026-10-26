import { QuoteType, VerificationStatus } from "../supabase/types";

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

export interface PhoneAssessmentInput {
  brand: PhoneBrand;
  modelId: string;
  modelName: string;
  storage: string;
  condition: PhoneCondition;
  selectedFaults: string[];
  accessories: PhoneAccessory[];
  pincode: string;
}

export type OfferType =
  | "cash_doorstep"
  | "store_exchange"
  | "apple_trade_in"
  | "p2p_market"
  | "certified_recycle";

export interface ProviderResaleOffer {
  providerId: string | null;
  providerName: string;
  providerSlug: string;
  organisationType: string;
  verificationStatus: VerificationStatus;
  offerType: OfferType;
  quoteStatus: QuoteType;
  estimatedNetPayout: number;
  priceRange: {
    min: number;
    max: number;
  };
  inspectionDeductionsPolicy: string;
  estimatedDeductionRisk: string;
  pickupAvailable: boolean;
  pickupDetails: string;
  dropoffAvailable: boolean;
  dropoffDetails: string;
  paymentTerms: string;
  paymentMethod: string;
  lastVerifiedDate: string;
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
