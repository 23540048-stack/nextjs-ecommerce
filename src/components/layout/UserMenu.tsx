"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { User, LogIn, UserPlus, Lock } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

export default function UserMenu() {
  // Lấy state thực tế từ Zustand Auth Store
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Trạng thái Đăng nhập thực tế: Chỉ cần có User trong Zustand Store
  const isLoggedIn = Boolean(user);

  // Lấy chữ cái đầu của tên User (Ví dụ: "Itachi" -> "I")
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative font-mono" ref={menuRef}>
      {!isLoggedIn ? (
        /* =================================================================== */
        /* TRƯỜNG HỢP 1: CHƯA ĐĂNG NHẬP                                       */
        /* Click icon Account -> Xổ Dropdown Log In / Register                */
        /* =================================================================== */
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:text-orange-600 transition-colors cursor-pointer"
            aria-label="Account Menu"
          >
            <User size={20} />
          </Button>

          {/* DROPDOWN MENU GUEST */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-brand-dark shadow-xl z-50 p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase text-brand-dark flex items-center gap-1.5">
                  <Lock size={14} className="text-orange-500" />
                  GUEST ACCESS
                </p>
                <p className="text-[10px] text-brand-dark/60 uppercase leading-relaxed">
                  AUTHENTICATE TO ACCESS YOUR SHINOBI PROFILE & MISSION ORDERS.
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="block"
                >
                  <Button
                    variant="chakra"
                    size="sm"
                    icon={LogIn}
                    className="w-full justify-center"
                  >
                    LOG IN
                  </Button>
                </Link>

                <Link
                  href="/register"
                  onClick={() => setIsOpen(false)}
                  className="block"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    icon={UserPlus}
                    className="w-full justify-center"
                  >
                    JOIN THE CLAN
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </>
      ) : (
        /* =================================================================== */
        /* TRƯỜNG HỢP 2: ĐÃ ĐĂNG NHẬP                                         */
        /* Hiển thị tên thực -> Click truy cập trực tiếp /account             */
        /* =================================================================== */
        <Link href="/account">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 border-brand-dark/20 hover:border-brand-dark"
          >
            <div className="w-5 h-5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-600 font-bold text-[10px] flex items-center justify-center">
              {userInitial}
            </div>
            <span className="text-xs font-bold uppercase tracking-wider">
              {user?.name || "SHINOBI"}
            </span>
          </Button>
        </Link>
      )}
    </div>
  );
}
