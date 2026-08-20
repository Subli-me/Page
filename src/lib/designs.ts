import { createClient } from "@/lib/supabase/server";
import type { DesignCatalogItem } from "@/lib/types";
import { isDemoMode } from "@/lib/demo-data";

export async function getActiveDesigns(): Promise<DesignCatalogItem[]> {
  if (isDemoMode()) return [];
  const supabase = await createClient();

  // Primero obtener diseños activos
  const { data: designs, error } = await supabase
    .from("design_catalog")
    .select("*")
    .eq("active", true)
    .order("sort_order");

  if (error || !designs) return [];

  // Obtener asignaciones de categorías
  const { data: categoryAssignments } = await supabase
    .from("design_category_assignments")
    .select("design_id, category_id");

  const categoryMap = new Map<string, string[]>();
  (categoryAssignments || []).forEach((a: { design_id: string; category_id: string }) => {
    if (!categoryMap.has(a.design_id)) {
      categoryMap.set(a.design_id, []);
    }
    categoryMap.get(a.design_id)!.push(a.category_id);
  });

  // Obtener asignaciones de colores
  const { data: colorAssignments } = await supabase
    .from("design_color_assignments")
    .select("design_id, color");

  const colorMap = new Map<string, string[]>();
  (colorAssignments || []).forEach((a: { design_id: string; color: string }) => {
    if (!colorMap.has(a.design_id)) {
      colorMap.set(a.design_id, []);
    }
    colorMap.get(a.design_id)!.push(a.color);
  });

  return designs.map((design) => ({
    id: design.id,
    name: design.name,
    image_url: design.image_url,
    image_public_id: design.image_public_id,
    color_ids: colorMap.get(design.id) || [],
    category_ids: categoryMap.get(design.id) || [],
    active: design.active,
    sort_order: design.sort_order,
  }));
}
