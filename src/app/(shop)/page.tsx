import React from "react";
import Header from "@/components/layout/Header";
import Hero from "@/components/home/hero";
import CollectionSection from "@/components/home/CollectionCard";
import FeaturedSection from "@/components/home/FeaturedProducts";
import Footer from "@/components/layout/Footer";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-brand-ivory text-brand-dark selection:bg-brand-primary selection:text-white font-mono">
      {/* 1. Header Sticky */}
      <Header />

      <main>
        {/* 2. Hero Banner (Fetch API) */}
        <Hero />

        {/* 3. Shop by Collection (Fetch API) */}
        <CollectionSection />

        {/* 4. Featured Products (Fetch API) */}
        <FeaturedSection />
      </main>

      {/* 5. Footer */}
      <Footer />
    </div>
  );
}
