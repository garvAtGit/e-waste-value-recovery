import React from "react";
import Link from "next/link";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "accent";
  size?: "sm" | "md" | "lg";
  href?: string;
  className?: string;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  href,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:translate-y-px tracking-tight";

  const sizeStyles = {
    sm: "text-xs px-3 py-1.5 gap-1.5 rounded-sm",
    md: "text-xs sm:text-sm px-4 py-2 gap-2 rounded-sm",
    lg: "text-sm sm:text-base px-6 py-3 gap-2.5 rounded-sm font-semibold",
  };

  const variantStyles = {
    primary:
      "bg-[#1B3B2B] hover:bg-[#142D21] text-[#F7F5EE] border border-[#142D21] focus-visible:ring-[#1B3B2B] shadow-xs",
    accent:
      "bg-[#C8532C] hover:bg-[#B34520] text-[#F7F5EE] border border-[#A63C19] focus-visible:ring-[#C8532C] shadow-xs",
    secondary:
      "bg-[#232321] hover:bg-[#141413] text-[#F7F5EE] border border-[#141413] focus-visible:ring-[#232321]",
    outline:
      "bg-[#FAF8F3] hover:bg-[#EFECE2] text-[#141413] border border-[#D4CDC0] hover:border-[#BDB5A4] focus-visible:ring-[#1B3B2B]",
    ghost:
      "bg-transparent hover:bg-[#EFECE2] text-[#383632] hover:text-[#141413] focus-visible:ring-[#1B3B2B]",
  };

  const combinedClasses = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={combinedClasses}>
        {children}
      </Link>
    );
  }

  return (
    <button className={combinedClasses} {...props}>
      {children}
    </button>
  );
}
