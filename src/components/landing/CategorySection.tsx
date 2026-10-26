import React from "react";
import { DEVICE_CATEGORIES } from "@/lib/constants/categories";
import { Badge } from "../ui/Badge";
import {
  Smartphone,
  Laptop,
  Headphones,
  Coffee,
  Refrigerator,
  Gamepad2,
  BatteryCharging
} from "lucide-react";

export function CategorySection() {
  const getCategoryIcon = (id: string) => {
    switch (id) {
      case "smartphones-tablets":
        return <Smartphone className="w-5 h-5 text-emerald-700" />;
      case "laptops-computers":
        return <Laptop className="w-5 h-5 text-emerald-700" />;
      case "audio-wearables":
        return <Headphones className="w-5 h-5 text-emerald-700" />;
      case "home-appliances-small":
        return <Coffee className="w-5 h-5 text-emerald-700" />;
      case "home-appliances-large":
        return <Refrigerator className="w-5 h-5 text-emerald-700" />;
      case "gaming-entertainment":
        return <Gamepad2 className="w-5 h-5 text-emerald-700" />;
      case "batteries-cables-peripherals":
        return <BatteryCharging className="w-5 h-5 text-emerald-700" />;
      default:
        return <Smartphone className="w-5 h-5 text-emerald-700" />;
    }
  };

  return (
    <section id="categories" className="py-16 lg:py-24 bg-white border-b border-slate-200 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <Badge variant="neutral" className="mb-3">
            Coverage Scope
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4">
            Supported Device Categories
          </h2>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            From pocket-sized smartphones with serialized components to high-voltage domestic
            white goods with refrigerant gases — each category has distinct logistical,
            safety, and data destruction requirements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DEVICE_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className="bg-slate-50/70 rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:bg-slate-50 transition-colors"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center mb-4 shadow-2xs">
                  {getCategoryIcon(cat.id)}
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  {cat.description}
                </p>

                {/* Examples */}
                <div className="mb-4">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Common Items:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.examples.map((ex, idx) => (
                      <span
                        key={idx}
                        className="inline-block px-2 py-0.5 bg-white text-slate-700 text-[11px] rounded border border-slate-200"
                      >
                        {ex}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Key triage factors */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Critical Evaluation Factors:
                  </span>
                  <ul className="space-y-1 text-xs text-slate-700">
                    {cat.keyFactors.map((factor, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-700 font-bold shrink-0">&bull;</span>
                        <span className="leading-snug">{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Common viable pathways */}
              <div className="mt-5 pt-4 border-t border-slate-200/80 text-[11px]">
                <span className="text-slate-500 block mb-1 font-medium">Frequent pathways:</span>
                <span className="text-slate-800 font-semibold">
                  {cat.typicalPathways.join(" &bull; ")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
