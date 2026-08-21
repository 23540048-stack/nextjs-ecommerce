"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

interface CartItem {
  _id?: string;
  productId: string;
  quantity: number;
  [key: string]: any;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  fetchCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Kiểm tra trạng thái đăng nhập chỉ dựa trên object user
  const user = useAuthStore((state) => state.user);
  const isLoggedIn = Boolean(user);

  const fetchCart = async () => {
    if (!isLoggedIn) return;
    try {
      const res = await api.get("/cart");
      const data = res.data || res;
      const items = Array.isArray(data) ? data : data.items || [];
      setCartItems(items);
    } catch (error: any) {
      // Nếu nhận lỗi 401: Xóa user rác khỏi Zustand Store & Reset giỏ hàng
      if (error?.response?.status === 401) {
        useAuthStore.getState().logout();
        setCartItems([]);
        return;
      }
      console.error("Failed to fetch cart", error);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchCart();
    } else {
      setCartItems([]);
    }
  }, [isLoggedIn]);

  const cartCount = cartItems.reduce(
    (total, item) => total + (item.quantity || 1),
    0,
  );

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!isLoggedIn) {
      const error: any = new Error("UNAUTHORIZED");
      error.status = 401;
      throw error;
    }

    await api.post("/cart/add", { productId, quantity });
    await fetchCart();
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        fetchCart,
        refreshCart: fetchCart,
        addToCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
