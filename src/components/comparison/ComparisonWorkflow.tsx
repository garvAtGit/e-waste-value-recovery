"use client";

import React, { useState, useMemo, useEffect } from "react";
import { DEVICE_CATEGORIES } from "@/lib/constants/categories";
import { ProviderWithDetails } from "@/lib/supabase/types";
import { ComparisonInput, ComparisonPriority } from "@/lib/comparison/types";
import { evaluateComparison } from "@/lib/comparison/engine";
import { trackComparisonOutcome } from "@/lib/comparison/tracker";
import { ConditionType, CONDITIONS } from "@/components/landing/PathwayExplorer";
import { PathwayCard } from "./PathwayCard";
import { HazardAlertBanner } from "./HazardAlertBanner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  SlidersHorizontal,
  CheckCircle2,
  MapPin,
  Info,
  ShieldCheck,
  RotateCcw,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

interface ComparisonWorkflowProps {
  approvedProviders: ProviderWithDetails[];
  isConfigured: boolean;
  isDemoMode: boolean;
  initialError?: string | null;
}

export function ComparisonWorkflow({
  approvedProviders,
  isConfigured,
  isDemoMode,
  initialError,
}: ComparisonWorkflowProps) {
  // 1. User Input State
  const [categorySlug, setCategorySlug] = useState<string>("smartphones-tablets");
  const [deviceModel, setDeviceModel] = useState<string>("");
  const [condition, setCondition] = useState<ConditionType>("minor_fault");
  const [specificFault, setSpecificFault] = useState<string>("");
  const [pincode, setPincode] = useState<string>("");
  const [priority, setPriority] = useState<ComparisonPriority>("maximise_money");

  // Tab filter for results
  const [filterView, setFilterView] = useState<"all" | "eligible" | "excluded">("all");

  const comparisonInput: ComparisonInput = useMemo(
    () => ({
      categorySlug,
      deviceModel: deviceModel.trim() || undefined,
      condition,
      specificFault: specificFault.trim() || undefined,
      pincode: pincode.trim() || undefined,
      priority,
    }),
    [categorySlug, deviceModel, condition, specificFault, pincode, priority]
  );

  const router = useRouter();
  const [isStartingCase, setIsStartingCase] = useState<string | null>(null);
  const [caseError, setCaseError] = useState<string | null>(null);

  const handleStartCase = async (pathwayId: string, providerId?: string) => {
    setIsStartingCase(pathwayId);
    setCaseError(null);

    try {
      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pathwayId,
          providerId,
          assessmentInput: comparisonInput,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to initiate recovery case.");
      }

      router.push(`/cases/${data.case.id}`);
    } catch (err) {
      setCaseError(err instanceof Error ? err.message : "Failed to initiate case.");
      setIsStartingCase(null);
    }
  };

  // 2. Evaluate comparison deterministically
  const evaluation = useMemo(() => {
    return evaluateComparison(comparisonInput, approvedProviders);
  }, [comparisonInput, approvedProviders]);

  // Log outcome intent anonymously whenever the primary recommendation changes
  useEffect(() => {
    trackComparisonOutcome({
      categorySlug,
      condition,
      priority,
      recommendedPathwayId: evaluation.primaryPathwayId,
      selectedAction: "explored_recommendation",
      pincode: pincode.trim() || undefined,
    });
  }, [categorySlug, condition, priority, evaluation.primaryPathwayId, pincode]);

  const primaryPathway = evaluation.pathways.find(
    (p) => p.pathwayId === evaluation.primaryPathwayId
  );

  const displayedPathways = useMemo(() => {
    if (filterView === "eligible") {
      return evaluation.pathways.filter((p) => p.eligibility !== "excluded");
    }
    if (filterView === "excluded") {
      return evaluation.pathways.filter((p) => p.eligibility === "excluded");
    }
    return evaluation.pathways;
  }, [evaluation.pathways, filterView]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Database Error Notice if query failed */}
      {initialError && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 mb-4 text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <strong className="block text-amber-950 font-semibold mb-0.5">
              Live Database Connectivity Notice:
            </strong>
            <span>
              Unable to reach live provider directory ({initialError}). Falling back to verified development sample fixtures.
            </span>
          </div>
        </div>
      )}

      {/* Configuration notice if database is in demo mode */}
      {(!isConfigured || isDemoMode) && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 mb-8 text-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>Delhi Pilot (Demonstration Fixtures):</strong> Matching against verified development sample providers.
              Pincodes <code>560001</code>, <code>560025</code>, and <code>560034</code> reflect mock coverage. Delhi pilot candidate records remain in review.
            </span>
          </div>
          <Link
            href="/directory"
            className="font-semibold text-amber-950 underline hover:text-amber-800 shrink-0"
          >
            View Directory &rarr;
          </Link>
        </div>
      )}

      {/* Grid: Left Column Inputs / Right Column Comparison Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* --- LEFT FORM COLUMN --- */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-emerald-800" />
              <h2 className="text-base font-bold text-slate-900">Your Device Profile</h2>
            </div>
            <button
              type="button"
              onClick={() => {
                setCategorySlug("smartphones-tablets");
                setDeviceModel("");
                setCondition("minor_fault");
                setSpecificFault("");
                setPincode("");
                setPriority("maximise_money");
              }}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* 1. Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-2">
              1. Equipment Category <span className="text-emerald-700">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" role="group" aria-label="Category selector">
              {DEVICE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategorySlug(cat.slug)}
                  className={`text-left p-3 rounded-xl border text-xs font-medium transition-all ${
                    categorySlug === cat.slug
                      ? "bg-emerald-800 text-white border-emerald-900 shadow-xs ring-2 ring-emerald-800/20"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-white hover:border-slate-300"
                  }`}
                  aria-pressed={categorySlug === cat.slug}
                >
                  <span className="block font-semibold">{cat.name}</span>
                  <span
                    className={`block text-[11px] mt-0.5 truncate ${
                      categorySlug === cat.slug ? "text-emerald-100" : "text-slate-500"
                    }`}
                  >
                    {cat.examples[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Optional Device Model */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
              2. Specific Model / Brand <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={deviceModel}
              onChange={(e) => setDeviceModel(e.target.value)}
              placeholder="e.g. iPhone 12, ThinkPad T480, Galaxy S21"
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Helps clarify repair part availability and OEM trade-in eligibility.
            </p>
          </div>

          {/* 3. Operational & Physical Condition */}
          <fieldset>
            <legend className="block text-xs font-semibold text-slate-800 mb-2">
              3. Operating Condition <span className="text-emerald-700">*</span>
            </legend>
            <div className="space-y-2">
              {CONDITIONS.map((cond) => {
                const isChecked = condition === cond.id;
                const isHazardOption = cond.id === "unsafe_hazardous";

                return (
                  <label
                    key={cond.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      isChecked
                        ? isHazardOption
                          ? "bg-rose-50/90 border-rose-500 ring-2 ring-rose-500/20 text-rose-950 shadow-xs"
                          : "bg-white border-emerald-600 ring-2 ring-emerald-600/20 text-slate-900 shadow-xs"
                        : isHazardOption
                        ? "bg-white border-rose-200 text-rose-900 hover:bg-rose-50/30"
                        : "bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="device-condition"
                      value={cond.id}
                      checked={isChecked}
                      onChange={() => setCondition(cond.id)}
                      className={`mt-0.5 h-4 w-4 ${
                        isHazardOption
                          ? "text-rose-600 focus:ring-rose-500"
                          : "text-emerald-600 focus:ring-emerald-500"
                      }`}
                    />
                    <div>
                      <span className={`block font-semibold ${isHazardOption && isChecked ? "text-rose-950" : "text-slate-900"}`}>
                        {cond.label}
                      </span>
                      <span className="block text-[11px] text-slate-500 mt-0.5 leading-snug">
                        {cond.description}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {/* 4. Specific Fault Detail (if minor or major fault) */}
          {(condition === "minor_fault" || condition === "major_fault") && (
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                4. Primary Defect or Symptom <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={specificFault}
                onChange={(e) => setSpecificFault(e.target.value)}
                placeholder="e.g. Cracked outer glass, rapid battery drain, port loose"
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>
          )}

          {/* 5. Service Pincode (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
              5. Your Service Pincode <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="e.g. 110001"
                maxLength={6}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 pl-8 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
              <MapPin className="w-4 h-4 text-slate-400 absolute left-2.5 top-3" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1 leading-normal">
              <strong>Strict Matching Policy:</strong> Matches only against providers with verified service areas for this exact pincode. No state-level assumptions.
            </p>
          </div>

          {/* 6. Main User Priority */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-2">
              6. Your Primary Goal <span className="text-emerald-700">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2" role="group" aria-label="Priority selection">
              <button
                type="button"
                onClick={() => setPriority("maximise_money")}
                className={`p-2.5 text-left rounded-xl border text-xs font-medium transition-all ${
                  priority === "maximise_money"
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-white"
                }`}
                aria-pressed={priority === "maximise_money"}
              >
                <span className="block font-semibold">Maximise Money</span>
                <span className="text-[10px] opacity-80">Highest cash return</span>
              </button>
              <button
                type="button"
                onClick={() => setPriority("minimise_effort")}
                className={`p-2.5 text-left rounded-xl border text-xs font-medium transition-all ${
                  priority === "minimise_effort"
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-white"
                }`}
                aria-pressed={priority === "minimise_effort"}
              >
                <span className="block font-semibold">Minimise Effort</span>
                <span className="text-[10px] opacity-80">Fastest turnaround</span>
              </button>
              <button
                type="button"
                onClick={() => setPriority("repair_keep")}
                className={`p-2.5 text-left rounded-xl border text-xs font-medium transition-all ${
                  priority === "repair_keep"
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-white"
                }`}
                aria-pressed={priority === "repair_keep"}
              >
                <span className="block font-semibold">Repair & Keep</span>
                <span className="text-[10px] opacity-80">Extend lifecycle</span>
              </button>
              <button
                type="button"
                onClick={() => setPriority("dispose_responsibly")}
                className={`p-2.5 text-left rounded-xl border text-xs font-medium transition-all ${
                  priority === "dispose_responsibly"
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-white"
                }`}
                aria-pressed={priority === "dispose_responsibly"}
              >
                <span className="block font-semibold">Dispose Responsibly</span>
                <span className="text-[10px] opacity-80">Certified recycling</span>
              </button>
            </div>
          </div>
        </div>

        {/* --- RIGHT COMPARISON RESULTS COLUMN --- */}
        <div className="lg:col-span-7 space-y-6">
          {/* Emergency Safety Alert if Hazardous */}
          {evaluation.isHazardous && evaluation.hazardDirectives && (
            <HazardAlertBanner
              headline={evaluation.hazardDirectives.headline}
              stopUseWarning={evaluation.hazardDirectives.stopUseWarning}
              handlingSteps={evaluation.hazardDirectives.handlingSteps}
            />
          )}

          {/* Unmatched Pincode Notice (Honest declaration) */}
          {evaluation.unmatchedPincodeNotice && (
            <div className="bg-slate-100 border border-slate-300 rounded-xl p-4 text-xs text-slate-700 flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900 font-semibold mb-0.5">
                  Notice on Pincode Coverage:
                </strong>
                <span className="leading-relaxed">{evaluation.unmatchedPincodeNotice}</span>
              </div>
            </div>
          )}

          {/* Primary Recommendation Banner */}
          {primaryPathway && !evaluation.isHazardous && (
            <div className="bg-white border-2 border-emerald-600 rounded-2xl p-6 sm:p-7 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full uppercase tracking-wider">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  Primary Evidence Recommendation
                </span>
                <span className="text-xs text-slate-500">
                  Turnaround: <strong className="text-slate-800">{primaryPathway.speed}</strong>
                </span>
              </div>

              <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
                {primaryPathway.title}
              </h3>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-5 text-xs text-slate-700 leading-relaxed">
                <strong className="block font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1">
                  Why this recommendation?
                </strong>
                {evaluation.recommendationExplanation}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100">
                <span className="text-xs text-slate-600 font-medium">
                  Financial Category: <strong>{primaryPathway.valueDescription}</strong>
                </span>
                <div className="flex items-center gap-3">
                  <Link
                    href="/directory"
                    onClick={() =>
                      trackComparisonOutcome({
                        categorySlug,
                        condition,
                        priority,
                        recommendedPathwayId: primaryPathway.pathwayId,
                        selectedAction: "searched_directory",
                        pincode: pincode || undefined,
                      })
                    }
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 underline"
                  >
                    Directory &rarr;
                  </Link>
                  <button
                    type="button"
                    disabled={Boolean(isStartingCase)}
                    onClick={() => handleStartCase(primaryPathway.pathwayId, primaryPathway.matchedProviders[0]?.id)}
                    className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    <span>{isStartingCase === primaryPathway.pathwayId ? "Initiating..." : "Start Recovery Case"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {caseError && (
            <div className="bg-rose-50 border border-rose-300 text-rose-900 rounded-xl p-4 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
              <span>{caseError}</span>
            </div>
          )}

          {/* Tab Filter Header for the 6 Pathways */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Comparison of All 6 Recovery Routes
              </h3>
              <p className="text-xs text-slate-500">
                Deterministic eligibility evaluation based on hardware condition and provider records.
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-medium text-slate-600 border border-slate-200">
              <button
                type="button"
                onClick={() => setFilterView("all")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  filterView === "all" ? "bg-white text-slate-900 shadow-2xs font-semibold" : "hover:text-slate-900"
                }`}
              >
                All (6)
              </button>
              <button
                type="button"
                onClick={() => setFilterView("eligible")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  filterView === "eligible" ? "bg-white text-slate-900 shadow-2xs font-semibold" : "hover:text-slate-900"
                }`}
              >
                Eligible Only
              </button>
              <button
                type="button"
                onClick={() => setFilterView("excluded")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  filterView === "excluded" ? "bg-white text-slate-900 shadow-2xs font-semibold" : "hover:text-slate-900"
                }`}
              >
                Excluded
              </button>
            </div>
          </div>

          {/* Pathways List */}
          <div className="space-y-5">
            {displayedPathways.map((pathway) => (
              <PathwayCard
                key={pathway.pathwayId}
                pathway={pathway}
                isPrimary={pathway.pathwayId === evaluation.primaryPathwayId}
                onStartCase={handleStartCase}
                onExploreAction={(id: string) => {
                  trackComparisonOutcome({
                    categorySlug,
                    condition,
                    priority,
                    recommendedPathwayId: id,
                    selectedAction: "switched_pathway",
                    pincode: pincode || undefined,
                  });
                }}
              />
            ))}
          </div>

          {/* Evidence and Integrity Assurance */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-xs text-slate-600 space-y-2 leading-relaxed">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              Evidence Standards & Uncertainty Disclaimer:
            </h4>
            <p>
              • <strong>No Invented Valuations:</strong> We do not publish artificial cash estimates or guaranteed pricing. Second-hand values and repair costs fluctuate with component markets and physical diagnostic grading.
            </p>
            <p>
              • <strong>Verified Provider Matching:</strong> Listings reflect only approved organizations with documented evidence. Unchecked providers are not recommended.
            </p>
            <p>
              • <strong>Non-Inferential Coverage:</strong> We never assume that a provider serves your pincode merely because it operates in the same state.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
