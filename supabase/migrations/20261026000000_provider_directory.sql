-- Migration: Provider Directory Foundation for E-Waste Value Recovery
-- Creates tables for providers, services, accepted categories, and service areas.
-- Configures Row Level Security (RLS) to permit public read-only access for approved listings only.

-- 1. Helper function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Providers table
CREATE TABLE IF NOT EXISTS providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    organisation_type TEXT NOT NULL CHECK (
        organisation_type IN (
            'authorised_recycler',
            'commercial_refurbisher',
            'non_profit_charity',
            'repair_service',
            'retailer_oem',
            'component_salvager'
        )
    ),
    website_url TEXT,
    source_evidence_url TEXT,
    evidence_notes TEXT,
    verification_status TEXT NOT NULL DEFAULT 'unverified' CHECK (
        verification_status IN ('verified', 'partially_verified', 'unverified')
    ),
    approval_status TEXT NOT NULL DEFAULT 'pending_review' CHECK (
        approval_status IN ('approved', 'pending_review', 'rejected')
    ),
    quote_type TEXT NOT NULL DEFAULT 'quote_required' CHECK (
        quote_type IN ('confirmed_quote', 'indicative_estimate', 'quote_required')
    ),
    offers_pickup BOOLEAN NOT NULL DEFAULT false,
    offers_dropoff BOOLEAN NOT NULL DEFAULT false,
    pickup_details TEXT,
    dropoff_details TEXT,
    minimum_quantity INTEGER DEFAULT 1,
    eligibility_restrictions TEXT,
    last_checked_at TIMESTAMPTZ,
    is_sample_data BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Trigger to update updated_at automatically
DROP TRIGGER IF EXISTS trg_providers_updated_at ON providers;
CREATE TRIGGER trg_providers_updated_at
    BEFORE UPDATE ON providers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indexes for providers
CREATE INDEX IF NOT EXISTS idx_providers_approval ON providers(approval_status);
CREATE INDEX IF NOT EXISTS idx_providers_verification ON providers(verification_status);
CREATE INDEX IF NOT EXISTS idx_providers_slug ON providers(slug);
CREATE INDEX IF NOT EXISTS idx_providers_org_type ON providers(organisation_type);
CREATE INDEX IF NOT EXISTS idx_providers_is_sample ON providers(is_sample_data);

-- 3. Provider Services table (Repair, Buyback, Exchange, Donation, Component Recovery, Recycling)
CREATE TABLE IF NOT EXISTS provider_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    service_type TEXT NOT NULL CHECK (
        service_type IN (
            'repair',
            'cash_buyback',
            'exchange',
            'donation_reuse',
            'component_recovery',
            'recycling'
        )
    ),
    service_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_provider_service UNIQUE (provider_id, service_type)
);

CREATE INDEX IF NOT EXISTS idx_provider_services_provider_id ON provider_services(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_services_service_type ON provider_services(service_type);

-- 4. Provider Accepted Categories table
CREATE TABLE IF NOT EXISTS provider_accepted_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    category_slug TEXT NOT NULL,
    accepted_conditions TEXT[] NOT NULL DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_provider_category UNIQUE (provider_id, category_slug)
);

CREATE INDEX IF NOT EXISTS idx_provider_accepted_categories_provider_id ON provider_accepted_categories(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_accepted_categories_cat_slug ON provider_accepted_categories(category_slug);

-- 5. Provider Service Areas & Locations table
CREATE TABLE IF NOT EXISTS provider_service_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    area_type TEXT NOT NULL CHECK (
        area_type IN ('pincode', 'city', 'state_region', 'national')
    ),
    location_code TEXT, -- e.g. Pincode '560001' or ISO state 'KA' or 'IN'
    location_name TEXT NOT NULL,
    supports_pickup BOOLEAN NOT NULL DEFAULT false,
    supports_dropoff BOOLEAN NOT NULL DEFAULT false,
    dropoff_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_provider_service_areas_provider_id ON provider_service_areas(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_service_areas_loc_code ON provider_service_areas(location_code);
CREATE INDEX IF NOT EXISTS idx_provider_service_areas_area_type ON provider_service_areas(area_type);

-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- Every table has RLS enabled.
-- Anonymous and public authenticated users can ONLY read approved listings.
-- Modification (INSERT, UPDATE, DELETE) is disallowed for public roles. Privileged service role bypasses RLS.

ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_accepted_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_service_areas ENABLE ROW LEVEL SECURITY;

-- Policy for providers
DROP POLICY IF EXISTS "Public can view approved providers" ON providers;
CREATE POLICY "Public can view approved providers"
    ON providers
    FOR SELECT
    USING (approval_status = 'approved');

-- Policy for provider_services
DROP POLICY IF EXISTS "Public can view services of approved providers" ON provider_services;
CREATE POLICY "Public can view services of approved providers"
    ON provider_services
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM providers
            WHERE providers.id = provider_services.provider_id
              AND providers.approval_status = 'approved'
        )
    );

