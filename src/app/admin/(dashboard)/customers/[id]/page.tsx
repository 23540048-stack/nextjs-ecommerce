import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Crown,
  ShoppingBag,
  Clock,
  ExternalLink,
  CheckCircle2,
  Truck,
} from "lucide-react";
import CustomerActions from "./CustomerActions";

// Mock Data Chi tiết Khách hàng & Lịch sử Đơn hàng
const MOCK_CUSTOMER_DETAILS: Record<string, any> = {
  "CUST-901": {
    id: "CUST-901",
    name: "Sasuke Uchiha",
    email: "sasuke@shadow-leaf.com",
    phone: "+84 901 234 567",
    village: "Building 4, Uchiha Compound, Hidden Leaf Village",
    billingAddress: "Uchiha Clan Archives, Land of Fire",
    rank: "S-RANK VIP",
    status: "vip",
    totalOrders: 18,
    totalSpent: 2450.0,
    joinedDate: "2025-01-15",
    lastOrderDate: "2026-08-10",
    notes:
      "Requires discreet delivery via Anbu Shadow Messenger. High priority customer.",
    orders: [
      {
        id: "SHINOBI-8892",
        date: "2026-08-10",
        status: "in_transit",
        itemsCount: 3,
        total: 175.0,
      },
      {
        id: "SHINOBI-7421",
        date: "2026-07-28",
        status: "delivered",
        itemsCount: 1,
        total: 120.0,
      },
      {
        id: "SHINOBI-5102",
        date: "2026-05-12",
        status: "delivered",
        itemsCount: 4,
        total: 620.0,
      },
    ],
  },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminCustomerDetailPage({ params }: PageProps) {
  const { id } = await params;

  // Lấy dữ liệu khách hàng hoặc fallback mặc định
  const customer = MOCK_CUSTOMER_DETAILS[id] || {
    id: id,
    name: "Ninja Shinobi (" + id + ")",
    email: "shinobi." + id.toLowerCase() + "@ninja.com",
    phone: "+84 999 000 111",
    village: "Hidden Leaf Village Sector 7",
    billingAddress: "Same as shipping address",
    rank: "JONIN",
    status: "active",
    totalOrders: 2,
    totalSpent: 270.0,
    joinedDate: "2025-04-10",
    notes: "Standard Ninja customer record.",
    orders: [
      {
        id: "SHINOBI-9901",
        date: "2026-07-01",
        status: "delivered",
        itemsCount: 2,
        total: 150.0,
      },
      {
        id: "SHINOBI-9820",
        date: "2026-06-15",
        status: "delivered",
        itemsCount: 1,
        total: 120.0,
      },
    ],
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            <CheckCircle2 size={11} /> COMPLETED
          </span>
        );
      case "in_transit":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase bg-blue-500/10 text-blue-600 border border-blue-500/20">
            <Truck size={11} /> IN TRANSIT
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase bg-amber-500/10 text-amber-600 border border-amber-500/20">
            <Clock size={11} /> PROCESSING
          </span>
        );
    }
  };

  return (
    <div className="w-full min-h-screen bg-white text-brand-dark p-6 sm:p-8 font-mono space-y-8">
      {/* HEADER & BACK BUTTON */}
      <div className="border-b border-brand-dark/15 pb-6 space-y-4">
        <Link
          href="/admin/customers"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase text-brand-dark/60 hover:text-orange-500 transition-colors"
        >
          <ArrowLeft size={14} /> BACK TO CUSTOMERS LIST
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-brand-dark text-white flex items-center justify-center font-bold text-2xl border-2 border-brand-dark shrink-0">
              {customer.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-heading tracking-wide uppercase">
                  {customer.name}
                </h1>
                <span className="text-xs font-bold px-2.5 py-0.5 bg-amber-500/10 text-amber-600 border border-amber-500/30 uppercase inline-flex items-center gap-1">
                  <Crown size={12} /> {customer.rank}
                </span>
              </div>
              <p className="text-xs text-brand-dark/60 mt-0.5">
                CUSTOMER ID:{" "}
                <strong className="text-brand-dark">{customer.id}</strong> |
                JOINED: {customer.joinedDate}
              </p>
            </div>
          </div>

          {/* COMPONENT NÚT THAO TÁC CÓ MODAL */}
          <CustomerActions customer={customer} />
        </div>
      </div>

      {/* QUICK METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border border-brand-dark/15 p-5 bg-white space-y-1">
          <span className="text-[10px] font-bold text-brand-dark/50 uppercase">
            LIFETIME SPENT
          </span>
          <p className="text-2xl font-extrabold text-orange-600">
            $
            {customer.totalSpent.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </p>
        </div>

        <div className="border border-brand-dark/15 p-5 bg-white space-y-1">
          <span className="text-[10px] font-bold text-brand-dark/50 uppercase">
            TOTAL DISPATCH ORDERS
          </span>
          <p className="text-2xl font-extrabold text-brand-dark">
            {customer.totalOrders} ORDERS
          </p>
        </div>

        <div className="border border-brand-dark/15 p-5 bg-white space-y-1">
          <span className="text-[10px] font-bold text-brand-dark/50 uppercase">
            AVERAGE ORDER VALUE
          </span>
          <p className="text-2xl font-extrabold text-brand-dark">
            ${(customer.totalSpent / (customer.totalOrders || 1)).toFixed(2)}
          </p>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* THÔNG TIN LIÊN HỆ */}
        <div className="space-y-6 lg:col-span-1">
          <div className="border border-brand-dark/15 p-5 space-y-4 bg-white">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-dark border-b border-brand-dark/10 pb-2">
              CONTACT & VILLAGE DATA
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <Mail size={14} className="text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-brand-dark/50 block uppercase">
                    EMAIL
                  </span>
                  <a
                    href={`mailto:${customer.email}`}
                    className="font-bold text-brand-dark hover:underline"
                  >
                    {customer.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone size={14} className="text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-brand-dark/50 block uppercase">
                    PHONE / CHAKRA FREQ
                  </span>
                  <span className="font-bold text-brand-dark">
                    {customer.phone}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin size={14} className="text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-brand-dark/50 block uppercase">
                    PRIMARY SHIPPING ADDRESS
                  </span>
                  <span className="text-brand-dark/90 leading-relaxed block">
                    {customer.village}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin
                  size={14}
                  className="text-brand-dark/40 shrink-0 mt-0.5"
                />
                <div>
                  <span className="text-[10px] text-brand-dark/50 block uppercase">
                    BILLING ADDRESS
                  </span>
                  <span className="text-brand-dark/90 leading-relaxed block">
                    {customer.billingAddress}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-brand-dark/15 p-5 space-y-3 bg-brand-dark/5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-dark">
              ADMIN INTERNAL NOTES
            </h2>
            <p className="text-xs text-brand-dark/80 italic leading-relaxed">
              "{customer.notes}"
            </p>
          </div>
        </div>

        {/* BẢNG LỊCH SỬ ĐƠN HÀNG (MISSION ORDER HISTORY) */}
        <div className="space-y-6 lg:col-span-2">
          <div className="border border-brand-dark/15 p-6 space-y-4 bg-white">
            <div className="flex items-center justify-between border-b border-brand-dark/10 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-brand-dark flex items-center gap-2">
                <ShoppingBag size={16} className="text-orange-500" />
                MISSION ORDER HISTORY ({customer.orders.length})
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-brand-dark/20 text-[10px] text-brand-dark/50 uppercase bg-brand-dark/5">
                    <th className="py-2.5 px-3">ORDER ID</th>
                    <th className="py-2.5 px-3">DISPATCH DATE</th>
                    <th className="py-2.5 px-3">STATUS</th>
                    <th className="py-2.5 px-3 text-right">TOTAL AMOUNT</th>
                    <th className="py-2.5 px-3 text-center">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-dark/10">
                  {customer.orders.length > 0 ? (
                    customer.orders.map((order: any) => (
                      <tr
                        key={order.id}
                        className="hover:bg-brand-dark/5 transition-colors"
                      >
                        <td className="py-3.5 px-3 font-bold text-brand-dark">
                          #{order.id}
                        </td>
                        <td className="py-3.5 px-3 text-brand-dark/60">
                          {order.date}
                        </td>
                        <td className="py-3.5 px-3">
                          {getOrderStatusBadge(order.status)}
                        </td>
                        <td className="py-3.5 px-3 text-right font-bold text-orange-600">
                          ${order.total.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-dark hover:text-orange-600 transition-colors uppercase border border-brand-dark/20 px-2 py-1 bg-white hover:bg-brand-dark/5"
                          >
                            VIEW <ExternalLink size={10} />
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-8 text-center text-brand-dark/50 italic"
                      >
                        NO MISSION ORDERS RECORDED FOR THIS SHINOBI YET.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
