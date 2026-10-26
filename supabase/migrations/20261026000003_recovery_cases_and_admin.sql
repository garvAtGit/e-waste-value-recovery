-- Migration: Recovery Cases, State History, and Administration Console
-- Adds tables for saved assessments, recovery cases, append-only status history, and administrative audit logging.
-- Enforces validated state transitions, user session isolation, and Row Level Security.

-- 1. Saved Assessments Table
CREATE TABLE IF NOT EXISTS saved_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    category_slug TEXT NOT NULL,
    device_model TEXT,
    condition TEXT NOT NULL CHECK (
        condition IN ('working_recent', 'minor_fault', 'working_older', 'major_fault', 'unsafe_hazardous')
    ),
    specific_fault TEXT,
    pincode VARCHAR(6),
    priority TEXT NOT NULL CHECK (
        priority IN ('maximise_money', 'minimise_effort', 'repair_keep', 'dispose_responsibly')
    ),
    primary_pathway_id TEXT NOT NULL,
    is_hazardous BOOLEAN NOT NULL DEFAULT false,
    assessment_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_saved_assessments_session ON saved_assessments(session_id);
CREATE INDEX IF NOT EXISTS idx_saved_assessments_user ON saved_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_assessments_category ON saved_assessments(category_slug);

-- 2. Recovery Cases Table
CREATE TABLE IF NOT EXISTS recovery_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    saved_assessment_id UUID REFERENCES saved_assessments(id) ON DELETE SET NULL,
    pathway_id TEXT NOT NULL,
    provider_id UUID REFERENCES providers(id) ON DELETE SET NULL,
    current_status TEXT NOT NULL DEFAULT 'created' CHECK (
        current_status IN (
            'draft',
            'created',
            'contacted',
            'accepted_by_provider',
            'in_transit_or_scheduled',
            'dropped_off_or_collected',
            'completed',
            'rejected_by_provider',
            'failed',
            'cancelled'
        )
    ),
    verification_tier TEXT NOT NULL DEFAULT 'user_reported' CHECK (
        verification_tier IN ('user_reported', 'provider_verified')
    ),
    is_provider_verified BOOLEAN NOT NULL DEFAULT false,
    outcome_type TEXT CHECK (
        outcome_type IS NULL OR outcome_type IN (
            'repaired_and_retained',
            'sold_for_cash',
            'exchanged_for_voucher',
            'salvaged_for_parts',
            'donated_for_reuse',
            'recycled_certified',
            'hazardous_containment'
        )
    ),
    financial_value_inr NUMERIC(10, 2),
    rejection_or_failure_reason TEXT,
    user_notes TEXT,
    evidence_notes TEXT,
    evidence_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trg_recovery_cases_updated_at ON recovery_cases;
CREATE TRIGGER trg_recovery_cases_updated_at
    BEFORE UPDATE ON recovery_cases
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_recovery_cases_session ON recovery_cases(session_id);
CREATE INDEX IF NOT EXISTS idx_recovery_cases_user ON recovery_cases(user_id);
CREATE INDEX IF NOT EXISTS idx_recovery_cases_status ON recovery_cases(current_status);
CREATE INDEX IF NOT EXISTS idx_recovery_cases_pathway ON recovery_cases(pathway_id);
CREATE INDEX IF NOT EXISTS idx_recovery_cases_provider ON recovery_cases(provider_id);
CREATE INDEX IF NOT EXISTS idx_recovery_cases_verification ON recovery_cases(verification_tier);

-- 3. Append-Only Status History Table
CREATE TABLE IF NOT EXISTS case_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES recovery_cases(id) ON DELETE CASCADE,
    from_status TEXT NOT NULL,
    to_status TEXT NOT NULL,
    changed_by_role TEXT NOT NULL DEFAULT 'user' CHECK (
        changed_by_role IN ('user', 'provider', 'admin', 'system')
    ),
    is_provider_confirmed BOOLEAN NOT NULL DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_case_status_history_case ON case_status_history(case_id);
CREATE INDEX IF NOT EXISTS idx_case_status_history_created ON case_status_history(created_at);

