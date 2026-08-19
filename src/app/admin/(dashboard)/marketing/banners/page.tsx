"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast"; // 🚀 Thêm React Hot Toast
import {
  Image as ImageIcon,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Power,
  ChevronRight,
  ExternalLink,
  Calendar,
  Eye,
  AlertTriangle,
  Download,
  Loader2,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import MediaUpload from "@/components/ui/MediaUpload";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export interface MediaItem {
  type: "image" | "video";
  url: string;
  caption?: string;
}

export interface Banner {
  _id: string;
  title: string;
  subtitle?: string;
  description?: string;
  badge?: string;
  badgeText?: string;
  location: "HOME_HERO" | "PROMO_BAR" | "CATEGORY_SIDEBAR" | "POPUP" | string;
  items?: MediaItem[];
  mediaType?: "image" | "video";
  mediaUrl?: string;
  imageUrl?: string;
  image?: string;
  linkUrl?: string;
  status: "active" | "inactive" | "scheduled";
  startDate?: string;
  endDate?: string;
  clicks?: number;
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    badge: "",
    badgeText: "",
    location: "HOME_HERO" as Banner["location"],
    items: [] as MediaItem[],
    mediaType: "image" as "image" | "video",
    mediaUrl: "",
    imageUrl: "",
    linkUrl: "",
    status: "active" as Banner["status"],
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
  });

  const getDynamicStatus = useCallback((banner: Banner): Banner["status"] => {
    if (banner.status === "inactive") return "inactive";

    const startDate = banner.startDate ? new Date(banner.startDate) : null;
    if (startDate) startDate.setHours(0, 0, 0, 0);

    const endDate = banner.endDate ? new Date(banner.endDate) : null;
    if (endDate) endDate.setHours(23, 59, 59, 999);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate && startDate > today) return "scheduled";
    if (endDate && endDate < today) return "inactive";

    return "active";
  }, []);

  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (searchQuery) queryParams.append("search", searchQuery);
      if (locationFilter !== "all")
        queryParams.append("location", locationFilter);

      const res = await fetch(
        `${API_BASE_URL}/banners?${queryParams.toString()}`,
      );
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.data || [];
        setBanners(list);
      } else {
        toast.error("Unable to load the banner list from the server!");
      }
    } catch (error) {
      console.error("Error loading banners:", error);
      toast.error("Server connection error while loading banners!");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, locationFilter]);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const filteredBanners = banners.filter((b) => {
    if (statusFilter === "all") return true;
    return getDynamicStatus(b) === statusFilter;
  });

  const handleExportCSV = () => {
    if (banners.length === 0) {
      toast.error("No banner data available to export to CSV!");
      return;
    }

    const headers = [
      "ID",
      "Title",
      "Badge",
      "Location",
      "Media URL",
      "Link URL",
      "Status",
      "Start Date",
      "End Date",
      "Clicks",
    ];

    const csvRows = [
      headers.join(","),
      ...banners.map((b) =>
        [
          `"${b._id}"`,
          `"${(b.title || "").replace(/"/g, '""')}"`,
          `"${(b.badgeText || b.badge || "").replace(/"/g, '""')}"`,
          `"${b.location}"`,
          `"${b.mediaUrl || b.imageUrl || b.items?.[0]?.url || ""}"`,
          `"${b.linkUrl || ""}"`,
          `"${getDynamicStatus(b)}"`,
          `"${b.startDate ? b.startDate.split("T")[0] : ""}"`,
          `"${b.endDate ? b.endDate.split("T")[0] : ""}"`,
          b.clicks || 0,
        ].join(","),
      ),
    ];

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `banners-export-${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV file exported successfully!");
  };

  const handleOpenAddModal = () => {
    setSelectedBanner(null);
    setFormData({
      title: "",
      subtitle: "",
      description: "",
      badge: "",
      badgeText: "",
      location: "HOME_HERO",
      items: [],
      mediaType: "image",
      mediaUrl: "",
      imageUrl: "",
      linkUrl: "",
      status: "active",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (banner: Banner) => {
    setSelectedBanner(banner);

    const primaryUrl = banner.mediaUrl || banner.imageUrl || banner.image || "";

    const initialItems: MediaItem[] =
      banner.items && banner.items.length > 0
        ? banner.items
        : primaryUrl
          ? [{ type: banner.mediaType || "image", url: primaryUrl }]
          : [];

    setFormData({
      title: banner.title || "",
      subtitle: banner.subtitle || "",
      description: banner.description || "",
      badge: banner.badge || "",
      badgeText: banner.badgeText || banner.badge || "",
      location: banner.location || "HOME_HERO",
      items: initialItems,
      mediaType: banner.mediaType || initialItems[0]?.type || "image",
      mediaUrl: primaryUrl,
      imageUrl: banner.imageUrl || primaryUrl,
      linkUrl: banner.linkUrl || "",
      status: banner.status || "active",
      startDate: banner.startDate
        ? banner.startDate.split("T")[0]
        : new Date().toISOString().split("T")[0],
      endDate: banner.endDate ? banner.endDate.split("T")[0] : "",
    });
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteModal = (banner: Banner) => {
    setSelectedBanner(banner);
    setIsDeleteModalOpen(true);
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/banners/${id}/toggle-status`, {
        method: "PATCH",
      });
      if (res.ok) {
        toast.success("Banner status updated successfully!");
        fetchBanners();
      } else {
        toast.error("Operation failed!");
      }
    } catch (error) {
      console.error("Error changing status:", error);
      toast.error("Unable to change status!");
    }
  };

  // 🚀 SUBMIT FORM VỚI TOAST NOTIFICATION
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    const firstUrl =
      formData.items[0]?.url || formData.mediaUrl || formData.imageUrl;

    // Validate ảnh/video
    if (!firstUrl) {
      toast.error("Please upload/select at least one image or video!");
      return;
    }

    // Validate tiêu đề
    if (!formData.title.trim()) {
      toast.error("Please enter a title for the banner!");
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading(
      selectedBanner ? "Updating Banner..." : "Creating a new Banner...",
    );

    const payload = {
      ...formData,
      mediaUrl: firstUrl,
      imageUrl: firstUrl,
      badge: formData.badgeText || formData.badge,
    };

    try {
      const endpoint = selectedBanner
        ? `${API_BASE_URL}/banners/${selectedBanner._id}`
        : `${API_BASE_URL}/banners`;

      const method = selectedBanner ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json().catch(() => ({}));

      if (res.ok) {
        toast.success(
          selectedBanner
            ? "Banner updated successfully!"
            : "Banner created successfully!",
          { id: toastId },
        );
        setIsFormModalOpen(false);
        fetchBanners();
      } else {
        const errorText = Array.isArray(resData.message)
          ? resData.message.join(", ")
          : resData.message ||
            "Save failed! Please check the data and try again.";
        toast.error(errorText, { id: toastId, duration: 5000 });
      }
    } catch (error: any) {
      console.error("Error saving banner information:", error);
      toast.error(`Unable to connect to the API server. (${API_BASE_URL})`, {
        id: toastId,
        duration: 5000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBanner = async () => {
    if (!selectedBanner) return;
    const toastId = toast.loading("Deleting Banner...");

    try {
      const res = await fetch(`${API_BASE_URL}/banners/${selectedBanner._id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Banner deleted successfully!", { id: toastId });
        setIsDeleteModalOpen(false);
        setSelectedBanner(null);
        fetchBanners();
      } else {
        toast.error("Unable to delete banner!", { id: toastId });
      }
    } catch (error) {
      console.error("Error deleting banner:", error);
      toast.error("Server connection error while deleting!", { id: toastId });
    }
  };

  const getStatusBadge = (banner: Banner) => {
    const dynamicStatus = getDynamicStatus(banner);

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
      {/* 🚀 COMPONENT HIỂN THỊ TOAST NOTIFICATION */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: "monospace",
            fontSize: "12px",
            borderRadius: "0px",
            border: "1px solid #000",
            padding: "12px 16px",
          },
        }}
      />

      {/* HEADER & BREADCRUMB */}
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
          <span className="text-brand-dark font-bold">BANNERS</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-heading tracking-wide uppercase">
              BANNER MANAGEMENT
            </h1>
            <p className="text-xs text-brand-dark/60 mt-1">
              CONFIGURE PROMOTIONAL BANNERS, HERO SLIDERS, AND PROMO BARS
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              icon={Download}
              onClick={handleExportCSV}
            >
              EXPORT DATA
            </Button>

            <Button
              variant="chakra"
              size="sm"
              icon={Plus}
              onClick={handleOpenAddModal}
            >
              CREATE BANNER
            </Button>
          </div>
        </div>
      </div>

      {/* METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-brand-dark/15 p-5 bg-white space-y-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-center text-brand-dark/60 text-xs">
            <span className="uppercase">TOTAL BANNERS</span>
            <ImageIcon size={16} className="text-orange-500" />
          </div>
          <p className="text-3xl font-extrabold text-brand-dark">
            {banners.length}
          </p>
        </div>

        <div className="border border-brand-dark/15 p-5 bg-white space-y-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-center text-brand-dark/60 text-xs">
            <span className="uppercase">ACTIVE BANNERS</span>
            <Power size={16} className="text-emerald-500" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-600">
            {banners.filter((b) => getDynamicStatus(b) === "active").length}
          </p>
        </div>

        <div className="border border-brand-dark/15 p-5 bg-white space-y-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-center text-brand-dark/60 text-xs">
            <span className="uppercase">SCHEDULED</span>
            <Calendar size={16} className="text-amber-500" />
          </div>
          <p className="text-3xl font-extrabold text-amber-600">
            {banners.filter((b) => getDynamicStatus(b) === "scheduled").length}
          </p>
        </div>

        <div className="border border-brand-dark/15 p-5 bg-white space-y-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-center text-brand-dark/60 text-xs">
            <span className="uppercase">TOTAL CLICKS</span>
            <Eye size={16} className="text-sky-500" />
          </div>
          <p className="text-3xl font-extrabold text-brand-dark">
            {banners.reduce((acc, curr) => acc + (curr.clicks || 0), 0)}
          </p>
        </div>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        <Input
          icon={Search}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="SEARCH BY TITLE, ID, OR URL..."
          className="uppercase"
        />

        <div className="flex flex-wrap items-center gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 border border-brand-dark/20 px-3 py-2 bg-brand-dark/5">
            <Filter size={12} className="text-brand-dark/60" />
            <span className="font-bold uppercase text-[10px] text-brand-dark/60">
              LOCATION:
            </span>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="bg-transparent outline-none font-bold uppercase cursor-pointer text-xs"
            >
              <option value="all">ALL LOCATIONS</option>
              <option value="HOME_HERO">HOME HERO</option>
              <option value="PROMO_BAR">PROMO BAR</option>
              <option value="CATEGORY_SIDEBAR">SIDEBAR</option>
              <option value="POPUP">POPUP</option>
            </select>
          </div>

          <div className="flex items-center gap-2 border border-brand-dark/20 px-3 py-2 bg-brand-dark/5">
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
      </div>

      {/* BANNERS TABLE */}
      <div className="border border-brand-dark/15 overflow-x-auto bg-white">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-brand-dark text-white uppercase text-[11px] tracking-wider border-b border-brand-dark">
              <th className="py-3 px-4">BANNER DETAILS</th>
              <th className="py-3 px-4">BADGE / TEXT</th>
              <th className="py-3 px-4">PLACEMENT</th>
              <th className="py-3 px-4">LINK URL</th>
              <th className="py-3 px-4">CLICKS</th>
              <th className="py-3 px-4">STATUS</th>
              <th className="py-3 px-4 text-center">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-dark/10">
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
                    LOADING BANNERS FROM BACKEND...
                  </div>
                </td>
              </tr>
            ) : filteredBanners.length > 0 ? (
              filteredBanners.map((banner) => {
                const imgUrl =
                  banner.mediaUrl ||
                  banner.imageUrl ||
                  banner.image ||
                  banner.items?.[0]?.url ||
                  "";
                const isVideo =
                  banner.mediaType === "video" ||
                  banner.items?.[0]?.type === "video";

                return (
                  <tr
                    key={banner._id}
                    className="hover:bg-brand-dark/5 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-10 bg-brand-dark/10 border border-brand-dark/20 flex items-center justify-center shrink-0 overflow-hidden relative">
                          {imgUrl ? (
                            isVideo ? (
                              <video
                                src={imgUrl}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <img
                                src={imgUrl}
                                alt={banner.title}
                                className="w-full h-full object-cover"
                              />
                            )
                          ) : (
                            <ImageIcon
                              size={16}
                              className="text-brand-dark/40"
                            />
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-brand-dark uppercase block">
                            {banner.title}
                          </span>
                          {banner.description && (
                            <span className="text-[10px] text-brand-dark/60 block line-clamp-1">
                              {banner.description}
                            </span>
                          )}
                          <span className="text-[10px] text-brand-dark/40 block font-mono">
                            {banner._id}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      {banner.badgeText || banner.badge ? (
                        <span className="px-2 py-0.5 bg-orange-500 text-white text-[10px] font-bold uppercase tracking-wider">
                          {banner.badgeText || banner.badge}
                        </span>
                      ) : (
                        <span className="text-brand-dark/30 italic">-</span>
                      )}
                    </td>

                    <td className="py-4 px-4 font-bold text-brand-dark/80">
                      <span className="px-2 py-1 bg-brand-dark/5 border border-brand-dark/10 text-[10px]">
                        {banner.location}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      {banner.linkUrl ? (
                        <a
                          href={banner.linkUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-orange-600 hover:underline text-[11px]"
                        >
                          <span>{banner.linkUrl}</span>
                          <ExternalLink size={10} />
                        </a>
                      ) : (
                        <span className="text-brand-dark/30 italic">-</span>
                      )}
                    </td>

                    <td className="py-4 px-4 font-bold text-brand-dark">
                      {(banner.clicks || 0).toLocaleString()}
                    </td>

                    <td className="py-4 px-4">{getStatusBadge(banner)}</td>

                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(banner._id)}
                          className={`p-1.5 border transition-colors ${
                            banner.status === "active"
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
                          onClick={() => handleOpenEditModal(banner)}
                        >
                          EDIT
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          icon={Trash2}
                          onClick={() => handleOpenDeleteModal(banner)}
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
                  className="py-12 text-center text-brand-dark/50 border-t border-brand-dark/10"
                >
                  NO BANNERS FOUND.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL: ADD / EDIT BANNER */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={selectedBanner ? "EDIT BANNER" : "CREATE NEW BANNER"}
        maxWidth="md"
      >
        <form
          onSubmit={handleSubmitForm}
          className="space-y-4 text-xs font-mono"
        >
          <Input
            label="BANNER TITLE"
            required
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="E.g. Summer Chunin Festival"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="BADGE / TAG TEXT"
              value={formData.badgeText}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  badgeText: e.target.value,
                  badge: e.target.value,
                })
              }
              placeholder="E.g. SPECIAL DROPS, 50% OFF"
            />

            <Input
              label="SUBTITLE (OPTIONAL)"
              value={formData.subtitle}
              onChange={(e) =>
                setFormData({ ...formData, subtitle: e.target.value })
              }
              placeholder="E.g. Exclusive Shinobi Gear"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-dark mb-2 uppercase">
              DESCRIPTION / PROMO CONTENT
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Enter short banner description..."
              className="w-full px-3 py-2 text-xs border border-brand-dark/20 text-brand-dark bg-white focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-brand-dark mb-2 uppercase">
                PLACEMENT LOCATION
              </label>
              <select
                value={formData.location}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: e.target.value as Banner["location"],
                  })
                }
                className="w-full px-3 py-2.5 text-xs font-bold border border-brand-dark/20 text-brand-dark bg-white focus:outline-none focus:border-orange-500"
              >
                <option value="HOME_HERO">HOME HERO</option>
                <option value="PROMO_BAR">PROMO BAR</option>
                <option value="CATEGORY_SIDEBAR">CATEGORY SIDEBAR</option>
                <option value="POPUP">POPUP</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-dark mb-2 uppercase">
                MEDIA TYPE
              </label>
              <select
                value={formData.mediaType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    mediaType: e.target.value as "image" | "video",
                  })
                }
                className="w-full px-3 py-2.5 text-xs font-bold border border-brand-dark/20 text-brand-dark bg-white focus:outline-none focus:border-orange-500 uppercase"
              >
                <option value="image">IMAGE (*.JPG, *.PNG)</option>
                <option value="video">VIDEO (*.MP4)</option>
              </select>
            </div>
          </div>

          {/* MEDIA UPLOAD COMPONENT */}
          <MediaUpload
            label={`BANNER ${formData.mediaType.toUpperCase()} ASSETS`}
            maxFiles={10}
            acceptTypes={formData.mediaType === "video" ? "video/*" : "image/*"}
            value={formData.items.map((item) => item.url)}
            onChange={(urls) => {
              const newItems: MediaItem[] = urls.map((url) => {
                const existing = formData.items.find((i) => i.url === url);
                return (
                  existing || {
                    type: formData.mediaType,
                    url,
                  }
                );
              });
              setFormData({
                ...formData,
                items: newItems,
                mediaUrl: urls[0] || "",
                imageUrl: urls[0] || "",
              });
            }}
          />

          <Input
            label="TARGET LINK URL"
            value={formData.linkUrl}
            onChange={(e) =>
              setFormData({ ...formData, linkUrl: e.target.value })
            }
            placeholder="/shop or https://..."
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
              disabled={submitting}
              onClick={() => setIsFormModalOpen(false)}
            >
              CANCEL
            </Button>
            <Button
              type="submit"
              variant="chakra"
              size="sm"
              disabled={submitting}
              icon={submitting ? Loader2 : Plus}
            >
              {submitting
                ? "SAVING..."
                : selectedBanner
                  ? "SAVE CHANGES"
                  : "CREATE BANNER"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: CONFIRM DELETE */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="CONFIRM BANNER DELETION"
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs font-mono">
          <div className="flex items-start gap-3 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-700">
            <AlertTriangle
              className="shrink-0 text-rose-600 mt-0.5"
              size={18}
            />
            <p className="leading-relaxed">
              Are you sure you want to delete banner{" "}
              <strong className="underline font-bold uppercase text-rose-800">
                {selectedBanner?.title}
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
              onClick={handleDeleteBanner}
            >
              CONFIRM DELETE
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
