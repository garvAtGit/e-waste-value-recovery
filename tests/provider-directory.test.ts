// Test suite for E-Waste Value Recovery Provider Directory Foundation
import { readFileSync } from "fs";
import { resolve } from "path";
import { SAMPLE_PROVIDERS } from "../src/lib/constants/sample-providers";
import { filterProviders } from "../src/lib/supabase/providers";

console.log("=== STARTING PROVIDER DIRECTORY AUDIT & TESTS ===\n");

// 1. DATA MODEL & SAMPLE RECORDS INTEGRITY
console.log("Test 1: Validating sample provider data structures...");
if (!Array.isArray(SAMPLE_PROVIDERS) || SAMPLE_PROVIDERS.length === 0) {
  throw new Error("SAMPLE_PROVIDERS must be a non-empty array");
}

for (const provider of SAMPLE_PROVIDERS) {
  if (!provider.id || !provider.name || !provider.slug || !provider.organisation_type) {
    throw new Error(`Provider ${provider.id} is missing essential identity fields`);
  }
  if (!provider.is_sample_data) {
    throw new Error(`Sample provider ${provider.name} must have is_sample_data = true`);
  }
  if (!provider.name.startsWith("[DEMO]")) {
    throw new Error(`Sample provider ${provider.name} must be clearly marked with [DEMO]`);
  }
  if (!Array.isArray(provider.services) || !Array.isArray(provider.accepted_categories) || !Array.isArray(provider.service_areas)) {
    throw new Error(`Provider ${provider.name} is missing normalized relations arrays`);
  }
}
console.log(`✓ Verified ${SAMPLE_PROVIDERS.length} sample providers conform to strict schema and demo tagging.\n`);

// 2. FILTERING LOGIC TESTS
console.log("Test 2: Testing filtering logic & non-inferential location matching...");

// 2a. Category filter test
const smartphoneProviders = filterProviders(SAMPLE_PROVIDERS, { category: "smartphones-tablets" });
console.log(`- Category 'smartphones-tablets': found ${smartphoneProviders.length} providers (expected 3)`);
if (smartphoneProviders.length !== 3) throw new Error("Category filter failed for smartphones-tablets");

const batteryProviders = filterProviders(SAMPLE_PROVIDERS, { category: "batteries-cables-peripherals" });
console.log(`- Category 'batteries-cables-peripherals': found ${batteryProviders.length} providers (expected 1)`);
if (batteryProviders.length !== 1 || batteryProviders[0].slug !== "demo-certified-metals-recycling") {
  throw new Error("Category filter failed for batteries-cables-peripherals");
}

// 2b. Service filter test
const repairProviders = filterProviders(SAMPLE_PROVIDERS, { service: "repair" });
console.log(`- Service 'repair': found ${repairProviders.length} providers (expected 1)`);
if (repairProviders.length !== 1 || repairProviders[0].slug !== "demo-modular-device-repairs") {
  throw new Error("Service filter failed for repair");
}

const donationProviders = filterProviders(SAMPLE_PROVIDERS, { service: "donation_reuse" });
console.log(`- Service 'donation_reuse': found ${donationProviders.length} providers (expected 1)`);
if (donationProviders.length !== 1 || donationProviders[0].slug !== "demo-community-reuse-initiative") {
  throw new Error("Service filter failed for donation_reuse");
}

const recyclingProviders = filterProviders(SAMPLE_PROVIDERS, { service: "recycling" });
console.log(`- Service 'recycling': found ${recyclingProviders.length} providers (expected 1)`);
if (recyclingProviders.length !== 1 || recyclingProviders[0].slug !== "demo-certified-metals-recycling") {
  throw new Error("Service filter failed for recycling");
}

// 2c. Logistics filter test
const pickupProviders = filterProviders(SAMPLE_PROVIDERS, { logistics: "pickup" });
console.log(`- Logistics 'pickup': found ${pickupProviders.length} providers (expected 1)`);
if (pickupProviders.length !== 1 || pickupProviders[0].slug !== "demo-certified-metals-recycling") {
  throw new Error("Logistics filter failed for pickup");
}

const dropoffProviders = filterProviders(SAMPLE_PROVIDERS, { logistics: "dropoff" });
console.log(`- Logistics 'dropoff': found ${dropoffProviders.length} providers (expected 3)`);
if (dropoffProviders.length !== 3) {
  throw new Error("Logistics filter failed for dropoff");
}

