"use client";

import React, { useEffect, useState } from "react";
import ProductCard from "@/components/product/ProductCard";
import { api } from "@/lib/api";
import { Loader2, AlertCircle } from "lucide-react";

interface Category {
  _id: string;
  name: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  imageUrl?: string;
  images?: string[];
  category?: Category | string;
  stock?: number;
  inStock?: boolean;
  gearCount?: number;
}

interface FeaturedProductItem {
  _id: string;
  productId: Product;
  badgeLabel: "HOT" | "LIMITED" | "NEW" | "TOP RATED";
  displayOrder: number;
  status: "active" | "inactive";
}

export default function FeaturedSection() {
  const [featuredProducts, setFeaturedProducts] = useState<
    FeaturedProductItem[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        setError(false);

        const res = await api.get("/featured-products");
        const rawData = res.data;

        const list: FeaturedProductItem[] = Array.isArray(rawData)
          ? rawData
          : Array.isArray(rawData?.data)
            ? rawData.data
            : [];

        const activeList = list.filter(
          (item) => item.status === "active" && item.productId,
        );

        setFeaturedProducts(activeList);
      } catch (err) {
        console.error("Failed to load homepage featured products:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const getCategoryName = (category?: Category | string) => {
    if (!category) return "Otakuen Collection";
    if (typeof category === "object") return `${category.name} Collection`;
    return "Otakuen Collection";
  };

  return (
    <section className="max-w-6xl mx-auto px-6 py-20 border-t border-brand-dark/10 font-mono">
      <h2 className="text-4xl font-heading tracking-widest text-center uppercase mb-12 text-brand-dark">
        FEATURED PRODUCTS
      </h2>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
          <p className="text-xs font-bold uppercase tracking-wider text-brand-dark/60">
            LOADING VAULT PRODUCTS...
          </p>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center gap-2 py-12 text-rose-600 bg-rose-50 border-2 border-rose-600 max-w-md mx-auto p-4 shadow-[4px_4px_0px_0px_rgba(225,29,72,1)]">
          <AlertCircle size={20} />
          <span className="text-xs font-bold uppercase">
            FAILED TO CONNECT TO THE VAULT API.
          </span>
        </div>
      ) : featuredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((item) => {
            const product = item.productId;

            // Xử lý tồn kho & trạng thái hết hàng đồng bộ với trang Shop
            const gearCountVal =
              typeof product.gearCount === "number"
                ? product.gearCount
                : typeof product.stock === "number"
                  ? product.stock
                  : undefined;

            const isItemInStock =
              typeof gearCountVal === "number"
                ? gearCountVal > 0
                : product.inStock !== false;

            return (
              <ProductCard
                key={item._id}
                id={product._id}
                name={product.name}
                price={product.price}
                imageUrl={
                  product.imageUrl ||
                  (product.images && product.images[0]) ||
                  "/placeholder.jpg"
                }
                subCategory={getCategoryName(product.category)}
                badge={item.badgeLabel}
                stock={gearCountVal}
                inStock={isItemInStock}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 text-brand-dark/50 border-2 border-dashed border-brand-dark/20">
          <p className="text-xs font-bold uppercase tracking-wider">
            NO FEATURED ITEMS PROMOTED YET.
          </p>
        </div>
      )}
    </section>
  );
}
