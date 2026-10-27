import { test } from "node:test";
import assert from "node:assert/strict";
import {
  PHONE_MODELS,
  PHONE_FAULTS,
  PHONE_ACCESSORIES,
  getModelsByBrand,
  getModelById,
  isDelhiPincode,
  getDelhiLocalityName,
} from "../src/lib/resale/catalog";
import { evaluatePhoneResaleOffers } from "../src/lib/resale/engine";
import { calculateRepairVsSell, REPAIR_COST_BENCHMARKS } from "../src/lib/resale/repair-vs-sell";
import { PhoneAssessmentInput } from "../src/lib/resale/types";
import { RecoveryRepository } from "../src/lib/recovery-cases/repository";
import { DELHI_CANDIDATE_PROVIDERS } from "../src/lib/constants/delhi-candidates";
import { POST as createCaseRoute } from "../src/app/api/cases/route";
import { NextRequest } from "next/server";

console.log("=== EXECUTING SPRINT 1 PHONE RESALE WORKFLOW TEST SUITE ===");

test("1. Catalog Resolution: Phone models, storage variants, and brand filters", () => {
  assert.ok(PHONE_MODELS.length >= 25, "Phone model catalog has comprehensive models");

  // Filter Apple
  const appleModels = getModelsByBrand("apple");
  assert.ok(appleModels.length >= 6, "At least 6 Apple models available");
  assert.ok(appleModels.every((m) => m.brand === "Apple"), "All Apple models matched");

  // Specific model test: iPhone 15 Pro
  const ip15pro = getModelById("apple-iphone-15-pro");
  assert.ok(ip15pro, "iPhone 15 Pro exists in catalog");
  assert.equal(ip15pro?.brand, "Apple");
  assert.ok(ip15pro?.storageOptions.length >= 3, "Storage options present");
  assert.ok(
    ip15pro!.basePricesByStorage["256GB"] > ip15pro!.basePricesByStorage["128GB"],
    "256GB priced higher than 128GB"
  );

  // Filter Samsung
  const samsungModels = getModelsByBrand("samsung");
  assert.ok(samsungModels.length >= 4, "Samsung models available");
  assert.ok(samsungModels.some((m) => m.id === "samsung-galaxy-s24-ultra"), "S24 Ultra exists");

  // Filter faults and accessories
  assert.ok(PHONE_FAULTS.length >= 6, "Fault catalog has itemized options");
  assert.ok(PHONE_ACCESSORIES.valid_bill.bonusAmount > 0, "Valid bill bonus defined");
});

test("2. Delhi Pincode Verification and Locality Mapping", () => {
  // Valid Delhi Pincodes
  assert.equal(isDelhiPincode("110001"), true, "110001 is a Delhi NCT pincode");
  assert.equal(getDelhiLocalityName("110001"), "Connaught Place / Central Delhi");

  assert.equal(isDelhiPincode("110020"), true, "110020 is a Delhi NCT pincode");
  assert.equal(getDelhiLocalityName("110020"), "Okhla Industrial Area Phase I-III");

  assert.equal(isDelhiPincode("110017"), true, "110017 is a Delhi NCT pincode");
  assert.equal(getDelhiLocalityName("110017"), "Saket / Malviya Nagar (South Delhi)");

  // Non-Delhi Pincodes
  assert.equal(isDelhiPincode("201301"), false, "201301 (Noida, UP) is not a Delhi NCT pincode");
  assert.equal(isDelhiPincode("122001"), false, "122001 (Gurugram, HR) is not a Delhi NCT pincode");
  assert.equal(isDelhiPincode("400001"), false, "400001 (Mumbai) is not a Delhi NCT pincode");
  assert.equal(isDelhiPincode("abcd"), false, "Invalid string is not a Delhi pincode");
});

