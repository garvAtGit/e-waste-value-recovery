import React from "react";
import Link from "next/link";
import { Layers, Shield, FileCheck, CheckCircle2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Column 1: Mission & Brand */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Layers className="w-4 h-4 text-emerald-100" />
              </div>
              <span className="font-bold text-white text-lg tracking-tight">
                E-Waste Value Recovery
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-lg leading-relaxed">
              An independent, consumer-first platform dedicated to finding the highest practical
              utility and monetary value for unwanted, faulty, or redundant electrical equipment.
              Derived from hardware condition, objective trade-offs, and environmental safety standards.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-md border border-slate-800">
                <Shield className="w-3.5 h-3.5 text-emerald-400" /> Zero Sponsored Listings
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-md border border-slate-800">
                <FileCheck className="w-3.5 h-3.5 text-sky-400" /> Objective Sanitisation Guidance
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-md border border-slate-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Regulated Facility Standards
              </span>
            </div>
          </div>

          {/* Column 2: Recovery Pathways */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Value Pathways
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/#pathway-repair" className="hover:text-white transition-colors">
                  1. Repair & Continue Using
                </Link>
              </li>
              <li>
                <Link href="/#pathway-sell-cash" className="hover:text-white transition-colors">
                  2. Sell for Cash (P2P)
                </Link>
              </li>
              <li>
                <Link href="/#pathway-exchange-voucher" className="hover:text-white transition-colors">
                  3. Retailer Trade-in / Voucher
                </Link>
              </li>
              <li>
                <Link href="/#pathway-refurbishers-parts" className="hover:text-white transition-colors">
                  4. Refurbishers & Salvage
                </Link>
              </li>
              <li>
                <Link href="/#pathway-donate-reuse" className="hover:text-white transition-colors">
                  5. Non-Profit Donation
                </Link>
              </li>
              <li>
                <Link href="/#pathway-authorised-recycling" className="hover:text-white transition-colors">
                  6. Certified E-Waste Recyclers
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Transparency & Resources */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Consumer Guidance
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/directory" className="hover:text-white transition-colors font-medium text-emerald-400">
                  Provider & Recycler Directory
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors font-medium text-emerald-400">
                  My Recovery Cases
                </Link>
              </li>
              <li>
                <Link href="/analytics" className="hover:text-white transition-colors font-medium text-emerald-400">
                  Impact &amp; Analytics
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white transition-colors text-slate-400">
                  Operations Console (Admin)
                </Link>
              </li>
              <li>
                <Link href="/#guardrails" className="hover:text-white transition-colors">
                  Secure Data Wiping Checklist
                </Link>
              </li>
              <li>
                <Link href="/#guardrails" className="hover:text-white transition-colors">
                  Activation Lock Removal (iCloud/FRP)
                </Link>
              </li>
              <li>
                <Link href="/#categories" className="hover:text-white transition-colors">
                  Device Category Triage
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-white transition-colors">
                  Independent Decision Criteria
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-white transition-colors">
                  Recycler Verification FAQ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>
            &copy; 2026 E-Waste Value Recovery. Independent consumer advisory.
          </p>
          <p className="max-w-xl text-center md:text-right text-slate-500 leading-normal">
            No commercial partnerships dictate triage rankings. All recommendations are derived from
            functional viability, hardware condition, and consumer security safety.
          </p>
        </div>
      </div>
    </footer>
  );
}
