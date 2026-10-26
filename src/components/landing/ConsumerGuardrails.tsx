import React from "react";
import Link from "next/link";
import { HardDrive, Lock, Flame, ShieldCheck } from "lucide-react";

export function ConsumerGuardrails() {
  const guardrails = [
    {
      title: "Data Destruction & Sanitisation",
      standard: "NIST SP 800-88 REV. 1 COMPLIANT",
      icon: <HardDrive className="w-4 h-4 text-[#257A72]" />,
      summary:
        "Standard file deletion or quick formatting leaves raw flash storage blocks readable by forensic tools. Complete cryptographic sanitisation depends on device architecture.",
      actionPoints: [
        "Modern iOS & Android: Standard factory reset triggers hardware cryptographic key erasure, rendering past data mathematically unrecoverable.",
        "NVMe & SATA SSDs: Verify BitLocker / FileVault was active, or invoke manufacturer UEFI cryptographic Secure Erase.",
        "Mechanical Hard Drives: Execute multi-pass random data overwriting or mechanical platter perforation prior to scrap transfer.",
      ],
    },
    {
      title: "Anti-Theft Activation Lock Decoupling",
      standard: "OEM SECURITY RELEASE DIRECTIVE",
      icon: <Lock className="w-4 h-4 text-[#257A72]" />,
      summary:
        "Electronics bound to Apple ID, Google Account, or Corporate MDM management cannot be refurbished or evaluated. They become scrap by default upon receipt.",
      actionPoints: [
        "Apple Devices: Turn off 'Find My' and sign out of Apple Account / iCloud prior to initiation.",
        "Android Devices: Remove Google Accounts under System Settings to bypass Factory Reset Protection (FRP).",
        "Laptops & Workstations: Clear BIOS administrative supervisor passwords and release enterprise Intune enrollment.",
      ],
    },
    {
      title: "Lithium Battery Thermal Safety Protocol",
      standard: "UN MODEL REGULATIONS (TRANSPORT SAFETY)",
      icon: <Flame className="w-4 h-4 text-[#C8532C]" />,
      summary:
        "Swollen, crushed, or chemically leaking lithium-ion cells risk uncontrollable thermal runaway and fire during courier handling or mechanical shredding.",
      actionPoints: [
        "Never ship a bulging, punctured, or leaking battery cell via standard commercial courier.",
        "Insulate exposed electrical contacts with non-conductive electrical tape before physical drop-off.",
        "Place degraded cells in non-combustible sand or outdoor metal containment; never transport in hot passenger cabin.",
      ],
    },
    {
      title: "Authorised Recycler & Facility Verification",
      standard: "CPCB / DPCC REGULATORY COMPLIANCE",
      icon: <ShieldCheck className="w-4 h-4 text-[#1B3B2B]" />,
      summary:
        "Authorised e-waste processors hold mandatory state pollution control permits to capture hazardous fractions (lead solders, cadmium, brominated flame retardants).",
      actionPoints: [
        "Verify facility holds valid Consent to Operate (CTO) and EPR authorization from state pollution control boards.",
        "Check that drop-off locations are approved collection centers, not unmonitored informal scrap aggregation sheds.",
        "Request certified destruction manifest or formal recovery receipt for corporate or personal tracking.",
      ],
    },
  ];

  return (
    <section id="guardrails" className="py-16 lg:py-24 bg-[#F7F5EE] border-b border-[#DFD9CD] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#DFD9CD] mb-12">
          <div className="space-y-2 max-w-2xl">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#736F66] block">
              REGULATORY &amp; SAFETY SPECIFICATIONS // GUARDRAILS
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#141413] tracking-tight">
              Pre-handover security &amp; safety standards.
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#413F3B] max-w-md leading-relaxed font-sans">
            Before physical handover or dispatch, every consumer must observe cryptographic data
            wiping, anti-theft clearance, and lithium battery containment protocols.
          </p>
        </div>

        {/* 4 Guardrails Editorial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {guardrails.map((g, idx) => (
            <div
              key={idx}
              className="bg-[#FAF8F3] border border-[#D4CDC0] rounded-sm p-6 sm:p-7 space-y-4 hover:border-[#1B3B2B] transition-colors"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E0D4] font-mono text-xs">
                <span className="flex items-center gap-2 font-bold text-[#141413]">
                  {g.icon}
                  <span>GUARDRAIL 0{idx + 1}</span>
                </span>
                <span className="text-[10px] text-[#736F66] tracking-wider uppercase">
                  {g.standard}
                </span>
              </div>

              <h3 className="font-serif text-xl font-bold text-[#141413] tracking-tight">
                {g.title}
              </h3>

              <p className="text-xs text-[#413F3B] leading-relaxed font-sans">
                {g.summary}
              </p>

              <div className="pt-3 border-t border-[#E5E0D4] space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#736F66] block">
                  Mandatory Protocol:
                </span>
                <ul className="space-y-1.5 text-xs text-[#383632] font-mono">
                  {g.actionPoints.map((point, pIdx) => (
                    <li key={pIdx} className="flex items-start gap-2">
                      <span className="text-[#1B3B2B] font-bold">&rarr;</span>
                      <span className="leading-snug">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Audit link */}
        <div className="mt-8 pt-6 border-t border-[#DFD9CD] flex items-center justify-between text-xs font-mono text-[#736F66]">
          <span>E-WASTE (MANAGEMENT) RULES, 2022 COMPLIANCE</span>
          <Link
            href="/directory"
            className="text-[#1B3B2B] font-semibold hover:underline flex items-center gap-1"
          >
            <span>View Authorised Delhi Recyclers</span> &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
