"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp, Download } from "lucide-react";
import clsx from "clsx";
import type { Order, OrderStatus } from "@/lib/types";
import { attachmentUrl } from "@/lib/cloudinary-url";

const STATUSES: OrderStatus[] = ["pendiente", "confirmado", "impreso", "entregado", "cancelado"];

const STATUS_COLOR: Record<OrderStatus, string> = {
  pendiente: "bg-accent-soft text-accent",
  confirmado: "bg-blue-100 text-blue-700",
  impreso: "bg-purple-100 text-purple-700",
  entregado: "bg-green-100 text-green-700",
  cancelado: "bg-red-100 text-red-700",
};

type OrderItemWithZone = {
  id: string;
  image_url: string;
  print_zone_key: string;
  design_transform?: { tx: number; ty: number; scale: number; rotation: number } | null;
  print_zones: { label: string } | null;
};

type OrderWithProduct = Order & {
  products: { name: string } | null;
  order_items: OrderItemWithZone[];
};

/** Los primeros 8 caracteres alcanzan para identificarlo y se pueden dictar. */
function orderNumber(id: string) {
  return id.slice(0, 8);
}

export function OrderRow({ order }: { order: OrderWithProduct }) {
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  // Compatibilidad con pedidos viejos de un solo estampado (sin order_items).
  const items: OrderItemWithZone[] =
    order.order_items?.length > 0
      ? order.order_items
      : order.image_url
        ? [
            {
              id: order.id,
              image_url: order.image_url,
              print_zone_key: order.print_zone_key ?? "",
              design_transform: order.design_transform,
              print_zones: null,
            },
          ]
        : [];

  const zoneName = (item: OrderItemWithZone) =>
    item.print_zones?.label ?? item.print_zone_key ?? "Estampado";

  const fileName = (item: OrderItemWithZone) =>
    `pedido-${orderNumber(order.id)}-${zoneName(item)}`;

  async function updateStatus(next: OrderStatus) {
    setStatus(next);
    setSaving(true);
    await fetch(`/api/admin/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setSaving(false);
  }

  const created = new Date(order.created_at);

  return (
    <div className="rounded-2xl border border-line bg-panel">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        <div className="flex shrink-0 gap-2 overflow-x-auto">
          {items.map((item) => (
            <div key={item.id} className="group/item relative shrink-0">
              <div className="relative h-24 w-24 overflow-hidden rounded-xl bg-accent-soft">
                <Image src={item.image_url} alt={zoneName(item)} fill className="object-contain" />

                {/* Una descarga por estampado: antes el botón solo aparecía
                    cuando el pedido tenía uno solo. */}
                <a
                  href={attachmentUrl(item.image_url, fileName(item))}
                  className="absolute inset-0 flex items-center justify-center bg-dark/60 text-paper opacity-0 transition-opacity group-hover/item:opacity-100"
                  title={`Descargar ${zoneName(item)}`}
                >
                  <Download size={18} />
                </a>
              </div>
              <span className="mt-1 block truncate text-center text-[10px] text-ink-soft">
                {zoneName(item)}
              </span>
            </div>
          ))}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-mono text-xs font-medium text-accent">
              #{orderNumber(order.id)}
            </span>
            <span className="text-xs text-ink-soft">
              {created.toLocaleString("es-AR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          <p className="mt-1 font-medium">
            {order.products?.name ?? "Producto"} — Talle {order.size}
            {order.color ? ` — ${order.color}` : ""}
          </p>
          <p className="text-sm text-ink-soft">
            {order.customer_name} · {order.customer_email}
            {order.customer_phone ? ` · ${order.customer_phone}` : ""}
          </p>
          <p className="text-sm text-ink-soft">
            {items.length} estampado{items.length !== 1 ? "s" : ""} · $
            {order.total_price?.toLocaleString("es-AR")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-2 text-xs text-ink-soft hover:border-ink hover:text-ink"
          >
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {open ? "Ocultar" : "Detalle"}
          </button>

          <select
            value={status}
            disabled={saving}
            onChange={(e) => updateStatus(e.target.value as OrderStatus)}
            className={clsx(
              "rounded-full border-0 px-3 py-2 text-xs font-medium capitalize",
              STATUS_COLOR[status]
            )}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {open && (
        <div className="border-t border-line px-5 py-5">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-soft">
                Pedido
              </h3>
              <dl className="space-y-1 text-sm">
                <Detail label="Número" value={`#${orderNumber(order.id)}`} mono />
                <Detail
                  label="Fecha"
                  value={created.toLocaleString("es-AR", {
                    dateStyle: "full",
                    timeStyle: "short",
                  })}
                />
                <Detail label="Prenda" value={order.products?.name ?? "—"} />
                <Detail label="Talle" value={order.size} />
                {order.color && <Detail label="Color" value={order.color} />}
                <Detail
                  label="Total"
                  value={`$${order.total_price?.toLocaleString("es-AR") ?? "—"}`}
                />
              </dl>
            </div>

            <div>
              <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-soft">
                Cliente
              </h3>
              <dl className="space-y-1 text-sm">
                <Detail label="Nombre" value={order.customer_name} />
                <Detail label="Email" value={order.customer_email} />
                <Detail label="Teléfono" value={order.customer_phone ?? "—"} />
              </dl>
              {order.notes && (
                <>
                  <h3 className="mb-2 mt-4 text-xs font-medium uppercase tracking-wide text-ink-soft">
                    Notas
                  </h3>
                  <p className="rounded-lg border border-line bg-paper px-3 py-2 text-sm italic text-ink-soft">
                    {order.notes}
                  </p>
                </>
              )}
            </div>
          </div>

          <h3 className="mb-3 mt-6 text-xs font-medium uppercase tracking-wide text-ink-soft">
            Estampados ({items.length})
          </h3>
          <div className="space-y-2">
            {items.map((item) => {
              const t = item.design_transform;
              return (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-paper p-3"
                >
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-accent-soft">
                    <Image
                      src={item.image_url}
                      alt={zoneName(item)}
                      fill
                      className="object-contain"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{zoneName(item)}</p>
                    {t && (
                      // Sirve para producción: dice cómo lo acomodó el cliente.
                      <p className="text-xs text-ink-soft">
                        Tamaño {Math.round(t.scale * 100)}%
                        {Math.round(t.rotation) !== 0 && ` · Rotado ${Math.round(t.rotation)}°`}
                      </p>
                    )}
                  </div>

                  <a
                    href={attachmentUrl(item.image_url, fileName(item))}
                    className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs hover:border-ink"
                  >
                    <Download size={13} /> Descargar
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex gap-2">
      <dt className="w-20 shrink-0 text-ink-soft">{label}</dt>
      <dd className={clsx("min-w-0 wrap-break-word", mono && "font-mono text-accent")}>{value}</dd>
    </div>
  );
}
