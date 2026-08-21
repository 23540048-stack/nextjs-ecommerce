"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingCart,
  Users,
  UserCog,
  Megaphone,
  Image as ImageIcon,
  BadgePercent,
  Ticket,
  Zap,
  Star,
  Flag,
  MessageSquare,
  Bot,
  Settings,
  Crown,
  Sliders,
  LogOut,
  ExternalLink,
  Flame,
  X,
  ChevronDown,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

// 1. Import API Client & Zustand Admin Auth Store
import { api } from "@/lib/api";
import { useAdminAuthStore } from "@/store/useAuthStore";

interface NavItem {
  name: string;
  href?: string;
  icon: React.ElementType;
  badge?: string;
  children?: { name: string; href: string; icon: React.ElementType }[];
}

const NAV_ITEMS: NavItem[] = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Categories", href: "/admin/categories", icon: Tags },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Staff", href: "/admin/staff", icon: UserCog },
  {
    name: "Marketing",
    icon: Megaphone,
    children: [
      { name: "Banners", href: "/admin/marketing/banners", icon: ImageIcon },
      {
        name: "Promotions",
        href: "/admin/marketing/promotions",
        icon: BadgePercent,
      },
      { name: "Coupons", href: "/admin/marketing/coupons", icon: Ticket },
      { name: "Flash Sale", href: "/admin/marketing/flash-sale", icon: Zap },
      {
        name: "Featured Gear",
        href: "/admin/marketing/featured-products",
        icon: Star,
      },
      { name: "Campaigns", href: "/admin/marketing/campaigns", icon: Flag },
    ],
  },
  { name: "Reviews", href: "/admin/reviews", icon: MessageSquare },
  { name: "Chatbot AI", href: "/admin/chatbot", icon: Bot },
  {
    name: "Settings",
    icon: Settings,
    children: [
      { name: "General Settings", href: "/admin/settings", icon: Sliders },
      {
        name: "Membership & Perks",
        href: "/admin/settings/membership",
        icon: Crown,
      },
    ],
  },
];

