"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

// 1. Định nghĩa Sub-interface cho từng item media
export interface MediaItem {
  type: "image" | "video";
  url: string;
  caption?: string;
}

// 2. Interface Banner hỗ trợ cả cấu trúc mảng items MỚI và field đơn CŨ
export interface Banner {
  _id: string;
  title: string;
  location?: string;
  items?: MediaItem[]; // 🚀 Cấu trúc mới hỗ trợ upload nhiều ảnh/video
  mediaType?: "image" | "video"; // Fallback dữ liệu cũ
  mediaUrl?: string; // Fallback dữ liệu cũ
  linkUrl: string;
  status?: string;
}

interface HeroProps {
  banners?: Banner[];
  loading?: boolean;
  onBannerClick?: (bannerId: string, linkUrl: string) => void;
}

export default function Hero({
  banners: initialBanners,
  loading: initialLoading,
  onBannerClick,
}: HeroProps) {
  const [banners, setBanners] = useState<Banner[]>(initialBanners || []);
  const [loading, setLoading] = useState<boolean>(
    initialLoading !== undefined ? initialLoading : !initialBanners,
  );

  // Quản lý Index của Banner hiện tại và Media Item hiện tại (Slide con)
  const [currentBannerIdx, setCurrentBannerIdx] = useState(0);
  const [currentMediaIdx, setCurrentMediaIdx] = useState(0);

  // Fetch Banners từ Backend
  useEffect(() => {
    if (initialBanners && initialBanners.length > 0) {
      const filtered = initialBanners.filter(
        (b) =>
          (!b.location || b.location === "HOME_HERO") &&
          (b.status === "active" || !b.status),
      );
      setBanners(filtered);
      setLoading(false);
      return;
    }

    const fetchHeroBanners = async () => {
      try {
        setLoading(true);
        const res = await api.get("/banners?location=HOME_HERO");
        const list: Banner[] = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
            ? res.data.data
            : [];

        const activeHeroBanners = list.filter((b) => {
          const isHomeHero = !b.location || b.location === "HOME_HERO";
          const isActive = b.status === "active" || !b.status;
          return isHomeHero && isActive;
        });

        setBanners(activeHeroBanners);
      } catch (err) {
        console.error("Lỗi khi tải Hero Banners:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHeroBanners();
  }, [initialBanners]);

  // Lấy ra Banner hiện tại
  const currentBanner = banners[currentBannerIdx];

  // Chuẩn hóa danh sách Media (Convert dữ liệu cũ sang định dạng mảng thống nhất)
  const mediaList: MediaItem[] = useMemo(() => {
    if (!currentBanner) return [];

    // Nếu dùng cấu trúc MỚI (mảng items)
    if (currentBanner.items && currentBanner.items.length > 0) {
      return currentBanner.items;
    }

    // Nếu dùng cấu trúc CŨ (1 url duy nhất)
    if (currentBanner.mediaUrl) {
      return [
        {
          type: currentBanner.mediaType || "image",
          url: currentBanner.mediaUrl,
        },
      ];
    }

    return [];
  }, [currentBanner]);

  // Tự động chuyển Slide Media mỗi 4 giây
  useEffect(() => {
    if (mediaList.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentMediaIdx((prev) => (prev + 1) % mediaList.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [mediaList]);

  // Reset về hình đầu tiên khi chuyển sang Banner/Campaign khác
  useEffect(() => {
    setCurrentMediaIdx(0);
  }, [currentBannerIdx]);

  // Điều hướng Slide Media
  const handlePrevMedia = () => {
    setCurrentMediaIdx((prev) =>
      prev === 0 ? mediaList.length - 1 : prev - 1,
    );
  };

  const handleNextMedia = () => {
    setCurrentMediaIdx((prev) => (prev + 1) % mediaList.length);
  };

  const handleCTAButtonClick = () => {
    if (onBannerClick && currentBanner) {
      onBannerClick(currentBanner._id, currentBanner.linkUrl);
    } else if (currentBanner?.linkUrl) {
      window.location.href = currentBanner.linkUrl;
    }
  };

  // 1. MÀN HÌNH LOADING HOẶC KHÔNG CÓ BANNER
  if (loading || !banners || banners.length === 0 || mediaList.length === 0) {
    return (
      <section className="relative min-h-[85vh] flex items-center justify-center bg-brand-dark text-brand-ivory overflow-hidden px-6">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1600')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/60 to-brand-dark" />

        <div className="relative z-10 max-w-4xl text-center space-y-6 pt-12">
          {loading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
          ) : (
            <>
              <h1 className="text-6xl sm:text-8xl md:text-9xl font-heading tracking-wider uppercase leading-none">
                THE WILL OF FIRE
              </h1>
              <p className="max-w-md mx-auto text-sm sm:text-base text-brand-ivory/80 font-sans tracking-wide">
                Carry the spirit of the Hidden Leaf.
              </p>
              <div className="pt-4">
                <Link
                  href="/shop"
                  className="group relative inline-flex items-center gap-3 overflow-hidden border-2 border-orange-500 bg-orange-500 px-8 py-4 font-heading text-xl tracking-[0.2em] text-white uppercase transition-all duration-300 hover:bg-brand-dark hover:text-orange-500 hover:shadow-[0_0_25px_rgba(234,88,12,0.6)] shrink-0"
                >
                  <span className="relative z-10 font-bold">
                    SUMMON YOUR GEAR
                  </span>
                  <ArrowRight size={22} className="relative z-10" />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    );
  }

  const currentMedia = mediaList[currentMediaIdx];

  // 2. MÀN HÌNH HIỂN THỊ BANNER VÀ MULTI-MEDIA SLIDER
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center bg-brand-dark text-brand-ivory overflow-hidden px-6">
      {/* 🖼️ BACKGROUND MEDIA (IMAGE / VIDEO) */}
      <div className="absolute inset-0 transition-all duration-1000 ease-in-out">
        {currentMedia.type === "video" ? (
          <video
            key={currentMedia.url}
            src={currentMedia.url}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-40 mix-blend-luminosity"
          />
        ) : (
          <div
            key={currentMedia.url}
            className="w-full h-full bg-cover bg-center opacity-35 mix-blend-luminosity transition-all duration-700 ease-out"
            style={{ backgroundImage: `url('${currentMedia.url}')` }}
          />
        )}
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/60 to-brand-dark" />

      {/* 📝 BANNER TEXT CONTENT */}
      <div className="relative z-10 max-w-4xl text-center space-y-6 pt-12">
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-heading tracking-wider uppercase leading-tight line-clamp-2">
          {currentBanner.title}
        </h1>

        {/* Hiển thị caption phụ của từng ảnh/video nếu có */}
        {currentMedia.caption ? (
          <p className="max-w-md mx-auto text-sm sm:text-base text-orange-400 font-sans tracking-wide">
            {currentMedia.caption}
          </p>
        ) : (
          <p className="max-w-md mx-auto text-sm sm:text-base text-brand-ivory/80 font-sans tracking-wide">
            Carry the spirit of the Hidden Leaf.
          </p>
        )}

        <div className="pt-4">
          <button
            onClick={handleCTAButtonClick}
            className="group relative inline-flex items-center gap-3 overflow-hidden border-2 border-orange-500 bg-orange-500 px-8 py-4 font-heading text-xl tracking-[0.2em] text-white uppercase transition-all duration-300 hover:bg-brand-dark hover:text-orange-500 hover:shadow-[0_0_25px_rgba(234,88,12,0.6)] shrink-0 cursor-pointer"
          >
            <span className="relative z-10 font-bold">SUMMON YOUR GEAR</span>
            <ArrowRight
              size={22}
              className="relative z-10 transition-transform duration-300 group-hover:translate-x-2"
            />
          </button>
        </div>

        <div className="pt-12">
          <span className="text-6xl sm:text-8xl font-heading tracking-[0.3em] text-brand-ivory/5 uppercase select-none block">
            NARUTO
          </span>
        </div>
      </div>

      {/* 🏹 NÚT ĐIỀU HƯỚNG & DOTS CHO MEDIA SLIDE (Ảnh/Video chạy qua lại) */}
      {mediaList.length > 1 && (
        <>
          <button
            onClick={handlePrevMedia}
            className="absolute left-6 top-1/2 -translate-y-1/2 p-3 border border-brand-ivory/20 bg-brand-dark/80 text-brand-ivory hover:border-orange-500 hover:text-orange-500 transition-all z-20 cursor-pointer"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={handleNextMedia}
            className="absolute right-6 top-1/2 -translate-y-1/2 p-3 border border-brand-ivory/20 bg-brand-dark/80 text-brand-ivory hover:border-orange-500 hover:text-orange-500 transition-all z-20 cursor-pointer"
          >
            <ChevronRight size={24} />
          </button>

          {/* Thanh chấm tròn indicator cho Media */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
            {mediaList.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentMediaIdx(idx)}
                className={`h-1.5 transition-all cursor-pointer ${
                  idx === currentMediaIdx
                    ? "w-8 bg-orange-500"
                    : "w-2 bg-brand-ivory/30 hover:bg-brand-ivory/60"
                }`}
              />
            ))}
          </div>
        </>
      )}

      {/* 🔀 NẾU CÓ NHIỀU BANNER KHÁC NHAU: Hiển thị bộ chuyển Banner ở góc trên bên phải */}
      {banners.length > 1 && (
        <div className="absolute top-6 right-6 z-20 flex gap-2">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentBannerIdx(idx)}
              className={`px-3 py-1 text-xs font-bold border transition-all ${
                idx === currentBannerIdx
                  ? "border-orange-500 bg-orange-500 text-white"
                  : "border-brand-ivory/20 bg-brand-dark/80 text-brand-ivory/60"
              }`}
            >
              CAMPAIGN #{idx + 1}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
