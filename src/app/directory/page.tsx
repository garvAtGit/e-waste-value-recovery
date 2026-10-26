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
      <div className="h-24 bg-[#EAE6DD] rounded-sm w-full" />
      <div className="h-36 bg-[#EAE6DD] rounded-sm w-full" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="h-64 bg-[#EAE6DD] rounded-sm" />
        <div className="h-64 bg-[#EAE6DD] rounded-sm" />
        <div className="h-64 bg-[#EAE6DD] rounded-sm" />
      </div>
    </div>
  );
}

export default function DirectoryPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5EE] text-[#141413]">
      <Header />
      <main className="flex-1">
        {/* Page Header */}
        <div className="bg-[#141413] text-[#F7F5EE] py-12 border-b border-[#2D2C28]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-mono text-xs text-[#8E8B82] hover:text-[#F7F5EE] transition-colors mb-4"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Overview</span>
            </Link>

            <div className="flex flex-wrap items-center gap-2.5 mb-2.5 font-mono text-[11px] uppercase tracking-wider">
              <span className="inline-flex items-center gap-1.5 text-[#A3D9B1] bg-[#1B3B2B] px-2.5 py-0.5 rounded-sm border border-[#2C5E45]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#A3D9B1]" />
                Evidence-Audited Directory
              </span>
              <span className="text-[#8E8B82]">&bull;</span>
              <span className="text-[#BDB9AE]">
                Strict Non-Inferential Location Matching
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#F7F5EE] mb-3">
              Verified Providers &amp; Recycler Directory
            </h1>

            <p className="text-[#BDB9AE] text-sm sm:text-base max-w-3xl leading-relaxed">
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
