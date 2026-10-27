import crypto from "crypto";
import {
  SavedAssessmentRow,
  RecoveryCaseRow,
  CaseStatusHistoryRow,
  AdminAuditLogRow,
  ProviderWithDetails,
} from "../supabase/types";
import {
  CreateCaseInput,
  CaseTransitionRequest,
  RecoveryCaseWithDetails,
} from "./types";
import { validateStatusTransition, InvalidStatusTransitionError } from "./state-machine";
import { SAMPLE_PROVIDERS } from "../constants/sample-providers";
import { DELHI_CANDIDATE_PROVIDERS } from "../constants/delhi-candidates";
import { getSupabaseClient } from "../supabase/client";
import { getSupabaseServerClient } from "../supabase/server";

export class ProductionDatabaseConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProductionDatabaseConfigurationError";
  }
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidUUID(id: string | null | undefined): boolean {
  return typeof id === "string" && UUID_REGEX.test(id);
}

function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function isStrictProduction(): boolean {
  return process.env.NODE_ENV === "production" && process.env.ALLOW_IN_MEMORY_FALLBACK !== "true";
}

// In-Memory fallback store for tests, development, and offline scenarios
class InMemoryStore {
  savedAssessments = new Map<string, SavedAssessmentRow>();
  recoveryCases = new Map<string, RecoveryCaseRow>();
  statusHistory: CaseStatusHistoryRow[] = [];
  adminAuditLogs: AdminAuditLogRow[] = [];
  candidateProviders = new Map<string, ProviderWithDetails>();

  constructor() {
    this.seedInitialCandidates();
    this.seedInitialSampleCases();
  }

  seedInitialCandidates() {
    for (const candidate of DELHI_CANDIDATE_PROVIDERS) {
      this.candidateProviders.set(candidate.id, {
        ...candidate,
        services: candidate.services.map((s) => ({
          ...s,
          service_categories: [],
        })),
      });
    }
    for (const p of SAMPLE_PROVIDERS) {
      if (!this.candidateProviders.has(p.id)) {
        this.candidateProviders.set(p.id, p);
      }
    }
  }

  seedInitialSampleCases() {
    const demoAssessmentId = "demo-assessment-1";
    const demoCaseId = "demo-case-1";
    const now = new Date().toISOString();

    this.savedAssessments.set(demoAssessmentId, {
      id: demoAssessmentId,
      session_id: "demo-session-user",
      user_id: null,
      category_slug: "smartphones-tablets",
      device_model: "iPhone 12 Pro (Sample)",
      condition: "minor_fault",
      specific_fault: "Cracked rear glass, battery 78%",
      pincode: "560034",
      priority: "repair_keep",
      primary_pathway_id: "repair",
      is_hazardous: false,
      assessment_payload: {},
      created_at: now,
    });

    this.recoveryCases.set(demoCaseId, {
      id: demoCaseId,
      session_id: "demo-session-user",
      user_id: null,
      saved_assessment_id: demoAssessmentId,
      pathway_id: "repair",
      provider_id: "demo-provider-3",
      current_status: "contacted",
      verification_tier: "user_reported",
      is_provider_verified: false,
      outcome_type: null,
      financial_value_inr: null,
      rejection_or_failure_reason: null,
      user_notes: "Inquired about genuine glass replacement and battery health calibration.",
      evidence_notes: null,
      evidence_url: null,
      created_at: now,
      updated_at: now,
    });

    this.statusHistory.push({
      id: "demo-hist-1",
      case_id: demoCaseId,
      from_status: "created",
      to_status: "contacted",
      changed_by_role: "user",
      is_provider_confirmed: false,
      notes: "Submitted repair inquiry to workshop via phone.",
      created_at: now,
    });
  }
}

// Global store attached to globalThis to survive Next.js module reloads in development
const globalForRecovery = globalThis as unknown as { __recoveryStore?: InMemoryStore };
const globalStore = globalForRecovery.__recoveryStore ?? new InMemoryStore();
globalForRecovery.__recoveryStore = globalStore;

