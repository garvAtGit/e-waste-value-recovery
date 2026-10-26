import React from "react";
import { AlertTriangle, Flame, XCircle } from "lucide-react";

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
    <div className="bg-rose-50 border-2 border-rose-600 rounded-2xl p-6 sm:p-8 mb-8 text-rose-950 shadow-sm">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-200 text-rose-950 text-xs font-bold rounded-full uppercase tracking-wider border border-rose-400">
          <AlertTriangle className="w-4 h-4 text-rose-800 shrink-0" />
          Immediate Safety Risk &bull; Stop Use
        </span>
        <span className="text-xs font-semibold text-rose-800">
          All Commercial & Reuse Pathways Suppressed
        </span>
      </div>

      <h3 className="text-2xl font-bold tracking-tight text-rose-950 mb-3">
        {headline}
      </h3>

      <p className="text-sm text-rose-900 leading-relaxed mb-6 font-medium">
        {stopUseWarning}
      </p>

      {/* Handling Steps */}
      <div className="bg-white rounded-xl p-5 border border-rose-200 mb-5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-rose-950 mb-3 flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-rose-700" />
          Mandatory Safe Handling Protocol:
        </h4>
        <ul className="space-y-2.5 text-xs text-rose-900">
          {handlingSteps.map((step, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <span className="w-4 h-4 rounded-full bg-rose-700 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span className="leading-snug">{step}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-rose-100/80 border border-rose-300 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-rose-900">
        <XCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
        <span className="leading-snug">
          <strong>Strict Prohibition:</strong> Do NOT attempt to sell, trade-in, donate, or repair this device.
          Do NOT dismantle or puncture swollen cells. Hand over only to an accredited hazardous waste facility.
        </span>
      </div>
    </div>
  );
}
