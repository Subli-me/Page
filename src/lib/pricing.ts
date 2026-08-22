import type { PrintZoneCombo } from "@/lib/types";

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
