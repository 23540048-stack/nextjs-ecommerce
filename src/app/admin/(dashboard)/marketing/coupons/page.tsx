"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import {
  Ticket,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Power,
  ChevronRight,
  Copy,
  Check,
  Percent,
  DollarSign,
  Users,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import { api } from "@/lib/api";

/**
 * Format currency as USD
 */
const formatUSD = (value: number | string | undefined) => {
  const numberValue = Number(value) || 0;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(numberValue);
};

export interface Coupon {
  _id: string;
  code: string;
  title: string;

  // Frontend uses simple values
  // percentage = percentage discount
  // fixed = fixed USD discount
  discountType: "percentage" | "fixed";

  discountValue: number;
  minOrderValue: number;
  maxUses: number;
  usedCount: number;

  status: "active" | "inactive" | "expired";

  startDate: string;
  endDate?: string;
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  const [formData, setFormData] = useState({
    code: "",
    title: "",
    discountType: "percentage" as Coupon["discountType"],
    discountValue: "",
    minOrderValue: "",
    maxUses: "",
    status: "active" as Coupon["status"],
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
  });

  // ============================================================
  // DYNAMIC STATUS
  // ============================================================

  const getDynamicStatus = useCallback((coupon: Coupon): Coupon["status"] => {
    if (coupon.status === "inactive") {
      return "inactive";
    }

    const now = new Date();

    const endDate = coupon.endDate ? new Date(coupon.endDate) : null;

    if (endDate) {
      endDate.setHours(23, 59, 59, 999);
    }

    if (
      (endDate && endDate < now) ||
      (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses)
    ) {
      return "expired";
    }

    return "active";
  }, []);

