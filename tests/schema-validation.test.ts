import { DELHI_CANDIDATE_PROVIDERS } from "../src/lib/constants/delhi-candidates";

console.log("=== EXECUTING STRICT SCHEMA & CONSTRAINT VALIDATION SUITE ===\n");

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const VALID_ORG_TYPES = new Set([
  "authorised_recycler",
  "commercial_refurbisher",
  "non_profit_charity",
  "repair_service",
  "retailer_oem",
  "component_salvager",
]);

const VALID_VERIFICATION_STATUSES = new Set([
  "verified",
  "partially_verified",
  "unverified",
]);

const VALID_APPROVAL_STATUSES = new Set([
  "approved",
  "pending_review",
  "rejected",
]);

const VALID_QUOTE_TYPES = new Set([
  "confirmed_quote",
  "indicative_estimate",
  "quote_required",
]);

const VALID_SERVICE_TYPES = new Set([
  "repair",
  "cash_buyback",
  "exchange",
  "donation_reuse",
  "component_recovery",
  "recycling",
]);

const VALID_AREA_TYPES = new Set([
  "pincode",
  "city",
  "state_region",
  "national",
]);

const VALID_CONDITION_SLUGS = new Set([
  "working_recent",
  "working_older",
  "minor_fault",
  "major_fault",
  "unsafe_hazardous",
]);

function validateCandidates() {
  const providerSlugs = new Set<string>();
  const providerIds = new Set<string>();

  console.log(`Checking ${DELHI_CANDIDATE_PROVIDERS.length} candidate providers...`);

  for (const provider of DELHI_CANDIDATE_PROVIDERS) {
    console.log(`Validating provider: ${provider.name} (${provider.slug})`);

    // 1. Primary Key Format (UUID v4)
    if (!UUID_V4_REGEX.test(provider.id)) {
      throw new Error(`Invalid UUID v4 for provider ${provider.name}: "${provider.id}"`);
    }
    if (providerIds.has(provider.id)) {
      throw new Error(`Duplicate provider id: ${provider.id}`);
    }
    providerIds.add(provider.id);

    // 2. Slug Uniqueness
    if (providerSlugs.has(provider.slug)) {
      throw new Error(`Duplicate provider slug: ${provider.slug}`);
    }
    providerSlugs.add(provider.slug);

    // 3. Enum Constraints on Provider
    if (!VALID_ORG_TYPES.has(provider.organisation_type)) {
      throw new Error(
        `Invalid organisation_type "${provider.organisation_type}" on provider ${provider.name}`
      );
    }
    if (!VALID_VERIFICATION_STATUSES.has(provider.verification_status)) {
      throw new Error(
        `Invalid verification_status "${provider.verification_status}" on provider ${provider.name}`
      );
    }
    if (!VALID_APPROVAL_STATUSES.has(provider.approval_status)) {
      throw new Error(
        `Invalid approval_status "${provider.approval_status}" on provider ${provider.name}`
      );
    }
    // Discipline Rule: All candidate records MUST be pending_review before database insertion
    if (provider.approval_status !== "pending_review") {
      throw new Error(
        `Governance violation: candidate provider ${provider.name} must have approval_status = "pending_review"`
      );
    }
    if (!VALID_QUOTE_TYPES.has(provider.quote_type)) {
      throw new Error(
        `Invalid quote_type "${provider.quote_type}" on provider ${provider.name}`
      );
    }

    // 4. Validate Provider Services
    if (!provider.services || provider.services.length === 0) {
      throw new Error(`Provider ${provider.name} has no services`);
    }
    const serviceSet = new Set<string>();
    for (const srv of provider.services) {
      if (!UUID_V4_REGEX.test(srv.id)) {
        throw new Error(`Invalid service UUID v4: "${srv.id}" on provider ${provider.name}`);
      }
      if (srv.provider_id !== provider.id) {
        throw new Error(
          `Foreign key mismatch: service ${srv.id} provider_id "${srv.provider_id}" !== "${provider.id}"`
        );
      }
      if (!VALID_SERVICE_TYPES.has(srv.service_type)) {
        throw new Error(`Invalid service_type "${srv.service_type}" on provider ${provider.name}`);
      }
      if (serviceSet.has(srv.service_type)) {
        throw new Error(
          `Unique constraint violation: duplicate service_type "${srv.service_type}" on provider ${provider.name}`
        );
      }
      serviceSet.add(srv.service_type);
    }

    // 5. Validate Accepted Categories
    if (!provider.accepted_categories || provider.accepted_categories.length === 0) {
      throw new Error(`Provider ${provider.name} has no accepted categories`);
    }
    const categorySet = new Set<string>();
    for (const cat of provider.accepted_categories) {
      if (!UUID_V4_REGEX.test(cat.id)) {
        throw new Error(`Invalid category UUID v4: "${cat.id}" on provider ${provider.name}`);
      }
      if (cat.provider_id !== provider.id) {
        throw new Error(
          `Foreign key mismatch: category ${cat.id} provider_id "${cat.provider_id}" !== "${provider.id}"`
        );
      }
      if (categorySet.has(cat.category_slug)) {
        throw new Error(
          `Unique constraint violation: duplicate category_slug "${cat.category_slug}" on provider ${provider.name}`
        );
      }
      categorySet.add(cat.category_slug);

      for (const cond of cat.accepted_conditions) {
        if (!VALID_CONDITION_SLUGS.has(cond)) {
          throw new Error(
            `Invalid condition "${cond}" under category ${cat.category_slug} on provider ${provider.name}`
          );
        }
      }
    }

    // 6. Validate Service Areas
    if (!provider.service_areas || provider.service_areas.length === 0) {
      throw new Error(`Provider ${provider.name} has no service areas`);
    }
    for (const area of provider.service_areas) {
      if (!UUID_V4_REGEX.test(area.id)) {
        throw new Error(`Invalid area UUID v4: "${area.id}" on provider ${provider.name}`);
      }
      if (area.provider_id !== provider.id) {
        throw new Error(
          `Foreign key mismatch: area ${area.id} provider_id "${area.provider_id}" !== "${provider.id}"`
        );
      }
      if (!VALID_AREA_TYPES.has(area.area_type)) {
        throw new Error(`Invalid area_type "${area.area_type}" on provider ${provider.name}`);
      }
      if (area.area_type === "pincode") {
        if (!area.location_code || !/^\d{6}$/.test(area.location_code)) {
          throw new Error(
            `Invalid 6-digit pincode "${area.location_code}" on area ${area.location_name}`
          );
        }
      }
      if (typeof area.supports_pickup !== "boolean" || typeof area.supports_dropoff !== "boolean") {
        throw new Error(
          `supports_pickup and supports_dropoff must be boolean on area ${area.location_name}`
        );
      }
      if (area.supports_dropoff && !area.dropoff_address) {
        throw new Error(
          `Dropoff is supported but dropoff_address is missing on area ${area.location_name}`
        );
      }
    }
  }

  console.log("\n✓ ALL CANDIDATE PAYLOADS STRICTLY CONFORM TO POSTGRESQL SCHEMA & CONSTRAINTS!");
}

validateCandidates();
