// Shared types for products, cart items, and orders

export type ProductCategory = string;

export type ProductCondition =
  | "like-new"
  | "gently-used"
  | "used";

export type AgeGroup =
  | "0-6m"
  | "6-12m"
  | "1-2y"
  | "3-5y"
  | "6-10y";

export type Product = {
  id: string;
  name: string;
  price: number;
  images: string[];
  category: ProductCategory;
  ageGroup: AgeGroup[];
  gender?: "boys" | "girls" | "unisex";
  condition: ProductCondition;
  stock: number;
  sold?: number;
  sizes?: string[];
  description?: string;
};

export type CartItem = {
  // CartItem extends Product so it can reuse `images`, `sizes`, etc.
  id: string;
  name: string;
  price: number;
  quantity: number;
  selectedSize?: string;
  // optional single image preview (frontend convenience)
  image?: string;
};

export type Order = {
  id: string;
  items: CartItem[];
  total: number;
  email: string;
  address: string;
  deliveryMethod: "standard" | "express" | "pickup";
  status: "pending" | "paid" | "shipped" | "delivered";
};
