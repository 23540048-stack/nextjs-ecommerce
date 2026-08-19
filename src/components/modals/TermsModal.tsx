"use client";

import React from "react";
import Modal from "@/components/ui/Modal";
import { FileText } from "lucide-react";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TermsModal({ isOpen, onClose }: TermsModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="TERMS OF SERVICE"
      maxWidth="md"
    >
      <div className="space-y-4 text-xs font-mono text-brand-dark leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
        <div className="flex items-center gap-2 font-bold uppercase text-orange-600">
          <FileText size={16} /> CODE OF THE LEAF VILLAGE
        </div>

        <p>
          By placing an order on Shinobi Goods, you agree to adhere to the
          Shinobi Code and the commercial regulations established by
          Konohagakure.
        </p>

        <h4 className="font-bold uppercase text-brand-dark pt-2 border-t border-brand-dark/15">
          1. LIMITED DROPS & ORDER LIMITS
        </h4>
        <p>
          To ensure fairness among clan members, limited gear items are capped
          per shinobi account. Bot summons and scalp orders will be neutralized
          immediately.
        </p>

        <h4 className="font-bold uppercase text-brand-dark pt-2 border-t border-brand-dark/15">
          2. INTELLECTUAL PROPERTY
        </h4>
        <p>
          All logos, custom anime artwork, and gear designs are officially
          licensed or proprietary property of Shinobi Goods.
        </p>
      </div>
    </Modal>
  );
}
