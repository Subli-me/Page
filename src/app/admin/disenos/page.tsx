import { createServiceClient } from "@/lib/supabase/server";
import { DesignsAdmin } from "@/components/admin/DesignsAdmin";
import { DemoBanner } from "@/components/admin/DemoBanner";
import { isDemoMode } from "@/lib/demo-data";

export default async function AdminDesignsPage() {
  const demo = isDemoMode();
  const designs = demo ? [] : await fetchDesigns();

  return (
    <div>
      <h1 className="font-display text-3xl">Catálogo de diseños</h1>
      {demo && <div className="mt-4"><DemoBanner /></div>}
      <p className="mt-1 text-sm text-ink-soft">
        Subí diseños propios para que el cliente pueda elegir uno en vez de subir el suyo.
      </p>

      <div className="mt-8">
        <DesignsAdmin initial={designs} />
      </div>
    </div>
  );
}

async function fetchDesigns() {
  const supabase = createServiceClient();

  // Obtener diseños
  const { data: designs } = await supabase
    .from("design_catalog")
    .select("*")
    .order("sort_order");

  if (!designs) return [];

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

  // Retornar diseños con color_ids y category_ids
  return designs.map((design) => ({
    ...design,
    color_ids: colorMap.get(design.id) || [],
    category_ids: categoryMap.get(design.id) || [],
  }));
}
