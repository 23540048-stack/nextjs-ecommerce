"use client";

import React from "react";
import Modal from "@/components/ui/Modal";
import { RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";

interface ReturnsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReturnsModal({ isOpen, onClose }: ReturnsModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="RETURNS & EXCHANGES"
      maxWidth="md"
    >
      <div className="space-y-6 text-xs font-mono text-brand-dark">
        <div className="border-2 border-brand-dark p-4 bg-orange-500/10 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-start gap-3">
          <RefreshCw size={20} className="text-orange-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold uppercase">14-DAY HASSLE-FREE POLICY</h4>
            <p className="text-[11px] text-brand-dark/80 mt-1">
              You can exchange or return any unworn, unwashed merchandise within
              14 days of receiving your order.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-bold uppercase text-emerald-600 flex items-center gap-1.5">
            <CheckCircle2 size={14} /> ELIGIBLE FOR RETURN
          </h4>
          <ul className="list-disc list-inside space-y-1 text-brand-dark/80 pl-1">
            <li>Original tags and ninja seal intact.</li>
            <li>Items in original packaging (unopened figures/replicas).</li>
            <li>Defective or wrong items sent by Shinobi HQ.</li>
          </ul>
        </div>

        <div className="space-y-2 border-t border-brand-dark/15 pt-4">
          <h4 className="font-bold uppercase text-rose-600 flex items-center gap-1.5">
            <AlertCircle size={14} /> NON-RETURNABLE ITEMS
          </h4>
          <ul className="list-disc list-inside space-y-1 text-brand-dark/80 pl-1">
            <li>Limited Drop items with custom serialization.</li>
            <li>Clearance or final flash sale items.</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
}
