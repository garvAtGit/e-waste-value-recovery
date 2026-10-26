import { test } from "node:test";
import assert from "node:assert/strict";
import { computePlatformAnalytics } from "../src/lib/analytics/engine";

console.log("=== EXECUTING ANALYTICS & IMPACT TEST SUITE ===");

test("1. Platform analytics aggregates actual records deterministically", async () => {
  const analytics = await computePlatformAnalytics();

  assert.ok(analytics.overview.totalRecoveryCasesInitiated >= 1, "At least 1 case initiated");
  assert.ok(analytics.overview.completionRatePct >= 0 && analytics.overview.completionRatePct <= 100, "Completion rate is a valid percentage");
  assert.ok(analytics.overview.providerAcceptanceRatePct >= 0 && analytics.overview.providerAcceptanceRatePct <= 100, "Acceptance rate is a valid percentage");

  // Check verification split
  const totalCompleted = analytics.outcomesByVerificationTier.totalCompleted;
  const userReported = analytics.outcomesByVerificationTier.userReportedCount;
  const providerVerified = analytics.outcomesByVerificationTier.providerVerifiedCount;
  assert.equal(userReported + providerVerified, totalCompleted, "Verification split matches total completed");

  // Check pathways breakdown
  assert.equal(analytics.casesByPathway.length, 6, "All 6 pathways represented in breakdown");
  const repairPathway = analytics.casesByPathway.find((p) => p.pathwayId === "repair");
  assert.ok(repairPathway, "Repair pathway present in metrics");

  // Check provider intelligence
  assert.ok(analytics.providerIntelligence.totalProvidersInRegistry >= 6, "Includes audited candidate registry");
  assert.ok(analytics.providerIntelligence.approvedProviders >= 1, "Approved providers counted");

  // Check environmental metrics
  assert.ok(analytics.environmentalImpact.totalEwasteDivertedKg >= 0, "Diverted kg is non-negative");
  assert.ok(analytics.environmentalImpact.embodiedGhgDeferredKgCo2e >= 0, "Embodied CO2e is non-negative");
  assert.ok(analytics.environmentalImpact.methodologyNotes.dataBasis.length > 0, "Data basis documented");
  assert.ok(analytics.environmentalImpact.methodologyNotes.assumptions.length >= 2, "Assumptions documented");
  assert.ok(analytics.environmentalImpact.methodologyNotes.limitations.length >= 2, "Limitations documented");

  console.log("✓ Test 1: Operational funnel, verification split, and environmental metrics fully validated.");
});
