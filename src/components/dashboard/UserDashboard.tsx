"use client";

import React, { useState } from "react";
import { RecoveryCaseWithDetails, HUMAN_STATUS_LABELS } from "@/lib/recovery-cases/types";
import { getNextRecommendedAction } from "@/lib/recovery-cases/state-machine";
import Link from "next/link";
import {
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  FolderOpen,
  Leaf,
} from "lucide-react";

interface UserDashboardProps {
  initialCases: RecoveryCaseWithDetails[];
}

export function UserDashboard({ initialCases }: UserDashboardProps) {
  const [cases] = useState<RecoveryCaseWithDetails[]>(initialCases);
  const [filterTab, setFilterTab] = useState<"all" | "active" | "completed">("all");

  const activeCases = cases.filter(
    (c) =>
      c.current_status !== "completed" &&
      c.current_status !== "cancelled" &&
      c.current_status !== "failed" &&
      c.current_status !== "rejected_by_provider"
  );

  const completedCases = cases.filter((c) => c.current_status === "completed");
  const rejectedOrFailedCases = cases.filter(
    (c) => c.current_status === "rejected_by_provider" || c.current_status === "failed"
  );

  const displayedCases = cases.filter((c) => {
    if (filterTab === "active") {
      return (
        c.current_status !== "completed" &&
        c.current_status !== "cancelled"
      );
    }
    if (filterTab === "completed") {
      return c.current_status === "completed";
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Dashboard Top Header & Metrics Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                Personal Recovery Hub
              </span>
              <span className="text-xs text-slate-400">&bull;</span>
              <span className="text-xs text-slate-400">Validated Lifecycle Tracking</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              My Hardware Recovery Cases
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Track real-world device handover milestones, manage communications with verified local repairers and recyclers, and view authenticated recovery outcomes.
            </p>
          </div>

          <Link
            href="/find-option"
            className="shrink-0 px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center gap-2 shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Start New Recovery Case</span>
          </Link>
        </div>

        {/* Quick Summary KPI strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60">
            <span className="text-xs text-slate-400 block mb-1">Total Cases</span>
            <strong className="text-2xl font-bold text-white">{cases.length}</strong>
          </div>
          <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60">
            <span className="text-xs text-emerald-300 block mb-1">Active Cases</span>
            <strong className="text-2xl font-bold text-emerald-400">{activeCases.length}</strong>
          </div>
          <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60">
            <span className="text-xs text-slate-400 block mb-1">Completed Outcomes</span>
            <strong className="text-2xl font-bold text-white">{completedCases.length}</strong>
          </div>
          <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60">
            <span className="text-xs text-amber-300 block mb-1">Needs Alternative</span>
            <strong className="text-2xl font-bold text-amber-400">{rejectedOrFailedCases.length}</strong>
          </div>
        </div>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600 border border-slate-200">
          <button
            type="button"
            onClick={() => setFilterTab("all")}
            className={`px-4 py-1.5 rounded-lg transition-all ${
              filterTab === "all" ? "bg-white text-slate-900 shadow-2xs" : "hover:text-slate-900"
            }`}
          >
            All Cases ({cases.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("active")}
            className={`px-4 py-1.5 rounded-lg transition-all ${
              filterTab === "active" ? "bg-white text-slate-900 shadow-2xs" : "hover:text-slate-900"
            }`}
          >
            Active In-Progress ({activeCases.length + rejectedOrFailedCases.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("completed")}
            className={`px-4 py-1.5 rounded-lg transition-all ${
              filterTab === "completed" ? "bg-white text-slate-900 shadow-2xs" : "hover:text-slate-900"
            }`}
          >
            Completed ({completedCases.length})
          </button>
        </div>

        <Link
          href="/analytics"
          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950 underline"
        >
          <Leaf className="w-3.5 h-3.5 text-emerald-700" />
          <span>View Platform Environmental Impact &rarr;</span>
        </Link>
      </div>

      {/* Cases Cards Grid */}
      {displayedCases.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedCases.map((caseItem) => {
            const meta = HUMAN_STATUS_LABELS[caseItem.current_status] || {
              title: caseItem.current_status,
              step: "In Progress",
              badge: "bg-slate-100 text-slate-700",
            };

            const advice = getNextRecommendedAction(
              caseItem.current_status,
              caseItem.provider?.name,
              caseItem.is_provider_verified
            );

            return (
              <div
                key={caseItem.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${meta.badge}`}>
                      {meta.step}
                    </span>
                    {caseItem.is_provider_verified ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <ShieldCheck className="w-3 h-3 text-emerald-700" />
                        Verified
                      </span>
                    ) : (
                      <span suppressHydrationWarning className="text-[11px] text-slate-400 font-mono">
                        {new Date(caseItem.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-1">
                    {caseItem.assessment?.device_model || "Hardware Recovery Item"}
                  </h3>
                  <span className="text-xs text-slate-500 block mb-4">
                    Pathway: <strong className="text-slate-700 uppercase tracking-wider text-[11px]">{caseItem.pathway_id}</strong>
                  </span>

                  {/* Provider Info */}
                  {caseItem.provider ? (
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs mb-4">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Assigned Facility:</span>
                      <strong className="text-slate-800 font-semibold block">{caseItem.provider.name}</strong>
                      <span className="text-[11px] text-slate-500">
                        Drop-off: {caseItem.provider.offers_dropoff ? "Available" : "Not offered"} &bull; Pickup: {caseItem.provider.offers_pickup ? "Available" : "Not offered"}
                      </span>
                    </div>
                  ) : (
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs text-slate-500 italic mb-4">
                      No verified provider assigned. Independent pathway pursuit.
                    </div>
                  )}

                  {/* Recommended Next Step Box */}
                  <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-3 text-xs text-emerald-950 mb-5">
                    <strong className="block font-bold text-emerald-900 uppercase text-[10px] mb-0.5">Next Recommended Action:</strong>
                    <p className="line-clamp-2 leading-relaxed text-[11px]">{advice}</p>
                  </div>
                </div>

                {/* Footer link to Case Detail */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400">
                    {caseItem.status_history.length} event{caseItem.status_history.length === 1 ? "" : "s"}
                  </span>
                  <Link
                    href={`/cases/${caseItem.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition-colors"
                  >
                    <span>Manage Case</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <FolderOpen className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Recovery Cases in this View</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
            You don&lsquo;t have any cases matching the current filter. Run a device assessment to discover the highest-value recovery route and track it here.
          </p>
          <div className="pt-2">
            <Link
              href="/find-option"
              className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded-xl text-xs inline-flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" /> Start Device Assessment
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
