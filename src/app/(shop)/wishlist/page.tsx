"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import ProductCard from "@/components/product/ProductCard";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { useWishlist } from "@/context/WishlistContext";
import {
  Heart,
  ShoppingCart,
  Trash2,
  ArrowLeft,
  Share2,
  ShoppingBag,
  Sparkles,
  AlertTriangle,
  X,
  Loader2,
} from "lucide-react";

interface WishlistItem {
  _id: string;
  productId?: string;
  product?: {
    _id: string;
    [key: string]: any;
  };
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  inStock: boolean;
  stock?: number;
  gearCount?: number;
}

type DeleteTarget =
  | { type: "single"; id: string; name: string }
  | { type: "all" }
  | null;

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);

  const { fetchWishlist: refreshGlobalWishlist } = useWishlist();

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await api.get("/wishlist");
      setWishlist(res.data || res);
    } catch (error: any) {
      console.error("Fetch wishlist error:", error);
      const status =
        error?.response?.status || error?.status || error?.statusCode;

      if (status === 401 || status === 403) {
        toast.dismiss();
        toast.error("PLEASE LOG IN TO VIEW YOUR WISHLIST!");
      } else {
        toast.dismiss();
        toast.error("Failed to load Wishlist Vault items.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleOpenDeleteAll = () => {
    setDeleteTarget({ type: "all" });
  };

  const removeItemFromState = (targetId: string) => {
    setWishlist((prev) =>
      prev.filter(
        (item) =>
          item._id !== targetId &&
          item.productId !== targetId &&
          item.product?._id !== targetId,
      ),
    );
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    const target = deleteTarget;
    setDeleteTarget(null);
    toast.dismiss();

    try {
      if (target.type === "single") {
        removeItemFromState(target.id);
        await api.delete(`/wishlist/${target.id}`);
        toast.success(`REMOVED "${target.name.toUpperCase()}" FROM WISHLIST`);
      } else if (target.type === "all") {
        setWishlist([]);
        await api.delete("/wishlist");
        toast.success("WISHLIST VAULT CLEARED SUCCESSFULLY!");
      }

      await refreshGlobalWishlist();
    } catch (error: any) {
      console.error("Delete error:", error);
      fetchWishlist();

      const status =
        error?.response?.status || error?.status || error?.statusCode;

      if (status === 401 || status === 403) {
        toast.error("PLEASE LOG IN TO MODIFY WISHLIST!");
      } else {
        toast.error("Failed to complete delete operation.");
      }
    }
  };

  const handleMoveAllToCart = async () => {
    const availableItems = wishlist.filter((item) => {
      const gearCountVal =
        typeof item.gearCount === "number"
          ? item.gearCount
          : typeof item.stock === "number"
            ? item.stock
            : undefined;

      return typeof gearCountVal === "number"
        ? gearCountVal > 0
        : item.inStock !== false;
    });

    if (availableItems.length === 0) {
      toast.dismiss();
      toast.error("NO IN-STOCK ITEMS AVAILABLE TO ADD.");
      return;
    }

    try {
      setLoading(true);
      toast.dismiss();

      await Promise.all(
        availableItems.map(async (item) => {
          const actualProductId =
            item.productId || item.product?._id || item._id;
          await api.post("/cart/add", {
            productId: actualProductId,
            quantity: 1,
          });
          await api.delete(`/wishlist/${item._id}`);
        }),
      );

      const movedIds = new Set(availableItems.map((item) => item._id));
      setWishlist((prev) => prev.filter((item) => !movedIds.has(item._id)));

      await refreshGlobalWishlist();

      toast.success(`MOVED ${availableItems.length} ITEMS TO YOUR CART!`);
    } catch (error: any) {
      console.error("Move all to cart error:", error);
      toast.error("FAILED TO MOVE ALL ITEMS TO CART.");
    } finally {
      setLoading(false);
    }
  };

  const handleShareWishlist = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.dismiss();
    toast.success("Wishlist link copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-brand-ivory/30 py-10 px-4 sm:px-6 lg:px-8 font-mono text-brand-dark relative">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <Link href="/">
            <Button variant="ghost" size="sm" icon={ArrowLeft}>
              BACK TO SHOP
            </Button>
          </Link>

          {wishlist.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              icon={Share2}
              onClick={handleShareWishlist}
            >
              SHARE WISHLIST
            </Button>
          )}
        </div>

        <div className="border-b border-brand-dark/15 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <span className="text-[10px] tracking-[0.25em] text-orange-600 font-bold uppercase flex items-center gap-1.5 mb-1">
              <Sparkles size={14} />
              SAVED SHINOBI GEAR & SCROLLS
            </span>
            <h1 className="text-3xl sm:text-4xl font-heading tracking-wider uppercase flex items-center gap-3">
              WISHLIST VAULT
              <span className="text-lg bg-orange-500/10 text-orange-600 border border-orange-500/30 px-2.5 py-0.5 font-bold">
                {wishlist.length}
              </span>
            </h1>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="animate-spin text-orange-600" size={32} />
            <p className="text-xs uppercase text-brand-dark/60 font-bold tracking-wider">
              LOADING VAULT DATA...
            </p>
          </div>
        ) : wishlist.length > 0 ? (
          <div className="space-y-6">
            <div className="bg-white border border-brand-dark/15 p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-xs text-brand-dark/70 uppercase">
                SHOWING{" "}
                <span className="font-bold text-brand-dark">
                  {wishlist.length}
                </span>{" "}
                SAVED ITEMS
              </p>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  icon={Trash2}
                  onClick={handleOpenDeleteAll}
                  className="text-rose-600 border-rose-500/30 hover:bg-rose-500/10"
                >
                  CLEAR ALL
                </Button>

                <Button
                  variant="chakra"
                  size="sm"
                  icon={ShoppingCart}
                  onClick={handleMoveAllToCart}
                >
                  MOVE ALL IN-STOCK TO CART
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {wishlist.map((item) => {
                const actualProductId =
                  item.productId || item.product?._id || item._id;

                const gearCountVal =
                  typeof item.gearCount === "number"
                    ? item.gearCount
                    : typeof item.stock === "number"
                      ? item.stock
                      : undefined;

                const isItemInStock =
                  typeof gearCountVal === "number"
                    ? gearCountVal > 0
                    : item.inStock !== false;

                return (
                  <div
                    key={item._id}
                    className="relative group [&_button:has(svg.lucide-heart)]:hidden"
                  >
                    <ProductCard
                      id={actualProductId}
                      name={item.name}
                      price={item.price}
                      imageUrl={item.image || "/placeholder.jpg"}
                      subCategory={item.category || "SHINOBI GEAR"}
                      stock={gearCountVal}
                      inStock={isItemInStock}
                      autoRemoveFromWishlist={true}
                      onAddToCartSuccess={() => removeItemFromState(item._id)}
                    />
                    <button
                      onClick={() =>
                        setDeleteTarget({
                          type: "single",
                          id: item._id,
                          name: item.name,
                        })
                      }
                      title="Remove from Wishlist"
                      className="absolute top-2 right-2 z-10 bg-white/90 border border-brand-dark/30 p-1.5 text-brand-dark hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-colors shadow-sm cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white border-2 border-dashed border-brand-dark/20 p-12 text-center space-y-6 max-w-2xl mx-auto my-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-500/10 border border-orange-500/30 text-orange-500 rounded-none mb-2">
              <Heart size={36} />
            </div>

            <div className="space-y-2">
              <h2 className="font-heading text-2xl tracking-wider uppercase text-brand-dark">
                YOUR WISHLIST VAULT IS EMPTY
              </h2>
              <p className="text-xs text-brand-dark/70 font-sans max-w-md mx-auto leading-relaxed">
                You haven&apos;t bookmarked any ninja gear, weapons, or scrolls
                yet. Browse our catalog and save your favorite gear for future
                missions.
              </p>
            </div>

            <div className="pt-2 flex justify-center gap-4">
              <Link href="/">
                <Button variant="chakra" size="md" icon={ShoppingBag}>
                  EXPLORE SHINOBI SHOP
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white border-2 border-brand-dark p-6 max-w-md w-full space-y-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] font-mono relative">
            <button
              onClick={() => setDeleteTarget(null)}
              className="absolute top-4 right-4 text-brand-dark/40 hover:text-brand-dark transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 border-b border-brand-dark/15 pb-3">
              <div className="p-2 bg-rose-500/10 text-rose-600 border border-rose-500/30">
                <AlertTriangle size={22} />
              </div>
              <div>
                <h3 className="font-heading text-lg tracking-wider uppercase text-brand-dark">
                  {deleteTarget.type === "all"
                    ? "CLEAR ENTIRE WISHLIST?"
                    : "REMOVE FROM WISHLIST?"}
                </h3>
                <span className="text-[10px] text-brand-dark/60 uppercase block">
                  ACTION CANNOT BE UNDONE
                </span>
              </div>
            </div>

            <p className="text-xs text-brand-dark/80 font-sans leading-relaxed">
              {deleteTarget.type === "all" ? (
                <>
                  Are you sure you want to purge <strong>ALL items</strong> from
                  your Wishlist Vault? You will need to locate these scrolls
                  again manually.
                </>
              ) : (
                <>
                  Are you sure you want to remove{" "}
                  <strong className="text-brand-dark uppercase">
                    &quot;{deleteTarget.name}&quot;
                  </strong>{" "}
                  from your saved gear list?
                </>
              )}
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteTarget(null)}
              >
                CANCEL
              </Button>
              <Button
                variant="chakra"
                size="sm"
                icon={Trash2}
                onClick={handleConfirmDelete}
                className="bg-rose-600 hover:bg-rose-700 text-white border-rose-700"
              >
                {deleteTarget.type === "all" ? "YES, CLEAR ALL" : "YES, REMOVE"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