-- Policy for provider_accepted_categories
DROP POLICY IF EXISTS "Public can view accepted categories of approved providers" ON provider_accepted_categories;
CREATE POLICY "Public can view accepted categories of approved providers"
    ON provider_accepted_categories
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM providers
            WHERE providers.id = provider_accepted_categories.provider_id
              AND providers.approval_status = 'approved'
        )
    );

-- Policy for provider_service_areas
DROP POLICY IF EXISTS "Public can view service areas of approved providers" ON provider_service_areas;
CREATE POLICY "Public can view service areas of approved providers"
    ON provider_service_areas
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM providers
            WHERE providers.id = provider_service_areas.provider_id
              AND providers.approval_status = 'approved'
        )
    );

-- 7. CLEARLY LABELLED SAMPLE RECORDS (FOR DEVELOPMENT & DEMO TESTING ONLY)
-- Explicitly tagged with is_sample_data = true and [DEMO] prefix.
-- No real provider claims, unverified certifications, or invented prices.

DO $$
DECLARE
    v_provider_1 UUID;
    v_provider_2 UUID;
    v_provider_3 UUID;
BEGIN
    -- Only insert if sample data does not already exist
    IF NOT EXISTS (SELECT 1 FROM providers WHERE slug = 'demo-certified-metals-recycling') THEN
        INSERT INTO providers (
            name,
            slug,
            description,
            organisation_type,
            website_url,
            source_evidence_url,
            evidence_notes,
            verification_status,
            approval_status,
            quote_type,
            offers_pickup,
            offers_dropoff,
            pickup_details,
            dropoff_details,
            minimum_quantity,
            eligibility_restrictions,
            last_checked_at,
            is_sample_data
        ) VALUES (
            '[DEMO] Apex Certified Material Recovery',
            'demo-certified-metals-recycling',
            'Demonstration record: Industrial authorised e-waste facility accepting non-functional consumer electricals for mechanical shredding and metal refining.',
            'authorised_recycler',
            'https://example.org/demo-apex-recycling',
            'https://example.org/demo-environmental-registry-entry-4029',
            'Development fixture: Regulatory license record checked against mock state registry.',
            'verified',
            'approved',
            'quote_required',
            true,
            true,
            'Scheduled courier collection available for bulk electronics (10+ kg).',
            'Public drop-off bay open Monday to Friday, 09:00 - 16:00.',
            1,
            'Batteries must be intact; swollen cells require special hazardous isolation protocol.',
            '2026-10-15T00:00:00Z',
            true
        ) RETURNING id INTO v_provider_1;

        INSERT INTO provider_services (provider_id, service_type, service_description) VALUES
            (v_provider_1, 'recycling', 'Mechanical shredding, circuit board copper extraction, and regulated plastics sorting.'),
            (v_provider_1, 'component_recovery', 'Harvest of clean donor heatsinks, chassis, and wiring looms.');

        INSERT INTO provider_accepted_categories (provider_id, category_slug, accepted_conditions, notes) VALUES
            (v_provider_1, 'smartphones-tablets', ARRAY['major_fault', 'working_older'], 'NAND flash punctured or shredded for confidentiality.'),
            (v_provider_1, 'laptops-computers', ARRAY['major_fault', 'working_older'], 'Drive bays accepted with or without hard drives.'),
            (v_provider_1, 'batteries-cables-peripherals', ARRAY['major_fault', 'working_older'], 'Copper wiring bulk intake.');

        INSERT INTO provider_service_areas (provider_id, area_type, location_code, location_name, supports_pickup, supports_dropoff, dropoff_address) VALUES
            (v_provider_1, 'pincode', '560001', 'Bengaluru Central 560001', true, true, 'Drop-off Gate 2, Industrial Suburb, Bengaluru 560001'),
            (v_provider_1, 'pincode', '560025', 'Bengaluru South-East 560025', true, false, NULL);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM providers WHERE slug = 'demo-community-reuse-initiative') THEN
        INSERT INTO providers (
            name,
            slug,
            description,
            organisation_type,
            website_url,
            source_evidence_url,
            evidence_notes,
            verification_status,
            approval_status,
            quote_type,
            offers_pickup,
            offers_dropoff,
            pickup_details,
            dropoff_details,
            minimum_quantity,
            eligibility_restrictions,
            last_checked_at,
            is_sample_data
        ) VALUES (
            '[DEMO] Digital Inclusion Alliance',
            'demo-community-reuse-initiative',
            'Demonstration record: Community non-profit redistributing functional laptops and monitors to schools and learning centres under lightweight operating systems.',
            'non_profit_charity',
            'https://example.org/demo-digital-inclusion',
            'https://example.org/demo-charity-commission-registry-9182',
            'Development fixture: Registered charity status confirmed via public commission portal.',
            'verified',
            'approved',
            'quote_required',
            false,
            true,
            'No home collection available for individual households.',
            'Drop-off container located in community civic centre reception.',
            1,
            'Must boot successfully; chargers and power supplies must be included.',
            '2026-10-18T00:00:00Z',
            true
        ) RETURNING id INTO v_provider_2;

        INSERT INTO provider_services (provider_id, service_type, service_description) VALUES
            (v_provider_2, 'donation_reuse', 'Diagnostic wipe, OS re-flash (ChromeOS Flex / Linux), and classroom redeployment.');

        INSERT INTO provider_accepted_categories (provider_id, category_slug, accepted_conditions, notes) VALUES
            (v_provider_2, 'laptops-computers', ARRAY['working_recent', 'working_older'], 'Must include power adapter.'),
            (v_provider_2, 'smartphones-tablets', ARRAY['working_recent', 'working_older'], 'Must have iCloud/Google FRP lock removed.');

        INSERT INTO provider_service_areas (provider_id, area_type, location_code, location_name, supports_pickup, supports_dropoff, dropoff_address) VALUES
            (v_provider_2, 'pincode', '560001', 'Bengaluru Central 560001', false, true, 'Civic Centre Reception, MG Road, Bengaluru 560001');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM providers WHERE slug = 'demo-modular-device-repairs') THEN
        INSERT INTO providers (
            name,
            slug,
            description,
            organisation_type,
            website_url,
            source_evidence_url,
            evidence_notes,
            verification_status,
            approval_status,
            quote_type,
            offers_pickup,
            offers_dropoff,
            pickup_details,
            dropoff_details,
            minimum_quantity,
            eligibility_restrictions,
            last_checked_at,
            is_sample_data
        ) VALUES (
            '[DEMO] Precision Hardware Lab',
            'demo-modular-device-repairs',
            'Demonstration record: Independent repair workshop specialising in display replacements, battery swaps, and modular component diagnosis.',
            'repair_service',
            'https://example.org/demo-precision-repairs',
            'https://example.org/demo-trade-license-7731',
            'Development fixture: Commercial registration recorded; parts warranty policy partially verified.',
            'partially_verified',
            'approved',
            'indicative_estimate',
            false,
            true,
            'Postal mail-in service available for portable devices.',
            'Counter diagnostics available during workshop hours.',
            1,
            'Diagnostic fee applied towards final repair cost if repair is authorised.',
            '2026-10-20T00:00:00Z',
            true
        ) RETURNING id INTO v_provider_3;

        INSERT INTO provider_services (provider_id, service_type, service_description) VALUES
            (v_provider_3, 'repair', 'Battery, screen, USB-C port, and keyboard replacements.'),
            (v_provider_3, 'cash_buyback', 'Trade-in value offered against repaired second-hand stock.');

        INSERT INTO provider_accepted_categories (provider_id, category_slug, accepted_conditions, notes) VALUES
            (v_provider_3, 'smartphones-tablets', ARRAY['minor_fault', 'working_recent'], 'OEM and OEM-grade parts options.'),
            (v_provider_3, 'laptops-computers', ARRAY['minor_fault', 'working_recent'], 'Thermal repasting and hinge repairs.');

        INSERT INTO provider_service_areas (provider_id, area_type, location_code, location_name, supports_pickup, supports_dropoff, dropoff_address) VALUES
            (v_provider_3, 'pincode', '560034', 'Bengaluru Koramangala 560034', false, true, 'Workshop Unit 4, 80 Feet Road, Koramangala 560034');
    END IF;
END $$;
