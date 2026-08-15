export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  base_price: number;
  base_cost: number;
  image_url: string | null;
  active: boolean;
  sort_order: number;
};

export type ProductSize = {
  id: string;
  product_id: string;
  size: string;
  price_delta: number;
  sort_order: number;
};

export type ProductColor = {
  id: string;
  product_id: string;
  name: string;
  hex: string;
  sort_order: number;
};

export type PrintZone = {
  id: string;
  key: string;
  label: string;
  extra_price: number;
  extra_cost: number;
  sort_order: number;
};

export type OrderStatus =
  | "pendiente"
  | "confirmado"
  | "impreso"
  | "entregado"
  | "cancelado";

export type Order = {
  id: string;
  product_id: string | null;
  size: string;
  color: string | null;
  print_zone_key: string;
  image_url: string;
  image_public_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  notes: string | null;
  status: OrderStatus;
  total_price: number | null;
  created_at: string;
  updated_at: string;
};
