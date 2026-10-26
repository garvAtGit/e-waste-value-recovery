import React, { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DirectoryClient } from "@/components/directory/DirectoryClient";
import { fetchApprovedProviders } from "@/lib/supabase/providers";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Provider Directory | E-Waste Value Recovery",
  description:
    "Evidence-backed directory of repair workshops, trade-in operators, reuse charities, and authorised e-waste recyclers with verified service coverage.",
};

async function DirectoryDataLoader() {
  const { providers, isConfigured, isDemoMode, error } =
    await fetchApprovedProviders();

  return (
    <DirectoryClient
      initialProviders={providers}
      isConfigured={isConfigured}
      isDemoMode={isDemoMode}
      initialError={error}
    />
  );
}

function DirectoryLoadingSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse space-y-6">
      <div className="h-24 bg-slate-200 rounded-2xl w-full" />
      <div className="h-36 bg-slate-200 rounded-2xl w-full" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="h-64 bg-slate-200 rounded-2xl" />
        <div className="h-64 bg-slate-200 rounded-2xl" />
        <div className="h-64 bg-slate-200 rounded-2xl" />
      </div>
    </div>
  );
}

export default function DirectoryPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1">
        {/* Page Header */}
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
                Evidence-Audited Directory
              </span>
              <span className="text-xs text-slate-400">&bull;</span>
              <span className="text-xs text-slate-400">
                Strict Non-Inferential Location Matching
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
              Verified Providers & Recycler Directory
            </h1>

            <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
              Find organisations and facilities handling repair, buyback, exchange, reuse,
              and authorised e-waste recycling. All listings display documented verification
              evidence, logistics options, and specific location coverage.
            </p>
          </div>
        </div>

        {/* Directory Suspense Boundary for streaming live Supabase data */}
        <Suspense fallback={<DirectoryLoadingSkeleton />}>
          <DirectoryDataLoader />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
