"use client";

import React, { useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { ArrowRight, Tag, ShieldCheck, Truck, X } from "lucide-react";

interface AppliedCoupon {
  code: string;
  discountType: string;
  discountValue: number;
  discountAmount: number;
  originalValue: number;
  finalAmount: number;
}

interface CartSummaryProps {
  subtotal: number;
  shippingFee?: number;
  discount?: number;

  appliedCoupon?: AppliedCoupon | null;

  onApplyCoupon?: (code: string) => Promise<boolean> | boolean;

  onRemoveCoupon?: () => void;

  onCheckout?: () => void;

  // Chỉ hiển thị nút checkout ở Cart
  showCheckoutButton?: boolean;
}

export default function CartSummary({
  subtotal,
  shippingFee = 30,
  discount = 0,
  appliedCoupon = null,
  onApplyCoupon,
  onRemoveCoupon,
  onCheckout,
  showCheckoutButton = true,
}: CartSummaryProps) {
  const [couponCode, setCouponCode] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [couponError, setCouponError] = useState("");

  // ============================================================
  // USD FORMAT
  // ============================================================

  const formatUSD = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // ============================================================
  // SHIPPING
  // ============================================================

  const freeShippingThreshold = 500;

  const isFreeShipping = subtotal >= freeShippingThreshold;

  const actualShippingFee = isFreeShipping ? 0 : shippingFee;

  // ============================================================
  // TOTAL
  // ============================================================

  const total = Math.max(0, subtotal + actualShippingFee - discount);

  // ============================================================
  // APPLY COUPON
  // ============================================================

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();

    const code = couponCode.trim().toUpperCase();

    if (!code) {
      setCouponError("PLEASE ENTER A PROMO CODE");
      return;
    }

    if (!onApplyCoupon) {
      setCouponError("PROMO CODE SERVICE IS UNAVAILABLE");
      return;
    }

    try {
      setIsApplying(true);
      setCouponError("");

      const success = await onApplyCoupon(code);

      if (success) {
        setCouponCode("");
        setCouponError("");
      } else {
        setCouponError("INVALID OR UNAVAILABLE PROMO CODE");
      }
    } catch (error) {
      console.error("Failed to apply coupon:", error);
      setCouponError("UNABLE TO APPLY PROMO CODE");
    } finally {
      setIsApplying(false);
    }
  };

  // ============================================================
  // REMOVE COUPON
  // ============================================================

  const handleRemoveCoupon = () => {
    if (onRemoveCoupon) {
      onRemoveCoupon();
    }

    setCouponCode("");
    setCouponError("");
  };

  return (
    <div className="border border-brand-dark/15 bg-brand-dark/5 p-6 font-mono space-y-6">
      {/* HEADER */}

      <div className="border-b border-brand-dark/15 pb-4">
        <h2 className="font-heading text-xl tracking-widest uppercase text-brand-dark">
          ORDER SUMMARY
        </h2>

        <p className="text-[11px] text-brand-dark/60 font-sans mt-0.5">
          SUBTOTAL AND SHIPPING CALCULATIONS
        </p>
      </div>

      {/* FREE SHIPPING */}

      <div className="space-y-2">
        <div className="flex justify-between text-xs font-sans">
          <span className="text-brand-dark/80">
            {isFreeShipping ? (
              <span className="text-orange-600 font-bold">
                ✓ YOU ARE ELIGIBLE FOR FREE SHIPPING!
              </span>
            ) : (
              <>
                Add{" "}
                <strong className="text-brand-dark font-mono font-bold">
                  {formatUSD(Math.max(0, freeShippingThreshold - subtotal))}
                </strong>{" "}
                more to unlock free shipping
              </>
            )}
          </span>
        </div>

        <div className="w-full bg-brand-dark/10 h-1.5 overflow-hidden">
          <div
            className="bg-orange-500 h-full transition-all duration-500"
            style={{
              width: `${Math.min(
                100,
                (subtotal / freeShippingThreshold) * 100,
              )}%`,
            }}
          />
        </div>
      </div>

      {/* APPLIED COUPON */}

      {appliedCoupon && (
        <div className="border border-green-600/30 bg-green-600/5 p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] text-green-700 font-bold uppercase">
                PROMO CODE APPLIED
              </p>

              <p className="text-sm font-bold text-green-700">
                {appliedCoupon.code}
              </p>

              <p className="text-[11px] text-green-700/80">
                Discount: {formatUSD(appliedCoupon.discountAmount)}
              </p>
            </div>

            {onRemoveCoupon && (
              <button
                type="button"
                onClick={handleRemoveCoupon}
                className="h-8 w-8 flex items-center justify-center border border-green-600/30 text-green-700 hover:bg-green-600/10 transition-colors"
                title="Remove promo code"
                aria-label="Remove promo code"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* PROMO CODE */}

      {!appliedCoupon && onApplyCoupon && (
        <form onSubmit={handleApplyCoupon} className="space-y-2">
          <div className="flex items-start gap-2">
            <div className="grow">
              <Input
                icon={Tag}
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value);
                  setCouponError("");
                }}
                placeholder="PROMO CODE"
                error={couponError}
                className="uppercase tracking-wider"
                disabled={isApplying}
              />
            </div>

            <Button
              type="submit"
              variant="chakra"
              size="md"
              className="shrink-0 h-9.5"
              disabled={isApplying}
            >
              {isApplying ? "CHECKING..." : "APPLY"}
            </Button>
          </div>
        </form>
      )}

      {/* PRICE BREAKDOWN */}

      <div className="space-y-3 pt-4 border-t border-brand-dark/15 text-xs">
        {/* SUBTOTAL */}

        <div className="flex justify-between text-brand-dark/70">
          <span>SUBTOTAL</span>

          <span className="font-bold text-brand-dark">
            {formatUSD(subtotal)}
          </span>
        </div>

        {/* SHIPPING */}

        <div className="flex justify-between text-brand-dark/70">
          <span>SHIPPING FEE</span>

          <span className="font-bold text-brand-dark">
            {isFreeShipping ? (
              <span className="text-orange-600">FREE</span>
            ) : (
              formatUSD(actualShippingFee)
            )}
          </span>
        </div>

        {/* DISCOUNT */}

        {discount > 0 && (
          <div className="flex justify-between text-green-600 font-bold">
            <span>DISCOUNT</span>

            <span>-{formatUSD(discount)}</span>
          </div>
        )}

        {/* TOTAL */}

        <div className="flex justify-between items-baseline pt-4 border-t border-brand-dark/15 text-base text-brand-dark font-bold">
          <span className="font-heading tracking-wider">ESTIMATED TOTAL</span>

          <span className="text-xl text-orange-600">{formatUSD(total)}</span>
        </div>
      </div>

      {/* CHECKOUT BUTTON
          Chỉ hiển thị khi showCheckoutButton = true
      */}

      {showCheckoutButton &&
        (onCheckout ? (
          <Button
            variant="chakra"
            size="lg"
            icon={ArrowRight}
            className="w-full"
            onClick={onCheckout}
          >
            PROCEED TO CHECKOUT
          </Button>
        ) : (
          <Link href="/checkout" className="block w-full">
            <Button
              variant="chakra"
              size="lg"
              icon={ArrowRight}
              className="w-full"
            >
              PROCEED TO CHECKOUT
            </Button>
          </Link>
        ))}

      {/* BADGES */}

      <div className="pt-4 border-t border-brand-dark/15 space-y-2 text-[11px] text-brand-dark/70 font-sans">
        <div className="flex items-center gap-2">
          <Truck size={15} className="text-orange-500 shrink-0" />

          <span>Express nationwide ninja delivery (2 - 4 business days)</span>
        </div>

        <div className="flex items-center gap-2">
          <ShieldCheck size={15} className="text-orange-500 shrink-0" />

          <span>Encrypted checkout & 100% authentic Shinobi gear</span>
        </div>
      </div>
    </div>
  );
}
