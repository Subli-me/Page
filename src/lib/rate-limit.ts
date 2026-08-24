/**
 * Límite de pedidos por IP, en memoria.
 *
 * En serverless cada instancia tiene su propia memoria, así que esto no es una
 * garantía: alguien decidido a abusar puede repartirse entre instancias. Sirve
 * para lo que pasa de verdad — un script simple dándole sin parar — y para que
 * el costo de abusar deje de ser cero. Un límite real necesitaría un contador
 * compartido (Redis o similar).
 */

type Ventana = { hasta: number; usos: number };

const registros = new Map<string, Ventana>();

export function rateLimit(clave: string, maximo: number, ventanaMs: number) {
  const ahora = Date.now();
  const actual = registros.get(clave);

  if (!actual || ahora > actual.hasta) {
    registros.set(clave, { hasta: ahora + ventanaMs, usos: 1 });
    return { ok: true, restantes: maximo - 1, esperarMs: 0 };
  }

  actual.usos++;
  if (actual.usos > maximo) {
    return { ok: false, restantes: 0, esperarMs: actual.hasta - ahora };
  }

  return { ok: true, restantes: maximo - actual.usos, esperarMs: 0 };
}

/** Saca la IP del pedido, mirando las cabeceras que pone el proxy. */
export function clientIp(req: Request) {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "desconocida";
}