// Interface for type-safe interaction with Supabase dynamic query builder
interface DynamicTableQuery {
  insert: (item: unknown) => {
    select: () => {
      single: () => Promise<{ data: unknown; error: { message: string } | null }>;
    };
  };
  update: (item: unknown) => {
    eq: (col: string, val: unknown) => Promise<{ error: { message: string } | null }>;
  };
  select: (cols?: string) => {
    eq: (col: string, val: unknown) => {
      maybeSingle: () => Promise<{ data: unknown; error: { message: string } | null }>;
      order: (col: string, opts?: { ascending?: boolean }) => Promise<{ data: unknown[]; error: { message: string } | null }>;
    };
    or: (filters: string) => DynamicFilteredQuery;
    order: (col: string, opts?: { ascending?: boolean }) => Promise<{ data: unknown[]; error: { message: string } | null }>;
  };
}

interface DynamicFilteredQuery {
  eq: (col: string, val: unknown) => DynamicFilteredQuery;
  order: (col: string, opts?: { ascending?: boolean }) => Promise<{ data: unknown[]; error: { message: string } | null }>;
}

let testDatabaseClient: unknown = undefined;

export class RecoveryRepository {
  /**
   * Test Hook: Override the Supabase client used by the repository.
   * Pass null to simulate an unconfigured database, or a mock client.
   * Pass undefined to restore default resolution.
   */
  static _setDatabaseClientForTesting(client: unknown) {
    testDatabaseClient = client;
  }

  /**
   * Test Hook: Clear in-memory caches to simulate server restarts or clean runs.
   */
  static _resetStoreForTesting() {
    globalStore.savedAssessments.clear();
    globalStore.recoveryCases.clear();
    globalStore.statusHistory = [];
    globalStore.adminAuditLogs = [];
    testDatabaseClient = undefined;
  }

  /**
   * Resolves the active database client:
   * 1. Test override if present.
   * 2. Server client (with service_role) if available.
   * 3. Public client as fallback.
   */
  private static getDb(): unknown | null {
    if (testDatabaseClient !== undefined) {
      return testDatabaseClient;
    }
    return getSupabaseServerClient() || getSupabaseClient();
  }

  /**
   * 1. Save an assessment payload
   */
  static async saveAssessment(
    sessionId: string,
    input: CreateCaseInput["assessmentInput"],
    primaryPathwayId: string,
    isHazardous: boolean,
    userId?: string | null
  ): Promise<SavedAssessmentRow> {
    const id = generateUUID();
    const now = new Date().toISOString();

    const record: SavedAssessmentRow = {
      id,
      session_id: sessionId,
      user_id: userId || null,
      category_slug: input?.categorySlug || "smartphones-tablets",
      device_model: input?.deviceModel || null,
      condition: input?.condition || "minor_fault",
      specific_fault: input?.specificFault || null,
      pincode: input?.pincode || null,
      priority: input?.priority || "maximise_money",
      primary_pathway_id: primaryPathwayId,
      is_hazardous: isHazardous,
      assessment_payload: input ? JSON.parse(JSON.stringify(input)) : {},
      created_at: now,
    };

    const supabase = this.getDb();
    if (!supabase) {
      if (isStrictProduction()) {
        throw new ProductionDatabaseConfigurationError(
          "Database connection is unconfigured in production. Real Supabase persistence is mandatory unless ALLOW_IN_MEMORY_FALLBACK=true."
        );
      }
      globalStore.savedAssessments.set(id, record);
      return record;
    }

    try {
      const { data, error } = await (supabase as { from: (t: string) => DynamicTableQuery })
        .from("saved_assessments")
        .insert(record)
        .select()
        .single();

      if (error) {
        if (isStrictProduction()) {
          throw new ProductionDatabaseConfigurationError(
            `Failed to persist saved assessment to Supabase: ${error.message}`
          );
        }
        globalStore.savedAssessments.set(id, record);
        return record;
      }

      const typedData = (data as SavedAssessmentRow) || record;
      globalStore.savedAssessments.set(typedData.id, typedData);
      return typedData;
    } catch (err) {
      if (err instanceof ProductionDatabaseConfigurationError) throw err;
      if (isStrictProduction()) {
        throw new ProductionDatabaseConfigurationError(
          `Production database persistence error: ${err instanceof Error ? err.message : String(err)}`
        );
      }
      globalStore.savedAssessments.set(id, record);
      return record;
    }
  }

