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
  const { data } = await supabase.from("design_catalog").select("*").order("sort_order");
  return data ?? [];
}
