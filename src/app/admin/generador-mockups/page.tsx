import { createServiceClient } from "@/lib/supabase/server";
import { MockupGeneratorAdmin } from "@/components/admin/MockupGeneratorAdmin";
import { DemoBanner } from "@/components/admin/DemoBanner";
import { isDemoMode, DEMO_PRODUCTS, DEMO_ZONES, DEMO_COLORS } from "@/lib/demo-data";
import { getActiveDesigns } from "@/lib/designs";

export default async function AdminMockupGeneratorPage() {
  const demo = isDemoMode();
  const data = demo
    ? {
        products: DEMO_PRODUCTS,
        zones: DEMO_ZONES,
        mockups: [],
        colors: DEMO_COLORS,
        designs: [],
      }
    : await fetchData();

  return (
    <div>
      <h1 className="font-display text-3xl">Generador de Mockups</h1>
      {demo && (
        <div className="mt-4">
          <DemoBanner />
        </div>
      )}
      <p className="mt-1 text-sm text-ink-soft">
        Crea composiciones de mockups con tus prendas precargadas y cualquier imagen que subas manualmente o elijas de tu catálogo.
        Ajusta la posición, escala y rotación del diseño, y descarga la imagen final en alta calidad.
      </p>

      <div className="mt-8">
        <MockupGeneratorAdmin
          products={data.products}
          zones={data.zones}
          mockups={data.mockups}
          colors={data.colors}
          designs={data.designs}
        />
      </div>
    </div>
  );
}

async function fetchData() {
  const supabase = createServiceClient();
  const [{ data: products }, { data: zones }, { data: mockups }, { data: colors }, designs] =
    await Promise.all([
      supabase.from("products").select("*").order("sort_order"),
      supabase.from("print_zones").select("*").order("sort_order"),
      supabase.from("product_mockups").select("*"),
      supabase.from("product_colors").select("*").order("sort_order"),
      getActiveDesigns(),
    ]);

  return {
    products: products ?? [],
    zones: zones ?? [],
    mockups: mockups ?? [],
    colors: colors ?? [],
    designs: designs ?? [],
  };
}
