"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "../ui/Button";
import { Menu, X, ShieldCheck, ArrowRight, Layers } from "lucide-react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo / Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold shadow-xs group-hover:bg-emerald-900 transition-colors">
              <Layers className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-lg tracking-tight block leading-tight">
                E-Waste Value Recovery
              </span>
              <span className="text-xs text-slate-500 font-medium block leading-none">
                Consumer-First Electronics Guidance
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <Link
              href="/#pathways"
              className="hover:text-slate-900 transition-colors py-1"
            >
              The 6 Options
            </Link>
            <Link
              href="/#categories"
              className="hover:text-slate-900 transition-colors py-1"
            >
              Device Categories
            </Link>
            <Link
              href="/#how-it-works"
              className="hover:text-slate-900 transition-colors py-1"
            >
              How It Works
            </Link>
            <Link
              href="/#guardrails"
              className="hover:text-slate-900 transition-colors py-1"
            >
              Data & Safety Check
            </Link>
            <Link
              href="/find-option"
              className="hover:text-slate-900 transition-colors py-1 font-semibold text-emerald-800"
            >
              Compare Pathways
            </Link>
            <Link
              href="/directory"
              className="hover:text-slate-900 transition-colors py-1 font-medium text-slate-600 hover:text-slate-900"
            >
              Directory
            </Link>
            <Link
              href="/dashboard"
              className="hover:text-slate-900 transition-colors py-1 font-medium text-slate-600 hover:text-slate-900"
            >
              My Cases
            </Link>
            <Link
              href="/analytics"
              className="hover:text-slate-900 transition-colors py-1 font-medium text-slate-600 hover:text-slate-900"
            >
              Impact
            </Link>
            <Link
              href="/#faq"
              className="hover:text-slate-900 transition-colors py-1"
            >
              FAQ
            </Link>
          </nav>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Independent & Ad-Free</span>
            </div>
            <Button href="/find-option" variant="primary" size="md">
              Find Best Option
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div id="mobile-navigation" className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-md border border-slate-200 mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Independent assessment. No sponsored placements.</span>
          </div>
          <Link
            href="/#pathways"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-md"
          >
            The 6 Options
          </Link>
          <Link
            href="/#categories"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-md"
          >
            Device Categories
          </Link>
          <Link
            href="/#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-md"
          >
            How It Works
          </Link>
          <Link
            href="/#guardrails"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-md"
          >
            Data & Safety Check
          </Link>
          <Link
            href="/find-option"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-semibold text-emerald-800 hover:bg-slate-50 rounded-md"
          >
            Compare Pathways &amp; Providers
          </Link>
          <Link
            href="/directory"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-md"
          >
            Provider Directory
          </Link>
          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-md"
          >
            My Cases
          </Link>
          <Link
            href="/analytics"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-md"
          >
            Impact &amp; Analytics
          </Link>
          <Link
            href="/#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-md"
          >
            FAQ
          </Link>
          <div className="pt-2">
            <Button
              href="/find-option"
              variant="primary"
              size="lg"
              className="w-full justify-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              Find the Best Option
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
