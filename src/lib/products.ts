import { createClient } from "@/lib/supabase/server";
import type { PrintZone, Product, ProductColor, ProductSize } from "@/lib/types";
import {
  isDemoMode,
  DEMO_PRODUCTS,
  DEMO_SIZES,
  DEMO_COLORS,
  DEMO_ZONES,
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
