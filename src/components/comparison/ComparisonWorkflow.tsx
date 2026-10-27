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
  CheckCircle2,
  MapPin,
  Info,
  ShieldCheck,
  RotateCcw,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Check,
} from "lucide-react";

interface ComparisonWorkflowProps {
  approvedProviders: ProviderWithDetails[];
  isConfigured: boolean;
  isDemoMode: boolean;
  initialError?: string | null;
}

type AssessmentStage = 1 | 2 | 3 | 4;

export function ComparisonWorkflow({
  approvedProviders,
  isConfigured,
  isDemoMode,
  initialError,
}: ComparisonWorkflowProps) {
  // Navigation Stage: 1 = Category, 2 = Condition, 3 = Geography/Priority, 4 = Results
  const [activeStage, setActiveStage] = useState<AssessmentStage>(1);

  // User Input State
  const [categorySlug, setCategorySlug] = useState<string>("smartphones-tablets");
  const [deviceModel, setDeviceModel] = useState<string>("");
  const [condition, setCondition] = useState<ConditionType>("minor_fault");
  const [specificFault, setSpecificFault] = useState<string>("");
  const [pincode, setPincode] = useState<string>("");
  const [priority, setPriority] = useState<ComparisonPriority>("maximise_money");

  // Tab filter for comparison matrix
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

  // Evaluate comparison deterministically
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

  const resetAll = () => {
    setCategorySlug("smartphones-tablets");
    setDeviceModel("");
    setCondition("minor_fault");
    setSpecificFault("");
    setPincode("");
    setPriority("maximise_money");
    setActiveStage(1);
  };

  const STAGES = [
    { num: 1, label: "Equipment Category" },
    { num: 2, label: "Condition & Battery" },
    { num: 3, label: "Logistics & Goal" },
    { num: 4, label: "Decision Matrix" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Header & Breadcrumb */}
      {initialError && (
        <div className="p-4 bg-[#FFF9F5] border border-[#F3D1C2] text-[#C8532C] text-xs font-mono rounded-sm">
          <strong>Database Notice:</strong> {initialError}
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#DFD9CD]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase text-[#736F66]">
            <span>ASSESSMENT ENGINE</span>
            <span>&bull;</span>
            <span>DELHI PILOT AUDIT</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#141413] tracking-tight">
            Hardware Diagnostic &amp; Value Comparison
          </h1>
        </div>

        <button
          type="button"
          onClick={resetAll}
          className="inline-flex items-center gap-1.5 text-xs font-mono uppercase text-[#736F66] hover:text-[#141413] px-3 py-1.5 border border-[#D4CDC0] rounded-xs hover:bg-[#EFECE2] transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Diagnostic</span>
        </button>
      </div>

      {/* Progress Stepper Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 font-mono text-xs">
        {STAGES.map((s) => {
          const isCurrent = activeStage === s.num;
          const isCompleted = activeStage > s.num;

          return (
            <button
              key={s.num}
              type="button"
              onClick={() => setActiveStage(s.num as AssessmentStage)}
              className={`p-3 border rounded-xs text-left transition-colors flex items-center justify-between ${
                isCurrent
                  ? "bg-[#1B3B2B] text-[#F7F5EE] border-[#142D21]"
                  : isCompleted
                  ? "bg-[#EBF2ED] text-[#1B3B2B] border-[#C3D9CB]"
                  : "bg-[#FAF8F3] text-[#736F66] border-[#D4CDC0] hover:bg-[#EFECE2]"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] opacity-80">0{s.num}</span>
                <span className="font-semibold text-[11px] uppercase tracking-wider">{s.label}</span>
              </div>
              {isCompleted && <Check className="w-3.5 h-3.5 text-[#1B3B2B]" />}
            </button>
          );
        })}
      </div>

      {/* Database Notice Banner */}
      {(!isConfigured || isDemoMode) && (
        <div className="bg-[#FAF8F3] border border-[#D4CDC0] p-4 text-xs font-mono text-[#6B675E] rounded-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#257A72] shrink-0" />
            <span>
              <strong>Delhi Pilot Mode:</strong> Testing against 6 audited Delhi candidate networks and verified development fixtures. Pincodes <code>110001</code>, <code>110017</code>, and <code>110019</code> have verified branch coverage.
            </span>
          </div>
          <Link
            href="/directory"
            className="font-semibold text-[#141413] underline hover:text-[#1B3B2B] shrink-0"
          >
            Directory &rarr;
          </Link>
        </div>
      )}

      {/* STAGE 1: EQUIPMENT CATEGORY & MODEL */}
      {activeStage === 1 && (
        <div className="bg-[#FAF8F3] border border-[#D4CDC0] rounded-sm p-6 sm:p-8 space-y-6">
          <div className="pb-4 border-b border-[#E5E0D4] space-y-1">
            <span className="text-[11px] font-mono uppercase text-[#736F66]">
              STAGE 01 // EQUIPMENT IDENTIFICATION
            </span>
            <h2 className="font-serif text-2xl font-bold text-[#141413]">
              What hardware are you evaluating?
            </h2>
            <p className="text-xs text-[#6B675E] font-sans">
              Select the primary hardware category to set component disassembly and trade-in baseline assumptions.
            </p>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {DEVICE_CATEGORIES.map((cat) => {
              const isSelected = categorySlug === cat.slug;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategorySlug(cat.slug)}
                  className={`p-4 border rounded-xs text-left transition-colors flex flex-col justify-between ${
                    isSelected
                      ? "bg-[#1B3B2B] text-[#F7F5EE] border-[#142D21] ring-2 ring-[#1B3B2B]/20"
                      : "bg-[#F7F5EE] text-[#413F3B] border-[#D4CDC0] hover:bg-[#EFECE2]"
                  }`}
                >
                  <div className="space-y-1">
                    <span className="font-serif font-bold text-base block">{cat.name}</span>
                    <span
                      className={`text-[11px] block leading-tight ${
                        isSelected ? "text-[#C1DFDC]" : "text-[#736F66]"
                      }`}
                    >
                      {cat.examples.join(", ")}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Dedicated Phone Resale Callout */}
          {categorySlug === "smartphones-tablets" && (
            <div className="p-4 bg-[#EBF2ED] border border-[#C3D9CB] rounded-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-xs text-[#1B3B2B] animate-fade-in">
              <div className="space-y-0.5">
                <span className="font-bold uppercase tracking-wider block">Selling a Smartphone in Delhi?</span>
                <span className="text-[11px] text-[#2D5A42] block font-sans">
                  Use our guided phone valuation to compare instant doorstep Cashify payouts, Croma exchange vouchers, and Apple Saket trade-in quotes with itemized inspection deductions.
                </span>
              </div>
              <Link
                href="/sell-phone"
                className="px-4 py-2 bg-[#1B3B2B] hover:bg-[#142D21] text-[#F7F5EE] text-[11px] font-mono uppercase tracking-wider rounded-xs flex items-center gap-1.5 shrink-0 transition-colors"
              >
                <span>Instant Phone Valuation</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#C1DFDC]" />
              </Link>
            </div>
          )}

          {/* Specific Model (Optional) */}
          <div className="pt-4 border-t border-[#E5E0D4] space-y-1.5 max-w-md">
            <label className="block text-xs font-mono uppercase text-[#141413] tracking-wider">
              Specific Brand &amp; Model <span className="text-[#8F8A7E] font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={deviceModel}
              onChange={(e) => setDeviceModel(e.target.value)}
              placeholder="e.g. iPhone 12 Pro, ThinkPad T480, Galaxy S21"
              className="w-full text-xs font-mono bg-[#F7F5EE] border border-[#D4CDC0] rounded-xs p-2.5 text-[#141413] placeholder-[#8F8A7E] focus:outline-none focus:border-[#1B3B2B]"
            />
            <p className="text-[10px] text-[#736F66] font-mono">
              Helps determine spare part modularity and OEM buyback kiosk grading.
            </p>
          </div>

          {/* Navigation Action */}
          <div className="pt-6 border-t border-[#E5E0D4] flex justify-end">
            <button
              type="button"
              onClick={() => setActiveStage(2)}
              className="px-6 py-3 bg-[#1B3B2B] hover:bg-[#142D21] text-[#F7F5EE] font-mono text-xs uppercase tracking-wider rounded-sm flex items-center gap-2 transition-colors"
            >
              <span>Continue to Condition Diagnostic</span>
              <ArrowRight className="w-4 h-4 text-[#C1DFDC]" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 2: FUNCTIONAL CONDITION & BATTERY SAFETY */}
      {activeStage === 2 && (
        <div className="bg-[#FAF8F3] border border-[#D4CDC0] rounded-sm p-6 sm:p-8 space-y-6">
          <div className="pb-4 border-b border-[#E5E0D4] space-y-1">
            <span className="text-[11px] font-mono uppercase text-[#736F66]">
              STAGE 02 // CONDITION &amp; PHYSICAL DIAGNOSTIC
            </span>
            <h2 className="font-serif text-2xl font-bold text-[#141413]">
              What is the functional state of the device?
            </h2>
            <p className="text-xs text-[#6B675E] font-sans">
              Be honest about faults. Inflating condition leads to fee deductions or rejection upon counter inspection.
            </p>
          </div>

          {/* Conditions Selection */}
          <div className="space-y-2">
            {CONDITIONS.map((cond) => {
              const isChecked = condition === cond.id;
              const isHazard = cond.id === "unsafe_hazardous";

              return (
                <label
                  key={cond.id}
                  className={`flex items-start gap-3 p-3.5 border rounded-xs cursor-pointer transition-colors text-xs ${
                    isChecked
                      ? isHazard
                        ? "bg-[#FBECE6] border-[#C8532C] text-[#A63C19] ring-2 ring-[#C8532C]/20"
                        : "bg-[#1B3B2B] border-[#142D21] text-[#F7F5EE] ring-2 ring-[#1B3B2B]/20"
                      : isHazard
                      ? "bg-[#FAF8F3] border-[#F2C2B2] text-[#A63C19] hover:bg-[#FBECE6]"
                      : "bg-[#F7F5EE] border-[#D4CDC0] text-[#383632] hover:bg-[#EFECE2]"
                  }`}
                >
                  <input
                    type="radio"
                    name="flow-condition"
                    value={cond.id}
                    checked={isChecked}
                    onChange={() => setCondition(cond.id)}
                    className="mt-0.5"
                  />
                  <div className="space-y-0.5">
                    <span className="block font-semibold text-sm leading-snug">{cond.label}</span>
                    <span
                      className={`block text-xs leading-normal ${
                        isChecked
                          ? isHazard
                            ? "text-[#732B13]"
                            : "text-[#C1DFDC]"
                          : "text-[#736F66]"
                      }`}
                    >
                      {cond.description}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>

          {/* Specific Fault Detail (if minor or major fault) */}
          {(condition === "minor_fault" || condition === "major_fault") && (
            <div className="pt-4 border-t border-[#E5E0D4] space-y-1.5 max-w-md">
              <label className="block text-xs font-mono uppercase text-[#141413] tracking-wider">
                Primary Defect or Symptom <span className="text-[#8F8A7E] font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={specificFault}
                onChange={(e) => setSpecificFault(e.target.value)}
                placeholder="e.g. Cracked outer glass, rapid battery drain, port loose"
                className="w-full text-xs font-mono bg-[#F7F5EE] border border-[#D4CDC0] rounded-xs p-2.5 text-[#141413] placeholder-[#8F8A7E] focus:outline-none focus:border-[#1B3B2B]"
              />
            </div>
          )}

          {/* Navigation Actions */}
          <div className="pt-6 border-t border-[#E5E0D4] flex items-center justify-between">
            <button
              type="button"
              onClick={() => setActiveStage(1)}
              className="px-4 py-2.5 text-xs font-mono uppercase text-[#736F66] hover:text-[#141413] border border-[#D4CDC0] rounded-xs"
            >
              &larr; Back to Category
            </button>
            <button
              type="button"
              onClick={() => setActiveStage(3)}
              className="px-6 py-3 bg-[#1B3B2B] hover:bg-[#142D21] text-[#F7F5EE] font-mono text-xs uppercase tracking-wider rounded-sm flex items-center gap-2 transition-colors"
            >
              <span>Continue to Logistics &amp; Goal</span>
              <ArrowRight className="w-4 h-4 text-[#C1DFDC]" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 3: LOGISTICS (PINCODE) & RECOVERY GOAL */}
      {activeStage === 3 && (
        <div className="bg-[#FAF8F3] border border-[#D4CDC0] rounded-sm p-6 sm:p-8 space-y-6">
          <div className="pb-4 border-b border-[#E5E0D4] space-y-1">
            <span className="text-[11px] font-mono uppercase text-[#736F66]">
              STAGE 03 // GEOGRAPHY &amp; USER OBJECTIVE
            </span>
            <h2 className="font-serif text-2xl font-bold text-[#141413]">
              Where is the hardware, and what is your goal?
            </h2>
            <p className="text-xs text-[#6B675E] font-sans">
              Matches against physical drop-off kiosks and authorised collection hubs in Delhi NCR.
            </p>
          </div>

          {/* Pincode Input */}
          <div className="space-y-1.5 max-w-xs">
            <label className="block text-xs font-mono uppercase text-[#141413] tracking-wider">
              Delhi NCR Pincode <span className="text-[#8F8A7E] font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="e.g. 110001, 110017"
                maxLength={6}
                className="w-full text-xs font-mono bg-[#F7F5EE] border border-[#D4CDC0] rounded-xs p-2.5 pl-8 text-[#141413] placeholder-[#8F8A7E] focus:outline-none focus:border-[#1B3B2B]"
              />
              <MapPin className="w-4 h-4 text-[#736F66] absolute left-2.5 top-3" />
            </div>
            <p className="text-[10px] text-[#736F66] font-mono leading-normal">
              <strong>Strict Non-Inferential Policy:</strong> Matches only against providers with verified physical service areas for this exact pincode.
            </p>
          </div>

          {/* User Recovery Priority */}
          <div className="space-y-2 pt-2 border-t border-[#E5E0D4]">
            <label className="block text-xs font-mono uppercase text-[#141413] tracking-wider">
              Primary Recovery Goal
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
              <button
                type="button"
                onClick={() => setPriority("maximise_money")}
                className={`p-3 border rounded-xs text-left transition-colors ${
                  priority === "maximise_money"
                    ? "bg-[#1B3B2B] text-[#F7F5EE] border-[#142D21]"
                    : "bg-[#F7F5EE] text-[#413F3B] border-[#D4CDC0] hover:bg-[#EFECE2]"
                }`}
              >
                <strong className="block font-semibold">MAXIMISE CASH RETURN</strong>
                <span className="text-[10px] opacity-80">Prioritise highest net currency payout</span>
              </button>
              <button
                type="button"
                onClick={() => setPriority("minimise_effort")}
                className={`p-3 border rounded-xs text-left transition-colors ${
                  priority === "minimise_effort"
                    ? "bg-[#1B3B2B] text-[#F7F5EE] border-[#142D21]"
                    : "bg-[#F7F5EE] text-[#413F3B] border-[#D4CDC0] hover:bg-[#EFECE2]"
                }`}
              >
                <strong className="block font-semibold">MINIMISE TIME &amp; EFFORT</strong>
                <span className="text-[10px] opacity-80">Immediate drop-off or courier pickup</span>
              </button>
              <button
                type="button"
                onClick={() => setPriority("repair_keep")}
                className={`p-3 border rounded-xs text-left transition-colors ${
                  priority === "repair_keep"
                    ? "bg-[#1B3B2B] text-[#F7F5EE] border-[#142D21]"
                    : "bg-[#F7F5EE] text-[#413F3B] border-[#D4CDC0] hover:bg-[#EFECE2]"
                }`}
              >
                <strong className="block font-semibold">REPAIR &amp; RETAIN UTILITY</strong>
                <span className="text-[10px] opacity-80">Restore hardware for personal use</span>
              </button>
              <button
                type="button"
                onClick={() => setPriority("dispose_responsibly")}
                className={`p-3 border rounded-xs text-left transition-colors ${
                  priority === "dispose_responsibly"
                    ? "bg-[#1B3B2B] text-[#F7F5EE] border-[#142D21]"
                    : "bg-[#F7F5EE] text-[#413F3B] border-[#D4CDC0] hover:bg-[#EFECE2]"
                }`}
              >
                <strong className="block font-semibold">DISPOSE RESPONSIBLY</strong>
                <span className="text-[10px] opacity-80">Certified material refining, zero landfill</span>
              </button>
            </div>
          </div>

          {/* Navigation Actions */}
          <div className="pt-6 border-t border-[#E5E0D4] flex items-center justify-between">
            <button
              type="button"
              onClick={() => setActiveStage(2)}
              className="px-4 py-2.5 text-xs font-mono uppercase text-[#736F66] hover:text-[#141413] border border-[#D4CDC0] rounded-xs"
            >
              &larr; Back to Condition
            </button>
            <button
              type="button"
              onClick={() => setActiveStage(4)}
              className="px-6 py-3 bg-[#1B3B2B] hover:bg-[#142D21] text-[#F7F5EE] font-mono text-xs uppercase tracking-wider rounded-sm flex items-center gap-2 transition-colors shadow-sm"
            >
              <span>View Comparative Pathways (6)</span>
              <ArrowRight className="w-4 h-4 text-[#C1DFDC]" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 4: RESULTS / COMPARATIVE DECISION MATRIX */}
      {activeStage === 4 && (
        <div className="space-y-8">
          {/* Active Profile Summary Ledger */}
          <div className="p-4 bg-[#FAF8F3] border border-[#D4CDC0] rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] uppercase text-[#736F66]">DIAGNOSTIC PROFILE:</span>
              <span className="px-2 py-0.5 bg-[#EFECE2] text-[#141413] rounded-xs font-semibold">
                {DEVICE_CATEGORIES.find((c) => c.slug === categorySlug)?.name}
              </span>
              <span className="px-2 py-0.5 bg-[#EFECE2] text-[#141413] rounded-xs font-semibold">
                {CONDITIONS.find((c) => c.id === condition)?.label.split(",")[0]}
              </span>
              {pincode && (
                <span className="px-2 py-0.5 bg-[#E9F3F2] text-[#257A72] border border-[#C1DFDC] rounded-xs font-semibold">
                  PIN: {pincode}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setActiveStage(1)}
              className="text-[#1B3B2B] font-semibold underline hover:text-[#142D21] shrink-0 text-left"
            >
              Modify Parameters &rarr;
            </button>
          </div>

          {/* Hazardous Emergency Banner if Applicable */}
          {evaluation.isHazardous && evaluation.hazardDirectives && (
            <HazardAlertBanner
              headline={evaluation.hazardDirectives.headline}
              stopUseWarning={evaluation.hazardDirectives.stopUseWarning}
              handlingSteps={evaluation.hazardDirectives.handlingSteps}
            />
          )}

          {/* Unmatched Pincode Notice (Honest declaration) */}
          {evaluation.unmatchedPincodeNotice && (
            <div className="bg-[#FAF8F3] border border-[#D4CDC0] rounded-xs p-4 text-xs font-mono text-[#413F3B] flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#736F66] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-[#141413] font-semibold mb-0.5">
                  Notice on Pincode Coverage:
                </strong>
                <span className="leading-relaxed">{evaluation.unmatchedPincodeNotice}</span>
              </div>
            </div>
          )}

          {/* Primary Recommended Option Card Highlight */}
          {primaryPathway && (
            <div className="bg-[#FAF8F3] border-2 border-[#1B3B2B] rounded-sm p-6 sm:p-8 space-y-4 shadow-sm relative">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E5E0D4] font-mono">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#1B3B2B] text-[#F7F5EE] text-[10px] font-bold uppercase tracking-wider rounded-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#C1DFDC]" />
                  OPTIMAL RECOVERY PATHWAY
                </span>
                <span className="text-xs text-[#736F66] uppercase">
                  {primaryPathway.valueDescription}
                </span>
              </div>

              <div className="space-y-2">
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#141413] tracking-tight">
                  {primaryPathway.title}
                </h2>
                <p className="text-xs sm:text-sm text-[#413F3B] leading-relaxed font-sans max-w-3xl">
                  {primaryPathway.eligibilityReason}
                </p>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-[#E5E0D4] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 font-mono text-xs">
                <span className="text-[11px] text-[#736F66]">
                  {primaryPathway.matchedProviders.length > 0
                    ? `Matched with: ${primaryPathway.matchedProviders[0].name}`
                    : "No physical provider registered for this exact pincode."}
                </span>

                <button
                  type="button"
                  disabled={Boolean(isStartingCase)}
                  onClick={() =>
                    handleStartCase(
                      primaryPathway.pathwayId,
                      primaryPathway.matchedProviders[0]?.id
                    )
                  }
                  className="px-5 py-2.5 bg-[#1B3B2B] hover:bg-[#142D21] text-[#F7F5EE] text-xs font-mono uppercase tracking-wider rounded-sm transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <span>
                    {isStartingCase === primaryPathway.pathwayId
                      ? "Initiating Case..."
                      : "Initiate Recovery Case"}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-[#C1DFDC]" />
                </button>
              </div>
            </div>
          )}

          {caseError && (
            <div className="bg-[#FBECE6] border border-[#F2C2B2] text-[#A63C19] rounded-xs p-4 text-xs font-mono flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-[#C8532C] shrink-0 mt-0.5" />
              <span>{caseError}</span>
            </div>
          )}

          {/* Tab Filter Header for All 6 Pathways */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#DFD9CD]">
            <div className="space-y-0.5">
              <h3 className="font-serif text-xl font-bold text-[#141413] tracking-tight">
                Full 6-Pathway Trade-off Ledger
              </h3>
              <p className="text-xs text-[#736F66] font-mono">
                Deterministic eligibility evaluation based on hardware condition and provider records.
              </p>
            </div>

            <div className="flex items-center gap-1 bg-[#EFECE2] p-1 rounded-xs font-mono text-xs border border-[#D4CDC0]">
              <button
                type="button"
                onClick={() => setFilterView("all")}
                className={`px-3 py-1 rounded-xs transition-colors ${
                  filterView === "all"
                    ? "bg-[#FAF8F3] text-[#141413] font-semibold border border-[#D4CDC0]"
                    : "text-[#6B675E] hover:text-[#141413]"
                }`}
              >
                All (6)
              </button>
              <button
                type="button"
                onClick={() => setFilterView("eligible")}
                className={`px-3 py-1 rounded-xs transition-colors ${
                  filterView === "eligible"
                    ? "bg-[#FAF8F3] text-[#141413] font-semibold border border-[#D4CDC0]"
                    : "text-[#6B675E] hover:text-[#141413]"
                }`}
              >
                Viable Only
              </button>
              <button
                type="button"
                onClick={() => setFilterView("excluded")}
                className={`px-3 py-1 rounded-xs transition-colors ${
                  filterView === "excluded"
                    ? "bg-[#FAF8F3] text-[#141413] font-semibold border border-[#D4CDC0]"
                    : "text-[#6B675E] hover:text-[#141413]"
                }`}
              >
                Excluded
              </button>
            </div>
          </div>

          {/* Pathways List */}
          <div className="space-y-4">
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

          {/* Evidence Standards & Integrity Footnote */}
          <div className="bg-[#FAF8F3] rounded-sm p-6 border border-[#D4CDC0] text-xs font-mono text-[#6B675E] space-y-2 leading-relaxed">
            <h4 className="font-bold text-[#141413] uppercase tracking-wider text-[11px] flex items-center gap-1.5 pb-2 border-b border-[#E5E0D4]">
              <ShieldCheck className="w-4 h-4 text-[#1B3B2B]" />
              Evidence Standards &amp; Uncertainty Declaration:
            </h4>
            <p>
              &bull; <strong>No Invented Valuations:</strong> We do not publish artificial cash estimates or guaranteed pricing. Second-hand values and repair costs fluctuate with component markets and physical diagnostic grading.
            </p>
            <p>
              &bull; <strong>Verified Provider Matching:</strong> Listings reflect only approved organizations with documented evidence. Unchecked providers are not recommended.
            </p>
            <p>
              &bull; <strong>Non-Inferential Coverage:</strong> We never assume that a provider serves your pincode merely because it operates in the same state.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
