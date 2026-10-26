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
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>

          <div className="text-center">
            <h1 className="text-xl font-bold text-slate-900">Operations Console Access</h1>
            <p className="text-xs text-slate-500 mt-1">
              Enter your privileged administrator key to manage provider candidates and verify recovery records.
            </p>
          </div>

          {authError && (
            <div className="bg-rose-50 border border-rose-300 text-rose-900 text-xs p-3.5 rounded-xl">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Administrator API Key
              </label>
              <input
                type="password"
                value={adminKeyInput}
                onChange={(e) => setAdminKeyInput(e.target.value)}
                placeholder="Enter ADMIN_API_KEY..."
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                required
              />
              {process.env.NODE_ENV !== "production" && (
                <p className="text-[11px] text-slate-400 mt-1">
                  Development fallback key: <code>ewaste-admin-secret-dev-2026</code>
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
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
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" /> Operations Console
            </span>
            <span className="text-xs text-slate-400">&bull;</span>
            <span className="text-xs text-slate-400">Authenticated as Editorial Admin</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Provider Verification & Operational Audit
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Audit unverified provider candidates, review customer recovery evidence, confirm certified recycling receipts, and inspect immutable change logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/analytics"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors"
          >
            Analytics & Impact
          </Link>
          <button
            type="button"
            onClick={() => {
              document.cookie = "admin_token=; path=/; max-age=0";
              setIsAuthenticated(false);
            }}
            className="px-4 py-2.5 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-xl text-xs font-semibold transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Notifications */}
      {operationMsg && (
        <div
          className={`p-4 rounded-xl text-xs flex items-start gap-2.5 border ${
            operationMsg.type === "success"
              ? "bg-emerald-50 border-emerald-300 text-emerald-900"
              : "bg-rose-50 border-rose-300 text-rose-900"
          }`}
        >
          {operationMsg.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
          )}
          <span>{operationMsg.text}</span>
        </div>
      )}

      {/* Navigation Subtabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("candidates")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
            activeTab === "candidates"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:text-slate-900"
          }`}
        >
          Candidate Providers ({providers.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("cases")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
            activeTab === "cases"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:text-slate-900"
          }`}
        >
          Operational Cases ({cases.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("audit")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
            activeTab === "audit"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:text-slate-900"
          }`}
        >
          Audit History ({auditLogs.length})
        </button>
      </div>

      {/* TAB 1: PROVIDER CANDIDATE VERIFICATION */}
      {activeTab === "candidates" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Candidate Review & Verification Queue
              </h2>
              <p className="text-xs text-slate-500">
                Pending candidates are strictly quarantined from public consumer recommendations until verified with supporting documentary evidence.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
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
                  className={`bg-white rounded-2xl border p-6 shadow-xs flex flex-col md:flex-row md:items-start justify-between gap-6 transition-all ${
                    isApproved ? "border-emerald-300" : isRejected ? "border-rose-300 opacity-80" : "border-amber-300"
                  }`}
                >
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {p.organisation_type.replace(/_/g, " ")}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          isApproved
                            ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                            : isRejected
                            ? "bg-rose-100 text-rose-900 border border-rose-300"
                            : "bg-amber-100 text-amber-900 border border-amber-300"
                        }`}
                      >
                        Approval: {p.approval_status.replace(/_/g, " ")}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        Tier: {p.verification_status.replace(/_/g, " ")}
                      </span>
                      {p.is_sample_data && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded">
                          Demo Fixture
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{p.name}</h3>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {p.description || "No public description recorded."}
                      </p>
                    </div>

                    {/* Evidence & Location Details */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs space-y-2">
                      <div className="flex flex-wrap gap-4 text-slate-700">
                        <span>
                          <strong>Documented Locations:</strong> {p.service_areas.length} verified area(s)
                        </span>
                        <span>
                          <strong>Pickup:</strong> {p.offers_pickup ? "Supported" : "No"} &bull;{" "}
                          <strong>Drop-off:</strong> {p.offers_dropoff ? "Supported" : "No"}
                        </span>
                      </div>

                      {p.evidence_notes && (
                        <p className="text-[11px] text-slate-600 italic">
                          <strong>Audit Notes:</strong> {p.evidence_notes}
                        </p>
                      )}

                      {p.source_evidence_url && (
                        <a
                          href={p.source_evidence_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 underline"
                        >
                          <span>Primary Evidence Registry Source</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="md:w-64 shrink-0 space-y-2 pt-2 md:pt-0 border-t md:border-t-0 md:border-l border-slate-100 md:pl-6 flex flex-col justify-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Editorial Actions:
                    </span>

                    {!isApproved && (
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleUpdateProviderStatus(p.id, "approved", "verified")}
                        className="w-full py-2 px-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve Listing (Verified)
                      </button>
                    )}

                    {!isApproved && (
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleUpdateProviderStatus(p.id, "approved", "partially_verified")}
                        className="w-full py-2 px-3 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve (Partially Verified)
                      </button>
                    )}

                    {!isRejected && (
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleUpdateProviderStatus(p.id, "rejected", "unverified")}
                        className="w-full py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject Candidate
                      </button>
                    )}

                    {isApproved && (
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleUpdateProviderStatus(p.id, "pending_review", p.verification_status)}
                        className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
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
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Active Recovery Cases & Outcome Verifications
              </h2>
              <p className="text-xs text-slate-500">
                Review user-reported cases, audit evidence notes, and elevate completed handovers to accredited &lsquo;Provider Verified&rsquo; status.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
              Total: {cases.length} &bull; Verified: {cases.filter((c) => c.is_provider_verified).length}
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4">Case ID &amp; Device</th>
                    <th className="p-4">Pathway</th>
                    <th className="p-4">Assigned Provider</th>
                    <th className="p-4">Current Status</th>
                    <th className="p-4">Verification Tier</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cases.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 font-medium text-slate-900">
                        <span className="block font-bold">{c.assessment?.device_model || "Hardware Item"}</span>
                        <span className="text-[11px] text-slate-400 font-mono">#{c.id.slice(0, 14)}...</span>
                      </td>
                      <td className="p-4">
                        <span className="uppercase font-semibold text-[11px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {c.pathway_id}
                        </span>
                      </td>
                      <td className="p-4 text-slate-700">
                        {c.provider?.name || <em className="text-slate-400">Independent</em>}
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-slate-800 capitalize">
                          {c.current_status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="p-4">
                        {c.is_provider_verified ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <ShieldCheck className="w-3 h-3 text-emerald-700" />
                            Provider Verified
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            User Reported
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/cases/${c.id}`}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
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
                              className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded text-[11px] transition-colors"
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
            <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-700" />
                    Verify Recovery Outcome
                  </h3>
                  <button
                    type="button"
                    onClick={() => setSelectedCaseForVerify(null)}
                    className="text-slate-400 hover:text-slate-700"
                  >
                    &times;
                  </button>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Elevating case #{selectedCaseForVerify.id} to <strong>Provider-Verified</strong> certifies that an authorised manifest, counter receipt, or recycling destruction certificate was confirmed.
                </p>

                <form onSubmit={handleVerifyCaseOutcome} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Auditor Verification Notes:
                    </label>
                    <textarea
                      rows={3}
                      value={verifyNotes}
                      onChange={(e) => setVerifyNotes(e.target.value)}
                      placeholder="e.g. Verified against CPCB e-waste consignment note #DEL-2026-8192; receipt validated with Apex recycling weigh-in."
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-800"
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedCaseForVerify(null)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded-xl text-xs transition-colors disabled:opacity-50"
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
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Immutable Administrative Audit Log</h2>
              <p className="text-xs text-slate-500">
                Sequential chronological record of all administrative decisions, provider status updates, and outcome verifications.
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            {auditLogs.length > 0 ? (
              <div className="space-y-3">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <strong className="text-slate-900 uppercase font-mono text-[11px]">
                          {log.action_type.replace(/_/g, " ")}
                        </strong>
                        <span className="text-slate-400">&bull;</span>
                        <span className="text-slate-600">Target: {log.target_entity_type} ({log.target_entity_id})</span>
                      </div>
                      <span className="text-[11px] text-slate-500 block">
                        Admin: {log.admin_identifier} &bull; Details: {JSON.stringify(log.details)}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic text-center py-6">
                No administrative actions recorded yet.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