test("3. Valuation Engine: Condition multipliers, fault deductions, and accessory bonuses", () => {
  const baseAssessment: PhoneAssessmentInput = {
    brand: "Apple",
    modelId: "apple-iphone-14-pro",
    modelName: "iPhone 14 Pro",
    storage: "128GB",
    condition: "flawless",
    selectedFaults: [],
    accessories: ["original_charger", "box", "valid_bill"],
    pincode: "110001",
  };

  const flawlessResult = evaluatePhoneResaleOffers(baseAssessment);
  assert.equal(flawlessResult.isHazardous, false, "Flawless phone is not hazardous");
  assert.ok(flawlessResult.offers.length >= 3, "Multiple provider offers generated");
  assert.ok(flawlessResult.bestRealisticOffer !== null, "Best realistic offer resolved");

  // Compare with a phone with faults
  const faultyAssessment: PhoneAssessmentInput = {
    ...baseAssessment,
    condition: "fair",
    selectedFaults: ["fault-screen-cracked", "fault-battery-service"],
    accessories: [],
  };

  const faultyResult = evaluatePhoneResaleOffers(faultyAssessment);
  assert.ok(
    faultyResult.assessmentSummary.estimatedNetBaseline <
      flawlessResult.assessmentSummary.estimatedNetBaseline,
    "Fair phone with screen and battery faults has lower payout than flawless phone"
  );
  assert.ok(faultyResult.assessmentSummary.faultDeductionTotal >= 5000, "Itemized fault deductions summed");

  // Top offer has deduction risk communicated
  const topFaultyOffer = faultyResult.offers[0];
  assert.ok(
    topFaultyOffer.estimatedDeductionRisk.length > 5,
    "Deduction risk is clearly explained to consumer"
  );
});

test("4. Hazardous Condition Guardrail: Swollen battery blocks commercial resale", () => {
  const hazardousAssessment: PhoneAssessmentInput = {
    brand: "Samsung",
    modelId: "samsung-galaxy-s22-ultra",
    modelName: "Galaxy S22 Ultra",
    storage: "256GB",
    condition: "hazardous",
    selectedFaults: [],
    accessories: [],
    pincode: "110020",
  };

  const result = evaluatePhoneResaleOffers(hazardousAssessment);
  assert.equal(result.isHazardous, true, "Swollen battery triggers hazardous block");
  assert.ok(result.hazardDirective, "Hazard directive is provided");
  assert.ok(
    result.hazardDirective?.warningText.includes("casing") ||
      result.hazardDirective?.warningText.includes("swelling") ||
      result.hazardDirective?.warningText.includes("blocked"),
    "Hazard warning explains physical danger"
  );

  // Commercial resale providers (Cashify, Croma, Apple) must NOT be offered for hazardous swollen cells
  const commercialOffers = result.offers.filter(
    (o) => o.offerType === "cash_doorstep" || o.offerType === "store_exchange" || o.offerType === "apple_trade_in"
  );
  assert.equal(commercialOffers.length, 0, "Zero commercial cash/voucher offers for swollen battery");

  // Only certified hazardous recycling intake is offered
  assert.ok(
    result.offers.some((o) => o.offerType === "certified_recycle"),
    "Certified hazardous recycling route is available for safe disposal"
  );
});

test("5. Transparent Provider Ranking: Apple Saket eligibility and honest quotes", () => {
  // Test 1: Apple iPhone gets Apple Saket Trade-in
  const appleAssessment: PhoneAssessmentInput = {
    brand: "Apple",
    modelId: "apple-iphone-13",
    modelName: "iPhone 13",
    storage: "128GB",
    condition: "good",
    selectedFaults: [],
    accessories: ["original_charger"],
    pincode: "110017", // Saket area
  };
  const appleResult = evaluatePhoneResaleOffers(appleAssessment);
  const appleTradeIn = appleResult.offers.find((o) => o.offerType === "apple_trade_in");
  assert.ok(appleTradeIn, "Apple Saket Trade-in is included for Apple devices");
  assert.equal(appleTradeIn?.providerSlug, "apple-saket-delhi");
  assert.ok(appleTradeIn?.providerId, "Apple Saket provider ID is populated from Delhi candidates");

  // Test 2: Non-Apple device (OnePlus) NEVER gets Apple Saket Trade-in
  const onePlusAssessment: PhoneAssessmentInput = {
    brand: "OnePlus",
    modelId: "oneplus-11-5g",
    modelName: "OnePlus 11 5G",
    storage: "256GB",
    condition: "good",
    selectedFaults: [],
    accessories: ["box"],
    pincode: "110017",
  };
  const onePlusResult = evaluatePhoneResaleOffers(onePlusAssessment);
  const invalidAppleOffer = onePlusResult.offers.find((o) => o.offerType === "apple_trade_in");
  assert.equal(invalidAppleOffer, undefined, "Non-Apple device NEVER matches Apple Saket Trade-In");

  // Test 3: Transparent quote status
  const topOffer = onePlusResult.offers[0];
  assert.ok(topOffer.quoteStatus === "confirmed_quote" || topOffer.quoteStatus === "indicative_estimate");
  assert.ok(topOffer.lastVerifiedDate.includes("2026"), "Quote has recent verification date");
  assert.ok(topOffer.estimatedDeductionRisk.length > 5, "Inspection risk is communicated");
});

