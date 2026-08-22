import type { PrintZone, PrintZoneCombo } from "@/lib/types";

/**
 * Recargos por combinación que aplican a un conjunto de zonas.
 *
 * La usan el armado del pedido (para mostrar el total) y la API (para
 * calcularlo de verdad). Es la misma función a propósito: si el precio se
 * calculara distinto de cada lado, el cliente vería un número y se le cobraría
 * otro.
 */
export function matchingCombos(zoneKeys: string[], combos: PrintZoneCombo[]): PrintZoneCombo[] {
  const chosen = new Set(zoneKeys);
  return combos.filter((c) => chosen.has(c.zone_a_key) && chosen.has(c.zone_b_key));
}

export function comboExtraTotal(zoneKeys: string[], combos: PrintZoneCombo[]): number {
  return matchingCombos(zoneKeys, combos).reduce((sum, c) => sum + Number(c.extra_price), 0);
}

/** Ordena el par como lo guarda la base, para no duplicar la misma regla. */
export function sortedZonePair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

export type PriceLine = { label: string; amount: number };

export type OrderBreakdown = {
  /** Lo que cuesta una prenda, renglón por renglón. */
  lines: PriceLine[];
  unitTotal: number;
  quantity: number;
  total: number;
};

/**
 * Arma el precio explicado, no solo el número final.
 *
 * Antes el cliente veía "Total: $20.000" y al agregar una manga el número
 * saltaba sin decir por qué. Devolvemos los renglones para poder mostrarlos en
 * el resumen, en el desglose del total y en el mensaje de WhatsApp, siempre
 * calculados igual.
 */
export function buildOrderBreakdown({
  productName,
  basePrice,
  size,
  sizeDelta,
  zones,
  zoneKeys,
  combos,
  quantity,
}: {
  productName: string;
  basePrice: number;
  size: string | null;
  sizeDelta: number;
  zones: PrintZone[];
  zoneKeys: string[];
  combos: PrintZoneCombo[];
  quantity: number;
}): OrderBreakdown {
  const label = (key: string) => zones.find((z) => z.key === key)?.label ?? key;

  const lines: PriceLine[] = [{ label: productName, amount: Number(basePrice) }];

  if (sizeDelta > 0) {
    lines.push({ label: `Talle ${size ?? ""}`.trim(), amount: Number(sizeDelta) });
  }

  for (const key of zoneKeys) {
    const extra = Number(zones.find((z) => z.key === key)?.extra_price ?? 0);
    if (extra > 0) lines.push({ label: label(key), amount: extra });
  }

  for (const c of matchingCombos(zoneKeys, combos)) {
    lines.push({
      label: `${label(c.zone_a_key)} + ${label(c.zone_b_key)}`,
      amount: Number(c.extra_price),
    });
  }

  const unitTotal = lines.reduce((sum, l) => sum + l.amount, 0);
  const qty = Math.max(1, Math.floor(quantity) || 1);

  return { lines, unitTotal, quantity: qty, total: unitTotal * qty };
}
