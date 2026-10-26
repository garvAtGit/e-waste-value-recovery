"use client";

import React from "react";
import { PlatformAnalytics } from "@/lib/analytics/engine";
import Link from "next/link";
import {
  Leaf,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Layers,
  FileText,
} from "lucide-react";

interface AnalyticsDashboardProps {
  analytics: PlatformAnalytics;
}

export function AnalyticsDashboard({ analytics }: AnalyticsDashboardProps) {
  const {
    overview,
    outcomesByVerificationTier,
    casesByPathway,
    rejectionAndFailureReasons,
    providerIntelligence,
    environmentalImpact,
  } = analytics;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Page Header */}
      <div className="bg-[#141413] text-[#F7F5EE] rounded-sm p-6 sm:p-10 border border-[#2D2C28] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#2D2C28]">
          <div>
            <div className="flex items-center gap-2 mb-2 font-mono text-[11px] uppercase tracking-wider">
              <span className="px-2.5 py-0.5 rounded-sm bg-[#1B3B2B] text-[#A3D9B1] border border-[#2C5E45] flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5" /> Environmental &amp; Operational Analytics
              </span>
              <span className="text-[#8E8B82]">&bull;</span>
              <span className="text-[#BDB9AE]">Actual Case Accounting</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-[#F7F5EE]">
              Recovery Impact &amp; Platform Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-[#BDB9AE] mt-2 max-w-2xl leading-relaxed">
              Transparent reporting derived from verified user cases and documented provider capabilities. All metrics explicitly distinguish user-reported milestones from provider-verified outcomes.
            </p>
          </div>

          <Link
            href="/find-option"
            className="shrink-0 px-5 py-3 bg-[#1B3B2B] hover:bg-[#132A1F] text-white font-mono uppercase tracking-wider font-semibold rounded-sm text-xs transition-colors flex items-center gap-2 border border-[#2C5E45] shadow-xs"
          >
            <span>Start an Assessment</span>
            <ArrowRight className="w-4 h-4 text-[#A3D9B1]" />
          </Link>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 font-mono">
          <div className="bg-[#20201E] rounded-sm p-4 border border-[#35332F]">
            <span className="text-xs text-[#8E8B82] uppercase tracking-wider block mb-1">Total Cases Initiated</span>
            <strong className="text-2xl sm:text-3xl font-bold text-white">
              {overview.totalRecoveryCasesInitiated}
            </strong>
          </div>

          <div className="bg-[#20201E] rounded-sm p-4 border border-[#35332F]">
            <span className="text-xs text-[#A3D9B1] uppercase tracking-wider block mb-1">Completion Rate</span>
            <strong className="text-2xl sm:text-3xl font-bold text-[#A3D9B1]">
              {overview.completionRatePct}%
            </strong>
          </div>

          <div className="bg-[#20201E] rounded-sm p-4 border border-[#35332F]">
            <span className="text-xs text-[#8BB9E5] uppercase tracking-wider block mb-1">Provider Acceptance</span>
            <strong className="text-2xl sm:text-3xl font-bold text-[#8BB9E5]">
              {overview.providerAcceptanceRatePct}%
            </strong>
          </div>

          <div className="bg-[#20201E] rounded-sm p-4 border border-[#35332F]">
            <span className="text-xs text-[#E5A88B] uppercase tracking-wider block mb-1">Provider-Verified Outcomes</span>
            <strong className="text-2xl sm:text-3xl font-bold text-[#E5A88B]">
              {outcomesByVerificationTier.providerVerifiedCount}
            </strong>
          </div>
        </div>
      </div>

      {/* Environmental Impact Section with Transparent Methodology */}
      <div className="bg-white border border-[#E5E0D8] rounded-sm p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E0D8]">
          <div>
            <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-[#1B3B2B] uppercase tracking-wider mb-1">
              <Leaf className="w-4 h-4 text-[#1B3B2B]" />
              Documented Environmental Savings
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#141413]">
              Material Diversion &amp; Embodied Emissions
            </h2>
          </div>
          <span className="font-mono text-xs font-semibold px-3 py-1 bg-[#EDF5F0] text-[#1B3B2B] rounded-sm border border-[#C6DFD0] self-start sm:self-center">
            {outcomesByVerificationTier.totalCompleted} Completed Recovery Outcomes
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-[#FAF9F5] rounded-sm p-6 border border-[#E5E0D8]">
            <span className="font-mono text-xs text-[#8E8B82] uppercase tracking-wider block mb-1">
              Estimated Physical E-Waste Diverted:
            </span>
            <div className="flex items-baseline gap-2 font-mono">
              <span className="text-3xl sm:text-4xl font-bold text-[#141413]">
                {environmentalImpact.totalEwasteDivertedKg}
              </span>
              <span className="text-base text-[#5A574F]">kg diverted</span>
            </div>
            <p className="text-xs text-[#5A574F] mt-2 leading-relaxed">
              Calculated based on representative hardware equipment mass diverted from municipal landfills.
            </p>
          </div>

          <div className="bg-[#FAF9F5] rounded-sm p-6 border border-[#E5E0D8]">
            <span className="font-mono text-xs text-[#8E8B82] uppercase tracking-wider block mb-1">
              Embodied Greenhouse Gases Deferred:
            </span>
            <div className="flex items-baseline gap-2 font-mono">
              <span className="text-3xl sm:text-4xl font-bold text-[#1B3B2B]">
                {environmentalImpact.embodiedGhgDeferredKgCo2e}
              </span>
              <span className="text-base text-[#1B3B2B]">kg CO₂e</span>
            </div>
            <p className="text-xs text-[#5A574F] mt-2 leading-relaxed">
              Estimated manufacturing and virgin mineral refining emissions deferred through lifecycle extension.
            </p>
          </div>
        </div>

        {/* Methodology & Limitations Disclosure */}
        <div className="bg-[#FAF9F5] rounded-sm p-5 border border-[#E5E0D8] text-xs space-y-3 font-mono">
          <h3 className="font-bold text-[#141413] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-[#5A574F]" />
            Methodology, Assumptions &amp; Limitations Notice:
          </h3>
          <p className="text-[#5A574F] leading-relaxed">
            <strong className="text-[#141413]">Data Basis:</strong> {environmentalImpact.methodologyNotes.dataBasis}
          </p>
          <ul className="space-y-1 text-[#5A574F] list-disc pl-4 text-[11px]">
            {environmentalImpact.methodologyNotes.assumptions.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
          <div className="pt-2 border-t border-[#E5E0D8] text-[11px] text-[#8E8B82]">
            <strong className="text-[#141413]">Limitations:</strong> {environmentalImpact.methodologyNotes.limitations.join(" ")}
          </div>
        </div>
      </div>

      {/* Grid: Pathways Breakdown / Outcomes & Rejection Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Pathways Distribution */}
        <div className="lg:col-span-7 bg-white border border-[#E5E0D8] rounded-sm p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E0D8]">
            <h3 className="font-serif text-base font-bold text-[#141413] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#1B3B2B]" />
              Recovery Funnel by Pathway
            </h3>
            <span className="text-xs text-[#8E8B82] font-mono">6 Routes Evaluated</span>
          </div>

          <div className="space-y-4 font-mono">
            {casesByPathway.map((p) => {
              const pct = overview.totalRecoveryCasesInitiated > 0
                ? Math.round((p.totalCases / overview.totalRecoveryCasesInitiated) * 100)
                : 0;

              return (
                <div key={p.pathwayId} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <strong className="text-[#141413] capitalize font-medium">
                      {p.pathwayId.replace(/-/g, " ")}
                    </strong>
                    <span className="text-[#5A574F] text-[11px]">
                      {p.totalCases} cases ({pct}%) &bull; {p.completedCases} completed
                    </span>
                  </div>

                  <div className="w-full h-2 bg-[#F4F1EA] rounded-sm overflow-hidden flex border border-[#E5E0D8]">
                    <div
                      className="bg-[#1B3B2B] h-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Provider Registry & Rejection Insights */}
        <div className="lg:col-span-5 space-y-6">
          {/* Provider Registry Intelligence */}
          <div className="bg-white border border-[#E5E0D8] rounded-sm p-6 shadow-xs space-y-4">
            <h3 className="font-serif text-base font-bold text-[#141413] flex items-center gap-2 pb-3 border-b border-[#E5E0D8]">
              <ShieldCheck className="w-4 h-4 text-[#1B3B2B]" />
              Provider Verification Coverage
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-[#FAF9F5] p-3 rounded-sm border border-[#E5E0D8]">
                <span className="text-[#8E8B82] block text-[10px] uppercase font-semibold">Approved Directory:</span>
                <strong className="text-lg font-bold text-[#141413]">{providerIntelligence.approvedProviders}</strong>
              </div>
              <div className="bg-[#FAF9F5] p-3 rounded-sm border border-[#E5E0D8]">
                <span className="text-[#8E8B82] block text-[10px] uppercase font-semibold">Pending Review:</span>
                <strong className="text-lg font-bold text-[#C8532C]">{providerIntelligence.pendingReviewCandidates}</strong>
              </div>
            </div>

            <div className="text-xs text-[#5A574F] space-y-1.5 pt-2 font-mono">
              <div className="flex justify-between">
                <span>Verified Documentary Evidence:</span>
                <strong className="text-[#141413]">{providerIntelligence.verifiedTiers.verified}</strong>
              </div>
              <div className="flex justify-between">
                <span>Partially Verified (Editorial flag):</span>
                <strong className="text-[#141413]">{providerIntelligence.verifiedTiers.partially_verified}</strong>
              </div>
              <div className="flex justify-between">
                <span>Public Drop-off Depots:</span>
                <strong className="text-[#141413]">{providerIntelligence.publicDropoffDepotsCount}</strong>
              </div>
              <div className="flex justify-between">
                <span>Offices (Walk-in Unconfirmed):</span>
                <strong className="text-[#141413]">{providerIntelligence.officeFacilitiesCount}</strong>
              </div>
            </div>
          </div>

          {/* Authentic Rejection / Ineligibility Reasons */}
          <div className="bg-white border border-[#E5E0D8] rounded-sm p-6 shadow-xs space-y-4">
            <h3 className="font-serif text-base font-bold text-[#141413] flex items-center gap-2 pb-3 border-b border-[#E5E0D8]">
              <AlertTriangle className="w-4 h-4 text-[#C8532C]" />
              Documented Rejection Reasons
            </h3>

            {rejectionAndFailureReasons.length > 0 ? (
              <ul className="space-y-2 text-xs font-mono">
                {rejectionAndFailureReasons.map((item, idx) => (
                  <li key={idx} className="flex items-start justify-between gap-2 p-2.5 rounded-sm bg-[#FFF9F5] border border-[#F3D1C2]">
                    <span className="text-[#C8532C] font-medium">{item.reason}</span>
                    <span className="text-[11px] text-[#C8532C] font-bold shrink-0">
                      {item.count} case{item.count === 1 ? "" : "s"}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-[#8E8B82] italic font-mono">No rejection reasons recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
