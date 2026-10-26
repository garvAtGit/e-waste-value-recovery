"use client";

import React from "react";
import { DEVICE_CATEGORIES } from "@/lib/constants/categories";
import { ProviderFilters } from "@/lib/supabase/providers";
import { ServiceType, VerificationStatus } from "@/lib/supabase/types";
import { RotateCcw, Filter, MapPin } from "lucide-react";

interface DirectoryFilterProps {
  filters: ProviderFilters;
  onChange: (newFilters: ProviderFilters) => void;
  totalCount: number;
  filteredCount: number;
}

export function DirectoryFilter({
  filters,
  onChange,
  totalCount,
  filteredCount,
}: DirectoryFilterProps) {
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, category: e.target.value });
  };

  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, service: e.target.value as ServiceType | "all" });
  };

  const handleConditionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, condition: e.target.value });
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, locationQuery: e.target.value });
  };

  const handleLogisticsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({
      ...filters,
      logistics: e.target.value as "all" | "pickup" | "dropoff" | "both",
    });
  };

  const handleVerificationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({
      ...filters,
      verificationStatus: e.target.value as VerificationStatus | "all",
    });
  };

  const handleConsumerToggle = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    onChange({
      ...filters,
      consumerOnly: val === "consumer_only" ? true : undefined,
    });
  };

  const handleReset = () => {
    onChange({
      category: "all",
      service: "all",
      condition: "all",
      consumerOnly: undefined,
      locationQuery: "",
      logistics: "all",
      verificationStatus: "all",
    });
  };

  const hasActiveFilters = Boolean(
    (filters.category && filters.category !== "all") ||
      (filters.service && filters.service !== "all") ||
      (filters.condition && filters.condition !== "all") ||
      filters.consumerOnly ||
      (filters.locationQuery && filters.locationQuery.trim().length > 0) ||
      (filters.logistics && filters.logistics !== "all") ||
      (filters.verificationStatus && filters.verificationStatus !== "all")
  );

  return (
    <div className="bg-white border border-[#E5E0D8] rounded-sm p-6 sm:p-7 shadow-xs mb-8">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5 pb-4 border-b border-[#E5E0D8]">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#1B3B2B]" />
          <h2 className="font-serif text-lg font-bold text-[#141413] tracking-tight">
            Filter Providers by Verified Criteria
          </h2>
        </div>

        <div className="flex items-center gap-3 text-xs text-[#5A574F] font-mono">
          <span>
            Displaying <strong className="text-[#141413]">{filteredCount}</strong> of{" "}
            <strong className="text-[#141413]">{totalCount}</strong> accredited facilities
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-[#C8532C] hover:text-[#9E3F1F] font-semibold underline ml-2 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Filter Fields Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Filter 1: Device Category */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-[#5A574F] mb-1.5">
            01 / Hardware Category
          </label>
          <select
            value={filters.category || "all"}
            onChange={handleCategoryChange}
            className="w-full text-xs font-sans bg-[#FBF9F5] border border-[#D5D0C5] rounded-sm p-2.5 text-[#141413] focus:outline-none focus:border-[#1B3B2B] focus:ring-1 focus:ring-[#1B3B2B] transition-colors"
          >
            <option value="all">All Categories</option>
            {DEVICE_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filter 2: Desired Service */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-[#5A574F] mb-1.5">
            02 / Desired Service
          </label>
          <select
            value={filters.service || "all"}
            onChange={handleServiceChange}
            className="w-full text-xs font-sans bg-[#FBF9F5] border border-[#D5D0C5] rounded-sm p-2.5 text-[#141413] focus:outline-none focus:border-[#1B3B2B] focus:ring-1 focus:ring-[#1B3B2B] transition-colors"
          >
            <option value="all">All Services</option>
            <option value="repair">Repair</option>
            <option value="cash_buyback">Cash Buyback</option>
            <option value="exchange">Trade-in / Exchange</option>
            <option value="donation_reuse">Donation & Reuse</option>
            <option value="component_recovery">Component Recovery</option>
            <option value="recycling">Material Recycling</option>
          </select>
        </div>

        {/* Filter 3: Device Condition */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-[#5A574F] mb-1.5">
            03 / Hardware Condition
          </label>
          <select
            value={filters.condition || "all"}
            onChange={handleConditionChange}
            className="w-full text-xs font-sans bg-[#FBF9F5] border border-[#D5D0C5] rounded-sm p-2.5 text-[#141413] focus:outline-none focus:border-[#1B3B2B] focus:ring-1 focus:ring-[#1B3B2B] transition-colors"
          >
            <option value="all">All Conditions</option>
            <option value="working_recent">Working (Recent &lt; 4-5 yrs)</option>
            <option value="minor_fault">Minor Fault / Worn Battery</option>
            <option value="working_older">Working (Older / Legacy)</option>
            <option value="major_fault">Major Fault / Won&apos;t Boot</option>
            <option value="unsafe_hazardous">Swollen / Chemical Hazard</option>
          </select>
        </div>

        {/* Filter 4: Location or Pincode */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-[#5A574F] mb-1.5">
            04 / Location or Pincode
          </label>
          <div className="relative">
            <input
              type="text"
              value={filters.locationQuery || ""}
              onChange={handleLocationChange}
              placeholder="e.g. 110001 or Delhi"
              className="w-full text-xs font-sans bg-[#FBF9F5] border border-[#D5D0C5] rounded-sm p-2.5 pl-8 text-[#141413] placeholder-[#8E8B82] focus:outline-none focus:border-[#1B3B2B] focus:ring-1 focus:ring-[#1B3B2B] transition-colors"
            />
            <MapPin className="w-3.5 h-3.5 text-[#8E8B82] absolute left-2.5 top-3" />
          </div>
        </div>

        {/* Filter 5: Logistics (Pickup / Drop-off) */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-[#5A574F] mb-1.5">
            05 / Logistics Mode
          </label>
          <select
            value={filters.logistics || "all"}
            onChange={handleLogisticsChange}
            className="w-full text-xs font-sans bg-[#FBF9F5] border border-[#D5D0C5] rounded-sm p-2.5 text-[#141413] focus:outline-none focus:border-[#1B3B2B] focus:ring-1 focus:ring-[#1B3B2B] transition-colors"
          >
            <option value="all">Any Logistics</option>
            <option value="pickup">Pickup Available</option>
            <option value="dropoff">Drop-off Available</option>
            <option value="both">Both Pickup & Drop-off</option>
          </select>
        </div>

        {/* Filter 6: Verification Status */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-[#5A574F] mb-1.5">
            06 / Verification Level
          </label>
          <select
            value={filters.verificationStatus || "all"}
            onChange={handleVerificationChange}
            className="w-full text-xs font-sans bg-[#FBF9F5] border border-[#D5D0C5] rounded-sm p-2.5 text-[#141413] focus:outline-none focus:border-[#1B3B2B] focus:ring-1 focus:ring-[#1B3B2B] transition-colors"
          >
            <option value="all">All Verification Tiers</option>
            <option value="verified">Verified Evidence</option>
            <option value="partially_verified">Partially Verified</option>
            <option value="unverified">Unverified</option>
          </select>
        </div>

        {/* Filter 7: Intake Scope (Consumer vs Bulk) */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-[#5A574F] mb-1.5">
            07 / Intake Minimum
          </label>
          <select
            value={filters.consumerOnly ? "consumer_only" : "all"}
            onChange={handleConsumerToggle}
            className="w-full text-xs font-sans bg-[#FBF9F5] border border-[#D5D0C5] rounded-sm p-2.5 text-[#141413] focus:outline-none focus:border-[#1B3B2B] focus:ring-1 focus:ring-[#1B3B2B] transition-colors"
          >
            <option value="all">All Intakes (Single &amp; Bulk)</option>
            <option value="consumer_only">Single Device / Consumer (Min 1)</option>
          </select>
        </div>
      </div>

      <div className="text-[11px] font-mono text-[#5A574F] mt-4 pt-3 border-t border-[#E5E0D8] leading-normal flex items-center justify-between">
        <span>
          <strong className="text-[#141413]">Strict Location Policy:</strong> Pincode and location queries match documented coverage only; regional coverage is never inferred.
        </span>
      </div>
    </div>
  );
}
