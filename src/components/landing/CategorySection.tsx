import React from "react";
import Link from "next/link";
import { DEVICE_CATEGORIES } from "@/lib/constants/categories";
import { ArrowUpRight } from "lucide-react";

const CATEGORY_LCA_FACTORS: Record<
  string,
  { avgMass: string; embodiedCo2: string; criticalFractions: string; lifespan: string }
> = {
  "smartphones-tablets": {
    avgMass: "0.18 kg",
    embodiedCo2: "30.0 kg CO₂e",
    criticalFractions: "Gold, Tantalum, Cobalt, Lithium",
    lifespan: "2.5 – 4 years",
  },
  "laptops-computers": {
    avgMass: "2.1 kg",
    embodiedCo2: "180.0 kg CO₂e",
    criticalFractions: "Copper, Solders, Neodymium, Aluminum",
    lifespan: "4.0 – 7 years",
  },
  "tvs-screens": {
    avgMass: "6.5 kg",
    embodiedCo2: "120.0 kg CO₂e",
    criticalFractions: "Indium Tin Oxide, Polarizer, Power Transformers",
    lifespan: "6.0 – 10 years",
  },
  "home-appliances-large": {
    avgMass: "35.0 kg",
    embodiedCo2: "250.0 kg CO₂e",
    criticalFractions: "Cast Steel, Copper Motors, Regulated Refrigerants",
    lifespan: "8.0 – 15 years",
  },
  "home-appliances-small": {
    avgMass: "2.2 kg",
    embodiedCo2: "25.0 kg CO₂e",
    criticalFractions: "Nickel-Chrome Elements, High-Impact Polystyrene",
    lifespan: "3.0 – 6 years",
  },
  "batteries-cables-peripherals": {
    avgMass: "0.4 kg",
    embodiedCo2: "4.0 kg CO₂e",
    criticalFractions: "High-grade Copper Wiring, PVC/TPE Sheathing",
    lifespan: "1.5 – 3 years",
  },
};

export function CategorySection() {
  return (
    <section id="categories" className="py-16 lg:py-24 bg-[#FAF8F3] border-b border-[#DFD9CD] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#DFD9CD] mb-12">
          <div className="space-y-2 max-w-2xl">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#736F66] block">
              MATERIAL ARCHIVAL LEDGER // CATEGORY SPECIFICATIONS
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#141413] tracking-tight">
              Six hardware classes. Distinct material footprints.
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#413F3B] max-w-md leading-relaxed font-sans">
            Every category possesses different repair modularity, storage security, hazardous
            chemistry, and precious metal concentrations.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DEVICE_CATEGORIES.map((cat, index) => {
            const lca = CATEGORY_LCA_FACTORS[cat.slug] || {
              avgMass: "1.0 kg",
              embodiedCo2: "50 kg CO₂e",
              criticalFractions: "Base Metals",
              lifespan: "3-5 yrs",
            };

            return (
              <div
                key={cat.id}
                className="bg-[#F7F5EE] border border-[#D4CDC0] rounded-sm p-6 sm:p-7 flex flex-col justify-between hover:border-[#1B3B2B] transition-colors relative group"
              >
                <div className="space-y-4">
                  {/* Top Metadata */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#E5E0D4] font-mono">
                    <span className="text-xs font-bold text-[#141413]">
                      CAT 0{index + 1}
                    </span>
                    <span className="text-[10px] uppercase text-[#736F66] px-2 py-0.5 bg-[#EFECE2] rounded-xs border border-[#D4CDC0]">
                      {lca.avgMass}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl font-bold text-[#141413] tracking-tight">
                    {cat.name}
                  </h3>

                  <p className="text-xs text-[#413F3B] leading-relaxed font-sans">
                    {cat.description}
                  </p>

                  {/* Quantitative Hardware Metrics Table */}
                  <div className="bg-[#FAF8F3] border border-[#DFD9CD] rounded-xs p-3 font-mono text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[#736F66] text-[11px]">Embodied Carbon:</span>
                      <strong className="text-[#141413] text-[11px]">{lca.embodiedCo2}</strong>
                    </div>
                    <div className="flex items-center justify-between border-t border-[#E5E0D4] pt-1.5">
                      <span className="text-[#736F66] text-[11px]">Typical Lifespan:</span>
                      <span className="text-[#413F3B] text-[11px]">{lca.lifespan}</span>
                    </div>
                    <div className="border-t border-[#E5E0D4] pt-1.5">
                      <span className="text-[#736F66] text-[10px] block uppercase">Key Fractions:</span>
                      <span className="text-[#141413] text-[11px] block mt-0.5">{lca.criticalFractions}</span>
                    </div>
                  </div>

                  {/* Examples list */}
                  <div className="pt-2 text-xs font-mono text-[#736F66]">
                    <span className="text-[10px] uppercase block mb-1">Common Models:</span>
                    <span>{cat.examples.join(", ")}</span>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-5 mt-5 border-t border-[#E5E0D4] flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#736F66] uppercase">
                    DPCC Intake Eligible
                  </span>
                  <Link
                    href={`/find-option?category=${cat.slug}`}
                    className="text-xs font-mono uppercase text-[#1B3B2B] font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>Assess Category</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#257A72]" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
