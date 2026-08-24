import { describe, expect, it } from "vitest";
import { buildOrderBreakdown, comboExtraTotal, matchingCombos, sortedZonePair } from "./pricing";
import type { PrintZone, PrintZoneCombo } from "./types";

/**
 * El precio es lo que más plata mueve y se calcula en varias capas: adicional
 * por zona, recargo por combinar zonas, recargo por talle y cantidad. Estos
 * casos existen para que un cambio no altere lo que se cobra sin que nadie se
 * entere.
 *
 * La misma función la usan el navegador (para mostrar) y la API (para cobrar),
 * así que cubrirla acá cubre los dos lados.
 */

const zone = (key: string, label: string, extra = 0): PrintZone => ({
  id: key,
  key,
  label,
  extra_price: extra,
  extra_cost: 0,
  sort_order: 0,
});

const ZONES = [
  zone("front_chest", "Pecho"),
  zone("back_full", "Espalda completa"),
  zone("sleeve_left", "Manga izquierda", 1000),
  zone("sleeve_right", "Manga derecha", 1000),
];

const COMBO_PECHO_ESPALDA: PrintZoneCombo = {
  id: "c1",
  zone_a_key: "back_full",
  zone_b_key: "front_chest",
  extra_price: 2000,
};

function precio(zoneKeys: string[], quantity = 1, sizeDelta = 0, combos = [COMBO_PECHO_ESPALDA]) {
  return buildOrderBreakdown({
    productName: "Remera Regular",
    basePrice: 20000,
    size: "M",
    sizeDelta,
    zones: ZONES,
    zoneKeys,
    combos,
    quantity,
  });
}

describe("buildOrderBreakdown", () => {
  it("una prenda sin adicionales cuesta su precio base", () => {
    const b = precio(["front_chest"]);
    expect(b.total).toBe(20000);
    expect(b.lines).toEqual([{ label: "Remera Regular", amount: 20000 }]);
  });

  it("suma el adicional de cada zona", () => {
    expect(precio(["front_chest", "sleeve_left", "sleeve_right"]).total).toBe(22000);
  });

  it("no lista las zonas que no tienen adicional", () => {
    const b = precio(["front_chest", "back_full", "sleeve_left"], 1, 0, []);
    expect(b.lines.map((l) => l.label)).toEqual(["Remera Regular", "Manga izquierda"]);
  });

  it("aplica el recargo por combinación una sola vez", () => {
    const b = precio(["front_chest", "back_full"]);
    expect(b.total).toBe(22000);
    expect(b.lines.filter((l) => l.label.includes("+"))).toHaveLength(1);
  });

  it("da lo mismo en qué orden se eligieron las zonas del par", () => {
    expect(precio(["front_chest", "back_full"]).total).toBe(
      precio(["back_full", "front_chest"]).total
    );
  });

  it("no aplica el recargo si falta una zona del par", () => {
    expect(precio(["front_chest", "sleeve_left"]).total).toBe(21000);
  });

  it("multiplica por la cantidad, adicionales incluidos", () => {
    const b = precio(["front_chest", "back_full", "sleeve_left"], 5);
    expect(b.unitTotal).toBe(23000);
    expect(b.total).toBe(115000);
  });

  it("suma el recargo del talle", () => {
    expect(precio(["front_chest"], 1, 1500).total).toBe(21500);
  });

  it("trata una cantidad inválida como una unidad", () => {
    // Viene de un input: puede llegar vacío, en cero o en negativo.
    expect(precio(["front_chest"], 0).total).toBe(20000);
    expect(precio(["front_chest"], -3).total).toBe(20000);
    expect(precio(["front_chest"], 2.7).quantity).toBe(2);
  });

  it("el total es siempre la suma de los renglones por la cantidad", () => {
    const b = precio(["front_chest", "back_full", "sleeve_left", "sleeve_right"], 3, 500);
    const suma = b.lines.reduce((s, l) => s + l.amount, 0);
    expect(b.unitTotal).toBe(suma);
    expect(b.total).toBe(suma * 3);
  });
});

describe("matchingCombos", () => {
  it("solo devuelve los pares con las dos zonas elegidas", () => {
    expect(matchingCombos(["front_chest"], [COMBO_PECHO_ESPALDA])).toHaveLength(0);
    expect(matchingCombos(["front_chest", "back_full"], [COMBO_PECHO_ESPALDA])).toHaveLength(1);
  });

  it("suma varios recargos cuando aplican a la vez", () => {
    const otro: PrintZoneCombo = {
      id: "c2",
      zone_a_key: "sleeve_left",
      zone_b_key: "sleeve_right",
      extra_price: 500,
    };
    const elegidas = ["front_chest", "back_full", "sleeve_left", "sleeve_right"];
    expect(comboExtraTotal(elegidas, [COMBO_PECHO_ESPALDA, otro])).toBe(2500);
  });
});

describe("sortedZonePair", () => {
  it("ordena el par para que la misma regla no entre dos veces", () => {
    // La base guarda el par ordenado; sin esto "pecho + espalda" y
    // "espalda + pecho" serían dos filas distintas con el mismo significado.
    expect(sortedZonePair("front_chest", "back_full")).toEqual(
      sortedZonePair("back_full", "front_chest")
    );
  });
});
