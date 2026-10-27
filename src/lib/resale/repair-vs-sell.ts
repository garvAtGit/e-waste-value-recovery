import {
  PhoneAssessmentInput,
  PhoneCondition,
  PhoneBrand,
} from "./types";
import {
  CONDITION_DEFINITIONS,
  isQuoteStale,
} from "./catalog";
import { evaluatePhoneResaleOffers } from "./engine";

export interface RepairCostBenchmark {
  faultId: string;
  faultLabel: string;
  applicableBrand?: PhoneBrand;
  partType: string;
  costRangeInr: {
    min: number;
    max: number;
  };
  repairSource: string;
  sourceUrl: string;
  lastCheckedDate: string;
  isManufacturerOem: boolean;
  notes: string;
}

/**
 * Structured public catalogue of repair cost ranges for supported device families.
 * Sourced from published service schedules:
 * - Apple India Official Service Pricing (support.apple.com/en-in/iphone/repair)
 * - Cashify Doorstep Repair Price List (cashify.in/repair)
 * - Nehru Place Independent Repair Lab Benchmarks
 */
export const REPAIR_COST_BENCHMARKS: RepairCostBenchmark[] = [
  // 1. Screen Replacement (Apple)
  {
    faultId: "fault-screen-cracked",
    faultLabel: "Cracked Screen / Display Glass",
    applicableBrand: "Apple",
    partType: "OLED / Super Retina Display Assembly",
    costRangeInr: { min: 4500, max: 8500 },
    repairSource: "Cashify Repair / Third-Party OEM Grade Lab",
    sourceUrl: "https://www.cashify.in/repair/screen-repair",
    lastCheckedDate: "2026-10-26",
    isManufacturerOem: false,
    notes: "Official Apple Genius Bar screen replacement costs ₹18,000–₹32,000; high-grade third-party screen replacement in Delhi ranges ₹4,500–₹8,500.",
  },
  // 2. Screen Replacement (Android / Samsung / OnePlus / Xiaomi)
  {
    faultId: "fault-screen-cracked",
    faultLabel: "Cracked Screen / Display Glass",
    applicableBrand: "Samsung",
    partType: "Dynamic AMOLED Screen Assembly",
    costRangeInr: { min: 3800, max: 7200 },
    repairSource: "Delhi Authorized Service / Cashify Repair",
    sourceUrl: "https://www.cashify.in/repair/screen-repair",
    lastCheckedDate: "2026-10-26",
    isManufacturerOem: false,
    notes: "AMOLED panel replacement with digitizer. Official Samsung service center rate is ~35% higher.",
  },
  {
    faultId: "fault-screen-cracked",
    faultLabel: "Cracked Screen / Display Glass",
    applicableBrand: "OnePlus",
    partType: "Fluid AMOLED Screen Assembly",
    costRangeInr: { min: 3500, max: 6500 },
    repairSource: "Cashify Repair Delhi",
    sourceUrl: "https://www.cashify.in/repair/screen-repair",
    lastCheckedDate: "2026-10-26",
    isManufacturerOem: false,
    notes: "Includes touch digitizer and front glass replacement.",
  },
  {
    faultId: "fault-screen-cracked",
    faultLabel: "Cracked Screen / Display Glass",
    applicableBrand: "Nothing",
    partType: "Flexible OLED Screen Assembly with 120Hz Refresh",
    costRangeInr: { min: 4200, max: 7000 },
    repairSource: "Delhi Authorized Service / Cashify Repair",
    sourceUrl: "https://in.nothing.tech/pages/service-center",
    lastCheckedDate: "2026-10-26",
    isManufacturerOem: false,
    notes: "Nothing Phone flexible OLED panel with symmetrical bezels. Sourced from authorized service or premium tier-3 donor parts.",
  },
  {
    faultId: "fault-back-glass",
    faultLabel: "Broken Rear Glass / Glyph Panel",
    applicableBrand: "Nothing",
    partType: "Transparent Glyph Interface Glass Housing",
    costRangeInr: { min: 2000, max: 3800 },
    repairSource: "Karol Bagh Specialized Mobile Repair Hub",
    sourceUrl: "https://in.nothing.tech/pages/service-center",
    lastCheckedDate: "2026-10-26",
    isManufacturerOem: false,
    notes: "Requires careful preservation of Glyph LED flex lightstrips during panel swap.",
  },
  {
    faultId: "fault-screen-cracked",
    faultLabel: "Cracked Screen / Display Glass",
    partType: "LCD / AMOLED Screen Assembly (Generic)",
    costRangeInr: { min: 2800, max: 5500 },
    repairSource: "Nehru Place Independent Hardware Lab",
    sourceUrl: "https://www.cashify.in/repair",
    lastCheckedDate: "2026-10-26",
    isManufacturerOem: false,
    notes: "General smartphone display module replacement range.",
  },

  // 3. Battery Replacement (Apple)
  {
    faultId: "fault-battery-service",
    faultLabel: "Battery Health < 80% / Service",
    applicableBrand: "Apple",
    partType: "Lithium-Ion Battery Pack with BMS Flex",
    costRangeInr: { min: 2200, max: 3500 },
    repairSource: "Third-Party Certified Delhi Lab / Cashify",
    sourceUrl: "https://www.cashify.in/repair/battery-repair",
    lastCheckedDate: "2026-10-26",
    isManufacturerOem: false,
    notes: "Official Apple battery replacement is ₹6,900–₹8,800. Third-party high-cycle battery is ₹2,200–₹3,500.",
  },
  // 4. Battery Replacement (Android)
  {
    faultId: "fault-battery-service",
    faultLabel: "Battery Health < 80% / Service",
    partType: "OEM Replacement Battery (Android)",
    costRangeInr: { min: 1400, max: 2400 },
    repairSource: "Authorized Brand Service / Local Lab",
    sourceUrl: "https://www.cashify.in/repair/battery-repair",
    lastCheckedDate: "2026-10-26",
    isManufacturerOem: false,
    notes: "Standard 4,500–5,000 mAh Li-Po replacement cell with 6-month warranty.",
  },

  // 5. Back Glass / Rear Panel
  {
    faultId: "fault-back-glass",
    faultLabel: "Broken Rear Glass / Panel",
    partType: "Rear Glass Housing (Laser Removal)",
    costRangeInr: { min: 1200, max: 2500 },
    repairSource: "Delhi Mobile Repair Network (Nehru Place / Karol Bagh)",
    sourceUrl: "https://www.cashify.in/repair",
    lastCheckedDate: "2026-10-26",
    isManufacturerOem: false,
    notes: "Laser separation of cracked back glass and fitment of new Gorilla/matte panel.",
  },

  // 6. Camera Module / Lens Repair
  {
    faultId: "fault-camera-lens",
    faultLabel: "Camera Malfunction / Cracked Lens",
    partType: "Camera Glass / Optical Sensor Module",
    costRangeInr: { min: 1500, max: 3500 },
    repairSource: "Independent Delhi Workshop",
    sourceUrl: "https://www.cashify.in/repair",
    lastCheckedDate: "2026-10-26",
    isManufacturerOem: false,
    notes: "Outer camera lens glass is ₹800–₹1,200; full optical sensor module replacement is ₹2,500–₹3,500.",
  },

  // 7. Biometrics (Face ID / Fingerprint)
  {
    faultId: "fault-biometrics",
    faultLabel: "Face ID / Fingerprint Failure",
    partType: "Dot Projector / In-Display Sensor Flex",
    costRangeInr: { min: 2500, max: 4500 },
    repairSource: "Specialist Board-Level Repair Lab",
    sourceUrl: "https://www.lappymaker.com",
    lastCheckedDate: "2026-10-26",
    isManufacturerOem: false,
    notes: "Micro-soldering repair for serialized dot projector or capacitive ribbon.",
  },

  // 8. Speaker / Mic / Port
  {
    faultId: "fault-speaker-mic",
    faultLabel: "Distorted Ear-Speaker / Microphone",
    partType: "Speaker Mesh / Microphone Daughterboard",
    costRangeInr: { min: 800, max: 1500 },
    repairSource: "Local Mobile Counter / Cashify",
    sourceUrl: "https://www.cashify.in/repair",
    lastCheckedDate: "2026-10-26",
    isManufacturerOem: false,
    notes: "Sub-board or acoustic mesh ultrasonic cleaning / replacement.",
  },
];

