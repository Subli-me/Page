import { createServiceClient } from "@/lib/supabase/server";
import { OrdersPanel } from "@/components/admin/OrdersPanel";
import { DemoBanner } from "@/components/admin/DemoBanner";
import { isDemoMode } from "@/lib/demo-data";
import { buildOrderMetrics } from "@/lib/order-metrics";

export default async function AdminOrdersPage() {
  const demo = isDemoMode();
  const { orders, designsByPublicId } = demo
    ? { orders: [], designsByPublicId: new Map<string, string>() }
    : await fetchOrders();

  const metrics = buildOrderMetrics(orders, designsByPublicId);

  return (
    <div>
      <h1 className="font-display text-3xl">Pedidos</h1>
      {demo && (
        <div className="mt-4">
          <DemoBanner />
        </div>
      )}

      <div className="mt-8">
        <OrdersPanel orders={orders} metrics={metrics} />
      </div>
    </div>
  );
}

async function fetchOrders() {
  const supabase = createServiceClient();

  const withLines = await supabase
    .from("orders")
    .select(
      "*, order_lines(*, products(name), order_items(*, print_zones(label))), products(name), order_items(*, print_zones(label))"
    )
    .order("created_at", { ascending: false });

  // Si todavía no se corrió la migración de order_lines, mostramos los pedidos
  // con la forma vieja en vez de dejar el panel vacío.
  const { data } = withLines.error
    ? await supabase
        .from("orders")
        .select("*, products(name), order_items(*, print_zones(label))")
        .order("created_at", { ascending: false })
    : withLines;

  // Para poder nombrar los diseños del catálogo en el ranking, en vez de
  // mostrar el identificador del archivo.
  const { data: designs } = await supabase
    .from("design_catalog")
    .select("name,image_public_id");

  const designsByPublicId = new Map<string, string>(
    (designs ?? [])
      .filter((d) => d.image_public_id)
      .map((d) => [d.image_public_id as string, d.name as string])
  );

  return { orders: data ?? [], designsByPublicId };
}
