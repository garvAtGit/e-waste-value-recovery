-- Migration: Privacy-Preserving Lightweight Outcome Tracking
-- Records anonymous aggregate user decisions without personal identifiable information.
-- Does NOT store IP addresses, device serials, names, phone numbers, or full residential addresses.
-- Truncates pincodes to 3-digit prefix to prevent household identification.

CREATE TABLE IF NOT EXISTS comparison_outcomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_slug TEXT NOT NULL,
    condition TEXT NOT NULL,
    priority TEXT NOT NULL,
    recommended_pathway_id TEXT NOT NULL,
    selected_action TEXT NOT NULL CHECK (
        selected_action IN (
            'explored_recommendation',
            'viewed_provider_details',
            'checked_safeguards',
            'copied_checklist',
            'switched_pathway',
            'searched_directory'
        )
    ),
    pincode_prefix TEXT, -- First 3 digits only (e.g. '560') for macro regional trends
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_comparison_outcomes_category ON comparison_outcomes(category_slug);
CREATE INDEX IF NOT EXISTS idx_comparison_outcomes_pathway ON comparison_outcomes(recommended_pathway_id);
CREATE INDEX IF NOT EXISTS idx_comparison_outcomes_action ON comparison_outcomes(selected_action);
CREATE INDEX IF NOT EXISTS idx_comparison_outcomes_created_at ON comparison_outcomes(created_at);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE comparison_outcomes ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to record interaction events with strict input validation to prevent abuse
DROP POLICY IF EXISTS "Public can log anonymous comparison outcome" ON comparison_outcomes;
CREATE POLICY "Public can log anonymous comparison outcome"
    ON comparison_outcomes
    FOR INSERT
    WITH CHECK (
        length(category_slug) <= 64 AND
        length(condition) <= 64 AND
        length(priority) <= 64 AND
        length(recommended_pathway_id) <= 64 AND
        (pincode_prefix IS NULL OR (length(pincode_prefix) <= 4 AND pincode_prefix ~ '^[0-9]+$'))
    );

-- Deny public reading of raw interaction records (analytics accessible to service role only)
DROP POLICY IF EXISTS "Deny public reads on outcomes" ON comparison_outcomes;
CREATE POLICY "Deny public reads on outcomes"
    ON comparison_outcomes
    FOR SELECT
    USING (false);