export interface ItemizedRepairOption {
  faultId: string;
  faultLabel: string;
  estimatedCostRange: {
    min: number;
    max: number;
  };
  midCost: number;
  partType: string;
  source: string;
  sourceUrl: string;
  lastCheckedDate: string;
  notes: string;
}

export interface RepairVsSellResult {
  hasFaultsToRepair: boolean;
  isHazardousBlocked: boolean;
  hazardReason?: string;

  // 1. Sell As-Is
  sellAsIs: {
    grossResaleEstimate: number;
    sellingCosts: number;
    netProceeds: number;
    conditionLabel: string;
    topProviderName: string;
  };

  // 2. Repair, then Sell
  repairThenSell: {
    totalRepairCostRange: {
      min: number;
      max: number;
    };
    totalRepairCostMid: number;
    upgradedCondition: PhoneCondition;
    upgradedConditionLabel: string;
    expectedResaleValueAfterRepair: number;
    netProceedsAfterRepair: number;
    netProceedsRange: {
      min: number;
      max: number;
    };
    itemizedRepairs: ItemizedRepairOption[];
  };

  // 3. Incremental Economic Benefit
  economics: {
    incrementalBenefitMid: number; // netProceedsAfterRepair - sellAsIs.netProceeds
    incrementalBenefitRange: {
      min: number;
      max: number;
    };
    isRepairEconomicallyBeneficial: boolean;
    recommendationHeadline: string;
    recommendationExplanation: string;
    qualitativeRiskWarning: string;
  };