test("6. Recovery Case Persistence: Creating a case with locked financial quote", async () => {
  const sessionId = "test-resale-session-sprint1";
  const assessment: PhoneAssessmentInput = {
    brand: "Samsung",
    modelId: "samsung-galaxy-s23",
    modelName: "Galaxy S23",
    storage: "128GB",
    condition: "good",
    selectedFaults: [],
    accessories: ["box", "original_charger"],
    pincode: "110001",
  };

  const valuation = evaluatePhoneResaleOffers(assessment);
  const chosenOffer = valuation.offers[0];

  const createdCase = await RecoveryRepository.createCase({
    sessionId,
    pathwayId: "sell-cash",
    providerId: chosenOffer.providerId || "a0110001-0001-4000-8000-000000000001",
    financialValueInr: chosenOffer.estimatedNetPayout,
    assessmentInput: {
      categorySlug: "smartphones-tablets",
      deviceModel: valuation.assessmentSummary.deviceTitle,
      condition: "working_recent",
      pincode: assessment.pincode,
      priority: "maximise_money",
    },
    userNotes: `Sprint 1 Resale Lock: ${chosenOffer.providerName} estimated payout ₹${chosenOffer.estimatedNetPayout.toLocaleString("en-IN")}.`,
  });

  assert.ok(createdCase.id, "Case ID created");
  assert.equal(
    createdCase.financial_value_inr,
    chosenOffer.estimatedNetPayout,
    "Locked quote stored in financial_value_inr"
  );
  assert.equal(createdCase.current_status, "created", "Initial status is 'created'");
  assert.equal(createdCase.is_provider_verified, false, "Provider is not yet verified");

  // Verify custom history notes
  assert.ok(
    createdCase.status_history[0].notes?.includes("₹"),
    "Initial status history record contains quote lock details"
  );
});

test("7. Resale Deal Lifecycle: Tracking Physical Inspection and Explicit Payment Confirmation", async () => {
  const sessionId = "test-resale-lifecycle-session";
  const initialQuote = 32500;

  // 1. Create Case
  const resaleCase = await RecoveryRepository.createCase({
    sessionId,
    pathwayId: "sell-cash",
    providerId: "a0110001-0001-4000-8000-000000000001",
    financialValueInr: initialQuote,
    userNotes: "Doorstep pickup scheduled for South Extension.",
  });

  // 2. Progression to transit/scheduled
  await RecoveryRepository.transitionCase(resaleCase.id, {
    targetStatus: "contacted",
    changedByRole: "user",
    reasonOrNotes: "Confirmed doorstep pickup slot for tomorrow 2 PM.",
  });
  await RecoveryRepository.transitionCase(resaleCase.id, {
    targetStatus: "accepted_by_provider",
    changedByRole: "provider",
    reasonOrNotes: "Pickup agent assigned: Vikram Sharma (ID: CS-DEL-882).",
  });
  await RecoveryRepository.transitionCase(resaleCase.id, {
    targetStatus: "in_transit_or_scheduled",
    changedByRole: "provider",
    reasonOrNotes: "Agent is en route to South Extension.",
  });

  // 3. Physical Handover & Inspection: Agreed Final Price after minor hairline scratch deduction
  const finalAgreedPrice = 31000;
  const inspectionStep = await RecoveryRepository.transitionCase(resaleCase.id, {
    targetStatus: "dropped_off_or_collected",
    changedByRole: "provider",
    reasonOrNotes: `Physical inspection conducted at doorstep. Agreed final price: ₹${finalAgreedPrice}. Reason: minor hairline scratch on bottom bezel.`,
  });

  assert.equal(inspectionStep.current_status, "dropped_off_or_collected", "Status updated to collected");
  assert.ok(
    inspectionStep.status_history.some((h) => h.notes?.includes("31000")),
    "Final agreed price logged in audit trail"
  );

  // 4. Final Settlement & Payment Confirmation
  const completedStep = await RecoveryRepository.transitionCase(resaleCase.id, {
    targetStatus: "completed",
    changedByRole: "provider",
    outcomeType: "sold",
    financialValueInr: finalAgreedPrice,
    isProviderConfirmed: true,
    reasonOrNotes: `Payment of ₹${finalAgreedPrice} settled via UPI (IMPS Ref: UPI/20261027/98827192). Customer verified credit in HDFC account.`,
  });

  assert.equal(completedStep.current_status, "completed", "Status updated to completed");
  assert.equal(completedStep.status_history.length, 6, "Complete 6-step lifecycle preserved (initial + 5 transitions)");
  assert.ok(
    completedStep.status_history[5].notes?.includes("UPI/20261027/98827192"),
    "Transaction reference preserved in final audit log"
  );
});

