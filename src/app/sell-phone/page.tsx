import React from "react";
import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PhoneResaleWorkflow } from "@/components/resale/PhoneResaleWorkflow";

export const metadata: Metadata = {
  title: "Sell Your Old Phone for Best Net Price | E-Waste Value Recovery",
  description:
    "Instant verified phone valuation across Cashify Doorstep Buyback, Croma Superrr Exchange, Apple Trade In Saket, and direct buyer benchmarks with transparent deduction rules.",
};

export default function SellPhonePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5EE] text-[#141413]">
      <Header />
      <main className="flex-1">
        <PhoneResaleWorkflow />
      </main>
      <Footer />
    </div>
  );
}
