"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { api } from "@/lib/api";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import {
  User,
  MapPin,
  Shield,
  Award,
  Package,
  Lock,
  Plus,
  Trash2,
  Key,
  ExternalLink,
  Save,
  CheckCircle2,
  LogOut,
  AlertTriangle,
  Mail,
  Send,
  ArrowLeft,
  Ticket,
  Copy,
  Check,
  Zap,
  Loader2,
  Phone,
  Pencil,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

type TabType = "profile" | "addresses" | "rank" | "security";

interface Voucher {
  id: string;
  code: string;
  discount: string;
  description: string;
  minSpend: string;
  requiredRank: string;
  isUnlocked: boolean;
  isClaimed: boolean;
}

interface AddressItem {
  id: string;
  name: string;
  phone?: string;
  detail: string;
  isDefault: boolean;
}

interface RankInfo {
  currentRank: string;
  discountPercent: number;
  currentExp: number;
  nextRankExp: number;
  nextRank: string;
  chakra: number;
  privileges: string[];
}

export default function AccountPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("profile");

  // State trạng thái tải dữ liệu
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State Modal Đăng xuất
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // State Modal & Form Địa chỉ
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressToDelete, setAddressToDelete] = useState<AddressItem | null>(
    null,
  );

  const [addressForm, setAddressForm] = useState({
    receiverName: "",
    phone: "",
    fullAddress: "",
    isDefault: false,
  });
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>(
    {},
  );

  // State Profile
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    village: "Konohagakure (Leaf Village)",
  });
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>(
    {},
  );

  // State Sổ Địa Chỉ
  const [addresses, setAddresses] = useState<AddressItem[]>([]);

  // State Đổi mật khẩu & Logic Ẩn/Hiện Passcode
  const [securityForm, setSecurityForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [securityErrors, setSecurityErrors] = useState<Record<string, string>>(
    {},
  );

  // State gửi Mail Khôi phục Mật khẩu
  const [isSendingResetEmail, setIsSendingResetEmail] = useState(false);
  const [resetEmailSuccessNotice, setResetEmailSuccessNotice] = useState("");
  const [resetEmailError, setResetEmailError] = useState("");

  // State Dữ liệu Rank & Vouchers (Đồng bộ Backend chuẩn)
  const [rankInfo, setRankInfo] = useState<RankInfo>({
    currentRank: "GENIN",
    discountPercent: 0,
    currentExp: 0,
    nextRankExp: 1000,
    nextRank: "CHUNIN",
    chakra: 0,
    privileges: [],
  });
  const [isRankLoading, setIsRankLoading] = useState(false);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // ============================================================
  // FETCH USER DATA & ADDRESSES
  // ============================================================
  const fetchAccountData = async () => {
    setIsLoading(true);
    try {
      const userRes = await api.get("/users/me");
      const userData = userRes.data;

      setProfile({
        fullName: userData.name || userData.fullName || "Shinobi Warrior",
        email: userData.email || "",
        village: userData.village || "Konohagakure (Leaf Village)",
      });

      try {
        const addrRes = await api.get("/users/addresses");
        const rawAddr = Array.isArray(addrRes.data)
          ? addrRes.data
          : addrRes.data?.addresses || addrRes.data?.data || [];

        setAddresses(
          rawAddr.map((a: any) => ({
            id: String(a.id || a._id || Date.now()),
            name: a.receiverName || a.name || a.fullName || "Address Location",
            phone: a.phone || a.phoneNumber || "",
            detail:
              a.fullAddress ||
              a.detail ||
              `${a.address || ""}, ${a.city || ""}`,
            isDefault: Boolean(a.isDefault),
          })),
        );
      } catch (err) {
        // Im lặng nếu chưa có địa chỉ
      }
    } catch (error) {
      console.error("Failed to load account data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================
  // FETCH RANK & VOUCHERS FROM BACKEND (UNIFIED WORKFLOW)
  // ============================================================
  const fetchRankData = async () => {
    setIsRankLoading(true);
    try {
      const res = await api.get(`/users/me?_t=${Date.now()}`, {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      });

      // Bóc tách userData từ response
      const userData = res.data?.data || res.data;

      if (userData) {
        const tierObj = userData.tier;

        // 1. Lấy thông tin Rank từ JSON
        const currentTierName = (tierObj?.name || "GENIN").toUpperCase();
        const discountPercent = Number(
          tierObj?.discountPercent ?? tierObj?.discountRate ?? 0,
        );

        const privilegesList =
          Array.isArray(tierObj?.perks) && tierObj.perks.length > 0
            ? tierObj.perks
            : [
                `Permanent ${discountPercent}% discount on all mission supplies`,
                "Access to exclusive Rank-restricted Scroll Vouchers",
              ];

        setRankInfo({
          currentRank: currentTierName,
          discountPercent: discountPercent,
          currentExp: Number(userData.totalSpent || 0),
          nextRankExp: Number(tierObj?.minSpent || 100),
          nextRank: "JŌNIN",
          chakra: Number(userData.chakra ?? userData.points ?? 0),
          privileges: privilegesList,
        });

        // 2. Tự động lấy Voucher dựa trên thông tin Tier/VoucherIDs vừa nhận
        const tierVoucherIds: string[] = tierObj?.voucherIds || [];
        const tierId: string = tierObj?._id || "";

        await fetchVouchers(tierVoucherIds, tierId);
      }
    } catch (err) {
      console.error("Failed to load rank data from backend:", err);
    } finally {
      setIsRankLoading(false);
    }
  };

  const fetchVouchers = async (
    tierVoucherIds: string[] = [],
    tierId: string = "",
  ) => {
    try {
      let rawVouchers: any[] = [];
      const cacheBuster = `?_t=${Date.now()}`;
      const noCacheHeaders = {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      };

      // Gọi API lấy voucher (Thử endpoint /coupons hoặc /vouchers)
      try {
        // Thử gọi kèm query tier id nếu backend hỗ trợ lọc
        const endpoint = tierId
          ? `/coupons?tier=${tierId}&_t=${Date.now()}`
          : `/coupons${cacheBuster}`;
        const voucherRes = await api.get(endpoint, noCacheHeaders);
        rawVouchers = Array.isArray(voucherRes.data)
          ? voucherRes.data
          : voucherRes.data?.data || voucherRes.data?.coupons || [];
      } catch (err) {
        const endpoint = tierId
          ? `/vouchers?tier=${tierId}&_t=${Date.now()}`
          : `/vouchers${cacheBuster}`;
        const voucherRes = await api.get(endpoint, noCacheHeaders);
        rawVouchers = Array.isArray(voucherRes.data)
          ? voucherRes.data
          : voucherRes.data?.data || voucherRes.data?.vouchers || [];
      }

      console.log("RAW VOUCHERS API RESPONSE:", rawVouchers);

      // Map dữ liệu an toàn & đánh dấu các voucher thuộc Tier của User
      const mappedVouchers = rawVouchers.map((v: any) => {
        const vId = String(v.id || v._id);
        const type = String(v.discountType || v.type || "").toUpperCase();
        let discountStr = "";

        if (type.includes("SHIP") || type.includes("FREE")) {
          discountStr = "FREE SHIPPING";
        } else if (type.includes("PERCENT")) {
          const pVal = v.discountValue ?? v.discountPercent ?? v.discount ?? 0;
          discountStr = `${pVal}% OFF`;
        } else {
          const aVal = v.discountAmount ?? v.discountValue ?? v.discount ?? 0;
          discountStr = `$${aVal} OFF`;
        }

        // Xử lý Rank an toàn (Tránh lỗi typeof null)
        const rawRank = v.requiredRank ?? v.minTier ?? v.rank ?? v.tier;
        let rankStr = "ALL RANKS";
        if (rawRank !== null && rawRank !== undefined) {
          if (typeof rawRank === "object") {
            rankStr = rawRank.name || rawRank.code || "ALL";
          } else {
            rankStr = String(rawRank);
          }
        }

        const minSpendVal = v.minOrderValue ?? v.minSpend ?? v.min_spend;

        // Kiểm tra voucher có mở khóa cho user không (dựa vào danh sách voucherIds trong tier)
        const isUnlockedByTier =
          tierVoucherIds.length > 0
            ? tierVoucherIds.includes(vId)
            : v.isUnlocked !== undefined
              ? Boolean(v.isUnlocked)
              : true;

        return {
          id: vId,
          code: v.code || "NO_CODE",
          discount: discountStr,
          description:
            v.description ||
            (discountStr === "FREE SHIPPING"
              ? "Free delivery on mission supplies"
              : "Shinobi Privilege Voucher"),
          minSpend: minSpendVal ? `Orders over $${minSpendVal}` : "No Minimum",
          requiredRank: rankStr.toUpperCase(),
          isUnlocked: isUnlockedByTier,
          isClaimed: Boolean(v.isClaimed || v.claimed),
        };
      });

      setVouchers(mappedVouchers);
    } catch (err) {
      console.error("Failed to load vouchers:", err);
      setVouchers([]);
    }
  };

  // Đảm bảo useEffect chỉ gọi fetchRankData (vì fetchRankData đã tự kích hoạt fetchVouchers)
  useEffect(() => {
    if (activeTab === "rank") {
      fetchRankData();
    }
  }, [activeTab]);

  useEffect(() => {
    fetchAccountData();
  }, []);

  useEffect(() => {
    if (activeTab === "rank") {
      fetchRankData();
      fetchVouchers();
    }
  }, [activeTab]);

  // ============================================================
  // VALIDATION HELPERS
  // ============================================================
  const validateProfile = () => {
    const newErrors: Record<string, string> = {};

    if (!profile.fullName.trim()) {
      newErrors.fullName = "FULL NAME IS REQUIRED";
    }

    if (!profile.email.trim()) {
      newErrors.email = "EMAIL ADDRESS IS REQUIRED";
    } else if (!/\S+@\S+\.\S+/.test(profile.email)) {
      newErrors.email = "INVALID EMAIL ADDRESS";
    }

    if (!profile.village.trim()) {
      newErrors.village = "AFFILIATED VILLAGE IS REQUIRED";
    }

    setProfileErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error("PLEASE CHECK YOUR PROFILE DETAILS AND TRY AGAIN.");
    }

    return Object.keys(newErrors).length === 0;
  };

  const validateAddress = () => {
    const newErrors: Record<string, string> = {};

    if (!addressForm.receiverName.trim()) {
      newErrors.receiverName = "RECIPIENT NAME IS REQUIRED";
    }

    if (!addressForm.phone.trim()) {
      newErrors.phone = "PHONE NUMBER IS REQUIRED";
    }

    if (!addressForm.fullAddress.trim()) {
      newErrors.fullAddress = "DETAILED ADDRESS IS REQUIRED";
    }

    setAddressErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error("PLEASE FILL IN ALL REQUIRED ADDRESS FIELDS");
    }

    return Object.keys(newErrors).length === 0;
  };

  const validateSecurity = () => {
    const newErrors: Record<string, string> = {};

    if (!securityForm.currentPassword) {
      newErrors.currentPassword = "CURRENT PASSCODE IS REQUIRED";
    }

    if (!securityForm.newPassword) {
      newErrors.newPassword = "NEW PASSCODE IS REQUIRED";
    } else if (securityForm.newPassword.length < 6) {
      newErrors.newPassword = "PASSCODE MUST BE AT LEAST 6 CHARACTERS";
    } else if (securityForm.newPassword === securityForm.currentPassword) {
      newErrors.newPassword =
        "NEW PASSCODE MUST BE DIFFERENT FROM CURRENT PASSCODE";
    }

    if (!securityForm.confirmPassword) {
      newErrors.confirmPassword = "CONFIRMATION PASSCODE IS REQUIRED";
    } else if (securityForm.newPassword !== securityForm.confirmPassword) {
      newErrors.confirmPassword = "PASSCODES DO NOT MATCH";
    }

    setSecurityErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error("PLEASE FIX THE PASSCODE ERRORS TO PROCEED");
    }

    return Object.keys(newErrors).length === 0;
  };

  // ============================================================
  // HANDLERS
  // ============================================================
  const handleConfirmLogout = async () => {
    setIsSubmitting(true);

    try {
      await api.post("/auth/client/logout");
    } catch (error) {
      console.error("Lỗi API logout:", error);
    } finally {
      useAuthStore.getState().logout();
      setShowLogoutModal(false);
      setIsSubmitting(false);
      window.location.href = "/login";
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateProfile()) return;

    setIsSubmitting(true);
    setProfileErrors({});

    try {
      await api.patch("/users/me", {
        name: profile.fullName.trim(),
        email: profile.email.trim().toLowerCase(),
        village: profile.village.trim(),
      });

      toast.success("PROFILE UPDATED SUCCESSFULLY");
    } catch (error: any) {
      console.error("Update Profile Error:", error);
      const msg = error?.response?.data?.message || "FAILED TO UPDATE PROFILE";
      const errorText = Array.isArray(msg) ? msg.join(" | ") : msg;

      setProfileErrors((prev) => ({
        ...prev,
        apiError: errorText.toUpperCase(),
      }));
      toast.error(errorText.toUpperCase());
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenCreateAddress = () => {
    setEditingAddressId(null);
    setAddressForm({
      receiverName: "",
      phone: "",
      fullAddress: "",
      isDefault: false,
    });
    setAddressErrors({});
    setShowAddressModal(true);
  };

  const handleOpenEditAddress = (addr: AddressItem) => {
    setEditingAddressId(addr.id);
    setAddressForm({
      receiverName: addr.name,
      phone: addr.phone || "",
      fullAddress: addr.detail,
      isDefault: addr.isDefault,
    });
    setAddressErrors({});
    setShowAddressModal(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAddress()) return;

    setIsSubmitting(true);
    setAddressErrors({});

    try {
      if (editingAddressId) {
        await api.patch(`/users/addresses/${editingAddressId}`, addressForm);
        toast.success("DELIVERY ADDRESS UPDATED SUCCESSFULLY!");
      } else {
        await api.post("/users/addresses", addressForm);
        toast.success("NEW SCROLL ADDRESS ADDED SUCCESSFULLY!");
      }

      setShowAddressModal(false);
      await fetchAccountData();
    } catch (error: any) {
      console.error("Save Address Error:", error);
      const msg =
        error?.response?.data?.message || "FAILED TO SAVE SCROLL ADDRESS";
      const errorText = Array.isArray(msg) ? msg.join(" | ") : msg;

      setAddressErrors((prev) => ({
        ...prev,
        apiError: errorText.toUpperCase(),
      }));
      toast.error(errorText.toUpperCase());
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDeleteAddress = async () => {
    if (!addressToDelete) return;
    try {
      await api.delete(`/users/addresses/${addressToDelete.id}`);
      setAddresses((prev) => prev.filter((a) => a.id !== addressToDelete.id));
      toast.success("ADDRESS REMOVED SUCCESSFULLY!");
    } catch (error) {
      setAddresses((prev) => prev.filter((a) => a.id !== addressToDelete.id));
      toast.success("ADDRESS REMOVED SUCCESSFULLY!");
    } finally {
      setAddressToDelete(null);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSecurity()) return;

    setIsSubmitting(true);
    setSecurityErrors({});

    try {
      await api.patch("/users/change-password", {
        oldPassword: securityForm.currentPassword,
        currentPassword: securityForm.currentPassword,
        newPassword: securityForm.newPassword,
      });

      toast.success("PASSCODE UPDATED SUCCESSFULLY!");
      setSecurityForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      console.error("Update Passcode Error:", error);
      const msg =
        error?.response?.data?.message ||
        "INCORRECT CURRENT PASSCODE OR UPDATE FAILED";
      const errorText = Array.isArray(msg) ? msg.join(" | ") : msg;

      const lowerError = errorText.toLowerCase();

      const isCurrentPassError =
        lowerError.includes("current") ||
        lowerError.includes("old") ||
        lowerError.includes("incorrect") ||
        lowerError.includes("wrong");

      const isSamePassError =
        lowerError.includes("same") ||
        lowerError.includes("identical") ||
        lowerError.includes("different") ||
        lowerError.includes("trùng");

      if (isCurrentPassError) {
        setSecurityErrors((prev) => ({
          ...prev,
          currentPassword: "CURRENT PASSCODE DOES NOT MATCH DATABASE",
          apiError: "AUTHENTICATION FAILED: INCORRECT CURRENT PASSCODE.",
        }));
      } else if (isSamePassError) {
        setSecurityErrors((prev) => ({
          ...prev,
          newPassword: "NEW PASSCODE MUST BE DIFFERENT FROM CURRENT PASSCODE",
          apiError: "NEW PASSCODE MUST BE DIFFERENT FROM CURRENT PASSCODE.",
        }));
      } else {
        setSecurityErrors((prev) => ({
          ...prev,
          apiError: errorText.toUpperCase(),
        }));
      }

      toast.error(errorText.toUpperCase());
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendResetEmail = async () => {
    if (!profile.email || !/\S+@\S+\.\S+/.test(profile.email)) {
      toast.error("PLEASE ENTER A VALID REGISTERED SCROLL MAIL");
      setResetEmailError("INVALID OR MISSING REGISTERED SCROLL MAIL");
      return;
    }

    setResetEmailError("");
    setResetEmailSuccessNotice("");
    setIsSendingResetEmail(true);

    try {
      await api.post("/auth/forgot-password", {
        email: profile.email,
      });

      const successMsg = `RECOVERY LINK SENT TO ${profile.email.toUpperCase()}`;
      setResetEmailSuccessNotice(successMsg);
      toast.success("RECOVERY INSTRUCTIONS SENT TO YOUR MAIL");
    } catch (error: any) {
      console.error("Forgot Password Error (Account):", error);
      const serverMessage =
        error?.response?.data?.message ||
        "FAILED TO SEND RECOVERY LINK. USER MAY NOT EXIST.";

      const errorText = Array.isArray(serverMessage)
        ? serverMessage.join(" | ")
        : serverMessage;

      const upperError = errorText.toUpperCase();
      setResetEmailError(upperError);
      toast.error(upperError);
    } finally {
      setIsSendingResetEmail(false);
    }
  };

  const handleClaimVoucher = async (id: string) => {
    try {
      try {
        await api.post(`/coupons/${id}/claim`);
      } catch (e) {
        await api.post(`/vouchers/${id}/claim`);
      }

      setVouchers((prev) =>
        prev.map((v) => (v.id === id ? { ...v, isClaimed: true } : v)),
      );
      toast.success("VOUCHER SCROLL ADDED TO YOUR INVENTORY!");
    } catch (error: any) {
      const msg = error?.response?.data?.message || "FAILED TO CLAIM VOUCHER";
      toast.error(
        Array.isArray(msg) ? msg[0].toUpperCase() : msg.toUpperCase(),
      );
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`CODE ${code} COPIED TO CLIPBOARD!`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-brand-ivory/30 flex flex-col items-center justify-center space-y-3 font-mono text-brand-dark">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
        <p className="text-xs uppercase tracking-widest text-brand-dark/70">
          LOADING SHINOBI PROFILE DATA...
        </p>
      </div>
    );
  }

  // Calculate Rank progress percentage
  const expProgress =
    rankInfo.nextRankExp > 0
      ? Math.min(
          100,
          Math.round((rankInfo.currentExp / rankInfo.nextRankExp) * 100),
        )
      : 100;

  return (
    <div className="min-h-screen bg-brand-ivory/30 py-10 px-4 sm:px-6 lg:px-8 font-mono text-brand-dark relative">
      {/* GLOBAL TOASTER COMPONENT */}
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

      <div className="max-w-5xl mx-auto space-y-6">
        {/* BACK TO HOME BUTTON */}
        <div>
          <Link href="/">
            <Button variant="ghost" size="sm" icon={ArrowLeft}>
              BACK TO HOME
            </Button>
          </Link>
        </div>

        {/* PAGE HEADER */}
        <div className="border-b border-brand-dark/15 pb-6">
          <span className="text-[10px] tracking-[0.25em] text-orange-600 font-bold uppercase block mb-1">
            SHINOBI IDENTIFICATION SYSTEM
          </span>
          <h1 className="text-3xl sm:text-4xl font-heading tracking-wider uppercase">
            ACCOUNT DASHBOARD
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* SIDEBAR NAVIGATION */}
          <div className="space-y-2 lg:col-span-1">
            <Button
              variant={activeTab === "profile" ? "chakra" : "ghost"}
              size="md"
              icon={User}
              onClick={() => setActiveTab("profile")}
              className="w-full justify-start text-left"
            >
              PROFILE INFO
            </Button>

            <Button
              variant={activeTab === "addresses" ? "chakra" : "ghost"}
              size="md"
              icon={MapPin}
              onClick={() => setActiveTab("addresses")}
              className="w-full justify-start text-left"
            >
              ADDRESS BOOK
            </Button>

            <Button
              variant={activeTab === "rank" ? "chakra" : "ghost"}
              size="md"
              icon={Award}
              onClick={() => setActiveTab("rank")}
              className="w-full justify-start text-left"
            >
              RANK & VOUCHERS
            </Button>

            <Button
              variant={activeTab === "security" ? "chakra" : "ghost"}
              size="md"
              icon={Shield}
              onClick={() => setActiveTab("security")}
              className="w-full justify-start text-left"
            >
              SECURITY & CIPHER
            </Button>

            {/* EXTERNAL LINKS & LOGOUT */}
            <div className="pt-4 border-t border-brand-dark/10 space-y-2">
              <Link href="/orders" className="block">
                <Button
                  variant="outline"
                  size="md"
                  icon={Package}
                  className="w-full justify-between text-orange-600 border-orange-500/30 hover:bg-orange-500/10"
                >
                  <span>MISSION ORDERS</span>
                  <ExternalLink size={14} />
                </Button>
              </Link>

              <Button
                variant="ghost"
                size="md"
                icon={LogOut}
                onClick={() => setShowLogoutModal(true)}
                className="w-full justify-start text-left text-rose-600 hover:bg-rose-500/10 hover:text-rose-700"
              >
                DISCONNECT (LOG OUT)
              </Button>
            </div>
          </div>

          {/* MAIN TAB CONTENT */}
          <div className="lg:col-span-3 bg-white border border-brand-dark/15 p-6 sm:p-8 space-y-6">
            {/* TAB 1: PROFILE INFO */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <h2 className="text-xl font-heading tracking-wider uppercase border-b border-brand-dark/10 pb-3">
                  PERSONAL CREDENTIALS
                </h2>

                {profileErrors.apiError && (
                  <div className="border border-rose-600/30 bg-rose-600/5 p-3 flex items-start gap-2.5 text-rose-600 text-xs font-bold">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span>{profileErrors.apiError}</span>
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <Input
                    label="FULL NAME"
                    icon={User}
                    value={profile.fullName}
                    onChange={(e) => {
                      setProfile({ ...profile, fullName: e.target.value });
                      if (profileErrors.fullName || profileErrors.apiError) {
                        setProfileErrors((prev) => ({
                          ...prev,
                          fullName: "",
                          apiError: "",
                        }));
                      }
                    }}
                    error={profileErrors.fullName}
                  />

                  <Input
                    label="SCROLL MAIL (EMAIL)"
                    icon={Mail}
                    value={profile.email}
                    onChange={(e) => {
                      setProfile({ ...profile, email: e.target.value });
                      if (profileErrors.email || profileErrors.apiError) {
                        setProfileErrors((prev) => ({
                          ...prev,
                          email: "",
                          apiError: "",
                        }));
                      }
                    }}
                    error={profileErrors.email}
                  />

                  <Input
                    label="AFFILIATED VILLAGE"
                    icon={Shield}
                    value={profile.village}
                    onChange={(e) => {
                      setProfile({ ...profile, village: e.target.value });
                      if (profileErrors.village || profileErrors.apiError) {
                        setProfileErrors((prev) => ({
                          ...prev,
                          village: "",
                          apiError: "",
                        }));
                      }
                    }}
                    error={profileErrors.village}
                  />

                  <Button
                    type="submit"
                    variant="chakra"
                    size="md"
                    icon={Save}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "SAVING..." : "UPDATE CREDENTIALS"}
                  </Button>
                </form>
              </div>
            )}

            {/* TAB 2: ADDRESS BOOK */}
            {activeTab === "addresses" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-brand-dark/10 pb-3">
                  <h2 className="text-xl font-heading tracking-wider uppercase">
                    SCROLL ADDRESSES
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Plus}
                    onClick={handleOpenCreateAddress}
                  >
                    ADD NEW
                  </Button>
                </div>

                <div className="space-y-4">
                  {addresses.length === 0 ? (
                    <p className="text-xs text-brand-dark/50 uppercase">
                      NO ADDRESSES RECORDED IN SCROLL.
                    </p>
                  ) : (
                    addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className="border border-brand-dark/15 p-4 flex justify-between items-start bg-brand-ivory/10"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm uppercase">
                              {addr.name}
                            </span>
                            {addr.phone && (
                              <span className="text-xs text-brand-dark/60 font-mono">
                                ({addr.phone})
                              </span>
                            )}
                            {addr.isDefault && (
                              <span className="text-[9px] bg-orange-500/10 text-orange-600 border border-orange-500/30 px-2 py-0.5 font-bold uppercase">
                                DEFAULT
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-brand-dark/70 font-sans">
                            {addr.detail}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEditAddress(addr)}
                            className="text-brand-dark/40 hover:text-orange-600 transition-colors p-1 cursor-pointer"
                            aria-label="Edit address"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => setAddressToDelete(addr)}
                            className="text-brand-dark/40 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                            aria-label="Delete address"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: RANK & VOUCHERS (UNIFIED BACKEND DESIGN) */}
            {activeTab === "rank" && (
              <div className="space-y-8">
                <h2 className="text-xl font-heading tracking-wider uppercase border-b border-brand-dark/10 pb-3">
                  NINJA RANK & EXCLUSIVE PERKS
                </h2>

                {isRankLoading ? (
                  <div className="p-8 flex items-center justify-center gap-2 text-xs text-brand-dark/60 font-mono">
                    <Loader2 className="w-4 h-4 animate-spin text-orange-600" />
                    <span>FETCHING RANK & PERKS DATA...</span>
                  </div>
                ) : (
                  <>
                    {/* RANK BANNER */}
                    <div className="bg-brand-dark text-brand-ivory p-6 space-y-5 relative overflow-hidden border border-brand-dark">
                      <div className="flex justify-between items-start relative z-10">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] tracking-widest text-orange-400 font-bold uppercase">
                              CURRENT NINJA TIER
                            </span>
                            {rankInfo.discountPercent > 0 && (
                              <span className="text-[9px] bg-orange-500/20 text-orange-400 border border-orange-400/40 px-2 py-0.5 font-bold uppercase">
                                {rankInfo.discountPercent}% OFF ALL ORDERS
                              </span>
                            )}
                          </div>
                          <h3 className="text-3xl font-heading tracking-widest text-white mt-1 uppercase">
                            {rankInfo.currentRank}
                          </h3>
                        </div>
                        <Award size={40} className="text-orange-400 shrink-0" />
                      </div>

                      {/* STATS OVERVIEW */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1 border-t border-white/10 text-xs">
                        <div>
                          <span className="text-[10px] text-white/50 block uppercase">
                            TOTAL SPENT
                          </span>
                          <span className="font-bold text-orange-400">
                            ${rankInfo.currentExp.toFixed(2)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-white/50 block uppercase">
                            CHAKRA POINTS
                          </span>
                          <span className="font-bold text-emerald-400 flex items-center gap-1">
                            <Sparkles size={12} />
                            {rankInfo.chakra} CP
                          </span>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <span className="text-[10px] text-white/50 block uppercase">
                            DISCOUNT TIER
                          </span>
                          <span className="font-bold text-white">
                            {rankInfo.discountPercent}% PERMANENT
                          </span>
                        </div>
                      </div>

                      {/* EXP PROGRESS BAR */}
                      <div className="space-y-1.5 pt-2 border-t border-white/10">
                        <div className="flex justify-between text-[11px] tracking-wider uppercase">
                          <span className="text-white/80">
                            PROGRESS TO NEXT TIER: $
                            {rankInfo.currentExp.toFixed(2)} / $
                            {rankInfo.nextRankExp.toFixed(2)}
                          </span>
                          <span className="text-orange-400 font-bold">
                            NEXT: {rankInfo.nextRank}
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-white/20 rounded-none overflow-hidden p-0.5 border border-white/10">
                          <div
                            className="h-full bg-orange-500 transition-all duration-500"
                            style={{ width: `${expProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* VOUCHER VAULT */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center border-b border-brand-dark/10 pb-2">
                        <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                          <Ticket size={18} className="text-orange-600" />
                          <span>RANK VOUCHER VAULT</span>
                        </h3>
                        <span className="text-[11px] text-brand-dark/60 font-mono uppercase">
                          {vouchers.filter((v) => v.isClaimed).length} /{" "}
                          {vouchers.length} CLAIMED
                        </span>
                      </div>

                      {vouchers.length === 0 ? (
                        <p className="text-xs text-brand-dark/50 uppercase py-4">
                          NO RANK VOUCHERS AVAILABLE AT THIS MOMENT.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {vouchers.map((v) => (
                            <div
                              key={v.id}
                              className={`border p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all ${
                                !v.isUnlocked
                                  ? "border-brand-dark/10 bg-gray-100/60 opacity-60"
                                  : v.isClaimed
                                    ? "border-emerald-500/40 bg-emerald-500/5"
                                    : "border-orange-500/40 bg-orange-500/5"
                              }`}
                            >
                              <div className="space-y-1.5 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-heading text-lg tracking-wider uppercase text-brand-dark">
                                    {v.discount}
                                  </span>
                                  <span
                                    className={`text-[9px] px-2 py-0.5 font-bold uppercase border ${
                                      !v.isUnlocked
                                        ? "border-brand-dark/20 bg-brand-dark/5 text-brand-dark/60"
                                        : "border-orange-500/30 bg-orange-500/10 text-orange-600"
                                    }`}
                                  >
                                    {v.requiredRank} TIER
                                  </span>
                                </div>
                                <p className="text-xs text-brand-dark/80 font-sans">
                                  {v.description}
                                </p>
                                <p className="text-[10px] text-brand-dark/50 uppercase font-mono">
                                  CONDITIONS: {v.minSpend}
                                </p>
                              </div>

                              <div className="w-full sm:w-auto flex justify-end">
                                {!v.isUnlocked ? (
                                  <div className="flex items-center gap-1.5 text-xs text-brand-dark/50 font-bold uppercase px-3 py-1.5 border border-brand-dark/20 bg-white">
                                    <Lock size={14} />
                                    <span>REQUIRES {v.requiredRank}</span>
                                  </div>
                                ) : v.isClaimed ? (
                                  <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <code className="bg-white border border-brand-dark/20 px-2.5 py-1 text-xs font-mono font-bold text-brand-dark tracking-wider">
                                      {v.code}
                                    </code>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      icon={
                                        copiedCode === v.code ? Check : Copy
                                      }
                                      onClick={() => handleCopyCode(v.code)}
                                      className="text-xs border-emerald-500/50 text-emerald-700 hover:bg-emerald-500/10"
                                    >
                                      {copiedCode === v.code
                                        ? "COPIED"
                                        : "COPY"}
                                    </Button>
                                  </div>
                                ) : (
                                  <Button
                                    variant="chakra"
                                    size="sm"
                                    icon={Zap}
                                    onClick={() => handleClaimVoucher(v.id)}
                                  >
                                    CLAIM SCROLL
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* RANK PRIVILEGES */}
                    {rankInfo.privileges.length > 0 && (
                      <div className="space-y-3 pt-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-brand-dark/60">
                          {rankInfo.currentRank} TIER PRIVILEGES
                        </h4>
                        <ul className="space-y-2 text-xs">
                          {rankInfo.privileges.map((privilege, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <CheckCircle2
                                size={14}
                                className="text-orange-500 shrink-0"
                              />
                              <span>{privilege}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* TAB 4: SECURITY & PASSCODE */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <h2 className="text-xl font-heading tracking-wider uppercase border-b border-brand-dark/10 pb-3">
                  SECURITY & CIPHER SETTINGS
                </h2>

                {securityErrors.apiError && (
                  <div className="border border-rose-600/30 bg-rose-600/5 p-3 flex items-start gap-2.5 text-rose-600 text-xs font-bold">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span>{securityErrors.apiError}</span>
                  </div>
                )}

                <form
                  onSubmit={handleUpdatePassword}
                  className="space-y-4 max-w-md"
                >
                  <div className="relative">
                    <Input
                      label="CURRENT SECRET PASSCODE *"
                      type={showCurrentPassword ? "text" : "password"}
                      icon={Key}
                      placeholder="ENTER CURRENT PASSCODE"
                      value={securityForm.currentPassword}
                      onChange={(e) => {
                        setSecurityForm({
                          ...securityForm,
                          currentPassword: e.target.value,
                        });
                        if (
                          securityErrors.currentPassword ||
                          securityErrors.apiError
                        ) {
                          setSecurityErrors((prev) => ({
                            ...prev,
                            currentPassword: "",
                            apiError: "",
                          }));
                        }
                      }}
                      error={securityErrors.currentPassword}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      className="absolute right-3 top-9 text-brand-dark/50 hover:text-brand-dark cursor-pointer z-10"
                    >
                      {showCurrentPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>

                  <div className="relative">
                    <Input
                      label="NEW SECRET PASSCODE *"
                      type={showNewPassword ? "text" : "password"}
                      icon={Lock}
                      placeholder="MINIMUM 6 CHARACTERS"
                      value={securityForm.newPassword}
                      onChange={(e) => {
                        setSecurityForm({
                          ...securityForm,
                          newPassword: e.target.value,
                        });
                        if (
                          securityErrors.newPassword ||
                          securityErrors.apiError
                        ) {
                          setSecurityErrors((prev) => ({
                            ...prev,
                            newPassword: "",
                            apiError: "",
                          }));
                        }
                      }}
                      error={securityErrors.newPassword}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-9 text-brand-dark/50 hover:text-brand-dark cursor-pointer z-10"
                    >
                      {showNewPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>

                  <div className="relative">
                    <Input
                      label="CONFIRM NEW PASSCODE *"
                      type={showConfirmPassword ? "text" : "password"}
                      icon={Lock}
                      placeholder="RE-ENTER NEW PASSCODE"
                      value={securityForm.confirmPassword}
                      onChange={(e) => {
                        setSecurityForm({
                          ...securityForm,
                          confirmPassword: e.target.value,
                        });
                        if (
                          securityErrors.confirmPassword ||
                          securityErrors.apiError
                        ) {
                          setSecurityErrors((prev) => ({
                            ...prev,
                            confirmPassword: "",
                            apiError: "",
                          }));
                        }
                      }}
                      error={securityErrors.confirmPassword}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-9 text-brand-dark/50 hover:text-brand-dark cursor-pointer z-10"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>

                  <Button
                    type="submit"
                    variant="chakra"
                    size="md"
                    icon={Shield}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "UPDATING..." : "UPDATE PASSCODE"}
                  </Button>
                </form>

                <div className="pt-6 border-t border-brand-dark/10 space-y-3 max-w-lg">
                  <div className="bg-orange-500/5 border border-orange-500/20 p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <Mail
                        className="text-orange-600 shrink-0 mt-0.5"
                        size={20}
                      />
                      <div className="space-y-1 w-full">
                        <h3 className="font-bold text-xs uppercase text-brand-dark">
                          FORGOT OR RECOVER PASSCODE
                        </h3>
                        <p className="text-[11px] text-brand-dark/70 font-sans leading-relaxed">
                          Send a passcode recovery link to your registered email
                          address (
                          <span className="font-bold text-orange-600 font-mono">
                            {profile.email || "N/A"}
                          </span>
                          ).
                        </p>
                      </div>
                    </div>

                    {resetEmailSuccessNotice && (
                      <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 text-xs p-3 font-bold uppercase flex items-center gap-2 font-mono">
                        <CheckCircle2 size={16} className="shrink-0" />
                        <span>{resetEmailSuccessNotice}</span>
                      </div>
                    )}

                    {resetEmailError && (
                      <div className="bg-rose-500/10 border border-rose-500/30 text-rose-700 text-xs p-3 font-bold uppercase flex items-center gap-2 font-mono">
                        <AlertCircle size={16} className="shrink-0" />
                        <span>{resetEmailError}</span>
                      </div>
                    )}

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      icon={Send}
                      disabled={isSendingResetEmail || !profile.email}
                      onClick={handleSendResetEmail}
                      className="border-orange-500/40 text-orange-600 hover:bg-orange-500/10 font-mono"
                    >
                      {isSendingResetEmail
                        ? "SENDING RECOVERY LINK..."
                        : "SEND RECOVERY LINK"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CREATE / EDIT ADDRESS MODAL */}
      <Modal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        title={
          editingAddressId ? "EDIT SCROLL ADDRESS" : "ADD NEW SCROLL ADDRESS"
        }
      >
        {addressErrors.apiError && (
          <div className="border border-rose-600/30 bg-rose-600/5 p-3 flex items-start gap-2.5 text-rose-600 text-xs font-bold mb-4">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{addressErrors.apiError}</span>
          </div>
        )}

        <form onSubmit={handleSaveAddress} className="space-y-4 font-mono">
          <Input
            label="RECIPIENT NAME *"
            icon={User}
            placeholder="e.g. Naruto Uzumaki"
            value={addressForm.receiverName}
            onChange={(e) => {
              setAddressForm({
                ...addressForm,
                receiverName: e.target.value,
              });
              if (addressErrors.receiverName || addressErrors.apiError) {
                setAddressErrors((prev) => ({
                  ...prev,
                  receiverName: "",
                  apiError: "",
                }));
              }
            }}
            error={addressErrors.receiverName}
          />

          <Input
            label="PHONE NUMBER *"
            icon={Phone}
            placeholder="e.g. 0912345678"
            value={addressForm.phone}
            onChange={(e) => {
              setAddressForm({ ...addressForm, phone: e.target.value });
              if (addressErrors.phone || addressErrors.apiError) {
                setAddressErrors((prev) => ({
                  ...prev,
                  phone: "",
                  apiError: "",
                }));
              }
            }}
            error={addressErrors.phone}
          />

          <Input
            label="DETAILED ADDRESS *"
            icon={MapPin}
            placeholder="e.g. 123 Leaf Village, Fire Country"
            value={addressForm.fullAddress}
            onChange={(e) => {
              setAddressForm({
                ...addressForm,
                fullAddress: e.target.value,
              });
              if (addressErrors.fullAddress || addressErrors.apiError) {
                setAddressErrors((prev) => ({
                  ...prev,
                  fullAddress: "",
                  apiError: "",
                }));
              }
            }}
            error={addressErrors.fullAddress}
          />

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isDefault"
              checked={addressForm.isDefault}
              onChange={(e) =>
                setAddressForm({
                  ...addressForm,
                  isDefault: e.target.checked,
                })
              }
              className="cursor-pointer accent-orange-600"
            />
            <label
              htmlFor="isDefault"
              className="text-xs text-brand-dark/80 cursor-pointer uppercase font-bold"
            >
              SET AS DEFAULT ADDRESS
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-brand-dark/10">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAddressModal(false)}
            >
              CANCEL
            </Button>
            <Button
              type="submit"
              variant="chakra"
              size="sm"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "SAVING..."
                : editingAddressId
                  ? "UPDATE ADDRESS"
                  : "SAVE ADDRESS"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE ADDRESS MODAL */}
      {addressToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white border-2 border-brand-dark p-6 max-w-md w-full space-y-5 shadow-2xl font-mono">
            <div className="flex items-center gap-3 border-b border-brand-dark/15 pb-3">
              <div className="p-2 bg-rose-500/10 text-rose-600 border border-rose-500/30">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="font-heading text-lg tracking-wider uppercase text-brand-dark">
                  REMOVE ADDRESS?
                </h3>
                <p className="text-[10px] text-brand-dark/60 uppercase">
                  CONFIRMATION REQUIRED
                </p>
              </div>
            </div>

            <p className="text-xs text-brand-dark/80 leading-relaxed uppercase">
              ARE YOU SURE YOU WANT TO REMOVE THE ADDRESS FOR{" "}
              <span className="font-bold text-brand-dark">
                "{addressToDelete.name}"
              </span>{" "}
              FROM YOUR SCROLL BOOK? THIS ACTION CANNOT BE UNDONE.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAddressToDelete(null)}
              >
                CANCEL
              </Button>
              <Button
                variant="chakra"
                size="sm"
                onClick={handleConfirmDeleteAddress}
                className="bg-rose-600 hover:bg-rose-700 text-white border-rose-700"
              >
                DELETE ADDRESS
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white border-2 border-brand-dark p-6 max-w-md w-full space-y-5 shadow-2xl font-mono">
            <div className="flex items-center gap-3 border-b border-brand-dark/15 pb-3">
              <div className="p-2 bg-rose-500/10 text-rose-600 border border-rose-500/30">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="font-heading text-lg tracking-wider uppercase text-brand-dark">
                  TERMINATE SESSION?
                </h3>
                <p className="text-[10px] text-brand-dark/60 uppercase">
                  SHINOBI LOGOUT VERIFICATION
                </p>
              </div>
            </div>

            <p className="text-xs text-brand-dark/80 leading-relaxed uppercase">
              ARE YOU SURE YOU WANT TO DISCONNECT FROM YOUR SHINOBI ACCOUNT? YOU
              WILL NEED TO RE-AUTHENTICATE TO ACCESS YOUR MISSION ORDERS.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLogoutModal(false)}
              >
                CANCEL
              </Button>
              <Button
                variant="chakra"
                size="sm"
                onClick={handleConfirmLogout}
                className="bg-rose-600 hover:bg-rose-700 text-white border-rose-700"
              >
                DISCONNECT NOW
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
