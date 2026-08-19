"use client";

import React, { useState, useEffect, useCallback } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import MediaUpload from "@/components/ui/MediaUpload";
import { api } from "@/lib/api";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Layers,
  Tag,
  Package,
  FolderTree,
  Filter,
  CheckCircle2,
  XCircle,
  Loader2,
  Palette,
} from "lucide-react";

type CategoryStatus = "ACTIVE" | "INACTIVE";

const HOVER_COLOR_OPTIONS = [
  { label: "Cam (Brand Primary)", value: "group-hover:text-brand-primary" },
  { label: "Đỏ (Akatsuki / Danger)", value: "group-hover:text-brand-danger" },
  { label: "Xanh Lá (Sage / Leaf)", value: "group-hover:text-brand-sage" },
  { label: "Xanh Dương (Navy / Hokage)", value: "group-hover:text-brand-navy" },
  { label: "Vàng (Gold)", value: "group-hover:text-amber-400" },
  { label: "Tím (Shadow)", value: "group-hover:text-purple-500" },
  { label: "Hồng (Sakura)", value: "group-hover:text-pink-500" },
  { label: "Xanh Lam (Chidori)", value: "group-hover:text-cyan-400" },
];

interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  itemCount?: number;
  status: CategoryStatus;
  hoverColor?: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | CategoryStatus>(
    "ALL",
  );

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    slug: "",
    image: "",
    description: "",
    status: "ACTIVE" as CategoryStatus,
    hoverColor: "group-hover:text-brand-primary",
  });

  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  // 1. Fetch Categories
  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/categories");
      const rawCategories = response.data?.data || response.data;

      if (Array.isArray(rawCategories)) {
        const formatted = rawCategories.map((cat: any) => ({
          ...cat,
          image: cat.image || cat.imageUrl || cat.icon || "", // Fallback đệm cho dữ liệu cũ
          status: (cat.status === "INACTIVE"
            ? "INACTIVE"
            : "ACTIVE") as CategoryStatus,
          hoverColor: cat.hoverColor || "group-hover:text-brand-primary",
          itemCount: cat.gearCount || cat.itemCount || 0,
        }));
        setCategories(formatted);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // 2. Open Modal Add
  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setCategoryForm({
      name: "",
      slug: "",
      image: "",
      description: "",
      status: "ACTIVE",
      hoverColor: "group-hover:text-brand-primary",
    });
    setIsCategoryModalOpen(true);
  };

  // 3. Open Modal Edit
  const handleOpenEditModal = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      slug: category.slug,
      image: category.image || "",
      description: category.description || "",
      status: category.status || "ACTIVE",
      hoverColor: category.hoverColor || "group-hover:text-brand-primary",
    });
    setIsCategoryModalOpen(true);
  };

  // 4. Save Category
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);

      const payload = {
        name: categoryForm.name.trim(),
        slug: categoryForm.slug.trim(),
        image: categoryForm.image.trim(),
        description: categoryForm.description.trim(),
        status: categoryForm.status,
        hoverColor: categoryForm.hoverColor,
      };

      if (editingCategory) {
        await api.put(`/categories/${editingCategory._id}`, payload);
      } else {
        await api.post("/categories", payload);
      }

      await fetchCategories();
      setIsCategoryModalOpen(false);
    } catch (error: any) {
      console.error("Failed to save category:", error);
      alert(error.response?.data?.message || "Lưu danh mục thất bại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 5. Delete Category
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      setIsSubmitting(true);
      await api.delete(`/categories/${deleteTarget._id}`);
      await fetchCategories();
      setDeleteTarget(null);
    } catch (error: any) {
      console.error("Failed to delete category:", error);
      alert(error.response?.data?.message || "Không thể xóa danh mục này!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto Slug Generator
  const handleNameChange = (name: string) => {
    const generatedSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-");

    setCategoryForm((prev) => ({
      ...prev,
      name,
      slug: generatedSlug,
    }));
  };

  // Filter Categories
  const filteredCategories = categories.filter((cat) => {
    const query = searchTerm.toLowerCase();
    const matchesSearch =
      cat.name.toLowerCase().includes(query) ||
      cat._id.toLowerCase().includes(query) ||
      cat.slug.toLowerCase().includes(query);

    const matchesStatus = statusFilter === "ALL" || cat.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Render Image trong bảng
  const renderCategoryIcon = (imgUrl?: string) => {
    if (!imgUrl) {
      return <Tag size={16} className="text-orange-600 shrink-0" />;
    }
    return (
      <img
        src={imgUrl}
        alt="Category Image"
        className="w-6 h-6 object-cover border border-brand-dark bg-white shrink-0"
      />
    );
  };

  return (
    <div className="space-y-6 font-mono max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-brand-dark/15">
        <div>
          <span className="bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 tracking-widest uppercase">
            CLASSIFICATION VAULT
          </span>
          <h1 className="font-heading text-2xl sm:text-3xl tracking-wider text-brand-dark mt-1 uppercase flex items-center gap-2">
            <FolderTree className="text-orange-600 shrink-0" size={28} />
            CATEGORY MANAGEMENT
          </h1>
        </div>

        <Button
          variant="chakra"
          size="md"
          icon={Plus}
          onClick={handleOpenAddModal}
        >
          NEW CATEGORY
        </Button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border-2 border-brand-dark p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-[10px] text-brand-dark/60 font-bold uppercase">
            Total Categories
          </div>
          <div className="text-2xl font-bold text-brand-dark mt-1 flex items-center gap-2">
            <Layers size={20} className="text-orange-600" />
            {categories.length}
          </div>
        </div>

        <div className="bg-white border-2 border-brand-dark p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-[10px] text-brand-dark/60 font-bold uppercase">
            Active Categories
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-1 flex items-center gap-2">
            <CheckCircle2 size={20} />
            {categories.filter((c) => c.status === "ACTIVE").length}
          </div>
        </div>

        <div className="bg-white border-2 border-brand-dark p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-[10px] text-brand-dark/60 font-bold uppercase">
            Total Linked Items
          </div>
          <div className="text-2xl font-bold text-brand-dark mt-1 flex items-center gap-2">
            <Package size={20} className="text-cyan-600" />
            {categories.reduce(
              (acc, curr) => acc + (curr.itemCount || 0),
              0,
            )}{" "}
            Items
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH */}
      <div className="bg-white border-2 border-brand-dark p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="w-full md:w-80">
          <Input
            placeholder="Search Category..."
            icon={Search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={16} className="text-brand-dark/50 shrink-0 mr-1" />
          {(["ALL", "ACTIVE", "INACTIVE"] as const).map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "chakra" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(status)}
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white border-2 border-brand-dark shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-x-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-3">
            <Loader2 className="animate-spin text-orange-600" size={32} />
            <span className="text-xs font-bold tracking-wider">
              LOADING CATEGORIES...
            </span>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-dark text-brand-ivory border-b-2 border-brand-dark">
              <tr>
                <th className="p-3 uppercase">Code / ID</th>
                <th className="p-3 uppercase">Category Name</th>
                <th className="p-3 uppercase">Slug</th>
                <th className="p-3 uppercase">Hover Color</th>
                <th className="p-3 uppercase">Gear Count</th>
                <th className="p-3 uppercase">Status</th>
                <th className="p-3 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-dark/15">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <tr
                    key={category._id}
                    className="hover:bg-orange-500/5 transition-colors"
                  >
                    <td className="p-3 font-bold text-brand-dark">
                      #{category._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="p-3 font-bold text-brand-dark">
                      <div className="flex items-center gap-2">
                        {renderCategoryIcon(category.image)}
                        <span>{category.name}</span>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-brand-dark/70">
                      /{category.slug}
                    </td>
                    <td className="p-3 font-mono">
                      <span className="group bg-brand-dark text-white px-2 py-1 text-[10px] font-bold border border-brand-dark inline-flex items-center gap-1.5">
                        <Palette size={12} className="text-orange-500" />
                        <span
                          className={`transition-colors ${category.hoverColor || "group-hover:text-brand-primary"}`}
                        >
                          HOVER PREVIEW
                        </span>
                      </span>
                    </td>
                    <td className="p-3 font-bold">
                      <span className="bg-brand-ivory border border-brand-dark px-2 py-0.5 text-[11px]">
                        {category.itemCount || 0} Items
                      </span>
                    </td>
                    <td className="p-3">
                      {category.status === "ACTIVE" ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[10px] bg-emerald-50 px-2 py-0.5 border border-emerald-600">
                          <CheckCircle2 size={12} /> ACTIVE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-700 font-bold text-[10px] bg-rose-50 px-2 py-0.5 border border-rose-600">
                          <XCircle size={12} /> INACTIVE
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right space-x-2 whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Edit3}
                        onClick={() => handleOpenEditModal(category)}
                      >
                        EDIT
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        icon={Trash2}
                        onClick={() => setDeleteTarget(category)}
                      >
                        DELETE
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="p-8 text-center text-brand-dark/50 font-bold uppercase"
                  >
                    NO CATEGORIES FOUND.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL ADD / EDIT CATEGORY */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title={editingCategory ? "EDIT CATEGORY" : "CREATE NEW CATEGORY"}
        maxWidth="lg"
      >
        <form
          onSubmit={handleSaveCategory}
          className="font-mono text-xs space-y-4"
        >
          <div className="space-y-4">
            <Input
              label="Category Name *"
              placeholder="e.g. Leaf Village Gear"
              value={categoryForm.name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
            />

            <Input
              label="URL Slug *"
              placeholder="e.g. leaf-village-gear"
              value={categoryForm.slug}
              onChange={(e) =>
                setCategoryForm({ ...categoryForm, slug: e.target.value })
              }
              required
            />

            {/* MEDIA UPLOAD - DÙNG TRƯỜNG IMAGE */}
            <MediaUpload
              label="Category Image"
              value={categoryForm.image ? [categoryForm.image] : []}
              maxFiles={1}
              acceptTypes="image/*"
              onChange={(mediaList) =>
                setCategoryForm((prev) => ({
                  ...prev,
                  image: mediaList[0] || "",
                }))
              }
            />

            <div className="space-y-1">
              <label className="text-xs font-bold text-brand-dark uppercase block flex items-center gap-1.5">
                <Palette size={14} className="text-orange-600" />
                Hover Theme Color *
              </label>
              <select
                value={categoryForm.hoverColor}
                onChange={(e) =>
                  setCategoryForm({
                    ...categoryForm,
                    hoverColor: e.target.value,
                  })
                }
                className="w-full bg-brand-ivory text-brand-dark border border-brand-dark/20 p-2.5 text-xs font-mono font-bold focus:outline-hidden focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              >
                {HOVER_COLOR_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3 bg-brand-dark text-white border border-brand-dark text-center group">
              <span className="text-[9px] text-white/50 block font-bold mb-1 uppercase tracking-widest">
                CARD HOVER PREVIEW
              </span>
              <span
                className={`text-lg font-heading tracking-widest uppercase transition-colors duration-300 ${categoryForm.hoverColor}`}
              >
                {categoryForm.name || "COLLECTION NAME"}
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-brand-dark uppercase block">
                Status *
              </label>
              <select
                value={categoryForm.status}
                onChange={(e) =>
                  setCategoryForm({
                    ...categoryForm,
                    status: e.target.value as CategoryStatus,
                  })
                }
                className="w-full bg-brand-ivory text-brand-dark border border-brand-dark/20 p-2.5 text-xs font-mono font-bold focus:outline-hidden focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-brand-dark uppercase block">
                Description
              </label>
              <textarea
                rows={3}
                placeholder="Category description..."
                value={categoryForm.description}
                onChange={(e) =>
                  setCategoryForm({
                    ...categoryForm,
                    description: e.target.value,
                  })
                }
                className="w-full bg-brand-ivory text-brand-dark border border-brand-dark/20 p-2.5 text-xs font-mono focus:outline-hidden focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="sticky bottom-0 bg-brand-ivory pt-3 pb-1 border-t border-brand-dark/15 flex justify-end gap-2 mt-4 z-10">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCategoryModalOpen(false)}
            >
              CANCEL
            </Button>
            <Button
              type="submit"
              variant="chakra"
              size="sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : editingCategory ? (
                "SAVE CHANGES"
              ) : (
                "CREATE CATEGORY"
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRM MODAL */}
      {deleteTarget && (
        <Modal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          title="CONFIRM DELETION"
          maxWidth="sm"
        >
          <div className="space-y-4 font-mono text-xs">
            <p className="text-brand-dark">
              Are you sure you want to delete category{" "}
              <strong className="text-rose-600">"{deleteTarget.name}"</strong>?
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-brand-dark/15">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteTarget(null)}
              >
                CANCEL
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteConfirm}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  "DELETE"
                )}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
