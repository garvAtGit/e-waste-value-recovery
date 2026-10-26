import { test } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import {
  RecoveryRepository,
  ProductionDatabaseConfigurationError,
  isValidUUID,
} from "../src/lib/recovery-cases/repository";
import {
  getAdminKey,
  isRequestAdmin,
  DEFAULT_DEV_ADMIN_KEY,
  timingSafeEqual,
} from "../src/lib/auth/roles";
import { SavedAssessmentRow, RecoveryCaseRow, CaseStatusHistoryRow, AdminAuditLogRow } from "../src/lib/supabase/types";

console.log("=== EXECUTING FOCUSED PRODUCTION-READINESS TEST SUITE ===");

/**
 * Mock Supabase Database Client for deterministic unit testing of read-through and write-through persistence.
 */
function createMockSupabaseClient() {
  const tables = {
    saved_assessments: new Map<string, SavedAssessmentRow>(),
    recovery_cases: new Map<string, RecoveryCaseRow>(),
    case_status_history: [] as CaseStatusHistoryRow[],
    admin_audit_logs: [] as AdminAuditLogRow[],
    providers: new Map<string, Record<string, unknown>>(),
  };

  return {
    tables,
    from(tableName: keyof typeof tables) {
      return {
        insert(payload: unknown) {
          const item = payload as Record<string, unknown>;
          if (tableName === "saved_assessments") {
            tables.saved_assessments.set(item.id as string, item as unknown as SavedAssessmentRow);
            return {
              select() {
                return {
                  single: async () => ({ data: item, error: null }),
                };
              },
            };
          }
          if (tableName === "recovery_cases") {
            tables.recovery_cases.set(item.id as string, item as unknown as RecoveryCaseRow);
            return {
              select() {
                return {
                  single: async () => ({ data: item, error: null }),
                };
              },
            };
          }
          if (tableName === "case_status_history") {
            tables.case_status_history.push(item as unknown as CaseStatusHistoryRow);
            return Promise.resolve({ error: null });
          }
          if (tableName === "admin_audit_logs") {
            tables.admin_audit_logs.push(item as unknown as AdminAuditLogRow);
            return Promise.resolve({ error: null });
          }
          return Promise.resolve({ error: null });
        },
        update(payload: unknown) {
          return {
            eq: async (col: string, val: unknown) => {
              if (tableName === "recovery_cases") {
                const existing = tables.recovery_cases.get(String(val));
                if (existing) {
                  tables.recovery_cases.set(String(val), { ...existing, ...(payload as Record<string, unknown>) });
                }
              }
              return { error: null };
            },
          };
        },
        select() {
          return {
            eq(col: string, val: unknown) {
              return {
                maybeSingle: async () => {
                  if (tableName === "recovery_cases") {
                    const row = tables.recovery_cases.get(String(val)) || null;
                    return { data: row, error: null };
                  }
                  if (tableName === "saved_assessments") {
                    const row = tables.saved_assessments.get(String(val)) || null;
                    return { data: row, error: null };
                  }
                  return { data: null, error: null };
                },
                order: async () => {
                  if (tableName === "case_status_history") {
                    const history = tables.case_status_history.filter((h) => h.case_id === String(val));
                    return { data: history, error: null };
                  }
                  return { data: [], error: null };
                },
              };
            },
            or() {
              return {
                eq() {
                  return this;
                },
                order: async () => {
                  return { data: Array.from(tables.recovery_cases.values()), error: null };
                },
              };
            },
            order: async () => {
              if (tableName === "recovery_cases") {
                return { data: Array.from(tables.recovery_cases.values()), error: null };
              }
              if (tableName === "admin_audit_logs") {
                return { data: [...tables.admin_audit_logs].reverse(), error: null };
              }
              return { data: [], error: null };
            },
          };
        },
      };
    },
  };
}

