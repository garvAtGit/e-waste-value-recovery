import React, { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ComparisonWorkflow } from "@/components/comparison/ComparisonWorkflow";
import { ConsumerGuardrails } from "@/components/landing/ConsumerGuardrails";
import { fetchApprovedProviders } from "@/lib/supabase/providers";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Evidence-Backed Recovery Comparison Engine | E-Waste Value Recovery",
  description:
    "Compare repair, cash resale, trade-in, refurbishment, donation, and certified recycling with verified provider coverage and strict non-inferential matching.",
};

async function ComparisonDataLoader() {
  const { providers, isConfigured, isDemoMode, error } =
    await fetchApprovedProviders();

  return (
    <ComparisonWorkflow
      approvedProviders={providers}
      isConfigured={isConfigured}
      isDemoMode={isDemoMode}
      initialError={error}
    />
  );
}

function ComparisonLoadingSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse space-y-8">
      <div className="h-20 bg-slate-200 rounded-2xl w-full" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 h-96 bg-slate-200 rounded-2xl" />
        <div className="lg:col-span-7 h-96 bg-slate-200 rounded-2xl" />
      </div>
    </div>
  );
}

export default function FindOptionPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1">
        {/* Breadcrumb & intro header */}
        <div className="bg-slate-900 text-white py-12 border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Overview</span>
            </Link>

            <div className="flex flex-wrap items-center gap-2.5 mb-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-300 bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Evidence-Backed Comparison Engine
              </span>
              <span className="text-xs text-slate-400">&bull;</span>
              <span className="text-xs text-slate-400">
                Non-Inferential Pincode Verification
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
              Recovery Pathway Comparison Engine
            </h1>
            <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
              Compare repair, cash sale, trade-in vouchers, parts salvage, donation,
              and authorised e-waste recycling against verified provider acceptance records.
            </p>
          </div>
        </div>

        {/* Dynamic Comparison Engine with Suspense Boundary */}
        <Suspense fallback={<ComparisonLoadingSkeleton />}>
          <ComparisonDataLoader />
        </Suspense>

        {/* Guardrails Check */}
        <ConsumerGuardrails />
      </main>
      <Footer />
    </div>
  );
}
