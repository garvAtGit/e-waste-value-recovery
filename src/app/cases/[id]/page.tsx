import React, { Suspense } from "react";
import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { RecoveryRepository } from "@/lib/recovery-cases/repository";
import { CaseDetailWorkflow } from "@/components/cases/CaseDetailWorkflow";
import Link from "next/link";
import { ArrowLeft, Inbox } from "lucide-react";

interface CasePageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Recovery Case Dossier | E-Waste Value Recovery",
  description: "Track and advance your active hardware recovery case with verified status milestones.",
};

async function CaseDataLoader({ params }: CasePageProps) {
  const { id } = await params;
  const caseDetails = await RecoveryRepository.getCaseWithDetails(id);

  if (!caseDetails) {
    return (
      <main className="flex-1 max-w-xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 rounded-sm bg-[#F4F1EA] flex items-center justify-center mx-auto mb-4 text-[#8E8B82] border border-[#E5E0D8]">
          <Inbox className="w-6 h-6" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-[#141413] mb-2">Recovery Docket Not Found</h1>
        <p className="text-xs sm:text-sm text-[#5A574F] mb-6 leading-relaxed">
          Case ID &lsquo;{id}&rsquo; does not exist in our active recovery database. Check that the URL is correct or start a new assessment.
        </p>
        <Link
          href="/find-option"
          className="px-4 py-2.5 bg-[#1B3B2B] hover:bg-[#132A1F] text-white rounded-sm text-xs font-mono uppercase tracking-wider font-semibold inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Start New Assessment
        </Link>
      </main>
    );
  }

  return <CaseDetailWorkflow initialCase={caseDetails} />;
}

function CaseDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse space-y-6">
      <div className="h-32 bg-[#EAE6DD] rounded-sm w-full" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 h-96 bg-[#EAE6DD] rounded-sm" />
        <div className="lg:col-span-5 h-96 bg-[#EAE6DD] rounded-sm" />
      </div>
    </div>
  );
}

export default function CasePage({ params }: CasePageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5EE] text-[#141413]">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<CaseDetailSkeleton />}>
          <CaseDataLoader params={params} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
