"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const clientToken = useAuthStore((state) => state.token);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Kiểm tra token từ Zustand hoặc LocalStorage
    const token =
      clientToken ||
      (typeof window !== "undefined"
        ? localStorage.getItem("client_access_token")
        : null);

    if (!token) {
      toast.error("PLEASE LOG IN TO ACCESS THIS PAGE!");
      // Điều hướng về login và lưu lại trang hiện tại để quay lại sau khi đăng nhập thành công
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    } else {
      setIsAuthorized(true);
    }
  }, [clientToken, router, pathname]);

  // Hiển thị màn hình chờ trong lúc kiểm tra token để tránh lộ giao diện riêng tư
  if (!isAuthorized) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center font-mono gap-3">
        <Loader2 className="animate-spin text-orange-500" size={32} />
        <span className="text-xs text-brand-dark/60 tracking-widest uppercase">
          CHECKING ACCESS PERMISSIONS...
        </span>
      </div>
    );
  }

  return <>{children}</>;
}
