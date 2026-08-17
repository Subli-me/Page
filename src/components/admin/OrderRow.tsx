"use client";

import { useState } from "react";
import Image from "next/image";
import { Download } from "lucide-react";
import clsx from "clsx";
import type { Order, OrderStatus } from "@/lib/types";

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
  print_zones: { label: string } | null;
};

type OrderWithProduct = Order & {
  products: { name: string } | null;
  order_items: OrderItemWithZone[];
};

export function OrderRow({ order }: { order: OrderWithProduct }) {
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [saving, setSaving] = useState(false);

  // Compatibilidad con pedidos viejos de un solo estampado (sin order_items).
  const items: OrderItemWithZone[] =
    order.order_items?.length > 0
      ? order.order_items
      : order.image_url
      ? [{ id: order.id, image_url: order.image_url, print_zone_key: order.print_zone_key ?? "", print_zones: null }]
      : [];

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

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-line bg-panel p-5 sm:flex-row sm:items-center">
      <div className="flex shrink-0 gap-2 overflow-x-auto">
        {items.map((item) => (
          <div key={item.id} className="relative">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-accent-soft">
              <Image src={item.image_url} alt="Diseño del cliente" fill className="object-contain" />
            </div>
            <span className="mt-1 block text-center text-[10px] text-ink-soft">
              {item.print_zones?.label ?? item.print_zone_key}
            </span>
          </div>
        ))}
      </div>

      <div className="flex-1">
        <p className="font-medium">
          {order.products?.name ?? "Producto"} — Talle {order.size}
          {order.color ? ` — ${order.color}` : ""}
        </p>
        <p className="text-sm text-ink-soft">
          {order.customer_name} · {order.customer_email}
          {order.customer_phone ? ` · ${order.customer_phone}` : ""}
        </p>
        <p className="text-sm text-ink-soft">
          {items.length} estampado{items.length !== 1 ? "s" : ""} · ${order.total_price?.toLocaleString("es-AR")}
        </p>
        {order.notes && <p className="mt-1 text-sm italic text-ink-soft">"{order.notes}"</p>}
      </div>

      <div className="flex items-center gap-3">
        {items.length === 1 && (
          <a
            href={items[0].image_url}
            download
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-line p-2.5 text-ink-soft hover:border-ink hover:text-ink"
            title="Descargar imagen original"
          >
            <Download size={16} />
          </a>
        )}
        <select
          value={status}
          disabled={saving}
          onChange={(e) => updateStatus(e.target.value as OrderStatus)}
          className={clsx("rounded-full border-0 px-3 py-2 text-xs font-medium capitalize", STATUS_COLOR[status])}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
