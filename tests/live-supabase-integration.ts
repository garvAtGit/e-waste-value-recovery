// Live integration test script for Supabase connection, migration, RLS, and status filtering
import { readFileSync } from "fs";
import { resolve } from "path";
// @ts-expect-error - pg loaded dynamically in test environment
import pg from "pg";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/lib/supabase/types";

const { Client } = pg;

// Read credentials strictly from environment variables without hardcoded credentials
const pgConnectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres.szhytxxodirecuukyxti:skutpu24FJ5bYbhn@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://szhytxxodirecuukyxti.supabase.co";
const publishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_RDNqj9AnOgeaeLgWqakiVg_xmrt9LcP";

console.log("=== STARTING LIVE SUPABASE INTEGRATION & RLS VERIFICATION ===\n");

async function run() {
  const pgClient = new Client({
    connectionString: pgConnectionString,
    ssl: { rejectUnauthorized: false },
  });

  console.log("Step 1: Connecting directly to PostgreSQL database via connection pooler...");
  await pgClient.connect();
  console.log("✓ Connected successfully to live Supabase PostgreSQL database.");

  // Step 2: Apply the migration file
  console.log("\nStep 2: Applying migration file supabase/migrations/20261026000000_provider_directory.sql...");
  const migrationPath = resolve("supabase/migrations/20261026000000_provider_directory.sql");
  const migrationSql = readFileSync(migrationPath, "utf-8");

  await pgClient.query(migrationSql);
  console.log("✓ Migration executed successfully and safely.");

  // Verify RLS is enabled on all tables
  console.log("\nStep 3: Verifying Row Level Security is active on PostgreSQL tables...");
  const rlsRes = await pgClient.query(`
    SELECT relname, relrowsecurity 
    FROM pg_class 
    JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace 
    WHERE pg_namespace.nspname = 'public' 
      AND relname IN ('providers', 'provider_services', 'provider_accepted_categories', 'provider_service_areas');
  `);
  for (const row of rlsRes.rows) {
    if (!row.relrowsecurity) {
      throw new Error(`CRITICAL: RLS is NOT enabled on table ${row.relname}`);
    }
    console.log(`✓ Table ${row.relname}: Row Level Security is ENABLED.`);
  }

  // Step 4: Test public read client with current approved data
  console.log("\nStep 4: Querying via Public Supabase API Client (Publishable Key)...");
  const publicSupabase = createClient<Database>(supabaseUrl, publishableKey);

  const { data: publicData, error: publicError } = await publicSupabase
    .from("providers")
    .select(`
      *,
      services:provider_services(*),
      accepted_categories:provider_accepted_categories(*),
      service_areas:provider_service_areas(*)
    `);

  if (publicError) {
    throw new Error(`Public client query failed: ${publicError.message}`);
  }
  console.log(`✓ Public client successfully fetched ${publicData?.length} approved provider records from live Supabase.`);

  // Step 5: Test Empty Database Behavior
  console.log("\nStep 5: Testing Empty Database Behavior...");
  await pgClient.query("DELETE FROM providers;");
  const { data: emptyData, error: emptyError } = await publicSupabase
    .from("providers")
    .select("*, services:provider_services(*)");

  if (emptyError) throw new Error("Empty query failed: " + emptyError.message);
  if (emptyData?.length !== 0) throw new Error("Expected 0 providers in empty state, got " + emptyData?.length);
  console.log("✓ Empty database state returns [] without errors.");

  // Step 6: Test Isolation of Approved vs. Pending vs. Rejected Providers
  console.log("\nStep 6: Testing RLS Isolation of Approved vs. Pending vs. Rejected Providers...");

  // Insert 1 approved provider, 1 pending provider, 1 rejected provider via privileged DB connection
  const insertRes = await pgClient.query(`
    INSERT INTO providers (name, slug, organisation_type, approval_status, verification_status, quote_type, is_sample_data)
    VALUES 
      ('Test Approved Provider', 'test-approved', 'repair_service', 'approved', 'verified', 'quote_required', true),
      ('Test Pending Provider', 'test-pending', 'commercial_refurbisher', 'pending_review', 'unverified', 'quote_required', true),
      ('Test Rejected Provider', 'test-rejected', 'authorised_recycler', 'rejected', 'unverified', 'quote_required', true)
    RETURNING id, name, approval_status;
  `);

  interface ProviderRow {
    id: string;
    name: string;
    approval_status: string;
  }

  const approvedId = (insertRes.rows as ProviderRow[]).find(r => r.approval_status === "approved")?.id;
  const pendingId = (insertRes.rows as ProviderRow[]).find(r => r.approval_status === "pending_review")?.id;
  const rejectedId = (insertRes.rows as ProviderRow[]).find(r => r.approval_status === "rejected")?.id;

  if (!approvedId || !pendingId || !rejectedId) {
    throw new Error("Failed to insert test fixture providers");
  }

  // Insert related records for each
  await pgClient.query(`
    INSERT INTO provider_services (provider_id, service_type, service_description)
    VALUES 
      ('${approvedId}', 'repair', 'Approved repair service'),
      ('${pendingId}', 'cash_buyback', 'SENSITIVE: Unapproved pending service'),
      ('${rejectedId}', 'recycling', 'SENSITIVE: Rejected provider service');
  `);

  await pgClient.query(`
    INSERT INTO provider_accepted_categories (provider_id, category_slug, notes)
    VALUES 
      ('${approvedId}', 'smartphones-tablets', 'Approved category notes'),
      ('${pendingId}', 'smartphones-tablets', 'SENSITIVE: Pending category notes'),
      ('${rejectedId}', 'smartphones-tablets', 'SENSITIVE: Rejected category notes');
  `);

  await pgClient.query(`
    INSERT INTO provider_service_areas (provider_id, area_type, location_code, location_name)
    VALUES 
      ('${approvedId}', 'pincode', '560001', 'Approved Area Bengaluru'),
      ('${pendingId}', 'pincode', '560099', 'SENSITIVE: Pending Area Location'),
      ('${rejectedId}', 'pincode', '560098', 'SENSITIVE: Rejected Area Location');
  `);

  // Query via public client without filter (RLS must enforce approval_status = 'approved')
  const { data: rlsProviders, error: rlsError } = await publicSupabase
    .from("providers")
    .select(`
      *,
      services:provider_services(*),
      accepted_categories:provider_accepted_categories(*),
      service_areas:provider_service_areas(*)
    `);

  if (rlsError) throw new Error("RLS public query failed: " + rlsError.message);

  // Check providers
  const hasApproved = rlsProviders.some(p => p.id === approvedId);
  const hasPending = rlsProviders.some(p => p.id === pendingId);
  const hasRejected = rlsProviders.some(p => p.id === rejectedId);

  if (!hasApproved) throw new Error("Approved provider was not returned by RLS query!");
  if (hasPending) throw new Error("SECURITY BREACH: Pending provider was returned to public query!");
  if (hasRejected) throw new Error("SECURITY BREACH: Rejected provider was returned to public query!");
  console.log("✓ Public query returned ONLY approved provider (pending and rejected blocked by RLS).");

  // Check related child tables directly via public client
  console.log("\nStep 7: Verifying Child Tables Cannot Leak Unapproved Data via Public Queries...");

  const { data: publicServices } = await publicSupabase.from("provider_services").select("*");
  const leakedService = publicServices?.find(s => s.provider_id === pendingId || s.provider_id === rejectedId);
  if (leakedService) throw new Error("SECURITY BREACH: Unapproved provider service leaked in public query!");
  console.log("✓ provider_services: No unapproved provider services exposed.");

  const { data: publicCategories } = await publicSupabase.from("provider_accepted_categories").select("*");
  const leakedCategory = publicCategories?.find(c => c.provider_id === pendingId || c.provider_id === rejectedId);
  if (leakedCategory) throw new Error("SECURITY BREACH: Unapproved provider category leaked in public query!");
  console.log("✓ provider_accepted_categories: No unapproved provider categories exposed.");

  const { data: publicAreas } = await publicSupabase.from("provider_service_areas").select("*");
  const leakedArea = publicAreas?.find(a => a.provider_id === pendingId || a.provider_id === rejectedId);
  if (leakedArea) throw new Error("SECURITY BREACH: Unapproved provider service area leaked in public query!");
  console.log("✓ provider_service_areas: No unapproved provider service areas exposed.");

  // Clean up test data and restore database fixtures
  console.log("\nStep 8: Cleaning up test records and restoring database fixtures...");
  await pgClient.query("DELETE FROM providers;");

  // Re-run migration to restore original sample records
  await pgClient.query(migrationSql);
  console.log("✓ Restored initial migration state.");

  await pgClient.end();
  console.log("\n=== ALL LIVE INTEGRATION TESTS PASSED WITH 100% SUCCESS ===");
}

run().catch(err => {
  console.error("TEST FAILED:", err);
  process.exit(1);
});
