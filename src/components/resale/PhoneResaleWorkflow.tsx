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
  Calendar,
  ExternalLink,
  RotateCcw,
  MapPin,
  ArrowUpRight,
  Wrench,
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

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Filter models by selected brand
  const availableModels = useMemo(() => {
    return PHONE_CATALOG.filter((m) => m.brand === selectedBrand);
  }, [selectedBrand]);

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
    if (found && !found.storageOptions.includes(selectedStorage)) {
      setSelectedStorage(found.storageOptions[0] || "128GB");
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Header & Context Tag */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#E5E0D8]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase text-[#736F66]">
            <span>SMARTPHONE RESALE ENGINE</span>
            <span>&bull;</span>
            <span>DELHI PILOT AUDIT</span>
            <span>&bull;</span>
            <span className="text-[#1B3B2B] font-semibold">VERIFIED NET PAYOUT</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#141413] tracking-tight">
            Sell Your Phone for the Best Realistic Price
          </h1>
          <p className="text-xs sm:text-sm text-[#5A574F] font-sans max-w-3xl leading-relaxed">
            Transparent comparison across Cashify Doorstep Buyback, Croma Superrr Exchange,
            Apple Trade In Saket, and direct buyer benchmarks. Pre-disclosed inspection
            deduction rules with zero fabricated quotes.
          </p>
        </div>

        {/* Live Best Realistic Estimate Pill */}
        {!valuation.isHazardous && valuation.bestRealisticOffer && (
          <div className="bg-[#FAF9F5] border border-[#E5E0D8] rounded-sm p-3.5 sm:text-right shrink-0 font-mono">
            <span className="text-[10px] text-[#8E8B82] uppercase tracking-wider block">
              Top Verified Offer
            </span>
            <strong className="text-2xl sm:text-3xl font-serif text-[#141413] block">
              ₹{valuation.bestRealisticOffer.estimatedNetPayout.toLocaleString()}
            </strong>
            <span className="text-[11px] text-[#1B3B2B] block">
              {valuation.bestRealisticOffer.providerName.split("(")[0]} · Instant Payout
            </span>
          </div>
        )}
      </div>

      {/* 4-Stage Guided Stepper */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
        {[
          { num: 1, label: "Brand & Model" },
          { num: 2, label: "Condition & Faults" },
          { num: 3, label: "Box & Location" },
          { num: 4, label: "Compare Offers" },
        ].map((stage) => {
          const isActive = activeStage === stage.num;
          const isPassed = activeStage > stage.num;
          return (
            <button
              key={stage.num}
              type="button"
              onClick={() => setActiveStage(stage.num as 1 | 2 | 3 | 4)}
              className={`p-3 text-left border rounded-sm transition-all ${
                isActive
                  ? "bg-[#1B3B2B] text-white border-[#1B3B2B] shadow-xs"
                  : isPassed
                  ? "bg-white text-[#141413] border-[#1B3B2B]/40 hover:border-[#1B3B2B]"
                  : "bg-white text-[#8E8B82] border-[#E5E0D8] hover:border-[#D5D0C5]"
              }`}
            >
              <div className="flex items-center justify-between text-[10px] uppercase mb-1">
                <span className={isActive ? "text-[#C1DFDC]" : "text-[#8E8B82]"}>
                  Stage 0{stage.num}
                </span>
                {isPassed && <CheckCircle2 className="w-3.5 h-3.5 text-[#1B3B2B]" />}
              </div>
              <span className="font-semibold block text-xs truncate">{stage.label}</span>
            </button>
          );
        })}
      </div>

      {/* Submission Errors */}
      {submitError && (
        <div className="p-4 bg-[#FFF9F5] border border-[#F3D1C2] text-[#C8532C] text-xs font-mono rounded-sm flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{submitError}</span>
        </div>
      )}

      {/* STAGE 1: BRAND, MODEL, STORAGE */}
      {activeStage === 1 && (
        <div className="bg-white border border-[#E5E0D8] rounded-sm p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="space-y-1">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#141413]">
              01 / Select Exact Phone Model &amp; Storage
            </h2>
            <p className="text-xs text-[#5A574F]">
              Hardware buyback quotes depend heavily on processor generation, NAND storage capacity, and secondary market demand.
            </p>
          </div>

          {/* Brand Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-mono uppercase tracking-wider text-[#5A574F]">
              Manufacturer / Brand:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 font-mono text-xs">
              {PHONE_BRANDS.map((brand) => (
                <button
                  key={brand}
                  type="button"
                  onClick={() => handleBrandChange(brand)}
                  className={`p-3 text-center border rounded-sm font-semibold transition-all ${
                    selectedBrand === brand
                      ? "bg-[#141413] text-white border-[#141413] shadow-xs"
                      : "bg-[#FAF9F5] text-[#5A574F] border-[#E5E0D8] hover:border-[#141413] hover:text-[#141413]"
                  }`}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>

          {/* Model Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-mono uppercase tracking-wider text-[#5A574F]">
              Exact Model ({selectedBrand}):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 font-mono text-xs">
              {availableModels.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleModelChange(m.id)}
                  className={`p-3 text-left border rounded-sm transition-all flex items-center justify-between ${
                    activeModel.id === m.id
                      ? "bg-[#1B3B2B] text-white border-[#1B3B2B] shadow-xs"
                      : "bg-[#FAF9F5] text-[#141413] border-[#E5E0D8] hover:border-[#1B3B2B]"
                  }`}
                >
                  <span className="font-semibold">{m.name}</span>
                  <span className="text-[10px] opacity-75">{m.releaseYear}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Storage Capacity Selector */}
          <div className="space-y-2 pt-2 border-t border-[#E5E0D8]">
            <label className="block text-xs font-mono uppercase tracking-wider text-[#5A574F]">
              On-Board Storage Capacity:
            </label>
            <div className="flex flex-wrap gap-2 font-mono text-xs">
              {activeModel.storageOptions.map((storage) => (
                <button
                  key={storage}
                  type="button"
                  onClick={() => setSelectedStorage(storage)}
                  className={`px-4 py-2 border rounded-sm font-semibold transition-all ${
                    selectedStorage === storage
                      ? "bg-[#141413] text-white border-[#141413]"
                      : "bg-[#FAF9F5] text-[#5A574F] border-[#E5E0D8] hover:border-[#141413] hover:text-[#141413]"
                  }`}
                >
                  {storage}
                </button>
              ))}
            </div>
          </div>

          {/* Forward Button */}
          <div className="pt-4 border-t border-[#E5E0D8] flex justify-end">
            <button
              type="button"
              onClick={() => setActiveStage(2)}
              className="px-6 py-3 bg-[#1B3B2B] hover:bg-[#132A1F] text-white font-mono uppercase tracking-wider text-xs font-semibold rounded-sm transition-colors flex items-center gap-2"
            >
              <span>Continue to Condition Diagnostic</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 2: CONDITION & SPECIFIC FAULTS */}
      {activeStage === 2 && (
        <div className="bg-white border border-[#E5E0D8] rounded-sm p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="space-y-1">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#141413]">
              02 / Device Condition &amp; Hardware Faults
            </h2>
            <p className="text-xs text-[#5A574F]">
              Disclose realistic cosmetic and functional condition to avoid price drops during physical technician inspection.
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
                  className={`p-4 border rounded-sm text-left transition-all relative ${
                    isSelected
                      ? "bg-[#FAF8F3] border-[#1B3B2B] ring-2 ring-[#1B3B2B]/20 shadow-xs"
                      : "bg-[#FAF9F5] border-[#E5E0D8] hover:border-[#BDB9AE]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5 font-mono text-[11px]">
                    <span className="font-bold uppercase tracking-wider text-[#141413]">
                      {condDef.label}
                    </span>
                    <span className="text-[10px] text-[#8E8B82]">
                      {condDef.factor > 0 ? `${Math.round(condDef.factor * 100)}% base` : "Safety lock"}
                    </span>
                  </div>
                  <p className="text-xs text-[#5A574F] leading-relaxed font-sans">
                    {condDef.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Hazardous Warning Banner if selected */}
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

          {/* Specific Faults Checklist (if not flawless and not hazardous) */}
          {selectedCondition !== "flawless" && selectedCondition !== "hazardous" && (
            <div className="space-y-3 pt-3 border-t border-[#E5E0D8]">
              <label className="block text-xs font-mono uppercase tracking-wider text-[#5A574F]">
                Specific Faults Present (Check all that apply):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono text-xs">
                {COMMON_PHONE_FAULTS.map((fault) => {
                  const isChecked = selectedFaults.includes(fault.id);
                  return (
                    <button
                      key={fault.id}
                      type="button"
                      onClick={() => toggleFault(fault.id)}
                      className={`p-3 border rounded-sm text-left transition-all flex items-start justify-between gap-3 ${
                        isChecked
                          ? "bg-[#FFF9F5] border-[#C8532C] text-[#141413]"
                          : "bg-[#FAF9F5] border-[#E5E0D8] text-[#5A574F] hover:border-[#141413]"
                      }`}
                    >
                      <div>
                        <strong className="block font-semibold text-xs mb-0.5">
                          {fault.label}
                        </strong>
                        <span className="text-[11px] text-[#736F66] font-sans block">
                          {fault.description}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-sm shrink-0 ${
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
                <div className="p-3 bg-[#FAF8F3] border border-[#D5D0C5] rounded-sm text-xs font-mono flex items-start gap-2.5">
                  <Wrench className="w-4 h-4 text-[#257A72] shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <strong className="text-[#141413] block">
                      Repair vs. Sell Economic Comparison Available:
                    </strong>
                    <p className="text-[#5A574F] font-sans text-xs">
                      You have selected {selectedFaults.length} hardware fault{selectedFaults.length > 1 ? "s" : ""}.
                      In Step 04, our transparent comparison matrix will evaluate whether fixing these faults in Delhi before selling produces a higher net cash return.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Stepper Buttons */}
          <div className="pt-4 border-t border-[#E5E0D8] flex items-center justify-between">
            <button
              type="button"
              onClick={() => setActiveStage(1)}
              className="px-4 py-2 border border-[#E5E0D8] bg-[#FAF9F5] hover:bg-white text-xs font-mono text-[#5A574F] rounded-sm transition-colors"
            >
              &larr; Back to Model
            </button>
            <button
              type="button"
              onClick={() => setActiveStage(3)}
              className="px-6 py-3 bg-[#1B3B2B] hover:bg-[#132A1F] text-white font-mono uppercase tracking-wider text-xs font-semibold rounded-sm transition-colors flex items-center gap-2"
            >
              <span>Continue to Accessories &amp; Pincode</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 3: ACCESSORIES & LOCATION PINCODE */}
      {activeStage === 3 && (
        <div className="bg-white border border-[#E5E0D8] rounded-sm p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="space-y-1">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#141413]">
              03 / Original Accessories &amp; Service Pincode
            </h2>
            <p className="text-xs text-[#5A574F]">
              Providing the original purchase bill and retail box increases payout and dealer grading. Enter your Delhi pincode to verify free doorstep inspection.
            </p>
          </div>

          {/* Accessories Checklist */}
          <div className="space-y-3">
            <label className="block text-xs font-mono uppercase tracking-wider text-[#5A574F]">
              Included Original Accessories:
            </label>
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
                    className={`p-4 border rounded-sm text-left transition-all flex flex-col justify-between ${
                      isChecked
                        ? "bg-[#EDF5F0] border-[#1B3B2B] text-[#141413]"
                        : "bg-[#FAF9F5] border-[#E5E0D8] text-[#5A574F] hover:border-[#141413]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <strong className="font-semibold text-xs">{accDef.label}</strong>
                        <span className="text-[10px] font-bold text-[#1B3B2B] bg-[#C6DFD0] px-1.5 py-0.5 rounded-sm">
                          +₹{accDef.bonusAmount}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#5A574F] font-sans">{accDef.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Location / Pincode Section */}
          <div className="space-y-3 pt-3 border-t border-[#E5E0D8]">
            <label className="block text-xs font-mono uppercase tracking-wider text-[#5A574F]">
              Delhi Service Pincode (Doorstep Pickup Verification):
            </label>
            <div className="max-w-md space-y-2">
              <div className="relative">
                <input
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
                    <div className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>
                        <strong>Delhi Pilot Covered:</strong> {locality || "Documented Delhi NCT Area"} — Free doorstep technician pickup available.
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-start gap-1.5">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
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
          <div className="pt-4 border-t border-[#E5E0D8] flex items-center justify-between">
            <button
              type="button"
              onClick={() => setActiveStage(2)}
              className="px-4 py-2 border border-[#E5E0D8] bg-[#FAF9F5] hover:bg-white text-xs font-mono text-[#5A574F] rounded-sm transition-colors"
            >
              &larr; Back to Condition
            </button>
            <button
              type="button"
              onClick={() => setActiveStage(4)}
              className="px-6 py-3 bg-[#1B3B2B] hover:bg-[#132A1F] text-white font-mono uppercase tracking-wider text-xs font-semibold rounded-sm transition-colors flex items-center gap-2"
            >
              <span>View Ranked Offers</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 4: LIVE PROVIDER OFFER COMPARISON & TRANSPARENT RANKING */}
      {activeStage === 4 && (
        <div className="space-y-8">
          {/* Diagnostic Breakdown Summary Card */}
          <div className="bg-white border border-[#E5E0D8] rounded-sm p-6 sm:p-7 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E0D8]">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#8E8B82] block">
                  Assessed Hardware Specification
                </span>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#141413]">
                  {valuation.assessmentSummary.deviceTitle}
                </h2>
                <span className="text-xs font-mono text-[#5A574F]">
                  Grade: <strong className="text-[#141413]">{valuation.assessmentSummary.conditionLabel}</strong> &bull;
                  Location: <strong className="text-[#141413]">{pincode || "Delhi"}</strong>
                </span>
              </div>

              <div className="flex items-center gap-3 self-start sm:self-center">
                {repairVsSellAnalysis.hasFaultsToRepair && (
                  <button
                    type="button"
                    onClick={() => setStage4Tab(stage4Tab === "repair_vs_sell" ? "offers" : "repair_vs_sell")}
                    className="inline-flex items-center gap-1.5 font-mono text-xs text-[#257A72] bg-[#E9F3F2] px-2.5 py-1 rounded-sm border border-[#C1DFDC] hover:bg-[#D5EAE8] transition-colors"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>{stage4Tab === "repair_vs_sell" ? "View Resale Offers" : "Repair vs. Sell Matrix"}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setActiveStage(1)}
                  className="inline-flex items-center gap-1.5 font-mono text-xs text-[#1B3B2B] hover:underline"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Adjust Diagnostic</span>
                </button>
              </div>
            </div>

            {/* Valuation Ledger Formula */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 font-mono text-xs">
              <div className="bg-[#FAF9F5] p-3 rounded-sm border border-[#E5E0D8]">
                <span className="text-[10px] text-[#8E8B82] uppercase block">Base Model Payout</span>
                <strong className="text-sm text-[#141413]">₹{valuation.assessmentSummary.basePrice.toLocaleString()}</strong>
              </div>
              <div className="bg-[#FAF9F5] p-3 rounded-sm border border-[#E5E0D8]">
                <span className="text-[10px] text-[#8E8B82] uppercase block">Condition Multiplier</span>
                <strong className="text-sm text-[#141413]">{Math.round(valuation.assessmentSummary.conditionFactor * 100)}%</strong>
              </div>
              <div className="bg-[#FAF9F5] p-3 rounded-sm border border-[#E5E0D8]">
                <span className="text-[10px] text-[#8E8B82] uppercase block">Fault Deductions</span>
                <strong className="text-sm text-[#C8532C]">-₹{valuation.assessmentSummary.faultDeductionTotal.toLocaleString()}</strong>
              </div>
              <div className="bg-[#FAF9F5] p-3 rounded-sm border border-[#E5E0D8]">
                <span className="text-[10px] text-[#8E8B82] uppercase block">Accessories Bonus</span>
                <strong className="text-sm text-[#1B3B2B]">+₹{valuation.assessmentSummary.accessoryBonusTotal.toLocaleString()}</strong>
              </div>
              <div className="bg-[#EDF5F0] p-3 rounded-sm border border-[#C6DFD0] col-span-2 sm:col-span-1">
                <span className="text-[10px] text-[#1B3B2B] uppercase font-bold block">Net Realistic Baseline</span>
                <strong className="text-base text-[#1B3B2B]">₹{valuation.assessmentSummary.estimatedNetBaseline.toLocaleString()}</strong>
              </div>
            </div>
          </div>

          {/* Hazardous Safety Callout if Applicable */}
          {valuation.isHazardous && valuation.hazardDirective && (
            <div className="bg-[#FFF0E8] border-2 border-[#C8532C] rounded-sm p-6 sm:p-8 space-y-4 shadow-xs">
              <div className="flex items-center gap-2 font-mono text-sm font-bold text-[#C8532C]">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>{valuation.hazardDirective.headline}</span>
              </div>
              <p className="text-xs sm:text-sm text-[#141413] leading-relaxed">
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

          {/* Stage 4 Sub-Tabs: Offers vs Repair-vs-Sell Matrix */}
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

          {/* Tab Content: Repair vs. Sell Comparison */}
          {stage4Tab === "repair_vs_sell" && (
            <RepairVsSellCard
              analysis={repairVsSellAnalysis}
              onProceedToResale={() => setStage4Tab("offers")}
            />
          )}

          {/* Tab Content: Provider Offers Grid */}
          {stage4Tab === "offers" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E0D8]">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#141413]">
                    Verified Resale Offers ({valuation.offers.length})
                  </h3>
                  <span className="text-[#8E8B82] font-mono text-[11px] block mt-0.5">
                    {valuation.rankingExplanation}
                  </span>
                </div>

                {/* Ranking Mode Switcher */}
                <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
                  <span className="text-[10px] uppercase text-[#8E8B82] mr-1">Sort:</span>
                  <button
                    type="button"
                    onClick={() => setRankingMode("highest_cash")}
                    className={`px-2.5 py-1 rounded-sm text-[11px] border transition-colors ${
                      rankingMode === "highest_cash"
                        ? "bg-[#1B3B2B] text-white border-[#1B3B2B] font-semibold"
                        : "bg-[#FAF9F5] text-[#5A574F] border-[#E5E0D8] hover:bg-white"
                    }`}
                  >
                    Highest Cash
                  </button>
                  <button
                    type="button"
                    onClick={() => setRankingMode("most_convenient")}
                    className={`px-2.5 py-1 rounded-sm text-[11px] border transition-colors ${
                      rankingMode === "most_convenient"
                        ? "bg-[#1B3B2B] text-white border-[#1B3B2B] font-semibold"
                        : "bg-[#FAF9F5] text-[#5A574F] border-[#E5E0D8] hover:bg-white"
                    }`}
                  >
                    Most Convenient
                  </button>
                  <button
                    type="button"
                    onClick={() => setRankingMode("most_certain")}
                    className={`px-2.5 py-1 rounded-sm text-[11px] border transition-colors ${
                      rankingMode === "most_certain"
                        ? "bg-[#1B3B2B] text-white border-[#1B3B2B] font-semibold"
                        : "bg-[#FAF9F5] text-[#5A574F] border-[#E5E0D8] hover:bg-white"
                    }`}
                  >
                    Most Certain
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {valuation.offers.map((offer) => {
                  const isPrimary = offer.rankingPosition === 1 && !valuation.isHazardous;

                  return (
                    <div
                      key={`${offer.providerSlug}-${offer.offerType}`}
                      className={`bg-white rounded-sm border transition-all p-6 sm:p-7 shadow-xs flex flex-col md:flex-row md:items-start justify-between gap-6 ${
                        isPrimary
                          ? "border-[#1B3B2B] ring-2 ring-[#1B3B2B]/20"
                          : "border-[#E5E0D8] hover:border-[#BDB9AE]"
                      }`}
                    >
                      {/* Left Offer Details Column */}
                      <div className="space-y-3.5 flex-1">
                        {/* Top Tag Strip */}
                        <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-wider">
                          <span
                            className={`px-2 py-0.5 rounded-sm font-bold ${
                              isPrimary
                                ? "bg-[#1B3B2B] text-white"
                                : "bg-[#FAF9F5] text-[#5A574F] border border-[#E5E0D8]"
                            }`}
                          >
                            {offer.rankingReason}
                          </span>

                          {/* Financial Type Badge: Distinguish Cash from Vouchers */}
                          <span
                            className={`px-2 py-0.5 rounded-sm font-semibold border ${
                              offer.financialType === "cash"
                                ? "bg-[#EDF5F0] text-[#1B3B2B] border-[#C6DFD0]"
                                : offer.financialType === "voucher"
                                ? "bg-[#FFF9F5] text-[#8C5E28] border-[#E8DCBF]"
                                : offer.financialType === "trade_in_credit"
                                ? "bg-[#E9F3F2] text-[#257A72] border-[#C1DFDC]"
                                : offer.financialType === "free_disposal"
                                ? "bg-[#FFF0E8] text-[#C8532C] border-[#F2C2B2]"
                                : "bg-[#FAF9F5] text-[#5A574F] border-[#E5E0D8]"
                            }`}
                          >
                            {offer.financialType === "cash"
                              ? "Direct Bank Cash"
                              : offer.financialType === "voucher"
                              ? "Store Voucher (Non-Cash)"
                              : offer.financialType === "trade_in_credit"
                              ? "Apple Trade-In Credit"
                              : offer.financialType === "free_disposal"
                              ? "Hazardous Recovery"
                              : "P2P Buyer Cash"}
                          </span>

                          {/* Quote Status Badge */}
                          <span
                            className={`px-2 py-0.5 rounded-sm font-semibold border ${
                              offer.quoteStatus === "published_price"
                                ? "bg-[#EDF5F0] text-[#1B3B2B] border-[#C6DFD0]"
                                : offer.quoteStatus === "confirmed_diagnostic_quote"
                                ? "bg-[#E9F3F2] text-[#257A72] border-[#C1DFDC]"
                                : offer.quoteStatus === "expired_stale_estimate"
                                ? "bg-[#FFF9F5] text-[#C8532C] border-[#F3D1C2]"
                                : "bg-[#FAF9F5] text-[#5A574F] border-[#E5E0D8]"
                            }`}
                          >
                            {offer.quoteStatusLabel}
                          </span>

                          {/* Explicit Pickup / Logistics Badge */}
                          <span
                            className={`px-2 py-0.5 rounded-sm border ${
                              offer.pickupBadgeStatus === "pickup_confirmed"
                                ? "bg-[#EDF5F0] text-[#1B3B2B] border-[#C6DFD0] font-semibold"
                                : offer.pickupBadgeStatus === "not_available_pincode"
                                ? "bg-[#FFF9F5] text-[#C8532C] border-[#F3D1C2]"
                                : "bg-[#FAF9F5] text-[#5A574F] border-[#E5E0D8]"
                            }`}
                          >
                            {offer.pickupBadgeLabel}
                          </span>
                        </div>

                        {/* Provider Title & Payment Mode */}
                        <div>
                          <h4 className="font-serif text-xl sm:text-2xl font-bold text-[#141413]">
                            {offer.providerName}
                          </h4>
                          <span className="font-mono text-xs text-[#5A574F] block mt-0.5">
                            Settlement: <strong className="text-[#141413]">{offer.paymentMethod}</strong>
                          </span>
                        </div>

                        {/* Quote Basis & Provenance */}
                        <div className="text-[11px] font-mono text-[#6B675E] bg-[#F7F5EE] p-2.5 rounded-xs border border-[#DFD9CD]">
                          <strong className="text-[#141413] uppercase text-[10px] block mb-0.5">
                            Quote Basis:
                          </strong>
                          <span>{offer.quoteBasis}</span>
                        </div>

                        {/* Inspection Deductions Policy (Strict Transparency) */}
                        <div className="bg-[#FAF9F5] rounded-sm p-4 border border-[#E5E0D8] text-xs font-mono space-y-2">
                          <div>
                            <strong className="text-[#141413] uppercase text-[10px] block mb-0.5">
                              Inspection &amp; Deduction Policy:
                            </strong>
                            <p className="text-[#5A574F] font-sans text-xs leading-relaxed">
                              {offer.inspectionDeductionsPolicy}
                            </p>
                          </div>
                          <div className="pt-2 border-t border-[#E5E0D8] flex flex-wrap gap-4 text-[11px] text-[#736F66]">
                            <span>
                              <strong>Pickup:</strong> {offer.pickupDetails}
                            </span>
                            <span>
                              <strong>Drop-off:</strong> {offer.dropoffDetails}
                            </span>
                          </div>
                        </div>

                        {/* Audit Evidence Link */}
                        <div className="flex items-center gap-3 font-mono text-[11px] text-[#8E8B82]">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-[#8E8B82]" />
                            Verified: {offer.lastVerifiedDate}
                          </span>
                          {offer.evidenceUrl && (
                            <a
                              href={offer.evidenceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[#1B3B2B] hover:underline"
                            >
                              <span>Evidence Source</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Right Action & Payout Column */}
                      <div className="md:w-64 shrink-0 flex flex-col justify-between pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-[#E5E0D8] md:pl-6 space-y-4 font-mono">
                        <div>
                          <span className="text-[10px] text-[#8E8B82] uppercase tracking-wider block mb-0.5">
                            {offer.financialType === "voucher"
                              ? "Estimated Store Credit Voucher"
                              : offer.financialType === "trade_in_credit"
                              ? "Estimated Trade-In Credit"
                              : "Estimated Net Cash Payout"}
                          </span>
                          <div className="flex items-baseline gap-1">
                            <strong className="text-3xl sm:text-4xl font-serif font-bold text-[#141413]">
                              ₹{offer.estimatedNetPayout.toLocaleString()}
                            </strong>
                          </div>
                          <span className="text-[11px] text-[#736F66] block mt-0.5">
                            Expected range: ₹{offer.priceRange.min.toLocaleString()} - ₹{offer.priceRange.max.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-[#8E8B82] block mt-1 italic font-sans">
                            Amount is pre-inspection estimate. Final settlement confirmed after diagnostic verification.
                          </span>
                        </div>

                        <button
                          type="button"
                          disabled={isSubmitting || !offer.isEligible}
                          onClick={() => handleSelectOffer(offer)}
                          className={`w-full py-3.5 px-4 font-mono uppercase tracking-wider font-semibold rounded-sm text-xs transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 ${
                            isPrimary
                              ? "bg-[#1B3B2B] hover:bg-[#132A1F] text-white"
                              : "bg-[#141413] hover:bg-[#20201E] text-white"
                          }`}
                        >
                          {isSubmitting ? (
                            <span>Locking Quote...</span>
                          ) : (
                            <>
                              <span>Select Offer &amp; Lock Quote</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>

                        <p className="text-[10px] text-[#8E8B82] leading-tight text-center">
                          Creates an active recovery case docket. No registration or upfront fee required.
                        </p>
                      </div>
                    </div>
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
