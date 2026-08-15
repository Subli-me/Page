import { createServiceClient } from "@/lib/supabase/server";
import { ProductsAdmin } from "@/components/admin/ProductsAdmin";

export default async function AdminProductsPage() {
  const supabase = createServiceClient();
  const [{ data: products }, { data: printZones }] = await Promise.all([
    supabase.from("products").select("*").order("sort_order"),
    supabase.from("print_zones").select("*").order("sort_order"),
  ]);

  return (
    <div>
      <h1 className="font-display text-3xl">Productos y precios</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Editá precio de venta y costo interno. Los cambios se guardan automáticamente.
      </p>

      <div className="mt-8">
        <ProductsAdmin initialProducts={products ?? []} initialZones={printZones ?? []} />
      </div>
    </div>
  );
}
