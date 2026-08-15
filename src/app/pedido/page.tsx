import { Suspense } from "react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { OrderWizard } from "@/components/order/OrderWizard";
import { getActiveProducts, getPrintZones } from "@/lib/products";
import { createClient } from "@/lib/supabase/server";
import { isDemoMode, DEMO_SIZES, DEMO_COLORS } from "@/lib/demo-data";

export default async function PedidoPage() {
  const [products, printZones] = await Promise.all([
    getActiveProducts(),
    getPrintZones(),
  ]);

  let allSizes = DEMO_SIZES;
  let allColors = DEMO_COLORS;

  if (!isDemoMode()) {
    const supabase = await createClient();
    const productIds = products.map((p) => p.id);
    const [{ data: sizes }, { data: colors }] = await Promise.all([
      supabase.from("product_sizes").select("*").in("product_id", productIds).order("sort_order"),
      supabase.from("product_colors").select("*").in("product_id", productIds).order("sort_order"),
    ]);
    allSizes = sizes ?? [];
    allColors = colors ?? [];
  }

  return (
    <>
      <Nav />
      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-6 pt-16 pb-24 sm:pt-20">
          <p className="mb-3 text-sm uppercase tracking-[0.2em] text-accent">
            Pedido personalizado
          </p>
          <h1 className="font-display text-4xl tracking-tight sm:text-5xl">
            Armemos tu prenda
          </h1>
          <p className="mt-4 max-w-lg text-ink-soft">
            En unos pasos elegís la prenda, subís tu imagen y nos llega listo
            para producción.
          </p>

          <div className="mt-12">
            <Suspense>
              <OrderWizard
                products={products}
                sizes={allSizes}
                colors={allColors}
                printZones={printZones}
              />
            </Suspense>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
