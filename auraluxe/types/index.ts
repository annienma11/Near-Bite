export interface User {
  id: string;
  name: string | null;
  email: string | null;
  profile_photo: string | null;
  address: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  subcategory?: string | null;
  price: number;
  stock: number;
  image_urls: string[];
  material: string | null;
  created_at: string;
  youtube_url?: string | null;
  view_360_images?: string[] | null;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  product?: Product;
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  shipping_address?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  product?: Product;
}

export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  body?: string | null;
  comment?: string | null;
  image_urls: string[];
  created_at: string;
  user?: User;
}

export interface Favorite {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

export interface AIStyleSession {
  id: string;
  user_id: string | null;
  image_url: string | null;
  result: any;
  created_at: string;
}
