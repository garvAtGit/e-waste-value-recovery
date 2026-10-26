import React from "react";
import { EvaluatedPathway, ValueType } from "@/lib/comparison/types";
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowUpRight,
  Leaf,
} from "lucide-react";

interface PathwayCardProps {
  pathway: EvaluatedPathway;
  isPrimary?: boolean;
  onExploreAction?: (pathwayId: string) => void;
  onStartCase?: (pathwayId: string, providerId?: string) => void;
}

export function PathwayCard({
  pathway,
  isPrimary = false,
  onStartCase,
}: PathwayCardProps) {
  const renderValueTypeBadge = (type: ValueType) => {
    switch (type) {
      case "cash_payout":
        return (
          <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 bg-[#EBF2ED] text-[#1B3B2B] rounded-xs border border-[#C3D9CB]">
            Liquid Cash (P2P / Kiosk)
          </span>
        );
      case "exchange_voucher":
        return (
          <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 bg-[#EDF5F7] text-[#18535E] rounded-xs border border-[#C5DFE4]">
            Store-Locked Voucher
          </span>
        );
      case "repair_expense":
        return (
          <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 bg-[#FEF6E8] text-[#8C5209] rounded-xs border border-[#F2D7A5]">
            Repair Expense (Retains Utility)
          </span>
        );
      case "salvage_cash":
        return (
          <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 bg-[#EFECE2] text-[#413F3B] rounded-xs border border-[#D4CDC0]">
            Donor Component Salvage
          </span>
        );
      case "non_monetary_social":
        return (
          <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 bg-[#F4F1E8] text-[#5C4570] rounded-xs border border-[#DCD3E6]">
            Social &amp; Educational Utility
          </span>
        );
      case "regulated_recycling":
        return (
          <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 bg-[#EFECE2] text-[#6B675E] rounded-xs border border-[#D4CDC0]">
            Certified Safe Recovery (Zero Landfill)
          </span>
        );
    }
  };

  const renderEligibilityHeader = () => {
    switch (pathway.eligibility) {
      case "recommended_primary":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#1B3B2B] text-[#F7F5EE] text-[10px] font-mono uppercase tracking-widest font-bold rounded-xs border border-[#142D21]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#C1DFDC]" />
            Recommended Primary Option
          </span>
        );
      case "viable_alternative":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#EFECE2] text-[#413F3B] text-[10px] font-mono uppercase tracking-wider font-semibold rounded-xs border border-[#D4CDC0]">
            Viable Alternative
          </span>
        );
      case "conditionally_eligible":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#FEF6E8] text-[#8C5209] text-[10px] font-mono uppercase tracking-wider font-semibold rounded-xs border border-[#F2D7A5]">
            <AlertCircle className="w-3 h-3 text-[#C8532C]" />
            Conditionally Eligible
          </span>
        );
      case "excluded":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#FBECE6] text-[#A63C19] text-[10px] font-mono uppercase tracking-wider font-semibold rounded-xs border border-[#F2C2B2]">
            <XCircle className="w-3 h-3 text-[#C8532C]" />
            Excluded for this Profile
          </span>
        );
    }
  };

  const isExcluded = pathway.eligibility === "excluded";
  const matchedProvider = pathway.matchedProviders[0] || null;

  return (
    <div
      className={`border rounded-sm transition-all duration-200 ${
        isPrimary
          ? "bg-[#FAF8F3] border-[#1B3B2B] ring-2 ring-[#1B3B2B]/15 shadow-sm"
          : isExcluded
          ? "bg-[#F7F5EE]/60 border-[#DFD9CD] opacity-80"
          : "bg-[#FAF8F3] border-[#D4CDC0] hover:border-[#1B3B2B] shadow-2xs"
      }`}
    >
      {/* Top Ledger Header */}
      <div className="p-5 sm:p-6 border-b border-[#E5E0D4] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {renderEligibilityHeader()}
          {renderValueTypeBadge(pathway.valueType)}
        </div>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#141413]">
              {pathway.title}
            </h3>
            <p className="text-xs text-[#413F3B] mt-1 font-sans leading-relaxed">
              {pathway.eligibilityReason}
            </p>
          </div>
        </div>
      </div>

      {/* Main Quantitative Matrix Table */}
      <div className="p-5 sm:p-6 space-y-4 font-mono text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-[#F4F1E8] border border-[#DFD9CD] rounded-xs">
          <div>
            <span className="text-[10px] text-[#736F66] uppercase block">Expected Value / Cost</span>
            <strong className="text-sm text-[#141413] block mt-0.5">
              {pathway.valueDescription}
            </strong>
          </div>
          <div>
            <span className="text-[10px] text-[#736F66] uppercase block">Turnaround Speed</span>
            <span className="text-xs text-[#383632] block mt-0.5 font-semibold">
              {pathway.speed}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-[#736F66] uppercase block">Effort Required</span>
            <span className="text-xs text-[#383632] block mt-0.5 font-semibold">
              {pathway.effortRequired}
            </span>
          </div>
        </div>

        {/* Action Directive Note */}
        {pathway.nextAction && (
          <div className="flex items-start gap-2 p-2.5 bg-[#EBF2ED] border border-[#C3D9CB] rounded-xs text-[11px] text-[#1B3B2B]">
            <Leaf className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span className="leading-snug">{pathway.nextAction}</span>
          </div>
        )}

        {/* Matched Providers or Unmatched Notice */}
        <div className="pt-2 border-t border-[#E5E0D4] space-y-2">
          <div className="flex items-center justify-between text-[11px] text-[#736F66] uppercase">
            <span>Provider Coverage:</span>
            <span>
              {pathway.matchedProviders.length > 0
                ? `${pathway.matchedProviders.length} Verified in Area`
                : "No Exact Pincode Match"}
            </span>
          </div>

          {pathway.matchedProviders.length > 0 && matchedProvider ? (
            <div className="p-3 bg-[#FAF8F3] border border-[#D4CDC0] rounded-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-xs text-[#141413]">
                  {matchedProvider.name}
                </span>
                <span className="text-[9px] uppercase px-1.5 py-0.5 bg-[#EFECE2] text-[#413F3B] rounded-xs">
                  {matchedProvider.verificationStatus.replace(/_/g, " ")}
                </span>
              </div>
              <p className="text-[11px] text-[#6B675E] font-sans leading-normal">
                {matchedProvider.dropoffAddress || matchedProvider.serviceDescription || "Verified intake depot"}
              </p>
            </div>
          ) : (
            <div className="p-2.5 bg-[#F7F5EE] border border-[#DFD9CD] rounded-xs text-[11px] text-[#736F66] font-sans">
              No physical provider has confirmed coverage for this specific pincode and condition. You may consult the full Delhi directory or municipal collection bays.
            </div>
          )}
        </div>

        {/* Action Button: Initiate Recovery Case */}
        {!isExcluded && onStartCase && (
          <div className="pt-3 border-t border-[#E5E0D4] flex items-center justify-between gap-4">
            <span className="text-[10px] text-[#736F66] uppercase">
              Free Case Manifest · No Sign-in
            </span>
            <button
              type="button"
              onClick={() => onStartCase(pathway.pathwayId, matchedProvider?.id)}
              className="px-4 py-2 bg-[#1B3B2B] hover:bg-[#142D21] text-[#F7F5EE] text-xs font-mono uppercase tracking-wider rounded-sm transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <span>Initiate Case</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#C1DFDC]" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
