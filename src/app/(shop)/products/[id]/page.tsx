"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductDetail from "@/components/product/ProductDetail";
import RecentInspections from "@/components/product/RecentInspections";
import SizeGuideModal from "@/components/modals/SizeGuideModal";
import { api } from "@/lib/api";
import {
  ChevronRight,
  Star,
  CheckCircle2,
  ThumbsUp,
  Camera,
  MessageSquare,
  Loader2,
} from "lucide-react";

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
  collectionId?: string;
  inStock?: boolean;
  stock?: number;
  countInStock?: number;
  gearCount?: number;
}

export interface Review {
  _id?: string;
  id?: string;
  author: string;
  rating: number;
  date: string;
  verified?: boolean;
  sizeBought?: string;
  comment: string;
  images?: string[];
  likes: number;
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);

        // ============================================
        // 1. FETCH SẢN PHẨM CHÍNH
        // ============================================
        const res = await api.get(`/products/${id}`);
        const data = res.data?.data || res.data;

        if (!data) {
          toast.error("Product not found");
          setLoading(false);
          return;
        }

        const catObj = typeof data.category === "object" ? data.category : null;
        const collectionObj =
          typeof data.collection === "object" ? data.collection : null;

        const usdPrice =
          typeof data.price === "number"
            ? data.price
            : parseFloat(data.price) || 0;

        const formattedUsdString = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(usdPrice);

        const isProductInStock =
          typeof data.inStock === "boolean"
            ? data.inStock
            : typeof data.stock === "number"
              ? data.stock > 0
              : typeof data.countInStock === "number"
                ? data.countInStock > 0
                : typeof data.gearCount === "number"
                  ? data.gearCount > 0
                  : true;

        const productImages =
          data.images && data.images.length > 0
            ? data.images
            : [
                data.image ||
                  "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000",
              ];

        const formattedProduct = {
          ...data,
          id: String(data._id || data.id || id),
          _id: data._id,
          name: data.name,
          subCategory:
            collectionObj?.name?.toUpperCase() ||
            catObj?.name?.toUpperCase() ||
            data.subCategory ||
            "SHINOBI EQUIPMENT",
          inStock: isProductInStock,
          stock: data.stock,
          countInStock: data.countInStock,
          gearCount: data.gearCount,
          price: usdPrice,
          displayPrice: formattedUsdString,
          priceUsd: usdPrice,
          badge: data.badge || (data.isFeatured ? "LIMITED" : undefined),
          rating: data.rating || 0,
          reviewsCount: data.reviewsCount || data.reviews?.length || 0,
          description: data.description || "No detailed description available.",
          sizes: Array.isArray(data.sizes) ? data.sizes : [],
          images: productImages,
          specs: data.specs || [
            {
              label: "MATERIAL",
              value: data.material || "Heavyweight Cotton Canvas",
            },
            {
              label: "ORIGIN",
              value: "Leaf Village Archives",
            },
            {
              label: "QUALITY",
              value: "Standard Shinobi Issue",
            },
          ],
        };

        setProduct(formattedProduct);

        // ============================================
        // 2. FETCH REVIEWS
        // ============================================
        try {
          const revRes = await api.get(`/products/${id}/reviews`);
          const revList = Array.isArray(revRes.data)
            ? revRes.data
            : revRes.data?.data || [];

          setReviews(
            revList.map((r: any) => ({
              id: r._id || r.id,
              author: r.userName || r.author || "ANONYMOUS NINJA",
              rating: r.rating || 5,
              date: r.createdAt
                ? new Date(r.createdAt).toISOString().split("T")[0]
                : "2026-08-01",
              verified: r.verified ?? true,
              sizeBought: r.sizeBought || r.size || "",
              comment: r.comment || r.content || "",
              images: Array.isArray(r.images)
                ? r.images
                    .map((img: any) => {
                      const rawUrl =
                        typeof img === "string"
                          ? img
                          : img?.url || img?.secure_url || "";
                      if (rawUrl.startsWith("/")) {
                        return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${rawUrl}`;
                      }
                      return rawUrl;
                    })
                    .filter(Boolean)
                : [],
              likes: r.likes || 0,
            })),
          );
        } catch {
          if (data.reviews && Array.isArray(data.reviews)) {
            setReviews(data.reviews);
          }
        }

        // ============================================
        // 3. FETCH RELATED PRODUCTS BY COLLECTION
        // ============================================
        try {
          // Lấy ID Collection (hoặc ID Category nếu backend dùng chung)
          let collectionId = "";
          if (typeof data.collection === "object" && data.collection !== null) {
            collectionId = data.collection._id || data.collection.id || "";
          } else if (typeof data.collection === "string") {
            collectionId = data.collection;
          } else if (
            typeof data.category === "object" &&
            data.category !== null
          ) {
            collectionId = data.category._id || data.category.id || "";
          } else if (typeof data.category === "string") {
            collectionId = data.category;
          }

          let rawRelated: any[] = [];

          // 1. Tìm sản phẩm trong cùng Collection
          if (collectionId) {
            const relatedRes = await api
              .get(`/products?collection=${collectionId}&limit=6`)
              .catch(() => null);

            const resData = relatedRes?.data;
            rawRelated = Array.isArray(resData) ? resData : resData?.data || [];

            // Dự phòng nếu API không hỗ trợ query param `collection` mà dùng `category`
            if (rawRelated.length === 0) {
              const catRes = await api
                .get(`/products?category=${collectionId}&limit=6`)
                .catch(() => null);

              const catData = catRes?.data;
              rawRelated = Array.isArray(catData)
                ? catData
                : catData?.data || [];
            }
          }

          // Lọc bỏ sản phẩm hiện tại đang xem
          let filteredRelated = rawRelated.filter(
            (item: any) => String(item._id || item.id) !== String(id),
          );

          // 2. GỢI Ý DỰ PHÒNG: Nếu Collection này không có SP khác -> Lấy các SP mới nhất từ Collection khác
          if (filteredRelated.length === 0) {
            const fallbackRes = await api
              .get(`/products?limit=6&sortBy=newest`)
              .catch(() => null);

            const fallbackData = fallbackRes?.data;
            const rawFallback = Array.isArray(fallbackData)
              ? fallbackData
              : fallbackData?.data || [];

            filteredRelated = rawFallback.filter(
              (item: any) => String(item._id || item.id) !== String(id),
            );
          }

          const formattedRelated = filteredRelated
            .slice(0, 3)
            .map((item: any) => {
              const itemPriceUsd =
                typeof item.price === "number"
                  ? item.price
                  : parseFloat(item.price) || 0;

              const formattedItemPrice = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(itemPriceUsd);

              const isRelatedInStock =
                typeof item.inStock === "boolean"
                  ? item.inStock
                  : typeof item.stock === "number"
                    ? item.stock > 0
                    : typeof item.countInStock === "number"
                      ? item.countInStock > 0
                      : typeof item.gearCount === "number"
                        ? item.gearCount > 0
                        : true;

              return {
                id: String(item._id || item.id),
                _id: item._id,
                name: item.name,
                subCategory:
                  item.collection?.name?.toUpperCase() ||
                  item.category?.name?.toUpperCase() ||
                  "ACCESSORIES",
                price: itemPriceUsd,
                displayPrice: formattedItemPrice,
                priceUsd: itemPriceUsd,
                image:
                  item.images && item.images.length > 0
                    ? item.images[0]
                    : item.image ||
                      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=1000",
                hoverImage:
                  item.images && item.images.length > 1
                    ? item.images[1]
                    : item.images && item.images.length > 0
                      ? item.images[0]
                      : item.image,
                badge: item.badge || (item.isFeatured ? "LIMITED" : undefined),
                stock: item.stock,
                inStock: isRelatedInStock,
                countInStock: item.countInStock,
                gearCount: item.gearCount,
              };
            });

          setRelatedProducts(formattedRelated);
        } catch (err) {
          console.error("Failed to fetch related products", err);
        }
      } catch (error) {
        console.error("Error loading product details:", error);
        toast.error("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductData();
    }
  }, [id]);

  const ratingBreakdown = React.useMemo(() => {
    const total = reviews.length || 1;
    const counts = [0, 0, 0, 0, 0];

    reviews.forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) {
        counts[r.rating - 1]++;
      }
    });

    return [5, 4, 3, 2, 1].map((stars) => {
      const count = counts[stars - 1];
      const percentage = Math.round((count / total) * 100) + "%";

      return {
        stars,
        count,
        percentage,
      };
    });
  }, [reviews]);

  const handleLikeReview = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId || r._id === reviewId
          ? {
              ...r,
              likes: r.likes + 1,
            }
          : r,
      ),
    );

    toast.success("Feedback recorded");
  };

  return (
    <div className="min-h-screen bg-brand-ivory text-brand-dark flex flex-col justify-between font-mono">
      <Header />

      <main className="grow py-8 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        {/* BREADCRUMB */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <nav className="flex items-center gap-2.5 text-xs sm:text-sm tracking-widest text-brand-dark/60 uppercase">
            <Link href="/" className="hover:text-orange-500 transition-colors">
              HOME
            </Link>
            <ChevronRight size={16} className="text-brand-dark/40" />
            <Link
              href="/shop"
              className="hover:text-orange-500 transition-colors"
            >
              PRODUCTS
            </Link>
            <ChevronRight size={16} className="text-brand-dark/40" />
            <span className="text-brand-dark font-bold truncate max-w-40 sm:max-w-none">
              {loading ? "LOADING..." : product?.name || "ARCHIVE ITEM"}
            </span>
          </nav>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 py-12 animate-pulse">
            <div className="w-full h-[450px] bg-brand-dark/10 border border-brand-dark/20 flex items-center justify-center">
              <Loader2 className="animate-spin text-orange-500" size={32} />
            </div>

            <div className="space-y-6">
              <div className="h-4 bg-brand-dark/10 w-1/3" />
              <div className="h-10 bg-brand-dark/10 w-4/5" />
              <div className="h-8 bg-brand-dark/10 w-1/4" />
              <div className="h-24 bg-brand-dark/10 w-full" />
              <div className="h-12 bg-orange-500/20 w-full" />
            </div>
          </div>
        ) : product ? (
          <>
            {/* PRODUCT DETAIL & RELATED PRODUCTS */}
            <ProductDetail
              product={{
                ...product,
                price: product.displayPrice,
                displayPrice: product.displayPrice,
                priceUsd: product.price,
                inStock: product.inStock,
                rating:
                  reviews.length > 0
                    ? reviews.reduce((acc, cur) => acc + cur.rating, 0) /
                      reviews.length
                    : product.rating,
                reviewsCount: reviews.length || product.reviewsCount,
              }}
              relatedProducts={relatedProducts}
            />

            {/* REVIEWS */}
            <section className="mt-16 pt-12 border-t-2 border-brand-dark space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-dark/15 pb-4">
                <div>
                  <h2 className="text-2xl font-bold uppercase tracking-wider text-brand-dark flex items-center gap-2">
                    <span className="w-3 h-3 bg-orange-500 inline-block" />
                    SHINOBI FIELD REVIEWS
                  </h2>

                  <p className="text-xs text-brand-dark/60 mt-1">
                    VERIFIED EQUIPMENT INSPECTION REPORTS FROM THE FIELD
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold bg-brand-dark text-white px-3 py-1.5 self-start sm:self-auto">
                  <MessageSquare size={14} className="text-orange-400" />
                  <span>
                    {reviews.length || product.reviewsCount || 0} TOTAL REPORTS
                  </span>
                </div>
              </div>

              {/* RATING OVERVIEW */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white border border-brand-dark/20 p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                <div className="flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-brand-dark/15 pb-6 md:pb-0 md:pr-6 text-center">
                  <span className="text-5xl font-extrabold text-brand-dark tracking-tight">
                    {reviews.length > 0
                      ? (
                          reviews.reduce((acc, cur) => acc + cur.rating, 0) /
                          reviews.length
                        ).toFixed(1)
                      : "0.0"}
                  </span>

                  <div className="flex gap-1 my-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={18}
                        className={
                          star <= Math.round(product.rating)
                            ? "fill-amber-500 text-amber-500"
                            : "text-brand-dark/20 fill-none"
                        }
                      />
                    ))}
                  </div>

                  <span className="text-xs text-brand-dark/60 font-bold uppercase">
                    Based on {reviews.length || product.reviewsCount || 0}{" "}
                    reviews
                  </span>
                </div>

                <div className="md:col-span-2 space-y-2 flex flex-col justify-center">
                  {ratingBreakdown.map((item) => (
                    <div
                      key={item.stars}
                      className="flex items-center gap-3 text-xs"
                    >
                      <div className="flex items-center gap-1 w-12 text-brand-dark font-bold">
                        <span>{item.stars}</span>
                        <Star
                          size={12}
                          className="fill-amber-500 text-amber-500"
                        />
                      </div>

                      <div className="flex-1 bg-brand-dark/10 h-2 border border-brand-dark/20 relative overflow-hidden">
                        <div
                          className="bg-orange-500 h-full transition-all duration-500"
                          style={{
                            width: item.percentage,
                          }}
                        />
                      </div>

                      <span className="w-12 text-right text-brand-dark/60 text-[11px]">
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* REVIEWS LIST */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-brand-dark flex items-center gap-2">
                  <Camera size={16} className="text-orange-500" />
                  RECENT INSPECTIONS ({reviews.length})
                </h3>

                {reviews.length === 0 ? (
                  <div className="bg-white border border-brand-dark/20 p-8 text-center text-xs text-brand-dark/60 uppercase">
                    NO FIELD REPORTS SUBMITTED FOR THIS EQUIPMENT YET.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review, idx) => (
                      <div
                        key={review.id || review._id || idx}
                        className="bg-white border border-brand-dark/20 p-5 space-y-3 hover:border-brand-dark/50 transition-all"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-dark/10 pb-2">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-sm text-brand-dark uppercase">
                              {review.author}
                            </span>

                            {review.verified && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5">
                                <CheckCircle2 size={12} />
                                VERIFIED SHINOBI
                              </span>
                            )}
                          </div>

                          <span className="text-[11px] text-brand-dark/50">
                            {review.date}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={14}
                                className={
                                  star <= review.rating
                                    ? "fill-amber-500 text-amber-500"
                                    : "text-brand-dark/20 fill-none"
                                }
                              />
                            ))}
                          </div>

                          {review.sizeBought && (
                            <span className="text-[11px] text-brand-dark/60">
                              OPTION:{" "}
                              <strong className="text-brand-dark">
                                {review.sizeBought}
                              </strong>
                            </span>
                          )}
                        </div>

                        <p className="text-xs sm:text-sm text-brand-dark/90 leading-relaxed">
                          {review.comment}
                        </p>

                        {review.images && review.images.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {review.images.map((imgUrl, imgIdx) => (
                              <div
                                key={imgIdx}
                                className="relative w-16 h-16 border border-brand-dark/20 overflow-hidden group bg-brand-dark/5 cursor-pointer shrink-0"
                              >
                                <img
                                  src={imgUrl}
                                  alt={`Review photo ${imgIdx + 1}`}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=200";
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="pt-2 flex justify-end">
                          <button
                            onClick={() =>
                              handleLikeReview(review.id || review._id || "")
                            }
                            className="flex items-center gap-1.5 text-[11px] text-brand-dark/60 hover:text-orange-600 transition-colors cursor-pointer"
                          >
                            <ThumbsUp size={12} />
                            <span>Helpful ({review.likes})</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* RECENT INSPECTIONS (SẢN PHẨM VỪA XEM) */}
            <RecentInspections
              currentProduct={{
                id: product.id,
                name: product.name,
                subCategory: product.subCategory,
                price: product.displayPrice,
                image: product.images[0],
                badge: product.badge,
                stock: product.stock,
                inStock: product.inStock,
                gearCount: product.gearCount,
              }}
            />
          </>
        ) : (
          <div className="py-20 text-center space-y-4">
            <h2 className="text-2xl font-bold uppercase">
              EQUIPMENT NOT FOUND
            </h2>
            <p className="text-xs text-brand-dark/60">
              The requested item code does not exist in the Leaf Village
              archives.
            </p>
            <Link
              href="/shop"
              className="inline-block bg-orange-500 text-white px-6 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-orange-600 transition-colors"
            >
              RETURN TO CATALOG
            </Link>
          </div>
        )}
      </main>

      <Footer />

      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
      />
    </div>
  );
}
