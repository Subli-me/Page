import { createServiceClient } from "@/lib/supabase/server";
import { MockupsAdmin } from "@/components/admin/MockupsAdmin";
import { DemoBanner } from "@/components/admin/DemoBanner";
import { isDemoMode, DEMO_PRODUCTS, DEMO_ZONES } from "@/lib/demo-data";

export default async function AdminMockupsPage() {
  const demo = isDemoMode();
  const data = demo
    ? { products: DEMO_PRODUCTS, zones: DEMO_ZONES, mockups: [] }
    : await fetchData();

  return (
    <div>
      <h1 className="font-display text-3xl">Mockups propios</h1>
      {demo && <div className="mt-4"><DemoBanner /></div>}
      <p className="mt-1 text-sm text-ink-soft">
        Subí una foto real de cada prenda y marcá dónde va el diseño del cliente.
        Se usa en la vista previa del pedido — si no configurás Printful, o para
        prendas que no están en su catálogo, esta es la vista previa que ve el cliente.
      </p>

      <div className="mt-8">
        <MockupsAdmin products={data.products} zones={data.zones} initialMockups={data.mockups} />
      </div>
    </div>
  );
}

async function fetchData() {
  const supabase = createServiceClient();
  const [{ data: products }, { data: zones }, { data: mockups }] = await Promise.all([
    supabase.from("products").select("*").order("sort_order"),
    supabase.from("print_zones").select("*").order("sort_order"),
    supabase.from("product_mockups").select("*"),
  ]);
  return { products: products ?? [], zones: zones ?? [], mockups: mockups ?? [] };
}
