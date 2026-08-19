"use client";

import React, { useState, use, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import MediaUpload from "@/components/ui/MediaUpload";
import { api } from "@/lib/api";
import {
  ArrowLeft,
  Save,
  Trash2,
  Flame,
  Loader2,
  AlertCircle,
  Plus,
  X,
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

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const id = resolvedParams?.id;
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "", // Lưu ID dạng string
    price: "",
    stock: "",
    status: "ACTIVE",
    imageUrl: "",
    videoUrl: "",
    imagesList: [] as string[],
    videosList: [] as string[],
    sizes: [] as string[],
    description: "",
    material: "Heavyweight Cotton Canvas",
    origin: "Leaf Village Archives",
    quality: "Standard Shinobi",
  });

  const [initialFormData, setInitialFormData] = useState<string>(""); // Dùng để check form có bị thay đổi không
  const [sizeInput, setSizeInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  }, []);

  // 2. FETCH PRODUCT DATA
  const fetchProduct = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      setErrorMsg("");

      const response = await api.get(`/products/${id}`);
      const data = response.data?.data || response.data;

      if (!data) throw new Error("GEAR DATA NOT FOUND IN CHAKRA VAULT.");

      const currentImageUrl = data.imageUrl || data.imgUrl || "";
      const currentVideoUrl = data.videoUrl || "";

      const loadedImages =
        Array.isArray(data.images) && data.images.length > 0
          ? data.images
          : currentImageUrl
            ? [currentImageUrl]
            : [];

      const loadedVideos =
        Array.isArray(data.videos) && data.videos.length > 0
          ? data.videos
          : currentVideoUrl
            ? [currentVideoUrl]
            : [];

      // Trích xuất an toàn _id của category kể cả khi Backend dùng .populate()
      const catVal =
        typeof data.category === "object" && data.category !== null
          ? data.category._id || ""
          : data.category || "";

      const fetchedData = {
        name: data.name || "",
        sku: data.sku || "",
        category: String(catVal),
        price: data.price !== undefined ? String(data.price) : "",
        stock: data.stock !== undefined ? String(data.stock) : "",
        status: data.status || (data.stock > 0 ? "ACTIVE" : "OUT_OF_STOCK"),
        imageUrl: currentImageUrl,
        videoUrl: currentVideoUrl,
        imagesList: loadedImages,
        videosList: loadedVideos,
        sizes: Array.isArray(data.sizes) ? data.sizes : [],
        description: data.description || "",
        material: data.material || "Heavyweight Cotton Canvas",
        origin: data.origin || "Leaf Village Archives",
        quality: data.quality || "Standard Shinobi",
      };

      setFormData(fetchedData);
      setInitialFormData(JSON.stringify(fetchedData));
    } catch (error: any) {
      console.error("Failed to fetch product:", error);
      setErrorMsg(
        error.response?.data?.message ||
          error.message ||
          "FAILED TO LOAD GEAR DATA FROM VAULT.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCategories();
    fetchProduct();
  }, [fetchCategories, fetchProduct]);

  const handleImagesChange = (imgs: string[]) => {
    setFormData((prev) => ({
      ...prev,
      imagesList: imgs,
      imageUrl: imgs.length > 0 ? imgs[0] : "",
    }));
  };

  const handleVideosChange = (videos: string[]) => {
    setFormData((prev) => ({
      ...prev,
      videosList: videos,
      videoUrl: videos.length > 0 ? videos[0] : "",
    }));
  };

  // 🟢 QUẢN LÝ XỬ LÝ SIZES
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

  // 🟢 CHECK FORM XEM CÓ BỊ EDIT CHƯA LƯU KHÔNG
  const isFormDirty = () => {
    return JSON.stringify(formData) !== initialFormData;
  };

  const handleBackClick = (e: React.MouseEvent) => {
    if (isFormDirty()) {
      e.preventDefault();
      setIsCancelModalOpen(true);
    }
  };

  // 3. UPDATE PRODUCT
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.name.trim()) {
      setErrorMsg("GEAR NAME IS REQUIRED.");
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
        price: Number(formData.price),
        stock: Number(formData.stock),
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

      await api.patch(`/products/${id}`, payload);

      // Cập nhật lại initial form data & hiện Toast
      setInitialFormData(JSON.stringify(formData));
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error: any) {
      console.error("Update error:", error);
      setErrorMsg(
        error.response?.data?.message ||
          "FAILED TO UPDATE GEAR SPECIFICATIONS.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. DELETE PRODUCT
  const handleDelete = async () => {
    if (!id) return;
    try {
      setIsDeleting(true);
      await api.delete(`/products/${id}`);

      setIsDeleteModalOpen(false);
      router.push("/admin/products");
    } catch (error: any) {
      console.error("Delete error:", error);
      alert(error.response?.data?.message || "FAILED TO DELETE GEAR.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] font-mono text-brand-dark space-y-3">
        <Loader2 className="animate-spin text-orange-600" size={32} />
        <span className="font-bold text-sm tracking-wider">
          FETCHING GEAR DATA FROM CHAKRA VAULT...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-mono relative">
      {/* 🟢 TOAST NOTIFICATION (English) */}
      {showToast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-4 py-3 border-2 border-brand-dark shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3 animate-bounce">
          <CheckCircle2 size={20} />
          <div>
            <p className="font-bold text-xs uppercase tracking-wider">
              UPDATED!
            </p>
            <p className="text-[11px]">
              Gear specifications saved successfully.
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
                SCROLL #{id ? id.slice(-6).toUpperCase() : ""}
              </span>
            </div>
            <h1 className="font-heading text-xl sm:text-2xl tracking-wider text-brand-dark uppercase mt-0.5">
              {formData.name || "UNNAMED GEAR"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={Trash2}
            className="border-rose-600 text-rose-600 hover:border-rose-700 hover:text-rose-700 hover:bg-rose-500/10"
            onClick={() => setIsDeleteModalOpen(true)}
            disabled={isSubmitting || isDeleting}
          >
            DELETE
          </Button>

          <Button
            variant="chakra"
            size="sm"
            icon={Save}
            onClick={handleSave}
            disabled={isSubmitting || isDeleting}
          >
            {isSubmitting ? "SAVING..." : "UPDATE GEAR"}
          </Button>
        </div>
      </div>

      {/* ERROR NOTICE */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border-2 border-rose-600 text-rose-600 text-xs font-bold flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(225,29,72,1)]">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
          <Button variant="outline" size="sm" onClick={fetchProduct}>
            RETRY
          </Button>
        </div>
      )}

      {/* FORM EDIT */}
      <form
        onSubmit={handleSave}
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
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />

            <Input
              label="SKU Code"
              value={formData.sku}
              onChange={(e) =>
                setFormData({ ...formData, sku: e.target.value })
              }
            />

            {/* 🟢 KHU VỰC THÔNG SỐ BỔ SUNG (MATERIAL, ORIGIN, QUALITY) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Material"
                placeholder="Heavyweight Cotton Canvas"
                value={formData.material}
                onChange={(e) =>
                  setFormData({ ...formData, material: e.target.value })
                }
              />
              <Input
                label="Origin"
                placeholder="Leaf Village Archives"
                value={formData.origin}
                onChange={(e) =>
                  setFormData({ ...formData, origin: e.target.value })
                }
              />
              <Input
                label="Quality"
                placeholder="Standard Shinobi"
                value={formData.quality}
                onChange={(e) =>
                  setFormData({ ...formData, quality: e.target.value })
                }
              />
            </div>

            {/* KHU VỰC NHẬP SIZES */}
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
                  className="flex-1 bg-brand-ivory/20 border-2 border-brand-dark p-2 text-xs font-mono font-bold focus:outline-hidden focus:border-orange-600 uppercase"
                />
                <button
                  type="button"
                  onClick={handleAddSize}
                  className="px-3 bg-brand-dark text-white text-xs font-bold flex items-center gap-1 hover:bg-orange-600 transition-colors"
                >
                  <Plus size={14} /> ADD
                </button>
              </div>

              {/* DANH SÁCH SIZES ĐÃ THÊM */}
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
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full bg-brand-ivory/20 border-2 border-brand-dark p-2.5 text-xs font-mono focus:outline-hidden focus:border-orange-600"
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
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                required
              />

              <Input
                label="Stock Quantity *"
                type="number"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: e.target.value })
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
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full bg-brand-ivory/20 border-2 border-brand-dark p-2 text-xs font-mono font-bold focus:outline-hidden focus:border-orange-600"
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
                  setFormData({ ...formData, category: e.target.value })
                }
                required
                className="w-full bg-brand-ivory/20 border-2 border-brand-dark p-2 text-xs font-mono font-bold focus:outline-hidden focus:border-orange-600"
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

      {/* 🟢 MODAL CẢNH BÁO HỦY KHI CÓ THAY ĐỔI CHƯA LƯU */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="DISCARD UNSAVED CHANGES?"
      >
        <div className="space-y-4 font-mono text-xs text-brand-dark">
          <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-500 text-amber-800">
            <AlertTriangle
              size={20}
              className="shrink-0 mt-0.5 text-amber-600"
            />
            <p>
              You have unsaved changes to this gear scroll. Leaving now will
              discard your edits.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-brand-dark/15">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCancelModalOpen(false)}
            >
              KEEP EDITING
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

      {/* CONFIRM DELETE MODAL */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="CONFIRM UNSEAL & DELETE"
      >
        <div className="space-y-4 font-mono text-xs text-brand-dark">
          <p>
            Are you sure you want to permanently unseal and delete gear scroll{" "}
            <span className="font-bold text-orange-600">
              "{formData.name}" (#{id ? id.slice(-6).toUpperCase() : ""})
            </span>{" "}
            from the Chakra Vault?
          </p>

          <div className="flex justify-end gap-2 pt-3 border-t border-brand-dark/15">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteModalOpen(false)}
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