  /**
   * 2. Create a new recovery case
   */
  static async createCase(input: CreateCaseInput): Promise<RecoveryCaseWithDetails> {
    const caseId = generateUUID();
    const historyId = generateUUID();
    const now = new Date().toISOString();

    let savedAssessmentId = input.savedAssessmentId;

    // If assessment input provided directly, save assessment first
    if (!savedAssessmentId && input.assessmentInput) {
      const saved = await this.saveAssessment(
        input.sessionId,
        input.assessmentInput,
        input.pathwayId,
        input.assessmentInput.condition === "unsafe_hazardous",
        input.userId
      );
      savedAssessmentId = saved.id;
    }

    const caseRecord: RecoveryCaseRow = {
      id: caseId,
      session_id: input.sessionId,
      user_id: input.userId || null,
      saved_assessment_id: savedAssessmentId || null,
      pathway_id: input.pathwayId,
      provider_id: input.providerId || null,
      current_status: "created",
      verification_tier: "user_reported",
      is_provider_verified: false,
      outcome_type: null,
      financial_value_inr: input.financialValueInr ?? null,
      rejection_or_failure_reason: null,
      user_notes: input.userNotes || null,
      evidence_notes: input.evidenceNotes || null,
      evidence_url: null,
      created_at: now,
      updated_at: now,
    };

    const initialHistory: CaseStatusHistoryRow = {
      id: historyId,
      case_id: caseId,
      from_status: "draft",
      to_status: "created",
      changed_by_role: "user",
      is_provider_confirmed: false,
      notes: input.userNotes || "Recovery case initiated from device assessment.",
      created_at: now,
    };

    const supabase = this.getDb();
    if (!supabase) {
      if (isStrictProduction()) {
        throw new ProductionDatabaseConfigurationError(
          "Database connection is unconfigured in production. Real Supabase persistence is mandatory for recovery cases unless ALLOW_IN_MEMORY_FALLBACK=true."
        );
      }
      globalStore.recoveryCases.set(caseId, caseRecord);
      globalStore.statusHistory.push(initialHistory);
      return this.getCaseWithDetails(caseId) as Promise<RecoveryCaseWithDetails>;
    }

    try {
      // provider_id in Postgres has a foreign key to providers(id UUID).
      // Sanitize non-UUID provider strings (e.g. demo fixtures) to null for DB insertion.
      const dbCasePayload = {
        ...caseRecord,
        saved_assessment_id: isValidUUID(caseRecord.saved_assessment_id) ? caseRecord.saved_assessment_id : null,
        provider_id: isValidUUID(caseRecord.provider_id) ? caseRecord.provider_id : null,
      };

      const { data, error } = await (supabase as { from: (t: string) => DynamicTableQuery })
        .from("recovery_cases")
        .insert(dbCasePayload)
        .select()
        .single();

      if (error) {
        if (isStrictProduction()) {
          throw new ProductionDatabaseConfigurationError(
            `Failed to persist recovery case to Supabase: ${error.message}`
          );
        }
        globalStore.recoveryCases.set(caseId, caseRecord);
        globalStore.statusHistory.push(initialHistory);
        return this.getCaseWithDetails(caseId) as Promise<RecoveryCaseWithDetails>;
      }

      const { error: histError } = await (supabase as { from: (t: string) => { insert: (row: unknown) => Promise<{ error: { message: string } | null }> } })
        .from("case_status_history")
        .insert(initialHistory);

      if (histError && isStrictProduction()) {
        throw new ProductionDatabaseConfigurationError(
          `Failed to persist initial case status history in Supabase: ${histError.message}`
        );
      }

      // Preserve original provider_id in local cache even if sanitised for DB foreign key
      const savedCase: RecoveryCaseRow = {
        ...((data as RecoveryCaseRow) || caseRecord),
        provider_id: caseRecord.provider_id,
      };
      globalStore.recoveryCases.set(savedCase.id, savedCase);
      globalStore.statusHistory.push(initialHistory);
      return this.getCaseWithDetails(savedCase.id) as Promise<RecoveryCaseWithDetails>;
    } catch (err) {
      if (err instanceof ProductionDatabaseConfigurationError) throw err;
      if (isStrictProduction()) {
        throw new ProductionDatabaseConfigurationError(
          `Production database persistence error: ${err instanceof Error ? err.message : String(err)}`
        );
      }
      globalStore.recoveryCases.set(caseId, caseRecord);
      globalStore.statusHistory.push(initialHistory);
      return this.getCaseWithDetails(caseId) as Promise<RecoveryCaseWithDetails>;
    }
  }

