"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  Truck,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";

interface JunkDrawerItem {
  id: string;
  name: string;
  category: string;
  weightKg: number;
  estPayoutInr: number;
}

const COMMON_SMALL_ITEMS: JunkDrawerItem[] = [
  { id: "charger", name: "Dead Phone Charger & Adapter", category: "Chargers", weightKg: 0.12, estPayoutInr: 15 },
  { id: "cables", name: "Bundle of Tangled USB / HDMI Cables", category: "Cables", weightKg: 0.25, estPayoutInr: 30 },
  { id: "mouse_keyboard", name: "Broken Computer Mouse or Keyboard", category: "Peripherals", weightKg: 0.45, estPayoutInr: 45 },
  { id: "remote", name: "Old TV / AC Remote Controls (2 pcs)", category: "Remotes", weightKg: 0.18, estPayoutInr: 20 },
  { id: "powerbank", name: "Dead / Non-working Power Bank", category: "Batteries", weightKg: 0.32, estPayoutInr: 35 },
  { id: "router", name: "Old WiFi Router or Set-top Box", category: "Networking", weightKg: 0.65, estPayoutInr: 60 },
  { id: "earphones", name: "Broken Wired Earphones / Headphones", category: "Audio", weightKg: 0.10, estPayoutInr: 10 },
  { id: "small_appliance", name: "Broken Iron, Toaster or Mixer", category: "Small Appliance", weightKg: 1.40, estPayoutInr: 120 },
];

interface CommunityHubProfile {
  id: string;
  name: string;
  area: string;
  pincode: string;
  baseWeightKg: number;
  residentsJoined: number;
  authorizedRecycler: string;
}

const DELHI_HUBS: CommunityHubProfile[] = [
  {
    id: "saket_rwa",
    name: "Saket RWA Block-J Collective",
    area: "Saket, South Delhi",
    pincode: "110017",
    baseWeightKg: 38.6,
    residentsJoined: 42,
    authorizedRecycler: "E-Waste Recyclers India (EWRI Okhla)",
  },
  {
    id: "vasant_kunj",
    name: "Vasant Kunj Sector-C Apartment Federation",
    area: "Vasant Kunj, South West Delhi",
    pincode: "110070",
    baseWeightKg: 44.2,
    residentsJoined: 56,
    authorizedRecycler: "E-Waste Recyclers India (EWRI Okhla)",
  },
  {
    id: "rohini_sec9",
    name: "Rohini Sector-9 Housing Society",
    area: "Rohini, North West Delhi",
    pincode: "110085",
    baseWeightKg: 29.5,
    residentsJoined: 31,
    authorizedRecycler: "CPCB Registered Delhi Partner",
  },
  {
    id: "nehru_place_tech",
    name: "Nehru Place Commercial Tech Hub",
    area: "Nehru Place, South Delhi",
    pincode: "110019",
    baseWeightKg: 48.8,
    residentsJoined: 78,
    authorizedRecycler: "EWRI Industrial Logistics",
  },
];

const TARGET_THRESHOLD_KG = 50.0;

