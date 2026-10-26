"use client";

import React, { useState } from "react";
import { RecoveryCaseWithDetails, HUMAN_STATUS_LABELS } from "@/lib/recovery-cases/types";
import { CaseStatus, OutcomeType } from "@/lib/supabase/types";
import { getNextRecommendedAction } from "@/lib/recovery-cases/state-machine";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  ExternalLink,
  Phone,
  Truck,
  RotateCcw,
  ShieldCheck,
  Send,
  XCircle,
  FileCheck2,
  Info,
} from "lucide-react";

interface CaseDetailWorkflowProps {
  initialCase: RecoveryCaseWithDetails;
}

export function CaseDetailWorkflow({ initialCase }: CaseDetailWorkflowProps) {
  const [currentCase, setCurrentCase] = useState<RecoveryCaseWithDetails>(initialCase);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Form states for modals/drawers
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [completeOutcome, setCompleteOutcome] = useState<OutcomeType>("repaired_and_retained");
  const [financialValue, setFinancialValue] = useState<string>("");
  const [evidenceNotes, setEvidenceNotes] = useState<string>("");

  const statusMeta = HUMAN_STATUS_LABELS[currentCase.current_status] || {
    title: currentCase.current_status,
    step: "In Progress",
    badge: "bg-[#F4F1EA] text-[#141413] border-[#E5E0D8]",
  };

  const nextActionAdvice = getNextRecommendedAction(
    currentCase.current_status,
    currentCase.provider?.name,
    currentCase.is_provider_verified
  );

  async function handleTransition(targetStatus: CaseStatus, extraData?: Record<string, unknown>) {
    setIsSubmitting(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await fetch(`/api/cases/${currentCase.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetStatus,
          ...extraData,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update case status");
      }

      setCurrentCase(data.case);
      setActionSuccess(`Status updated to '${HUMAN_STATUS_LABELS[targetStatus]?.title || targetStatus}'`);
      setShowRejectModal(false);
      setShowCompleteModal(false);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to execute state transition");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Breadcrumb & Status Header */}
      <div>
        <div className="flex items-center justify-between mb-3 font-mono text-xs">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-[#5A574F] hover:text-[#141413] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Recovery Ledger
          </Link>
          <span className="text-[#8E8B82] uppercase tracking-wider text-[11px]">
            Docket // {currentCase.id}
          </span>
        </div>

        {/* Dossier Header Ticket */}
        <div className="bg-white border border-[#E5E0D8] rounded-sm p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-wider">
              <span className={`px-2.5 py-0.5 rounded-sm text-xs font-semibold border ${statusMeta.badge}`}>
                {statusMeta.step}
              </span>
              {currentCase.is_provider_verified ? (
                <span className="inline-flex items-center gap-1 font-bold text-[#1B3B2B] bg-[#EDF5F0] px-2.5 py-0.5 rounded-sm border border-[#C6DFD0]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#1B3B2B]" />
                  Provider-Verified Outcome
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[#5A574F] bg-[#F4F1EA] px-2.5 py-0.5 rounded-sm border border-[#E5E0D8]">
                  User-Reported Progress
                </span>
              )}
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#141413] tracking-tight">
              {currentCase.assessment?.device_model || "Hardware Recovery Case"}
            </h1>
            <p className="text-xs sm:text-sm text-[#5A574F] font-mono">
              Category: <strong className="text-[#141413]">{currentCase.assessment?.category_slug}</strong> &bull;
              Condition: <strong className="text-[#141413]">{currentCase.assessment?.condition}</strong> &bull;
              Pincode: <strong className="text-[#141413]">{currentCase.assessment?.pincode || "Not specified"}</strong>
            </p>
          </div>

          <div className="bg-[#FAF9F5] border border-[#E5E0D8] rounded-sm p-4 md:max-w-sm text-xs text-[#141413]">
            <strong className="block font-mono font-bold text-[#1B3B2B] uppercase tracking-wider text-[10px] mb-1">
              Current Recommended Action
            </strong>
            <p className="leading-relaxed text-[#5A574F] font-sans">{nextActionAdvice}</p>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {actionError && (
        <div className="bg-[#FFF9F5] border border-[#F3D1C2] text-[#C8532C] text-xs p-4 rounded-sm flex items-start gap-2.5 font-mono">
          <AlertTriangle className="w-4 h-4 text-[#C8532C] shrink-0 mt-0.5" />
          <span>{actionError}</span>
        </div>
      )}

      {actionSuccess && (
        <div className="bg-[#EDF5F0] border border-[#C6DFD0] text-[#1B3B2B] text-xs p-4 rounded-sm flex items-start gap-2.5 font-mono">
          <CheckCircle2 className="w-4 h-4 text-[#1B3B2B] shrink-0 mt-0.5" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* 2-Column Layout: Left Controls / Right History & Provider Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Action Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* Quick Action Progression Bar */}
          <div className="bg-white border border-[#E5E0D8] rounded-sm p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-[#E5E0D8]">
              <Send className="w-4 h-4 text-[#1B3B2B]" />
              <h2 className="font-serif text-lg font-bold text-[#141413] tracking-tight">
                Update Case Progress
              </h2>
            </div>
            <p className="text-xs text-[#5A574F] leading-relaxed">
              Advance your recovery case through verified milestones. Each status update creates an immutable append-only audit entry.
            </p>

            {/* Action Buttons based on current status */}
            <div className="space-y-3 pt-1">
              {currentCase.current_status === "created" && (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleTransition("contacted", { reasonOrNotes: "User contacted provider via public phone/website" })}
                  className="w-full py-3 px-4 bg-[#1B3B2B] hover:bg-[#132A1F] text-white font-mono uppercase tracking-wider text-xs font-semibold rounded-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Phone className="w-4 h-4" />
                  <span>I Contacted the Provider (Log Step 2)</span>
                </button>
              )}

              {currentCase.current_status === "contacted" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleTransition("accepted_by_provider", { reasonOrNotes: "Provider confirmed preliminary quote / intake eligibility" })}
                    className="py-3 px-4 bg-[#1B3B2B] hover:bg-[#132A1F] text-white font-mono uppercase tracking-wider text-xs font-semibold rounded-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Provider Accepted Device</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setShowRejectModal(true)}
                    className="py-3 px-4 bg-[#FFF9F5] hover:bg-[#FFF0E8] text-[#C8532C] border border-[#F3D1C2] font-mono uppercase tracking-wider text-xs font-semibold rounded-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4 text-[#C8532C]" />
                    <span>Provider Rejected / Ineligible</span>
                  </button>
                </div>
              )}

              {currentCase.current_status === "accepted_by_provider" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleTransition("in_transit_or_scheduled", { reasonOrNotes: "Scheduled pickup courier / initiated transit" })}
                    className="py-3 px-4 bg-[#233544] hover:bg-[#192732] text-white font-mono uppercase tracking-wider text-xs font-semibold rounded-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <Truck className="w-4 h-4" />
                    <span>Courier Scheduled / In-Transit</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleTransition("dropped_off_or_collected", { reasonOrNotes: "Delivered device directly to public depot" })}
                    className="py-3 px-4 bg-[#1B3B2B] hover:bg-[#132A1F] text-white font-mono uppercase tracking-wider text-xs font-semibold rounded-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Delivered to Drop-off Depot</span>
                  </button>
                </div>
              )}

              {(currentCase.current_status === "in_transit_or_scheduled" || currentCase.current_status === "dropped_off_or_collected") && (
                <div className="space-y-3">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setShowCompleteModal(true)}
                    className="w-full py-3.5 px-4 bg-[#1B3B2B] hover:bg-[#132A1F] text-white font-mono uppercase tracking-wider font-bold rounded-sm text-xs flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50"
                  >
                    <FileCheck2 className="w-4 h-4" />
                    <span>Mark Recovery Completed & Document Outcome</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setShowRejectModal(true)}
                    className="w-full py-2.5 px-4 bg-[#FAF9F5] hover:bg-[#F4F1EA] text-[#5A574F] border border-[#E5E0D8] font-mono uppercase tracking-wider font-semibold rounded-sm text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <AlertTriangle className="w-4 h-4 text-[#C8532C]" />
                    <span>Report Failure or Logistics Dispute</span>
                  </button>
                </div>
              )}

              {(currentCase.current_status === "rejected_by_provider" || currentCase.current_status === "failed") && (
                <div className="bg-[#FFF9F5] border border-[#F3D1C2] rounded-sm p-4 text-xs space-y-3 font-mono">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-[#C8532C] shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-[#C8532C] font-semibold">Previous Attempt Rejected:</strong>
                      <span className="text-[#5A574F] leading-relaxed">
                        Reason recorded: <em>{currentCase.rejection_or_failure_reason || "No explicit reason recorded."}</em>
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap gap-2">
                    <Link
                      href="/find-option"
                      className="px-3.5 py-2 bg-[#1B3B2B] hover:bg-[#132A1F] text-white rounded-sm font-semibold text-xs transition-colors inline-flex items-center gap-1.5 uppercase"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Evaluate Alternative Pathway
                    </Link>
                    <Link
                      href="/directory"
                      className="px-3.5 py-2 bg-white border border-[#E5E0D8] hover:bg-[#FAF9F5] text-[#141413] rounded-sm font-semibold text-xs transition-colors uppercase"
                    >
                      Browse Alternative Providers
                    </Link>
                  </div>
                </div>
              )}

              {currentCase.current_status === "completed" && (
                <div className="bg-[#EDF5F0] border border-[#C6DFD0] rounded-sm p-5 text-xs text-[#1B3B2B] space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[#1B3B2B]" />
                    <strong className="font-serif text-base font-bold text-[#141413]">Recovery Lifecycle Complete</strong>
                  </div>
                  <p className="text-[#2C5E45] font-mono leading-relaxed">
                    Outcome: <strong className="capitalize">{currentCase.outcome_type?.replace(/_/g, " ") || "Recovered"}</strong>.
                    {currentCase.financial_value_inr && (
                      <span> Financial value realised: <strong>₹{currentCase.financial_value_inr.toLocaleString()}</strong>.</span>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Modal / Dialog for Reporting Rejection or Failure */}
          {showRejectModal && (
            <div className="bg-[#FFF9F5] border border-[#C8532C] rounded-sm p-6 shadow-sm space-y-4">
              <h3 className="font-serif text-base font-bold text-[#C8532C] flex items-center gap-2">
                <XCircle className="w-4 h-4 text-[#C8532C]" />
                Report Provider Rejection / Failure Reason
              </h3>
              <p className="text-xs text-[#5A574F] leading-relaxed">
                Why was the device rejected or unable to be recovered? Documenting authentic rejections prevents misleading directory listings.
              </p>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. In-store inspector detected motherboard liquid corrosion; trade-in portal reduced quote to ₹0; provider does not accept loose batteries..."
                className="w-full text-xs bg-white border border-[#E5E0D8] rounded-sm p-3 text-[#141413] placeholder-[#8E8B82] focus:outline-none focus:border-[#C8532C] focus:ring-1 focus:ring-[#C8532C]"
              />
              <div className="flex justify-end gap-2 pt-2 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-3 py-1.5 text-xs text-[#5A574F] hover:text-[#141413]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmitting || !rejectReason.trim()}
                  onClick={() =>
                    handleTransition("rejected_by_provider", {
                      reasonOrNotes: rejectReason.trim(),
                    })
                  }
                  className="px-4 py-2 bg-[#C8532C] hover:bg-[#9E3F1F] text-white rounded-sm text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  Record Rejection
                </button>
              </div>
            </div>
          )}

          {/* Modal / Dialog for Completing Recovery */}
          {showCompleteModal && (
            <div className="bg-white border-2 border-[#1B3B2B] rounded-sm p-6 shadow-sm space-y-4">
              <h3 className="font-serif text-base font-bold text-[#141413] flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-[#1B3B2B]" />
                Document Recovery Outcome
              </h3>
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#5A574F] mb-1">
                    Confirmed Recovery Outcome Type:
                  </label>
                  <select
                    value={completeOutcome}
                    onChange={(e) => setCompleteOutcome(e.target.value as OutcomeType)}
                    className="w-full text-xs bg-[#FAF9F5] border border-[#D5D0C5] rounded-sm p-2.5 text-[#141413]"
                  >
                    <option value="repaired_and_retained">Repaired and Kept for Ongoing Use</option>
                    <option value="sold_for_cash">Sold for Cash Buyback (P2P or Dealer)</option>
                    <option value="exchanged_for_voucher">Exchanged for Store Credit / Trade-in Voucher</option>
                    <option value="salvaged_for_parts">Liquidated to Refurbisher / Component Salvager</option>
                    <option value="donated_for_reuse">Donated to School / Civic Charity</option>
                    <option value="recycled_certified">Shredded & Refined by Authorised Recycler</option>
                    <option value="hazardous_containment">Handed over for Regulated Hazardous Isolation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#5A574F] mb-1">
                    Gross Payout or Repair Expense in INR (Optional):
                  </label>
                  <input
                    type="number"
                    value={financialValue}
                    onChange={(e) => setFinancialValue(e.target.value)}
                    placeholder="e.g. 4500"
                    className="w-full text-xs bg-[#FAF9F5] border border-[#D5D0C5] rounded-sm p-2.5 text-[#141413]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#5A574F] mb-1">
                    Handover / Receipt Notes (Optional):
                  </label>
                  <input
                    type="text"
                    value={evidenceNotes}
                    onChange={(e) => setEvidenceNotes(e.target.value)}
                    placeholder="e.g. Receipt #48291; data wipe receipt issued by technician"
                    className="w-full text-xs bg-[#FAF9F5] border border-[#D5D0C5] rounded-sm p-2.5 text-[#141413]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setShowCompleteModal(false)}
                  className="px-3 py-1.5 text-xs text-[#5A574F] hover:text-[#141413]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() =>
                    handleTransition("completed", {
                      outcomeType: completeOutcome,
                      financialValueInr: financialValue ? parseFloat(financialValue) : undefined,
                      evidenceNotes: evidenceNotes.trim() || undefined,
                    })
                  }
                  className="px-4 py-2 bg-[#1B3B2B] hover:bg-[#132A1F] text-white rounded-sm text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  Confirm Completion
                </button>
              </div>
            </div>
          )}

          {/* Selected Provider Contact Card */}
          {currentCase.provider ? (
            <div className="bg-white border border-[#E5E0D8] rounded-sm p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E0D8]">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#1B3B2B]" />
                  <h3 className="font-serif text-base font-bold text-[#141413]">Selected Provider Information</h3>
                </div>
                <Badge variant={currentCase.provider.verification_status === "verified" ? "emerald" : "amber"}>
                  {currentCase.provider.verification_status.replace(/_/g, " ")}
                </Badge>
              </div>

              <div>
                <h4 className="font-serif text-lg font-bold text-[#141413]">{currentCase.provider.name}</h4>
                <p className="text-xs text-[#5A574F] mt-1 leading-relaxed">
                  {currentCase.provider.description || "Verified local electronics service organisation."}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1 font-mono">
                <div className="bg-[#FAF9F5] p-3 rounded-sm border border-[#E5E0D8]">
                  <span className="text-[#8E8B82] uppercase text-[10px] block mb-0.5">Quote Type:</span>
                  <span className="font-semibold text-[#141413]">{currentCase.provider.quote_type.replace(/_/g, " ")}</span>
                </div>
                <div className="bg-[#FAF9F5] p-3 rounded-sm border border-[#E5E0D8]">
                  <span className="text-[#8E8B82] uppercase text-[10px] block mb-0.5">Logistics:</span>
                  <span className="font-semibold text-[#141413]">
                    Pickup: {currentCase.provider.offers_pickup ? "Available" : "No"} &bull; Drop-off: {currentCase.provider.offers_dropoff ? "Available" : "No"}
                  </span>
                </div>
              </div>

              {currentCase.provider.website_url && (
                <div className="pt-2">
                  <a
                    href={currentCase.provider.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-[#1B3B2B] hover:text-[#132A1F] underline"
                  >
                    <span>Visit Provider Website / Direct Contact</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#FAF9F5] border border-[#E5E0D8] rounded-sm p-6 text-xs text-[#5A574F]">
              <strong className="block text-[#141413] font-mono uppercase text-[11px] mb-1">No Dedicated Provider Assigned:</strong>
              <span>
                You are pursuing the &lsquo;{currentCase.pathway_id}&rsquo; recovery pathway independently. You can browse our verified directory at any time to link an approved local facility.
              </span>
            </div>
          )}
        </div>

        {/* Right Column: Append-Only Status History Timeline */}
        <div className="lg:col-span-5 bg-white border border-[#E5E0D8] rounded-sm p-6 sm:p-7 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E0D4]">
            <h3 className="font-serif text-base font-bold text-[#141413] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#1B3B2B]" />
              Status History Timeline
            </h3>
            <span className="text-[11px] font-mono text-[#8E8B82]">
              {currentCase.status_history.length} Event{currentCase.status_history.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E5E0D8]">
            {currentCase.status_history.map((hist, idx) => (
              <div key={hist.id || idx} className="relative text-xs">
                {/* Timeline node */}
                <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-[#1B3B2B] ring-4 ring-white" />

                <div>
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <strong className="text-[#141413] font-serif font-bold text-sm">
                      {HUMAN_STATUS_LABELS[hist.to_status as CaseStatus]?.title || hist.to_status}
                    </strong>
                    <span suppressHydrationWarning className="text-[10px] text-[#8E8B82] font-mono">
                      {new Date(hist.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>

                  <span className="text-[10px] text-[#8E8B82] uppercase font-mono block mb-1">
                    Role: {hist.changed_by_role} {hist.is_provider_confirmed && "&bull; Confirmed"}
                  </span>

                  {hist.notes && (
                    <p className="text-[#5A574F] bg-[#FAF9F5] p-2.5 rounded-sm border border-[#E5E0D8] leading-relaxed text-[11px] font-mono">
                      {hist.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-[#E5E0D8] text-[11px] font-mono text-[#8E8B82] leading-normal">
            <strong className="text-[#141413]">Audit Integrity:</strong> Status changes are recorded sequentially with timestamping. Past events cannot be rewritten.
          </div>
        </div>
      </div>
    </div>
  );
}
