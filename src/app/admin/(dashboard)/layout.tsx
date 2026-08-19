"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

import { useRouter, usePathname } from "next/navigation";

import AdminSideBar from "@/components/layout/AdminSideBar";

import { useAdminAuthStore } from "@/store/useAuthStore";

import { api } from "@/lib/api";

import {
  Menu,
  Bell,
  ShieldCheck,
  Check,
  CheckCheck,
  ExternalLink,
  Loader2,
  X,
} from "lucide-react";

import { io, Socket } from "socket.io-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type?: "info" | "warning" | "success" | "error";
  isRead: boolean;
  link?: string;
  userId?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === "/admin/login";

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const [loading, setLoading] = useState(false);

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // ============================================================
  // ADMIN AUTH
  // ============================================================

  const user = useAdminAuthStore((state) => state.user);

  const setAuth = useAdminAuthStore((state) => state.setAuth);

  // ============================================================
  // VERIFY SESSION
  // ============================================================

  useEffect(() => {
    if (isLoginPage) {
      setIsCheckingAuth(false);
      return;
    }

    const verifySession = async () => {
      if (user) {
        setIsCheckingAuth(false);
        return;
      }

      try {
        const res = await api.get("/auth/me");

        const currentUser = res.data?.user || res.data;

        if (currentUser && String(currentUser.role).toUpperCase() === "ADMIN") {
          setAuth(currentUser);
          setIsCheckingAuth(false);
        } else {
          router.replace(
            `/admin/login?callbackUrl=${encodeURIComponent(pathname)}`,
          );
        }
      } catch (error) {
        console.error("Session verification failed:", error);

        router.replace(
          `/admin/login?callbackUrl=${encodeURIComponent(pathname)}`,
        );
      }
    };

    verifySession();
  }, [pathname, isLoginPage, router, user, setAuth]);

  // ============================================================
  // SAFE NOTIFICATIONS
  // ============================================================

  const safeNotifications = Array.isArray(notifications) ? notifications : [];

  const unreadCount = safeNotifications.filter(
    (notification) => !notification.isRead,
  ).length;

  // ============================================================
  // FETCH NOTIFICATIONS FROM DATABASE
  // ============================================================

  const fetchNotifications = useCallback(async () => {
    if (isLoginPage || isCheckingAuth) {
      return;
    }

    try {
      setLoading(true);

      const res = await api.get("/notifications");

      const data = res.data;

      let notifList: NotificationItem[] = [];

      if (Array.isArray(data)) {
        notifList = data;
      } else if (Array.isArray(data?.data)) {
        notifList = data.data;
      } else if (Array.isArray(data?.notifications)) {
        notifList = data.notifications;
      }

      setNotifications(
        notifList.map((notification) => ({
          ...notification,
          createdAt: notification.createdAt || new Date().toISOString(),
        })),
      );
    } catch (error) {
      console.error("Lỗi khi kết nối API Notifications:", error);

      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [isLoginPage, isCheckingAuth]);

  // ============================================================
  // REALTIME WEBSOCKET
  // ============================================================

  useEffect(() => {
    if (isLoginPage || isCheckingAuth) {
      return;
    }

    fetchNotifications();

    const socket: Socket = io(API_BASE_URL, {
      transports: ["polling", "websocket"],

      withCredentials: true,

      autoConnect: true,

      reconnectionAttempts: 5,

      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("⚡ Connected to Notifications WebSocket");
    });

    socket.on("new_notification", (newNotif: NotificationItem) => {
      if (!newNotif) {
        return;
      }

      const formattedNotif: NotificationItem = {
        _id: newNotif._id || `temp-${Date.now()}`,

        title: newNotif.title || "NEW MISSION ORDER",

        message: newNotif.message || "",

        type: newNotif.type || "info",

        isRead: false,

        link: newNotif.link || "/admin/orders",

        userId: newNotif.userId ?? null,

        createdAt: newNotif.createdAt || new Date().toISOString(),

        updatedAt: newNotif.updatedAt,
      };

      setNotifications((prev) => {
        const safePrev = Array.isArray(prev) ? prev : [];

        const exists = safePrev.some((item) => item._id === formattedNotif._id);

        if (exists) {
          return safePrev;
        }

        return [formattedNotif, ...safePrev];
      });
    });

    return () => {
      socket.off("connect");
      socket.off("new_notification");
      socket.disconnect();
    };
  }, [fetchNotifications, isLoginPage, isCheckingAuth]);

  // ============================================================
  // CLICK OUTSIDE
  // ============================================================

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ============================================================
  // MARK ONE AS READ
  // ============================================================

  const handleMarkAsRead = async (id: string) => {
    if (!id || id.startsWith("temp-")) {
      return;
    }

    try {
      await api.patch(`/notifications/${id}/read`);

      // Update UI ngay lập tức
      setNotifications((prev) =>
        (Array.isArray(prev) ? prev : []).map((notification) =>
          notification._id === id
            ? {
                ...notification,
                isRead: true,
              }
            : notification,
        ),
      );
    } catch (error) {
      console.error("Lỗi khi cập nhật đã đọc:", error);
    }
  };

  // ============================================================
  // OPEN NOTIFICATION
  // ============================================================

  const handleOpenNotification = async (notification: NotificationItem) => {
    // Đánh dấu đã đọc trước
    if (!notification.isRead) {
      await handleMarkAsRead(notification._id);
    }

    // Nếu có link thì chuyển trang
    if (notification.link) {
      setIsNotificationOpen(false);

      router.push(notification.link);
    }
  };

  // ============================================================
  // MARK ALL AS READ
  // ============================================================

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch("/notifications/read-all");

      setNotifications((prev) =>
        (Array.isArray(prev) ? prev : []).map((notification) => ({
          ...notification,
          isRead: true,
        })),
      );
    } catch (error) {
      console.error("Lỗi khi đánh dấu tất cả đã đọc:", error);
    }
  };

  // ============================================================
  // LOGIN PAGE
  // ============================================================

  if (isLoginPage) {
    return <>{children}</>;
  }

  // ============================================================
  // VERIFYING
  // ============================================================

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center font-mono text-white">
        <div className="flex items-center gap-3">
          <Loader2 className="animate-spin text-orange-500" size={24} />

          <span className="text-sm font-bold tracking-widest uppercase">
            VERIFYING HOKAGE ACCESS...
          </span>
        </div>
      </div>
    );
  }

  // ============================================================
  // ADMIN LAYOUT
  // ============================================================

  return (
    <div className="min-h-screen bg-brand-ivory/30 font-mono text-brand-dark flex flex-col md:flex-row relative">
      <div className="fixed inset-0 opacity-[0.025] bg-[radial-gradient(#000_1px,transparent_1px)] bg-size-[16px_16px] pointer-events-none z-0" />

      {/* MOBILE HEADER BAR */}

      <header className="md:hidden bg-white border-b-2 border-brand-dark p-4 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-dark text-brand-ivory font-heading font-bold text-lg flex items-center justify-center border border-black">
            N
          </div>

          <span className="font-heading font-bold text-sm tracking-wider uppercase">
            HOKAGE ADMIN
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="p-2 border-2 border-brand-dark bg-brand-ivory hover:bg-orange-500 hover:text-white transition-colors cursor-pointer relative"
            >
              <Bell size={18} />

              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-orange-600 rounded-full border border-white" />
              )}
            </button>

            {isNotificationOpen && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border-2 border-brand-dark shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-50 overflow-hidden text-brand-dark">
                <NotificationPopoverContent
                  unreadCount={unreadCount}
                  loading={loading}
                  notifications={safeNotifications}
                  onMarkAll={handleMarkAllAsRead}
                  onMarkOne={handleMarkAsRead}
                  onOpenNotification={handleOpenNotification}
                  onClose={() => setIsNotificationOpen(false)}
                />
              </div>
            )}
          </div>

          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 border-2 border-brand-dark bg-brand-ivory hover:bg-orange-500 hover:text-white transition-colors cursor-pointer"
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      {/* ADMIN SIDEBAR */}

      <AdminSideBar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* MAIN CONTENT */}

      <div className="flex-1 flex flex-col min-w-0 z-10">
        {/* DESKTOP HEADER */}

        <header className="hidden md:flex bg-white border-b-2 border-brand-dark px-8 py-4 items-center justify-end sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-4 text-xs font-bold">
            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 px-3 py-1.5">
              <ShieldCheck size={15} />

              <span>SYSTEM SEAL ACTIVE</span>
            </div>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className={`p-2 border border-brand-dark/20 hover:border-brand-dark relative text-brand-dark transition-colors cursor-pointer ${
                  isNotificationOpen
                    ? "bg-orange-500 text-white"
                    : "bg-white hover:bg-orange-500 hover:text-white"
                }`}
              >
                <Bell size={16} />

                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />

                    <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-600 border border-white" />
                  </span>
                )}
              </button>

              {isNotificationOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border-2 border-brand-dark shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-50 overflow-hidden text-brand-dark">
                  <NotificationPopoverContent
                    unreadCount={unreadCount}
                    loading={loading}
                    notifications={safeNotifications}
                    onMarkAll={handleMarkAllAsRead}
                    onMarkOne={handleMarkAsRead}
                    onOpenNotification={handleOpenNotification}
                    onClose={() => setIsNotificationOpen(false)}
                  />
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 flex-1">{children}</main>
      </div>
    </div>
  );
}

