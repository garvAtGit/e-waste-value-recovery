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
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs mb-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-emerald-800" />
          <h2 className="text-base font-bold text-slate-900">
            Filter Providers by Verified Criteria
          </h2>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-600">
          <span>
            Showing <strong className="text-slate-900">{filteredCount}</strong> of{" "}
            <strong className="text-slate-900">{totalCount}</strong> providers
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-emerald-800 hover:text-emerald-950 font-semibold underline ml-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Filter 1: Device Category */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Device Category
          </label>
          <select
            value={filters.category || "all"}
            onChange={handleCategoryChange}
            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700"
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
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Desired Service
          </label>
          <select
            value={filters.service || "all"}
            onChange={handleServiceChange}
            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700"
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
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Device Condition
          </label>
          <select
            value={filters.condition || "all"}
            onChange={handleConditionChange}
            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700"
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
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Location / Pincode
          </label>
          <div className="relative">
            <input
              type="text"
              value={filters.locationQuery || ""}
              onChange={handleLocationChange}
              placeholder="e.g. 110001 or Delhi"
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 pl-8 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
            <MapPin className="w-4 h-4 text-slate-400 absolute left-2.5 top-3" />
          </div>
        </div>

        {/* Filter 5: Logistics (Pickup / Drop-off) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Logistics Options
          </label>
          <select
            value={filters.logistics || "all"}
            onChange={handleLogisticsChange}
            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700"
          >
            <option value="all">Any Logistics</option>
            <option value="pickup">Pickup Available</option>
            <option value="dropoff">Drop-off Available</option>
            <option value="both">Both Pickup & Drop-off</option>
          </select>
        </div>

        {/* Filter 6: Verification Status */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Verification Status
          </label>
          <select
            value={filters.verificationStatus || "all"}
            onChange={handleVerificationChange}
            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700"
          >
            <option value="all">All Verification Tiers</option>
            <option value="verified">Verified Evidence</option>
            <option value="partially_verified">Partially Verified</option>
            <option value="unverified">Unverified</option>
          </select>
        </div>

        {/* Filter 7: Intake Scope (Consumer vs Bulk) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Intake Scope
          </label>
          <select
            value={filters.consumerOnly ? "consumer_only" : "all"}
            onChange={handleConsumerToggle}
            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700"
          >
            <option value="all">All Intakes (Single &amp; Bulk)</option>
            <option value="consumer_only">Single Device / Consumer (Min 1)</option>
          </select>
        </div>
      </div>

      <p className="text-[11px] text-slate-500 mt-3 pt-3 border-t border-slate-100 leading-normal">
        <strong>Strict Location Policy:</strong> Pincode and location searches only match providers with documented, verified service areas. Regional coverage is never inferred based solely on state presence.
      </p>
    </div>
  );
}
