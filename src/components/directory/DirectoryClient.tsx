"use client";

import React, { useState, useMemo } from "react";
import { ProviderWithDetails } from "@/lib/supabase/types";
import { filterProviders, ProviderFilters } from "@/lib/supabase/providers";
import { DirectoryFilter } from "./DirectoryFilter";
import { ProviderCard } from "./ProviderCard";
import { SupabaseSetupBanner } from "./SupabaseSetupBanner";
import { ShieldCheck, SearchX, Inbox } from "lucide-react";

interface DirectoryClientProps {
  initialProviders: ProviderWithDetails[];
  isConfigured: boolean;
  isDemoMode: boolean;
  initialError: string | null;
}

export function DirectoryClient({
  initialProviders,
  isConfigured,
  isDemoMode,
  initialError,
}: DirectoryClientProps) {
  const [filters, setFilters] = useState<ProviderFilters>({
    category: "all",
    service: "all",
    locationQuery: "",
    logistics: "all",
    verificationStatus: "all",
  });

  const filteredProviders = useMemo(() => {
    return filterProviders(initialProviders, filters);
  }, [initialProviders, filters]);

  const isDatabaseEmpty = isConfigured && !isDemoMode && initialProviders.length === 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Informational setup banner if not configured or using demo records */}
      <SupabaseSetupBanner isConfigured={isConfigured} isDemoMode={isDemoMode} />

      {/* Database error banner if unexpected failure occurs */}
      {initialError && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 mb-6 text-xs sm:text-sm">
          <strong>Database Notice:</strong> {initialError}. Displaying development sample records.
        </div>
      )}

      {/* Filter Controls (shown if there are providers to filter) */}
      {!isDatabaseEmpty && (
        <DirectoryFilter
          filters={filters}
          onChange={setFilters}
          totalCount={initialProviders.length}
          filteredCount={filteredProviders.length}
        />
      )}

      {/* Provider Cards Grid or Empty States */}
      {filteredProviders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProviders.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} />
          ))}
        </div>
      ) : isDatabaseEmpty ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-xl mx-auto">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            No approved providers in directory yet
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mb-4 leading-relaxed">
            The database connection is active, but no provider listings have been approved yet.
            Submissions with status &quot;pending_review&quot; or &quot;rejected&quot; are protected by Row Level
            Security and will only appear once reviewed and set to &quot;approved&quot;.
          </p>
          <span className="inline-block text-[11px] font-mono text-slate-500 bg-slate-100 px-3 py-1 rounded-md">
            Query: approval_status = &apos;approved&apos; (0 records returned)
          </span>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-xl mx-auto">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
            <SearchX className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            No matching providers found
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">
            No approved providers currently match all of your active filter criteria. Remember that
            service areas are matched strictly based on documented coverage without regional inference.
          </p>
          <button
            type="button"
            onClick={() =>
              setFilters({
                category: "all",
                service: "all",
                locationQuery: "",
                logistics: "all",
                verificationStatus: "all",
              })
            }
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Evidence & Integrity Footer Note */}
      <div className="mt-12 pt-8 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>
            <strong>Zero Commercial Placement:</strong> Providers cannot pay for rankings or inclusion.
          </span>
        </div>
        <p className="text-slate-500 text-center sm:text-right">
          Are you an accredited recycler, repairer, or charity? Contact editorial review to submit verification documentation.
        </p>
      </div>
    </div>
  );
}
