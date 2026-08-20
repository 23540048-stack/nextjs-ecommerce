"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import MediaUpload from "@/components/ui/MediaUpload";
import { api } from "@/lib/api";
import {
  ArrowLeft,
  PlusCircle,
  Flame,
  AlertCircle,
  X,
  Plus,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

interface Category {
  _id: string;
  name: string;
  slug?: string;
  icon?: string;
  status?: string;
}

export default function NewProductPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    price: "",
    stock: "",
    status: "ACTIVE",
    imagesList: [] as string[],
    videosList: [] as string[],
    sizes: [] as string[],
    description: "",
    material: "Heavyweight Cotton Canvas",
    origin: "Leaf Village Archives",
    quality: "Standard Shinobi",
  });

  const [sizeInput, setSizeInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [showToast, setShowToast] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  // 1. FETCH CATEGORIES
  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get("/categories");
      const data = response.data?.data || response.data;
      if (Array.isArray(data)) {
        const activeCategories = data.filter(
          (c: Category) => !c.status || c.status === "ACTIVE",
        );
        setCategories(activeCategories);

        if (activeCategories.length > 0) {
          setFormData((prev) => ({
            ...prev,
            category: prev.category || activeCategories[0]._id,
          }));
        }
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Bọc useCallback để tránh re-render gián đoạn event của component con
  const handleImagesChange = useCallback((imgs: string[]) => {
    setFormData((prev) => ({ ...prev, imagesList: imgs }));
  }, []);

  const handleVideosChange = useCallback((videos: string[]) => {
    setFormData((prev) => ({ ...prev, videosList: videos }));
  }, []);

  const handleAddSize = () => {
    const trimmed = sizeInput.trim().toUpperCase();
    if (trimmed && !formData.sizes.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        sizes: [...prev.sizes, trimmed],
      }));
      setSizeInput("");
    }
  };

  const handleRemoveSize = (sizeToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((s) => s !== sizeToRemove),
    }));
  };

  const handleSizeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSize();
    }
  };

  const isFormDirty = () => {
    return (
      formData.name.trim() !== "" ||
      formData.sku.trim() !== "" ||
      formData.price !== "" ||
      formData.stock !== "" ||
      formData.description.trim() !== "" ||
      formData.imagesList.length > 0
    );
  };

  const handleBackClick = (e: React.MouseEvent) => {
    if (isFormDirty()) {
      e.preventDefault();
      setIsCancelModalOpen(true);
    }
  };

  // 2. CREATE PRODUCT
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.name.trim()) {
      setErrorMsg("GEAR NAME IS REQUIRED.");
      return;
    }

    if (!formData.category) {
      setErrorMsg("PLEASE SELECT A CATEGORY FOR THIS GEAR.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg("");

      const cleanImages = formData.imagesList.filter(
        (img) => !img.startsWith("blob:"),
      );
      const cleanVideos = formData.videosList.filter(
        (vid) => !vid.startsWith("blob:"),
      );

      const payload = {
        name: formData.name.trim(),
        sku: formData.sku.trim(),
        category: formData.category,
        price: Number(formData.price) || 0,
        stock: Number(formData.stock) || 0,
        status: formData.status,
        description: formData.description?.trim(),
        imageUrl: cleanImages.length > 0 ? cleanImages[0] : "",
        images: cleanImages,
        videoUrl: cleanVideos.length > 0 ? cleanVideos[0] : "",
        videos: cleanVideos,
        sizes: formData.sizes,
        material: formData.material.trim(),
        origin: formData.origin.trim(),
        quality: formData.quality.trim(),
      };

      await api.post("/products", payload);

      setShowToast(true);

      setTimeout(() => {
        router.push("/admin/products");
      }, 1500);
    } catch (error: any) {
      console.error("Create product error:", error);
      setErrorMsg(
        error.response?.data?.message || "FAILED TO SEAL NEW GEAR INTO VAULT.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-mono relative">
      {/* TOAST NOTIFICATION SUCCESS */}
      {showToast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-4 py-3 border-2 border-brand-dark shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3 animate-bounce">
          <CheckCircle2 size={20} />
          <div>
            <p className="font-bold text-xs uppercase tracking-wider">
              SUCCESS!
            </p>
            <p className="text-[11px]">
              New gear has been sealed successfully.
            </p>
          </div>
        </div>
      )}

      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-brand-dark/15">
        <div className="flex items-center gap-3">
          <Link href="/admin/products" onClick={handleBackClick}>
            <Button variant="outline" size="sm" icon={ArrowLeft}>
              BACK
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 tracking-widest uppercase">
                NEW SCROLL
              </span>
            </div>
            <h1 className="font-heading text-xl sm:text-2xl tracking-wider text-brand-dark uppercase mt-0.5">
              SEAL NEW GEAR
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Liên kết nút bấm với Form bằng attribute form="create-product-form" */}
          <Button
            type="submit"
            form="create-product-form"
            variant="chakra"
            size="sm"
            icon={PlusCircle}
            disabled={isSubmitting}
          >
            {isSubmitting ? "SEALING..." : "CREATE GEAR"}
          </Button>
        </div>
      </div>

      {/* ERROR NOTICE - Cố định vị trí hiển thị để không đẩy layout xuống */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border-2 border-rose-600 text-rose-600 text-xs font-bold flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(225,29,72,1)]">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg("")}
            className="hover:opacity-75"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* FORM CREATE */}
      <form
        id="create-product-form"
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border-2 border-brand-dark p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
            <h2 className="font-heading text-base tracking-wider uppercase text-brand-dark pb-2 border-b-2 border-brand-dark/15 flex items-center gap-2">
              <Flame size={18} className="text-orange-600" /> GEAR
              SPECIFICATIONS
            </h2>

            <Input
              label="Gear Name *"
              placeholder="e.g. KUSANAGI SWORD"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              required
            />

            <Input
              label="SKU Code"
              placeholder="e.g. SWD-001"
              value={formData.sku}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, sku: e.target.value }))
              }
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Material"
                placeholder="Heavyweight Cotton Canvas"
                value={formData.material}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, material: e.target.value }))
                }
              />
              <Input
                label="Origin"
                placeholder="Leaf Village Archives"
                value={formData.origin}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, origin: e.target.value }))
                }
              />
              <Input
                label="Quality"
                placeholder="Standard Shinobi"
                value={formData.quality}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, quality: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-brand-dark uppercase block">
                Available Sizes (Optional)
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. S, M, L, XL, 42..."
                  value={sizeInput}
                  onChange={(e) => setSizeInput(e.target.value)}
                  onKeyDown={handleSizeKeyDown}
                  className="flex-1 bg-brand-ivory/20 border-2 border-brand-dark p-2 text-xs font-mono font-bold focus:outline-none focus:border-orange-600 uppercase"
                />
                <button
                  type="button"
                  onClick={handleAddSize}
                  className="px-3 bg-brand-dark text-white text-xs font-bold flex items-center gap-1 hover:bg-orange-600 transition-colors"
                >
                  <Plus size={14} /> ADD
                </button>
              </div>

              {formData.sizes.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {formData.sizes.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1 bg-brand-dark text-white text-xs font-bold px-2.5 py-1 border border-brand-dark"
                    >
                      {s}
                      <button
                        type="button"
                        onClick={() => handleRemoveSize(s)}
                        className="hover:text-orange-400 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <p className="text-[10px] text-brand-dark/50">
                Press Enter or click ADD to insert size tags. Leave blank if not
                applicable.
              </p>
            </div>

            <MediaUpload
              label="GEAR VISUALS / IMAGES"
              value={formData.imagesList}
              onChange={handleImagesChange}
              acceptTypes="image/*"
              maxFiles={4}
            />

            <MediaUpload
              label="DEMONSTRATION VIDEO"
              value={formData.videosList}
              onChange={handleVideosChange}
              acceptTypes="video/*"
              maxFiles={1}
            />

            <div className="space-y-1">
              <label className="text-xs font-mono font-bold text-brand-dark uppercase block">
                Description & Jutsu Compatibility
              </label>
              <textarea
                rows={4}
                placeholder="Enter item lore, specs, or usage requirements..."
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="w-full bg-brand-ivory/20 border-2 border-brand-dark p-2.5 text-xs font-mono focus:outline-none focus:border-orange-600"
              />
            </div>
          </div>

          <div className="bg-white border-2 border-brand-dark p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
            <h2 className="font-heading text-base tracking-wider uppercase text-brand-dark pb-2 border-b-2 border-brand-dark/15">
              STOCK & PRICING
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Price (USD) *"
                type="number"
                placeholder="0"
                value={formData.price}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, price: e.target.value }))
                }
                required
              />

              <Input
                label="Stock Quantity *"
                type="number"
                placeholder="0"
                value={formData.stock}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, stock: e.target.value }))
                }
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border-2 border-brand-dark p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
            <h3 className="font-heading text-sm tracking-wider uppercase text-brand-dark pb-2 border-b-2 border-brand-dark/15">
              STATUS & CATEGORY
            </h3>

            <div className="space-y-1">
              <label className="text-xs font-mono font-bold text-brand-dark uppercase block">
                Stock Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, status: e.target.value }))
                }
                className="w-full bg-brand-ivory/20 border-2 border-brand-dark p-2 text-xs font-mono font-bold focus:outline-none focus:border-orange-600"
              >
                <option value="ACTIVE">ACTIVE (In Stock)</option>
                <option value="LOW_STOCK">LOW STOCK (Warning)</option>
                <option value="OUT_OF_STOCK">OUT OF STOCK</option>
              </select>
            </div>

            {/* DROPDOWN CATEGORY */}
            <div className="space-y-1">
              <label className="text-xs font-mono font-bold text-brand-dark uppercase block">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, category: e.target.value }))
                }
                required
                className="w-full bg-brand-ivory/20 border-2 border-brand-dark p-2 text-xs font-mono font-bold focus:outline-none focus:border-orange-600"
              >
                <option value="">-- SELECT CATEGORY --</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.icon ? `${cat.icon} ` : ""}
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </form>

      {/* MODAL CẢNH BÁO HỦY */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="DISCARD UNSEALED SCROLL?"
      >
        <div className="space-y-4 font-mono text-xs text-brand-dark">
          <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-500 text-amber-800">
            <AlertTriangle
              size={20}
              className="shrink-0 mt-0.5 text-amber-600"
            />
            <p>
              You have unsaved scroll configurations. Navigating away will
              discard all filled specifications.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-brand-dark/15">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCancelModalOpen(false)}
            >
              CONTINUE EDITING
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => router.push("/admin/products")}
            >
              DISCARD & EXIT
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
