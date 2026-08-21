"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { api } from "@/lib/api";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckSquare,
  Square,
  ShieldCheck,
  UserPlus,
  AlertCircle,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name] || errors.apiError) {
      setErrors((prev) => ({ ...prev, [name]: "", apiError: "" }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = "FULL NAME IS REQUIRED";
    if (!formData.email.trim()) {
      newErrors.email = "EMAIL ADDRESS IS REQUIRED";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "INVALID EMAIL ADDRESS";
    }

    if (!formData.password) {
      newErrors.password = "PASSWORD IS REQUIRED";
    } else if (formData.password.length < 6) {
      newErrors.password = "PASSWORD MUST BE AT LEAST 6 CHARACTERS";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "PASSWORDS DO NOT MATCH";
    }

    if (!formData.agreeTerms) {
      newErrors.terms = "YOU MUST AGREE TO THE SHINOBI CODE OF CONDUCT";
      toast.error("PLEASE ACCEPT THE SHINOBI CODE OF CONDUCT TO PROCEED");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============================================================
  // INTEGRATED NESTJS BACKEND API REGISTER HANDLER
  // ============================================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      // Send correct NestJS DTO payload
      const response = await api.post("/auth/register", {
        name: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      const data = response.data;

      if (data?.accessToken || data?.token) {
        const token = data.accessToken || data.token;
        localStorage.setItem("accessToken", token);
        document.cookie = `accessToken=${token}; path=/; max-age=604800`;
      }

      toast.success("INITIATION SUCCESSFUL! WELCOME TO THE CLAN.");

      setTimeout(() => {
        router.push("/login");
      }, 1000);
    } catch (error: any) {
      console.error("Register Error:", error);

      const responseMessage = error?.response?.data?.message;
      let errorMessage = "REGISTRATION FAILED. PLEASE TRY AGAIN.";

      if (Array.isArray(responseMessage)) {
        errorMessage = responseMessage.join(" | ");
      } else if (typeof responseMessage === "string") {
        errorMessage = responseMessage;
      }

      setErrors((prev) => ({ ...prev, apiError: errorMessage.toUpperCase() }));
      toast.error(errorMessage.toUpperCase());
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-brand-dark flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-mono">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: "monospace",
            fontSize: "12px",
            borderRadius: "0px",
            border: "1px solid #000",
            padding: "12px 16px",
          },
        }}
      />

      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-6">
        {/* TOP NAVIGATION LINK */}
        <div className="flex justify-between items-center">
          <Link href="/">
            <Button variant="ghost" size="sm" icon={ArrowLeft}>
              BACK TO HOME
            </Button>
          </Link>
        </div>

        {/* HEADER */}
        <div className="text-center space-y-2 border-b border-brand-dark/15 pb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-500/10 border border-orange-500/30 text-orange-500 mb-2">
            <UserPlus size={24} />
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl tracking-wider uppercase text-brand-dark">
            JOIN THE CLAN
          </h1>
          <p className="text-xs text-brand-dark/60 uppercase">
            CREATE YOUR SHINOBI INITIATE ACCOUNT
          </p>
        </div>

        {/* REGISTER FORM CARD */}
        <div className="border border-brand-dark/15 p-6 sm:p-8 bg-white shadow-xs space-y-6">
          {/* API ERROR BANNER */}
          {errors.apiError && (
            <div className="border border-rose-600/30 bg-rose-600/5 p-3 flex items-start gap-2.5 text-rose-600 text-xs font-bold">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{errors.apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* FULL NAME */}
            <div>
              <Input
                label="FULL NAME *"
                name="fullName"
                type="text"
                placeholder="EX: ITACHI UCHIHA"
                icon={User}
                value={formData.fullName}
                onChange={handleChange}
                error={errors.fullName}
              />
            </div>

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
              />
            </div>

            {/* PASSWORD */}
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
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-brand-dark/50 hover:text-brand-dark cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="relative">
              <Input
                label="CONFIRM PASSCODE *"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                icon={Lock}
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-9 text-brand-dark/50 hover:text-brand-dark cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* TERMS CHECKBOX */}
            <div className="space-y-1 pt-2">
              <label
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    agreeTerms: !prev.agreeTerms,
                  }))
                }
                className="flex items-start gap-2.5 cursor-pointer text-xs text-brand-dark/80"
              >
                <span className="mt-0.5 text-orange-500 shrink-0">
                  {formData.agreeTerms ? (
                    <CheckSquare size={16} />
                  ) : (
                    <Square size={16} />
                  )}
                </span>
                <span>
                  I AGREE TO THE{" "}
                  <a href="#" className="underline text-orange-600 font-bold">
                    SHINOBI CODE OF CONDUCT
                  </a>{" "}
                  AND PRIVACY POLICY.
                </span>
              </label>
              {errors.terms && (
                <p className="text-[11px] text-rose-600 font-bold uppercase">
                  {errors.terms}
                </p>
              )}
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-4">
              <Button
                type="submit"
                variant="chakra"
                size="lg"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? "INITIATING ACCOUNT..." : "CREATE ACCOUNT"}
              </Button>
            </div>
          </form>

          {/* DIVIDER */}
          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-brand-dark/15 w-full"></div>
            <span className="bg-white px-3 text-[10px] text-brand-dark/40 font-bold uppercase absolute">
              OR
            </span>
          </div>

          {/* ALREADY HAVE AN ACCOUNT LINK */}
          <div className="text-center text-xs space-y-2">
            <p className="text-brand-dark/60 uppercase">
              ALREADY REGISTERED IN THE SCROLL?
            </p>
            <Link href="/login" className="block">
              <Button variant="outline" size="md" className="w-full">
                LOG IN TO EXISTING ACCOUNT
              </Button>
            </Link>
          </div>
        </div>

        {/* FOOTER NOTICE */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-brand-dark/50 uppercase">
          <ShieldCheck size={14} className="text-orange-500" />
          <span>SECURED BY ANBU PROTOCOL ENCRYPTION</span>
        </div>
      </div>
    </div>
  );
}
