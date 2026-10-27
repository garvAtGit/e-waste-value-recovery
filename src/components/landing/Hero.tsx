"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Wrench, ShieldCheck, Truck, Check, ArrowRight, Sparkles } from "lucide-react";

const QUICK_PREVIEW_MODELS = [
  { id: "apple-iphone-13", name: "iPhone 13 (128GB)", cash: "24,500", voucher: "26,200", brand: "Apple" },
  { id: "samsung-galaxy-s23", name: "Galaxy S23 (128GB)", cash: "28,500", voucher: "30,500", brand: "Samsung" },
  { id: "oneplus-11", name: "OnePlus 11 (128GB)", cash: "21,000", voucher: "22,500", brand: "OnePlus" },
  { id: "google-pixel-7", name: "Pixel 7 (128GB)", cash: "17,500", voucher: "18,800", brand: "Google" },
];

export function Hero() {
  const [selectedQuickModel, setSelectedQuickModel] = useState(QUICK_PREVIEW_MODELS[0]);

  return (
    <section className="relative overflow-hidden bg-[#F7F5EE] border-b border-[#DFD9CD] pt-12 pb-16 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24">
      {/* Subtle blueprint grid texture */}
      <div className="absolute inset-0 bg-grid-subtle pointer-events-none opacity-50" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Editorial Narrative Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#FAF8F3] border border-[#DFD9CD] rounded-xs text-[11px] font-mono uppercase tracking-wider text-[#5A574F]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1B3B2B]" />
              <span>INDEPENDENT PHONE VALUATION · DELHI NCR</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#141413] leading-[1.08]">
              Find the best realistic price for your{" "}
              <span className="italic font-serif text-[#1B3B2B]">
                old smartphone.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#5A574F] leading-relaxed max-w-2xl font-sans">
              Compare verified doorstep cash buybacks, retail exchange vouchers, and official trade-ins across Delhi. We calculate pre-factored inspection deductions so you never get hit by unexpected lowball offers at your doorstep.
            </p>

            {/* Primary & Secondary Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link
                href="/sell-phone"
                className="px-6 py-3.5 bg-[#1B3B2B] hover:bg-[#142D21] text-[#F7F5EE] font-mono text-xs uppercase tracking-wider font-semibold rounded-sm transition-all duration-150 border border-[#142D21] flex items-center justify-center gap-2 shadow-xs hover:shadow active:translate-y-px min-h-[44px]"
              >
                <span>Find My Phone (Instant Payout)</span>
                <ArrowUpRight className="w-4 h-4 text-[#C1DFDC]" />
              </Link>
              <Link
                href="/repair-vs-sell"
                className="px-5 py-3.5 bg-[#FAF8F3] hover:bg-[#EFECE2] text-[#141413] font-mono text-xs uppercase tracking-wider rounded-sm transition-all duration-150 border border-[#D4CDC0] flex items-center justify-center gap-2 active:translate-y-px min-h-[44px]"
              >
                <Wrench className="w-3.5 h-3.5 text-[#257A72]" />
                <span>Compare Repair vs. Sell</span>
              </Link>
            </div>

            {/* New Advanced Modules Discovery Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px]">
              <span className="text-[#736F66] text-[10px] uppercase font-bold tracking-wider">
                Ecosystem Tools:
              </span>
              <Link
                href="/diagnostics"
                className="px-2.5 py-1 bg-[#F3F9F8] border border-[#257A72]/40 text-[#257A72] hover:bg-[#257A72]/15 rounded-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <span>Live Hardware Diagnostic</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
              <Link
                href="/salvage"
                className="px-2.5 py-1 bg-[#FAF8F3] border border-[#DFD9CD] text-[#141413] hover:bg-[#EAE5D9] rounded-xs flex items-center gap-1 transition-colors"
              >
                <span>&quot;Organ Donor&quot; Salvage (Nothing Lineup)</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
              <Link
                href="/community-pool"
                className="px-2.5 py-1 bg-[#FAF8F3] border border-[#DFD9CD] text-[#141413] hover:bg-[#EAE5D9] rounded-xs flex items-center gap-1 transition-colors"
              >
                <span>Society 50kg Pooling</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
              <Link
                href="/data-wipe"
                className="px-2.5 py-1 bg-[#FAF8F3] border border-[#DFD9CD] text-[#141413] hover:bg-[#EAE5D9] rounded-xs flex items-center gap-1 transition-colors"
              >
                <span>NIST 800-88 Data Wipe</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Key Transparency Signals */}
            <div className="pt-6 border-t border-[#DFD9CD] grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-mono text-[#736F66]">
              <div className="space-y-0.5">
                <span className="block font-semibold text-[#141413] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#1B3B2B]" />
                  Pre-Deduction Math
                </span>
                <span className="text-[11px] text-[#5A574F]">Realistic net payouts</span>
              </div>
              <div className="space-y-0.5">
                <span className="block font-semibold text-[#141413] flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#1B3B2B]" />
                  Delhi Doorstep
                </span>
                <span className="text-[11px] text-[#5A574F]">Exact PIN verification</span>
              </div>
              <div className="col-span-2 sm:col-span-1 space-y-0.5">
                <span className="block font-semibold text-[#141413] flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#1B3B2B]" />
                  Zero Sponsored Bias
                </span>
                <span className="text-[11px] text-[#5A574F]">Audited local directory</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive Quick-Valuation Preview Card */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-[#D4CDC0] rounded-sm p-6 sm:p-7 shadow-xs space-y-5 relative">
              {/* Card Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E0D4] text-[11px] font-mono uppercase text-[#736F66]">
                <span className="flex items-center gap-1.5 text-[#1B3B2B] font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>LIVE DELHI ESTIMATE PREVIEW</span>
                </span>
                <span className="text-[#8E8B82]">GOOD CONDITION</span>
              </div>

              {/* Quick Model Selector Pills */}
              <div className="space-y-2">
                <span className="block text-[11px] font-mono uppercase tracking-wider text-[#736F66]">
                  Select Sample Device:
                </span>
                <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                  {QUICK_PREVIEW_MODELS.map((model) => {
                    const isSelected = selectedQuickModel.id === model.id;
                    return (
                      <button
                        key={model.id}
                        type="button"
                        onClick={() => setSelectedQuickModel(model)}
                        className={`p-2.5 rounded-xs text-left transition-all border ${
                          isSelected
                            ? "bg-[#1B3B2B] text-white border-[#1B3B2B] font-semibold shadow-2xs"
                            : "bg-[#FAF9F5] text-[#141413] border-[#E5E0D8] hover:border-[#141413]"
                        }`}
                      >
                        <span className="truncate block text-xs">{model.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Comparative Price Display */}
              <div className="bg-[#FAF9F5] rounded-xs p-4 border border-[#E5E0D8] space-y-3 font-mono">
                <div className="flex items-center justify-between pb-2 border-b border-[#E5E0D8]">
                  <div>
                    <span className="text-[10px] text-[#8E8B82] uppercase block">Top Doorstep Cash</span>
                    <strong className="text-xl font-serif font-bold text-[#141413]">
                      ₹{selectedQuickModel.cash}
                    </strong>
                  </div>
                  <span className="text-[10px] bg-[#EDF5F0] text-[#1B3B2B] border border-[#C6DFD0] px-2 py-0.5 rounded-xs font-semibold">
                    Direct Bank / UPI
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-[#5A574F]">
                  <span>Retail Store Exchange (Croma):</span>
                  <strong className="text-[#141413]">₹{selectedQuickModel.voucher}</strong>
                </div>

                <p className="text-[10px] font-sans text-[#736F66] leading-tight pt-1">
                  *Based on audited diagnostic benchmarks in Delhi NCT. Physical technician inspection confirms final settlement.
                </p>
              </div>

              {/* Direct Link to Sell Phone */}
              <Link
                href="/sell-phone"
                className="w-full py-3 px-4 bg-[#141413] hover:bg-[#20201E] text-white font-mono text-xs uppercase tracking-wider font-semibold rounded-sm transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <span>Calculate Your Exact Value</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