test("8. Priority 1 Regression: Quote Semantics & Logistics Badge Rigour", () => {
  // Test A: Normal assessment in Delhi Central (110001)
  const assessment: PhoneAssessmentInput = {
    brand: "Apple",
    modelId: "apple-iphone-13",
    modelName: "iPhone 13",
    storage: "128GB",
    condition: "flawless",
    selectedFaults: [],
    accessories: ["box"],
    pincode: "110001",
  };
  const valuation = evaluatePhoneResaleOffers(assessment);

  for (const offer of valuation.offers) {
    // 1. No local calculation can claim confirmed diagnostic quote
    assert.notEqual(
      offer.quoteStatus,
      "confirmed_diagnostic_quote",
      `Local calculation for ${offer.providerName} must NEVER claim confirmed diagnostic quote`
    );
    assert.ok(
      offer.quoteStatus === "indicative_estimate" ||
        offer.quoteStatus === "published_price" ||
        offer.quoteStatus === "expired_stale_estimate",
      `Offer quote status must be honest: ${offer.quoteStatus}`
    );

    // 2. No offer may claim 'guaranteed' in its ranking or description without evidence
    assert.equal(
      offer.rankingReason.toLowerCase().includes("guaranteed"),
      false,
      "No offer ranking reason may claim 'guaranteed'"
    );
  }

  // 3. Pickup badges are strictly honest:
  // In 110001, Cashify has a documented kiosk counter at Rajiv Chowk Metro with drop-off
  const cashifyOffer = valuation.offers.find((o) => o.providerSlug === "cashify-delhi");
  assert.ok(cashifyOffer, "Cashify offer found");
  assert.equal(
    cashifyOffer?.pickupBadgeStatus,
    "in_store_dropoff",
    "Cashify at 110001 has physical kiosk drop-off recorded"
  );
  assert.equal(
    cashifyOffer?.pickupBadgeLabel,
    "In-store drop-off only"
  );

  // In 110020 (Okhla), Cashify has no kiosk, so it lists unconfirmed doorstep pickup across Delhi NCT
  const okhlaValuation = evaluatePhoneResaleOffers({
    ...assessment,
    pincode: "110020",
  });
  const okhlaCashify = okhlaValuation.offers.find((o) => o.providerSlug === "cashify-delhi");
  assert.equal(
    okhlaCashify?.pickupBadgeStatus,
    "pickup_unconfirmed_listed",
    "Cashify pickup in Okhla is listed by provider but unconfirmed"
  );
  assert.equal(
    okhlaCashify?.pickupBadgeLabel,
    "Pickup coverage listed by provider; not independently confirmed"
  );

  const cromaOffer = valuation.offers.find((o) => o.providerSlug === "croma-delhi");
  assert.equal(
    cromaOffer?.pickupBadgeStatus,
    "in_store_dropoff",
    "Croma offers in-store drop-off only"
  );

  // 4. Non-Delhi Pincode (Noida 201301)
  const noidaValuation = evaluatePhoneResaleOffers({
    ...assessment,
    pincode: "201301",
  });
  const noidaCashify = noidaValuation.offers.find((o) => o.providerSlug === "cashify-delhi");
  assert.equal(
    noidaCashify?.pickupBadgeStatus,
    "not_available_pincode",
    "Non-Delhi pincode produces 'not_available_pincode'"
  );
  assert.equal(noidaCashify?.pickupBadgeLabel, "Not available for this pincode");

  // 5. Blank/unverified pincode
  const blankPincodeValuation = evaluatePhoneResaleOffers({
    ...assessment,
    pincode: "",
  });
  const blankCashify = blankPincodeValuation.offers.find((o) => o.providerSlug === "cashify-delhi");
  assert.equal(
    blankCashify?.pickupBadgeStatus,
    "pickup_unknown",
    "Empty pincode produces 'pickup_unknown'"
  );
  assert.equal(blankCashify?.pickupBadgeLabel, "Availability not verified");
});

