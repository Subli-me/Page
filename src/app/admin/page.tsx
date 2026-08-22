import { createServiceClient } from "@/lib/supabase/server";
import { OrderRow } from "@/components/admin/OrderRow";
import { DemoBanner } from "@/components/admin/DemoBanner";
import { isDemoMode } from "@/lib/demo-data";

export default async function AdminOrdersPage() {
  const demo = isDemoMode();
  const orders = demo ? [] : await fetchOrders();

  return (
    <div>
      <h1 className="font-display text-3xl">Pedidos</h1>
      {demo && <div className="mt-4"><DemoBanner /></div>}
      <p className="mt-1 text-sm text-ink-soft">
        {orders.length} pedido{orders.length !== 1 ? "s" : ""}
      </p>

      <div className="mt-8 space-y-4">
        {orders.map((o) => (
          <OrderRow key={o.id} order={o} />
        ))}
        {orders.length === 0 && !demo && (
          <p className="text-ink-soft">Todavía no llegaron pedidos.</p>
        )}
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

  if (!withLines.error) return withLines.data ?? [];

  // Si todavía no se corrió la migración de order_lines, mostramos los pedidos
  // con la forma vieja en vez de dejar el panel vacío.
  const legacy = await supabase
    .from("orders")
    .select("*, products(name), order_items(*, print_zones(label))")
    .order("created_at", { ascending: false });
  return legacy.data ?? [];
}
