"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  PhoneBrand,
  PhoneCondition,
  PhoneAccessory,
  ProviderResaleOffer,
  ResaleRankingMode,
} from "@/lib/resale/types";
import {
  PHONE_BRANDS,
  PHONE_CATALOG,
  CONDITION_DEFINITIONS,
  COMMON_PHONE_FAULTS,
  ACCESSORY_VALUES,
  isDelhiPincode,
  getDelhiLocalityName,
} from "@/lib/resale/catalog";
import { evaluatePhoneResaleOffers } from "@/lib/resale/engine";
import { calculateRepairVsSell } from "@/lib/resale/repair-vs-sell";
import { RepairVsSellCard } from "./RepairVsSellCard";
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Calendar,
  ExternalLink,
  RotateCcw,
  MapPin,
  ArrowUpRight,
  Wrench,
  Search,
  ChevronDown,
  ChevronUp,
  Info,
  Truck,
  Check,
  ShieldCheck,
} from "lucide-react";

export function PhoneResaleWorkflow() {
  const router = useRouter();

  // Wizard Stage: 1 = Phone Specification, 2 = Condition & Faults, 3 = Accessories & Location, 4 = Offers Comparison
  const [activeStage, setActiveStage] = useState<1 | 2 | 3 | 4>(1);

  // User Selections
  const [selectedBrand, setSelectedBrand] = useState<PhoneBrand>("Apple");
  const [selectedModelId, setSelectedModelId] = useState<string>("apple-iphone-13");
  const [selectedStorage, setSelectedStorage] = useState<string>("128GB");
  const [selectedCondition, setSelectedCondition] = useState<PhoneCondition>("good");
  const [selectedFaults, setSelectedFaults] = useState<string[]>([]);
  const [selectedAccessories, setSelectedAccessories] = useState<PhoneAccessory[]>([
    "valid_bill",
    "box",
  ]);
  const [pincode, setPincode] = useState<string>("110001");
  const [rankingMode, setRankingMode] = useState<ResaleRankingMode>("highest_cash");
  const [stage4Tab, setStage4Tab] = useState<"offers" | "repair_vs_sell">("offers");

  // Search query for model discovery
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Expandable state for offer cards & calculation explanation
  const [expandedOffers, setExpandedOffers] = useState<Record<string, boolean>>({});
  const [showFormulaBreakdown, setShowFormulaBreakdown] = useState<boolean>(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const toggleOfferDisclosure = (key: string) => {
    setExpandedOffers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Filter models by selected brand OR global search
  const availableModels = useMemo(() => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return PHONE_CATALOG.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.brand.toLowerCase().includes(q) ||
          m.id.toLowerCase().includes(q)
      );
    }
    return PHONE_CATALOG.filter((m) => m.brand === selectedBrand);
  }, [selectedBrand, searchQuery]);

  const activeModel = useMemo(() => {
    return (
      availableModels.find((m) => m.id === selectedModelId) ||
      availableModels[0] ||
      PHONE_CATALOG[0]
    );
  }, [availableModels, selectedModelId]);

  // Compute live valuation & ranked provider offers
  const valuation = useMemo(() => {
    return evaluatePhoneResaleOffers({
      brand: selectedBrand,
      modelId: activeModel.id,
      modelName: activeModel.name,
      storage: selectedStorage,
      condition: selectedCondition,
      selectedFaults,
      accessories: selectedAccessories,
      pincode,
      rankingMode,
    });
  }, [
    selectedBrand,
    activeModel,
    selectedStorage,
    selectedCondition,
    selectedFaults,
    selectedAccessories,
    pincode,
    rankingMode,
  ]);

  // Compute live Repair vs. Sell economic comparison
  const repairVsSellAnalysis = useMemo(() => {
    return calculateRepairVsSell({
      brand: selectedBrand,
      modelId: activeModel.id,
      modelName: activeModel.name,
      storage: selectedStorage,
      condition: selectedCondition,
      selectedFaults,
      accessories: selectedAccessories,
      pincode,
    });
  }, [
    selectedBrand,
    activeModel,
    selectedStorage,
    selectedCondition,
    selectedFaults,
    selectedAccessories,
    pincode,
  ]);

  // Handle Brand Change
  const handleBrandChange = (brand: PhoneBrand) => {
    setSelectedBrand(brand);
    setSearchQuery("");
    const firstModel = PHONE_CATALOG.find((m) => m.brand === brand);
    if (firstModel) {
      setSelectedModelId(firstModel.id);
      setSelectedStorage(firstModel.storageOptions[0] || "128GB");
    }
  };

  // Handle Model Change
  const handleModelChange = (modelId: string) => {
    setSelectedModelId(modelId);
    const found = PHONE_CATALOG.find((m) => m.id === modelId);
    if (found) {
      setSelectedBrand(found.brand);
      if (!found.storageOptions.includes(selectedStorage)) {
        setSelectedStorage(found.storageOptions[0] || "128GB");
      }
    }
  };

  // Toggle Faults
  const toggleFault = (faultId: string) => {
    setSelectedFaults((prev) =>
      prev.includes(faultId) ? prev.filter((id) => id !== faultId) : [...prev, faultId]
    );
  };

  // Toggle Accessories
  const toggleAccessory = (acc: PhoneAccessory) => {
    setSelectedAccessories((prev) =>
      prev.includes(acc) ? prev.filter((a) => a !== acc) : [...prev, acc]
    );
  };

  // Initiate recovery case for selected offer
  const handleSelectOffer = async (offer: ProviderResaleOffer) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const pathwayId =
        offer.offerType === "store_exchange" || offer.offerType === "apple_trade_in"
          ? "exchange"
          : offer.offerType === "certified_recycle"
          ? "recycle"
          : "sell-cash";

      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pathwayId,
          providerId: offer.providerId || null,
          financialValueInr: offer.estimatedNetPayout,
          userNotes: `Phone resale initiated: Selected offer from ${offer.providerName} for ₹${offer.estimatedNetPayout.toLocaleString()} (${offer.paymentMethod}). Pincode: ${pincode}.`,
          assessmentInput: {
            categorySlug: "smartphones-tablets",
            deviceModel: `${selectedBrand} ${activeModel.name} (${selectedStorage})`,
            condition:
              selectedCondition === "hazardous"
                ? "unsafe_hazardous"
                : selectedCondition === "major_fault"
                ? "major_fault"
                : selectedCondition === "faulty"
                ? "minor_fault"
                : selectedCondition === "fair" || selectedCondition === "good"
                ? "working_recent"
                : "working_recent",
            specificFault:
              selectedFaults.length > 0
                ? selectedFaults.join(", ")
                : "No major faults declared.",
            pincode: pincode.trim(),
            priority: "maximise_money",
            resalePayload: {
              brand: selectedBrand,
              modelId: activeModel.id,
              storage: selectedStorage,
              condition: selectedCondition,
              selectedFaults,
              accessories: selectedAccessories,
              selectedOffer: offer,
            },
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to initiate phone resale recovery case");
      }

      // Route immediately to Case Detail Dossier
      router.push(`/cases/${data.case.id}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to initiate recovery case");
      setIsSubmitting(false);
    }
  };

  const isDelhi = isDelhiPincode(pincode);
  const locality = isDelhi ? getDelhiLocalityName(pincode) : null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#E5E0D8]">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#FAF8F3] border border-[#DFD9CD] rounded-xs text-[11px] font-mono uppercase tracking-wider text-[#5A574F]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1B3B2B]" />
            <span>PHONE RESALE &amp; VALUATION REGISTRY · DELHI NCR</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#141413] tracking-tight leading-tight">
            Sell Your Phone for the Best Realistic Price
          </h1>
          <p className="text-sm sm:text-base text-[#5A574F] font-sans max-w-2xl leading-relaxed">
            Compare verified doorstep cash buybacks, store vouchers, and official trade-in schedules.
            We factor in actual inspection deductions so you don&apos;t face surprise price drops.
          </p>
        </div>

        {/* Live Top Offer Teaser if available */}
        {!valuation.isHazardous && valuation.bestRealisticOffer && (
          <div className="bg-[#FAF8F3] border border-[#D5D0C5] rounded-sm p-4 sm:text-right shrink-0 font-mono shadow-xs">
            <span className="text-[10px] text-[#736F66] uppercase tracking-wider block">
              Top Verified Offer
            </span>
            <div className="flex sm:justify-end items-baseline gap-1 mt-0.5">
              <span className="text-xs text-[#141413]">₹</span>
              <strong className="text-2xl sm:text-3xl font-serif font-bold text-[#141413]">
                {valuation.bestRealisticOffer.estimatedNetPayout.toLocaleString()}
              </strong>
            </div>
            <span className="text-[11px] text-[#1B3B2B] font-semibold block mt-0.5">
              {valuation.bestRealisticOffer.providerName.split("(")[0].trim()} ·{" "}
              {valuation.bestRealisticOffer.financialType === "voucher" ? "Store Voucher" : "Instant Cash"}
            </span>
          </div>
        )}
      </div>

      {/* 4-Stage Progressive Stepper */}
      <nav aria-label="Assessment Progress" className="bg-[#FAF9F5] p-1.5 sm:p-2 rounded-sm border border-[#E5E0D8]">
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 font-mono text-xs">
          {[
            { num: 1, label: "Phone Model", short: "Model" },
            { num: 2, label: "Condition & Faults", short: "Condition" },
            { num: 3, label: "Accessories & PIN", short: "Logistics" },
            { num: 4, label: "Compare Offers", short: "Offers" },
          ].map((stage) => {
            const isActive = activeStage === stage.num;
            const isCompleted = activeStage > stage.num;
            return (
              <button
                key={stage.num}
                type="button"
                onClick={() => setActiveStage(stage.num as 1 | 2 | 3 | 4)}
                className={`p-2.5 sm:p-3 text-left rounded-xs transition-all flex flex-col justify-between min-h-[56px] ${
                  isActive
                    ? "bg-[#1B3B2B] text-white shadow-xs font-semibold"
                    : isCompleted
                    ? "bg-white text-[#141413] border border-[#C6DFD0] hover:bg-[#EDF5F0]"
                    : "bg-transparent text-[#736F66] hover:bg-white/60 hover:text-[#141413]"
                }`}
              >
                <div className="flex items-center justify-between text-[10px] tracking-wider uppercase mb-1">
                  <span className={isActive ? "text-[#C1DFDC]" : "text-[#8E8B82]"}>
                    0{stage.num}
                  </span>
                  {isCompleted && <Check className="w-3.5 h-3.5 text-[#1B3B2B]" />}
                </div>
                <span className="text-xs sm:text-[13px] truncate leading-tight font-sans sm:font-mono">
                  <span className="hidden sm:inline">{stage.label}</span>
                  <span className="sm:hidden">{stage.short}</span>
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Submission Error Banner */}
      {submitError && (
        <div className="p-4 bg-[#FFF9F5] border border-[#F3D1C2] text-[#C8532C] text-xs font-mono rounded-sm flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold">Case Creation Notice:</strong>
            <p className="font-sans text-xs mt-0.5">{submitError}</p>
          </div>
        </div>
      )}

      {/* STAGE 1: PHONE DISCOVERY & SPECIFICATION */}
      {activeStage === 1 && (
        <div className="bg-white border border-[#E5E0D8] rounded-sm p-6 sm:p-8 space-y-7 shadow-xs">
          <div className="space-y-1">
            <h2 className="font-serif text-2xl font-bold text-[#141413]">
              01 / Identify Your Exact Smartphone
            </h2>
            <p className="text-xs sm:text-sm text-[#5A574F] font-sans">
              Choose your brand and model. Resale pricing varies heavily by processor generation and NAND storage size.
            </p>
          </div>

          {/* Model Search Typeahead */}
          <div className="space-y-2">
            <label htmlFor="model-search" className="block text-xs font-mono uppercase tracking-wider text-[#5A574F]">
              Quick Search Model:
            </label>
            <div className="relative">
              <input
                id="model-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type to find e.g. iPhone 13, Galaxy S24, OnePlus 11..."
                className="w-full text-sm font-sans bg-[#FAF9F5] border border-[#D5D0C5] rounded-sm p-3 pl-10 text-[#141413] placeholder-[#8E8B82] focus:outline-none focus:border-[#1B3B2B] focus:ring-1 focus:ring-[#1B3B2B]"
              />
              <Search className="w-4 h-4 text-[#8E8B82] absolute left-3.5 top-3.5" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-3 text-xs font-mono text-[#8E8B82] hover:text-[#141413]"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Brand Filter Tabs (Shown when not searching) */}
          {!searchQuery && (
            <div className="space-y-2">
              <span className="block text-xs font-mono uppercase tracking-wider text-[#5A574F]">
                Filter by Brand:
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 font-mono text-xs">
                {PHONE_BRANDS.map((brand) => (
                  <button
                    key={brand}
                    type="button"
                    onClick={() => handleBrandChange(brand)}
                    className={`py-2.5 px-3 text-center border rounded-sm font-semibold transition-all min-h-[44px] flex items-center justify-center ${
                      selectedBrand === brand
                        ? "bg-[#1B3B2B] text-white border-[#1B3B2B] shadow-xs"
                        : "bg-[#FAF9F5] text-[#5A574F] border-[#E5E0D8] hover:border-[#141413] hover:text-[#141413]"
                    }`}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Available Models Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-[#5A574F]">
                {searchQuery ? `Matching Models (${availableModels.length}):` : `${selectedBrand} Models:`}
              </span>
              <span className="text-[11px] font-mono text-[#8E8B82]">Tap to select</span>
            </div>

            {availableModels.length === 0 ? (
              <div className="p-8 text-center bg-[#FAF9F5] border border-dashed border-[#D5D0C5] rounded-sm text-xs font-mono text-[#5A574F]">
                No models match &quot;{searchQuery}&quot;. Clear search to browse by brand catalog.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 font-mono text-xs">
                {availableModels.map((m) => {
                  const isSelected = activeModel.id === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleModelChange(m.id)}
                      className={`p-3.5 text-left border rounded-sm transition-all flex items-center justify-between min-h-[52px] ${
                        isSelected
                          ? "bg-[#FAF8F3] border-[#1B3B2B] ring-2 ring-[#1B3B2B]/20 text-[#141413] shadow-xs"
                          : "bg-[#FAF9F5] text-[#141413] border-[#E5E0D8] hover:border-[#141413]"
                      }`}
                    >
                      <div className="space-y-0.5">
                        <strong className="block text-xs font-semibold">{m.name}</strong>
                        <span className="text-[10px] text-[#736F66]">
                          {m.brand} · {m.releaseYear}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-[#1B3B2B] text-white flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Storage Capacity Selector */}
          <div className="space-y-2 pt-3 border-t border-[#E5E0D8]">
            <span className="block text-xs font-mono uppercase tracking-wider text-[#5A574F]">
              Storage Capacity ({activeModel.name}):
            </span>
            <div className="flex flex-wrap gap-2 font-mono text-xs">
              {activeModel.storageOptions.map((storage) => {
                const isSelected = selectedStorage === storage;
                return (
                  <button
                    key={storage}
                    type="button"
                    onClick={() => setSelectedStorage(storage)}
                    className={`px-4 py-2.5 border rounded-sm font-semibold transition-all min-h-[44px] ${
                      isSelected
                        ? "bg-[#141413] text-white border-[#141413] shadow-xs"
                        : "bg-[#FAF9F5] text-[#5A574F] border-[#E5E0D8] hover:border-[#141413] hover:text-[#141413]"
                    }`}
                  >
                    {storage}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Forward Button */}
          <div className="pt-4 border-t border-[#E5E0D8] flex justify-end">
            <button
              type="button"
              onClick={() => setActiveStage(2)}
              className="w-full sm:w-auto px-6 py-3.5 bg-[#1B3B2B] hover:bg-[#132A1F] text-white font-mono uppercase tracking-wider text-xs font-semibold rounded-sm transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <span>Continue to Condition Diagnostic</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 2: CONDITION & HARDWARE FAULTS */}
      {activeStage === 2 && (
        <div className="bg-white border border-[#E5E0D8] rounded-sm p-6 sm:p-8 space-y-7 shadow-xs">
          <div className="space-y-1">
            <h2 className="font-serif text-2xl font-bold text-[#141413]">
              02 / Device Condition &amp; Hardware Faults
            </h2>
            <p className="text-xs sm:text-sm text-[#5A574F] font-sans">
              Disclose realistic cosmetic and functional condition. Honest self-diagnosis guarantees that your locked quote matches what the technician offers during doorstep inspection.
            </p>
          </div>

          {/* Condition Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(
              Object.entries(CONDITION_DEFINITIONS) as [
                PhoneCondition,
                (typeof CONDITION_DEFINITIONS)[PhoneCondition]
              ][]
            ).map(([condKey, condDef]) => {
              const isSelected = selectedCondition === condKey;
              return (
                <button
                  key={condKey}
                  type="button"
                  onClick={() => setSelectedCondition(condKey)}
                  className={`p-4 border rounded-sm text-left transition-all relative flex flex-col justify-between ${
                    isSelected
                      ? "bg-[#FAF8F3] border-[#1B3B2B] ring-2 ring-[#1B3B2B]/20 shadow-xs"
                      : "bg-[#FAF9F5] border-[#E5E0D8] hover:border-[#BDB9AE]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5 font-mono text-[11px]">
                      <span className="font-bold uppercase tracking-wider text-[#141413]">
                        {condDef.label}
                      </span>
                      <span className="text-[10px] text-[#736F66]">
                        {condDef.factor > 0 ? `${Math.round(condDef.factor * 100)}% base` : "Safety lock"}
                      </span>
                    </div>
                    <p className="text-xs text-[#5A574F] leading-relaxed font-sans">
                      {condDef.description}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-[#EFECE2] flex items-center justify-between text-[10px] font-mono">
                    <span className="text-[#8E8B82]">Inspection grading</span>
                    {isSelected && <span className="text-[#1B3B2B] font-bold">Selected ✓</span>}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Hazardous Warning Banner */}
          {selectedCondition === "hazardous" && (
            <div className="p-4 bg-[#FFF0E8] border-2 border-[#C8532C] rounded-sm text-xs text-[#141413] space-y-2 font-mono">
              <div className="flex items-center gap-2 font-bold text-[#C8532C]">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>THERMAL &amp; CHEMICAL HAZARD PROTOCOL ACTIVE</span>
              </div>
              <p className="font-sans text-[#5A574F] leading-relaxed">
                Swollen lithium cells are legally barred from courier pickup and commercial resale due to explosion hazards.
                The engine will direct you to certified safe environmental isolation.
              </p>
            </div>
          )}

          {/* Specific Faults Checklist */}
          {selectedCondition !== "flawless" && selectedCondition !== "hazardous" && (
            <div className="space-y-3 pt-3 border-t border-[#E5E0D8]">
              <div className="flex items-center justify-between">
                <span className="block text-xs font-mono uppercase tracking-wider text-[#5A574F]">
                  Specific Faults Present (Check all that apply):
                </span>
                <span className="text-[11px] font-mono text-[#8E8B82]">Deductions pre-calculated</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono text-xs">
                {COMMON_PHONE_FAULTS.map((fault) => {
                  const isChecked = selectedFaults.includes(fault.id);
                  return (
                    <button
                      key={fault.id}
                      type="button"
                      onClick={() => toggleFault(fault.id)}
                      className={`p-3.5 border rounded-sm text-left transition-all flex items-start justify-between gap-3 min-h-[52px] ${
                        isChecked
                          ? "bg-[#FFF9F5] border-[#C8532C] text-[#141413] shadow-2xs"
                          : "bg-[#FAF9F5] border-[#E5E0D8] text-[#5A574F] hover:border-[#141413]"
                      }`}
                    >
                      <div className="space-y-0.5">
                        <strong className="block font-semibold text-xs text-[#141413]">
                          {fault.label}
                        </strong>
                        <span className="text-[11px] text-[#736F66] font-sans block leading-normal">
                          {fault.description}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-xs shrink-0 ${
                          isChecked
                            ? "bg-[#C8532C] text-white"
                            : "bg-[#E5E0D8] text-[#5A574F]"
                        }`}
                      >
                        -₹{fault.deductionAmount.toLocaleString()}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Repair vs Sell preview hint if faults selected */}
              {selectedFaults.length > 0 && (
                <div className="p-3.5 bg-[#FAF8F3] border border-[#D5D0C5] rounded-sm text-xs font-mono flex items-start gap-2.5">
                  <Wrench className="w-4 h-4 text-[#257A72] shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <strong className="text-[#141413] block font-bold">
                      Repair vs. Sell Economic Comparison Available:
                    </strong>
                    <p className="text-[#5A574F] font-sans text-xs leading-relaxed">
                      You have selected {selectedFaults.length} hardware fault{selectedFaults.length > 1 ? "s" : ""}.
                      In Step 04, our transparent comparison matrix will evaluate whether fixing these faults in Delhi before selling produces a higher net cash return.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Stepper Buttons */}
          <div className="pt-4 border-t border-[#E5E0D8] flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setActiveStage(1)}
              className="px-4 py-2.5 border border-[#E5E0D8] bg-[#FAF9F5] hover:bg-white text-xs font-mono text-[#5A574F] rounded-sm transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Model</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveStage(3)}
              className="px-6 py-3.5 bg-[#1B3B2B] hover:bg-[#132A1F] text-white font-mono uppercase tracking-wider text-xs font-semibold rounded-sm transition-colors flex items-center gap-2 shadow-xs"
            >
              <span>Continue to Accessories &amp; Pincode</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 3: ACCESSORIES & LOCATION PINCODE */}
      {activeStage === 3 && (
        <div className="bg-white border border-[#E5E0D8] rounded-sm p-6 sm:p-8 space-y-7 shadow-xs">
          <div className="space-y-1">
            <h2 className="font-serif text-2xl font-bold text-[#141413]">
              03 / Original Accessories &amp; Service Pincode
            </h2>
            <p className="text-xs sm:text-sm text-[#5A574F] font-sans">
              Providing original purchase credentials increases payout. Enter your Delhi pincode to verify free doorstep technician inspection.
            </p>
          </div>

          {/* Accessories Checklist */}
          <div className="space-y-3">
            <span className="block text-xs font-mono uppercase tracking-wider text-[#5A574F]">
              Included Original Accessories:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              {(
                Object.entries(ACCESSORY_VALUES) as [
                  PhoneAccessory,
                  (typeof ACCESSORY_VALUES)[PhoneAccessory]
                ][]
              ).map(([accKey, accDef]) => {
                const isChecked = selectedAccessories.includes(accKey);
                return (
                  <button
                    key={accKey}
                    type="button"
                    onClick={() => toggleAccessory(accKey)}
                    className={`p-4 border rounded-sm text-left transition-all flex flex-col justify-between min-h-[72px] ${
                      isChecked
                        ? "bg-[#EDF5F0] border-[#1B3B2B] text-[#141413] shadow-2xs"
                        : "bg-[#FAF9F5] border-[#E5E0D8] text-[#5A574F] hover:border-[#141413]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <strong className="font-semibold text-xs text-[#141413]">{accDef.label}</strong>
                        <span className="text-[10px] font-bold text-[#1B3B2B] bg-[#C6DFD0] px-1.5 py-0.5 rounded-xs">
                          +₹{accDef.bonusAmount}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#5A574F] font-sans leading-normal">{accDef.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Location / Pincode Section */}
          <div className="space-y-3 pt-3 border-t border-[#E5E0D8]">
            <label htmlFor="pincode-input" className="block text-xs font-mono uppercase tracking-wider text-[#5A574F]">
              Delhi Service Pincode (Doorstep Pickup Verification):
            </label>
            <div className="max-w-md space-y-2">
              <div className="relative">
                <input
                  id="pincode-input"
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                  placeholder="e.g. 110001, 110017, 110019"
                  className="w-full text-sm font-mono bg-[#FAF9F5] border border-[#D5D0C5] rounded-sm p-3 pl-9 text-[#141413] focus:outline-none focus:border-[#1B3B2B] focus:ring-1 focus:ring-[#1B3B2B]"
                />
                <MapPin className="w-4 h-4 text-[#8E8B82] absolute left-3 top-3.5" />
              </div>

              {/* Pincode Verification Feedback */}
              {pincode.length === 6 && (
                <div
                  className={`p-3 rounded-sm text-xs font-mono border ${
                    isDelhi
                      ? "bg-[#EDF5F0] border-[#C6DFD0] text-[#1B3B2B]"
                      : "bg-[#FFF9F5] border-[#F3D1C2] text-[#C8532C]"
                  }`}
                >
                  {isDelhi ? (
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#1B3B2B]" />
                      <span>
                        <strong>Delhi Pilot Covered:</strong> {locality || "Documented Delhi NCT Area"} — Free doorstep technician pickup available.
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#C8532C]" />
                      <span>
                        <strong>Non-Delhi Pincode:</strong> Pincode is outside Delhi pilot boundary. In-store kiosk drop-off available in Delhi, but doorstep courier is unconfirmed.
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Stepper Buttons */}
          <div className="pt-4 border-t border-[#E5E0D8] flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setActiveStage(2)}
              className="px-4 py-2.5 border border-[#E5E0D8] bg-[#FAF9F5] hover:bg-white text-xs font-mono text-[#5A574F] rounded-sm transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Condition</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveStage(4)}
              className="px-6 py-3.5 bg-[#1B3B2B] hover:bg-[#132A1F] text-white font-mono uppercase tracking-wider text-xs font-semibold rounded-sm transition-colors flex items-center gap-2 shadow-xs"
            >
              <span>View Ranked Resale Offers</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 4: LIVE PROVIDER OFFER COMPARISON & DECISION SCREEN */}
      {activeStage === 4 && (
        <div className="space-y-6">
          {/* Top-Level Assessed Phone Dossier Banner */}
          <div className="bg-white border border-[#E5E0D8] rounded-sm p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E0D8]">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#8E8B82] block">
                  Assessed Hardware Dossier
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#141413]">
                  {valuation.assessmentSummary.deviceTitle}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs font-mono text-[#5A574F]">
                  <span className="px-2 py-0.5 bg-[#FAF9F5] border border-[#E5E0D8] rounded-xs font-semibold text-[#141413]">
                    {valuation.assessmentSummary.conditionLabel}
                  </span>
                  <span>&bull;</span>
                  <span>Location: <strong className="text-[#141413]">{locality || pincode || "Delhi NCT"}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center">
                {repairVsSellAnalysis.hasFaultsToRepair && (
                  <button
                    type="button"
                    onClick={() => setStage4Tab(stage4Tab === "repair_vs_sell" ? "offers" : "repair_vs_sell")}
                    className="inline-flex items-center gap-1.5 font-mono text-xs text-[#257A72] bg-[#E9F3F2] px-3 py-1.5 rounded-sm border border-[#C1DFDC] hover:bg-[#D5EAE8] transition-colors"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>{stage4Tab === "repair_vs_sell" ? "Show Offers" : "Repair vs. Sell"}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setActiveStage(1)}
                  className="inline-flex items-center gap-1.5 font-mono text-xs text-[#1B3B2B] hover:underline px-2 py-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Edit Diagnostic</span>
                </button>
              </div>
            </div>

            {/* Baseline Overview & Transparent Calculation Accordion */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-[#736F66]">Net Realistic Baseline:</span>
                <strong className="text-base text-[#1B3B2B] font-bold">
                  ₹{valuation.assessmentSummary.estimatedNetBaseline.toLocaleString()}
                </strong>
                <span className="text-[11px] text-[#8E8B82] hidden md:inline">
                  (Pre-factored deductions for declared faults)
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowFormulaBreakdown(!showFormulaBreakdown)}
                className="inline-flex items-center gap-1 text-[11px] text-[#5A574F] hover:text-[#141413] underline self-start sm:self-auto"
              >
                <span>{showFormulaBreakdown ? "Hide formula calculation" : "How this baseline is calculated"}</span>
                {showFormulaBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Collapsible Formula Breakdown */}
            {showFormulaBreakdown && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-3 border-t border-[#E5E0D8] font-mono text-xs">
                <div className="bg-[#FAF9F5] p-2.5 rounded-xs border border-[#E5E0D8]">
                  <span className="text-[10px] text-[#8E8B82] uppercase block">Base Price</span>
                  <strong className="text-xs text-[#141413]">₹{valuation.assessmentSummary.basePrice.toLocaleString()}</strong>
                </div>
                <div className="bg-[#FAF9F5] p-2.5 rounded-xs border border-[#E5E0D8]">
                  <span className="text-[10px] text-[#8E8B82] uppercase block">Condition Multiplier</span>
                  <strong className="text-xs text-[#141413]">{Math.round(valuation.assessmentSummary.conditionFactor * 100)}%</strong>
                </div>
                <div className="bg-[#FAF9F5] p-2.5 rounded-xs border border-[#E5E0D8]">
                  <span className="text-[10px] text-[#8E8B82] uppercase block">Fault Deductions</span>
                  <strong className="text-xs text-[#C8532C]">-₹{valuation.assessmentSummary.faultDeductionTotal.toLocaleString()}</strong>
                </div>
                <div className="bg-[#FAF9F5] p-2.5 rounded-xs border border-[#E5E0D8]">
                  <span className="text-[10px] text-[#8E8B82] uppercase block">Accessories</span>
                  <strong className="text-xs text-[#1B3B2B]">+₹{valuation.assessmentSummary.accessoryBonusTotal.toLocaleString()}</strong>
                </div>
                <div className="bg-[#EDF5F0] p-2.5 rounded-xs border border-[#C6DFD0] col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-[#1B3B2B] uppercase font-bold block">Baseline</span>
                  <strong className="text-sm text-[#1B3B2B]">₹{valuation.assessmentSummary.estimatedNetBaseline.toLocaleString()}</strong>
                </div>
              </div>
            )}
          </div>

          {/* Hazardous Safety Callout if Applicable */}
          {valuation.isHazardous && valuation.hazardDirective && (
            <div className="bg-[#FFF0E8] border-2 border-[#C8532C] rounded-sm p-6 sm:p-7 space-y-3 shadow-xs">
              <div className="flex items-center gap-2 font-mono text-sm font-bold text-[#C8532C]">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>{valuation.hazardDirective.headline}</span>
              </div>
              <p className="text-xs sm:text-sm text-[#141413] leading-relaxed font-sans">
                {valuation.hazardDirective.warningText}
              </p>
              <div className="space-y-1 text-xs font-mono text-[#5A574F]">
                {valuation.hazardDirective.handlingSteps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-[#C8532C] font-bold">&bull;</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sub-Navigation Tabs: Offers vs Repair-vs-Sell Matrix */}
          <div className="flex border-b border-[#E5E0D8] space-x-2">
            <button
              type="button"
              onClick={() => setStage4Tab("offers")}
              className={`pb-3 px-4 text-xs font-mono uppercase tracking-wider font-semibold border-b-2 transition-all flex items-center gap-2 ${
                stage4Tab === "offers"
                  ? "border-[#1B3B2B] text-[#1B3B2B]"
                  : "border-transparent text-[#736F66] hover:text-[#141413]"
              }`}
            >
              <span>Ranked Resale Offers ({valuation.offers.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setStage4Tab("repair_vs_sell")}
              className={`pb-3 px-4 text-xs font-mono uppercase tracking-wider font-semibold border-b-2 transition-all flex items-center gap-2 ${
                stage4Tab === "repair_vs_sell"
                  ? "border-[#1B3B2B] text-[#1B3B2B]"
                  : "border-transparent text-[#736F66] hover:text-[#141413]"
              }`}
            >
              <Wrench className="w-3.5 h-3.5 text-[#257A72]" />
              <span>Repair vs. Sell Matrix</span>
              {repairVsSellAnalysis.hasFaultsToRepair && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-xs font-mono font-bold ${
                    repairVsSellAnalysis.economics.isRepairEconomicallyBeneficial
                      ? "bg-[#EDF5F0] text-[#1B3B2B]"
                      : "bg-[#FAF9F5] text-[#8C5E28]"
                  }`}
                >
                  {repairVsSellAnalysis.economics.isRepairEconomicallyBeneficial ? "+Profitable" : "Evaluated"}
                </span>
              )}
            </button>
          </div>

          {/* TAB 1: REPAIR VS SELL MATRIX */}
          {stage4Tab === "repair_vs_sell" && (
            <RepairVsSellCard
              analysis={repairVsSellAnalysis}
              onProceedToResale={() => setStage4Tab("offers")}
            />
          )}

          {/* TAB 2: RANKED RESALE OFFERS */}
          {stage4Tab === "offers" && (
            <div className="space-y-5">
              {/* Filter & Sorting Segmented Control Bar */}
              <div className="bg-white border border-[#E5E0D8] rounded-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div>
                  <span className="text-[11px] font-mono text-[#8E8B82] uppercase tracking-wider block">
                    Sorting Rationale:
                  </span>
                  <span className="text-xs font-mono text-[#141413] font-medium">
                    {valuation.rankingExplanation}
                  </span>
                </div>

                <div className="flex items-center gap-1 bg-[#FAF9F5] p-1 rounded-sm border border-[#E5E0D8] self-start sm:self-auto font-mono text-xs">
                  <button
                    type="button"
                    onClick={() => setRankingMode("highest_cash")}
                    className={`px-3 py-1.5 rounded-xs transition-colors ${
                      rankingMode === "highest_cash"
                        ? "bg-[#1B3B2B] text-white font-semibold shadow-xs"
                        : "text-[#5A574F] hover:text-[#141413]"
                    }`}
                  >
                    Highest Cash
                  </button>
                  <button
                    type="button"
                    onClick={() => setRankingMode("most_convenient")}
                    className={`px-3 py-1.5 rounded-xs transition-colors ${
                      rankingMode === "most_convenient"
                        ? "bg-[#1B3B2B] text-white font-semibold shadow-xs"
                        : "text-[#5A574F] hover:text-[#141413]"
                    }`}
                  >
                    Most Convenient
                  </button>
                  <button
                    type="button"
                    onClick={() => setRankingMode("most_certain")}
                    className={`px-3 py-1.5 rounded-xs transition-colors ${
                      rankingMode === "most_certain"
                        ? "bg-[#1B3B2B] text-white font-semibold shadow-xs"
                        : "text-[#5A574F] hover:text-[#141413]"
                    }`}
                  >
                    Most Certain
                  </button>
                </div>
              </div>

              {/* Offer Cards Stream */}
              <div className="space-y-4">
                {valuation.offers.map((offer) => {
                  const isPrimary = offer.rankingPosition === 1 && !valuation.isHazardous;
                  const offerKey = `${offer.providerSlug}-${offer.offerType}`;
                  const isExpanded = !!expandedOffers[offerKey];

                  return (
                    <article
                      key={offerKey}
                      className={`bg-white rounded-sm border transition-all p-5 sm:p-6 shadow-xs space-y-4 ${
                        isPrimary
                          ? "border-[#1B3B2B] ring-2 ring-[#1B3B2B]/15"
                          : "border-[#E5E0D8] hover:border-[#BDB9AE]"
                      }`}
                    >
                      {/* Top Row: Provider Identity & Payout */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-wider">
                            <span
                              className={`px-2 py-0.5 rounded-xs font-bold ${
                                isPrimary
                                  ? "bg-[#1B3B2B] text-white"
                                  : "bg-[#FAF9F5] text-[#5A574F] border border-[#E5E0D8]"
                              }`}
                            >
                              {offer.rankingReason}
                            </span>

                            {/* Payment medium pill */}
                            <span
                              className={`px-2 py-0.5 rounded-xs font-semibold border ${
                                offer.financialType === "cash"
                                  ? "bg-[#EDF5F0] text-[#1B3B2B] border-[#C6DFD0]"
                                  : offer.financialType === "voucher"
                                  ? "bg-[#FEF7ED] text-[#8C5E28] border-[#E8DCBF]"
                                  : offer.financialType === "trade_in_credit"
                                  ? "bg-[#E9F3F2] text-[#257A72] border-[#C1DFDC]"
                                  : "bg-[#FAF9F5] text-[#5A574F] border-[#E5E0D8]"
                              }`}
                            >
                              {offer.financialType === "cash"
                                ? "Liquid Bank Cash"
                                : offer.financialType === "voucher"
                                ? "Store Voucher (Non-Cash)"
                                : offer.financialType === "trade_in_credit"
                                ? "Apple Trade-In Credit"
                                : "Free Certified Recycling"}
                            </span>
                          </div>

                          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#141413]">
                            {offer.providerName}
                          </h3>

                          <span className="text-xs font-mono text-[#5A574F] block">
                            Settlement: <strong className="text-[#141413]">{offer.paymentMethod}</strong>
                          </span>
                        </div>

                        {/* Payout Display */}
                        <div className="sm:text-right shrink-0 font-mono space-y-0.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#EFECE2]">
                          <span className="text-[10px] text-[#8E8B82] uppercase tracking-wider block">
                            {offer.financialType === "voucher" ? "Store Voucher Value" : "Estimated Net Cash"}
                          </span>
                          <div className="flex sm:justify-end items-baseline gap-1">
                            <span className="text-sm font-sans font-medium text-[#141413]">₹</span>
                            <strong className="text-3xl sm:text-4xl font-serif font-bold text-[#141413]">
                              {offer.estimatedNetPayout.toLocaleString()}
                            </strong>
                          </div>
                          <span className="text-[11px] text-[#736F66] block">
                            Expected: ₹{offer.priceRange.min.toLocaleString()} – ₹{offer.priceRange.max.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* 3 Core Decision Factors Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t border-[#E5E0D8] font-mono text-xs">
                        {/* Factor 1: Quote Semantics */}
                        <div className="bg-[#FAF9F5] p-3 rounded-xs border border-[#E5E0D8] space-y-1">
                          <span className="text-[10px] text-[#8E8B82] uppercase block">Quote Status</span>
                          <div className="flex items-center gap-1.5 font-semibold text-[#141413]">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#257A72]" />
                            <span>{offer.quoteStatusLabel}</span>
                          </div>
                        </div>

                        {/* Factor 2: Logistics / Doorstep */}
                        <div className="bg-[#FAF9F5] p-3 rounded-xs border border-[#E5E0D8] space-y-1">
                          <span className="text-[10px] text-[#8E8B82] uppercase block">Pickup / Drop-off</span>
                          <div className="flex items-center gap-1.5 font-semibold text-[#141413]">
                            <Truck className="w-3.5 h-3.5 text-[#1B3B2B]" />
                            <span className="truncate">{offer.pickupBadgeLabel}</span>
                          </div>
                        </div>

                        {/* Factor 3: Inspection Policy Risk */}
                        <div className="bg-[#FAF9F5] p-3 rounded-xs border border-[#E5E0D8] space-y-1">
                          <span className="text-[10px] text-[#8E8B82] uppercase block">Inspection Terms</span>
                          <div className="flex items-center gap-1.5 text-[#5A574F]">
                            <Info className="w-3.5 h-3.5 text-[#8E8B82]" />
                            <span className="truncate">{offer.inspectionDeductionsPolicy.slice(0, 38)}...</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Row */}
                      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => toggleOfferDisclosure(offerKey)}
                          className="inline-flex items-center gap-1.5 text-xs font-mono text-[#5A574F] hover:text-[#141413] self-start sm:self-auto py-1"
                        >
                          <span>{isExpanded ? "Hide inspection policy & audit source" : "View inspection policy & audit source"}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

                        <div className="flex items-center gap-2">
                          {offer.evidenceUrl && (
                            <a
                              href={offer.evidenceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-2.5 border border-[#D5D0C5] bg-[#FAF9F5] hover:bg-white text-xs font-mono text-[#5A574F] rounded-sm transition-colors flex items-center gap-1"
                            >
                              <span>Official Site</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}

                          <button
                            type="button"
                            disabled={isSubmitting || !offer.isEligible}
                            onClick={() => handleSelectOffer(offer)}
                            className={`px-5 py-2.5 font-mono uppercase tracking-wider font-semibold rounded-sm text-xs transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 min-h-[44px] ${
                              isPrimary
                                ? "bg-[#1B3B2B] hover:bg-[#132A1F] text-white"
                                : "bg-[#141413] hover:bg-[#2B2B28] text-white"
                            }`}
                          >
                            {isSubmitting ? (
                              <span>Creating Case...</span>
                            ) : (
                              <>
                                <span>Lock Quote &amp; Track Case</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Expandable Disclosure Details */}
                      {isExpanded && (
                        <div className="p-4 bg-[#F7F5EE] border border-[#DFD9CD] rounded-xs font-mono text-xs space-y-3 pt-3 mt-2">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <strong className="text-[#141413] uppercase text-[10px] block mb-1">
                                Physical Inspection &amp; Deductions:
                              </strong>
                              <p className="font-sans text-xs text-[#5A574F] leading-relaxed">
                                {offer.inspectionDeductionsPolicy}
                              </p>
                            </div>
                            <div>
                              <strong className="text-[#141413] uppercase text-[10px] block mb-1">
                                Quote Basis &amp; Verification Date:
                              </strong>
                              <p className="font-sans text-xs text-[#5A574F] leading-relaxed">
                                {offer.quoteBasis}
                              </p>
                              <div className="flex items-center gap-2 text-[11px] text-[#8E8B82] mt-1.5">
                                <Calendar className="w-3 h-3" />
                                <span>Audited: {offer.lastVerifiedDate}</span>
                              </div>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-[#DFD9CD] flex flex-wrap gap-4 text-[11px] text-[#736F66]">
                            <span><strong>Pickup:</strong> {offer.pickupDetails}</span>
                            <span><strong>Drop-off:</strong> {offer.dropoffDetails}</span>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
