"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

interface WishlistMapItem {
  wishlistId: string;
  productId: string;
}

interface WishlistContextType {
  wishlistItems: WishlistMapItem[];
  isInWishlist: (productId: string) => boolean;
  addToWishlist: (productData: any) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  fetchWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined,
);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<WishlistMapItem[]>([]);

  // Kiểm tra đăng nhập chỉ dựa vào user từ AuthStore
  const user = useAuthStore((state) => state.user);
  const isLoggedIn = Boolean(user);

  const fetchWishlist = async () => {
    if (!isLoggedIn) return;
    try {
      const res = await api.get("/wishlist");
      const list = res.data || res;

      const items: WishlistMapItem[] = list.map((item: any) => ({
        wishlistId: item._id,
        productId: item.productId || item.product?._id || item._id,
      }));

      setWishlistItems(items);
    } catch (error) {
      console.error("Failed to fetch wishlist ids", error);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchWishlist();
    } else {
      setWishlistItems([]);
    }
  }, [isLoggedIn]);

  const isInWishlist = (productId: string) =>
    wishlistItems.some((item) => item.productId === productId);

  const addToWishlist = async (productData: any) => {
    if (!isLoggedIn) {
      const error: any = new Error("UNAUTHORIZED");
      error.status = 401;
      throw error;
    }

    const res = await api.post("/wishlist", productData);
    const createdItem = res.data || res;

    const newWishlistId = createdItem._id || productData.productId;
    setWishlistItems((prev) => [
      ...prev,
      { wishlistId: newWishlistId, productId: productData.productId },
    ]);
  };

  const removeFromWishlist = async (productId: string) => {
    if (!isLoggedIn) {
      const error: any = new Error("UNAUTHORIZED");
      error.status = 401;
      throw error;
    }

    const target = wishlistItems.find((item) => item.productId === productId);
    const targetIdToDelete = target ? target.wishlistId : productId;

    await api.delete(`/wishlist/${targetIdToDelete}`);

    setWishlistItems((prev) =>
      prev.filter((item) => item.productId !== productId),
    );
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
