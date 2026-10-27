"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowUpRight } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  index: string;
  badge?: string;
}

const PRIMARY_NAV: NavItem[] = [
  { href: "/sell-phone", label: "Sell Phone", index: "01", badge: "Instant Payout" },
  { href: "/diagnostics", label: "Diagnostics", index: "02", badge: "Live Web" },
  { href: "/salvage", label: "Organ Salvage", index: "03", badge: "Nothing BOM" },
  { href: "/community-pool", label: "Community Pool", index: "04", badge: "RWA 50kg" },
  { href: "/data-wipe", label: "Data Wipe", index: "05" },
  { href: "/repair-vs-sell", label: "Repair vs Sell", index: "06" },
  { href: "/directory", label: "Directory", index: "07" },
  { href: "/dashboard", label: "Cases", index: "08" },
];

function HeaderFallback() {
  return (
    <header className="sticky top-0 z-50 bg-[#F7F5EE]/95 backdrop-blur-md border-b border-[#DFD9CD] transition-colors">
      <div className="hidden sm:block border-b border-[#EBE6DB] bg-[#F1EDE3] px-4 sm:px-6 lg:px-8 py-1 text-[11px] font-mono text-[#6B675E]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#1B3B2B]" />
            <span>DELHI PILOT INTAKE ACTIVE · 6 AUDITED RECOVERY NETWORKS</span>
          </span>
          <div className="flex items-center gap-4">
            <span>ZERO SPONSORED LISTINGS</span>
            <span className="text-[#C7BFB0]">/</span>
            <Link href="/admin" className="hover:text-[#141413] underline transition-colors">
              OPERATIONS CONSOLE
            </Link>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-sm overflow-hidden flex items-center justify-center shrink-0 border border-[#D5D0C5] bg-white shadow-2xs">
              <Image
                src="/logo.png"
                alt="E-Waste Value Recovery Logo"
                width={36}
                height={36}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-[#141413] leading-none">
                E-Waste Value Recovery
              </span>
              <span className="font-mono text-[10px] text-[#736F66] tracking-wider uppercase mt-1">
                Circular Hardware Registry · Delhi
              </span>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/sell-phone"
              className="px-4 py-2 bg-[#1B3B2B] text-[#F7F5EE] text-xs font-mono uppercase tracking-wider rounded-sm flex items-center gap-1.5"
            >
              <span>Sell Phone</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#C1DFDC]" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

function HeaderInner() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Close mobile menu on route change
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
  }

  // Handle escape key and body scroll locking
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };

    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#F7F5EE]/95 backdrop-blur-md border-b border-[#DFD9CD] transition-colors">
        {/* Top Institutional Micro-Banner */}
        <div className="hidden sm:block border-b border-[#EBE6DB] bg-[#F1EDE3] px-4 sm:px-6 lg:px-8 py-1 text-[11px] font-mono text-[#6B675E]">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#1B3B2B] animate-pulse" />
              <span>DELHI PILOT INTAKE ACTIVE · 6 AUDITED RECOVERY NETWORKS</span>
            </span>
            <div className="flex items-center gap-4">
              <span>ZERO SPONSORED LISTINGS</span>
              <span className="text-[#C7BFB0]">/</span>
              <Link
                href="/admin"
                className="hover:text-[#141413] underline transition-colors"
              >
                OPERATIONS CONSOLE
              </Link>
            </div>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Typographic Wordmark */}
            <Link
              href="/"
              className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B3B2B]"
            >
              <div className="w-9 h-9 rounded-sm overflow-hidden flex items-center justify-center shrink-0 border border-[#D5D0C5] bg-white transition-transform duration-200 group-hover:scale-95 shadow-2xs">
                <Image
                  src="/logo.png"
                  alt="E-Waste Value Recovery Logo"
                  width={36}
                  height={36}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-[#141413] leading-none">
                  E-Waste Value Recovery
                </span>
                <span className="font-mono text-[10px] text-[#736F66] tracking-wider uppercase mt-1">
                  Circular Hardware Registry · Delhi
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav
              className="hidden md:flex items-center gap-1 lg:gap-2 text-xs font-mono uppercase tracking-wider"
              aria-label="Primary navigation"
            >
              {PRIMARY_NAV.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative px-3 py-2 transition-colors flex items-center gap-1.5 group ${
                      isActive
                        ? "text-[#141413] font-semibold"
                        : "text-[#6B675E] hover:text-[#141413]"
                    }`}
                  >
                    <span className="text-[10px] text-[#A69E8C] group-hover:text-[#736F66] transition-colors">
                      {item.index}
                    </span>
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#1B3B2B]" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Action CTA & Micro Badging */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/sell-phone"
                className="px-4 py-2 bg-[#1B3B2B] hover:bg-[#142D21] text-[#F7F5EE] text-xs font-mono uppercase tracking-wider rounded-sm transition-all duration-150 border border-[#142D21] flex items-center gap-1.5 shadow-xs hover:shadow-sm active:translate-y-px"
              >
                <span>Sell Phone (Best Payout)</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#C1DFDC]" />
              </Link>
            </div>

            {/* Mobile Menu Toggle Button */}
            <div className="flex items-center md:hidden gap-2">
              <Link
                href="/sell-phone"
                className="px-2.5 py-1.5 bg-[#1B3B2B] text-[#F7F5EE] text-[11px] font-mono uppercase rounded-sm border border-[#142D21]"
              >
                Sell Phone
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-[#413F3B] hover:text-[#141413] hover:bg-[#EFECE2] rounded-sm transition-colors border border-[#D4CDC0]"
                aria-expanded={mobileMenuOpen}
                aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#141413]/40 backdrop-blur-xs md:hidden animate-fade-in"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="fixed inset-y-0 right-0 w-full max-w-xs bg-[#F7F5EE] border-l border-[#DFD9CD] shadow-xl p-6 flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation"
          >
            <div>
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#DFD9CD]">
                <div className="flex flex-col">
                  <span className="font-serif font-bold text-base text-[#141413]">
                    Navigation
                  </span>
                  <span className="font-mono text-[10px] text-[#736F66] uppercase">
                    Delhi Recovery Dispatch
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-[#413F3B] hover:text-[#141413] border border-[#D4CDC0] rounded-sm"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="mt-6 space-y-1 font-mono text-xs uppercase">
                {PRIMARY_NAV.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between p-3 rounded-sm border transition-colors ${
                        isActive
                          ? "bg-[#1B3B2B] text-[#F7F5EE] border-[#142D21]"
                          : "bg-[#FAF8F3] text-[#383632] border-[#E5E0D4] hover:bg-[#EFECE2]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`text-[10px] ${
                            isActive ? "text-[#C1DFDC]" : "text-[#736F66]"
                          }`}
                        >
                          {item.index}
                        </span>
                        <span className="font-medium tracking-tight">{item.label}</span>
                      </div>
                      <ArrowUpRight
                        className={`w-3.5 h-3.5 ${
                          isActive ? "text-[#C1DFDC]" : "text-[#A69E8C]"
                        }`}
                      />
                    </Link>
                  );
                })}

                <div className="pt-4 border-t border-[#DFD9CD] mt-4 space-y-1">
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between p-3 text-[11px] text-[#6B675E] hover:text-[#141413] hover:bg-[#EFECE2] rounded-sm"
                  >
                    <span>Operations Console (Admin)</span>
                    <span className="text-[9px] bg-[#E5E0D4] px-1.5 py-0.5 rounded-xs">SECURE</span>
                  </Link>
                </div>
              </nav>
            </div>

            {/* Drawer Bottom Metadata */}
            <div className="pt-6 border-t border-[#DFD9CD] text-[11px] font-mono text-[#736F66] space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#1B3B2B]" />
                <span>CPCB / DPCC REGULATORY ALIGNED</span>
              </div>
              <p className="text-[10px] leading-relaxed text-[#8F8A7E]">
                Independent hardware valuation framework. Zero commercial vendor sponsorship.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function Header() {
  return (
    <Suspense fallback={<HeaderFallback />}>
      <HeaderInner />
    </Suspense>
  );
}