interface AdminSideBarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AdminSideBar({ isOpen, onClose }: AdminSideBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  // States cho Logout Modal
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Lấy hàm logout hoặc setAuth từ Admin Auth Store
  const logoutAdmin = useAdminAuthStore((state: any) => state.logout);
  const setAuth = useAdminAuthStore((state: any) => state.setAuth);

  useEffect(() => {
    NAV_ITEMS.forEach((item) => {
      if (item.children) {
        const hasActiveChild = item.children.some((child) =>
          pathname.startsWith(child.href),
        );
        if (hasActiveChild) {
          setOpenSubmenu(item.name);
        }
      }
    });
  }, [pathname]);

  const toggleSubmenu = (name: string) => {
    setOpenSubmenu((prev) => (prev === name ? null : name));
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);

    try {
      // 1. Gọi API Server để xóa HttpOnly Cookie
      await api.post("/auth/admin/logout");
    } catch (error) {
      console.error("Lỗi khi gọi API logout:", error);
    } finally {
      // 2. Reset Zustand State ở client
      if (typeof logoutAdmin === "function") {
        logoutAdmin();
      } else if (typeof setAuth === "function") {
        setAuth(null);
      } else {
        useAdminAuthStore.setState({ user: null });
      }

      // 3. Đóng Sidebar Mobile & Logout Modal
      if (onClose) onClose();
      setIsLogoutModalOpen(false);
      setIsLoggingOut(false);

      // 4. Hard Redirect về trang Login để xóa toàn bộ RAM state và buộc F5 lại ứng dụng
      window.location.href = "/admin/login";
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-white border-r-2 border-brand-dark flex flex-col justify-between transition-transform duration-300 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 space-y-5 overflow-y-auto max-h-[calc(100vh-80px)] scrollbar-thin">
          <div className="pb-4 border-b-2 border-brand-dark/15 flex items-center justify-between">
            <Link
              href="/admin"
              className="flex items-center gap-3 group"
              onClick={onClose}
            >
              <div className="w-9 h-9 bg-orange-600 text-white font-heading font-bold text-xl flex items-center justify-center border-2 border-brand-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:rotate-6 transition-transform">
                <Flame size={20} />
              </div>
              <div>
                <span className="font-heading font-bold text-sm tracking-wider text-brand-dark block leading-none">
                  LEAF GUILD
                </span>
                <span className="text-[9px] font-bold text-orange-600 uppercase tracking-widest block mt-1">
                  HOKAGE ADMIN
                </span>
              </div>
            </Link>

            {onClose && (
              <Button
                variant="outline"
                size="sm"
                icon={X}
                onClick={onClose}
                className="md:hidden p-1 text-brand-dark hover:bg-orange-500 hover:text-white border-brand-dark/30"
              >
                <span className="sr-only">Close sidebar</span>
              </Button>
            )}
          </div>

          <nav className="space-y-1">
            <span className="text-[10px] font-bold text-brand-dark/40 tracking-widest uppercase block mb-2 px-2">
              MANAGEMENT SCROLLS
            </span>

            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;

              if (!item.children) {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href!}
                    onClick={onClose}
                    className={`flex items-center justify-between px-3 py-2 text-xs font-bold transition-all border ${
                      isActive
                        ? "bg-brand-dark text-brand-ivory border-brand-dark shadow-[3px_3px_0px_0px_rgba(234,88,12,1)]"
                        : "bg-transparent text-brand-dark/75 border-transparent hover:border-brand-dark hover:bg-orange-500/10 hover:text-brand-dark"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={16} />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 font-mono border ${
                          isActive
                            ? "bg-orange-600 text-white border-white"
                            : "bg-orange-100 text-orange-700 border-orange-300"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              }

              const isParentOpen = openSubmenu === item.name;
              const isChildActive = item.children.some((c) =>
                pathname.startsWith(c.href),
              );

              return (
                <div key={item.name} className="space-y-1">
                  <button
                    onClick={() => toggleSubmenu(item.name)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold transition-all border cursor-pointer ${
                      isChildActive
                        ? "bg-orange-500/10 text-orange-600 border-orange-500/40"
                        : "bg-transparent text-brand-dark/75 border-transparent hover:border-brand-dark hover:bg-orange-500/10 hover:text-brand-dark"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={16} />
                      <span>{item.name}</span>
                    </div>
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${
                        isParentOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isParentOpen && (
                    <div className="pl-4 pr-1 space-y-1 border-l-2 border-orange-500/30 ml-3 py-1">
                      {item.children.map((child) => {
                        const ChildIcon = child.icon;
                        const isSubActive = pathname === child.href;

                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={onClose}
                            className={`flex items-center gap-2 px-2.5 py-1.5 text-[11px] font-bold transition-all border ${
                              isSubActive
                                ? "bg-brand-dark text-brand-ivory border-brand-dark"
                                : "text-brand-dark/70 border-transparent hover:text-brand-dark hover:bg-brand-ivory"
                            }`}
                          >
                            <ChildIcon size={13} />
                            <span>{child.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        <div className="p-3 border-t-2 border-brand-dark/15 bg-brand-ivory/20 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between p-2 bg-white border border-brand-dark/30 hover:border-brand-dark text-xs font-bold text-brand-dark transition-all group shadow-xs"
          >
            <span className="flex items-center gap-2">
              <ExternalLink size={14} className="text-orange-600" />
              VIEW STOREFRONT
            </span>
            <span className="text-[10px] font-mono text-brand-dark/50 group-hover:translate-x-0.5 transition-transform">
              →
            </span>
          </Link>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-none bg-orange-600 text-white border border-black font-bold text-xs flex items-center justify-center">
                HK
              </div>
              <div className="text-[11px] font-sans">
                <span className="font-bold block text-brand-dark leading-none">
                  Hokage Admin
                </span>
                <span className="text-[9px] text-brand-dark/50 font-mono">
                  Level 10 Access
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              icon={LogOut}
              title="Logout"
              onClick={() => setIsLogoutModalOpen(true)}
              className="p-1.5 text-brand-dark/50 hover:text-rose-600 border-none bg-transparent hover:bg-transparent shadow-none cursor-pointer"
            >
              <span className="sr-only">Logout</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* MODAL XÁC NHẬN LOGOUT ADMIN */}
      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="TERMINATE HQ SESSION"
        maxWidth="sm"
      >
        <div className="space-y-5 font-mono">
          <div className="flex items-start gap-3 bg-red-500/10 border-2 border-red-600 p-3 text-red-600">
            <AlertTriangle size={20} className="shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider">
                CONFIRM DISCONNECT?
              </p>
              <p className="text-[11px] text-red-600/80 leading-relaxed uppercase">
                YOUR ADMIN SESSION WILL BE TERMINATED AND YOU WILL RETURN TO HQ
                LOGIN.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-brand-dark/15">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isLoggingOut}
              onClick={() => setIsLogoutModalOpen(false)}
            >
              CANCEL
            </Button>
            <Button
              type="button"
              variant="chakra"
              size="sm"
              disabled={isLoggingOut}
              icon={LogOut}
              onClick={handleConfirmLogout}
              className="bg-red-600 hover:bg-red-700 text-white border-brand-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              {isLoggingOut ? "DISCONNECTING..." : "CONFIRM LOGOUT"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
