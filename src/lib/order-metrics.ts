/**
 * Números del negocio, sacados de los pedidos que ya están en la base.
 *
 * Todo esto existía y nadie lo miraba: cuánto se factura, qué prenda sale más,
 * qué diseño eligen. Es la diferencia entre decidir qué comprar con datos o a
 * ojo.
 */

type ItemLike = {
  print_zone_key: string;
  image_public_id?: string | null;
  print_zones?: { label: string } | null;
};

type LineLike = {
  size: string;
  color: string | null;
  quantity: number;
  products?: { name: string } | null;
  order_items?: ItemLike[];
};

type OrderLike = {
  status: string;
  total_price: number | null;
  created_at: string;
  quantity?: number | null;
  size?: string;
  color?: string | null;
  products?: { name: string } | null;
  order_lines?: LineLike[];
  order_items?: ItemLike[];
};

export type Ranking = { label: string; count: number }[];

export type OrderMetrics = {
  pedidosMes: number;
  facturacionMes: number;
  unidadesMes: number;
  ticketPromedio: number;
  pendientes: number;
  aImprimir: number;
  prendas: Ranking;
  zonas: Ranking;
  disenos: Ranking;
  colores: Ranking;
  talles: Ranking;
};

/** Los pedidos viejos no tienen renglones; se los trata como uno solo. */
function lineasDe(order: OrderLike): LineLike[] {
  if (order.order_lines?.length) return order.order_lines;
  return [
    {
      size: order.size ?? "-",
      color: order.color ?? null,
      quantity: order.quantity ?? 1,
      products: order.products,
      order_items: order.order_items ?? [],
    },
  ];
}

function top(conteo: Map<string, number>, cuantos = 5): Ranking {
  return [...conteo.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, cuantos);
}

export function buildOrderMetrics(
  orders: OrderLike[],
  /** Para poder nombrar los diseños del catálogo en vez de mostrar un id. */
  designsByPublicId: Map<string, string> = new Map()
): OrderMetrics {
  const ahora = new Date();
  const desde = new Date(ahora.getFullYear(), ahora.getMonth(), 1);

  // Un pedido cancelado no se facturó: contarlo infla el número justo en el
  // dato que se usa para decidir.
  const vigentes = orders.filter((o) => o.status !== "cancelado");
  const delMes = vigentes.filter((o) => new Date(o.created_at) >= desde);

  const facturacionMes = delMes.reduce((s, o) => s + Number(o.total_price ?? 0), 0);
  const unidadesMes = delMes.reduce(
    (s, o) => s + lineasDe(o).reduce((u, l) => u + (l.quantity ?? 1), 0),
    0
  );

  const prendas = new Map<string, number>();
  const zonas = new Map<string, number>();
  const disenos = new Map<string, number>();
  const colores = new Map<string, number>();
  const talles = new Map<string, number>();

  const sumar = (m: Map<string, number>, k: string | null | undefined, n = 1) => {
    if (!k) return;
    m.set(k, (m.get(k) ?? 0) + n);
  };

  for (const o of vigentes) {
    for (const l of lineasDe(o)) {
      const unidades = l.quantity ?? 1;
      sumar(prendas, l.products?.name, unidades);
      sumar(colores, l.color, unidades);
      sumar(talles, l.size, unidades);

      for (const item of l.order_items ?? []) {
        sumar(zonas, item.print_zones?.label ?? item.print_zone_key, unidades);
        const nombre = item.image_public_id
          ? designsByPublicId.get(item.image_public_id)
          : undefined;
        // Los diseños subidos por el cliente no están en el catálogo: se
        // cuentan aparte para no ensuciar el ranking.
        sumar(disenos, nombre ?? (item.image_public_id ? "Subido por el cliente" : null), unidades);
      }
    }
  }

  return {
    pedidosMes: delMes.length,
    facturacionMes,
    unidadesMes,
    ticketPromedio: delMes.length ? Math.round(facturacionMes / delMes.length) : 0,
    pendientes: orders.filter((o) => o.status === "pendiente").length,
    aImprimir: orders.filter((o) => o.status === "confirmado").length,
    prendas: top(prendas),
    zonas: top(zonas),
    disenos: top(disenos),
    colores: top(colores),
    talles: top(talles),
  };
}
