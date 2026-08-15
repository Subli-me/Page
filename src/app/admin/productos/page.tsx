import { createServiceClient } from "@/lib/supabase/server";
import { ProductsAdmin } from "@/components/admin/ProductsAdmin";
import { DemoBanner } from "@/components/admin/DemoBanner";
import { isDemoMode, DEMO_PRODUCTS, DEMO_ZONES } from "@/lib/demo-data";

export default async function AdminProductsPage() {
  const demo = isDemoMode();
  const { products, printZones } = demo
    ? { products: DEMO_PRODUCTS, printZones: DEMO_ZONES }
    : await fetchData();

  return (
    <div>
      <h1 className="font-display text-3xl">Productos y precios</h1>
      {demo && <div className="mt-4"><DemoBanner /></div>}
      <p className="mt-1 text-sm text-ink-soft">
        Editá precio de venta y costo interno. Los cambios se guardan automáticamente.
      </p>

      <div className="mt-8">
        <ProductsAdmin initialProducts={products} initialZones={printZones} />
      </div>
    </div>
  );
}

async function fetchData() {
  const supabase = createServiceClient();
  const [{ data: products }, { data: printZones }] = await Promise.all([
    supabase.from("products").select("*").order("sort_order"),
    supabase.from("print_zones").select("*").order("sort_order"),
  ]);
  return { products: products ?? [], printZones: printZones ?? [] };
}
