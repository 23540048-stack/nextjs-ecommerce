"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { Home, ArrowLeft, Search, TreeDeciduous } from "lucide-react";

export default function NotFound() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-brand-ivory/30 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-mono text-brand-dark relative overflow-hidden">
      {/* NỀN HỌA TIẾT MANGA DIAGONAL LINES */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] bg-size-[16px_16px] pointer-events-none" />

      <div className="max-w-2xl w-full space-y-8 text-center relative z-10">
        {/* KHU VỰC HIỆU ỨNG THẾ THÂN (KAWARIMI GRAPHIC) */}
        <div className="relative inline-block">
          {/* BADGE SOUND EFFECT */}
          <span className="absolute -top-4 -right-6 z-20 bg-orange-600 text-white text-[11px] font-heading font-bold px-3 py-1 tracking-widest uppercase rotate-12 shadow-md border border-black animate-bounce">
            *POOF!*
          </span>

          {/* KHUNG HIỂN THỊ CON SỐ 404 */}
          <div className="bg-white border-2 border-brand-dark p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group">
            <div className="flex items-center justify-center gap-4 text-brand-dark">
              <span className="font-heading text-7xl sm:text-8xl tracking-wider select-none">
                4
              </span>

              {/* ICON KHÚC GỖ THẾ THÂN */}
              <div className="p-4 bg-orange-500/10 border-2 border-dashed border-orange-500 text-orange-600 rounded-none group-hover:rotate-12 transition-transform duration-300">
                <TreeDeciduous size={56} className="sm:w-16 sm:h-16" />
              </div>

              <span className="font-heading text-7xl sm:text-8xl tracking-wider select-none">
                4
              </span>
            </div>

            <span className="text-[10px] tracking-[0.3em] font-bold text-orange-600 uppercase block mt-3">
              KAWARIMI NO JUTSU ACTIVATED
            </span>
          </div>
        </div>

        {/* TIÊU ĐỀ & MÔ TẢ LỖI */}
        <div className="space-y-3">
          <h1 className="font-heading text-2xl sm:text-3xl tracking-wider uppercase text-brand-dark">
            LOST IN GENJUTSU OR SCROLL DESTROYED!
          </h1>
          <p className="text-xs text-brand-dark/70 font-sans max-w-md mx-auto leading-relaxed">
            The page or scroll you are looking for has substituted itself with a
            wood log or was stolen by rogue ninjas. Verify the scroll URL or
            navigate back to safety.
          </p>
        </div>

        {/* Ô TÌM KIẾM NHANH */}
        <form onSubmit={handleSearch} className="max-w-md mx-auto">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Search for gear, kunai, or scrolls..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-brand-dark/30 py-3 pl-4 pr-12 text-xs font-mono focus:outline-hidden focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            />
            <button
              type="submit"
              className="absolute right-1 p-2 bg-brand-dark text-brand-ivory hover:bg-orange-600 transition-colors cursor-pointer"
              title="Search"
            >
              <Search size={16} />
            </button>
          </div>
        </form>

        {/* CÁC NÚT ĐIỀU HƯỚNG CHÍNH */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            variant="outline"
            size="md"
            icon={ArrowLeft}
            onClick={() => router.back()}
            className="w-full sm:w-auto justify-center"
          >
            RETREAT TO PREVIOUS PAGE
          </Button>

          <Link href="/" className="w-full sm:w-auto">
            <Button
              variant="chakra"
              size="md"
              icon={Home}
              className="w-full justify-center"
            >
              RETURN TO LEAF VILLAGE
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
