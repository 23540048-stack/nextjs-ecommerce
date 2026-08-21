"use client";

import React, { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { api } from "@/lib/api";
import {
  Search,
  Eye,
  Filter,
  Scroll,
  ShoppingBag,
  DollarSign,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  MapPin,
  User,
  CreditCard,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";

export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCEL_REQUESTED"
  | "CANCELLED";

export type PaymentStatus = "PAID" | "UNPAID" | "REFUNDED";
export type PaymentMethod = "COD" | "VNPAY";

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerRank: string;
  village: string;
  address: string;
  phone: string;
  createdAt: string;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  items: OrderItem[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | OrderStatus>("ALL");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Chuẩn hóa phương thức thanh toán
  const normalizePaymentMethod = (methodRaw?: string): PaymentMethod => {
    const method = (methodRaw || "").toUpperCase();
    if (method.includes("VNPAY") || method.includes("ONLINE")) {
      return "VNPAY";
    }
    return "COD";
  };

  // Chuẩn hóa trạng thái đơn hàng từ Backend
  const normalizeOrderStatus = (statusRaw?: string): OrderStatus => {
    const status = (statusRaw || "PENDING").toUpperCase();
    switch (status) {
      case "PENDING":
        return "PENDING";
      case "PROCESSING":
        return "PROCESSING";
      case "IN_TRANSIT":
      case "SHIPPED":
      case "SHIPPING":
        return "SHIPPED";
      case "DELIVERED":
      case "COMPLETED":
        return "DELIVERED";
      case "CANCEL_REQUESTED":
      case "REQUEST_CANCEL":
      case "CANCELED_REQUEST":
      case "PENDING_CANCEL":
      case "CANCEL_PENDING":
        return "CANCEL_REQUESTED";
      case "CANCELLED":
      case "CANCELED":
        return "CANCELLED";
      default:
        return "PENDING";
    }
  };

  // 1. CALL API LẤY DANH SÁCH ĐƠN HÀNG TỪ NESTJS
  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get("orders/admin");

      const rawData = Array.isArray(response.data)
        ? response.data
        : response.data?.data ||
          response.data?.items ||
          response.data?.orders ||
          response.data?.result ||
          [];

      if (!Array.isArray(rawData)) {
        throw new Error(
          "Order data received from the server is not in list format.",
        );
      }

      const formattedOrders: Order[] = rawData.map((order: any) => {
        const status = normalizeOrderStatus(order.status);
        const paymentMethod = normalizePaymentMethod(order.paymentMethod);

        let paymentStatus: PaymentStatus = "UNPAID";
        if (order.paymentStatus) {
          paymentStatus = order.paymentStatus.toUpperCase() as PaymentStatus;
        } else if (paymentMethod === "VNPAY" || status === "DELIVERED") {
          paymentStatus = "PAID";
        } else if (status === "CANCELLED") {
          paymentStatus = "REFUNDED";
        }

        const userInfo =
          typeof order.user === "object" && order.user !== null
            ? order.user
            : {};

        const orderId = String(order._id || order.id || "");

        return {
          id: orderId,
          customerName:
            userInfo.fullName ||
            userInfo.name ||
            order.customerName ||
            (typeof order.shippingAddress === "object"
              ? order.shippingAddress?.fullName
              : null) ||
            "Shinobi Guest",
          customerRank: userInfo.rank || order.customerRank || "Genin",
          village:
            userInfo.village || order.village || "Konohagakure (Làng Lá)",
          address:
            typeof order.shippingAddress === "string"
              ? order.shippingAddress
              : order.shippingAddress?.address || "N/A",
          phone:
            userInfo.phone ||
            order.phone ||
            (typeof order.shippingAddress === "object"
              ? order.shippingAddress?.phone
              : null) ||
            "N/A",
          createdAt: order.createdAt
            ? new Date(order.createdAt).toLocaleString("vi-VN")
            : new Date().toLocaleString("vi-VN"),
          totalAmount:
            order.totalPrice ?? order.totalAmount ?? order.total ?? 0,
          paymentMethod,
          paymentStatus,
          status,
          items: (order.items || []).map((item: any) => ({
            id: String(
              item._id ||
                item.productId?._id ||
                item.productId ||
                item.id ||
                "",
            ),
            name:
              item.name ||
              item.productId?.name ||
              item.product?.name ||
              "Equipment Item",
            price: item.price ?? item.productId?.price ?? 0,
            quantity: item.quantity ?? 1,
          })),
        };
      });

      setOrders(formattedOrders);
    } catch (err: any) {
      console.error("Lỗi lấy danh sách đơn hàng:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load the order list!",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 2. CALL API CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG
  const handleUpdateStatus = async (
    orderId: string,
    newStatus: OrderStatus,
  ) => {
    setUpdatingId(orderId);
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });

      setOrders((prev) =>
        prev.map((ord) => {
          if (ord.id === orderId) {
            const updatedPaymentStatus: PaymentStatus =
              newStatus === "DELIVERED"
                ? "PAID"
                : newStatus === "CANCELLED"
                  ? "REFUNDED"
                  : ord.paymentStatus;

            return {
              ...ord,
              status: newStatus,
              paymentStatus: updatedPaymentStatus,
            };
          }
          return ord;
        }),
      );

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) =>
          prev
            ? {
                ...prev,
                status: newStatus,
                paymentStatus:
                  newStatus === "DELIVERED"
                    ? "PAID"
                    : newStatus === "CANCELLED"
                      ? "REFUNDED"
                      : prev.paymentStatus,
              }
            : null,
        );
      }
    } catch (err: any) {
      console.error("Lỗi cập nhật trạng thái:", err);
      alert(
        err.response?.data?.message ||
          "Không thể cập nhật trạng thái đơn hàng!",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // Lọc danh sách đơn hàng
  const filteredOrders = orders.filter((order) => {
    const idStr = order.id || "";
    const nameStr = order.customerName || "";
    const villageStr = order.village || "";
    const term = searchTerm.toLowerCase();

    const matchesSearch =
      idStr.toLowerCase().includes(term) ||
      nameStr.toLowerCase().includes(term) ||
      villageStr.toLowerCase().includes(term);

    const matchesStatus =
      statusFilter === "ALL" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const renderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-600 px-2 py-0.5 text-[10px] font-bold">
            <Clock size={12} /> PENDING
          </span>
        );
      case "PROCESSING":
        return (
          <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 border border-blue-600 px-2 py-0.5 text-[10px] font-bold">
            <ShoppingBag size={12} /> PROCESSING
          </span>
        );
      case "SHIPPED":
        return (
          <span className="inline-flex items-center gap-1 text-purple-700 bg-purple-50 border border-purple-600 px-2 py-0.5 text-[10px] font-bold">
            <Truck size={12} /> SHIPPED
          </span>
        );
      case "DELIVERED":
        return (
          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-600 px-2 py-0.5 text-[10px] font-bold">
            <CheckCircle2 size={12} /> DELIVERED
          </span>
        );
      case "CANCEL_REQUESTED":
        return (
          <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-100 border border-amber-600 px-2 py-0.5 text-[10px] font-bold animate-pulse">
            <AlertCircle size={12} /> CANCEL REQUESTED
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 border border-rose-600 px-2 py-0.5 text-[10px] font-bold">
            <XCircle size={12} /> CANCELLED
          </span>
        );
    }
  };

  const totalRevenue = orders
    .filter((o) => o.status !== "CANCELLED")
    .reduce((acc, curr) => acc + curr.totalAmount, 0);

  const pendingCount = orders.filter((o) => o.status === "PENDING").length;
  const cancelRequestsCount = orders.filter(
    (o) => o.status === "CANCEL_REQUESTED",
  ).length;

  return (
    <div className="space-y-6 font-mono">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-brand-dark/15">
        <div>
          <span className="bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 tracking-widest uppercase">
            NINJA MISSION REGISTRY
          </span>
          <h1 className="font-heading text-2xl sm:text-3xl tracking-wider text-brand-dark mt-1 uppercase flex items-center gap-2">
            <Scroll className="text-orange-600 shrink-0" size={28} />
            ORDER MANAGEMENT
          </h1>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={RefreshCw}
          onClick={fetchOrders}
          disabled={isLoading}
        >
          REFRESH DATA
        </Button>
      </div>

      {/* QUICK STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border-2 border-brand-dark p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-[10px] text-brand-dark/60 font-bold uppercase">
            Total Revenue ($)
          </div>
          <div className="text-2xl font-bold text-orange-600 mt-1 flex items-center gap-2">
            ${totalRevenue.toLocaleString()}
          </div>
        </div>

        <div className="bg-white border-2 border-brand-dark p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-[10px] text-brand-dark/60 font-bold uppercase">
            Pending Approval
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-1 flex items-center gap-2">
            <Clock size={20} />
            {pendingCount} Missions
          </div>
        </div>

        <div className="bg-white border-2 border-brand-dark p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-[10px] text-brand-dark/60 font-bold uppercase">
            Cancel Requests
          </div>
          <div className="text-2xl font-bold text-rose-600 mt-1 flex items-center gap-2">
            <AlertCircle size={20} />
            {cancelRequestsCount} Requests
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="bg-white border-2 border-brand-dark p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="w-full md:w-80">
          <Input
            placeholder="Search Order ID, Shinobi Name or Village..."
            icon={Search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Filter size={16} className="text-brand-dark/50 shrink-0 mr-1" />
          {(
            [
              "ALL",
              "PENDING",
              "PROCESSING",
              "SHIPPED",
              "DELIVERED",
              "CANCEL_REQUESTED",
              "CANCELLED",
            ] as const
          ).map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "chakra" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(status)}
            >
              {status === "CANCEL_REQUESTED" ? "CANCEL REQ" : status}
            </Button>
          ))}
        </div>
      </div>

      {/* LOADING / ERROR STATE / DATA TABLE */}
      {isLoading ? (
        <div className="bg-white border-2 border-brand-dark p-12 text-center space-y-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <Loader2 size={32} className="animate-spin text-orange-600 mx-auto" />
          <p className="text-xs font-bold uppercase tracking-widest text-brand-dark/60">
            FETCHING MISSION ORDERS FROM BACKEND...
          </p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border-2 border-rose-600 p-8 text-center space-y-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <AlertCircle size={32} className="text-rose-600 mx-auto" />
          <p className="text-xs font-bold uppercase text-rose-700">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchOrders}>
            RETRY FETCHING
          </Button>
        </div>
      ) : (
        <div className="bg-white border-2 border-brand-dark shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-dark text-brand-ivory border-b-2 border-brand-dark">
              <tr>
                <th className="p-3 uppercase">Order ID</th>
                <th className="p-3 uppercase">Shinobi Customer</th>
                <th className="p-3 uppercase">Village / Location</th>
                <th className="p-3 uppercase">Total Amount</th>
                <th className="p-3 uppercase">Payment Method</th>
                <th className="p-3 uppercase">Status</th>
                <th className="p-3 uppercase">Date</th>
                <th className="p-3 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-dark/15">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-orange-500/5 transition-colors"
                  >
                    <td className="p-3 font-bold text-brand-dark">
                      #{(order.id || "").slice(-6).toUpperCase()}
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-brand-dark">
                        {order.customerName}
                      </div>
                      <div className="text-[10px] text-brand-dark/60">
                        {order.customerRank}
                      </div>
                    </td>
                    <td className="p-3 text-brand-dark/80">{order.village}</td>
                    <td className="p-3 font-bold text-orange-600">
                      ${order.totalAmount.toLocaleString()}
                    </td>
                    <td className="p-3">
                      <span className="border border-brand-dark bg-brand-ivory px-2 py-0.5 text-[10px] font-bold uppercase">
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td className="p-3">{renderStatusBadge(order.status)}</td>
                    <td className="p-3 text-brand-dark/70 text-[11px] whitespace-nowrap">
                      {order.createdAt}
                    </td>
                    <td className="p-3 text-right whitespace-nowrap space-x-1">
                      {order.status === "CANCEL_REQUESTED" && (
                        <Button
                          variant="danger"
                          size="sm"
                          disabled={updatingId === order.id}
                          onClick={() =>
                            handleUpdateStatus(order.id, "CANCELLED")
                          }
                        >
                          APPROVE CANCEL
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Eye}
                        onClick={() => setSelectedOrder(order)}
                      >
                        DETAILS
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="p-8 text-center text-brand-dark/50 font-bold"
                  >
                    NO ORDERS FOUND MATCHING YOUR CRITERIA.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL CHI TIẾT ĐƠN HÀNG */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`MISSION SCROLL DETAILS - #${(selectedOrder?.id || "").slice(-6).toUpperCase()}`}
      >
        {selectedOrder && (
          <div className="space-y-5 font-mono text-xs text-brand-dark">
            {/* YÊU CẦU HỦY BANNER (NẾU CÓ) */}
            {selectedOrder.status === "CANCEL_REQUESTED" && (
              <div className="bg-amber-100 border-2 border-amber-600 p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-amber-900">
                  <AlertCircle size={20} className="text-amber-600 shrink-0" />
                  <div>
                    <div className="font-bold uppercase text-xs">
                      Yêu cầu hủy từ khách hàng
                    </div>
                    <div className="text-[11px] text-amber-800">
                      Khách hàng đã gửi yêu cầu hủy đơn này. Chọn đồng ý để hủy
                      hoặc từ chối để tiếp tục xử lý.
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                  <Button
                    variant="danger"
                    size="sm"
                    disabled={updatingId === selectedOrder.id}
                    onClick={() =>
                      handleUpdateStatus(selectedOrder.id, "CANCELLED")
                    }
                  >
                    DUYỆT HỦY (APPROVE)
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={updatingId === selectedOrder.id}
                    onClick={() =>
                      handleUpdateStatus(selectedOrder.id, "PROCESSING")
                    }
                  >
                    TỪ CHỐI (REJECT)
                  </Button>
                </div>
              </div>
            )}

            {/* STATUS SELECTOR BAR */}
            <div className="bg-brand-ivory/50 border-2 border-brand-dark p-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-brand-dark/60 block">
                  Current Mission Status
                </span>
                <div className="mt-0.5">
                  {renderStatusBadge(selectedOrder.status)}
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] uppercase font-bold text-brand-dark/80 mr-1">
                  Update Status:
                </span>

                {(
                  [
                    { status: "PENDING", label: "PENDING" },
                    { status: "PROCESSING", label: "PROCESS" },
                    { status: "SHIPPED", label: "SHIP" },
                    { status: "DELIVERED", label: "DELIVER" },
                  ] as const
                ).map((item) => (
                  <Button
                    key={item.status}
                    variant={
                      selectedOrder.status === item.status
                        ? "chakra"
                        : "outline"
                    }
                    size="sm"
                    disabled={updatingId === selectedOrder.id}
                    onClick={() =>
                      handleUpdateStatus(selectedOrder.id, item.status)
                    }
                  >
                    {item.label}
                  </Button>
                ))}

                <Button
                  variant="danger"
                  size="sm"
                  disabled={updatingId === selectedOrder.id}
                  onClick={() =>
                    handleUpdateStatus(selectedOrder.id, "CANCELLED")
                  }
                >
                  CANCEL
                </Button>
              </div>
            </div>

            {/* CUSTOMER & SHIPPING INFO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border-2 border-brand-dark p-3 space-y-2 bg-white">
                <div className="font-bold border-b border-brand-dark/15 pb-1 flex items-center gap-1.5 uppercase text-orange-600">
                  <User size={14} /> Shinobi Receiver
                </div>
                <div>
                  <div className="font-bold">
                    {selectedOrder.customerName} ({selectedOrder.customerRank})
                  </div>
                  <div className="text-brand-dark/70 text-[11px]">
                    {selectedOrder.phone}
                  </div>
                </div>
              </div>

              <div className="border-2 border-brand-dark p-3 space-y-2 bg-white">
                <div className="font-bold border-b border-brand-dark/15 pb-1 flex items-center gap-1.5 uppercase text-orange-600">
                  <MapPin size={14} /> Delivery Location
                </div>
                <div>
                  <div className="font-bold">{selectedOrder.village}</div>
                  <div className="text-brand-dark/70 text-[11px]">
                    {selectedOrder.address}
                  </div>
                </div>
              </div>
            </div>

            {/* ORDERED ITEMS TABLE */}
            <div className="border-2 border-brand-dark overflow-hidden bg-white">
              <div className="bg-brand-dark text-brand-ivory px-3 py-2 font-bold uppercase text-[11px] flex justify-between items-center">
                <span>Gear Items Requested</span>
                <span className="flex items-center gap-1">
                  <CreditCard size={12} /> {selectedOrder.paymentMethod} (
                  <span
                    className={
                      selectedOrder.paymentStatus === "PAID"
                        ? "text-emerald-400"
                        : selectedOrder.paymentStatus === "REFUNDED"
                          ? "text-rose-400"
                          : "text-amber-400"
                    }
                  >
                    {selectedOrder.paymentStatus}
                  </span>
                  )
                </span>
              </div>

              <div className="divide-y divide-brand-dark/15 p-3 space-y-2">
                {selectedOrder.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center text-xs pt-1"
                  >
                    <div>
                      <div className="font-bold">{item.name}</div>
                      <div className="text-[10px] text-brand-dark/60">
                        ID: #{item.id}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">
                        {item.quantity} x ${item.price.toLocaleString()}
                      </div>
                      <div className="text-orange-600 font-bold">
                        ${(item.quantity * item.price).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}

                <div className="pt-3 border-t-2 border-brand-dark flex justify-between items-center text-sm font-bold">
                  <span>TOTAL MISSION COST:</span>
                  <span className="text-orange-600 text-base">
                    ${selectedOrder.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* FOOTER ACTIONS */}
            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedOrder(null)}
              >
                CLOSE SCROLL
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
