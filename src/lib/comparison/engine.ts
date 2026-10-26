import { ProviderWithDetails } from "../supabase/types";
import {
  ComparisonInput,
  ComparisonEvaluation,
  EvaluatedPathway,
  MatchedProviderInfo,
} from "./types";
import { DEVICE_CATEGORIES } from "../constants/categories";

/**
 * Deterministic evidence-backed Recovery Comparison Engine.
 * Evaluates all 6 recovery pathways against device state, user priorities,
 * and verified Supabase provider records with strict non-inferential location matching.
 */
export function evaluateComparison(
  input: ComparisonInput,
  approvedProviders: ProviderWithDetails[]
): ComparisonEvaluation {
  const currentCategory =
    DEVICE_CATEGORIES.find((c) => c.slug === input.categorySlug) ||
    DEVICE_CATEGORIES[0];

  const cleanPincode = input.pincode?.trim() || "";

  // 1. SAFETY OVERRIDE: Swollen, leaking, overheating, or hazardous devices
  if (input.condition === "unsafe_hazardous") {
    const isLargeAppliance = input.categorySlug === "home-appliances-large";
    const isSmallAppliance = input.categorySlug === "home-appliances-small";

    let hazardHeadline = "STOP USE: Damaged / Swollen Lithium Battery Hazard";
    let stopUseWarning =
      "Bulging, leaking, or overheating lithium-ion cells pose an immediate risk of chemical fire and thermal runaway. Do not power on, charge, compress, or puncture. Do not dismantle the device.";
    let handlingSteps = [
      "Stop using the device immediately. Disconnect the charger and power supply if safe to do so. Do NOT attempt to turn it on.",
      "Do NOT open, puncture, compress, or attempt to remove a swollen, leaking, or damaged battery cell.",
      "Place the unit in a well-ventilated, fire-safe location (such as an outdoor concrete surface or metal container) away from combustible materials.",
      "Do not transport an actively hot, smoking, or leaking battery in a passenger vehicle or send it by standard mail/courier.",
      "Contact your local municipal hazardous-waste collection team or fire/emergency services for safe on-site handling and disposal instructions.",
    ];

    if (isLargeAppliance) {
      hazardHeadline = "STOP USE: Major Electrical or Refrigerant Hazard";
      stopUseWarning =
        "Do not power on or attempt to dismantle cooling lines. Pressurized refrigerants and high-voltage capacitors require specialised commercial recovery.";
      handlingSteps = [
        "Disconnect the appliance safely from the mains electrical and water supply if safe to do so.",
        "Do NOT cut, puncture, or vent sealed refrigeration coils.",
        "Contact your local municipal waste department or an authorised hazardous-waste handler for specialised collection guidance.",
      ];
    } else if (isSmallAppliance) {
      hazardHeadline = "STOP USE: High-Voltage Electrical & Fire Hazard";
      stopUseWarning =
        "Appliance exhibits signs of electrical short-circuit, melted casing, or internal component burnout. Internal capacitors can hold dangerous charge even when unplugged.";
      handlingSteps = [
        "Unplug the appliance safely from the wall socket immediately. Do not touch exposed wiring or water around the device.",
        "Do NOT attempt DIY repair, replace internal thermal fuses, or power on again.",
        "Deliver to an authorised municipal electrical waste facility or accredited WEEE collection point.",
      ];
    }

    const hazardousRecyclers = matchProvidersForService(
      "recycling",
      input.categorySlug,
      input.condition,
      cleanPincode,
      approvedProviders
    );

    const hasEligibleRecycler = hazardousRecyclers.length > 0;

    // Under hazardous conditions, ONLY authorised recycling is eligible. All other pathways are strictly excluded.
    const pathways: EvaluatedPathway[] = [
      {
        pathwayId: "authorised-recycling",
        title: hasEligibleRecycler
          ? "Authorised Hazardous Recycler / E-Waste Facility"
          : "Authorised Hazardous Recovery (No verified local provider on record)",
        eligibility: "recommended_primary",
        eligibilityReason: hasEligibleRecycler
          ? "Mandatory safety protocol: Damaged or chemically unstable devices must be directed exclusively to certified facilities equipped for hazardous fraction containment."
          : "Mandatory safety protocol: Chemically unstable devices must be handled exclusively through certified hazardous-waste channels. No verified commercial facility is currently recorded on file for this case.",
        valueType: "regulated_recycling",
        valueDescription:
          "Regulated environmental containment and hazardous recovery. Zero commercial cash return.",
        effortRequired: "Low",
        speed: hasEligibleRecycler
          ? "Subject to verified provider operating hours"
          : "Subject to local municipal or emergency collection guidelines",
        matchedProviders: hazardousRecyclers,
        providerCoverageStatus: determineCoverageStatus(
          hazardousRecyclers,
          cleanPincode
        ),
        unknownsToConfirm: hasEligibleRecycler
          ? [
              "Confirm whether the local drop-off depot accepts physically damaged lithium cells before visiting.",
              "Verify facility operating hours and intake documentation requirements.",
            ]
          : [
              "No verified provider in our database currently documents accepting physically compromised hazardous lithium cells for this area.",
              "Check whether your municipal council offers chemical clean-out or hazardous collection days.",
              "Confirm local emergency service guidance on safe containment until specialized collection can occur.",
            ],
        nextAction: hasEligibleRecycler
          ? "Contact the matched facility to confirm intake criteria for compromised cells before transit, insulate terminals, and transport safely according to facility guidance."
          : "Do not deliver unannounced to commercial scrap yards or normal e-waste bins. Contact your municipal hazardous-waste collection service or local emergency services for safe handling instructions.",
      },
      {
        pathwayId: "repair",
        title: "Repair and Continue Using",
        eligibility: "excluded",
        eligibilityReason:
          "Strict safety policy: Devices with bulging batteries or structural chemical hazards must never undergo amateur repair. Dismantling a swollen cell risks thermal runaway.",
        valueType: "repair_expense",
        valueDescription: "Not available for hazardous units.",
        effortRequired: "High",
        speed: "N/A",
        matchedProviders: [],
        providerCoverageStatus: "service_not_applicable",
        unknownsToConfirm: [],
        nextAction: "Do not attempt repair. Follow hazardous disposal guidance.",
      },
      {
        pathwayId: "sell-cash",
        title: "Sell for Cash (Direct to Consumer)",
        eligibility: "excluded",
        eligibilityReason:
          "Prohibited by law and carrier safety regulations: Shipping swollen or damaged lithium batteries via postal courier is illegal and endangers logistics personnel.",
        valueType: "cash_payout",
        valueDescription: "Not available for hazardous units.",
        effortRequired: "High",
        speed: "N/A",
        matchedProviders: [],
        providerCoverageStatus: "service_not_applicable",
        unknownsToConfirm: [],
        nextAction: "Do not list for sale.",
      },
      {
        pathwayId: "exchange-voucher",
        title: "Exchange for Voucher / Retailer Trade-in",
        eligibility: "excluded",
        eligibilityReason:
          "Retailer trade-in programs strictly reject swollen, leaking, or hazardous units upon arrival, resulting in total forfeiture or return shipping charges.",
        valueType: "exchange_voucher",
        valueDescription: "Not available for hazardous units.",
        effortRequired: "Low",
        speed: "N/A",
        matchedProviders: [],
        providerCoverageStatus: "service_not_applicable",
        unknownsToConfirm: [],
        nextAction: "Do not ship to trade-in portals.",
      },
      {
        pathwayId: "refurbishers-parts",
        title: "Sell to Refurbishers & Component Buyers",
        eligibility: "excluded",
        eligibilityReason:
          "Swollen batteries can rupture during transit, posing fire risks to sorting facilities. Unsafe units cannot be liquidated through standard salvage channels.",
        valueType: "salvage_cash",
        valueDescription: "Not available for hazardous units.",
        effortRequired: "Low",
        speed: "N/A",
        matchedProviders: [],
        providerCoverageStatus: "service_not_applicable",
        unknownsToConfirm: [],
        nextAction: "Do not ship for parts salvage.",
      },
      {
        pathwayId: "donate-reuse",
        title: "Donate or Transfer for Reuse",
        eligibility: "excluded",
        eligibilityReason:
          "Donating hazardous or structurally defective electricals burdens community charities with liability and expensive commercial disposal fees.",
        valueType: "non_monetary_social",
        valueDescription: "Not available for hazardous units.",
        effortRequired: "Medium",
        speed: "N/A",
        matchedProviders: [],
        providerCoverageStatus: "service_not_applicable",
        unknownsToConfirm: [],
        nextAction: "Do not donate hazardous devices.",
      },
    ];

    return {
      isHazardous: true,
      hazardDirectives: {
        headline: hazardHeadline,
        stopUseWarning,
        handlingSteps,
      },
      primaryPathwayId: "authorised-recycling",
      recommendationExplanation: hasEligibleRecycler
        ? "Emergency Safety Protocol: When hardware displays thermal swelling, chemical leakage, or severe mains fault, all commercial, trade-in, and donation avenues are immediately suppressed. Verified facilities equipped for hazardous containment are listed below."
        : "Emergency Safety Protocol: When hardware displays thermal swelling, chemical leakage, or severe mains fault, all commercial, trade-in, and donation avenues are immediately suppressed. No certified hazardous facility is currently recorded on file for this location/condition; contact your local municipal council or emergency services for safe handling guidance.",
      pathways,
      unmatchedPincodeNotice:
        cleanPincode.length > 0 && !hasEligibleRecycler
          ? `No approved providers in our database currently document verified hazardous drop-off for pincode "${cleanPincode}". Do not assume facilities in nearby regions accept compromised cells. Contact your municipal hazardous-waste authority or emergency services for safe handling.`
          : undefined,
    };
  }

  // 2. STANDARD NON-HAZARDOUS PATHWAY EVALUATION
  const pathways: EvaluatedPathway[] = [];

  // --- PATHWAY 1: REPAIR AND CONTINUE USING ---
  const repairProviders = matchProvidersForService(
    "repair",
    input.categorySlug,
    input.condition,
    cleanPincode,
    approvedProviders
  );

  let repairEligibility: EvaluatedPathway["eligibility"] = "viable_alternative";
  let repairReason = "";

  if (input.categorySlug === "batteries-cables-peripherals") {
    repairEligibility = "excluded";
    repairReason =
      "Consumable cables and loose batteries cannot be safely repaired. Frayed sheaths present electrical fire hazards.";
  } else if (input.condition === "working_recent") {
    repairEligibility = "excluded";
    repairReason =
      "The device is already in functional operating condition; hardware repair is unnecessary.";
  } else if (input.condition === "minor_fault") {
    if (input.priority === "repair_keep" || input.priority === "maximise_money") {
      repairEligibility = "recommended_primary";
      repairReason =
        "Targeted replacement of an isolated consumable part (e.g. battery or outer screen) preserves hardware utility at a fraction of replacement cost.";
    } else {
      repairEligibility = "viable_alternative";
      repairReason =
        "A viable alternative if you are willing to invest in parts, though your priority favors immediate disposal or low effort.";
    }
  } else if (input.condition === "working_older") {
    repairEligibility = "conditionally_eligible";
    repairReason =
      "Viable only if parts are accessible and the machine continues to receive security patches. If operating system support has ended, hardware repair may not restore long-term utility.";
  } else if (input.condition === "major_fault") {
    repairEligibility = "conditionally_eligible";
    repairReason =
      "Mainboard replacement or catastrophic liquid repairs frequently exceed 50% of the device's second-hand working value. Obtain a written estimate before committing.";
  }

  const eligibleRepairProviders = repairEligibility === "excluded" ? [] : repairProviders;
  pathways.push({
    pathwayId: "repair",
    title: "Repair and Continue Using",
    eligibility: repairEligibility,
    eligibilityReason: repairReason,
    valueType: "repair_expense",
    valueDescription:
      "Expenditure required to restore utility. This is an investment in lifecycle extension, not a cash payout.",
    effortRequired: "Medium",
    speed: "Same day to 5 days",
    matchedProviders: eligibleRepairProviders,
    providerCoverageStatus: determineCoverageStatus(eligibleRepairProviders, cleanPincode),
    unknownsToConfirm: [
      "Exact cost of OEM or quality third-party replacement parts and technician labor.",
      "Whether the manufacturer pairs components with serialized software locks.",
      "Remaining operating system security update lifespan for this model.",
    ],
    nextAction:
      "Obtain a no-obligation diagnostic estimate and compare against 50% of the cost of a comparable working replacement.",
  });

  // --- PATHWAY 2: SELL FOR CASH (P2P OR DIRECT BUYBACK) ---
  const cashProviders = matchProvidersForService(
    "cash_buyback",
    input.categorySlug,
    input.condition,
    cleanPincode,
    approvedProviders
  );

  let cashEligibility: EvaluatedPathway["eligibility"] = "viable_alternative";
  let cashReason = "";

  if (input.categorySlug === "batteries-cables-peripherals") {
    cashEligibility = "excluded";
    cashReason =
      "Loose standard cables and adapters have negligible standalone second-hand resale value unless bundled with equipment.";
  } else if (input.condition === "major_fault") {
    cashEligibility = "excluded";
    cashReason =
      "Consumer marketplaces generally reject unbootable or severely damaged devices due to buyer dispute risks. Consider component salvagers instead.";
  } else if (input.condition === "working_recent") {
    if (input.priority === "maximise_money") {
      cashEligibility = "recommended_primary";
      cashReason =
        "Direct sale to another consumer captures true second-hand market value without middleman reseller deductions.";
    } else {
      cashEligibility = "viable_alternative";
      cashReason =
        "Yields the highest potential cash, but requires photography, listing management, and dispute handling.";
    }
  } else if (input.condition === "minor_fault") {
    cashEligibility = "viable_alternative";
    cashReason =
      "Viable if the flaw (e.g. cracked glass, battery wear) is disclosed transparently, or sold to a buyer willing to repair.";
  } else if (input.condition === "working_older") {
    cashEligibility = "viable_alternative";
    cashReason =
      "Older working computers and electronics have steady interest from budget students, hobbyists, and home-lab builders.";
  }

  const eligibleCashProviders = cashEligibility === "excluded" ? [] : cashProviders;
  pathways.push({
    pathwayId: "sell-cash",
    title: "Sell for Cash (Direct to Consumer or Buyback)",
    eligibility: cashEligibility,
    eligibilityReason: cashReason,
    valueType: "cash_payout",
    valueDescription:
      "Direct liquid cash payment. Requires managing listings and accepting payment dispute responsibilities.",
    effortRequired: "High",
    speed: "1 to 2 weeks",
    matchedProviders: eligibleCashProviders,
    providerCoverageStatus: determineCoverageStatus(eligibleCashProviders, cleanPincode),
    unknownsToConfirm: [
      "Current real-time clearance price on peer-to-peer marketplaces for your specific model and cosmetic grade.",
      "Marketplace transaction commissions (typically 10-15%) and insured postal courier rates.",
      "Buyer verification and dispute resolution terms.",
    ],
    nextAction:
      "Perform a hardware-backed cryptographic factory reset, remove all account locks (iCloud/FRP), photograph all cosmetic blemishes honestly, and list on a trusted marketplace.",
  });

  // --- PATHWAY 3: EXCHANGE FOR VOUCHER / TRADE-IN ---
  const exchangeProviders = matchProvidersForService(
    "exchange",
    input.categorySlug,
    input.condition,
    cleanPincode,
    approvedProviders
  );

  let exchangeEligibility: EvaluatedPathway["eligibility"] = "viable_alternative";
  let exchangeReason = "";

  if (
    input.categorySlug === "batteries-cables-peripherals" ||
    input.categorySlug === "home-appliances-small"
  ) {
    exchangeEligibility = "excluded";
    exchangeReason =
      "Manufacturer and retailer trade-in programs rarely accept standalone cables, peripherals, or small kitchen appliances for vouchers.";
  } else if (input.condition === "major_fault") {
    exchangeEligibility = "excluded";
    exchangeReason =
      "Most trade-in portals reject unbootable devices or impose complete valuation deductions.";
  } else if (input.priority === "minimise_effort" && input.condition === "working_recent") {
    exchangeEligibility = "recommended_primary";
    exchangeReason =
      "The fastest, lowest-friction route for recent working tech: prepaid courier shipping, instant quote valuation, and zero buyer communication.";
  } else if (input.condition === "minor_fault") {
    exchangeEligibility = "viable_alternative";
    exchangeReason =
      "Retailer trade-ins regularly accept minor cosmetic blemishes or screen cracks with standardised, predictable deductions.";
  } else if (input.condition === "working_older") {
    exchangeEligibility = "conditionally_eligible";
    exchangeReason =
      "Older models (over 4-5 years) often fall outside active trade-in catalogs or yield nominal promotional credits.";
  }

  const eligibleExchangeProviders = exchangeEligibility === "excluded" ? [] : exchangeProviders;
  pathways.push({
    pathwayId: "exchange-voucher",
    title: "Exchange for Voucher / Retailer Trade-in",
    eligibility: exchangeEligibility,
    eligibilityReason: exchangeReason,
    valueType: "exchange_voucher",
    valueDescription:
      "Store-locked gift card or new device discount. Cannot be withdrawn as liquid cash.",
    effortRequired: "Low",
    speed: "2 to 5 business days",
    matchedProviders: eligibleExchangeProviders,
    providerCoverageStatus: determineCoverageStatus(eligibleExchangeProviders, cleanPincode),
    unknownsToConfirm: [
      "Whether the inspection facility adjusts the quote downward upon physical arrival for minor scratches.",
      "Expiration dates and store restrictions on promotional vouchers.",
      "Whether the trade-in credit can be applied to items other than higher-tier new models.",
    ],
    nextAction:
      "Check official trade-in portals, record device serial numbers, disable remote security features, and photograph the device before sealing the package.",
  });

  // --- PATHWAY 4: SELL TO REFURBISHERS & COMPONENT BUYERS ---
  const componentProviders = matchProvidersForService(
    "component_recovery",
    input.categorySlug,
    input.condition,
    cleanPincode,
    approvedProviders
  );

  let componentEligibility: EvaluatedPathway["eligibility"] = "viable_alternative";
  let componentReason = "";

  const isModularCategory =
    input.categorySlug === "smartphones-tablets" ||
    input.categorySlug === "laptops-computers" ||
    input.categorySlug === "gaming-entertainment";

  if (!isModularCategory) {
    componentEligibility = "excluded";
    componentReason =
      "Countertop appliances, large white goods, and loose wiring have no active micro-component harvesting market.";
  } else if (input.condition === "major_fault") {
    if (input.priority === "maximise_money") {
      componentEligibility = "recommended_primary";
      componentReason =
        "While the system won't boot, intact sub-components (OEM display assembly, camera modules, chassis, and ICs) retain tangible salvage trade value for repair shops.";
    } else {
      componentEligibility = "viable_alternative";
      componentReason =
        "Recovers monetary value from devices deemed uneconomical to repair for personal use.";
    }
  } else if (input.condition === "minor_fault") {
    componentEligibility = "viable_alternative";
    componentReason =
      "Refurbishers purchase minor-fault hardware to recondition and resell with commercial warranties.";
  } else if (input.condition === "working_recent") {
    componentEligibility = "viable_alternative";
    componentReason =
      "Commercial refurbishers buy working equipment, but offer wholesale margins below direct consumer prices.";
  } else {
    componentEligibility = "conditionally_eligible";
    componentReason =
      "Salvage value for older hardware depends strictly on whether third-party repairers currently have donor requests.";
  }

  const eligibleComponentProviders = componentEligibility === "excluded" ? [] : componentProviders;
  pathways.push({
    pathwayId: "refurbishers-parts",
    title: "Sell to Refurbishers & Component Buyers",
    eligibility: componentEligibility,
    eligibilityReason: componentReason,
    valueType: "salvage_cash",
    valueDescription:
      "Salvage payout for usable donor assemblies. Lower than working market value but higher than material scrap.",
    effortRequired: "Low",
    speed: "3 to 7 days",
    matchedProviders: eligibleComponentProviders,
    providerCoverageStatus: determineCoverageStatus(eligibleComponentProviders, cleanPincode),
    unknownsToConfirm: [
      "Real-time spot market demand for replacement parts for your exact model revision.",
      "Verification that internal flash memory is verified wiped or physically destroyed.",
      "Ownership verification requirements to prevent intake of locked or stolen parts.",
    ],
    nextAction:
      "Disclose known faults accurately, verify on-board storage cannot be recovered, and obtain written salvage confirmation before shipping.",
  });

  // --- PATHWAY 5: DONATE OR TRANSFER FOR REUSE ---
  const donationProviders = matchProvidersForService(
    "donation_reuse",
    input.categorySlug,
    input.condition,
    cleanPincode,
    approvedProviders
  );

  let donationEligibility: EvaluatedPathway["eligibility"] = "viable_alternative";
  let donationReason = "";

  if (input.condition === "major_fault") {
    donationEligibility = "excluded";
    donationReason =
      "Non-profits, schools, and community charities lack micro-soldering labs and component budgets. Donating broken hardware creates disposal costs for charities.";
  } else if (input.categorySlug === "batteries-cables-peripherals") {
    donationEligibility = "conditionally_eligible";
    donationReason =
      "Cables and peripherals are accepted by community maker spaces or when bundled with functional computer systems.";
  } else if (input.condition === "working_older") {
    if (input.priority === "dispose_responsibly" || input.priority === "minimise_effort") {
      donationEligibility = "recommended_primary";
      donationReason =
        "Older functional laptops and monitors that feel slow for intensive tasks run effectively under lightweight Linux distributions or ChromeOS Flex, bridging community digital divides.";
    } else {
      donationEligibility = "viable_alternative";
      donationReason =
        "Provides direct social utility for community digital inclusion programs, though financial return is zero.";
    }
  } else if (input.condition === "minor_fault") {
    donationEligibility = "conditionally_eligible";
    donationReason =
      "Accepted ONLY if the community initiative or repair cafe has explicit in-house volunteer repair capacity.";
  } else {
    donationEligibility = "viable_alternative";
    donationReason =
      "Generates substantial social impact for education and community programs, though it foregoes secondary cash recovery.";
  }

  const eligibleDonationProviders = donationEligibility === "excluded" ? [] : donationProviders;
  pathways.push({
    pathwayId: "donate-reuse",
    title: "Donate or Transfer for Reuse",
    eligibility: donationEligibility,
    eligibilityReason: donationReason,
    valueType: "non_monetary_social",
    valueDescription:
      "Community digital inclusion benefit and tax receipt where applicable. Zero financial return.",
    effortRequired: "Medium",
    speed: "Immediate drop-off or scheduled collection",
    matchedProviders: eligibleDonationProviders,
    providerCoverageStatus: determineCoverageStatus(eligibleDonationProviders, cleanPincode),
    unknownsToConfirm: [
      "Confirm direct intake capacity: call or check charity website before visiting.",
      "Check whether matching original power adapters and cables are mandatory.",
      "For mains-powered appliances, check whether the charity requires formal electrical safety inspection.",
    ],
    nextAction:
      "Cryptographically wipe personal storage, clean the device exterior, bundle matching chargers, and confirm drop-off hours with the organisation.",
  });

  // --- PATHWAY 6: AUTHORISED RECYCLING ---
  const recyclingProviders = matchProvidersForService(
    "recycling",
    input.categorySlug,
    input.condition,
    cleanPincode,
    approvedProviders
  );

  let recyclingEligibility: EvaluatedPathway["eligibility"] = "viable_alternative";
  let recyclingReason = "";

  if (input.priority === "dispose_responsibly") {
    if (input.condition === "major_fault") {
      recyclingEligibility = "recommended_primary";
      recyclingReason =
        "Ensures regulated mechanical shredding, heavy metal isolation, and clean copper/gold reclamation under verified environmental standards.";
    } else if (input.condition === "working_older") {
      // Under statutory circular waste hierarchies, working older equipment has higher circular utility in reuse
      recyclingEligibility = "viable_alternative";
      recyclingReason =
        "Functional older equipment has higher environmental and community utility in reuse before terminal mechanical shredding.";
    } else {
      recyclingEligibility = "viable_alternative";
      recyclingReason =
        "Always available as an accredited environmental fallback, though working equipment has higher social and economic value in reuse.";
    }
  } else if (input.condition === "major_fault") {
    if (pathways.find((p) => p.eligibility === "recommended_primary") === undefined) {
      recyclingEligibility = "recommended_primary";
      recyclingReason =
        "When an item cannot be economically restored or sold for components, certified e-waste facilities ensure toxic fractions are legally contained.";
    } else {
      recyclingEligibility = "viable_alternative";
      recyclingReason =
        "Clean terminal recovery option if component buyers or refurbishers decline your specific model.";
    }
  } else {
    recyclingEligibility = "viable_alternative";
    recyclingReason =
      "Available as a regulated baseline when all reuse, resale, and donation options are exhausted.";
  }

  pathways.push({
    pathwayId: "authorised-recycling",
    title: "Hand Over to Authorised Recyclers",
    eligibility: recyclingEligibility,
    eligibilityReason: recyclingReason,
    valueType: "regulated_recycling",
    valueDescription:
      "Statutory compliance and safe material reclamation. Consumer compensation is generally zero or nominal scrap weight value.",
    effortRequired: "Low",
    speed: "Immediate drop-off or scheduled collection",
    matchedProviders: recyclingProviders,
    providerCoverageStatus: determineCoverageStatus(recyclingProviders, cleanPincode),
    unknownsToConfirm: [
      "Confirm the facility operates under statutory environmental permits (e.g. WEEE compliance or R2v3 / e-Stewards certification).",
      "Check whether domestic drop-offs are free of charge or require municipal resident permits.",
      "Ensure personal storage drives are physically punctured or degaussed if handing over sensitive data.",
    ],
    nextAction:
      "Locate your nearest verified public depot or authorised collection bin, insulate battery terminals, and drop off during operating hours.",
  });

  // Invariant Enforcement: Ensure exactly one recommended primary pathway exists
  const primaryCandidates = pathways.filter((p) => p.eligibility === "recommended_primary");

  if (primaryCandidates.length > 1) {
    // Select the single most appropriate primary according to user priority, and demote others to viable_alternative
    let chosenId = primaryCandidates[0].pathwayId;
    if (input.priority === "dispose_responsibly") {
      const hasDonation = primaryCandidates.some((p) => p.pathwayId === "donate-reuse");
      chosenId = hasDonation ? "donate-reuse" : primaryCandidates[0].pathwayId;
    } else if (input.priority === "maximise_money") {
      const hasCash = primaryCandidates.some((p) => p.pathwayId === "sell-cash");
      chosenId = hasCash ? "sell-cash" : primaryCandidates[0].pathwayId;
    } else if (input.priority === "minimise_effort") {
      const hasExchange = primaryCandidates.some((p) => p.pathwayId === "exchange-voucher");
      chosenId = hasExchange ? "exchange-voucher" : primaryCandidates[0].pathwayId;
    } else if (input.priority === "repair_keep") {
      const hasRepair = primaryCandidates.some((p) => p.pathwayId === "repair");
      chosenId = hasRepair ? "repair" : primaryCandidates[0].pathwayId;
    }

    for (const p of pathways) {
      if (p.pathwayId === chosenId) {
        p.eligibility = "recommended_primary";
      } else if (p.eligibility === "recommended_primary") {
        p.eligibility = "viable_alternative";
      }
    }
  } else if (primaryCandidates.length === 0) {
    const firstNonExcluded =
      pathways.find((p) => p.eligibility !== "excluded") || pathways[pathways.length - 1];

    let targetId = firstNonExcluded.pathwayId;
    if (input.priority === "maximise_money") {
      const best =
        pathways.find((p) => p.pathwayId === "sell-cash" && p.eligibility !== "excluded") ||
        pathways.find((p) => p.pathwayId === "refurbishers-parts" && p.eligibility !== "excluded");
      if (best) targetId = best.pathwayId;
    } else if (input.priority === "minimise_effort") {
      const best =
        pathways.find((p) => p.pathwayId === "exchange-voucher" && p.eligibility !== "excluded") ||
        pathways.find((p) => p.pathwayId === "authorised-recycling" && p.eligibility !== "excluded");
      if (best) targetId = best.pathwayId;
    } else if (input.priority === "repair_keep") {
      const best = pathways.find((p) => p.pathwayId === "repair" && p.eligibility !== "excluded");
      if (best) targetId = best.pathwayId;
    } else {
      const best =
        pathways.find((p) => p.pathwayId === "donate-reuse" && p.eligibility !== "excluded") ||
        pathways.find((p) => p.pathwayId === "authorised-recycling" && p.eligibility !== "excluded");
      if (best) targetId = best.pathwayId;
    }

    const targetPathway = pathways.find((p) => p.pathwayId === targetId);
    if (targetPathway && targetPathway.eligibility !== "excluded") {
      targetPathway.eligibility = "recommended_primary";
    }
  }

  const primaryPathway =
    pathways.find((p) => p.eligibility === "recommended_primary") || pathways[0];

  // Formulation of "Why this recommendation?" explanation
  const recommendationExplanation = generateRecommendationExplanation(
    primaryPathway,
    input,
    currentCategory.name
  );

  return {
    isHazardous: false,
    primaryPathwayId: primaryPathway.pathwayId,
    recommendationExplanation,
    pathways,
    unmatchedPincodeNotice:
      cleanPincode.length > 0 &&
      !pathways.some((p) => p.providerCoverageStatus === "matched_with_pincode")
        ? `No approved providers in our database currently document verified service for pincode "${cleanPincode}". Local operators may exist, but we do not have an independently verified record on file. Area coverage is never inferred from state presence.`
        : undefined,
  };
}

