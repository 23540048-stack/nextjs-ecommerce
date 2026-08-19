"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "chakra" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: LucideIcon;
  children?: React.ReactNode;
}

export const Button = ({
  variant = "chakra",
  size = "md",
  icon: Icon,
  children,
  className = "",
  ...props
}: ButtonProps) => {
  const baseStyles =
    "relative inline-flex items-center justify-center gap-1.5 font-mono font-bold uppercase overflow-hidden transition-all duration-300 cursor-pointer disabled:opacity-50 select-none whitespace-nowrap";

  const sizes = {
    sm: "px-2.5 py-1.5 text-[10px] tracking-wider",
    md: "px-4 py-2 text-xs tracking-widest",
    lg: "px-6 py-3.5 text-sm font-bold",
  };

  const variants = {
    chakra:
      "bg-orange-500 border border-orange-500 text-white hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(34,211,238,0.7)] group/btn",
    outline:
      "bg-transparent border border-brand-dark text-brand-dark hover:border-orange-500 hover:text-orange-500",
    ghost: "bg-transparent text-brand-dark hover:text-orange-500",
    danger:
      "bg-rose-600 border border-brand-dark text-white hover:bg-rose-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px]",
  };

  return (
    <button
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {variant === "chakra" && (
        <span className="absolute inset-0 bg-cyan-500 -translate-x-full group-hover/btn:translate-x-0 transition-transform duration-300 ease-out"></span>
      )}

      {Icon && (
        <Icon
          size={size === "sm" ? 12 : 14}
          className="relative z-10 transition-transform duration-300 group-hover/btn:-rotate-12 shrink-0"
        />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  );
};

export default Button;
