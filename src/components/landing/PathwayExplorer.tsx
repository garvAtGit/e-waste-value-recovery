"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DEVICE_CATEGORIES } from "@/lib/constants/categories";
import {
  ArrowUpRight,
  Cpu,
  ShieldAlert,
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
    description: "Powers on normally, receives OS security updates, battery healthy, no structural damage.",
  },
  {
    id: "minor_fault",
    label: "Minor fault or worn consumable",
    description: "Cracked outer screen glass, degraded battery capacity, sticky switch, or loose charge port.",
  },
  {
    id: "working_older",
    label: "Fully working, but older or unsupported",
    description: "OS patches ceased, hardware operates slow for modern workloads, but powers on completely.",
  },
  {
    id: "major_fault",
    label: "Major hardware fault or won't boot",
    description: "Failed logic board, liquid corrosion, shattered panel, or persistent bootloop.",
  },
  {
    id: "unsafe_hazardous",
    label: "Physical swelling, cracked battery, or chemical leak",
    description: "Bulging pouch cell, leaking electrolyte, burnt odor, or exposed high-voltage wiring.",
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

  const currentCategory =
    DEVICE_CATEGORIES.find((c) => c.id === selectedCategory) || DEVICE_CATEGORIES[0];

  const getRecommendation = (): RecommendationResult => {
    // 1. SAFETY OVERRIDE
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
        "Contact your local municipal hazardous-waste collection team or fire/emergency services for safe on-site handling and disposal instructions.",
      ];

      if (isLargeAppliance) {
        hazardHeadline = "STOP USE: High-Voltage or Refrigerant Hazard";
        hazardReason =
          "Appliance units with leaking refrigerant gases (fluorinated/ODS), burning electrical smells, or damaged mains wiring pose fire, shock, or environmental toxicity hazards. Do not attempt DIY teardown.";
        hazardSteps = [
          "Isolate appliance from mains electrical supply immediately.",
          "Do not cut or puncture cooling coils or compressor lines containing pressurized refrigerants.",
          "Contact your local municipal bulky waste collection service or an authorised commercial appliance recycler.",
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
          "Resale, retailer trade-in, and charitable donation are strictly prohibited for hazardous, swollen, or structurally dangerous electronics.",
      };
    }

    // 2. MAJOR FAULT
    if (selectedCondition === "major_fault") {
      if (selectedCategory === "smartphones-tablets" || selectedCategory === "laptops-computers") {
        return {
          isHazardous: false,
          primaryId: "refurbishers-parts",
          secondaryId: "authorised-recycling",
          headline: "Salvage Functional Sub-Assemblies & Donor Parts",
          categoryContext: `Recovery protocol for ${currentCategory.name}`,
          reason:
            "While logic board or display failure makes consumer repair uneconomic, secondary refurbishers can harvest donor ICs, camera modules, structural housings, and heatsinks.",
          actionItems: [
            "Verify storage media cannot be harvested without cryptographic wipe (perform motherboard removal if unencrypted).",
            "Seek specialist refurbishment buyback rather than standard P2P consumer sales.",
            "If no local parts buyer accepts the unit, transfer to certified e-waste recycler for precious metal refining.",
          ],
        };
      }

      return {
        isHazardous: false,
        primaryId: "authorised-recycling",
        secondaryId: null,
        headline: "Direct Certified Material Recycling",
        categoryContext: `Recovery protocol for ${currentCategory.name}`,
        reason:
          "Dead non-computing appliances and peripherals have negligible donor component reuse value. Direct mechanical shredding and circuit board refining captures copper, gold, and engineering plastics safely.",
        actionItems: [
          "Check local municipal collection point or authorised recycler depot in Delhi NCR.",
          "Never discard with general domestic municipal refuse.",
        ],
      };
    }

    // 3. MINOR FAULT
    if (selectedCondition === "minor_fault") {
      if (priority === "value") {
        return {
          isHazardous: false,
          primaryId: "repair",
          secondaryId: "sell-cash",
          headline: "Targeted Repair to Retain Prime Utility",
          categoryContext: `Economic assessment for ${currentCategory.name}`,
          reason:
            "Replacing a worn battery cell or cracked outer glass preserves up to 70% of device utility at a fraction of replacement cost.",
          actionItems: [
            "Request itemised quote separating genuine spare part cost from labour fees.",
            "Compare repair expense against the device's secondary market resale value.",
            "Backup personal data prior to handing unit to technician.",
          ],
        };
      }

      return {
        isHazardous: false,
        primaryId: "exchange-voucher",
        secondaryId: "sell-cash",
        headline: "Convenience Trade-in / Kiosk Handover",
        categoryContext: `Turnaround evaluation for ${currentCategory.name}`,
        reason:
          "Avoid the friction and messaging overhead of private P2P selling by transferring through an OEM or retailer buyback desk accepting minor faults with instant diagnostic deduction.",
        actionItems: [
          "Confirm whether trade-in credit is liquid cash or store-locked voucher.",
          "Perform factory reset and remove anti-theft cloud locks.",
        ],
      };
    }

    // 4. OLDER WORKING
    if (selectedCondition === "working_older") {
      if (priority === "social") {
        return {
          isHazardous: false,
          primaryId: "donate-reuse",
          secondaryId: "sell-cash",
          headline: "Social & Educational Redeployment",
          categoryContext: `Community utility for ${currentCategory.name}`,
          reason:
            "Older hardware capable of web browsing, document editing, or basic playback provides high educational value to non-profit learning centres when paired with lightweight OS software.",
          actionItems: [
            "Verify the recipient non-profit specifically requests this hardware category.",
            "Include power adapters and peripheral cables.",
            "Execute NIST SP 800-88 cryptographic drive wipe.",
          ],
        };
      }

      return {
        isHazardous: false,
        primaryId: "sell-cash",
        secondaryId: "donate-reuse",
        headline: "Secondary Market Budget Resale",
        categoryContext: `Market valuation for ${currentCategory.name}`,
        reason:
          "Working budget hardware has robust secondary demand among students, tinkerers, or secondary device users.",
        actionItems: [
          "List with transparent photos showing battery health and cosmetic marks.",
          "Provide power accessories.",
        ],
      };
    }

    // 5. WORKING RECENT
    if (priority === "convenience") {
      return {
        isHazardous: false,
        primaryId: "exchange-voucher",
        secondaryId: "sell-cash",
        headline: "OEM Trade-In or Retail Buyback",
        categoryContext: `Commercial valuation for ${currentCategory.name}`,
        reason:
          "Guaranteed instantaneous credit towards your next device without fielding consumer messages or dealing with courier returns.",
        actionItems: [
          "Verify OEM bonus exchange incentives during promotional windows.",
          "Check trade-in terms for physical counter inspection deductions.",
        ],
      };
    }

    return {
      isHazardous: false,
      primaryId: "sell-cash",
      secondaryId: "exchange-voucher",
      headline: "Direct Peer-to-Peer Cash Resale",
      categoryContext: `Maximum return valuation for ${currentCategory.name}`,
      reason:
        "Recent fully working electronics yield the absolute highest financial recovery through direct private sale, eliminating middleman refurbishment margins.",
      actionItems: [
        "Capture clean daylight photos of screen and frame.",
        "Sign out of Apple ID / Google FRP / cloud accounts before factory reset.",
        "Arrange hand-over in a secure, well-lit public space.",
      ],
    };
  };

  const rec = getRecommendation();

  return (
    <section className="py-16 lg:py-24 bg-[#F7F5EE] border-b border-[#DFD9CD] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#DFD9CD] mb-12">
          <div className="space-y-2 max-w-2xl">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#736F66] block">
              INTERACTIVE DECISION ENGINE // PREVIEW
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#141413] tracking-tight">
              Test how condition alters value.
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#413F3B] max-w-md leading-relaxed font-sans">
            Adjust the equipment category and symptoms below to see how our deterministic logic
            shifts recommendations between repair, resale, donor parts, and certified recycling.
          </p>
        </div>

        {/* Matrix Workbench Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Controls Column */}
          <div className="lg:col-span-5 bg-[#FAF8F3] border border-[#D4CDC0] rounded-sm p-6 sm:p-7 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E0D4] text-[11px] font-mono uppercase text-[#736F66]">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#1B3B2B]" />
                <span>INPUT SPECIFICATION</span>
              </span>
              <span>LIVE PARAMETERS</span>
            </div>

            {/* 1. Category */}
            <div className="space-y-2">
              <label className="block text-[11px] font-mono uppercase text-[#141413] tracking-wider">
                1. Equipment Category
              </label>
              <div className="grid grid-cols-2 gap-1.5 font-mono text-xs">
                {DEVICE_CATEGORIES.slice(0, 4).map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`p-2.5 text-left border rounded-xs transition-colors ${
                      selectedCategory === cat.id
                        ? "bg-[#1B3B2B] text-[#F7F5EE] border-[#142D21]"
                        : "bg-[#F7F5EE] text-[#413F3B] border-[#D4CDC0] hover:bg-[#EFECE2]"
                    }`}
                  >
                    <span className="block font-semibold truncate">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Condition */}
            <div className="space-y-2">
              <label className="block text-[11px] font-mono uppercase text-[#141413] tracking-wider">
                2. Functional Condition
              </label>
              <div className="space-y-1.5">
                {CONDITIONS.map((cond) => {
                  const isChecked = selectedCondition === cond.id;
                  const isHazard = cond.id === "unsafe_hazardous";

                  return (
                    <label
                      key={cond.id}
                      className={`flex items-start gap-2.5 p-2.5 border rounded-xs cursor-pointer transition-colors text-xs ${
                        isChecked
                          ? isHazard
                            ? "bg-[#FBECE6] border-[#F2C2B2] text-[#A63C19]"
                            : "bg-[#1B3B2B] border-[#142D21] text-[#F7F5EE]"
                          : isHazard
                          ? "bg-[#FAF8F3] border-[#F2C2B2] text-[#A63C19] hover:bg-[#FBECE6]"
                          : "bg-[#F7F5EE] border-[#D4CDC0] text-[#383632] hover:bg-[#EFECE2]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="preview-condition"
                        value={cond.id}
                        checked={isChecked}
                        onChange={() => setSelectedCondition(cond.id)}
                        className="mt-0.5"
                      />
                      <div className="space-y-0.5">
                        <span className="block font-semibold leading-tight">{cond.label}</span>
                        <span
                          className={`block text-[11px] leading-tight ${
                            isChecked
                              ? isHazard
                                ? "text-[#732B13]"
                                : "text-[#C1DFDC]"
                              : "text-[#736F66]"
                          }`}
                        >
                          {cond.description}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 3. Priority Goal */}
            <div className="space-y-2">
              <label className="block text-[11px] font-mono uppercase text-[#141413] tracking-wider">
                3. User Priority
              </label>
              <div className="grid grid-cols-3 gap-1.5 font-mono text-[11px]">
                <button
                  type="button"
                  onClick={() => setPriority("value")}
                  className={`p-2 border rounded-xs text-center transition-colors ${
                    priority === "value"
                      ? "bg-[#1B3B2B] text-[#F7F5EE] border-[#142D21]"
                      : "bg-[#F7F5EE] text-[#413F3B] border-[#D4CDC0] hover:bg-[#EFECE2]"
                  }`}
                >
                  MAX VALUE
                </button>
                <button
                  type="button"
                  onClick={() => setPriority("convenience")}
                  className={`p-2 border rounded-xs text-center transition-colors ${
                    priority === "convenience"
                      ? "bg-[#1B3B2B] text-[#F7F5EE] border-[#142D21]"
                      : "bg-[#F7F5EE] text-[#413F3B] border-[#D4CDC0] hover:bg-[#EFECE2]"
                  }`}
                >
                  SPEED / EFFORT
                </button>
                <button
                  type="button"
                  onClick={() => setPriority("social")}
                  className={`p-2 border rounded-xs text-center transition-colors ${
                    priority === "social"
                      ? "bg-[#1B3B2B] text-[#F7F5EE] border-[#142D21]"
                      : "bg-[#F7F5EE] text-[#413F3B] border-[#D4CDC0] hover:bg-[#EFECE2]"
                  }`}
                >
                  COMMUNITY
                </button>
              </div>
            </div>
          </div>

          {/* Right Live Recommendation Output Column */}
          <div className="lg:col-span-7 space-y-4">
            <div
              className={`border rounded-sm p-6 sm:p-8 space-y-5 transition-colors ${
                rec.isHazardous
                  ? "bg-[#FBECE6] border-[#C8532C] text-[#141413]"
                  : "bg-[#FAF8F3] border-[#D4CDC0] text-[#141413]"
              }`}
            >
              {/* Header Stamp */}
              <div className="flex items-center justify-between pb-4 border-b border-[#DFD9CD] text-[11px] font-mono uppercase">
                <span className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      rec.isHazardous ? "bg-[#C8532C] animate-ping" : "bg-[#1B3B2B]"
                    }`}
                  />
                  <span className="text-[#736F66]">{rec.categoryContext}</span>
                </span>
                <span
                  className={`px-2 py-0.5 rounded-xs font-bold ${
                    rec.isHazardous
                      ? "bg-[#C8532C] text-white"
                      : "bg-[#1B3B2B] text-[#F7F5EE]"
                  }`}
                >
                  {rec.isHazardous ? "SAFETY DIRECTIVE" : "RECOMMENDED PRIMARY"}
                </span>
              </div>

              {/* Title & Core Reason */}
              <div className="space-y-2">
                <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#141413]">
                  {rec.headline}
                </h3>
                <p className="text-xs sm:text-sm text-[#413F3B] leading-relaxed font-sans">
                  {rec.reason}
                </p>
              </div>

              {/* Action Protocol Checklist */}
              <div className="space-y-2 pt-2 border-t border-[#DFD9CD]">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#736F66] block">
                  Prescribed Actions:
                </span>
                <ul className="space-y-1.5 text-xs text-[#383632] font-mono">
                  {rec.actionItems.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#1B3B2B] font-bold">&rarr;</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Disallowed warning if hazardous */}
              {rec.disallowedNotice && (
                <div className="p-3 bg-white/80 border border-[#F2C2B2] text-[#A63C19] text-xs font-mono rounded-xs flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-[#C8532C] shrink-0 mt-0.5" />
                  <span>{rec.disallowedNotice}</span>
                </div>
              )}

              {/* Launch Full Assessment Link */}
              <div className="pt-4 flex items-center justify-between border-t border-[#DFD9CD]">
                <span className="text-[11px] font-mono text-[#736F66]">
                  LOOKING FOR DELHI PROVIDERS?
                </span>
                <Link
                  href="/find-option"
                  className="px-4 py-2 bg-[#1B3B2B] hover:bg-[#142D21] text-[#F7F5EE] text-xs font-mono uppercase tracking-wider rounded-sm flex items-center gap-1.5 transition-colors"
                >
                  <span>Run Full Evaluation</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#C1DFDC]" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
