import React from "react";
import { PATHWAYS } from "@/lib/constants/pathways";
import { Badge } from "../ui/Badge";
import {
  Wrench,
  DollarSign,
  Ticket,
  Cpu,
  HeartHandshake,
  Recycle,
  CheckCircle2
} from "lucide-react";

export function PathwayGrid() {
  const getPathwayIcon = (id: string) => {
    switch (id) {
      case "repair":
        return <Wrench className="w-5 h-5 text-emerald-700" />;
      case "sell-cash":
        return <DollarSign className="w-5 h-5 text-emerald-700" />;
      case "exchange-voucher":
        return <Ticket className="w-5 h-5 text-emerald-700" />;
      case "refurbishers-parts":
        return <Cpu className="w-5 h-5 text-emerald-700" />;
      case "donate-reuse":
        return <HeartHandshake className="w-5 h-5 text-emerald-700" />;
      case "authorised-recycling":
        return <Recycle className="w-5 h-5 text-emerald-700" />;
      default:
        return <CheckCircle2 className="w-5 h-5 text-emerald-700" />;
    }
  };

  return (
    <section id="pathways" className="py-16 lg:py-24 bg-slate-50 border-b border-slate-200 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <Badge variant="neutral" className="mb-3">
            Comparative Architecture
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4">
            The 6 Recovery Pathways Compared
          </h2>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            Every electronic device reaches a distinct crossroad. An objective comparison of
            financial return, effort, practical risks, and environmental outcomes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PATHWAYS.map((pathway, index) => (
            <div
              key={pathway.id}
              id={`pathway-${pathway.id}`}
              className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 flex flex-col justify-between hover:border-slate-300 transition-all shadow-xs"
            >
              <div>
                {/* Header with icon and index */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                    {getPathwayIcon(pathway.id)}
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    Pathway 0{index + 1}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">
                  {pathway.title}
                </h3>
                <p className="text-xs text-slate-600 mb-5 leading-relaxed">
                  {pathway.fullDescription}
                </p>

                {/* Practical Trade-offs */}
                <div className="bg-slate-50 rounded-xl p-3.5 mb-5 border border-slate-100 text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Potential Value:</span>
                    <strong className="text-slate-900">{pathway.tradeoffs.financialReturn}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Effort Required:</span>
                    <strong className="text-slate-900">{pathway.tradeoffs.effortRequired}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Typical Speed:</span>
                    <strong className="text-slate-900">{pathway.tradeoffs.speed}</strong>
                  </div>
                </div>

                {/* When best suited */}
                <div className="mb-4">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Best suited for:
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {pathway.bestSuitedFor.map((item, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-700 font-bold shrink-0">&check;</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Caveats / consumer advisory footer */}
              <div className="pt-4 mt-4 border-t border-slate-100 text-[11px] text-slate-500 bg-amber-50/50 p-2.5 rounded-lg border border-amber-200/50">
                <span className="font-semibold text-amber-900 block mb-0.5">Key caveat:</span>
                <span className="text-amber-800 leading-tight block">
                  {pathway.caveats[0]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
