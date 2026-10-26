import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "neutral" | "emerald" | "amber" | "sky" | "slate";
  className?: string;
}

export function Badge({ children, variant = "neutral", className = "" }: BadgeProps) {
  const variantStyles = {
    neutral: "bg-slate-100 text-slate-700 border-slate-200",
    emerald: "bg-emerald-50 text-emerald-800 border-emerald-200",
    amber: "bg-amber-50 text-amber-800 border-amber-200",
    sky: "bg-sky-50 text-sky-800 border-sky-200",
    slate: "bg-slate-900 text-slate-100 border-slate-800",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border transition-colors ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
