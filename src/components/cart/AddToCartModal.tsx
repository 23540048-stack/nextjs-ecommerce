"use client";

import React from "react";
import Link from "next/link";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { ArrowRight, Check, ShoppingBag } from "lucide-react";

export interface CartProductInfo {
  name: string;
  image: string;
  price: string;
  size?: string;
  quantity: number;
  id?: string;
  productId?: string;
}

interface AddToCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: CartProductInfo | null;
}

export default function AddToCartModal({
  isOpen,
  onClose,
  product,
}: AddToCartModalProps) {
  if (!product) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="ADDED TO ARCHIVE CART"
      maxWidth="md"
    >
      <div className="space-y-6">
        {/* Thông báo thành công */}
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-600 bg-emerald-500/10 p-2.5 border border-emerald-500/20 uppercase">
          <Check size={16} />
          <span>GEAR SUCCESSFULLY ADDED TO INVENTORY</span>
        </div>

        {/* Thông tin chi tiết sản phẩm vừa thêm */}
        <div className="flex gap-4 items-center bg-brand-dark/5 p-4 border border-brand-dark/15">
          <div className="relative w-20 h-20 aspect-square border border-brand-dark/15 overflow-hidden shrink-0 bg-brand-dark/5">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
          </div>

          <div className="font-mono text-xs space-y-1.5 grow">
            <h4 className="font-heading text-base font-bold text-brand-dark uppercase tracking-wide line-clamp-1">
              {product.name}
            </h4>

            <div className="flex items-center gap-3 text-brand-dark/60">
              <span>
                SIZE:{" "}
                <strong className="text-brand-dark">
                  {product.size || "FREE"}
                </strong>
              </span>
              <span>|</span>
              <span>
                QTY:{" "}
                <strong className="text-brand-dark">{product.quantity}</strong>
              </span>
            </div>

            <p className="text-sm font-bold text-orange-500 font-mono">
              {product.price}
            </p>
          </div>
        </div>

        {/* Nút thao tác tiếp theo */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2 font-mono">
          <Button
            variant="outline"
            className="w-full sm:w-1/2"
            onClick={onClose}
          >
            CONTINUE SHOPPING
          </Button>

          <Link href="/cart" className="w-full sm:w-1/2" onClick={onClose}>
            <Button icon={ArrowRight} className="w-full">
              VIEW CART
            </Button>
          </Link>
        </div>
      </div>
    </Modal>
  );
}
