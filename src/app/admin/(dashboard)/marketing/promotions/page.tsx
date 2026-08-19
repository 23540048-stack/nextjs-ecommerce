"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Flame,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Power,
  ChevronRight,
  Tag,
  Percent,
  Upload,
  X,
  Video as VideoIcon,
  Image as ImageIcon,
  Loader2,
  Users,
  AlertTriangle,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export interface Promotion {
  _id: string;
  code: string;
  title: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderValue: number;
  mediaType: "image" | "video";
  mediaUrl: string;
  status: "active" | "inactive" | "scheduled";
  startDate: string;
  endDate?: string;
  usageCount: number;
}

interface MediaUploadProps {
  label?: string;
  mediaType: "image" | "video";
  value?: string;
  onChange?: (url: string) => void;
}

function MediaUpload({
  label = "PROMOTION MEDIA",
  mediaType = "image",
  value = "",
  onChange,
}: MediaUploadProps) {
  const [mediaUrl, setMediaUrl] = useState<string>(value);

  useEffect(() => {
    setMediaUrl(value);
  }, [value]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setMediaUrl(url);
    if (onChange) onChange(url);
  };

  const handleRemove = () => {
    setMediaUrl("");
    if (onChange) onChange("");
  };

  return (
    <div className="space-y-2 font-mono w-full">
      <label className="text-xs font-bold text-brand-dark uppercase block">
        {label}
      </label>

      {mediaUrl ? (
        <div className="relative border-2 border-brand-dark bg-brand-ivory/30 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] overflow-hidden max-h-48 flex items-center justify-center p-2">
          {mediaType === "image" ? (
            <img
              src={mediaUrl}
              alt="Promotion preview"
              className="w-full h-auto max-h-44 object-contain"
            />
          ) : (
            <video
              src={mediaUrl}
              controls
              className="w-full h-auto max-h-44 object-contain"
            />
          )}
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-rose-600 text-white p-1 border border-brand-dark shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:bg-rose-700 transition-colors cursor-pointer z-10"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <label className="h-32 border-2 border-dashed border-brand-dark bg-white hover:bg-orange-500/5 hover:border-orange-600 transition-all flex flex-col items-center justify-center p-4 cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-px active:translate-y-px">
          {mediaType === "image" ? (
            <Upload size={24} className="text-brand-dark/60 mb-1" />
          ) : (
            <VideoIcon size={24} className="text-brand-dark/60 mb-1" />
          )}
          <span className="text-xs font-bold text-brand-dark/70 uppercase text-center">
            UPLOAD {(mediaType || "image").toUpperCase()}
          </span>
          <span className="text-[10px] text-brand-dark/40 mt-0.5 uppercase">
            {mediaType === "image" ? "PNG, JPG, WEBP" : "MP4, WEBM"}
          </span>
          <input
            type="file"
            accept={mediaType === "image" ? "image/*" : "video/*"}
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      )}
    </div>
  );
}

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState<Promotion | null>(null);

  const [formData, setFormData] = useState({
    code: "",
    title: "",
    discountType: "percentage" as Promotion["discountType"],
    discountValue: "",
    minOrderValue: "",
    mediaType: "image" as Promotion["mediaType"],
    mediaUrl: "",
    status: "active" as Promotion["status"],
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
  });

  // Dynamic status calculation matching banner page logic
  const getDynamicStatus = useCallback(
    (promo: Promotion): Promotion["status"] => {
      if (promo.status === "inactive") return "inactive";

      const now = new Date();
      const startDate = promo.startDate ? new Date(promo.startDate) : null;
      if (startDate) startDate.setHours(0, 0, 0, 0);

      const endDate = promo.endDate ? new Date(promo.endDate) : null;
      if (endDate) endDate.setHours(23, 59, 59, 999);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (startDate && startDate > today) {
        return "scheduled";
      }
      if (endDate && endDate < now) {
        return "inactive";
      }

      return "active";
    },
    [],
  );

  // Fetch Promotions from Backend API
  const fetchPromotions = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (searchQuery) queryParams.append("search", searchQuery);

      const res = await fetch(
        `${API_BASE_URL}/promotions?${queryParams.toString()}`,
      );
      if (res.ok) {
        const data: Promotion[] = await res.json();
        setPromotions(data);
      }
    } catch (error) {
      console.error("Failed to load promotions from backend:", error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  // Filter promotions including calculated dynamic statuses
  const filteredPromotions = promotions.filter((p) => {
    if (statusFilter === "all") return true;
    return getDynamicStatus(p) === statusFilter;
  });

  const handleOpenAddModal = () => {
    setSelectedPromo(null);
    setFormData({
      code: "",
      title: "",
      discountType: "percentage",
      discountValue: "",
      minOrderValue: "",
      mediaType: "image",
      mediaUrl: "",
      status: "active",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (promo: Promotion) => {
    setSelectedPromo(promo);
    setFormData({
      code: promo.code || "",
      title: promo.title || "",
      discountType: promo.discountType || "percentage",
      discountValue: promo.discountValue ? promo.discountValue.toString() : "",
      minOrderValue: promo.minOrderValue ? promo.minOrderValue.toString() : "",
      mediaType: promo.mediaType || "image",
      mediaUrl: promo.mediaUrl || "",
      status: promo.status || "active",
      startDate: promo.startDate
        ? promo.startDate.split("T")[0]
        : new Date().toISOString().split("T")[0],
      endDate: promo.endDate ? promo.endDate.split("T")[0] : "",
    });
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteModal = (promo: Promotion) => {
    setSelectedPromo(promo);
    setIsDeleteModalOpen(true);
  };

  // Quick Power toggle status button handler
  const handleToggleStatus = async (id: string) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/promotions/${id}/toggle-status`,
        {
          method: "PATCH",
        },
      );
      if (res.ok) {
        fetchPromotions();
      }
    } catch (error) {
      console.error("Failed to toggle promotion status:", error);
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint = selectedPromo
        ? `${API_BASE_URL}/promotions/${selectedPromo._id}`
        : `${API_BASE_URL}/promotions`;

      const method = selectedPromo ? "PUT" : "POST";
      const payload = {
        ...formData,
        discountValue: Number(formData.discountValue),
        minOrderValue: Number(formData.minOrderValue || 0),
      };

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsFormModalOpen(false);
        fetchPromotions();
      }
    } catch (error) {
      console.error("Failed to save promotion details:", error);
    }
  };

  const handleDeletePromotion = async () => {
    if (!selectedPromo) return;
    try {
      const res = await fetch(
        `${API_BASE_URL}/promotions/${selectedPromo._id}`,
        {
          method: "DELETE",
        },
      );

      if (res.ok) {
        setIsDeleteModalOpen(false);
        setSelectedPromo(null);
        fetchPromotions();
      }
    } catch (error) {
      console.error("Failed to delete promotion:", error);
    }
  };

  // Badge rendering matching banner status badges
  const getStatusBadge = (promo: Promotion) => {
    const dynamicStatus = getDynamicStatus(promo);

    switch (dynamicStatus) {
      case "active":
        return (
          <Badge variant="orange" size="sm">
            ACTIVE
          </Badge>
        );
      case "scheduled":
        return (
          <Badge variant="new" size="sm">
            SCHEDULED
          </Badge>
        );
      case "inactive":
      default:
        return (
          <Badge variant="outline" size="sm">
            INACTIVE
          </Badge>
        );
    }
  };

  return (
    <div className="w-full min-h-screen bg-white text-brand-dark p-6 sm:p-8 font-mono space-y-8">
      {/* BREADCRUMB & HEADER */}
      <div className="border-b border-brand-dark/15 pb-6">
        <div className="flex items-center gap-2 text-xs text-brand-dark/60 uppercase mb-2">
          <Link
            href="/admin"
            className="hover:text-orange-500 transition-colors"
          >
            ADMIN DASHBOARD
          </Link>
          <ChevronRight size={14} />
          <span>MARKETING</span>
          <ChevronRight size={14} />
          <span className="text-brand-dark font-bold">PROMOTIONS</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-heading tracking-wide uppercase flex items-center gap-2">
              <Flame className="text-orange-600" size={32} /> PROMOTION
              CAMPAIGNS
            </h1>
            <p className="text-xs text-brand-dark/60 mt-1">
              CONFIGURE DISCOUNT CODES, SPECIAL OFFERS, AND PROMOTIONAL BANNERS
            </p>
          </div>

          <Button
            variant="chakra"
            size="sm"
            icon={Plus}
            onClick={handleOpenAddModal}
          >
            CREATE CAMPAIGN
          </Button>
        </div>
      </div>

      {/* METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border border-brand-dark/15 p-5 bg-white space-y-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-center text-brand-dark/60 text-xs">
            <span className="uppercase">TOTAL CAMPAIGNS</span>
            <Tag size={16} className="text-orange-500" />
          </div>
          <p className="text-3xl font-extrabold text-brand-dark">
            {promotions.length}
          </p>
        </div>

        <div className="border border-brand-dark/15 p-5 bg-white space-y-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-center text-brand-dark/60 text-xs">
            <span className="uppercase">ACTIVE CAMPAIGNS</span>
            <Percent size={16} className="text-emerald-500" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-600">
            {promotions.filter((p) => getDynamicStatus(p) === "active").length}
          </p>
        </div>

        <div className="border border-brand-dark/15 p-5 bg-white space-y-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-center text-brand-dark/60 text-xs">
            <span className="uppercase">TOTAL USAGE COUNT</span>
            <Users size={16} className="text-sky-500" />
          </div>
          <p className="text-3xl font-extrabold text-brand-dark">
            {promotions.reduce((acc, curr) => acc + (curr.usageCount || 0), 0)}
          </p>
        </div>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        <Input
          icon={Search}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="SEARCH BY CODE, TITLE, OR ID..."
          className="uppercase"
        />

        <div className="flex items-center gap-2 border border-brand-dark/20 px-3 py-2 bg-brand-dark/5 shrink-0 text-xs">
          <Filter size={12} className="text-brand-dark/60" />
          <span className="font-bold uppercase text-[10px] text-brand-dark/60">
            STATUS:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent outline-none font-bold uppercase cursor-pointer text-xs"
          >
            <option value="all">ALL STATUSES</option>
            <option value="active">ACTIVE</option>
            <option value="scheduled">SCHEDULED</option>
            <option value="inactive">INACTIVE</option>
          </select>
        </div>
      </div>

      {/* PROMOTIONS TABLE */}
      <div className="border border-brand-dark/15 overflow-x-auto bg-white">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-brand-dark text-white uppercase text-[11px] tracking-wider border-b border-brand-dark">
              <th className="py-3 px-4">CAMPAIGN</th>
              <th className="py-3 px-4">PROMO CODE</th>
              <th className="py-3 px-4">DISCOUNT</th>
              <th className="py-3 px-4">USAGE</th>
              <th className="py-3 px-4">STATUS</th>
              <th className="py-3 px-4 text-center">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-dark/10">
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-12 text-center text-brand-dark/50"
                >
                  <div className="flex items-center justify-center gap-2 font-bold">
                    <Loader2
                      size={18}
                      className="animate-spin text-orange-500"
                    />
                    LOADING PROMOTIONS FROM BACKEND...
                  </div>
                </td>
              </tr>
            ) : filteredPromotions.length > 0 ? (
              filteredPromotions.map((promo) => (
                <tr
                  key={promo._id}
                  className="hover:bg-brand-dark/5 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-brand-dark/10 border border-brand-dark/20 flex items-center justify-center shrink-0">
                        {promo.mediaType === "video" ? (
                          <VideoIcon size={16} className="text-orange-500" />
                        ) : (
                          <ImageIcon size={16} className="text-brand-dark/40" />
                        )}
                      </div>
                      <div>
                        <span className="font-bold text-brand-dark uppercase block">
                          {promo.title}
                        </span>
                        <span className="text-[11px] text-brand-dark/50 block">
                          {promo._id}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4 font-bold text-orange-600 uppercase">
                    <span className="px-2 py-1 bg-orange-50 border border-orange-200">
                      {promo.code}
                    </span>
                  </td>

                  <td className="py-4 px-4 font-bold">
                    {promo.discountType === "percentage"
                      ? `${promo.discountValue}% OFF`
                      : `-${promo.discountValue?.toLocaleString()} VND`}
                  </td>

                  <td className="py-4 px-4 font-bold text-brand-dark">
                    {(promo.usageCount || 0).toLocaleString()} times
                  </td>

                  <td className="py-4 px-4">{getStatusBadge(promo)}</td>

                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Power Button matching Banner toggle UI */}
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(promo._id)}
                        className={`p-1.5 border transition-colors ${
                          promo.status === "active"
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
                        onClick={() => handleOpenEditModal(promo)}
                      >
                        EDIT
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        icon={Trash2}
                        onClick={() => handleOpenDeleteModal(promo)}
                      >
                        DELETE
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="py-12 text-center text-brand-dark/50 border-t border-brand-dark/10"
                >
                  NO PROMOTIONS FOUND.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL: ADD / EDIT PROMOTION */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={selectedPromo ? "EDIT CAMPAIGN" : "CREATE NEW PROMOTION"}
        maxWidth="md"
      >
        <form
          onSubmit={handleSubmitForm}
          className="space-y-4 text-xs font-mono"
        >
          <Input
            label="PROMOTION TITLE"
            required
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="E.g. Summer Chunin Festival Special"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="PROMO CODE"
              required
              value={formData.code}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  code: e.target.value.toUpperCase(),
                })
              }
              placeholder="E.g. CHUNIN2026"
            />

            <div>
              <label className="block text-xs font-bold text-brand-dark mb-2 uppercase">
                DISCOUNT TYPE
              </label>
              <select
                value={formData.discountType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discountType: e.target.value as Promotion["discountType"],
                  })
                }
                className="w-full px-3 py-2.5 text-xs font-bold border border-brand-dark/20 text-brand-dark bg-white focus:outline-none focus:border-orange-500 uppercase"
              >
                <option value="percentage">PERCENTAGE (%)</option>
                <option value="fixed">FIXED AMOUNT (VND)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="DISCOUNT VALUE"
              type="number"
              required
              value={formData.discountValue}
              onChange={(e) =>
                setFormData({ ...formData, discountValue: e.target.value })
              }
              placeholder={
                formData.discountType === "percentage" ? "10" : "50000"
              }
            />

            <Input
              label="MIN ORDER VALUE (VND)"
              type="number"
              value={formData.minOrderValue}
              onChange={(e) =>
                setFormData({ ...formData, minOrderValue: e.target.value })
              }
              placeholder="0"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-brand-dark mb-2 uppercase">
                MEDIA TYPE
              </label>
              <select
                value={formData.mediaType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    mediaType: e.target.value as Promotion["mediaType"],
                    mediaUrl: "",
                  })
                }
                className="w-full px-3 py-2.5 text-xs font-bold border border-brand-dark/20 text-brand-dark bg-white focus:outline-none focus:border-orange-500 uppercase"
              >
                <option value="image">IMAGE</option>
                <option value="video">VIDEO</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-dark mb-2 uppercase">
                STATUS
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as Promotion["status"],
                  })
                }
                className="w-full px-3 py-2.5 text-xs font-bold border border-brand-dark/20 text-brand-dark bg-white focus:outline-none focus:border-orange-500 uppercase"
              >
                <option value="active">ACTIVE</option>
                <option value="scheduled">SCHEDULED</option>
                <option value="inactive">INACTIVE</option>
              </select>
            </div>
          </div>

          <MediaUpload
            label={`PROMOTION ${(formData.mediaType || "image").toUpperCase()} ASSET`}
            mediaType={formData.mediaType || "image"}
            value={formData.mediaUrl}
            onChange={(url) => setFormData({ ...formData, mediaUrl: url })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="START DATE"
              type="date"
              required
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
            />

            <Input
              label="END DATE (OPTIONAL)"
              type="date"
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-brand-dark/15">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsFormModalOpen(false)}
            >
              CANCEL
            </Button>
            <Button type="submit" variant="chakra" size="sm" icon={Plus}>
              {selectedPromo ? "SAVE CHANGES" : "CREATE CAMPAIGN"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: CONFIRM DELETE */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="CONFIRM CAMPAIGN DELETION"
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs font-mono">
          <div className="flex items-start gap-3 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-700">
            <AlertTriangle
              className="shrink-0 text-rose-600 mt-0.5"
              size={18}
            />
            <p className="leading-relaxed">
              Are you sure you want to delete campaign{" "}
              <strong className="underline font-bold uppercase text-rose-800">
                {selectedPromo?.title}
              </strong>
              ? This action cannot be undone.
            </p>
          </div>

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
              onClick={handleDeletePromotion}
            >
              CONFIRM DELETE
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
