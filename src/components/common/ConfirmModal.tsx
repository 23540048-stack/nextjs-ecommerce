// src/components/common/ConfirmModal.tsx
"use client";

import React from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { AlertTriangle } from "lucide-react";

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  message?: string; // Alias tương thích
  confirmLabel?: string;
  confirmText?: string; // Alias tương thích
  cancelLabel?: string;
  cancelText?: string; // Alias tương thích
  isDangerous?: boolean;
  variant?: "danger" | "warning" | "info"; // Alias tương thích
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "CONFIRM ACTION",
  description,
  message,
  confirmLabel,
  confirmText,
  cancelLabel,
  cancelText,
  isDangerous,
  variant,
  isLoading = false,
}: ConfirmModalProps) {
  // Tự động đồng bộ các giá trị Alias
  const contentText = description || message || "";
  const finalConfirmLabel = confirmLabel || confirmText || "CONFIRM";
  const finalCancelLabel = cancelLabel || cancelText || "CANCEL";
  const finalIsDangerous = isDangerous ?? variant === "danger";

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="space-y-6">
        <div className="flex items-start gap-3.5 pt-2">
          <div
            className={`p-2 shrink-0 border ${
              finalIsDangerous
                ? "bg-red-700/10 text-red-700 border-red-700/30"
                : "bg-orange-500/10 text-orange-500 border-orange-500/30"
            }`}
          >
            <AlertTriangle size={20} />
          </div>
          <p className="font-mono text-xs text-brand-dark/80 leading-relaxed uppercase">
            {contentText}
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-dark/10 font-mono">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            {finalCancelLabel}
          </Button>

          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-all cursor-pointer ${
              finalIsDangerous
                ? "bg-red-700 hover:bg-red-800 active:scale-95"
                : "bg-orange-500 hover:bg-orange-600 active:scale-95"
            } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isLoading ? "PROCESSING..." : finalConfirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