// 2d. Verification status filter test
const verifiedOnly = filterProviders(SAMPLE_PROVIDERS, { verificationStatus: "verified" });
console.log(`- Verification 'verified': found ${verifiedOnly.length} providers (expected 2)`);
if (verifiedOnly.length !== 2) throw new Error("Verification filter failed for verified");

const partiallyVerified = filterProviders(SAMPLE_PROVIDERS, { verificationStatus: "partially_verified" });
console.log(`- Verification 'partially_verified': found ${partiallyVerified.length} providers (expected 1)`);
if (partiallyVerified.length !== 1) throw new Error("Verification filter failed for partially_verified");

// 2e. STRICT Location & Pincode filter tests (NO STATE INFERENCE)
console.log("\nTest 3: Strict Location & Pincode matching (verifying no state-level inference)...");

// Pincode 560001 (documented for Provider 1 and Provider 2)
const pin560001 = filterProviders(SAMPLE_PROVIDERS, { locationQuery: "560001" });
console.log(`- Pincode 560001 match: found ${pin560001.length} providers (expected 2)`);
if (pin560001.length !== 2) throw new Error("Pincode 560001 match failed");

// Pincode 560025 (documented only for Provider 1)
const pin560025 = filterProviders(SAMPLE_PROVIDERS, { locationQuery: "560025" });
console.log(`- Pincode 560025 match: found ${pin560025.length} providers (expected 1)`);
if (pin560025.length !== 1 || pin560025[0].slug !== "demo-certified-metals-recycling") {
  throw new Error("Pincode 560025 match failed");
}

// Pincode 560034 (documented only for Provider 3)
const pin560034 = filterProviders(SAMPLE_PROVIDERS, { locationQuery: "560034" });
console.log(`- Pincode 560034 match: found ${pin560034.length} providers (expected 1)`);
if (pin560034.length !== 1 || pin560034[0].slug !== "demo-modular-device-repairs") {
  throw new Error("Pincode 560034 match failed");
}

// Pincode 560099 (undocumented pincode) -> MUST return 0 providers
const pin560099 = filterProviders(SAMPLE_PROVIDERS, { locationQuery: "560099" });
console.log(`- Undocumented Pincode 560099: found ${pin560099.length} providers (expected 0)`);
if (pin560099.length !== 0) {
  throw new Error("CRITICAL FAILURE: System inferred provider coverage for an undocumented pincode!");
}
console.log("✓ Verified that undocumented pincodes return 0 results (no state-level inference).");

// 2f. Multi-criteria intersection test
const complexQuery = filterProviders(SAMPLE_PROVIDERS, {
  category: "laptops-computers",
  service: "repair",
  logistics: "dropoff",
  verificationStatus: "partially_verified",
});
console.log(`- Complex multi-criteria filter: found ${complexQuery.length} provider (expected 1: Provider 3)`);
if (complexQuery.length !== 1 || complexQuery[0].slug !== "demo-modular-device-repairs") {
  throw new Error("Multi-criteria filter intersection failed");
}

// 3. SQL MIGRATION SECURITY & RLS AUDIT
console.log("\nTest 4: Auditing SQL Migration for Row Level Security & Access Controls...");
const migrationPath = resolve("supabase/migrations/20261026000000_provider_directory.sql");
const migrationSql = readFileSync(migrationPath, "utf-8");

const requiredTables = [
  "providers",
  "provider_services",
  "provider_accepted_categories",
  "provider_service_areas"
];

for (const table of requiredTables) {
  const rlsCheck = `ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`;
  if (!migrationSql.includes(rlsCheck)) {
    throw new Error(`Migration is missing RLS enablement for table ${table}`);
  }
}
console.log("✓ All 4 tables explicitly have ROW LEVEL SECURITY enabled.");

// Check that public read policies restrict to approval_status = 'approved'
if (!migrationSql.includes("approval_status = 'approved'")) {
  throw new Error("Migration does not restrict public SELECT policy to approved listings");
}
console.log("✓ Public policies enforce approval_status = 'approved'.");

// Check that there are NO public write policies
const dangerousPolicies = ["FOR INSERT", "FOR UPDATE", "FOR DELETE"];
for (const dp of dangerousPolicies) {
  if (migrationSql.includes(`ON providers\n    ${dp}`) || migrationSql.includes(`ON providers ${dp}`)) {
    throw new Error(`CRITICAL SECURITY FLAW: Found public ${dp} policy on providers table!`);
  }
}
console.log("✓ Verified absence of public write policies (INSERT/UPDATE/DELETE strictly restricted).");

console.log("\n=== ALL PROVIDER DIRECTORY AUDITS AND TESTS PASSED SUCCESSFULLY ===");
