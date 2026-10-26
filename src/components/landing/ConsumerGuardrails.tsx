import React from "react";
import { Badge } from "../ui/Badge";
import {
  Lock,
  HardDrive,
  Flame,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";

export function ConsumerGuardrails() {
  const guardrails = [
    {
      title: "Data Destruction & Sanitisation",
      standard: "Media Sanitisation Principles (e.g. NIST SP 800-88)",
      icon: <HardDrive className="w-5 h-5 text-emerald-700" />,
      summary:
        "Standard file deletion or quick formatting leaves storage sectors readable by standard recovery tools. Proper sanitisation depends on drive architecture.",
      actionPoints: [
        "Modern iOS & Android: Perform a standard Factory Reset with hardware-backed encryption enabled (this destroys the volume encryption key, rendering data unrecoverable).",
        "Windows & Mac SSDs: Ensure FileVault or BitLocker is enabled before reset, or trigger manufacturer UEFI cryptographic sanitisation.",
        "Mechanical Hard Drives (HDDs): Execute dedicated multi-pass drive overwriting, or mechanically dismantle/puncture platters before metal recycling."
      ]
    },
    {
      title: "Activation Lock Decoupling",
      standard: "OEM Anti-Theft Lock Clearance",
      icon: <Lock className="w-5 h-5 text-emerald-700" />,
      summary:
        "Devices locked to an Apple Account, Google Account, or Corporate MDM cannot be tested, repurposed, or refurbished. They become scrap by default.",
      actionPoints: [
        "Apple Devices: Turn off 'Find My' and sign out of Apple Account / iCloud before initiating reset.",
        "Android: Remove all Google Accounts under Settings > Passwords & Accounts before factory reset to bypass FRP (Factory Reset Protection).",
        "Enterprise & PC Equipment: Clear BIOS/UEFI administrative passwords and verify enrollment in Microsoft Intune or remote management is released."
      ]
    },
    {
      title: "Lithium Battery Safety Protocol",
      standard: "Transport Safety Guidelines (e.g. UN Model Regulations)",
      icon: <Flame className="w-5 h-5 text-emerald-700" />,
      summary:
        "Damaged, dropped, or swollen lithium-ion cells can enter thermal runaway, creating high-intensity chemical fires during transit or automated shredding.",
      actionPoints: [
        "Never ship a bulging, punctured, or leaking battery via consumer postal couriers.",
        "Insulate exposed electrical contacts with non-conductive electrical tape before hand-over.",
        "Store degraded cells in a cool, ventilated container away from flammable materials. Never transport an actively hot, smoking, or leaking battery in a passenger vehicle; contact local municipal hazardous waste or emergency services for safe handling instructions."
      ]
    },
    {
      title: "Authorised Recycler Verification",
      standard: "Facility Compliance & Certification (e.g. WEEE, R2v3, e-Stewards)",
      icon: <ShieldCheck className="w-5 h-5 text-emerald-700" />,
      summary:
        "Authorised e-waste processors operate under official environmental permits or recognized industry certifications to ensure regulated material recovery.",
      actionPoints: [
        "Confirm the facility is registered with your national or regional environmental agency.",
        "Check whether facilities adhere to third-party audited standards such as R2v3 or e-Stewards.",
        "Avoid unlicensed scrap collectors who lack fixed facilities for capturing toxic fractions (e.g. lead, mercury)."
      ]
    }
  ];

  return (
    <section id="guardrails" className="py-16 lg:py-24 bg-white border-b border-slate-200 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <Badge variant="emerald" className="mb-3">
            Consumer Protection
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4">
            Critical Safeguards Before Handing Over Any Device
          </h2>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            Essential steps to protect personal data, prevent accidental hardware lock-outs,
            and ensure transport safety before selling, trading, donating, or recycling.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {guardrails.map((item, index) => (
            <div
              key={index}
              className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-7 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <span className="text-[11px] font-mono font-medium text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                    {item.standard}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mb-4 leading-relaxed">
                  {item.summary}
                </p>

                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-2">
                    Action Checklist:
                  </span>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {item.actionPoints.map((point, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                        <span className="leading-snug">{point}</span>
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
