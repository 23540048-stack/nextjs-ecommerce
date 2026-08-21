"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import {
  ShieldAlert,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Power,
  ChevronRight,
  ArrowUpDown,
  Image as ImageIcon,
  Loader2,
  ChevronDown,
  Check,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import { api } from "@/lib/api";

export interface Category {
  _id: string;
  name: string;
  icon?: string;
}

export interface Product {
  _id: string;
  name: string;
  sku?: string;
  price: number;
  imageUrl?: string;
  category?: Category | string;
}

export interface FeaturedProductItem {
  _id: string;
  productId: Product;
  badgeLabel: "HOT" | "LIMITED" | "NEW" | "TOP RATED";
  displayOrder: number;
  status: "active" | "inactive";
}

export default function FeaturedProductsPage() {
  const [featuredList, setFeaturedList] = useState<FeaturedProductItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filter & Search ở Bảng ngoài Trang
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedFeatured, setSelectedFeatured] =
    useState<FeaturedProductItem | null>(null);

  const [formData, setFormData] = useState({
    productId: "",
    badgeLabel: "HOT" as FeaturedProductItem["badgeLabel"],
    displayOrder: "1",
    status: "active" as FeaturedProductItem["status"],
  });

  // State tìm kiếm sản phẩm realtime từ Database Backend cho Modal
  const [productSearchInput, setProductSearchInput] = useState("");
  const [searchedProducts, setSearchedProducts] = useState<Product[]>([]);
  const [isSearchingProducts, setIsSearchingProducts] = useState(false);
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const [selectedProductObj, setSelectedProductObj] = useState<Product | null>(
    null,
  );

  // HELPER: Map Badge Variant
  const getBadgeVariant = (
    label: string,
  ): "new" | "limited" | "orange" | "danger" | "default" => {
    switch (label?.toUpperCase()) {
      case "NEW":
        return "new";
      case "LIMITED":
        return "limited";
      case "HOT":
        return "orange";
      case "TOP RATED":
        return "danger";
      default:
        return "default";
    }
  };

  // 1. FETCH FEATURED PRODUCTS
  const fetchFeaturedProducts = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (searchQuery) queryParams.append("search", searchQuery);
      if (categoryFilter !== "all")
        queryParams.append("category", categoryFilter);

      const res = await api.get(`/featured-products?${queryParams.toString()}`);
      const rawData = res.data;
      const list = Array.isArray(rawData)
        ? rawData
        : Array.isArray(rawData?.data)
          ? rawData.data
          : [];

      setFeaturedList(list);
    } catch (error: any) {
      console.error("Failed to fetch featured list:", error);
      toast.error(
        error.response?.data?.message || "Error loading featured products!",
      );
    } finally {
      setLoading(false);
    }
  }, [searchQuery, categoryFilter]);

  // 2. FETCH CATEGORIES
  const fetchCategories = useCallback(async () => {
    try {
      const catRes = await api.get("/categories");
      setCategories(catRes.data?.data || catRes.data || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  }, []);

  useEffect(() => {
    fetchFeaturedProducts();
    fetchCategories();
  }, [fetchFeaturedProducts, fetchCategories]);

  // 3. DYNAMIC SEARCH TOÀN BỘ DATABASE SẢN PHẨM KHI CÓ TỪ KHÓA TÌM KIẾM
  useEffect(() => {
    if (!isFormModalOpen) return;

    const timer = setTimeout(async () => {
      try {
        setIsSearchingProducts(true);
        const res = await api.get(
          `/products?search=${encodeURIComponent(productSearchInput.trim())}`,
        );
        const list = res.data?.data || res.data || [];
        setSearchedProducts(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Failed to search products from database:", err);
      } finally {
        setIsSearchingProducts(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [productSearchInput, isFormModalOpen]);

  const handleOpenAddModal = () => {
    setSelectedFeatured(null);
    setSelectedProductObj(null);
    setFormData({
      productId: "",
      badgeLabel: "HOT",
      displayOrder: (featuredList.length + 1).toString(),
      status: "active",
    });
    setProductSearchInput("");
    setIsProductDropdownOpen(false);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (item: FeaturedProductItem) => {
    setSelectedFeatured(item);
    setSelectedProductObj(item.productId || null);
    setFormData({
      productId: item.productId?._id || "",
      badgeLabel: item.badgeLabel || "HOT",
      displayOrder: item.displayOrder ? item.displayOrder.toString() : "1",
      status: item.status || "active",
    });
    setProductSearchInput("");
    setIsProductDropdownOpen(false);
    setIsFormModalOpen(true);
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await api.patch(`/featured-products/${id}/toggle-status`);
      toast.success("Display status updated!");
      fetchFeaturedProducts();
    } catch {
      toast.error("Failed to toggle status!");
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productId) {
      toast.error("Please select a product!");
      return;
    }

    const toastId = toast.loading("Processing...");

    try {
      const payload = {
        productId: formData.productId,
        badgeLabel: formData.badgeLabel,
        displayOrder: Number(formData.displayOrder || 1),
        status: formData.status,
      };

      if (selectedFeatured) {
        await api.put(`/featured-products/${selectedFeatured._id}`, payload);
        toast.success("Featured settings updated!", { id: toastId });
      } else {
        await api.post("/featured-products", payload);
        toast.success("Product added to featured list!", { id: toastId });
      }

      setIsFormModalOpen(false);
      fetchFeaturedProducts();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to save featured product!",
        { id: toastId },
      );
    }
  };

  const handleDelete = async () => {
    if (!selectedFeatured) return;
    const toastId = toast.loading("Removing...");

    try {
      await api.delete(`/featured-products/${selectedFeatured._id}`);
      toast.success("Product removed from featured list!", { id: toastId });
      setIsDeleteModalOpen(false);
      setSelectedFeatured(null);
      fetchFeaturedProducts();
    } catch {
      toast.error("Failed to remove product!", { id: toastId });
    }
  };

  const renderCategoryName = (category: Category | string | undefined) => {
    if (!category) return "N/A";
    if (typeof category === "object") return category.name;
    const found = categories.find((c) => c._id === category);
    return found ? found.name : "N/A";
  };

  return (
    <div className="w-full min-h-screen bg-white text-brand-dark p-6 sm:p-8 font-mono space-y-8">
      <Toaster position="top-right" />

      {/* HEADER */}
      <div className="border-b-2 border-brand-dark/15 pb-6">
        <div className="flex items-center gap-2 text-xs text-brand-dark/60 uppercase mb-2">
          <Link href="/admin">ADMIN DASHBOARD</Link>
          <ChevronRight size={14} />
          <span>MARKETING</span>
          <ChevronRight size={14} />
          <span className="text-brand-dark font-bold">FEATURED PRODUCTS</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading tracking-wide uppercase flex items-center gap-2">
              <ShieldAlert className="text-orange-600" size={28} /> FEATURED
              PRODUCTS
            </h1>
            <p className="text-xs text-brand-dark/60 mt-1">
              LINK REAL VAULT PRODUCTS DIRECTLY TO HOMEPAGE PROMOTIONS
            </p>
          </div>

          <Button
            variant="chakra"
            size="sm"
            icon={Plus}
            onClick={handleOpenAddModal}
          >
            ADD FEATURED PRODUCT
          </Button>
        </div>
      </div>

      {/* SEARCH & FILTER TRÊN BẢNG */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        <Input
          icon={Search}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="SEARCH FEATURED PRODUCT NAME..."
          className="uppercase"
        />

        <div className="flex items-center gap-2 border-2 border-brand-dark px-3 py-2 bg-brand-ivory/20 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <Filter size={14} className="text-brand-dark/60" />
          <span className="font-bold text-[10px] text-brand-dark/60 uppercase">
            CATEGORY:
          </span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-transparent outline-none font-bold uppercase cursor-pointer text-xs"
          >
            <option value="all">ALL CATEGORIES</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="border-2 border-brand-dark overflow-x-auto bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-brand-dark text-white uppercase text-[11px] tracking-wider border-b-2 border-brand-dark">
              <th className="py-3 px-4">ORDER</th>
              <th className="py-3 px-4">LINKED PRODUCT</th>
              <th className="py-3 px-4">CATEGORY</th>
              <th className="py-3 px-4">PRICE</th>
              <th className="py-3 px-4">BADGE</th>
              <th className="py-3 px-4">STATUS</th>
              <th className="py-3 px-4 text-center">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-dark/15">
            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-12 text-center text-brand-dark/50"
                >
                  <div className="flex items-center justify-center gap-2 font-bold">
                    <Loader2
                      size={18}
                      className="animate-spin text-orange-500"
                    />
                    SYNCING VAULT PRODUCTS...
                  </div>
                </td>
              </tr>
            ) : featuredList.length > 0 ? (
              featuredList.map((item) => {
                const product = item.productId;
                if (!product) return null;

                return (
                  <tr
                    key={item._id}
                    className="hover:bg-brand-dark/5 transition-colors"
                  >
                    <td className="py-4 px-4 font-bold text-center w-12">
                      <span className="flex items-center gap-1">
                        <ArrowUpDown size={12} className="text-brand-dark/40" />
                        #{item.displayOrder}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-dark/10 border border-brand-dark flex items-center justify-center shrink-0 overflow-hidden">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon
                              size={16}
                              className="text-brand-dark/40"
                            />
                          )}
                        </div>
                        <div>
                          <span className="font-bold uppercase text-brand-dark block">
                            {product.name}
                          </span>
                          <span className="text-[10px] text-brand-dark/50">
                            SKU: {product.sku || product._id}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-bold text-brand-dark/80">
                      <span className="px-2 py-0.5 bg-brand-dark/5 border border-brand-dark/20 text-[10px] uppercase">
                        {renderCategoryName(product.category)}
                      </span>
                    </td>

                    <td className="py-4 px-4 font-bold text-orange-600">
                      {product.price?.toLocaleString()} $
                    </td>

                    <td className="py-4 px-4">
                      <Badge
                        variant={getBadgeVariant(item.badgeLabel)}
                        size="sm"
                      >
                        {item.badgeLabel}
                      </Badge>
                    </td>

                    <td className="py-4 px-4">
                      {item.status === "active" ? (
                        <Badge variant="orange" size="sm">
                          ACTIVE
                        </Badge>
                      ) : (
                        <Badge variant="outline" size="sm">
                          INACTIVE
                        </Badge>
                      )}
                    </td>

                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(item._id)}
                          className={`p-1.5 border transition-colors cursor-pointer ${
                            item.status === "active"
                              ? "border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10"
                              : "border-rose-500/40 text-rose-600 hover:bg-rose-500/10"
                          }`}
                        >
                          <Power size={13} />
                        </button>

                        <Button
                          variant="outline"
                          size="sm"
                          icon={Edit}
                          onClick={() => handleOpenEditModal(item)}
                        >
                          EDIT
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          icon={Trash2}
                          onClick={() => {
                            setSelectedFeatured(item);
                            setIsDeleteModalOpen(true);
                          }}
                        >
                          DELETE
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="py-10 text-center text-brand-dark/50"
                >
                  NO FEATURED PRODUCTS LINKED YET.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* FORM MODAL */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setIsProductDropdownOpen(false);
        }}
        title={
          selectedFeatured
            ? "EDIT FEATURED PROMOTION"
            : "LINK PRODUCT TO FEATURED"
        }
        maxWidth="md"
      >
        <form
          onSubmit={handleSubmitForm}
          className="space-y-4 text-xs font-mono"
        >
          {/* DATABASE-WIDE SEARCH COMBOBOX */}
          <div className="space-y-1 relative">
            <label className="text-xs font-bold text-brand-dark uppercase block">
              SEARCH & SELECT ANY PRODUCT FROM DATABASE *
            </label>

            <div className="relative">
              <input
                type="text"
                disabled={!!selectedFeatured}
                placeholder="TYPE PRODUCT NAME OR SKU TO SEARCH DATABASE..."
                value={
                  isProductDropdownOpen
                    ? productSearchInput
                    : selectedProductObj
                      ? `${selectedProductObj.name} ($${selectedProductObj.price?.toLocaleString()})`
                      : ""
                }
                onFocus={() => {
                  if (!selectedFeatured) {
                    setIsProductDropdownOpen(true);
                  }
                }}
                onChange={(e) => {
                  setProductSearchInput(e.target.value);
                  if (!isProductDropdownOpen) setIsProductDropdownOpen(true);
                }}
                className="w-full bg-brand-ivory/20 border-2 border-brand-dark p-2 pr-8 text-xs font-bold uppercase focus:outline-none focus:border-orange-600 disabled:opacity-50"
              />
              {isSearchingProducts ? (
                <Loader2
                  size={16}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-orange-600 animate-spin pointer-events-none"
                />
              ) : (
                <ChevronDown
                  size={16}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-dark/60 pointer-events-none"
                />
              )}
            </div>

            {/* Overlay đóng Dropdown khi click ra ngoài */}
            {isProductDropdownOpen && (
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsProductDropdownOpen(false)}
              />
            )}

            {/* List kết quả tìm kiếm trực tiếp từ Backend */}
            {isProductDropdownOpen && !selectedFeatured && (
              <div className="absolute z-20 top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border-2 border-brand-dark shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] divide-y divide-brand-dark/10">
                {isSearchingProducts ? (
                  <div className="p-3 text-center text-xs text-brand-dark/50 flex items-center justify-center gap-2">
                    <Loader2
                      size={14}
                      className="animate-spin text-orange-600"
                    />
                    SEARCHING ALL PRODUCTS...
                  </div>
                ) : searchedProducts.length > 0 ? (
                  searchedProducts.map((p) => {
                    const isSelected = formData.productId === p._id;
                    return (
                      <button
                        key={p._id}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, productId: p._id });
                          setSelectedProductObj(p);
                          setIsProductDropdownOpen(false);
                        }}
                        className={`w-full text-left p-2.5 text-xs font-bold uppercase hover:bg-orange-500 hover:text-white transition-colors flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? "bg-brand-dark text-white"
                            : "text-brand-dark"
                        }`}
                      >
                        <div className="truncate pr-2">
                          <div>{p.name}</div>
                          {p.sku && (
                            <div className="text-[10px] opacity-60">
                              SKU: {p.sku}
                            </div>
                          )}
                        </div>
                        <div className="shrink-0 flex items-center gap-2">
                          <span className="text-[11px] font-extrabold">
                            ${p.price?.toLocaleString()}
                          </span>
                          {isSelected && <Check size={14} />}
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="p-3 text-center text-xs text-brand-dark/50">
                    NO PRODUCTS FOUND MATCHING "
                    {productSearchInput.toUpperCase()}"
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-brand-dark uppercase block">
                BADGE LABEL
              </label>
              <select
                value={formData.badgeLabel}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    badgeLabel: e.target
                      .value as FeaturedProductItem["badgeLabel"],
                  })
                }
                className="w-full bg-brand-ivory/20 border-2 border-brand-dark p-2 text-xs font-bold uppercase focus:outline-none focus:border-orange-600"
              >
                <option value="HOT">🔥 HOT</option>
                <option value="NEW">⚡ NEW</option>
                <option value="LIMITED">🚨 LIMITED</option>
                <option value="TOP RATED">⭐ TOP RATED</option>
              </select>
            </div>

            <Input
              label="DISPLAY ORDER"
              type="number"
              value={formData.displayOrder}
              onChange={(e) =>
                setFormData({ ...formData, displayOrder: e.target.value })
              }
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-brand-dark uppercase block">
              HOMEPAGE STATUS
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as FeaturedProductItem["status"],
                })
              }
              className="w-full bg-brand-ivory/20 border-2 border-brand-dark p-2 text-xs font-bold uppercase focus:outline-none focus:border-orange-600"
            >
              <option value="active">ACTIVE (VISIBLE)</option>
              <option value="inactive">INACTIVE (HIDDEN)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-brand-dark/15">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsFormModalOpen(false);
                setIsProductDropdownOpen(false);
              }}
            >
              CANCEL
            </Button>
            <Button type="submit" variant="chakra" size="sm" icon={Plus}>
              {selectedFeatured ? "SAVE CHANGES" : "LINK FEATURED"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* DELETE MODAL */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="REMOVE FEATURED LINK"
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs font-mono">
          <p className="leading-relaxed text-brand-dark">
            Are you sure you want to remove{" "}
            <strong className="text-rose-600 uppercase font-bold">
              {selectedFeatured?.productId?.name}
            </strong>{" "}
            from Featured list? (The main product in Vault will not be deleted).
          </p>

          <div className="flex justify-end gap-2 pt-2 border-t border-brand-dark/15">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              CANCEL
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              icon={Trash2}
              onClick={handleDelete}
            >
              CONFIRM REMOVE
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
