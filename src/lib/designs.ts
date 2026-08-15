import { createClient } from "@/lib/supabase/server";
import type { DesignCatalogItem } from "@/lib/types";
import { isDemoMode } from "@/lib/demo-data";

export async function getActiveDesigns(): Promise<DesignCatalogItem[]> {
  if (isDemoMode()) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("design_catalog")
    .select("*")
    .eq("active", true)
    .order("sort_order");
  return data ?? [];
}
