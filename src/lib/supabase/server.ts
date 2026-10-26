import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

/**
 * Privileged server-only Supabase client.
 * Uses SUPABASE_SERVICE_ROLE_KEY to bypass Row Level Security for administrative scripts.
 * NEVER import this file into client components or browser bundles.
 */
export function getSupabaseServerClient(): SupabaseClient<Database> | null {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return null;
  }

  try {
    new URL(supabaseUrl);
    return createClient<Database>(supabaseUrl, serviceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  } catch (err) {
    console.warn("Invalid Supabase URL for server client:", err instanceof Error ? err.message : err);
    return null;
  }
}
