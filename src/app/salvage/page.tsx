"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Layers,
  ArrowLeft,
  MapPin,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  Search,
} from "lucide-react";
import { getAllSalvageModels, evaluateComponentSalvage } from "../../lib/salvage/engine";

export default function SalvageValuationPage() {
  const models = useMemo(() => getAllSalvageModels(), []);
  const [selectedBrand, setSelectedBrand] = useState<string>("Nothing");
  const [selectedModelId, setSelectedModelId] = useState<string>("nothing-phone-2");

  // Get active model
  const activeModel = useMemo(() => {
    return models.find((m) => m.modelId === selectedModelId) || models[0];
  }, [models, selectedModelId]);

  // Track checked components that are intact/working
  const [checkedComponentIds, setCheckedComponentIds] = useState<string[]>(() => {
    // Default all except battery to checked
    const init = models.find((m) => m.modelId === "nothing-phone-2");
    return init ? init.components.filter((c) => c.eligibleForResale).map((c) => c.id) : [];
  });

  // When model changes, reset checked parts
  const handleModelChange = (id: string) => {
    setSelectedModelId(id);
    const m = models.find((item) => item.modelId === id);
    if (m) {
      setCheckedComponentIds(m.components.filter((c) => c.eligibleForResale).map((c) => c.id));
    }
  };

  const toggleComponent = (id: string) => {
    setCheckedComponentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Evaluation results
  const evaluation = useMemo(() => {
    return evaluateComponentSalvage(selectedModelId, checkedComponentIds);
  }, [selectedModelId, checkedComponentIds]);

  // Brand list
  const brands = useMemo(() => {
    const bSet = new Set(models.map((m) => m.brand));
    return Array.from(bSet);
  }, [models]);

  const [searchQuery, setSearchQuery] = useState("");

  const filteredModels = useMemo(() => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return models.filter(
        (m) =>
          m.modelName.toLowerCase().includes(q) ||
          m.brand.toLowerCase().includes(q)
      );
    }
    return models.filter((m) => m.brand === selectedBrand);
  }, [models, selectedBrand, searchQuery]);

  return (
    <div className="min-h-screen bg-[#F4F1EA] text-[#141413] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Back navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/sell-phone"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#257A72] hover:text-[#1D6059]"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Phone Resale
          </Link>

          <span className="text-xs font-mono bg-[#E2DED4] text-[#5A5751] px-2.5 py-1 rounded">
            Nehru Place & Karol Bagh Secondary Spare Market Benchmarks
          </span>
        </div>

        {/* Hero Banner */}
        <div className="bg-[#141413] text-[#F7F5EE] p-6 sm:p-8 rounded-2xl border border-[#2C2A26] shadow-sm">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#257A72]/20 border border-[#257A72]/40 text-xs font-mono text-[#257A72]">
            <Layers className="w-3.5 h-3.5 text-[#257A72]" />
            Component-Level Micro-Salvage Protocol
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#F7F5EE] mt-2">
            The &quot;Organ Donor&quot; Salvage Valuation Engine
          </h1>
          <p className="text-sm text-[#A8A29E] mt-2 max-w-2xl leading-relaxed">
            When a smartphone has a fried motherboard or severe water damage, buyback apps classify
            it as &quot;dead scrap&quot; and pay ₹150–₹350. In reality, original OEM screens, cameras, and
            Glyph back panels are desperately needed by independent repairers in Delhi.
          </p>
        </div>

        {/* Brand & Model Selector */}
        <div className="bg-white rounded-xl border border-[#D5D0C5] p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs font-mono uppercase text-[#736F68] font-bold block">
              Step 1: Select Brand & Device Family ({models.length} Models Catalogued)
            </span>

            {/* Quick Model Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-[#736F68] absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search 35+ phones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-[#D5D0C5] text-xs font-sans placeholder:text-[#A8A29E]"
              />
            </div>
          </div>

          {/* Brand Tabs (hidden when searching) */}
          {!searchQuery && (
            <div className="flex items-center gap-2 flex-wrap">
              {brands.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => {
                    setSelectedBrand(b);
                    const firstOfBrand = models.find((m) => m.brand === b);
                    if (firstOfBrand) handleModelChange(firstOfBrand.modelId);
                  }}
                  className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
                    selectedBrand === b
                      ? "bg-[#1B3B2B] text-white shadow-xs"
                      : "bg-[#F7F5EE] text-[#5A5751] hover:bg-[#EAE6DC]"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          )}

          {/* Model Dropdown / Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-2">
            {filteredModels.map((m) => (
              <button
                key={m.modelId}
                type="button"
                onClick={() => handleModelChange(m.modelId)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  selectedModelId === m.modelId
                    ? "border-[#257A72] bg-[#257A72]/10 ring-1 ring-[#257A72]"
                    : "border-[#E8E5DD] bg-[#FAFAF8] hover:border-[#D5D0C5]"
                }`}
              >
                <span className="font-serif font-bold text-sm text-[#141413] block">
                  {m.modelName}
                </span>
                <span className="text-xs text-[#736F68] font-mono">
                  MSRP: ₹{m.launchMsrp.toLocaleString("en-IN")} · Scrap: ₹{m.genericScrapOfferInr}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Exploded BOM & Value Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Col 1 & 2: Component Checklist */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-[#D5D0C5] p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E5DD]">
              <div>
                <h3 className="font-serif font-bold text-base text-[#141413]">
                  Bill of Materials (BOM) Component Audit
                </h3>
                <p className="text-xs text-[#5A5751]">
                  Check which physical modules are still intact and undamaged.
                </p>
              </div>
              <span className="text-xs font-mono text-[#736F68]">
                {checkedComponentIds.length} of {activeModel.components.length} parts salvageable
              </span>
            </div>

            <div className="space-y-3">
              {activeModel.components.map((c) => {
                const isChecked = checkedComponentIds.includes(c.id);
                return (
                  <div
                    key={c.id}
                    onClick={() => toggleComponent(c.id)}
                    className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                      isChecked
                        ? "border-[#257A72] bg-[#F3F9F8]"
                        : "border-[#E8E5DD] bg-white opacity-60 hover:opacity-100"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // handled by parent onClick
                          className="mt-1 h-4 w-4 rounded text-[#257A72] focus:ring-[#257A72]"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-serif font-bold text-sm text-[#141413]">
                              {c.name}
                            </span>
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                                c.demandTier === "Critical"
                                  ? "bg-[#842A20]/15 text-[#842A20]"
                                  : c.demandTier === "High"
                                  ? "bg-[#257A72]/15 text-[#257A72]"
                                  : "bg-[#736F68]/15 text-[#5A5751]"
                              }`}
                            >
                              {c.demandTier} Demand
                            </span>
                          </div>
                          <p className="text-xs text-[#5A5751] mt-0.5">{c.description}</p>
                          <div className="mt-1 text-[11px] font-mono text-[#736F68]">
                            <span className="text-[#141413] font-semibold">Eligibility: </span>
                            {c.eligibilityCriteria}
                          </div>
                          {c.handlingSafetyWarning && (
                            <p className="text-[11px] font-mono text-[#842A20] mt-1 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              {c.handlingSafetyWarning}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-mono font-bold text-base text-[#141413] block">
                          ₹{c.salvageValueInr.toLocaleString("en-IN")}
                        </span>
                        <span className="text-[10px] font-mono text-[#736F68]">
                          {c.eligibleForResale ? "Repair Resale" : "Recycle Hub"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Col 3: Financial Comparison Card & Routing Guide */}
          <div className="space-y-4">
            <div className="bg-[#1C1A17] text-[#F7F5EE] rounded-xl border border-[#3A3834] p-5 shadow-sm space-y-4">
              <span className="text-xs font-mono uppercase tracking-wider text-[#257A72] font-semibold block">
                Residual Value Recovery
              </span>

              <div className="pb-3 border-b border-[#2C2A26]">
                <span className="text-xs text-[#A8A29E] block">Total Harvestable Value</span>
                <span className="text-3xl font-serif font-bold text-[#F7F5EE]">
                  ₹{evaluation?.totalHarvestableValueInr.toLocaleString("en-IN") || 0}
                </span>
                <span className="text-xs font-mono text-[#4E9B70] block mt-1">
                  vs. ₹{activeModel.genericScrapOfferInr} generic scrap payout
                </span>
              </div>

              {evaluation && evaluation.scrapComparisonMultiplier > 1 && (
                <div className="bg-[#257A72]/20 border border-[#257A72]/40 rounded-lg p-3 text-xs">
                  <div className="flex items-center gap-1.5 font-mono font-bold text-[#C1DFDC]">
                    <TrendingUp className="w-4 h-4 text-[#257A72]" />
                    {evaluation.scrapComparisonMultiplier}x Higher Yield
                  </div>
                  <p className="text-[#E6E4DE] mt-1 text-[11px]">
                    Disassembling functional OEM donor parts prevents this dead phone from being
                    melted prematurely.
                  </p>
                </div>
              )}

              <Link
                href="/cases"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#257A72] hover:bg-[#1D6059] text-white text-xs font-mono font-bold transition-all shadow-sm"
              >
                Log Salvage Recovery Case
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Physical Routing Summary */}
            <div className="bg-white rounded-xl border border-[#D5D0C5] p-5 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 font-serif font-bold text-sm text-[#141413]">
                <MapPin className="w-4 h-4 text-[#257A72]" />
                Where Is It Eligible to Be Sold?
              </div>

              <div className="space-y-2 text-xs">
                {evaluation?.physicalRoutingGuide.map((route, i) => (
                  <div key={i} className="p-2.5 bg-[#F7F5EE] rounded border border-[#E8E5DD]">
                    <span className="font-bold text-[#141413] block">{route.hubName}</span>
                    <span className="text-[10px] text-[#736F68] font-mono block">
                      {route.locality}
                    </span>
                    <span className="text-[11px] text-[#5A5751] mt-1 block">
                      {route.recommendedAction}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
