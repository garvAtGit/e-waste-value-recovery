"use client";

import React from "react";
import { RepairVsSellResult } from "@/lib/resale/repair-vs-sell";
import {
  Wrench,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Info,
  ExternalLink,
} from "lucide-react";

interface RepairVsSellCardProps {
  analysis: RepairVsSellResult;
  onProceedToResale?: () => void;
}

export function RepairVsSellCard({ analysis, onProceedToResale }: RepairVsSellCardProps) {
  if (analysis.isHazardousBlocked) {
    return (
      <div className="bg-[#FFF0E8] border-2 border-[#C8532C] rounded-sm p-6 sm:p-7 space-y-3 font-mono text-xs">
        <div className="flex items-center gap-2 text-[#C8532C] font-bold text-sm">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{analysis.economics.recommendationHeadline}</span>
        </div>
        <p className="text-[#141413] leading-relaxed font-sans">{analysis.hazardReason}</p>
        <span className="text-[11px] text-[#A63C19] block">{analysis.economics.qualitativeRiskWarning}</span>
      </div>
    );
  }

  const { sellAsIs, repairThenSell, economics, dataConfidence } = analysis;
  const isBeneficial = economics.isRepairEconomicallyBeneficial;

  return (
    <div className="bg-white border border-[#E5E0D8] rounded-sm p-6 sm:p-7 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E0D8]">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#8E8B82] block flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5 text-[#257A72]" />
            ECONOMIC DECISION MATRIX // REPAIR VS. SELL AS-IS
          </span>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#141413] mt-0.5">
            Should you fix the faults before selling?
          </h3>
        </div>

        {/* Economic Verdict Pill */}
        <div
          className={`px-3 py-1.5 rounded-sm font-mono text-xs font-bold border flex items-center gap-1.5 self-start sm:self-center shrink-0 ${
            isBeneficial
              ? "bg-[#EDF5F0] text-[#1B3B2B] border-[#C6DFD0]"
              : "bg-[#FFF9F5] text-[#8C5E28] border-[#E8DCBF]"
          }`}
        >
          {isBeneficial ? (
            <>
              <TrendingUp className="w-4 h-4 text-[#1B3B2B]" />
              <span>Fixing Faults Profitable (+₹{economics.incrementalBenefitMid.toLocaleString()})</span>
            </>
          ) : (
            <>
              <TrendingDown className="w-4 h-4 text-[#C8532C]" />
              <span>Selling As-Is Recommended</span>
            </>
          )}
        </div>
      </div>

      {/* Decision Summary Box */}
      <div
        className={`p-4 rounded-sm border font-mono text-xs space-y-1.5 ${
          isBeneficial
            ? "bg-[#EDF5F0]/60 border-[#C6DFD0] text-[#1B3B2B]"
            : "bg-[#FAF9F5] border-[#E5E0D8] text-[#141413]"
        }`}
      >
        <strong className="block text-sm font-bold text-[#141413]">
          {economics.recommendationHeadline}
        </strong>
        <p className="text-xs font-sans text-[#5A574F] leading-relaxed">
          {economics.recommendationExplanation}
        </p>
      </div>

      {/* Side-by-Side Financial Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-mono">
        {/* Option A: Sell As-Is */}
        <div
          className={`p-5 rounded-sm border transition-all flex flex-col justify-between ${
            !isBeneficial
              ? "bg-[#FAF9F5] border-[#1B3B2B] ring-2 ring-[#1B3B2B]/10"
              : "bg-white border-[#E5E0D8]"
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E0D8] text-xs">
              <span className="font-bold text-[#141413] uppercase">OPTION A: SELL AS-IS</span>
              <span className="text-[10px] bg-[#EFECE2] px-2 py-0.5 rounded-xs text-[#5A574F]">
                Zero Out-of-Pocket Cost
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-[#5A574F]">
                <span>Current Condition:</span>
                <strong className="text-[#141413]">{sellAsIs.conditionLabel}</strong>
              </div>
              <div className="flex justify-between items-center text-[#5A574F]">
                <span>Repair Cost Required:</span>
                <span className="text-[#1B3B2B] font-semibold">₹0</span>
              </div>
              <div className="flex justify-between items-center text-[#5A574F]">
                <span>Estimated Selling Fees:</span>
                <span className="text-[#1B3B2B] font-semibold">₹0 (Doorstep/Store)</span>
              </div>
            </div>

            {/* Total Proceeds */}
            <div className="pt-3 border-t border-[#E5E0D8]">
              <span className="text-[10px] text-[#8E8B82] uppercase block">Expected Net Cash</span>
              <div className="text-3xl font-serif font-bold text-[#141413]">
                ₹{sellAsIs.netProceeds.toLocaleString()}
              </div>
              <span className="text-[11px] text-[#736F66] block mt-0.5">
                Immediate payout via {sellAsIs.topProviderName}
              </span>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-[#E5E0D8]">
            <span className="text-[10px] text-[#8E8B82] uppercase block mb-1">Key Trade-off:</span>
            <p className="text-[11px] font-sans text-[#5A574F] leading-tight">
              Fastest cash turnaround. No risk of poor repair workmanship or non-genuine part disputes.
            </p>
          </div>
        </div>

        {/* Option B: Repair, then Sell */}
        <div
          className={`p-5 rounded-sm border transition-all flex flex-col justify-between ${
            isBeneficial
              ? "bg-[#FAF9F5] border-[#1B3B2B] ring-2 ring-[#1B3B2B]/10"
              : "bg-white border-[#E5E0D8]"
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E0D8] text-xs">
              <span className="font-bold text-[#141413] uppercase">OPTION B: REPAIR &rarr; THEN SELL</span>
              <span className="text-[10px] bg-[#EFECE2] px-2 py-0.5 rounded-xs text-[#5A574F]">
                Requires Capital
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-[#5A574F]">
                <span>Upgraded Condition Grade:</span>
                <strong className="text-[#1B3B2B]">{repairThenSell.upgradedConditionLabel}</strong>
              </div>
              <div className="flex justify-between items-center text-[#5A574F]">
                <span>Expected Resale Uplift:</span>
                <strong className="text-[#141413]">
                  ₹{repairThenSell.expectedResaleValueAfterRepair.toLocaleString()}
                </strong>
              </div>
              <div className="flex justify-between items-center text-[#5A574F]">
                <span>Estimated Repair Expenses:</span>
                <span className="text-[#C8532C] font-semibold">
                  -₹{repairThenSell.totalRepairCostMid.toLocaleString()} (₹{repairThenSell.totalRepairCostRange.min.toLocaleString()} - ₹{repairThenSell.totalRepairCostRange.max.toLocaleString()})
                </span>
              </div>
            </div>

            {/* Total Proceeds */}
            <div className="pt-3 border-t border-[#E5E0D8]">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] text-[#8E8B82] uppercase block">Net Proceeds After Repair</span>
                  <div className="text-3xl font-serif font-bold text-[#141413]">
                    ₹{repairThenSell.netProceedsAfterRepair.toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#8E8B82] uppercase block">Incremental Gain</span>
                  <span
                    className={`text-sm font-bold ${
                      isBeneficial ? "text-[#1B3B2B]" : "text-[#C8532C]"
                    }`}
                  >
                    {economics.incrementalBenefitMid >= 0 ? "+" : ""}
                    ₹{economics.incrementalBenefitMid.toLocaleString()}
                  </span>
                </div>
              </div>
              <span className="text-[11px] text-[#736F66] block mt-0.5">
                Expected range: ₹{repairThenSell.netProceedsRange.min.toLocaleString()} - ₹{repairThenSell.netProceedsRange.max.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-[#E5E0D8]">
            <span className="text-[10px] text-[#8E8B82] uppercase block mb-1">Key Trade-off:</span>
            <p className="text-[11px] font-sans text-[#5A574F] leading-tight">
              Requires out-of-pocket payment and 2-5 days workshop turnaround before you can sell.
            </p>
          </div>
        </div>
      </div>

      {/* Itemized Repair Benchmarks Checklist */}
      {repairThenSell.itemizedRepairs.length > 0 && (
        <div className="space-y-3 pt-2 font-mono text-xs">
          <label className="block text-xs uppercase tracking-wider text-[#141413] font-bold">
            Itemized Repair Cost Estimates ({repairThenSell.itemizedRepairs.length} Declared Faults):
          </label>
          <div className="space-y-2">
            {repairThenSell.itemizedRepairs.map((item) => (
              <div
                key={item.faultId}
                className="p-3 bg-[#FAF9F5] border border-[#E5E0D8] rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <strong className="text-[#141413] block text-xs">{item.faultLabel}</strong>
                  <span className="text-[11px] text-[#5A574F] block">
                    Part: {item.partType} &bull; Sourced from: {item.source}
                  </span>
                  <span className="text-[10px] text-[#8E8B82] font-sans block mt-0.5">{item.notes}</span>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-bold text-sm text-[#141413]">
                    ₹{item.estimatedCostRange.min.toLocaleString()} - ₹{item.estimatedCostRange.max.toLocaleString()}
                  </span>
                  {item.sourceUrl && (
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-[#1B3B2B] hover:underline flex items-center justify-end gap-1 mt-0.5"
                    >
                      <span>Public Rates</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Qualitative Risk Disclosure */}
      <div className="p-4 bg-[#F7F5EE] border border-[#DFD9CD] rounded-xs font-mono text-xs text-[#5A574F] space-y-1.5">
        <div className="flex items-center gap-1.5 text-[#141413] font-semibold text-[11px] uppercase">
          <Info className="w-3.5 h-3.5 text-[#257A72]" />
          <span>Transparency &amp; Qualitative Risk Disclosure</span>
        </div>
        <p className="text-[11px] font-sans leading-relaxed text-[#413F3B]">
          {economics.qualitativeRiskWarning}
        </p>
        <div className="flex items-center justify-between text-[10px] text-[#8E8B82] pt-1 border-t border-[#DFD9CD]">
          <span>VERIFIED BENCHMARKS: {dataConfidence.lastVerifiedDate}</span>
          <span>{dataConfidence.disclaimer}</span>
        </div>
      </div>

      {/* Proceed to Resale Offers CTA */}
      {onProceedToResale && (
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onProceedToResale}
            className="px-5 py-2.5 bg-[#1B3B2B] hover:bg-[#132A1F] text-white font-mono text-xs uppercase tracking-wider font-semibold rounded-sm transition-colors flex items-center gap-2 shadow-xs"
          >
            <span>Proceed to Verified Resale Offers</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