/**
 * Filter approved providers strictly by service, category, condition, and optional pincode.
 * No regional or state-level inference.
 */
function matchProvidersForService(
  serviceType: string,
  categorySlug: string,
  condition: string,
  pincode: string,
  providers: ProviderWithDetails[]
): MatchedProviderInfo[] {
  const matching: MatchedProviderInfo[] = [];

  for (const provider of providers) {
    if (provider.approval_status !== "approved") continue;

    // Consumer single-device scope: if provider requires bulk / institutional quantity (> 1),
    // they cannot fulfill a single-device consumer query.
    if (provider.minimum_quantity && provider.minimum_quantity > 1) {
      continue;
    }

    // Check service support
    const offersService = provider.services.some(
      (s) => s.service_type === serviceType
    );
    if (!offersService) continue;

    // Service-specific category and condition guardrails
    if (serviceType === "exchange") {
      // Standalone peripherals/cables and small appliances have zero voucher trade-in programs
      if (
        categorySlug === "batteries-cables-peripherals" ||
        categorySlug === "home-appliances-small"
      ) {
        continue;
      }
      // Unbootable or catastrophically faulted devices cannot be traded in for voucher credit
      if (condition === "major_fault" || condition === "unsafe_hazardous") {
        continue;
      }
    }

    if (serviceType === "cash_buyback") {
      if (categorySlug === "batteries-cables-peripherals") {
        continue;
      }
      if (condition === "major_fault" || condition === "unsafe_hazardous") {
        continue;
      }
    }

    if (serviceType === "donation_reuse") {
      // Non-profits strictly reject damaged, non-booting, or hazardous electricals
      if (condition !== "working_recent" && condition !== "working_older") {
        continue;
      }
    }

    if (serviceType === "repair") {
      if (categorySlug === "batteries-cables-peripherals") {
        continue; // Loose cables/peripherals are not economical for diagnostic repair
      }
      if (condition === "unsafe_hazardous") {
        continue; // Swollen/leaking batteries are barred from routine repair
      }
    }

    // Check category support
    const categoryRecord = provider.accepted_categories.find(
      (c) => c.category_slug === categorySlug
    );
    if (!categoryRecord) continue;

    // Check condition support
    if (condition === "unsafe_hazardous") {
      // Swollen or damaged cells require explicit documented hazardous capability
      if (
        !categoryRecord.accepted_conditions ||
        !categoryRecord.accepted_conditions.includes("unsafe_hazardous")
      ) {
        continue;
      }
    } else {
      // Non-hazardous: if accepted_conditions is specified, condition must be listed
      if (
        categoryRecord.accepted_conditions &&
        categoryRecord.accepted_conditions.length > 0 &&
        !categoryRecord.accepted_conditions.includes(condition)
      ) {
        continue;
      }
    }

    // Check location/pincode matching strictly
    let pincodeMatched = false;
    let dropoffAddress: string | null = null;
    let locationPickup = provider.offers_pickup;
    let locationDropoff = provider.offers_dropoff;

    if (pincode.length > 0) {
      if (!provider.service_areas || provider.service_areas.length === 0) {
        // Provider has no documented service areas -> does not match specific pincode query
        continue;
      }

      const areaMatch = provider.service_areas.find((area) => {
        const code = area.location_code?.trim() || "";
        return code.toLowerCase() === pincode.toLowerCase();
      });

      if (!areaMatch) {
        // Provider documents areas, but not this pincode -> strict exclusion
        continue;
      }

      pincodeMatched = true;
      locationPickup = Boolean(provider.offers_pickup && areaMatch.supports_pickup);
      locationDropoff = Boolean(provider.offers_dropoff && areaMatch.supports_dropoff);
      dropoffAddress = areaMatch.dropoff_address || provider.dropoff_details || null;

      // If neither pickup nor drop-off is supported for this exact pincode,
      // this provider cannot physically fulfill an intake for this user.
      if (!locationPickup && !locationDropoff) {
        continue;
      }
    } else {
      // No pincode requested: include documented drop-off address if available
      if (!provider.offers_pickup && !provider.offers_dropoff) {
        continue;
      }
      const firstAreaWithAddress = provider.service_areas?.find(
        (a) => a.dropoff_address
      );
      dropoffAddress = firstAreaWithAddress?.dropoff_address || provider.dropoff_details || null;
    }

    const srvRecord = provider.services.find(
      (s) => s.service_type === serviceType
    );

    matching.push({
      id: provider.id,
      name: provider.name,
      slug: provider.slug,
      organisationType: provider.organisation_type,
      verificationStatus: provider.verification_status,
      quoteType: provider.quote_type,
      offersPickup: locationPickup,
      offersDropoff: locationDropoff,
      dropoffAddress,
      websiteUrl: provider.website_url || null,
      sourceEvidenceUrl: provider.source_evidence_url || null,
      lastCheckedAt: provider.last_checked_at || null,
      minimumQuantity: provider.minimum_quantity || null,
      eligibilityRestrictions: provider.eligibility_restrictions || null,
      pincodeMatched,
      serviceDescription: srvRecord?.service_description || null,
      isSampleData: provider.is_sample_data,
    });
  }

  return matching;
}

