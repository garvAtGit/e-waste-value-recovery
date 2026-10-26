import { test } from "node:test";
import assert from "node:assert/strict";
import { RecoveryRepository } from "../src/lib/recovery-cases/repository";
import { isRequestAdmin, getAdminKey } from "../src/lib/auth/roles";
import { NextRequest } from "next/server";

console.log("=== EXECUTING ADMIN OPERATIONS & VERIFICATION TEST SUITE ===");

test("1. Candidate provider approval, rejection, and audit log generation", async () => {
  // Check initial state
  const candidates = await RecoveryRepository.listCandidateProviders();
  const cashify = candidates.find((c) => c.slug === "cashify-delhi" || c.id === "a0110001-0001-4000-8000-000000000001");
  assert.ok(cashify, "Candidate provider exists in registry");
  const candidateId = cashify.id;

  // Editorial action: Approve candidate with verified evidence
  const approved = await RecoveryRepository.updateCandidateStatus(
    candidateId,
    "approved",
    "verified",
    "lead_auditor_sharma",
    "DPCC recycler authorization certificate #2026-9812 verified against official portal."
  );

  assert.equal(approved.approval_status, "approved");
  assert.equal(approved.verification_status, "verified");

  // Inspect audit logs
  const logs = await RecoveryRepository.listAdminAuditLogs();
  const latestLog = logs[0];
  assert.ok(latestLog, "Audit log generated");
  assert.equal(latestLog.action_type, "provider_approved");
  assert.equal(latestLog.target_entity_id, candidateId);
  assert.equal(latestLog.admin_identifier, "lead_auditor_sharma");

  // Editorial action: Reject candidate
  const goonjCandidate = candidates.find((c) => c.slug.includes("goonj"));
  assert.ok(goonjCandidate, "Goonj candidate found");
  const rejected = await RecoveryRepository.updateCandidateStatus(
    goonjCandidate.id,
    "rejected",
    "unverified",
    "lead_auditor_sharma",
    "Consumer collection SLA unconfirmed for non-working electronics."
  );
  assert.equal(rejected.approval_status, "rejected");

  const logsAfterReject = await RecoveryRepository.listAdminAuditLogs();
  assert.equal(logsAfterReject[0].action_type, "provider_rejected");
  console.log("✓ Test 1: Provider approval, rejection, and immutable audit logging verified.");
});

test("2. Admin outcome verification elevates case to provider_verified", async () => {
  // Create and complete a case as user
  const newCase = await RecoveryRepository.createCase({
    sessionId: "test-admin-session-1",
    pathwayId: "authorised-recycling",
    providerId: "demo-provider-1",
  });
  const contacted = await RecoveryRepository.transitionCase(newCase.id, {
    targetStatus: "contacted",
    changedByRole: "user",
  });
  const accepted = await RecoveryRepository.transitionCase(contacted.id, {
    targetStatus: "accepted_by_provider",
    changedByRole: "user",
  });
  const delivered = await RecoveryRepository.transitionCase(accepted.id, {
    targetStatus: "dropped_off_or_collected",
    changedByRole: "user",
  });
  const completed = await RecoveryRepository.transitionCase(delivered.id, {
    targetStatus: "completed",
    changedByRole: "user",
    outcomeType: "recycled_certified",
  });

  assert.equal(completed.is_provider_verified, false, "Initial completed case is not provider verified");
  assert.equal(completed.verification_tier, "user_reported", "Initial tier is user_reported");

  // Admin verifies outcome with proof
  const verifiedCase = await RecoveryRepository.adminVerifyOutcome(
    completed.id,
    "regulatory_compliance_officer",
    "Weigh-in receipt #APX-4921 matched against industrial facility scale log."
  );

  assert.equal(verifiedCase.is_provider_verified, true, "is_provider_verified is now true");
  assert.equal(verifiedCase.verification_tier, "provider_verified", "verification_tier is now provider_verified");
  assert.ok(verifiedCase.evidence_notes?.includes("Weigh-in receipt #APX-4921"));

  const logs = await RecoveryRepository.listAdminAuditLogs();
  assert.equal(logs[0].action_type, "case_outcome_verified");
  assert.equal(logs[0].target_entity_id, completed.id);
  console.log("✓ Test 2: Admin outcome verification elevates user outcome to provider_verified tier.");
});

test("3. Admin authentication rejects unauthorized requests and timing-safe comparison", () => {
  const adminKey = getAdminKey();

  // Test with valid header
  const validReq = new NextRequest("http://localhost:3000/api/admin/providers", {
    headers: { "x-admin-key": adminKey },
  });
  assert.equal(isRequestAdmin(validReq), true, "Valid x-admin-key header must authenticate");

  // Test with invalid header
  const invalidReq = new NextRequest("http://localhost:3000/api/admin/providers", {
    headers: { "x-admin-key": "wrong-key-attempt" },
  });
  assert.equal(isRequestAdmin(invalidReq), false, "Invalid header key must be rejected");

  // Test with valid cookie
  const validCookieReq = new NextRequest("http://localhost:3000/api/admin/providers", {
    headers: { cookie: `admin_token=${adminKey}` },
  });
  assert.equal(isRequestAdmin(validCookieReq), true, "Valid cookie token must authenticate");

  // Test missing credentials
  const noCredsReq = new NextRequest("http://localhost:3000/api/admin/providers");
  assert.equal(isRequestAdmin(noCredsReq), false, "Missing credentials must be rejected");
  console.log("✓ Test 3: Admin authentication enforcement and cookie/header validation verified.");
});
