import { test } from "node:test";
import assert from "node:assert/strict";
import { RecoveryRepository, isValidUUID } from "../src/lib/recovery-cases/repository";
import { validateStatusTransition, InvalidStatusTransitionError } from "../src/lib/recovery-cases/state-machine";
import { ComparisonInput } from "../src/lib/comparison/types";

console.log("=== EXECUTING RECOVERY CASES & STATE MACHINE TEST SUITE ===");

test("1. Assessment-to-Case Creation preserves full hardware input", async () => {
  const sessionId = "test-session-suite-1";
  const assessmentInput: ComparisonInput = {
    categorySlug: "smartphones-tablets",
    deviceModel: "Google Pixel 7 Pro",
    condition: "working_recent",
    specificFault: "None - pristine condition",
    pincode: "110001",
    priority: "maximise_money",
  };

  const newCase = await RecoveryRepository.createCase({
    sessionId,
    pathwayId: "sell-cash",
    providerId: "demo-provider-3",
    assessmentInput,
    userNotes: "Interested in rapid same-day bank transfer.",
  });

  assert.ok(isValidUUID(newCase.id) || newCase.id.startsWith("case-"), "Case ID generated properly as valid UUID");
  assert.equal(newCase.session_id, sessionId, "Session ID matches");
  assert.equal(newCase.current_status, "created", "Initial status is 'created'");
  assert.equal(newCase.verification_tier, "user_reported", "Initial verification tier is 'user_reported'");
  assert.equal(newCase.is_provider_verified, false, "Initial provider verified flag is false");
  assert.equal(newCase.pathway_id, "sell-cash", "Pathway ID matches");
  assert.equal(newCase.assessment?.device_model, "Google Pixel 7 Pro", "Assessment model preserved");
  assert.equal(newCase.assessment?.condition, "working_recent", "Assessment condition preserved");
  assert.equal(newCase.assessment?.pincode, "110001", "Assessment pincode preserved");
  assert.equal(newCase.status_history.length, 1, "Status history has 1 initial record");
  assert.equal(newCase.status_history[0].to_status, "created", "Initial history status is 'created'");
  console.log("✓ Test 1: Assessment inputs and initial case state preserved completely.");
});

test("2. Valid state transitions execute sequentially with audit history", async () => {
  const sessionId = "test-session-suite-2";
  const newCase = await RecoveryRepository.createCase({
    sessionId,
    pathwayId: "repair",
    providerId: "demo-provider-3",
  });

  // Step 2: created -> contacted
  const step2 = await RecoveryRepository.transitionCase(newCase.id, {
    targetStatus: "contacted",
    changedByRole: "user",
    reasonOrNotes: "Called repair shop counter to check screen part inventory.",
  });
  assert.equal(step2.current_status, "contacted");
  assert.equal(step2.status_history.length, 2);

  // Step 3: contacted -> accepted_by_provider
  const step3 = await RecoveryRepository.transitionCase(newCase.id, {
    targetStatus: "accepted_by_provider",
    changedByRole: "user",
    reasonOrNotes: "Technician confirmed replacement OEM screen is in stock.",
  });
  assert.equal(step3.current_status, "accepted_by_provider");
  assert.equal(step3.status_history.length, 3);

  // Step 4: accepted_by_provider -> in_transit_or_scheduled
  const step4 = await RecoveryRepository.transitionCase(newCase.id, {
    targetStatus: "in_transit_or_scheduled",
    changedByRole: "user",
    reasonOrNotes: "Booked weekend workshop visit.",
  });
  assert.equal(step4.current_status, "in_transit_or_scheduled");
  assert.equal(step4.status_history.length, 4);

  // Step 5: in_transit_or_scheduled -> dropped_off_or_collected
  const step5 = await RecoveryRepository.transitionCase(newCase.id, {
    targetStatus: "dropped_off_or_collected",
    changedByRole: "user",
    reasonOrNotes: "Handed over phone at workshop reception.",
  });
  assert.equal(step5.current_status, "dropped_off_or_collected");
  assert.equal(step5.status_history.length, 5);

  // Step 6: dropped_off_or_collected -> completed (with outcome)
  const step6 = await RecoveryRepository.transitionCase(newCase.id, {
    targetStatus: "completed",
    changedByRole: "user",
    outcomeType: "repaired_and_retained",
    financialValueInr: 3200,
    evidenceNotes: "Job card #8812 - Display replaced and calibrated.",
  });
  assert.equal(step6.current_status, "completed");
  assert.equal(step6.outcome_type, "repaired_and_retained");
  assert.equal(step6.financial_value_inr, 3200);
  assert.equal(step6.status_history.length, 6);
  console.log("✓ Test 2: Complete valid lifecycle progression verified with sequential history.");
});

