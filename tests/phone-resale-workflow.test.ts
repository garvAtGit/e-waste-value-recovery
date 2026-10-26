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
import { PhoneAssessmentInput } from "../src/lib/resale/types";
import { RecoveryRepository } from "../src/lib/recovery-cases/repository";

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
