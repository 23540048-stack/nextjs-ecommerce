import axios from "axios";
import { useAuthStore, useAdminAuthStore } from "@/store/useAuthStore";
import toast from "react-hot-toast";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

let isRedirecting = false;

// DANH SÁCH ROUTE CUSTOMER BẮT BUỘC ĐĂNG NHẬP MỚI ĐƯỢC TRUY CẬP
const PROTECTED_CUSTOMER_ROUTES = [
  "/account",
  "/checkout",
  "/orders",
  "/wishlist",
  "/cart",
];

api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    if (typeof window === "undefined") {
      return Promise.reject(error);
    }

    const currentPath = window.location.pathname;

    if (isRedirecting) {
      return Promise.reject(error);
    }

    // ========================================
    // ADMIN ROUTES
    // ========================================
    if (currentPath.startsWith("/admin")) {
      if (currentPath === "/admin/login") {
        return Promise.reject(error);
      }

      isRedirecting = true;
      toast.dismiss();

      toast.error("ADMIN SESSION EXPIRED! PLEASE LOG IN AGAIN.", {
        id: "admin-unauthorized-toast",
      });

      useAdminAuthStore.getState().logout();

      setTimeout(() => {
        window.location.href = `/admin/login?callbackUrl=${encodeURIComponent(
          currentPath,
        )}`;
      }, 500);

      return Promise.reject(error);
    }

    // ========================================
    // CUSTOMER ROUTES
    // ========================================

    // 1. Luôn luôn reset State Zustand về null khi Backend báo 401
    useAuthStore.getState().logout();

    // 2. Nếu đang ở sẵn trang Login / Register thì dừng lại
    if (currentPath === "/login" || currentPath === "/register") {
      return Promise.reject(error);
    }

    // 3. Kiểm tra xem trang hiện tại có phải trang bảo mật hay không
    const isProtectedRoute = PROTECTED_CUSTOMER_ROUTES.some((route) =>
      currentPath.startsWith(route),
    );

    // 4. CHỈ CHUYỂN HƯỚNG NẾU ĐANG Ở TRANG BẢO MẬT (/account, /checkout...)
    if (isProtectedRoute) {
      isRedirecting = true;

      toast.dismiss();
      toast.error("PLEASE LOG IN TO PERFORM THIS ACTION!", {
        id: "unauthorized-toast",
      });

      setTimeout(() => {
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
      }, 500);
    }

    // 5. Nếu đang ở trang Public (Home, Shop...), chỉ dọn state và đứng yên tại trang
    return Promise.reject(error);
  },
);
