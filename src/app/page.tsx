import React from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/landing/Hero";
import { PathwayExplorer } from "@/components/landing/PathwayExplorer";
import { PathwayGrid } from "@/components/landing/PathwayGrid";
import { CategorySection } from "@/components/landing/CategorySection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ConsumerGuardrails } from "@/components/landing/ConsumerGuardrails";
import { FAQSection } from "@/components/landing/FAQSection";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1">
        <Hero />
        <PathwayExplorer />
        <PathwayGrid />
        <CategorySection />
        <HowItWorks />
        <ConsumerGuardrails />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
}
