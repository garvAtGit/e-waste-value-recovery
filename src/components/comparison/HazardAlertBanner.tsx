import React from "react";
import { AlertTriangle, Flame, ShieldAlert } from "lucide-react";

interface HazardAlertBannerProps {
  headline: string;
  stopUseWarning: string;
  handlingSteps: string[];
}

export function HazardAlertBanner({
  headline,
  stopUseWarning,
  handlingSteps,
}: HazardAlertBannerProps) {
  return (
    <div className="bg-[#FBECE6] border-2 border-[#C8532C] rounded-sm p-6 sm:p-8 mb-8 text-[#141413] shadow-xs">
      {/* Header Warning Stamp */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#F2C2B2] mb-4 font-mono">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#C8532C] text-[#F7F5EE] text-[11px] font-bold uppercase tracking-wider rounded-xs">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          THERMAL / CHEMICAL RISK &bull; STOP USE
        </span>
        <span className="text-[11px] uppercase tracking-wider text-[#A63C19] font-semibold">
          Commercial Pathways Blocked
        </span>
      </div>

      <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#141413] mb-3">
        {headline}
      </h3>

      <p className="text-xs sm:text-sm text-[#413F3B] leading-relaxed mb-6 font-sans">
        {stopUseWarning}
      </p>

      {/* Handling Steps Protocol */}
      <div className="bg-[#FAF8F3] rounded-xs p-5 border border-[#F2C2B2] mb-5">
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#A63C19] mb-3 flex items-center gap-2">
          <Flame className="w-4 h-4 text-[#C8532C]" />
          Mandatory Safe Handling Protocol:
        </h4>
        <ul className="space-y-2.5 text-xs text-[#383632] font-mono">
          {handlingSteps.map((step, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <span className="w-4 h-4 rounded-xs bg-[#C8532C] text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                0{idx + 1}
              </span>
              <span className="leading-snug">{step}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Strict Prohibition Footnote */}
      <div className="bg-[#F4F1E8] border border-[#DFD9CD] rounded-xs p-3.5 flex items-start gap-2.5 text-xs font-mono text-[#732B13]">
        <ShieldAlert className="w-4 h-4 text-[#C8532C] shrink-0 mt-0.5" />
        <span className="leading-snug">
          <strong>Strict Safety Protocol:</strong> Do NOT attempt to sell, trade-in, donate, or repair this device.
          Do NOT puncture or compress swollen battery cells. Hand over exclusively to an accredited hazardous waste handling bay.
        </span>
      </div>
    </div>
  );
}
