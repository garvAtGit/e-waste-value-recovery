"use client";

import React, { useState } from "react";
import { Database, ChevronDown, ChevronUp, FileCode } from "lucide-react";

interface SupabaseSetupBannerProps {
  isConfigured: boolean;
  isDemoMode: boolean;
}

export function SupabaseSetupBanner({
  isConfigured,
  isDemoMode,
}: SupabaseSetupBannerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // If fully configured with real production data (not demo), don't show the setup banner
  if (isConfigured && !isDemoMode) {
    return null;
  }

  return (
    <div className="bg-[#141413] text-[#F7F5EE] rounded-sm p-6 sm:p-7 border border-[#2D2C28] shadow-xs mb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-sm bg-[#1B3B2B] text-[#D4E8DC] border border-[#2C5E45] flex items-center justify-center shrink-0 mt-0.5">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5 font-mono text-[11px] uppercase tracking-wider">
              <span className="text-[#A3D9B1] bg-[#1B3B2B] px-2 py-0.5 rounded-sm border border-[#2C5E45]">
                {isConfigured ? "Demo Fixtures Active" : "Local Demonstration Mode"}
              </span>
              <span className="text-[#8E8B82]">
                {!isConfigured ? "Supabase credentials pending" : "Development sample records loaded"}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-serif font-bold text-[#F7F5EE] tracking-tight">
              {!isConfigured
                ? "Provider directory is operating in zero-crash demonstration mode"
                : "Testing with clearly labelled demonstration records"}
            </h3>
            <p className="text-xs sm:text-sm text-[#BDB9AE] mt-1 max-w-3xl leading-relaxed">
              The directory is rendering strictly labelled sample records so you can test filtering,
              responsiveness, and evidence verification without requiring live database keys.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-[#A3D9B1] hover:text-white bg-[#20201E] hover:bg-[#2A2926] px-3.5 py-2 rounded-sm border border-[#3E3C36] transition-colors shrink-0"
        >
          <span>{isExpanded ? "Hide Database Setup Guide" : "View Supabase Setup Guide"}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-6 pt-6 border-t border-[#2D2C28] space-y-4 text-xs sm:text-sm text-[#BDB9AE]">
          <h4 className="font-mono text-xs font-bold text-[#F7F5EE] uppercase tracking-wider flex items-center gap-2">
            <FileCode className="w-4 h-4 text-[#A3D9B1]" />
            Instructions to Connect Live Supabase PostgreSQL:
          </h4>

          <ol className="space-y-3 list-decimal list-inside text-[#BDB9AE]">
            <li className="leading-relaxed">
              <strong className="text-white">Create a Supabase Project:</strong> Visit{" "}
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#A3D9B1] underline hover:text-white"
              >
                supabase.com
              </a>{" "}
              and create a new PostgreSQL project.
            </li>
            <li className="leading-relaxed">
              <strong className="text-white">Apply SQL Migration:</strong> In your Supabase dashboard,
              open the <em>SQL Editor</em> and execute the migration file located at:
              <code className="block bg-[#0A0A09] p-2.5 rounded-sm text-[#A3D9B1] font-mono text-xs mt-1.5 border border-[#2D2C28]">
                supabase/migrations/20261026000000_provider_directory.sql
              </code>
              This creates the tables, triggers, indexes, and sets up public read Row Level Security (RLS).
            </li>
            <li className="leading-relaxed">
              <strong className="text-white">Add Environment Variables:</strong> Copy{" "}
              <code className="text-[#A3D9B1] font-mono">.env.example</code> to{" "}
              <code className="text-[#A3D9B1] font-mono">.env.local</code> and populate:
              <div className="bg-[#0A0A09] p-2.5 rounded-sm text-[#D8D4C8] font-mono text-xs mt-1.5 border border-[#2D2C28] space-y-1">
                <div>NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co</div>
                <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...</div>
                <div className="text-[#8E8B82]"># SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi... (optional for admin scripts)</div>
              </div>
            </li>
            <li className="leading-relaxed">
              <strong className="text-white">Restart Development Server:</strong> Restart Next.js dev server (
              <code className="text-[#A3D9B1] font-mono">npm run dev</code>). The directory will connect automatically.
            </li>
          </ol>
        </div>
      )}
    </div>
  );
}
