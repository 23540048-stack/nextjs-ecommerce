"use client";

import React from "react";
import Modal from "@/components/ui/Modal";
import { Lock } from "lucide-react";

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="PRIVACY POLICY"
      maxWidth="md"
    >
      <div className="space-y-4 text-xs font-mono text-brand-dark leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
        <div className="flex items-center gap-2 font-bold uppercase text-orange-600">
          <Lock size={16} /> DATA PROTECTION & NINJA SECRECY
        </div>

        <p>
          At Shinobi Goods, we protect your personal scroll data with the
          highest level of sealing jutsu. We never trade, sell, or leak your
          identity to rogue factions.
        </p>

        <h4 className="font-bold uppercase text-brand-dark pt-2 border-t border-brand-dark/15">
          1. INFORMATION WE COLLECT
        </h4>
        <p>
          We collect essential details for delivery dispatch: name, shipping
          scroll address, email for tracking summons, and order logs.
        </p>

        <h4 className="font-bold uppercase text-brand-dark pt-2 border-t border-brand-dark/15">
          2. PAYMENT SECURITY
        </h4>
        <p>
          Payment info is processed via encrypted payment portals. Shinobi Goods
          never stores credit card details directly on Leaf Village servers.
        </p>
      </div>
    </Modal>
  );
}
