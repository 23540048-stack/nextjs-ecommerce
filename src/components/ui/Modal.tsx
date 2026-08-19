"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "md",
}: ModalProps) {
  // Khóa cuộn trang (scroll) khi Modal đang mở
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Đóng Modal khi bấm phím ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Phông nền mờ (Backdrop) */}
      <div
        className="fixed inset-0 bg-brand-dark/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Khung nội dung chính */}
      <div
        className={`relative w-full ${maxWidthClasses[maxWidth]} max-h-[90vh] flex flex-col bg-brand-ivory text-brand-dark border border-brand-dark/20 p-6 shadow-2xl z-10 transition-all`}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 mb-4 border-b border-brand-dark/15 font-mono shrink-0 gap-3">
          {title && (
            <h3 className="text-base sm:text-lg font-bold tracking-wider uppercase text-brand-dark break-words leading-snug flex-1">
              [ {title} ]
            </h3>
          )}
          <button
            onClick={onClose}
            className="p-1 text-brand-dark/60 hover:text-orange-500 transition-colors cursor-pointer shrink-0 -mt-0.5"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto pr-1">{children}</div>
      </div>
    </div>
  );
}
