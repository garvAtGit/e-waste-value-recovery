import React, { Suspense } from "react";
import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { computePlatformAnalytics } from "@/lib/analytics/engine";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";

export const metadata: Metadata = {
  title: "Recovery Impact & Analytics | E-Waste Value Recovery",
  description: "Real-world operational metrics, provider verification coverage, and transparent environmental diversion accounting.",
};

async function AnalyticsDataLoader() {
  const analytics = await computePlatformAnalytics();
  return <AnalyticsDashboard analytics={analytics} />;
}

function AnalyticsSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse space-y-6">
      <div className="h-44 bg-[#EAE6DD] rounded-sm w-full" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="h-28 bg-[#EAE6DD] rounded-sm" />
        <div className="h-28 bg-[#EAE6DD] rounded-sm" />
        <div className="h-28 bg-[#EAE6DD] rounded-sm" />
        <div className="h-28 bg-[#EAE6DD] rounded-sm" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80 bg-[#EAE6DD] rounded-sm" />
        <div className="h-80 bg-[#EAE6DD] rounded-sm" />
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5EE] text-[#141413]">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<AnalyticsSkeleton />}>
          <AnalyticsDataLoader />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
