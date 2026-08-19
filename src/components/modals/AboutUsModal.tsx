"use client";

import React, { useEffect } from "react";
import { X, ShieldCheck, Zap, Globe } from "lucide-react";

interface AboutUsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutUsModal({ isOpen, onClose }: AboutUsModalProps) {
  // Lock body scroll when modal is active
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      {/* Click backdrop to close */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-brand-ivory border border-brand-dark/20 p-6 sm:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto font-mono text-brand-dark">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-brand-dark hover:text-brand-primary transition-colors cursor-pointer"
          aria-label="Close Modal"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="border-b border-brand-dark/10 pb-4 mb-6">
          <span className="text-[10px] tracking-[0.3em] text-brand-dark/50 uppercase block mb-1">
            OUR STORY & MISSION
          </span>
          <h2 className="text-2xl sm:text-3xl font-heading tracking-wider uppercase text-brand-dark">
            ABOUT SHINOBI GOODS
          </h2>
        </div>

        {/* Main Content */}
        <div className="space-y-6 text-xs sm:text-sm leading-relaxed text-brand-dark/80">
          <p>
            <strong className="text-brand-dark">SHINOBI GOODS</strong> was
            founded with a mission to deliver exclusive ninja-inspired apparel,
            accessories, and tactical gear tailored for the modern era.
          </p>

          {/* Highlights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-2">
            <div className="p-4 bg-brand-dark/5 border border-brand-dark/10">
              <ShieldCheck size={22} className="text-orange-600 mb-2" />
              <h3 className="font-bold uppercase text-xs mb-1 text-brand-dark">
                PREMIUM QUALITY
              </h3>
              <p className="text-[11px] text-brand-dark/70 leading-normal">
                Meticulously engineered with superior durability for everyday
                endurance.
              </p>
            </div>

            <div className="p-4 bg-brand-dark/5 border border-brand-dark/10">
              <Zap size={22} className="text-orange-600 mb-2" />
              <h3 className="font-bold uppercase text-xs mb-1 text-brand-dark">
                EXCLUSIVE DESIGNS
              </h3>
              <p className="text-[11px] text-brand-dark/70 leading-normal">
                A seamless fusion of contemporary streetwear and legendary ninja
                aesthetics.
              </p>
            </div>

            <div className="p-4 bg-brand-dark/5 border border-brand-dark/10">
              <Globe size={22} className="text-orange-600 mb-2" />
              <h3 className="font-bold uppercase text-xs mb-1 text-brand-dark">
                GLOBAL DISPATCH
              </h3>
              <p className="text-[11px] text-brand-dark/70 leading-normal">
                Swift and reliable delivery across all hidden villages
                worldwide.
              </p>
            </div>
          </div>

          <p>
            Every item at Shinobi Goods is more than mere clothing—it is an
            expression of identity and unyielding resolve. Whether operating in
            the shadows or stepping into the light, our gear is crafted to
            accompany you on every mission.
          </p>
        </div>

        {/* Modal Footer */}
        <div className="mt-8 pt-4 border-t border-brand-dark/10 flex justify-between items-center text-[10px] tracking-widest text-brand-dark/50 uppercase">
          <span>EST. 2026 — SHINOBI GEAR</span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-brand-dark text-brand-ivory font-bold hover:bg-orange-500 transition-colors uppercase cursor-pointer"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
