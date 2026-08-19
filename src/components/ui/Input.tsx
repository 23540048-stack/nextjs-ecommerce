"use client";

import React, { forwardRef, InputHTMLAttributes } from "react";
import { LucideIcon } from "lucide-react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon: Icon, className = "", value, ...props }, ref) => {
    return (
      <div className="w-full font-mono text-xs">
        {label && (
          <label className="block mb-2 font-bold text-brand-dark uppercase tracking-wider">
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {Icon && (
            <div className="absolute left-3 text-brand-dark/50 pointer-events-none">
              <Icon size={16} />
            </div>
          )}

          <input
            ref={ref}
            // 💡 GIẢI PHÁP: Nếu value bị undefined hoặc null, tự động đưa về ""
            value={value ?? ""}
            className={`w-full bg-brand-ivory text-brand-dark border border-brand-dark/20 py-2.5 ${
              Icon ? "pl-9" : "px-3"
            } pr-3 font-mono text-xs outline-none transition-all placeholder:text-brand-dark/40 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed ${
              error
                ? "border-red-600 focus:border-red-600 focus:ring-red-600"
                : ""
            } ${className}`}
            {...props}
          />
        </div>

        {error && (
          <p className="mt-1 text-[10px] text-red-600 font-bold uppercase tracking-wider">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
