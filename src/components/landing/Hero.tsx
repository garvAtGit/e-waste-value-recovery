import React from "react";
import Link from "next/link";
import { ArrowUpRight, Cpu, AlertTriangle } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#F7F5EE] border-b border-[#DFD9CD] pt-12 pb-16 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-28">
      {/* Background blueprint grid */}
      <div className="absolute inset-0 bg-grid-subtle pointer-events-none opacity-60" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Editorial Narrative Column */}
          <div className="lg:col-span-7 space-y-6">
            {/* Archival metadata tag */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#EFECE2] border border-[#D4CDC0] rounded-xs text-[11px] font-mono uppercase tracking-wider text-[#413F3B]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1B3B2B]" />
              <span>SMARTPHONE RESALE &amp; CIRCULAR INTAKE · DELHI NCR 2026</span>
            </div>

            {/* Distinctive Editorial Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#141413] leading-[1.08]">
              Sell your old phone for the{" "}
              <span className="italic font-serif text-[#1B3B2B]">
                best realistic price.
              </span>
            </h1>

            {/* Concise, Human Body Copy */}
            <p className="text-base sm:text-lg text-[#413F3B] leading-relaxed max-w-2xl font-sans">
              Compare verified instant doorstep cash, retail exchange vouchers, and official trade-in
              quotes across Delhi NCT. We calculate itemized inspection deductions, eliminate phantom
              prices, and track your deal all the way through physical handover and confirmed payment.
            </p>

            {/* Primary & Secondary Call to Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link
                href="/sell-phone"
                className="px-6 py-3.5 bg-[#1B3B2B] hover:bg-[#142D21] text-[#F7F5EE] font-mono text-xs uppercase tracking-wider rounded-sm transition-all duration-150 border border-[#142D21] flex items-center justify-center gap-2 shadow-sm hover:shadow active:translate-y-px"
              >
                <span>Sell Your Phone (Instant Net Payout)</span>
                <ArrowUpRight className="w-4 h-4 text-[#C1DFDC]" />
              </Link>
              <Link
                href="/find-option"
                className="px-6 py-3.5 bg-[#FAF8F3] hover:bg-[#EFECE2] text-[#141413] font-mono text-xs uppercase tracking-wider rounded-sm transition-all duration-150 border border-[#D4CDC0] flex items-center justify-center gap-2 active:translate-y-px"
              >
                <span>Diagnose Other Hardware</span>
              </Link>
            </div>

            {/* Micro Guarantees / Evidence Basis */}
            <div className="pt-6 border-t border-[#DFD9CD] grid grid-cols-2 sm:grid-cols-3 gap-4 text-[11px] font-mono text-[#736F66]">
              <div>
                <span className="block font-semibold text-[#141413]">Realistic Net Payouts</span>
                <span>Pre-factored inspection deductions</span>
              </div>
              <div>
                <span className="block font-semibold text-[#141413]">Delhi NCT Doorstep</span>
                <span>PIN-level service area verification</span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="block font-semibold text-[#141413]">Battery Safety Filter</span>
                <span>Thermal hazard courier blocks</span>
              </div>
            </div>
          </div>

          {/* Right Column: Art-Directed Exploded Specimen Diagram */}
          <div className="lg:col-span-5">
            <div className="bg-[#FAF8F3] border border-[#D4CDC0] rounded-sm p-6 sm:p-7 shadow-xs space-y-5 relative">
              {/* Card Header Stamp */}
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E0D4] text-[11px] font-mono uppercase text-[#736F66]">
                <span className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-[#257A72]" />
                  <span>SPECIMEN ANATOMY // REF-SMARTPHONE</span>
                </span>
                <span className="text-[#C8532C] font-semibold">RECOVERABLE VALUE</span>
              </div>

              {/* Exploded Component Breakdown Matrix */}
              <div className="space-y-3 font-mono text-xs">
                {/* 1. Logic Board */}
                <div className="p-3 bg-[#F4F1E8] border border-[#DFD9CD] rounded-xs flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-[#736F66] uppercase block">PART 01 · LOGIC BOARD &amp; SOC</span>
                    <strong className="text-[#141413] font-semibold block text-xs">Gold &amp; Copper Traces · Working ICs</strong>
                    <span className="text-[11px] text-[#413F3B]">Eligible for Component Harvesting or Board-level Repair.</span>
                  </div>
                  <span className="px-2 py-0.5 bg-[#EBF2ED] text-[#1B3B2B] border border-[#C3D9CB] rounded-xs text-[10px] font-bold shrink-0">
                    HIGH VALUE
                  </span>
                </div>

                {/* 2. Display Assembly */}
                <div className="p-3 bg-[#F4F1E8] border border-[#DFD9CD] rounded-xs flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-[#736F66] uppercase block">PART 02 · AMOLED / LCD PANEL</span>
                    <strong className="text-[#141413] font-semibold block text-xs">Original OEM Digitizer &amp; Polarizer</strong>
                    <span className="text-[11px] text-[#413F3B]">Intact inner screens retain up to 40% of original part cost.</span>
                  </div>
                  <span className="px-2 py-0.5 bg-[#E9F3F2] text-[#257A72] border border-[#C1DFDC] rounded-xs text-[10px] font-bold shrink-0">
                    DONOR PART
                  </span>
                </div>

                {/* 3. Lithium-Ion Battery */}
                <div className="p-3 bg-[#FBECE6] border border-[#F2C2B2] rounded-xs flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-[#A63C19] uppercase block flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-[#C8532C]" />
                      PART 03 · LI-ION BATTERY CELL
                    </span>
                    <strong className="text-[#A63C19] font-semibold block text-xs">Cobalt, Lithium, Nickel Salts</strong>
                    <span className="text-[11px] text-[#732B13]">Swollen cells blocked from commercial couriers; requires hazmat bay.</span>
                  </div>
                  <span className="px-2 py-0.5 bg-white text-[#C8532C] border border-[#F2C2B2] rounded-xs text-[10px] font-bold shrink-0">
                    HAZMAT CHECK
                  </span>
                </div>

                {/* 4. Aluminum Chassis */}
                <div className="p-3 bg-[#F4F1E8] border border-[#DFD9CD] rounded-xs flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-[#736F66] uppercase block">PART 04 · ANODISED CHASSIS</span>
                    <strong className="text-[#141413] font-semibold block text-xs">Structural Aerospace Aluminum</strong>
                    <span className="text-[11px] text-[#413F3B]">95% lower energy to smelt via certified secondary smelting.</span>
                  </div>
                  <span className="px-2 py-0.5 bg-[#EFECE2] text-[#413F3B] border border-[#D4CDC0] rounded-xs text-[10px] font-bold shrink-0">
                    SMELT RECOVERY
                  </span>
                </div>
              </div>

              {/* Card Footer Technical Note */}
              <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-[#736F66] border-t border-[#E5E0D4]">
                <span>METHOD: ITU-T L.1410 GUIDELINES</span>
                <Link
                  href="/sell-phone"
                  className="text-[#1B3B2B] font-semibold hover:underline flex items-center gap-1"
                >
                  <span>Instant Phone Valuation</span> &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