export default function CommunityPoolPage() {
  const [selectedHubId, setSelectedHubId] = useState<string>("saket_rwa");
  const [userLoggedItems, setUserLoggedItems] = useState<{ item: JunkDrawerItem; qty: number }[]>([]);
  const [donorName, setDonorName] = useState("");
  const [submittedDocket, setSubmittedDocket] = useState<string | null>(null);

  const activeHub = useMemo(() => {
    return DELHI_HUBS.find((h) => h.id === selectedHubId) || DELHI_HUBS[0];
  }, [selectedHubId]);

  // Calculate added weight by user
  const userAddedWeight = useMemo(() => {
    return userLoggedItems.reduce((acc, entry) => acc + entry.item.weightKg * entry.qty, 0);
  }, [userLoggedItems]);

  const userEstPayout = useMemo(() => {
    return userLoggedItems.reduce((acc, entry) => acc + entry.item.estPayoutInr * entry.qty, 0);
  }, [userLoggedItems]);

  const totalCurrentWeight = useMemo(() => {
    return Number((activeHub.baseWeightKg + userAddedWeight).toFixed(2));
  }, [activeHub, userAddedWeight]);

  const progressPercent = useMemo(() => {
    return Math.min(100, Math.round((totalCurrentWeight / TARGET_THRESHOLD_KG) * 100));
  }, [totalCurrentWeight]);

  const isThresholdMet = totalCurrentWeight >= TARGET_THRESHOLD_KG;

  // Add item
  const handleAddItem = (item: JunkDrawerItem) => {
    setUserLoggedItems((prev) => {
      const idx = prev.findIndex((p) => p.item.id === item.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx].qty += 1;
        return next;
      }
      return [...prev, { item, qty: 1 }];
    });
  };

  const handleRemoveItem = (itemId: string) => {
    setUserLoggedItems((prev) => prev.filter((p) => p.item.id !== itemId));
  };

  const handleSubmitPoolContribution = (e: React.FormEvent) => {
    e.preventDefault();
    if (userLoggedItems.length === 0) return;
    const docketId = `POOL-DELHI-${Math.floor(100000 + Math.random() * 900000)}`;
    setSubmittedDocket(docketId);
  };

  return (
    <div className="min-h-screen bg-[#F4F1EA] text-[#141413] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#257A72] hover:text-[#1D6059]"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Platform Home
          </Link>

          <span className="text-xs font-mono bg-[#E2DED4] text-[#5A5751] px-2.5 py-1 rounded">
            Reverse Group Logistics for RWAs & Campuses
          </span>
        </div>

        {/* Hero */}
        <div className="bg-[#1B3B2B] text-[#F7F5EE] p-6 sm:p-8 rounded-2xl border border-[#142D21] shadow-sm">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#257A72]/30 border border-[#257A72]/50 text-xs font-mono text-[#C1DFDC]">
            <Users className="w-3.5 h-3.5 text-[#C1DFDC]" />
            Neighborhood E-Waste Aggregation Pool
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#F7F5EE] mt-2">
            The Community &quot;Junk-Drawer&quot; Bulk Recovery Hub
          </h1>
          <p className="text-sm text-[#C1DFDC] mt-2 max-w-2xl leading-relaxed">
            No recycler will drive to your home for 3 dead chargers and 2 tangled cables because
            transport costs exceed salvage value. By pooling small e-waste with your apartment
            society or campus, we trigger free zero-emission bulk collection at 50 kg.
          </p>
        </div>

        {/* Hub Selection */}
        <div className="bg-white rounded-xl border border-[#D5D0C5] p-5 shadow-2xs space-y-3">
          <span className="text-xs font-mono uppercase text-[#736F68] font-bold block">
            Select Your Neighborhood Hub (Delhi NCR)
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {DELHI_HUBS.map((hub) => (
              <button
                key={hub.id}
                type="button"
                onClick={() => {
                  setSelectedHubId(hub.id);
                  setSubmittedDocket(null);
                }}
                className={`p-3 rounded-lg border text-left transition-all ${
                  selectedHubId === hub.id
                    ? "border-[#257A72] bg-[#257A72]/10 ring-1 ring-[#257A72]"
                    : "border-[#E8E5DD] bg-[#FAFAF8] hover:border-[#D5D0C5]"
                }`}
              >
                <span className="font-serif font-bold text-sm text-[#141413] block">
                  {hub.name}
                </span>
                <span className="text-[11px] text-[#736F68] block mt-0.5">{hub.area}</span>
                <span className="text-[10px] font-mono text-[#257A72] block mt-1">
                  Pincode: {hub.pincode} · {hub.residentsJoined} households
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Real-time Collective Progress Bar */}
        <div className="bg-[#1C1A17] text-[#F7F5EE] rounded-xl border border-[#3A3834] p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#2C2A26]">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-[#257A72] font-semibold block">
                Live Community Target: 50.0 kg Bulk Van Dispatch
              </span>
              <h2 className="text-xl font-serif font-bold text-[#F7F5EE]">
                {activeHub.name} Collection Progress
              </h2>
            </div>

            <div className="text-right">
              <span className="font-mono font-bold text-2xl text-[#F7F5EE]">
                {totalCurrentWeight} / {TARGET_THRESHOLD_KG} kg
              </span>
              <span className="text-xs font-mono text-[#4E9B70] block">
                {progressPercent}% Complete
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-4 bg-[#282622] rounded-full overflow-hidden p-0.5 border border-[#3A3834]">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isThresholdMet ? "bg-[#4E9B70]" : "bg-gradient-to-r from-[#257A72] to-[#4E9B70]"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Status banner */}
          <div className="flex items-center justify-between text-xs font-mono text-[#A8A29E] flex-wrap gap-2 pt-1">
            <span className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-[#257A72]" />
              Pickup Logistics: {activeHub.authorizedRecycler}
            </span>

            {isThresholdMet ? (
              <span className="text-[#4E9B70] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Threshold Reached! Electric Van Dispatch Scheduled.
              </span>
            ) : (
              <span>Only {(TARGET_THRESHOLD_KG - totalCurrentWeight).toFixed(1)} kg remaining to trigger collection!</span>
            )}
          </div>

          {/* Environmental Offset Metrics */}
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-[#2C2A26] text-center">
            <div className="p-2.5 bg-[#282622] rounded-lg">
              <span className="text-[10px] text-[#A8A29E] block">Copper Salvage</span>
              <span className="text-sm font-mono font-bold text-[#F7F5EE]">
                ~{(totalCurrentWeight * 0.14).toFixed(1)} kg
              </span>
            </div>
            <div className="p-2.5 bg-[#282622] rounded-lg">
              <span className="text-[10px] text-[#A8A29E] block">CO2e Diverted</span>
              <span className="text-sm font-mono font-bold text-[#4E9B70]">
                ~{(totalCurrentWeight * 2.8).toFixed(1)} kg
              </span>
            </div>
            <div className="p-2.5 bg-[#282622] rounded-lg">
              <span className="text-[10px] text-[#A8A29E] block">Community Fund</span>
              <span className="text-sm font-mono font-bold text-[#E6E4DE]">
                ₹{Math.round(totalCurrentWeight * 68)}
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Add Items Grid & Cart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Add Common Items */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-[#D5D0C5] p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E5DD]">
              <div>
                <h3 className="font-serif font-bold text-base text-[#141413]">
                  What &quot;Junk Drawer&quot; Items Are You Adding?
                </h3>
                <p className="text-xs text-[#5A5751]">
                  Tap to add small broken electronics from your home.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {COMMON_SMALL_ITEMS.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-lg border border-[#E8E5DD] bg-[#FAFAF8] flex items-center justify-between gap-3 hover:border-[#257A72] transition-all"
                >
                  <div>
                    <span className="font-serif font-bold text-xs text-[#141413] block">
                      {item.name}
                    </span>
                    <span className="text-[11px] font-mono text-[#736F68]">
                      {item.weightKg} kg · +₹{item.estPayoutInr} community credit
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddItem(item)}
                    className="p-1.5 rounded-md bg-[#1B3B2B] text-white hover:bg-[#142D21] shrink-0"
                    title="Add to pool"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* User Pool Contribution Form */}
          <div className="bg-white rounded-xl border border-[#D5D0C5] p-5 shadow-2xs space-y-4">
            <h3 className="font-serif font-bold text-base text-[#141413] pb-2 border-b border-[#E8E5DD]">
              Your Pool Contribution
            </h3>

            {userLoggedItems.length === 0 ? (
              <p className="text-xs text-[#736F68] py-6 text-center italic">
                No items added yet. Click &quot;+&quot; on items on the left to add them to your
                society&apos;s collection!
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto divide-y divide-[#E8E5DD]">
                {userLoggedItems.map((entry) => (
                  <div key={entry.item.id} className="pt-2 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-medium text-[#141413] block">{entry.item.name}</span>
                      <span className="text-[10px] text-[#736F68] font-mono">
                        {entry.qty} × {entry.item.weightKg} kg = {(entry.qty * entry.item.weightKg).toFixed(2)} kg
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(entry.item.id)}
                      className="text-[#842A20] hover:text-[#B91C1C] p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {userLoggedItems.length > 0 && (
              <div className="pt-3 border-t border-[#E8E5DD] space-y-3">
                <div className="flex justify-between text-xs font-mono">
                  <span>Your Added Weight:</span>
                  <span className="font-bold text-[#141413]">{userAddedWeight.toFixed(2)} kg</span>
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span>Community Credit Added:</span>
                  <span className="font-bold text-[#257A72]">₹{userEstPayout}</span>
                </div>

                {!submittedDocket ? (
                  <form onSubmit={handleSubmitPoolContribution} className="space-y-3 pt-2">
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-[#736F68] font-bold mb-1">
                        Resident Name / Society Flat
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rahul Sharma / Flat 402"
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        className="w-full px-3 py-1.5 rounded border border-[#D5D0C5] text-xs font-sans"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-lg bg-[#257A72] hover:bg-[#1D6059] text-white text-xs font-mono font-bold transition-all shadow-sm"
                    >
                      Confirm Drop-off & Generate Docket
                    </button>
                  </form>
                ) : (
                  <div className="p-3 bg-[#F3F9F8] border border-[#257A72]/40 rounded-lg text-xs space-y-1">
                    <span className="font-mono font-bold text-[#257A72] flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Docket #{submittedDocket} Issued!
                    </span>
                    <p className="text-[#5A5751]">
                      Drop your boxed items at your Society Clubhouse Security Gate.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
