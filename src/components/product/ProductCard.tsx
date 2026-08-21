"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Scroll, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import ConfirmModal from "@/components/common/ConfirmModal";
import AddToCartModal from "@/components/cart/AddToCartModal";
import toast from "react-hot-toast";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { useAuthStore } from "@/store/useAuthStore";

export interface ProductProps {
  id: string;
  name: string;
  subCategory?: string;
  price: number | string;
  imageUrl?: string;
  image?: string;
  hoverImage?: string;
  badge?: "NEW" | "LIMITED" | "HOT" | "TOP RATED" | string;
  category?: string;
  inStock?: boolean;
  stock?: number;
  autoRemoveFromWishlist?: boolean;
  onAddToCartSuccess?: () => void;
}

export default function ProductCard({
  id,
  name,
  subCategory = "Otakuen Collection",
  price,
  imageUrl,
  image,
  hoverImage,
  badge,
  category,
  inStock = true,
  stock,
  autoRemoveFromWishlist = false,
  onAddToCartSuccess,
}: ProductProps) {
  const router = useRouter();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const user = useAuthStore((state) => state.user);
  const isLoggedIn = Boolean(user);

  const isWished = isInWishlist(id);
  const isOutOfStock =
    inStock === false || (typeof stock === "number" && stock <= 0);

  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [isWishlistConfirmOpen, setIsWishlistConfirmOpen] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const displayImage = imageUrl || image || "/placeholder.jpg";

  const numericPrice =
    typeof price === "number"
      ? price
      : parseFloat(price.toString().replace(/[^0-9.-]+/g, "")) || 0;

  const formattedPrice =
    typeof price === "number"
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(price)
      : price;

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      toast.error("PLEASE LOG IN TO ADD ITEMS TO WISHLIST!");
      router.push("/login");
      return;
    }

    if (isWishlistLoading) return;

    if (isWished) {
      setIsWishlistConfirmOpen(true);
      return;
    }

    try {
      setIsWishlistLoading(true);

      await addToWishlist({
        productId: id,
        name,
        category: category || subCategory,
        price: numericPrice,
        image: displayImage,
        inStock: !isOutOfStock,
        rating: 5.0,
      });

      toast.success("ADDED TO WISHLIST VAULT!");
    } catch (error: any) {
      console.error("Failed to add to wishlist:", error);
      toast.error("FAILED TO ADD ITEM TO WISHLIST");
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const handleConfirmRemoveWishlist = async () => {
    if (!isLoggedIn) {
      toast.error("PLEASE LOG IN TO MODIFY WISHLIST!");
      router.push("/login");
      return;
    }

    try {
      setIsWishlistLoading(true);
      await removeFromWishlist(id);
      toast.success("REMOVED FROM WISHLIST");
    } catch (error: any) {
      console.error("Failed to remove from wishlist:", error);
      toast.error("FAILED TO REMOVE ITEM FROM WISHLIST");
    } finally {
      setIsWishlistLoading(false);
      setIsWishlistConfirmOpen(false);
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    if (!isLoggedIn) {
      toast.error("PLEASE LOG IN TO ADD ITEMS TO CART!");
      router.push("/login");
      return;
    }

    try {
      setIsAdding(true);
      await addToCart(id, 1);

      if (isWished || autoRemoveFromWishlist) {
        try {
          await removeFromWishlist(id);
        } catch (wishErr) {
          console.error("Failed to remove from wishlist:", wishErr);
        }
        onAddToCartSuccess?.();
      }

      toast.dismiss();
      toast.success(`ADDED "${name.toUpperCase()}" TO CART!`);
      setIsCartModalOpen(true);
    } catch (error: any) {
      console.error("Failed to add to cart:", error);
      toast.dismiss();
      toast.error("FAILED TO ADD ITEM TO CART");
    } finally {
      setIsAdding(false);
    }
  };

  const getBadgeVariant = (b?: string) => {
    if (b === "NEW") return "new";
    return "limited";
  };

  return (
    <>
      <div className="group bg-brand-ivory text-brand-dark border border-brand-dark/15 p-4 flex flex-col justify-between transition-all duration-300 hover:border-orange-500 hover:shadow-[0_4px_20px_rgba(249,115,22,0.2)] relative">
        <Link
          href={`/products/${id}`}
          className="absolute inset-0 z-0"
          aria-label={name}
        />

        <div className="pointer-events-none">
          <div className="relative aspect-square w-full overflow-hidden bg-brand-dark/5 mb-4 border border-brand-dark/10">
            <img
              src={displayImage}
              alt={name}
              className={`w-full h-full object-cover object-center group-hover:scale-105 transition-all duration-500 ${
                isOutOfStock ? "opacity-60 grayscale-[40%]" : ""
              }`}
            />
            {hoverImage && !isOutOfStock && (
              <img
                src={hoverImage}
                alt={`${name} preview`}
                className="w-full h-full object-cover object-center absolute inset-0 opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
              />
            )}

            {isOutOfStock ? (
              <Badge
                variant="limited"
                size="sm"
                className="absolute top-2 left-2 z-10 !bg-neutral-800 !text-neutral-300 !border-neutral-600"
              >
                OUT OF STOCK
              </Badge>
            ) : badge ? (
              <Badge
                variant={getBadgeVariant(badge)}
                size="sm"
                className="absolute top-2 left-2 z-10"
              >
                {badge}
              </Badge>
            ) : null}
          </div>

          <span className="text-[10px] tracking-[0.2em] font-mono text-brand-dark/50 uppercase block mb-1">
            {subCategory}
          </span>

          <h3 className="font-heading text-xl tracking-wide uppercase line-clamp-1 group-hover:text-orange-500 transition-colors">
            {name}
          </h3>
        </div>

        <button
          type="button"
          onClick={handleWishlistClick}
          disabled={isWishlistLoading}
          aria-label={isWished ? "Remove from Wishlist" : "Add to Wishlist"}
          title={isWished ? "Remove from Wishlist" : "Add to Wishlist"}
          className={`absolute top-6 right-6 z-10 p-2 backdrop-blur-xs transition-all rounded-full cursor-pointer disabled:opacity-50 ${
            isWished
              ? "bg-orange-500/10 text-orange-600 border border-orange-500/40 hover:bg-orange-500/20"
              : "bg-brand-ivory/80 text-brand-dark hover:text-orange-500 border border-transparent"
          }`}
        >
          {isWishlistLoading ? (
            <Loader2 size={16} className="animate-spin text-orange-500" />
          ) : (
            <Heart
              size={16}
              className={isWished ? "fill-orange-500 text-orange-500" : ""}
            />
          )}
        </button>

        <div className="mt-4 pt-3 border-t border-brand-dark/10 flex items-center justify-between gap-2 relative z-10">
          <span className="font-mono text-sm font-bold shrink-0">
            {formattedPrice}
          </span>

          <div onClick={(e) => e.stopPropagation()}>
            <Button
              size="sm"
              icon={isOutOfStock ? undefined : Scroll}
              onClick={handleAddToCart}
              disabled={isAdding || isOutOfStock}
              className={
                isOutOfStock
                  ? "!opacity-50 !cursor-not-allowed !bg-neutral-300 !text-neutral-600 !border-neutral-400 hover:!bg-neutral-300"
                  : ""
              }
            >
              {isOutOfStock
                ? "OUT OF STOCK"
                : isAdding
                  ? "ADDING..."
                  : "ADD TO CART"}
            </Button>
          </div>
        </div>
      </div>

      <AddToCartModal
        isOpen={isCartModalOpen}
        onClose={() => setIsCartModalOpen(false)}
        product={{
          id,
          productId: id,
          name,
          image: displayImage,
          price: formattedPrice,
          quantity: 1,
        }}
      />

      <ConfirmModal
        isOpen={isWishlistConfirmOpen}
        onClose={() => setIsWishlistConfirmOpen(false)}
        onConfirm={handleConfirmRemoveWishlist}
        title="REMOVE FROM WISHLIST"
        description={`REMOVE "${name.toUpperCase()}" FROM YOUR SAVED WISHLIST?`}
        confirmLabel="REMOVE"
        isDangerous={true}
      />
    </>
  );
}
