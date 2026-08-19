// src/components/modals/SizeGuideModal.tsx
"use client";

import React, { useState } from "react";
import Modal from "@/components/ui/Modal";
import { Ruler, ShieldAlert, Check } from "lucide-react";

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "tops" | "bottoms" | "footwear";

const SIZE_CHARTS = {
  tops: [
    {
      size: "S",
      chest: "86 - 91",
      length: "68",
      shoulder: "42",
      height: "155 - 165 cm",
      weight: "45 - 55 kg",
    },
    {
      size: "M",
      chest: "92 - 97",
      length: "70",
      shoulder: "44",
      height: "160 - 172 cm",
      weight: "55 - 65 kg",
    },
    {
      size: "L",
      chest: "98 - 103",
      length: "72",
      shoulder: "46",
      height: "170 - 180 cm",
      weight: "65 - 75 kg",
    },
    {
      size: "XL",
      chest: "104 - 109",
      length: "74",
      shoulder: "48",
      height: "175 - 185 cm",
      weight: "75 - 85 kg",
    },
    {
      size: "2XL",
      chest: "110 - 116",
      length: "76",
      shoulder: "50",
      height: "180 - 190 cm",
      weight: "85 - 95 kg",
    },
  ],
  bottoms: [
    {
      size: "S (28-29)",
      waist: "71 - 74",
      hips: "88 - 91",
      length: "98",
      height: "155 - 165 cm",
    },
    {
      size: "M (30-31)",
      waist: "75 - 79",
      hips: "92 - 95",
      length: "100",
      height: "160 - 172 cm",
    },
    {
      size: "L (32-33)",
      waist: "80 - 84",
      hips: "96 - 99",
      length: "102",
      height: "170 - 180 cm",
    },
    {
      size: "XL (34-35)",
      waist: "85 - 89",
      hips: "100 - 104",
      length: "104",
      height: "175 - 185 cm",
    },
    {
      size: "2XL (36)",
      waist: "90 - 95",
      hips: "105 - 109",
      length: "106",
      height: "180 - 190 cm",
    },
  ],
  footwear: [
    { us: "7", eu: "40", cm: "25.0", jp: "250" },
    { us: "8", eu: "41", cm: "26.0", jp: "260" },
    { us: "8.5", eu: "42", cm: "26.5", jp: "265" },
    { us: "9.5", eu: "43", cm: "27.5", jp: "275" },
    { us: "10", eu: "44", cm: "28.0", jp: "280" },
  ],
};

