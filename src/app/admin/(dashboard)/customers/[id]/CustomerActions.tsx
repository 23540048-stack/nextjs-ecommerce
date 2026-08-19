"use client";

import React, { useState } from "react";
import {
  Edit,
  Lock,
  Unlock,
  X,
  Check,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";

interface CustomerActionsProps {
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    village: string;
    rank: string;
    status: "active" | "vip" | "suspended";
  };
}

export default function CustomerActions({ customer }: CustomerActionsProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSuspendOpen, setIsSuspendOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State Chỉnh sửa thông tin
  const [formData, setFormData] = useState({
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    village: customer.village,
    rank: customer.rank,
  });

  // Trạng thái khóa tài khoản hiện tại
  const [currentStatus, setCurrentStatus] = useState(customer.status);

  // Xử lý Lưu Chỉnh sửa Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // TODO: Gọi Server Action hoặc API Route tại đây (VD: await updateCustomer(customer.id, formData))
    console.log("Cập nhật thông tin:", formData);

    setTimeout(() => {
      setLoading(false);
      setIsEditOpen(false);
      alert("Cập nhật thông tin Ninja thành công!");
    }, 600);
  };

  // Xử lý Khóa / Mở khóa Tài khoản
  const handleToggleSuspend = async () => {
    setLoading(true);
    const newStatus = currentStatus === "suspended" ? "active" : "suspended";

    // TODO: Gọi Server Action hoặc API Route tại đây
    console.log("Đổi trạng thái tài khoản:", newStatus);

    setTimeout(() => {
      setCurrentStatus(newStatus);
      setLoading(false);
      setIsSuspendOpen(false);
    }, 600);
  };

  return (
    <>
      {/* 1. CỤM NÚT BẤM KÍCH HOẠT */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsEditOpen(true)}
          className="inline-flex items-center gap-1.5 bg-brand-dark/5 hover:bg-brand-dark/10 border border-brand-dark/20 text-brand-dark px-3 py-2 text-xs font-bold uppercase transition-colors cursor-pointer"
        >
          <Edit size={14} /> EDIT PROFILE
        </button>

        {currentStatus === "suspended" ? (
          <button
            onClick={() => setIsSuspendOpen(true)}
            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 text-xs font-bold uppercase transition-colors cursor-pointer"
          >
            <Unlock size={14} /> REINSTATE (MỞ KHÓA)
          </button>
        ) : (
          <button
            onClick={() => setIsSuspendOpen(true)}
            className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 text-xs font-bold uppercase transition-colors cursor-pointer"
          >
            <Lock size={14} /> SUSPEND (KHÓA)
          </button>
        )}
      </div>

      {/* 2. MODAL EDIT PROFILE */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-mono text-brand-dark">
          <div className="bg-white border-2 border-brand-dark w-full max-w-lg p-6 space-y-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex justify-between items-center border-b border-brand-dark/15 pb-3">
              <h3 className="text-base font-bold uppercase flex items-center gap-2">
                <Edit size={16} className="text-orange-500" /> EDIT SHINOBI
                PROFILE
              </h3>
              <button
                onClick={() => setIsEditOpen(false)}
                className="p-1 hover:bg-brand-dark/10 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold uppercase text-brand-dark/70">
                  SHINOBI NAME
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full bg-brand-dark/5 border border-brand-dark/20 p-2.5 outline-none font-bold focus:border-orange-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold uppercase text-brand-dark/70">
                    EMAIL ADDRESS
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full bg-brand-dark/5 border border-brand-dark/20 p-2.5 outline-none font-bold focus:border-orange-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold uppercase text-brand-dark/70">
                    PHONE / CHAKRA FREQ
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full bg-brand-dark/5 border border-brand-dark/20 p-2.5 outline-none font-bold focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold uppercase text-brand-dark/70">
                  VILLAGE / LOCATION
                </label>
                <input
                  type="text"
                  value={formData.village}
                  onChange={(e) =>
                    setFormData({ ...formData, village: e.target.value })
                  }
                  className="w-full bg-brand-dark/5 border border-brand-dark/20 p-2.5 outline-none font-bold focus:border-orange-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold uppercase text-brand-dark/70">
                  NINJA RANK / LEVEL
                </label>
                <select
                  value={formData.rank}
                  onChange={(e) =>
                    setFormData({ ...formData, rank: e.target.value })
                  }
                  className="w-full bg-brand-dark/5 border border-brand-dark/20 p-2.5 outline-none font-bold uppercase cursor-pointer focus:border-orange-500"
                >
                  <option value="S-RANK VIP">S-RANK VIP</option>
                  <option value="JONIN">JONIN</option>
                  <option value="CHUNIN">CHUNIN</option>
                  <option value="GENIN">GENIN</option>
                  <option value="ROGUE">ROGUE</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-brand-dark/15">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 text-xs font-bold uppercase border border-brand-dark/20 hover:bg-brand-dark/5 transition-colors cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-xs font-bold uppercase bg-brand-dark text-white hover:bg-orange-600 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Check size={14} /> {loading ? "SAVING..." : "SAVE CHANGES"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. MODAL CONFIRM SUSPEND / REINSTATE */}
      {isSuspendOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-mono text-brand-dark">
          <div className="bg-white border-2 border-brand-dark w-full max-w-md p-6 space-y-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-3 text-rose-600 border-b border-brand-dark/15 pb-3">
              <AlertTriangle size={20} />
              <h3 className="text-base font-bold uppercase">
                {currentStatus === "suspended"
                  ? "REINSTATE ACCOUNT?"
                  : "SUSPEND ACCOUNT?"}
              </h3>
            </div>

            <p className="text-xs leading-relaxed text-brand-dark/80">
              {currentStatus === "suspended" ? (
                <>
                  Bạn có chắc chắn muốn <strong>MỞ KHÓA</strong> tài khoản cho
                  Ninja <strong>{customer.name}</strong>? Họ sẽ có thể đặt hàng
                  và truy cập lại vào hệ thống.
                </>
              ) : (
                <>
                  Bạn có chắc chắn muốn <strong>KHÓA (SUSPEND)</strong> tài
                  khoản của <strong>{customer.name}</strong>? Họ sẽ bị hạn chế
                  đặt hàng và đánh dấu là Lệnh nã (Rogue) trong hệ thống.
                </>
              )}
            </p>

            <div className="flex justify-end gap-3 pt-3 border-t border-brand-dark/15 text-xs">
              <button
                type="button"
                onClick={() => setIsSuspendOpen(false)}
                className="px-4 py-2 font-bold uppercase border border-brand-dark/20 hover:bg-brand-dark/5 transition-colors cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleToggleSuspend}
                disabled={loading}
                className={`px-4 py-2 font-bold uppercase text-white transition-colors flex items-center gap-1.5 cursor-pointer ${
                  currentStatus === "suspended"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                {loading
                  ? "PROCESSING..."
                  : currentStatus === "suspended"
                    ? "CONFIRM UNBAN"
                    : "CONFIRM SUSPEND"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
