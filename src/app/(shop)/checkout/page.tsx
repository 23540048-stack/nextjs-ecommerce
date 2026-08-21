"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { api } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import CartSummary from "@/components/cart/CartSummary";
import {
  MapPin,
  Plus,
  Check,
  CheckCircle2,
  ArrowLeft,
  Scroll,
  User,
  Phone,
  Package,
  Wallet,
  QrCode,
  Loader2,
  Lock,
} from "lucide-react";

export interface CartItemType {
  id: string;
  productId: string;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  image: string;
}

interface Address {
  id: string;
  receiverName: string;
  phone: string;
  fullAddress: string;
  isDefault?: boolean;
}

interface AppliedCoupon {
  code: string;
  discountType: string;
  discountValue: number;
  discountAmount: number;
  originalValue: number;
  finalAmount: number;
}

export default function CheckoutPage() {
  const { refreshCart, fetchCart } = useCart();

  const [cartItems, setCartItems] = useState<CartItemType[]>([]);

  const [addresses, setAddresses] = useState<Address[]>([]);

  const [selectedAddressId, setSelectedAddressId] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [isAddingNewAddress, setIsAddingNewAddress] = useState<boolean>(false);

  const [paymentMethod, setPaymentMethod] = useState<"cod" | "vnpay">("cod");

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [orderCompleted, setOrderCompleted] = useState<boolean>(false);

  const [orderId, setOrderId] = useState<string>("");

  // ============================================================
  // COUPON STATE
  // ============================================================

  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(
    null,
  );

  const [discount, setDiscount] = useState<number>(0);

  // ============================================================
  // NEW ADDRESS FORM
  // ============================================================

  const [newAddressForm, setNewAddressForm] = useState({
    receiverName: "",
    phone: "",
    fullAddress: "",
  });

  // ============================================================
  // SYNC CART CONTEXT
  // ============================================================

  const syncCartContext = () => {
    if (typeof refreshCart === "function") {
      refreshCart();
    } else if (typeof fetchCart === "function") {
      fetchCart();
    }
  };

  // ============================================================
  // FETCH CHECKOUT DATA
  // ============================================================

  const fetchCheckoutData = async () => {
    setIsLoading(true);

    // ==========================================================
    // 1. FETCH CART
    // ==========================================================

    try {
      const cartResponse = await api.get("/cart");

      const cartData = cartResponse.data;

      const rawList = Array.isArray(cartData)
        ? cartData
        : cartData?.items || [];

      const formattedItems: CartItemType[] = rawList.map((item: any) => {
        const product =
          item.productId && typeof item.productId === "object"
            ? item.productId
            : item.product || {};

        const price =
          typeof item.price === "number"
            ? item.price
            : typeof product.price === "number"
              ? product.price
              : Number(product.price) || 0;

        const image =
          product.images && product.images.length > 0
            ? product.images[0]
            : product.image ||
              item.image ||
              "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&auto=format&fit=crop&q=60";

        return {
          id: String(item._id || item.id || product._id || ""),

          productId: String(
            product._id ||
              product.id ||
              (typeof item.productId === "string" ? item.productId : "") ||
              "",
          ),

          name: product.name || item.name || "SHINOBI GEAR",

          slug: product.slug || item.slug || "",

          price,

          quantity: Number(item.quantity) || 1,

          size: item.size || undefined,

          color: item.color || undefined,

          image,
        };
      });

      setCartItems(formattedItems);
    } catch (error) {
      console.error("Failed to fetch cart:", error);

      toast.error("Failed to load cart items from server");
    }

    // ==========================================================
    // 2. FETCH ADDRESSES
    // ==========================================================

    try {
      const addressResponse = await api.get("/users/addresses");

      const rawAddresses = addressResponse.data;

      const addressList = Array.isArray(rawAddresses)
        ? rawAddresses
        : rawAddresses?.addresses || rawAddresses?.data || [];

      const addressData: Address[] = addressList.map((a: any) => ({
        id: String(a._id || a.id),

        receiverName: a.receiverName || a.fullName || "",

        phone: a.phone || "",

        fullAddress: a.fullAddress || a.address || "",

        isDefault: Boolean(a.isDefault),
      }));

      setAddresses(addressData);

      if (addressData.length > 0) {
        const defaultAddr =
          addressData.find((a) => a.isDefault) || addressData[0];

        setSelectedAddressId(defaultAddr.id);
      } else {
        setIsAddingNewAddress(true);
      }
    } catch (err) {
      console.warn("Manual address input enabled.");

      setIsAddingNewAddress(true);
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================
  // LOAD CHECKOUT
  // ============================================================

  useEffect(() => {
    fetchCheckoutData();

    // ==========================================================
    // RESTORE COUPON FROM CART
    // ==========================================================

    const savedCoupon = sessionStorage.getItem("appliedCoupon");

    if (savedCoupon) {
      try {
        const parsed: AppliedCoupon = JSON.parse(savedCoupon);

        setAppliedCoupon(parsed);

        setDiscount(Number(parsed.discountAmount) || 0);
      } catch (error) {
        console.error("Failed to parse saved coupon:", error);

        sessionStorage.removeItem("appliedCoupon");
      }
    }
  }, []);

  // ============================================================
  // CALCULATIONS
  // ============================================================

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  // ============================================================
  // ADDRESS HANDLER
  // ============================================================

  const handleCreateNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !newAddressForm.receiverName ||
      !newAddressForm.phone ||
      !newAddressForm.fullAddress
    ) {
      toast.error("Please fill in all address fields");

      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        receiverName: newAddressForm.receiverName,

        phone: newAddressForm.phone,

        fullAddress: newAddressForm.fullAddress,

        isDefault: addresses.length === 0,
      };

      const res = await api.post("/users/addresses", payload);

      let newAddresses: Address[] = [];

      if (res.data?.addresses && Array.isArray(res.data.addresses)) {
        newAddresses = res.data.addresses.map((a: any) => ({
          id: String(a._id || a.id),

          receiverName: a.receiverName || payload.receiverName,

          phone: a.phone || payload.phone,

          fullAddress: a.fullAddress || payload.fullAddress,

          isDefault: Boolean(a.isDefault),
        }));
      } else {
        const createdAddr: Address = {
          id: String(res.data?._id || res.data?.id || Date.now()),

          ...payload,
        };

        newAddresses = [...addresses, createdAddr];
      }

      setAddresses(newAddresses);

      const addedAddr = newAddresses[newAddresses.length - 1];

      if (addedAddr) {
        setSelectedAddressId(addedAddr.id);
      }

      setIsAddingNewAddress(false);

      setNewAddressForm({
        receiverName: "",
        phone: "",
        fullAddress: "",
      });

      toast.success("Address saved to address book");
    } catch (error) {
      console.error("Failed to save address:", error);

      toast.error("Could not save address. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================
  // REMOVE COUPON
  // ============================================================

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);

    setDiscount(0);

    sessionStorage.removeItem("appliedCoupon");

    toast.success("Promo code removed");
  };

  // ============================================================
  // SUBMIT ORDER
  // ============================================================

  const handleSubmitOrder = async () => {
    if (!selectedAddressId && addresses.length === 0) {
      toast.error("Please enter and select a shipping address");

      return;
    }

    if (cartItems.length === 0) {
      toast.error("Your equipment scroll is empty");

      return;
    }

    setIsSubmitting(true);

    const selectedAddrObj = addresses.find((a) => a.id === selectedAddressId);

    const formattedAddressString = selectedAddrObj
      ? `${selectedAddrObj.receiverName} | ${selectedAddrObj.phone} | ${selectedAddrObj.fullAddress}`
      : `${newAddressForm.receiverName} | ${newAddressForm.phone} | ${newAddressForm.fullAddress}`;

    try {
      const response = await api.post("/orders", {
        shippingAddress: formattedAddressString,

        paymentMethod: paymentMethod.toUpperCase(),

        couponCode: appliedCoupon?.code || undefined,
      });

      const result = response.data;

      // Coupon đã được sử dụng
      sessionStorage.removeItem("appliedCoupon");

      syncCartContext();

      // ========================================================
      // VNPAY
      // ========================================================

      if (paymentMethod === "vnpay" && result.vnpayUrl) {
        window.location.href = result.vnpayUrl;

        return;
      }

      // ========================================================
      // ORDER ID
      // ========================================================

      const rawId =
        result.order?._id ||
        result.order?.id ||
        result.data?._id ||
        result.data?.id ||
        result._id ||
        result.id;

      const displayOrderId = rawId
        ? String(rawId).slice(-6).toUpperCase()
        : `SHINOBI-${Date.now().toString().slice(-4)}`;

      setOrderId(displayOrderId);

      setOrderCompleted(true);

      toast.success("Order placed successfully!");
    } catch (error: any) {
      console.error("Failed to place order:", error);

      const msg = error?.response?.data?.message || "Failed to create order";

      toast.error(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-white text-brand-dark flex flex-col items-center justify-center space-y-4 font-mono">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />

        <p className="text-xs uppercase tracking-widest text-brand-dark/70">
          SYNCING CHECKOUT DATA...
        </p>
      </div>
    );
  }

  // ============================================================
  // ORDER COMPLETED
  // ============================================================

  if (orderCompleted) {
    return (
      <div className="w-full min-h-screen bg-white text-brand-dark py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto border border-brand-dark/20 p-8 sm:p-12 text-center space-y-6 bg-brand-dark/5 font-mono">
          <div className="w-20 h-20 mx-auto rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-500">
            <CheckCircle2 size={40} />
          </div>

          <div className="space-y-2">
            <p className="text-xs text-orange-600 font-bold tracking-widest uppercase">
              MISSION CONFIRMED
            </p>

            <h1 className="font-heading text-3xl sm:text-4xl tracking-wide uppercase text-brand-dark">
              ORDER #{orderId}
            </h1>

            <p className="text-xs text-brand-dark/70 max-w-md mx-auto leading-relaxed pt-2">
              Your shinobi equipment order has been registered in our database.
              Our envoys are preparing your dispatch.
            </p>
          </div>

          <div className="pt-6 border-t border-brand-dark/15 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/orders">
              <Button variant="chakra" size="md" icon={Package}>
                VIEW YOUR ORDERS
              </Button>
            </Link>

            <Link href="/shop">
              <Button variant="outline" size="md" icon={Scroll}>
                CONTINUE EXPLORING
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // CHECKOUT
  // ============================================================

  return (
    <div className="w-full min-h-screen bg-white text-brand-dark py-10 px-4 sm:px-6 lg:px-8">
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

      <div className="max-w-7xl mx-auto space-y-8">
        {/* BREADCRUMB */}

        <div className="border-b border-brand-dark/15 pb-6">
          <div className="flex items-center gap-2 font-mono text-xs text-brand-dark/60 uppercase mb-2">
            <Link href="/" className="hover:text-orange-500 transition-colors">
              HOME
            </Link>

            <span>/</span>

            <Link
              href="/cart"
              className="hover:text-orange-500 transition-colors"
            >
              CART
            </Link>

            <span>/</span>

            <span className="text-brand-dark font-bold">CHECKOUT</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-heading tracking-wide uppercase">
                CHECKOUT MISSION
              </h1>

              <p className="font-mono text-xs text-brand-dark/60 mt-1">
                CONFIRM ADDRESS & DISPATCH OPTIONS
              </p>
            </div>

            <Link href="/cart">
              <Button variant="ghost" size="sm" icon={ArrowLeft}>
                RETURN TO SCROLL
              </Button>
            </Link>
          </div>
        </div>

        {/* MAIN CHECKOUT GRID */}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* LEFT COLUMN */}

          <div className="lg:col-span-7 space-y-8">
            {/* CART ITEMS */}

            <div className="border border-brand-dark/15 p-6 space-y-4 font-mono">
              <h2 className="font-heading text-lg tracking-wider uppercase border-b border-brand-dark/15 pb-3">
                EQUIPMENT ITEMS ({cartItems.length})
              </h2>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 text-xs border-b border-brand-dark/5 pb-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 bg-white border border-brand-dark/10 shrink-0 overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="object-cover w-full h-full"
                        />
                      </div>

                      <div>
                        <p className="font-bold text-brand-dark uppercase line-clamp-1">
                          {item.name}
                        </p>

                        <p className="text-[10px] text-brand-dark/60">
                          QTY: {item.quantity}
                          {item.size && ` | SIZE: ${item.size}`}
                        </p>
                      </div>
                    </div>

                    <span className="font-bold text-brand-dark shrink-0">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ADDRESS */}

            <div className="border border-brand-dark/15 p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-brand-dark/15 pb-3 font-mono">
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-orange-500" />

                  <h2 className="font-heading text-lg tracking-wider uppercase">
                    1. SHIPPING ADDRESS
                  </h2>
                </div>

                {addresses.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    icon={Plus}
                    onClick={() => setIsAddingNewAddress(!isAddingNewAddress)}
                  >
                    {isAddingNewAddress ? "CANCEL" : "ADD NEW"}
                  </Button>
                )}
              </div>

              {!isAddingNewAddress && addresses.length > 0 ? (
                <div className="space-y-3 font-mono text-xs">
                  {addresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;

                    return (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`p-4 border cursor-pointer transition-all ${
                          isSelected
                            ? "border-orange-500 bg-orange-500/5"
                            : "border-brand-dark/20 hover:border-brand-dark/40"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-brand-dark uppercase">
                                {addr.receiverName}
                              </span>

                              {addr.isDefault && (
                                <span className="bg-brand-dark text-white text-[9px] px-1.5 py-0.5 tracking-wider uppercase">
                                  DEFAULT
                                </span>
                              )}
                            </div>

                            <p className="text-brand-dark/80">
                              {addr.fullAddress}
                            </p>

                            <p className="text-brand-dark/60 text-[11px] uppercase">
                              TEL: {addr.phone}
                            </p>
                          </div>

                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected
                                ? "border-orange-500 bg-orange-500 text-white"
                                : "border-brand-dark/30"
                            }`}
                          >
                            {isSelected && <Check size={12} />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-4 pt-2 font-mono">
                  <p className="text-xs text-orange-600 font-bold uppercase">
                    {addresses.length === 0
                      ? "ENTER YOUR SHIPPING ADDRESS:"
                      : "ADD NEW SHIPPING ADDRESS"}
                  </p>

                  <Input
                    label="RECEIVER NAME *"
                    name="receiverName"
                    icon={User}
                    placeholder="E.G. HATAKE KAKASHI"
                    value={newAddressForm.receiverName}
                    onChange={(e) =>
                      setNewAddressForm({
                        ...newAddressForm,
                        receiverName: e.target.value,
                      })
                    }
                  />

                  <Input
                    label="PHONE NUMBER *"
                    name="phone"
                    icon={Phone}
                    placeholder="E.G. +84 987 654 321"
                    value={newAddressForm.phone}
                    onChange={(e) =>
                      setNewAddressForm({
                        ...newAddressForm,
                        phone: e.target.value,
                      })
                    }
                  />

                  <Input
                    label="FULL ADDRESS *"
                    name="fullAddress"
                    icon={MapPin}
                    placeholder="E.G. 123 KONOHA STREET, LEAF VILLAGE, TOKYO"
                    value={newAddressForm.fullAddress}
                    onChange={(e) =>
                      setNewAddressForm({
                        ...newAddressForm,
                        fullAddress: e.target.value,
                      })
                    }
                  />

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="chakra"
                      size="sm"
                      disabled={isSubmitting}
                      onClick={handleCreateNewAddress}
                    >
                      SAVE TO ADDRESS BOOK
                    </Button>

                    {addresses.length > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsAddingNewAddress(false)}
                      >
                        CANCEL
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* PAYMENT METHOD */}

            <div className="border border-brand-dark/15 p-6 space-y-6">
              <div className="flex items-center gap-2 border-b border-brand-dark/15 pb-3 font-mono">
                <Wallet size={18} className="text-orange-500" />

                <h2 className="font-heading text-lg tracking-wider uppercase">
                  2. PAYMENT METHOD
                </h2>
              </div>

              <div className="space-y-3 font-mono text-xs">
                {/* COD */}

                <label
                  onClick={() => setPaymentMethod("cod")}
                  className={`flex items-start gap-3 p-4 border cursor-pointer transition-all ${
                    paymentMethod === "cod"
                      ? "border-orange-500 bg-orange-500/5"
                      : "border-brand-dark/20 hover:border-brand-dark/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    className="mt-0.5 accent-orange-500"
                  />

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Wallet size={16} className="text-orange-600" />

                      <p className="font-bold uppercase tracking-wider text-brand-dark">
                        CASH ON DELIVERY (COD)
                      </p>
                    </div>

                    <p className="text-[11px] text-brand-dark/60">
                      Pay directly to courier upon arrival of gear.
                    </p>
                  </div>
                </label>

                {/* VNPAY */}

                <label
                  onClick={() => setPaymentMethod("vnpay")}
                  className={`flex items-start gap-3 p-4 border cursor-pointer transition-all ${
                    paymentMethod === "vnpay"
                      ? "border-orange-500 bg-orange-500/5"
                      : "border-brand-dark/20 hover:border-brand-dark/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "vnpay"}
                    onChange={() => setPaymentMethod("vnpay")}
                    className="mt-0.5 accent-orange-500"
                  />

                  <div className="space-y-1 w-full">
                    <div className="flex items-center gap-2">
                      <QrCode size={16} className="text-orange-600" />

                      <p className="font-bold uppercase tracking-wider text-brand-dark">
                        VNPAY GATEWAY (QR CODE / ATM / VISA)
                      </p>
                    </div>

                    <p className="text-[11px] text-brand-dark/60">
                      Instant online payment via Bank transfer or Card.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}

          <div className="lg:col-span-5 sticky top-24 space-y-4">
            <CartSummary
              subtotal={subtotal}
              shippingFee={30}
              discount={discount}
              appliedCoupon={appliedCoupon}
              onRemoveCoupon={handleRemoveCoupon}
              showCheckoutButton={false}
            />

            {/* ONLY CHECKOUT ACTION */}

            <Button
              type="button"
              variant="chakra"
              size="lg"
              icon={Lock}
              disabled={
                isSubmitting ||
                cartItems.length === 0 ||
                (!selectedAddressId && addresses.length === 0)
              }
              className="w-full h-12 text-sm tracking-widest font-mono"
              onClick={handleSubmitOrder}
            >
              {isSubmitting
                ? "PROCESSING ORDER..."
                : paymentMethod === "vnpay"
                  ? "PAY VIA VNPAY"
                  : "CONFIRM & PLACE ORDER"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
