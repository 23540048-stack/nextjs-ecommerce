"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import CartItem, { CartItemType } from "@/components/cart/CartItem";
import CartSummary from "@/components/cart/CartSummary";
import ConfirmModal from "@/components/common/ConfirmModal";
import Button from "@/components/ui/Button";
import { api } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, Trash2, ArrowLeft, Scroll, Loader2 } from "lucide-react";

interface CouponResult {
  code: string;
  discountType: string;
  discountValue: number;
  discountAmount: number;
  originalValue: number;
  finalAmount: number;
}

export default function CartPage() {
  const { refreshCart, fetchCart } = useCart();

  const [items, setItems] = useState<CartItemType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [itemToDelete, setItemToDelete] = useState<CartItemType | null>(null);

  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  // ============================================================
  // COUPON STATE
  // ============================================================

  const [discount, setDiscount] = useState<number>(0);

  const [appliedCoupon, setAppliedCoupon] = useState<CouponResult | null>(null);

  // ============================================================
  // SYNC CART CONTEXT
  // ============================================================

  const syncCartContext = () => {
    if (typeof refreshCart === "function") {
      refreshCart();
    } else if (typeof fetchCart === "function") {
      fetchCart();
    }
  };

  // ============================================================
  // FETCH CART
  // ============================================================

  const fetchCartItems = async () => {
    try {
      setLoading(true);

      const response = await api.get("/cart");

      const cartData = response.data;

      // Đồng bộ cart count trên Header
      syncCartContext();

      const rawList = Array.isArray(cartData)
        ? cartData
        : cartData?.items || [];

      const formattedItems: CartItemType[] = rawList.map((item: any) => {
        const product =
          item.productId && typeof item.productId === "object"
            ? item.productId
            : item.product || {};

        const price =
          typeof item.price === "number"
            ? item.price
            : typeof product.price === "number"
              ? product.price
              : Number(product.price) || 0;

        const image =
          product.images && product.images.length > 0
            ? product.images[0]
            : product.image ||
              item.image ||
              "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&auto=format&fit=crop&q=60";

        return {
          id: String(item._id || item.id || product._id || ""),

          productId: String(
            product._id ||
              product.id ||
              (typeof item.productId === "string" ? item.productId : "") ||
              "",
          ),

          name: product.name || item.name || "SHINOBI GEAR",

          slug: product.slug || item.slug || "",

          // Backend price is already USD
          price,

          quantity: Number(item.quantity) || 1,

          size: item.size || undefined,

          color: item.color || undefined,

          image,
        };
      });

      setItems(formattedItems);

      // ========================================================
      // RESTORE COUPON
      // ========================================================

      const savedCoupon = sessionStorage.getItem("appliedCoupon");

      if (savedCoupon) {
        try {
          const parsed: CouponResult = JSON.parse(savedCoupon);

          setAppliedCoupon(parsed);
          setDiscount(Number(parsed.discountAmount) || 0);
        } catch (error) {
          console.error("Failed to restore coupon:", error);

          sessionStorage.removeItem("appliedCoupon");

          setAppliedCoupon(null);
          setDiscount(0);
        }
      }
    } catch (error) {
      console.error("Failed to fetch cart items:", error);

      toast.error("Failed to sync your equipment scroll with the server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  // ============================================================
  // UPDATE QUANTITY
  // ============================================================

  const handleUpdateQuantity = async (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    const previousItems = [...items];

    // Optimistic UI
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: newQuantity,
            }
          : item,
      ),
    );

    try {
      await api.patch(`/cart/items/${id}`, {
        quantity: newQuantity,
      });

      syncCartContext();

      toast.success("Equipment quantity updated successfully");

      // Cart subtotal changed => coupon invalid
      if (appliedCoupon) {
        setAppliedCoupon(null);
        setDiscount(0);

        sessionStorage.removeItem("appliedCoupon");

        toast("Coupon removed because your cart total changed");
      }
    } catch (error) {
      console.error("Failed to update item quantity:", error);

      toast.error("Could not update item quantity");

      setItems(previousItems);
    }
  };

  // ============================================================
  // REQUEST REMOVE ITEM
  // ============================================================

  const handleRequestRemoveItem = (id: string) => {
    const target = items.find((item) => item.id === id);

    if (target) {
      setItemToDelete(target);
    }
  };

  // ============================================================
  // REMOVE SINGLE ITEM
  // ============================================================

  const handleConfirmRemoveSingleItem = async () => {
    if (!itemToDelete) return;

    const targetId = itemToDelete.id;

    const previousItems = [...items];

    // Optimistic UI
    setItems((prev) => prev.filter((item) => item.id !== targetId));

    setItemToDelete(null);

    try {
      await api.delete(`/cart/items/${targetId}`);

      syncCartContext();

      toast.success("Item removed from your equipment scroll");

      // Cart subtotal changed => coupon invalid
      if (appliedCoupon) {
        setAppliedCoupon(null);
        setDiscount(0);

        sessionStorage.removeItem("appliedCoupon");

        toast("Coupon removed because your cart total changed");
      }
    } catch (error) {
      console.error("Failed to remove cart item:", error);

      toast.error("Could not remove item from equipment scroll");

      setItems(previousItems);
    }
  };

  // ============================================================
  // CLEAR CART
  // ============================================================

  const handleConfirmClearCart = async () => {
    const previousItems = [...items];

    setItems([]);
    setIsClearModalOpen(false);

    try {
      await api.delete("/cart/clear");

      syncCartContext();

      toast.success("Equipment scroll cleared successfully");

      setDiscount(0);
      setAppliedCoupon(null);

      sessionStorage.removeItem("appliedCoupon");
    } catch (error) {
      console.error("Failed to clear cart:", error);

      toast.error("Could not clear your equipment scroll");

      setItems(previousItems);
    }
  };

  // ============================================================
  // SUBTOTAL
  // ============================================================

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  // ============================================================
  // APPLY COUPON
  // ============================================================

  const handleApplyCoupon = async (code: string): Promise<boolean> => {
    try {
      if (!code.trim()) {
        toast.error("Please enter a promo code");

        return false;
      }

      if (subtotal <= 0) {
        toast.error("Your cart is empty");

        return false;
      }

      const response = await api.post("/coupons/apply", {
        code: code.trim().toUpperCase(),
        orderValue: subtotal,
      });

      const result: CouponResult = response.data;

      if (!result) {
        toast.error("Invalid promo code");

        return false;
      }

      const discountAmount = Number(result.discountAmount) || 0;

      setDiscount(discountAmount);

      setAppliedCoupon(result);

      // Lưu coupon để Checkout khôi phục
      sessionStorage.setItem("appliedCoupon", JSON.stringify(result));

      toast.success(`Coupon ${result.code} applied successfully`);

      return true;
    } catch (error: any) {
      console.error("Failed to apply coupon:", error);

      setDiscount(0);
      setAppliedCoupon(null);

      sessionStorage.removeItem("appliedCoupon");

      const message =
        error?.response?.data?.message || "Unable to apply this promo code";

      toast.error(Array.isArray(message) ? message[0] : message);

      return false;
    }
  };

  // ============================================================
  // REMOVE COUPON
  // ============================================================

  const handleRemoveCoupon = () => {
    setDiscount(0);

    setAppliedCoupon(null);

    sessionStorage.removeItem("appliedCoupon");

    toast.success("Promo code removed");
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="w-full min-h-screen bg-white text-brand-dark py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER */}

        <div className="border-b border-brand-dark/15 pb-6">
          <div className="flex items-center gap-2 font-mono text-xs text-brand-dark/60 uppercase mb-2">
            <Link href="/" className="hover:text-orange-500 transition-colors">
              HOME
            </Link>

            <span>/</span>

            <span className="text-brand-dark font-bold">
              SHINOBI SCROLL (CART)
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-heading tracking-wide uppercase">
                YOUR SHINOBI EQUIPMENT
              </h1>

              <p className="font-mono text-xs text-brand-dark/60 mt-1">
                {loading
                  ? "SYNCING EQUIPMENT SCROLL..."
                  : items.length > 0
                    ? `YOU HAVE ${items.reduce(
                        (acc, cur) => acc + cur.quantity,
                        0,
                      )} ITEM(S) IN YOUR EQUIPMENT SCROLL`
                    : "YOUR EQUIPMENT SCROLL IS EMPTY"}
              </p>
            </div>

            {!loading && items.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                icon={Trash2}
                onClick={() => setIsClearModalOpen(true)}
              >
                CLEAR ALL ITEMS
              </Button>
            )}
          </div>
        </div>

        {/* CONTENT */}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 border border-dashed border-brand-dark/20 bg-brand-dark/5 my-12">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />

            <span className="font-mono text-xs text-brand-dark/60 tracking-widest uppercase">
              LOADING SHINOBI GEAR...
            </span>
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* ITEMS */}

            <div className="lg:col-span-8 space-y-4">
              {items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemove={handleRequestRemoveItem}
                />
              ))}

              <div className="pt-4 flex justify-between items-center">
                <Link href="/shop">
                  <Button variant="ghost" size="sm" icon={ArrowLeft}>
                    CONTINUE EXPLORING ARCHIVE
                  </Button>
                </Link>
              </div>
            </div>

            {/* SUMMARY */}

            <div className="lg:col-span-4 sticky top-24">
              <CartSummary
                subtotal={subtotal}
                discount={discount}
                appliedCoupon={appliedCoupon}
                onApplyCoupon={handleApplyCoupon}
                onRemoveCoupon={handleRemoveCoupon}
                showCheckoutButton={true}
              />
            </div>
          </div>
        ) : (
          <div className="border border-dashed border-brand-dark/20 p-12 text-center space-y-6 bg-brand-dark/5 my-12">
            <div className="w-16 h-16 mx-auto rounded-full bg-brand-dark/10 flex items-center justify-center text-brand-dark/40">
              <ShoppingBag size={32} />
            </div>

            <div className="space-y-2">
              <h2 className="font-heading text-2xl tracking-wide uppercase text-brand-dark">
                YOUR NINJA POUCH IS EMPTY
              </h2>

              <p className="font-mono text-xs text-brand-dark/60 max-w-md mx-auto">
                No ninja gear added to your scroll yet. Explore the archive to
                gear up for your next mission.
              </p>
            </div>

            <div className="pt-4">
              <Link href="/shop">
                <Button variant="chakra" size="lg" icon={Scroll}>
                  EXPLORE ARCHIVE NOW
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* REMOVE ITEM MODAL */}

      <ConfirmModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmRemoveSingleItem}
        title="REMOVE ITEM FROM CART"
        description={`ARE YOU SURE YOU WANT TO REMOVE "${itemToDelete?.name}" FROM YOUR EQUIPMENT SCROLL?`}
        confirmLabel="REMOVE ITEM"
        cancelLabel="CANCEL"
        isDangerous={true}
      />

      {/* CLEAR CART MODAL */}

      <ConfirmModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={handleConfirmClearCart}
        title="CLEAR ENTIRE CART"
        description="ARE YOU SURE YOU WANT TO REMOVE ALL ITEMS FROM YOUR SHINOBI EQUIPMENT SCROLL?"
        confirmLabel="CLEAR ALL"
        cancelLabel="CANCEL"
        isDangerous={true}
      />
    </div>
  );
}
