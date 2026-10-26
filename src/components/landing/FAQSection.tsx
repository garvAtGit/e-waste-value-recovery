"use client";

import React, { useState } from "react";
import { Badge } from "../ui/Badge";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    id: "faq-pricing",
    question: "Why doesn't this platform display fixed guaranteed cash estimates?",
    answer:
      "Second-hand electronics valuations fluctuate based on market supply, carrier lock status, battery health degradation, and subjective cosmetic inspection. Platforms that show rigid 'instant quotes' frequently reduce payouts once units arrive at processing facilities. Instead, we provide the objective criteria, trade-offs, and verification prerequisites that determine practical value recovery."
  },
  {
    id: "faq-repair-heuristic",
    question: "How should consumers evaluate whether repairing a device is economically sound?",
    answer:
      "Consumer advocacy organizations and independent repair technicians often suggest an informal rule of thumb: compare the total repair estimate against approximately half the cost of a comparable working replacement. If repair costs approach or exceed this, replacement may be more practical—particularly if the device is nearing the end of its manufacturer operating system and security patch cycle. Repair remains compelling when faults are isolated (such as a battery or port) and genuine or reliable third-party parts are available."
  },
  {
    id: "faq-independence",
    question: "Is this platform funded or influenced by trade-in programs or refurbishers?",
    answer:
      "No. This platform is independent. There are no sponsored rankings, no affiliate kickbacks, and no paid provider listings. All pathway comparisons are derived from technical feasibility, security requirements, and environmental safety regulations."
  },
  {
    id: "faq-donation-limits",
    question: "Why is donating a non-functional device to charity discouraged?",
    answer:
      "Charitable organisations, community digital inclusion groups, and schools rely on donated equipment to fulfill immediate community needs. They typically lack diagnostic equipment, micro-soldering labs, and replacement part inventories. Donating broken or locked equipment forces non-profits to divert limited charitable funds to cover commercial waste disposal fees."
  },
  {
    id: "faq-recycler-criteria",
    question: "What actually distinguishes an 'Authorised Recycler' from informal scrap collectors?",
    answer:
      "Authorised recyclers operate under statutory environmental permits (such as national waste handling licenses implementing the EU WEEE Directive, EPA permits in the US, or state environmental agency registrations) or voluntary accredited standards (such as R2v3 or e-Stewards). They follow regulated processes to mechanically sort materials, capture hazardous fractions (e.g. leaded glass, mercury lamps, fluorinated refrigerants), and reclaim copper, aluminum, and precious metals safely."
  },
  {
    id: "faq-data-wiping",
    question: "Does performing a standard factory reset truly delete personal data?",
    answer:
      "On modern smartphones and tablets with hardware-backed encryption enabled by default (recent iOS and Android versions), a factory reset cryptographically erases the internal master encryption key, rendering stored user data mathematically unrecoverable. For unencrypted desktop solid-state drives (SSDs) or older mechanical hard disk drives (HDDs), dedicated drive overwriting tools (aligned with guidelines such as NIST SP 800-88) or physical platter destruction is recommended."
  }
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-16 lg:py-24 bg-slate-50 border-b border-slate-200 scroll-mt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge variant="neutral" className="mb-3">
            Transparency & Evidence
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4">
            Frequently Answered Questions
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            Straightforward answers to the practical dilemmas of electronics value recovery.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            const contentId = `faq-content-${faq.id}`;
            const buttonId = `faq-button-${faq.id}`;

            return (
              <div
                key={faq.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all shadow-2xs"
              >
                <button
                  id={buttonId}
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 text-slate-900 font-semibold text-base hover:text-emerald-800 focus:outline-none"
                  aria-expanded={isOpen}
                  aria-controls={contentId}
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-500 transition-transform duration-200 shrink-0 ${
                      isOpen ? "rotate-180 text-emerald-800" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div
                    id={contentId}
                    role="region"
                    aria-labelledby={buttonId}
                    className="px-6 pb-6 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-100"
                  >
                    {faq.answer}
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
