import { getSupabaseClient, isSupabaseConfigured } from "./client";
import { Database, ProviderWithDetails, ServiceType, VerificationStatus } from "./types";
import { SAMPLE_PROVIDERS } from "../constants/sample-providers";

export interface ProviderFilters {
  category?: string;
  service?: ServiceType | "all";
  condition?: string | "all";
  consumerOnly?: boolean;
  locationQuery?: string;
  logistics?: "all" | "pickup" | "dropoff" | "both";
  verificationStatus?: VerificationStatus | "all";
}

export interface ProviderQueryResult {
  providers: ProviderWithDetails[];
  isConfigured: boolean;
  isDemoMode: boolean;
  error: string | null;
}

/**
 * Filter providers purely in-memory according to strict evidence rules.
 * Does NOT infer coverage for unverified areas or whole states.
 */
export function filterProviders(
  providers: ProviderWithDetails[],
  filters: ProviderFilters
): ProviderWithDetails[] {
  return providers.filter((provider) => {
    // 1. Single Consumer vs Bulk Quantity Requirement
    if (filters.consumerOnly && provider.minimum_quantity && provider.minimum_quantity > 1) {
      return false;
    }

    // 2. Service Filter & Service-Specific Eligibility Guardrails
    if (filters.service && filters.service !== "all") {
      const offersService = provider.services.some(
        (srv) => srv.service_type === filters.service
      );
      if (!offersService) return false;

      // Service-specific category and condition guardrails
      if (filters.service === "exchange") {
        if (
          filters.category === "batteries-cables-peripherals" ||
          filters.category === "home-appliances-small"
        ) {
          return false;
        }
        if (filters.condition === "major_fault" || filters.condition === "unsafe_hazardous") {
          return false;
        }
      }
      if (filters.service === "cash_buyback") {
        if (filters.category === "batteries-cables-peripherals") {
          return false;
        }
        if (filters.condition === "major_fault" || filters.condition === "unsafe_hazardous") {
          return false;
        }
      }
      if (filters.service === "donation_reuse") {
        if (
          filters.condition &&
          filters.condition !== "all" &&
          filters.condition !== "working_recent" &&
          filters.condition !== "working_older"
        ) {
          return false;
        }
      }
      if (filters.service === "repair") {
        if (filters.category === "batteries-cables-peripherals") {
          return false;
        }
        if (filters.condition === "unsafe_hazardous") {
          return false;
        }
      }
    }

    // 3. Category & Accepted Conditions Filter
    if (filters.category && filters.category !== "all") {
      const catRecord = provider.accepted_categories.find(
        (cat) => cat.category_slug === filters.category
      );
      if (!catRecord) return false;

      if (filters.condition && filters.condition !== "all") {
        if (filters.condition === "unsafe_hazardous") {
          if (!catRecord.accepted_conditions || !catRecord.accepted_conditions.includes("unsafe_hazardous")) {
            return false;
          }
        } else if (
          catRecord.accepted_conditions &&
          catRecord.accepted_conditions.length > 0 &&
          !catRecord.accepted_conditions.includes(filters.condition)
        ) {
          return false;
        }
      }
    } else if (filters.condition && filters.condition !== "all") {
      const acceptsCondition = provider.accepted_categories.some((cat) => {
        if (filters.condition === "unsafe_hazardous") {
          return cat.accepted_conditions?.includes("unsafe_hazardous");
        }
        return (
          !cat.accepted_conditions ||
          cat.accepted_conditions.length === 0 ||
          cat.accepted_conditions.includes(filters.condition!)
        );
      });
      if (!acceptsCondition) return false;
    }

    // 4. Logistics (Pickup / Drop-off) Filter
    if (filters.logistics && filters.logistics !== "all") {
      if (filters.logistics === "pickup" && !provider.offers_pickup) return false;
      if (filters.logistics === "dropoff" && !provider.offers_dropoff) return false;
      if (filters.logistics === "both" && (!provider.offers_pickup || !provider.offers_dropoff))
        return false;
    }

    // 5. Verification Status Filter
    if (filters.verificationStatus && filters.verificationStatus !== "all") {
      if (provider.verification_status !== filters.verificationStatus) return false;
    }

    // 6. Location / Pincode Filter (STRICT - NO INFERRED COVERAGE)
    if (filters.locationQuery && filters.locationQuery.trim().length > 0) {
      const query = filters.locationQuery.trim().toLowerCase();

      // If provider has no documented service areas, it does not match a specific location query
      if (!provider.service_areas || provider.service_areas.length === 0) {
        return false;
      }

      // Check strictly against documented location_code (e.g. pincode) or location_name
      // Do NOT infer that a provider serves an area merely because it operates in the same state
      const matchingArea = provider.service_areas.find((area) => {
        const codeMatch =
          area.location_code &&
          area.location_code.toLowerCase().includes(query);
        const nameMatch =
          area.location_name &&
          area.location_name.toLowerCase().includes(query);
        const addressMatch =
          area.dropoff_address &&
          area.dropoff_address.toLowerCase().includes(query);

        return Boolean(codeMatch || nameMatch || addressMatch);
      });

      if (!matchingArea) return false;

      // Area-specific logistics verification:
      // If user filtered for drop-off, the matched facility area must actually support physical drop-off
      if (filters.logistics === "dropoff" && (!provider.offers_dropoff || !matchingArea.supports_dropoff)) {
        return false;
      }
      // If user filtered for pickup, the matched facility area must support pickup
      if (filters.logistics === "pickup" && (!provider.offers_pickup || !matchingArea.supports_pickup)) {
        return false;
      }
      if (filters.logistics === "both" && (!matchingArea.supports_pickup || !matchingArea.supports_dropoff)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Fetch approved providers from Supabase if configured, or return sample records if not.
 * Strictly prevents application crashes when credentials are not configured.
 */
export async function fetchApprovedProviders(): Promise<ProviderQueryResult> {
  if (!isSupabaseConfigured) {
    return {
      providers: SAMPLE_PROVIDERS,
      isConfigured: false,
      isDemoMode: true,
      error: null,
    };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      providers: SAMPLE_PROVIDERS,
      isConfigured: false,
      isDemoMode: true,
      error: null,
    };
  }

  try {
    // Public read query: RLS ensures only approval_status = 'approved' is returned
    const { data: providersData, error: providersError } = await supabase
      .from("providers")
      .select(`
        *,
        services:provider_services(*),
        accepted_categories:provider_accepted_categories(*),
        service_areas:provider_service_areas(*)
      `)
      .eq("approval_status", "approved")
      .order("name", { ascending: true });

    if (providersError) {
      console.warn("Supabase query error:", providersError.message);
      return {
        providers: SAMPLE_PROVIDERS,
        isConfigured: true,
        isDemoMode: true,
        error: providersError.message,
      };
    }

    if (!providersData || providersData.length === 0) {
      return {
        providers: [],
        isConfigured: true,
        isDemoMode: false,
        error: null,
      };
    }

    // Cast the joined query result to ProviderWithDetails[]
    const formatted: ProviderWithDetails[] = (
      providersData as unknown as Array<
        Database["public"]["Tables"]["providers"]["Row"] & {
          services?: Database["public"]["Tables"]["provider_services"]["Row"][];
          accepted_categories?: Database["public"]["Tables"]["provider_accepted_categories"]["Row"][];
          service_areas?: Database["public"]["Tables"]["provider_service_areas"]["Row"][];
        }
      >
    ).map((p) => ({
      ...p,
      services: p.services || [],
      accepted_categories: p.accepted_categories || [],
      service_areas: p.service_areas || [],
    }));

    // Separate real providers from sample demo fixtures
    const realProviders = formatted.filter((p) => !p.is_sample_data);
    const hasRealProviders = realProviders.length > 0;

    // When real provider records exist, exclude demo fixtures so they cannot contaminate production
    const activeProviders = hasRealProviders ? realProviders : formatted;

    return {
      providers: activeProviders,
      isConfigured: true,
      isDemoMode: activeProviders.some((p) => p.is_sample_data),
      error: null,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to connect to provider database";
    console.warn("Unexpected Supabase error:", message);
    return {
      providers: SAMPLE_PROVIDERS,
      isConfigured: true,
      isDemoMode: true,
      error: message,
    };
  }
}