  /**
   * 3. Get recovery case with joined assessment, provider, and history.
   * Performs read-through query to Supabase if not found in memory (e.g. after server restart).
   */
  static async getCaseWithDetails(caseId: string): Promise<RecoveryCaseWithDetails | null> {
    let caseRecord = globalStore.recoveryCases.get(caseId);

    // Read-through query: If missing from in-memory store, query Supabase directly
    const supabase = this.getDb();
    if (!caseRecord && supabase && isValidUUID(caseId)) {
      try {
        const { data: dbCase, error: caseErr } = await (supabase as { from: (t: string) => DynamicTableQuery })
          .from("recovery_cases")
          .select("*")
          .eq("id", caseId)
          .maybeSingle();

        if (caseErr && isStrictProduction()) {
          throw new ProductionDatabaseConfigurationError(
            `Failed to read recovery case '${caseId}' from Supabase: ${caseErr.message}`
          );
        }

        if (dbCase) {
          caseRecord = dbCase as RecoveryCaseRow;
          globalStore.recoveryCases.set(caseRecord.id, caseRecord);

          // Fetch associated assessment
          if (caseRecord.saved_assessment_id && isValidUUID(caseRecord.saved_assessment_id)) {
            const { data: dbAssessment } = await (supabase as { from: (t: string) => DynamicTableQuery })
              .from("saved_assessments")
              .select("*")
              .eq("id", caseRecord.saved_assessment_id)
              .maybeSingle();
            if (dbAssessment) {
              globalStore.savedAssessments.set(caseRecord.saved_assessment_id, dbAssessment as SavedAssessmentRow);
            }
          }

          // Fetch associated status history
          const { data: dbHistory } = await (supabase as { from: (t: string) => DynamicTableQuery })
            .from("case_status_history")
            .select("*")
            .eq("case_id", caseId)
            .order("created_at", { ascending: true });

          if (dbHistory && Array.isArray(dbHistory) && dbHistory.length > 0) {
            const existingOther = globalStore.statusHistory.filter((h) => h.case_id !== caseId);
            globalStore.statusHistory = [...existingOther, ...(dbHistory as CaseStatusHistoryRow[])];
          }
        }
      } catch (err) {
        if (err instanceof ProductionDatabaseConfigurationError) throw err;
        if (isStrictProduction()) {
          throw new ProductionDatabaseConfigurationError(
            `Database error while querying case '${caseId}': ${err instanceof Error ? err.message : String(err)}`
          );
        }
      }
    }

    if (!caseRecord) return null;

    let assessment = caseRecord.saved_assessment_id
      ? globalStore.savedAssessments.get(caseRecord.saved_assessment_id) || null
      : null;

    if (!assessment && caseRecord.saved_assessment_id && supabase && isValidUUID(caseRecord.saved_assessment_id)) {
      try {
        const { data: dbAssessment } = await (supabase as { from: (t: string) => DynamicTableQuery })
          .from("saved_assessments")
          .select("*")
          .eq("id", caseRecord.saved_assessment_id)
          .maybeSingle();
        if (dbAssessment) {
          assessment = dbAssessment as SavedAssessmentRow;
          globalStore.savedAssessments.set(assessment.id, assessment);
        }
      } catch {
        // Fallback gracefully
      }
    }

    let provider: ProviderWithDetails | null = null;
    if (caseRecord.provider_id) {
      provider =
        globalStore.candidateProviders.get(caseRecord.provider_id) ||
        SAMPLE_PROVIDERS.find((p) => p.id === caseRecord.provider_id) ||
        DELHI_CANDIDATE_PROVIDERS.find((p) => p.id === caseRecord.provider_id) ||
        null;
    }

    const history = globalStore.statusHistory
      .filter((h) => h.case_id === caseId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    return {
      ...caseRecord,
      assessment,
      provider,
      status_history: history,
    };
  }

  /**
   * 4. List recovery cases for a user session or admin view.
   * If Supabase is active, synchronises records before returning.
   */
  static async listCases(filter?: {
    sessionId?: string;
    userId?: string | null;
    pathwayId?: string;
    status?: string;
    isAdmin?: boolean;
  }): Promise<RecoveryCaseWithDetails[]> {
    const supabase = this.getDb();
    if (supabase) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let query: any = (supabase as any).from("recovery_cases").select("*");

        if (!filter?.isAdmin) {
          if (filter?.sessionId && filter?.userId) {
            query = query.or(`session_id.eq.${filter.sessionId},user_id.eq.${filter.userId}`);
          } else if (filter?.sessionId) {
            query = query.eq("session_id", filter.sessionId);
          } else if (filter?.userId) {
            query = query.eq("user_id", filter.userId);
          }
        }

        if (filter?.pathwayId) {
          query = query.eq("pathway_id", filter.pathwayId);
        }
        if (filter?.status) {
          query = query.eq("current_status", filter.status);
        }

        const { data: dbCases, error } = await query.order("created_at", { ascending: false });

        if (error) {
          if (isStrictProduction()) {
            throw new ProductionDatabaseConfigurationError(
              `Failed to list recovery cases from Supabase: ${error.message}`
            );
          }
        } else if (dbCases && Array.isArray(dbCases)) {
          for (const c of dbCases as RecoveryCaseRow[]) {
            const existing = globalStore.recoveryCases.get(c.id);
            const merged = existing?.provider_id && !c.provider_id
              ? { ...c, provider_id: existing.provider_id }
              : c;
            globalStore.recoveryCases.set(merged.id, merged);
          }
        }
      } catch (err) {
        if (err instanceof ProductionDatabaseConfigurationError) throw err;
        if (isStrictProduction()) {
          throw new ProductionDatabaseConfigurationError(
            `Database error while querying cases: ${err instanceof Error ? err.message : String(err)}`
          );
        }
      }
    }

