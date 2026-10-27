"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import QRCode from "qrcode";
import {
  ShieldCheck,
  ArrowLeft,
  HelpCircle,
} from "lucide-react";
import { HardwareDiagnosticsRunner } from "../../components/diagnostics/HardwareDiagnosticsRunner";

export default function DiagnosticsPage() {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        ) || navigator.maxTouchPoints > 1;

      // Generate QR code pointing to current diagnostics URL asynchronously
      const currentUrl = window.location.href;
      QRCode.toDataURL(currentUrl, {
        width: 180,
        margin: 2,
        color: { dark: "#141413", light: "#F7F5EE" },
      })
        .then((url) => {
          setQrDataUrl(url);
          setIsMobileDevice(isMobile);
        })
        .catch(() => {});
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F4F1EA] text-[#141413] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Link & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            href="/sell-phone"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#257A72] hover:text-[#1D6059]"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Phone Valuation
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono bg-[#E2DED4] text-[#5A5751] px-2.5 py-1 rounded">
              W3C Standard WebAPIs · Zero Native App Required
            </span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-[#1B3B2B] text-[#F7F5EE] p-6 sm:p-8 rounded-2xl shadow-sm border border-[#142D21]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#257A72]/30 border border-[#257A72]/50 text-xs font-mono text-[#C1DFDC]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C1DFDC]" />
                Interactive Diagnostic Subsystem
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#F7F5EE]">
                Real-Time Hardware Health Verification
              </h1>
              <p className="text-sm text-[#C1DFDC] leading-relaxed">
                Aggregators often deduct 30% to 40% from your quote at the doorstep citing
                &quot;subjective condition.&quot; Run this 60-second hardware diagnostic to lock your
                exact screen, digitizer, camera, and acoustic health transparently.
              </p>
            </div>

            {/* Desktop to Mobile QR Bridge */}
            {!isMobileDevice && qrDataUrl && (
              <div className="p-3 bg-white text-[#141413] rounded-xl border border-[#D5D0C5] shadow-lg flex flex-col items-center text-center shrink-0">
                <Image
                  src={qrDataUrl}
                  alt="Scan QR code to test mobile phone"
                  width={128}
                  height={128}
                  unoptimized
                  className="w-32 h-32 rounded"
                />
                <span className="text-[11px] font-mono font-bold mt-2 text-[#141413]">
                  Testing a Phone?
                </span>
                <span className="text-[10px] text-[#736F68] max-w-[130px]">
                  Scan with your mobile camera to test directly
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Diagnostics Runner Controller */}
        <HardwareDiagnosticsRunner />

        {/* Educational / Transparency Footer */}
        <div className="bg-white rounded-xl border border-[#D5D0C5] p-5 text-xs text-[#5A5751] space-y-2">
          <div className="flex items-center gap-2 font-mono font-bold text-[#141413]">
            <HelpCircle className="w-4 h-4 text-[#257A72]" />
            How this diagnostic guarantees your quote
          </div>
          <p>
            When you complete these tests, our system cryptographically signs the subsystem report
            docket. This report is recorded directly inside your recovery case, providing tangible
            evidence against unwarranted deductions when the technician inspects the device.
          </p>
        </div>
      </div>
    </div>
  );
}