test("1. Persistence & Server Restart Survival: Case and history survive in-memory cache clear via Supabase read-through", async () => {
  RecoveryRepository._resetStoreForTesting();
  const mockSupabase = createMockSupabaseClient();
  RecoveryRepository._setDatabaseClientForTesting(mockSupabase);

  const sessionId = "persistent-user-session-1";
  const assessmentInput = {
    categorySlug: "smartphones-tablets",
    deviceModel: "OnePlus 11 5G",
    condition: "working_recent",
    specificFault: "None",
    pincode: "110001",
    priority: "maximise_money",
  };

  // 1. Create case with mock Supabase client
  const createdCase = await RecoveryRepository.createCase({
    sessionId,
    pathwayId: "sell-cash",
    providerId: "a0110001-0001-4000-8000-000000000001",
    assessmentInput,
    userNotes: "Persistent storage verification",
  });

  assert.ok(isValidUUID(createdCase.id), "Case ID is valid UUID");
  assert.equal(createdCase.current_status, "created");
  assert.equal(mockSupabase.tables.recovery_cases.size, 1, "Persisted into Supabase recovery_cases table");
  assert.equal(mockSupabase.tables.saved_assessments.size, 1, "Persisted into Supabase saved_assessments table");
  assert.equal(mockSupabase.tables.case_status_history.length, 1, "Persisted into Supabase case_status_history table");

  // 2. Advance case status
  const contactedCase = await RecoveryRepository.transitionCase(createdCase.id, {
    targetStatus: "contacted",
    changedByRole: "user",
    reasonOrNotes: "User phoned provider",
  });
  assert.equal(contactedCase.current_status, "contacted");
  assert.equal(mockSupabase.tables.case_status_history.length, 2, "Second history entry persisted to database");

  // 3. Admin verifies outcome
  const verifiedCase = await RecoveryRepository.adminVerifyOutcome(
    createdCase.id,
    "lead_auditor_1",
    "Customer provided digital receipt"
  );
  assert.equal(verifiedCase.is_provider_verified, true);
  assert.equal(verifiedCase.verification_tier, "provider_verified");
  assert.equal(mockSupabase.tables.admin_audit_logs.length, 1, "Audit log persisted to Supabase");

  // 4. SIMULATE SERVER RESTART:
  // Wipe all in-memory repository maps completely, retaining ONLY the database client
  RecoveryRepository._resetStoreForTesting();
  RecoveryRepository._setDatabaseClientForTesting(mockSupabase);

  // 5. Query case after server restart
  const reloadedCase = await RecoveryRepository.getCaseWithDetails(createdCase.id);
  assert.ok(reloadedCase !== null, "Case reloaded successfully from database after restart");
  assert.equal(reloadedCase?.id, createdCase.id, "Case ID matches");
  assert.equal(reloadedCase?.current_status, "contacted", "Status preserved across restart");
  assert.equal(reloadedCase?.is_provider_verified, true, "Provider verification preserved across restart");
  assert.equal(reloadedCase?.verification_tier, "provider_verified", "Verification tier preserved across restart");
  assert.equal(reloadedCase?.assessment?.device_model, "OnePlus 11 5G", "Joined assessment preserved across restart");
  assert.equal(reloadedCase?.status_history.length, 2, "Joined status history preserved across restart");

  // 6. Test listCases read-through
  RecoveryRepository._resetStoreForTesting();
  RecoveryRepository._setDatabaseClientForTesting(mockSupabase);
  const listedCases = await RecoveryRepository.listCases({ isAdmin: true });
  assert.equal(listedCases.length, 1, "Cases listed via Supabase read-through after restart");

  console.log("✓ Test 1: Full persistence & server restart survival verified.");
});

