import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      index: "01",
      phase: "DIAGNOSTIC",
      title: "Assess Hardware Reality",
      description:
        "Disclose true functional condition — recent working, minor component fault, obsolete firmware, major board failure, or swollen battery hazard.",
      deliverable: "Deterministic categorization + safety classification",
      meta: "CRITERIA: PHYSICAL / ELECTRICAL",
    },
    {
      index: "02",
      phase: "VALUATION",
      title: "Compare 6 Recovery Pathways",
      description:
        "Evaluate estimated liquid cash payout, trade-in vouchers, repair costs, donor salvage viability, charity criteria, and zero-landfill certified recycling side-by-side.",
      deliverable: "Ranked trade-off matrix with effort vs. return",
      meta: "ENGINE: OBJECTIVE ALGORITHM",
    },
    {
      index: "03",
      phase: "LOGISTICS",
      title: "Connect with Audited Intake",
      description:
        "Match against documented physical kiosks, service centers, and certified collection bays in Delhi NCR. Clear distinction between counter walk-in and pickup.",
      deliverable: "Verified facility address, SLA & acceptance criteria",
      meta: "DISPATCH: EXACT PINCODE MATCH",
    },
    {
      index: "04",
      phase: "VERIFICATION",
      title: "Verify Final Outcome",
      description:
        "Track case progression through a 10-stage lifecycle manifest. Record actual receipts, bank transfer confirmation, or certified destruction certificates.",
      deliverable: "Tamper-evident audit trail & LCA environmental impact",
      meta: "AUDIT: DUAL-TIER VERIFIED",
    },
  ];

  return (
    <section id="how-it-works" className="py-16 lg:py-24 bg-[#FAF8F3] border-b border-[#DFD9CD] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#DFD9CD] mb-12">
          <div className="space-y-2 max-w-2xl">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#736F66] block">
              PHASE ARCHITECTURE // 01 &rarr; 04
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#141413] tracking-tight">
              A structured lifecycle sequence from drawer to recovery.
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#413F3B] max-w-md leading-relaxed font-sans">
            Rather than directing all electronics to a recycling bin, the platform establishes
            the highest utility tier before processing down to raw scrap metal.
          </p>
        </div>

        {/* 4-Step Editorial Flow */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => (
            <div
              key={step.index}
              className="bg-[#F7F5EE] border border-[#D4CDC0] rounded-sm p-6 flex flex-col justify-between hover:border-[#1B3B2B] transition-colors group relative"
            >
              {/* Step Header */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E5E0D4] font-mono">
                  <span className="text-xl font-bold text-[#141413] tracking-tight group-hover:text-[#1B3B2B] transition-colors">
                    {step.index}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-[#EFECE2] text-[#413F3B] border border-[#D4CDC0] rounded-xs">
                    {step.phase}
                  </span>
                </div>

                <h3 className="font-serif text-lg font-bold text-[#141413] tracking-tight leading-snug">
                  {step.title}
                </h3>

                <p className="text-xs text-[#413F3B] leading-relaxed font-sans">
                  {step.description}
                </p>
              </div>

              {/* Step Footer Metadata */}
              <div className="pt-6 mt-6 border-t border-[#E5E0D4] space-y-2 font-mono text-[11px]">
                <div className="text-[#141413] font-semibold text-[10px] uppercase">
                  Outcome:
                </div>
                <div className="text-[#413F3B] text-[11px] leading-tight">
                  {step.deliverable}
                </div>
                <div className="text-[10px] text-[#736F66] pt-1">
                  {step.meta}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Direct Action Link */}
        <div className="mt-12 p-6 bg-[#EFECE2] border border-[#D4CDC0] rounded-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="font-serif font-bold text-base text-[#141413] block">
              Ready to recover value from retired equipment?
            </span>
            <span className="text-xs text-[#6B675E] block font-sans">
              Takes 90 seconds. Instant phone valuation or full 6-pathway diagnostic across Delhi NCR.
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              href="/sell-phone"
              className="px-4 py-2.5 bg-[#1B3B2B] hover:bg-[#142D21] text-[#F7F5EE] text-xs font-mono uppercase tracking-wider rounded-sm flex items-center gap-1.5 transition-colors"
            >
              <span>Sell Phone</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#C1DFDC]" />
            </Link>
            <Link
              href="/find-option"
              className="px-4 py-2.5 bg-[#FAF8F3] hover:bg-[#EAE6DB] text-[#141413] border border-[#D4CDC0] text-xs font-mono uppercase tracking-wider rounded-sm transition-colors"
            >
              <span>Other Hardware</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
