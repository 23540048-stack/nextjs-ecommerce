"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import {
  CheckCircle2,
  Package,
  Home,
  Copy,
  Check,
  ShieldCheck,
  Building2,
  Calendar,
} from "lucide-react";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const [copied, setCopied] = useState(false);

  // Extract query parameters returned by VNPay
  const orderId =
    searchParams.get("vnp_TxnRef") ||
    searchParams.get("orderId") ||
    "MS-2026-9981X";
  const rawAmount = searchParams.get("vnp_Amount");
  const transactionNo = searchParams.get("vnp_TransactionNo") || "14892019";
  const bankCode = searchParams.get("vnp_BankCode") || "VNPAYQR / NCB";
  const payDateRaw = searchParams.get("vnp_PayDate");

  // Format amount (VNPay returns amount x100)
  const amountFormatted = rawAmount
    ? (parseInt(rawAmount, 10) / 100).toLocaleString("en-US", {
        style: "currency",
        currency: "VND",
      })
    : "$120.00";

  // Format payment date (yyyyMMddHHmmss -> DD/MM/YYYY HH:mm:ss)
  const formatDate = (dateStr: string | null) => {
    if (!dateStr || dateStr.length !== 14) return "Just now";
    const y = dateStr.substring(0, 4);
    const m = dateStr.substring(4, 6);
    const d = dateStr.substring(6, 8);
    const hh = dateStr.substring(8, 10);
    const mm = dateStr.substring(10, 12);
    const ss = dateStr.substring(12, 14);
    return `${d}/${m}/${y} ${hh}:${mm}:${ss}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-brand-ivory/30 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-mono text-brand-dark relative overflow-hidden">
      {/* MANGA DIAGONAL LINES BACKGROUND */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] bg-size-[16px_16px] pointer-events-none" />

      <div className="max-w-2xl w-full space-y-8 text-center relative z-10">
        {/* GRAPHIC SUCCESS BADGE */}
        <div className="relative inline-block">
          <span className="absolute -top-4 -right-8 z-20 bg-emerald-600 text-white text-[11px] font-heading font-bold px-3 py-1 tracking-widest uppercase rotate-12 shadow-md border border-black animate-bounce">
            *MISSION ACCOMPLISHED!*
          </span>

          <div className="bg-white border-2 border-brand-dark p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group">
            <div className="flex items-center justify-center text-emerald-600">
              <div className="p-4 bg-emerald-500/10 border-2 border-dashed border-emerald-500 rounded-none">
                <CheckCircle2 size={64} />
              </div>
            </div>

            <span className="text-[10px] tracking-[0.3em] font-bold text-emerald-600 uppercase block mt-4">
              VNPAY CHAKRA SEAL APPROVED
            </span>
          </div>
        </div>

        {/* TITLE & DESCRIPTION */}
        <div className="space-y-3">
          <h1 className="font-heading text-2xl sm:text-3xl tracking-wider uppercase text-brand-dark">
            CONTRACT SEALED & DEPLOYED!
          </h1>
          <p className="text-xs text-brand-dark/70 font-sans max-w-md mx-auto leading-relaxed">
            Your payment scroll via VNPay has been verified successfully. Leaf
            Village courier ninjas are now packing your gear for immediate
            dispatch.
          </p>
        </div>

        {/* VNPAY TRANSACTION DETAILS */}
        <div className="bg-white border border-brand-dark/20 p-6 text-left space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-brand-dark/15 gap-2">
            <div>
              <span className="text-[10px] text-brand-dark/50 uppercase block font-bold">
                MISSION CODE (ORDER REF ID)
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-heading text-lg tracking-wider text-brand-dark">
                  #{orderId}
                </span>
                <button
                  onClick={handleCopy}
                  className="p-1 text-brand-dark/50 hover:text-orange-600 transition-colors cursor-pointer"
                  title="Copy Order ID"
                >
                  {copied ? (
                    <Check size={16} className="text-emerald-600" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>
            </div>

            <div className="sm:text-right">
              <span className="text-[10px] text-brand-dark/50 uppercase block font-bold">
                TOTAL AMOUNT SEALED
              </span>
              <span className="font-heading text-xl text-orange-600">
                {amountFormatted}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-brand-dark/50 uppercase font-bold block">
                VNPAY TRANSACTION NO
              </span>
              <p className="font-mono text-brand-dark font-bold">
                #{transactionNo}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono text-brand-dark/50 uppercase font-bold flex items-center gap-1">
                <Building2 size={12} /> BANK / GATEWAY
              </span>
              <p className="font-mono text-brand-dark font-bold uppercase">
                {bankCode}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono text-brand-dark/50 uppercase font-bold flex items-center gap-1">
                <Calendar size={12} /> SEAL TIMESTAMP
              </span>
              <p className="font-mono text-brand-dark font-bold">
                {formatDate(payDateRaw)}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono text-brand-dark/50 uppercase font-bold block">
                PAYMENT STATUS
              </span>
              <span className="inline-flex items-center gap-1 font-mono font-bold text-emerald-600 uppercase">
                <ShieldCheck size={14} /> VERIFIED & SEALED
              </span>
            </div>
          </div>
        </div>

        {/* NAVIGATION BUTTONS */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/orders" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="md"
              icon={Package}
              className="w-full justify-center"
            >
              TRACK MISSION STATUS
            </Button>
          </Link>

          <Link href="/" className="w-full sm:w-auto">
            <Button
              variant="chakra"
              size="md"
              icon={Home}
              className="w-full justify-center"
            >
              RETURN TO LEAF VILLAGE
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-brand-ivory/30 flex items-center justify-center font-mono text-xs">
          VERIFYING VNPAY CHAKRA PAYMENT SEAL...
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
