import React, { Suspense } from "react";
import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { RecoveryRepository } from "@/lib/recovery-cases/repository";
import { cookies } from "next/headers";
import { UserDashboard } from "@/components/dashboard/UserDashboard";

export const metadata: Metadata = {
  title: "User Recovery Dashboard | E-Waste Value Recovery",
  description: "Track saved device assessments, active provider handovers, and authenticated recovery outcomes.",
};

async function DashboardDataLoader() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("ew_session_id")?.value || "anonymous-session";
  let cases = await RecoveryRepository.listCases({
    sessionId,
  });

  if (cases.length === 0 && sessionId !== "demo-session-user") {
    const demoCases = await RecoveryRepository.listCases({
      sessionId: "demo-session-user",
    });
    cases = demoCases;
  }

  return <UserDashboard initialCases={cases} />;
}

function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse space-y-6">
      <div className="h-44 bg-slate-200 rounded-3xl w-full" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-64 bg-slate-200 rounded-2xl" />
        <div className="h-64 bg-slate-200 rounded-2xl" />
        <div className="h-64 bg-slate-200 rounded-2xl" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardDataLoader />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
