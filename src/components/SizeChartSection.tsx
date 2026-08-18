"use client";

import { useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { Ruler, Shirt } from "lucide-react";
import type { Product, ProductSize } from "@/lib/types";

export function SizeChartSection({
  products,
  sizes,
}: {
  products: Product[];
  sizes: ProductSize[];
}) {
  const productsWithMeasurements = products.filter((p) =>
    sizes.some((s) => s.product_id === p.id && (s.chest_cm != null || s.length_cm != null))
  );
  const [activeId, setActiveId] = useState(productsWithMeasurements[0]?.id ?? null);

  if (productsWithMeasurements.length === 0) {
    return (
      <p className="rounded-2xl border border-line bg-panel/40 px-5 py-8 text-center text-sm text-ink-soft">
        Todavía no cargamos las medidas de nuestros talles. Escribinos y te ayudamos a elegir.
      </p>
    );
  }

  const activeProduct = productsWithMeasurements.find((p) => p.id === activeId) ?? productsWithMeasurements[0];
  const activeSizes = sizes
    .filter((s) => s.product_id === activeId)
    .sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div>
      {productsWithMeasurements.length > 1 && (
        <div className="mb-8 flex flex-wrap gap-2">
          {productsWithMeasurements.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setActiveId(p.id)}
              className={clsx(
                "rounded-full border px-4 py-2 text-sm transition-colors",
                activeId === p.id
                  ? "border-ink bg-ink text-paper"
                  : "border-line text-ink-soft hover:border-ink hover:text-ink"
              )}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-[0.85fr_1.15fr] sm:items-start">
        <div className="relative aspect-4/5 overflow-hidden rounded-2xl border border-line bg-panel">
          {activeProduct?.image_url ? (
            <Image
              src={activeProduct.image_url}
              alt={activeProduct.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-ink-soft/40">
              <Shirt size={48} strokeWidth={1.2} />
            </div>
          )}
        </div>

        <div>
          <div className="overflow-hidden rounded-2xl border border-line">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-panel text-left text-ink-soft">
                  <th className="px-5 py-3 font-medium">Talle</th>
                  <th className="px-5 py-3 font-medium">Pecho (cm)</th>
                  <th className="px-5 py-3 font-medium">Largo (cm)</th>
                </tr>
              </thead>
              <tbody>
                {activeSizes.map((s) => (
                  <tr key={s.id} className="border-b border-line bg-panel/40 last:border-0">
                    <td className="px-5 py-3 font-medium">{s.size}</td>
                    <td className="px-5 py-3 text-ink-soft">{s.chest_cm ?? "—"}</td>
                    <td className="px-5 py-3 text-ink-soft">{s.length_cm ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 flex items-center gap-1.5 text-xs text-ink-soft">
            <Ruler size={13} /> Pecho: de axila a axila. Largo: de hombro a bajo.
          </p>
        </div>
      </div>
    </div>
  );
}
