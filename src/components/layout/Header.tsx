"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ShoppingBag, Heart, Search, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import Input from "@/components/ui/Input";
import UserMenu from "@/components/layout/UserMenu";
import { Category } from "../../types/category";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { useAuthStore } from "@/store/useAuthStore";

// Import các Modal
import ContactHQModal from "@/components/modals/ContactHQModal";
import ShippingModal from "@/components/modals/ShippingModal";
import AboutUsModal from "@/components/modals/AboutUsModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface SuggestedProduct {
  _id: string;
  id?: string;
  name: string;
  price: number;
  image?: string;
  images?: string[];
  category?: { name: string } | string;
}

function UzumakiIcon({
  className = "w-5 h-5 sm:w-6 sm:h-6",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M50 10 C 27.91 10, 10 27.91, 10 50 C 10 72.09, 27.91 90, 50 90 C 72.09 90, 90 72.09, 90 50 C 90 32, 77 18, 60 18 C 45 18, 32 30, 32 46 C 32 60, 42 70, 56 70 C 74 70, 74 62, 74 50 C 74 41, 67 34, 57 34 C 49 34, 44 40, 44 47 C 44 52, 48 56, 53 56 C 56 56, 58 54, 58 51"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Header() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchContainerRef = useRef<HTMLFormElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const { wishlistItems } = useWishlist();
  const wishlistCount = wishlistItems?.length || 0;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isShippingOpen, setIsShippingOpen] = useState(false);

  const [suggestions, setSuggestions] = useState<SuggestedProduct[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(true);

  const { cartCount: cartItemCount } = useCart();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        setUser(null);
      }
    };

    fetchCurrentUser();
  }, [setUser]);

  const checkIsLoggedIn = () => Boolean(user);

  const handleProtectedNavigation = (
    e: React.MouseEvent,
    path: string,
    errorMessage: string,
  ) => {
    e.preventDefault();
    if (!checkIsLoggedIn()) {
      toast.error(errorMessage);
      router.push("/login");
    } else {
      router.push(path);
    }
  };

  useEffect(() => {
    const currentQuery = searchParams.get("search") || "";
    setSearchQuery(currentQuery);
  }, [searchParams]);

  useEffect(() => {
    const trimmedQuery = searchQuery.trim();

    if (!trimmedQuery) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsLoadingSuggestions(true);
        const res = await fetch(
          `${API_URL}/products?search=${encodeURIComponent(trimmedQuery)}`,
        );
        if (res.ok) {
          const data = await res.json();
          const prodList = Array.isArray(data) ? data : data.data || [];
          setSuggestions(prodList.slice(0, 5));
          setShowDropdown(true);
        }
      } catch (error) {
        console.error("Error fetching search suggestions:", error);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const res = await fetch(`${API_URL}/categories`, {
          next: { revalidate: 3600 },
        });

        if (!res.ok) throw new Error("Failed to fetch categories");

        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSearchOpen) {
      setIsSearchOpen(true);
      setTimeout(() => searchInputRef.current?.focus(), 100);
      return;
    }

    if (searchQuery.trim()) {
      setShowDropdown(false);
      setIsSearchOpen(false);
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      setIsSearchOpen(false);
    }
  };

  const handleSearchButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();

    if (!isSearchOpen) {
      setIsSearchOpen(true);
      setTimeout(() => searchInputRef.current?.focus(), 100);
      return;
    }

    if (searchQuery.trim()) {
      handleSearchSubmit(e);
    } else {
      setIsSearchOpen(false);
      setShowDropdown(false);
    }
  };

  const handleSelectProduct = (productId: string) => {
    setShowDropdown(false);
    setIsSearchOpen(false);
    router.push(`/products/${productId}`);
  };

  return (
    <>
      {/* Header Container */}
      <header className="sticky top-0 z-40 bg-brand-ivory/90 backdrop-blur-md border-b border-brand-dark/10">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
          {/* LEFT GROUP: Menu Icon + Brand Logo */}
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
            <button
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open Menu"
              className="group flex items-center justify-center p-1 sm:p-2 text-brand-dark hover:text-brand-primary transition-colors cursor-pointer shrink-0"
            >
              <UzumakiIcon className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-500 group-hover:rotate-180" />
            </button>

            <Link href="/" className="group min-w-0 flex items-center">
              <h1 className="text-sm xs:text-base sm:text-2xl md:text-3xl font-heading tracking-wide sm:tracking-[0.15em] text-brand-dark group-hover:text-brand-primary transition-colors uppercase whitespace-nowrap">
                SHINOBI GOODS
              </h1>
            </Link>
          </div>

          {/* RIGHT GROUP: Search, Wishlist, Cart, User Menu */}
          <div className="flex items-center gap-1.5 sm:gap-4 md:gap-6 text-brand-dark shrink-0">
            {/* Search Form */}
            <form
              ref={searchContainerRef}
              onSubmit={handleSearchSubmit}
              onMouseEnter={() => setIsSearchOpen(true)}
              className="relative flex items-center justify-end group"
            >
              <Input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  setIsSearchOpen(true);
                  if (searchQuery.trim() && suggestions.length > 0) {
                    setShowDropdown(true);
                  }
                }}
                placeholder="SEARCH..."
                className={`transition-all duration-300 ease-in-out bg-brand-dark/5 py-1 px-2 border-t-0 border-x-0 border-b border-brand-dark/20 focus:border-brand-primary text-brand-dark rounded-none font-mono text-[10px] sm:text-xs ${
                  isSearchOpen
                    ? "w-28 sm:w-64 opacity-100 pointer-events-auto"
                    : "w-0 opacity-0 pointer-events-none"
                }`}
              />
              <button
                type="button"
                onClick={handleSearchButtonClick}
                aria-label="Search"
                className="text-brand-dark hover:text-brand-primary transition-colors cursor-pointer p-1 shrink-0"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Dropdown gợi ý tìm kiếm - Thu nhỏ & Dịch phải trên Mobile */}
              {showDropdown && searchQuery.trim() && (
                <div className="absolute top-full -right-10 xs:-right-14 sm:right-0 mt-2 w-48 xs:w-56 sm:w-80 bg-white border border-brand-dark/20 shadow-2xl z-50 font-mono text-xs overflow-hidden">
                  {isLoadingSuggestions ? (
                    <div className="flex items-center justify-center p-3 gap-2 text-brand-dark/60">
                      <Loader2
                        className="animate-spin text-orange-500"
                        size={14}
                      />
                      <span className="text-[10px] sm:text-xs">
                        SEARCHING GEAR...
                      </span>
                    </div>
                  ) : suggestions.length > 0 ? (
                    <div>
                      <div className="p-2 bg-brand-dark/5 border-b border-brand-dark/10 text-[8px] sm:text-[10px] tracking-widest text-brand-dark/50 uppercase font-bold">
                        MATCHING GEAR ({suggestions.length})
                      </div>
                      <div className="max-h-60 overflow-y-auto divide-y divide-brand-dark/10">
                        {suggestions.map((item) => {
                          const prodImg =
                            item.images && item.images.length > 0
                              ? item.images[0]
                              : item.image ||
                                "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=200";

                          const pId = item._id || item.id;

                          return (
                            <div
                              key={pId}
                              onClick={() => pId && handleSelectProduct(pId)}
                              className="p-1.5 sm:p-2 flex items-center gap-2 hover:bg-orange-500/10 cursor-pointer transition-colors group/item"
                            >
                              <img
                                src={prodImg}
                                alt={item.name}
                                className="w-7 h-7 sm:w-10 sm:h-10 object-cover border border-brand-dark/10 shrink-0"
                              />
                              <div className="grow overflow-hidden">
                                <p className="font-bold truncate text-brand-dark group-hover/item:text-orange-600 transition-colors uppercase text-[10px] sm:text-xs">
                                  {item.name}
                                </p>
                                <p className="text-[8px] sm:text-[9px] text-brand-dark/50 truncate">
                                  {typeof item.category === "object"
                                    ? item.category?.name
                                    : "SHINOBI GEAR"}
                                </p>
                              </div>
                              <div className="font-bold text-orange-600 shrink-0 text-[10px] sm:text-xs">
                                ${item.price.toFixed(2)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <button
                        type="submit"
                        className="w-full p-2 bg-brand-dark text-brand-ivory text-center font-bold tracking-widest uppercase hover:bg-orange-500 transition-colors border-t border-brand-dark/10 block text-[9px] sm:text-xs"
                      >
                        VIEW ALL RESULTS →
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 text-center text-brand-dark/50 uppercase text-[9px] sm:text-xs">
                      NO GEAR MATCHES FOUND
                    </div>
                  )}
                </div>
              )}
            </form>

            {/* Wishlist Icon */}
            <a
              href="/wishlist"
              onClick={(e) =>
                handleProtectedNavigation(
                  e,
                  "/wishlist",
                  "PLEASE LOG IN TO ACCESS YOUR WISHLIST!",
                )
              }
              aria-label="Wishlist"
              className="relative hover:text-brand-primary transition-colors cursor-pointer p-1"
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[9px] sm:text-[10px] font-bold w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center font-mono">
                  {wishlistCount}
                </span>
              )}
            </a>

            {/* Cart Icon */}
            <a
              href="/cart"
              onClick={(e) =>
                handleProtectedNavigation(
                  e,
                  "/cart",
                  "PLEASE LOG IN TO ACCESS YOUR TACTICAL BAG!",
                )
              }
              aria-label="Cart"
              className="relative hover:text-brand-primary transition-colors cursor-pointer p-1"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-primary text-white text-[9px] sm:text-[10px] font-bold w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center font-mono">
                  {cartItemCount}
                </span>
              )}
            </a>

            {/* User Menu Container */}
            <div className="flex items-center shrink-0 p-1 [&_svg]:w-4 [&_svg]:h-4 sm:[&_svg]:w-5 sm:[&_svg]:h-5 [&_img]:w-5 [&_img]:h-5 sm:[&_img]:w-7 sm:[&_img]:h-7 [&_button]:p-0">
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Drawer Menu Side Panel */}
      <div
        onClick={() => setIsMenuOpen(false)}
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity duration-300 ${
          isMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      <aside
        className={`fixed top-0 left-0 h-full w-full sm:w-1/2 md:w-5/12 lg:w-1/2 z-50 bg-white shadow-2xl transition-transform duration-300 ease-in-out flex flex-col justify-between p-6 sm:p-10 ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between pb-6 border-b border-brand-dark/10">
          <span className="text-xl font-heading tracking-widest text-brand-dark uppercase">
            MENU
          </span>

          <button
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center gap-2 text-xs tracking-[0.2em] font-medium text-brand-dark hover:text-brand-primary transition-colors cursor-pointer"
          >
            <X size={20} />
            <span>CLOSE</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-8">
          <div className="mb-10">
            <p className="text-[10px] tracking-[0.3em] text-brand-dark/40 uppercase mb-3 font-semibold font-sans">
              SHOP
            </p>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/shop"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-2xl sm:text-3xl font-heading tracking-wide uppercase text-brand-dark hover:text-brand-primary transition-colors block"
                >
                  ALL PRODUCTS
                </Link>
              </li>

              {loadingCategories ? (
                <li className="flex items-center gap-2 text-brand-dark/50 py-2">
                  <Loader2 className="animate-spin" size={18} />
                  <span className="text-xs font-mono tracking-widest">
                    LOADING CATEGORIES...
                  </span>
                </li>
              ) : (
                categories.map((cat) => (
                  <li key={cat._id}>
                    <Link
                      href={`/shop?category=${cat.slug}`}
                      onClick={() => setIsMenuOpen(false)}
                      className="text-2xl sm:text-3xl font-heading tracking-wide uppercase text-brand-dark hover:text-brand-primary transition-colors block"
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div>
            <p className="text-[10px] tracking-[0.3em] text-brand-dark/40 uppercase mb-3 font-semibold font-sans">
              INFORMATION
            </p>
            <ul className="space-y-3">
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsAboutOpen(true);
                  }}
                  className="text-xl sm:text-2xl font-heading tracking-wide uppercase text-brand-dark hover:text-brand-primary transition-colors block text-left cursor-pointer"
                >
                  ABOUT US
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsContactOpen(true);
                  }}
                  className="text-xl sm:text-2xl font-heading tracking-wide uppercase text-brand-dark hover:text-brand-primary transition-colors block text-left cursor-pointer"
                >
                  CONTACT
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsShippingOpen(true);
                  }}
                  className="text-xl sm:text-2xl font-heading tracking-wide uppercase text-brand-dark hover:text-brand-primary transition-colors block text-left cursor-pointer"
                >
                  SHIPPING
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-brand-dark/10 text-[10px] tracking-widest text-brand-dark/50 uppercase font-mono">
          SHINOBI GOODS — EDITION 2026
        </div>
      </aside>

      {/* Render Modals */}
      <AboutUsModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />
      <ContactHQModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />
      <ShippingModal
        isOpen={isShippingOpen}
        onClose={() => setIsShippingOpen(false)}
      />
    </>
  );
}
