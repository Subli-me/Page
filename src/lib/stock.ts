import type { ProductStock } from "@/lib/types";

/**
 * Disponibilidad de una combinación de prenda, talle y color.
 *
 * La regla es "sin fila, sin control": si nadie cargó stock para esa
 * combinación, se puede pedir libremente. Así el control se activa solo donde
 * hace falta, en vez de obligar a llenar una grilla entera antes de vender.
 */

/** El color vacío y el nulo son lo mismo: prenda sin colores. */
function mismaClave(a: string | null | undefined, b: string | null | undefined) {
  return (a ?? "") === (b ?? "");
}

export function findStock(
  stock: ProductStock[],
  productId: string,
  size: string,
  color: string | null
): ProductStock | null {
  return (
    stock.find(
      (s) => s.product_id === productId && s.size === size && mismaClave(s.color, color)
    ) ?? null
  );
}

/** Cuántas unidades quedan. `null` significa que no se lleva control. */
export function stockDisponible(
  stock: ProductStock[],
  productId: string,
  size: string,
  color: string | null
): number | null {
  const fila = findStock(stock, productId, size, color);
  return fila ? fila.quantity : null;
}

/**
 * Si se puede pedir esa cantidad.
 *
 * `yaEnCarrito` importa porque el carrito puede tener la misma combinación en
 * más de un renglón: sin eso se podrían pedir 3 y 3 de algo de lo que quedan 4.
 */
export function hayStock(
  stock: ProductStock[],
  productId: string,
  size: string,
  color: string | null,
  cantidad: number,
  yaEnCarrito = 0
): boolean {
  const quedan = stockDisponible(stock, productId, size, color);
  if (quedan === null) return true;
  return cantidad + yaEnCarrito <= quedan;
}

/** Talles que no tienen ninguna unidad en ningún color. */
export function tallesSinStock(stock: ProductStock[], productId: string, sizes: string[]) {
  return sizes.filter((size) => {
    const filas = stock.filter((s) => s.product_id === productId && s.size === size);
    return filas.length > 0 && filas.every((f) => f.quantity === 0);
  });
}
