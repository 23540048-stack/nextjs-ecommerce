// src/types/product.ts

export type ProductCategory =
  | "naruto"
  | "akatsuki"
  | "konoha"
  | "hokage"
  | "accessories"
  | "limited";

export type ProductSize = "S" | "M" | "L" | "XL" | "XXL";

export type ProductBadge = "NEW" | "HOT" | "LIMITED" | "SALE" | "OUT OF STOCK";

export interface ProductVariant {
  size: ProductSize;
  color?: string;
  stock: number;
  sku?: string;
}

export interface ProductReview {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1 -> 5
  comment: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  detailInfo?: string[]; // Danh sách các đặc điểm chi tiết (ví dụ: Cotton 100%, In lụa xịn...)
  price: number;
  salePrice?: number; // Giá khuyến mãi (nếu có)
  category: ProductCategory;
  collectionName?: string; // Tên BST (ví dụ: AKATSUKI DAWN, WILL OF FIRE)
  images: string[]; // Danh sách ảnh sản phẩm (ảnh 0 là ảnh đại diện)
  sizes: ProductSize[];
  variants: ProductVariant[];
  inStock: boolean;
  isFeatured?: boolean; // Hiển thị ở trang chủ
  isLimitedDrop?: boolean;
  badge?: ProductBadge;
  rating: number;
  reviewCount: number;
  reviews?: ProductReview[];
  createdAt: string;
  updatedAt: string;
}

// Params sử dụng khi lọc danh sách sản phẩm (Shop Page Query)
export interface ProductFilterParams {
  category?: ProductCategory;
  collection?: string;
  minPrice?: number;
  maxPrice?: number;
  sizes?: ProductSize[];
  search?: string;
  sortBy?: "newest" | "price-asc" | "price-desc" | "popular";
  page?: number;
  limit?: number;
}

// Dữ liệu trả về khi lấy danh sách sản phẩm có phân trang
export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
