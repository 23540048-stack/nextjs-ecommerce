"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import {
  ArrowLeft,
  Scroll,
  Clock,
  ShoppingBag,
  Truck,
  CheckCircle2,
  XCircle,
  User,
  MapPin,
  CreditCard,
  Printer,
  ShieldAlert,
  Send,
  History,
  Loader2,
} from "lucide-react";

type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";
type PaymentStatus = "PAID" | "UNPAID" | "REFUNDED";

interface OrderItem {
  id: string;
  name: string;
  sku: string;
  image: string;
  price: number;
  quantity: number;
}

interface OrderDetail {
  id: string;
  customerName: string;
  customerRank: string;
  village: string;
  address: string;
  phone: string;
  email: string;
  createdAt: string;
  subtotal: number;
  shippingFee: number;
  discount: number;
  totalAmount: number;
  paymentMethod: "Ryo Transfer" | "Scroll COD" | "Chakra Pay";
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  note?: string;
  items: OrderItem[];
  logs: {
    time: string;
    action: string;
    actor: string;
  }[];
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newLogNote, setNewLogNote] = useState("");

  // Fetch order data from Backend
  useEffect(() => {
    if (!orderId) return;

    const fetchOrderDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/orders/${orderId}`);

        if (!response.ok) {
          throw new Error("Failed to load order details");
        }

        const data: OrderDetail = await response.json();
        setOrder(data);
      } catch (err: any) {
        setError(
          err.message || "An error occurred while connecting to the server",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [orderId]);

  // Update order status
  const handleUpdateStatus = async (newStatus: OrderStatus) => {
    if (!order) return;

    const updatedLogs = [
      ...order.logs,
      {
        time: new Date().toLocaleString("sv-SE").replace(" ", " ").slice(0, 16),
        action: `Status changed to: ${newStatus}`,
        actor: "Admin Jonin",
      },
    ];

    const nextPaymentStatus: PaymentStatus =
      newStatus === "DELIVERED"
        ? "PAID"
        : newStatus === "CANCELLED"
          ? "REFUNDED"
          : order.paymentStatus;

    // Optimistic UI Update
    setOrder((prev) =>
      prev
        ? {
            ...prev,
            status: newStatus,
            paymentStatus: nextPaymentStatus,
            logs: updatedLogs,
          }
        : null,
    );

    // Send update request to Backend
    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          paymentStatus: nextPaymentStatus,
          log: updatedLogs[updatedLogs.length - 1],
        }),
      });
    } catch (err) {
      console.error("Error updating status on server:", err);
    }
  };

  // Add log note
  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogNote.trim() || !order) return;

    const newLogItem = {
      time: new Date().toLocaleString("sv-SE").replace(" ", " ").slice(0, 16),
      action: `Note: ${newLogNote}`,
      actor: "Admin Jonin",
    };

    setOrder((prev) =>
      prev
        ? {
            ...prev,
            logs: [...prev.logs, newLogItem],
          }
        : null,
    );

    setNewLogNote("");

    // Send new log to Backend
    try {
      await fetch(`/api/orders/${orderId}/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLogItem),
      });
    } catch (err) {
      console.error("Error sending log to server:", err);
    }
  };

  // Render Status Badge
  const renderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-100 border border-amber-600 px-2.5 py-1 text-xs font-bold">
            <Clock size={14} /> PENDING APPROVAL
          </span>
        );
      case "PROCESSING":
        return (
          <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-100 border border-blue-600 px-2.5 py-1 text-xs font-bold">
            <ShoppingBag size={14} /> PROCESSING MISSION
          </span>
        );
      case "SHIPPED":
        return (
          <span className="inline-flex items-center gap-1 text-purple-700 bg-purple-100 border border-purple-600 px-2.5 py-1 text-xs font-bold">
            <Truck size={14} /> SHIPPED BY NINJA EXPRESS
          </span>
        );
      case "DELIVERED":
        return (
          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-100 border border-emerald-600 px-2.5 py-1 text-xs font-bold">
            <CheckCircle2 size={14} /> MISSION ACCOMPLISHED
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-100 border border-rose-600 px-2.5 py-1 text-xs font-bold">
            <XCircle size={14} /> MISSION CANCELLED
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] font-mono">
        <Loader2 className="animate-spin text-orange-600 mb-2" size={32} />
        <p className="text-xs text-brand-dark/70 font-bold uppercase">
          Fetching Mission Scroll...
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-8 text-center font-mono border-2 border-brand-dark bg-white space-y-4">
        <p className="text-rose-600 font-bold text-sm">
          {error || "Order scroll not found!"}
        </p>
        <Link href="/admin/orders">
          <Button variant="outline" size="sm" icon={ArrowLeft}>
            BACK TO ORDERS
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-mono text-xs text-brand-dark pb-10">
      {/* NAVIGATION & ACTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-brand-dark/15">
        <div className="flex items-center gap-3">
          <Link href="/admin/orders">
            <Button variant="outline" size="sm" icon={ArrowLeft}>
              BACK
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 tracking-widest uppercase">
                SCROLL DETAILS
              </span>
              <span className="text-brand-dark/50 text-[11px]">
                {order.createdAt}
              </span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl tracking-wider text-brand-dark mt-0.5 uppercase flex items-center gap-2">
              <Scroll className="text-orange-600 shrink-0" size={26} />
              MISSION #{order.id}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={Printer}
            onClick={() => window.print()}
          >
            PRINT SCROLL
          </Button>
        </div>
      </div>

      {/* STATUS CONTROL BAR */}
      <div className="bg-white border-2 border-brand-dark p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase text-brand-dark/60 block">
            Current Mission Progress
          </span>
          <div className="mt-1">{renderStatusBadge(order.status)}</div>
        </div>

        {/* STATUS STEPPER BUTTONS */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <span className="text-[10px] font-bold uppercase text-brand-dark/70 mr-1 w-full sm:w-auto">
            Change Status:
          </span>
          <Button
            variant={order.status === "PENDING" ? "chakra" : "outline"}
            size="sm"
            onClick={() => handleUpdateStatus("PENDING")}
          >
            PENDING
          </Button>
          <Button
            variant={order.status === "PROCESSING" ? "chakra" : "outline"}
            size="sm"
            onClick={() => handleUpdateStatus("PROCESSING")}
          >
            PROCESS
          </Button>
          <Button
            variant={order.status === "SHIPPED" ? "chakra" : "outline"}
            size="sm"
            onClick={() => handleUpdateStatus("SHIPPED")}
          >
            SHIP
          </Button>
          <Button
            variant={order.status === "DELIVERED" ? "chakra" : "outline"}
            size="sm"
            onClick={() => handleUpdateStatus("DELIVERED")}
          >
            DELIVER
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleUpdateStatus("CANCELLED")}
          >
            CANCEL
          </Button>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN (2/3): ITEMS & FINANCIALS */}
        <div className="lg:col-span-2 space-y-6">
          {/* ITEMS TABLE */}
          <div className="bg-white border-2 border-brand-dark shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
            <div className="bg-brand-dark text-brand-ivory p-3 font-bold uppercase flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ShoppingBag size={16} className="text-orange-500" />
                Requested Gear Items ({order.items.length})
              </span>
              <span className="text-[10px] bg-orange-600 text-white px-2 py-0.5">
                NINJA APPROVED
              </span>
            </div>

            <div className="divide-y divide-brand-dark/15">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 object-cover border-2 border-brand-dark bg-brand-ivory shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-brand-dark">
                        {item.name}
                      </h4>
                      <div className="text-[10px] text-brand-dark/60 font-mono mt-0.5">
                        SKU: {item.sku} | ID: #{item.id}
                      </div>
                      <div className="text-xs font-bold text-orange-600 mt-1">
                        {item.price.toLocaleString("en-US")} VND
                      </div>
                    </div>
                  </div>

                  <div className="text-right self-end sm:self-center border-t sm:border-t-0 border-brand-dark/10 pt-2 sm:pt-0 w-full sm:w-auto flex sm:block justify-between items-center">
                    <span className="text-[10px] text-brand-dark/60 block sm:hidden">
                      Subtotal:
                    </span>
                    <div>
                      <div className="font-bold text-xs">
                        Qty: {item.quantity}
                      </div>
                      <div className="font-bold text-sm text-brand-dark mt-0.5">
                        {(item.quantity * item.price).toLocaleString("en-US")}{" "}
                        VND
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* FINANCIAL SUMMARY */}
            <div className="bg-brand-ivory/30 border-t-2 border-brand-dark p-4 space-y-2">
              <div className="flex justify-between text-xs text-brand-dark/80">
                <span>Subtotal (Equipment Cost):</span>
                <span className="font-bold">
                  {order.subtotal.toLocaleString("en-US")} VND
                </span>
              </div>
              <div className="flex justify-between text-xs text-brand-dark/80">
                <span>Ninja Courier Fee (Express Delivery):</span>
                <span className="font-bold">
                  {order.shippingFee.toLocaleString("en-US")} VND
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-xs text-emerald-700 font-bold">
                  <span>Village Scroll Coupon Discount:</span>
                  <span>-{order.discount.toLocaleString("en-US")} VND</span>
                </div>
              )}
              <div className="pt-2 border-t-2 border-brand-dark flex justify-between items-center text-sm font-bold">
                <span className="uppercase font-heading text-base">
                  Grand Total (Ryo):
                </span>
                <span className="text-orange-600 text-lg">
                  {order.totalAmount.toLocaleString("en-US")} VND
                </span>
              </div>
            </div>
          </div>

          {/* AUDIT LOG & NOTES */}
          <div className="bg-white border-2 border-brand-dark p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
            <div className="font-bold text-sm uppercase flex items-center gap-2 border-b-2 border-brand-dark/15 pb-2 text-brand-dark">
              <History size={16} className="text-orange-600" />
              Mission Activity Scroll & Logs
            </div>

            {/* TIMELINE */}
            <div className="space-y-3 pl-2 border-l-2 border-brand-dark/20">
              {order.logs.map((log, idx) => (
                <div key={idx} className="relative pl-4">
                  <div className="absolute -left-3.5 top-1 w-2.5 h-2.5 bg-orange-600 border border-brand-dark"></div>
                  <div className="text-[10px] text-brand-dark/60 font-bold">
                    {log.time} — {log.actor}
                  </div>
                  <div className="text-xs font-bold text-brand-dark mt-0.5">
                    {log.action}
                  </div>
                </div>
              ))}
            </div>

            {/* ADD LOG NOTE */}
            <form
              onSubmit={handleAddLog}
              className="pt-3 border-t border-brand-dark/15 flex gap-2"
            >
              <input
                type="text"
                placeholder="Add confidential mission note..."
                value={newLogNote}
                onChange={(e) => setNewLogNote(e.target.value)}
                className="flex-1 bg-brand-ivory/20 border-2 border-brand-dark p-2 text-xs font-mono focus:outline-hidden focus:border-orange-600"
              />
              <Button type="submit" variant="chakra" size="sm" icon={Send}>
                LOG NOTE
              </Button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN (1/3): CUSTOMER & PAYMENT DETAILS */}
        <div className="space-y-6">
          {/* SHINOBI RECEIVER INFO */}
          <div className="bg-white border-2 border-brand-dark p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-3">
            <div className="font-bold text-xs uppercase flex items-center gap-1.5 border-b-2 border-brand-dark/15 pb-2 text-orange-600">
              <User size={16} /> Shinobi Recipient
            </div>

            <div className="space-y-1.5">
              <div>
                <span className="text-[10px] text-brand-dark/60 block uppercase font-bold">
                  Shinobi Name
                </span>
                <span className="font-bold text-sm text-brand-dark">
                  {order.customerName}
                </span>
                <span className="ml-2 text-[10px] bg-orange-100 border border-orange-600 text-orange-800 px-1.5 py-0.2 font-bold">
                  {order.customerRank}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-brand-dark/60 block uppercase font-bold">
                  Contact Phone
                </span>
                <span className="font-bold">{order.phone}</span>
              </div>

              <div>
                <span className="text-[10px] text-brand-dark/60 block uppercase font-bold">
                  Eagle Post Email
                </span>
                <span className="font-mono text-brand-dark/80">
                  {order.email}
                </span>
              </div>
            </div>
          </div>

          {/* DELIVERY LOCATION */}
          <div className="bg-white border-2 border-brand-dark p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-3">
            <div className="font-bold text-xs uppercase flex items-center gap-1.5 border-b-2 border-brand-dark/15 pb-2 text-orange-600">
              <MapPin size={16} /> Destination Village
            </div>

            <div className="space-y-1.5">
              <div>
                <span className="text-[10px] text-brand-dark/60 block uppercase font-bold">
                  Village Domain
                </span>
                <span className="font-bold text-brand-dark">
                  {order.village}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-brand-dark/60 block uppercase font-bold">
                  Specific Address
                </span>
                <span className="font-bold text-brand-dark/90 leading-relaxed block">
                  {order.address}
                </span>
              </div>

              {order.note && (
                <div className="bg-amber-500/10 border-2 border-amber-600 p-2.5 mt-2">
                  <span className="text-[10px] text-amber-900 font-bold uppercase flex items-center gap-1">
                    <ShieldAlert size={12} /> Delivery Memo
                  </span>
                  <p className="text-[11px] text-amber-900 font-bold mt-0.5">
                    {order.note}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* PAYMENT METHOD & STATUS */}
          <div className="bg-white border-2 border-brand-dark p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-3">
            <div className="font-bold text-xs uppercase flex items-center gap-1.5 border-b-2 border-brand-dark/15 pb-2 text-orange-600">
              <CreditCard size={16} /> Treasury & Payment
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-brand-dark/60 uppercase font-bold">
                  Method:
                </span>
                <span className="font-bold border border-brand-dark bg-brand-ivory px-2 py-0.5">
                  {order.paymentMethod}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[10px] text-brand-dark/60 uppercase font-bold">
                  Payment Status:
                </span>
                <span
                  className={`font-bold px-2 py-0.5 border text-[10px] ${
                    order.paymentStatus === "PAID"
                      ? "bg-emerald-100 text-emerald-800 border-emerald-600"
                      : order.paymentStatus === "REFUNDED"
                        ? "bg-rose-100 text-rose-800 border-rose-600"
                        : "bg-amber-100 text-amber-800 border-amber-600"
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