  dataConfidence: {
    isStale: boolean;
    lastVerifiedDate: string;
    disclaimer: string;
  };
}

/**
 * Deterministically calculates Repair vs. Sell economics using transparent formulas:
 * 1. Sell as-is: net = as-is resale payout - selling costs.
 * 2. Repair, then sell: net = resale value after repair - repair cost - selling costs.
 * 3. Incremental benefit = net after repair - net as-is.
 */
export function calculateRepairVsSell(input: PhoneAssessmentInput): RepairVsSellResult {
  const isHazardous = input.condition === "hazardous";

  // Hazardous override
  if (isHazardous) {
    return {
      hasFaultsToRepair: true,
      isHazardousBlocked: true,
      hazardReason:
        "Device has a compromised or swollen lithium battery. Commercial repair or courier shipping is unsafe and prohibited under hazardous battery transport regulations. Proceed directly to certified recycling.",
      sellAsIs: {
        grossResaleEstimate: 0,
        sellingCosts: 0,
        netProceeds: 0,
        conditionLabel: "Hazardous (Swollen Battery)",
        topProviderName: "E-Waste Recyclers India (Certified Chemical Destruction)",
      },
      repairThenSell: {
        totalRepairCostRange: { min: 0, max: 0 },
        totalRepairCostMid: 0,
        upgradedCondition: "hazardous",
        upgradedConditionLabel: "Hazardous",
        expectedResaleValueAfterRepair: 0,
        netProceedsAfterRepair: 0,
        netProceedsRange: { min: 0, max: 0 },
        itemizedRepairs: [],
      },
      economics: {
        incrementalBenefitMid: 0,
        incrementalBenefitRange: { min: 0, max: 0 },
        isRepairEconomicallyBeneficial: false,
        recommendationHeadline: "Do Not Repair — Dispose via Certified Hazardous Intake",
        recommendationExplanation:
          "Swollen battery cells present thermal runaway risk. Attempting repair carries fire hazard. Hand over to authorized safe chemical recovery.",
        qualitativeRiskWarning: "Do not puncture, charge, or transport via commercial couriers.",
      },
      dataConfidence: {
        isStale: false,
        lastVerifiedDate: "2026-10-26",
        disclaimer: "Regulated safety protocol under CPCB battery disposal rules.",
      },
    };
  }

  // 1. Current As-Is Valuation
  const currentValuation = evaluatePhoneResaleOffers(input);
  const topAsIsOffer = currentValuation.bestRealisticOffer;
  const asIsNet = topAsIsOffer ? topAsIsOffer.estimatedNetPayout : currentValuation.assessmentSummary.estimatedNetBaseline;

  // 2. Resolve Itemized Repairs for declared faults
  const selectedFaults = input.selectedFaults || (input as unknown as { faults?: string[] }).faults || [];
  const itemizedRepairs: ItemizedRepairOption[] = [];
  let totalRepairMin = 0;
  let totalRepairMax = 0;

  for (const faultId of selectedFaults) {
    // Find matching repair benchmark for brand, or fallback to generic
    const benchmark =
      REPAIR_COST_BENCHMARKS.find(
        (b) => b.faultId === faultId && b.applicableBrand === input.brand
      ) ||
      REPAIR_COST_BENCHMARKS.find(
        (b) => b.faultId === faultId && !b.applicableBrand
      ) || {
        faultId,
        faultLabel: "Declared Hardware Fault",
        partType: "Component Replacement",
        costRangeInr: { min: 1500, max: 3000 },
        repairSource: "Delhi Mobile Service Network",
        sourceUrl: "https://www.cashify.in/repair",
        lastCheckedDate: "2026-10-26",
        isManufacturerOem: false,
        notes: "General component repair benchmark.",
      };

    const midCost = Math.round((benchmark.costRangeInr.min + benchmark.costRangeInr.max) / 2);
    totalRepairMin += benchmark.costRangeInr.min;
    totalRepairMax += benchmark.costRangeInr.max;

    itemizedRepairs.push({
      faultId,
      faultLabel: benchmark.faultLabel,
      estimatedCostRange: benchmark.costRangeInr,
      midCost,
      partType: benchmark.partType,
      source: benchmark.repairSource,
      sourceUrl: benchmark.sourceUrl,
      lastCheckedDate: benchmark.lastCheckedDate,
      notes: benchmark.notes,
    });
  }

  const totalRepairMid = Math.round((totalRepairMin + totalRepairMax) / 2);
  const hasFaultsToRepair = selectedFaults.length > 0;

  // 3. Compute Resale Value After Repair
  // Upgraded condition: if device was faulty/fair, repairing faults upgrades it to 'good' or 'flawless'
  let upgradedCondition: PhoneCondition = "good";
  if (input.condition === "major_fault") {
    upgradedCondition = "fair"; // Non-booting fixed board typically grades fair/minor scuffs
  } else if (input.condition === "fair" || input.condition === "faulty") {
    upgradedCondition = "good";
  } else if (input.condition === "good") {
    upgradedCondition = "flawless";
  }

  // Calculate post-repair valuation (zero faults, upgraded condition)
  const postRepairValuation = evaluatePhoneResaleOffers({
    ...input,
    condition: upgradedCondition,
    selectedFaults: [],
  });

  const postRepairResaleValue = postRepairValuation.bestRealisticOffer
    ? postRepairValuation.bestRealisticOffer.estimatedNetPayout
    : postRepairValuation.assessmentSummary.estimatedNetBaseline;

  // Net Proceeds after repair = resale value after repair - repair cost
  const netProceedsAfterRepairMid = Math.max(0, postRepairResaleValue - totalRepairMid);
  const netProceedsRange = {
    min: Math.max(0, postRepairResaleValue - totalRepairMax),
    max: Math.max(0, postRepairResaleValue - totalRepairMin),
  };

  // 4. Incremental Benefit of Repair
  // incrementalBenefit = netProceedsAfterRepair - asIsNet
  const incrementalBenefitMid = hasFaultsToRepair
    ? netProceedsAfterRepairMid - asIsNet
    : 0;

  const incrementalBenefitRange = {
    min: hasFaultsToRepair ? netProceedsRange.min - asIsNet : 0,
    max: hasFaultsToRepair ? netProceedsRange.max - asIsNet : 0,
  };

  const isRepairEconomicallyBeneficial = incrementalBenefitMid > 500; // Positive by at least ₹500 to account for repair hassle

  let recommendationHeadline = "";
  let recommendationExplanation = "";

  if (!hasFaultsToRepair) {
    recommendationHeadline = "No Hardware Faults Declared — Sell As-Is";
    recommendationExplanation =
      "Your phone has no major repairable component faults declared. Selling as-is directly yields the maximum cash return without incurring repair expenses.";
  } else if (isRepairEconomicallyBeneficial) {
    recommendationHeadline = `Repairing Then Selling Yields +₹${incrementalBenefitMid.toLocaleString()} Net Return`;
    recommendationExplanation = `The cost of repair (approx. ₹${totalRepairMid.toLocaleString()}) is lower than the resale value uplift (+₹${(
      postRepairResaleValue - asIsNet
    ).toLocaleString()}). Repairing before selling is economically favorable.`;
  } else {
    const lossAmount = Math.abs(incrementalBenefitMid);
    recommendationHeadline = `Sell As-Is Is Better (Repair Loses ~₹${lossAmount.toLocaleString()})`;
    recommendationExplanation = `Repairing the declared faults costs approx. ₹${totalRepairMid.toLocaleString()}, but only increases the resale price by ₹${(
      postRepairResaleValue - asIsNet
    ).toLocaleString()}. Selling as-is avoids out-of-pocket repair costs and saves you time.`;
  }

  const qualitativeRiskWarning =
    "Repair Risk Warning: Non-OEM screens or third-party batteries may be detected during buyback diagnostic inspection, causing unexpected deductions. Ensure replacement parts come with a test warranty.";

  const latestDate = itemizedRepairs.length > 0 ? itemizedRepairs[0].lastCheckedDate : "2026-10-26";
  const isStale = isQuoteStale(latestDate);

  return {
    hasFaultsToRepair,
    isHazardousBlocked: false,
    sellAsIs: {
      grossResaleEstimate: asIsNet,
      sellingCosts: 0,
      netProceeds: asIsNet,
      conditionLabel: CONDITION_DEFINITIONS[input.condition]?.label || input.condition,
      topProviderName: topAsIsOffer ? topAsIsOffer.providerName : "Direct Cash Buyback",
    },
    repairThenSell: {
      totalRepairCostRange: { min: totalRepairMin, max: totalRepairMax },
      totalRepairCostMid: totalRepairMid,
      upgradedCondition,
      upgradedConditionLabel: CONDITION_DEFINITIONS[upgradedCondition]?.label || upgradedCondition,
      expectedResaleValueAfterRepair: postRepairResaleValue,
      netProceedsAfterRepair: netProceedsAfterRepairMid,
      netProceedsRange,
      itemizedRepairs,
    },
    economics: {
      incrementalBenefitMid,
      incrementalBenefitRange,
      isRepairEconomicallyBeneficial,
      recommendationHeadline,
      recommendationExplanation,
      qualitativeRiskWarning,
    },
    dataConfidence: {
      isStale,
      lastVerifiedDate: latestDate,
      disclaimer:
        "Estimates based on published Delhi third-party repair lab benchmarks. Actual service invoices and inspection adjustments may vary.",
    },
  };
}
