import React from "react";
import Link from "next/link";
import { Cpu, ShieldCheck, Scale, Leaf } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#1C1C1A] text-[#DFD9CD] pt-16 pb-12 border-t border-[#2B2B28]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#2E2D2A]">
          {/* Col 1: Institutional Statement & Wordmark */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-sm bg-[#257A72] text-[#F7F5EE] flex items-center justify-center font-bold">
                <Cpu className="w-4 h-4 text-[#E9F3F2]" />
              </div>
              <div>
                <span className="font-serif text-lg font-bold text-[#F7F5EE] tracking-tight block">
                  E-Waste Value Recovery
                </span>
                <span className="font-mono text-[10px] text-[#A69E8C] tracking-wider uppercase block">
                  Delhi NCR Circular Electronics Registry
                </span>
              </div>
            </div>

            <p className="text-xs text-[#A69E8C] leading-relaxed max-w-md font-sans">
              An independent, evidence-backed evaluation service designed to determine the highest
              practical utility, residual value, and safe disposal path for post-consumer hardware.
              Rooted in material diagnostics, verified local logistics, and environmental safety directives.
            </p>

            <div className="pt-2 flex flex-wrap gap-2 text-[10px] font-mono uppercase text-[#A69E8C]">
              <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-[#282724] border border-[#3A3834] rounded-xs">
                <ShieldCheck className="w-3 h-3 text-[#257A72]" /> Zero Sponsored Listings
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-[#282724] border border-[#3A3834] rounded-xs">
                <Scale className="w-3 h-3 text-[#C8532C]" /> Non-Inferential Pincode Matching
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-[#282724] border border-[#3A3834] rounded-xs">
                <Leaf className="w-3 h-3 text-[#257A72]" /> LCA Carbon Factor Accounting
              </span>
            </div>
          </div>

          {/* Col 2: The 6 Recovery Pathways */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-[11px] font-mono uppercase tracking-widest text-[#F7F5EE] border-b border-[#2E2D2A] pb-2">
              Recovery Pathways
            </h4>
            <ul className="space-y-2 text-xs font-mono text-[#A69E8C]">
              <li>
                <Link href="/find-option" className="hover:text-[#F7F5EE] transition-colors flex items-center gap-2">
                  <span className="text-[#736F66]">01</span> Repair &amp; Retain Utility
                </Link>
              </li>
              <li>
                <Link href="/find-option" className="hover:text-[#F7F5EE] transition-colors flex items-center gap-2">
                  <span className="text-[#736F66]">02</span> Cash Buyback (P2P / Kiosk)
                </Link>
              </li>
              <li>
                <Link href="/find-option" className="hover:text-[#F7F5EE] transition-colors flex items-center gap-2">
                  <span className="text-[#736F66]">03</span> Retailer Trade-in Voucher
                </Link>
              </li>
              <li>
                <Link href="/find-option" className="hover:text-[#F7F5EE] transition-colors flex items-center gap-2">
                  <span className="text-[#736F66]">04</span> Component Salvage &amp; Donors
                </Link>
              </li>
              <li>
                <Link href="/find-option" className="hover:text-[#F7F5EE] transition-colors flex items-center gap-2">
                  <span className="text-[#736F66]">05</span> Charitable Donation for Reuse
                </Link>
              </li>
              <li>
                <Link href="/find-option" className="hover:text-[#F7F5EE] transition-colors flex items-center gap-2">
                  <span className="text-[#736F66]">06</span> Certified Material Recycling
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Operational Registry */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-[11px] font-mono uppercase tracking-widest text-[#F7F5EE] border-b border-[#2E2D2A] pb-2">
              Platform Registry
            </h4>
            <ul className="space-y-2 text-xs font-mono text-[#A69E8C]">
              <li>
                <Link href="/sell-phone" className="hover:text-[#F7F5EE] transition-colors font-semibold text-[#F7F5EE]">
                  Sell Phone (Instant Payout)
                </Link>
              </li>
              <li>
                <Link href="/repair-vs-sell" className="hover:text-[#F7F5EE] transition-colors">
                  Repair vs. Sell Matrix
                </Link>
              </li>
              <li>
                <Link href="/directory" className="hover:text-[#F7F5EE] transition-colors">
                  Provider Directory
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-[#F7F5EE] transition-colors">
                  Case Dossier Tracker
                </Link>
              </li>
              <li>
                <Link href="/analytics" className="hover:text-[#F7F5EE] transition-colors">
                  Impact &amp; LCA Analytics
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-[#F7F5EE] transition-colors">
                  Operations Console
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Pilot Scope & Notice */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-[11px] font-mono uppercase tracking-widest text-[#F7F5EE] border-b border-[#2E2D2A] pb-2">
              Pilot Registry
            </h4>
            <div className="text-[11px] text-[#A69E8C] space-y-2 leading-relaxed">
              <p>
                Active research pilot centered on Delhi NCT with documented NCR collection points.
              </p>
              <p className="font-mono text-[10px] text-[#736F66]">
                REV: 2026.10-DEL · DPCC &amp; CPCB COMPLIANCE FRAMEWORK
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Colophon Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[11px] font-mono text-[#736F66]">
          <div className="flex items-center gap-2">
            <span>&copy; 2026 E-Waste Value Recovery Project.</span>
            <span>&bull;</span>
            <span>Independent Academic &amp; Communication Design Initiative.</span>
          </div>

          <div className="flex items-center gap-4 text-[#A69E8C]">
            <Link href="/directory" className="hover:text-[#F7F5EE] transition-colors">
              Audited Providers
            </Link>
            <span>/</span>
            <Link href="/find-option" className="hover:text-[#F7F5EE] transition-colors">
              Hardware Diagnostic
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
