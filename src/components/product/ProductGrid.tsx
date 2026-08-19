import React from "react";
import ProductCard, { ProductProps } from "./ProductCard";

interface ProductGridProps {
  products: ProductProps[];
  emptyMessage?: string;
}

export default function ProductGrid({
  products,
  emptyMessage = "NO NINJA GEAR FOUND IN THIS ARCHIVE.",
}: ProductGridProps) {
  // Trạng thái khi không có sản phẩm
  if (products.length === 0) {
    return (
      <div className="py-16 text-center border border-dashed border-brand-dark/20 font-mono text-xs text-brand-dark/60 uppercase my-8">
        [ {emptyMessage} ]
      </div>
    );
  }

  // Khung lưới hiển thị danh sách
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} {...product} />
      ))}
    </div>
  );
}
