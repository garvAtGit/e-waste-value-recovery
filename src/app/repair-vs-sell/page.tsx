import React from "react";
import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { REPAIR_COST_BENCHMARKS } from "@/lib/resale/repair-vs-sell";
import { PhoneResaleWorkflow } from "@/components/resale/PhoneResaleWorkflow";
import {
  Wrench,
  Calendar,
  AlertTriangle,
  Scale,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Repair vs. Sell As-Is Economic Matrix | E-Waste Value Recovery",
  description:
    "Evaluate whether fixing a cracked screen, degraded battery, or broken camera before selling recovers more net cash than selling as-is. Delhi benchmark repair costs and risk warnings.",
};

export default function RepairVsSellPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5EE] text-[#141413]">
      <Header />

      <main className="flex-1">
        {/* Page Hero Header */}
        <section className="border-b border-[#E5E0D8] bg-white py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#EDF5F0] border border-[#C6DFD0] rounded-sm text-[#1B3B2B] font-mono text-xs font-semibold">
              <Scale className="w-3.5 h-3.5" />
              <span>DETERMINISTIC FINANCIAL COMPARISON // ZERO SPONSORED BIAS</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#141413]">
              Repair vs. Sell As-Is Decision Engine
            </h1>

            <p className="text-base sm:text-lg text-[#5A574F] max-w-3xl leading-relaxed font-sans">
              Does spending out-of-pocket cash to fix a cracked display, worn battery, or faulty camera in Delhi actually increase resale value by more than the repair cost? We calculate the incremental economic benefit using deterministic formulas and public service benchmarks.
            </p>

            {/* Formula Explanation Strip */}
            <div className="bg-[#FAF9F5] border border-[#E5E0D8] p-4 rounded-sm font-mono text-xs space-y-2 mt-4">
              <span className="font-bold uppercase tracking-wider text-[#141413] block">
                Accounting Formula:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[#5A574F]">
                <div className="p-2 bg-white rounded-xs border border-[#EBE6DB]">
                  <strong className="block text-[#141413]">Net Proceeds As-Is</strong>
                  <span>= As-Is Valuation - Selling Fees</span>
                </div>
                <div className="p-2 bg-white rounded-xs border border-[#EBE6DB]">
                  <strong className="block text-[#141413]">Net After Repair</strong>
                  <span>= Upgraded Resale Value - Repair Cost</span>
                </div>
                <div className="p-2 bg-[#EDF5F0] rounded-xs border border-[#C6DFD0] text-[#1B3B2B]">
                  <strong className="block text-[#1B3B2B]">Incremental Benefit</strong>
                  <span>= Net After Repair - Net As-Is</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Guided Interactive Workflow */}
        <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <div className="mb-6 space-y-1">
            <h2 className="font-serif text-2xl font-bold text-[#141413]">
              Diagnostic Resale &amp; Repair Calculator
            </h2>
            <p className="text-xs font-mono text-[#736F66]">
              Select your smartphone model and check existing hardware faults to view the side-by-side economics and verified buyer offers.
            </p>
          </div>

          <PhoneResaleWorkflow />
        </section>

        {/* Public Delhi Repair Benchmarks Reference Catalog */}
        <section className="border-t border-[#E5E0D8] bg-white py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 font-mono text-xs text-[#257A72] font-semibold">
                <Wrench className="w-3.5 h-3.5" />
                <span>BENCHMARK DATA REPOSITORY // DELHI NCR</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#141413]">
                Published Delhi Hardware Repair Benchmarks
              </h2>
              <p className="text-xs sm:text-sm text-[#5A574F] max-w-2xl font-sans">
                Third-party replacement component costs gathered from published Delhi price sheets and independent service labs (Nehru Place, Karol Bagh, Cashify Repair).
              </p>
            </div>

            <div className="overflow-x-auto border border-[#E5E0D8] rounded-sm">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF9F5] border-b border-[#E5E0D8] text-[#5A574F]">
                    <th className="py-3 px-4 font-semibold">Fault / Part Type</th>
                    <th className="py-3 px-4 font-semibold">Brand Family</th>
                    <th className="py-3 px-4 font-semibold">Delhi Cost Range</th>
                    <th className="py-3 px-4 font-semibold">Source &amp; Verification</th>
                    <th className="py-3 px-4 font-semibold">Market Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E0D8]">
                  {REPAIR_COST_BENCHMARKS.map((bm, idx) => (
                    <tr key={idx} className="hover:bg-[#FAF9F5] transition-colors">
                      <td className="py-3 px-4">
                        <strong className="block text-[#141413]">{bm.faultLabel}</strong>
                        <span className="text-[11px] text-[#736F66]">{bm.partType}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 bg-[#FAF9F5] border border-[#E5E0D8] rounded-xs text-[11px] text-[#141413]">
                          {bm.applicableBrand || "All Brands"}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <strong className="text-sm text-[#141413]">
                          ₹{bm.costRangeInr.min.toLocaleString()} – ₹{bm.costRangeInr.max.toLocaleString()}
                        </strong>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-[11px] text-[#5A574F]">
                        <div className="space-y-0.5">
                          <span className="block font-semibold text-[#141413]">{bm.repairSource}</span>
                          <span className="flex items-center gap-1 text-[#8E8B82]">
                            <Calendar className="w-3 h-3" /> {bm.lastCheckedDate}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[11px] font-sans text-[#5A574F] max-w-xs leading-relaxed">
                        {bm.notes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Qualitative Risks Guide */}
            <div className="bg-[#FFF9F5] border border-[#F3D1C2] rounded-sm p-6 space-y-4">
              <div className="flex items-center gap-2 text-[#C8532C] font-mono text-sm font-bold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Qualitative Risks of Pre-Sale Hardware Repair</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans text-[#5A574F] leading-relaxed">
                <div className="space-y-1">
                  <strong className="text-[#141413] block font-mono text-xs">1. Display &amp; Battery Serial Warning Messages:</strong>
                  <p>
                    Modern iOS and Android flagships serialize display and battery assemblies. Third-party replacement can trigger persistent &quot;Important Display Message&quot; or disable TrueTone / Battery Health reporting, which buyback technicians deduct for during diagnostic app testing.
                  </p>
                </div>
                <div className="space-y-1">
                  <strong className="text-[#141413] block font-mono text-xs">2. Ingress Protection (IP Rating) Degradation:</strong>
                  <p>
                    Once a smartphone chassis seal is broken, factory water and dust resistance is rarely restored by independent repair counters. If adhesive is uneven, subsequent moisture ingress can ruin motherboard value.
                  </p>
                </div>
                <div className="space-y-1">
                  <strong className="text-[#141413] block font-mono text-xs">3. Out-of-Pocket Opportunity Cost:</strong>
                  <p>
                    Repair involves upfront capital (₹2,000–₹8,000) and 1–3 days of turnaround time. If the subsequent buyer fails the diagnostic or drops their offer, your net loss is locked in.
                  </p>
                </div>
                <div className="space-y-1">
                  <strong className="text-[#141413] block font-mono text-xs">4. Battery Swelling Safety Prohibition:</strong>
                  <p>
                    If the battery is visibly swollen or venting, DIY or unauthorized repair is hazardous. Puncturing compromised cells triggers thermal runaway. Such devices must go directly to safe chemical destruction.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