test("9. Priority 2 Regression: Honest Offer Ranking & Cash vs. Voucher Separation", () => {
  const assessment: PhoneAssessmentInput = {
    brand: "Apple",
    modelId: "apple-iphone-14-pro",
    modelName: "iPhone 14 Pro",
    storage: "256GB",
    condition: "good",
    selectedFaults: [],
    accessories: ["box"],
    pincode: "110017",
  };

  // 1. Highest Cash Mode: Croma's voucher (even with higher gross number) must NOT rank above direct cash
  const cashValuation = evaluatePhoneResaleOffers({
    ...assessment,
    rankingMode: "highest_cash",
  });
  const topCashOffer = cashValuation.offers[0];
  assert.equal(
    topCashOffer.financialType === "cash" || topCashOffer.financialType === "p2p_cash",
    true,
    "Top offer under highest_cash mode must be liquid cash"
  );
  const cromaPosition = cashValuation.offers.findIndex((o) => o.providerSlug === "croma-delhi");
  const cashifyPosition = cashValuation.offers.findIndex((o) => o.providerSlug === "cashify-delhi");
  assert.ok(
    cashifyPosition < cromaPosition,
    "Direct cash buyback ranks ahead of store credit voucher in highest_cash mode"
  );

  // 2. Most Convenient Mode: Doorstep pickup listed ranks ahead of in-store and self-arranged
  const convenientValuation = evaluatePhoneResaleOffers({
    ...assessment,
    rankingMode: "most_convenient",
  });
  const topConvenientOffer = convenientValuation.offers[0];
  assert.equal(
    topConvenientOffer.providerSlug,
    "cashify-delhi",
    "Doorstep pickup ranks #1 in most_convenient mode"
  );
  const p2pConvenientPos = convenientValuation.offers.findIndex((o) => o.providerSlug === "p2p-direct-market");
  assert.equal(
    p2pConvenientPos,
    convenientValuation.offers.length - 1,
    "P2P self-arranged delivery ranks lowest in convenience"
  );

  // 3. Most Certain Mode: Apple Saket (published OEM trade-in) ranks ahead of estimates
  const certainValuation = evaluatePhoneResaleOffers({
    ...assessment,
    rankingMode: "most_certain",
  });
  const topCertainOffer = certainValuation.offers[0];
  assert.equal(
    topCertainOffer.providerSlug,
    "apple-saket-delhi",
    "Published OEM trade-in ranks #1 in most_certain mode"
  );
  assert.equal(topCertainOffer.quoteStatus, "published_price");
});

