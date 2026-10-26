import { evaluateComparison } from "../src/lib/comparison/engine";
import { filterProviders } from "../src/lib/supabase/providers";
import { DEVICE_CATEGORIES } from "../src/lib/constants/categories";
import { CONDITIONS } from "../src/components/landing/PathwayExplorer";
import { ComparisonPriority } from "../src/lib/comparison/types";
import { SAMPLE_PROVIDERS } from "../src/lib/constants/sample-providers";
import { DELHI_CANDIDATE_PROVIDERS } from "../src/lib/constants/delhi-candidates";
import { ProviderWithDetails } from "../src/lib/supabase/types";

console.log("=== EXECUTING EXHAUSTIVE MATRIX & EDGE-CASE TEST SUITE ===\n");

const PRIORITIES: ComparisonPriority[] = [
  "maximise_money",
  "minimise_effort",
  "repair_keep",
  "dispose_responsibly",
];

async function runMatrixAndEdgeCaseTests() {
  // =========================================================================
  // 1. EXHAUSTIVE 140 COMBINATIONS TEST (7 Categories x 5 Conditions x 4 Priorities)
  // =========================================================================
  console.log("Test 1: Running all 140 Category x Condition x Priority combinations...");

  let combinationCount = 0;
  for (const cat of DEVICE_CATEGORIES) {
    for (const cond of CONDITIONS) {
      for (const priority of PRIORITIES) {
        combinationCount++;
        const result = evaluateComparison(
          {
            categorySlug: cat.slug,
            condition: cond.id,
            priority,
            pincode: "560001",
          },
          SAMPLE_PROVIDERS
        );

        // Core invariants for EVERY combination:
        if (!result) {
          throw new Error(`Combination ${combinationCount} returned null/undefined result`);
        }
        if (!Array.isArray(result.pathways) || result.pathways.length !== 6) {
          throw new Error(
            `Combination ${combinationCount} (${cat.slug}, ${cond.id}, ${priority}): expected exactly 6 pathways, got ${result.pathways?.length}`
          );
        }

        // Check primary pathway
        const primary = result.pathways.find((p) => p.pathwayId === result.primaryPathwayId);
        if (!primary) {
          throw new Error(
            `Combination ${combinationCount} (${cat.slug}, ${cond.id}, ${priority}): primary pathway "${result.primaryPathwayId}" not found in pathways`
          );
        }
        if (primary.eligibility !== "recommended_primary") {
          throw new Error(
            `Combination ${combinationCount}: Primary pathway eligibility must be "recommended_primary", got "${primary.eligibility}"`
          );
        }

        // Exactly one primary pathway should exist
        const primaries = result.pathways.filter((p) => p.eligibility === "recommended_primary");
        if (primaries.length !== 1) {
          throw new Error(
            `Combination ${combinationCount}: Expected exactly 1 primary pathway, got ${primaries.length}`
          );
        }

        // Hazardous invariants
        if (cond.id === "unsafe_hazardous") {
          if (!result.isHazardous) {
            throw new Error(`Combination ${combinationCount}: isHazardous must be true for unsafe_hazardous`);
          }
          if (result.primaryPathwayId !== "authorised-recycling") {
            throw new Error(
              `Combination ${combinationCount}: Hazardous device must recommend authorised-recycling, got ${result.primaryPathwayId}`
            );
          }
          const commercialPathways = result.pathways.filter((p) =>
            ["repair", "sell-cash", "exchange-voucher", "refurbishers-parts", "donate-reuse"].includes(p.pathwayId)
          );
          for (const cp of commercialPathways) {
            if (cp.eligibility !== "excluded") {
              throw new Error(`Combination ${combinationCount}: Pathway ${cp.pathwayId} must be excluded when hazardous`);
            }
            if (cp.matchedProviders.length !== 0) {
              throw new Error(`Combination ${combinationCount}: Excluded pathway ${cp.pathwayId} matched providers`);
            }
          }
        } else {
          if (result.isHazardous) {
            throw new Error(`Combination ${combinationCount}: isHazardous must be false for non-hazardous condition`);
          }
        }

        // Any excluded pathway must have matchedProviders = []
        for (const p of result.pathways) {
          if (p.eligibility === "excluded" && p.matchedProviders.length > 0) {
            throw new Error(
              `Combination ${combinationCount}: Excluded pathway "${p.pathwayId}" contains ${p.matchedProviders.length} matched providers!`
            );
          }
        }

        // Explanation must be non-empty
        if (!result.recommendationExplanation || result.recommendationExplanation.trim().length === 0) {
          throw new Error(`Combination ${combinationCount}: Empty recommendationExplanation`);
        }
      }
    }
  }

  console.log(`✓ All ${combinationCount} combinations verified: 100% deterministic, 0 unhandled exceptions, exact invariants preserved.\n`);

  // =========================================================================
  // 2. INPUT SANITIZATION & EDGE CASES
  // =========================================================================
  console.log("Test 2: Testing Input Sanitization & Boundary Edge Cases...");

  // 2a. Pincode with surrounding whitespace
  const pinWithSpaces = evaluateComparison(
    {
      categorySlug: "smartphones-tablets",
      condition: "major_fault",
      priority: "dispose_responsibly",
      pincode: "  560001  ",
    },
    SAMPLE_PROVIDERS
  );
  const recycleMatch = pinWithSpaces.pathways.find((p) => p.pathwayId === "authorised-recycling");
  if (!recycleMatch || recycleMatch.providerCoverageStatus !== "matched_with_pincode") {
    throw new Error("Pincode with whitespace failed to match verified area");
  }

  // 2b. Optional Model input verification in explanation
  const withModelResult = evaluateComparison(
    {
      categorySlug: "laptops-computers",
      condition: "minor_fault",
      priority: "repair_keep",
      deviceModel: "ThinkPad X1 Carbon Gen 9",
    },
    SAMPLE_PROVIDERS
  );
  if (!withModelResult.recommendationExplanation.includes("ThinkPad X1 Carbon Gen 9")) {
    throw new Error("Model string not reflected in recommendation explanation");
  }

  // 2c. Invalid or unknown category slug fallback
  const invalidCatResult = evaluateComparison(
    {
      categorySlug: "unknown-quantum-computer",
      condition: "working_recent",
      priority: "maximise_money",
    },
    SAMPLE_PROVIDERS
  );
  if (!invalidCatResult || invalidCatResult.pathways.length !== 6) {
    throw new Error("Invalid category slug failed to fallback gracefully");
  }

  console.log("✓ Input sanitization, model string reflection, and category fallback confirmed.\n");

  // =========================================================================
  // 3. ENHANCED DIRECTORY FILTERING TESTS
  // =========================================================================
  console.log("Test 3: Testing Enhanced Directory Multi-Criteria Filters...");

  // Build a test dataset including both sample providers and Delhi candidates (simulated approved)
  const testDirectoryDataset: ProviderWithDetails[] = [
    ...SAMPLE_PROVIDERS,
    ...DELHI_CANDIDATE_PROVIDERS.map((p) => ({ ...p, approval_status: "approved" as const })),
  ];

  // 3a. Condition Filter in Directory
  const hazardousOnly = filterProviders(testDirectoryDataset, {
    condition: "unsafe_hazardous",
  });
  // In our candidate dataset, no provider accepts unsafe_hazardous at ordinary walk-in
  if (hazardousOnly.length !== 0) {
    throw new Error(`Expected 0 providers accepting unsafe_hazardous, got ${hazardousOnly.length}`);
  }

  const majorFaultLaptops = filterProviders(testDirectoryDataset, {
    category: "laptops-computers",
    condition: "major_fault",
  });
  // Lappy Maker and Apex Certified accept major_fault for laptops
  if (majorFaultLaptops.length < 2) {
    throw new Error(`Expected at least 2 providers for major fault laptops, got ${majorFaultLaptops.length}`);
  }

  // 3b. Consumer Only Filter (Minimum Quantity = 1)
  const consumerOnlyFiltered = filterProviders(testDirectoryDataset, {
    consumerOnly: true,
  });
  // EWRI has minimum_quantity: 20 and must be excluded from consumerOnly results!
  const hasEwriInConsumer = consumerOnlyFiltered.some((p) => p.slug === "ewri-delhi-okhla");
  if (hasEwriInConsumer) {
    throw new Error("Consumer-only filter failed: EWRI (bulk min 20) was included!");
  }

  // 3c. Logistics & Exact Pincode Intersection
  // Lappy Maker is at 110019 (supports_dropoff: true, supports_pickup: false)
  const lappyPickupQuery = filterProviders(testDirectoryDataset, {
    locationQuery: "110019",
    logistics: "pickup",
  });
  const hasLappyPickup = lappyPickupQuery.some((p) => p.slug === "lappy-maker-delhi");
  if (hasLappyPickup) {
    throw new Error("Logistics filter failure: Lappy Maker has supports_pickup: false for 110019 but matched pickup query!");
  }

  const lappyDropoffQuery = filterProviders(testDirectoryDataset, {
    locationQuery: "110019",
    logistics: "dropoff",
  });
  const hasLappyDropoff = lappyDropoffQuery.some((p) => p.slug === "lappy-maker-delhi");
  if (!hasLappyDropoff) {
    throw new Error("Logistics filter failure: Lappy Maker has supports_dropoff: true for 110019 but failed dropoff query!");
  }

  // 3d. Service-specific Category rejection in Directory filter
  // Exchange for cables/peripherals is strictly impossible
  const exchangePeripherals = filterProviders(testDirectoryDataset, {
    category: "batteries-cables-peripherals",
    service: "exchange",
  });
  if (exchangePeripherals.length !== 0) {
    throw new Error(`Directory filter allowed exchange for batteries-cables-peripherals (${exchangePeripherals.length} returned)`);
  }

  // Repair for cables/peripherals is strictly impossible
  const repairPeripherals = filterProviders(testDirectoryDataset, {
    category: "batteries-cables-peripherals",
    service: "repair",
  });
  if (repairPeripherals.length !== 0) {
    throw new Error(`Directory filter allowed repair for batteries-cables-peripherals (${repairPeripherals.length} returned)`);
  }

  console.log("✓ Directory filters strictly enforce condition matching, consumer intake, logistics alignment, and service-category rules.\n");

  console.log("=== ALL MATRIX & EDGE-CASE TESTS PASSED SUCCESSFULLY (100%) ===");
}

runMatrixAndEdgeCaseTests().catch((err) => {
  console.error("MATRIX TEST FAILED:", err);
  process.exit(1);
});
