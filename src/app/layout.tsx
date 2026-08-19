import type { Metadata } from "next";
import "./globals.css";
import { WishlistProvider } from "@/context/WishlistContext";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "SHINOBI GOODS",
  description: "Premium Collector Store",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className="antialiased bg-[#F4F1EA] text-[#111214]"
        suppressHydrationWarning={true}
      >
        <WishlistProvider>
          <CartProvider>
            {children}

            {/* Đổi position thành "top-right" */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: "#111214",
                  color: "#F4F1EA",
                  border: "1px solid rgba(249, 115, 22, 0.4)",
                  borderRadius: "4px",
                  fontSize: "14px",
                  fontWeight: "bold",
                },
              }}
            />
          </CartProvider>
        </WishlistProvider>
      </body>
    </html>
  );
}
