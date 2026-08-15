"use client";

import { useState } from "react";
import type { PrintZone, Product } from "@/lib/types";
import { EditableNumber } from "./EditableNumber";

export function ProductsAdmin({
  initialProducts,
  initialZones,
}: {
  initialProducts: Product[];
  initialZones: PrintZone[];
}) {
  const [products, setProducts] = useState(initialProducts);
  const [zones, setZones] = useState(initialZones);

  async function saveProduct(id: string, field: "base_price" | "base_cost", value: number) {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
    await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
  }

  async function toggleActive(id: string, active: boolean) {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, active } : p)));
    await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });
  }

  async function saveZone(id: string, field: "extra_price" | "extra_cost", value: number) {
    setZones((prev) => prev.map((z) => (z.id === id ? { ...z, [field]: value } : z)));
    await fetch(`/api/admin/zones/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
  }

  return (
    <div className="space-y-10">
      <section>
        <h2 className="mb-4 font-display text-xl">Prendas</h2>
        <div className="overflow-x-auto rounded-2xl border border-line">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-panel text-left text-ink-soft">
                <th className="px-4 py-3 font-medium">Producto</th>
                <th className="px-4 py-3 font-medium">Precio venta</th>
                <th className="px-4 py-3 font-medium">Costo</th>
                <th className="px-4 py-3 font-medium">Margen</th>
                <th className="px-4 py-3 font-medium">Activo</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3">
                    <EditableNumber value={p.base_price} onSave={(v) => saveProduct(p.id, "base_price", v)} />
                  </td>
                  <td className="px-4 py-3">
                    <EditableNumber value={p.base_cost} onSave={(v) => saveProduct(p.id, "base_cost", v)} />
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    ${(p.base_price - p.base_cost).toLocaleString("es-AR")}
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={p.active}
                      onChange={(e) => toggleActive(p.id, e.target.checked)}
                      className="h-4 w-4 accent-accent"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-display text-xl">Zonas de estampado</h2>
        <div className="overflow-x-auto rounded-2xl border border-line">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-panel text-left text-ink-soft">
                <th className="px-4 py-3 font-medium">Zona</th>
                <th className="px-4 py-3 font-medium">Extra venta</th>
                <th className="px-4 py-3 font-medium">Extra costo</th>
              </tr>
            </thead>
            <tbody>
              {zones.map((z) => (
                <tr key={z.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 font-medium">{z.label}</td>
                  <td className="px-4 py-3">
                    <EditableNumber value={z.extra_price} onSave={(v) => saveZone(z.id, "extra_price", v)} />
                  </td>
                  <td className="px-4 py-3">
                    <EditableNumber value={z.extra_cost} onSave={(v) => saveZone(z.id, "extra_cost", v)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
