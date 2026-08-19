"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import {
  Crown,
  ChevronRight,
  Plus,
  Save,
  Trash2,
  Edit3,
  Loader2,
  Ticket,
  X,
  Award,
  Settings,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { api } from "@/lib/api";

interface MembershipTier {
  _id?: string;
  id?: string;
  name: string;
  minSpent: number;
  discountRate: number;
  pointsMultiplier: number;
  perks?: string[];
  vouchers?: string[];
  voucherIds?: any[];
  badgeColor?: string;
}

interface VoucherItem {
  _id?: string;
  id?: string;
  code: string;
  discountType?: "FIXED" | "PERCENTAGE";
  discountValue?: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  expirationDate?: string;
  isChakraRedeemable?: boolean;
  chakraCost?: number;
}

const BADGE_COLOR_PRESETS = [
  {
    label: "Purple (Chakra)",
    value: "border-purple-300 bg-purple-50 text-purple-700",
  },
  { label: "Blue (Genin)", value: "border-blue-300 bg-blue-50 text-blue-700" },
  {
    label: "Emerald (Jonin)",
    value: "border-emerald-300 bg-emerald-50 text-emerald-700",
  },
  {
    label: "Amber (Hokage)",
    value: "border-amber-300 bg-amber-50 text-amber-700",
  },
  { label: "Rose (Anbu)", value: "border-rose-300 bg-rose-50 text-rose-700" },
];

