import { createClient } from "@/lib/supabase/server";
import type { DesignCatalogItem } from "@/lib/types";
import { isDemoMode } from "@/lib/demo-data";

export async function getActiveDesigns(): Promise<DesignCatalogItem[]> {
  if (isDemoMode()) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("design_catalog")
    .select(
      `*,
      design_category_assignments(category_id)`
    )
    .eq("active", true)
    .order("sort_order");

  if (!data) return [];

  return data.map((design) => ({
    id: design.id,
    name: design.name,
    image_url: design.image_url,
    image_public_id: design.image_public_id,
    color: design.color,
    category_ids: design.design_category_assignments?.map((a: { category_id: string }) => a.category_id) || [],
    active: design.active,
    sort_order: design.sort_order,
  }));
}