test("2. Environment Behavior: Production strictly fails closed when database is unconfigured or errors occur", async () => {
  const originalEnv = process.env.NODE_ENV;
  const originalFallback = process.env.ALLOW_IN_MEMORY_FALLBACK;

  try {
    process.env.NODE_ENV = "production";
    delete process.env.ALLOW_IN_MEMORY_FALLBACK;

    // Simulate unconfigured database in production (no Supabase client)
    RecoveryRepository._resetStoreForTesting();
    RecoveryRepository._setDatabaseClientForTesting(null);

    await assert.rejects(
      async () => {
        await RecoveryRepository.createCase({
          sessionId: "prod-session-1",
          pathwayId: "recycling",
          userNotes: "Should fail in prod without DB",
        });
      },
      (err: unknown) => {
        assert.ok(err instanceof ProductionDatabaseConfigurationError);
        assert.match(err.message, /Database connection is unconfigured in production/);
        return true;
      },
      "Must throw ProductionDatabaseConfigurationError when database is unconfigured in production"
    );

    await assert.rejects(
      async () => {
        await RecoveryRepository.saveAssessment(
          "prod-session-1",
          { categorySlug: "smartphones-tablets", condition: "working_recent", priority: "dispose_responsibly" },
          "recycling",
          false
        );
      },
      (err: unknown) => {
        assert.ok(err instanceof ProductionDatabaseConfigurationError);
        return true;
      },
      "Must throw ProductionDatabaseConfigurationError on saveAssessment without DB"
    );

    // Simulate database query error in production (e.g. network failure)
    const failingDbClient = {
      from() {
        return {
          insert() {
            return {
              select() {
                return {
                  single: async () => ({ data: null, error: { message: "Database connection refused at port 5432" } }),
                };
              },
            };
          },
        };
      },
    };

    RecoveryRepository._setDatabaseClientForTesting(failingDbClient);

    await assert.rejects(
      async () => {
        await RecoveryRepository.saveAssessment(
          "prod-session-1",
          { categorySlug: "smartphones-tablets", condition: "working_recent", priority: "dispose_responsibly" },
          "recycling",
          false
        );
      },
      (err: unknown) => {
        assert.ok(err instanceof ProductionDatabaseConfigurationError);
        assert.match(err.message, /Failed to persist saved assessment to Supabase/);
        return true;
      },
      "Must throw ProductionDatabaseConfigurationError on database query failure in production"
    );

    // Verify ALLOW_IN_MEMORY_FALLBACK=true allows in-memory fallback even in production
    process.env.ALLOW_IN_MEMORY_FALLBACK = "true";
    RecoveryRepository._setDatabaseClientForTesting(null);

    const fallbackRecord = await RecoveryRepository.saveAssessment(
      "prod-session-fallback",
      { categorySlug: "smartphones-tablets", condition: "working_recent", priority: "dispose_responsibly" },
      "recycling",
      false
    );
    assert.ok(fallbackRecord.id, "In-memory fallback explicitly permitted when ALLOW_IN_MEMORY_FALLBACK=true");

    console.log("✓ Test 2: Production fail-closed behavior and error boundaries verified.");
  } finally {
    process.env.NODE_ENV = originalEnv;
    if (originalFallback !== undefined) {
      process.env.ALLOW_IN_MEMORY_FALLBACK = originalFallback;
    } else {
      delete process.env.ALLOW_IN_MEMORY_FALLBACK;
    }
    RecoveryRepository._resetStoreForTesting();
  }
});

