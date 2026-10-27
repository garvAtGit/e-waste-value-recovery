export type ComponentDemandTier = "Critical" | "High" | "Moderate" | "Hazardous / Recycle Only";

export interface ComponentDonorPart {
  id: string;
  name: string;
  category: "display" | "camera" | "housing" | "battery" | "acoustics_haptics" | "motherboard_ic";
  description: string;
  salvageValueInr: number;
  demandTier: ComponentDemandTier;
  eligibleForResale: boolean;
  eligibilityCriteria: string;
  targetBuyerHub: string; // e.g. "Nehru Place Independent Labs", "Karol Bagh Gaffar Market", "CPCB Dismantler EWRI"
  handlingSafetyWarning?: string;
}

export interface DeviceSalvageBOM {
  modelId: string;
  brand: "Nothing" | "Apple" | "Samsung" | "OnePlus" | "Google" | "Xiaomi" | "Vivo";
  modelName: string;
  launchMsrp: number;
  genericScrapOfferInr: number; // What Cashify / scrap dealer offers for a dead motherboard
  components: ComponentDonorPart[];
  specialDesignFeatures?: string[];
  lastUpdated: string;
}

export interface SalvageValuationResult {
  device: DeviceSalvageBOM;
  selectedComponentIds: string[];
  totalHarvestableValueInr: number;
  scrapComparisonMultiplier: number;
  eligiblePartsList: ComponentDonorPart[];
  restrictedPartsList: ComponentDonorPart[];
  physicalRoutingGuide: {
    hubName: string;
    locality: string;
    acceptedParts: string[];
    recommendedAction: string;
  }[];
}
