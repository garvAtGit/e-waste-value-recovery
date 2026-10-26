import { readFileSync } from "fs";
import { resolve } from "path";
// @ts-expect-error - pg loaded dynamically
import pg from "pg";

const { Client } = pg;
const pgConnectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres.szhytxxodirecuukyxti:skutpu24FJ5bYbhn@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres";

async function main() {
  console.log("Connecting to live database...");
  const client = new Client({
    connectionString: pgConnectionString,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  console.log("Connected successfully.");

  console.log("Reading supabase/migrations/20261026000001_comparison_outcomes.sql...");
  const sql = readFileSync(
    resolve("supabase/migrations/20261026000001_comparison_outcomes.sql"),
    "utf-8"
  );
  await client.query(sql);
  console.log("✓ Migration 2 executed successfully.");

  const res = await client.query(`
    SELECT tablename, rowsecurity 
    FROM pg_tables 
    WHERE schemaname = 'public' AND tablename = 'comparison_outcomes';
  `);
  console.log("comparison_outcomes row security status:", res.rows);

  await client.end();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
