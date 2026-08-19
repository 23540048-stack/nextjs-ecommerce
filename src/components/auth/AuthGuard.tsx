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

  // Lấy user từ Zustand Store (đã được populate từ API me/profile)
  const user = useAuthStore((state) => state.user);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Với HttpOnly Cookie: Chỉ cần kiểm tra xem store có thông tin `user` hay chưa
    if (!user) {
      toast.error("PLEASE LOG IN TO ACCESS THIS PAGE!");
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    } else {
      setIsAuthorized(true);
    }
  }, [user, router, pathname]);

  // Màn hình chờ kiểm tra quyền truy cập
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
