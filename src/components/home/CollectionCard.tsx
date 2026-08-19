"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";

export interface Category {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  hoverColor?: string;
  borderColor?: string;
  hexColor?: string;
}

const FALLBACK_BORDER_COLORS = [
  "hover:border-brand-primary",
  "hover:border-brand-danger",
  "hover:border-brand-sage",
  "hover:border-brand-navy",
];

const FALLBACK_TEXT_COLORS = [
  "group-hover:text-brand-primary",
  "group-hover:text-brand-danger",
  "group-hover:text-brand-sage",
  "group-hover:text-brand-navy",
];

export default function CollectionSection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await api.get("/categories");
        const list = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
            ? res.data.data
            : [];
        setCategories(list);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const getHoverTextColorClass = (col: Category, index: number) => {
    if (!col.hoverColor)
      return FALLBACK_TEXT_COLORS[index % FALLBACK_TEXT_COLORS.length];
    if (
      !col.hoverColor.includes("group-hover:") &&
      !col.hoverColor.includes("text-")
    ) {
      return `group-hover:text-${col.hoverColor}`;
    }
    if (!col.hoverColor.includes("group-hover:")) {
      return `group-hover:${col.hoverColor}`;
    }
    return col.hoverColor;
  };

  const getHoverBorderColorClass = (col: Category, index: number) => {
    if (col.borderColor) {
      return col.borderColor.includes("hover:")
        ? col.borderColor
        : `hover:${col.borderColor}`;
    }
    if (col.hoverColor) {
      const cleanColor = col.hoverColor
        .replace("group-hover:text-", "")
        .replace("text-", "");
      return `hover:border-${cleanColor}`;
    }
    return FALLBACK_BORDER_COLORS[index % FALLBACK_BORDER_COLORS.length];
  };

  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <div className="mb-10 text-center">
        <span className="text-[10px] tracking-[0.3em] font-semibold text-brand-dark/40 uppercase font-sans">
          01 / ARCHIVE
        </span>
        <h2 className="text-4xl sm:text-5xl font-heading tracking-widest uppercase mt-1 text-brand-dark">
          SHOP BY COLLECTION
        </h2>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
        </div>
      ) : categories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {categories.map((col, index) => {
            const categorySlug = col.slug || col._id;
            const borderClass = getHoverBorderColorClass(col, index);
            const textHoverClass = getHoverTextColorClass(col, index);

            const displayImage =
              col.image ||
              "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800";

            return (
              <Link
                key={col._id}
                href={`/shop?category=${categorySlug}`}
                className={`group relative min-h-70 sm:min-h-85 w-full overflow-hidden border border-brand-dark/15 bg-brand-dark transition-all duration-300 ${borderClass}`}
              >
                {/* Background Image */}
                <img
                  src={displayImage}
                  alt={col.name}
                  className="absolute inset-0 w-full h-full object-cover object-center opacity-60 transition-transform duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300" />

                <div className="relative z-10 h-full p-8 flex flex-col justify-end">
                  <span className="text-[10px] tracking-[0.3em] text-brand-ivory/70 uppercase font-sans mb-1">
                    {col.description || "ARCHIVE LINE"}
                  </span>
                  <h3
                    style={
                      col.hexColor
                        ? ({
                            "--hover-color": col.hexColor,
                          } as React.CSSProperties)
                        : undefined
                    }
                    className={`text-5xl sm:text-6xl font-heading tracking-wider text-brand-ivory uppercase transition-colors duration-300 ${textHoverClass}`}
                  >
                    {col.name}
                  </h3>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-xs tracking-widest text-brand-dark/50 uppercase py-10 font-sans">
          NO COLLECTIONS AVAILABLE.
        </p>
      )}
    </section>
  );
}
