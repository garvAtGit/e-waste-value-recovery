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
        <div className="bg-[#FFF9F5] border border-[#F3D1C2] text-[#C8532C] rounded-sm p-4 mb-6 text-xs sm:text-sm font-mono">
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
        <div className="bg-white border border-[#E5E0D8] rounded-sm p-12 text-center max-w-xl mx-auto">
          <div className="w-12 h-12 rounded-sm bg-[#F4F1EA] flex items-center justify-center mx-auto mb-4 text-[#8E8B82] border border-[#E5E0D8]">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-xl font-bold text-[#141413] mb-2">
            No approved providers in directory yet
          </h3>
          <p className="text-xs sm:text-sm text-[#5A574F] mb-4 leading-relaxed">
            The database connection is active, but no provider listings have been approved yet.
            Submissions with status &quot;pending_review&quot; or &quot;rejected&quot; are protected by Row Level
            Security and will only appear once reviewed and set to &quot;approved&quot;.
          </p>
          <span className="inline-block text-[11px] font-mono text-[#8E8B82] bg-[#FAF9F5] px-3 py-1 rounded-sm border border-[#E5E0D8]">
            Query: approval_status = &apos;approved&apos; (0 records returned)
          </span>
        </div>
      ) : (
        <div className="bg-white border border-[#E5E0D8] rounded-sm p-12 text-center max-w-xl mx-auto">
          <div className="w-12 h-12 rounded-sm bg-[#F4F1EA] flex items-center justify-center mx-auto mb-4 text-[#8E8B82] border border-[#E5E0D8]">
            <SearchX className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-xl font-bold text-[#141413] mb-2">
            No matching providers found
          </h3>
          <p className="text-xs sm:text-sm text-[#5A574F] mb-6 leading-relaxed">
            No approved providers currently match all of your active filter criteria. Service areas are matched strictly based on documented coverage without regional inference.
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
            className="px-4 py-2 bg-[#1B3B2B] hover:bg-[#132A1F] text-white rounded-sm text-xs font-mono uppercase tracking-wider font-semibold transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Evidence & Integrity Footer Note */}
      <div className="mt-12 pt-8 border-t border-[#E5E0D8] text-xs text-[#5A574F] flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#1B3B2B] shrink-0" />
          <span>
            <strong className="text-[#141413]">Zero Commercial Placement:</strong> Providers cannot pay for rankings or inclusion.
          </span>
        </div>
        <p className="text-[#8E8B82] text-center sm:text-right">
          Are you an accredited recycler, repairer, or charity? Contact editorial review to submit verification documentation.
        </p>
      </div>
    </div>
  );
}
