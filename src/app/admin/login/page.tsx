"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ShieldAlert,
  Eye,
  EyeOff,
  Lock,
  ArrowRight,
  Mail,
  CheckCircle2,
} from "lucide-react";

// Import UI Components
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";

// API + Admin Zustand Store
import { api } from "@/lib/api";
import { useAdminAuthStore } from "@/store/useAuthStore";

function AdminLoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";

  const setAuth = useAdminAuthStore((state) => state.setAuth);

  // Controls UI & Modal
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  // Messages
  const [errorMessage, setErrorMessage] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");

  // Form States
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  const [resetEmail, setResetEmail] = useState("");

  // ============================================================
  // ADMIN LOGIN
  // ============================================================

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrorMessage("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", {
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password,
      });

      const user = res.data?.user || res.data;

      if (!user) {
        setErrorMessage("NO USER INFORMATION RETURNED FROM SERVER");
        return;
      }

      // Kiểm tra vai trò Admin
      const userRole = String(user.role || "").toUpperCase();

      if (userRole !== "ADMIN") {
        setErrorMessage(
          "ACCESS DENIED: ACCOUNT DOES NOT HAVE ADMIN PRIVILEGES",
        );

        try {
          await api.post("/auth/logout");
        } catch {}
        return;
      }

      setAuth(user);

      window.location.href = callbackUrl;
    } catch (error: any) {
      console.error("Login error detail:", error);

      let displayMsg = "AUTHENTICATION FAILED: INVALID CREDENTIALS";

      if (error.response) {
        const status = error.response.status;
        const serverMsg = error.response.data?.message;

        if (status === 401) {
          displayMsg = "INVALID EMAIL OR PASSCODE. ACCESS DENIED.";
        } else if (serverMsg) {
          displayMsg = Array.isArray(serverMsg)
            ? serverMsg.join(" | ")
            : String(serverMsg);
        } else if (status === 403) {
          displayMsg = "FORBIDDEN: YOU DO NOT HAVE ACCESS TO HQ.";
        } else if (status === 500) {
          displayMsg = "SERVER ERROR. PLEASE TRY AGAIN LATER.";
        }
      } else if (error.request) {
        displayMsg = "CANNOT CONNECT TO HQ SERVER. CHECK NETWORK.";
      }

      setErrorMessage(displayMsg.toUpperCase());
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // FORGOT PASSWORD
  // ============================================================

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setForgotError("");
    setForgotSuccess("");
    setForgotLoading(true);

    try {
      await api.post("/auth/forgot-password", {
        email: resetEmail.trim().toLowerCase(),
      });

      setForgotSuccess(`RECOVERY LINK SENT TO ${resetEmail.toUpperCase()}`);
      setResetEmail("");
    } catch (error: any) {
      const serverError =
        error.response?.data?.message ||
        "FAILED TO TRANSMIT EMAIL. CONTACT HQ.";

      setForgotError(
        Array.isArray(serverError)
          ? serverError.join(" | ").toUpperCase()
          : String(serverError).toUpperCase(),
      );
    } finally {
      setForgotLoading(false);
    }
  };

  const handleCloseForgotModal = () => {
    setIsForgotModalOpen(false);
    setForgotError("");
    setForgotSuccess("");
    setResetEmail("");
  };

  return (
    <div className="fixed inset-0 z-50 bg-brand-ivory text-brand-dark font-mono flex flex-col justify-between p-4 sm:p-6 overflow-y-auto">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-brand-dark/15 pb-4 max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-3 h-3 bg-orange-500 group-hover:scale-125 transition-transform" />
          <span className="font-bold tracking-widest text-sm text-brand-dark uppercase">
            SHINOBI GOODS HQ
          </span>
        </Link>

        <span className="text-[10px] tracking-widest text-orange-600 font-bold bg-orange-500/10 border border-orange-500/30 px-2.5 py-1 uppercase">
          RESTRICTED AREA • LEVEL 5
        </span>
      </div>

      {/* Main Login Card */}
      <main className="relative z-10 my-auto py-12 flex items-center justify-center">
        <div className="w-full max-w-md bg-white text-brand-dark p-6 sm:p-8 border-2 border-brand-dark shadow-[8px_8px_0px_0px_rgba(234,88,12,1)] space-y-6">
          <div className="space-y-2 text-center border-b border-brand-dark/15 pb-6">
            <div className="w-12 h-12 bg-orange-500 text-white flex items-center justify-center mx-auto border border-brand-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Lock size={22} />
            </div>

            <h1 className="text-2xl font-bold uppercase tracking-wider text-brand-dark">
              HQ ACCESS CONTROL
            </h1>

            <p className="text-[11px] text-brand-dark/60 uppercase tracking-widest">
              ENTER COMMANDER EMAIL TO ENTER DASHBOARD
            </p>
          </div>

          {/* HIỂN THỊ LỖI THÔNG BÁO */}
          {errorMessage && (
            <div className="bg-red-500/10 border-2 border-red-600 text-red-600 p-3 text-xs font-bold uppercase flex items-center gap-2">
              <ShieldAlert size={18} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <Input
              label="ADMIN EMAIL ADDRESS *"
              required
              type="email"
              placeholder="e.g. admin@shinobi.com"
              icon={Mail}
              value={credentials.email}
              onChange={(e) =>
                setCredentials({
                  ...credentials,
                  email: e.target.value,
                })
              }
            />

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block mb-2 font-bold text-brand-dark uppercase tracking-wider text-xs">
                  SECRET PASSCODE *
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(credentials.email);
                    setIsForgotModalOpen(true);
                  }}
                  className="text-[10px] font-bold text-orange-600 hover:underline uppercase cursor-pointer mb-2"
                >
                  FORGOT PASSCODE?
                </button>
              </div>

              <div className="relative">
                <Input
                  required
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  icon={Lock}
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({
                      ...credentials,
                      password: e.target.value,
                    })
                  }
                  className="pr-10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-dark/50 hover:text-brand-dark transition-colors cursor-pointer z-10"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="chakra"
              size="lg"
              disabled={loading}
              icon={ArrowRight}
              className="w-full mt-2 border border-brand-dark shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
            >
              {loading ? "VERIFYING..." : "AUTHENTICATE & ENTER"}
            </Button>
          </form>

          <div className="pt-4 border-t border-brand-dark/15 text-center text-[10px] text-brand-dark/50 uppercase tracking-widest">
            UNAUTHORIZED ACCESS IS MONITORED BY HQ
          </div>
        </div>
      </main>

      {/* MODAL KHÔI PHỤC MẬT KHẨU */}
      <Modal
        isOpen={isForgotModalOpen}
        onClose={handleCloseForgotModal}
        title="PASSCODE RECOVERY"
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-brand-dark/70 uppercase tracking-wider">
            Enter your registered admin email address below. HQ will dispatch a
            recovery link to your inbox.
          </p>

          {forgotError && (
            <div className="bg-red-500/10 border border-red-600 text-red-600 p-3 text-xs font-bold uppercase flex items-center gap-2">
              <ShieldAlert size={16} className="shrink-0" />
              <span>{forgotError}</span>
            </div>
          )}

          {forgotSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-600 text-emerald-800 p-3 text-xs font-bold uppercase flex items-center gap-2">
              <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
              <span>{forgotSuccess}</span>
            </div>
          )}

          <form onSubmit={handleForgotSubmit} className="space-y-4 pt-2">
            <Input
              label="REGISTERED EMAIL *"
              required
              type="email"
              placeholder="admin@shinobi.com"
              icon={Mail}
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
            />

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-brand-dark/10">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={handleCloseForgotModal}
              >
                CANCEL
              </Button>

              <Button
                type="submit"
                variant="chakra"
                size="md"
                disabled={forgotLoading}
                icon={Mail}
              >
                {forgotLoading ? "SENDING..." : "SEND RECOVERY EMAIL"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      <div className="relative z-10 text-center text-[10px] text-brand-dark/50 uppercase tracking-widest py-2">
        © 2026 SHINOBI GOODS HQ TERMINAL • ALL RIGHTS RESERVED
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-ivory" />}>
      <AdminLoginForm />
    </Suspense>
  );
}
