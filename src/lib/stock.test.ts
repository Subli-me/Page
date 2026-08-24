import { describe, expect, it } from "vitest";
import { hayStock, stockDisponible, tallesSinStock } from "./stock";
import type { ProductStock } from "./types";

/**
 * La regla central es "sin fila, sin control": si nadie cargó stock para una
 * combinación, se puede pedir libremente. Confundir eso con "cero" dejaría de
 * vender todo lo que no se cargó.
 */

const P = "prod-1";

const fila = (size: string, color: string | null, quantity: number): ProductStock => ({
  id: `${size}-${color ?? ""}`,
  product_id: P,
  size,
  color,
  quantity,
});

const STOCK = [fila("M", "Negro", 3), fila("L", "Negro", 0), fila("M", "Blanco", 10)];

describe("stockDisponible", () => {
  it("devuelve null cuando la combinación no lleva control", () => {
    expect(stockDisponible(STOCK, P, "XL", "Negro")).toBeNull();
  });

  it("distingue cero de sin control", () => {
    expect(stockDisponible(STOCK, P, "L", "Negro")).toBe(0);
  });

  it("no mezcla colores del mismo talle", () => {
    expect(stockDisponible(STOCK, P, "M", "Negro")).toBe(3);
    expect(stockDisponible(STOCK, P, "M", "Blanco")).toBe(10);
  });

  it("trata el color nulo y el vacío como la misma prenda sin colores", () => {
    const sinColor = [fila("U", null, 2)];
    expect(stockDisponible(sinColor, P, "U", null)).toBe(2);
    expect(stockDisponible(sinColor, P, "U", "")).toBe(2);
  });
});

describe("hayStock", () => {
  it("deja pedir lo que no lleva control", () => {
    expect(hayStock(STOCK, P, "XL", "Negro", 500)).toBe(true);
  });

  it("no deja pedir más de lo que queda", () => {
    expect(hayStock(STOCK, P, "M", "Negro", 3)).toBe(true);
    expect(hayStock(STOCK, P, "M", "Negro", 4)).toBe(false);
  });

  it("nunca deja pedir algo agotado", () => {
    expect(hayStock(STOCK, P, "L", "Negro", 1)).toBe(false);
  });

  it("cuenta lo que ya está en el carrito", () => {
    // Quedan 3: si el carrito ya tiene 2, solo entra 1 más.
    expect(hayStock(STOCK, P, "M", "Negro", 1, 2)).toBe(true);
    expect(hayStock(STOCK, P, "M", "Negro", 2, 2)).toBe(false);
  });
});

describe("tallesSinStock", () => {
  it("marca el talle solo si está agotado en todos sus colores", () => {
    // M tiene 0 en un color imaginario pero 3 y 10 en los cargados.
    expect(tallesSinStock(STOCK, P, ["M", "L", "XL"])).toEqual(["L"]);
  });

  it("no marca los talles sin control", () => {
    expect(tallesSinStock(STOCK, P, ["XL"])).toEqual([]);
  });
});
