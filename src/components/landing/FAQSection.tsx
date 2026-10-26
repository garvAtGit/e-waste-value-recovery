"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    id: "faq-pricing",
    question: "Why doesn't this platform display fixed guaranteed cash payouts?",
    answer:
      "Second-hand electronics valuations fluctuate based on market supply, carrier lock status, battery health degradation, and subjective cosmetic inspection. Platforms that show rigid 'instant quotes' frequently reduce payouts once units arrive at processing facilities. Instead, we provide the objective criteria, trade-offs, and verification prerequisites that determine practical value recovery.",
  },
  {
    id: "faq-repair-heuristic",
    question: "How should consumers evaluate whether repairing a device is economically sound?",
    answer:
      "A standard engineering rule of thumb compares total repair cost against half the current replacement cost of an equivalent refurbished unit. If repairs exceed 50%, replacement is generally more practical—especially if OS security updates are ending. Targeted repair remains optimal when faults are isolated (battery, port, or outer glass) and genuine replacement components are available.",
  },
  {
    id: "faq-delhi-pilot",
    question: "What is the scope of the Delhi Pilot, and why are some candidate records pending review?",
    answer:
      "The pilot maps documented physical collection points, repair workshops, trade-in kiosks, and registered recyclers across Delhi NCT and neighboring NCR hubs. In accordance with strict data integrity rules, providers remain in 'pending_review' until individual branch addresses, accepted categories, and public vs. bulk intake policies are independently verified against primary municipal and corporate evidence.",
  },
  {
    id: "faq-independence",
    question: "Is this platform funded or influenced by trade-in platforms or OEMs?",
    answer:
      "No. This platform is strictly independent. There are no sponsored rankings, no affiliate kickbacks, and no paid provider listings. All pathway comparisons are derived from technical feasibility, security requirements, and environmental safety regulations.",
  },
  {
    id: "faq-donation-limits",
    question: "Why is donating a non-functional device to charity discouraged?",
    answer:
      "Charitable organisations, community digital inclusion groups, and schools rely on donated equipment to fulfill immediate community needs. They typically lack diagnostic equipment, micro-soldering labs, and replacement part inventories. Donating broken or locked equipment forces non-profits to divert limited charitable funds to cover commercial waste disposal fees.",
  },
  {
    id: "faq-data-wiping",
    question: "Does performing a standard factory reset truly delete personal data?",
    answer:
      "On modern smartphones and tablets with hardware-backed encryption enabled by default (recent iOS and Android versions), a factory reset cryptographically erases the internal master encryption key, rendering stored user data mathematically unrecoverable. For unencrypted desktop solid-state drives (SSDs) or older mechanical hard disk drives (HDDs), dedicated drive overwriting tools (aligned with guidelines such as NIST SP 800-88) or physical platter destruction is recommended.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-16 lg:py-24 bg-[#F7F5EE] border-b border-[#DFD9CD] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#DFD9CD] mb-12">
          <div className="space-y-2 max-w-2xl">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#736F66] block">
              CONSUMER CLARIFICATIONS // INQUIRIES
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#141413] tracking-tight">
              Frequently clarified questions.
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#413F3B] max-w-md leading-relaxed font-sans">
            Clear, honest answers regarding data security, battery hazards, valuation heuristics,
            and regulatory compliance under the E-Waste (Management) Rules.
          </p>
        </div>

        {/* Editorial Accordion */}
        <div className="max-w-4xl mx-auto space-y-3">
          {FAQS.map((item, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={item.id}
                className="bg-[#FAF8F3] border border-[#D4CDC0] rounded-sm overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 focus:outline-none focus-visible:bg-[#EFECE2]"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-[#736F66]">
                      0{idx + 1}
                    </span>
                    <span className="font-serif text-base sm:text-lg font-bold text-[#141413]">
                      {item.question}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-[#736F66] shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-[#1B3B2B]" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-6 sm:px-6 sm:pb-6 text-xs sm:text-sm text-[#413F3B] leading-relaxed border-t border-[#E5E0D4] pt-4 font-sans bg-[#F7F5EE]">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