    let cases = Array.from(globalStore.recoveryCases.values());

    if (!filter?.isAdmin) {
      cases = cases.filter(
        (c) =>
          (filter?.sessionId && c.session_id === filter.sessionId) ||
          (filter?.userId && c.user_id === filter.userId)
      );
    }

    if (filter?.pathwayId) {
      cases = cases.filter((c) => c.pathway_id === filter.pathwayId);
    }

    if (filter?.status) {
      cases = cases.filter((c) => c.current_status === filter.status);
    }

    cases.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const result: RecoveryCaseWithDetails[] = [];
    for (const c of cases) {
      const full = await this.getCaseWithDetails(c.id);
      if (full) result.push(full);
    }
    return result;
  }

  /**
   * 5. Apply validated state transition to a case and persist update and history to Supabase
   */
  static async transitionCase(
    caseId: string,
    request: CaseTransitionRequest
  ): Promise<RecoveryCaseWithDetails> {
    const existingCase = await this.getCaseWithDetails(caseId);
    if (!existingCase) {
      throw new Error(`Recovery case '${caseId}' not found.`);
    }

    // Validate transition
    const validation = validateStatusTransition(existingCase.current_status, request);
    if (!validation.isValid) {
      throw new InvalidStatusTransitionError(
        existingCase.current_status,
        request.targetStatus,
        validation.error || "Transition not permitted."
      );
    }

    const now = new Date().toISOString();
    const historyId = generateUUID();

    const updated: RecoveryCaseRow = {
      ...existingCase,
      current_status: request.targetStatus,
      updated_at: now,
    };

    if (request.newProviderId) {
      updated.provider_id = request.newProviderId;
    }

    if (request.outcomeType) {
      updated.outcome_type = request.outcomeType;
    }
    if (request.financialValueInr !== undefined) {
      updated.financial_value_inr = request.financialValueInr;
    }

    if (request.reasonOrNotes) {
      if (request.targetStatus === "rejected_by_provider" || request.targetStatus === "failed") {
        updated.rejection_or_failure_reason = request.reasonOrNotes;
      }
    }

    if (request.evidenceNotes) {
      updated.evidence_notes = request.evidenceNotes;
    }
    if (request.evidenceUrl) {
      updated.evidence_url = request.evidenceUrl;
    }

    const isConfirmedByPrivilege = Boolean(
      request.isProviderConfirmed && (request.changedByRole === "admin" || request.changedByRole === "provider")
    );
    if (isConfirmedByPrivilege) {
      updated.is_provider_verified = true;
      updated.verification_tier = "provider_verified";
    }

    const historyEntry: CaseStatusHistoryRow = {
      id: historyId,
      case_id: caseId,
      from_status: existingCase.current_status,
      to_status: request.targetStatus,
      changed_by_role: request.changedByRole,
      is_provider_confirmed: isConfirmedByPrivilege,
      notes: request.reasonOrNotes || null,
      created_at: now,
    };

    const supabase = this.getDb();
    if (supabase) {
      try {
        const dbUpdatePayload = {
          current_status: updated.current_status,
          provider_id: isValidUUID(updated.provider_id) ? updated.provider_id : null,
          outcome_type: updated.outcome_type,
          financial_value_inr: updated.financial_value_inr,
          rejection_or_failure_reason: updated.rejection_or_failure_reason,
          evidence_notes: updated.evidence_notes,
          evidence_url: updated.evidence_url,
          is_provider_verified: updated.is_provider_verified,
          verification_tier: updated.verification_tier,
          updated_at: updated.updated_at,
        };

        const { error: updateError } = await (supabase as { from: (t: string) => DynamicTableQuery })
          .from("recovery_cases")
          .update(dbUpdatePayload)
          .eq("id", caseId);

        if (updateError && isStrictProduction()) {
          throw new ProductionDatabaseConfigurationError(
            `Failed to persist status transition to Supabase: ${updateError.message}`
          );
        }

        const { error: histError } = await (supabase as { from: (t: string) => { insert: (row: unknown) => Promise<{ error: { message: string } | null }> } })
          .from("case_status_history")
          .insert(historyEntry);

        if (histError && isStrictProduction()) {
          throw new ProductionDatabaseConfigurationError(
            `Failed to persist case history entry to Supabase: ${histError.message}`
          );
        }
      } catch (err) {
        if (err instanceof ProductionDatabaseConfigurationError) throw err;
        if (isStrictProduction()) {
          throw new ProductionDatabaseConfigurationError(
            `Production database error during status transition: ${err instanceof Error ? err.message : String(err)}`
          );
        }
      }
    }

    globalStore.recoveryCases.set(caseId, updated);
    globalStore.statusHistory.push(historyEntry);

    return this.getCaseWithDetails(caseId) as Promise<RecoveryCaseWithDetails>;
  }

  /**
   * 6. Admin verification of outcome
   */
  static async adminVerifyOutcome(
    caseId: string,
    adminIdentifier: string,
    notes?: string
  ): Promise<RecoveryCaseWithDetails> {
    const existing = await this.getCaseWithDetails(caseId);
    if (!existing) throw new Error(`Case '${caseId}' not found.`);

    const now = new Date().toISOString();
    const auditId = generateUUID();

    const updated: RecoveryCaseRow = {
      ...existing,
      is_provider_verified: true,
      verification_tier: "provider_verified",
      evidence_notes: notes || existing.evidence_notes,
      updated_at: now,
    };

    const auditLog: AdminAuditLogRow = {
      id: auditId,
      action_type: "case_outcome_verified",
      target_entity_type: "recovery_case",
      target_entity_id: caseId,
      admin_identifier: adminIdentifier,
      details: { previousTier: existing.verification_tier, newTier: "provider_verified", notes },
      created_at: now,
    };

    const supabase = this.getDb();
    if (supabase) {
      try {
        const { error: updateError } = await (supabase as { from: (t: string) => DynamicTableQuery })
          .from("recovery_cases")
          .update({
            is_provider_verified: true,
            verification_tier: "provider_verified",
            evidence_notes: updated.evidence_notes,
            updated_at: updated.updated_at,
          })
          .eq("id", caseId);

        if (updateError && isStrictProduction()) {
          throw new ProductionDatabaseConfigurationError(
            `Failed to persist outcome verification to Supabase: ${updateError.message}`
          );
        }

        const { error: logError } = await (supabase as { from: (t: string) => { insert: (row: unknown) => Promise<{ error: { message: string } | null }> } })
          .from("admin_audit_logs")
          .insert(auditLog);

        if (logError && isStrictProduction()) {
          throw new ProductionDatabaseConfigurationError(
            `Failed to persist admin audit log to Supabase: ${logError.message}`
          );
        }
      } catch (err) {
        if (err instanceof ProductionDatabaseConfigurationError) throw err;
        if (isStrictProduction()) {
          throw new ProductionDatabaseConfigurationError(
            `Production database error during admin verification: ${err instanceof Error ? err.message : String(err)}`
          );
        }
      }
    }

    globalStore.recoveryCases.set(caseId, updated);
    globalStore.adminAuditLogs.push(auditLog);

    return this.getCaseWithDetails(caseId) as Promise<RecoveryCaseWithDetails>;
  }

  /**
   * 7. Provider Candidate Management
   */
  static async listCandidateProviders(): Promise<ProviderWithDetails[]> {
    return Array.from(globalStore.candidateProviders.values());
  }

  static async updateCandidateStatus(
    providerId: string,
    status: "approved" | "rejected" | "pending_review",
    verificationStatus: "verified" | "partially_verified" | "unverified",
    adminIdentifier: string,
    notes?: string
  ): Promise<ProviderWithDetails> {
    const candidate = globalStore.candidateProviders.get(providerId);
    if (!candidate) throw new Error(`Provider '${providerId}' not found.`);

    const now = new Date().toISOString();
    const auditId = generateUUID();

    const updated: ProviderWithDetails = {
      ...candidate,
      approval_status: status,
      verification_status: verificationStatus,
      evidence_notes: notes || candidate.evidence_notes,
      last_checked_at: now,
    };

    const auditLog: AdminAuditLogRow = {
      id: auditId,
      action_type: status === "approved" ? "provider_approved" : "provider_rejected",
      target_entity_type: "provider",
      target_entity_id: providerId,
      admin_identifier: adminIdentifier,
      details: { status, verificationStatus, notes },
      created_at: now,
    };

    const supabase = this.getDb();
    if (supabase) {
      try {
        if (isValidUUID(providerId)) {
          await (supabase as { from: (t: string) => DynamicTableQuery })
            .from("providers")
            .update({
              approval_status: status,
              verification_status: verificationStatus,
              evidence_notes: updated.evidence_notes,
              last_checked_at: now,
            })
            .eq("id", providerId);
        }

        const { error: logError } = await (supabase as { from: (t: string) => { insert: (row: unknown) => Promise<{ error: { message: string } | null }> } })
          .from("admin_audit_logs")
          .insert(auditLog);

        if (logError && isStrictProduction()) {
          throw new ProductionDatabaseConfigurationError(
            `Failed to persist candidate status audit log: ${logError.message}`
          );
        }
      } catch (err) {
        if (err instanceof ProductionDatabaseConfigurationError) throw err;
        if (isStrictProduction()) {
          throw new ProductionDatabaseConfigurationError(
            `Production database error updating candidate: ${err instanceof Error ? err.message : String(err)}`
          );
        }
      }
    }

    globalStore.candidateProviders.set(providerId, updated);
    globalStore.adminAuditLogs.push(auditLog);

    return updated;
  }

  static async listAdminAuditLogs(): Promise<AdminAuditLogRow[]> {
    const supabase = this.getDb();
    if (supabase) {
      try {
        const { data: dbLogs, error } = await (supabase as { from: (t: string) => DynamicTableQuery })
          .from("admin_audit_logs")
          .select("*")
          .order("created_at", { ascending: false });

        if (error && isStrictProduction()) {
          throw new ProductionDatabaseConfigurationError(
            `Failed to fetch admin audit logs from Supabase: ${error.message}`
          );
        }

        if (dbLogs && Array.isArray(dbLogs) && dbLogs.length > 0) {
          return dbLogs as AdminAuditLogRow[];
        }
      } catch (err) {
        if (err instanceof ProductionDatabaseConfigurationError) throw err;
        if (isStrictProduction()) {
          throw new ProductionDatabaseConfigurationError(
            `Production database error reading audit logs: ${err instanceof Error ? err.message : String(err)}`
          );
        }
      }
    }

    return [...globalStore.adminAuditLogs].reverse();
  }
}
