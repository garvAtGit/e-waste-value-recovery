import React from "react";
import { EvaluatedPathway, ValueType } from "@/lib/comparison/types";
import { Badge } from "../ui/Badge";
import {
  CheckCircle2,
  Clock,
  Gauge,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  XCircle,
  Building2,
  Truck,
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
  onExploreAction,
  onStartCase,
}: PathwayCardProps) {
  // Format Value Type badge
  const renderValueTypeBadge = (type: ValueType) => {
    switch (type) {
      case "cash_payout":
        return (
          <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-md border border-emerald-200">
            Cash Return (P2P / Direct)
          </span>
        );
      case "exchange_voucher":
        return (
          <span className="text-xs font-semibold px-2.5 py-1 bg-sky-50 text-sky-800 rounded-md border border-sky-200">
            Store-locked Voucher (Credit Only)
          </span>
        );
      case "repair_expense":
        return (
          <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-900 rounded-md border border-amber-200">
            Repair Expense (Cost to Retain Utility)
          </span>
        );
      case "salvage_cash":
        return (
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-800 rounded-md border border-slate-300">
            Donor Salvage Payout
          </span>
        );
      case "non_monetary_social":
        return (
          <span className="text-xs font-semibold px-2.5 py-1 bg-purple-50 text-purple-900 rounded-md border border-purple-200">
            Social & Educational Utility (Zero Cash)
          </span>
        );
      case "regulated_recycling":
        return (
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
            Regulated Safe Recovery (Nominal / Zero)
          </span>
        );
    }
  };

  // Eligibility Status Header
  const renderEligibilityHeader = () => {
    switch (pathway.eligibility) {
      case "recommended_primary":
        return (
          <Badge variant="emerald" className="gap-1.5 font-bold uppercase text-[11px] tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            Recommended Primary Option
          </Badge>
        );
      case "viable_alternative":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-300">
            Viable Alternative
          </span>
        );
      case "conditionally_eligible":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
            <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
            Conditionally Eligible
          </span>
        );
      case "excluded":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-rose-100 text-rose-900 border border-rose-300">
            <XCircle className="w-3.5 h-3.5 text-rose-700" />
            Excluded for this Case
          </span>
        );
    }
  };

  const isExcluded = pathway.eligibility === "excluded";

  return (
    <div
      className={`rounded-2xl p-6 sm:p-7 border-2 transition-all flex flex-col justify-between ${
        isPrimary
          ? "bg-white border-emerald-600 shadow-sm"
          : isExcluded
          ? "bg-slate-50/70 border-slate-200 opacity-80"
          : "bg-white border-slate-200 shadow-2xs hover:border-slate-300"
      }`}
    >
      <div>
        {/* Status header & Value type */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          {renderEligibilityHeader()}
          {renderValueTypeBadge(pathway.valueType)}
        </div>

        {/* Title */}
        <h3
          className={`text-xl font-bold tracking-tight mb-2 ${
            isExcluded ? "text-slate-600 line-through decoration-slate-400" : "text-slate-900"
          }`}
        >
          {pathway.title}
        </h3>

        {/* Value Description */}
        <p className="text-xs sm:text-sm text-slate-600 mb-4 leading-relaxed font-medium">
          {pathway.valueDescription}
        </p>

        {/* Effort & Turnaround metadata */}
        {!isExcluded && (
          <div className="flex flex-wrap gap-4 text-xs text-slate-500 mb-4 pb-3 border-b border-slate-100">
            <span className="inline-flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-slate-400" />
              Effort: <strong className="text-slate-800">{pathway.effortRequired}</strong>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Turnaround: <strong className="text-slate-800">{pathway.speed}</strong>
            </span>
          </div>
        )}

        {/* Eligibility reason explanation */}
        <div
          className={`p-3.5 rounded-xl text-xs mb-5 border ${
            isExcluded
              ? "bg-rose-50/60 border-rose-200 text-rose-900"
              : isPrimary
              ? "bg-emerald-50/60 border-emerald-200 text-emerald-950 font-medium"
              : "bg-slate-50 border-slate-200 text-slate-700"
          }`}
        >
          <strong className="block mb-1 font-semibold">
            {isExcluded ? "Why excluded:" : "Evaluation justification:"}
          </strong>
          <span className="leading-relaxed block">{pathway.eligibilityReason}</span>
        </div>

        {/* Matched Providers or Clear Absence Statement */}
        {!isExcluded && (
          <div className="mb-5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-2">
              Documented Provider Matches:
            </span>

            {pathway.matchedProviders.length > 0 ? (
              <div className="space-y-2.5">
                {pathway.matchedProviders.map((provider) => (
                  <div
                    key={provider.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-col gap-1.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <strong className="text-slate-900 font-semibold">{provider.name}</strong>
                        {provider.isSampleData && (
                          <span className="text-[10px] font-semibold text-amber-900 bg-amber-100/90 border border-amber-300 px-2 py-0.5 rounded">
                            DEMO FIXTURE
                          </span>
                        )}
                        {provider.minimumQuantity && provider.minimumQuantity > 1 ? (
                          <span className="text-[10px] font-semibold text-purple-900 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded">
                            Bulk Only (Min. {provider.minimumQuantity} units)
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-emerald-900 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                            Single Device Intake
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        {provider.verificationStatus === "verified" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <ShieldCheck className="w-3 h-3 text-emerald-700" /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            <AlertCircle className="w-3 h-3 text-amber-700" /> Partially Verified
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {provider.quoteType === "confirmed_quote"
                            ? "Confirmed Quote"
                            : provider.quoteType === "indicative_estimate"
                            ? "Indicative Estimate"
                            : "Quote Required"}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Truck className="w-3 h-3" /> Pickup: {provider.offersPickup ? "Available" : "Not offered"}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Building2 className="w-3 h-3" /> Drop-off: {provider.offersDropoff ? "Available" : "Not offered"}
                      </span>
                      {provider.pincodeMatched && (
                        <span className="text-emerald-700 font-semibold">&bull; Exact Pincode Matched</span>
                      )}
                    </div>

                    {provider.dropoffAddress && (
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        <strong className="text-slate-700">Drop-off:</strong> {provider.dropoffAddress}
                      </p>
                    )}

                    {provider.eligibilityRestrictions && (
                      <p className="text-[11px] text-amber-900 bg-amber-50/80 rounded px-2 py-1 border border-amber-200 mt-0.5">
                        <strong className="text-amber-950">Restrictions:</strong> {provider.eligibilityRestrictions}
                      </p>
                    )}

                    <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400">
                      <span>
                        Last checked:{" "}
                        {provider.lastCheckedAt
                          ? new Date(provider.lastCheckedAt).toLocaleDateString("en-GB", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "Not recorded"}
                      </span>
                      <div className="flex items-center gap-3">
                        {provider.websiteUrl && (
                          <a
                            href={provider.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-slate-700 hover:text-slate-900 font-semibold hover:underline"
                          >
                            <span>Official Portal</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                        {provider.sourceEvidenceUrl ? (
                          <a
                            href={provider.sourceEvidenceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold hover:underline"
                          >
                            <span>Evidence Source</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ) : (
                          <span className="italic text-slate-400">Evidence URL unverified</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3.5 bg-slate-50/90 rounded-xl border border-dashed border-slate-300 text-xs text-slate-600 space-y-2 leading-relaxed">
                {pathway.valueType === "regulated_recycling" ? (
                  <div>
                    <strong className="block text-slate-900 font-semibold mb-1">
                      No verified hazardous handler recorded on file for this query.
                    </strong>
                    <p className="mb-2">
                      We do not have an independently verified record of an accredited facility accepting physically compromised or swollen cells for this location.
                    </p>
                    <div className="bg-rose-50 border border-rose-200 rounded-lg p-2.5 text-[11px] text-rose-900 space-y-1">
                      <strong>Safe handling next steps:</strong>
                      <p>1. Do not deliver unannounced to standard scrap yards or curbside bins.</p>
                      <p>2. Keep the unit isolated in a fire-safe, non-combustible container away from flammable materials.</p>
                      <p>3. In Delhi: Contact DPCC (Delhi Pollution Control Committee) or your local municipal sanitation department for hazardous waste drop-off directives.</p>
                    </div>
                  </div>
                ) : pathway.providerCoverageStatus === "no_pincode_coverage" ? (
                  <div>
                    <strong className="block text-slate-900 font-semibold mb-1">
                      No documented provider match for your exact pincode.
                    </strong>
                    <p className="mb-1.5">
                      This does not mean local operators do not exist, but we do not have an independently verified record on file for this specific area. Coverage is never inferred based solely on state presence.
                    </p>
                    <div className="text-[11px] text-slate-600 bg-white border border-slate-200 rounded-lg p-2.5 space-y-1">
                      <strong>Recommended next steps:</strong>
                      <p>&bull; Check whether the device manufacturer provides doorstep courier mail-in service from any pincode.</p>
                      <p>&bull; Review the <a href="/directory" className="text-emerald-800 font-semibold underline">Provider Directory</a> without location filters to inspect regional workshop facilities with mail-in options.</p>
                      <p>&bull; Contact authorized municipal electronics collection drives in your district.</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <strong className="block text-slate-900 font-semibold mb-1">
                      No matching approved provider currently listed.
                    </strong>
                    <p>
                      We do not display unverified commercial providers without documented acceptance evidence. Candidate listings remain in editorial review until their licensing and service terms are verified.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Practical Unknowns to Confirm */}
        {!isExcluded && pathway.unknownsToConfirm.length > 0 && (
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-2 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
              Critical Unknowns You Must Confirm:
            </span>
            <ul className="space-y-1.5 text-xs text-slate-600">
              {pathway.unknownsToConfirm.map((unknown, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-slate-400 font-bold shrink-0">&bull;</span>
                  <span className="leading-snug">{unknown}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Next practical action */}
      <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Next Practical Step:
          </span>
          <p className="text-xs text-slate-700 font-medium leading-relaxed">
            {pathway.nextAction}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!isExcluded && onStartCase && (
            <button
              type="button"
              onClick={() => onStartCase(pathway.pathwayId, pathway.matchedProviders[0]?.id)}
              className="text-xs font-bold px-3.5 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white transition-colors cursor-pointer shadow-2xs"
            >
              Start Case
            </button>
          )}
          {!isExcluded && onExploreAction && (
            <button
              type="button"
              onClick={() => onExploreAction(pathway.pathwayId)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
            >
              Explore Pathway
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