test("10. Priority 3 Regression: Provider Directory as Source of Truth & Incomplete Data Resilience", () => {
  const assessment: PhoneAssessmentInput = {
    brand: "Samsung",
    modelId: "samsung-galaxy-s23",
    modelName: "Galaxy S23",
    storage: "128GB",
    condition: "good",
    selectedFaults: [],
    accessories: [],
    pincode: "110001",
  };

  // Test 1: Unsupported Category Exclusion (Lappy Maker handles laptops, not phones)
  const defaultValuation = evaluatePhoneResaleOffers(assessment);
  const lappyOffer = defaultValuation.offers.find((o) => o.providerSlug === "lappy-maker-delhi");
  assert.equal(
    lappyOffer,
    undefined,
    "Lappy Maker (laptops-only) must NOT generate a phone resale offer"
  );

  // Test 2: Provider with stale quote date (> 60 days old)
  const staleProvider = {
    ...DELHI_CANDIDATE_PROVIDERS[0],
    id: "test-stale-provider",
    slug: "stale-buyback-co",
    name: "Stale Buyback Co",
    last_checked_at: "2025-01-01T00:00:00Z", // Very old
    services: [
      {
        id: "serv-1",
        provider_id: "test-stale-provider",
        service_type: "cash_buyback" as const,
        service_description: "Buyback",
        created_at: "2025-01-01T00:00:00Z",
      },
    ],
    accepted_categories: [
      {
        id: "cat-1",
        provider_id: "test-stale-provider",
        category_slug: "smartphones-tablets",
        accepted_conditions: ["working_recent"],
        created_at: "2025-01-01T00:00:00Z",
      },
    ],
  };

  const staleValuation = evaluatePhoneResaleOffers(assessment, [staleProvider]);
  const staleOffer = staleValuation.offers.find((o) => o.providerSlug === "stale-buyback-co");
  assert.ok(staleOffer, "Stale provider offer exists");
  assert.equal(staleOffer?.isStale, true, "Provider is identified as stale");
  assert.equal(
    staleOffer?.quoteStatus,
    "expired_stale_estimate",
    "Quote status is marked as expired_stale_estimate"
  );
  assert.equal(staleOffer?.quoteStatusLabel, "Expired / Stale Estimate");

  // Test 3: Provider with missing service area evidence
  const missingLocationProvider = {
    ...DELHI_CANDIDATE_PROVIDERS[0],
    id: "test-unknown-loc-provider",
    slug: "unknown-loc-co",
    name: "Unknown Location Co",
    service_areas: [], // Empty service areas
    offers_pickup: false,
    offers_dropoff: false,
  };

  const unknownLocValuation = evaluatePhoneResaleOffers(
    { ...assessment, pincode: "110055" },
    [missingLocationProvider]
  );
  const unknownLocOffer = unknownLocValuation.offers.find(
    (o) => o.providerSlug === "unknown-loc-co"
  );
  assert.ok(unknownLocOffer, "Offer exists");
  assert.equal(
    unknownLocOffer?.pickupBadgeStatus,
    "pickup_unknown",
    "Missing logistics data yields 'pickup_unknown' rather than invented claim"
  );
  assert.equal(unknownLocOffer?.pickupBadgeLabel, "Availability not verified");
});

