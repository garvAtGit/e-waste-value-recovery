import { evaluateComparison } from "../src/lib/comparison/engine";
import { DELHI_CANDIDATE_PROVIDERS } from "../src/lib/constants/delhi-candidates";
import { ProviderWithDetails } from "../src/lib/supabase/types";

console.log("=== EXECUTING RECONCILED DELHI PILOT SCENARIOS & EVIDENCE TEST SUITE ===\n");

// NCR benchmark record (Gurugram, Haryana) to test strict geographical boundary separation
const NCR_SHATTERFIX_FIXTURE: ProviderWithDetails = {
  id: "a0122001-0007-4000-8000-000000000007",
  name: "ShatterFix (Gurugram Facility)",
  slug: "shatterfix-gurgaon-ncr",
  description: "Third-party gadget repair facility located in Haryana (NCR).",
  organisation_type: "repair_service",
  website_url: "https://shatterfix.com",
  source_evidence_url: "https://shatterfix.com/contact-us",
  evidence_notes: "Physical facility located in Gurugram, Haryana (122001). Operates courier pickup across India; no Delhi walk-in counter.",
  verification_status: "partially_verified",
  approval_status: "pending_review",
  quote_type: "indicative_estimate",
  offers_pickup: true,
  offers_dropoff: true,
  pickup_details: "Doorstep courier pickup across NCR and nationwide.",
  dropoff_details: "SF-11, 2nd Floor, Omaxe Celebration Mall, Sohna Road, Sector 48, Gurgaon 122001 (Haryana).",
  minimum_quantity: 1,
  eligibility_restrictions: "Consumer gadgets. Swollen batteries rejected.",
  last_checked_at: "2026-10-26T00:00:00Z",
  is_sample_data: false,
  created_at: "2026-10-26T00:00:00Z",
  updated_at: "2026-10-26T00:00:00Z",
  services: [
    {
      id: "b0122001-0007-4000-8000-000000000001",
      provider_id: "a0122001-0007-4000-8000-000000000007",
      service_type: "repair",
      service_description: "Phone and gadget screen, port, and component repair.",
      created_at: "2026-10-26T00:00:00Z",
    },
  ],
  accepted_categories: [
    {
      id: "c0122001-0007-4000-8000-000000000001",
      provider_id: "a0122001-0007-4000-8000-000000000007",
      category_slug: "smartphones-tablets",
      accepted_conditions: ["minor_fault", "major_fault"],
      created_at: "2026-10-26T00:00:00Z",
    },
  ],
  service_areas: [
    {
      id: "d0122001-0007-4000-8000-000000000001",
      provider_id: "a0122001-0007-4000-8000-000000000007",
      area_type: "pincode",
      location_code: "122001",
      location_name: "Gurugram Sector 48 122001 (NCR)",
      supports_pickup: true,
      supports_dropoff: true,
      dropoff_address: "SF-11, Omaxe Celebration Mall, Sohna Road, Sector 48, Gurgaon 122001",
      created_at: "2026-10-26T00:00:00Z",
    },
  ],
};

// Simulation dataset: candidate records with approval_status simulated as "approved"
const SIMULATED_APPROVED_DELHI_DATA: ProviderWithDetails[] = [
  ...DELHI_CANDIDATE_PROVIDERS.map((p) => ({
    ...p,
    approval_status: "approved" as const,
  })),
  {
    ...NCR_SHATTERFIX_FIXTURE,
    approval_status: "approved" as const,
  },
];