export default function SizeGuideModal({
  isOpen,
  onClose,
}: SizeGuideModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("tops");

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="SHINOBI SIZE GUIDE"
      maxWidth="lg"
    >
      <div className="space-y-6 text-xs font-mono text-brand-dark">
        {/* TAB NAVIGATION */}
        <div className="flex border-2 border-brand-dark bg-brand-dark/5 p-1 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("tops")}
            className={`flex-1 py-2 font-bold uppercase transition-all cursor-pointer ${
              activeTab === "tops"
                ? "bg-brand-dark text-white shadow-[2px_2px_0px_0px_rgba(234,88,12,1)]"
                : "hover:bg-brand-dark/10 text-brand-dark"
            }`}
          >
            TOPS & HOODIES
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("bottoms")}
            className={`flex-1 py-2 font-bold uppercase transition-all cursor-pointer ${
              activeTab === "bottoms"
                ? "bg-brand-dark text-white shadow-[2px_2px_0px_0px_rgba(234,88,12,1)]"
                : "hover:bg-brand-dark/10 text-brand-dark"
            }`}
          >
            PANTS & SHORTS
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("footwear")}
            className={`flex-1 py-2 font-bold uppercase transition-all cursor-pointer ${
              activeTab === "footwear"
                ? "bg-brand-dark text-white shadow-[2px_2px_0px_0px_rgba(234,88,12,1)]"
                : "hover:bg-brand-dark/10 text-brand-dark"
            }`}
          >
            NINJA FOOTWEAR
          </button>
        </div>

        {/* SIZE TABLES */}
        <div className="border-2 border-brand-dark overflow-x-auto bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          {activeTab === "tops" && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-brand-dark text-white uppercase text-[11px] border-b-2 border-brand-dark">
                  <th className="py-2.5 px-3">SIZE</th>
                  <th className="py-2.5 px-3">CHEST (CM)</th>
                  <th className="py-2.5 px-3">LENGTH (CM)</th>
                  <th className="py-2.5 px-3">SHOULDER (CM)</th>
                  <th className="py-2.5 px-3">HEIGHT</th>
                  <th className="py-2.5 px-3">WEIGHT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-dark/15 font-bold">
                {SIZE_CHARTS.tops.map((row) => (
                  <tr
                    key={row.size}
                    className="hover:bg-orange-500/10 transition-colors"
                  >
                    <td className="py-2.5 px-3 text-orange-600 font-extrabold">
                      {row.size}
                    </td>
                    <td className="py-2.5 px-3">{row.chest}</td>
                    <td className="py-2.5 px-3">{row.length}</td>
                    <td className="py-2.5 px-3">{row.shoulder}</td>
                    <td className="py-2.5 px-3 text-brand-dark/70">
                      {row.height}
                    </td>
                    <td className="py-2.5 px-3 text-brand-dark/70">
                      {row.weight}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === "bottoms" && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-brand-dark text-white uppercase text-[11px] border-b-2 border-brand-dark">
                  <th className="py-2.5 px-3">SIZE</th>
                  <th className="py-2.5 px-3">WAIST (CM)</th>
                  <th className="py-2.5 px-3">HIPS (CM)</th>
                  <th className="py-2.5 px-3">LENGTH (CM)</th>
                  <th className="py-2.5 px-3">HEIGHT FIT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-dark/15 font-bold">
                {SIZE_CHARTS.bottoms.map((row) => (
                  <tr
                    key={row.size}
                    className="hover:bg-orange-500/10 transition-colors"
                  >
                    <td className="py-2.5 px-3 text-orange-600 font-extrabold">
                      {row.size}
                    </td>
                    <td className="py-2.5 px-3">{row.waist}</td>
                    <td className="py-2.5 px-3">{row.hips}</td>
                    <td className="py-2.5 px-3">{row.length}</td>
                    <td className="py-2.5 px-3 text-brand-dark/70">
                      {row.height}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === "footwear" && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-brand-dark text-white uppercase text-[11px] border-b-2 border-brand-dark">
                  <th className="py-2.5 px-3">US SIZE</th>
                  <th className="py-2.5 px-3">EU SIZE</th>
                  <th className="py-2.5 px-3">FOOT LENGTH (CM)</th>
                  <th className="py-2.5 px-3">JP (MM)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-dark/15 font-bold">
                {SIZE_CHARTS.footwear.map((row) => (
                  <tr
                    key={row.us}
                    className="hover:bg-orange-500/10 transition-colors"
                  >
                    <td className="py-2.5 px-3 text-orange-600 font-extrabold">
                      US {row.us}
                    </td>
                    <td className="py-2.5 px-3">EU {row.eu}</td>
                    <td className="py-2.5 px-3">{row.cm} cm</td>
                    <td className="py-2.5 px-3 text-brand-dark/70">{row.jp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* MEASUREMENT TIPS */}
        <div className="border-2 border-brand-dark p-4 bg-brand-ivory/30 space-y-2">
          <h4 className="font-bold uppercase flex items-center gap-2 text-orange-600">
            <Ruler size={16} /> HOW TO MEASURE YOUR CHAKRA FRAME
          </h4>
          <ul className="space-y-1.5 text-[11px] text-brand-dark/80">
            <li className="flex items-start gap-1.5">
              <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Chest:</strong> Measure around the fullest part of your
                chest, keeping the tape horizontal.
              </span>
            </li>
            <li className="flex items-start gap-1.5">
              <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Waist:</strong> Measure around narrowest waistline
                (typically where your body bends side to side).
              </span>
            </li>
          </ul>
        </div>

        {/* OVERSIZED FIT NOTE */}
        <div className="flex items-start gap-2 border-l-4 border-amber-500 bg-amber-500/10 p-3 text-[11px]">
          <ShieldAlert size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-brand-dark/90">
            <strong>PRO TIP:</strong> Most Shinobi streetwear apparel features
            an <strong>Oversized / Drop-Shoulder Fit</strong>. If you prefer a
            tailored fit, we recommend ordering 1 size down.
          </p>
        </div>
      </div>
    </Modal>
  );
}
