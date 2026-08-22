"use client";

import type { OrderBreakdown } from "@/lib/pricing";

const money = (n: number) => `$${Number(n).toLocaleString("es-AR")}`;

/**
 * El precio explicado renglón por renglón.
 *
 * Antes solo se veía el total, y al agregar una zona el número saltaba sin
 * decir por qué.
 */
export function PriceBreakdown({
  breakdown,
  className,
}: {
  breakdown: OrderBreakdown;
  className?: string;
}) {
  const { lines, unitTotal, quantity, total } = breakdown;

  return (
    <dl className={className}>
      {lines.map((l, i) => (
        <div key={`${l.label}-${i}`} className="flex justify-between gap-4 py-1 text-sm">
          <dt className="text-ink-soft">{l.label}</dt>
          <dd className="tabular-nums">{i === 0 ? money(l.amount) : `+${money(l.amount)}`}</dd>
        </div>
      ))}

      {quantity > 1 && (
        <>
          <div className="mt-1 flex justify-between gap-4 border-t border-line pt-2 text-sm">
            <dt className="text-ink-soft">Por prenda</dt>
            <dd className="tabular-nums">{money(unitTotal)}</dd>
          </div>
          <div className="flex justify-between gap-4 py-1 text-sm">
            <dt className="text-ink-soft">Cantidad</dt>
            <dd className="tabular-nums">× {quantity}</dd>
          </div>
        </>
      )}

      <div className="mt-1 flex justify-between gap-4 border-t border-line pt-2">
        <dt className="font-medium">Total</dt>
        <dd className="font-display text-lg tabular-nums">{money(total)}</dd>
      </div>
    </dl>
  );
}