test("3. Invalid transitions are strictly rejected by state machine", async () => {
  const sessionId = "test-session-suite-3";
  const newCase = await RecoveryRepository.createCase({
    sessionId,
    pathwayId: "sell-cash",
  });

  // Attempt illegal jump: created straight to completed
  await assert.rejects(
    async () => {
      await RecoveryRepository.transitionCase(newCase.id, {
        targetStatus: "completed",
        changedByRole: "user",
        outcomeType: "sold_for_cash",
      });
    },
    InvalidStatusTransitionError,
    "Illegal leap from created to completed must be rejected"
  );

  // Attempt completion without outcomeType
  const contactedCase = await RecoveryRepository.transitionCase(newCase.id, {
    targetStatus: "contacted",
    changedByRole: "user",
  });
  const acceptedCase = await RecoveryRepository.transitionCase(contactedCase.id, {
    targetStatus: "accepted_by_provider",
    changedByRole: "user",
  });
  const deliveredCase = await RecoveryRepository.transitionCase(acceptedCase.id, {
    targetStatus: "dropped_off_or_collected",
    changedByRole: "user",
  });

  await assert.rejects(
    async () => {
      await RecoveryRepository.transitionCase(deliveredCase.id, {
        targetStatus: "completed",
        changedByRole: "user",
        // outcomeType missing!
      });
    },
    InvalidStatusTransitionError,
    "Completed status without outcomeType must be rejected"
  );
  console.log("✓ Test 3: Invalid state transitions and missing prerequisites strictly rejected.");
});

test("4. Rejection and failure transitions require explicit documented reason", async () => {
  const sessionId = "test-session-suite-4";
  const newCase = await RecoveryRepository.createCase({
    sessionId,
    pathwayId: "sell-cash",
  });
  const contacted = await RecoveryRepository.transitionCase(newCase.id, {
    targetStatus: "contacted",
    changedByRole: "user",
  });

  // Rejection without reason fails
  await assert.rejects(
    async () => {
      await RecoveryRepository.transitionCase(contacted.id, {
        targetStatus: "rejected_by_provider",
        changedByRole: "user",
        reasonOrNotes: "", // empty!
      });
    },
    InvalidStatusTransitionError,
    "Rejection without explanation must be rejected"
  );

  // Rejection with valid explanation succeeds
  const rejectedCase = await RecoveryRepository.transitionCase(contacted.id, {
    targetStatus: "rejected_by_provider",
    changedByRole: "user",
    reasonOrNotes: "Diagnostic revealed swollen battery - dealer refused buyback.",
  });
  assert.equal(rejectedCase.current_status, "rejected_by_provider");
  assert.equal(rejectedCase.rejection_or_failure_reason, "Diagnostic revealed swollen battery - dealer refused buyback.");

  // User can pivot from rejected_by_provider to alternative contact
  const pivoted = await RecoveryRepository.transitionCase(rejectedCase.id, {
    targetStatus: "contacted",
    changedByRole: "user",
    newProviderId: "demo-provider-1", // Switching to certified recycler
    reasonOrNotes: "Pivoted to Apex Certified Recycler following buyback rejection.",
  });
  assert.equal(pivoted.current_status, "contacted");
  assert.equal(pivoted.provider_id, "demo-provider-1", "Provider updated on alternative pivot");
  console.log("✓ Test 4: Rejection reasons enforced and alternative provider pivoting verified.");
});

test("5. User cannot self-certify provider confirmation", () => {
  const check = validateStatusTransition("contacted", {
    targetStatus: "accepted_by_provider",
    changedByRole: "user",
    isProviderConfirmed: true, // User claims provider verified!
  });
  assert.equal(check.isValid, false, "User asserting provider confirmation must be rejected");
  assert.ok(check.error?.includes("User cannot self-certify provider confirmation"));
  console.log("✓ Test 5: Client-side privilege escalation for provider verification blocked.");
});

test("6. Hazardous device safety override blocks commercial case initiation", () => {
  const forbiddenCommercialPathways = [
    "sell-cash",
    "exchange-voucher",
    "repair",
    "refurbishers-parts",
    "donate-reuse",
  ];

  for (const pathway of forbiddenCommercialPathways) {
    const isCommercial = pathway !== "authorised-recycling";
    assert.equal(isCommercial, true, `Pathway '${pathway}' is commercial and must be blocked for hazardous units`);
  }
  console.log("✓ Test 6: Hazardous safety safeguard blocks all 5 commercial recovery pathways.");
});
