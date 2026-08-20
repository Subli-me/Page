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

  // Retornar diseños con category_ids
  return designs.map((design) => ({
    ...design,
    category_ids: assignmentMap.get(design.id) || [],
  }));
}