test("11. Priority 4 Regression: Server-Side Case Hardening, Validation & Recalculation", async () => {
  const cashifyId = "a0110001-0001-4000-8000-000000000001";

  // Subtest 1: Client sends forged financial value (9,999,999 INR). Server must recalculate from inputs.
  const forgedPayload = {
    pathwayId: "sell-cash",
    providerId: cashifyId,
    financialValueInr: 9999999, // Forged client value
    assessmentInput: {
      categorySlug: "smartphones-tablets",
      pincode: "110001",
      resalePayload: {
        brand: "Apple",
        modelId: "apple-iphone-13",
        storage: "128GB",
        condition: "good",
        selectedFaults: [],
        accessories: ["box"],
      },
    },
  };

  const req1 = new NextRequest("http://localhost:3000/api/cases", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(forgedPayload),
  });
  const res1 = await createCaseRoute(req1);
  assert.equal(res1.status, 201, "Case creation succeeds");
  const data1 = await res1.json();
  assert.ok(data1.case.id, "Case ID exists");
  assert.notEqual(data1.case.financial_value_inr, 9999999, "Server REJECTS forged financial value");
  assert.ok(
    data1.case.financial_value_inr > 15000 && data1.case.financial_value_inr < 30000,
    "Server recalculates verified catalog estimate"
  );
  assert.equal(data1.case.is_provider_verified, false, "Initial verification tier cannot be forged");

  // Subtest 2: Unknown provider ID is rejected with 400
  const unknownProviderPayload = {
    pathwayId: "sell-cash",
    providerId: "00000000-0000-0000-0000-000000000000", // Non-existent provider
  };
  const req2 = new NextRequest("http://localhost:3000/api/cases", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(unknownProviderPayload),
  });
  const res2 = await createCaseRoute(req2);
  assert.equal(res2.status, 400, "Unknown provider is rejected with HTTP 400");
  const data2 = await res2.json();
  assert.ok(data2.error.includes("not found"), "Clear error for unknown provider");

  // Subtest 3: Provider that does NOT support requested pathway is rejected (e.g. Lappy Maker for cash buyback)
  const lappyMakerId = "a0110019-0003-4000-8000-000000000003"; // repair only
  const incompatiblePayload = {
    pathwayId: "sell-cash",
    providerId: lappyMakerId,
  };
  const req3 = new NextRequest("http://localhost:3000/api/cases", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(incompatiblePayload),
  });
  const res3 = await createCaseRoute(req3);
  assert.equal(res3.status, 400, "Incompatible provider service is rejected with HTTP 400");
  const data3 = await res3.json();
  assert.ok(data3.error.includes("does not support"), "Explains provider does not support transaction");

  // Subtest 4: Invalid hardware input (unsupported brand)
  const invalidBrandPayload = {
    pathwayId: "sell-cash",
    providerId: cashifyId,
    assessmentInput: {
      categorySlug: "smartphones-tablets",
      resalePayload: {
        brand: "Nokia_Fake_Brand",
        modelId: "apple-iphone-13",
        storage: "128GB",
        condition: "good",
      },
    },
  };
  const req4 = new NextRequest("http://localhost:3000/api/cases", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(invalidBrandPayload),
  });
  const res4 = await createCaseRoute(req4);
  assert.equal(res4.status, 400, "Invalid catalog brand rejected with 400");

  // Subtest 5: Hazardous condition cannot initiate commercial resale
  const hazardousPayload = {
    pathwayId: "sell-cash",
    providerId: cashifyId,
    assessmentInput: {
      categorySlug: "smartphones-tablets",
      condition: "unsafe_hazardous",
    },
  };
  const req5 = new NextRequest("http://localhost:3000/api/cases", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(hazardousPayload),
  });
  const res5 = await createCaseRoute(req5);
  assert.equal(res5.status, 400, "Hazardous device blocked from commercial case initiation");
  const data5 = await res5.json();
  assert.equal(data5.isHazardousBlocked, true, "isHazardousBlocked returned");
});

