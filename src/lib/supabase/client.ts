import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

let clientInstance: SupabaseClient<Database> | null = null;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.trim().length > 0 &&
    supabaseAnonKey.trim().length > 0 &&
    !supabaseUrl.includes("your-project") &&
    !supabaseAnonKey.includes("your-anon-key") &&
    (supabaseUrl.startsWith("https://") || supabaseUrl.startsWith("http://"))
);

/**
 * Returns a configured client-side / public Supabase client if valid public environment variables are present.
 * Validates the URL format and catches any initialization errors to prevent application crashes.
 */
export function getSupabaseClient(): SupabaseClient<Database> | null {
  if (clientInstance) {
    return clientInstance;
  }

  if (!isSupabaseConfigured || !supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  try {
    // Validate URL syntax before invoking createClient
    new URL(supabaseUrl);
    clientInstance = createClient<Database>(supabaseUrl, supabaseAnonKey);
    return clientInstance;
  } catch (err) {
    console.warn(
      "Invalid Supabase client configuration or URL format:",
      err instanceof Error ? err.message : err
    );
    return null;
  }
}
