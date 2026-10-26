import React from "react";
import Link from "next/link";
import { PATHWAYS } from "@/lib/constants/pathways";
import { ArrowUpRight } from "lucide-react";

export function PathwayGrid() {
  return (
    <section id="pathways" className="py-16 lg:py-24 bg-[#F7F5EE] border-b border-[#DFD9CD] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#DFD9CD] mb-12">
          <div className="space-y-2 max-w-2xl">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#736F66] block">
              COMPARATIVE TAXONOMY // 6 PATHWAYS
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#141413] tracking-tight">
              Six outcomes. Completely different economics.
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#413F3B] max-w-md leading-relaxed font-sans">
            Recycling is only the final safety net. When a device is functional or repairable,
            earlier circular tiers retain significantly greater economic and material utility.
          </p>
        </div>

        {/* 6 Pathways Editorial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PATHWAYS.map((pathway, index) => (
            <div
              key={pathway.id}
              id={`pathway-${pathway.id}`}
              className="bg-[#FAF8F3] border border-[#D4CDC0] rounded-sm p-6 sm:p-7 flex flex-col justify-between hover:border-[#1B3B2B] transition-colors relative group"
            >
              <div className="space-y-4">
                {/* Index tag & title */}
                <div className="flex items-center justify-between pb-3 border-b border-[#E5E0D4] font-mono">
                  <span className="text-sm font-bold text-[#141413]">
                    PATHWAY 0{index + 1}
                  </span>
                  <span className="text-[10px] uppercase text-[#736F66] px-2 py-0.5 bg-[#EFECE2] rounded-xs border border-[#D4CDC0]">
                    {pathway.tradeoffs.speed}
                  </span>
                </div>

                <h3 className="font-serif text-xl font-bold text-[#141413] tracking-tight leading-snug">
                  {pathway.title}
                </h3>

                <p className="text-xs text-[#413F3B] leading-relaxed font-sans">
                  {pathway.fullDescription}
                </p>

                {/* Quantitative Trade-offs Table */}
                <div className="bg-[#F4F1E8] border border-[#DFD9CD] rounded-xs p-3 font-mono text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[#736F66] text-[11px]">Financial Return:</span>
                    <strong className="text-[#141413] text-[11px]">{pathway.tradeoffs.financialReturn}</strong>
                  </div>
                  <div className="flex items-center justify-between border-t border-[#E5E0D4] pt-1.5">
                    <span className="text-[#736F66] text-[11px]">Effort Required:</span>
                    <strong className="text-[#141413] text-[11px]">{pathway.tradeoffs.effortRequired}</strong>
                  </div>
                  <div className="flex items-center justify-between border-t border-[#E5E0D4] pt-1.5">
                    <span className="text-[#736F66] text-[11px]">Turnaround Speed:</span>
                    <strong className="text-[#141413] text-[11px]">{pathway.tradeoffs.speed}</strong>
                  </div>
                </div>

                {/* Best Suited Conditions */}
                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#736F66] block">
                    Ideal Hardware State:
                  </span>
                  <ul className="space-y-1 text-xs text-[#383632] font-mono">
                    {pathway.bestSuitedFor.slice(0, 2).map((item, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-[#1B3B2B]">&bull;</span>
                        <span className="text-[11px] leading-tight">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Card Footer Link */}
              <div className="pt-5 mt-5 border-t border-[#E5E0D4] flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#736F66] uppercase">
                  {pathway.caveats.length > 0 ? "Prerequisites Exist" : "Unrestricted"}
                </span>
                <Link
                  href={`/find-option?pathway=${pathway.id}`}
                  className="text-xs font-mono uppercase text-[#1B3B2B] font-semibold hover:underline flex items-center gap-1"
                >
                  <span>Evaluate Option</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#257A72]" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
