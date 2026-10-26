"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DEVICE_CATEGORIES } from "@/lib/constants/categories";
import { PATHWAYS } from "@/lib/constants/pathways";
import { Badge } from "../ui/Badge";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Flame,
  XCircle,
  ArrowRight,
} from "lucide-react";

export type ConditionType =
  | "working_recent"
  | "minor_fault"
  | "working_older"
  | "major_fault"
  | "unsafe_hazardous";

export type PriorityType = "value" | "convenience" | "social";

export interface ConditionOption {
  id: ConditionType;
  label: string;
  description: string;
}

export const CONDITIONS: ConditionOption[] = [
  {
    id: "working_recent",
    label: "Fully working, relatively recent (< 4-5 yrs)",
    description: "Powers on normally, receives OS security updates, battery functional, no structural damage.",
  },
  {
    id: "minor_fault",
    label: "Minor fault or worn consumable",
    description: "Cracked outer screen, degraded battery, stiff button, or minor mechanical issue.",
  },
  {
    id: "working_older",
    label: "Fully working, but older or unsupported",
    description: "Operating system no longer receives security patches, slow for modern workloads, but powers on.",
  },
  {
    id: "major_fault",
    label: "Major hardware fault or won't boot",
    description: "Failed motherboard, severe liquid ingress, shattered display panel, or unrepairable fault.",
  },
  {
    id: "unsafe_hazardous",
    label: "Physical swelling, cracked battery, or chemical hazard",
    description: "Bulging pouch cell, leaking electrolyte, burnt electrical odor, or exposed high-voltage wiring.",
  },
];

interface RecommendationResult {
  isHazardous: boolean;
  primaryId: string;
  secondaryId: string | null;
  headline: string;
  categoryContext: string;
  reason: string;
  actionItems: string[];
  disallowedNotice?: string;
}

