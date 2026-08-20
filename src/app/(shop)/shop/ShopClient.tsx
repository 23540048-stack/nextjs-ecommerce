"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import ProductGrid from "@/components/product/ProductGrid";
import Button from "@/components/ui/Button";
import { api } from "@/lib/api";
import {
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  Star,
  Sparkles,
  Loader2,
  X,
} from "lucide-react";

export interface Category {
  _id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  _id?: string;
  name: string;
  subCategory?: string;
  price: number;
  displayPrice: string;
  image?: string;
  hoverImage?: string;
  badge?: "LIMITED" | "NEW" | undefined;
  rating?: number;
  categoryId?: string;
  categorySlug?: string;
  stock?: number;
  inStock?: boolean;
  gearCount?: number;
}

export type BannerLocation =
  | "HOME_HERO"
  | "PROMO_BAR"
  | "CATEGORY_SIDEBAR"
  | "POPUP";

export interface Banner {
  _id?: string;
  title: string;
  subtitle?: string;
  description?: string;
  badgeText?: string;
  badge?: string;
  mediaUrl?: string;
  imageUrl?: string;
  image?: string;
  mediaType?: "image" | "video";
  linkUrl?: string;
  location?: BannerLocation;
  status?: "active" | "inactive" | "scheduled";
  isActive?: boolean;
}

