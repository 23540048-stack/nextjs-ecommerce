"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  RefreshCw,
  Headphones,
  Package,
  Loader2,
} from "lucide-react";
import Input from "@/components/ui/Input";
import { api } from "@/lib/api";

// Import đầy đủ 6 Modal
import ShippingModal from "@/components/modals/ShippingModal";
import SizeGuideModal from "@/components/modals/SizeGuideModal";
import ReturnsModal from "@/components/modals/ReturnsModal";
import ContactModal from "@/components/modals/ContactHQModal";
import TermsModal from "@/components/modals/TermsModal";
import PrivacyModal from "@/components/modals/PrivacyModal";

interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
}

function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function TwitterIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}

function DiscordIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6h0a14.5 14.5 0 0 0-4-1.25 1 1 0 0 0-1 .5 19.3 19.3 0 0 0-.8 1.68 13.7 13.7 0 0 0-4.4 0A19.3 19.3 0 0 0 7 5.25a1 1 0 0 0-1-.5A14.5 14.5 0 0 0 2 6h0a16.8 16.8 0 0 0-3 12.6A1 1 0 0 0 0 19a14.7 14.7 0 0 0 4.5 2.2 1 1 0 0 0 1.1-.4 10.4 10.4 0 0 0 1-1.6 1 1 0 0 0-.5-1.3 9.6 9.6 0 0 1-1.4-.7 1 1 0 0 1 .1-1.7 10 10 0 0 0 2.3.9 13.2 13.2 0 0 0 7.8 0 10 10 0 0 0 2.3-.9 1 1 0 0 1 .1 1.7 9.6 9.6 0 0 1-1.4.7 1 1 0 0 0-.5 1.3 10.4 10.4 0 0 0 1 1.6 1 1 0 0 0 1.1.4 14.7 14.7 0 0 0 4.5-2.2 1 1 0 0 0 .8-.4A16.8 16.8 0 0 0 22 6zM8.5 15.5c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2zm7 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2z" />
    </svg>
  );
}

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Categories
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Modal
  const [activeModal, setActiveModal] = useState<
    "shipping" | "size" | "returns" | "contact" | "terms" | "privacy" | null
  >(null);

  // ============================================================
  // GET CATEGORIES
  // ============================================================
  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);

        console.log("Fetching footer categories...");

        const response = await api.get("/categories");

        console.log("Footer categories response:", response.data);

        if (!isMounted) return;

        const responseData = response.data;

        // Backend có thể trả:
        // 1. [...]
        // 2. { data: [...] }
        // 3. { categories: [...] }
        let categoryData: CategoryItem[] = [];

        if (Array.isArray(responseData)) {
          categoryData = responseData;
        } else if (Array.isArray(responseData?.data)) {
          categoryData = responseData.data;
        } else if (Array.isArray(responseData?.categories)) {
          categoryData = responseData.categories;
        }

        setCategories(categoryData);
      } catch (error: any) {
        console.error("Error fetching footer categories:", error);

        if (!isMounted) return;

        setCategories([]);

        // Log rõ lỗi Axios để debug
        if (error?.response) {
          console.error("Footer API Status:", error.response.status);
          console.error("Footer API Data:", error.response.data);
        } else if (error?.request) {
          console.error(
            "Footer API Request was sent but no response received:",
            error.request,
          );
        } else {
          console.error("Footer API Error:", error.message);
        }
      } finally {
        if (isMounted) {
          setLoadingCategories(false);
        }
      }
    };

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  // ============================================================
  // NEWSLETTER SUBSCRIBE
  // ============================================================
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setErrorMessage("PLEASE ENTER YOUR EMAIL.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");

      console.log("Subscribing newsletter:", trimmedEmail);

      const response = await api.post("/newsletter/subscribe", {
        email: trimmedEmail,
      });

      console.log("Newsletter response:", response.data);

      setSubscribed(true);
      setEmail("");
    } catch (error: any) {
      console.error("Newsletter submission error:", error);

      if (error?.response) {
        console.error(
          "Newsletter Status:",
          error.response.status,
          error.response.data,
        );

        const serverMessage = error.response.data?.message;

        if (Array.isArray(serverMessage)) {
          setErrorMessage(serverMessage.join(" | ").toUpperCase());
        } else {
          setErrorMessage(
            String(
              serverMessage || "FAILED TO JOIN CLAN. PLEASE TRY AGAIN.",
            ).toUpperCase(),
          );
        }
      } else if (error?.request) {
        setErrorMessage("NETWORK ERROR. SERVER DID NOT RESPOND.");
      } else {
        setErrorMessage("FAILED TO JOIN CLAN. PLEASE TRY AGAIN.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-brand-dark text-brand-ivory relative overflow-hidden border-t border-brand-ivory/10">
      {/* ====================================================== */}
      {/* 1. VALUE PROPOSITION */}
      {/* ====================================================== */}

      <div className="border-b border-brand-ivory/10 py-8 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
            <Truck size={24} className="text-brand-primary shrink-0" />
            <div>
              <h5 className="font-heading tracking-widest text-lg uppercase text-brand-ivory">
                EXPRESS SHIPPING
              </h5>
              <p className="text-xs text-brand-ivory/60 font-sans">
                Worldwide & Domestic Delivery
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
            <ShieldCheck size={24} className="text-brand-primary shrink-0" />
            <div>
              <h5 className="font-heading tracking-widest text-lg uppercase text-brand-ivory">
                100% AUTHENTIC
              </h5>
              <p className="text-xs text-brand-ivory/60 font-sans">
                Exclusive Official Merchandise
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
            <RefreshCw size={24} className="text-brand-primary shrink-0" />
            <div>
              <h5 className="font-heading tracking-widest text-lg uppercase text-brand-ivory">
                EASY RETURNS
              </h5>
              <p className="text-xs text-brand-ivory/60 font-sans">
                Hassle-Free 14-Day Return Policy
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
            <Headphones size={24} className="text-brand-primary shrink-0" />
            <div>
              <h5 className="font-heading tracking-widest text-lg uppercase text-brand-ivory">
                SHINOBI SUPPORT
              </h5>
              <p className="text-xs text-brand-ivory/60 font-sans">
                24/7 Dedicated Customer Support
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================== */}
      {/* 2. NEWSLETTER */}
      {/* ====================================================== */}

      <div className="max-w-7xl mx-auto px-6 py-16 border-b border-brand-ivory/10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-2">
            <span className="text-[10px] tracking-[0.3em] uppercase text-brand-primary font-bold">
              BECOME AN ANBU MEMBER
            </span>

            <h3 className="text-3xl sm:text-4xl md:text-5xl font-heading tracking-wider uppercase text-brand-ivory">
              JOIN THE SHINOBI CLAN
            </h3>

            <p className="text-xs sm:text-sm text-brand-ivory/70 max-w-md font-sans">
              Get early access to limited drops, exclusive perks, and Leaf
              Village events.
            </p>
          </div>

          <div className="lg:col-span-6">
            {subscribed ? (
              <div className="bg-brand-primary/20 border border-brand-primary text-brand-ivory p-4 text-center font-mono text-xs tracking-wide uppercase">
                ✓ YOU HAVE JOINED THE CLAN! YOUR EMAIL HAS BEEN REGISTERED TO
                HQ.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
                <div className="flex flex-col sm:flex-row gap-3 items-stretch">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);

                      if (errorMessage) {
                        setErrorMessage("");
                      }
                    }}
                    placeholder="ENTER YOUR EMAIL..."
                    required
                    disabled={isSubmitting}
                    className="flex-1 bg-brand-ivory/5 border-brand-ivory/20 text-brand-ivory placeholder:text-brand-ivory/40 focus:border-brand-primary uppercase tracking-wider rounded-none py-3.5 font-mono text-xs"
                  />

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group relative inline-flex items-center justify-center gap-2 overflow-hidden border border-brand-primary bg-brand-primary px-6 font-heading text-base tracking-[0.15em] text-white uppercase transition-all duration-300 hover:bg-brand-dark hover:text-brand-primary hover:shadow-[0_0_20px_rgba(234,88,12,0.6)] shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    <span className="absolute inset-0 h-full w-full -translate-x-full bg-white/20 transition-transform duration-700 ease-out group-hover:translate-x-full" />

                    {isSubmitting ? (
                      <Loader2
                        className="animate-spin relative z-10"
                        size={18}
                      />
                    ) : (
                      <>
                        <span className="relative z-10 font-bold">
                          JOIN NOW
                        </span>

                        <ArrowRight
                          size={16}
                          className="relative z-10 transition-transform duration-300 group-hover:translate-x-1.5"
                        />
                      </>
                    )}
                  </button>
                </div>

                {errorMessage && (
                  <p className="text-[11px] font-mono text-red-400 uppercase tracking-wide">
                    ⚠️ {errorMessage}
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ====================================================== */}
      {/* 3. NAVIGATION LINKS */}
      {/* ====================================================== */}

      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
        {/* BRAND */}
        <div className="lg:col-span-2 space-y-4">
          <Link href="/" className="inline-block">
            <h2 className="text-4xl font-heading tracking-[0.15em] text-brand-ivory hover:text-brand-primary transition-colors uppercase">
              SHINOBI GOODS
            </h2>
          </Link>

          <p className="text-xs text-brand-ivory/70 leading-relaxed font-sans max-w-sm">
            Bring the world of Naruto into your collection.
          </p>

          <div className="pt-2">
            <span className="text-3xl font-heading tracking-[0.3em] text-brand-ivory/20 uppercase select-none font-bold">
              火の意志 • 木ノ葉隠れ
            </span>
          </div>
        </div>

        {/* COLLECTIONS */}
        <div>
          <h4 className="text-xs tracking-[0.25em] font-sans font-bold text-brand-primary uppercase mb-6">
            COLLECTIONS
          </h4>

          <ul className="space-y-3 text-xs tracking-wider font-sans text-brand-ivory/80">
            {loadingCategories ? (
              <li className="flex items-center gap-2 text-brand-ivory/40 font-mono text-[11px]">
                <Loader2 size={12} className="animate-spin" />
                <span>LOADING CLANS...</span>
              </li>
            ) : categories.length > 0 ? (
              categories.slice(0, 4).map((cat) => (
                <li key={cat._id}>
                  <Link
                    href={`/shop?category=${cat.slug}`}
                    className="hover:text-brand-primary transition-colors uppercase block"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))
            ) : (
              <>
                <li>
                  <Link
                    href="/shop?category=naruto"
                    className="hover:text-brand-primary transition-colors uppercase block"
                  >
                    NARUTO ARCHIVE
                  </Link>
                </li>

                <li>
                  <Link
                    href="/shop?category=akatsuki"
                    className="hover:text-brand-primary transition-colors uppercase block"
                  >
                    AKATSUKI DAWN
                  </Link>
                </li>
              </>
            )}

            <li>
              <Link
                href="/shop?filter=limited"
                className="group relative inline-flex items-center gap-2 font-semibold text-brand-danger transition-all duration-300 py-1 px-2 -ml-2 rounded-xs hover:bg-brand-danger hover:text-white hover:shadow-[0_0_15px_rgba(155,48,48,0.6)] uppercase"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-brand-danger group-hover:bg-white animate-pulse" />

                <span className="tracking-widest">LIMITED DROPS</span>

                <span className="transition-transform duration-500 group-hover:rotate-180 text-xs">
                  ★
                </span>
              </Link>
            </li>
          </ul>
        </div>

        {/* CUSTOMER CARE */}
        <div>
          <h4 className="text-xs tracking-[0.25em] font-sans font-bold text-brand-primary uppercase mb-6">
            CUSTOMER CARE
          </h4>

          <ul className="space-y-3 text-xs tracking-wider font-sans text-brand-ivory/80">
            <li>
              <button
                type="button"
                onClick={() => setActiveModal("size")}
                className="hover:text-brand-primary transition-colors uppercase block text-left cursor-pointer"
              >
                SIZE GUIDE
              </button>
            </li>

            <li>
              <button
                type="button"
                onClick={() => setActiveModal("shipping")}
                className="hover:text-brand-primary transition-colors uppercase block text-left cursor-pointer"
              >
                SHIPPING & DELIVERY
              </button>
            </li>

            <li>
              <button
                type="button"
                onClick={() => setActiveModal("returns")}
                className="hover:text-brand-primary transition-colors uppercase block text-left cursor-pointer"
              >
                RETURNS & EXCHANGES
              </button>
            </li>

            <li>
              <Link
                href="/orders"
                className="hover:text-brand-primary transition-colors uppercase flex items-center gap-1.5 text-brand-primary font-bold"
              >
                <Package size={13} />
                <span>MISSION ORDERS</span>
              </Link>
            </li>

            <li>
              <button
                type="button"
                onClick={() => setActiveModal("contact")}
                className="hover:text-brand-primary transition-colors uppercase block text-left cursor-pointer"
              >
                CONTACT SHINOBI HQ
              </button>
            </li>
          </ul>
        </div>

        {/* SOCIAL */}
        <div>
          <h4 className="text-xs tracking-[0.25em] font-sans font-bold text-brand-primary uppercase mb-6">
            CONNECT WITH US
          </h4>

          <p className="text-xs text-brand-ivory/60 font-sans mb-4">
            Follow Konoha's development journey through social media channels:
          </p>

          <div className="flex items-center gap-3">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="w-10 h-10 bg-brand-ivory/5 border border-brand-ivory/10 flex items-center justify-center hover:bg-brand-primary hover:border-brand-primary hover:text-white transition-all cursor-pointer"
            >
              <InstagramIcon size={18} />
            </a>

            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
              className="w-10 h-10 bg-brand-ivory/5 border border-brand-ivory/10 flex items-center justify-center hover:bg-brand-primary hover:border-brand-primary hover:text-white transition-all cursor-pointer"
            >
              <TwitterIcon size={18} />
            </a>

            <a
              href="https://discord.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Discord"
              className="w-10 h-10 bg-brand-ivory/5 border border-brand-ivory/10 flex items-center justify-center hover:bg-brand-primary hover:border-brand-primary hover:text-white transition-all cursor-pointer"
            >
              <DiscordIcon size={18} />
            </a>
          </div>
        </div>
      </div>

      {/* ====================================================== */}
      {/* 4. COPYRIGHT */}
      {/* ====================================================== */}

      <div className="border-t border-brand-ivory/10 py-6 px-6 text-brand-ivory/50 text-[11px] font-mono tracking-widest uppercase">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p>
            © 2026 SHINOBI GOODS. ALL RIGHTS RESERVED. CARRY THE WILL OF FIRE.
          </p>

          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setActiveModal("privacy")}
              className="hover:text-brand-ivory transition-colors cursor-pointer uppercase"
            >
              PRIVACY POLICY
            </button>

            <button
              type="button"
              onClick={() => setActiveModal("terms")}
              className="hover:text-brand-ivory transition-colors cursor-pointer uppercase"
            >
              TERMS OF SERVICE
            </button>

            <span className="text-brand-primary font-bold">KONOHAGAKURE</span>
          </div>
        </div>
      </div>

      {/* ====================================================== */}
      {/* 5. MODALS */}
      {/* ====================================================== */}

      <ShippingModal
        isOpen={activeModal === "shipping"}
        onClose={() => setActiveModal(null)}
      />

      <SizeGuideModal
        isOpen={activeModal === "size"}
        onClose={() => setActiveModal(null)}
      />

      <ReturnsModal
        isOpen={activeModal === "returns"}
        onClose={() => setActiveModal(null)}
      />

      <ContactModal
        isOpen={activeModal === "contact"}
        onClose={() => setActiveModal(null)}
      />

      <TermsModal
        isOpen={activeModal === "terms"}
        onClose={() => setActiveModal(null)}
      />

      <PrivacyModal
        isOpen={activeModal === "privacy"}
        onClose={() => setActiveModal(null)}
      />
    </footer>
  );
}
