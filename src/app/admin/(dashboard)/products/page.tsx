"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { api } from "@/lib/api";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  Package,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Interface Category
interface Category {
  _id: string;
  name: string;
}

// Interface Product
interface Product {
  _id: string;
  name: string;
  sku?: string;
  category?: string | Category;
  price: number;
  stock: number;
  status?: string;
  imageUrl?: string;
  images?: string[];
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // State Phân trang & Tổng số lượng từ Server
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalProducts, setTotalProducts] = useState(0);

  // State cho Modal xóa sản phẩm
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Gọi API lấy danh sách sản phẩm từ NestJS Backend với Server-side Pagination & Search
  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMsg("");

      // Gửi params: page, limit, search xuống NestJS Backend
      const response = await api.get("/products", {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: searchQuery.trim() || undefined,
        },
      });

      const resData = response.data;

      // Xử lý cấu trúc trả về dạng { data: [...], meta: { total, ... } } từ NestJS
      if (resData && Array.isArray(resData.data)) {
        setProducts(resData.data);
        setTotalProducts(resData.meta?.total ?? resData.data.length);
      } else if (Array.isArray(resData)) {
        setProducts(resData);
        setTotalProducts(resData.length);
      } else {
        setProducts([]);
        setTotalProducts(0);
      }
    } catch (error: any) {
      console.error("Failed to fetch products:", error);
      setErrorMsg(
        error.response?.data?.message || "FAILED TO LOAD GEARS FROM VAULT.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, searchQuery]);

  // Tự động gọi lại API mỗi khi thay đổi trang, số lượng hiển thị, hoặc từ khóa tìm kiếm
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Xử lý khi thay đổi ô tìm kiếm (reset về trang 1)
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  // Xử lý khi chọn số sản phẩm / trang (reset về trang 1)
  const handleItemsPerPageChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Xử lý hiển thị Category an toàn (tránh lỗi React child object)
  const renderCategory = (category?: string | Category) => {
    if (!category) return "GENERAL";
    if (typeof category === "object" && category !== null) {
      return category.name || "GENERAL";
    }
    return String(category);
  };

  // Hàm hỗ trợ lấy URL ảnh đầu tiên
  const getProductImage = (product: Product) => {
    if (product.imageUrl && !product.imageUrl.startsWith("blob:")) {
      return product.imageUrl;
    }
    if (
      Array.isArray(product.images) &&
      product.images.length > 0 &&
      !product.images[0].startsWith("blob:")
    ) {
      return product.images[0];
    }
    return null;
  };

  // Hàm xử lý xóa sản phẩm
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setIsDeleting(true);
      await api.delete(`/products/${deleteId}`);
      setDeleteId(null);
      // Gọi lại API để cập nhật danh sách và tổng số lượng mới nhất từ server
      fetchProducts();
    } catch (error: any) {
      console.error("Delete error:", error);
      alert(error.response?.data?.message || "FAILED TO DELETE GEAR.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Tính toán số trang dựa theo totalProducts nhận từ Backend
  const totalPages = Math.ceil(totalProducts / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-mono">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-brand-dark/15">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 tracking-widest uppercase">
              CHAKRA VAULT
            </span>
            <span className="text-xs font-bold text-brand-dark/60">
              TOTAL: {totalProducts} GEARS
            </span>
          </div>
          <h1 className="font-heading text-xl sm:text-2xl tracking-wider text-brand-dark uppercase mt-0.5">
            PRODUCT MANAGEMENT
          </h1>
        </div>

        <Link href="/admin/products/new">
          <Button variant="chakra" size="sm" icon={Plus}>
            ADD NEW GEAR
          </Button>
        </Link>
      </div>

      {/* ERROR NOTICE */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border-2 border-rose-600 text-rose-600 text-xs font-bold flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(225,29,72,1)]">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
          <Button variant="outline" size="sm" onClick={fetchProducts}>
            RETRY
          </Button>
        </div>
      )}

      {/* SEARCH BAR & ITEMS PER PAGE SELECTOR */}
      <div className="bg-white border-2 border-brand-dark p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-dark/50"
          />
          <input
            type="text"
            placeholder="SEARCH BY GEAR NAME OR SKU..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-4 py-2 bg-brand-ivory/20 border-2 border-brand-dark text-xs font-mono focus:outline-hidden focus:border-orange-600"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-bold self-end sm:self-auto">
          <span>SHOW:</span>
          <select
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="bg-white border-2 border-brand-dark px-2 py-1 focus:outline-none cursor-pointer"
          >
            <option value={10}>10 / PAGE</option>
            <option value={20}>20 / PAGE</option>
            <option value={50}>50 / PAGE</option>
            <option value={100}>100 / PAGE</option>
          </select>
        </div>
      </div>

      {/* TABLE PRODUCTS */}
      <div className="bg-white border-2 border-brand-dark shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-x-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-3">
            <Loader2 className="animate-spin text-orange-600" size={32} />
            <span className="text-xs font-bold tracking-wider">
              LOADING GEARS DATA...
            </span>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-brand-dark/50 space-y-2">
            <Package size={40} />
            <span className="text-xs font-bold uppercase">
              NO GEARS FOUND IN VAULT
            </span>
          </div>
        ) : (
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-brand-dark text-white uppercase text-[11px] tracking-wider border-b-2 border-brand-dark">
              <tr>
                <th className="p-3">IMAGE</th>
                <th className="p-3">GEAR NAME</th>
                <th className="p-3">CATEGORY</th>
                <th className="p-3">PRICE</th>
                <th className="p-3">STOCK</th>
                <th className="p-3">STATUS</th>
                <th className="p-3 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-brand-dark/10">
              {products.map((product) => {
                const imgUrl = getProductImage(product);

                return (
                  <tr
                    key={product._id}
                    className="hover:bg-orange-500/5 transition-colors"
                  >
                    {/* CỘT HIỂN THỊ HÌNH ẢNH */}
                    <td className="p-3">
                      <div className="w-12 h-12 border-2 border-brand-dark bg-brand-ivory/30 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex items-center justify-center">
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center text-brand-dark/40">
                            <ImageIcon size={18} />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* GEAR NAME & SKU */}
                    <td className="p-3 font-bold text-brand-dark">
                      <div>{product.name}</div>
                      {product.sku && (
                        <span className="text-[10px] text-brand-dark/50 block font-normal">
                          SKU: {product.sku}
                        </span>
                      )}
                    </td>

                    {/* CATEGORY */}
                    <td className="p-3">
                      <span className="bg-brand-ivory/80 border border-brand-dark px-2 py-0.5 text-[10px] font-bold uppercase">
                        {renderCategory(product.category)}
                      </span>
                    </td>

                    {/* PRICE */}
                    <td className="p-3 font-bold text-orange-600">
                      $
                      {product.price.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>

                    {/* STOCK */}
                    <td className="p-3 font-bold">{product.stock} pcs</td>

                    {/* STATUS */}
                    <td className="p-3">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-bold border uppercase ${
                          product.status === "OUT_OF_STOCK" ||
                          product.stock === 0
                            ? "bg-rose-100 text-rose-800 border-rose-600"
                            : product.status === "LOW_STOCK" ||
                                product.stock < 5
                              ? "bg-amber-100 text-amber-800 border-amber-600"
                              : "bg-emerald-100 text-emerald-800 border-emerald-600"
                        }`}
                      >
                        {product.status === "OUT_OF_STOCK" ||
                        product.stock === 0
                          ? "OUT OF STOCK"
                          : product.status === "LOW_STOCK"
                            ? "LOW STOCK"
                            : "IN STOCK"}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/products/${product._id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            icon={Edit}
                            className="p-1.5"
                          />
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={Trash2}
                          className="p-1.5 border-rose-600 text-rose-600 hover:bg-rose-50"
                          onClick={() => {
                            setDeleteId(product._id);
                            setDeleteName(product.name);
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* PAGINATION CONTROLS */}
      {!isLoading && products.length > 0 && (
        <div className="bg-white border-2 border-brand-dark p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
          <div>
            SHOWING{" "}
            <span className="font-bold">
              {startIndex + 1}-
              {Math.min(startIndex + itemsPerPage, totalProducts)}
            </span>{" "}
            OF <span className="font-bold">{totalProducts}</span> GEARS
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              icon={ChevronLeft}
            >
              PREV
            </Button>

            <span className="font-bold px-2">
              PAGE {currentPage} / {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              icon={ChevronRight}
            >
              NEXT
            </Button>
          </div>
        </div>
      )}

      {/* MODAL XÁC NHẬN XÓA SẢN PHẨM */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="CONFIRM DELETE GEAR"
      >
        <div className="space-y-4 font-mono text-xs text-brand-dark">
          <p>
            Are you sure you want to delete gear{" "}
            <span className="font-bold text-orange-600">"{deleteName}"</span>{" "}
            from Chakra Vault?
          </p>

          <div className="flex justify-end gap-2 pt-3 border-t border-brand-dark/15">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteId(null)}
              disabled={isDeleting}
            >
              CANCEL
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon={isDeleting ? Loader2 : Trash2}
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "DELETING..." : "CONFIRM DELETE"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
