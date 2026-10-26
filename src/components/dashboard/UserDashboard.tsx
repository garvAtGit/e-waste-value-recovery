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
      <div className="bg-[#141413] text-[#F7F5EE] rounded-sm p-6 sm:p-10 shadow-xs border border-[#2D2C28]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#2D2C28]">
          <div>
            <div className="flex items-center gap-2 mb-2 font-mono text-[11px] uppercase tracking-wider">
              <span className="px-2.5 py-0.5 rounded-sm bg-[#1B3B2B] text-[#A3D9B1] border border-[#2C5E45]">
                Personal Recovery Ledger
              </span>
              <span className="text-[#8E8B82]">&bull;</span>
              <span className="text-[#BDB9AE]">Validated Lifecycle Tracking</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-[#F7F5EE]">
              My Hardware Recovery Cases
            </h1>
            <p className="text-xs sm:text-sm text-[#BDB9AE] mt-2 max-w-2xl leading-relaxed">
              Track real-world device handover milestones, manage communications with verified local repairers and recyclers, and view authenticated recovery outcomes.
            </p>
          </div>

          <Link
            href="/find-option"
            className="shrink-0 px-5 py-3 bg-[#1B3B2B] hover:bg-[#132A1F] text-white font-mono uppercase tracking-wider font-semibold rounded-sm text-xs transition-colors flex items-center gap-2 shadow-xs border border-[#2C5E45]"
          >
            <PlusCircle className="w-4 h-4 text-[#A3D9B1]" />
            <span>Start New Recovery Case</span>
          </Link>
        </div>

        {/* Quick Summary KPI strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 font-mono">
          <div className="bg-[#20201E] rounded-sm p-4 border border-[#35332F]">
            <span className="text-xs text-[#8E8B82] uppercase tracking-wider block mb-1">Total Cases</span>
            <strong className="text-2xl font-bold text-white">{cases.length}</strong>
          </div>
          <div className="bg-[#20201E] rounded-sm p-4 border border-[#35332F]">
            <span className="text-xs text-[#A3D9B1] uppercase tracking-wider block mb-1">Active Cases</span>
            <strong className="text-2xl font-bold text-[#A3D9B1]">{activeCases.length}</strong>
          </div>
          <div className="bg-[#20201E] rounded-sm p-4 border border-[#35332F]">
            <span className="text-xs text-[#8E8B82] uppercase tracking-wider block mb-1">Completed Outcomes</span>
            <strong className="text-2xl font-bold text-white">{completedCases.length}</strong>
          </div>
          <div className="bg-[#20201E] rounded-sm p-4 border border-[#35332F]">
            <span className="text-xs text-[#E5A88B] uppercase tracking-wider block mb-1">Needs Alternative</span>
            <strong className="text-2xl font-bold text-[#C8532C]">{rejectedOrFailedCases.length}</strong>
          </div>
        </div>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
        <div className="flex items-center gap-1.5 bg-[#FAF9F5] p-1 rounded-sm border border-[#E5E0D8]">
          <button
            type="button"
            onClick={() => setFilterTab("all")}
            className={`px-4 py-1.5 rounded-sm transition-all ${
              filterTab === "all" ? "bg-white text-[#141413] shadow-2xs font-semibold border border-[#E5E0D8]" : "text-[#5A574F] hover:text-[#141413]"
            }`}
          >
            All Cases ({cases.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("active")}
            className={`px-4 py-1.5 rounded-sm transition-all ${
              filterTab === "active" ? "bg-white text-[#141413] shadow-2xs font-semibold border border-[#E5E0D8]" : "text-[#5A574F] hover:text-[#141413]"
            }`}
          >
            Active In-Progress ({activeCases.length + rejectedOrFailedCases.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("completed")}
            className={`px-4 py-1.5 rounded-sm transition-all ${
              filterTab === "completed" ? "bg-white text-[#141413] shadow-2xs font-semibold border border-[#E5E0D8]" : "text-[#5A574F] hover:text-[#141413]"
            }`}
          >
            Completed ({completedCases.length})
          </button>
        </div>

        <Link
          href="/analytics"
          className="inline-flex items-center gap-1 font-semibold text-[#1B3B2B] hover:text-[#132A1F] underline"
        >
          <Leaf className="w-3.5 h-3.5 text-[#1B3B2B]" />
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
              badge: "bg-[#F4F1EA] text-[#141413] border-[#E5E0D8]",
            };

            const advice = getNextRecommendedAction(
              caseItem.current_status,
              caseItem.provider?.name,
              caseItem.is_provider_verified
            );

            return (
              <div
                key={caseItem.id}
                className="bg-white rounded-sm border border-[#E5E0D8] p-6 shadow-xs hover:border-[#C5BFB5] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <span className={`px-2.5 py-0.5 rounded-sm text-xs font-mono uppercase tracking-wider font-semibold border ${meta.badge}`}>
                      {meta.step}
                    </span>
                    {caseItem.is_provider_verified ? (
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase font-bold text-[#1B3B2B] bg-[#EDF5F0] px-2 py-0.5 rounded-sm border border-[#C6DFD0]">
                        <ShieldCheck className="w-3 h-3 text-[#1B3B2B]" />
                        Verified
                      </span>
                    ) : (
                      <span suppressHydrationWarning className="text-[11px] text-[#8E8B82] font-mono">
                        {new Date(caseItem.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif text-xl font-bold text-[#141413] tracking-tight mb-1">
                    {caseItem.assessment?.device_model || "Hardware Recovery Item"}
                  </h3>
                  <span className="text-xs text-[#5A574F] font-mono block mb-4">
                    Pathway: <strong className="text-[#141413] uppercase tracking-wider text-[11px]">{caseItem.pathway_id}</strong>
                  </span>

                  {/* Provider Info */}
                  {caseItem.provider ? (
                    <div className="bg-[#FAF9F5] rounded-sm p-3 border border-[#E5E0D8] text-xs mb-4 font-mono">
                      <span className="text-[10px] uppercase text-[#8E8B82] block mb-0.5">Assigned Facility:</span>
                      <strong className="text-[#141413] block font-serif text-sm">{caseItem.provider.name}</strong>
                      <span className="text-[11px] text-[#5A574F]">
                        Drop-off: {caseItem.provider.offers_dropoff ? "Available" : "Not offered"} &bull; Pickup: {caseItem.provider.offers_pickup ? "Available" : "Not offered"}
                      </span>
                    </div>
                  ) : (
                    <div className="bg-[#FAF9F5] rounded-sm p-3 border border-[#E5E0D8] text-xs text-[#8E8B82] italic mb-4 font-mono">
                      No verified provider assigned. Independent pathway pursuit.
                    </div>
                  )}

                  {/* Recommended Next Step Box */}
                  <div className="bg-[#FAF9F5] border border-[#E5E0D8] rounded-sm p-3 text-xs text-[#141413] mb-5">
                    <strong className="block font-mono font-bold text-[#1B3B2B] uppercase text-[10px] mb-0.5">Next Recommended Action:</strong>
                    <p className="line-clamp-2 leading-relaxed text-[11px] text-[#5A574F] font-sans">{advice}</p>
                  </div>
                </div>

                {/* Footer link to Case Detail */}
                <div className="pt-3 border-t border-[#E5E0D8] flex items-center justify-between font-mono text-xs">
                  <span className="text-[11px] text-[#8E8B82]">
                    {caseItem.status_history.length} event{caseItem.status_history.length === 1 ? "" : "s"}
                  </span>
                  <Link
                    href={`/cases/${caseItem.id}`}
                    className="inline-flex items-center gap-1.5 font-bold uppercase tracking-wider text-[#1B3B2B] hover:text-[#132A1F] transition-colors"
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
        <div className="bg-white border border-[#E5E0D8] rounded-sm p-12 text-center max-w-xl mx-auto space-y-4">
          <div className="w-12 h-12 rounded-sm bg-[#F4F1EA] flex items-center justify-center mx-auto text-[#8E8B82] border border-[#E5E0D8]">
            <FolderOpen className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-xl font-bold text-[#141413]">No Recovery Cases in this View</h3>
          <p className="text-xs sm:text-sm text-[#5A574F] leading-relaxed max-w-md mx-auto">
            You don&lsquo;t have any cases matching the current filter. Run a device assessment to discover the highest-value recovery route and track it here.
          </p>
          <div className="pt-2">
            <Link
              href="/find-option"
              className="px-5 py-2.5 bg-[#1B3B2B] hover:bg-[#132A1F] text-white font-mono uppercase tracking-wider font-semibold rounded-sm text-xs inline-flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" /> Start Device Assessment
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
