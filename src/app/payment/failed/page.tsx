"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import { XCircle, RotateCcw, HelpCircle, AlertTriangle } from "lucide-react";

// VNPay Response Codes Map (English translation)
const VNPAY_ERROR_MESSAGES: Record<string, string> = {
  "07": "Suspected fraudulent activity detected by issuing bank or gateway.",
  "09": "Card/Account is not registered for Internet Banking service.",
  "10": "Verification failed more than 3 consecutive times.",
  "11": "Payment session timed out. Please initiate transaction again.",
  "12": "Card or bank account is currently locked by issuer.",
  "13": "Incorrect OTP authentication code entered.",
  "24": "Transaction was canceled directly by user.",
  "51": "Insufficient balance or chakra funds available in account.",
  "65": "Selected bank system is currently undergoing maintenance.",
  "75": "Bank payment gateway is undergoing maintenance.",
  "99": "Unspecified error occurred from payment gateway.",
};

function PaymentFailedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Extract error params from VNPay
  const responseCode = searchParams.get("vnp_ResponseCode") || "24";
  const orderId = searchParams.get("vnp_TxnRef") || "N/A";
  const transactionNo = searchParams.get("vnp_TransactionNo");

  // Get corresponding error message
  const errorMessage =
    VNPAY_ERROR_MESSAGES[responseCode] ||
    "Payment transaction via VNPay was declined or canceled.";

  return (
    <div className="min-h-screen bg-brand-ivory/30 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-mono text-brand-dark relative overflow-hidden">
      {/* MANGA DIAGONAL LINES BACKGROUND */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] bg-size-[16px_16px] pointer-events-none" />

      <div className="max-w-2xl w-full space-y-8 text-center relative z-10">
        {/* GRAPHIC FAILURE BADGE */}
        <div className="relative inline-block">
          <span className="absolute -top-4 -right-8 z-20 bg-rose-600 text-white text-[11px] font-heading font-bold px-3 py-1 tracking-widest uppercase rotate-12 shadow-md border border-black animate-bounce">
            *MISSION FAILED!*
          </span>

          <div className="bg-white border-2 border-brand-dark p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group">
            <div className="flex items-center justify-center text-rose-600">
              <div className="p-4 bg-rose-500/10 border-2 border-dashed border-rose-500 rounded-none">
                <XCircle size={64} />
              </div>
            </div>

            <span className="text-[10px] tracking-[0.3em] font-bold text-rose-600 uppercase block mt-4">
              VNPAY CHAKRA REJECTED (ERR: {responseCode})
            </span>
          </div>
        </div>

        {/* TITLE & ERROR DESCRIPTION */}
        <div className="space-y-3">
          <h1 className="font-heading text-2xl sm:text-3xl tracking-wider uppercase text-brand-dark">
            PAYMENT SEAL REJECTED!
          </h1>
          <p className="text-xs text-brand-dark/70 font-sans max-w-md mx-auto leading-relaxed">
            Your payment scroll could not be processed and your account was not
            charged. Please review the details below and retry the mission.
          </p>
        </div>

        {/* VNPAY CAUSE & RECOVERY BOX */}
        <div className="bg-white border border-brand-dark/20 p-6 text-left space-y-4 shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-brand-dark/15 text-rose-600">
            <AlertTriangle size={18} />
            <span className="font-heading text-sm tracking-wider uppercase">
              REASON FROM VNPAY GATEWAY
            </span>
          </div>

          <div className="space-y-3 text-xs font-sans">
            <div className="bg-rose-500/5 border border-rose-500/20 p-3 text-rose-700 font-medium">
              <span className="font-bold font-mono uppercase block text-[10px] text-rose-600 mb-0.5">
                VNPAY ERROR CODE [{responseCode}]
              </span>
              {errorMessage}
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-brand-dark/60 pt-1">
              <div>
                Order ID:{" "}
                <strong className="text-brand-dark">#{orderId}</strong>
              </div>
              {transactionNo && (
                <div>
                  VNPay Txn:{" "}
                  <strong className="text-brand-dark">#{transactionNo}</strong>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* NAVIGATION BUTTONS */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            variant="chakra"
            size="md"
            icon={RotateCcw}
            onClick={() => router.push("/checkout")}
            className="w-full sm:w-auto justify-center bg-rose-600 hover:bg-rose-700 text-white border-rose-700"
          >
            RETRY PAYMENT MISSION
          </Button>

          <Link href="/contact" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="md"
              icon={HelpCircle}
              className="w-full justify-center"
            >
              CONTACT HOKAGE GUILD SUPPORT
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-brand-ivory/30 flex items-center justify-center font-mono text-xs">
          CHECKING VNPAY ERROR CODE...
        </div>
      }
    >
      <PaymentFailedContent />
    </Suspense>
  );
}
