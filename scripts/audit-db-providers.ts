// @ts-expect-error - pg loaded dynamically in scripts
import pg from "pg";

const { Client } = pg;
const pgConnectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres.szhytxxodirecuukyxti:skutpu24FJ5bYbhn@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres";

async function main() {
  const client = new Client({
    connectionString: pgConnectionString,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  const p = await client.query(
    "SELECT id, name, slug, organisation_type, approval_status, verification_status, quote_type, is_sample_data, website_url, source_evidence_url, last_checked_at FROM providers ORDER BY name"
  );
  console.log("PROVIDERS IN DB (" + p.rows.length + " records):");
  console.log(JSON.stringify(p.rows, null, 2));

  const s = await client.query(
    "SELECT provider_id, service_type, service_description FROM provider_services"
  );
  console.log("\nSERVICES IN DB (" + s.rows.length + " records):");
  console.log(JSON.stringify(s.rows, null, 2));

  const c = await client.query(
    "SELECT provider_id, category_slug, accepted_conditions FROM provider_accepted_categories"
  );
  console.log("\nCATEGORIES IN DB (" + c.rows.length + " records):");
  console.log(JSON.stringify(c.rows, null, 2));

  const a = await client.query(
    "SELECT provider_id, area_type, location_code, location_name, supports_pickup, supports_dropoff FROM provider_service_areas"
  );
  console.log("\nAREAS IN DB (" + a.rows.length + " records):");
  console.log(JSON.stringify(a.rows, null, 2));

  await client.end();
}

main().catch((err) => {
  console.error("Audit query failed:", err);
  process.exit(1);
});
