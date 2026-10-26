import React, { Suspense } from "react";
import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { RecoveryRepository } from "@/lib/recovery-cases/repository";
import { AdminConsole } from "@/components/admin/AdminConsole";
import { cookies } from "next/headers";
import { getAdminKey } from "@/lib/auth/roles";

export const metadata: Metadata = {
  title: "Operations Console & Provider Verification | E-Waste Value Recovery",
  description: "Operations console for reviewing provider candidates, auditing recovery cases, and verifying recycling outcomes.",
};

async function AdminDataLoader() {
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get("admin_token")?.value;
  const adminKey = getAdminKey();
  const isAuthenticated = Boolean(adminKey && adminCookie && adminCookie === adminKey);

  // Security: Unauthenticated requests MUST NOT receive sensitive operational cases or audit history
  const providers = isAuthenticated ? await RecoveryRepository.listCandidateProviders() : [];
  const cases = isAuthenticated ? await RecoveryRepository.listCases({ isAdmin: true }) : [];
  const auditLogs = isAuthenticated ? await RecoveryRepository.listAdminAuditLogs() : [];

  return (
    <AdminConsole
      initialProviders={providers}
      initialCases={cases}
      initialAuditLogs={auditLogs}
      isAuthenticated={isAuthenticated}
    />
  );
}

function AdminLoadingSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse space-y-6">
      <div className="h-28 bg-[#EAE6DD] rounded-sm w-full" />
      <div className="h-64 bg-[#EAE6DD] rounded-sm w-full" />
    </div>
  );
}

export default function AdminPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5EE] text-[#141413]">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<AdminLoadingSkeleton />}>
          <AdminDataLoader />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
