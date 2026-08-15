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

export type ProductMockup = {
  id: string;
  product_id: string;
  print_zone_key: string;
  image_url: string;
  image_public_id: string;
  overlay_x: number;
  overlay_y: number;
  overlay_w: number;
  overlay_h: number;
};

export type DesignCatalogItem = {
  id: string;
  name: string;
  image_url: string;
  image_public_id: string;
  category: string | null;
  active: boolean;
  sort_order: number;
};

export type SiteSettings = {
  id: number;
  logo_text: string;
  logo_url: string | null;
  favicon_emoji: string | null;

  color_accent: string;
  color_lime: string;

  hero_badge: string;
  hero_title_line1: string;
  hero_title_line2: string;
  hero_subtitle: string;
  hero_cta_label: string;
  hero_image_url: string | null;

  marquee_text: string;

  step1_title: string;
  step1_text: string;
  step2_title: string;
  step2_text: string;
  step3_title: string;
  step3_text: string;

  footer_headline_line1: string;
  footer_headline_line2: string;
  footer_tagline: string;

  contact_email: string | null;
  contact_phone: string | null;
  contact_instagram: string | null;

  seo_title: string;
  seo_description: string;

  nav_catalog_label: string;
  nav_process_label: string;

  process_title: string;
  process_subtitle: string;
  process_step1_title: string;
  process_step1_text: string;
  process_step2_title: string;
  process_step2_text: string;
  process_step3_title: string;
  process_step3_text: string;
  process_step4_title: string;
  process_step4_text: string;
  care_title: string;
  care_text: string;

  pedido_badge: string;
  pedido_title: string;
  pedido_subtitle: string;

  confirmation_title: string;
  confirmation_message: string;

  footer_copyright_suffix: string;
};

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
