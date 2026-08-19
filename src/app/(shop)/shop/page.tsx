import React, { Suspense } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ShopClient from "./ShopClient";
import { Loader2 } from "lucide-react";

// Bắt buộc ép Next.js render động phía Server, tránh lỗi Static Prerender khi build
export const dynamic = "force-dynamic";

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-brand-ivory text-brand-dark flex flex-col justify-between font-mono">
      <Header />
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20 grow">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        }
      >
        <ShopClient />
      </Suspense>
      <Footer />
    </div>
  );
}
