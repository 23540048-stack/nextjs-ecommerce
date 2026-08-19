"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Settings,
  Truck,
  CreditCard,
  Bell,
  ShieldCheck,
  Save,
  ChevronRight,
  ChevronLeft,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Trash2,
  UserCheck,
  Users,
  Lock,
  Eye,
  EyeOff,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";

// Tab Identifiers
type TabType =
  | "general"
  | "shipping"
  | "payments"
  | "notifications"
  | "security";

interface ShippingMethod {
  id: string;
  name: string;
  baseFee: number;
  freeThreshold: number;
  estimatedDelivery: string;
  enabled: boolean;
}

interface PaymentGateway {
  id: string;
  name: string;
  type: "crypto" | "card" | "wallet" | "cod";
  feeRate: number;
  apiKey: string;
  enabled: boolean;
}

interface NotificationRule {
  id: string;
  event: string;
  description: string;
  email: boolean;
  sms: boolean;
  telegram: boolean;
}

interface ModulePermission {
  moduleKey: string;
  moduleName: string;
  read: boolean;
  write: boolean;
  delete: boolean;
}

interface RoleItem {
  id: string;
  name: string;
  description: string;
  usersCount: number;
  isSystemRole: boolean; // System roles cannot be deleted
  permissions: ModulePermission[];
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("general");
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isSavedSuccessfully, setIsSavedSuccessfully] = useState(false);

  // Modal State for Delete Shipping Confirmation
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [shippingToDelete, setShippingToDelete] =
    useState<ShippingMethod | null>(null);

  // Modal State for Delete Role Confirmation
  const [isDeleteRoleModalOpen, setIsDeleteRoleModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<RoleItem | null>(null);

  // Tab List Order for Sequential Step-by-Step Wizard
  const tabsOrder: { id: TabType; title: string; icon: React.ElementType }[] = [
    { id: "general", title: "1. GENERAL IDENTITY", icon: Building2 },
    { id: "shipping", title: "2. DISPATCH & SHIPPING", icon: Truck },
    { id: "payments", title: "3. PAYMENTS & RYO VAULT", icon: CreditCard },
    { id: "notifications", title: "4. ANBU ALERTS", icon: Bell },
    { id: "security", title: "5. SECURITY & ROLES", icon: ShieldCheck },
  ];

  // Helper for Next/Prev Step Navigation
  const currentTabIndex = tabsOrder.findIndex((t) => t.id === activeTab);

  const handleNextTab = () => {
    if (currentTabIndex < tabsOrder.length - 1) {
      setActiveTab(tabsOrder[currentTabIndex + 1].id);
    }
  };

  const handlePrevTab = () => {
    if (currentTabIndex > 0) {
      setActiveTab(tabsOrder[currentTabIndex - 1].id);
    }
  };

  // ------------------- STATE 1: GENERAL -------------------
  const [villageStoreName, setVillageStoreName] = useState(
    "Leaf Guild Shinobi Market",
  );
  const [contactEmail, setContactEmail] = useState("hokage.office@leaf.gov");
  const [supportPhone, setSupportPhone] = useState("+84 901 234 567");
  const [defaultCurrency, setDefaultCurrency] = useState("USD ($)");
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // ------------------- STATE 2: SHIPPING -------------------
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([
    {
      id: "SHIP-1",
      name: "LEAF POSTAL CARRIER",
      baseFee: 5,
      freeThreshold: 50,
      estimatedDelivery: "2-3 Days",
      enabled: true,
    },
    {
      id: "SHIP-2",
      name: "EXPRESS AIR-NINJA EAGLE",
      baseFee: 15,
      freeThreshold: 150,
      estimatedDelivery: "24 Hours Express",
      enabled: true,
    },
    {
      id: "SHIP-3",
      name: "TOAD SUMMONING INSTANT DISPATCH",
      baseFee: 30,
      freeThreshold: 300,
      estimatedDelivery: "Immediate Delivery",
      enabled: false,
    },
  ]);

  const handleOpenDeleteShippingModal = (method: ShippingMethod) => {
    setShippingToDelete(method);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDeleteShipping = () => {
    if (shippingToDelete) {
      setShippingMethods(
        shippingMethods.filter((m) => m.id !== shippingToDelete.id),
      );
      setIsDeleteModalOpen(false);
      setShippingToDelete(null);
    }
  };

  // ------------------- STATE 3: PAYMENTS -------------------
  const [ryoExchangeRate, setRyoExchangeRate] = useState<number>(10);
  const [showApiKeys, setShowApiKeys] = useState<{ [key: string]: boolean }>(
    {},
  );
  const [paymentGateways, setPaymentGateways] = useState<PaymentGateway[]>([
    {
      id: "PAY-1",
      name: "SHINOBI RYO COIN VAULT",
      type: "crypto",
      feeRate: 0,
      apiKey: "ryo_sec_live_99218318239102",
      enabled: true,
    },
    {
      id: "PAY-2",
      name: "STRIPE NINJA CARD DEPOSIT",
      type: "card",
      feeRate: 2.5,
      apiKey: "sk_live_51M0x9218391023812",
      enabled: true,
    },
    {
      id: "PAY-3",
      name: "PAYPAL GLOBAL JUTSU",
      type: "wallet",
      feeRate: 3.0,
      apiKey: "client_id_live_paypal_991823",
      enabled: true,
    },
    {
      id: "PAY-4",
      name: "CASH ON HANDOVER (COD)",
      type: "cod",
      feeRate: 0,
      apiKey: "NO_KEY_REQUIRED",
      enabled: true,
    },
  ]);

  // ------------------- STATE 4: NOTIFICATIONS -------------------
  const [telegramBotToken, setTelegramBotToken] = useState(
    "bot689123812:AAH92813...",
  );
  const [notificationRules, setNotificationRules] = useState<
    NotificationRule[]
  >([
    {
      id: "NOTIF-1",
      event: "New Order Placed",
      description: "Notify when a new scroll order is submitted",
      email: true,
      sms: false,
      telegram: true,
    },
    {
      id: "NOTIF-2",
      event: "Dispatch Status Updated",
      description: "Send tracking scroll to buyer upon carrier assignment",
      email: true,
      sms: true,
      telegram: false,
    },
    {
      id: "NOTIF-3",
      event: "S-Rank Urgent Inventory Warning",
      description: "Alert when high-grade gear inventory drops below threshold",
      email: true,
      sms: true,
      telegram: true,
    },
    {
      id: "NOTIF-4",
      event: "Unusual Anbu Access Attempt",
      description:
        "Trigger emergency dispatch if failed admin logins exceed 5 times",
      email: true,
      sms: true,
      telegram: true,
    },
  ]);

  // ------------------- STATE 5: SECURITY & ROLES -------------------
  const [securityConfig, setSecurityConfig] = useState({
    enforce2FA: true,
    sessionTimeoutMinutes: 60,
    ipWhitelistEnabled: false,
    allowedIPs: "192.168.1.1, 10.0.0.5",
    auditLogRetentionDays: 90,
  });

  // Roles & Permissions Matrix State
  const [roles, setRoles] = useState<RoleItem[]>([
    {
      id: "ROLE-HOKAGE",
      name: "HOKAGE (SUPER ADMIN)",
      description:
        "Full unhindered authority over all Shinobi Village operations",
      usersCount: 2,
      isSystemRole: true,
      permissions: [
        {
          moduleKey: "orders",
          moduleName: "Scroll Orders",
          read: true,
          write: true,
          delete: true,
        },
        {
          moduleKey: "products",
          moduleName: "Ninja Weapons & Catalog",
          read: true,
          write: true,
          delete: true,
        },
        {
          moduleKey: "customers",
          moduleName: "Shinobi Registry (Users)",
          read: true,
          write: true,
          delete: true,
        },
        {
          moduleKey: "settings",
          moduleName: "System Settings Workspace",
          read: true,
          write: true,
          delete: true,
        },
        {
          moduleKey: "audit",
          moduleName: "ANBU Security Audit Logs",
          read: true,
          write: true,
          delete: true,
        },
      ],
    },
    {
      id: "ROLE-JONIN",
      name: "JONIN (STORE MANAGER)",
      description: "Manages orders, inventory and customer inquiries",
      usersCount: 5,
      isSystemRole: false,
      permissions: [
        {
          moduleKey: "orders",
          moduleName: "Scroll Orders",
          read: true,
          write: true,
          delete: false,
        },
        {
          moduleKey: "products",
          moduleName: "Ninja Weapons & Catalog",
          read: true,
          write: true,
          delete: true,
        },
        {
          moduleKey: "customers",
          moduleName: "Shinobi Registry (Users)",
          read: true,
          write: true,
          delete: false,
        },
        {
          moduleKey: "settings",
          moduleName: "System Settings Workspace",
          read: true,
          write: false,
          delete: false,
        },
        {
          moduleKey: "audit",
          moduleName: "ANBU Security Audit Logs",
          read: true,
          write: false,
          delete: false,
        },
      ],
    },
    {
      id: "ROLE-CHUNIN",
      name: "CHUNIN (DISPATCH STAFF)",
      description:
        "Handles order fulfilment, package dispatch and status updates",
      usersCount: 12,
      isSystemRole: false,
      permissions: [
        {
          moduleKey: "orders",
          moduleName: "Scroll Orders",
          read: true,
          write: true,
          delete: false,
        },
        {
          moduleKey: "products",
          moduleName: "Ninja Weapons & Catalog",
          read: true,
          write: false,
          delete: false,
        },
        {
          moduleKey: "customers",
          moduleName: "Shinobi Registry (Users)",
          read: true,
          write: false,
          delete: false,
        },
        {
          moduleKey: "settings",
          moduleName: "System Settings Workspace",
          read: false,
          write: false,
          delete: false,
        },
        {
          moduleKey: "audit",
          moduleName: "ANBU Security Audit Logs",
          read: false,
          write: false,
          delete: false,
        },
      ],
    },
    {
      id: "ROLE-ANBU",
      name: "ANBU (SECURITY AUDITOR)",
      description: "Monitors login attempts, security breaches and audit logs",
      usersCount: 3,
      isSystemRole: false,
      permissions: [
        {
          moduleKey: "orders",
          moduleName: "Scroll Orders",
          read: true,
          write: false,
          delete: false,
        },
        {
          moduleKey: "products",
          moduleName: "Ninja Weapons & Catalog",
          read: true,
          write: false,
          delete: false,
        },
        {
          moduleKey: "customers",
          moduleName: "Shinobi Registry (Users)",
          read: true,
          write: false,
          delete: false,
        },
        {
          moduleKey: "settings",
          moduleName: "System Settings Workspace",
          read: true,
          write: false,
          delete: false,
        },
        {
          moduleKey: "audit",
          moduleName: "ANBU Security Audit Logs",
          read: true,
          write: true,
          delete: true,
        },
      ],
    },
  ]);

  const [selectedRoleId, setSelectedRoleId] = useState<string>("ROLE-JONIN");

  const activeSelectedRole =
    roles.find((r) => r.id === selectedRoleId) || roles[0];

  const handleTogglePermission = (
    roleId: string,
    moduleKey: string,
    field: "read" | "write" | "delete",
  ) => {
    setRoles((prevRoles) =>
      prevRoles.map((role) => {
        if (role.id !== roleId) return role;

        const updatedPermissions = role.permissions.map((p) => {
          if (p.moduleKey !== moduleKey) return p;
          return { ...p, [field]: !p[field] };
        });

        return { ...role, permissions: updatedPermissions };
      }),
    );
  };

  // Delete Role Handlers
  const handleOpenDeleteRoleModal = (role: RoleItem) => {
    if (role.isSystemRole) return;
    setRoleToDelete(role);
    setIsDeleteRoleModalOpen(true);
  };

  const handleConfirmDeleteRole = () => {
    if (roleToDelete) {
      const remainingRoles = roles.filter((r) => r.id !== roleToDelete.id);
      setRoles(remainingRoles);
      setIsDeleteRoleModalOpen(false);
      setRoleToDelete(null);
      if (remainingRoles.length > 0) {
        setSelectedRoleId(remainingRoles[0].id);
      }
    }
  };

  const handleConfirmSave = () => {
    setIsSaveModalOpen(false);
    setIsSavedSuccessfully(true);
    setTimeout(() => {
      setIsSavedSuccessfully(false);
    }, 4000);
  };

  const toggleApiKeyVisibility = (id: string) => {
    setShowApiKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="w-full min-h-screen bg-white text-brand-dark p-6 sm:p-8 font-mono space-y-8">
      {/* BREADCRUMB & HEADER */}
      <div className="border-b border-brand-dark/15 pb-6">
        <div className="flex items-center gap-2 text-xs text-brand-dark/60 uppercase mb-2">
          <Link
            href="/admin"
            className="hover:text-orange-500 transition-colors"
          >
            ADMIN DASHBOARD
          </Link>
          <ChevronRight size={14} />
          <span className="text-brand-dark font-bold">
            SYSTEM SETTINGS WORKSPACE
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-heading tracking-wide uppercase flex items-center gap-3">
              <Settings className="text-orange-500" size={32} />
              LEAF GUILD SETTINGS CENTER
            </h1>
            <p className="text-xs text-brand-dark/60 mt-1 uppercase">
              CONFIGURE GENERAL IDENTITY, DISPATCH ZONES, PAYMENTS,
              NOTIFICATIONS & ANBU SECURITY
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="chakra"
              size="sm"
              icon={Save}
              onClick={() => setIsSaveModalOpen(true)}
            >
              SAVE ALL CHANGES
            </Button>
          </div>
        </div>
      </div>

      {/* ALERT TOAST ON SUCCESS */}
      {isSavedSuccessfully && (
        <div className="p-4 border border-emerald-500/30 bg-emerald-500/10 text-emerald-800 text-xs font-bold flex items-center gap-2 uppercase animate-fade-in">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span>
            All configuration modules have been successfully synchronized across
            the Shinobi Network!
          </span>
        </div>
      )}

      {/* SEQUENTIAL STEP TAB NAVIGATION */}
      <div className="border-b border-brand-dark/15 pb-0">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {tabsOrder.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase transition-all whitespace-nowrap border-b-2 -mb-[2px] ${
                  isActive
                    ? "border-orange-500 text-orange-600 bg-orange-500/5"
                    : "border-transparent text-brand-dark/60 hover:text-brand-dark hover:border-brand-dark/30"
                }`}
              >
                <TabIcon size={16} />
                <span>{tab.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: GENERAL VILLAGE STORE IDENTITY */}
      {/* ========================================================================= */}
      {activeTab === "general" && (
        <div className="border border-brand-dark/15 p-6 bg-white space-y-6 animate-fade-in">
          <h2 className="text-sm font-bold uppercase tracking-wider text-brand-dark border-b border-brand-dark/10 pb-3 flex items-center gap-2">
            <Building2 size={16} className="text-orange-600" />
            1. GENERAL VILLAGE STORE IDENTITY & PARAMETERS
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div>
              <label className="block font-bold text-brand-dark mb-1 uppercase">
                Shinobi Market Official Title
              </label>
              <Input
                value={villageStoreName}
                onChange={(e) => setVillageStoreName(e.target.value)}
                className="border border-brand-dark/20 text-brand-dark font-bold text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-brand-dark mb-1 uppercase">
                Hokage Office Contact Email
              </label>
              <Input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="border border-brand-dark/20 text-brand-dark font-bold text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-brand-dark mb-1 uppercase">
                ANBU Hotline Dispatch Phone
              </label>
              <Input
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                className="border border-brand-dark/20 text-brand-dark font-bold text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-brand-dark mb-1 uppercase">
                Default Trading Currency
              </label>
              <select
                value={defaultCurrency}
                onChange={(e) => setDefaultCurrency(e.target.value)}
                className="w-full px-3 py-2 border border-brand-dark/20 font-bold bg-white text-brand-dark focus:outline-none focus:border-orange-500 uppercase text-xs"
              >
                <option value="USD ($)">USD ($) - Global Standard</option>
                <option value="RYO (両)">RYO (両) - Leaf Village Coin</option>
                <option value="VND (₫)">VND (₫) - Vietnam Regional</option>
              </select>
            </div>
          </div>

          <div className="border-t border-brand-dark/10 pt-4">
            <div className="flex items-center justify-between p-4 border border-brand-dark/15 bg-brand-dark/5">
              <div className="space-y-0.5">
                <span className="block font-bold text-xs text-brand-dark uppercase">
                  Village Store Maintenance Mode
                </span>
                <p className="text-[11px] text-brand-dark/60">
                  When enabled, checkout services are suspended for regular
                  Shinobi. Only Hokage Admins can log in.
                </p>
              </div>

              <Input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="w-5 h-5 accent-orange-600 cursor-pointer shadow-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: DISPATCH & SHIPPING ZONES */}
      {/* ========================================================================= */}
      {activeTab === "shipping" && (
        <div className="border border-brand-dark/15 p-6 bg-white space-y-6 animate-fade-in">
          <div className="flex items-center justify-between border-b border-brand-dark/10 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-brand-dark flex items-center gap-2">
              <Truck size={16} className="text-orange-600" />
              2. DISPATCH & SHIPPING CARRIER CONFIGURATION
            </h2>
            <Button
              variant="outline"
              size="sm"
              icon={Plus}
              onClick={() => {
                setShippingMethods([
                  ...shippingMethods,
                  {
                    id: `SHIP-${Date.now()}`,
                    name: "NEW CARRIER DISPATCH",
                    baseFee: 10,
                    freeThreshold: 100,
                    estimatedDelivery: "3-5 Days",
                    enabled: true,
                  },
                ]);
              }}
            >
              ADD METHOD
            </Button>
          </div>

          <div className="space-y-4">
            {shippingMethods.map((method, index) => (
              <div
                key={method.id}
                className="border border-brand-dark/20 p-4 bg-white space-y-3 hover:border-orange-500/50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-dark/10 pb-3">
                  <div className="flex items-center gap-3">
                    <Input
                      type="checkbox"
                      checked={method.enabled}
                      onChange={(e) => {
                        const updated = [...shippingMethods];
                        updated[index].enabled = e.target.checked;
                        setShippingMethods(updated);
                      }}
                      className="w-4 h-4 accent-orange-600 cursor-pointer"
                    />
                    <Input
                      value={method.name}
                      onChange={(e) => {
                        const updated = [...shippingMethods];
                        updated[index].name = e.target.value;
                        setShippingMethods(updated);
                      }}
                      className="border border-brand-dark/20 font-bold text-xs max-w-xs"
                    />
                  </div>

                  <Button
                    variant="danger"
                    size="sm"
                    icon={Trash2}
                    onClick={() => handleOpenDeleteShippingModal(method)}
                  >
                    REMOVE
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-1">
                  <div>
                    <label className="block text-[10px] font-bold text-brand-dark/60 uppercase mb-1">
                      Base Fee ($)
                    </label>
                    <Input
                      type="number"
                      value={method.baseFee}
                      onChange={(e) => {
                        const updated = [...shippingMethods];
                        updated[index].baseFee = Number(e.target.value);
                        setShippingMethods(updated);
                      }}
                      className="border border-brand-dark/20 text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-brand-dark/60 uppercase mb-1">
                      Free Shipping Threshold ($)
                    </label>
                    <Input
                      type="number"
                      value={method.freeThreshold}
                      onChange={(e) => {
                        const updated = [...shippingMethods];
                        updated[index].freeThreshold = Number(e.target.value);
                        setShippingMethods(updated);
                      }}
                      className="border border-brand-dark/20 text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-brand-dark/60 uppercase mb-1">
                      Estimated SLA
                    </label>
                    <Input
                      value={method.estimatedDelivery}
                      onChange={(e) => {
                        const updated = [...shippingMethods];
                        updated[index].estimatedDelivery = e.target.value;
                        setShippingMethods(updated);
                      }}
                      className="border border-brand-dark/20 text-xs font-bold"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PAYMENT GATEWAYS & RYO VAULT */}
      {/* ========================================================================= */}
      {activeTab === "payments" && (
        <div className="border border-brand-dark/15 p-6 bg-white space-y-6 animate-fade-in">
          <h2 className="text-sm font-bold uppercase tracking-wider text-brand-dark border-b border-brand-dark/10 pb-3 flex items-center gap-2">
            <CreditCard size={16} className="text-orange-600" />
            3. PAYMENT GATEWAYS & SHINOBI RYO COIN VAULT
          </h2>

          <div className="p-4 border border-amber-500/30 bg-amber-500/5 space-y-2">
            <span className="block font-bold text-xs text-amber-900 uppercase">
              Shinobi Ryo Coin Global Exchange Rate
            </span>
            <div className="flex items-center gap-3 text-xs">
              <span className="font-bold text-brand-dark">$ 1 USD =</span>
              <Input
                type="number"
                value={ryoExchangeRate}
                onChange={(e) => setRyoExchangeRate(Number(e.target.value))}
                className="w-24 border border-brand-dark/20 font-bold text-xs"
              />
              <span className="font-bold text-orange-600 uppercase">
                RYO COINS
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {paymentGateways.map((gw, index) => (
              <div
                key={gw.id}
                className="border border-brand-dark/20 p-4 bg-white space-y-3 hover:border-orange-500/50 transition-colors"
              >
                <div className="flex items-center justify-between border-b border-brand-dark/10 pb-3">
                  <div className="flex items-center gap-3">
                    <Input
                      type="checkbox"
                      checked={gw.enabled}
                      onChange={(e) => {
                        const updated = [...paymentGateways];
                        updated[index].enabled = e.target.checked;
                        setPaymentGateways(updated);
                      }}
                      className="w-4 h-4 accent-orange-600 cursor-pointer"
                    />
                    <span className="font-bold text-xs text-brand-dark uppercase">
                      {gw.name}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 border uppercase ${
                      gw.enabled
                        ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                        : "bg-slate-50 text-slate-500 border-slate-300"
                    }`}
                  >
                    {gw.enabled ? "ACTIVE" : "DISABLED"}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                  <div>
                    <label className="block text-[10px] font-bold text-brand-dark/60 uppercase mb-1">
                      Gateway Transaction Fee (%)
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      value={gw.feeRate}
                      onChange={(e) => {
                        const updated = [...paymentGateways];
                        updated[index].feeRate = Number(e.target.value);
                        setPaymentGateways(updated);
                      }}
                      className="border border-brand-dark/20 text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-brand-dark/60 uppercase mb-1">
                      Secret API Key / Token
                    </label>
                    <div className="relative">
                      <Input
                        type={showApiKeys[gw.id] ? "text" : "password"}
                        value={gw.apiKey}
                        onChange={(e) => {
                          const updated = [...paymentGateways];
                          updated[index].apiKey = e.target.value;
                          setPaymentGateways(updated);
                        }}
                        className="border border-brand-dark/20 text-xs font-mono pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => toggleApiKeyVisibility(gw.id)}
                        className="absolute right-2 top-2 text-brand-dark/60 hover:text-brand-dark"
                      >
                        {showApiKeys[gw.id] ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: NOTIFICATIONS & ANBU ALERTS */}
      {/* ========================================================================= */}
      {activeTab === "notifications" && (
        <div className="border border-brand-dark/15 p-6 bg-white space-y-6 animate-fade-in">
          <h2 className="text-sm font-bold uppercase tracking-wider text-brand-dark border-b border-brand-dark/10 pb-3 flex items-center gap-2">
            <Bell size={16} className="text-orange-600" />
            4. NOTIFICATIONS & AUTOMATED ANBU ALERT CHANNELS
          </h2>

          <div className="p-4 border border-brand-dark/15 bg-brand-dark/5 space-y-2">
            <span className="block font-bold text-xs text-brand-dark uppercase">
              Telegram ANBU Emergency Bot Integration
            </span>
            <div className="flex items-center gap-2">
              <Input
                value={telegramBotToken}
                onChange={(e) => setTelegramBotToken(e.target.value)}
                className="border border-brand-dark/20 text-xs font-mono"
              />
              <Button variant="outline" size="sm">
                TEST BOT
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-12 text-[11px] font-bold text-brand-dark/60 uppercase border-b border-brand-dark/15 pb-2 px-2">
              <div className="col-span-6">Trigger Event & Description</div>
              <div className="col-span-2 text-center">Scroll Email</div>
              <div className="col-span-2 text-center">Summon SMS</div>
              <div className="col-span-2 text-center">Telegram ANBU</div>
            </div>

            {notificationRules.map((rule, idx) => (
              <div
                key={rule.id}
                className="grid grid-cols-12 items-center p-3 border border-brand-dark/10 hover:border-orange-500/40 text-xs bg-white"
              >
                <div className="col-span-6 pr-2">
                  <span className="block font-bold text-brand-dark uppercase">
                    {rule.event}
                  </span>
                  <span className="text-[10px] text-brand-dark/60">
                    {rule.description}
                  </span>
                </div>

                <div className="col-span-2 flex justify-center">
                  <Input
                    type="checkbox"
                    checked={rule.email}
                    onChange={(e) => {
                      const updated = [...notificationRules];
                      updated[idx].email = e.target.checked;
                      setNotificationRules(updated);
                    }}
                    className="w-4 h-4 accent-orange-600 cursor-pointer"
                  />
                </div>

                <div className="col-span-2 flex justify-center">
                  <Input
                    type="checkbox"
                    checked={rule.sms}
                    onChange={(e) => {
                      const updated = [...notificationRules];
                      updated[idx].sms = e.target.checked;
                      setNotificationRules(updated);
                    }}
                    className="w-4 h-4 accent-orange-600 cursor-pointer"
                  />
                </div>

                <div className="col-span-2 flex justify-center">
                  <Input
                    type="checkbox"
                    checked={rule.telegram}
                    onChange={(e) => {
                      const updated = [...notificationRules];
                      updated[idx].telegram = e.target.checked;
                      setNotificationRules(updated);
                    }}
                    className="w-4 h-4 accent-orange-600 cursor-pointer"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: SECURITY & ROLES */}
      {/* ========================================================================= */}
      {activeTab === "security" && (
        <div className="border border-brand-dark/15 p-6 bg-white space-y-8 animate-fade-in">
          {/* SECTION 1: SYSTEM SECURITY CONFIGURATION */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-brand-dark border-b border-brand-dark/10 pb-3 flex items-center gap-2">
              <ShieldCheck size={16} className="text-orange-600" />
              5.1 SECURITY ENFORCEMENT & ANBU POLICIES
            </h2>

            <div className="space-y-4 text-xs">
              {/* 2FA Toggle */}
              <div className="flex items-center justify-between p-4 border border-brand-dark/15 bg-white">
                <div>
                  <span className="block font-bold text-brand-dark uppercase">
                    Enforce Mandatory 2FA for Hokage & Jonin Admins
                  </span>
                  <span className="text-[10px] text-brand-dark/60">
                    Requires Time-based One-Time Passcode (TOTP) upon admin
                    panel access
                  </span>
                </div>
                <Input
                  type="checkbox"
                  checked={securityConfig.enforce2FA}
                  onChange={(e) =>
                    setSecurityConfig({
                      ...securityConfig,
                      enforce2FA: e.target.checked,
                    })
                  }
                  className="w-5 h-5 accent-orange-600 cursor-pointer"
                />
              </div>

              {/* Session Timeout & Retention */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-brand-dark/15">
                <div>
                  <label className="block font-bold text-brand-dark mb-1 uppercase">
                    Admin Idle Session Timeout (Minutes)
                  </label>
                  <Input
                    type="number"
                    value={securityConfig.sessionTimeoutMinutes}
                    onChange={(e) =>
                      setSecurityConfig({
                        ...securityConfig,
                        sessionTimeoutMinutes: Number(e.target.value),
                      })
                    }
                    className="border border-brand-dark/20 font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-brand-dark mb-1 uppercase">
                    Audit Log Retention Window (Days)
                  </label>
                  <Input
                    type="number"
                    value={securityConfig.auditLogRetentionDays}
                    onChange={(e) =>
                      setSecurityConfig({
                        ...securityConfig,
                        auditLogRetentionDays: Number(e.target.value),
                      })
                    }
                    className="border border-brand-dark/20 font-bold text-xs"
                  />
                </div>
              </div>

              {/* IP Whitelist */}
              <div className="p-4 border border-brand-dark/15 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="block font-bold text-brand-dark uppercase">
                      Restrict Admin Access to Whitelisted IPs Only
                    </span>
                    <span className="text-[10px] text-brand-dark/60">
                      Block all login attempts originating outside designated
                      Shinobi HQ subnets
                    </span>
                  </div>
                  <Input
                    type="checkbox"
                    checked={securityConfig.ipWhitelistEnabled}
                    onChange={(e) =>
                      setSecurityConfig({
                        ...securityConfig,
                        ipWhitelistEnabled: e.target.checked,
                      })
                    }
                    className="w-5 h-5 accent-orange-600 cursor-pointer"
                  />
                </div>

                {securityConfig.ipWhitelistEnabled && (
                  <div>
                    <label className="block text-[10px] font-bold text-brand-dark/60 uppercase mb-1">
                      Allowed IP Addresses (Comma Separated)
                    </label>
                    <Input
                      value={securityConfig.allowedIPs}
                      onChange={(e) =>
                        setSecurityConfig({
                          ...securityConfig,
                          allowedIPs: e.target.value,
                        })
                      }
                      className="border border-brand-dark/20 font-mono text-xs"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 2: ROLE MANAGEMENT & PERMISSIONS MATRIX (RBAC) */}
          <div className="space-y-4 pt-4 border-t border-brand-dark/15">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-dark/10 pb-3">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-brand-dark flex items-center gap-2">
                  <Users size={16} className="text-orange-600" />
                  5.2 SHINOBI ROLES & PERMISSIONS MATRIX (RBAC)
                </h2>
                <p className="text-[11px] text-brand-dark/60 mt-0.5">
                  Select a Shinobi Role to inspect or customize read, write, and
                  deletion privileges across system modules.
                </p>
              </div>

              {/* NEW ROLE BUTTON - CHAKRA EFFECT */}
              <Button
                variant="chakra"
                size="sm"
                icon={Plus}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-md hover:shadow-[0_0_15px_rgba(249,115,22,0.6)] transition-all border-orange-600"
                onClick={() => {
                  const newRoleId = `ROLE-CUSTOM-${Date.now()}`;
                  const newRoleItem: RoleItem = {
                    id: newRoleId,
                    name: "NEW SHINOBI ROLE",
                    description:
                      "Custom role created for specific village duties",
                    usersCount: 0,
                    isSystemRole: false,
                    permissions: [
                      {
                        moduleKey: "orders",
                        moduleName: "Scroll Orders",
                        read: true,
                        write: false,
                        delete: false,
                      },
                      {
                        moduleKey: "products",
                        moduleName: "Ninja Weapons & Catalog",
                        read: true,
                        write: false,
                        delete: false,
                      },
                      {
                        moduleKey: "customers",
                        moduleName: "Shinobi Registry (Users)",
                        read: false,
                        write: false,
                        delete: false,
                      },
                      {
                        moduleKey: "settings",
                        moduleName: "System Settings Workspace",
                        read: false,
                        write: false,
                        delete: false,
                      },
                      {
                        moduleKey: "audit",
                        moduleName: "ANBU Security Audit Logs",
                        read: false,
                        write: false,
                        delete: false,
                      },
                    ],
                  };
                  setRoles([...roles, newRoleItem]);
                  setSelectedRoleId(newRoleId);
                }}
              >
                CREATE NEW ROLE
              </Button>
            </div>

            {/* ROLE CARD TAB SELECTOR */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {roles.map((role) => {
                const isSelected = role.id === selectedRoleId;
                return (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRoleId(role.id)}
                    className={`p-3 border text-left transition-all relative ${
                      isSelected
                        ? "border-orange-500 bg-orange-500/5 shadow-sm"
                        : "border-brand-dark/15 hover:border-brand-dark/40 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-brand-dark uppercase truncate pr-2">
                        {role.name}
                      </span>
                      {role.isSystemRole && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 bg-brand-dark/10 text-brand-dark border border-brand-dark/20 uppercase shrink-0">
                          SYSTEM
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-brand-dark/60 line-clamp-2 h-7">
                      {role.description}
                    </p>
                    <div className="mt-2 text-[10px] font-bold text-orange-600 flex items-center gap-1">
                      <UserCheck size={12} />
                      <span>{role.usersCount} Assigned Members</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* PERMISSIONS MATRIX TABLE FOR SELECTED ROLE */}
            {activeSelectedRole && (
              <div className="border border-brand-dark/20 p-5 bg-white space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-dark/10 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase text-brand-dark">
                        EDITING PERMISSIONS FOR:
                      </span>
                      <Input
                        value={activeSelectedRole.name}
                        disabled={activeSelectedRole.isSystemRole}
                        onChange={(e) => {
                          const updated = roles.map((r) =>
                            r.id === activeSelectedRole.id
                              ? { ...r, name: e.target.value }
                              : r,
                          );
                          setRoles(updated);
                        }}
                        className="border border-brand-dark/20 text-xs font-bold uppercase max-w-xs py-1"
                      />
                    </div>
                    <p className="text-[11px] text-brand-dark/60 mt-1">
                      {activeSelectedRole.description}
                    </p>
                  </div>

                  {/* DELETE ROLE BUTTON */}
                  {!activeSelectedRole.isSystemRole && (
                    <Button
                      variant="danger"
                      size="sm"
                      icon={Trash2}
                      onClick={() =>
                        handleOpenDeleteRoleModal(activeSelectedRole)
                      }
                    >
                      DELETE ROLE
                    </Button>
                  )}
                </div>

                {/* MATRIX TABLE */}
                <div className="space-y-2">
                  <div className="grid grid-cols-12 text-[11px] font-bold text-brand-dark/60 uppercase border-b border-brand-dark/15 pb-2 px-2">
                    <div className="col-span-6">System Module</div>
                    <div className="col-span-2 text-center">Read Access</div>
                    <div className="col-span-2 text-center">Write/Edit</div>
                    <div className="col-span-2 text-center">Delete Access</div>
                  </div>

                  {activeSelectedRole.permissions.map((perm) => (
                    <div
                      key={perm.moduleKey}
                      className="grid grid-cols-12 items-center p-3 border border-brand-dark/10 hover:border-orange-500/30 text-xs bg-white"
                    >
                      <div className="col-span-6 font-bold text-brand-dark uppercase">
                        {perm.moduleName}
                      </div>

                      <div className="col-span-2 flex justify-center">
                        <Input
                          type="checkbox"
                          checked={perm.read}
                          disabled={
                            activeSelectedRole.isSystemRole &&
                            activeSelectedRole.id === "ROLE-HOKAGE"
                          }
                          onChange={() =>
                            handleTogglePermission(
                              activeSelectedRole.id,
                              perm.moduleKey,
                              "read",
                            )
                          }
                          className="w-4 h-4 accent-orange-600 cursor-pointer disabled:opacity-50"
                        />
                      </div>

                      <div className="col-span-2 flex justify-center">
                        <Input
                          type="checkbox"
                          checked={perm.write}
                          disabled={
                            activeSelectedRole.isSystemRole &&
                            activeSelectedRole.id === "ROLE-HOKAGE"
                          }
                          onChange={() =>
                            handleTogglePermission(
                              activeSelectedRole.id,
                              perm.moduleKey,
                              "write",
                            )
                          }
                          className="w-4 h-4 accent-orange-600 cursor-pointer disabled:opacity-50"
                        />
                      </div>

                      <div className="col-span-2 flex justify-center">
                        <Input
                          type="checkbox"
                          checked={perm.delete}
                          disabled={
                            activeSelectedRole.isSystemRole &&
                            activeSelectedRole.id === "ROLE-HOKAGE"
                          }
                          onChange={() =>
                            handleTogglePermission(
                              activeSelectedRole.id,
                              perm.moduleKey,
                              "delete",
                            )
                          }
                          className="w-4 h-4 accent-orange-600 cursor-pointer disabled:opacity-50"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FOOTER WIZARD STEPPERS (PREV / NEXT STEP / SAVE) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-brand-dark/15">
        <Button
          variant="outline"
          size="sm"
          icon={ChevronLeft}
          onClick={handlePrevTab}
          disabled={currentTabIndex === 0}
        >
          PREVIOUS CONFIG
        </Button>

        <div className="text-xs font-bold text-brand-dark/60 uppercase">
          STEP {currentTabIndex + 1} OF {tabsOrder.length}:{" "}
          <span className="text-orange-600">
            {tabsOrder[currentTabIndex].title}
          </span>
        </div>

        {currentTabIndex < tabsOrder.length - 1 ? (
          <Button variant="chakra" size="sm" onClick={handleNextTab}>
            PROCEED TO NEXT CONFIG →
          </Button>
        ) : (
          <Button
            variant="chakra"
            size="sm"
            icon={Save}
            onClick={() => setIsSaveModalOpen(true)}
          >
            FINISH & SAVE ALL
          </Button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: CONFIRM DELETE SHIPPING CARRIER */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="CONFIRM DISPATCH CARRIER DELETION"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs font-mono">
          <div className="p-3 border border-rose-500/30 bg-rose-500/10 text-rose-700 flex items-start gap-3">
            <AlertTriangle size={20} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-bold uppercase text-xs mb-1">
                Warning: Destructive Action
              </p>
              <p className="text-[11px]">
                Are you sure you want to remove the shipping method{" "}
                <span className="font-extrabold underline">
                  {shippingToDelete?.name}
                </span>
                ? This action cannot be undone and will affect checkout options
                for active orders.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-brand-dark/15">
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
              icon={Trash2}
              onClick={handleConfirmDeleteShipping}
            >
              CONFIRM DELETE
            </Button>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 2: CONFIRM DELETE ROLE */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isDeleteRoleModalOpen}
        onClose={() => setIsDeleteRoleModalOpen(false)}
        title="CONFIRM SHINOBI ROLE DELETION"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs font-mono">
          <div className="p-3 border border-rose-500/30 bg-rose-500/10 text-rose-700 flex items-start gap-3">
            <AlertTriangle size={20} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-bold uppercase text-xs mb-1">
                Warning: Destructive Action
              </p>
              <p className="text-[11px] leading-relaxed">
                Are you sure you want to remove the role{" "}
                <span className="font-extrabold underline">
                  {roleToDelete?.name}
                </span>
                ? All Admin accounts assigned to this role will lose their
                corresponding access privileges. This action cannot be undone!
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-brand-dark/15">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteRoleModalOpen(false)}
            >
              CANCEL
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon={Trash2}
              onClick={handleConfirmDeleteRole}
            >
              CONFIRM DELETE
            </Button>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 3: CONFIRM SAVE ALL SETTINGS */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        title="CONFIRM SYSTEM SETTINGS SYNCHRONIZATION"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs font-mono">
          <p className="text-brand-dark font-bold">
            Are you sure you want to apply and synchronize all global
            configurations (Shipping, Payments, Notifications, and
            Security/Roles) across the Shinobi Network?
          </p>

          {maintenanceMode && (
            <div className="p-3 border border-amber-500/30 bg-amber-500/10 text-amber-900 flex items-start gap-2">
              <AlertTriangle
                size={16}
                className="shrink-0 text-amber-600 mt-0.5"
              />
              <span>
                WARNING: Store Maintenance Mode is currently CHECKED. Non-admin
                users will be blocked from accessing checkout!
              </span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-brand-dark/15">
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
              icon={Save}
              onClick={handleConfirmSave}
            >
              APPLY ALL SETTINGS
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
