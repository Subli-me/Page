import { createClient } from "@/lib/supabase/server";
import type {
  PrintZone,
  PrintZoneCombo,
  Product,
  ProductColor,
  ProductSize,
  ProductStock,
} from "@/lib/types";
import {
  isDemoMode,
  DEMO_PRODUCTS,
  DEMO_SIZES,
  DEMO_COLORS,
  DEMO_ZONES,
  DEMO_ZONE_COMBOS,
  DEMO_STOCK,
} from "@/lib/demo-data";

export async function getActiveProducts(): Promise<Product[]> {
  if (isDemoMode()) return DEMO_PRODUCTS;
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("sort_order");
  return data ?? [];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (isDemoMode()) return DEMO_PRODUCTS.find((p) => p.slug === slug) ?? null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("active", true)
    .single();
  return data;
}

export async function getProductSizes(productId: string): Promise<ProductSize[]> {
  if (isDemoMode()) return DEMO_SIZES.filter((s) => s.product_id === productId);
  const supabase = await createClient();
  const { data } = await supabase
    .from("product_sizes")
    .select("*")
    .eq("product_id", productId)
    .order("sort_order");
  return data ?? [];
}

export async function getAllProductSizes(productIds: string[]): Promise<ProductSize[]> {
  if (isDemoMode()) return DEMO_SIZES.filter((s) => productIds.includes(s.product_id));
  if (productIds.length === 0) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("product_sizes")
    .select("*")
    .in("product_id", productIds)
    .order("sort_order");
  return data ?? [];
}

export async function getProductColors(productId: string): Promise<ProductColor[]> {
  if (isDemoMode()) return DEMO_COLORS.filter((c) => c.product_id === productId);
  const supabase = await createClient();
  const { data } = await supabase
    .from("product_colors")
    .select("*")
    .eq("product_id", productId)
    .order("sort_order");
  return data ?? [];
}

export async function getPrintZones(): Promise<PrintZone[]> {
  if (isDemoMode()) return DEMO_ZONES;
  const supabase = await createClient();
  const { data } = await supabase.from("print_zones").select("*").order("sort_order");
  return data ?? [];
}

export async function getPrintZoneCombos(): Promise<PrintZoneCombo[]> {
  if (isDemoMode()) return DEMO_ZONE_COMBOS;
  const supabase = await createClient();
  const { data } = await supabase.from("print_zone_combos").select("*");
  return data ?? [];
}

export async function getProductStock(): Promise<ProductStock[]> {
  if (isDemoMode()) return DEMO_STOCK;
  const supabase = await createClient();
  const { data } = await supabase.from("product_stock").select("*");
  return data ?? [];
}
