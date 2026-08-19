export interface Category {
  _id: string; // ID do MongoDB tự sinh
  name: string; // Tên danh mục (ví dụ: "Áo Ninja")
  slug: string; // Đường dẫn (ví dụ: "ao-ninja")
}
