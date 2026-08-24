"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import clsx from "clsx";
import { OrderRow } from "./OrderRow";
import type { OrderMetrics, Ranking } from "@/lib/order-metrics";
import type { OrderStatus } from "@/lib/types";

const ESTADOS: OrderStatus[] = ["pendiente", "confirmado", "impreso", "entregado", "cancelado"];

const money = (n: number) => `$${Number(n).toLocaleString("es-AR")}`;

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/**
 * La lista de pedidos con lo que se usa todos los días en un taller: buscar a
 * alguien puntual y ver de un vistazo qué falta imprimir.
 *
 * Antes era una lista cronológica sin más: con volumen, encontrar "el de Juan"
 * era scrollear.
 */
export function OrdersPanel({
  orders: initialOrders,
  metrics,
}: {
  // La forma la impone OrderRow, que ya contempla pedidos viejos y nuevos.
  orders: React.ComponentProps<typeof OrderRow>["order"][];
  metrics: OrderMetrics;
}) {
  // La lista vive acá para que borrar un pedido lo saque en el momento, sin
  // recargar la página.
  const [orders, setOrders] = useState(initialOrders);
  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState<OrderStatus | "">("");
  const [verNumeros, setVerNumeros] = useState(false);

  const porEstado = useMemo(() => {
    const m = new Map<string, number>();
    for (const o of orders) m.set(o.status, (m.get(o.status) ?? 0) + 1);
    return m;
  }, [orders]);

  const filtrados = useMemo(() => {
    const q = normalize(search.trim());
    return orders.filter((o) => {
      if (estado && o.status !== estado) return false;
      if (!q) return true;

      // Se busca por lo que uno tiene a mano cuando llega el mensaje: el
      // nombre, el teléfono desde el que escribió, o el número de pedido.
      const campos = [
        o.customer_name,
        o.customer_email,
        o.customer_phone ?? "",
        o.id.slice(0, 8),
        o.products?.name ?? "",
      ];
      return campos.some((c) => normalize(String(c)).includes(q));
    });
  }, [orders, search, estado]);

  return (
    <div>
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Tarjeta titulo="Pedidos del mes" valor={String(metrics.pedidosMes)} />
        <Tarjeta titulo="Facturado en el mes" valor={money(metrics.facturacionMes)} />
        <Tarjeta
          titulo="Ticket promedio"
          valor={money(metrics.ticketPromedio)}
          nota={`${metrics.unidadesMes} prendas`}
        />
        <Tarjeta
          titulo="Por hacer"
          valor={String(metrics.pendientes + metrics.aImprimir)}
          nota={`${metrics.pendientes} sin confirmar · ${metrics.aImprimir} a imprimir`}
          destacado={metrics.pendientes > 0}
        />
      </div>

      <button
        type="button"
        onClick={() => setVerNumeros((v) => !v)}
        className="mb-6 text-xs text-ink-soft underline underline-offset-2 hover:text-ink"
      >
        {verNumeros ? "Ocultar" : "Ver"} qué se vende más
      </button>

      {verNumeros && (
        <div className="mb-6 grid gap-4 rounded-2xl border border-line bg-panel p-5 sm:grid-cols-2 lg:grid-cols-5">
          <Lista titulo="Prendas" datos={metrics.prendas} />
          <Lista titulo="Diseños" datos={metrics.disenos} />
          <Lista titulo="Zonas" datos={metrics.zonas} />
          <Lista titulo="Colores" datos={metrics.colores} />
          <Lista titulo="Talles" datos={metrics.talles} />
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-56">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft"
          />
          <input
            className="input h-10 w-full py-0 pl-9 pr-9 text-sm"
            placeholder="Buscar por nombre, teléfono o número de pedido..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Borrar búsqueda"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <Chip activo={!estado} onClick={() => setEstado("")}>
          Todos <Contador n={orders.length} />
        </Chip>
        {ESTADOS.map((s) => (
          <Chip key={s} activo={estado === s} onClick={() => setEstado(s)}>
            <span className="capitalize">{s}</span> <Contador n={porEstado.get(s) ?? 0} />
          </Chip>
        ))}
      </div>

      <p className="mb-4 text-sm text-ink-soft">
        {filtrados.length} de {orders.length} pedido{orders.length !== 1 ? "s" : ""}
      </p>

      <div className="space-y-4">
        {filtrados.map((o) => (
          <OrderRow
            key={o.id}
            order={o}
            onDeleted={(id) => setOrders((prev) => prev.filter((o) => o.id !== id))}
          />
        ))}

        {filtrados.length === 0 && (
          <p className="rounded-2xl border border-dashed border-line px-6 py-14 text-center text-sm text-ink-soft">
            {orders.length === 0
              ? "Todavía no llegaron pedidos."
              : "Ningún pedido coincide con la búsqueda."}
          </p>
        )}
      </div>
    </div>
  );
}

function Tarjeta({
  titulo,
  valor,
  nota,
  destacado,
}: {
  titulo: string;
  valor: string;
  nota?: string;
  destacado?: boolean;
}) {
  return (
    <div
      className={clsx(
        "rounded-2xl border p-4",
        destacado ? "border-accent/40 bg-accent/5" : "border-line bg-panel"
      )}
    >
      <p className="text-xs uppercase tracking-wide text-ink-soft">{titulo}</p>
      <p className="mt-1 font-display text-2xl tabular-nums">{valor}</p>
      {nota && <p className="mt-0.5 text-xs text-ink-soft">{nota}</p>}
    </div>
  );
}

function Lista({ titulo, datos }: { titulo: string; datos: Ranking }) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-soft">{titulo}</p>
      {datos.length === 0 ? (
        <p className="text-xs text-ink-soft">Sin datos</p>
      ) : (
        <ol className="space-y-1">
          {datos.map((d) => (
            <li key={d.label} className="flex justify-between gap-2 text-sm">
              <span className="truncate" title={d.label}>
                {d.label}
              </span>
              <span className="shrink-0 tabular-nums text-ink-soft">{d.count}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function Chip({
  activo,
  onClick,
  children,
}: {
  activo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition-colors",
        activo ? "border-ink bg-ink text-paper" : "border-line text-ink-soft hover:border-ink hover:text-ink"
      )}
    >
      {children}
    </button>
  );
}

function Contador({ n }: { n: number }) {
  return (
    <span className="rounded-full bg-current/15 px-1.5 text-[11px] tabular-nums">{n}</span>
  );
}