// ============================================================
// NOTIFICATION POPOVER
// ============================================================

function NotificationPopoverContent({
  unreadCount,
  loading,
  notifications,
  onMarkAll,
  onMarkOne,
  onOpenNotification,
  onClose,
}: {
  unreadCount: number;
  loading: boolean;
  notifications: NotificationItem[];
  onMarkAll: () => void;
  onMarkOne: (id: string) => void;
  onOpenNotification: (notification: NotificationItem) => void;
  onClose: () => void;
}) {
  const safeList = Array.isArray(notifications) ? notifications : [];

  return (
    <>
      <div className="bg-brand-dark text-white p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-xs uppercase tracking-wider">
            NOTIFICATIONS
          </span>

          {/* NEW chỉ hiển thị khi còn notification chưa đọc */}

          {unreadCount > 0 && (
            <span className="bg-orange-600 text-white text-[10px] px-1.5 py-0.5 font-bold">
              {unreadCount} NEW
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAll}
              title="Mark all as read"
              className="hover:text-orange-400 transition-colors p-1 cursor-pointer"
            >
              <CheckCheck size={14} />
            </button>
          )}

          <button
            onClick={onClose}
            className="hover:text-rose-400 transition-colors p-1 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-brand-dark/10">
        {loading ? (
          <div className="p-6 text-center text-xs text-brand-dark/50 flex items-center justify-center gap-2">
            <Loader2 size={14} className="animate-spin text-orange-500" />
            LOADING NOTIFICATIONS...
          </div>
        ) : safeList.length > 0 ? (
          safeList.map((notif) => (
            <div
              key={notif._id}
              onClick={() => onOpenNotification(notif)}
              role={notif.link ? "button" : undefined}
              tabIndex={notif.link ? 0 : undefined}
              onKeyDown={(event) => {
                if (
                  notif.link &&
                  (event.key === "Enter" || event.key === " ")
                ) {
                  event.preventDefault();
                  onOpenNotification(notif);
                }
              }}
              className={`p-3 text-xs transition-colors flex items-start justify-between gap-3 cursor-pointer ${
                !notif.isRead
                  ? "bg-orange-500/5 font-semibold hover:bg-orange-500/10"
                  : "bg-white opacity-70 hover:bg-brand-ivory/40"
              }`}
            >
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold uppercase text-brand-dark block truncate">
                    {notif.title}
                  </span>

                  <span className="text-[10px] text-brand-dark/40 font-normal shrink-0">
                    {new Date(notif.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <p className="text-[11px] text-brand-dark/70 font-normal leading-relaxed">
                  {notif.message}
                </p>

                {notif.link && (
                  <span
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();

                      onOpenNotification(notif);
                    }}
                    className="inline-flex items-center gap-1 text-[10px] text-orange-600 font-bold hover:underline mt-1 cursor-pointer"
                  >
                    VIEW DETAILS
                    <ExternalLink size={10} />
                  </span>
                )}
              </div>

              {/* CHECK BUTTON CHỈ HIỆN KHI CHƯA ĐỌC */}

              {!notif.isRead && (
                <button
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();

                    onMarkOne(notif._id);
                  }}
                  title="Mark as read"
                  className="p-1 hover:bg-brand-dark/10 border border-brand-dark/20 text-brand-dark/60 shrink-0 mt-0.5 cursor-pointer"
                >
                  <Check size={12} />
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-xs text-brand-dark/50 uppercase">
            NO NOTIFICATIONS FOUND.
          </div>
        )}
      </div>

      <div className="border-t-2 border-brand-dark p-2 bg-brand-ivory/50 text-center">
        <span className="text-[10px] font-bold text-brand-dark/60 uppercase">
          SYSTEM SCROLLS REALTIME SYNCED
        </span>
      </div>
    </>
  );
}
