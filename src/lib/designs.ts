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

  // Luego obtener todas las asignaciones de categorías
  const { data: assignments } = await supabase
    .from("design_category_assignments")
    .select("design_id, category_id");

  const assignmentMap = new Map<string, string[]>();
  (assignments || []).forEach((a: { design_id: string; category_id: string }) => {
    if (!assignmentMap.has(a.design_id)) {
      assignmentMap.set(a.design_id, []);
    }
    assignmentMap.get(a.design_id)!.push(a.category_id);
  });

  return designs.map((design) => ({
    id: design.id,
    name: design.name,
    image_url: design.image_url,
    image_public_id: design.image_public_id,
    color: design.color || null,
    category_ids: assignmentMap.get(design.id) || [],
    active: design.active,
    sort_order: design.sort_order,
  }));
}
