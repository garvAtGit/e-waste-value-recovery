import { getSupabaseClient, isSupabaseConfigured } from "../supabase/client";
import type { Database } from "../supabase/types";

export type TrackedAction =
  | "explored_recommendation"
  | "viewed_provider_details"
  | "checked_safeguards"
  | "copied_checklist"
  | "switched_pathway"
  | "searched_directory";

export interface OutcomeEvent {
  categorySlug: string;
  condition: string;
  priority: string;
  recommendedPathwayId: string;
  selectedAction: TrackedAction;
  pincode?: string;
}

/**
 * Lightweight, privacy-preserving outcome event tracker.
 * Only records anonymous interaction intent.
 * Truncates pincodes to 3 digits; never records IP addresses or user identities.
 */
export async function trackComparisonOutcome(event: OutcomeEvent): Promise<void> {
  if (!isSupabaseConfigured) {
    return;
  }

  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    // Truncate pincode to 3-digit prefix to prevent identifying specific households
    const pincodePrefix = event.pincode
      ? event.pincode.trim().replace(/\D/g, "").slice(0, 3) || null
      : null;

    const outcomePayload: Database["public"]["Tables"]["comparison_outcomes"]["Insert"] = {
      category_slug: event.categorySlug,
      condition: event.condition,
      priority: event.priority,
      recommended_pathway_id: event.recommendedPathwayId,
      selected_action: event.selectedAction,
      pincode_prefix: pincodePrefix,
    };

    // Use fire-and-forget insert
    await (
      supabase.from("comparison_outcomes") as unknown as {
        insert: (row: typeof outcomePayload) => Promise<unknown>;
      }
    ).insert(outcomePayload);
  } catch (err) {
    // Silent catch: telemetry failure must never impact the user experience
    console.debug("Outcome tracking notice:", err instanceof Error ? err.message : err);
  }
}