export default function ShopClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialCategory = searchParams.get("category") || "ALL";
  const searchQuery = searchParams.get("search") || "";

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeBanner, setActiveBanner] = useState<Banner | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // States lọc & phân trang
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedPrice, setSelectedPrice] = useState("ALL");
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const ITEMS_PER_PAGE = 12;

  // Cập nhật category từ URL
  useEffect(() => {
    const categoryFromUrl = searchParams.get("category");
    setSelectedCategory(categoryFromUrl || "ALL");
  }, [searchParams]);

  // Lấy danh sách Categories & Banner (chỉ chạy 1 lần khi mount)
  useEffect(() => {
    const fetchInitData = async () => {
      try {
        const [catRes, bannerRes] = await Promise.all([
          api.get("/categories").catch(() => {
            toast.error("Failed to load categories");
            return { data: [] };
          }),
          api.get("/banners?location=PROMO_BAR").catch(() => {
            toast.error("Failed to load promotion banner");
            return { data: [] };
          }),
        ]);

        const catList: Category[] = Array.isArray(catRes.data)
          ? catRes.data
          : catRes.data?.data || [];
        setCategories(catList);

        const bannerList: Banner[] = Array.isArray(bannerRes.data)
          ? bannerRes.data
          : bannerRes.data?.data || [];
        const currentActiveBanner =
          bannerList.find(
            (b) =>
              b.location === "PROMO_BAR" &&
              (b.status === "active" || !b.status),
          ) || null;
        setActiveBanner(currentActiveBanner);
      } catch (error) {
        console.error("Init data load error:", error);
      }
    };

    fetchInitData();
  }, []);

  // Gọi API lấy Sản phẩm kèm Bộ lọc & Phân trang từ NestJS Backend
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);

      // Chuyển đổi bộ lọc giá thành minPrice / maxPrice
      let minPrice: number | undefined = undefined;
      let maxPrice: number | undefined = undefined;

      if (selectedPrice === "UNDER_20") maxPrice = 20;
      else if (selectedPrice === "20_60") {
        minPrice = 20;
        maxPrice = 60;
      } else if (selectedPrice === "60_100") {
        minPrice = 60;
        maxPrice = 100;
      } else if (selectedPrice === "ABOVE_100") {
        minPrice = 100;
      }

      // Chuyển đổi bộ lọc Sắp xếp
      let sortParam: string | undefined = undefined;
      if (sortBy === "price-asc") sortParam = "price_asc";
      else if (sortBy === "price-desc") sortParam = "price_desc";

      // Gửi toàn bộ query params sang NestJS API
      const prodRes = await api.get("/products", {
        params: {
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          search: searchQuery.trim() || undefined,
          category: selectedCategory !== "ALL" ? selectedCategory : undefined,
          minPrice,
          maxPrice,
          minRating: selectedRating || undefined,
          sortBy: sortParam,
        },
      });

      const resData = prodRes.data;
      const prodList: any[] = Array.isArray(resData.data)
        ? resData.data
        : Array.isArray(resData)
          ? resData
          : [];

      // Cập nhật tổng số sản phẩm từ backend meta
      setTotalProducts(resData.meta?.total ?? prodList.length);

      // Format sản phẩm hiển thị ra FE
      const formattedList: Product[] = prodList.map((item: any) => {
        let catName = "";
        let catSlug = "";
        let catId = "";

        if (typeof item.category === "object" && item.category !== null) {
          catId = item.category._id || "";
          catSlug = item.category.slug || "";
          catName = item.category.name || "";
        } else if (typeof item.category === "string") {
          catId = item.category;
        }

        const usdPrice =
          typeof item.price === "number"
            ? item.price
            : parseFloat(item.price) || 0;

        const formattedUsdString = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(usdPrice);

        const displayImg =
          item.images && item.images.length > 0
            ? item.images[0]
            : item.image ||
              "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1000";

        const gearCountVal =
          typeof item.gearCount === "number"
            ? item.gearCount
            : typeof item.stock === "number"
              ? item.stock
              : undefined;

        return {
          id: String(item._id || item.id || ""),
          _id: item._id,
          name: item.name,
          subCategory: catName.toUpperCase() || "SHINOBI GEAR",
          price: usdPrice,
          displayPrice: formattedUsdString,
          image: displayImg,
          hoverImage:
            item.images && item.images.length > 1 ? item.images[1] : displayImg,
          badge: item.badge || (item.isFeatured ? "LIMITED" : undefined),
          rating: item.rating || 5,
          categoryId: catId,
          categorySlug: catSlug,
          stock: gearCountVal,
          inStock:
            typeof gearCountVal === "number"
              ? gearCountVal > 0
              : item.inStock !== false,
        };
      });

      setProducts(formattedList);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast.error("Failed to load products from server");
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    searchQuery,
    selectedCategory,
    selectedPrice,
    selectedRating,
    sortBy,
  ]);

  // Gọi lại API mỗi khi thay đổi bộ lọc hoặc chuyển trang
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Xử lý đổi Category
  const handleCategoryChange = (slugOrId: string) => {
    setSelectedCategory(slugOrId);
    setCurrentPage(1);

    const queryParams = new URLSearchParams();
    if (slugOrId !== "ALL") queryParams.set("category", slugOrId);
    if (searchQuery) queryParams.set("search", searchQuery);

    const queryString = queryParams.toString();
    router.push(queryString ? `/shop?${queryString}` : "/shop");
  };

  // Xóa bộ lọc
  const handleClearFilters = () => {
    setSelectedCategory("ALL");
    setSelectedPrice("ALL");
    setSelectedRating(null);
    setCurrentPage(1);
    router.push("/shop");
  };

  // Xóa tìm kiếm
  const handleClearSearch = () => {
    const queryParams = new URLSearchParams(searchParams.toString());
    queryParams.delete("search");
    const queryString = queryParams.toString();
    router.push(queryString ? `/shop?${queryString}` : "/shop");
  };

  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE) || 1;
  const bannerImageUrl =
    activeBanner?.mediaUrl || activeBanner?.imageUrl || activeBanner?.image;

  return (
    <main className="grow py-8 px-6 max-w-7xl mx-auto w-full font-mono">
      {/* BREADCRUMB */}
      <nav className="flex items-center gap-2.5 text-sm tracking-widest text-brand-dark/60 uppercase mb-6">
        <Link href="/" className="hover:text-orange-500 transition-colors">
          HOME
        </Link>
        <ChevronRight size={16} className="text-brand-dark/40" />
        <span className="text-brand-dark font-bold">SHOP</span>
      </nav>

      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <span className="text-xs tracking-[0.3em] text-orange-500 font-bold uppercase block mb-1">
            ARCHIVE CATALOG
          </span>
          <h1 className="text-4xl sm:text-5xl font-heading tracking-widest uppercase">
            {searchQuery ? `SEARCH: "${searchQuery}"` : "SHINOBI GEAR"}
          </h1>
        </div>

        <div className="flex flex-col sm:items-end gap-2">
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="inline-flex items-center gap-1 text-[11px] font-bold bg-orange-500/10 text-orange-600 border border-orange-500/30 px-2.5 py-1 hover:bg-orange-500 hover:text-white transition-colors uppercase cursor-pointer w-fit"
            >
              <span>CLEAR SEARCH</span>
              <X size={14} />
            </button>
          )}

          <span className="text-xs font-bold text-brand-dark/60 tracking-wider">
            [ {totalProducts} ITEMS AVAILABLE ]
          </span>
        </div>
      </div>

      {/* PROMO BAR BANNER */}
      {activeBanner && activeBanner.location === "PROMO_BAR" && (
        <div className="relative w-full h-48 sm:h-64 mb-8 overflow-hidden border border-brand-dark/20 bg-brand-dark text-brand-ivory flex items-center px-8 sm:px-12 group">
          {bannerImageUrl && (
            <img
              src={bannerImageUrl}
              alt={activeBanner.title || "Shinobi Promo Banner"}
              className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/80 to-transparent" />
          <div className="relative z-10 max-w-lg space-y-3">
            <div className="inline-flex items-center gap-2 bg-orange-500 text-white text-[10px] font-bold px-2.5 py-1 tracking-widest uppercase">
              <Sparkles size={12} />
              {activeBanner.badgeText || activeBanner.badge || "PROMOTIONAL"}
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading tracking-wider uppercase text-white">
              {activeBanner.title}
            </h2>
            {(activeBanner.description || activeBanner.subtitle) && (
              <p className="text-xs text-brand-ivory/70 line-clamp-2">
                {activeBanner.description || activeBanner.subtitle}
              </p>
            )}
            {activeBanner.linkUrl && (
              <a
                href={activeBanner.linkUrl}
                className="inline-block pt-1 text-xs font-bold text-orange-400 hover:text-white underline uppercase tracking-widest transition-colors"
              >
                DISCOVER NOW →
              </a>
            )}
          </div>
        </div>
      )}

      {/* FILTER BAR */}
      <div className="flex items-center justify-between gap-4 py-4 border-y border-brand-dark/15 mb-6">
        <Button
          size="sm"
          icon={SlidersHorizontal}
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          {isFilterOpen ? "CLOSE FILTER" : "FILTER"}
        </Button>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-brand-dark/50 uppercase">SORT BY:</span>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-transparent border-b border-brand-dark/30 font-bold uppercase py-1 pr-4 focus:outline-none cursor-pointer"
          >
            <option value="newest">NEWEST</option>
            <option value="price-asc">PRICE: LOW TO HIGH</option>
            <option value="price-desc">PRICE: HIGH TO LOW</option>
          </select>
        </div>
      </div>

      {/* FILTER PANEL */}
      {isFilterOpen && (
        <div className="mb-8 p-6 bg-brand-dark/5 border border-brand-dark/15 grid grid-cols-1 md:grid-cols-3 gap-8 text-xs animate-fadeIn">
          {/* CATEGORY */}
          <div>
            <span className="font-bold text-orange-500 tracking-widest uppercase block mb-3 border-b border-brand-dark/10 pb-2">
              1. CATEGORY
            </span>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer hover:text-orange-500 transition-colors">
                <input
                  type="radio"
                  name="category"
                  checked={selectedCategory === "ALL"}
                  onChange={() => handleCategoryChange("ALL")}
                  className="accent-orange-500 cursor-pointer"
                />
                <span>ALL CATEGORIES</span>
              </label>

              {categories.map((cat) => {
                const targetVal = cat.slug || cat._id;
                const isSelected =
                  selectedCategory !== "ALL" &&
                  (selectedCategory === cat.slug ||
                    selectedCategory === cat._id ||
                    selectedCategory.toLowerCase() ===
                      (cat.slug || "").toLowerCase());

                return (
                  <label
                    key={cat._id}
                    className="flex items-center gap-2 cursor-pointer hover:text-orange-500 transition-colors"
                  >
                    <input
                      type="radio"
                      name="category"
                      checked={isSelected}
                      onChange={() => handleCategoryChange(targetVal)}
                      className="accent-orange-500 cursor-pointer"
                    />
                    <span className="uppercase">{cat.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* PRICE RANGE */}
          <div>
            <span className="font-bold text-orange-500 tracking-widest uppercase block mb-3 border-b border-brand-dark/10 pb-2">
              2. PRICE RANGE
            </span>
            <div className="space-y-2">
              {[
                { id: "ALL", label: "ALL PRICES" },
                { id: "UNDER_20", label: "UNDER $20.00" },
                { id: "20_60", label: "$20.00 - $60.00" },
                { id: "60_100", label: "$60.00 - $100.00" },
                { id: "ABOVE_100", label: "OVER $100.00" },
              ].map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-2 cursor-pointer hover:text-orange-500 transition-colors"
                >
                  <input
                    type="radio"
                    name="price"
                    checked={selectedPrice === item.id}
                    onChange={() => {
                      setSelectedPrice(item.id);
                      setCurrentPage(1);
                    }}
                    className="accent-orange-500 cursor-pointer"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* RATING */}
          <div>
            <span className="font-bold text-orange-500 tracking-widest uppercase block mb-3 border-b border-brand-dark/10 pb-2">
              3. RATING
            </span>
            <div className="space-y-2">
              {[5, 4, 3].map((stars) => (
                <button
                  key={stars}
                  onClick={() => {
                    setSelectedRating(selectedRating === stars ? null : stars);
                    setCurrentPage(1);
                  }}
                  className={`flex items-center gap-2 w-full p-1.5 border transition-all text-left cursor-pointer ${
                    selectedRating === stars
                      ? "border-orange-500 bg-orange-500/10 text-orange-500 font-bold"
                      : "border-brand-dark/15 hover:border-brand-dark/40"
                  }`}
                >
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        className={
                          i < stars
                            ? "fill-amber-500"
                            : "text-brand-dark/20 fill-none"
                        }
                      />
                    ))}
                  </div>
                  <span>{stars === 5 ? "5.0 Perfect" : `${stars}.0 & Up`}</span>
                </button>
              ))}

              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleClearFilters}
                  className="text-[10px] font-bold text-brand-dark/60 hover:text-red-700 underline uppercase cursor-pointer"
                >
                  CLEAR FILTERS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCTS GRID */}
      <div className="mb-16">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : (
          <ProductGrid
            products={
              products.map((p) => ({
                ...p,
                price: p.displayPrice,
              })) as any
            }
            emptyMessage={
              searchQuery
                ? `NO NINJA GEAR FOUND MATCHING "${searchQuery.toUpperCase()}".`
                : "NO NINJA GEAR FOUND MATCHING YOUR FILTERS."
            }
          />
        )}
      </div>

      {/* PAGINATION CONTROLS */}
      {!loading && totalProducts > 0 && (
        <div className="flex justify-center items-center gap-2 pt-8 border-t border-brand-dark/10 text-xs">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 border border-brand-dark/20 hover:border-orange-500 hover:text-orange-500 disabled:opacity-30 transition-colors cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>

          {Array.from({ length: totalPages }).map((_, idx) => {
            const pageNum = idx + 1;
            const isActive = currentPage === pageNum;

            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-8 h-8 font-bold flex items-center justify-center transition-all cursor-pointer ${
                  isActive
                    ? "bg-orange-500 text-white shadow-[0_0_8px_rgba(249,115,22,0.4)]"
                    : "border border-brand-dark/20 hover:border-orange-500 hover:text-orange-500"
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="p-2 border border-brand-dark/20 hover:border-orange-500 hover:text-orange-500 disabled:opacity-30 transition-colors cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </main>
  );
}
