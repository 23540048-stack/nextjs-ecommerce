"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { api } from "@/lib/api";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  ArrowLeft,
  MapPin,
  Calendar,
  CreditCard,
  Eye,
  RefreshCw,
  X,
  Star,
  MessageSquarePlus,
  ImageIcon,
  Loader2,
  Edit3,
  Trash2,
  AlertTriangle,
} from "lucide-react";

import { useRouter } from "next/navigation";
interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  image: string;
  isReviewed?: boolean;
  rating?: number;
  comment?: string;
}

export type OrderStatus =
  | "pending"
  | "cancel_requested"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

interface Order {
  id: string;
  date: string;
  status: OrderStatus;
  paymentMethod: string;
  total: number;
  shippingAddress: string;
  items: OrderItem[];
  trackingCode?: string;
  cancelReason?: string;
}

type FilterStatus = "all" | OrderStatus;

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // STATE HỦY ĐƠN HÀNG
  const [selectedOrderForCancel, setSelectedOrderForCancel] =
    useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState<string>(
    "Want to change shipping address",
  );
  const [customCancelReason, setCustomCancelReason] = useState<string>("");
  const [isSubmittingCancel, setIsSubmittingCancel] = useState<boolean>(false);

  // STATE ĐÁNH GIÁ SẢN PHẨM (TẠO/SỬA)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedReviewItem, setSelectedReviewItem] = useState<{
    orderId: string;
    item: OrderItem;
  } | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // STATE XÓA ĐÁNH GIÁ
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    orderId: string;
    item: OrderItem;
  } | null>(null);
  const [isDeletingReview, setIsDeletingReview] = useState(false);

  const [isReordering, setIsReordering] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Chuẩn hóa trạng thái từ Backend NestJS
  const normalizeStatus = (statusRaw?: string): OrderStatus => {
    const status = (statusRaw || "PENDING").toLowerCase();
    switch (status) {
      case "pending":
        return "pending";
      case "cancel_requested":
      case "pending_cancel":
      case "cancelling":
        return "cancel_requested";
      case "processing":
        return "processing";
      case "shipped":
      case "in_transit":
      case "shipping":
        return "shipped";
      case "delivered":
      case "completed":
        return "delivered";
      case "cancelled":
      case "canceled":
        return "cancelled";
      default:
        return "pending";
    }
  };

  // Helper cập nhật state UI đồng bộ cho order list & detail modal
  const updateItemReviewState = (
    orderId: string,
    itemId: string,
    isReviewed: boolean,
    newRating?: number,
    newComment?: string,
  ) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        if (order.id === orderId) {
          return {
            ...order,
            items: order.items.map((item) =>
              item.id === itemId
                ? {
                    ...item,
                    isReviewed,
                    rating: newRating,
                    comment: newComment,
                  }
                : item,
            ),
          };
        }
        return order;
      }),
    );

    setSelectedOrder((prev) => {
      if (!prev || prev.id !== orderId) return prev;
      return {
        ...prev,
        items: prev.items.map((item) =>
          item.id === itemId
            ? {
                ...item,
                isReviewed,
                rating: newRating,
                comment: newComment,
              }
            : item,
        ),
      };
    });
  };

  // 1. CALL API LẤY DANH SÁCH ĐƠN HÀNG TỪ NESTJS
  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get("/orders");
      const rawData = response.data.data || response.data;

      const formattedOrders: Order[] = rawData.map((order: any) => ({
        id: order._id,
        date: new Date(order.createdAt).toLocaleDateString("vi-VN"),
        status: normalizeStatus(order.status),
        paymentMethod: order.paymentMethod || "COD",
        total: order.totalPrice ?? 0,
        shippingAddress: order.shippingAddress,
        trackingCode: order._id,
        cancelReason: order.cancelReason || "",
        items: (order.items || []).map((item: any) => {
          const realProductId =
            typeof item.productId === "object"
              ? item.productId?._id
              : typeof item.product === "object"
                ? item.product?._id
                : item.productId || item.product || item.id;

          return {
            id: item._id || realProductId,
            productId: String(realProductId),
            name: item.name || item.productId?.name,
            price: item.price ?? 0,
            quantity: item.quantity ?? 1,
            size: item.size || "FREE",
            color: item.color || "STANDARD",
            image: item.image || "/placeholder.png",
            isReviewed: item.isReviewed || false,
            rating: item.rating,
            comment: item.comment,
          };
        }),
      }));
      setOrders(formattedOrders);
    } catch (err: any) {
      console.error("Lỗi lấy danh sách đơn hàng:", err);
      const errMsg =
        err.response?.data?.message || "Failed to load mission orders scroll!";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // CALL API GỬI YÊU CẦU HỦY ĐƠN HÀNG
  const handleRequestCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForCancel) return;

    const finalReason =
      cancelReason === "Other reason" ? customCancelReason : cancelReason;

    if (!finalReason.trim()) {
      toast.error("Please specify a reason for cancellation.");
      return;
    }

    setIsSubmittingCancel(true);
    try {
      await api.patch(`/orders/${selectedOrderForCancel.id}/cancel-request`, {
        cancelReason: finalReason,
      });

      toast.success("Cancellation request submitted! Awaiting admin approval.");

      setOrders((prev) =>
        prev.map((order) =>
          order.id === selectedOrderForCancel.id
            ? {
                ...order,
                status: "cancel_requested",
                cancelReason: finalReason,
              }
            : order,
        ),
      );

      if (selectedOrder?.id === selectedOrderForCancel.id) {
        setSelectedOrder((prev) =>
          prev
            ? { ...prev, status: "cancel_requested", cancelReason: finalReason }
            : null,
        );
      }

      setSelectedOrderForCancel(null);
      setCancelReason("Want to change shipping address");
      setCustomCancelReason("");
    } catch (err: any) {
      console.error("Lỗi gửi yêu cầu hủy đơn:", err);
      toast.error(
        err.response?.data?.message || "Failed to submit cancellation request.",
      );
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  // 2. MỞ MODAL ĐÁNH GIÁ (TẠO MỚI HOẶC SỬA)
  const handleOpenReview = (orderId: string, item: OrderItem) => {
    setSelectedReviewItem({ orderId, item });
    setRating(item.rating || 5);
    setHoverRating(0);
    setComment(item.comment || "");
    setSelectedFiles([]);
    setPreviewImages([]);
    setIsReviewModalOpen(true);
  };

  // 3. MỞ MODAL XÁC NHẬN XÓA
  const handleOpenDeleteModal = (orderId: string, item: OrderItem) => {
    setItemToDelete({ orderId, item });
    setIsDeleteModalOpen(true);
  };

  // 4. XỬ LÝ CHỌN FILE ẢNH
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      if (selectedFiles.length + newFiles.length > 5) {
        toast.error("You can upload a maximum of 5 field photos.");
        return;
      }
      setSelectedFiles((prev) => [...prev, ...newFiles].slice(0, 5));

      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setPreviewImages((prev) => [...prev, ...newPreviews].slice(0, 5));
      toast.success(`${newFiles.length} photo(s) attached successfully.`);
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
    toast.success("Photo removed successfully.");
  };

  // 5. CALL API GỬI / CẬP NHẬT ĐÁNH GIÁ
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReviewItem) return;

    if (!comment.trim()) {
      toast.error("Please enter your review comment.");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const formData = new FormData();
      formData.append("rating", rating.toString());
      formData.append("comment", comment);
      formData.append("orderId", selectedReviewItem.orderId);
      formData.append("itemId", selectedReviewItem.item.id);

      selectedFiles.forEach((file) => {
        formData.append("images", file);
      });

      await api.post(
        `/products/${selectedReviewItem.item.productId}/reviews`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      toast.success(
        selectedReviewItem.item.isReviewed
          ? "Review updated successfully!"
          : "Review submitted successfully!",
      );

      updateItemReviewState(
        selectedReviewItem.orderId,
        selectedReviewItem.item.id,
        true,
        rating,
        comment,
      );

      setIsReviewModalOpen(false);
    } catch (err: any) {
      console.error("Lỗi gửi đánh giá:", err);
      toast.error(
        err.response?.data?.message || "Failed to submit review. Try again!",
      );
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // 6. CALL API XÓA ĐÁNH GIÁ
  const handleConfirmDeleteReview = async () => {
    if (!itemToDelete) return;

    setIsDeletingReview(true);
    try {
      await api.delete(
        `/products/${itemToDelete.item.productId}/reviews?orderId=${itemToDelete.orderId}&itemId=${itemToDelete.item.id}`,
      );

      toast.success("Review deleted successfully!");

      updateItemReviewState(
        itemToDelete.orderId,
        itemToDelete.item.id,
        false,
        undefined,
        "",
      );

      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (err: any) {
      console.error("Error deleting review:", err);
      toast.error(
        err.response?.data?.message || "Failed to delete review. Try again!",
      );
    } finally {
      setIsDeletingReview(false);
    }
  };

  // 7. CALL API MUA LẠI ĐƠN HÀNG (REORDER)
  const handleReorder = async (order: Order) => {
    setIsReordering(order.id);
    try {
      const itemsToReorder = order.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      }));

      await api.post("/cart/add-bulk", { items: itemsToReorder });
      toast.success("Reorder items added to cart successfully!");

      // Chuyển hướng sang trang Giỏ hàng
      router.push("/cart");
    } catch (err: any) {
      console.error("Error repurchasing::", err);
      toast.error(err.response?.data?.message || "Failed to reorder items!");
    } finally {
      setIsReordering(null);
    }
  };

  // Lọc danh sách đơn hàng
  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      filterStatus === "all" ? true : order.status === filterStatus;
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase bg-amber-500/10 text-amber-600 border border-amber-500/20">
            <Clock size={12} /> PENDING
          </span>
        );
      case "cancel_requested":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase bg-rose-500/10 text-rose-600 border border-rose-500/20">
            <AlertTriangle size={12} /> CANCEL REQUESTED
          </span>
        );
      case "processing":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase bg-blue-500/10 text-blue-600 border border-blue-500/20">
            <RefreshCw size={12} className="animate-spin" /> PROCESSING
          </span>
        );
      case "shipped":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase bg-purple-500/10 text-purple-600 border border-purple-500/20">
            <Truck size={12} /> SHIPPED
          </span>
        );
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            <CheckCircle2 size={12} /> DELIVERED
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase bg-gray-500/10 text-gray-600 border border-gray-500/20">
            <XCircle size={12} /> CANCELLED
          </span>
        );
    }
  };

  return (
    <div className="w-full min-h-screen bg-white text-brand-dark py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* BREADCRUMB & HEADER */}
        <div className="border-b border-brand-dark/15 pb-6">
          <div className="flex items-center gap-2 font-mono text-xs text-brand-dark/60 uppercase mb-2">
            <Link href="/" className="hover:text-orange-500 transition-colors">
              HOME
            </Link>
            <span>/</span>
            <Link
              href="/account"
              className="hover:text-orange-500 transition-colors"
            >
              ACCOUNT
            </Link>
            <span>/</span>
            <span className="text-brand-dark font-bold">MISSION ORDERS</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-heading tracking-wide uppercase">
                MISSION ORDERS SCROLL
              </h1>
              <p className="font-mono text-xs text-brand-dark/60 mt-1">
                TRACK YOUR SHINOBI EQUIPMENT DISPATCH HISTORY
              </p>
            </div>

            <Link href="/shop">
              <Button variant="ghost" size="sm" icon={ArrowLeft}>
                RETURN TO ARCHIVE
              </Button>
            </Link>
          </div>
        </div>

        {/* SEARCH & STATUS FILTER TABS */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center font-mono text-xs">
          <div className="flex flex-wrap gap-2 border-b md:border-b-0 border-brand-dark/10 pb-2 md:pb-0">
            {(
              [
                { id: "all", label: "ALL MISSIONS" },
                { id: "pending", label: "PENDING" },
                { id: "cancel_requested", label: "CANCEL REQUESTED" },
                { id: "processing", label: "PROCESSING" },
                { id: "shipped", label: "SHIPPED" },
                { id: "delivered", label: "COMPLETED" },
                { id: "cancelled", label: "CANCELLED" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`px-3 py-2 uppercase font-bold transition-colors cursor-pointer border ${
                  filterStatus === tab.id
                    ? "bg-brand-dark text-white border-brand-dark"
                    : "bg-white text-brand-dark/70 border-brand-dark/15 hover:border-brand-dark"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-dark/40"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH ORDER ID OR ITEM..."
              className="w-full bg-brand-dark/5 text-brand-dark border border-brand-dark/15 pl-9 pr-3 py-2 font-mono text-xs outline-none focus:border-orange-500 placeholder:text-brand-dark/40"
            />
          </div>
        </div>

        {/* LOADING STATE */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4 font-mono">
            <Loader2 size={36} className="animate-spin text-orange-500" />
            <p className="text-xs uppercase tracking-widest text-brand-dark/60">
              FETCHING MISSION SCROLLS...
            </p>
          </div>
        ) : error ? (
          /* ERROR STATE */
          <div className="border border-rose-500/20 bg-rose-500/5 p-8 text-center space-y-4 font-mono">
            <p className="text-rose-600 text-xs font-bold uppercase">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchOrders}>
              RETRY FETCHING
            </Button>
          </div>
        ) : filteredOrders.length > 0 ? (
          /* ORDERS LIST */
          <div className="space-y-6 font-mono">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="border border-brand-dark/15 bg-white hover:border-brand-dark/40 transition-all space-y-4 p-5 sm:p-6"
              >
                {/* CARD HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-dark/10 pb-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-sm text-brand-dark">
                        #{order.id}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="flex items-center gap-4 text-brand-dark/60 text-[11px]">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} /> {order.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <CreditCard size={12} /> {order.paymentMethod}
                      </span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-[10px] text-brand-dark/50 uppercase">
                      TOTAL AMOUNT
                    </p>
                    <p className="font-bold text-base text-orange-600">
                      ${order.total.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* ITEMS PREVIEW */}
                <div className="divide-y divide-brand-dark/10">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative w-14 h-14 bg-brand-dark/5 border border-brand-dark/10 shrink-0 overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="object-cover"
                          />
                        </div>
                        <div className="space-y-1">
                          <p className="font-bold uppercase text-brand-dark line-clamp-1">
                            {item.name}
                          </p>
                          <p className="text-[11px] text-brand-dark/60">
                            QTY: {item.quantity} | SIZE: {item.size} | COLOR:{" "}
                            {item.color}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-brand-dark/10">
                        <span className="font-bold text-brand-dark">
                          ${(item.price * item.quantity).toLocaleString()}
                        </span>

                        {/* NÚT ĐÁNH GIÁ KHI ĐÃ GIAO HÀNG (THÊM / SỬA / XÓA) */}
                        {order.status === "delivered" && (
                          <div>
                            {item.isReviewed ? (
                              <div className="flex items-center gap-1.5">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  icon={Edit3}
                                  onClick={() =>
                                    handleOpenReview(order.id, item)
                                  }
                                >
                                  EDIT
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  icon={Trash2}
                                  className="text-rose-600 border-rose-500/30 hover:bg-rose-500/10 hover:border-rose-500"
                                  onClick={() =>
                                    handleOpenDeleteModal(order.id, item)
                                  }
                                >
                                  DELETE
                                </Button>
                              </div>
                            ) : (
                              <Button
                                variant="chakra"
                                size="sm"
                                icon={MessageSquarePlus}
                                onClick={() => handleOpenReview(order.id, item)}
                              >
                                REVIEW
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* CARD ACTIONS */}
                <div className="pt-3 border-t border-brand-dark/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-1.5 text-[11px] text-brand-dark/70">
                    <MapPin size={13} className="text-orange-500 shrink-0" />
                    <span className="line-clamp-1">
                      {order.shippingAddress}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {order.status === "pending" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-rose-500/40 text-rose-600 hover:bg-rose-500/10 hover:border-rose-500"
                        onClick={() => {
                          setSelectedOrderForCancel(order);
                          setCancelReason("Want to change shipping address");
                          setCustomCancelReason("");
                        }}
                      >
                        CANCEL ORDER
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Eye}
                      onClick={() => setSelectedOrder(order)}
                    >
                      VIEW DETAILS
                    </Button>
                    {order.status === "delivered" && (
                      <Button
                        variant="chakra"
                        size="sm"
                        icon={RefreshCw}
                        disabled={isReordering === order.id}
                        onClick={() => handleReorder(order)}
                      >
                        {isReordering === order.id ? "ADDING..." : "REORDER"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* EMPTY STATE */
          <div className="border border-dashed border-brand-dark/20 p-12 text-center space-y-6 bg-brand-dark/5 my-8 font-mono">
            <div className="w-16 h-16 mx-auto rounded-full bg-brand-dark/10 flex items-center justify-center text-brand-dark/40">
              <Package size={32} />
            </div>
            <div className="space-y-2">
              <h2 className="font-heading text-xl tracking-wide uppercase text-brand-dark">
                NO MISSION ORDERS FOUND
              </h2>
              <p className="text-xs text-brand-dark/60 max-w-md mx-auto">
                No orders match your filter criteria. Start exploring the
                archive to place your first equipment dispatch.
              </p>
            </div>
            <div className="pt-2">
              <Link href="/shop">
                <Button variant="chakra" size="md">
                  EXPLORE ARCHIVE
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-mono">
          <div className="bg-white border border-brand-dark max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto relative shadow-2xl">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 text-brand-dark/60 hover:text-brand-dark transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="border-b border-brand-dark/15 pb-4 space-y-1">
              <p className="text-[10px] text-orange-600 font-bold uppercase tracking-wider">
                MISSION ORDER SCROLL DETAILS
              </p>
              <div className="flex items-center gap-3">
                <h2 className="font-heading text-2xl uppercase">
                  #{selectedOrder.id}
                </h2>
                {getStatusBadge(selectedOrder.status)}
              </div>
            </div>

            {selectedOrder.status === "cancel_requested" &&
              selectedOrder.cancelReason && (
                <div className="bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 space-y-1">
                  <p className="font-bold flex items-center gap-1">
                    <AlertTriangle size={14} /> CANCELLATION REQUESTED
                  </p>
                  <p className="italic">
                    Reason: "{selectedOrder.cancelReason}"
                  </p>
                </div>
              )}

            {selectedOrder.trackingCode && (
              <div className="bg-brand-dark/5 p-4 border border-brand-dark/15 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-brand-dark uppercase flex items-center gap-2">
                    <Truck size={14} className="text-orange-500" /> COURIER
                    TRACKING ID
                  </span>
                  <span className="text-orange-600 font-bold">
                    {selectedOrder.trackingCode}
                  </span>
                </div>
                <p className="text-[11px] text-brand-dark/60">
                  Carrier: Secret Anbu Courier Express
                </p>
              </div>
            )}

            <div className="space-y-3">
              <p className="text-xs font-bold uppercase text-brand-dark">
                EQUIPMENT ITEMS ({selectedOrder.items.length})
              </p>
              <div className="divide-y divide-brand-dark/10 border border-brand-dark/15">
                {selectedOrder.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 flex items-center justify-between gap-4 text-xs bg-white"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 bg-brand-dark/5 border border-brand-dark/10 shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-bold uppercase text-brand-dark">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-brand-dark/60">
                          QTY: {item.quantity} | SIZE: {item.size}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold">
                        ${(item.price * item.quantity).toLocaleString()}
                      </span>
                      {selectedOrder.status === "delivered" && (
                        <div>
                          {item.isReviewed ? (
                            <div className="flex items-center gap-1.5">
                              <Button
                                variant="outline"
                                size="sm"
                                icon={Edit3}
                                onClick={() =>
                                  handleOpenReview(selectedOrder.id, item)
                                }
                              >
                                EDIT
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                icon={Trash2}
                                className="text-rose-600 border-rose-500/30 hover:bg-rose-500/10 hover:border-rose-500"
                                onClick={() =>
                                  handleOpenDeleteModal(selectedOrder.id, item)
                                }
                              >
                                DELETE
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="chakra"
                              size="sm"
                              icon={MessageSquarePlus}
                              onClick={() =>
                                handleOpenReview(selectedOrder.id, item)
                              }
                            >
                              REVIEW
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs border-t border-brand-dark/15 pt-4">
              <div className="space-y-1">
                <p className="font-bold uppercase text-brand-dark/60 text-[10px]">
                  DESTINATION ADDRESS
                </p>
                <p className="text-brand-dark">
                  {selectedOrder.shippingAddress}
                </p>
              </div>
              <div className="space-y-1">
                <p className="font-bold uppercase text-brand-dark/60 text-[10px]">
                  PAYMENT METHOD
                </p>
                <p className="text-brand-dark">{selectedOrder.paymentMethod}</p>
              </div>
            </div>

            <div className="border-t border-brand-dark/15 pt-4 flex justify-between items-center text-sm font-bold">
              <span>TOTAL ORDER AMOUNT</span>
              <span className="text-xl text-orange-600">
                ${selectedOrder.total.toLocaleString()}
              </span>
            </div>

            <div className="pt-2 space-y-2">
              {selectedOrder.status === "pending" && (
                <Button
                  variant="outline"
                  size="md"
                  className="w-full border-rose-500/40 text-rose-600 hover:bg-rose-500/10 hover:border-rose-500"
                  onClick={() => {
                    setSelectedOrderForCancel(selectedOrder);
                    setCancelReason("Want to change shipping address");
                    setCustomCancelReason("");
                  }}
                >
                  CANCEL ORDER
                </Button>
              )}
              <Button
                variant="outline"
                size="md"
                className="w-full"
                onClick={() => setSelectedOrder(null)}
              >
                CLOSE SCROLL
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* CANCEL ORDER MODAL */}
      <Modal
        isOpen={!!selectedOrderForCancel}
        onClose={() => setSelectedOrderForCancel(null)}
        title={`CANCEL ORDER #${selectedOrderForCancel?.id || ""}`}
        maxWidth="md"
      >
        {selectedOrderForCancel && (
          <form
            onSubmit={handleRequestCancel}
            className="space-y-4 font-mono text-xs"
          >
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-800 flex items-start gap-2">
              <AlertTriangle
                size={16}
                className="shrink-0 mt-0.5 text-amber-600"
              />
              <p>
                Please select a reason for cancelling this order. Your request
                will be sent to the administration team for approval.
              </p>
            </div>

            <div className="space-y-2">
              <label className="font-bold text-[11px] uppercase block text-brand-dark">
                REASON FOR CANCELLATION *
              </label>
              <div className="space-y-2">
                {[
                  "Want to change shipping address",
                  "Want to change product / size / color",
                  "Found a better price elsewhere",
                  "Changed my mind / No longer needed",
                  "Other reason",
                ].map((reason) => (
                  <label
                    key={reason}
                    className={`flex items-center gap-3 p-2.5 border text-xs cursor-pointer transition-all ${
                      cancelReason === reason
                        ? "border-rose-500 bg-rose-500/5 font-bold text-rose-600"
                        : "border-brand-dark/20 hover:border-brand-dark/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="cancelReason"
                      checked={cancelReason === reason}
                      onChange={() => setCancelReason(reason)}
                      className="accent-rose-600"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            {cancelReason === "Other reason" && (
              <div className="space-y-1.5">
                <label className="font-bold text-[11px] uppercase block text-brand-dark">
                  SPECIFY REASON *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Enter details for cancellation..."
                  value={customCancelReason}
                  onChange={(e) => setCustomCancelReason(e.target.value)}
                  className="w-full bg-brand-dark/5 border border-brand-dark/20 p-3 text-xs outline-none focus:border-rose-500 placeholder:text-brand-dark/40"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t border-brand-dark/15">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedOrderForCancel(null)}
              >
                BACK
              </Button>
              <Button
                type="submit"
                variant="chakra"
                size="sm"
                disabled={isSubmittingCancel}
                className="bg-rose-600 hover:bg-rose-700 text-white border-rose-600"
              >
                {isSubmittingCancel
                  ? "SUBMITTING..."
                  : "CONFIRM CANCEL REQUEST"}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* PRODUCT REVIEW & PHOTO UPLOAD MODAL (CREATE / EDIT) */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title={
          selectedReviewItem?.item.isReviewed
            ? "EDIT EQUIPMENT REVIEW SCROLL"
            : "EQUIPMENT REVIEW SCROLL"
        }
        maxWidth="lg"
      >
        {selectedReviewItem && (
          <form
            onSubmit={handleSubmitReview}
            className="space-y-4 font-mono text-xs"
          >
            <div className="flex items-center gap-3 p-3 bg-brand-dark/5 border border-brand-dark/15">
              <div className="relative w-12 h-12 bg-white border border-brand-dark/10 shrink-0">
                <img
                  src={selectedReviewItem.item.image}
                  alt={selectedReviewItem.item.name}
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-bold uppercase text-brand-dark">
                  {selectedReviewItem.item.name}
                </p>
                <p className="text-[11px] text-brand-dark/60">
                  SIZE: {selectedReviewItem.item.size} | COLOR:{" "}
                  {selectedReviewItem.item.color}
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-[11px] uppercase block text-brand-dark">
                CHAKRA RATING (1 - 5 STARS) *
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-110 focus:outline-none cursor-pointer"
                  >
                    <Star
                      size={24}
                      className={
                        star <= (hoverRating || rating)
                          ? "fill-amber-500 text-amber-500"
                          : "text-brand-dark/20"
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-[11px] uppercase block text-brand-dark">
                MISSION EXPERIENCE REVIEW *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Write your detailed gear inspection report..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full bg-brand-dark/5 border border-brand-dark/20 p-3 text-xs outline-none focus:border-orange-500 placeholder:text-brand-dark/40"
              />
            </div>

            <div className="space-y-2">
              <label className="font-bold text-[11px] uppercase block text-brand-dark">
                ATTACH FIELD PHOTOS (MAX 5)
              </label>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                id="review-photo-upload"
              />

              <div className="flex flex-wrap gap-2">
                {previewImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative w-16 h-16 border border-brand-dark/20 bg-brand-dark/5"
                  >
                    <img
                      src={img}
                      alt="Upload preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white p-0.5 border border-black cursor-pointer hover:bg-rose-700"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}

                {previewImages.length < 5 && (
                  <label
                    htmlFor="review-photo-upload"
                    className="w-16 h-16 border border-dashed border-brand-dark/30 flex flex-col items-center justify-center cursor-pointer bg-brand-dark/5 hover:border-orange-500 hover:text-orange-500 transition-colors"
                  >
                    <ImageIcon size={18} className="text-brand-dark/50" />
                    <span className="text-[9px] font-bold mt-1">+ UPLOAD</span>
                  </label>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-brand-dark/15">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsReviewModalOpen(false)}
              >
                CANCEL
              </Button>
              <Button
                type="submit"
                variant="chakra"
                size="sm"
                disabled={isSubmittingReview}
              >
                {isSubmittingReview
                  ? "SUBMITTING..."
                  : selectedReviewItem.item.isReviewed
                    ? "UPDATE REVIEW"
                    : "SUBMIT REVIEW SCROLL"}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* CONFIRM DELETE REVIEW MODAL */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="CONFIRM DELETE REVIEW"
        maxWidth="md"
      >
        <div className="space-y-4 font-mono text-xs">
          <div className="flex items-center gap-3 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600">
            <AlertTriangle size={20} className="shrink-0" />
            <p>
              Are you sure you want to delete your review for{" "}
              <span className="font-bold">"{itemToDelete?.item.name}"</span>?
              This action cannot be undone.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-brand-dark/15">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              CANCEL
            </Button>
            <Button
              type="button"
              variant="chakra"
              size="sm"
              className="bg-rose-600 hover:bg-rose-700 text-white border-rose-600"
              disabled={isDeletingReview}
              onClick={handleConfirmDeleteReview}
            >
              {isDeletingReview ? "DELETING..." : "CONFIRM DELETE"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
