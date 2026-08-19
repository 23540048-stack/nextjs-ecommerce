import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "new" | "limited" | "orange" | "outline" | "danger";
  size?: "sm" | "md";
  children: React.ReactNode;
}

export default function Badge({
  variant = "default",
  size = "md",
  className = "",
  children,
  ...props
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-mono font-bold tracking-widest uppercase transition-colors shrink-0";

  const variantStyles = {
    default: "bg-brand-dark text-white",
    new: "bg-brand-dark text-white",
    limited: "bg-red-700 text-white",
    orange: "bg-orange-500 text-white shadow-[0_0_8px_rgba(249,115,22,0.4)]",
    outline: "border border-brand-dark/30 text-brand-dark bg-transparent",
    danger: "bg-rose-600 text-white",
  };

  const sizeStyles = {
    sm: "text-[10px] px-2 py-0.5",
    md: "text-xs px-3 py-1.5",
  };

  return (
    <span
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