test("12. Priority 5: Deterministic Repair vs. Sell Decision Engine and Benchmark Transparency", () => {
  // Subtest 1: Benchmark Repository Integrity
  assert.ok(REPAIR_COST_BENCHMARKS.length >= 8, "Repair benchmark repository has itemized component costs");
  for (const bm of REPAIR_COST_BENCHMARKS) {
    assert.ok(bm.faultId, "Fault ID defined");
    assert.ok(bm.costRangeInr.min > 0, "Positive min cost");
    assert.ok(bm.costRangeInr.max >= bm.costRangeInr.min, "Max cost >= min cost");
    assert.ok(bm.repairSource, "Repair source documented");
    assert.ok(bm.sourceUrl.startsWith("http"), "Source URL is valid link");
    assert.match(bm.lastCheckedDate, /^\d{4}-\d{2}-\d{2}$/, "ISO date format for lastCheckedDate");
  }

  // Subtest 2: Phone with 0 declared faults recommends Sell As-Is directly
  const flawlessPhone: PhoneAssessmentInput = {
    brand: "Apple",
    modelId: "apple-iphone-13",
    modelName: "iPhone 13",
    storage: "128GB",
    condition: "good",
    selectedFaults: [],
    accessories: ["box", "valid_bill"],
    pincode: "110001",
  };
  const flawlessResult = calculateRepairVsSell(flawlessPhone);
  assert.equal(flawlessResult.hasFaultsToRepair, false, "No faults to repair detected");
  assert.equal(flawlessResult.isHazardousBlocked, false, "Not hazardous");
  assert.equal(flawlessResult.economics.isRepairEconomicallyBeneficial, false, "Repair not beneficial with 0 faults");
  assert.ok(flawlessResult.economics.recommendationHeadline.includes("No Hardware Faults Declared — Sell As-Is"), "Recommends selling as-is");
  assert.equal(flawlessResult.economics.incrementalBenefitMid, 0, "Zero incremental repair benefit");

  // Subtest 3: Flagship with cracked screen where repair yields positive incremental benefit
  const flagshipWithCrackedScreen: PhoneAssessmentInput = {
    brand: "Apple",
    modelId: "apple-iphone-15-pro",
    modelName: "iPhone 15 Pro",
    storage: "256GB",
    condition: "faulty",
    selectedFaults: ["fault-screen-cracked"],
    accessories: ["box"],
    pincode: "110001",
  };
  const flagshipResult = calculateRepairVsSell(flagshipWithCrackedScreen);
  assert.equal(flagshipResult.hasFaultsToRepair, true, "Faults present");
  assert.equal(flagshipResult.isHazardousBlocked, false, "Not hazardous");
  assert.ok(flagshipResult.repairThenSell.itemizedRepairs.length === 1, "Itemized repair list has screen replacement");
  assert.equal(flagshipResult.repairThenSell.itemizedRepairs[0].faultId, "fault-screen-cracked");
  assert.ok(flagshipResult.repairThenSell.totalRepairCostMid > 0, "Positive mid repair cost");
  assert.ok(
    flagshipResult.repairThenSell.expectedResaleValueAfterRepair > flagshipResult.sellAsIs.netProceeds,
    "Repaired phone resale value is higher than as-is payout"
  );
  assert.ok(
    flagshipResult.economics.incrementalBenefitMid > 0,
    "Flagship screen repair yields positive incremental net return"
  );
  assert.equal(flagshipResult.economics.isRepairEconomicallyBeneficial, true, "Marked as economically beneficial");
  assert.ok(
    flagshipResult.economics.recommendationHeadline.includes("Repairing Then Selling Yields +₹"),
    "Headline clearly states net financial gain"
  );
  assert.ok(
    flagshipResult.economics.qualitativeRiskWarning.includes("Repair Risk Warning"),
    "Qualitative repair risk disclosure is present"
  );

  // Subtest 4: Older phone where repair cost exceeds resale uplift (Repair is uneconomical)
  const olderPhoneMultipleFaults: PhoneAssessmentInput = {
    brand: "Apple",
    modelId: "apple-iphone-11",
    modelName: "iPhone 11",
    storage: "64GB",
    condition: "fair",
    selectedFaults: ["fault-screen-cracked", "fault-battery-service", "fault-biometrics"],
    accessories: [],
    pincode: "110001",
  };
  const olderResult = calculateRepairVsSell(olderPhoneMultipleFaults);
  assert.equal(olderResult.hasFaultsToRepair, true, "Has faults to repair");
  assert.ok(olderResult.repairThenSell.totalRepairCostMid > 8000, "Multi-part repair cost is substantial");
  assert.ok(
    olderResult.economics.incrementalBenefitMid <= 0,
    "Incremental benefit is non-positive because repair costs exceed value recovery"
  );
  assert.equal(olderResult.economics.isRepairEconomicallyBeneficial, false, "Correctly advises against repair");
  assert.ok(
    olderResult.economics.recommendationHeadline.includes("Sell As-Is Is Better"),
    "Headline advises selling as-is rather than sinking repair capital"
  );

  // Subtest 5: Hazardous Battery condition completely blocks repair option
  const hazardousPhone: PhoneAssessmentInput = {
    brand: "Apple",
    modelId: "apple-iphone-13",
    modelName: "iPhone 13",
    storage: "128GB",
    condition: "hazardous",
    selectedFaults: [],
    accessories: [],
    pincode: "110001",
  };
  const hazardousResult = calculateRepairVsSell(hazardousPhone);
  assert.equal(hazardousResult.isHazardousBlocked, true, "Repair is strictly blocked for hazardous device");
  assert.ok(hazardousResult.hazardReason?.includes("swollen"), "Hazard reason details thermal runaway risk");
  assert.equal(hazardousResult.economics.isRepairEconomicallyBeneficial, false);
  assert.equal(hazardousResult.repairThenSell.totalRepairCostMid, 0, "No repair costs estimated for hazardous unit");
  assert.ok(
    hazardousResult.sellAsIs.topProviderName.includes("Chemical Destruction") ||
      hazardousResult.sellAsIs.topProviderName.includes("Certified"),
    "Directs user to safe environmental destruction"
  );
});