export function PathwayExplorer() {
  const [selectedCategory, setSelectedCategory] = useState<string>("smartphones-tablets");
  const [selectedCondition, setSelectedCondition] = useState<ConditionType>("minor_fault");
  const [priority, setPriority] = useState<PriorityType>("value");

  const currentCategory = DEVICE_CATEGORIES.find((c) => c.id === selectedCategory) || DEVICE_CATEGORIES[0];

  // Dynamically evaluate recommendation based on Category, Condition, and Priority
  const getRecommendation = (): RecommendationResult => {
    // 1. SAFETY OVERRIDE: Swollen, damaged lithium, or severe chemical/electrical hazards
    if (selectedCondition === "unsafe_hazardous") {
      const isLargeAppliance = selectedCategory === "home-appliances-large";

      let hazardHeadline = "STOP USE: Damaged / Swollen Lithium Battery Hazard";
      let hazardReason =
        "Bulging or cracked lithium-ion batteries present an immediate risk of thermal runaway and chemical fire. They must not be powered on, charged, shipped via standard courier services, or discarded in domestic rubbish bins.";
      let hazardSteps = [
        "Stop using the device immediately. Disconnect charger and power supply if safe to do so. Do NOT attempt to turn it on.",
        "Do NOT open, puncture, compress, or attempt to remove a swollen, leaking, or damaged battery cell.",
        "Place the unit in a well-ventilated, fire-safe location (such as an outdoor concrete surface or metal container) away from combustibles.",
        "Do not transport an actively hot, smoking, or leaking battery in a passenger vehicle or send it by standard mail/courier.",
        "Contact your local municipal hazardous-waste collection team or fire/emergency services for safe on-site handling and disposal instructions."
      ];

      if (isLargeAppliance) {
        hazardHeadline = "STOP USE: High-Voltage or Refrigerant Hazard";
        hazardReason =
          "Appliance units with leaking refrigerant gases (fluorinated/ODS), burning electrical smells, or damaged mains wiring pose fire, shock, or environmental toxicity hazards. Do not attempt DIY teardown.";
        hazardSteps = [
          "Isolate appliance from mains electrical supply immediately.",
          "Do not cut or puncture cooling coils or compressor lines containing pressurized refrigerants.",
          "Contact your local municipal bulky waste collection service or an authorised commercial appliance recycler."
        ];
      }

      return {
        isHazardous: true,
        primaryId: "authorised-recycling",
        secondaryId: null,
        headline: hazardHeadline,
        categoryContext: `Critical safety protocol for ${currentCategory.name}`,
        reason: hazardReason,
        actionItems: hazardSteps,
        disallowedNotice:
          "Resale, retailer trade-in, and charitable donation are strictly prohibited for hazardous, swollen, or structurally dangerous electronics."
      };
    }

    // 2. MAJOR FAULT / DEAD HARDWARE
    if (selectedCondition === "major_fault") {
      if (
        selectedCategory === "smartphones-tablets" ||
        selectedCategory === "laptops-computers" ||
        selectedCategory === "gaming-entertainment"
      ) {
        return {
          isHazardous: false,
          primaryId: "refurbishers-parts",
          secondaryId: "authorised-recycling",
          headline: `Salvage Donor Components for ${currentCategory.name}`,
          categoryContext: `Modular salvage evaluation for ${currentCategory.name}`,
          reason:
            "While the system does not boot or has mainboard failure, intact sub-assemblies (such as OEM display glass, camera modules, chassis, and peripheral ports) can retain salvage value for repair workshops seeking donor parts.",
          actionItems: [
            "Ensure on-board data cannot be read, or confirm mainboard storage destruction prior to release.",
            "Accurately disclose the nature of the fault (e.g. no boot, liquid exposure) to prevent return disputes.",
            "If salvage offers do not justify postage and handling, pivot directly to an authorised e-waste recycler."
          ]
        };
      } else if (selectedCategory === "home-appliances-large") {
        return {
          isHazardous: false,
          primaryId: "authorised-recycling",
          secondaryId: "refurbishers-parts",
          headline: "Authorised White Goods Recycler / Scrap Recovery",
          categoryContext: `Heavy appliance disposal for ${currentCategory.name}`,
          reason:
            "Major domestic appliances with seized compressors or burnt control boards are generally uneconomical for domestic shipping. Certified recyclers shred and recover scrap metals while legally capturing controlled refrigerants.",
          actionItems: [
            "Check if your replacement appliance supplier offers free haul-away of your broken unit upon delivery.",
            "Ensure water and electrical connections are safely disconnected prior to collection.",
            "Verify the collector operates under regional environmental waste licensing."
          ]
        };
      } else {
        // Small appliances, audio, cables
        return {
          isHazardous: false,
          primaryId: "authorised-recycling",
          secondaryId: null,
          headline: `Authorised E-Waste Recycler (${currentCategory.name})`,
          categoryContext: `Safe material reclamation for ${currentCategory.name}`,
          reason:
            "Non-functional small appliances, worn peripherals, and broken accessories rarely have a viable component salvage market. Delivering to an authorised small-electricals drop-off ensures copper, plastics, and precious metals are recovered.",
          actionItems: [
            "Locate your local municipal small-WEEE or designated electronics recycling drop-off bin.",
            "Bundle detachable cables and power adapters with the main unit if available.",
            "Do not place electricals in general curbside rubbish."
          ]
        };
      }
    }

    // 3. MINOR FAULT / CONSUMABLE WEAR
    if (selectedCondition === "minor_fault") {
      if (selectedCategory === "home-appliances-large") {
        return {
          isHazardous: false,
          primaryId: "repair",
          secondaryId: "exchange-voucher",
          headline: "Professional Domestic Appliance Servicing",
          categoryContext: `Targeted repair triage for ${currentCategory.name}`,
          reason:
            "Common appliance issues—such as worn washing machine carbon brushes, broken pump seals, or failed oven heating elements—are modular and significantly less expensive to repair than buying a replacement machine.",
          actionItems: [
            "Identify the exact model and serial code on the door frame or rear rating plate.",
            "Obtain a written repair estimate covering parts and labor before proceeding.",
            "Compare the estimate against the cost of a comparable replacement unit."
          ]
        };
      }

      if (selectedCategory === "batteries-cables-peripherals") {
        return {
          isHazardous: false,
          primaryId: "authorised-recycling",
          secondaryId: null,
          headline: "Authorised Peripheral & Cable Recycling",
          categoryContext: `Material recovery for ${currentCategory.name}`,
          reason:
            "Cables with broken sheaths or intermittent contact present electrical resistance and fire hazards. They should not be repaired with tape or sold, but recycled for clean copper scrap.",
          actionItems: [
            "Stop using frayed or damaged charging cables.",
            "Drop off at a local electronics retail take-back point or recycling centre."
          ]
        };
      }

      if (priority === "value") {
        return {
          isHazardous: false,
          primaryId: "repair",
          secondaryId: "sell-cash",
          headline: `Targeted Component Repair for ${currentCategory.name}`,
          categoryContext: `Utility retention triage for ${currentCategory.name}`,
          reason:
            "Replacing an isolated worn part (such as a degraded battery or cracked outer glass) typically restores daily operational reliability at a fraction of replacement cost, preserving device utility for years or restoring resale grade.",
          actionItems: [
            "Check parts availability and whether parts require proprietary calibration tools.",
            "Compare the repair estimate against the fair second-hand market value of a working equivalent.",
            "Ensure the device still receives active operating system security updates before investing in repair."
          ]
        };
      } else if (priority === "convenience") {
        return {
          isHazardous: false,
          primaryId: "exchange-voucher",
          secondaryId: "refurbishers-parts",
          headline: `Manufacturer / Retailer Trade-in with Flaw Disclosure`,
          categoryContext: `Low-friction trade-in for ${currentCategory.name}`,
          reason:
            "If you prefer to avoid the time required for repair diagnostics, retailer and brand trade-in portals regularly accept devices with minor flaws under adjusted grading terms, providing guaranteed prepaid shipping.",
          actionItems: [
            "Disclose screen cracks or cosmetic wear accurately to avoid post-inspection valuation adjustments.",
            "Deactivate all personal account locks (e.g. iCloud, Google FRP) before dispatch.",
            "Photograph the unit's exact physical state immediately prior to packaging."
          ]
        };
      } else {
        // Priority: social
        return {
          isHazardous: false,
          primaryId: "donate-reuse",
          secondaryId: "repair",
          headline: "Community Repair Cafe or Refurbishment Charity",
          categoryContext: `Community reuse for ${currentCategory.name}`,
          reason:
            "Certain community initiatives and repair cafes welcome repairable equipment with minor issues to train volunteers or furnish low-income households with reconditioned technology.",
          actionItems: [
            "Confirm the charity has in-house technical capacity to service the specific fault.",
            "Include original power supplies and chargers.",
            "Never donate broken items to charities that lack explicit repair programs."
          ]
        };
      }
    }

    // 4. WORKING BUT OLDER / OBSOLETE
    if (selectedCondition === "working_older") {
      if (selectedCategory === "batteries-cables-peripherals") {
        return {
          isHazardous: false,
          primaryId: "authorised-recycling",
          secondaryId: "donate-reuse",
          headline: "Community Spare Bin or Metal Recycling",
          categoryContext: `Resource triage for ${currentCategory.name}`,
          reason:
            "Older legacy cables (such as mini-USB, VGA, or proprietary connectors) have negligible standalone resale value. They are best pooled in community spare bins or recycled for copper recovery.",
          actionItems: [
            "Check whether local maker spaces or community tech labs need spare cables.",
            "Recycle unneeded cables at municipal collection bins."
          ]
        };
      }

      if (priority === "social") {
        return {
          isHazardous: false,
          primaryId: "donate-reuse",
          secondaryId: "sell-cash",
          headline: `Donate ${currentCategory.name} for Digital Inclusion or Education`,
          categoryContext: `Charitable donation for ${currentCategory.name}`,
          reason:
            "Older functional computers, tablets, and monitors that feel sluggish for modern demanding tasks often run effectively under lightweight Linux distributions or ChromeOS Flex, providing essential access for students or community members.",
          actionItems: [
            "Sanitise all personal storage thoroughly or perform an encrypted factory reset.",
            "Provide the matching power brick and functional charging cables.",
            "Contact the receiving organisation in advance to verify current acceptance criteria."
          ]
        };
      } else if (priority === "convenience") {
        return {
          isHazardous: false,
          primaryId: "exchange-voucher",
          secondaryId: "authorised-recycling",
          headline: `Retailer Takeback or Trade-in for ${currentCategory.name}`,
          categoryContext: `Convenient handover for ${currentCategory.name}`,
          reason:
            "While older devices yield minimal cash, many retailers offer small incentive vouchers or free responsible take-back programs to divert legacy tech from landfill without marketplace listing effort.",
          actionItems: [
            "Check store trade-in promotions for promotional bonus credits on older models.",
            "Remove all personal accounts and restore factory settings before handover."
          ]
        };
      } else {
        // Priority: value
        return {
          isHazardous: false,
          primaryId: "sell-cash",
          secondaryId: "donate-reuse",
          headline: `Local Classifieds Sale (Budget / Enthusiast Market)`,
          categoryContext: `Second-hand recovery for ${currentCategory.name}`,
          reason:
            "Older hardware often has demand from hobbyists, students, or home-lab enthusiasts looking for budget workstations, media servers, or backup appliances.",
          actionItems: [
            "List with honest photographs, battery performance notes, and OS version.",
            "Perform a cryptographic storage sanitisation before handover.",
            "Use secure local pickup or insured postal delivery."
          ]
        };
      }
    }

    // 5. FULLY WORKING AND RECENT
    if (selectedCategory === "batteries-cables-peripherals") {
      return {
        isHazardous: false,
        primaryId: "sell-cash",
        secondaryId: "donate-reuse",
        headline: "Bundle for Sale or Keep as Reliable Backup",
        categoryContext: `Peripheral management for ${currentCategory.name}`,
        reason:
          "High-quality recent peripherals (such as mechanical keyboards, wireless mice, or USB-C hubs) sell best when bundled or listed on specialized classifieds. Standalone cables are best kept as reliable spares.",
        actionItems: [
          "Clean and test peripheral functionality before listing.",
          "Group matching cables or adapters into a single bundle to offset shipping costs."
        ]
      };
    }

    if (selectedCategory === "home-appliances-large") {
      if (priority === "social") {
        return {
          isHazardous: false,
          primaryId: "donate-reuse",
          secondaryId: "sell-cash",
          headline: "Donate to Local Housing or Community Furniture Charity",
          categoryContext: `Social redistribution for ${currentCategory.name}`,
          reason:
            "Recent, working major appliances are in high demand at community furniture charities supporting re-homing initiatives, many of which provide free collection directly from your home.",
          actionItems: [
            "Ensure the appliance is thoroughly cleaned and emptied.",
            "Check that the charity provides certified electrical safety testing upon collection."
          ]
        };
      }

      return {
        isHazardous: false,
        primaryId: "sell-cash",
        secondaryId: "exchange-voucher",
        headline: "Direct Local Sale (Buyer Collection)",
        categoryContext: `Local transaction for ${currentCategory.name}`,
        reason:
          "Because major appliances require two-person handling, selling directly via local classifieds with buyer collection avoids expensive commercial freight while securing true market value.",
        actionItems: [
          "Demonstrate working operation to the buyer upon collection.",
          "Disconnect safely from mains plumbing and electricity in advance."
        ]
      };
    }

    if (priority === "convenience") {
      return {
        isHazardous: false,
        primaryId: "exchange-voucher",
        secondaryId: "sell-cash",
        headline: `Retailer or Brand Trade-in for ${currentCategory.name}`,
        categoryContext: `Fast turnaround for ${currentCategory.name}`,
        reason:
          "For minimum time investment, manufacturer and retailer trade-in programs provide immediate credit against replacement purchases, with prepaid postage and zero buyer negotiation.",
        actionItems: [
          "Compare trade-in values across multiple authorized platforms before locking in.",
          "Deactivate cloud accounts (e.g. iCloud, Google FRP) to prevent valuation rejections."
        ]
      };
    } else if (priority === "social") {
      return {
        isHazardous: false,
        primaryId: "donate-reuse",
        secondaryId: "sell-cash",
        headline: `Donate Recent ${currentCategory.name} to High-Impact Causes`,
        categoryContext: `High-value donation for ${currentCategory.name}`,
        reason:
          "Donating modern, working electronics delivers substantial social utility to non-profits, refugee support initiatives, or educational programs without requiring repair budgets.",
        actionItems: [
          "Include all original accessories, chargers, and manuals if available.",
          "Perform a factory reset with encryption enabled to protect your privacy."
        ]
      };
    } else {
      // Priority: value
      return {
        isHazardous: false,
        primaryId: "sell-cash",
        secondaryId: "exchange-voucher",
        headline: `Direct Peer-to-Peer Resale for ${currentCategory.name}`,
        categoryContext: `Maximum cash recovery for ${currentCategory.name}`,
        reason:
          "Selling directly to another consumer captures true second-hand market value without middleman deductions, though you are responsible for photography, shipping, and buyer communication.",
        actionItems: [
          "Completely decouple all manufacturer cloud accounts and locks.",
          "Perform a secure factory reset with device encryption enabled.",
          "Document serial numbers and record brief video proof of functionality before dispatch."
        ]
      };
    }
  };

  const recommendation = getRecommendation();
  const primaryPathway = PATHWAYS.find((p) => p.id === recommendation.primaryId);
  const secondaryPathway = recommendation.secondaryId
    ? PATHWAYS.find((p) => p.id === recommendation.secondaryId)
    : null;

  return (
    <section id="finder" className="py-16 lg:py-24 bg-white border-b border-slate-200 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="emerald" className="mb-3">
            Interactive Decision Engine
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4">
            Find the Best Option for Your Specific Device
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            Select your device category, actual operating condition, and priority.
            Our triage logic provides objective options and safety protocols without commercial bias.
          </p>
        </div>

        {/* Interactive Matrix Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Configuration Column (Inputs) */}
          <div className="lg:col-span-5 space-y-6 bg-slate-50 p-6 sm:p-7 rounded-2xl border border-slate-200">
            {/* Step 1: Category */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2.5">
                1. Select Device Category
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" role="group" aria-label="Device category selection">
                {DEVICE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`text-left p-3 rounded-xl border text-xs font-medium transition-all ${
                      selectedCategory === cat.id
                        ? "bg-emerald-800 text-white border-emerald-900 shadow-xs ring-2 ring-emerald-800/20"
                        : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                    aria-pressed={selectedCategory === cat.id}
                  >
                    <span className="block font-semibold">{cat.name}</span>
                    <span
                      className={`block text-[11px] mt-0.5 truncate ${
                        selectedCategory === cat.id ? "text-emerald-100" : "text-slate-500"
                      }`}
                    >
                      {cat.examples[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Physical & Operational Condition */}
            <fieldset>
              <legend className="block text-sm font-semibold text-slate-900 mb-2.5">
                2. Real Physical & Operating Condition
              </legend>
              <div className="space-y-2">
                {CONDITIONS.map((cond) => {
                  const isChecked = selectedCondition === cond.id;
                  const isHazardOption = cond.id === "unsafe_hazardous";

                  return (
                    <label
                      key={cond.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        isChecked
                          ? isHazardOption
                            ? "bg-rose-50/80 border-rose-500 ring-2 ring-rose-500/20 text-slate-900 shadow-xs"
                            : "bg-white border-emerald-600 ring-2 ring-emerald-600/20 text-slate-900 shadow-xs"
                          : isHazardOption
                          ? "bg-white border-rose-200/70 text-slate-700 hover:bg-rose-50/30"
                          : "bg-white/80 border-slate-200 text-slate-700 hover:bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name="operating-condition"
                        value={cond.id}
                        checked={isChecked}
                        onChange={() => setSelectedCondition(cond.id)}
                        className={`mt-0.5 h-4 w-4 border-slate-300 ${
                          isHazardOption
                            ? "text-rose-600 focus:ring-rose-500"
                            : "text-emerald-600 focus:ring-emerald-500"
                        }`}
                      />
                      <div>
                        <span
                          className={`block font-semibold ${
                            isHazardOption && isChecked ? "text-rose-950" : "text-slate-900"
                          }`}
                        >
                          {cond.label}
                        </span>
                        <span className="block text-[11px] text-slate-500 mt-0.5 leading-snug">
                          {cond.description}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            {/* Step 3: Priority */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2.5">
                3. Primary Goal / Preference
              </label>
              <div className="grid grid-cols-3 gap-2" role="group" aria-label="User priority selection">
                <button
                  type="button"
                  onClick={() => setPriority("value")}
                  className={`p-2.5 text-center rounded-xl border text-xs font-medium transition-all ${
                    priority === "value"
                      ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                  aria-pressed={priority === "value"}
                >
                  <span className="block font-semibold">Max Payout</span>
                  <span className="text-[10px] opacity-80">Highest return</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPriority("convenience")}
                  className={`p-2.5 text-center rounded-xl border text-xs font-medium transition-all ${
                    priority === "convenience"
                      ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                  aria-pressed={priority === "convenience"}
                >
                  <span className="block font-semibold">Fast / Easy</span>
                  <span className="text-[10px] opacity-80">Minimal effort</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPriority("social")}
                  className={`p-2.5 text-center rounded-xl border text-xs font-medium transition-all ${
                    priority === "social"
                      ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                  aria-pressed={priority === "social"}
                >
                  <span className="block font-semibold">Reuse / Charity</span>
                  <span className="text-[10px] opacity-80">Community first</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Results Column (Practical Analysis) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Primary Recommendation Card */}
            <div
              className={`rounded-2xl p-6 sm:p-8 shadow-sm transition-all border-2 ${
                recommendation.isHazardous
                  ? "bg-rose-50/40 border-rose-600"
                  : "bg-white border-emerald-600"
              }`}
            >
              {/* Status Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                {recommendation.isHazardous ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-100 text-rose-900 text-xs font-bold rounded-full uppercase tracking-wider border border-rose-300">
                    <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />
                    Immediate Safety Risk &bull; Stop Use
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full uppercase tracking-wider border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    Indicative Guidance
                  </span>
                )}

                {primaryPathway && !recommendation.isHazardous && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <span>
                      Effort: <strong className="text-slate-800">{primaryPathway.tradeoffs.effortRequired}</strong>
                    </span>
                    <span>&bull;</span>
                    <span>
                      Return: <strong className="text-slate-800">{primaryPathway.tradeoffs.financialReturn}</strong>
                    </span>
                  </div>
                )}
              </div>

              {/* Context Tag */}
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                {recommendation.categoryContext}
              </span>

              {/* Headline */}
              <h3
                className={`text-2xl font-bold tracking-tight mb-3 ${
                  recommendation.isHazardous ? "text-rose-950" : "text-slate-900"
                }`}
              >
                {recommendation.headline}
              </h3>

              {/* Reason Explanation */}
              <p className="text-sm text-slate-700 leading-relaxed mb-6">
                {recommendation.reason}
              </p>

              {/* Action checklist */}
              <div
                className={`rounded-xl p-4 sm:p-5 border mb-6 ${
                  recommendation.isHazardous
                    ? "bg-white border-rose-200 text-rose-950"
                    : "bg-slate-50 border-slate-200 text-slate-700"
                }`}
              >
                <h4
                  className={`text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5 ${
                    recommendation.isHazardous ? "text-rose-900" : "text-slate-800"
                  }`}
                >
                  {recommendation.isHazardous ? (
                    <Flame className="w-4 h-4 text-rose-700" />
                  ) : (
                    <Info className="w-4 h-4 text-emerald-700" />
                  )}
                  {recommendation.isHazardous
                    ? "Mandatory Safe Handling Checklist:"
                    : "Practical Prerequisites & Verification Steps:"}
                </h4>
                <ul className="space-y-2 text-xs">
                  {recommendation.actionItems.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span
                        className={`w-4 h-4 rounded-full font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 ${
                          recommendation.isHazardous
                            ? "bg-rose-700 text-white"
                            : "bg-emerald-700 text-white"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span className="leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Explicit prohibition banner for hazards */}
              {recommendation.disallowedNotice && (
                <div className="bg-rose-100/70 border border-rose-300 rounded-xl p-3.5 mb-5 flex items-start gap-2.5 text-xs text-rose-900">
                  <XCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                  <span className="font-medium leading-snug">{recommendation.disallowedNotice}</span>
                </div>
              )}

              {/* Footer info & pathway link */}
              {primaryPathway && (
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-slate-100 text-xs text-slate-500">
                  <span>
                    Typical turnaround: <strong>{primaryPathway.tradeoffs.speed}</strong>
                  </span>
                  <a
                    href={`/#pathway-${primaryPathway.id}`}
                    className="inline-flex items-center justify-center font-semibold text-emerald-800 hover:text-emerald-900 hover:underline"
                  >
                    View pathway trade-off specifications &rarr;
                  </a>
                </div>
              )}
            </div>

            {/* Secondary Alternative Card if applicable */}
            {secondaryPathway && !recommendation.isHazardous && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Comparative Alternative Option
                  </span>
                  <span className="text-xs text-slate-500">
                    Return: <strong className="text-slate-800">{secondaryPathway.tradeoffs.financialReturn}</strong>
                  </span>
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-1">
                  {secondaryPathway.title}
                </h4>
                <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                  {secondaryPathway.shortDescription}
                </p>
                <a
                  href={`/#pathway-${secondaryPathway.id}`}
                  className="text-xs font-semibold text-slate-800 hover:text-emerald-700 inline-flex items-center gap-1"
                >
                  Review trade-offs for {secondaryPathway.title} &rarr;
                </a>
              </div>
            )}

            {/* Bridge to Full Recovery Comparison Engine */}
            <div className="bg-emerald-900 text-white rounded-2xl p-6 shadow-sm border border-emerald-800">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-base font-bold text-white mb-1">
                    Need verified provider matching in your area?
                  </h4>
                  <p className="text-xs text-emerald-200 leading-relaxed max-w-xl">
                    Run our full comparison engine with exact pincode verification, quote types, pickup/drop-off logistics, and documented evidence sources.
                  </p>
                </div>
                <Link
                  href="/find-option"
                  className="shrink-0 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5"
                >
                  <span>Compare with Providers</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Disclaimer on advice nature */}
            <p className="text-[11px] text-slate-500 leading-normal px-2">
              <strong>Advisory Note:</strong> This assessment provides indicative decision guidance derived from hardware condition, security requirements, and regulatory safety standards. It does not constitute a guaranteed commercial quote, provider reservation, or local facility match.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
