-- Migration: Normalized Provider Service Categories Junction
-- Solves the relational schema limitation where provider_services and provider_accepted_categories
-- were sibling tables without a direct relational link.
--
-- DO NOT EXECUTE ON PRODUCTION WITHOUT AUTHORIZATION.

CREATE TABLE IF NOT EXISTS provider_service_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_service_id UUID NOT NULL REFERENCES provider_services(id) ON DELETE CASCADE,
    category_slug TEXT NOT NULL,
    accepted_conditions TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_service_category UNIQUE (provider_service_id, category_slug)
);

CREATE INDEX IF NOT EXISTS idx_provider_service_categories_service_id ON provider_service_categories(provider_service_id);
CREATE INDEX IF NOT EXISTS idx_provider_service_categories_cat_slug ON provider_service_categories(category_slug);

-- Row Level Security
ALTER TABLE provider_service_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view service categories of approved providers" ON provider_service_categories;
CREATE POLICY "Public can view service categories of approved providers"
    ON provider_service_categories
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM provider_services
            JOIN providers ON providers.id = provider_services.provider_id
            WHERE provider_services.id = provider_service_categories.provider_service_id
              AND providers.approval_status = 'approved'
        )
    );