export default function MembershipSettingsPage() {
  const [tiers, setTiers] = useState<MembershipTier[]>([]);
  const [availableVouchers, setAvailableVouchers] = useState<VoucherItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Global Loyalty Settings State
  const [pointsRatio, setPointsRatio] = useState<number>(0.1);
  const [pointRedeemValue, setPointRedeemValue] = useState<number>(1);
  const [chakraPerVoucher, setChakraPerVoucher] = useState<number>(100);
  const [autoUpgrade, setAutoUpgrade] = useState<boolean>(true);

  // Form State for Voucher Creation
  const [isVoucherSubmitting, setIsVoucherSubmitting] =
    useState<boolean>(false);
  const [voucherForm, setVoucherForm] = useState({
    code: "",
    discountType: "FIXED" as "FIXED" | "PERCENTAGE",
    discountValue: 0,
    minOrderValue: 0,
    maxDiscountAmount: 0,
    usageLimit: 0,
    expirationDate: "",
    isChakraRedeemable: false,
    chakraCost: 100,
  });

  // Modals Control
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<MembershipTier | null>(null);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [tierToDelete, setTierToDelete] = useState<MembershipTier | null>(null);

  // Voucher Delete Modal State
  const [isDeleteVoucherModalOpen, setIsDeleteVoucherModalOpen] =
    useState(false);
  const [voucherToDelete, setVoucherToDelete] = useState<VoucherItem | null>(
    null,
  );

  // Form State for Tier Create/Update
  const [tierForm, setTierForm] = useState({
    name: "",
    minSpent: 0,
    discountRate: 0,
    pointsMultiplier: 1.0,
    perkInput: "",
    perks: [] as string[],
    vouchers: [] as string[],
    badgeColor: BADGE_COLOR_PRESETS[0].value,
  });

  const [selectedVoucherCode, setSelectedVoucherCode] = useState<string>("");

  // Fetch Data from Backend
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const [tiersRes, settingsRes, vouchersRes] = await Promise.all([
        api.get("/membership-tiers").catch(() => ({ data: [] })),
        api.get("/membership-settings").catch(() => ({ data: null })),
        api.get("/vouchers").catch(() => ({ data: [] })),
      ]);

      if (vouchersRes?.data) {
        const vData = vouchersRes.data;
        const voucherList = Array.isArray(vData) ? vData : vData.data || [];
        setAvailableVouchers(voucherList);
      }

      if (tiersRes?.data) {
        const tiersData = tiersRes.data;
        setTiers(Array.isArray(tiersData) ? tiersData : tiersData.data || []);
      }

      if (settingsRes?.data) {
        const settingsData = settingsRes.data;
        setPointsRatio(settingsData.pointsRatio ?? 0.1);
        setPointRedeemValue(settingsData.pointRedeemValue ?? 1);
        setChakraPerVoucher(settingsData.chakraPerVoucher ?? 100);
        setAutoUpgrade(settingsData.autoUpgrade ?? true);
      }
    } catch (error) {
      console.error("Error loading membership data:", error);
      toast.error("Failed to load membership data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Create Voucher
  const handleCreateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherForm.code.trim()) {
      toast.error("Voucher code is required!");
      return;
    }

    setIsVoucherSubmitting(true);
    try {
      const payload = {
        code: voucherForm.code.trim().toUpperCase(),
        discountType: voucherForm.discountType,
        discountValue: Number(voucherForm.discountValue),
        minOrderValue: Number(voucherForm.minOrderValue),
        maxDiscountAmount: Number(voucherForm.maxDiscountAmount),
        usageLimit: Number(voucherForm.usageLimit),
        expirationDate: voucherForm.expirationDate || undefined,
        isChakraRedeemable: voucherForm.isChakraRedeemable,
        chakraCost: voucherForm.isChakraRedeemable
          ? Number(voucherForm.chakraCost)
          : 0,
      };

      await api.post("/vouchers", payload);
      toast.success("Voucher created successfully!");

      setVoucherForm({
        code: "",
        discountType: "FIXED",
        discountValue: 0,
        minOrderValue: 0,
        maxDiscountAmount: 0,
        usageLimit: 0,
        expirationDate: "",
        isChakraRedeemable: false,
        chakraCost: 100,
      });

      await fetchData();
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to create voucher.";
      toast.error(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setIsVoucherSubmitting(false);
    }
  };

  // Delete Voucher
  const handleOpenDeleteVoucherModal = (voucher: VoucherItem) => {
    setVoucherToDelete(voucher);
    setIsDeleteVoucherModalOpen(true);
  };

  const handleConfirmDeleteVoucher = async () => {
    const voucherId = voucherToDelete?._id || voucherToDelete?.id;
    if (!voucherId) return;

    try {
      setIsSaving(true);
      await api.delete(`/vouchers/${voucherId}`);
      toast.success("Voucher deleted successfully!");
      setIsDeleteVoucherModalOpen(false);
      setVoucherToDelete(null);
      await fetchData();
    } catch (error) {
      toast.error("Failed to delete voucher.");
    } finally {
      setIsSaving(false);
    }
  };

  // Open Edit Tier Modal (Xử lý trích xuất Voucher chuẩn xác)
  const handleOpenEditModal = (tier: MembershipTier) => {
    setEditingTier(tier);

    let extractedVouchers: string[] = [];

    // Ưu tiên trích xuất từ voucherIds
    if (Array.isArray(tier.voucherIds) && tier.voucherIds.length > 0) {
      extractedVouchers = tier.voucherIds.map((v: any) => {
        if (typeof v === "object" && v?.code) return v.code;
        // Nếu Backend trả về dạng ID, tìm Code tương ứng từ danh sách Voucher có sẵn
        const found = availableVouchers.find(
          (av) => (av._id || av.id) === String(v),
        );
        return found ? found.code : String(v);
      });
    } else if (Array.isArray(tier.vouchers) && tier.vouchers.length > 0) {
      extractedVouchers = tier.vouchers.map((v: any) =>
        typeof v === "object" && v?.code ? v.code : String(v),
      );
    }

    setTierForm({
      name: tier.name || "",
      minSpent: tier.minSpent ?? 0,
      discountRate: tier.discountRate ?? 0,
      pointsMultiplier: tier.pointsMultiplier ?? 1.0,
      perkInput: "",
      perks: Array.isArray(tier.perks) ? [...tier.perks] : [],
      vouchers: Array.from(new Set(extractedVouchers)), // Bỏ các mã trùng lặp
      badgeColor: tier.badgeColor || BADGE_COLOR_PRESETS[0].value,
    });
    setSelectedVoucherCode("");
    setIsAddEditModalOpen(true);
  };

  // Open Add Tier Modal
  const handleOpenAddModal = () => {
    setEditingTier(null);
    setTierForm({
      name: "",
      minSpent: 0,
      discountRate: 0,
      pointsMultiplier: 1.0,
      perkInput: "",
      perks: [],
      vouchers: [],
      badgeColor: BADGE_COLOR_PRESETS[0].value,
    });
    setSelectedVoucherCode("");
    setIsAddEditModalOpen(true);
  };

  const handleSelectExistingVoucher = () => {
    if (!selectedVoucherCode) return;
    if (tierForm.vouchers.includes(selectedVoucherCode)) {
      toast.error("Voucher code already added to this tier!");
      return;
    }
    setTierForm({
      ...tierForm,
      vouchers: [...tierForm.vouchers, selectedVoucherCode],
    });
    setSelectedVoucherCode("");
  };

  const handleRemoveVoucherFromTier = (index: number) => {
    setTierForm({
      ...tierForm,
      vouchers: tierForm.vouchers.filter((_, i) => i !== index),
    });
  };

  const handleAddPerk = () => {
    if (!tierForm.perkInput.trim()) return;
    setTierForm({
      ...tierForm,
      perks: [...tierForm.perks, tierForm.perkInput.trim()],
      perkInput: "",
    });
  };

  const handleRemovePerk = (index: number) => {
    setTierForm({
      ...tierForm,
      perks: tierForm.perks.filter((_, i) => i !== index),
    });
  };

  // Save Tier Form (Gửi song song cả Mã Voucher & ID Voucher)
  const handleSaveTierForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // Map danh sách Voucher Code sang Voucher ID tương ứng trong DB
    const matchedVoucherIds = tierForm.vouchers
      .map((code) => {
        const found = availableVouchers.find((v) => v.code === code);
        return found?._id || found?.id || code;
      })
      .filter(Boolean);

    const payload = {
      name: tierForm.name.toUpperCase(),
      minSpent: Number(tierForm.minSpent),
      discountRate: Number(tierForm.discountRate),
      pointsMultiplier: Number(tierForm.pointsMultiplier),
      perks: tierForm.perks,
      vouchers: tierForm.vouchers, // Danh sách Mã
      voucherIds: matchedVoucherIds, // Danh sách ID
      badgeColor: tierForm.badgeColor,
    };

    try {
      const targetId = editingTier?._id || editingTier?.id;

      if (targetId) {
        await api.patch(`/membership-tiers/${targetId}`, payload);
        toast.success("Tier updated successfully!");
      } else {
        await api.post("/membership-tiers", payload);
        toast.success("New tier created successfully!");
      }

      await fetchData();
      setIsAddEditModalOpen(false);
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Error saving tier.";
      toast.error(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    const targetId = tierToDelete?._id || tierToDelete?.id;
    if (!targetId) return;

    try {
      setIsSaving(true);
      await api.delete(`/membership-tiers/${targetId}`);
      toast.success("Tier deleted successfully!");
      setIsDeleteModalOpen(false);
      await fetchData();
    } catch (error: any) {
      toast.error("Failed to delete tier.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmSaveSettings = async () => {
    try {
      setIsSaving(true);
      await api.put("/membership-settings", {
        pointsRatio: Number(pointsRatio),
        pointRedeemValue: Number(pointRedeemValue),
        chakraPerVoucher: Number(chakraPerVoucher),
        autoUpgrade,
      });
      toast.success("Global settings saved successfully!");
      setIsSaveModalOpen(false);
      await fetchData();
    } catch (error: any) {
      toast.error("Failed to save global settings.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white text-brand-dark p-6 sm:p-8 font-mono space-y-8">
      <Toaster position="top-right" />

      {/* HEADER */}
      <div className="border-b border-brand-dark/15 pb-6">
        <div className="flex items-center gap-2 text-xs text-brand-dark/60 uppercase mb-2">
          <Link
            href="/admin"
            className="hover:text-orange-500 transition-colors"
          >
            ADMIN DASHBOARD
          </Link>
          <ChevronRight size={14} />
          <span className="text-brand-dark font-bold">MEMBERSHIP SETTINGS</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-heading tracking-wide uppercase flex items-center gap-3">
              <Crown className="text-amber-500" size={32} />
              MEMBERSHIP & CHAKRA SETTINGS
            </h1>
            <p className="text-xs text-brand-dark/60 mt-1 uppercase">
              CONFIGURE RANKS, VOUCHER CREATION, AND CHAKRA REWARD RATES
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              icon={Plus}
              onClick={handleOpenAddModal}
            >
              ADD NEW TIER
            </Button>
            <Button
              variant="chakra"
              size="sm"
              icon={Save}
              onClick={() => setIsSaveModalOpen(true)}
            >
              SAVE SETTINGS
            </Button>
          </div>
        </div>
      </div>

      {/* 1. GLOBAL CHAKRA LOYALTY CONFIGURATION PANEL */}
      <div className="border border-brand-dark/20 p-5 bg-slate-50 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 border-b border-brand-dark/10 pb-3">
          <Settings className="text-purple-600" size={20} />
          <h2 className="text-sm font-bold uppercase tracking-wider">
            1. GLOBAL CHAKRA REWARD CONFIGURATION
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
          <div className="space-y-1.5">
            <label className="block font-bold uppercase flex items-center gap-1.5 text-purple-700">
              <Zap size={14} className="text-purple-600" /> Earn Rate (per $1
              spent)
            </label>
            <Input
              type="number"
              step="0.01"
              min={0}
              value={pointsRatio}
              onChange={(e) => setPointsRatio(Number(e.target.value))}
              placeholder="e.g. 0.1"
              className="bg-white border font-bold"
            />
            <p className="text-[10px] text-brand-dark/60">
              Set <b>0.1</b> for $10 = 1 Chakra. Set <b>1.0</b> for $1 = 1
              Chakra.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block font-bold uppercase flex items-center gap-1.5 text-purple-700">
              <Ticket size={14} className="text-purple-600" /> Chakra per
              Default Voucher
            </label>
            <Input
              type="number"
              min={1}
              value={chakraPerVoucher}
              onChange={(e) => setChakraPerVoucher(Number(e.target.value))}
              placeholder="e.g. 100"
              className="bg-white border font-bold"
            />
            <p className="text-[10px] text-brand-dark/60">
              Default Chakra required if not specified in individual voucher.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block font-bold uppercase flex items-center gap-1.5 text-emerald-700">
              <Zap size={14} className="text-emerald-600" /> Redeem Value ($)
            </label>
            <Input
              type="number"
              step="0.1"
              min={0}
              value={pointRedeemValue}
              onChange={(e) => setPointRedeemValue(Number(e.target.value))}
              placeholder="e.g. 1"
              className="bg-white border font-bold"
            />
            <p className="text-[10px] text-brand-dark/60">
              Discount in USD when redeeming standard reward points at checkout.
            </p>
          </div>

          <div className="space-y-1.5 flex flex-col justify-between">
            <label className="block font-bold uppercase">
              Auto Tier Upgrade
            </label>
            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="autoUpgradeToggle"
                checked={autoUpgrade}
                onChange={(e) => setAutoUpgrade(e.target.checked)}
                className="w-4 h-4 accent-purple-600 cursor-pointer"
              />
              <label
                htmlFor="autoUpgradeToggle"
                className="font-bold cursor-pointer uppercase text-xs"
              >
                {autoUpgrade ? "ENABLED (AUTOMATIC)" : "DISABLED (MANUAL)"}
              </label>
            </div>
            <p className="text-[10px] text-brand-dark/60">
              Automatically promote user tier when total spend threshold is met.
            </p>
          </div>
        </div>
      </div>

      {/* 2. VOUCHER CREATION & MANAGEMENT SECTION */}
      <div className="border border-brand-dark/20 p-5 bg-white space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-brand-dark/10 pb-3">
          <div className="flex items-center gap-2">
            <Ticket className="text-purple-600" size={20} />
            <h2 className="text-sm font-bold uppercase tracking-wider">
              2. VOUCHER CREATION & CHAKRA EXCHANGE MANAGEMENT
            </h2>
          </div>
        </div>

        {/* Form Tạo Voucher Mới */}
        <form
          onSubmit={handleCreateVoucher}
          className="bg-slate-50 p-4 border border-slate-200 space-y-4"
        >
          <h3 className="text-xs font-bold uppercase text-brand-dark flex items-center gap-1.5">
            <Plus size={14} className="text-purple-600" /> CREATE NEW VOUCHER
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-bold mb-1 uppercase">
                Voucher Code
              </label>
              <Input
                required
                placeholder="e.g. NINJA10, FREESHIP"
                value={voucherForm.code}
                onChange={(e) =>
                  setVoucherForm({
                    ...voucherForm,
                    code: e.target.value.toUpperCase(),
                  })
                }
                className="bg-white border font-bold uppercase"
              />
            </div>

            <div>
              <label className="block font-bold mb-1 uppercase">
                Discount Type
              </label>
              <select
                value={voucherForm.discountType}
                onChange={(e) =>
                  setVoucherForm({
                    ...voucherForm,
                    discountType: e.target.value as any,
                  })
                }
                className="w-full border p-2 bg-white font-mono text-xs focus:outline-none border-brand-dark/30 font-bold"
              >
                <option value="FIXED">Fixed Amount ($)</option>
                <option value="PERCENTAGE">Percentage (%)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold mb-1 uppercase">
                Discount Value
              </label>
              <Input
                type="number"
                min={0}
                required
                value={voucherForm.discountValue}
                onChange={(e) =>
                  setVoucherForm({
                    ...voucherForm,
                    discountValue: Number(e.target.value),
                  })
                }
                placeholder={
                  voucherForm.discountType === "FIXED" ? "$10" : "10%"
                }
                className="bg-white border font-bold"
              />
            </div>

            <div>
              <label className="block font-bold mb-1 uppercase">
                Min Spent ($)
              </label>
              <Input
                type="number"
                min={0}
                value={voucherForm.minOrderValue}
                onChange={(e) =>
                  setVoucherForm({
                    ...voucherForm,
                    minOrderValue: Number(e.target.value),
                  })
                }
                placeholder="0"
                className="bg-white border font-bold"
              />
            </div>

            <div>
              <label className="block font-bold mb-1 uppercase">
                Max Discount ($)
              </label>
              <Input
                type="number"
                min={0}
                value={voucherForm.maxDiscountAmount}
                onChange={(e) =>
                  setVoucherForm({
                    ...voucherForm,
                    maxDiscountAmount: Number(e.target.value),
                  })
                }
                placeholder="No limit"
                className="bg-white border font-bold"
              />
            </div>

            <div>
              <label className="block font-bold mb-1 uppercase">
                Usage Limit
              </label>
              <Input
                type="number"
                min={0}
                value={voucherForm.usageLimit}
                onChange={(e) =>
                  setVoucherForm({
                    ...voucherForm,
                    usageLimit: Number(e.target.value),
                  })
                }
                placeholder="0 = Unlimited"
                className="bg-white border font-bold"
              />
            </div>

            <div>
              <label className="block font-bold mb-1 uppercase">
                Expiration Date
              </label>
              <Input
                type="date"
                value={voucherForm.expirationDate}
                onChange={(e) =>
                  setVoucherForm({
                    ...voucherForm,
                    expirationDate: e.target.value,
                  })
                }
                className="bg-white border font-bold"
              />
            </div>

            <div className="sm:col-span-2 md:col-span-4 bg-purple-50/60 p-3 border border-purple-200 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isChakraRedeemableToggle"
                  checked={voucherForm.isChakraRedeemable}
                  onChange={(e) =>
                    setVoucherForm({
                      ...voucherForm,
                      isChakraRedeemable: e.target.checked,
                    })
                  }
                  className="w-4 h-4 accent-purple-600 cursor-pointer"
                />
                <label
                  htmlFor="isChakraRedeemableToggle"
                  className="font-bold cursor-pointer uppercase text-purple-900 flex items-center gap-1.5"
                >
                  <Zap size={14} className="text-purple-600" /> Allow Chakra
                  Exchange for this Voucher
                </label>
              </div>

              {voucherForm.isChakraRedeemable && (
                <div className="flex items-center gap-2">
                  <label className="font-bold uppercase whitespace-nowrap text-purple-900">
                    Required Chakra:
                  </label>
                  <Input
                    type="number"
                    min={1}
                    required={voucherForm.isChakraRedeemable}
                    value={voucherForm.chakraCost}
                    onChange={(e) =>
                      setVoucherForm({
                        ...voucherForm,
                        chakraCost: Number(e.target.value),
                      })
                    }
                    className="bg-white border font-bold w-28 text-purple-700"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="chakra"
              size="sm"
              icon={Plus}
              disabled={isVoucherSubmitting}
            >
              {isVoucherSubmitting ? "CREATING..." : "CREATE VOUCHER"}
            </Button>
          </div>
        </form>

        {/* Existing Vouchers List */}
        <div>
          <h3 className="text-xs font-bold uppercase mb-3 text-brand-dark flex items-center gap-1.5">
            <Ticket size={14} className="text-purple-600" /> EXISTING SYSTEM
            VOUCHERS ({availableVouchers.length})
          </h3>

          {availableVouchers.length === 0 ? (
            <p className="text-xs text-brand-dark/50 italic">
              No vouchers created yet.
            </p>
          ) : (
            <div className="overflow-x-auto border border-brand-dark/15">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-brand-dark/15 uppercase font-bold text-brand-dark/80">
                    <th className="p-2.5">Code</th>
                    <th className="p-2.5">Discount</th>
                    <th className="p-2.5">Min Spent</th>
                    <th className="p-2.5">Chakra Redeemable</th>
                    <th className="p-2.5">Chakra Cost</th>
                    <th className="p-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-dark/10">
                  {availableVouchers.map((v) => {
                    const vId = v._id || v.id || v.code;
                    return (
                      <tr
                        key={vId}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="p-2.5 font-bold uppercase text-purple-700">
                          {v.code}
                        </td>
                        <td className="p-2.5 font-bold">
                          {v.discountType === "PERCENTAGE"
                            ? `${v.discountValue}%`
                            : `$${v.discountValue}`}
                        </td>
                        <td className="p-2.5">${v.minOrderValue || 0}</td>
                        <td className="p-2.5">
                          {v.isChakraRedeemable ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              YES
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-300">
                              NO
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 font-bold text-purple-700">
                          {v.isChakraRedeemable
                            ? `${v.chakraCost || 0} Chakra`
                            : "-"}
                        </td>
                        <td className="p-2.5 text-right">
                          <Button
                            variant="danger"
                            size="sm"
                            icon={Trash2}
                            onClick={() => handleOpenDeleteVoucherModal(v)}
                          >
                            DELETE
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 3. MEMBERSHIP TIERS GRID */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
          <Award size={18} className="text-amber-500" /> 3. MEMBERSHIP RANKS (
          {tiers.length})
        </h2>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-brand-dark/60">
            <Loader2 className="animate-spin text-purple-600" size={32} />
            <span className="text-xs tracking-widest uppercase font-bold">
              LOADING DATA...
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tiers.map((tier) => {
              // Hiển thị danh sách Voucher trên Card
              let voucherCodes: string[] = [];
              if (
                Array.isArray(tier.voucherIds) &&
                tier.voucherIds.length > 0
              ) {
                voucherCodes = tier.voucherIds.map((v: any) => {
                  if (typeof v === "object" && v?.code) return v.code;
                  const found = availableVouchers.find(
                    (av) => (av._id || av.id) === String(v),
                  );
                  return found ? found.code : String(v);
                });
              } else if (Array.isArray(tier.vouchers)) {
                voucherCodes = tier.vouchers.map((v: any) =>
                  typeof v === "object" && v?.code ? v.code : String(v),
                );
              }

              return (
                <div
                  key={tier._id || tier.id}
                  className="border border-brand-dark/20 p-5 bg-white space-y-4 shadow-sm hover:border-brand-dark/40 transition-all"
                >
                  <div className="flex items-start justify-between border-b border-brand-dark/10 pb-3">
                    <div>
                      <span
                        className={`inline-block px-2.5 py-1 text-[11px] font-bold uppercase border mb-1.5 ${
                          tier.badgeColor ||
                          "border-purple-300 bg-purple-50 text-purple-700"
                        }`}
                      >
                        {tier.name}
                      </span>
                      <h3 className="text-sm font-bold mt-1">
                        Min Spent:{" "}
                        <span className="text-orange-600">
                          ${tier.minSpent}
                        </span>
                      </h3>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Edit3}
                        onClick={() => handleOpenEditModal(tier)}
                      >
                        EDIT
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        icon={Trash2}
                        onClick={() => {
                          setTierToDelete(tier);
                          setIsDeleteModalOpen(true);
                        }}
                      >
                        DELETE
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 border border-slate-200">
                    <div>
                      <span className="text-brand-dark/60 block text-[10px] uppercase">
                        Discount:
                      </span>
                      <span className="font-bold text-emerald-600">
                        {tier.discountRate}%
                      </span>
                    </div>
                    <div>
                      <span className="text-brand-dark/60 block text-[10px] uppercase">
                        Chakra Rate:
                      </span>
                      <span className="font-bold text-purple-600">
                        x{tier.pointsMultiplier}
                      </span>
                    </div>
                  </div>

                  {tier.perks && tier.perks.length > 0 && (
                    <div className="space-y-1 text-xs">
                      <span className="text-[10px] font-bold uppercase text-brand-dark/60 flex items-center gap-1">
                        <Award size={12} className="text-amber-500" /> Perks:
                      </span>
                      <ul className="list-disc list-inside space-y-0.5 text-brand-dark/80 pl-1">
                        {tier.perks.map((perk, i) => (
                          <li key={i}>{perk}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {voucherCodes.length > 0 && (
                    <div className="space-y-1 pt-2 border-t border-brand-dark/10">
                      <span className="text-[10px] font-bold uppercase text-brand-dark/60 flex items-center gap-1">
                        <Ticket size={12} className="text-purple-600" />
                        Attached Vouchers ({voucherCodes.length}):
                      </span>
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {voucherCodes.map((code, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 text-[10px] font-bold border border-purple-300 bg-purple-50 text-purple-700 rounded-sm"
                          >
                            {code}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL EDIT / ADD TIER */}
      <Modal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        title={editingTier ? "EDIT MEMBERSHIP TIER" : "ADD NEW MEMBERSHIP TIER"}
        maxWidth="md"
      >
        <form onSubmit={handleSaveTierForm} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold mb-1 uppercase">Tier Name</label>
            <Input
              required
              placeholder="e.g. GENIN, CHUNIN, HOKAGE"
              value={tierForm.name}
              onChange={(e) =>
                setTierForm({ ...tierForm, name: e.target.value })
              }
              className="border font-bold uppercase"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block font-bold mb-1 uppercase">
                Min Spent ($)
              </label>
              <Input
                type="number"
                min={0}
                required
                value={tierForm.minSpent}
                onChange={(e) =>
                  setTierForm({ ...tierForm, minSpent: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <label className="block font-bold mb-1 uppercase">
                Discount (%)
              </label>
              <Input
                type="number"
                min={0}
                max={100}
                required
                value={tierForm.discountRate}
                onChange={(e) =>
                  setTierForm({
                    ...tierForm,
                    discountRate: Number(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <label className="block font-bold mb-1 uppercase">
                Chakra Rate
              </label>
              <Input
                type="number"
                step="0.1"
                min={1}
                required
                value={tierForm.pointsMultiplier}
                onChange={(e) =>
                  setTierForm({
                    ...tierForm,
                    pointsMultiplier: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>

          <div>
            <label className="block font-bold mb-1 uppercase">
              Badge Color Preset
            </label>
            <select
              value={tierForm.badgeColor}
              onChange={(e) =>
                setTierForm({ ...tierForm, badgeColor: e.target.value })
              }
              className="w-full border p-2 bg-white font-mono text-xs focus:outline-none border-brand-dark/30"
            >
              {BADGE_COLOR_PRESETS.map((p, idx) => (
                <option key={idx} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* CHỌN VOUCHER CÓ SẴN */}
          <div className="space-y-2 pt-2 border-t border-brand-dark/10">
            <label className="block font-bold uppercase flex items-center gap-1.5 text-purple-700">
              <Ticket size={14} /> Attach Existing Voucher
            </label>

            {availableVouchers.length > 0 ? (
              <div className="flex gap-2">
                <select
                  value={selectedVoucherCode}
                  onChange={(e) => setSelectedVoucherCode(e.target.value)}
                  className="w-full border p-2 bg-white font-mono text-xs focus:outline-none border-brand-dark/30 font-bold uppercase"
                >
                  <option value="">-- SELECT EXISTING VOUCHER --</option>
                  {availableVouchers.map((v) => (
                    <option key={v._id || v.id || v.code} value={v.code}>
                      {v.code} (
                      {v.discountType === "PERCENTAGE"
                        ? `${v.discountValue}%`
                        : `$${v.discountValue}`}{" "}
                      OFF
                      {v.isChakraRedeemable
                        ? ` - ${v.chakraCost} Chakra`
                        : " - No Chakra Redeem"}
                      )
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  icon={Plus}
                  onClick={handleSelectExistingVoucher}
                >
                  ADD
                </Button>
              </div>
            ) : (
              <p className="text-[11px] text-amber-600 font-bold">
                No vouchers available. Please create a voucher in Section 2
                first!
              </p>
            )}

            {/* Attached Vouchers Badges */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tierForm.vouchers.map((v, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold border border-purple-300 bg-purple-50 text-purple-700 rounded-sm"
                >
                  <Ticket size={12} />
                  {v}
                  <button
                    type="button"
                    onClick={() => handleRemoveVoucherFromTier(idx)}
                  >
                    <X
                      size={12}
                      className="hover:text-rose-600 transition-colors"
                    />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* PERKS INPUT */}
          <div className="space-y-2 pt-2 border-t border-brand-dark/10">
            <label className="block font-bold uppercase flex items-center gap-1.5 text-amber-600">
              <Award size={14} /> Perks
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. Free Birthday Gift, Priority Support"
                value={tierForm.perkInput}
                onChange={(e) =>
                  setTierForm({ ...tierForm, perkInput: e.target.value })
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddPerk();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={Plus}
                onClick={handleAddPerk}
              >
                ADD
              </Button>
            </div>

            <div className="space-y-1 pt-1">
              {tierForm.perks.map((p, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-2.5 py-1 text-[11px] bg-slate-50 border border-slate-200"
                >
                  <span>• {p}</span>
                  <button type="button" onClick={() => handleRemovePerk(idx)}>
                    <X
                      size={12}
                      className="hover:text-rose-600 transition-colors"
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-brand-dark/15">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddEditModalOpen(false)}
            >
              CANCEL
            </Button>
            <Button
              type="submit"
              variant="chakra"
              size="sm"
              icon={Save}
              disabled={isSaving}
            >
              {isSaving ? "SAVING..." : "SAVE TIER"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE VOUCHER MODAL */}
      <Modal
        isOpen={isDeleteVoucherModalOpen}
        onClose={() => setIsDeleteVoucherModalOpen(false)}
        title="DELETE VOUCHER"
      >
        <div className="space-y-4 text-xs font-mono">
          <p className="text-rose-600 font-bold">
            Are you sure you want to delete voucher "{voucherToDelete?.code}"?
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteVoucherModalOpen(false)}
            >
              CANCEL
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmDeleteVoucher}
              disabled={isSaving}
            >
              CONFIRM DELETE
            </Button>
          </div>
        </div>
      </Modal>

      {/* CONFIRM DELETE TIER MODAL */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="DELETE TIER"
      >
        <div className="space-y-4 text-xs font-mono">
          <p className="text-rose-600 font-bold">
            Are you sure you want to delete tier "{tierToDelete?.name}"? This
            action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              CANCEL
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmDelete}
              disabled={isSaving}
            >
              CONFIRM DELETE
            </Button>
          </div>
        </div>
      </Modal>

      {/* CONFIRM SAVE SETTINGS MODAL */}
      <Modal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        title="SAVE GLOBAL SETTINGS"
      >
        <div className="space-y-4 text-xs font-mono">
          <p className="font-bold">
            Are you sure you want to save current global loyalty configurations?
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSaveModalOpen(false)}
            >
              CANCEL
            </Button>
            <Button
              variant="chakra"
              size="sm"
              onClick={handleConfirmSaveSettings}
              disabled={isSaving}
            >
              CONFIRM SAVE
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
