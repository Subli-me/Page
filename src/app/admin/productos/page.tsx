import { createServiceClient } from "@/lib/supabase/server";
import { ProductsAdmin } from "@/components/admin/ProductsAdmin";
import { DemoBanner } from "@/components/admin/DemoBanner";
import { isDemoMode, DEMO_PRODUCTS, DEMO_ZONES, DEMO_SIZES, DEMO_COLORS } from "@/lib/demo-data";

export default async function AdminProductsPage() {
  const demo = isDemoMode();
  const data = demo
    ? { products: DEMO_PRODUCTS, printZones: DEMO_ZONES, sizes: DEMO_SIZES, colors: DEMO_COLORS }
    : await fetchData();

  return (
    <div>
      <h1 className="font-display text-3xl">Productos y precios</h1>
      {demo && <div className="mt-4"><DemoBanner /></div>}
      <p className="mt-1 text-sm text-ink-soft">
        Agregá prendas, talles, colores y zonas de estampado. Los cambios se guardan automáticamente.
      </p>

      <div className="mt-8">
        <ProductsAdmin
          initialProducts={data.products}
          initialZones={data.printZones}
          initialSizes={data.sizes}
          initialColors={data.colors}
        />
      </div>
    </div>
  );
}

async function fetchData() {
  const supabase = createServiceClient();
  const [{ data: products }, { data: printZones }, { data: sizes }, { data: colors }] = await Promise.all([
    supabase.from("products").select("*").order("sort_order"),
    supabase.from("print_zones").select("*").order("sort_order"),
    supabase.from("product_sizes").select("*").order("sort_order"),
    supabase.from("product_colors").select("*").order("sort_order"),
  ]);
  return {
    products: products ?? [],
    printZones: printZones ?? [],
    sizes: sizes ?? [],
    colors: colors ?? [],
  };
}
