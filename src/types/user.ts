export type UserRole = "customer" | "admin" | "moderator";

export type ShinobiRank = "GENIN" | "CHUNIN" | "JONIN" | "ANBU";

export interface UserAddress {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  ward?: string;
  district: string;
  city: string;
  country?: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  rank?: ShinobiRank; // Hạng thành viên (Dùng cho loyalty/voucher)
  addresses?: UserAddress[];
  defaultAddressId?: string;
  wishlist?: string[]; // Danh sách productId yêu thích
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Payload khi thực hiện Đăng nhập
export interface LoginPayload {
  email: string;
  password: string;
}

// Payload khi thực hiện Đăng ký tài khoản mới
export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  phone?: string;
}

// Trả về từ API Auth sau khi đăng nhập/đăng ký thành công
export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
  expiresIn?: number;
}

// Payload cập nhật thông tin cá nhân
export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  avatar?: string;
}

// Payload đổi mật khẩu
export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
