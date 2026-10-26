import React from "react";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-slate-900 text-white pt-16 pb-20 lg:pt-24 lg:pb-28 border-b border-slate-800">
      {/* Background subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #94a3b8 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          {/* Trust badge */}
          <div className="inline-flex items-center gap-2 mb-6">
            <Badge variant="emerald" className="bg-emerald-950/80 text-emerald-300 border-emerald-800 text-xs px-3 py-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Independent Consumer Framework &bull; No Sponsored Results
            </Badge>
          </div>

          {/* Primary Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12] mb-6">
            Find the highest practical value for your unwanted electronics.
          </h1>

          {/* Body explanation */}
          <p className="text-lg sm:text-xl text-slate-300 leading-relaxed mb-8 max-w-2xl">
            Whether your device is working, minorly damaged, or completely dead: compare
            repair, direct cash resale, trade-in vouchers, parts salvaging, charity donation,
            or certified recycling based on evidence, effort, and real security requirements.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-12">
            <Button
              href="/find-option"
              variant="primary"
              size="lg"
              className="text-base px-7 py-3.5 shadow-md flex items-center justify-center gap-2"
            >
              <span>Find the Best Option</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button
              href="/#pathways"
              variant="outline"
              size="lg"
              className="bg-slate-800/80 hover:bg-slate-800 text-slate-200 border-slate-700 hover:text-white"
            >
              Compare the 6 Pathways
            </Button>
            <Button
              href="/directory"
              variant="outline"
              size="lg"
              className="bg-slate-800/80 hover:bg-slate-800 text-emerald-300 border-slate-700 hover:text-white"
            >
              Browse Directory
            </Button>
          </div>

          {/* Direct Value Principles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 text-sm text-slate-300">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-white font-medium">Objective Trade-offs</strong>
                <span className="text-xs text-slate-400">Clear effort, risk, and speed comparison for every route.</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-white font-medium">Data Sanitisation First</strong>
                <span className="text-xs text-slate-400">Actionable steps to erase personal storage before handover.</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-white font-medium">Authorised Verification</strong>
                <span className="text-xs text-slate-400">Distinguishing legitimate certified recycling from rogue scrap.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
