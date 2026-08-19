export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type PaymentMethod =
  | "cod"
  | "bank_transfer"
  | "credit_card"
  | "momo"
  | "vnpay";

export interface OrderItem {
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

export interface ShippingAddress {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  ward?: string;
  district: string;
  city: string;
  country?: string;
  note?: string;
}

export interface Order {
  id: string;
  orderNumber: string; // Mã đơn hàng (ví dụ: SNB-2026-8899)
  userId?: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  subtotal: number;
  shippingFee: number;
  discount: number;
  totalAmount: number;
  couponCode?: string;
  trackingNumber?: string; // Mã vận đơn
  notes?: string;
  createdAt: string; // ISO Date String
  updatedAt: string; // ISO Date String
}

// Payload sử dụng khi người dùng gửi request tạo đơn hàng (Checkout)
export interface CreateOrderPayload {
  items: Array<{
    productId: string;
    quantity: number;
    size?: string;
    color?: string;
  }>;
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  couponCode?: string;
  notes?: string;
}

// Dùng cho trang danh sách/phân trang đơn hàng ở Admin hoặc Customer Portal
export interface OrderListResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
}
