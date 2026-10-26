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
    <div className="bg-slate-900 text-slate-200 rounded-2xl p-6 sm:p-7 border border-slate-800 shadow-sm mb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800/80 flex items-center justify-center shrink-0 mt-0.5">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                {isConfigured ? "Demo Fixtures Active" : "Local Demonstration Mode"}
              </span>
              <span className="text-xs text-slate-400">
                {!isConfigured ? "Supabase credentials not yet configured" : "Sample records loaded"}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {!isConfigured
                ? "Provider directory is operating in zero-crash demonstration mode"
                : "Testing with clearly labelled demonstration records"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              The directory is rendering strictly labelled sample records so you can test filtering,
              responsiveness, and evidence verification without requiring live database keys.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-slate-800/80 hover:bg-slate-800 px-3.5 py-2 rounded-lg border border-slate-700 transition-colors shrink-0"
        >
          <span>{isExpanded ? "Hide Database Setup Guide" : "View Supabase Setup Guide"}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-6 pt-6 border-t border-slate-800 space-y-4 text-xs sm:text-sm text-slate-300">
          <h4 className="font-semibold text-white uppercase tracking-wider text-xs flex items-center gap-2">
            <FileCode className="w-4 h-4 text-emerald-400" />
            Instructions to Connect Live Supabase PostgreSQL:
          </h4>

          <ol className="space-y-3 list-decimal list-inside text-slate-300">
            <li className="leading-relaxed">
              <strong className="text-white">Create a Supabase Project:</strong> Visit{" "}
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:underline"
              >
                supabase.com
              </a>{" "}
              and create a new PostgreSQL project.
            </li>
            <li className="leading-relaxed">
              <strong className="text-white">Apply SQL Migration:</strong> In your Supabase dashboard,
              open the <em>SQL Editor</em> and execute the migration file located at:
              <code className="block bg-slate-950 p-2.5 rounded-md text-emerald-300 font-mono text-xs mt-1.5 border border-slate-800">
                supabase/migrations/20261026000000_provider_directory.sql
              </code>
              This creates the tables, triggers, indexes, and sets up public read Row Level Security (RLS).
            </li>
            <li className="leading-relaxed">
              <strong className="text-white">Add Environment Variables:</strong> Copy{" "}
              <code className="text-emerald-300 font-mono">.env.example</code> to{" "}
              <code className="text-emerald-300 font-mono">.env.local</code> and populate:
              <div className="bg-slate-950 p-2.5 rounded-md text-slate-300 font-mono text-xs mt-1.5 border border-slate-800 space-y-1">
                <div>NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co</div>
                <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...</div>
                <div className="text-slate-500"># SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi... (optional for admin scripts)</div>
              </div>
            </li>
            <li className="leading-relaxed">
              <strong className="text-white">Restart Development Server:</strong> Restart Next.js dev server (
              <code className="text-emerald-300 font-mono">npm run dev</code>). The directory will
              automatically transition to querying your live database.
            </li>
          </ol>
        </div>
      )}
    </div>
  );
}