  // ============================================================
  // FETCH COUPONS
  // ============================================================

  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);

      const queryParams = new URLSearchParams();

      if (searchQuery) {
        queryParams.append("search", searchQuery);
      }

      const res = await api.get(`/coupons?${queryParams.toString()}`);
      const data = res.data;

      const couponList: Coupon[] = Array.isArray(data)
        ? data
        : data?.data || [];

      /**
       * Normalize backend discountType.
       *
       * Backend may return:
       * PERCENTAGE
       * FIXED_AMOUNT
       *
       * Frontend uses:
       * percentage
       * fixed
       */
      const normalizedCoupons: Coupon[] = couponList.map((coupon: any) => ({
        ...coupon,

        discountType:
          coupon.discountType === "PERCENTAGE" ? "percentage" : "fixed",

        discountValue: Number(coupon.discountValue) || 0,

        minOrderValue: Number(coupon.minOrderValue) || 0,

        maxUses: Number(coupon.maxUses) || 0,

        usedCount: Number(coupon.usedCount) || 0,
      }));

      setCoupons(normalizedCoupons);
    } catch (error) {
      console.error("Failed to load coupons from backend:", error);

      toast.error("Failed to load coupons list!");
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  // ============================================================
  // COPY COUPON CODE
  // ============================================================

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);

    setCopiedCode(code);

    toast.success(`Copied code: ${code}`);

    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  // ============================================================
  // FILTER COUPONS
  // ============================================================

  const filteredCoupons = coupons.filter((coupon) => {
    if (statusFilter === "all") {
      return true;
    }

    return getDynamicStatus(coupon) === statusFilter;
  });

  // ============================================================
  // OPEN ADD MODAL
  // ============================================================

  const handleOpenAddModal = () => {
    setSelectedCoupon(null);

    setFormData({
      code: "",
      title: "",
      discountType: "percentage",
      discountValue: "",
      minOrderValue: "0",
      maxUses: "100",
      status: "active",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
    });

    setIsFormModalOpen(true);
  };

  // ============================================================
  // OPEN EDIT MODAL
  // ============================================================

  const handleOpenEditModal = (coupon: Coupon) => {
    setSelectedCoupon(coupon);

    setFormData({
      code: coupon.code || "",

      title: coupon.title || "",

      discountType:
        coupon.discountType === "percentage" ? "percentage" : "fixed",

      discountValue:
        coupon.discountValue !== undefined && coupon.discountValue !== null
          ? coupon.discountValue.toString()
          : "",

      minOrderValue:
        coupon.minOrderValue !== undefined && coupon.minOrderValue !== null
          ? coupon.minOrderValue.toString()
          : "0",

      maxUses:
        coupon.maxUses !== undefined && coupon.maxUses !== null
          ? coupon.maxUses.toString()
          : "100",

      status: coupon.status || "active",

      startDate: coupon.startDate
        ? coupon.startDate.split("T")[0]
        : new Date().toISOString().split("T")[0],

      endDate: coupon.endDate ? coupon.endDate.split("T")[0] : "",
    });

    setIsFormModalOpen(true);
  };

  // ============================================================
  // OPEN DELETE MODAL
  // ============================================================

  const handleOpenDeleteModal = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setIsDeleteModalOpen(true);
  };

  // ============================================================
  // TOGGLE STATUS
  // ============================================================

  const handleToggleStatus = async (id: string) => {
    try {
      await api.patch(`/coupons/${id}/toggle-status`);
      toast.success("Coupon status updated!");
      fetchCoupons();
    } catch (error) {
      console.error("Failed to toggle coupon status:", error);

      toast.error("Failed to update status!");
    }
  };

  // ============================================================
  // SUBMIT CREATE / EDIT
  // ============================================================

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    // ----------------------------
    // VALIDATION
    // ----------------------------

    if (!formData.code.trim()) {
      toast.error("Please enter a coupon code!");
      return;
    }

    if (!formData.title.trim()) {
      toast.error("Please enter a coupon title!");
      return;
    }

    if (!formData.discountValue || Number(formData.discountValue) <= 0) {
      toast.error("Discount value must be greater than 0!");
      return;
    }

    // Percentage validation
    if (
      formData.discountType === "percentage" &&
      Number(formData.discountValue) > 100
    ) {
      toast.error("Percentage discount cannot exceed 100%!");
      return;
    }

    if (!formData.startDate) {
      toast.error("Please select a start date!");
      return;
    }

    const toastId = toast.loading("Processing...");

    try {
      /**
       * Frontend:
       * percentage
       * fixed
       *
       * Backend:
       * PERCENTAGE
       * FIXED_AMOUNT
       */
      const formattedDiscountType =
        formData.discountType === "percentage" ? "PERCENTAGE" : "FIXED_AMOUNT";

      const payload = {
        ...formData,

        discountType: formattedDiscountType,

        discountValue: Number(formData.discountValue),

        minOrderValue: Number(formData.minOrderValue || 0),

        maxUses: Number(formData.maxUses || 0),
      };

      if (selectedCoupon) {
        await api.put(`/coupons/${selectedCoupon._id}`, payload);
      } else {
        await api.post("/coupons", payload);
      }

      toast.success(
        selectedCoupon
          ? "Coupon updated successfully!"
          : "New coupon created successfully!",
        {
          id: toastId,
        },
      );

      setIsFormModalOpen(false);

      fetchCoupons();
    } catch (error: any) {
      console.error("Failed to save coupon details:", error);

      const errorMessage = Array.isArray(error?.response?.data?.message)
        ? error.response.data.message.join(", ")
        : error?.response?.data?.message ||
          "Server connection error! Please try again.";

      toast.error(errorMessage, {
        id: toastId,
      });
    }
  };

  // ============================================================
  // DELETE COUPON
  // ============================================================

  const handleDeleteCoupon = async () => {
    if (!selectedCoupon) {
      return;
    }

    const toastId = toast.loading("Deleting coupon...");

    try {
      await api.delete(`/coupons/${selectedCoupon._id}`);

      toast.success("Coupon deleted successfully!", {
        id: toastId,
      });

      setIsDeleteModalOpen(false);

      setSelectedCoupon(null);

      fetchCoupons();
    } catch (error) {
      console.error("Failed to delete coupon:", error);

      toast.error("Failed to delete this coupon!", {
        id: toastId,
      });
    }
  };

  // ============================================================
  // STATUS BADGE
  // ============================================================

  const getStatusBadge = (coupon: Coupon) => {
    const dynamicStatus = getDynamicStatus(coupon);

    switch (dynamicStatus) {
      case "active":
        return (
          <Badge variant="orange" size="sm">
            ACTIVE
          </Badge>
        );

      case "expired":
        return (
          <Badge variant="danger" size="sm">
            EXPIRED
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

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="w-full min-h-screen bg-white text-brand-dark p-6 sm:p-8 font-mono space-y-8">
      <Toaster position="top-right" reverseOrder={false} />

      {/* ======================================================
          HEADER
      ====================================================== */}

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

          <span className="text-brand-dark font-bold">COUPONS</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-heading tracking-wide uppercase flex items-center gap-2">
              <Ticket className="text-orange-600" size={32} />
              COUPONS MANAGEMENT
            </h1>

            <p className="text-xs text-brand-dark/60 mt-1">
              CREATE, TRACK AND MANAGE DISCOUNT VOUCHERS AND PROMO CODES
            </p>
          </div>

          <Button
            variant="chakra"
            size="sm"
            icon={Plus}
            onClick={handleOpenAddModal}
          >
            CREATE COUPON
          </Button>
        </div>
      </div>

      {/* ======================================================
          METRICS
      ====================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border border-brand-dark/15 p-5 bg-white space-y-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-center text-brand-dark/60 text-xs font-bold uppercase">
            <span>TOTAL COUPONS</span>

            <Ticket size={16} className="text-orange-500" />
          </div>

          <p className="text-3xl font-extrabold text-brand-dark">
            {coupons.length}
          </p>
        </div>

        <div className="border border-brand-dark/15 p-5 bg-white space-y-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-center text-brand-dark/60 text-xs font-bold uppercase">
            <span>ACTIVE VOUCHERS</span>

            <Power size={16} className="text-emerald-500" />
          </div>

          <p className="text-3xl font-extrabold text-emerald-600">
            {coupons.filter((c) => getDynamicStatus(c) === "active").length}
          </p>
        </div>

        <div className="border border-brand-dark/15 p-5 bg-white space-y-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-center text-brand-dark/60 text-xs font-bold uppercase">
            <span>TOTAL REDEEMED</span>

            <Users size={16} className="text-sky-500" />
          </div>

          <p className="text-3xl font-extrabold text-brand-dark">
            {coupons.reduce((acc, curr) => acc + (curr.usedCount || 0), 0)}
          </p>
        </div>
      </div>

      {/* ======================================================
          SEARCH & FILTER
      ====================================================== */}

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

          <span className="font-bold text-[10px] text-brand-dark/60 uppercase">
            STATUS:
          </span>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent outline-none font-bold uppercase cursor-pointer text-xs"
          >
            <option value="all">ALL STATUSES</option>

            <option value="active">ACTIVE</option>

            <option value="inactive">INACTIVE</option>

            <option value="expired">EXPIRED</option>
          </select>
        </div>
      </div>

      {/* ======================================================
          COUPONS TABLE
      ====================================================== */}

      <div className="border border-brand-dark/15 overflow-x-auto bg-white">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-brand-dark text-white uppercase text-[11px] tracking-wider border-b border-brand-dark">
              <th className="py-3 px-4">COUPON CODE</th>

              <th className="py-3 px-4">DESCRIPTION</th>

              <th className="py-3 px-4">DISCOUNT</th>

              <th className="py-3 px-4">MIN ORDER</th>

              <th className="py-3 px-4">USAGE (USED/MAX)</th>

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
                    LOADING COUPONS FROM BACKEND...
                  </div>
                </td>
              </tr>
            ) : filteredCoupons.length > 0 ? (
              filteredCoupons.map((coupon) => (
                <tr
                  key={coupon._id}
                  className="hover:bg-brand-dark/5 transition-colors"
                >
                  {/* CODE */}

                  <td className="py-4 px-4 font-bold text-orange-600">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 border border-orange-500 bg-orange-50 uppercase tracking-wide">
                        {coupon.code}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleCopyCode(coupon.code)}
                        className="text-brand-dark/40 hover:text-brand-dark transition-colors cursor-pointer"
                        title="Copy code"
                      >
                        {copiedCode === coupon.code ? (
                          <Check size={14} className="text-emerald-600" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* DESCRIPTION */}

                  <td className="py-4 px-4">
                    <span className="font-bold text-brand-dark block uppercase">
                      {coupon.title}
                    </span>

                    <span className="text-[11px] text-brand-dark/50 block">
                      {coupon._id}
                    </span>
                  </td>

                  {/* DISCOUNT */}

                  <td className="py-4 px-4 font-bold">
                    {coupon.discountType === "percentage" ? (
                      <span className="flex items-center gap-1">
                        <Percent size={12} className="text-orange-500" />
                        {coupon.discountValue}% OFF
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <DollarSign size={12} className="text-emerald-600" />
                        {formatUSD(coupon.discountValue)} OFF
                      </span>
                    )}
                  </td>

                  {/* MIN ORDER */}

                  <td className="py-4 px-4 font-mono text-brand-dark/80">
                    {coupon.minOrderValue > 0
                      ? formatUSD(coupon.minOrderValue)
                      : "NO MIN"}
                  </td>

                  {/* USAGE */}

                  <td className="py-4 px-4 font-bold">
                    <span className="text-orange-600">
                      {coupon.usedCount || 0}
                    </span>{" "}
                    / {coupon.maxUses || "∞"}
                  </td>

                  {/* STATUS */}

                  <td className="py-4 px-4">{getStatusBadge(coupon)}</td>

                  {/* ACTIONS */}

                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(coupon._id)}
                        className={`p-1.5 border transition-colors cursor-pointer ${
                          coupon.status === "active"
                            ? "border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10"
                            : "border-rose-500/40 text-rose-600 hover:bg-rose-500/10"
                        }`}
                        title="Toggle Active Status"
                      >
                        <Power size={13} />
                      </button>

                      <Button
                        variant="outline"
                        size="sm"
                        icon={Edit}
                        onClick={() => handleOpenEditModal(coupon)}
                      >
                        EDIT
                      </Button>

                      <Button
                        variant="danger"
                        size="sm"
                        icon={Trash2}
                        onClick={() => handleOpenDeleteModal(coupon)}
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
                  colSpan={7}
                  className="py-12 text-center text-brand-dark/50"
                >
                  NO COUPONS FOUND.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ======================================================
          ADD / EDIT COUPON MODAL
      ====================================================== */}

      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={selectedCoupon ? "EDIT COUPON" : "CREATE NEW COUPON"}
        maxWidth="md"
      >
        <form
          onSubmit={handleSubmitForm}
          className="space-y-4 text-xs font-mono"
        >
          <Input
            label="COUPON TITLE *"
            required
            value={formData.title}
            onChange={(e) =>
              setFormData({
                ...formData,
                title: e.target.value,
              })
            }
            placeholder="E.g. Special Ninja Fan Voucher"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="COUPON CODE *"
              required
              value={formData.code}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  code: e.target.value.toUpperCase(),
                })
              }
              placeholder="E.g. NINJA2026"
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
                    discountType: e.target.value as Coupon["discountType"],
                  })
                }
                className="w-full px-3 py-2.5 text-xs font-bold border border-brand-dark/20 text-brand-dark bg-white focus:outline-none focus:border-orange-500 uppercase"
              >
                <option value="percentage">PERCENTAGE (%)</option>

                <option value="fixed">FIXED AMOUNT (USD)</option>
              </select>
            </div>
          </div>

          {/* DISCOUNT VALUE + MIN ORDER */}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label={
                formData.discountType === "percentage"
                  ? "DISCOUNT VALUE (%) *"
                  : "DISCOUNT VALUE (USD) *"
              }
              type="number"
              required
              min="0"
              max={formData.discountType === "percentage" ? "100" : undefined}
              step={formData.discountType === "percentage" ? "1" : "0.01"}
              value={formData.discountValue}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  discountValue: e.target.value,
                })
              }
              placeholder={formData.discountType === "percentage" ? "10" : "20"}
            />

            <Input
              label="MIN ORDER VALUE (USD)"
              type="number"
              min="0"
              step="0.01"
              value={formData.minOrderValue}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  minOrderValue: e.target.value,
                })
              }
              placeholder="0"
            />
          </div>

          {/* MAX USES + STATUS */}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="MAX USES (LIMIT) *"
              type="number"
              required
              min="0"
              value={formData.maxUses}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  maxUses: e.target.value,
                })
              }
              placeholder="100"
            />

            <div>
              <label className="block text-xs font-bold text-brand-dark mb-2 uppercase">
                STATUS
              </label>

              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as Coupon["status"],
                  })
                }
                className="w-full px-3 py-2.5 text-xs font-bold border border-brand-dark/20 text-brand-dark bg-white focus:outline-none focus:border-orange-500 uppercase"
              >
                <option value="active">ACTIVE</option>

                <option value="inactive">INACTIVE</option>

                <option value="expired">EXPIRED</option>
              </select>
            </div>
          </div>

          {/* DATES */}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="START DATE *"
              type="date"
              required
              value={formData.startDate}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  startDate: e.target.value,
                })
              }
            />

            <Input
              label="END DATE (OPTIONAL)"
              type="date"
              value={formData.endDate}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  endDate: e.target.value,
                })
              }
            />
          </div>

          {/* ACTIONS */}

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
              {selectedCoupon ? "SAVE CHANGES" : "CREATE COUPON"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ======================================================
          DELETE MODAL
      ====================================================== */}

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="CONFIRM COUPON DELETION"
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs font-mono">
          <div className="flex items-start gap-3 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-700">
            <AlertTriangle
              className="shrink-0 text-rose-600 mt-0.5"
              size={18}
            />

            <p className="leading-relaxed">
              Are you sure you want to delete coupon code{" "}
              <strong className="underline font-bold uppercase text-rose-800">
                {selectedCoupon?.code}
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
              onClick={handleDeleteCoupon}
            >
              CONFIRM DELETE
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
