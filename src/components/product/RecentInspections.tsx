"use client";

import React, { useEffect, useState } from "react";
import ProductGrid from "@/components/product/ProductGrid";
import { Clock } from "lucide-react";

export interface ViewedItem {
  id: string;
  name: string;
  subCategory: string;
  price: string;
  image: string;
  badge?: "NEW" | "LIMITED";
  stock?: number;
  inStock?: boolean;
  gearCount?: number;
}

interface RecentInspectionsProps {
  currentProduct: ViewedItem;
}

export default function RecentInspections({
  currentProduct,
}: RecentInspectionsProps) {
  const [recentItems, setRecentItems] = useState<ViewedItem[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || !currentProduct?.id) return;

    const STORAGE_KEY = "shinobi_recent_inspections";

    // 1. Lấy danh sách sản phẩm đã xem từ LocalStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    let items: ViewedItem[] = saved ? JSON.parse(saved) : [];

    // 2. Lọc ra danh sách cần hiển thị (loại bỏ sản phẩm đang xem hiện tại)
    const filteredForDisplay = items.filter(
      (item) => item.id !== currentProduct.id,
    );
    setRecentItems(filteredForDisplay);

    // 3. Đưa sản phẩm vừa xem (kèm trạng thái stock) vào đầu danh sách và lưu lại LocalStorage
    const updatedItems = [
      currentProduct,
      ...items.filter((item) => item.id !== currentProduct.id),
    ].slice(0, 3);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedItems));
  }, [
    currentProduct.id,
    currentProduct.inStock,
    currentProduct.stock,
    currentProduct.gearCount,
  ]);

  // Nếu người dùng chưa từng xem sản phẩm nào trước đó thì không hiển thị
  if (recentItems.length === 0) {
    return null;
  }

  return (
    <div className="mt-16 border-t-2 border-brand-dark pt-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold font-heading tracking-widest uppercase flex items-center gap-2">
          <Clock size={22} className="text-orange-500" />
          RECENT INSPECTIONS
        </h2>
        <span className="font-mono text-xs text-brand-dark/50 uppercase font-bold">
          {recentItems.length} LOGGED ITEMS
        </span>
      </div>
      <ProductGrid products={recentItems} />
    </div>
  );
}