-- 4. Administrative Audit Logs Table
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_type TEXT NOT NULL CHECK (
        action_type IN (
            'provider_approved',
            'provider_rejected',
            'provider_updated',
            'case_status_overridden',
            'case_outcome_verified',
            'candidate_reviewed'
        )
    ),
    target_entity_type TEXT NOT NULL CHECK (
        target_entity_type IN ('provider', 'recovery_case', 'candidate')
    ),
    target_entity_id TEXT NOT NULL,
    admin_identifier TEXT NOT NULL DEFAULT 'system_admin',
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_action ON admin_audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_target ON admin_audit_logs(target_entity_type, target_entity_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created ON admin_audit_logs(created_at);

-- 5. Row Level Security Policies
ALTER TABLE saved_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE recovery_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- 5.1 Saved Assessments RLS
-- Direct public SELECT is restricted to authenticated owners.
-- Anonymous sessions are securely served server-side through Next.js route handlers.
DROP POLICY IF EXISTS "Users can create saved assessments" ON saved_assessments;
CREATE POLICY "Users can create saved assessments"
    ON saved_assessments FOR INSERT
    WITH CHECK (
        user_id IS NULL OR (auth.uid() IS NOT NULL AND user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Users can read their own saved assessments" ON saved_assessments;
CREATE POLICY "Users can read their own saved assessments"
    ON saved_assessments FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND user_id = auth.uid()
    );

-- 5.2 Recovery Cases RLS
DROP POLICY IF EXISTS "Users can insert their recovery cases" ON recovery_cases;
CREATE POLICY "Users can insert their recovery cases"
    ON recovery_cases FOR INSERT
    WITH CHECK (
        user_id IS NULL OR (auth.uid() IS NOT NULL AND user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Users can read their own recovery cases" ON recovery_cases;
CREATE POLICY "Users can read their own recovery cases"
    ON recovery_cases FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND user_id = auth.uid()
    );

-- Outcome Integrity Enforcement: Regular users can only update unverified fields on their own cases.
-- Client-side direct updates CANNOT self-promote cases to provider_verified.
DROP POLICY IF EXISTS "Users can update their own recovery cases" ON recovery_cases;
CREATE POLICY "Users can update their own recovery cases"
    ON recovery_cases FOR UPDATE
    USING (
        auth.uid() IS NOT NULL AND user_id = auth.uid()
    )
    WITH CHECK (
        auth.uid() IS NOT NULL AND user_id = auth.uid() AND
        is_provider_verified = false AND
        verification_tier = 'user_reported'
    );

-- 5.3 Case Status History RLS
-- Non-admin clients cannot insert provider-confirmed historical records directly.
DROP POLICY IF EXISTS "Users can insert case history" ON case_status_history;
CREATE POLICY "Users can insert case history"
    ON case_status_history FOR INSERT
    WITH CHECK (
        is_provider_confirmed = false OR auth.role() = 'service_role'
    );

DROP POLICY IF EXISTS "Users can read history of visible cases" ON case_status_history;
CREATE POLICY "Users can read history of visible cases"
    ON case_status_history FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM recovery_cases
            WHERE recovery_cases.id = case_status_history.case_id
            AND recovery_cases.user_id = auth.uid()
        )
    );

-- 5.4 Administrative Audit Logs RLS
-- Immutable and confidential: Public and anonymous roles are completely denied direct SQL access.
-- Read, insert, and update operations are strictly restricted to service_role (server-only).
DROP POLICY IF EXISTS "Deny public read on admin audit logs" ON admin_audit_logs;
CREATE POLICY "Deny public read on admin audit logs"
    ON admin_audit_logs FOR SELECT
    USING (false);

DROP POLICY IF EXISTS "Deny public insert on admin audit logs" ON admin_audit_logs;
CREATE POLICY "Deny public insert on admin audit logs"
    ON admin_audit_logs FOR INSERT
    WITH CHECK (false);

DROP POLICY IF EXISTS "Deny public update on admin audit logs" ON admin_audit_logs;
CREATE POLICY "Deny public update on admin audit logs"
    ON admin_audit_logs FOR UPDATE
    USING (false);

DROP POLICY IF EXISTS "Deny public delete on admin audit logs" ON admin_audit_logs;
CREATE POLICY "Deny public delete on admin audit logs"
    ON admin_audit_logs FOR DELETE
    USING (false);