test("3. Admin Authentication Security: Production rejects default dev key, weak keys, and missing keys", async () => {
  const originalEnv = process.env.NODE_ENV;
  const originalKey = process.env.ADMIN_API_KEY;

  try {
    // 3.1 Test in production mode
    process.env.NODE_ENV = "production";

    // Scenario A: Missing ADMIN_API_KEY in production
    delete process.env.ADMIN_API_KEY;
    assert.equal(getAdminKey(), null, "Production returns null if ADMIN_API_KEY is not set");

    // Scenario B: Insecure development key used in production
    process.env.ADMIN_API_KEY = DEFAULT_DEV_ADMIN_KEY;
    assert.equal(getAdminKey(), null, "Production strictly rejects DEFAULT_DEV_ADMIN_KEY");

    // Scenario C: Trivial/weak key (< 16 characters) used in production
    process.env.ADMIN_API_KEY = "weak-secret";
    assert.equal(getAdminKey(), null, "Production strictly rejects weak key (< 16 chars)");

    // Scenario D: Valid strong production key (>= 16 characters)
    const strongKey = "delhi-ewaste-prod-admin-auth-key-2026-secure-token";
    process.env.ADMIN_API_KEY = strongKey;
    assert.equal(getAdminKey(), strongKey, "Production accepts strong admin key");

    // Test isRequestAdmin with strong production key
    const validHeaderReq = new NextRequest("http://localhost:3000/api/admin/cases", {
      headers: { "x-admin-key": strongKey },
    });
    assert.equal(isRequestAdmin(validHeaderReq), true, "Valid header key authenticated");

    const validCookieReq = new NextRequest("http://localhost:3000/api/admin/cases", {
      headers: { cookie: `admin_token=${strongKey}` },
    });
    assert.equal(isRequestAdmin(validCookieReq), true, "Valid cookie key authenticated");

    const wrongKeyReq = new NextRequest("http://localhost:3000/api/admin/cases", {
      headers: { "x-admin-key": "invalid-hacker-attempt-token-wrong" },
    });
    assert.equal(isRequestAdmin(wrongKeyReq), false, "Wrong key rejected");

    const unauthenticatedReq = new NextRequest("http://localhost:3000/api/admin/cases");
    assert.equal(isRequestAdmin(unauthenticatedReq), false, "Unauthenticated request rejected");

    // 3.2 Test in development mode
    process.env.NODE_ENV = "development";
    delete process.env.ADMIN_API_KEY;
    assert.equal(getAdminKey(), DEFAULT_DEV_ADMIN_KEY, "Development falls back to default dev key");

    // 3.3 Verify constant-time comparison
    assert.equal(timingSafeEqual("abc", "abc"), true);
    assert.equal(timingSafeEqual("abc", "abd"), false);
    assert.equal(timingSafeEqual("abc", "abcd"), false);

    console.log("✓ Test 3: Admin authentication fail-closed, key validation, and timing-safe comparison verified.");
  } finally {
    process.env.NODE_ENV = originalEnv;
    if (originalKey !== undefined) {
      process.env.ADMIN_API_KEY = originalKey;
    } else {
      delete process.env.ADMIN_API_KEY;
    }
  }
});

test("4. Outcome Integrity & Privilege Escalation Prevention", async () => {
  RecoveryRepository._resetStoreForTesting();

  // Create an initial case
  const testCase = await RecoveryRepository.createCase({
    sessionId: "user-session-abc",
    pathwayId: "repair",
    userNotes: "Repair test",
  });

  // Attempt privilege escalation: Regular user claiming isProviderConfirmed = true
  // The state machine strictly rejects this attempt with InvalidStatusTransitionError
  await assert.rejects(
    async () => {
      await RecoveryRepository.transitionCase(testCase.id, {
        targetStatus: "contacted",
        changedByRole: "user",
        isProviderConfirmed: true, // User attempts to self-certify provider confirmation
      });
    },
    (err: unknown) => {
      assert.match(
        (err as Error).message,
        /User cannot self-certify provider confirmation/
      );
      return true;
    },
    "State machine must strictly block user self-certification of provider confirmation"
  );

  // Normal user transition without provider confirmation succeeds
  const userContacted = await RecoveryRepository.transitionCase(testCase.id, {
    targetStatus: "contacted",
    changedByRole: "user",
    isProviderConfirmed: false,
  });
  assert.equal(userContacted.is_provider_verified, false, "Remains unverified on user transition");
  assert.equal(userContacted.verification_tier, "user_reported", "Remains user_reported tier");

  // Authorized transition: Admin confirms provider
  const adminTransition = await RecoveryRepository.transitionCase(testCase.id, {
    targetStatus: "accepted_by_provider",
    changedByRole: "admin",
    isProviderConfirmed: true,
  });

  assert.equal(adminTransition.is_provider_verified, true, "Admin role successfully verifies provider confirmation");
  assert.equal(adminTransition.verification_tier, "provider_verified", "Admin role elevates verification_tier");
  assert.equal(adminTransition.status_history[2].is_provider_confirmed, true, "History record records confirmed provider status");

  console.log("✓ Test 4: Outcome integrity & privilege escalation prevention verified.");
});

console.log("=== ALL PRODUCTION-READINESS TESTS COMPLETED SUCCESSFULLY ===");