async function runReconciledDelhiPilotTests() {
  // Test 1: Candidate Governance & Pending Review Quarantine
  // In the live application, candidates in DELHI_CANDIDATE_PROVIDERS have approval_status = "pending_review".
  // The comparison engine must match ZERO candidates when evaluated with unapproved records.
  console.log("Test 1: Testing Pending Review Protection (unapproved candidates must not match)...");
  const t1 = evaluateComparison(
    {
      categorySlug: "smartphones-tablets",
      condition: "working_recent",
      priority: "maximise_money",
      pincode: "110001",
    },
    DELHI_CANDIDATE_PROVIDERS // Raw candidate dataset (all pending_review)
  );

  const t1Cash = t1.pathways.find((p) => p.pathwayId === "sell-cash");
  if (t1Cash?.matchedProviders.length !== 0) {
    throw new Error(
      `Test 1 failed: Expected 0 matched providers for pending_review candidates, got ${t1Cash?.matchedProviders.length}`
    );
  }
  console.log("✓ Test 1: Candidate governance confirmed: Unapproved candidate records strictly return 0 matches.\n");

  // Test 2: Exact-Pincode Matching in Delhi Central 110001 (Simulated Approved Candidate)
  console.log("Test 2: Testing Exact-Pincode Matching in Delhi Central (110001)...");
  const t2 = evaluateComparison(
    {
      categorySlug: "smartphones-tablets",
      condition: "working_recent",
      priority: "maximise_money",
      pincode: "110001",
    },
    SIMULATED_APPROVED_DELHI_DATA
  );

  const t2Cash = t2.pathways.find((p) => p.pathwayId === "sell-cash");
  if (!t2Cash || t2Cash.matchedProviders.length !== 1) {
    throw new Error(`Test 2 failed: Expected 1 matched provider, got ${t2Cash?.matchedProviders.length}`);
  }
  const cashifyMatch = t2Cash.matchedProviders[0];
  if (cashifyMatch.slug !== "cashify-delhi") {
    throw new Error(`Test 2 failed: Expected cashify-delhi, got ${cashifyMatch.slug}`);
  }
  if (cashifyMatch.isSampleData !== false) {
    throw new Error("Test 2 failed: Candidate must have isSampleData = false");
  }
  console.log("✓ Test 2: Correctly matched Cashify Rajiv Chowk for exact pincode 110001 with isSampleData = false.\n");

  // Test 3: Clear Distinction between Delhi and NCR Destinations
  // ShatterFix is in Gurugram 122001 (NCR). Querying Delhi 110001 must NOT match ShatterFix.
  console.log("Test 3: Testing Delhi vs NCR Separation (Gurugram 122001 excluded from Delhi 110001)...");
  const t3 = evaluateComparison(
    {
      categorySlug: "smartphones-tablets",
      condition: "minor_fault",
      priority: "repair_keep",
      pincode: "110001",
    },
    SIMULATED_APPROVED_DELHI_DATA
  );

  const t3Repair = t3.pathways.find((p) => p.pathwayId === "repair");
  const matchedShatterFix = t3Repair?.matchedProviders.some((p) => p.slug === "shatterfix-gurgaon-ncr");
  if (matchedShatterFix) {
    throw new Error("Test 3 failed: ShatterFix (Gurugram 122001) must NOT match Delhi 110001 query!");
  }
  console.log("✓ Test 3: Strict boundary preserved: NCR provider excluded from Delhi query.\n");

  // Test 4: Service-Specific Category & Condition Separation (Nehru Place 110019)
  // Lappy Maker accepts laptops for hardware repair. Cashify kiosk only accepts phones.
  console.log("Test 4: Testing Service-Specific Category Separation (Laptop in Nehru Place 110019)...");
  const t4 = evaluateComparison(
    {
      categorySlug: "laptops-computers",
      condition: "minor_fault",
      priority: "repair_keep",
      pincode: "110019",
    },
    SIMULATED_APPROVED_DELHI_DATA
  );

  const t4Repair = t4.pathways.find((p) => p.pathwayId === "repair");
  if (!t4Repair || t4Repair.matchedProviders.length !== 1) {
    throw new Error(`Test 4 failed: Expected 1 provider (Lappy Maker), got ${t4Repair?.matchedProviders.length}`);
  }
  if (t4Repair.matchedProviders[0].slug !== "lappy-maker-delhi") {
    throw new Error(`Test 4 failed: Expected lappy-maker-delhi, got ${t4Repair.matchedProviders[0].slug}`);
  }
  console.log("✓ Test 4: Cashify kiosk correctly excluded for laptops; Lappy Maker correctly matched for laptop hardware.\n");

  // Test 5: Exact-Pincode Pickup vs Drop-off Distinction
  // Lappy Maker has a workshop in 110019 (supports_dropoff: true), but arbitrary pincode pickup is unconfirmed (supports_pickup: false).
  console.log("Test 5: Testing Exact-Pincode Pickup Discipline (Lappy Maker in 110019)...");
  const lappyMatch = t4Repair.matchedProviders[0];
  if (lappyMatch.offersPickup !== false) {
    throw new Error("Test 5 failed: Lappy Maker offersPickup must be false because arbitrary pickup pincodes are unconfirmed");
  }
  if (lappyMatch.offersDropoff !== true) {
    throw new Error("Test 5 failed: Lappy Maker offersDropoff must be true for Nehru Place workshop");
  }
  if (!lappyMatch.dropoffAddress?.includes("Madhuban")) {
    throw new Error("Test 5 failed: Drop-off address must reference Madhuban Building");
  }
  console.log("✓ Test 5: Pickup vs drop-off cleanly separated: Workshop drop-off confirmed, pickup unconfirmed without pincode SLA.\n");

  // Test 6: Hazardous Swollen Battery Safety Override & Refusal to Claim Recycler Availability
  console.log("Test 6: Testing Swollen Battery Safety Override in Delhi 110001...");
  const t6 = evaluateComparison(
    {
      categorySlug: "smartphones-tablets",
      condition: "unsafe_hazardous",
      priority: "maximise_money",
      pincode: "110001",
    },
    SIMULATED_APPROVED_DELHI_DATA
  );

  if (!t6.isHazardous) {
    throw new Error("Test 6 failed: isHazardous flag must be true");
  }
  if (t6.primaryPathwayId !== "authorised-recycling") {
    throw new Error(`Test 6 failed: Primary pathway must be authorised-recycling, got ${t6.primaryPathwayId}`);
  }
  const commercialPathways = t6.pathways.filter((p) =>
    ["sell-cash", "exchange-voucher", "donate-reuse", "repair"].includes(p.pathwayId)
  );
  for (const cp of commercialPathways) {
    if (cp.eligibility === "eligible") {
      throw new Error(`Test 6 failed: Commercial pathway ${cp.pathwayId} must be excluded for hazardous device`);
    }
  }
  // Crucial check: Neither Cashify, Croma, nor Apple accept swollen batteries at walk-in counters.
  const t6Recycling = t6.pathways.find((p) => p.pathwayId === "authorised-recycling");
  if (t6Recycling?.matchedProviders.length !== 0) {
    throw new Error(
      `Test 6 failed: Recycler count must be 0 for hazardous battery in 110001, got ${t6Recycling?.matchedProviders.length}`
    );
  }
  if (!t6Recycling.title.includes("No verified local provider on record")) {
    throw new Error(`Test 6 failed: Title must declare no verified provider on record, got "${t6Recycling.title}"`);
  }
  console.log("✓ Test 6: Hazardous safety override verified: Commercial pathways blocked, zero false recycler claims.\n");

  // Test 7: EWRI Corporate Office Intake Audit (Okhla 110020)
  // A consumer query in 110020 for recycling must NOT claim EWRI A-46 Okhla is a verified consumer drop-off depot,
  // because A-46 Okhla is a corporate office with unconfirmed individual intake (supports_dropoff: false).
  console.log("Test 7: Testing EWRI Corporate Office Audit (Okhla 110020 has NO verified consumer drop-off)...");
  const t7 = evaluateComparison(
    {
      categorySlug: "batteries-cables-peripherals",
      condition: "major_fault",
      priority: "dispose_responsibly",
      pincode: "110020",
    },
    SIMULATED_APPROVED_DELHI_DATA
  );

  const t7Recycling = t7.pathways.find((p) => p.pathwayId === "authorised-recycling");
  const ewriMatch = t7Recycling?.matchedProviders.find((p) => p.slug === "ewri-delhi-okhla");
  if (ewriMatch) {
    // If EWRI matched, it must NOT claim consumer drop-off is supported!
    if (ewriMatch.offersDropoff !== false) {
      throw new Error("Test 7 failed: EWRI offersDropoff must be false (corporate office; consumer walk-in unconfirmed)");
    }
  }
  console.log("✓ Test 7: EWRI A-46 Okhla accurately audited as corporate office without false consumer walk-in drop-off claims.\n");

  // Test 8: Apple Saket Multi-Pathway Evaluation in Saket 110017
  console.log("Test 8: Testing Apple Saket Multi-Pathway Evaluation (Saket 110017)...");
  // 8a: Trade-in for working recent iPhone
  const t8TradeIn = evaluateComparison(
    {
      categorySlug: "smartphones-tablets",
      condition: "working_recent",
      priority: "minimise_effort",
      pincode: "110017",
    },
    SIMULATED_APPROVED_DELHI_DATA
  );
  const t8Exchange = t8TradeIn.pathways.find((p) => p.pathwayId === "exchange-voucher");
  const appleExchangeMatch = t8Exchange?.matchedProviders.find((p) => p.slug === "apple-saket-delhi");
  if (!appleExchangeMatch) {
    throw new Error("Test 8a failed: Expected Apple Saket to match exchange in 110017");
  }
  if (!appleExchangeMatch.dropoffAddress?.includes("Select CITYWALK")) {
    throw new Error("Test 8a failed: Expected Select CITYWALK address for Apple Saket");
  }

  // 8b: Genius Bar repair for broken Mac
  const t8Repair = evaluateComparison(
    {
      categorySlug: "laptops-computers",
      condition: "minor_fault",
      priority: "repair_keep",
      pincode: "110017",
    },
    SIMULATED_APPROVED_DELHI_DATA
  );
  const t8GeniusBar = t8Repair.pathways.find((p) => p.pathwayId === "repair");
  const appleRepairMatch = t8GeniusBar?.matchedProviders.find((p) => p.slug === "apple-saket-delhi");
  if (!appleRepairMatch) {
    throw new Error("Test 8b failed: Expected Apple Saket to match repair in 110017");
  }

  // 8c: Free drop-off recycling for zero-value peripherals
  const t8Recycle = evaluateComparison(
    {
      categorySlug: "batteries-cables-peripherals",
      condition: "major_fault",
      priority: "dispose_responsibly",
      pincode: "110017",
    },
    SIMULATED_APPROVED_DELHI_DATA
  );
  const t8AppleRecycle = t8Recycle.pathways.find((p) => p.pathwayId === "authorised-recycling");
  const appleRecycleMatch = t8AppleRecycle?.matchedProviders.find((p) => p.slug === "apple-saket-delhi");
  if (!appleRecycleMatch) {
    throw new Error("Test 8c failed: Expected Apple Saket to match free recycling drop-off in 110017");
  }
  console.log("✓ Test 8: Apple Saket verified across exchange, repair, and recycling in 110017.\n");

  // Test 9: Goonj Donation Condition Integrity in Madanpur Khadar 110076
  console.log("Test 9: Testing Goonj Condition Rejection (Madanpur Khadar 110076)...");
  // 9a: Broken laptop (major_fault) must NOT match Goonj
  const t9Broken = evaluateComparison(
    {
      categorySlug: "laptops-computers",
      condition: "major_fault",
      priority: "dispose_responsibly",
      pincode: "110076",
    },
    SIMULATED_APPROVED_DELHI_DATA
  );
  const t9BrokenDonation = t9Broken.pathways.find((p) => p.pathwayId === "donate-reuse");
  if (t9BrokenDonation?.matchedProviders.length !== 0) {
    throw new Error("Test 9a failed: Goonj must NOT match major_fault laptop for donation");
  }

  // 9b: Working older laptop DOES match Goonj
  const t9Working = evaluateComparison(
    {
      categorySlug: "laptops-computers",
      condition: "working_older",
      priority: "dispose_responsibly",
      pincode: "110076",
    },
    SIMULATED_APPROVED_DELHI_DATA
  );
  const t9WorkingDonation = t9Working.pathways.find((p) => p.pathwayId === "donate-reuse");
  const goonjMatch = t9WorkingDonation?.matchedProviders.find((p) => p.slug === "goonj-delhi-reuse");
  if (!goonjMatch) {
    throw new Error("Test 9b failed: Expected Goonj to match working_older laptop for donation");
  }
  if (goonjMatch.offersPickup !== false) {
    throw new Error("Test 9b failed: Goonj offersPickup must be false (household pickup strictly not provided)");
  }
  console.log("✓ Test 9: Goonj condition integrity confirmed: Non-working devices rejected, working units accepted with no-pickup rule.\n");

  // Test 10: Service-Specific Eligibility Regression: Croma Damaged Peripheral in 110001
  // Peripheral with major fault in 110001:
  // - MUST match Croma for authorised-recycling (in-store bin).
  // - MUST NOT receive an exchange voucher recommendation; exchange-voucher matchedProviders MUST be 0.
  console.log("Test 10: Service-Specific Eligibility Regression (Croma Peripheral in 110001)...");
  const t10 = evaluateComparison(
    {
      categorySlug: "batteries-cables-peripherals",
      condition: "major_fault",
      priority: "maximise_money",
      pincode: "110001",
    },
    SIMULATED_APPROVED_DELHI_DATA
  );

  const t10Exchange = t10.pathways.find((p) => p.pathwayId === "exchange-voucher");
  if (!t10Exchange || t10Exchange.eligibility !== "excluded") {
    throw new Error("Test 10 failed: exchange-voucher must be excluded for damaged peripherals");
  }
  if (t10Exchange.matchedProviders.length !== 0) {
    throw new Error(
      `Test 10 failed: Damaged peripheral must have 0 matched exchange providers, got ${t10Exchange.matchedProviders.length}`
    );
  }
  const t10Recycling = t10.pathways.find((p) => p.pathwayId === "authorised-recycling");
  const cromaRecycleMatch = t10Recycling?.matchedProviders.find((p) => p.slug === "croma-delhi");
  if (!cromaRecycleMatch) {
    throw new Error("Test 10 failed: Expected Croma to match recycling for peripheral in 110001");
  }
  console.log("✓ Test 10: Croma peripheral correctly matched for recycling bin but strictly excluded from exchange voucher.\n");

  // Test 11: Service-Specific Eligibility Regression: Apple Saket Major Fault in 110017
  // Non-booting smartphone (major_fault) in 110017:
  // - MUST match Apple Saket for repair (Genius Bar) and authorised-recycling (free recycling).
  // - MUST NOT match Apple Saket for exchange-voucher; exchange-voucher matchedProviders MUST be 0.
  console.log("Test 11: Service-Specific Eligibility Regression (Apple Saket Major Fault in 110017)...");
  const t11 = evaluateComparison(
    {
      categorySlug: "smartphones-tablets",
      condition: "major_fault",
      priority: "maximise_money",
      pincode: "110017",
    },
    SIMULATED_APPROVED_DELHI_DATA
  );

  const t11Exchange = t11.pathways.find((p) => p.pathwayId === "exchange-voucher");
  if (!t11Exchange || t11Exchange.eligibility !== "excluded") {
    throw new Error("Test 11 failed: exchange-voucher must be excluded for major_fault smartphone");
  }
  if (t11Exchange.matchedProviders.length !== 0) {
    throw new Error(
      `Test 11 failed: Major fault phone must have 0 matched exchange providers, got ${t11Exchange.matchedProviders.length}`
    );
  }
  const t11Repair = t11.pathways.find((p) => p.pathwayId === "repair");
  const appleRepair = t11Repair?.matchedProviders.find((p) => p.slug === "apple-saket-delhi");
  if (!appleRepair) {
    throw new Error("Test 11 failed: Expected Apple Saket to match repair for major_fault");
  }
  const t11Recycle = t11.pathways.find((p) => p.pathwayId === "authorised-recycling");
  const appleRecycle = t11Recycle?.matchedProviders.find((p) => p.slug === "apple-saket-delhi");
  if (!appleRecycle) {
    throw new Error("Test 11 failed: Expected Apple Saket to match recycling for major_fault");
  }
  console.log("✓ Test 11: Apple Saket major fault phone correctly matched for repair & recycling, but strictly excluded from trade-in voucher.\n");

  // Test 12: EWRI Bulk & Corporate Office Exclusion from Consumer Recommendations
  // In Okhla 110020, a consumer with 1 broken device queries the platform:
  // EWRI has minimum_quantity: 20 and no consumer walk-in or single-device pickup.
  // Result: EWRI must NOT be matched for consumer single-item queries.
  console.log("Test 12: Testing EWRI Bulk & Office Intake Exclusion in 110020...");
  const t12 = evaluateComparison(
    {
      categorySlug: "laptops-computers",
      condition: "major_fault",
      priority: "dispose_responsibly",
      pincode: "110020",
    },
    SIMULATED_APPROVED_DELHI_DATA
  );

  const t12Recycle = t12.pathways.find((p) => p.pathwayId === "authorised-recycling");
  const ewriMatchedConsumer = t12Recycle?.matchedProviders.find((p) => p.slug === "ewri-delhi-okhla");
  if (ewriMatchedConsumer) {
    throw new Error("Test 12 failed: EWRI bulk/office provider must NOT match consumer single-item query in 110020");
  }
  console.log("✓ Test 12: EWRI strictly kept out of consumer recommendations due to bulk-only quantity and office intake status.\n");

  console.log("=== ALL 12 RECONCILED DELHI PILOT SCENARIO TESTS PASSED (100%) ===");
}

runReconciledDelhiPilotTests().catch((err) => {
  console.error("RECONCILED PILOT TEST FAILED:", err);
  process.exit(1);
});
