"use client";

import { useState } from "react";
import type { ProductColor, ProductSize, ProductStock } from "@/lib/types";

/**
 * Stock por talle y color, en grilla.
 *
 * Lo que se acaba no es "la remera": es la negra talle L. Por eso la unidad es
 * la combinación y no la prenda.
 *
 * Una celda vacía significa que esa combinación no se controla y se puede pedir
 * libremente. Así el control se enciende solo donde hace falta, en vez de
 * obligar a cargar la grilla entera antes de vender.
 */
export function StockGrid({
  productId,
  sizes,
  colors,
  stock,
  onChange,
}: {
  productId: string;
  sizes: ProductSize[];
  colors: ProductColor[];
  stock: ProductStock[];
  onChange: (next: ProductStock[]) => void;
}) {
  const [guardando, setGuardando] = useState<string | null>(null);

  // Una prenda sin colores igual lleva stock por talle.
  const columnas: (ProductColor | null)[] = colors.length > 0 ? colors : [null];

  const clave = (size: string, color: string | null) => `${size}|${color ?? ""}`;

  const valorDe = (size: string, color: string | null) =>
    stock.find(
      (s) => s.product_id === productId && s.size === size && (s.color ?? "") === (color ?? "")
    )?.quantity;

  async function guardar(size: string, color: string | null, texto: string) {
    const quantity = texto.trim() === "" ? null : Math.max(0, Number(texto) || 0);
    setGuardando(clave(size, color));

    // Optimista: la grilla se usa cargando muchas celdas seguidas.
    onChange(
      quantity === null
        ? stock.filter(
            (s) =>
              !(s.product_id === productId && s.size === size && (s.color ?? "") === (color ?? ""))
          )
        : [
            ...stock.filter(
              (s) =>
                !(
                  s.product_id === productId &&
                  s.size === size &&
                  (s.color ?? "") === (color ?? "")
                )
            ),
            { id: clave(size, color), product_id: productId, size, color, quantity },
          ]
    );

    await fetch("/api/admin/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, size, color, quantity }),
    });
    setGuardando(null);
  }

  if (sizes.length === 0) {
    return <p className="text-xs text-ink-soft">Cargá los talles para poder llevar stock.</p>;
  }

  return (
    <div>
      <p className="mb-2 text-[11px] text-ink-soft">
        Dejá la celda vacía para no controlar esa combinación. En cero, deja de
        poder pedirse.
      </p>

      <div className="overflow-x-auto">
        <table className="text-xs">
          <thead>
            <tr className="text-ink-soft">
              <th className="px-2 py-1 text-left font-medium">Talle</th>
              {columnas.map((c) => (
                <th key={c?.id ?? "sin-color"} className="px-2 py-1 font-medium">
                  <span className="inline-flex items-center gap-1.5">
                    {c && (
                      <span
                        className="h-3 w-3 rounded-full border border-line"
                        style={{ backgroundColor: c.hex }}
                      />
                    )}
                    {c?.name ?? "Único"}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sizes.map((s) => (
              <tr key={s.id}>
                <td className="px-2 py-1 font-medium">{s.size}</td>
                {columnas.map((c) => {
                  const valor = valorDe(s.size, c?.name ?? null);
                  const agotado = valor === 0;
                  return (
                    <td key={c?.id ?? "sin-color"} className="px-1 py-1">
                      <input
                        type="number"
                        min={0}
                        defaultValue={valor ?? ""}
                        placeholder="—"
                        disabled={guardando === clave(s.size, c?.name ?? null)}
                        onBlur={(e) => {
                          const actual = valor === undefined ? "" : String(valor);
                          if (e.target.value !== actual) {
                            guardar(s.size, c?.name ?? null, e.target.value);
                          }
                        }}
                        className={`input h-8 w-16 px-2 py-0 text-center text-xs ${
                          agotado ? "border-accent text-accent" : ""
                        }`}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
