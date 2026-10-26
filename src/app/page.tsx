import React from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { PathwayGrid } from "@/components/landing/PathwayGrid";
import { PathwayExplorer } from "@/components/landing/PathwayExplorer";
import { CategorySection } from "@/components/landing/CategorySection";
import { ConsumerGuardrails } from "@/components/landing/ConsumerGuardrails";
import { FAQSection } from "@/components/landing/FAQSection";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5EE]">
      <Header />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <PathwayGrid />
        <PathwayExplorer />
        <CategorySection />
        <ConsumerGuardrails />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
}
