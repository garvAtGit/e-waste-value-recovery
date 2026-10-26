import React from "react";
import { Badge } from "../ui/Badge";

export function HowItWorks() {
  const steps = [
    {
      stepNumber: "01",
      title: "Assess Hardware & Functional Reality",
      description:
        "Select your device category and disclose genuine condition: working, cosmetically worn, repairable fault, dead motherboard, or battery degradation.",
      details: [
        "No inflated estimates based on best-case assumptions",
        "Clear demarcation between cosmetic flaws and critical system faults",
        "Instant identification of hazardous materials (e.g. swollen cells)"
      ]
    },
    {
      stepNumber: "02",
      title: "Evaluate Transparent Trade-offs",
      description:
        "Compare the 6 practical pathways side by side: calculate whether repair makes economic sense, compare direct cash vs. retailer trade-in, or evaluate salvage potential.",
      details: [
        "Real comparison of net payout versus time investment and shipping risk",
        "Honest breakdown of store-locked voucher restrictions vs. liquid cash",
        "Charitable donation criteria so you never burden non-profits with junk"
      ]
    },
    {
      stepNumber: "03",
      title: "Execute with Safe Guardrails",
      description:
        "Follow rigorous security and regulatory protocols before your device leaves your hands.",
      details: [
        "Cryptographic storage sanitisation protocols (NIST 800-88 compliant)",
        "Activation lock decoupling instructions (iCloud, Google FRP, Microsoft Knox)",
        "Accreditation criteria to verify licensed e-waste handlers (WEEE / e-Stewards)"
      ]
    }
  ];

  return (
    <section id="how-it-works" className="py-16 lg:py-24 bg-slate-50 border-b border-slate-200 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <Badge variant="neutral" className="mb-3">
            Methodology
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4">
            How E-Waste Value Recovery Works
          </h2>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            A three-step evidence framework designed to put consumers in control,
            eliminate commercial misinformation, and prevent premature e-waste.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 p-7 flex flex-col justify-between shadow-2xs relative"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="w-11 h-11 rounded-xl bg-slate-900 text-white font-mono font-bold text-sm flex items-center justify-center">
                    {step.stepNumber}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                    Step {idx + 1}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mb-5 leading-relaxed">
                  {step.description}
                </p>

                <div className="border-t border-slate-100 pt-4">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Evidence Standards:
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {step.details.map((detail, dIdx) => (
                      <li key={dIdx} className="flex items-start gap-2">
                        <span className="text-emerald-700 font-bold shrink-0 mt-0.5">&bull;</span>
                        <span className="leading-snug">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
