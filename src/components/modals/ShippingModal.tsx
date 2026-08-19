"use client";

import React from "react";
import Modal from "@/components/ui/Modal";
import { Truck, Clock, ShieldCheck, Globe } from "lucide-react";

interface ShippingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ShippingModal({ isOpen, onClose }: ShippingModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="SHIPPING & DELIVERY"
      maxWidth="md"
    >
      <div className="space-y-6 text-xs font-mono text-brand-dark">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="border-2 border-brand-dark p-3 bg-brand-ivory/20 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-2 font-bold uppercase text-orange-600 mb-1">
              <Truck size={16} /> STANDARD SHIPPING
            </div>
            <p className="text-[11px] text-brand-dark/80">
              3 - 5 Business Days
            </p>
            <p className="font-bold mt-2"> $30 (Free for &gt; $500)</p>
          </div>

          <div className="border-2 border-brand-dark p-3 bg-brand-ivory/20 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-2 font-bold uppercase text-orange-600 mb-1">
              <Clock size={16} /> EXPRESS ANBU DASH
            </div>
            <p className="text-[11px] text-brand-dark/80">
              1 - 2 Business Days
            </p>
            <p className="font-bold mt-2"> $60 </p>
          </div>
        </div>

        <div className="space-y-3 border-t border-brand-dark/15 pt-4">
          <h4 className="font-bold uppercase flex items-center gap-2">
            <Globe size={14} className="text-orange-600" /> INTERNATIONAL
            SHIPPING
          </h4>
          <p className="leading-relaxed text-brand-dark/80">
            We deliver Leaf Village merchandise worldwide via DHL Express.
            Delivery times vary between 7–14 days depending on destination
            customs.
          </p>
        </div>

        <div className="space-y-2 border-t border-brand-dark/15 pt-4">
          <h4 className="font-bold uppercase flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-600" /> DISPATCH
            GUARANTEE
          </h4>
          <p className="leading-relaxed text-brand-dark/80">
            All items are inspected and packed securely with protective seal
            scrolls before leaving Konoha HQ.
          </p>
        </div>
      </div>
    </Modal>
  );
}
