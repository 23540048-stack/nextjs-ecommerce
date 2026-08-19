export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface Collection {
  id: string;
  title: string;
  subtitle: string;
  slug: string;
  accentColor: "naruto" | "akatsuki" | "konoha" | "hokage";
  image: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: string;
  image: string;
}

// Danh mục hiển thị trên Header Menu
export const MOCK_CATEGORIES: Category[] = [
  {
    id: "1",
    name: "Naruto",
    slug: "naruto",
    description: "The Tale of the Hero",
  },
  {
    id: "2",
    name: "Konoha",
    slug: "konoha",
    description: "Leaf Village Heritage",
  },
  {
    id: "3",
    name: "Akatsuki",
    slug: "akatsuki",
    description: "Dawn Collection",
  },
  {
    id: "4",
    name: "Hokage",
    slug: "hokage",
    description: "Will of Fire Essentials",
  },
];

// Bộ sưu tập trên Homepage
export const MOCK_COLLECTIONS: Collection[] = [
  {
    id: "1",
    title: "NARUTO",
    subtitle: "Hero Chapter",
    slug: "naruto",
    accentColor: "naruto",
    image: "/images/col-naruto.jpg",
  },
  {
    id: "2",
    title: "KONOHA",
    subtitle: "Leaf Village Heritage",
    slug: "konoha",
    accentColor: "konoha",
    image: "/images/col-konoha.jpg",
  },
  {
    id: "3",
    title: "AKATSUKI",
    subtitle: "Dawn Collection",
    slug: "akatsuki",
    accentColor: "akatsuki",
    image: "/images/col-akatsuki.jpg",
  },
  {
    id: "4",
    title: "HOKAGE",
    subtitle: "Will of Fire",
    slug: "hokage",
    accentColor: "hokage",
    image: "/images/col-hokage.jpg",
  },
];

// Sản phẩm mẫu
export const MOCK_PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Minimalist Shinobi Oversized Hoodie",
    category: "Konoha",
    price: "1.250.000đ",
    image:
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800",
  },
  {
    id: "p2",
    name: "Cloud Embroidery Kimono Jacket",
    category: "Akatsuki",
    price: "1.850.000đ",
    image:
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800",
  },
  {
    id: "p3",
    name: "Will of Fire Heavyweight Tee",
    category: "Hokage",
    price: "650.000đ",
    image:
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800",
  },
  {
    id: "p4",
    name: "Orange Hue Cargo Pants",
    category: "Naruto",
    price: "1.100.000đ",
    image:
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800",
  },
];
