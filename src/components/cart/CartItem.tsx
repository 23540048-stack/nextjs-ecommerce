"use client";

import React from "react";
import Link from "next/link";
import { Plus, Minus, Trash2 } from "lucide-react";

export interface CartItemType {
  id: string;
  productId: string;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  image: string;
}

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (id: string, newQuantity: number) => void;
  onRemove: (id: string) => void;
}

export default function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
}: CartItemProps) {
  const itemTotal = item.price * item.quantity;

  const handleDecrease = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.id, item.quantity - 1);
    }
  };

  const handleIncrease = () => {
    onUpdateQuantity(item.id, item.quantity + 1);
  };

  const formatUSD = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="group relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-brand-dark/15 bg-brand-dark/5 p-4 transition-all duration-300 hover:border-orange-500/50">
      {/* PRODUCT */}

      <div className="flex items-center gap-4 w-full sm:w-auto">
        <Link
          href={`/products/${item.productId}`}
          className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden border border-brand-dark/20 bg-brand-dark/5"
        >
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        <div className="flex-1 space-y-1.5">
          <Link
            href={`/products/${item.productId}`}
            className="font-heading text-base sm:text-lg tracking-wide uppercase text-brand-dark hover:text-orange-500 transition-colors line-clamp-1"
          >
            {item.name}
          </Link>

          {/* SIZE / COLOR */}

          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            {item.size && (
              <span className="inline-flex items-center px-2 py-0.5 border border-orange-500/30 bg-orange-500/10 text-orange-600 font-bold uppercase">
                SIZE: {item.size}
              </span>
            )}

            {item.color && (
              <span className="inline-flex items-center px-2 py-0.5 border border-brand-dark/20 bg-brand-dark/5 text-brand-dark/70 font-bold uppercase">
                COLOR: {item.color}
              </span>
            )}
          </div>

          {/* UNIT PRICE */}

          <p className="font-mono text-xs text-brand-dark/70">
            PRICE:{" "}
            <span className="font-bold text-brand-dark">
              {formatUSD(item.price)}
            </span>
          </p>
        </div>
      </div>

      {/* QUANTITY / TOTAL / REMOVE */}

      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-brand-dark/15">
        {/* QUANTITY */}

        <div className="flex items-center border border-brand-dark/20 h-10 bg-brand-dark/5 font-mono">
          <button
            type="button"
            onClick={handleDecrease}
            disabled={item.quantity <= 1}
            aria-label="Decrease quantity"
            className="w-8 h-full flex items-center justify-center hover:bg-brand-dark/10 transition-colors disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed text-brand-dark"
          >
            <Minus size={13} />
          </button>

          <span className="w-10 text-center font-bold text-xs text-brand-dark border-x border-brand-dark/10">
            {item.quantity}
          </span>

          <button
            type="button"
            onClick={handleIncrease}
            aria-label="Increase quantity"
            className="w-8 h-full flex items-center justify-center hover:bg-brand-dark/10 transition-colors cursor-pointer text-brand-dark"
          >
            <Plus size={13} />
          </button>
        </div>

        {/* TOTAL */}

        <div className="text-right min-w-25 font-mono">
          <span className="block text-[10px] text-brand-dark/50 uppercase font-bold tracking-wider">
            TOTAL
          </span>

          <span className="text-base sm:text-lg font-bold text-brand-dark">
            {formatUSD(itemTotal)}
          </span>
        </div>

        {/* REMOVE */}

        <button
          type="button"
          onClick={() => onRemove(item.id)}
          aria-label="Remove item"
          title="Remove from cart"
          className="h-10 w-10 border border-brand-dark/20 flex items-center justify-center text-brand-dark/60 hover:border-red-600 hover:text-red-600 hover:bg-red-600/10 transition-colors cursor-pointer shrink-0"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
