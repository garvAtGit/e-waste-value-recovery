import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "neutral" | "emerald" | "amber" | "sky" | "slate" | "terracotta" | "copper";
  className?: string;
}

export function Badge({ children, variant = "neutral", className = "" }: BadgeProps) {
  const variantStyles = {
    neutral: "bg-[#EFECE2] text-[#413F3B] border-[#D4CDC0]",
    emerald: "bg-[#EBF2ED] text-[#1B3B2B] border-[#C3D9CB]",
    amber: "bg-[#FEF6E8] text-[#8C5209] border-[#F2D7A5]",
    sky: "bg-[#EDF5F7] text-[#18535E] border-[#C5DFE4]",
    slate: "bg-[#232321] text-[#F7F5EE] border-[#141413]",
    terracotta: "bg-[#FBECE6] text-[#A63C19] border-[#F2C2B2]",
    copper: "bg-[#E9F3F2] text-[#257A72] border-[#C1DFDC]",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-mono tracking-tight uppercase rounded-xs border transition-colors ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
