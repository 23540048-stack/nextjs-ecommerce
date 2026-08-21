"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProductGrid from "@/components/product/ProductGrid";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import ConfirmModal from "@/components/common/ConfirmModal";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuthStore } from "@/store/useAuthStore";
import AddToCartModal, {
  CartProductInfo,
} from "@/components/cart/AddToCartModal";
import {
  Star,
  Heart,
  Scroll,
  Minus,
  Plus,
  ShieldCheck,
  Truck,
  RotateCcw,
  Share2,
  Check,
  Ruler,
  Loader2,
  Ban,
} from "lucide-react";
import toast from "react-hot-toast";

export interface ProductDetailType {
  id: string;
  name: string;
  subCategory: string;
  price: string;
  badge?: "NEW" | "LIMITED";
  rating?: number;
  reviewsCount?: number;
  description: string;
  sizes?: string[];
  images: string[];
  specs: { label: string; value: string }[];
  inStock?: boolean;
}

interface ProductDetailProps {
  product: ProductDetailType;
  relatedProducts?: Array<{
    id: string;
    name: string;
    subCategory: string;
    price: string;
    image: string;
    hoverImage?: string;
    badge?: "NEW" | "LIMITED";
    inStock?: boolean;
  }>;
}

export default function ProductDetail({
  product,
  relatedProducts = [],
}: ProductDetailProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const user = useAuthStore((state) => state.user);
  const isLoggedIn = Boolean(user);

  const isWished = isInWishlist(product.id);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const isOutOfStock = product.inStock === false;

  const hasSizes = Array.isArray(product.sizes) && product.sizes.length > 0;
  const [selectedSize, setSelectedSize] = useState<string>(
    hasSizes ? product.sizes![0] : "",
  );

  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isWishlistConfirmOpen, setIsWishlistConfirmOpen] = useState(false);
  const [cartProduct, setCartProduct] = useState<CartProductInfo | null>(null);

  const realReviewsCount = product.reviewsCount || 0;
  const realRating = realReviewsCount > 0 ? product.rating || 0 : 0;

  const handleAddToCart = async () => {
    if (isOutOfStock) {
      toast.error("THIS ARCHIVE ITEM IS OUT OF STOCK");
      return;
    }

    if (!isLoggedIn) {
      toast.error("PLEASE LOG IN TO ADD ITEMS TO CART!");
      router.push("/login");
      return;
    }

    if (hasSizes && !selectedSize) {
      toast.error("PLEASE SELECT A SIZE FIRST");
      return;
    }

    try {
      setIsAdding(true);
      await addToCart(product.id, quantity);

      // Nếu sản phẩm đang nằm trong wishlist thì xóa khỏi wishlist
      if (isWished) {
        await removeFromWishlist(product.id);
      }

      setCartProduct({
        id: product.id,
        productId: product.id,
        name: product.name,
        image: product.images[0],
        price: product.price,
        size: hasSizes ? selectedSize : undefined,
        quantity: quantity,
      });

      setIsCartModalOpen(true);
      toast.success("ADDED TO TACTICAL BAG");
    } catch (error: any) {
      console.error("Failed to add to cart:", error);
      toast.error("FAILED TO ADD ITEM TO CART");
    } finally {
      setIsAdding(false);
    }
  };

  const handleWishlistClick = async () => {
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

      const numericPrice =
        typeof product.price === "number"
          ? product.price
          : parseFloat(product.price.toString().replace(/[^0-9.-]+/g, "")) || 0;

      await addToWishlist({
        productId: product.id,
        name: product.name,
        category: product.subCategory,
        price: numericPrice,
        image: product.images[0] || "/placeholder.jpg",
        inStock: !isOutOfStock,
        rating: realRating || 5.0,
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
      await removeFromWishlist(product.id);
      toast.success("REMOVED FROM WISHLIST");
    } catch (error: any) {
      console.error("Failed to remove from wishlist:", error);
      toast.error("FAILED TO REMOVE ITEM FROM WISHLIST");
    } finally {
      setIsWishlistLoading(false);
      setIsWishlistConfirmOpen(false);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("ARCHIVE LINK COPIED TO CLIPBOARD");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full relative">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-20">
        <div className="lg:col-span-7 flex flex-col md:flex-row gap-4 items-start">
          <div className="relative w-full md:flex-1 aspect-square bg-brand-dark/5 border border-brand-dark/15 overflow-hidden group">
            <img
              src={product.images[activeImageIndex]}
              alt={product.name}
              className={`w-full h-full object-cover object-center transition-transform duration-500 ${
                isOutOfStock ? "grayscale opacity-80" : "group-hover:scale-105"
              }`}
            />

            {isOutOfStock ? (
              <span className="absolute top-4 left-4 text-xs font-mono font-bold tracking-widest px-3 py-1.5 uppercase z-10 bg-red-900/90 text-red-200 border border-red-700/50 backdrop-blur-sm">
                OUT OF STOCK
              </span>
            ) : product.badge ? (
              <span
                className={`absolute top-4 left-4 text-xs font-mono font-bold tracking-widest px-3 py-1.5 uppercase z-10 ${
                  product.badge === "NEW"
                    ? "bg-brand-dark text-white"
                    : "bg-red-700 text-white"
                }`}
              >
                {product.badge}
              </span>
            ) : null}
          </div>

          <div className="flex md:flex-col gap-3 shrink-0 overflow-x-auto md:overflow-y-auto w-full md:w-auto">
            {product.images.map((img, index) => (
              <button
                key={index}
                onClick={() => setActiveImageIndex(index)}
                className={`relative w-20 h-20 border transition-all overflow-hidden shrink-0 cursor-pointer ${
                  activeImageIndex === index
                    ? "border-orange-500 ring-1 ring-orange-500"
                    : "border-brand-dark/20 opacity-70 hover:opacity-100"
                }`}
              >
                <img
                  src={img}
                  alt={`View ${index + 1}`}
                  className={`w-full h-full object-cover ${isOutOfStock ? "grayscale" : ""}`}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2 font-mono text-xs">
              <span className="tracking-[0.2em] text-brand-dark/50 uppercase">
                {product.subCategory}
              </span>

              <div className="flex items-center gap-1.5">
                <div className="flex text-amber-500">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={14}
                      className={
                        star <= Math.round(realRating)
                          ? "fill-amber-500 text-amber-500"
                          : "text-brand-dark/20 fill-none"
                      }
                    />
                  ))}
                </div>
                <span className="font-bold">
                  {realRating > 0 ? realRating.toFixed(1) : "0"} (
                  {realReviewsCount})
                </span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-heading tracking-wide uppercase leading-tight mb-4">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mb-6">
              <span className="text-2xl font-mono font-bold text-brand-dark">
                {product.price}
              </span>
              {isOutOfStock && (
                <span className="text-xs font-mono font-bold text-red-600 bg-red-50 px-2.5 py-1 border border-red-200 uppercase tracking-wider">
                  SOLDOUT / UNAVAILABLE
                </span>
              )}
            </div>

            <p className="text-sm font-sans text-brand-dark/80 leading-relaxed mb-8 border-b border-brand-dark/15 pb-6">
              {product.description}
            </p>

            {hasSizes && (
              <div className="mb-6 font-mono">
                <div className="flex items-center justify-between mb-3 text-xs">
                  <span className="font-bold uppercase tracking-wider">
                    SELECT SIZE:
                  </span>
                  <button
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="text-brand-dark/60 hover:text-orange-500 underline uppercase text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <Ruler size={13} />
                    SIZE GUIDE
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes?.map((size) => (
                    <button
                      key={size}
                      disabled={isOutOfStock}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-12 h-11 px-3 flex items-center justify-center font-bold text-xs border transition-all ${
                        isOutOfStock
                          ? "border-brand-dark/10 bg-brand-dark/5 text-brand-dark/30 line-through cursor-not-allowed"
                          : selectedSize === size
                            ? "border-orange-500 bg-orange-500 text-white shadow-[0_0_10px_rgba(249,115,22,0.3)] cursor-pointer"
                            : "border-brand-dark/20 hover:border-brand-dark text-brand-dark cursor-pointer"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4">
                <div
                  className={`flex items-center border border-brand-dark/20 h-12 bg-brand-dark/5 font-mono ${
                    isOutOfStock ? "opacity-50" : ""
                  }`}
                >
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={isAdding || isOutOfStock}
                    className="w-10 h-full flex items-center justify-center hover:bg-brand-dark/10 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-12 text-center font-bold text-sm">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={isAdding || isOutOfStock}
                    className="w-10 h-full flex items-center justify-center hover:bg-brand-dark/10 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <div className="grow">
                  <Button
                    size="lg"
                    icon={isOutOfStock ? Ban : Scroll}
                    className={`w-full ${
                      isOutOfStock
                        ? "!bg-zinc-800 !text-zinc-400 !border-zinc-700 cursor-not-allowed"
                        : ""
                    }`}
                    onClick={handleAddToCart}
                    disabled={isAdding || isOutOfStock}
                  >
                    {isOutOfStock
                      ? "OUT OF STOCK"
                      : isAdding
                        ? "ADDING..."
                        : "ADD TO CART"}
                  </Button>
                </div>

                <button
                  type="button"
                  onClick={handleWishlistClick}
                  disabled={isWishlistLoading}
                  aria-label={
                    isWished ? "Remove from Wishlist" : "Add to Wishlist"
                  }
                  title={isWished ? "Remove from Wishlist" : "Add to Wishlist"}
                  className={`h-12 w-12 border flex items-center justify-center transition-colors cursor-pointer shrink-0 disabled:opacity-50 ${
                    isWished
                      ? "border-orange-500 text-orange-500 bg-orange-500/10"
                      : "border-brand-dark/20 text-brand-dark hover:border-orange-500 hover:text-orange-500"
                  }`}
                >
                  {isWishlistLoading ? (
                    <Loader2
                      size={18}
                      className="animate-spin text-orange-500"
                    />
                  ) : (
                    <Heart
                      size={18}
                      className={isWished ? "fill-orange-500" : ""}
                    />
                  )}
                </button>
              </div>

              <button
                onClick={handleCopyLink}
                className="flex items-center gap-2 text-xs font-mono text-brand-dark/60 hover:text-orange-500 transition-colors pt-2 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check size={14} className="text-green-600" />
                    <span className="text-green-600 font-bold">
                      LINK COPIED TO CLIPBOARD
                    </span>
                  </>
                ) : (
                  <>
                    <Share2 size={14} />
                    <span>SHARE THIS ARCHIVE ITEM</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="border-t border-brand-dark/15 pt-6 grid grid-cols-3 gap-2 font-mono text-[11px] text-brand-dark/70 text-center">
            <div className="flex flex-col items-center gap-2">
              <Truck size={18} className="text-orange-500" />
              <span>EXPRESS NINJA DELIVERY</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <ShieldCheck size={18} className="text-orange-500" />
              <span>100% AUTHENTIC GEAR</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <RotateCcw size={18} className="text-orange-500" />
              <span>30 DAYS EASY RETURN</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-20 border-t border-brand-dark/15 pt-12">
        <h2 className="text-2xl font-heading tracking-widest uppercase mb-8">
          SPECIFICATIONS & ARCHIVE DETAILS
        </h2>
        <div className="max-w-2xl font-mono text-xs space-y-4">
          {product.specs?.map((spec, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-3 border-b border-brand-dark/10"
            >
              <span className="text-brand-dark/50 uppercase font-bold">
                {spec.label}
              </span>
              <span className="text-brand-dark font-bold text-right">
                {spec.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="border-t border-brand-dark/15 pt-12 mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-heading tracking-widest uppercase">
              YOU MAY ALSO LIKE
            </h2>
            <Link
              href="/shop"
              className="font-mono text-xs font-bold text-orange-500 hover:underline uppercase"
            >
              VIEW ALL ARCHIVE →
            </Link>
          </div>
          <ProductGrid products={relatedProducts} />
        </div>
      )}

      <AddToCartModal
        isOpen={isCartModalOpen}
        onClose={() => setIsCartModalOpen(false)}
        product={cartProduct}
      />

      <ConfirmModal
        isOpen={isWishlistConfirmOpen}
        onClose={() => setIsWishlistConfirmOpen(false)}
        onConfirm={handleConfirmRemoveWishlist}
        title="REMOVE FROM WISHLIST"
        description={`REMOVE "${product.name}" FROM YOUR SAVED WISHLIST?`}
        confirmLabel="REMOVE"
        isDangerous={true}
      />

      <Modal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        title="SHINOBI SIZE GUIDE"
        maxWidth="md"
      >
        <div className="font-mono text-xs space-y-4">
          <p className="text-brand-dark/70">
            CHOOSE YOUR FIT BASED ON THE SHINOBI MEASUREMENT MATRIX BELOW:
          </p>
          <div className="border border-brand-dark/15 divide-y divide-brand-dark/10 text-center">
            <div className="grid grid-cols-3 bg-brand-dark/5 p-2 font-bold text-brand-dark">
              <span>SIZE</span>
              <span>HEIGHT (CM)</span>
              <span>WEIGHT (KG)</span>
            </div>
            <div className="grid grid-cols-3 p-2">
              <span>S</span>
              <span>160 - 168</span>
              <span>50 - 60</span>
            </div>
            <div className="grid grid-cols-3 p-2 bg-orange-500/10 font-bold text-orange-600">
              <span>M (RECOMMENDED)</span>
              <span>168 - 175</span>
              <span>60 - 70</span>
            </div>
            <div className="grid grid-cols-3 p-2">
              <span>L</span>
              <span>175 - 182</span>
              <span>70 - 80</span>
            </div>
            <div className="grid grid-cols-3 p-2">
              <span>XL</span>
              <span>182 - 190</span>
              <span>80 - 92</span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
