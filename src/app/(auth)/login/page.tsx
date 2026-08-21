"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  ShieldCheck,
  KeyRound,
  Send,
  X,
  CheckCircle2,
} from "lucide-react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/useAuthStore";

export default function LoginPage() {
  const router = useRouter();

  // ============================================================
  // CUSTOMER AUTH
  // ============================================================

  const setAuth = useAuthStore((state) => state.setAuth);

  // ============================================================
  // LOGIN FORM
  // ============================================================

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ============================================================
  // FORGOT PASSWORD
  // ============================================================

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [isSendingForgot, setIsSendingForgot] = useState(false);
  const [forgotSuccessNotice, setForgotSuccessNotice] = useState("");

  // ============================================================
  // HANDLE INPUT
  // ============================================================

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // ============================================================
  // VALIDATION
  // ============================================================

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = "SCROLL MAIL IS REQUIRED";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "INVALID EMAIL ADDRESS FORMAT";
    }

    if (!formData.password) {
      newErrors.password = "SECRET PASSCODE IS REQUIRED";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // ============================================================
  // CUSTOMER LOGIN
  // ============================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setIsSubmitting(true);

      // --------------------------------------------------------
      // CALL BACKEND
      // --------------------------------------------------------

      const response = await api.post("/auth/login", {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      console.log("LOGIN RESPONSE:", response.data);

      const user = response.data?.user;

      if (!user) {
        toast.error("SERVER DISPATCH ERROR: INVALID USER DATA RECEIVED.");
        return;
      }

      // --------------------------------------------------------
      // PREVENT ADMIN LOGIN THROUGH CUSTOMER LOGIN
      // --------------------------------------------------------

      const userRole = String(user.role || "").toUpperCase();

      if (userRole === "ADMIN") {
        toast.error("ADMIN ACCOUNT DETECTED. PLEASE USE THE ADMIN LOGIN PAGE.");

        // Backend should clear the authentication cookie
        // when this logout endpoint is called.
        try {
          await api.post("/auth/logout");
        } catch (logoutError) {
          console.error("Logout admin session error:", logoutError);
        }

        return;
      }

      // --------------------------------------------------------
      // SAVE USER TO ZUSTAND
      // --------------------------------------------------------

      setAuth(user);

      // --------------------------------------------------------
      // SUCCESS
      // --------------------------------------------------------

      toast.success("AUTHENTICATION SUCCESSFUL! WELCOME BACK.");

      // Give Zustand a moment to persist the user state,
      // then navigate to homepage.
      setTimeout(() => {
        router.push("/");
      }, 500);
    } catch (error: any) {
      console.error("Login Error:", error);

      const status = error?.response?.status;

      // ========================================================
      // WRONG EMAIL / PASSWORD
      // ========================================================

      if (status === 400 || status === 401) {
        setErrors({
          email: "PLEASE CHECK YOUR EMAIL",
          password: "PLEASE CHECK YOUR PASSCODE",
        });

        toast.error("INCORRECT SCROLL MAIL OR PASSCODE. PLEASE TRY AGAIN.");

        return;
      }

      // ========================================================
      // OTHER SERVER / NETWORK ERROR
      // ========================================================

      const serverMessage = error?.response?.data?.message;

      if (serverMessage) {
        const message = Array.isArray(serverMessage)
          ? serverMessage.join(" | ")
          : serverMessage;

        toast.error(String(message).toUpperCase());
      } else {
        toast.error("NETWORK OR SERVER ERROR. PLEASE TRY AGAIN LATER.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================
  // FORGOT PASSWORD
  // ============================================================

  const handleSendResetLink = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!forgotEmail.trim() || !/\S+@\S+\.\S+/.test(forgotEmail)) {
      setForgotError("PLEASE ENTER A VALID SCROLL MAIL");
      return;
    }

    setForgotError("");
    setIsSendingForgot(true);

    try {
      await api.post("/auth/forgot-password", {
        email: forgotEmail.trim().toLowerCase(),
      });

      setForgotSuccessNotice(
        `RECOVERY LINK SENT TO ${forgotEmail.toUpperCase()}`,
      );

      toast.success("RECOVERY INSTRUCTIONS SENT TO YOUR MAIL");
    } catch (error: any) {
      console.error("Forgot Password Error:", error);

      const serverMessage =
        error?.response?.data?.message ||
        "FAILED TO SEND RECOVERY LINK. USER MAY NOT EXIST.";

      const errorText = Array.isArray(serverMessage)
        ? serverMessage.join(" | ")
        : serverMessage;

      setForgotError(String(errorText).toUpperCase());
    } finally {
      setIsSendingForgot(false);
    }
  };

  // ============================================================
  // OPEN FORGOT PASSWORD MODAL
  // ============================================================

  const handleOpenForgotModal = () => {
    setForgotEmail(formData.email);
    setForgotError("");
    setForgotSuccessNotice("");
    setShowForgotModal(true);
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-white text-brand-dark flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-mono relative">
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-6">
        {/* ======================================================
            BACK TO HOME
        ====================================================== */}

        <div className="flex justify-between items-center">
          <Link href="/">
            <Button variant="ghost" size="sm" icon={ArrowLeft}>
              BACK TO HOME
            </Button>
          </Link>
        </div>

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="text-center space-y-2 border-b border-brand-dark/15 pb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-500/10 border border-orange-500/30 text-orange-500 mb-2">
            <KeyRound size={24} />
          </div>

          <h1 className="font-heading text-3xl sm:text-4xl tracking-wider uppercase text-brand-dark">
            AUTHENTICATE
          </h1>

          <p className="text-xs text-brand-dark/60 uppercase">
            ENTER YOUR SHINOBI CREDENTIALS
          </p>
        </div>

        {/* ======================================================
            LOGIN CARD
        ====================================================== */}

        <div className="border border-brand-dark/15 p-6 sm:p-8 bg-white shadow-xs space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* EMAIL */}

            <div>
              <Input
                label="SCROLL MAIL (EMAIL) *"
                name="email"
                type="email"
                placeholder="NINJA@LEAFVILLAGE.COM"
                icon={Mail}
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                disabled={isSubmitting}
              />
            </div>

            {/* PASSWORD */}

            <div className="relative space-y-1">
              <div className="relative">
                <Input
                  label="SECRET PASSCODE *"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  icon={Lock}
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  disabled={isSubmitting}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={isSubmitting}
                  className="absolute right-3 top-9 text-brand-dark/50 hover:text-brand-dark cursor-pointer disabled:opacity-50"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* FORGOT PASSWORD */}

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleOpenForgotModal}
                  disabled={isSubmitting}
                  className="text-[11px] text-orange-600 hover:underline font-bold uppercase cursor-pointer disabled:opacity-50"
                >
                  FORGOT PASSCODE?
                </button>
              </div>
            </div>

            {/* SUBMIT */}

            <div className="pt-2">
              <Button
                type="submit"
                variant="chakra"
                size="lg"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? "AUTHENTICATING..." : "ACCESS ACCOUNTS"}
              </Button>
            </div>
          </form>

          {/* ====================================================
              DIVIDER
          ==================================================== */}

          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-brand-dark/15 w-full" />

            <span className="bg-white px-3 text-[10px] text-brand-dark/40 font-bold uppercase absolute">
              OR
            </span>
          </div>

          {/* ====================================================
              REGISTER
          ==================================================== */}

          <div className="text-center text-xs space-y-2">
            <p className="text-brand-dark/60 uppercase">NEW TO THE VILLAGE?</p>

            <Link href="/register" className="block">
              <Button variant="outline" size="md" className="w-full">
                JOIN THE CLAN
              </Button>
            </Link>
          </div>
        </div>

        {/* ======================================================
            SECURITY NOTICE
        ====================================================== */}

        <div className="flex items-center justify-center gap-2 text-[11px] text-brand-dark/50 uppercase">
          <ShieldCheck size={14} className="text-orange-500" />

          <span>SECURED BY ANBU PROTOCOL ENCRYPTION</span>
        </div>
      </div>

      {/* ========================================================
          FORGOT PASSWORD MODAL
      ======================================================== */}

      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white border-2 border-brand-dark p-6 max-w-md w-full space-y-5 shadow-2xl font-mono relative">
            {/* CLOSE */}

            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="absolute right-4 top-4 text-brand-dark/50 hover:text-brand-dark p-1 cursor-pointer"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            {/* MODAL HEADER */}

            <div className="flex items-center gap-3 border-b border-brand-dark/15 pb-3">
              <div className="p-2 bg-orange-500/10 text-orange-600 border border-orange-500/30">
                <KeyRound size={20} />
              </div>

              <div>
                <h3 className="font-heading text-lg tracking-wider uppercase text-brand-dark">
                  RESET PASSCODE
                </h3>

                <p className="text-[10px] text-brand-dark/60 uppercase">
                  RECOVERY SCROLL DISPATCH
                </p>
              </div>
            </div>

            {/* ==================================================
                SUCCESS
            ================================================== */}

            {forgotSuccessNotice ? (
              <div className="space-y-4 py-2">
                <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 text-xs p-3 font-bold uppercase flex items-center gap-2">
                  <CheckCircle2 size={16} className="shrink-0" />

                  <span>{forgotSuccessNotice}</span>
                </div>

                <p className="text-xs text-brand-dark/70 font-sans leading-relaxed">
                  Please check your scroll mail inbox for the passcode reset
                  instructions.
                </p>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setShowForgotModal(false)}
                >
                  RETURN TO LOGIN
                </Button>
              </div>
            ) : (
              /* ==================================================
                 RESET FORM
              ================================================== */

              <form onSubmit={handleSendResetLink} className="space-y-4">
                <p className="text-xs text-brand-dark/80 leading-relaxed uppercase">
                  ENTER YOUR REGISTERED SCROLL MAIL BELOW. WE WILL SEND YOU A
                  SECURE RESET LINK.
                </p>

                <Input
                  label="REGISTERED EMAIL *"
                  type="email"
                  placeholder="NINJA@LEAFVILLAGE.COM"
                  icon={Mail}
                  value={forgotEmail}
                  onChange={(e) => {
                    setForgotEmail(e.target.value);

                    if (forgotError) {
                      setForgotError("");
                    }
                  }}
                  error={forgotError}
                  disabled={isSendingForgot}
                />

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowForgotModal(false)}
                    disabled={isSendingForgot}
                  >
                    CANCEL
                  </Button>

                  <Button
                    type="submit"
                    variant="chakra"
                    size="sm"
                    icon={Send}
                    disabled={isSendingForgot}
                  >
                    {isSendingForgot ? "SENDING..." : "SEND RECOVERY LINK"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
