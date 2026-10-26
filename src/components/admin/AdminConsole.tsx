"use client";

import React, { useState } from "react";
import { ProviderWithDetails, AdminAuditLogRow } from "@/lib/supabase/types";
import { RecoveryCaseWithDetails } from "@/lib/recovery-cases/types";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Lock,
  RotateCcw,
  AlertCircle,
  Eye,
  Check,
} from "lucide-react";

interface AdminConsoleProps {
  initialProviders: ProviderWithDetails[];
  initialCases: RecoveryCaseWithDetails[];
  initialAuditLogs: AdminAuditLogRow[];
  isAuthenticated: boolean;
}

export function AdminConsole({
  initialProviders,
  initialCases,
  initialAuditLogs,
  isAuthenticated: initialAuth,
}: AdminConsoleProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(initialAuth);
  const [adminKeyInput, setAdminKeyInput] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"candidates" | "cases" | "audit">("candidates");

  const [providers, setProviders] = useState<ProviderWithDetails[]>(initialProviders);
  const [cases, setCases] = useState<RecoveryCaseWithDetails[]>(initialCases);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLogRow[]>(initialAuditLogs);

  const [operationMsg, setOperationMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Outcome verification modal
  const [selectedCaseForVerify, setSelectedCaseForVerify] = useState<RecoveryCaseWithDetails | null>(null);
  const [verifyNotes, setVerifyNotes] = useState("");

  // Handle Admin Key login
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(null);

    // Set cookie and test authorization
    document.cookie = `admin_token=${encodeURIComponent(adminKeyInput.trim())}; path=/; SameSite=Lax`;

    try {
      const res = await fetch("/api/admin/providers", {
        headers: { "x-admin-key": adminKeyInput.trim() },
      });
      if (res.ok) {
        setIsAuthenticated(true);
        // Refresh data
        const data = await res.json();
        if (data.providers) setProviders(data.providers);

        const casesRes = await fetch("/api/admin/cases", {
          headers: { "x-admin-key": adminKeyInput.trim() },
        });
        const casesData = await casesRes.json();
        if (casesData.cases) setCases(casesData.cases);

        const logsRes = await fetch("/api/admin/audit-logs", {
          headers: { "x-admin-key": adminKeyInput.trim() },
        });
        const logsData = await logsRes.json();
        if (logsData.logs) setAuditLogs(logsData.logs);
      } else {
        setAuthError("Invalid administrative secret key. Access denied.");
      }
    } catch {
      setAuthError("Failed to authenticate admin session.");
    }
  }

  // Handle Provider Candidate Approval / Rejection
  async function handleUpdateProviderStatus(
    providerId: string,
    status: "approved" | "rejected" | "pending_review",
    verificationStatus: "verified" | "partially_verified" | "unverified",
    notes?: string
  ) {
    setIsProcessing(true);
    setOperationMsg(null);

    try {
      const res = await fetch("/api/admin/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId,
          status,
          verificationStatus,
          notes: notes || `Admin editorial decision: ${status} with ${verificationStatus} status.`,
          adminIdentifier: "operations_console_admin",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update provider status");
      }

      setProviders((prev) =>
        prev.map((p) => (p.id === providerId ? data.provider : p))
      );

      // Refresh audit logs
      fetch("/api/admin/audit-logs")
        .then((r) => r.json())
        .then((d) => {
          if (d.logs) setAuditLogs(d.logs);
        })
        .catch(() => {});

      setOperationMsg({
        type: "success",
        text: `Provider '${data.provider.name}' updated to status '${status}' (${verificationStatus}).`,
      });
    } catch (err) {
      setOperationMsg({
        type: "error",
        text: err instanceof Error ? err.message : "Error updating provider",
      });
    } finally {
      setIsProcessing(false);
    }
  }

  // Handle Case Outcome Verification (Elevation to Provider Confirmed)
  async function handleVerifyCaseOutcome(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCaseForVerify) return;

    setIsProcessing(true);
    setOperationMsg(null);

    try {
      const res = await fetch("/api/admin/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId: selectedCaseForVerify.id,
          adminIdentifier: "operations_console_admin",
          notes: verifyNotes.trim() || "Audited against provider manifest / receipt proof.",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to verify case outcome");
      }

      setCases((prev) =>
        prev.map((c) => (c.id === selectedCaseForVerify.id ? data.case : c))
      );

      // Refresh audit logs
      fetch("/api/admin/audit-logs")
        .then((r) => r.json())
        .then((d) => {
          if (d.logs) setAuditLogs(d.logs);
        })
        .catch(() => {});

      setSelectedCaseForVerify(null);
      setVerifyNotes("");
      setOperationMsg({
        type: "success",
        text: `Case #${data.case.id} verified! Outcome elevated to Provider Confirmed tier.`,
      });
    } catch (err) {
      setOperationMsg({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to verify outcome",
      });
    } finally {
      setIsProcessing(false);
    }
  }

  // If not authenticated, render login form
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20">
        <div className="bg-white border border-[#E5E0D8] rounded-sm p-8 shadow-xs space-y-6">
          <div className="w-12 h-12 rounded-sm bg-[#141413] text-[#F7F5EE] flex items-center justify-center mx-auto border border-[#2D2C28]">
            <Lock className="w-5 h-5 text-[#A3D9B1]" />
          </div>

          <div className="text-center">
            <h1 className="font-serif text-2xl font-bold text-[#141413]">Operations Console Access</h1>
            <p className="text-xs text-[#5A574F] mt-1.5 leading-relaxed font-sans">
              Enter privileged administrator key to manage provider candidates and verify recovery records.
            </p>
          </div>

          {authError && (
            <div className="bg-[#FFF9F5] border border-[#F3D1C2] text-[#C8532C] text-xs p-3.5 rounded-sm font-mono">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#5A574F] mb-1.5">
                Administrator API Key
              </label>
              <input
                type="password"
                value={adminKeyInput}
                onChange={(e) => setAdminKeyInput(e.target.value)}
                placeholder="Enter ADMIN_API_KEY..."
                className="w-full text-xs font-mono bg-[#FAF9F5] border border-[#D5D0C5] rounded-sm p-3 text-[#141413] focus:outline-none focus:border-[#1B3B2B] focus:ring-1 focus:ring-[#1B3B2B]"
                required
              />
              {process.env.NODE_ENV !== "production" && (
                <p className="text-[11px] font-mono text-[#8E8B82] mt-1.5">
                  Development fallback key: <code>ewaste-admin-secret-dev-2026</code>
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#1B3B2B] hover:bg-[#132A1F] text-white text-xs font-mono uppercase tracking-wider font-semibold rounded-sm transition-colors shadow-xs"
            >
              Authenticate Operations Console
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Render Full Operations Console
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="bg-[#141413] text-[#F7F5EE] rounded-sm p-6 sm:p-8 border border-[#2D2C28] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-2 font-mono text-[11px] uppercase tracking-wider">
            <span className="px-2.5 py-0.5 rounded-sm bg-[#1B3B2B] text-[#A3D9B1] border border-[#2C5E45] flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" /> Operations Console
            </span>
            <span className="text-[#8E8B82]">&bull;</span>
            <span className="text-[#BDB9AE]">Authenticated as Editorial Admin</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#F7F5EE]">
            Provider Verification &amp; Operational Audit
          </h1>
          <p className="text-xs sm:text-sm text-[#BDB9AE] mt-1 max-w-2xl leading-relaxed">
            Audit unverified provider candidates, review customer recovery evidence, confirm certified recycling receipts, and inspect immutable change logs.
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <Link
            href="/analytics"
            className="px-4 py-2.5 bg-[#20201E] hover:bg-[#2A2926] text-[#D8D4C8] rounded-sm border border-[#35332F] transition-colors"
          >
            Analytics &amp; Impact
          </Link>
          <button
            type="button"
            onClick={() => {
              document.cookie = "admin_token=; path=/; max-age=0";
              setIsAuthenticated(false);
            }}
            className="px-4 py-2.5 bg-[#FFF9F5] hover:bg-[#FFF0E8] text-[#C8532C] border border-[#F3D1C2] rounded-sm font-semibold uppercase tracking-wider transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Notifications */}
      {operationMsg && (
        <div
          className={`p-4 rounded-sm text-xs flex items-start gap-2.5 border font-mono ${
            operationMsg.type === "success"
              ? "bg-[#EDF5F0] border-[#C6DFD0] text-[#1B3B2B]"
              : "bg-[#FFF9F5] border-[#F3D1C2] text-[#C8532C]"
          }`}
        >
          {operationMsg.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-[#1B3B2B] shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-[#C8532C] shrink-0 mt-0.5" />
          )}
          <span>{operationMsg.text}</span>
        </div>
      )}

      {/* Navigation Subtabs */}
      <div className="flex items-center gap-2 border-b border-[#E5E0D8] pb-3 font-mono text-xs">
        <button
          type="button"
          onClick={() => setActiveTab("candidates")}
          className={`px-4 py-2 font-bold uppercase tracking-wider rounded-sm transition-colors ${
            activeTab === "candidates"
              ? "bg-[#141413] text-[#F7F5EE] shadow-xs"
              : "bg-white text-[#5A574F] hover:text-[#141413] border border-[#E5E0D8]"
          }`}
        >
          Candidate Providers ({providers.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("cases")}
          className={`px-4 py-2 font-bold uppercase tracking-wider rounded-sm transition-colors ${
            activeTab === "cases"
              ? "bg-[#141413] text-[#F7F5EE] shadow-xs"
              : "bg-white text-[#5A574F] hover:text-[#141413] border border-[#E5E0D8]"
          }`}
        >
          Operational Cases ({cases.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("audit")}
          className={`px-4 py-2 font-bold uppercase tracking-wider rounded-sm transition-colors ${
            activeTab === "audit"
              ? "bg-[#141413] text-[#F7F5EE] shadow-xs"
              : "bg-white text-[#5A574F] hover:text-[#141413] border border-[#E5E0D8]"
          }`}
        >
          Audit History ({auditLogs.length})
        </button>
      </div>

      {/* TAB 1: PROVIDER CANDIDATE VERIFICATION */}
      {activeTab === "candidates" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 font-mono">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#141413]">
                Candidate Review &amp; Verification Queue
              </h2>
              <p className="text-xs text-[#5A574F] font-sans">
                Pending candidates are quarantined from public recommendations until verified with supporting documentary evidence.
              </p>
            </div>
            <span className="text-xs text-[#5A574F] bg-[#FAF9F5] px-3 py-1 rounded-sm border border-[#E5E0D8]">
              {providers.filter((p) => p.approval_status === "approved").length} Approved &bull;{" "}
              {providers.filter((p) => p.approval_status === "pending_review").length} In Review
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {providers.map((p) => {
              const isApproved = p.approval_status === "approved";
              const isRejected = p.approval_status === "rejected";

              return (
                <div
                  key={p.id}
                  className={`bg-white rounded-sm border p-6 shadow-xs flex flex-col md:flex-row md:items-start justify-between gap-6 transition-all ${
                    isApproved ? "border-[#C6DFD0]" : isRejected ? "border-[#F3D1C2] opacity-80" : "border-[#E8DCBF]"
                  }`}
                >
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-wider">
                      <span className="bg-[#FAF9F5] text-[#5A574F] px-2 py-0.5 rounded-sm border border-[#E5E0D8]">
                        {p.organisation_type.replace(/_/g, " ")}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-sm font-bold ${
                          isApproved
                            ? "bg-[#EDF5F0] text-[#1B3B2B] border border-[#C6DFD0]"
                            : isRejected
                            ? "bg-[#FFF9F5] text-[#C8532C] border border-[#F3D1C2]"
                            : "bg-[#FAF5EB] text-[#6A4E23] border border-[#E8DCBF]"
                        }`}
                      >
                        Approval: {p.approval_status.replace(/_/g, " ")}
                      </span>
                      <span className="bg-[#FAF9F5] text-[#5A574F] px-2 py-0.5 rounded-sm border border-[#E5E0D8]">
                        Tier: {p.verification_status.replace(/_/g, " ")}
                      </span>
                      {p.is_sample_data && (
                        <span className="bg-[#FFF9F5] text-[#C8532C] border border-[#F3D1C2] px-2 py-0.5 rounded-sm">
                          Demo Fixture
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-serif text-xl font-bold text-[#141413]">{p.name}</h3>
                      <p className="text-xs text-[#5A574F] mt-1 leading-relaxed">
                        {p.description || "No public description recorded."}
                      </p>
                    </div>

                    {/* Evidence & Location Details */}
                    <div className="bg-[#FAF9F5] p-4 rounded-sm border border-[#E5E0D8] text-xs space-y-2 font-mono">
                      <div className="flex flex-wrap gap-4 text-[#5A574F]">
                        <span>
                          <strong className="text-[#141413]">Documented Locations:</strong> {p.service_areas.length} verified area(s)
                        </span>
                        <span>
                          <strong className="text-[#141413]">Pickup:</strong> {p.offers_pickup ? "Supported" : "No"} &bull;{" "}
                          <strong className="text-[#141413]">Drop-off:</strong> {p.offers_dropoff ? "Supported" : "No"}
                        </span>
                      </div>

                      {p.evidence_notes && (
                        <p className="text-[11px] text-[#5A574F] italic">
                          <strong className="text-[#141413]">Audit Notes:</strong> {p.evidence_notes}
                        </p>
                      )}

                      {p.source_evidence_url && (
                        <a
                          href={p.source_evidence_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1B3B2B] hover:text-[#132A1F] underline"
                        >
                          <span>Primary Evidence Registry Source</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="md:w-64 shrink-0 space-y-2 pt-2 md:pt-0 border-t md:border-t-0 md:border-l border-[#E5E0D8] md:pl-6 flex flex-col justify-center font-mono text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E8B82] block mb-1">
                      Editorial Actions:
                    </span>

                    {!isApproved && (
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleUpdateProviderStatus(p.id, "approved", "verified")}
                        className="w-full py-2 px-3 bg-[#1B3B2B] hover:bg-[#132A1F] text-white rounded-sm text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 uppercase tracking-wider"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve (Verified)
                      </button>
                    )}

                    {!isApproved && (
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleUpdateProviderStatus(p.id, "approved", "partially_verified")}
                        className="w-full py-2 px-3 bg-[#6A4E23] hover:bg-[#523C1B] text-white rounded-sm text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 uppercase tracking-wider"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve (Partially)
                      </button>
                    )}

                    {!isRejected && (
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleUpdateProviderStatus(p.id, "rejected", "unverified")}
                        className="w-full py-2 px-3 bg-[#FFF9F5] hover:bg-[#FFF0E8] text-[#C8532C] border border-[#F3D1C2] rounded-sm text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 uppercase tracking-wider"
                      >
                        <XCircle className="w-3.5 h-3.5 text-[#C8532C]" /> Reject Candidate
                      </button>
                    )}

                    {isApproved && (
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleUpdateProviderStatus(p.id, "pending_review", p.verification_status)}
                        className="w-full py-2 px-3 bg-[#FAF9F5] hover:bg-[#F4F1EA] text-[#5A574F] border border-[#E5E0D8] rounded-sm text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors uppercase tracking-wider"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Return to Review
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: OPERATIONAL CASE MONITORING */}
      {activeTab === "cases" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 font-mono">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#141413]">
                Active Recovery Cases &amp; Outcome Verifications
              </h2>
              <p className="text-xs text-[#5A574F] font-sans">
                Review user-reported cases, audit evidence notes, and elevate completed handovers to accredited &lsquo;Provider Verified&rsquo; status.
              </p>
            </div>
            <span className="text-xs text-[#5A574F] bg-[#FAF9F5] px-3 py-1 rounded-sm border border-[#E5E0D8]">
              Total: {cases.length} &bull; Verified: {cases.filter((c) => c.is_provider_verified).length}
            </span>
          </div>

          <div className="bg-white border border-[#E5E0D8] rounded-sm overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#FAF9F5] border-b border-[#E5E0D8] text-[#5A574F] font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4">Case ID &amp; Device</th>
                    <th className="p-4">Pathway</th>
                    <th className="p-4">Assigned Provider</th>
                    <th className="p-4">Current Status</th>
                    <th className="p-4">Verification Tier</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E0D8]">
                  {cases.map((c) => (
                    <tr key={c.id} className="hover:bg-[#FAF9F5]/70 transition-colors">
                      <td className="p-4 text-[#141413]">
                        <span className="block font-serif font-bold text-sm">{c.assessment?.device_model || "Hardware Item"}</span>
                        <span className="text-[11px] text-[#8E8B82]">#{c.id.slice(0, 14)}...</span>
                      </td>
                      <td className="p-4">
                        <span className="uppercase font-semibold text-[11px] text-[#5A574F] bg-[#FAF9F5] px-2 py-0.5 rounded-sm border border-[#E5E0D8]">
                          {c.pathway_id}
                        </span>
                      </td>
                      <td className="p-4 text-[#5A574F]">
                        {c.provider?.name || <em className="text-[#8E8B82]">Independent</em>}
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-[#141413] capitalize">
                          {c.current_status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="p-4">
                        {c.is_provider_verified ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1B3B2B] bg-[#EDF5F0] px-2 py-0.5 rounded-sm border border-[#C6DFD0]">
                            <ShieldCheck className="w-3 h-3 text-[#1B3B2B]" />
                            Provider Verified
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#8E8B82] bg-[#FAF9F5] px-2 py-0.5 rounded-sm border border-[#E5E0D8]">
                            User Reported
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/cases/${c.id}`}
                            className="p-1.5 text-[#5A574F] hover:text-[#141413] hover:bg-[#FAF9F5] rounded-sm transition-colors"
                            title="Inspect Case"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          {!c.is_provider_verified && c.current_status === "completed" && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedCaseForVerify(c);
                                setVerifyNotes("");
                              }}
                              className="px-2.5 py-1 bg-[#1B3B2B] hover:bg-[#132A1F] text-white font-semibold rounded-sm text-[11px] uppercase tracking-wider transition-colors"
                            >
                              Verify Outcome
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal for verifying case outcome */}
          {selectedCaseForVerify && (
            <div className="fixed inset-0 bg-[#141413]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className="bg-white border border-[#E5E0D8] rounded-sm p-6 sm:p-8 max-w-lg w-full shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E5E0D8]">
                  <h3 className="font-serif text-lg font-bold text-[#141413] flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#1B3B2B]" />
                    Verify Recovery Outcome
                  </h3>
                  <button
                    type="button"
                    onClick={() => setSelectedCaseForVerify(null)}
                    className="text-[#8E8B82] hover:text-[#141413] text-lg font-mono"
                  >
                    &times;
                  </button>
                </div>

                <p className="text-xs text-[#5A574F] leading-relaxed">
                  Elevating case #{selectedCaseForVerify.id} to <strong>Provider-Verified</strong> certifies that an authorised manifest, counter receipt, or recycling destruction certificate was confirmed.
                </p>

                <form onSubmit={handleVerifyCaseOutcome} className="space-y-4 font-mono text-xs">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#5A574F] mb-1.5">
                      Auditor Verification Notes:
                    </label>
                    <textarea
                      rows={3}
                      value={verifyNotes}
                      onChange={(e) => setVerifyNotes(e.target.value)}
                      placeholder="e.g. Verified against CPCB e-waste consignment note #DEL-2026-8192; receipt validated with Apex recycling weigh-in."
                      className="w-full text-xs bg-[#FAF9F5] border border-[#D5D0C5] rounded-sm p-3 text-[#141413] focus:outline-none focus:border-[#1B3B2B] focus:ring-1 focus:ring-[#1B3B2B]"
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedCaseForVerify(null)}
                      className="px-4 py-2 text-xs text-[#5A574F] hover:text-[#141413]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="px-4 py-2 bg-[#1B3B2B] hover:bg-[#132A1F] text-white font-semibold rounded-sm text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
                    >
                      Confirm Verification
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ADMIN AUDIT LOGS */}
      {activeTab === "audit" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between font-mono">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#141413]">Immutable Administrative Audit Log</h2>
              <p className="text-xs text-[#5A574F] font-sans">
                Sequential chronological record of all administrative decisions, provider status updates, and outcome verifications.
              </p>
            </div>
          </div>

          <div className="bg-white border border-[#E5E0D8] rounded-sm p-6 shadow-xs space-y-4 font-mono">
            {auditLogs.length > 0 ? (
              <div className="space-y-3">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 bg-[#FAF9F5] rounded-sm border border-[#E5E0D8] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <strong className="text-[#141413] uppercase text-[11px]">
                          {log.action_type.replace(/_/g, " ")}
                        </strong>
                        <span className="text-[#8E8B82]">&bull;</span>
                        <span className="text-[#5A574F]">Target: {log.target_entity_type} ({log.target_entity_id})</span>
                      </div>
                      <span className="text-[11px] text-[#8E8B82] block">
                        Admin: {log.admin_identifier} &bull; Details: {JSON.stringify(log.details)}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#8E8B82] shrink-0">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#8E8B82] italic text-center py-6">
                No administrative actions recorded yet.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
