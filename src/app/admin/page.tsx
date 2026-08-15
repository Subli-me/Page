import { createServiceClient } from "@/lib/supabase/server";
import { OrderRow } from "@/components/admin/OrderRow";

export default async function AdminOrdersPage() {
  const supabase = createServiceClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("*, products(name)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-display text-3xl">Pedidos</h1>
      <p className="mt-1 text-sm text-ink-soft">
        {orders?.length ?? 0} pedido{orders?.length !== 1 ? "s" : ""}
      </p>

      <div className="mt-8 space-y-4">
        {(orders ?? []).map((o) => (
          <OrderRow key={o.id} order={o} />
        ))}
        {orders?.length === 0 && (
          <p className="text-ink-soft">Todavía no llegaron pedidos.</p>
        )}
      </div>
    </div>
  );
}