function determineCoverageStatus(
  matched: MatchedProviderInfo[],
  pincode: string
): EvaluatedPathway["providerCoverageStatus"] {
  if (matched.length > 0) {
    return pincode.length > 0 ? "matched_with_pincode" : "matched_without_pincode";
  }
  return pincode.length > 0 ? "no_pincode_coverage" : "no_providers_documented";
}

function generateRecommendationExplanation(
  primaryPathway: EvaluatedPathway,
  input: ComparisonInput,
  categoryName: string
): string {
  const modelNote = input.deviceModel?.trim()
    ? ` for your ${input.deviceModel.trim()}`
    : ` for ${categoryName}`;

  switch (primaryPathway.pathwayId) {
    case "repair":
      return `Based on an isolated fault condition, targeted repair${modelNote} is recommended because fixing the defective component typically retains the greatest utility without the heavy depreciation of buying new equipment.`;
    case "sell-cash":
      return `Given your priority to maximise cash recovery and your device's working operational state, peer-to-peer or direct buyback${modelNote} captures true market value without intermediary holding discounts.`;
    case "exchange-voucher":
      return `Given your priority to minimise effort, a structured trade-in${modelNote} provides guaranteed courier collection, instant quote evaluation, and zero buyer dispute overhead.`;
    case "refurbishers-parts":
      return `Because the device has sustained major hardware failure, liquid damage, or unbootable boards${modelNote}, liquidating intact sub-assemblies to component refurbishers rescues monetary value where standard consumer sale is impossible.`;
    case "donate-reuse":
      return `Older working technology${modelNote} retains high community utility. Redistributing it to non-profits or schools bridges digital inclusion gaps where second-hand commercial resale yields minimal return.`;
    case "authorised-recycling":
      return `For irreparable, obsolete, or chemically sensitive equipment${modelNote}, accredited e-waste processing guarantees statutory compliance, hazardous fraction isolation, and regulated resource recovery.`;
    default:
      return `Evaluated as the most viable route matching your hardware state and stated priority.`;
  }
}
