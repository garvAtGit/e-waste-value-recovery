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
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5" /> Environmental &amp; Operational Analytics
              </span>
              <span className="text-xs text-slate-400">&bull;</span>
              <span className="text-xs text-slate-400">Actual Case Accounting</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              Recovery Impact &amp; Platform Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Transparent reporting derived from verified user cases and documented provider capabilities. All metrics explicitly distinguish user-reported milestones from provider-verified outcomes.
            </p>
          </div>

          <Link
            href="/find-option"
            className="shrink-0 px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center gap-2"
          >
            <span>Start an Assessment</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
          <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60">
            <span className="text-xs text-slate-400 block mb-1">Total Cases Initiated</span>
            <strong className="text-2xl sm:text-3xl font-extrabold text-white">
              {overview.totalRecoveryCasesInitiated}
            </strong>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60">
            <span className="text-xs text-emerald-300 block mb-1">Completion Rate</span>
            <strong className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
              {overview.completionRatePct}%
            </strong>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60">
            <span className="text-xs text-indigo-300 block mb-1">Provider Acceptance</span>
            <strong className="text-2xl sm:text-3xl font-extrabold text-indigo-400">
              {overview.providerAcceptanceRatePct}%
            </strong>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60">
            <span className="text-xs text-amber-300 block mb-1">Provider-Verified Outcomes</span>
            <strong className="text-2xl sm:text-3xl font-extrabold text-amber-400">
              {outcomesByVerificationTier.providerVerifiedCount}
            </strong>
          </div>
        </div>
      </div>

      {/* Environmental Impact Section with Transparent Methodology */}
      <div className="bg-emerald-950/20 border-2 border-emerald-800/60 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-800/40">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
              <Leaf className="w-4 h-4 text-emerald-700" />
              Documented Environmental Savings
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Material Diversion &amp; Embodied Emissions
            </h2>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full border border-emerald-300 self-start sm:self-center">
            {outcomesByVerificationTier.totalCompleted} Completed Recovery Outcomes
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-emerald-200 shadow-2xs">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold block mb-1">
              Estimated Physical E-Waste Diverted:
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                {environmentalImpact.totalEwasteDivertedKg}
              </span>
              <span className="text-base font-bold text-slate-600">kg diverted</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Calculated based on representative hardware equipment mass diverted from municipal landfills.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-emerald-200 shadow-2xs">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold block mb-1">
              Embodied Greenhouse Gases Deferred:
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-emerald-800">
                {environmentalImpact.embodiedGhgDeferredKgCo2e}
              </span>
              <span className="text-base font-bold text-emerald-700">kg CO₂e</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Estimated manufacturing and virgin mineral refining emissions deferred through lifecycle extension.
            </p>
          </div>
        </div>

        {/* Methodology & Limitations Disclosure */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 text-xs space-y-3">
          <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            Methodology, Assumptions &amp; Limitations Notice:
          </h3>
          <p className="text-slate-600 leading-relaxed">
            <strong>Data Basis:</strong> {environmentalImpact.methodologyNotes.dataBasis}
          </p>
          <ul className="space-y-1 text-slate-600 list-disc pl-4">
            {environmentalImpact.methodologyNotes.assumptions.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            <strong>Limitations:</strong> {environmentalImpact.methodologyNotes.limitations.join(" ")}
          </div>
        </div>
      </div>

      {/* Grid: Pathways Breakdown / Outcomes & Rejection Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Pathways Distribution */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-800" />
              Recovery Funnel by Pathway
            </h3>
            <span className="text-xs text-slate-400 font-mono">6 Routes Evaluated</span>
          </div>

          <div className="space-y-4">
            {casesByPathway.map((p) => {
              const pct = overview.totalRecoveryCasesInitiated > 0
                ? Math.round((p.totalCases / overview.totalRecoveryCasesInitiated) * 100)
                : 0;

              return (
                <div key={p.pathwayId} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <strong className="text-slate-800 capitalize font-semibold">
                      {p.pathwayId.replace(/-/g, " ")}
                    </strong>
                    <span className="text-slate-500 font-mono">
                      {p.totalCases} cases ({pct}%) &bull; {p.completedCases} completed
                    </span>
                  </div>

                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-700 h-full transition-all"
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
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <ShieldCheck className="w-4 h-4 text-emerald-800" />
              Provider Verification Coverage
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Approved Directory:</span>
                <strong className="text-lg font-bold text-slate-900">{providerIntelligence.approvedProviders}</strong>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Pending Review:</span>
                <strong className="text-lg font-bold text-amber-700">{providerIntelligence.pendingReviewCandidates}</strong>
              </div>
            </div>

            <div className="text-xs text-slate-600 space-y-1.5 pt-2">
              <div className="flex justify-between">
                <span>Verified Documentary Evidence:</span>
                <strong className="text-slate-800">{providerIntelligence.verifiedTiers.verified}</strong>
              </div>
              <div className="flex justify-between">
                <span>Partially Verified (Editorial flag):</span>
                <strong className="text-slate-800">{providerIntelligence.verifiedTiers.partially_verified}</strong>
              </div>
              <div className="flex justify-between">
                <span>Public Drop-off Depots:</span>
                <strong className="text-slate-800">{providerIntelligence.publicDropoffDepotsCount}</strong>
              </div>
              <div className="flex justify-between">
                <span>Offices (Walk-in Unconfirmed):</span>
                <strong className="text-slate-800">{providerIntelligence.officeFacilitiesCount}</strong>
              </div>
            </div>
          </div>

          {/* Authentic Rejection / Ineligibility Reasons */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <AlertTriangle className="w-4 h-4 text-rose-700" />
              Documented Rejection Reasons
            </h3>

            {rejectionAndFailureReasons.length > 0 ? (
              <ul className="space-y-2 text-xs">
                {rejectionAndFailureReasons.map((item, idx) => (
                  <li key={idx} className="flex items-start justify-between gap-2 p-2 rounded-lg bg-rose-50/50 border border-rose-100">
                    <span className="text-rose-950 font-medium">{item.reason}</span>
                    <span className="text-[11px] font-mono text-rose-800 font-bold shrink-0">
                      {item.count} case{item.count === 1 ? "" : "s"}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400 italic">No rejection reasons recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
